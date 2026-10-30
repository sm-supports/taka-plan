import { describe, expect, it } from "vitest";
import seed from "./data/rates.seed.json";
import { createExplain, mergeExplanations } from "./explain";
import { assertSnapshot } from "./rates";

const snapshot = assertSnapshot(seed);

describe("createExplain", () => {
  it("records assumptions once, steps in order, notes de-duplicated", () => {
    const ex = createExplain(snapshot, "2026-10-30");
    expect(ex.use("deposit_insurance_limit")).toBe(200000);
    expect(ex.use("deposit_insurance_limit")).toBe(200000);
    ex.step({ id: "m1.target", inputs: { essentials: 25000, months: 10 }, raw: 250000, rounded: 250000, unit: "bdt" });
    ex.note("m1.rule.noStocks");
    ex.note("m1.rule.noStocks");
    const out = ex.done();
    expect(out.assumptions).toHaveLength(1);
    expect(out.assumptions[0]?.key).toBe("deposit_insurance_limit");
    expect(out.assumptions[0]?.stale).toBe(false);
    expect(out.steps.map((s) => s.id)).toEqual(["m1.target"]);
    expect(out.notes).toEqual(["m1.rule.noStocks"]);
  });
  it("throws MISSING_RATE for JSON-only rows via use()", () => {
    const ex = createExplain(snapshot, "2026-10-30");
    expect(() => ex.use("tax_slabs")).toThrow(/numeric/);
    expect(ex.useRow("tax_slabs").unit).toBe("json");
  });
  it("merges explanations without duplicate assumptions", () => {
    const a = createExplain(snapshot, "2026-10-30");
    a.use("inflation_cpi");
    const b = createExplain(snapshot, "2026-10-30");
    b.use("inflation_cpi");
    b.use("dps_rate");
    const m = mergeExplanations([a.done(), b.done()]);
    expect(m.assumptions.map((x) => x.key)).toEqual(["inflation_cpi", "dps_rate"]);
  });
});
