/**
 * State, drafts, onboarding and offline review fixes (slice D): switching country mid-plan,
 * the country-data notice, corrupted or blocked storage, returning users without cookies, a second
 * tab, and offline reloads of visited pages. Runs against the production build on the Pages
 * preview (playwright.config.ts); the offline tests need its service worker.
 */
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { offeredLocales } from "./country-data";

const KEY = "taka-plan.v1";
const PROFILE = { age: 28, incomeType: "salaried", takeHome: 50000, essentials: 30000, dependents: [], hasDebt: false };

function v2(over: Record<string, unknown> = {}) {
  return {
    state: {
      schemaVersion: 2,
      country: "BD",
      locale: "en",
      onboarding: { step: 5, completed: true, disclaimerSeen: true },
      profile: PROFILE,
      m1: {},
      m2: {},
      m3: { loans: [], cards: [] },
      m4: {},
      m5: { goals: [] },
      m6: {},
      m7: {},
      drafts: [],
      ...over,
    },
    version: 2,
  };
}

/** Opens the origin on a static page, then writes the store blob (raw string or object) and cookies. */
async function seed(page: Page, blob: unknown, cookies: Record<string, string> = {}): Promise<void> {
  await page.goto("/en/about");
  await page.evaluate(
    ([key, b, c]) => {
      localStorage.clear();
      if (b !== null) localStorage.setItem(key as string, typeof b === "string" ? b : JSON.stringify(b));
      for (const [k, v] of Object.entries(c as Record<string, string>)) document.cookie = `${k}=${v}; Path=/; Max-Age=31536000`;
    },
    [KEY, blob, cookies] as const,
  );
}

async function stored(page: Page): Promise<{ state: Record<string, any>; version: number } | null> {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "null"), KEY);
}

async function cookie(context: BrowserContext, name: string): Promise<string | undefined> {
  return (await context.cookies()).find((c) => c.name === name)?.value;
}

const HEADLINE = /Save ৳[\d,]+ a month/;
/** The plan headline in any language: an amount in taka (the headline wording is translated). */
const ANY_HEADLINE = /৳\s?[\d,]+/;

