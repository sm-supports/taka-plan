import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against the production build served by the Cloudflare Pages runtime
 * (`npm run preview` = wrangler pages dev dist/client on :8788, with Functions and local D1).
 * Build first (`npm run build`) and migrate the local database once (`npm run db:migrate:local`).
 * Set BASE_URL to test another server, for example a *.pages.dev deployment.
 */
const PREVIEW = "http://localhost:8788";
if (!process.env.BASE_URL) process.env.BASE_URL = PREVIEW;

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: process.env.BASE_URL, trace: "retain-on-failure" },
  projects: [{ name: "mobile-chromium", use: { ...devices["Pixel 5"] } }],
  webServer:
    process.env.BASE_URL === PREVIEW
      ? { command: "npm run preview", url: `${PREVIEW}/api/health`, reuseExistingServer: true, timeout: 120_000 }
      : undefined,
});
