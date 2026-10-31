/**
 * Display-time clean-up of names that come from data, not the dictionary: rates-table source names,
 * institution names and captions. In Bangla the Bangladesh institutions get their Bangla names,
 * "(our assumption)" / "(complaints)" are translated and Latin digits become Bangla digits; sources
 * that point into our own docs/ read "Taka Plan (our assumption)" in every language.
 */
import { toBanglaDigits } from "@taka/engine";

/** Bangla names of the Bangladesh institutions the country data names in English (longest first when matching). */
const BN_NAMES: Record<string, string> = {
  "Insurance Development and Regulatory Authority": "বীমা উন্নয়ন ও নিয়ন্ত্রণ কর্তৃপক্ষ",
  "Universal Pension Scheme": "সর্বজনীন পেনশন স্কিম",
  "National Pension Authority": "জাতীয় পেনশন কর্তৃপক্ষ",
  "Department of Social Services": "সমাজসেবা অধিদফতর",
  "Directorate General of Health Services": "স্বাস্থ্য অধিদপ্তর",
  "Deposit protection funds": "আমানত সুরক্ষা তহবিল",
  "Bangladesh Bureau of Statistics": "বাংলাদেশ পরিসংখ্যান ব্যুরো",
  "Bangladesh Bank auctions": "বাংলাদেশ ব্যাংকের নিলাম",
  "Bangladesh Bank": "বাংলাদেশ ব্যাংক",
  "National Savings Directorate": "জাতীয় সঞ্চয় অধিদপ্তর",
  "Taka Plan": "টাকা প্ল্যান",
  "life table": "জীবন সারণি",
  "projection": "প্রক্ষেপণ",
};

/** Bracketed English qualifiers that have a Bangla equivalent. */
const BN_QUALIFIERS: Record<string, string> = {
  "our assumption": "আমাদের অনুমান",
  complaints: "অভিযোগ",
  "old-age allowance": "বয়স্ক ভাতা",
  "public hospitals": "সরকারি হাসপাতাল",
  IDRA: "আইডিআরএ",
};

const MONTHS_BN: Record<string, string> = {
  Jan: "জানুয়ারি",
  Feb: "ফেব্রুয়ারি",
  Mar: "মার্চ",
  Apr: "এপ্রিল",
  May: "মে",
  Jun: "জুন",
  Jul: "জুলাই",
  Aug: "আগস্ট",
  Sep: "সেপ্টেম্বর",
  Oct: "অক্টোবর",
  Nov: "নভেম্বর",
  Dec: "ডিসেম্বর",
};

const ESCAPE = /[.*+?^${}()|[\]\\]/g;
const NAME_PATTERN = new RegExp(
  Object.keys(BN_NAMES)
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(ESCAPE, "\\$&"))
    .join("|"),
  "g",
);

/** True for a source that is one of our own documents ("docs/PRD.md#…"), i.e. an assumption we made. */
export function isOwnDocSource(url: string | null | undefined): boolean {
  return typeof url === "string" && /^\/?docs\//.test(url.trim());
}

/** A data-supplied name or caption, made fit for the page language. */
export function localizeName(text: string, locale: string): string {
  if (locale !== "bn" || !text) return text;
  let out = text.replace(NAME_PATTERN, (m) => BN_NAMES[m] ?? m);
  out = out.replace(/\(([^)]+)\)/g, (whole, inner: string) => {
    const q = BN_QUALIFIERS[inner.trim()];
    return q ? `(${q})` : whole;
  });
  out = out.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (m) => MONTHS_BN[m] ?? m);
  return toBanglaDigits(out);
}

/**
 * The source name shown under a rates-table row: our own docs read "Taka Plan (our assumption)"
 * (never a PRD file name), anything else is localised for the page language.
 */
export function sourceLabel(sourceName: string, sourceUrl: string, locale: string, ours: string): string {
  if (isOwnDocSource(sourceUrl)) return ours;
  return localizeName(sourceName, locale);
}
