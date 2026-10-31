/**
 * M2 Insurance & health: onboarding with dependents → the four insurance questions → life cover,
 * health cover and premium ranges → the plan shows an Insurance bucket. Then the Bangla page renders
 * with Bangla digits, the returning visit shows every answer on one page, and `?demo=1` renders.
 *
 * Runs against the local Pages preview by default (playwright.config.ts starts it) or BASE_URL.
 */
import { expect, test, type Page } from "@playwright/test";

const TEXT_INPUT = 'input:not([type="hidden"]):not([type="range"]):not([type="checkbox"]):not([type="radio"])';
const LATIN_DIGIT = /[0-9]/;
const BANGLA_DIGIT = /[০-৯]/;

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

/** Age 32, ৳60,000 take-home, ৳30,000 essentials, partner and children, no debt. */
async function onboardWithDependents(page: Page): Promise<void> {
  await page.goto("/en/start/1");
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  const accept = page.getByRole("button", { name: "I understand", exact: true });
  if (await accept.isVisible({ timeout: 3_000 }).catch(() => false)) await accept.click();
  await answer(page, "32");
  await next(page, 1);
  await answer(page, "60000");
  await next(page, 2);
  await answer(page, "30000");
  await next(page, 3);
  await page.getByRole("button", { name: /^Partner/ }).click();
  await page.getByRole("button", { name: /^Children/ }).click();
  await next(page, 4);
  await page.getByRole("button", { name: "No debt", exact: true }).click();
  await next(page, 5, "See my plan");
  await expect(page).toHaveURL(/\/en\/plan(?:[?#]|$)/);
}

test("insurance questions lead to life cover, health cover and premiums, and the plan gains an Insurance bucket", async ({ page }) => {
  await onboardWithDependents(page);
  // Before the insurance check the plan has no Insurance bucket.
  await expect(page.getByRole("heading", { name: "Insurance", exact: true })).toHaveCount(0);

  await page.goto("/en/m2");
  // (a) smoking
  await expect(page.getByRole("heading", { name: "Do you smoke or use tobacco?" })).toBeVisible();
  const nextButton = page.getByRole("button", { name: "Next", exact: true });
  await expect(nextButton).toBeDisabled();
  await page.getByRole("button", { name: "No", exact: true }).click();
  await nextButton.click();
  // (b) life cover already held: none
  await expect(page.getByRole("heading", { name: "How much life cover do you already have?" })).toBeVisible();
  await page.getByRole("button", { name: "I have none", exact: true }).click();
  // (c) health cover already held
  await expect(page.getByRole("heading", { name: "How much health cover does your family already have?" })).toBeVisible();
  await answer(page, "100000");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // (d) who to cover: prefilled from the dependents
  await expect(page.getByRole("heading", { name: "Who should the health cover include?" })).toBeVisible();
  for (const name of ["Me", "Partner", "Children"]) await expect(page.getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Parents", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "See my result", exact: true }).click();

  const life = page.getByTestId("m2-life");
  await expect(life).toContainText("Life cover your family needs");
  await expect(life).toContainText(/৳[\d,]+/);
  await expect(life).toContainText(/times your yearly income/);
  const health = page.getByTestId("m2-health");
  await expect(health).toContainText("Health cover for the family");
  await expect(health).toContainText("For 3 people");
  await expect(health).toContainText("৳1,00,000");
  const premium = page.getByTestId("m2-premium");
  await expect(premium).toContainText(/৳[\d,]+\/month/);
  await expect(premium).toContainText(/৳[\d,]+ – ৳[\d,]+/);
  await expect(page.getByTestId("m2-checklist")).toContainText("Insurance regulator:");
  await expect(page.getByTestId("start-over")).toBeVisible();

  // The policy checker opens and compares both paths, never advising to cancel.
  await page.getByTestId("m2-policy").locator("summary").click();
  await page.locator("#m2-policy-premium").fill("30000");
  await page.locator("#m2-policy-sum").fill("500000");
  await page.locator("#m2-policy-term").fill("15");
  await page.locator("#m2-policy-paid").fill("5");
  await page.locator("#m2-policy-maturity").fill("650000");
  await expect(page.getByTestId("m2-policy-compare")).toContainText("If you keep the policy");
  await expect(page.getByTestId("m2-policy-compare")).toContainText("৳6,50,000");
  await expect(page.getByTestId("m2-policy-note")).toContainText("not advice to stop or keep any policy");

  // Back to the plan: the Insurance bucket is there.
  await page.getByTestId("m2-back-to-plan").click();
  await expect(page).toHaveURL(/\/en\/plan(?:[?#]|$)/);
  await expect(page.getByRole("heading", { name: "Insurance", exact: true })).toBeVisible();

  // Returning visit: every answer on one page, with the result.
  await page.goto("/en/m2");
  await expect(page.getByRole("heading", { name: "Your answers", exact: true })).toBeVisible();
  await expect(page.locator("#m2-health")).toHaveValue("100000");
  await expect(page.locator("#m2-coverToAge")).toBeVisible();
  await expect(page.getByTestId("m2-life")).toBeVisible();

  // Bangla: same answers, Bangla digits in the figures.
  await page.goto("/bn/m2");
  const bnLife = page.getByTestId("m2-life");
  await expect(bnLife).toContainText("জীবন বিমা");
  await expect(bnLife).toContainText(BANGLA_DIGIT);
  for (const id of ["m2-life", "m2-health", "m2-premium"]) {
    const text = (await page.getByTestId(id).textContent()) ?? "";
    expect(text, `${id} has no Latin digits`).not.toMatch(LATIN_DIGIT);
  }
});

test("demo mode renders the sample result without any answers", async ({ page }) => {
  await page.goto("/en/m2?demo=1");
  await expect(page.getByText("Sample numbers for preview only.", { exact: false })).toBeVisible();
  await expect(page.getByTestId("m2-life")).toContainText("Life cover your family needs");
  await expect(page.getByTestId("m2-health")).toBeVisible();
  await expect(page.getByTestId("m2-premium")).toContainText(/৳[\d,]+\/month/);
  await expect(page.getByTestId("start-over")).toHaveCount(0);
  await page.getByTestId("m2-policy").locator("summary").click();
  await expect(page.getByTestId("m2-policy-compare")).toContainText("৳6,50,000");
});
