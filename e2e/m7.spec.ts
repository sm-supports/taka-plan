/**
 * M7 Retirement & family ("Plan to 100"): onboarding at age 30 → /en/m7 → the working flow (retire at
 * 60, spending 40,000, nothing saved) → the 80-versus-100 card (about ৳43,600 and ৳73,800 a month
 * with the seed rates), an accessible chart, a red verdict → the plan shows a Retirement bucket →
 * Bangla renders with Bangla digits → the retired flow → the demo.
 *
 * Runs against the local Pages preview by default (playwright.config.ts starts it) or BASE_URL.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

const TEXT_INPUT = 'input:not([type="hidden"]):not([type="range"]):not([type="checkbox"]):not([type="radio"])';
const LATIN_DIGIT = /[0-9]/;

async function acceptDisclaimer(page: Page): Promise<void> {
  const accept = page.getByRole("button", { name: "I understand", exact: true });
  if (await accept.isVisible({ timeout: 2_000 }).catch(() => false)) await accept.click();
}

async function answer(page: Page, value: string): Promise<void> {
  const input = page.locator(TEXT_INPUT).first();
  await expect(input).toBeVisible();
  await input.fill(value);
}

async function nextStep(page: Page, from: number): Promise<void> {
  const advanced = () => !new RegExp(`/start/${from}(?:[/?#]|$)`).test(page.url());
  if (advanced()) return;
  await page.getByRole("button", { name: from === 5 ? "See my plan" : "Next", exact: true }).click();
  await expect.poll(advanced, { timeout: 10_000 }).toBe(true);
}

async function onboard(page: Page): Promise<void> {
  await page.goto("/en/start/1");
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await acceptDisclaimer(page);
  await answer(page, "30");
  await nextStep(page, 1);
  await answer(page, "60000");
  await nextStep(page, 2);
  await answer(page, "30000");
  await nextStep(page, 3);
  await page.getByRole("button", { name: /No one/ }).first().click();
  await nextStep(page, 4);
  await page.getByRole("button", { name: "No debt", exact: true }).click();
  await nextStep(page, 5);
  await expect(page).toHaveURL(/\/en\/plan(?:[?#]|$)/);
}

/** "৳43,600" → 43600 (Latin digits only). */
async function amountOf(locator: Locator): Promise<number> {
  const text = (await locator.textContent()) ?? "";
  return Number(text.replace(/[^\d]/g, ""));
}

function near(actual: number, expected: number): void {
  expect(Math.abs(actual - expected) / expected, `${actual} ≈ ${expected}`).toBeLessThan(0.01);
}

async function next(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Next", exact: true }).click();
}

/** Empties the m7 answers in the persisted store so the next visit shows the first-visit flow. */
async function clearM7(page: Page): Promise<void> {
  await page.evaluate(() => {
    const raw = localStorage.getItem("taka-plan.v1");
    if (!raw) return;
    const data = JSON.parse(raw) as { state: { m7: unknown } };
    data.state.m7 = {};
    localStorage.setItem("taka-plan.v1", JSON.stringify(data));
  });
}

