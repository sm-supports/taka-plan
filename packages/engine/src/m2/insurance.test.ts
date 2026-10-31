import { describe, expect, it, test } from "vitest";
import seed from "../data/rates.seed.json";
import { withCountry } from "../country/overlay";
import { FIXTURE_US } from "../fixtures/countries";
import { EngineError } from "../types";
import { assertSnapshot, type RateKey, type RatesSnapshot } from "../rates";
import { annuityDueFV, annuityDuePV, bandFor, computeInsurance, growingAnnuityPV, policyIrr } from "./insurance";
import { M2_CHECK_KEYS, M2_NOTE_KEYS, M2_STEP_IDS, type M2Input } from "./types";

const rates = assertSnapshot(seed);
const today = "2026-10-30";

/*
 * Seed values used below (rates.seed.json):
 *   insurance_income_share 0.7, insurance_cover_to_age 60, insurance_child_independent_age 22,
 *   inflation_projection 0.08, fixed_income_return_base 0.085 (after tax) → real safe return
 *   ρ = 1.085 / 1.08 − 1 = 0.0046296; annuity-due factor for 30 years = (1 − 1.0046296^−30) / ρ × 1.0046296 = 28.0790,
 *   fdr_1y_rate 0.075, tax_bank_interest 0.10 → policy-check rate 0.075 × 0.9 = 0.0675,
 *   health_hospitalisation_cost 300 000, oop_health_share 0.793, health_public_cover_floor 0.3,
 *   health_cover_weights { self 1, partner 1, child 0.5, parent 1.5 },
 *   term table per 1 000: ≤30 2–4, ≤40 3–6, ≤50 6–12, ≤65 12–25, smoker × 1.6,
 *   health table per 100 000: ≤35 1 500–3 000, ≤50 2 500–5 000, ≤65 5 000–10 000, ≤120 9 000–18 000,
 *   life_claim_settlement_rate 0.57.
 * Taka rounding: lump ৳500, monthly ৳100, exact ৳1.
 *
 * perStay = 300 000 × max(0.3, 0.793) = 237 900 → ৳238 000 (lump).
 */

const POLICY_STEPS = ["m2.policyTerm", "m2.policyInvest", "m2.policyIrr"];
const BASE_STEPS = M2_STEP_IDS.filter((id) => !POLICY_STEPS.includes(id));

/** Age 30, partner + one child, ৳50 000 a month, nothing saved or held. */
const v1: M2Input = {
  age: 30,
  dependents: ["partner", "children"],
  takeHome: 50000,
  smoker: false,
  liquidSavings: 0,
  existingLifeCover: 0,
  debts: 0,
  educationGoals: 0,
  existingHealthCover: 0,
};

function withJson(s: RatesSnapshot, key: RateKey, valueJson: unknown): RatesSnapshot {
  return { ...s, rows: { ...s.rows, [key]: { ...s.rows[key], valueJson } } };
}

function expectInvalid(fn: () => unknown): void {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(EngineError);
    expect((e as EngineError).code).toBe("INVALID_INPUT");
    return;
  }
  throw new Error("expected INVALID_INPUT");
}