test.describe("switching country mid-plan", () => {
  test("asks first, keeps the answers as a draft, and writes nothing until the language is picked", async ({ page, context }) => {
    await seed(page, v2(), { tp_locale: "en", tp_country: "BD" });
    await page.goto("/?change=country");
    await expect(page.getByRole("searchbox")).toBeVisible();

    // Pick India: a confirm screen, and nothing written yet.
    await page.locator('button[data-country="IN"]').first().click();
    const confirm = page.getByTestId("switch-country");
    await expect(confirm).toBeVisible();
    await expect(confirm).toContainText("Your answers are in ৳.");
    await expect(confirm).toContainText("Start fresh for India?");
    expect((await stored(page))!.state.country).toBe("BD");

    // Keep my answers: back to the picker, nothing changed.
    await page.getByTestId("switch-country-cancel").click();
    await expect(page.getByRole("searchbox")).toBeVisible();

    // Confirm, then go back from the language step: still Bangladesh, answers intact.
    await page.locator('button[data-country="IN"]').first().click();
    await page.getByTestId("switch-country-confirm").click();
    await expect(page.locator("button[data-locale]").first()).toBeVisible();
    await page.getByRole("button", { name: /Change country/ }).click();
    await expect(page.getByRole("searchbox")).toBeVisible();
    let s = (await stored(page))!.state;
    expect(s.country).toBe("BD");
    expect(s.profile.takeHome).toBe(50000);
    expect(s.drafts).toHaveLength(0);
    expect(await cookie(context, "tp_country")).toBe("BD");

    // Confirm and pick English: fresh answers in India, the old ones kept as a Bangladesh draft.
    await page.locator('button[data-country="IN"]').first().click();
    await page.getByTestId("switch-country-confirm").click();
    await page.getByRole("button", { name: "English", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/start\/1$/);
    s = (await stored(page))!.state;
    expect(s.country).toBe("IN");
    expect(s.profile.takeHome).toBeUndefined();
    expect(s.onboarding.completed).toBe(false);
    expect(s.drafts).toHaveLength(1);
    expect(s.drafts[0].answers.country).toBe("BD");
    expect(await cookie(context, "tp_country")).toBe("IN");

    // The draft list names the country and the amounts stay in taka.
    await page.goto("/en/drafts");
    await expect(page.getByTestId("draft-card").first()).toContainText("Bangladesh · Age 28 · ৳50,000/month");
  });

  test("the same country, or no answers yet, needs no confirm", async ({ page }) => {
    await seed(page, v2({ profile: {}, onboarding: { step: 1, completed: false, disclaimerSeen: false } }), {});
    await page.goto("/");
    await page.locator('button[data-country="US"]').first().click();
    await expect(page.getByTestId("switch-country")).toHaveCount(0);
    // English is the United States' main language: it comes first.
    const offered = await offeredLocales(page.request, "US");
    // The picker starts from the bundled index and switches to /data/countries/index.json when it loads.
    await expect(page.locator("button[data-locale]")).toHaveCount(offered.length, { timeout: 15_000 });
    expect(offered[0]).toBe("en");
    await expect(page.locator("button[data-locale]").first()).toHaveText("English");
  });
});

test.describe("country data notice", () => {
  // page.route cannot see requests a service worker makes, and once the worker controls the page
  // Bolivia's real file would load. Without this the test fails whenever the worker wins that race.
  test.use({ serviceWorkers: "block" });

  test("a country without researched data says so under the header; Bangladesh does not", async ({ page }) => {
    // Every country has a data file now: make Bolivia's unreachable to exercise the fallback.
    await page.route(/\/(data\/countries\/BO\.json|api\/countries\/BO)(\?.*)?$/, (route) => route.fulfill({ status: 404, body: "" }));
    await seed(page, v2({ country: "BO" }), { tp_locale: "en", tp_country: "BO" });
    await page.goto("/en/plan");
    const notice = page.getByTestId("country-notice");
    await expect(notice).toBeVisible({ timeout: 15_000 });
    await expect(notice).toContainText("We don't have researched figures for Bolivia yet, so amounts use Bangladesh's figures and taka.");
    await expect(notice.getByRole("link", { name: "Change country" })).toHaveAttribute("href", "/?change=country");

    await seed(page, v2(), { tp_locale: "en", tp_country: "BD" });
    await page.goto("/en/plan");
    await expect(page.getByText(HEADLINE).first()).toBeVisible();
    await expect(page.getByTestId("country-notice")).toHaveCount(0);
  });
});

for (const width of [320, 360]) {
  test(`the header fits a ${width}px phone: nothing is cut off and the country shows as its code`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 });
    // Indonesia in Bahasa Indonesia has the longest language name in the menu.
    await seed(page, v2({ country: "ID", locale: "id" }), { tp_locale: "id", tp_country: "ID" });
    await page.goto("/id/plan");
    const chip = page.locator("header a[data-country]");
    await expect(chip).toHaveText("ID");
    await expect(chip).toHaveAccessibleName(/Indonesia/);
    const overflow = await chip.evaluate((el) => {
      const row = el.closest("header")!.firstElementChild!;
      return { row: row.scrollWidth - row.clientWidth, page: document.documentElement.scrollWidth - window.innerWidth };
    });
    expect(overflow).toEqual({ row: 0, page: 0 });
  });
}

test.describe("broken storage", () => {
  test("a corrupted store blob starts fresh instead of a skeleton forever", async ({ page }) => {
    await seed(page, '{"state":{"schemaVersion":2,"coun', { tp_locale: "en" });
    await page.goto("/en/plan");
    // Fresh state: the locale home sends the user to question 1, which renders.
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en\/start\/1$/, { timeout: 15_000 });
    await expect(page.locator("main input").first()).toBeVisible();
    // The broken text is kept aside, and the next write replaces it with a valid blob.
    expect(await page.evaluate(() => localStorage.getItem("taka-plan.v1.corrupt"))).toContain('"coun');
    const s = await stored(page);
    expect(s?.version).toBe(2);
  });

  test("wrong types in a valid blob are dropped field by field", async ({ page }) => {
    await seed(page, v2({ profile: { ...PROFILE, age: "28" }, m3: "nope", drafts: "x" }), { tp_locale: "en", tp_country: "BD" });
    await page.goto("/en/start/1");
    await expect(page.locator("main input").first()).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "I understand", exact: true }).click({ timeout: 3_000 }).catch(() => {});
    const s = (await stored(page))!.state;
    expect(s.m3).toEqual({ loans: [], cards: [] });
    expect(s.drafts).toEqual([]);
    expect(s.profile.takeHome).toBe(50000);
  });

  test("a localStorage that throws still renders the app", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });
    });
    await page.goto("/en/start/1");
    await expect(page.locator("main input").first()).toBeVisible({ timeout: 15_000 });
    await page.goto("/");
    await expect(page.getByRole("searchbox")).toBeVisible();
  });
});

