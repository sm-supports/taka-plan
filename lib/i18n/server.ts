/**
 * Server-side dictionary loading. Each locale is a separate dynamic import, so a request
 * only ships the one it renders. Import this from server components / route handlers only.
 */
import { defaultLocale, isLocale, type Locale } from "./config";
import type { Dictionary } from "./types";

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  switch (locale) {
    case "en":
      return (await import("./dictionaries/en")).en as Dictionary;
    case "bn":
    default:
      return (await import("./dictionaries/bn")).bn;
  }
}

/** Pick the locale from a cookie value (or anything else), falling back to the default. */
export function localeFromCookie(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export { translate, getPath, interpolate } from "./translate";