describe("helpers", () => {
  it("growingAnnuityPV: r = g uses payment × years / (1 + r)", () => {
    // 1 000 × 10 / 1.05 = 9 523.81
    expect(growingAnnuityPV(1000, 0.05, 0.05, 10)).toBeCloseTo(9523.81, 2);
    expect(growingAnnuityPV(1000, 0.05, 0.03, 0)).toBe(0);
  });

  it("growingAnnuityPV with g = 0 is the level annuity", () => {
    // 1 000 × (1 − 1.1^−3) / 0.1 = 2 486.85
    expect(growingAnnuityPV(1000, 0.1, 0, 3)).toBeCloseTo(2486.85, 2);
  });

  it("annuityDuePV: 100 now and 100 in a year at 10% → 100 + 90.91 = 190.91; r = 0 → payment × years", () => {
    expect(annuityDuePV(100, 0.1, 2)).toBeCloseTo(190.909, 3);
    expect(annuityDuePV(100, 0, 5)).toBe(500);
    expect(annuityDuePV(100, 0.1, 0)).toBe(0);
  });

  it("annuityDueFV: 100 a year for 2 years at 10% → 100 × 1.1 + 100 × 1.21 = 231", () => {
    expect(annuityDueFV(100, 0.1, 2)).toBeCloseTo(231, 9);
    expect(annuityDueFV(100, 0, 5)).toBe(500);
  });

  it("policyIrr: 10 000 a year for 10 years (start of year) against 120 000 at the end → ≈ 3.29%", () => {
    // Solve 10 000 × ((1+i)^10 − 1)/i × (1+i) = 120 000: i = 3.25% gives 119 740, 3.30% gives 120 070.
    expect(policyIrr(10000, 10, 120000)).toBeCloseTo(0.032894, 5);
    // Getting back exactly what was paid in → 0%.
    expect(policyIrr(10000, 10, 100000)).toBeCloseTo(0, 9);
    // Nothing back → −100%; nothing paid → 0.
    expect(policyIrr(10000, 10, 0)).toBe(-1);
    expect(policyIrr(0, 10, 0)).toBe(0);
    // Marginal IRR: giving up a surrender value of 30 000 now plus 10 000 a year for 6 years against
    // 120 000: 6.70%; without the surrender value the same stream looks like 20.2%.
    expect(policyIrr(10000, 6, 120000, 30000)).toBeCloseTo(0.06696, 4);
    expect(policyIrr(10000, 6, 120000)).toBeCloseTo(0.2021, 4);
  });

  it("bandFor picks the first band with maxAge ≥ age, else the last", () => {
    const bands = [
      { maxAge: 30, low: 1, high: 2 },
      { maxAge: 40, low: 3, high: 4 },
    ];
    expect(bandFor(bands, 30).low).toBe(1);
    expect(bandFor(bands, 31).low).toBe(3);
    expect(bandFor(bands, 99).low).toBe(3);
  });
});

