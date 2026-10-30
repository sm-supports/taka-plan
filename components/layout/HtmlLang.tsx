"use client";
/** Sets <html lang> to the active locale (the root layout is locale-agnostic). */
import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";

export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
