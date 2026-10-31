import type { ISODate, Locale, Money, Rate } from "./types";

export type Digits = "latn" | "bn";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaDigits(s: string): string {
  return s.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

export function fromBanglaDigits(s: string): string {
  return s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

/** Indian grouping: 1250000 → "12,50,000". Handles negatives; drops fractions. */
export function groupIndian(n: number): string {
  const neg = n < 0;
  const whole = Math.abs(Math.round(n)).toString();
  let out: string;
  if (whole.length <= 3) out = whole;
  else {
    const last3 = whole.slice(-3);
    let rest = whole.slice(0, -3);
    const parts: string[] = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) parts.unshift(rest);
    out = `${parts.join(",")},${last3}`;
  }
  return neg ? `-${out}` : out;
}

const LAKH = 100_000;
const CRORE = 10_000_000;

export interface FormatTakaOptions {
  digits: Digits;
  /** "৳9.0 lakh" / "৳1.2 crore" above 1 lakh; below that, grouped. */
  compact?: boolean;
  /** Always show a leading + or −. */
  sign?: boolean;
}

function localiseDigits(s: string, digits: Digits): string {
  return digits === "bn" ? toBanglaDigits(s) : s;
}

/** Lakh/crore style (South Asia): "৳12,50,000", compact "৳12.5 lakh" / "৳১.২ কোটি". */
function formatLakhCrore(n: number, symbol: string, o: { digits: Digits; words: "bn" | "en"; compact?: boolean; sign?: boolean }): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  let body: string;
  if (o.compact && abs >= LAKH) {
    const isCrore = abs >= CRORE;
    const v = abs / (isCrore ? CRORE : LAKH);
    const num = (Math.round(v * 10) / 10).toFixed(1);
    const unit = o.words === "bn" ? (isCrore ? "কোটি" : "লাখ") : isCrore ? "crore" : "lakh";
    body = `${localiseDigits(num, o.digits)} ${unit}`;
  } else {
    body = localiseDigits(groupIndian(abs), o.digits);
  }
  const sign = neg ? "−" : o.sign ? "+" : "";
  return `${sign}${symbol}${body}`;
}

export function formatTaka(n: Money, o: FormatTakaOptions): string {
  return formatLakhCrore(n, "৳", { digits: o.digits, words: o.digits === "bn" ? "bn" : "en", compact: o.compact, sign: o.sign });
}

/** How a currency is written: the shape of `CountryContext.currency` without the dollar rate. */
export interface MoneyCurrency {
  /** ISO 4217 code ("BDT", "INR", "USD"). */
  code: string;
  /** Narrow local symbol ("৳", "₹", "$"); used by the lakh/crore style and by input parsing. */
  symbol: string;
  /** Minor-unit digits; informational only, the app never shows minor units. */
  decimals: number;
  compact: "lakh_crore" | "intl";
}

export interface FormatMoneyOptions {
  currency: MoneyCurrency;
  /** BCP-47 tag of the UI locale ("bn-BD", "en", "hi-IN", "fr"). */
  locale: string;
  digits: Digits;
  /** Short form for big numbers: "৳12.5 lakh" (lakh/crore currencies in bn/en), else Intl compact ("$1.3M"). */
  compact?: boolean;
  /** Always show a leading + or −. */
  sign?: boolean;
}

/** The currency of Bangladesh, written exactly as formatTaka writes it. */
export const BDT_CURRENCY: MoneyCurrency = { code: "BDT", symbol: "৳", decimals: 2, compact: "lakh_crore" };

function languageOf(tag: string): string {
  return (tag.split(/[-_]/)[0] ?? "").toLowerCase();
}

const NUMBER_FORMATS = new Map<string, Intl.NumberFormat>();

function numberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = NUMBER_FORMATS.get(key);
  if (!f) {
    try {
      f = new Intl.NumberFormat(locale, options);
    } catch {
      // Unknown tag or currency code in this runtime: English, and the code itself when it is malformed.
      const currency = typeof options.currency === "string" && /^[A-Za-z]{3}$/.test(options.currency) ? options.currency : undefined;
      f = new Intl.NumberFormat("en", currency ? { ...options, currency } : { ...options, style: "decimal", currency: undefined });
    }
    NUMBER_FORMATS.set(key, f);
  }
  return f;
}

/**
 * Money in any currency, whole units only. Lakh/crore currencies (BDT, INR, PKR, NPR) shown in
 * Bangla or English keep the Bangladeshi style ("৳12,50,000", "₹12.5 lakh"; formatTaka's output
 * for BDT); everything else uses Intl.NumberFormat with the locale's grouping and a narrow symbol
 * ("$1,250,000", "1 250 000 €") and Intl compact notation ("$1.3M"). Negatives use the minus sign (−).
 */
export function formatMoney(n: Money, o: FormatMoneyOptions): string {
  const value = Number.isFinite(n) ? n : 0;
  const lang = languageOf(o.locale);
  if (o.currency.compact === "lakh_crore" && (lang === "bn" || lang === "en")) {
    return formatLakhCrore(value, o.currency.symbol, { digits: o.digits, words: lang === "bn" ? "bn" : "en", compact: o.compact, sign: o.sign });
  }
  const f = numberFormat(o.locale, {
    style: "currency",
    currency: o.currency.code,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: o.compact ? 1 : 0,
    notation: o.compact ? "compact" : "standard",
    signDisplay: o.sign ? "always" : "auto",
    numberingSystem: o.digits === "bn" ? "beng" : "latn",
  });
  const shown = o.compact ? value : Math.round(value);
  return f.format(Object.is(shown, -0) ? 0 : shown).replace(/-/g, "−");
}

export function formatPercent(r: Rate, o: { digits: Digits; decimals?: number }): string {
  const d = o.decimals ?? 1;
  const v = (Math.round(r * 100 * 10 ** d) / 10 ** d).toFixed(d);
  const neg = v.startsWith("-");
  const body = localiseDigits(neg ? v.slice(1) : v, o.digits);
  return `${neg ? "−" : ""}${body}%`;
}

export function formatNumber(n: number, o: { digits: Digits; decimals?: number }): string {
  const d = o.decimals ?? 0;
  const v = (Math.round(n * 10 ** d) / 10 ** d).toFixed(d);
  return localiseDigits(v, o.digits);
}

