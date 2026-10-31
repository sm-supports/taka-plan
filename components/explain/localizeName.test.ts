import { describe, expect, it } from "vitest";
import { horizonAnswerFor } from "@/components/calculators/m6/input";
import { proseForm } from "@/components/ui/useProductName";
import { isOwnDocSource, localizeName, sourceLabel } from "./localizeName";

describe("localizeName", () => {
  it("gives Bangladesh institutions their Bangla names and translates the bracketed qualifiers in bn", () => {
    expect(localizeName("Insurance Development and Regulatory Authority (complaints)", "bn")).toBe("বীমা উন্নয়ন ও নিয়ন্ত্রণ কর্তৃপক্ষ (অভিযোগ)");
    expect(localizeName("Universal Pension Scheme (National Pension Authority)", "bn")).toBe("সর্বজনীন পেনশন স্কিম (জাতীয় পেনশন কর্তৃপক্ষ)");
    expect(localizeName("DSE (our assumption)", "bn")).toBe("DSE (আমাদের অনুমান)");
  });

  it("turns Latin digits and month names into Bangla in bn only", () => {
    const caption = "BBS SVRS 2020 life table; UN WPP 2026 projection";
    expect(localizeName(caption, "bn")).not.toMatch(/[0-9]/);
    expect(localizeName(caption, "bn")).toContain("জীবন সারণি");
    expect(localizeName("TBS, Sep 2022", "bn")).toBe("TBS, সেপ্টেম্বর ২০২২");
    expect(localizeName(caption, "en")).toBe(caption);
  });

  it("shows our own docs as Taka Plan (our assumption)", () => {
    expect(isOwnDocSource("docs/PRD.md#m1-emergency-fund")).toBe(true);
    expect(isOwnDocSource("https://www.bb.org.bd/")).toBe(false);
    expect(sourceLabel("Plan to 100 PRD (our assumption)", "docs/PRD-retirement.md", "en", "Taka Plan (our assumption)")).toBe("Taka Plan (our assumption)");
    expect(sourceLabel("World Bank WDI", "https://data.worldbank.org/", "bn", "x")).toBe("World Bank WDI");
  });
});

describe("product names inside a sentence", () => {
  it("drops a trailing explanation and lower-cases plain nouns, keeping acronyms and proper names", () => {
    expect(proseForm("DPS (deposit pension scheme)")).toBe("DPS");
    expect(proseForm("FDR (3-month fixed deposit)")).toBe("FDR");
    expect(proseForm("Fixed deposit (FD)")).toBe("fixed deposit");
    expect(proseForm("Recurring deposit")).toBe("recurring deposit");
    expect(proseForm("National Savings Certificate (NSC)")).toBe("National Savings Certificate");
    expect(proseForm("5-year Bangladesh Sanchayapatra")).toBe("5-year Bangladesh Sanchayapatra");
  });
});

describe("horizon helper", () => {
  it("derives the horizon answer from years, so the two cannot disagree", () => {
    expect([0, 4, 5, 10, 11, 40].map(horizonAnswerFor)).toEqual([0, 0, 1, 1, 2, 2]);
  });
});
