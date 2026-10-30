/**
 * Onboarding smoke: language pick → five questions → plan, in at most eight taps.
 *
 * Runs against the dev server by default (playwright.config.ts starts it) or BASE_URL.
 * Set E2E_EXPECT_PLAN=1 once the engine is wired to require the "Save ৳X a month" headline;
 * until then the plan page may show the engineNotReady message instead.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

const EXPECT_PLAN = process.env.E2E_EXPECT_PLAN === "1";
const MAX_CLICKS = 8;

/** Counts every tap so the test can assert the PRD's "plan in a handful of taps" promise. */
class Tapper {
  clicks = 0;
  constructor(private readonly page: Page) {}

  async tap(locator: Locator): Promise<void> {
    await locator.first().click();
    this.clicks += 1;
  }

  /** Types into the first visible text or number input on the question screen (typing is not a tap). */
  async answerNumber(value: string): Promise<void> {
    const input = this.page.locator('input:not([type="hidden"]):not([type="range"]):not([type="checkbox"]):not([type="radio"])').first();
    await expect(input).toBeVisible();
    await input.fill(value);
  }

  /** Taps "Next" only when the screen still needs it (some choice screens auto-advance). */
  async next(fromStep: number, label = "Next"): Promise<void> {
    const button = this.page.getByRole("button", { name: label, exact: true });
    const advanced = () => !new RegExp(`/start/${fromStep}(?:[/?#]|$)`).test(this.page.url());
    if (advanced()) return;
    await expect(button).toBeEnabled();
    await this.tap(button);
    await expect.poll(advanced, { timeout: 10_000 }).toBe(true);
  }
}

test("English onboarding reaches the plan in eight taps or fewer, then switches to Bangla digits", async ({ page }) => {
  const tapper = new Tapper(page);

  await page.goto("/");
  // The language buttons are client components: wait for hydration (dev serves modules lazily)
  // so the first tap is a real tap, not a click on static HTML.
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await tapper.tap(page.getByRole("button", { name: "English", exact: true }));
  await expect(page).toHaveURL(/\/en\/start\/1/);

  // One-time disclaimer gate on the first question: not counted as a question tap.
  const accept = page.getByRole("button", { name: "I understand", exact: true });
  if (await accept.isVisible({ timeout: 2_000 }).catch(() => false)) await accept.click();

  // Q1 age
  await tapper.answerNumber("28");
  await tapper.next(1);

  // Q2 take-home
  await tapper.answerNumber("50000");
  await tapper.next(2);

  // Q3 essentials
  await tapper.answerNumber("30000");
  await tapper.next(3);

  // Q4 dependents: none
  await tapper.tap(page.getByRole("button", { name: /No one/ }));
  await tapper.next(4);

  // Q5 debt: no, then the plan CTA
  await tapper.tap(page.getByRole("button", { name: "No debt", exact: true }));
  await tapper.next(5, "See my plan");

  await expect(page).toHaveURL(/\/en\/plan(?:[?#]|$)/);
  const body = page.locator("body");
  if (EXPECT_PLAN) {
    await expect(body).toContainText(/Save/);
  } else {
    await expect(body).toContainText(/Save|This calculator is still being set up/);
  }
  expect(tapper.clicks, `taps needed to reach the plan (max ${MAX_CLICKS})`).toBeLessThanOrEqual(MAX_CLICKS);

  // Locale switch in the header: the toggle is labelled with the language it switches TO.
  await page.getByRole("button", { name: "বাংলা", exact: true }).click();
  await expect(page).toHaveURL(/\/bn\/plan/);
  await expect(body).toContainText(/[০-৯]/);
});
