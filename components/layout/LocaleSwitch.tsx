"use client";
/** bn/en toggle: writes the tp_locale cookie, updates the store and swaps the URL's locale segment. */
import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function setLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
}

export function LocaleSwitch() {
  const { t, locale } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const setLocale = useTakaStore((s) => s.setLocale);
  const next: Locale = locale === "bn" ? "en" : "bn";
  const nextLabel = t(`common.language.${next}`);

  const onClick = () => {
    setLocaleCookie(next);
    setLocale(next);
    const path = (pathname || "/").replace(/^\/(bn|en)(?=\/|$)/, `/${next}`);
    router.replace(path + window.location.search);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      lang={next}
      aria-label={nextLabel}
      className="tap inline-flex shrink-0 items-center justify-center rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-text hover:bg-surface-muted"
    >
      {nextLabel}
    </button>
  );
}
