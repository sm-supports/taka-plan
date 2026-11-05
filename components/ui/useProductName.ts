"use client";
/**
 * The selected country's name for a product slot, so shared copy can say "{product}" instead of a
 * Bangladesh product name (CD5). Bangla copy keeps the glossary names in the bn dictionary. English
 * uses the country's English product name when the country data has one; a UI language that is the
 * country's main language uses the country's local name; any other language uses the translated
 * generic term from the dictionary (common.instrument.* for labels, common.productProse.* in prose),
 * so no English name ever lands inside a translated sentence.
 */
import type { Instrument } from "@taka/engine";
import { useCountry } from "@/lib/country/useCountry";
import { bangladeshEn } from "@/lib/i18n/dictionaries/en/bangladesh";
import { useT } from "@/lib/i18n/useT";

/**
 * A country product name made to sit inside a sentence: a trailing explanation in brackets is dropped
 * ("DPS (deposit pension scheme)" → "DPS") and a plain capitalised noun is lower-cased
 * ("Fixed deposit" → "fixed deposit"), while proper names ("National Savings Certificate") and
 * acronyms ("FDR") keep their capitals.
 */
export function proseForm(name: string): string {
  const bare = name.replace(/\s*\([^)]*\)\s*$/, "").trim() || name.trim();
  const rest = bare.slice(1);
  if (/^[A-Z]/.test(bare) && !/[A-Z]/.test(rest)) return bare.charAt(0).toLowerCase() + rest;
  return bare;
}

export interface ProductNames {
  /** Name for a label or card heading ("Where: …"). */
  label: (slot: Instrument) => string;
  /** Name for use inside a sentence ("… that sells {product}"). */
  prose: (slot: Instrument) => string;
}

export function useProductName(): ProductNames {
  const { t, locale } = useT();
  const { context, profile } = useCountry();
  const mainLanguage = profile?.languages?.[0];
  const english = (slot: Instrument): string | null => {
    if (locale === "bn") return null;
    const names = context.instrumentNames?.[slot];
    if (!names) return null;
    if (locale === "en") return names.en ?? null;
    // The country's own name only when the UI speaks the country's main language.
    return locale === mainLanguage ? (names.local ?? null) : null;
  };
  return {
    // Bangladesh labels stay "3-month FDR", "DPS" and the dictionary's "5-year treasury bond", which are
    // more precise than the country file's; only the savings-certificate slot takes the local name.
    label: (slot) => {
      if (context.code !== "BD") return english(slot) ?? t(`common.instrument.${slot}`);
      const known = locale === "en" ? (bangladeshEn.instrument as Partial<Record<Instrument, string>>)[slot] : undefined;
      return known ?? (slot === "sanchayapatra_5y" ? english(slot) : null) ?? t(`common.instrument.${slot}`);
    },
    prose: (slot) => {
      const en = english(slot);
      return en ? proseForm(en) : t(`common.productProse.${slot}`);
    },
  };
}
