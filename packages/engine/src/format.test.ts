import { describe, expect, it } from "vitest";
import { formatAsOf, formatMonths, formatNumber, formatPercent, formatTaka, fromBanglaDigits, groupIndian, parseTakaInput, toBanglaDigits } from "./format";

describe("digits and grouping", () => {
  it("converts digits both ways", () => {
    expect(toBanglaDigits("1234567890")).toBe("১২৩৪৫৬৭৮৯০");
    expect(fromBanglaDigits("১২,৫০,০০০")).toBe("12,50,000");
    expect(fromBanglaDigits(toBanglaDigits("2026-09-30"))).toBe("2026-09-30");
  });
  it("groups in lakh/crore style", () => {
    expect(groupIndian(0)).toBe("0");
    expect(groupIndian(999)).toBe("999");
    expect(groupIndian(1000)).toBe("1,000");
    expect(groupIndian(12345)).toBe("12,345");
    expect(groupIndian(123456)).toBe("1,23,456");
    expect(groupIndian(1250000)).toBe("12,50,000");
    expect(groupIndian(123456789)).toBe("12,34,56,789");
    expect(groupIndian(-250000)).toBe("-2,50,000");
  });
});

describe("formatTaka", () => {
  it("formats grouped taka in both digit systems", () => {
    expect(formatTaka(1250000, { digits: "latn" })).toBe("৳12,50,000");
    expect(formatTaka(1250000, { digits: "bn" })).toBe("৳১২,৫০,০০০");
    expect(formatTaka(9000, { digits: "latn" })).toBe("৳9,000");
  });
  it("formats compact lakh and crore", () => {
    expect(formatTaka(899000, { digits: "latn", compact: true })).toBe("৳9.0 lakh");
    expect(formatTaka(899000, { digits: "bn", compact: true })).toBe("৳৯.০ লাখ");
    expect(formatTaka(12000000, { digits: "latn", compact: true })).toBe("৳1.2 crore");
    expect(formatTaka(12000000, { digits: "bn", compact: true })).toBe("৳১.২ কোটি");
    expect(formatTaka(45000, { digits: "latn", compact: true })).toBe("৳45,000");
  });
  it("handles signs", () => {
    expect(formatTaka(-1500, { digits: "latn" })).toBe("−৳1,500");
    expect(formatTaka(1500, { digits: "latn", sign: true })).toBe("+৳1,500");
  });
});

describe("percent, number, months, asOf", () => {
  it("formats percentages with one decimal by default", () => {
    expect(formatPercent(0.0834, { digits: "latn" })).toBe("8.3%");
    expect(formatPercent(0.1183, { digits: "latn", decimals: 2 })).toBe("11.83%");
    expect(formatPercent(-0.0147, { digits: "latn" })).toBe("−1.5%");
    expect(formatPercent(0.0834, { digits: "bn" })).toBe("৮.৩%");
  });
  it("formats plain numbers and months", () => {
    expect(formatNumber(2.04, { digits: "latn", decimals: 1 })).toBe("2.0");
    expect(formatMonths(8, "en")).toBe("8 months");
    expect(formatMonths(1, "en")).toBe("1 month");
    expect(formatMonths(2.5, "bn")).toBe("২.৫ মাস");
  });
  it("formats as-of dates", () => {
    expect(formatAsOf("2026-09-30", "en")).toBe("Sep 2026");
    expect(formatAsOf("2026-09-30", "bn")).toBe("সেপ্টেম্বর ২০২৬");
    expect(formatAsOf("garbage", "en")).toBe("garbage");
  });
});

describe("parseTakaInput", () => {
  it("accepts grouped, Bangla and compact forms", () => {
    expect(parseTakaInput("12,50,000")).toBe(1250000);
    expect(parseTakaInput("১২৫০০০")).toBe(125000);
    expect(parseTakaInput("12.5 lakh")).toBe(1250000);
    expect(parseTakaInput("১.২ কোটি")).toBe(12000000);
    expect(parseTakaInput("৳ 5000")).toBe(5000);
    expect(parseTakaInput("50k")).toBe(50000);
  });
  it("returns null for junk", () => {
    expect(parseTakaInput("")).toBeNull();
    expect(parseTakaInput("abc")).toBeNull();
    expect(parseTakaInput("12 taka 50")).toBeNull();
  });
});
