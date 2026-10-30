import { describe, expect, it } from "vitest";
import { clamp, mean, pct, roundDecimals, roundMoney, sum } from "./money";

describe("roundMoney", () => {
  it("rounds lump sums to the nearest ৳500", () => {
    expect(roundMoney(899100.8, "lump")).toBe(899000);
    expect(roundMoney(734664, "lump")).toBe(734500);
    expect(roundMoney(250, "lump")).toBe(500);
    expect(roundMoney(249, "lump")).toBe(0);
  });
  it("rounds monthly amounts and interest to the nearest ৳100", () => {
    expect(roundMoney(17795.6, "monthly")).toBe(17800);
    expect(roundMoney(16666.67, "monthly")).toBe(16700);
    expect(roundMoney(9326, "monthly")).toBe(9300);
    expect(roundMoney(6619.4, "interest")).toBe(6600);
  });
  it("rounds exact sums to the taka and tolerates non-finite input", () => {
    expect(roundMoney(26000.4, "exact")).toBe(26000);
    expect(roundMoney(Number.NaN, "exact")).toBe(0);
    expect(roundMoney(Number.POSITIVE_INFINITY, "lump")).toBe(0);
  });
});

describe("helpers", () => {
  it("clamp, pct, roundDecimals, sum, mean", () => {
    expect(clamp(17, 3, 15)).toBe(15);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(pct(0.08345)).toBe(8.3);
    expect(pct(0.1183, 2)).toBe(11.83);
    expect(roundDecimals(2.04)).toBe(2);
    expect(roundDecimals(50000 / 25000)).toBe(2);
    expect(sum([1, 2, 3])).toBe(6);
    expect(mean([40000, 60000, 30000, 70000, 50000, 50000])).toBe(50000);
    expect(mean([])).toBe(0);
  });
});
