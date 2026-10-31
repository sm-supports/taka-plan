/**
 * Locale configuration. `bn` is the default; the cookie carries the user's pick.
 * bn and en are complete; the other ten are translated from en (dictionaries/<locale>).
 * Keep `locales` equal to the engine's LOCALES (test/i18n-coverage.test.ts asserts it).
 */
export const locales = ["bn", "en", "hi", "ur", "ar", "es", "fr", "pt", "id", "zh", "ru", "sw"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bn";

export interface LocaleMeta {
  /** Name in its own language, for the language picker. */
  nativeName: string;
  englishName: string;
  dir: "ltr" | "rtl";
  /** BCP 47 tag for Intl and <html lang> (script or region where it matters). */
  tag: string;
  /** Translated by us from English and not yet reviewed by a native speaker. */
  machineReviewPending: boolean;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  bn: { nativeName: "বাংলা", englishName: "Bangla", dir: "ltr", tag: "bn-BD", machineReviewPending: false },
  en: { nativeName: "English", englishName: "English", dir: "ltr", tag: "en", machineReviewPending: false },
  hi: { nativeName: "हिन्दी", englishName: "Hindi", dir: "ltr", tag: "hi-IN", machineReviewPending: true },
  ur: { nativeName: "اردو", englishName: "Urdu", dir: "rtl", tag: "ur-PK", machineReviewPending: true },
  ar: { nativeName: "العربية", englishName: "Arabic", dir: "rtl", tag: "ar", machineReviewPending: true },
  es: { nativeName: "Español", englishName: "Spanish", dir: "ltr", tag: "es", machineReviewPending: true },
  fr: { nativeName: "Français", englishName: "French", dir: "ltr", tag: "fr", machineReviewPending: true },
  pt: { nativeName: "Português", englishName: "Portuguese", dir: "ltr", tag: "pt", machineReviewPending: true },
  id: { nativeName: "Bahasa Indonesia", englishName: "Indonesian", dir: "ltr", tag: "id-ID", machineReviewPending: true },
  zh: { nativeName: "简体中文", englishName: "Chinese (Simplified)", dir: "ltr", tag: "zh-Hans", machineReviewPending: true },
  ru: { nativeName: "Русский", englishName: "Russian", dir: "ltr", tag: "ru", machineReviewPending: true },
  sw: { nativeName: "Kiswahili", englishName: "Swahili", dir: "ltr", tag: "sw", machineReviewPending: true },
};

export function isLocale(x: unknown): x is Locale {
  return typeof x === "string" && (locales as readonly string[]).includes(x);
}

/** Cookie name for the chosen locale. */
export const LOCALE_COOKIE = "tp_locale";

/** Cookie name for the chosen country (ISO 3166-1 alpha-2). */
export const COUNTRY_COOKIE = "tp_country";

/** Coerce anything (cookie value, URL segment, Accept-Language token) to a Locale. */
export function resolveLocale(x: unknown): Locale {
  return isLocale(x) ? x : defaultLocale;
}

/** Locale regex for URL prefixes, e.g. /^\/(bn|en|hi|...)(?=\/|$)/. */
export const LOCALE_PREFIX = new RegExp(`^/(${locales.join("|")})(?=/|$)`);
