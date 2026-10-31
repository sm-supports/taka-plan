"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguagePicker } from "@/components/onboarding/LanguagePicker";
import { Skeleton } from "@/components/ui/Skeleton";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

/** "/" sends a returning user straight to their locale (cookie read in the browser); a new user picks a language. */
export default function Home() {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  useEffect(() => {
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`));
    const picked = m?.[1];
    if (isLocale(picked)) router.replace(`/${picked}`);
    else setShowPicker(true);
  }, [router]);
  return showPicker ? <LanguagePicker /> : <Skeleton page />;
}