export function formatMonths(m: number, locale: Locale): string {
  const v = Number.isInteger(m) ? String(m) : (Math.round(m * 10) / 10).toFixed(1);
  if (locale === "bn") return `${toBanglaDigits(v)} মাস`;
  return `${v} ${m === 1 ? "month" : "months"}`;
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_BN = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

/** "2026-09-30" → "Sep 2026" / "সেপ্টেম্বর ২০২৬". Falls back to the raw string when unparsable. */
export function formatAsOf(iso: ISODate, locale: Locale): string {
  const m = /^(\d{4})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const year = m[1] ?? "";
  const month = Number(m[2]) - 1;
  const name = (locale === "bn" ? MONTHS_BN : MONTHS_EN)[month];
  if (!name) return iso;
  return locale === "bn" ? `${name} ${toBanglaDigits(year)}` : `${name} ${year}`;
}

/** First code point of each native digit set read in typed amounts: Bangla, Arabic-Indic, Extended Arabic-Indic (Urdu, Persian), Devanagari. */
const DIGIT_BLOCKS = [0x09e6, 0x0660, 0x06f0, 0x0966] as const;

/** Any native digit (see DIGIT_BLOCKS) → Latin. */
export function toLatinDigits(s: string): string {
  return s.replace(/[০-৯٠-٩۰-۹०-९]/g, (ch) => {
    const code = ch.charCodeAt(0);
    for (const start of DIGIT_BLOCKS) if (code >= start && code <= start + 9) return String(code - start);
    return ch;
  });
}

/** Multiplier words: only words that mean one thing in every language we read. */
const UNIT_WORDS: readonly (readonly [RegExp, number])[] = [
  [/^(lakh|lakhs|lac|lacs|লাখ|লক্ষ|लाख)$/u, LAKH],
  [/^(crore|crores|cr|কোটি|करोड़|करोड)$/u, CRORE],
  [/^(k|thousand|হাজার|हज़ार|हजार)$/u, 1_000],
  [/^(m|mn|million|millions)$/u, 1_000_000],
  [/^(bn|billion|billions)$/u, 1_000_000_000],
];

export interface ParseMoneyOptions {
  /** Local currency symbol to ignore when it is not a Unicode currency sign ("Rs", "KSh", "R$"). */
  symbol?: string;
  /**
   * Accepted for symmetry with formatMoney. Every script (Latin, Bangla, Arabic-Indic, Devanagari)
   * and both decimal marks are read whatever the locale.
   */
  locale?: string;
  digits?: Digits;
}

/** Resolve "," and "." in a digits-and-marks string: grouping marks are dropped, the decimal mark becomes ".". */
function normaliseSeparators(t: string, hasUnit: boolean): string | null {
  const commas = t.split(",").length - 1;
  const dots = t.split(".").length - 1;
  if (commas === 0 && dots === 0) return t;
  if (commas > 0 && dots > 0) {
    // Both present: the one written last is the decimal mark and appears once ("1,250.5", "1.250,5").
    const dec = t.lastIndexOf(",") > t.lastIndexOf(".") ? "," : ".";
    if ((dec === "," ? commas : dots) > 1) return null;
    return t.split(dec === "," ? "." : ",").join("").replace(dec, ".");
  }
  const mark = commas > 0 ? "," : ".";
  if ((commas || dots) > 1) return t.split(mark).join("");
  // One mark: exactly three digits after it is grouping ("1,250", "1.250"); amounts are whole
  // units. Otherwise, or before a multiplier word ("1.250 lakh"), it is the decimal mark.
  const after = t.length - t.indexOf(mark) - 1;
  return after === 3 && !hasUnit ? t.replace(mark, "") : t.replace(mark, ".");
}

/**
 * Parse a typed amount in any supported script: "12,50,000", "১২৫০০০", "١٢٥٠٠٠", "१२५०००", "12.5 lakh",
 * "১.২ কোটি", "৳ 5000", "$1,250,000", "1 250 000 €", "1.250.000", "2.5m", "50k".
 * Returns whole units, or null when the text is not one amount.
 */
export function parseMoneyInput(s: string, o: ParseMoneyOptions = {}): Money | null {
  let t = toLatinDigits(s).toLowerCase();
  if (o.symbol && !/^\p{Sc}+$/u.test(o.symbol)) t = t.split(o.symbol.toLowerCase()).join(" ");
  // Currency signs, spaces (with no-break and narrow ones), apostrophes and the Arabic thousands mark are not part of the number.
  t = t
    .replace(/[\p{Sc}\s  '’٬]/gu, "")
    .replace(/٫/g, ".")
    .replace(/[−–]/g, "-");
  const m = /^([+-]?[\d.,]*\d[\d.,]*)(\p{L}[\p{L}\p{M}]*)?$/u.exec(t);
  if (!m) return null;
  const word = m[2];
  const numText = normaliseSeparators(m[1] ?? "", word !== undefined);
  if (numText === null || !/^[+-]?(\d+\.?\d*|\.\d+)$/.test(numText)) return null;
  const n = Number(numText);
  if (!Number.isFinite(n)) return null;
  let mult = 1;
  if (word !== undefined) {
    const hit = UNIT_WORDS.find(([re]) => re.test(word));
    if (!hit) return null;
    mult = hit[1];
  }
  return Math.round(n * mult);
}

/** Taka input: the same parser, kept for existing callers. */
export function parseTakaInput(s: string): Money | null {
  return parseMoneyInput(s);
}