describe("computeInsurance: vector 1 (age 30, partner + child, ৳50 000, nothing held)", () => {
  const r = computeInsurance(v1, rates, today);

  it("life cover", () => {
    // years = 60 − 30 = 30 (the youngest child's age is not given, so cover runs to 60)
    // yearly need = 50 000 × 12 × 0.7 = 420 000
    // PV = 420 000 × 28.0790 = 11 793 176.9 → ৳11 793 000  (was 14 045 000 with the growing annuity at the FDR rate)
    expect(r.life.needed).toBe(true);
    expect(r.life.yearsCovered).toBe(30);
    expect(r.life.incomeNeed).toBe(11793000);
    expect(r.life.cover).toBe(11793000);
    expect(r.life.gap).toBe(11793000);
    // 11 793 000 / 600 000 = 19.7 (outside 10–15 → note)
    expect(r.life.incomeMultiple).toBe(19.7);
    // 11 793 000 / 1 000 × 2 = 23 586 → 23 600; × 4 = 47 172 → 47 200
    expect(r.life.premiumYearly).toEqual({ low: 23600, high: 47200 });
    expect(r.life.status).toBe("red");
  });

  it("youngest child's age: cover runs until that child is 22 when that comes first", () => {
    // youngest 5 → 22 − 5 = 17 years < 30: 420 000 × annuity-due factor(ρ, 17) = 6 882 742.6 → ৳6 882 500 (11.5×, inside the band)
    const kid = computeInsurance({ ...v1, youngestChildAge: 5 }, rates, today);
    expect(kid.life.yearsCovered).toBe(17);
    expect(kid.life.incomeNeed).toBe(6882500);
    expect(kid.life.incomeMultiple).toBe(11.5);
    expect(kid.notes).not.toContain("m2.note.multipleOutsideBand");
    expect(kid.explain.steps[0]).toMatchObject({ id: "m2.years", raw: 17, rounded: 17, inputs: { youngestChildAgeYears: 5, childIndependentAgeYears: 22 } });
    // A grown-up youngest child → no years of income to replace.
    expect(computeInsurance({ ...v1, youngestChildAge: 25 }, rates, today).life.incomeNeed).toBe(0);
    // Without children among the dependents the child's age is ignored.
    expect(computeInsurance({ ...v1, dependents: ["partner"], youngestChildAge: 5 }, rates, today).life.yearsCovered).toBe(30);
  });

  it("health cover", () => {
    // people: self, partner, 1 child; Σ weights = 1 + 1 + 0.5 = 2.5; target = 238 000 × 2.5 = 595 000
    expect(r.health.people).toBe(3);
    expect(r.health.perStay).toBe(238000);
    expect(r.health.target).toBe(595000);
    expect(r.health.gap).toBe(595000);
    // all three in the ≤35 band: 5.95 × 1 500 = 8 925 → 8 900; 5.95 × 3 000 = 17 850 → 17 900
    expect(r.health.premiumYearly).toEqual({ low: 8900, high: 17900 });
    expect(r.health.status).toBe("red");
  });

  it("monthly premium need and overall", () => {
    // life mid = 11 793 × 3 = 35 379; health mid = (8 925 + 17 850) / 2 = 13 387.5
    // (35 379 + 13 387.5) / 12 = 4 063.9 → ৳4 100
    expect(r.monthlyPremiumNeed).toBe(4100);
    expect(r.hasHealthCover).toBe(false);
    expect(r.status).toBe("red");
    expect(r.policyCheck).toBeUndefined();
    expect(r.notes).toEqual(["m2.note.multipleOutsideBand", "m2.note.premiumIndicative"]);
  });

  it("explain: one step per id in order, no policy steps", () => {
    expect(r.explain.steps.map((s) => s.id)).toEqual(BASE_STEPS);
    const incomeNeed = r.explain.steps.find((s) => s.id === "m2.incomeNeed");
    expect(incomeNeed?.raw).toBeCloseTo(11793176.86, 1);
    expect(incomeNeed?.rounded).toBe(11793000);
    expect(incomeNeed?.inputs).toMatchObject({ takeHome: 50000, incomeShare: 0.7, yearlyNeed: 420000, inflation: 0.08, afterTax: 0.085, coveredYears: 30 });
    expect(incomeNeed?.inputs.realRate).toBeCloseTo(0.0046296, 6);
    for (const s of r.explain.steps) {
      for (const v of Object.values(s.inputs)) if (typeof v === "number") expect(Number.isFinite(v)).toBe(true);
    }
  });

  it("records every rate row used", () => {
    expect(r.explain.assumptions.map((a) => a.key).sort()).toEqual(
      [
        "insurance_cover_to_age",
        "insurance_child_independent_age",
        "insurance_income_share",
        "inflation_projection",
        "fixed_income_return_base",
        "health_hospitalisation_cost",
        "oop_health_share",
        "health_public_cover_floor",
        "health_cover_weights",
        "insurance_term_premium_table",
        "health_premium_table",
        "life_claim_settlement_rate",
      ].sort(),
    );
  });

  it("user-set coverToAge and incomeShare are not recorded as assumptions", () => {
    const own = computeInsurance({ ...v1, coverToAge: 60, incomeShare: 0.7 }, rates, today);
    const keys = own.explain.assumptions.map((a) => a.key);
    expect(keys).not.toContain("insurance_cover_to_age");
    expect(keys).not.toContain("insurance_income_share");
    expect(own.life.incomeNeed).toBe(11793000);
  });

  it("checklist covers every check key with the claim settlement rate and regulator link", () => {
    expect(r.checklist.map((c) => c.key)).toEqual([...M2_CHECK_KEYS]);
    for (const c of r.checklist) expect(c.params).toEqual({ claimSettlement: 0.57, regulatorUrl: "" });
  });

  it("every note is a declared key", () => {
    for (const n of r.notes) expect(M2_NOTE_KEYS).toContain(n);
  });
});

