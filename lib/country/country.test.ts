import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FIXTURE_BD, FIXTURE_IN, FIXTURE_US, RATES_SEED, assertSnapshot, computeEmergencyFund, type CountryProfile, type M1Input } from "@taka/engine";
import { createFormatters } from "@/lib/i18n/useFormat";
import { BUNDLED_BD, bundledFrom } from "./bundled";
import { bdUsdRateOf, fetchCountryProfile, fetchRegions, isNewer, normaliseCode, parseCountryBody, parseRegions, pickNewest, type LoadedCountry } from "./loader";
import { contextOf, mergeEntry, overlaySnapshot, resolveActive } from "./resolve";
import { countryStorageKey, loadStoredCountry, loadStoredRegions, saveStoredCountry, saveStoredRegions } from "./storage";

const base = assertSnapshot(RATES_SEED);
const bd: LoadedCountry = { profile: FIXTURE_BD, version: 0, source: "bundled" };
const loaded = (profile: CountryProfile, version: number, source: LoadedCountry["source"], researchedAt = profile.researchedAt): LoadedCountry => ({
  profile: { ...profile, researchedAt },
  version,
  source,
});

describe("loader", () => {
  it("normalises codes", () => {
    expect(normaliseCode("in")).toBe("IN");
    expect(normaliseCode(" us ")).toBe("US");
    expect(normaliseCode("USA")).toBeNull();
    expect(normaliseCode(undefined)).toBeNull();
  });

  it("reads a bare profile and an API envelope, and rejects a bad or mismatched one", () => {
    expect(parseCountryBody(FIXTURE_IN, "static", "IN")).toMatchObject({ version: 0, source: "static" });
    expect(parseCountryBody({ version: 4, status: "published", profile: FIXTURE_IN }, "api", "IN")).toMatchObject({ version: 4, source: "api" });
    expect(() => parseCountryBody(FIXTURE_IN, "static", "US")).toThrow(/IN/);
    expect(() => parseCountryBody({ ...FIXTURE_IN, currency: { ...FIXTURE_IN.currency, code: "rupee" } }, "static")).toThrow();
  });

  it("newest = later researchedAt, then higher version; ties keep the first", () => {
    const a = loaded(FIXTURE_IN, 0, "static", "2026-10-01");
    const b = loaded(FIXTURE_IN, 0, "api", "2026-10-20");
    const c = loaded(FIXTURE_IN, 3, "api", "2026-10-20");
    expect(isNewer(b, a)).toBe(true);
    expect(isNewer(c, b)).toBe(true);
    expect(pickNewest([a, c, b])).toBe(c);
    expect(pickNewest([b, loaded(FIXTURE_IN, 0, "stored", "2026-10-20")])).toBe(b);
    expect(pickNewest([null, undefined])).toBeNull();
  });

  it("keeps good regional figures and drops the rest", () => {
    const good = { value: 0.05, status: "assumption", sourceName: "Regional median", sourceUrl: "https://data.worldbank.org/", asOf: "2026-10-01" };
    const r = parseRegions({ south_asia: { inflation_cpi: good, fdr_1y_rate: { value: "x" }, not_a_key: good }, mars: { inflation_cpi: good } });
    expect(Object.keys(r)).toEqual(["south_asia"]);
    expect(Object.keys(r.south_asia ?? {})).toEqual(["inflation_cpi"]);
    expect(parseRegions(null)).toEqual({});
  });

  it("takes the dollar rate from the BD profile", () => {
    expect(bdUsdRateOf(FIXTURE_BD)).toBe(122);
    expect(bdUsdRateOf(null)).toBe(122);
  });

  it("fetches the static file and the API together and keeps the newest; failures are null", async () => {
    const calls: string[] = [];
    const respond = (body: unknown, ok = true) => Promise.resolve({ ok, status: ok ? 200 : 404, json: () => Promise.resolve(body) });
    const fetcher = (url: string) => {
      calls.push(url);
      if (url === "/data/countries/IN.json") return respond(loaded(FIXTURE_IN, 0, "static", "2026-10-01").profile);
      if (url === "/api/countries/IN") return respond({ version: 2, profile: loaded(FIXTURE_IN, 2, "api", "2026-10-25").profile });
      if (url === "/data/countries/US.json") return respond(FIXTURE_US);
      if (url === "/api/countries/US") return Promise.reject(new Error("offline"));
      return respond({}, false);
    };
    const inr = await fetchCountryProfile("IN", { fetch: fetcher });
    expect(inr).toMatchObject({ source: "api", version: 2 });
    expect(calls.sort()).toEqual(["/api/countries/IN", "/data/countries/IN.json"]);
    expect(await fetchCountryProfile("US", { fetch: fetcher })).toMatchObject({ source: "static" });
    expect(await fetchCountryProfile("FR", { fetch: fetcher })).toBeNull();
    expect(await fetchRegions({ fetch: fetcher })).toBeNull();
  });
});

describe("bundled Bangladesh", () => {
  it("uses the data file when valid, else the fixture", () => {
    expect(BUNDLED_BD.profile.code).toBe("BD");
    expect(BUNDLED_BD.source).toBe("bundled");
    const newer = { ...FIXTURE_BD, researchedAt: "2026-10-31" };
    expect(bundledFrom({ "BD.json": newer }).profile.researchedAt).toBe("2026-10-31");
    expect(bundledFrom({ "BD.json": { nope: true } }).profile).toBe(FIXTURE_BD);
    expect(bundledFrom({}).profile).toBe(FIXTURE_BD);
  });
});

