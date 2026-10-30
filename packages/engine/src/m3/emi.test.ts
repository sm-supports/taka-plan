import { describe, expect, it } from "vitest";
import { roundMoney } from "../money";
import { EngineError } from "../types";
import { emi, maxLoan, totalInterest } from "./emi";

describe("emi (PRD vectors)", () => {
  it("emi(800000, 12%, 60) ≈ 17 795.6 → 17 800 monthly", () => {
    const e = emi(800000, 0.12, 60);
    expect(e).toBeCloseTo(17795.6, 0);
    expect(roundMoney(e, "monthly")).toBe(17800);
  });

  it("emi(100000, 12%, 12) ≈ 8 884.9 with total interest ≈ 6 619", () => {
    const e = emi(100000, 0.12, 12);
    expect(e).toBeCloseTo(8884.9, 0);
    expect(totalInterest(100000, 0.12, 12)).toBeCloseTo(6619, 0);
  });

  it("zero rate → P / n", () => {
    expect(emi(120000, 0, 12)).toBe(10000);
    expect(totalInterest(120000, 0, 12)).toBe(0);
  });

  it("zero principal → 0", () => {
    expect(emi(0, 0.12, 60)).toBe(0);
  });

  it("rejects n ≤ 0, P < 0 and negative rates with INVALID_INPUT", () => {
    for (const bad of [() => emi(100000, 0.12, 0), () => emi(100000, 0.12, -5), () => emi(-1, 0.12, 12), () => emi(100000, -0.01, 12), () => emi(Number.NaN, 0.12, 12)]) {
      expect(bad).toThrow(EngineError);
      expect(bad).toThrow(/must be/);
      try {
        bad();
      } catch (e) {
        expect((e as EngineError).code).toBe("INVALID_INPUT");
      }
    }
  });
});

describe("maxLoan (PRD vectors)", () => {
  it("maxLoan(20000, 12%, 60) ≈ 899 100.8 → 899 000 lump (about 9.0 lakh, not 8 lakh)", () => {
    const p = maxLoan(20000, 0.12, 60);
    expect(p).toBeCloseTo(899100.8, 0);
    expect(roundMoney(p, "lump")).toBe(899000);
  });

  it("is the inverse of emi", () => {
    const p = maxLoan(emi(800000, 0.12, 60), 0.12, 60);
    expect(p).toBeCloseTo(800000, 6);
  });

  it("zero rate → E × n", () => {
    expect(maxLoan(10000, 0, 24)).toBe(240000);
  });

  it("zero capacity → 0", () => {
    expect(maxLoan(0, 0.12, 60)).toBe(0);
  });

  it("rejects n ≤ 0 and negative capacity", () => {
    expect(() => maxLoan(20000, 0.12, 0)).toThrow(EngineError);
    expect(() => maxLoan(-20000, 0.12, 60)).toThrow(EngineError);
  });
});