describe("computeInsurance: other vectors", () => {
  it("smoker: life premiums × 1.6", () => {
    const r = computeInsurance({ ...v1, smoker: true }, rates, today);
    // 11 793 × 2 × 1.6 = 37 737.6 → 37 700; 11 793 × 4 × 1.6 = 75 475.2 → 75 500
    expect(r.life.premiumYearly).toEqual({ low: 37700, high: 75500 });
    // (35 379 × 1.6 + 13 387.5) / 12 = (56 606.4 + 13 387.5) / 12 = 5 832.8 → ৳5 800
    expect(r.monthlyPremiumNeed).toBe(5800);
    expect(r.explain.steps.find((s) => s.id === "m2.lifePremium")?.inputs.smokerMultipleCount).toBe(1.6);
  });

  it("no dependents and no debts: no life cover needed, health for self only", () => {
    const r = computeInsurance({ ...v1, age: 25, dependents: [], takeHome: 40000 }, rates, today);
    expect(r.life.needed).toBe(false);
    expect(r.life.incomeNeed).toBe(0);
    expect(r.life.cover).toBe(0);
    expect(r.life.gap).toBe(0);
    expect(r.life.premiumYearly).toEqual({ low: 0, high: 0 });
    expect(r.life.status).toBe("green");
    // self only: target 238 000; 2.38 × 1 500 = 3 570 → 3 600; 2.38 × 3 000 = 7 140 → 7 100
    expect(r.health.people).toBe(1);
    expect(r.health.target).toBe(238000);
    expect(r.health.premiumYearly).toEqual({ low: 3600, high: 7100 });
    // monthly = 5 355 / 12 = 446.25 → ৳400
    expect(r.monthlyPremiumNeed).toBe(400);
    expect(r.status).toBe("red");
    expect(r.notes).toEqual(["m2.note.noDependents", "m2.note.premiumIndicative"]);
    expect(r.explain.steps.map((s) => s.id)).toEqual(BASE_STEPS);
  });

  it("debts only: cover = debts − savings, no income replacement", () => {
    const r = computeInsurance(
      { ...v1, age: 40, dependents: [], takeHome: 60000, debts: 500000, liquidSavings: 100000, existingHealthCover: 200000 },
      rates,
      today,
    );
    // cover = 0 + 500 000 + 0 − 100 000 − 0 = 400 000; gap 400 000 > 50% → red
    expect(r.life.needed).toBe(true);
    expect(r.life.incomeNeed).toBe(0);
    expect(r.life.cover).toBe(400000);
    expect(r.life.gap).toBe(400000);
    expect(r.life.status).toBe("red");
    // age 40 → band ≤40: 400 × 3 = 1 200, 400 × 6 = 2 400
    expect(r.life.premiumYearly).toEqual({ low: 1200, high: 2400 });
    // health: self, target 238 000 − 200 000 held = 38 000 gap (≤ 119 000) → amber
    expect(r.health.gap).toBe(38000);
    expect(r.health.status).toBe("amber");
    // age 40 → band ≤50: 0.38 × 2 500 = 950 → 1 000, 0.38 × 5 000 = 1 900
    expect(r.health.premiumYearly).toEqual({ low: 1000, high: 1900 });
    // (1 800 + 1 425) / 12 = 268.75 → ৳300
    expect(r.monthlyPremiumNeed).toBe(300);
    expect(r.hasHealthCover).toBe(true);
    expect(r.status).toBe("red");
    expect(r.notes).toEqual(["m2.note.debtsOnly", "m2.note.premiumIndicative"]);
  });

  it("savings and goals feed the cover; status amber and green by gap", () => {
    // cover = 11 793 000 + 200 000 debts + 1 000 000 education − 500 000 saved − 245 000 invested = 12 248 000
    const base = { ...v1, debts: 200000, educationGoals: 1000000, liquidSavings: 500000, investments: 245000 };
    const r = computeInsurance(base, rates, today);
    expect(r.life.cover).toBe(12248000);
    // 10 000 000 held → gap 2 248 000 ≤ 6 124 000 → amber
    expect(computeInsurance({ ...base, existingLifeCover: 10000000 }, rates, today).life).toMatchObject({ gap: 2248000, status: "amber" });
    // more held than needed → gap 0, green; health fully held → green overall
    const covered = computeInsurance({ ...base, existingLifeCover: 20000000, existingHealthCover: 600000 }, rates, today);
    expect(covered.life).toMatchObject({ gap: 0, status: "green", premiumYearly: { low: 0, high: 0 } });
    expect(covered.health).toMatchObject({ gap: 0, status: "green", premiumYearly: { low: 0, high: 0 } });
    expect(covered.monthlyPremiumNeed).toBe(0);
    expect(covered.status).toBe("green");
  });

  it("savings larger than the need floor the cover at 0", () => {
    const r = computeInsurance({ ...v1, liquidSavings: 20000000 }, rates, today);
    expect(r.life).toMatchObject({ needed: true, cover: 0, gap: 0, status: "green" });
  });

  it("coverToAge at or below age → 0 years, no income need", () => {
    const r = computeInsurance({ ...v1, age: 62 }, rates, today);
    expect(r.life.yearsCovered).toBe(0);
    expect(r.life.incomeNeed).toBe(0);
    expect(r.explain.steps[0]).toMatchObject({ id: "m2.years", raw: -2, rounded: 0, unit: "years" });
  });

  it("default counts: 1 child and 2 parents; explicit counts override", () => {
    // self + 1 child + 2 parents: Σ = 1 + 0.5 + 1.5 × 2 = 4.5 → 238 000 × 4.5 = 1 071 000
    const d = computeInsurance({ ...v1, dependents: ["children", "parents"] }, rates, today);
    expect(d.health.people).toBe(4);
    expect(d.health.target).toBe(1071000);
    // self + 2 children, no parents: Σ = 2 → 476 000
    const c = computeInsurance({ ...v1, dependents: ["children", "parents"], childrenCount: 2, parentsCount: 0 }, rates, today);
    expect(c.health.people).toBe(3);
    expect(c.health.target).toBe(476000);
  });

  it("healthCovered picks the kinds; parent premiums use parentAge", () => {
    const r = computeInsurance({ ...v1, healthCovered: ["self", "parent"], parentsCount: 1, parentAge: 70 }, rates, today);
    // Σ = 1 + 1.5 = 2.5 → 595 000. Self share 238 000 at age 30: 2.38 × 1 500 / 3 000 = 3 570 / 7 140;
    // parent share 357 000 at age 70 (≤120 band): 3.57 × 9 000 / 18 000 = 32 130 / 64 260.
    // low 35 700, high 71 400
    expect(r.health.people).toBe(2);
    expect(r.health.target).toBe(595000);
    expect(r.health.premiumYearly).toEqual({ low: 35700, high: 71400 });
  });

  it("parents default to age + 28 for their premium band", () => {
    // age 30 → parents 58 → band ≤65: 5 000–10 000 per 100 000.
    const r = computeInsurance({ ...v1, healthCovered: ["parent"], parentsCount: 1 }, rates, today);
    // Σ = 1.5 → 357 000; 3.57 × 5 000 = 17 850 → 17 900; × 10 000 = 35 700
    expect(r.health.premiumYearly).toEqual({ low: 17900, high: 35700 });
  });

  it("no usable term table → life premiums 0 and the noTermSold note", () => {
    const r = computeInsurance(v1, withJson(rates, "insurance_term_premium_table", null), today);
    expect(r.life.gap).toBe(11793000);
    expect(r.life.premiumYearly).toEqual({ low: 0, high: 0 });
    // health only: 13 387.5 / 12 = 1 115.6 → ৳1 100
    expect(r.monthlyPremiumNeed).toBe(1100);
    expect(r.notes).toContain("m2.note.noTermSold");
  });

  it("no usable health price table or cover weights → health premiums 0 with a note, equal weights", () => {
    const noTable = computeInsurance(v1, withJson(rates, "health_premium_table", null), today);
    expect(noTable.health.premiumYearly).toEqual({ low: 0, high: 0 });
    expect(noTable.notes).toContain("m2.note.noHealthPriceTable");
    expect(noTable.explain.assumptions.map((a) => a.key)).not.toContain("health_premium_table");
    // Weights unusable: self, partner and child count one stay each → 238 000 × 3 = 714 000.
    const noWeights = computeInsurance(v1, withJson(rates, "health_cover_weights", null), today);
    expect(noWeights.health.target).toBe(714000);
  });

  it("out-of-pocket share below the floor → publicCoverBroad, floor applies", () => {
    const low = { ...rates, rows: { ...rates.rows, oop_health_share: { ...rates.rows.oop_health_share, value: 0.1 } } };
    const r = computeInsurance(v1, low, today);
    // 300 000 × 0.3 = 90 000
    expect(r.health.perStay).toBe(90000);
    expect(r.notes).toContain("m2.note.publicCoverBroad");
  });
});

