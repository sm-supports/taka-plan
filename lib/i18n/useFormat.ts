"use client";

import { formatAsOf, formatMonths, formatNumber, formatPercent, formatTaka, type Digits, type ISODate, type Money, type Rate } from "@taka/engine";
import { useMemo } from "react";
import type { Locale } from "./config";
import { useI18nContext } from "./provider";

export interface TakaOptions {
  /** "৳9.0 lakh" / "৳1.2 crore" above one lakh. */
  compact?: boolean;
  /** Always show a leading + or −. */
  sign?: boolean;
}

export interface Formatters {
  locale: Locale;
  /** Bangla mode always uses Bangla digits (PRD). */
  digits: Digits;
  taka: (n: Money, o?: TakaOptions) => string;
  percent: (r: Rate, decimals?: number) => string;
  number: (n: number, decimals?: number) => string;
  months: (m: number) => string;
  asOf: (iso: ISODate) => string;
}

/** Pure factory, usable on the server or in tests. */
export function createFormatters(locale: Locale): Formatters {
  const digits: Digits = locale === "bn" ? "bn" : "latn";
  return {
    locale,
    digits,
    taka: (n, o) => formatTaka(n, { digits, compact: o?.compact, sign: o?.sign }),
    percent: (r, decimals) => formatPercent(r, { digits, decimals }),
    number: (n, decimals) => formatNumber(n, { digits, decimals }),
    months: (m) => formatMonths(m, locale),
    asOf: (iso) => formatAsOf(iso, locale),
  };
}

/** Locale-aware number formatting backed by the engine's formatters. */
export function useFormat(): Formatters {
  const { locale } = useI18nContext();
  return useMemo(() => createFormatters(locale), [locale]);
}
