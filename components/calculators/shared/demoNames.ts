/** Localized names for the sample goals the `?demo=1` fixtures show (BN-05: demo copy follows the locale). */
import type { Locale } from "@/lib/i18n/config";

export type DemoGoalKey = "university" | "motorbike" | "wedding";

const DEMO_GOAL_NAMES: Record<Locale, Record<DemoGoalKey, string>> = {
  en: { university: "Daughter's university", motorbike: "Motorbike", wedding: "Wedding" },
  bn: { university: "মেয়ের বিশ্ববিদ্যালয়", motorbike: "মোটরবাইক", wedding: "বিয়ে" },
};

export function demoGoalName(locale: Locale, key: DemoGoalKey): string {
  return DEMO_GOAL_NAMES[locale][key];
}
