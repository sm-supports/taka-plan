"use client";
/** Locale home: forwards to the plan when onboarding is done, else to the first question. */
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useT } from "@/lib/i18n/useT";
import { useHydrated, useTakaStore } from "@/lib/store/store";

export default function LocaleHome() {
  const router = useRouter();
  const { locale } = useT();
  const hydrated = useHydrated();
  const completed = useTakaStore((s) => s.onboarding.completed);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(completed ? `/${locale}/plan` : `/${locale}/start/1`);
  }, [hydrated, completed, locale, router]);

  return <Skeleton page />;
}
