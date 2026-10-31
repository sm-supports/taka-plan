"use client";

import {
  BDT_CURRENCY,
  formatAsOf,
  formatMoney,
  formatMonths,
  formatNumber,
  formatPercent,
  formatTaka,
  parseMoneyInput,
  toBanglaDigits,
  type Digits,
  type ISODate,
  type Money,
  type MoneyCurrency,
  type Rate,
} from "@taka/engine";
import { useContext, useMemo } from "react";
import { CountryReactContext } from "../country/context";
import { LOCALE_META, type Locale } from "./config";
import { useI18nContext } from "./provider";

export interface TakaOptions {
  /** "৳9.0 lakh" / "৳1.2 crore" above one lakh ("$1.3M" for Intl-compact currencies). */
  compact?: boolean;
  /** Always show a leading + or −. */
  sign?: boolean;
}

export type MoneyOptions = TakaOptions;

export interface Formatters {
  locale: Locale;
  /** Bangla mode always uses Bangla digits (PRD). */
  digits: Digits;
  /** The currency `money` writes (the selected country's; taka by default). */
  currency: MoneyCurrency;
  /** Always taka, whatever the country. Only for Bangladesh-only figures; new code calls `money`. */
  taka: (n: Money, o?: TakaOptions) => string;
  /** Money in the selected country's currency ("৳12,50,000", "₹12.5 lakh", "$1,250,000"). */
  money: (n: Money, o?: MoneyOptions) => string;
  /** Typed amount → whole units, in any script, ignoring the currency symbol; null when not an amount. */
  parseMoney: (s: string) => Money | null;
  percent: (r: Rate, decimals?: number) => string;
  number: (n: number, decimals?: number) => string;
  months: (m: number) => string;
  asOf: (iso: ISODate) => string;
  /** Text typed or shown in an input box, with its digits in the locale's script (Bangla digits in bn, unchanged in en). */
  inputDigits: (s: string) => string;
}

/** Pure factory, usable on the server or in tests. `currency` defaults to taka. */
export function createFormatters(locale: Locale, currency: MoneyCurrency = BDT_CURRENCY): Formatters {
  const digits: Digits = locale === "bn" ? "bn" : "latn";
  const tag = LOCALE_META[locale]?.tag ?? locale;
  return {
    locale,
    digits,
    currency,
    taka: (n, o) => formatTaka(n, { digits, compact: o?.compact, sign: o?.sign }),
    money: (n, o) => formatMoney(n, { currency, locale: tag, digits, compact: o?.compact, sign: o?.sign }),
    parseMoney: (s) => parseMoneyInput(s, { symbol: currency.symbol, locale: tag, digits }),
    percent: (r, decimals) => formatPercent(r, { digits, decimals }),
    number: (n, decimals) => formatNumber(n, { digits, decimals }),
    months: (m) => formatMonths(m, locale),
    asOf: (iso) => formatAsOf(iso, locale),
    inputDigits: (s) => (digits === "bn" ? toBanglaDigits(s) : s),
  };
}

/** Locale-aware formatting backed by the engine's formatters; money follows the selected country. */
export function useFormat(): Formatters {
  const { locale } = useI18nContext();
  const country = useContext(CountryReactContext);
  const c = country?.context.currency;
  const code = c?.code ?? BDT_CURRENCY.code;
  const symbol = c?.symbol ?? BDT_CURRENCY.symbol;
  const decimals = c?.decimals ?? BDT_CURRENCY.decimals;
  const compact = c?.compact ?? BDT_CURRENCY.compact;
  return useMemo(() => createFormatters(locale, { code, symbol, decimals, compact }), [locale, code, symbol, decimals, compact]);
}
