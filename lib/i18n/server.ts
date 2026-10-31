/**
 * Server-side dictionary loading. Each locale is a separate dynamic import, so a page only ships
 * the one it renders. Import this from server components / route handlers only.
 */
import { defaultLocale, isLocale, type Locale } from "./config";
import type { Dictionary } from "./types";

const LOADERS: Record<Locale, () => Promise<Dictionary>> = {
  bn: async () => (await import("./dictionaries/bn")).bn,
  en: async () => (await import("./dictionaries/en")).en as Dictionary,
  hi: async () => (await import("./dictionaries/hi")).hi,
  ur: async () => (await import("./dictionaries/ur")).ur,
  ar: async () => (await import("./dictionaries/ar")).ar,
  es: async () => (await import("./dictionaries/es")).es,
  fr: async () => (await import("./dictionaries/fr")).fr,
  pt: async () => (await import("./dictionaries/pt")).pt,
  id: async () => (await import("./dictionaries/id")).id,
  zh: async () => (await import("./dictionaries/zh")).zh,
  ru: async () => (await import("./dictionaries/ru")).ru,
  sw: async () => (await import("./dictionaries/sw")).sw,
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return (LOADERS[locale] ?? LOADERS[defaultLocale])();
}

/** Pick the locale from a cookie value (or anything else), falling back to the default. */
export function localeFromCookie(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export { translate, getPath, interpolate } from "./translate";
