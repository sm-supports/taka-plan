"use client";
/** /{locale}/start without a step: resume at the question the user was on. */
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useT } from "@/lib/i18n/useT";
import { useTakaStore } from "@/lib/store/store";

export default function StartIndexPage() {
  const router = useRouter();
  const { locale } = useT();
  const step = useTakaStore((s) => s.onboarding.step);

  useEffect(() => {
    router.replace(`/${locale}/start/${step}`);
  }, [step, locale, router]);

  return <Skeleton page />;
}
