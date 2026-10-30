"use client";
/** First-open language pick: two very large buttons; bilingual copy is inlined because no dictionary is loaded at "/". */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { useTakaStore } from "@/lib/store/store";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function LanguagePicker() {
  const router = useRouter();
  const setLocale = useTakaStore((s) => s.setLocale);
  const [busy, setBusy] = useState<Locale | null>(null);

  const pick = (locale: Locale) => {
    setBusy(locale);
    document.cookie = `${LOCALE_COOKIE}=${locale}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
    setLocale(locale);
    router.push(`/${locale}/start/1`);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="text-center">
        <svg className="mx-auto h-16 w-16 text-brand-600" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="7" fill="currentColor" />
          <path d="M9 10h10M14 10v9M11 19h6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <h1 className="mt-4 text-3xl font-bold text-brand-700">Taka Plan</h1>
        <p className="mt-3 text-lg font-semibold text-text" lang="bn">
          ভাষা বেছে নিন
        </p>
        <p className="text-base text-text-muted" lang="en">
          Choose your language
        </p>
        <p className="mt-2 text-sm text-text-faint">
          <span lang="bn">পরে যেকোনো সময় বদলাতে পারবেন।</span> <span lang="en">You can change it any time.</span>
        </p>
      </div>
      <div className="mt-10 flex flex-col gap-4">
        <button
          type="button"
          lang="bn"
          onClick={() => pick("bn")}
          disabled={busy !== null}
          aria-busy={busy === "bn" || undefined}
          className="tap min-h-20 w-full rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-md hover:bg-brand-700 active:bg-brand-900 disabled:opacity-70"
        >
          বাংলা
        </button>
        <button
          type="button"
          lang="en"
          onClick={() => pick("en")}
          disabled={busy !== null}
          aria-busy={busy === "en" || undefined}
          className="tap min-h-20 w-full rounded-2xl border-2 border-brand-600 bg-surface text-2xl font-bold text-brand-700 shadow-sm hover:bg-brand-50 active:bg-brand-100 disabled:opacity-70"
        >
          English
        </button>
      </div>
      <p className="mt-10 text-center text-xs leading-relaxed text-text-faint">
        <span lang="bn">শুধু শেখার জন্য অনুমান; আর্থিক, কর বা আইনি পরামর্শ নয়।</span>
        <br />
        <span lang="en">Estimates for education only; not financial, tax or legal advice.</span>
      </p>
    </main>
  );
}
