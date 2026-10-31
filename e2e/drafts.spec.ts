/**
 * Drafts: "Start from the beginning" keeps the answers as a draft, the same answers never make a
 * second draft, and a draft can be opened, renamed and deleted.
 *
 * Runs against the local Pages preview by default (playwright.config.ts starts it) or BASE_URL.
 */
import { expect, test, type Page } from "@playwright/test";

interface Answers {
  age: string;
  takeHome: string;
  essentials: string;
}

const A: Answers = { age: "28", takeHome: "50000", essentials: "30000" };
const B: Answers = { age: "35", takeHome: "80000", essentials: "40000" };

const TEXT_INPUT = 'input:not([type="hidden"]):not([type="range"]):not([type="checkbox"]):not([type="radio"])';
const HEADLINE = /Save ৳[\d,]+ a month/;

async function answer(page: Page, value: string): Promise<void> {
  const input = page.locator(TEXT_INPUT).first();
  await expect(input).toBeVisible();
  await input.fill(value);
}

async function next(page: Page, fromStep: number, label = "Next"): Promise<void> {
  const advanced = () => !new RegExp(`/start/${fromStep}(?:[/?#]|$)`).test(page.url());
  if (advanced()) return;
  const button = page.getByRole("button", { name: label, exact: true });
  await expect(button).toBeEnabled();
  await button.click();
  await expect.poll(advanced, { timeout: 10_000 }).toBe(true);
}

