"use client";

import { useCallback, useMemo } from "react";
import type { Locale } from "./config";
import { useI18nContext } from "./provider";
import { translate } from "./translate";
import type { Dictionary, TranslateParams } from "./types";

export type TFunction = (key: string, params?: TranslateParams) => string;

export interface UseT {
  t: TFunction;
  locale: Locale;
  dict: Dictionary;
}

/**
 * `t("m1.rule.noStocks")`, `t("plan.headline", { amount: taka(9000) })`.
 * Keys are dot paths into the dictionary; a missing key returns the key itself and warns once in dev.
 */
export function useT(): UseT {
  const { locale, dict } = useI18nContext();
  const t = useCallback<TFunction>((key, params) => translate(dict, key, params), [dict]);
  return useMemo(() => ({ t, locale, dict }), [t, locale, dict]);
}

// Pure helpers, re-exported for convenience. Server code should import them from "./translate"
// directly so it does not pull in a "use client" module.
export { translate, getPath, interpolate } from "./translate";
