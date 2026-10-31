import { assertCountryIndex, localesForLanguages, REGIONS } from "@taka/engine";
import { afterEach, describe, expect, it } from "vitest";
import { locales } from "@/lib/i18n/config";
import { COUNTRY_INDEX } from "./countries-index";
import { findCountry, loadCountryIndex, localesForCountry, normalize, regionOfTag, resetCountryIndexCache, searchCountries, suggestCountries } from "./index-data";

const CURRENCIES = new Set(Intl.supportedValuesOf("currency"));

describe("COUNTRY_INDEX", () => {
  it("lists 197 countries with unique codes (UN members + PS, VA, XK, TW)", () => {
    expect(COUNTRY_INDEX).toHaveLength(197);
    const codes = COUNTRY_INDEX.map((e) => e.code);
    expect(new Set(codes).size).toBe(197);
    for (const c of ["BD", "IN", "US", "SA", "PS", "VA", "XK", "TW"]) expect(codes).toContain(c);
    expect(() => assertCountryIndex(COUNTRY_INDEX)).not.toThrow();
  });

  it.each(COUNTRY_INDEX.map((e) => [e.code, e] as const))("%s has a valid region, currency, languages and locales", (_code, e) => {
    expect(e.code).toMatch(/^[A-Z]{2}$/);
    expect(e.nameEn.trim()).not.toBe("");
    expect(e.nameNative.trim()).not.toBe("");
    expect(REGIONS).toContain(e.region);
    expect(CURRENCIES.has(e.currency), `${e.currency} is an ISO 4217 code`).toBe(true);
    expect(e.languages.length).toBeGreaterThan(0);
    for (const l of e.languages) expect(l).toMatch(/^[a-z]{2}$/);
    expect(new Set(e.languages).size).toBe(e.languages.length);
    expect(e.locales).toEqual(localesForLanguages(e.languages));
    expect(e.locales.at(-1)).toBe("en");
    for (const l of e.locales) expect(locales).toContain(l);
  });

  it("offers the expected languages for the e2e countries", () => {
    expect(findCountry("BD")?.locales).toEqual(["bn", "en"]);
    expect(findCountry("IN")?.locales).toEqual(["hi", "bn", "ur", "en"]);
    expect(findCountry("US")?.locales).toEqual(["es", "en"]);
    expect(findCountry("SA")?.locales).toEqual(["ar", "en"]);
    expect(findCountry("JP")?.locales).toEqual(["en"]);
    expect(localesForCountry("ZZ")).toEqual(["bn", "en"]);
  });
});

describe("search", () => {
  it("ignores case and accents", () => {
    expect(normalize("Côte d’Ivoire")).toBe("cote divoire");
    expect(searchCountries("cote", COUNTRY_INDEX)[0]?.code).toBe("CI");
    expect(searchCountries("MEXICO", COUNTRY_INDEX)[0]?.code).toBe("MX");
    expect(searchCountries("turkiye", COUNTRY_INDEX)[0]?.code).toBe("TR");
  });

  it("matches native names", () => {
    expect(searchCountries("বাংলা", COUNTRY_INDEX).map((e) => e.code)).toContain("BD");
    expect(searchCountries("भारत", COUNTRY_INDEX)[0]?.code).toBe("IN");
    expect(searchCountries("Deutschland", COUNTRY_INDEX)[0]?.code).toBe("DE");
    expect(searchCountries("السعودية", COUNTRY_INDEX)[0]?.code).toBe("SA");
    expect(searchCountries("عمان", COUNTRY_INDEX)[0]?.code).toBe("OM"); // عُمان without the vowel mark
    expect(searchCountries("viet nam", COUNTRY_INDEX)[0]?.code).toBe("VN");
  });

  it("puts prefix matches first and returns everything for an empty query", () => {
    expect(searchCountries("ind", COUNTRY_INDEX).slice(0, 2).map((e) => e.code).sort()).toEqual(["ID", "IN"]);
    expect(searchCountries("  ", COUNTRY_INDEX)).toHaveLength(197);
    expect(searchCountries("zzzz", COUNTRY_INDEX)).toEqual([]);
  });
});

describe("suggestions", () => {
  it("reads the region of a language tag", () => {
    expect(regionOfTag("bn-BD")).toBe("BD");
    expect(regionOfTag("zh-Hant-TW")).toBe("TW");
    expect(regionOfTag("en")).toBeUndefined();
    expect(regionOfTag("es-419")).toBeUndefined();
  });

  it("puts the cookie first, then browser regions, without duplicates", () => {
    const s = suggestCountries({ cookie: "IN", languages: ["bn-BD", "en-IN", "en-US", "fr"] }, COUNTRY_INDEX);
    expect(s.map((e) => e.code)).toEqual(["IN", "BD", "US"]);
    expect(suggestCountries({ cookie: "ZZ", languages: [] }, COUNTRY_INDEX)).toEqual([]);
  });
});

describe("loadCountryIndex", () => {
  afterEach(() => resetCountryIndexCache());

  it("prefers a valid fetched index", async () => {
    const one = [{ code: "BD", nameEn: "Bangladesh", nameNative: "বাংলাদেশ", region: "south_asia", currency: "BDT", languages: ["bn"], locales: ["bn", "en"] }];
    const fetcher = (async () => new Response(JSON.stringify(one), { headers: { "content-type": "application/json" } })) as typeof fetch;
    expect(await loadCountryIndex(fetcher)).toEqual(one);
  });

  it("falls back to the bundled list on a 404, HTML or a malformed file", async () => {
    const notFound = (async () => new Response("<html>", { status: 404, headers: { "content-type": "text/html" } })) as typeof fetch;
    expect(await loadCountryIndex(notFound)).toBe(COUNTRY_INDEX);
    resetCountryIndexCache();
    const bad = (async () => new Response(JSON.stringify([{ code: "bd" }]), { headers: { "content-type": "application/json" } })) as typeof fetch;
    expect(await loadCountryIndex(bad)).toBe(COUNTRY_INDEX);
    resetCountryIndexCache();
    const offline = (async () => {
      throw new TypeError("offline");
    }) as typeof fetch;
    expect(await loadCountryIndex(offline)).toBe(COUNTRY_INDEX);
  });
});
