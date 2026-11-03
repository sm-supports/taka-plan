/**
 * "/" asks the country first, then offers that country's translated languages plus English, then
 * opens the first question. Runs against the production build on the Pages preview
 * (playwright.config.ts). The Pixel 5 profile's browser language is en-US, so the suggested
 * country is the United States.
 */
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function openPicker(page: Page, path = "/"): Promise<void> {
  await page.goto(path);
  // Client component: wait for hydration so the first tap is a real tap.
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await expect(page.getByRole("searchbox")).toBeVisible();
}

async function pickCountry(page: Page, code: string): Promise<void> {
  await page.locator(`button[data-country="${code}"]`).first().click();
  await expect(page.locator("button[data-locale]").first()).toBeVisible();
}

const languageButtons = (page: Page) => page.locator("button[data-locale]");

async function cookie(context: BrowserContext, name: string): Promise<string | undefined> {
  return (await context.cookies()).find((c) => c.name === name)?.value;
}

test("Bangladesh → বাংলা → first question, with both cookies set", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openPicker(page);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Where do you live?");
  await pickCountry(page, "BD");
  await expect(languageButtons(page)).toHaveText(["বাংলা", "English"]);
  await expect(page.getByText("Your language is not available yet")).toHaveCount(0);
  await page.getByRole("button", { name: "বাংলা", exact: true }).click();
  await expect(page).toHaveURL(/\/bn\/start\/1$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "bn-BD");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  expect(await cookie(context, "tp_country")).toBe("BD");
  expect(await cookie(context, "tp_locale")).toBe("bn");
  expect(errors).toEqual([]);
});

test("India offers Hindi (and Bangla, Urdu) plus English", async ({ page }) => {
  await openPicker(page);
  await pickCountry(page, "IN");
  await expect(languageButtons(page)).toHaveText(["हिन्दी", "বাংলা", "اردو", "English"]);
  await page.getByRole("button", { name: "हिन्दी", exact: true }).click();
  await expect(page).toHaveURL(/\/hi\/start\/1$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "hi-IN");
});

test("United States is suggested and offers English (its main language) first, then its other supported languages", async ({ page }) => {
  await openPicker(page);
  await expect(page.getByRole("region", { name: "Suggested" }).locator('button[data-country="US"]')).toBeVisible();
  await pickCountry(page, "US");
  await expect(languageButtons(page)).toHaveText(["English", "Español", "简体中文", "Français"]);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/start\/1$/);
});

test("Japan has no translation yet: English only, with a note", async ({ page }) => {
  await openPicker(page);
  await pickCountry(page, "JP");
  await expect(languageButtons(page)).toHaveText(["English"]);
  await expect(page.getByText("Your language is not available yet; English is used.")).toBeVisible();
});

test("Saudi Arabia → العربية gives a right-to-left page, also after a reload", async ({ page }) => {
  await openPicker(page);
  await pickCountry(page, "SA");
  await expect(languageButtons(page)).toHaveText(["العربية", "English"]);
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  await expect(page).toHaveURL(/\/ar\/start\/1$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  // Full load: the inline script in the root layout sets dir before hydration.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  // The header's end side is the left in RTL: the language menu sits left of the app name.
  const name = await page.locator("header a").first().boundingBox();
  const menu = await page.locator("header button[aria-haspopup]").boundingBox();
  expect(name && menu && menu.x < name.x).toBe(true);
});

test("search matches native names and ignores accents; Enter picks the first match", async ({ page }) => {
  await openPicker(page);
  const search = page.getByRole("searchbox");
  await search.fill("भारत");
  await expect(page.locator("button[data-country]").first()).toHaveAttribute("data-country", "IN");
  await search.fill("Deutschland");
  await expect(page.locator("button[data-country]")).toHaveCount(1);
  await search.fill("cote");
  await expect(page.locator("button[data-country]").first()).toHaveAttribute("data-country", "CI");
  await search.fill("বাংলাদেশ");
  await search.press("Enter");
  await expect(page.getByText("Country: বাংলাদেশ (Bangladesh)")).toBeVisible();
  await expect(languageButtons(page)).toHaveText(["বাংলা", "English"]);
  // "Change country" goes back to the picker.
  await page.getByRole("button", { name: /Change country/ }).click();
  await expect(page.getByRole("searchbox")).toBeVisible();
});

test("a returning visitor with both cookies goes straight to their locale", async ({ page, context, baseURL }) => {
  await context.addCookies([
    { name: "tp_country", value: "US", url: baseURL! },
    { name: "tp_locale", value: "en", url: baseURL! },
  ]);
  await page.goto("/");
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 10_000 }).toMatch(/^\/en(\/|$)/);
});

test("change country from the header, then the language menu offers the new country's languages", async ({ page, context, baseURL }) => {
  await context.addCookies([
    { name: "tp_country", value: "BD", url: baseURL! },
    { name: "tp_locale", value: "en", url: baseURL! },
  ]);
  await page.goto("/en/about");
  const countryLink = page.getByRole("link", { name: "Country Bangladesh. Change country" });
  await expect(countryLink).toBeVisible();
  await countryLink.click();
  await expect.poll(() => new URL(page.url()).search).toBe("?change=country");
  // The cookies exist, but ?change=country keeps the picker open, with the current country marked.
  await expect(page.getByRole("searchbox")).toBeVisible();
  await expect(page.locator('button[data-country="BD"][aria-current="true"]').first()).toBeVisible();
  await pickCountry(page, "IN");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 10_000 }).toMatch(/^\/en(\/|$)/);
  expect(await cookie(context, "tp_country")).toBe("IN");

  // Language menu: India's languages plus English; switching keeps the path and the query string.
  await page.goto("/en/plan?demo=1");
  await expect(page.getByRole("link", { name: "Country India. Change country" })).toBeVisible();
  const menuButton = page.getByRole("button", { name: "Language: English" });
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  const menu = page.locator("header ul");
  await expect(menu.getByRole("button")).toHaveText([/हिन्दी/, /বাংলা/, /اردو/, /English/]);
  await menu.getByRole("button", { name: /^বাংলা/ }).click();
  await expect(page).toHaveURL(/\/bn\/plan\?demo=1$/);
  expect(await cookie(context, "tp_locale")).toBe("bn");
});
