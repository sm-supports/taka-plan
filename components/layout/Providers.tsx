"use client";
/** Client provider stack for a locale segment: i18n → rates → hydration gate. */
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/provider";
import type { Dictionary } from "@/lib/i18n/types";
import { RatesProvider } from "@/lib/rates/provider";
import { HydrationGate } from "./HydrationGate";

export interface ProvidersProps {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}

export function Providers({ locale, dict, children }: ProvidersProps) {
  return (
    <I18nProvider locale={locale} dict={dict}>
      <RatesProvider>
        <HydrationGate>{children}</HydrationGate>
      </RatesProvider>
    </I18nProvider>
  );
}
