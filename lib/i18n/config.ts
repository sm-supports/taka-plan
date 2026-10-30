/** Locale configuration. `bn` is the default; the cookie carries the user's pick. */
export const locales = ["bn", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bn";

export function isLocale(x: unknown): x is Locale {
  return typeof x === "string" && (locales as readonly string[]).includes(x);
}

/** Cookie name for the chosen locale. */
export const LOCALE_COOKIE = "tp_locale";

/** Coerce anything (cookie value, URL segment, Accept-Language token) to a Locale. */
export function resolveLocale(x: unknown): Locale {
  return isLocale(x) ? x : defaultLocale;
}
