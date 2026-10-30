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

export function formatTaka(n: Money, o: FormatTakaOptions): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  let body: string;
  if (o.compact && abs >= LAKH) {
    const isCrore = abs >= CRORE;
    const v = abs / (isCrore ? CRORE : LAKH);
    const num = (Math.round(v * 10) / 10).toFixed(1);
    const unit = o.digits === "bn" ? (isCrore ? "কোটি" : "লাখ") : isCrore ? "crore" : "lakh";
    body = `${localiseDigits(num, o.digits)} ${unit}`;
  } else {
    body = localiseDigits(groupIndian(abs), o.digits);
  }
  const sign = neg ? "−" : o.sign ? "+" : "";
  return `${sign}৳${body}`;
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

/**
 * Parse user-typed taka: "12,50,000", "১২৫০০০", "12.5 lakh", "১.২ কোটি", "৳ 5000".
 * Returns whole taka, or null when nothing numeric is present.
 */
export function parseTakaInput(s: string): Money | null {
  const t = fromBanglaDigits(s).toLowerCase().replace(/[৳,\s]/g, "");
  const m = /^([+-]?\d*\.?\d+)(lakh|lac|lakhs|লাখ|লক্ষ|crore|cr|কোটি|k|thousand|হাজার)?$/.exec(t);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2];
  const mult = !unit ? 1 : /^(lakh|lac|lakhs|লাখ|লক্ষ)$/.test(unit) ? LAKH : /^(crore|cr|কোটি)$/.test(unit) ? CRORE : 1000;
  return Math.round(n * mult);
}