test("plan to 100: working flow, 80-versus-100 card, chart, verdict, plan bucket, Bangla, retired flow", async ({ page }) => {
  await onboard(page);

  // ---- Working flow, one question per screen. ----
  await page.goto("/en/m7");
  await acceptDisclaimer(page);
  await expect(page.getByRole("heading", { name: "Are you still working, or already retired?" })).toBeVisible();
  await page.getByRole("button", { name: /Still working/ }).click();

  await expect(page.getByRole("heading", { name: "How old are you?" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Your age" })).toHaveValue("30");
  await next(page);

  await expect(page.getByRole("heading", { name: "At what age do you want to stop working?" })).toBeVisible();
  await page.getByRole("textbox", { name: "Retirement age" }).fill("60");
  await next(page);

  await expect(page.getByRole("heading", { name: "What does your household spend a month today?" })).toBeVisible();
  // Prefilled from the onboarding essentials.
  await expect(page.getByLabel("Household spending a month")).toHaveValue("30000");
  await page.getByLabel("Household spending a month").fill("40000");
  await next(page);

  await expect(page.getByRole("heading", { name: "What have you saved and invested so far?" })).toBeVisible();
  await page.getByLabel("Savings and investments today").fill("0");
  await next(page);

  await expect(page.getByRole("heading", { name: "How much do you put aside each month now?" })).toBeVisible();
  await page.getByLabel("Saving a month now").fill("0");
  await next(page);

  await expect(page.getByRole("heading", { name: "Are you a man or a woman?" })).toBeVisible();
  await page.getByRole("button", { name: "See my plan to 100", exact: true }).click();

  // ---- Result: the 80-versus-100 card. ----
  const card = page.getByTestId("m7-contrast-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("To age 80");
  await expect(card).toContainText("To age 100");
  await expect(page.getByTestId("m7-target-contrast-corpus")).toHaveText(/৳[\d.]+ crore/);
  await expect(page.getByTestId("m7-target-plan-corpus")).toHaveText(/৳[\d.]+ crore/);
  near(await amountOf(page.getByTestId("m7-target-contrast-monthly")), 43_600);
  near(await amountOf(page.getByTestId("m7-target-plan-monthly")), 73_800);
  await expect(page.getByTestId("m7-extra")).toContainText("20 more years");

  // Chart: an image with a summary label.
  const chart = page.getByRole("img", { name: /Savings from age 30 to 100/ });
  await expect(chart).toBeVisible();
  await expect(chart).toHaveAttribute("aria-label", /Runs out at \d+/);

  // Verdict: red, nothing is saved yet.
  const verdict = page.getByTestId("m7-verdict").first();
  await expect(verdict).toHaveAttribute("data-status", "red");
  await expect(verdict).toContainText(/Runs out at \d+/);

  // What starting earlier or later changes, the bucket note and the life table.
  await expect(page.getByTestId("m7-shift")).toContainText("Had you started at 25");
  await expect(page.getByTestId("m7-bucket").getByRole("link", { name: "See your asset mix" })).toHaveAttribute("href", "/en/m6");
  await expect(page.getByTestId("m7-life-table").getByRole("table")).toContainText("19.6");
  await expect(page.getByTestId("m7-notes")).toContainText("never counted");
  await expect(page.getByTestId("start-over")).toBeVisible();

  // Income sources lower the target live.
  await page.getByTestId("m7-add-sources").click();
  await expect(page.getByRole("heading", { name: "Income after you stop working" })).toBeVisible();
  const before = await amountOf(page.getByTestId("m7-target-plan-monthly"));
  await page.getByRole("button", { name: "Add: Rent you receive" }).click();
  await page.getByLabel("Rent a month, today").fill("10000");
  await expect.poll(() => amountOf(page.getByTestId("m7-target-plan-monthly"))).toBeLessThan(before);
  await expect(page.getByTestId("m7-sources-lowered")).toBeVisible();
  await page.getByRole("button", { name: "Remove: Rent you receive" }).click();
  await expect.poll(() => amountOf(page.getByTestId("m7-target-plan-monthly"))).toBe(before);

  // The plan-to slider is there, defaulting to 100 within 85–105.
  const planTo = page.getByRole("slider", { name: "Plan to age" });
  await expect(planTo).toHaveAttribute("min", "85");
  await expect(planTo).toHaveAttribute("max", "105");
  await expect(planTo).toHaveValue("100");

  // ---- The plan now has a Retirement bucket. ----
  await page.getByTestId("m7-back-to-plan").click();
  await expect(page).toHaveURL(/\/en\/plan(?:[?#]|$)/);
  await expect(page.getByText("Retirement", { exact: true }).first()).toBeVisible();

  // ---- Bangla: the calculator page with Bangla digits. ----
  await page.goto("/bn/m7");
  await expect(page.getByTestId("m7-contrast-card")).toBeVisible();
  const bnMonthly = (await page.getByTestId("m7-target-plan-monthly").textContent()) ?? "";
  expect(bnMonthly).toMatch(/৳[০-৯,]+/);
  expect(bnMonthly).not.toMatch(LATIN_DIGIT);
  const bnVerdict = (await page.getByTestId("m7-verdict").first().textContent()) ?? "";
  expect(bnVerdict).toMatch(/[০-৯]/);
  expect(bnVerdict).not.toMatch(LATIN_DIGIT);
  await expect(page.getByTestId("m7-chart")).toHaveAttribute("aria-label", /[০-৯]/);

  // ---- Retired flow (first visit again). ----
  await clearM7(page);
  await page.goto("/en/m7");
  await expect(page.getByRole("heading", { name: "Are you still working, or already retired?" })).toBeVisible();
  await page.getByRole("button", { name: /Already retired/ }).click();
  await page.getByRole("textbox", { name: "Your age" }).fill("62");
  await next(page);
  await expect(page.getByRole("heading", { name: "Did you retire from government or private work?" })).toBeVisible();
  await page.getByRole("button", { name: /Private or self-employed/ }).click();
  await page.getByLabel("Savings now").fill("10000000");
  await next(page);
  await page.getByLabel("Other income a month").fill("0");
  await next(page);
  await page.getByLabel("Household spending a month").fill("40000");
  await next(page);
  await page.getByRole("button", { name: "Skip this question" }).click();

  const withdrawal = page.getByTestId("m7-withdrawal");
  await expect(withdrawal).toContainText("You can take out each month");
  expect(await amountOf(withdrawal.locator(".text-4xl"))).toBeGreaterThan(0);
  await expect(page.getByTestId("m7-pot")).toContainText("The two-pot rule");
  await expect(page.getByTestId("m7-options")).toContainText("Treasury bonds");
  await expect(page.getByTestId("m7-options")).not.toContainText("Pensioner savings certificate");
  await expect(page.getByRole("img", { name: /Savings from age 62 to 100/ })).toBeVisible();
});

test("demo renders a sample result without any answers", async ({ page }) => {
  await page.goto("/en/m7?demo=1");
  await acceptDisclaimer(page);
  await expect(page.getByText("Sample numbers for preview only.", { exact: false })).toBeVisible();
  await expect(page.getByTestId("m7-contrast-card")).toBeVisible();
  await expect(page.getByTestId("m7-chart")).toHaveAttribute("role", "img");
  await page.goto("/en/m7?demo=retired");
  await expect(page.getByTestId("m7-withdrawal")).toBeVisible();
});
