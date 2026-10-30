"use client";
/** Locale home: forwards to the plan when onboarding is done, else to the question the user was on. */
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
  const step = useTakaStore((s) => s.onboarding.step);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(completed ? `/${locale}/plan` : `/${locale}/start/${step}`);
  }, [hydrated, completed, step, locale, router]);

  return <Skeleton page />;
}
