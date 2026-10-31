"use client";
/** Sets <html lang> and <html dir> to the active locale (the root layout is locale-agnostic). */
import { useEffect } from "react";
import { LOCALE_META, type Locale } from "@/lib/i18n/config";

export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    const meta = LOCALE_META[locale];
    document.documentElement.lang = meta.tag;
    document.documentElement.dir = meta.dir;
  }, [locale]);
  return null;
}
