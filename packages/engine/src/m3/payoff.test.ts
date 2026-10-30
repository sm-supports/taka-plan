import { describe, expect, it } from "vitest";
import { EngineError } from "../types";
import { simulatePayoff } from "./payoff";
import type { DebtSummary } from "./types";

const loan = (id: string, balance: number, annualRate: number, minPayment: number, kind: DebtSummary["kind"] = "loan"): DebtSummary => ({ id, kind, balance, annualRate, minPayment });

/** Small deterministic generator (fast-check is not installed): a linear congruential sequence. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

function generateDebtSet(seed: number): { debts: DebtSummary[]; extra: number } {
  const rnd = lcg(seed);
  const n = 1 + Math.floor(rnd() * 4);
  const debts: DebtSummary[] = [];
  for (let i = 0; i < n; i++) {
    const balance = Math.round(10000 + rnd() * 990000);
    const annualRate = Math.round(rnd() * 30) / 100; // 0% … 30%
    // A minimum that always covers the interest, so the set terminates even with no extra.
    const minPayment = Math.round(balance * (annualRate / 12) + balance / (6 + Math.floor(rnd() * 120)));
    debts.push(loan(`d${seed}-${i}`, balance, annualRate, minPayment, rnd() < 0.3 ? "card" : "loan"));
  }
  return { debts, extra: Math.round(rnd() * 20000) };
}

describe("simulatePayoff", () => {
  it("single zero-rate loan clears in ceil(balance / min) months with no interest", () => {
    const plan = simulatePayoff([loan("a", 120000, 0, 10000)], 0, "avalanche");
    expect(plan).toEqual({ order: ["a"], months: 12, totalInterest: 0 });
  });

  it("matches the annuity schedule for a single loan at its EMI", () => {
    // emi(100000, 12%, 12) ≈ 8884.88 → total interest ≈ 6619 → rounded 6600
    const plan = simulatePayoff([loan("a", 100000, 0.12, 8884.88)], 0, "avalanche");
    expect(plan.months).toBe(12);
    expect(plan.order).toEqual(["a"]);
    expect(plan.totalInterest).toBe(6600);
  });

  it("avalanche targets the highest rate, snowball the smallest balance", () => {
    const debts = [loan("big-cheap", 500000, 0.1, 10000), loan("small-dear", 50000, 0.25, 2500, "card")];
    const avalanche = simulatePayoff(debts, 5000, "avalanche");
    const snowball = simulatePayoff(debts, 5000, "snowball");
    expect(avalanche.order[0]).toBe("small-dear");
    expect(snowball.order[0]).toBe("small-dear");
    expect(avalanche.totalInterest).toBeLessThanOrEqual(snowball.totalInterest);

    // Make the small one the cheap one: the strategies now disagree on the first target.
    const flipped = [loan("big-dear", 500000, 0.25, 15000), loan("small-cheap", 50000, 0.05, 1000)];
    expect(simulatePayoff(flipped, 5000, "avalanche").order[0]).toBe("big-dear");
    expect(simulatePayoff(flipped, 5000, "snowball").order[0]).toBe("small-cheap");
    expect(simulatePayoff(flipped, 5000, "avalanche").totalInterest).toBeLessThanOrEqual(simulatePayoff(flipped, 5000, "snowball").totalInterest);
  });

  it("avalanche ties on rate go to the smaller balance", () => {
    const debts = [loan("large", 300000, 0.12, 6000), loan("small", 100000, 0.12, 2000)];
    expect(simulatePayoff(debts, 10000, "avalanche").order).toEqual(["small", "large"]);
  });

  it("freed minimums roll on to the next target", () => {
    const debts = [loan("a", 10000, 0, 5000), loan("b", 40000, 0, 1000)];
    // Month 1–2 clear a (5000 each). From month 3, b gets 1000 + 5000 freed = 6000/month → 38000 / 6000 → 7 more months.
    const plan = simulatePayoff(debts, 0, "snowball");
    expect(plan.order).toEqual(["a", "b"]);
    expect(plan.months).toBe(9);
  });

  it("stops at maxMonths when minimums never cover the interest", () => {
    const plan = simulatePayoff([loan("stuck", 100000, 0.25, 1000), loan("ok", 10000, 0, 1000)], 0, "avalanche", 120);
    expect(plan.months).toBe(120);
    expect(plan.order).toEqual(["ok"]);
    expect(plan.totalInterest).toBeGreaterThan(0);
  });

  it("no debts → zero months, empty order", () => {
    expect(simulatePayoff([], 5000, "avalanche")).toEqual({ order: [], months: 0, totalInterest: 0 });
  });

  it("rejects negative extra and malformed debts", () => {
    expect(() => simulatePayoff([], -1, "avalanche")).toThrow(EngineError);
    expect(() => simulatePayoff([loan("x", -5, 0.1, 100)], 0, "avalanche")).toThrow(EngineError);
    expect(() => simulatePayoff([loan("x", 500, -0.1, 100)], 0, "snowball")).toThrow(EngineError);
    expect(() => simulatePayoff([loan("x", 500, 0.1, 100)], 0, "avalanche", 0)).toThrow(EngineError);
  });

  it("property: avalanche interest ≤ snowball interest and both terminate (20 generated sets)", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const { debts, extra } = generateDebtSet(seed);
      const avalanche = simulatePayoff(debts, extra, "avalanche");
      const snowball = simulatePayoff(debts, extra, "snowball");
      expect(avalanche.months, `seed ${seed} avalanche terminates`).toBeLessThan(600);
      expect(snowball.months, `seed ${seed} snowball terminates`).toBeLessThan(600);
      expect(avalanche.order.length, `seed ${seed} clears every debt`).toBe(debts.length);
      expect(snowball.order.length, `seed ${seed} clears every debt`).toBe(debts.length);
      expect(avalanche.totalInterest, `seed ${seed} avalanche ≤ snowball`).toBeLessThanOrEqual(snowball.totalInterest);
      expect(new Set(avalanche.order).size).toBe(debts.length);
    }
  });
});
