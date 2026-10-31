/**
 * M6 Asset mix: first-visit flow (gate → four risk questions → amounts) → three-part bar summing to
 * 100% → three-number projection → the PRD rebalance example → the plan's long-term bucket links to
 * the asset mix. Also: the Bangla page renders with Bangla digits, and `?demo=1` renders the sample.
 *
 * Runs against the local Pages preview by default (playwright.config.ts starts it) or BASE_URL.
 */
import { expect, test, type Page } from "@playwright/test";

const TEXT_INPUT = 'input:not([type="hidden"]):not([type="range"]):not([type="checkbox"]):not([type="radio"])';

async function answer(page: Page, value: string): Promise<void> {
  const input = page.locator(TEXT_INPUT).first();
  await expect(input).toBeVisible();
  await input.fill(value);
}

async function nextOnboarding(page: Page, fromStep: number, label = "Next"): Promise<void> {
  const advanced = () => !new RegExp(`/start/${fromStep}(?:[/?#]|$)`).test(page.url());
  if (advanced()) return;
  const button = page.getByRole("button", { name: label, exact: true });
  await expect(button).toBeEnabled();
  await button.click();
  await expect.poll(advanced, { timeout: 10_000 }).toBe(true);
}

async function onboard(page: Page): Promise<void> {
  await page.goto("/en/start/1");
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  const accept = page.getByRole("button", { name: "I understand", exact: true });
  if (await accept.isVisible({ timeout: 3_000 }).catch(() => false)) await accept.click();
  await answer(page, "28");
  await nextOnboarding(page, 1);
  await answer(page, "50000");
  await nextOnboarding(page, 2);
  await answer(page, "30000");
  await nextOnboarding(page, 3);
  await page.getByRole("button", { name: /No one/ }).first().click();
  await nextOnboarding(page, 4);
  await page.getByRole("button", { name: "No debt", exact: true }).click();
  await nextOnboarding(page, 5, "See my plan");
  await expect(page).toHaveURL(/\/en\/plan(?:[?#]|$)/);
}

/** "45%" / "৪৫%" → 45 */
function percentOf(text: string): number {
  const latin = text.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/[^\d.]/g, "");
  return Number(latin);
}

async function segmentPercents(page: Page): Promise<number[]> {
  const segments = page.getByTestId("mix-segment");
  await expect(segments).toHaveCount(3);
  return (await segments.allTextContents()).map(percentOf);
}

async function next(page: Page, label = "Next"): Promise<void> {
  const button = page.getByRole("button", { name: label, exact: true });
  await expect(button).toBeEnabled();
  await button.click();
}

test("asset mix: flow, bar, projection, rebalancer and the plan's link", async ({ page }) => {
  await onboard(page);
  await page.goto("/en/m6");

  // 1. Gate check, computed from the plan: the emergency fund is not full yet, but the user may continue.
  await expect(page.getByRole("heading", { level: 1, name: "Do you have an emergency fund and no card debt?" })).toBeVisible();
  await expect(page.getByText("Your emergency fund is not full yet.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the emergency fund" })).toHaveAttribute("href", "/en/m1");
  await expect(page.getByText("You carry no card debt.")).toBeVisible();
  await next(page, "Continue anyway");

  // 2. Four risk questions, one per screen; age band and income are prefilled from the profile.
  await expect(page.getByRole("heading", { level: 1, name: "Which age group are you in?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Under 35" })).toHaveAttribute("aria-pressed", "true");
  await next(page);
  await expect(page.getByRole("heading", { level: 1, name: "How steady is your income?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Salaried" })).toHaveAttribute("aria-pressed", "true");
  await next(page);
  await expect(page.getByRole("heading", { level: 1, name: "When will you need this money?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "In 5 to 10 years" }).click();
  await next(page);
  await expect(page.getByRole("heading", { level: 1, name: /If your investments fell 20% in a year/ })).toBeVisible();
  await page.getByRole("button", { name: "Sell, to stop the loss" }).click();
  await next(page);

  // 3. Amounts.
  await expect(page.getByRole("heading", { level: 1, name: "How much will you invest?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "See my mix", exact: true })).toBeDisabled();
  await page.locator("#m6-flow-lump").fill("1000000");
  await page.locator("#m6-flow-monthly").fill("10000");
  await next(page, "See my mix");

  // 4. Result: Balanced (score 5), three parts summing to 100.
  await expect(page.getByRole("heading", { level: 1, name: "Asset mix" })).toBeVisible();
  await expect(page.getByTestId("m6-profile")).toContainText("Your profile: Balanced");
  await expect(page.getByTestId("m6-profile")).toContainText("Risk score 5 of 8");
  const parts = await segmentPercents(page);
  expect(parts.reduce((a, b) => a + b, 0)).toBe(100);
  expect(parts).toEqual([45, 45, 10]); // fixed income / equity / gold
  await expect(page.getByTestId("instrument-card")).toHaveCount(3);
  await expect(page.getByTestId("gate-warnings")).toContainText("Fill your emergency fund first.");

  // 5. Projection: always three numbers (low / base / high), never one.
  for (const c of ["low", "base", "high"]) {
    await expect(page.getByTestId(`projection-${c}`).getByTestId("projection-nominal")).toHaveText(/৳[\d.,]+/);
  }
  await expect(page.getByTestId("projection").getByTestId("projection-nominal")).toHaveCount(3);

  // 6. Rebalancer, the PRD example: 45 / 10 / 45 on ৳10 lakh held as ৳5.5 / ৳1.5 / ৳3 lakh.
  await page.getByTestId("rebalance-open").click();
  await page.locator("#m6-holding-equity").fill("550000");
  await page.locator("#m6-holding-gold").fill("150000");
  await page.locator("#m6-holding-fixedIncome").fill("300000");
  const trade = (b: string) => page.locator(`[data-testid="trade-row"][data-bucket="${b}"]`).getByTestId("trade");
  await expect(trade("equity")).toHaveText("Sell ৳1,00,000");
  await expect(trade("gold")).toHaveText("Sell ৳50,000");
  await expect(trade("fixedIncome")).toHaveText("Buy ৳1,50,000");
  await expect(page.getByTestId("rebalancer")).toContainText("Never cash a savings certificate early");
  // With ৳1.5 lakh of new money instead, all of it goes to fixed income and nothing is sold.
  await page.locator("#m6-newMoney").fill("150000");
  await expect(trade("fixedIncome")).toHaveText("Buy ৳1,50,000");
  await expect(trade("equity")).toHaveText("No change");
  await expect(page.getByTestId("new-money-only")).toBeVisible();

  await expect(page.getByTestId("back-to-plan")).toHaveAttribute("href", "/en/plan");
  await expect(page.getByTestId("start-over")).toBeVisible();

  // 7. Returning visit: the calculator page, not the flow.
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Asset mix" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your answers" })).toBeVisible();

  // 8. With a full emergency fund, the plan's long-term bucket follows the mix and links here.
  await page.goto("/en/m1");
  await page.locator("#m1-liquid").fill("1000000");
  await page.goto("/en/plan");
  await expect(page.locator('a[href="/en/m6"]').first()).toBeVisible();

  // 9. Bangla.
  await page.goto("/bn/m6");
  await expect(page.getByRole("heading", { level: 1, name: "সম্পদ মিশ্রণ" })).toBeVisible();
  const bnSegments = await page.getByTestId("mix-segment").allTextContents();
  expect(bnSegments).toHaveLength(3);
  for (const s of bnSegments) expect(s).toMatch(/^[০-৯]+%$/);
  expect(bnSegments.map(percentOf).reduce((a, b) => a + b, 0)).toBe(100);
  await expect(page.getByTestId("trade-row").first()).toBeVisible();
});

test("asset mix demo renders the sample without onboarding", async ({ page }) => {
  await page.goto("/en/m6?demo=1");
  await expect(page.getByRole("heading", { level: 1, name: "Asset mix" })).toBeVisible();
  await expect(page.getByText("Sample numbers for preview only.")).toBeVisible();
  const parts = await segmentPercents(page);
  expect(parts.reduce((a, b) => a + b, 0)).toBe(100);
  await expect(page.getByTestId("projection").getByTestId("projection-nominal")).toHaveCount(3);
  await expect(page.locator('[data-testid="trade-row"][data-bucket="equity"]').getByTestId("trade")).toHaveText("Sell ৳1,00,000");
  await expect(page.getByTestId("start-over")).toHaveCount(0);
});
