import fs from "node:fs";
import { expect, test } from "@playwright/test";

/** Admin password of the server under test: E2E_ADMIN_PASSWORD, else ADMIN_PASSWORD from .dev.vars (local preview). */
function adminPassword(): string | undefined {
  if (process.env.E2E_ADMIN_PASSWORD) return process.env.E2E_ADMIN_PASSWORD;
  try {
    return fs.readFileSync(".dev.vars", "utf8").match(/^ADMIN_PASSWORD=(.*)$/m)?.[1]?.trim();
  } catch {
    return undefined;
  }
}
const PW = adminPassword();

test("/ shows the picker for a new visitor and redirects by cookie for a returning one", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("button", { name: "English" })).toBeVisible();
  await context.addCookies([{ name: "tp_locale", value: "en", url: page.url() }]);
  await page.goto("/");
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 10_000 }).toMatch(/^\/en(\/|$)/);
  expect(errors).toEqual([]);
});

test("client navigation fetches the exported .txt RSC payload", async ({ page }) => {
  const txt: string[] = [];
  page.on("request", (r) => { if (r.url().endsWith(".txt")) txt.push(new URL(r.url()).pathname); });
  await page.goto("/en/about");
  await expect(page.locator("h1")).toBeVisible();
  await page.getByRole("link", { name: /plan/i }).last().click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/en/start/1"); // no profile yet: plan forwards to onboarding
  expect(txt).toEqual(expect.arrayContaining(["/en/plan.txt", "/en/start/1.txt"]));
});

test("unknown locale and unknown step get the 404 page", async ({ page }) => {
  const r1 = await page.goto("/xx/plan");
  expect(r1?.status()).toBe(404);
  await expect(page.getByText("Page not found")).toBeVisible();
});

test("admin: client gate shows sign-in, signs in, loads rates, signs out", async ({ page }) => {
  test.skip(!PW, "set E2E_ADMIN_PASSWORD or ADMIN_PASSWORD in .dev.vars");
  await page.goto("/admin");
  await expect(page.locator("#admin-password")).toBeVisible();
  await page.locator("#admin-password").fill("wrong-password");
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.locator("#admin-password").fill(PW!);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole("navigation")).toBeVisible({ timeout: 10_000 });
  await page.goto("/admin/log");
  await expect(page.getByRole("navigation")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page.locator("#admin-password")).toBeVisible({ timeout: 10_000 });
});