describe("computeInsurance: policy check", () => {
  const policy = { annualPremium: 10000, sumAssured: 200000, termYears: 10, yearsPaid: 0, expectedMaturity: 120000 };

  it("term + investing the difference vs the endowment", () => {
    const r = computeInsurance({ ...v1, policy }, rates, today);
    // term premium = 200 000 / 1 000 × (2 + 4) / 2 = 600
    // difference 9 400 a year, start of year, 10 years at 6.75%: 9 400 × (1.0675^10 − 1) / 0.0675 × 1.0675
    //   = 9 400 × (1.92167 − 1) / 0.0675 × 1.0675 = 137 014.8 → ৳137 000
    // 137 000 − 120 000 = 17 000 > 5% of 120 000 (6 000) → term plus investing ahead
    expect(r.policyCheck).toEqual({
      remainingYears: 10,
      termPremiumYearly: 600,
      investDifferenceFV: 137000,
      surrenderValueFV: 0,
      lowerBound: false,
      policyMaturity: 120000,
      difference: 17000,
      policyIrr: 0.0329,
      verdict: "termPlusInvestAhead",
    });
    expect(r.notes).not.toContain("m2.note.policyNoSurrender");
    expect(r.explain.steps.map((s) => s.id)).toEqual([...M2_STEP_IDS]);
    expect(r.notes).toContain("m2.note.policyNotAdvice");
    expect(r.notes).toContain("m2.note.separateInvesting");
    const irrStep = r.explain.steps.find((s) => s.id === "m2.policyIrr");
    expect(irrStep?.unit).toBe("rate");
    expect(irrStep?.raw).toBeCloseTo(0.032894, 5);
  });

  it("years already paid, surrender value unknown: a lower bound, marginal IRR on the premiums left", () => {
    const r = computeInsurance({ ...v1, policy: { ...policy, yearsPaid: 4 } }, rates, today);
    // 9 400 × (1.0675^6 − 1) / 0.0675 × 1.0675 = 71 328.9 → ৳71 500; 71 500 − 120 000 = −48 500
    // IRR of 10 000 a year for the 6 years left against 120 000: 20.21% (was 3.29% on the full 10-year stream)
    expect(r.policyCheck).toMatchObject({ remainingYears: 6, investDifferenceFV: 71500, surrenderValueFV: 0, lowerBound: true, difference: -48500, policyIrr: 0.2021, verdict: "policyAhead" });
    expect(r.notes).toContain("m2.note.policyNoSurrender");
  });

  it("with the surrender value: it grows at the safe rate on the stop-paying side and enters the IRR", () => {
    const r = computeInsurance({ ...v1, policy: { ...policy, yearsPaid: 4, surrenderValue: 30000 } }, rates, today);
    // 30 000 × 1.0675^6 = 44 394.4 → 44 500 shown; 44 394.4 + 71 328.9 = 115 723.3 → ৳115 500
    // 115 500 − 120 000 = −4 500, within 6 000 → similar; marginal IRR 6.70%
    expect(r.policyCheck).toMatchObject({ remainingYears: 6, surrenderValueFV: 44500, investDifferenceFV: 115500, lowerBound: false, difference: -4500, policyIrr: 0.067, verdict: "similar" });
    expect(r.notes).not.toContain("m2.note.policyNoSurrender");
    expect(r.explain.steps.find((s) => s.id === "m2.policyIrr")?.inputs).toMatchObject({ surrenderValue: 30000, remainingYears: 6 });
  });

  it("no premiums left: no comparison, a note instead; maturity 0 gives −100%", () => {
    const done = computeInsurance({ ...v1, policy: { ...policy, yearsPaid: 10 } }, rates, today);
    expect(done.policyCheck).toBeUndefined();
    expect(done.notes).toContain("m2.note.policyMatured");
    expect(done.explain.steps.map((s) => s.id)).toEqual(BASE_STEPS);
    const nothing = computeInsurance({ ...v1, policy: { ...policy, expectedMaturity: 0 } }, rates, today);
    expect(nothing.policyCheck?.policyIrr).toBe(-1);
  });

  it("within 5% of maturity → similar", () => {
    // 137 000 − 135 000 = 2 000 < 6 750
    const r = computeInsurance({ ...v1, policy: { ...policy, expectedMaturity: 135000 } }, rates, today);
    expect(r.policyCheck).toMatchObject({ difference: 2000, verdict: "similar" });
  });

  it("smoker pays more for the term leg", () => {
    const r = computeInsurance({ ...v1, smoker: true, policy }, rates, today);
    // 200 × 3 × 1.6 = 960 → ৳1 000 (monthly step); 9 000 a year → 9 000 × 14.5760 = 131 184 → ৳131 000
    expect(r.policyCheck).toMatchObject({ termPremiumYearly: 1000, investDifferenceFV: 131000 });
  });
});