test("a returning user whose cookies were cleared goes straight to their plan, and the cookies come back", async ({ page, context }) => {
  await seed(page, v2({ country: "IN", locale: "en" }), {});
  await context.clearCookies();
  await page.goto("/");
  await expect(page).toHaveURL(/\/en\/plan$/, { timeout: 15_000 });
  expect(await cookie(context, "tp_locale")).toBe("en");
  expect(await cookie(context, "tp_country")).toBe("IN");
});

test("a second tab picks up the first tab's start-over instead of overwriting its draft", async ({ page, context }) => {
  await seed(page, v2(), { tp_locale: "en", tp_country: "BD" });
  await page.goto("/en/plan");
  await expect(page.getByText(HEADLINE).first()).toBeVisible();
  const tabB = await context.newPage();
  await tabB.goto("/en/m1");
  await expect(tabB.locator("#m1-liquid")).toBeVisible();

  await page.getByTestId("start-over").click();
  await page.getByRole("dialog").getByRole("button", { name: "Yes, start again", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/start\/1/);
  await expect.poll(async () => (await stored(page))!.state.drafts.length).toBe(1);

  // The stale tab now edits: the draft the other tab saved must survive.
  await tabB.locator("#m1-liquid").fill("12345");
  await tabB.waitForTimeout(500);
  const s = (await stored(tabB))!.state;
  expect(s.drafts).toHaveLength(1);
  expect(s.profile.takeHome).toBeUndefined();
});

test.describe("offline", () => {
  test("visited pages reload offline: /en/m7 (typed URL), /en/m1 (client link) and /hi/plan (precached)", async ({ page, context }) => {
    test.setTimeout(120_000);
    await seed(page, v2({ m7: { mode: "working", retirementAge: 60, monthlySpending: 30000, savings: 100000, monthlySaving: 5000 } }), { tp_locale: "en", tp_country: "BD" });
    await page.goto("/en/plan");
    await page.waitForFunction(() => navigator.serviceWorker?.ready.then(() => !!navigator.serviceWorker.controller), null, { timeout: 30_000 });
    // Every locale's plan is precached at install.
    await page.waitForFunction(
      async () => {
        for (const name of await caches.keys()) if (name.startsWith("taka-") && (await (await caches.open(name)).match("/hi/plan"))) return true;
        return false;
      },
      null,
      { timeout: 30_000 },
    );

    await page.goto("/en/m7");
    const m7Heading = (await page.locator("main h1").first().innerText()).trim();
    expect(m7Heading.length).toBeGreaterThan(0);

    // /en/m1 reached by a client-side link only.
    await page.goto("/en/plan");
    await expect(page.getByText(HEADLINE).first()).toBeVisible();
    const link = page.locator('a[href="/en/m1"]').first();
    let m1Heading: string | null = null;
    if (await link.count()) {
      await link.click();
      await expect(page).toHaveURL(/\/en\/m1$/);
      m1Heading = (await page.locator("main h1").first().innerText()).trim();
      await page.waitForFunction(
        async () => {
          for (const name of await caches.keys()) if (name.startsWith("taka-") && (await (await caches.open(name)).match("/en/m1"))) return true;
          return false;
        },
        null,
        { timeout: 15_000 },
      );
    }

    await context.setOffline(true);
    try {
      let r = await page.goto("/en/m7");
      expect(r?.fromServiceWorker()).toBe(true);
      await expect(page.locator("main h1").first()).toHaveText(m7Heading, { timeout: 15_000 });

      if (m1Heading) {
        r = await page.goto("/en/m1");
        expect(r?.ok()).toBe(true);
        await expect(page.locator("main h1").first()).toHaveText(m1Heading, { timeout: 15_000 });
      }

      r = await page.goto("/hi/plan");
      expect(r?.ok()).toBe(true);
      expect(r?.fromServiceWorker()).toBe(true);
      await expect(page.locator("html")).toHaveAttribute("lang", "hi-IN");
      await expect(page.getByText(ANY_HEADLINE).first()).toBeVisible({ timeout: 15_000 });
    } finally {
      await context.setOffline(false);
    }
  });
});
