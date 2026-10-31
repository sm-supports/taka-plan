import { describe, expect, it } from "vitest";
import { FIXTURE_IN, OUR_ASSUMPTION_SOURCE, RATES_SEED, assertSnapshot, withCountry } from "@taka/engine";
import { assumptionLabel, assumptionSource } from "@/components/explain/formatInputs";

const base = assertSnapshot(RATES_SEED);

describe("assumption labels and sources outside Bangladesh", () => {
  it("shows the overlay's neutral labels in English and Bangla", () => {
    const s = withCountry(base, FIXTURE_IN, { bdUsdRate: 122 });
    const row = s.rows.sanchayapatra_5y_rate;
    expect(assumptionLabel(row, "en")).toBe("Government savings certificate, about 5 years");
    expect(assumptionLabel(row, "bn")).toBe("সরকারি সঞ্চয় সার্টিফিকেট, প্রায় ৫ বছর");
    expect(assumptionLabel(s.rows.policy_rate, "en")).not.toMatch(/Bangladesh/);
    expect(assumptionLabel({ labelEn: "X", labelBn: "  " }, "bn")).toBe("X");
  });

  it("names our own docs/ sources as Taka Plan's assumption", () => {
    expect(assumptionSource({ sourceName: "PRD-retirement.md", sourceUrl: "docs/PRD-retirement.md" })).toBe(OUR_ASSUMPTION_SOURCE);
    expect(assumptionSource({ sourceName: "RBI", sourceUrl: "https://www.rbi.org.in/" })).toBe("RBI");
  });
});
