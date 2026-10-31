/** M7 page helpers: store answers → engine input, the chart geometry, the demo and the 5-year shift. */
import { describe, expect, it } from "vitest";
import { RATES_SEED, assertSnapshot, computeRetirement } from "@taka/engine";
import { chartGeometry, tickAges } from "./chart";
import { M7_DEMO_INPUT, m7DemoResult } from "./demo";
import { buildM7Input, shiftedStart, withoutSources } from "./input";

const snapshot = assertSnapshot(RATES_SEED);
const today = "2026-10-30";

describe("buildM7Input", () => {
  it("defaults like the plan: working, profile age, essentials as spending, M1 savings", () => {
    expect(buildM7Input({}, { age: 30, essentials: 25_000, liquidSavings: 50_000 })).toEqual({ mode: "working", age: 30, monthlySpending: 25_000, savings: 50_000, monthlySaving: 0 });
  });

  it("answers win over defaults and undefined answers never wipe one", () => {
    const input = buildM7Input({ monthlySpending: 40_000, savings: undefined, retirementAge: 60 }, { age: 30, essentials: 25_000, liquidSavings: 50_000 });
    expect(input).toMatchObject({ monthlySpending: 40_000, savings: 50_000, retirementAge: 60 });
  });

  it("is null without an age", () => {
    expect(buildM7Input({ mode: "working" }, { age: null, essentials: 1, liquidSavings: 1 })).toBeNull();
  });
});

describe("PRD vector through the page input", () => {
  const input = buildM7Input({ mode: "working", retirementAge: 60, monthlySpending: 40_000, savings: 0, monthlySaving: 0 }, { age: 30, essentials: 30_000, liquidSavings: null })!;
  const r = computeRetirement(input, snapshot, today);

  it("shows about 43,600 and 73,800 a month to 80 and to 100, and runs out early", () => {
    expect(Math.abs(r.targets.contrast.monthlySaving - 43_600) / 43_600).toBeLessThan(0.01);
    expect(Math.abs(r.targets.plan.monthlySaving - 73_800) / 73_800).toBeLessThan(0.01);
    expect(r.verdict.status).toBe("red");
  });

  it("starting 5 years earlier costs less a month, later costs more; too late is null", () => {
    const earlier = shiftedStart(input, -5, snapshot, today)!;
    const later = shiftedStart(input, 5, snapshot, today)!;
    expect(earlier.targets.plan.monthlySaving).toBeLessThan(r.targets.plan.monthlySaving);
    expect(later.targets.plan.monthlySaving).toBeGreaterThan(r.targets.plan.monthlySaving);
    expect(shiftedStart({ ...input, age: 57 }, 5, snapshot, today)).toBeNull();
  });
});

describe("demo", () => {
  it("is the engine's result for the demo input, and the sources lower the target", () => {
    const r = m7DemoResult("1", snapshot, today);
    expect(r).toEqual(computeRetirement(M7_DEMO_INPUT, snapshot, today));
    const bare = computeRetirement(withoutSources(M7_DEMO_INPUT), snapshot, today);
    expect(r.targets.plan.monthlySaving).toBeLessThan(bare.targets.plan.monthlySaving);
  });

  it("has a retired variant with a withdrawal plan", () => {
    const r = m7DemoResult("retired", snapshot, today);
    expect(r.mode).toBe("retired");
    expect(r.withdrawal?.monthly).toBeGreaterThan(0);
  });
});

describe("chart geometry", () => {
  const points = [
    { age: 30, balance: 0 },
    { age: 60, balance: 1000 },
    { age: 100, balance: 0 },
  ];
  const box = { width: 340, height: 190, padX: 12, padTop: 26, padBottom: 30 };

  it("maps ages left to right, and right to left in RTL", () => {
    const ltr = chartGeometry(points, box, { rtl: false, marks: [60, 80] });
    const rtl = chartGeometry(points, box, { rtl: true, marks: [60, 80] });
    expect(ltr.x(30)).toBe(12);
    expect(ltr.x(100)).toBe(328);
    expect(rtl.x(30)).toBe(328);
    expect(rtl.x(100)).toBe(12);
    expect(ltr.max).toBe(1000);
    expect(ltr.peakAge).toBe(60);
    expect(ltr.y(1000)).toBe(26);
    expect(ltr.baseline).toBe(160);
    expect(ltr.line.startsWith("M12,160")).toBe(true);
    expect(ltr.ticks.map((t) => t.age)).toEqual([30, 60, 80, 100]);
    expect(ltr.ticks[0]!.anchor).toBe("start");
    expect(rtl.ticks[0]!.anchor).toBe("end");
  });

  it("drops age labels that would overlap, keeping both ends", () => {
    expect(tickAges(30, 100, [60, 62, 80, 98])).toEqual([30, 60, 80, 100]);
    expect(tickAges(60, 100, [60, 80])).toEqual([60, 80, 100]);
    expect(tickAges(95, 100, [96])).toEqual([95, 100]);
  });
});
