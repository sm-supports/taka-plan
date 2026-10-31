/** Review fixes ST-L1 (language order), ST-L2 (Bangladeshi browsers), ST-H2 (country notice). */
import { describe, expect, it } from "vitest";
import { COUNTRY_INDEX } from "./countries-index";
import { currencySymbol, findCountry, isBanglaTag, localesForCountry, orderedLocales, regionName, suggestCountries } from "./index-data";
import { countryNoticeKind } from "./resolve";

const codes = (l: { code: string }[]) => l.map((e) => e.code);

describe("language order", () => {
  it("puts English first where it is the main language or the main language is not translated", () => {
    const order = (c: string) => orderedLocales(findCountry(c)!);
    expect(order("US")).toEqual(["en", "es"]);
    expect(order("CA")).toEqual(["en", "fr"]);
    expect(order("GB")).toEqual(["en"]);
    expect(order("SG")).toEqual(["en", "zh"]);
    // German-speaking countries: English, not French, comes first.
    expect(order("CH")).toEqual(["en", "fr"]);
    expect(order("DE")).toEqual(["en"]);
    // A translated main language stays first.
    expect(order("BD")).toEqual(["bn", "en"]);
    expect(order("IN")).toEqual(["hi", "bn", "ur", "en"]);
    expect(order("SA")).toEqual(["ar", "en"]);
    expect(order("PK")[0]).toBe("ur");
    // Taiwan keeps zh first (Simplified, the closest we have to Traditional).
    expect(order("TW")).toEqual(["zh", "en"]);
    expect(localesForCountry("US")).toEqual(["en", "es"]);
    expect(localesForCountry("ZZ")).toEqual(["bn", "en"]);
    // Every country still offers the same set, English included.
    for (const e of COUNTRY_INDEX) expect([...orderedLocales(e)].sort()).toEqual([...e.locales].sort());
  });
});

describe("Bangladeshi browsers", () => {
  it("suggests Bangladesh for any Bangla language and for the Dhaka time zone", () => {
    expect(isBanglaTag("bn")).toBe(true);
    expect(isBanglaTag("bn-IN")).toBe(true);
    expect(isBanglaTag("bnx")).toBe(false);
    expect(codes(suggestCountries({ languages: ["bn"] }, COUNTRY_INDEX))).toEqual(["BD"]);
    expect(codes(suggestCountries({ languages: ["bn-IN"] }, COUNTRY_INDEX))).toEqual(["IN", "BD"]);
    expect(codes(suggestCountries({ languages: ["en-US"], timeZone: "Asia/Dhaka" }, COUNTRY_INDEX))).toEqual(["US", "BD"]);
    expect(codes(suggestCountries({ languages: ["en"], timeZone: "Asia/Dacca" }, COUNTRY_INDEX))).toEqual(["BD"]);
    expect(codes(suggestCountries({ languages: ["en"], timeZone: "Europe/London" }, COUNTRY_INDEX))).toEqual([]);
    // The cookie still comes first.
    expect(codes(suggestCountries({ cookie: "PK", languages: ["bn"], timeZone: "Asia/Dhaka" }, COUNTRY_INDEX))).toEqual(["PK", "BD"]);
  });
});

describe("helpers for the switch-country screen", () => {
  it("names currencies and countries through Intl", () => {
    expect(currencySymbol("BDT")).toBe("৳");
    expect(currencySymbol("INR")).toBe("₹");
    expect(currencySymbol(undefined)).toBe("৳");
    expect(currencySymbol("not a code")).toBe("not a code");
    expect(regionName("IN", "bn", "India")).toBe("ভারত");
    expect(regionName("IN", "en", "x")).toBe("India");
  });
});

describe("country notice", () => {
  const base = { code: "BO", profileCode: "BD", source: "bundled", loading: true, fallbackKeys: [] as string[] };
  it("says nothing while the first copy loads, then flags a country without data", () => {
    expect(countryNoticeKind(base)).toBe("none");
    expect(countryNoticeKind({ ...base, loading: false, source: "fallback" })).toBe("missing");
    expect(countryNoticeKind({ ...base, loading: false })).toBe("missing");
  });
  it("adds a small note for regional fallback figures, nothing for a complete profile", () => {
    expect(countryNoticeKind({ code: "IN", profileCode: "IN", source: "api", loading: false, fallbackKeys: ["gold_return"] })).toBe("partial");
    expect(countryNoticeKind({ code: "IN", profileCode: "IN", source: "stored", loading: true, fallbackKeys: [] })).toBe("none");
    expect(countryNoticeKind({ code: "BD", profileCode: "BD", source: "bundled", loading: false, fallbackKeys: [] })).toBe("none");
  });
});
