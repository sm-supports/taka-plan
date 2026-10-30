"use client";

// Written with createElement rather than JSX so the pure `lib` vitest project (no JSX transform)
// can import useT/useFormat, which depend on this context.
import { createContext, createElement, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./types";

export interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}

/** Wrap the app (per request) with the locale and the one dictionary loaded by getDictionary(). */
export function I18nProvider({ locale, dict, children }: I18nProviderProps) {
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);
  return createElement(I18nContext.Provider, { value }, children);
}

/** The raw context; throws when used outside I18nProvider so the mistake is loud. */
export function useI18nContext(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18nContext must be used inside <I18nProvider>");
  return ctx;
}
