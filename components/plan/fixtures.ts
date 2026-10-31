/**
 * Sample Plan for the ?demo=1 switch on /{locale}/plan (and for screenshots): the real engine run
 * over SAMPLE_PROFILES.firstJob (৳45,000 take-home, ৳28,000 essentials, ৳20,000 saved, no health
 * insurance) with two tweaks that make the screen worth looking at:
 *   - buildMonths 36 (the user slid "months to build" out) so the emergency fund does not
 *     swallow the whole ৳9,000 budget and the goals get a share;
 *   - a second goal, a wedding (৳6,00,000 in 4 years), so there are three cards.
 * Goal names follow the locale. The emergency fund (0.7 of 8 months covered) is the one red card;
 * the goals are green (their chosen instruments beat the inflation each goal is priced with).
 * The profile's asset-mix answers (M6, growth) ride along as plan.allocation; both goals are
 * under 5 years away, so neither is priced at the mix and no money is left for a future bucket.
 */
import { assertSnapshot, computePlan, RATES_SEED, SAMPLE_PROFILES, type ISODate, type Plan, type PlanInput, type RatesSnapshot } from "@taka/engine";
import type { Locale } from "@/lib/i18n/config";
import { demoGoalName } from "@/components/calculators/shared/demoNames";

export const DEMO_TODAY: ISODate = "2026-10-30";
/** The user slid "months to build" out to three years. */
export const DEMO_BUILD_MONTHS = 36;

let seed: RatesSnapshot | null = null;
function seedSnapshot(): RatesSnapshot {
  seed ??= assertSnapshot(RATES_SEED);
  return seed;
}

export function samplePlanInput(locale: Locale): PlanInput {
  const first = SAMPLE_PROFILES.firstJob;
  const bike = first.m5?.goals[0];
  return {
    profile: first.profile,
    m1: { ...first.m1, buildMonths: DEMO_BUILD_MONTHS },
    m4: first.m4,
    ...(first.m6 ? { m6: first.m6 } : {}),
    m5: {
      age: first.profile.age,
      goals: [
        { id: bike?.id ?? "g-bike", name: demoGoalName(locale, "motorbike"), cost: bike?.cost ?? 250000, years: bike?.years ?? 2, type: bike?.type ?? "vehicle" },
        { id: "g-wedding", name: demoGoalName(locale, "wedding"), cost: 600000, years: 4, type: "wedding" },
      ],
    },
  };
}

/** The demo plan computed by the engine; defaults to the bundled seed so tests and screenshots are stable. */
export function samplePlan(locale: Locale, rates: RatesSnapshot = seedSnapshot(), today: ISODate = DEMO_TODAY): Plan {
  return computePlan(samplePlanInput(locale), rates, today);
}
