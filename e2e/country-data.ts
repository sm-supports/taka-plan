import type { APIRequestContext } from "@playwright/test";

/**
 * The locales the language step offers for `code`, read from the published country index so tests
 * follow the research data: English first when it is the main language (or the main language has
 * no translation), as lib/country/index-data.ts orderedLocales does.
 */
export async function offeredLocales(request: APIRequestContext, code: string): Promise<string[]> {
  const index = (await (await request.get("/data/countries/index.json")).json()) as { code: string; languages: string[]; locales: string[] }[];
  const entry = index.find((e) => e.code === code);
  if (!entry) throw new Error(`${code} is not in /data/countries/index.json`);
  const main = entry.languages[0];
  if ((main !== "en" && entry.locales.includes(main)) || !entry.locales.includes("en")) return entry.locales;
  return ["en", ...entry.locales.filter((l) => l !== "en")];
}
