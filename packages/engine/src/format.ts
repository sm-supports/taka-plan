import type { ISODate, Locale, Money, Rate } from "./types";

export type Digits = "latn" | "bn";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaDigits(s: string): string {
  return s.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

export function fromBanglaDigits(s: string): string {
  return s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

/** Round half away from zero, so −2.5 and 2.5 round to the same size (Math.round sends −2.5 to −2). */
export function roundHalfAway(n: number): number {
  const r = Math.sign(n) * Math.round(Math.abs(n));
  return Object.is(r, -0) ? 0 : r;
}

/** Indian grouping: 1250000 → "12,50,000". Handles negatives (rounded like positives); drops fractions. */
export function groupIndian(n: number): string {
  const whole = Math.round(Math.abs(n)).toString();
  const neg = n < 0 && whole !== "0";
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
  const sign = neg && Math.round(abs) !== 0 ? "−" : o.sign ? "+" : "";
  return `${sign}${symbol}${symbolGap(symbol)}${body}`;
}

/** A space after a symbol that ends in a letter ("Rs 5,000", "SAR 1,250"); none after a sign ("৳5,000", "$5"). */
function symbolGap(symbol: string): string {
  return /\p{L}$/u.test(symbol) ? " " : "";
}

/** Intl's parts with the currency symbol moved before the number, as the app writes taka. */
function symbolFirst(parts: Intl.NumberFormatPart[]): string {
  let sign = "";
  let symbol = "";
  let body = "";
  for (const p of parts) {
    if (p.type === "minusSign" || p.type === "plusSign") sign = p.value;
    else if (p.type === "currency") symbol = p.value;
    else body += p.value;
  }
  return `${sign}${symbol}${symbolGap(symbol)}${body.trim()}`;
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
  const rounded = o.compact ? value : roundHalfAway(value);
  const shown = Object.is(rounded, -0) ? 0 : rounded;
  // Intl writes Bangla with the symbol after the number ("১২,৫০,০০০$"); the app puts it first, as for taka.
  const text = lang === "bn" ? symbolFirst(f.formatToParts(shown)) : f.format(shown);
  return text.replace(/-/g, "−");
}

export function formatPercent(r: Rate, o: { digits: Digits; decimals?: number }): string {
  const d = o.decimals ?? 1;
  const v = (roundHalfAway(r * 100 * 10 ** d) / 10 ** d).toFixed(d);
  const neg = v.startsWith("-");
  const body = localiseDigits(neg ? v.slice(1) : v, o.digits);
  return `${neg ? "−" : ""}${body}%`;
}

export function formatNumber(n: number, o: { digits: Digits; decimals?: number }): string {
  const d = o.decimals ?? 0;
  const v = (roundHalfAway(n * 10 ** d) / 10 ** d).toFixed(d);
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

/**
 * Multiplier words: only words that mean one thing in every language we read. Includes Intl's own
 * compact words where they are unambiguous (Bangla "লা"/"কো", Arabic "ألف"/"مليون"), the East Asian
 * myriads (万/萬/만 = 10,000, 億/亿/억 = 100,000,000, with or without 円/元) and Russian тыс/млн.
 */
const UNIT_WORDS: readonly (readonly [RegExp, number])[] = [
  [/^(lakh|lakhs|lac|lacs|লাখ|লক্ষ|লা|लाख)$/u, LAKH],
  [/^(crore|crores|cr|কোটি|কো|करोड़|करोड)$/u, CRORE],
  [/^(k|thousand|হাজার|हज़ार|हजार|тыс\.?|ألف|الف|آلاف|千)$/u, 1_000],
  [/^(m|mn|million|millions|млн\.?|مليون|ملايين)$/u, 1_000_000],
  [/^(bn|billion|billions|млрд\.?|مليار)$/u, 1_000_000_000],
  [/^(万|萬|만)(円|元|원)?$/u, 10_000],
  [/^(億|亿|억)(円|元|원)?$/u, 100_000_000],
  // The yen, yuan and won written as a word after the number ("5000円") is the currency, not a multiplier.
  [/^(円|元|원)$/u, 1],
];

export interface ParseMoneyOptions {
  /** Local currency symbol to ignore at the start or end ("৳", "Rs", "KSh", "R$"). */
  symbol?: string;
  /** ISO 4217 code: the code itself ("SAR 500") and Intl's symbols for it ("US$", "ر.س.") are ignored too. */
  code?: string;
  /** BCP-47 tag of the UI locale, for Intl's symbol. Every script and both decimal marks are read whatever the locale. */
  locale?: string;
  digits?: Digits;
}

/** Bidi controls Intl and keyboards put around numbers (LRM, RLM, ALM, embeddings, isolates). */
const BIDI_MARKS = /[‎‏؜‪-‮⁦-⁩]/g;

const SYMBOL_CACHE = new Map<string, string[]>();

/** Intl's narrow and standard symbols for `code` in `locale` and in English. */
function intlSymbols(code: string, locale: string | undefined): string[] {
  const out: string[] = [];
  for (const tag of [locale, "en"]) {
    if (!tag) continue;
    for (const display of ["narrowSymbol", "symbol"] as const) {
      try {
        const part = new Intl.NumberFormat(tag, { style: "currency", currency: code, currencyDisplay: display }).formatToParts(1).find((p) => p.type === "currency");
        if (part?.value) out.push(part.value);
      } catch {
        // unknown code or tag in this runtime
      }
    }
  }
  return out;
}

/** Explicit tokens to ignore, longest first, lower case. */
function currencyTokens(o: ParseMoneyOptions): string[] {
  const key = `${o.symbol ?? ""}|${o.code ?? ""}|${o.locale ?? ""}`;
  let hit = SYMBOL_CACHE.get(key);
  if (!hit) {
    const raw = [o.symbol, o.code, ...(o.code && /^[A-Za-z]{3}$/.test(o.code) ? intlSymbols(o.code.toUpperCase(), o.locale) : [])];
    hit = [...new Set(raw.filter((x): x is string => typeof x === "string").map((x) => x.replace(BIDI_MARKS, "").trim().toLowerCase()).filter((x) => x.length > 0))].sort((a, b) => b.length - a.length);
    SYMBOL_CACHE.set(key, hit);
  }
  return hit;
}

const LETTER = /\p{L}/u;

/** Removes one of `tokens` as a whole token at the start or the end of `t` (case-insensitive). */
function stripTokenAtEnds(t: string, tokens: readonly string[]): string {
  const lower = t.toLowerCase();
  for (const tok of tokens) {
    if (lower.startsWith(tok)) {
      const next = t.charAt(tok.length);
      if (!(LETTER.test(tok.charAt(tok.length - 1)) && LETTER.test(next))) return t.slice(tok.length).trim();
    }
    if (lower.endsWith(tok)) {
      const prev = t.charAt(t.length - tok.length - 1);
      if (!(LETTER.test(tok.charAt(0)) && LETTER.test(prev))) return t.slice(0, t.length - tok.length).trim();
    }
  }
  return t;
}

/**
 * Any currency written the usual ways, at the start or end: sign runs with up to three capital
 * letters ("$", "US$", "$US", "R$", "NZ$"), a three-letter ISO code set apart from the number
 * ("SAR 500", "500 KWD"), and Arabic dotted abbreviations ("ر.س.", "د.ك.").
 */
const GENERIC_START = [/^[A-Z]{0,3}\p{Sc}+[A-Z]{0,3}/u, /^[A-Z]{3}(?=[\s\d+\-−–.,])/u, /^(?:\p{Script=Arabic}{1,3}\.)+/u];
const GENERIC_END = [/[A-Z]{0,3}\p{Sc}+[A-Z]{0,3}$/u, /(?<=[\s\d])[A-Z]{3}$/u, /(?:\p{Script=Arabic}{1,3}\.)+$/u];

function stripCurrency(t: string, tokens: readonly string[]): string {
  let cur = t.trim();
  for (let i = 0; i < 4; i++) {
    // Generic forms first, so "US$" goes whole before the explicit "$" could leave "US" behind.
    let next = cur;
    for (const re of GENERIC_START) next = next.replace(re, "").trim();
    for (const re of GENERIC_END) next = next.replace(re, "").trim();
    next = stripTokenAtEnds(next, tokens);
    if (next === cur) break;
    cur = next;
  }
  return cur;
}

const SIGN = /^[+\-−–]/;

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
 * "১.২ কোটি", "৳ 5000", "$1,250,000", "1 250 000 €", "1.250.000", "2.5m", "50k", "5万", "3 млн",
 * "١٬٢٥٠ ر.س.", and everything formatMoney writes. The currency (symbol, ISO code, Intl's symbol)
 * is ignored only as a whole token at the start or end; a sign may stand before or after it.
 * Returns whole units (halves rounded away from zero), or null when the text is not one amount.
 */
export function parseMoneyInput(s: string, o: ParseMoneyOptions = {}): Money | null {
  let t = toLatinDigits(s).replace(BIDI_MARKS, "").trim();
  let neg = false;
  let signed = false;
  const takeSign = (): boolean => {
    if (!SIGN.test(t)) return true;
    if (signed) return false;
    signed = true;
    neg = t.charAt(0) !== "+";
    t = t.slice(1).trim();
    return true;
  };
  if (!takeSign()) return null;
  t = stripCurrency(t, currencyTokens(o));
  if (!takeSign()) return null;
  // Spaces (with no-break and narrow ones), apostrophes and the Arabic thousands mark are not part of the number.
  t = t
    .replace(/[\s  '’٬]/gu, "")
    .replace(/٫/g, ".")
    .toLowerCase();
  const m = /^([\d.,]*\d[\d.,]*)(\p{L}[\p{L}\p{M}]*\.?)?$/u.exec(t);
  if (!m) return null;
  const word = m[2];
  const numText = normaliseSeparators(m[1] ?? "", word !== undefined);
  if (numText === null || !/^(\d+\.?\d*|\.\d+)$/.test(numText)) return null;
  const n = Number(numText);
  if (!Number.isFinite(n)) return null;
  let mult = 1;
  if (word !== undefined) {
    const hit = UNIT_WORDS.find(([re]) => re.test(word));
    if (!hit) return null;
    mult = hit[1];
  }
  const out = Math.round(n * mult);
  return neg && out !== 0 ? -out : out;
}

/** Taka input: the same parser, kept for existing callers. */
export function parseTakaInput(s: string): Money | null {
  return parseMoneyInput(s);
}