describe("computeInsurance: other currency (US fixture)", () => {
  const us = withCountry(rates, FIXTURE_US, { bdUsdRate: 122 });

  it("rounds with dollar steps (lump $5, monthly $1)", () => {
    // Safe fixed income set to 3.5% after tax here so the vector does not depend on the overlay's fallback.
    const usSafe: RatesSnapshot = { ...us, rows: { ...us.rows, fixed_income_return_base: { ...us.rows.fixed_income_return_base, value: 0.035 } } };
    const r = computeInsurance(
      { ...v1, age: 35, dependents: ["partner"], takeHome: 4000 },
      usSafe,
      today,
    );
    // US: inflation 0.025, safe 0.035 → ρ = 1.035 / 1.025 − 1 = 0.0097561
    // years 25; yearly need 4 000 × 12 × 0.7 = 33 600
    // PV = 33 600 × (1 − 1.0097561^−25) / 0.0097561 × 1.0097561 = 33 600 × 22.30520 = 749 454.6 → $749 455
    // (taka steps would have given 749 500)
    expect(r.life.incomeNeed).toBe(749455);
    expect(r.life.gap).toBe(749455);
    // age 35 → band ≤40: 749.455 × 3 = 2 248.4 → 2 248; × 6 = 4 496.7 → 4 497
    expect(r.life.premiumYearly).toEqual({ low: 2248, high: 4497 });
    // oop 0.11 < floor 0.3 → perStay = 15 000 × 0.3 = 4 500; self + partner Σ 2 → 9 000
    expect(r.health.perStay).toBe(4500);
    expect(r.health.target).toBe(9000);
    // 0.09 × 1 500 = 135; 0.09 × 3 000 = 270
    expect(r.health.premiumYearly).toEqual({ low: 135, high: 270 });
    // (3 372.55 + 202.5) / 12 = 297.92 → $298
    expect(r.monthlyPremiumNeed).toBe(298);
    expect(r.notes).toContain("m2.note.publicCoverBroad");
    expect(r.checklist[0]?.params.regulatorUrl).toBe("https://content.naic.org/");
  });
});

