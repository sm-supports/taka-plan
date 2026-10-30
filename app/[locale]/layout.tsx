import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HtmlLang } from "@/components/layout/HtmlLang";
import { Providers } from "@/components/layout/Providers";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/server";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/** Locale segment: validates the locale, loads its dictionary and mounts the client provider stack. */
export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  return (
    <Providers locale={locale} dict={dict}>
      <HtmlLang locale={locale} />
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
