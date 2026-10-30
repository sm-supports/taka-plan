"use client";
/**
 * First-open language pick: two very large buttons. Lives outside the [locale] segment, so no
 * dictionary is loaded here and both languages' copy is inlined. Picking a language writes the
 * tp_locale cookie, updates the store and opens the first onboarding question.
 */
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { useTakaStore } from "@/lib/store/store";

const ONE_YEAR = 60 * 60 * 24 * 365;

const COPY: Record<Locale, { label: string; choose: string; change: string; intro: string; disclaimer: string }> = {
  bn: {
    label: "বাংলা",
    choose: "ভাষা বেছে নিন",
    change: "পরে যেকোনো সময় বদলাতে পারবেন।",
    intro: "পাঁচটি ছোট প্রশ্ন, তারপরই আপনার মাসিক সঞ্চয়ের প্ল্যান। কোনো অ্যাকাউন্ট লাগবে না।",
    disclaimer: "শুধু শেখার জন্য অনুমান; আর্থিক, কর বা আইনি পরামর্শ নয়।",
  },
  en: {
    label: "English",
    choose: "Choose your language",
    change: "You can change it any time.",
    intro: "Five quick questions, then your monthly savings plan. No account needed.",
    disclaimer: "Estimates for education only; not financial, tax or legal advice.",
  },
};

export function LanguagePicker() {
  const router = useRouter();
  const setLocale = useTakaStore((s) => s.setLocale);
  const [busy, setBusy] = useState<Locale | null>(null);

  useEffect(() => {
    router.prefetch("/bn/start/1");
    router.prefetch("/en/start/1");
  }, [router]);

  const pick = useCallback(
    (locale: Locale) => {
      if (busy) return;
      setBusy(locale);
      document.cookie = `${LOCALE_COOKIE}=${locale}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
      setLocale(locale);
      router.push(`/${locale}/start/1`);
    },
    [busy, router, setLocale],
  );

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="text-center">
        <svg className="mx-auto h-16 w-16 text-brand-600" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="7" fill="currentColor" />
          <path d="M9 10h10M14 10v9M11 19h6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <h1 className="mt-4 text-3xl font-bold text-brand-700">Taka Plan</h1>
        <p className="mt-3 text-lg font-semibold text-text" lang="bn">
          {COPY.bn.choose}
        </p>
        <p className="text-base text-text-muted" lang="en">
          {COPY.en.choose}
        </p>
        <p className="mt-2 text-sm text-text-faint">
          <span lang="bn">{COPY.bn.change}</span> <span lang="en">{COPY.en.change}</span>
        </p>
      </div>
      <div className="mt-10 flex flex-col gap-4" role="group" aria-label={`${COPY.bn.choose} / ${COPY.en.choose}`}>
        <button
          type="button"
          lang="bn"
          onClick={() => pick("bn")}
          disabled={busy !== null}
          aria-busy={busy === "bn" || undefined}
          className="tap min-h-20 w-full rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-md transition-colors hover:bg-brand-700 active:bg-brand-900 disabled:opacity-70"
        >
          {COPY.bn.label}
        </button>
        <button
          type="button"
          lang="en"
          onClick={() => pick("en")}
          disabled={busy !== null}
          aria-busy={busy === "en" || undefined}
          className="tap min-h-20 w-full rounded-2xl border-2 border-brand-600 bg-surface text-2xl font-bold text-brand-700 shadow-sm transition-colors hover:bg-brand-50 active:bg-brand-100 disabled:opacity-70"
        >
          {COPY.en.label}
        </button>
      </div>
      <p className="mt-8 text-center text-sm leading-relaxed text-text-muted">
        <span lang="bn">{COPY.bn.intro}</span>
        <br />
        <span lang="en">{COPY.en.intro}</span>
      </p>
      <p className="mt-6 text-center text-xs leading-relaxed text-text-faint">
        <span lang="bn">{COPY.bn.disclaimer}</span>
        <br />
        <span lang="en">{COPY.en.disclaimer}</span>
      </p>
    </main>
  );
}
