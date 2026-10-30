/**
 * Offline smoke: the plan shell still renders with the network cut.
 *
 * Needs a PRODUCTION preview because the service worker registers only in production builds:
 *   npm run build && npm run start          # serves the built Worker on port 3001
 *   BASE_URL=http://localhost:3001 npx playwright test e2e/offline.spec.ts
 * Without BASE_URL (dev server) the test is skipped.
 */
import { expect, test } from "@playwright/test";

const BASE_URL = process.env.BASE_URL;
const EXPECT_PLAN = process.env.E2E_EXPECT_PLAN === "1";
/** Bangla headline "মাসে ৳X সঞ্চয় করুন" once the engine is wired; app name until then. */
const HEADLINE = EXPECT_PLAN ? /সঞ্চয় করুন/ : /সঞ্চয় করুন|টাকা প্ল্যান/;

test.describe("offline", () => {
  test.skip(!BASE_URL, "needs BASE_URL pointing at a production preview (npm run build && npm run start)");

  test("plan page renders after going offline", async ({ page, context }) => {
    await page.goto("/bn/plan?demo=1");
    await expect(page.locator("body")).toContainText(HEADLINE);

    // Wait for the worker to control the page and for the shell to land in the cache.
    await page.waitForFunction(() => navigator.serviceWorker?.ready.then(() => !!navigator.serviceWorker.controller), null, { timeout: 30_000 });
    await page.waitForFunction(
      async () => {
        const names = await caches.keys();
        for (const name of names) {
          if (!name.startsWith("taka-")) continue;
          const cache = await caches.open(name);
          if (await cache.match("/bn/plan")) return true;
        }
        return false;
      },
      null,
      { timeout: 30_000 },
    );

    await context.setOffline(true);
    try {
      const response = await page.reload({ waitUntil: "domcontentloaded" });
      expect(response?.ok(), "offline reload answered from the service worker cache").toBe(true);
      expect(response?.fromServiceWorker()).toBe(true);
      await expect(page.locator("body")).toContainText(HEADLINE, { timeout: 15_000 });
    } finally {
      await context.setOffline(false);
    }
  });
});
