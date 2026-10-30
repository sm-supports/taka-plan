"use client";
/** Top bar: app name linking to the locale home, locale toggle on the right. */
import Link from "next/link";
import { useT } from "@/lib/i18n/useT";
import { LocaleSwitch } from "./LocaleSwitch";

export function Header() {
  const { t, locale } = useT();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <Link href={`/${locale}`} className="tap inline-flex items-center gap-2 rounded-xl text-lg font-bold text-brand-700">
          <svg className="h-7 w-7" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="24" height="24" rx="7" fill="currentColor" />
            <path d="M9 10h10M14 10v9M11 19h6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          {t("common.appName")}
        </Link>
        <LocaleSwitch />
      </div>
    </header>
  );
}