describe("resolveActive", () => {
  it("Bangladesh: the newest of bundled and loaded copies", () => {
    expect(resolveActive("BD", undefined, bd)).toMatchObject({ code: "BD", source: "bundled", loading: true });
    const fresh = loaded(FIXTURE_BD, 1, "api", "2026-11-01");
    expect(resolveActive("BD", { best: fresh, done: true }, bd)).toMatchObject({ source: "api", loading: false });
  });

  it("another country: Bangladesh while loading, its own profile when it arrives, fallback when none exists", () => {
    expect(resolveActive("IN", undefined, bd)).toMatchObject({ code: "IN", source: "bundled", loading: true });
    expect(resolveActive("IN", undefined, bd).profile.code).toBe("BD");
    const inr = loaded(FIXTURE_IN, 0, "stored");
    expect(resolveActive("IN", { best: inr, done: false }, bd)).toMatchObject({ source: "stored", loading: true });
    expect(resolveActive("IN", { best: inr, done: false }, bd).profile.code).toBe("IN");
    const none = resolveActive("FR", { best: null, done: true }, bd);
    expect(none).toMatchObject({ code: "FR", source: "fallback", loading: false });
    expect(none.profile.code).toBe("BD");
  });

  it("mergeEntry keeps the newest and stays done", () => {
    const old = loaded(FIXTURE_IN, 0, "stored", "2026-09-01");
    const fresh = loaded(FIXTURE_IN, 0, "static", "2026-10-01");
    const e1 = mergeEntry(undefined, old, false);
    const e2 = mergeEntry(e1, fresh, true);
    expect(e2).toEqual({ best: fresh, done: true });
    expect(mergeEntry(e2, null, false)).toEqual({ best: fresh, done: true });
    expect(mergeEntry(e2, old, false).best).toBe(fresh);
  });
});

describe("overlaySnapshot", () => {
  it("Bangladesh keeps every BD row and number", () => {
    const s = overlaySnapshot(base, FIXTURE_BD, { bd: FIXTURE_BD });
    expect(s.rows).toEqual(base.rows);
    expect(contextOf(s).currency.code).toBe("BDT");
    const m1: M1Input = { essentials: 30_000, incomeType: "salaried", dependents: [], soleEarner: false, hasHealthInsurance: false, liquidSavings: 10_000 };
    expect(computeEmergencyFund(m1, s, "2026-10-30")).toEqual(computeEmergencyFund(m1, base, "2026-10-30"));
  });

  it("another country gets its currency and figures", () => {
    const s = overlaySnapshot(base, FIXTURE_US, { bd: FIXTURE_BD });
    expect(contextOf(s)).toMatchObject({ code: "US", currency: { code: "USD", symbol: "$" }, unavailable: ["dps"] });
    expect(s.rows.fdr_1y_rate.value).toBe(0.04);
  });

  it("an unusable profile falls back to Bangladesh", () => {
    const broken = { ...FIXTURE_US, instruments: null } as unknown as CountryProfile;
    expect(contextOf(overlaySnapshot(base, broken, { bd: FIXTURE_BD })).code).toBe("BD");
  });
});

describe("storage", () => {
  const store = new Map<string, string>();
  const g = globalThis as { window?: unknown };
  beforeEach(() => {
    store.clear();
    g.window = { localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) } };
  });
  afterEach(() => {
    delete g.window;
  });

  it("round-trips a profile with its version under taka-plan.country.<CC>", () => {
    saveStoredCountry(loaded(FIXTURE_IN, 5, "api"));
    expect([...store.keys()]).toEqual([countryStorageKey("IN")]);
    expect(countryStorageKey("IN")).toBe("taka-plan.country.IN");
    expect(loadStoredCountry("IN")).toMatchObject({ version: 5, source: "stored", profile: { code: "IN" } });
    expect(loadStoredCountry("US")).toBeNull();
  });

  it("ignores corrupt copies and a copy filed under the wrong code", () => {
    store.set(countryStorageKey("IN"), "{not json");
    expect(loadStoredCountry("IN")).toBeNull();
    store.set(countryStorageKey("US"), JSON.stringify({ version: 1, profile: FIXTURE_IN }));
    expect(loadStoredCountry("US")).toBeNull();
  });

  it("round-trips regions", () => {
    expect(loadStoredRegions()).toBeNull();
    saveStoredRegions({ south_asia: {} });
    expect(loadStoredRegions()).toEqual({ south_asia: {} });
  });

  it("is a no-op without window", () => {
    delete g.window;
    saveStoredCountry(loaded(FIXTURE_IN, 1, "api"));
    expect(loadStoredCountry("IN")).toBeNull();
  });
});

describe("createFormatters with a country currency", () => {
  it("money follows the currency; taka stays taka", () => {
    const us = contextOf(overlaySnapshot(base, FIXTURE_US, { bd: FIXTURE_BD })).currency;
    const inr = contextOf(overlaySnapshot(base, FIXTURE_IN, { bd: FIXTURE_BD })).currency;
    const fUs = createFormatters("en", us);
    expect(fUs.money(1_250_000)).toBe("$1,250,000");
    expect(fUs.taka(1_250_000)).toBe("৳12,50,000");
    expect(fUs.parseMoney("$1,250")).toBe(1250);
    expect(createFormatters("en", inr).money(1_250_000, { compact: true })).toBe("₹12.5 lakh");
    expect(createFormatters("bn", inr).money(1_250_000)).toBe("₹১২,৫০,০০০");
    // Default (no country): money is exactly taka.
    const fBn = createFormatters("bn");
    expect(fBn.money(1_250_000)).toBe(fBn.taka(1_250_000));
    expect(fBn.parseMoney("১২,৫০,০০০")).toBe(1_250_000);
  });
});