describe("computeInsurance: input validation", () => {
  test.each<{ name: string; input: M2Input }>([
    { name: "age below 15", input: { ...v1, age: 14 } },
    { name: "age above 100", input: { ...v1, age: 101 } },
    { name: "age NaN", input: { ...v1, age: Number.NaN } },
    { name: "negative take-home", input: { ...v1, takeHome: -1 } },
    { name: "negative savings", input: { ...v1, liquidSavings: -5 } },
    { name: "negative investments", input: { ...v1, investments: -5 } },
    { name: "negative debts", input: { ...v1, debts: -1 } },
    { name: "negative existing health cover", input: { ...v1, existingHealthCover: -1 } },
    { name: "fractional children count", input: { ...v1, childrenCount: 1.5 } },
    { name: "too many parents", input: { ...v1, parentsCount: 11 } },
    { name: "income share above 1", input: { ...v1, incomeShare: 1.5 } },
    { name: "cover-to age out of range", input: { ...v1, coverToAge: 120 } },
    { name: "unknown dependent", input: { ...v1, dependents: ["cat" as never] } },
    { name: "unknown cover person", input: { ...v1, healthCovered: ["dog" as never] } },
    { name: "smoker not boolean", input: { ...v1, smoker: "yes" as never } },
    { name: "policy term 0", input: { ...v1, policy: { annualPremium: 1, sumAssured: 1, termYears: 0, yearsPaid: 0, expectedMaturity: 1 } } },
    { name: "policy years paid past term", input: { ...v1, policy: { annualPremium: 1, sumAssured: 1, termYears: 5, yearsPaid: 6, expectedMaturity: 1 } } },
    { name: "policy negative premium", input: { ...v1, policy: { annualPremium: -1, sumAssured: 1, termYears: 5, yearsPaid: 0, expectedMaturity: 1 } } },
    { name: "policy negative surrender value", input: { ...v1, policy: { annualPremium: 1, sumAssured: 1, termYears: 5, yearsPaid: 1, expectedMaturity: 1, surrenderValue: -1 } } },
    { name: "youngest child age negative", input: { ...v1, youngestChildAge: -1 } },
  ])("$name → INVALID_INPUT", ({ input }) => {
    expectInvalid(() => computeInsurance(input, rates, today));
  });

  it("accepts the edges: age 15 and 100, counts 0 and 10", () => {
    expect(() => computeInsurance({ ...v1, age: 15 }, rates, today)).not.toThrow();
    expect(() => computeInsurance({ ...v1, age: 100, childrenCount: 10, parentsCount: 0 }, rates, today)).not.toThrow();
  });
});
