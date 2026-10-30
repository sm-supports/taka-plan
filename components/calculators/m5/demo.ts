/**
 * `?demo=1` fixture for the M5 page: a long education goal and a short vehicle goal (which loses to
 * inflation in a DPS), run through the real engine on the current rates snapshot. Goal names follow
 * the locale.
 */
import { computeGoals, type ISODate, type M5Input, type M5Result, type RatesSnapshot } from "@taka/engine";
import type { Locale } from "@/lib/i18n/config";
import { demoGoalName } from "../shared/demoNames";

export function demoM5Input(locale: Locale): M5Input {
  return {
    age: 36,
    goals: [
      { id: "demo-g1", name: demoGoalName(locale, "university"), cost: 1500000, years: 10, type: "education" },
      { id: "demo-g2", name: demoGoalName(locale, "motorbike"), cost: 250000, years: 2, type: "vehicle" },
    ],
  };
}

export function buildDemoM5Result(input: M5Input, s: RatesSnapshot, today: ISODate): M5Result {
  return computeGoals(input, s, today);
}