/** From question 1 (already open) to the plan; returns the plan headline. */
async function onboard(page: Page, a: Answers): Promise<string> {
  await expect(page).toHaveURL(/\/en\/start\/1/);
  await answer(page, a.age);
  await next(page, 1);
  await answer(page, a.takeHome);
  await next(page, 2);
  await answer(page, a.essentials);
  await next(page, 3);
  await page.getByRole("button", { name: /No one/ }).first().click();
  await next(page, 4);
  await page.getByRole("button", { name: "No debt", exact: true }).click();
  await next(page, 5, "See my plan");
  await expect(page).toHaveURL(/\/en\/plan(?:[?#]|$)/);
  return headline(page);
}

async function headline(page: Page): Promise<string> {
  const h = page.getByText(HEADLINE).first();
  await expect(h).toBeVisible();
  return ((await h.textContent()) ?? "").match(HEADLINE)?.[0] ?? "";
}

/** Plan → "Start from the beginning" → confirm; checks the toast and that question 1 is fresh. */
async function startOver(page: Page, toast: string): Promise<void> {
  await page.getByTestId("start-over").click();
  const dialog = page.getByRole("dialog", { name: "Start from the beginning?" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Your current answers are kept as a draft.");
  await dialog.getByRole("button", { name: "Yes, start again", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/start\/1/);
  await expect(page.getByTestId("drafts-toast")).toHaveText(toast);
  // The old age (28 or 35) is gone: question 1 shows the default again.
  await expect(page.locator(TEXT_INPUT).first()).toHaveValue("30");
}

async function draftCount(page: Page, n: number): Promise<void> {
  await page.goto("/en/drafts");
  await expect(page.getByRole("heading", { name: "Your drafts", exact: true })).toBeVisible();
  if (n === 0) await expect(page.getByTestId("drafts-empty")).toBeVisible();
  await expect(page.getByTestId("draft-card")).toHaveCount(n);
}

test("start from the beginning keeps deduplicated drafts that can be opened, renamed and deleted", async ({ page }) => {
  await page.goto("/en/drafts");
  await draftCount(page, 0);

  await page.goto("/en/start/1");
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  // The question and the one-time disclaimer render together once the store has hydrated: wait for that first.
  await expect(page.locator(TEXT_INPUT).first()).toBeVisible({ timeout: 15_000 });
  const accept = page.getByRole("button", { name: "I understand", exact: true });
  if (await accept.isVisible({ timeout: 3_000 }).catch(() => false)) await accept.click();

  // 1. First plan, then start again: one draft, and question 2 is empty too.
  const headlineA = await onboard(page, A);
  await startOver(page, "Saved as a draft");
  await next(page, 1);
  await expect(page.locator(TEXT_INPUT).first()).toHaveValue("");
  await draftCount(page, 1);
  await expect(page.getByTestId("draft-card").first()).toContainText("Bangladesh · Age 28 · ৳50,000/month");

  // 2. The same answers again: still one draft.
  await page.goto("/en/start/1");
  expect(await onboard(page, A)).toBe(headlineA);
  await startOver(page, "Already saved as a draft");
  await draftCount(page, 1);

  // 3. Different answers: a second draft.
  await page.goto("/en/start/1");
  const headlineB = await onboard(page, B);
  expect(headlineB).not.toBe(headlineA);
  // The plan lists the kept draft under the buckets.
  await expect(page.getByTestId("drafts-section")).toContainText("Your drafts (1)");
  await startOver(page, "Saved as a draft");
  await draftCount(page, 2);

  // 4. Open the first: the plan shows its numbers, and opening adds no draft.
  const cardA = page.getByTestId("draft-card").filter({ hasText: "Age 28" });
  await cardA.getByRole("button", { name: "Open", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/plan(?:[?#]|$)/);
  expect(await headline(page)).toBe(headlineA);
  await draftCount(page, 2);
  await expect(page.getByTestId("draft-card").filter({ hasText: "Age 28" })).toContainText("Open now");

  // 5. Rename (Enter saves; the name survives a reload).
  await page.getByTestId("draft-card").filter({ hasText: "Age 28" }).getByRole("button", { name: "Rename", exact: true }).click();
  const nameBox = page.getByRole("textbox", { name: "Draft name" });
  await expect(nameBox).toBeFocused();
  await nameBox.fill("Before the raise");
  await nameBox.press("Enter");
  await expect(page.getByTestId("draft-card").filter({ hasText: "Before the raise" })).toHaveCount(1);
  await page.reload();
  await expect(page.getByTestId("draft-card").filter({ hasText: "Before the raise" })).toHaveCount(1);

  // 6. Delete the other draft after confirming.
  const cardB = page.getByTestId("draft-card").filter({ hasText: "Age 35" });
  await cardB.getByRole("button", { name: "Delete", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Delete this draft?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Yes, delete", exact: true }).click();
  await expect(page.getByTestId("draft-card")).toHaveCount(1);
  await expect(page.getByTestId("draft-card").first()).toContainText("Before the raise");
});

test("calculator results offer start from the beginning; the sample plan does not", async ({ page }) => {
  // Long flow (onboarding plus four calculator pages): give it more than the default 60 s on a busy machine.
  test.setTimeout(150_000);
  await page.goto("/en/plan?demo=1");
  await expect(page.getByText(HEADLINE).first()).toBeVisible();
  await expect(page.getByTestId("start-over")).toHaveCount(0);
  await expect(page.getByTestId("drafts-section")).toHaveCount(0);

  await page.goto("/en/start/1");
  // The question and the one-time disclaimer render together once the store has hydrated: wait for that first.
  await expect(page.locator(TEXT_INPUT).first()).toBeVisible({ timeout: 15_000 });
  const accept = page.getByRole("button", { name: "I understand", exact: true });
  if (await accept.isVisible({ timeout: 3_000 }).catch(() => false)) await accept.click();
  await onboard(page, A);
  await expect(page.getByTestId("start-over")).toBeVisible();

  for (const path of ["/en/m1", "/en/m4"]) {
    await page.goto(path);
    await expect(page.getByTestId("start-over")).toBeVisible();
  }
  await page.goto("/en/m1?demo=1");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("start-over")).toHaveCount(0);

  // From a calculator: confirm → question 1, answers kept as a draft.
  await page.goto("/en/m4");
  await startOver(page, "Saved as a draft");
  await draftCount(page, 1);
});
