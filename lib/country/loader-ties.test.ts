/** Review fixes ST-M3 (stale stored copy), S1 client (top-level version), ST-M4 (sync seed), ST-L5 (pruning). */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FIXTURE_BD, FIXTURE_IN, type CountryProfile } from "@taka/engine";
import { isNewer, parseCountryBody, pickNewest, type LoadedCountry } from "./loader";
import { mergeEntry, resolveActive } from "./resolve";
import { COUNTRY_STORAGE_PREFIX, REGIONS_STORAGE_KEY, countryStorageKey, initialEntries, pruneStoredCountries, saveStoredCountry } from "./storage";

const loaded = (profile: CountryProfile, version: number, source: LoadedCountry["source"]): LoadedCountry => ({ profile, version, source });

describe("parseCountryBody shapes", () => {
  it("reads the API's { version, status, profile } and a bare profile with a top-level version", () => {
    expect(parseCountryBody({ version: 7, status: "published", profile: FIXTURE_IN }, "api", "IN").version).toBe(7);
    const bare = parseCountryBody({ ...FIXTURE_IN, version: 5 }, "static", "IN");
    expect(bare.version).toBe(5);
    expect("version" in bare.profile).toBe(false);
    expect(parseCountryBody(FIXTURE_IN, "static", "IN").version).toBe(0);
    // A version inside the wrapped profile counts when the wrapper has none.
    expect(parseCountryBody({ profile: { ...FIXTURE_IN, version: 2 } }, "stored", "IN").version).toBe(2);
    // Nonsense versions read as 0.
    expect(parseCountryBody({ version: -1, profile: FIXTURE_IN }, "api", "IN").version).toBe(0);
    expect(parseCountryBody({ version: "9", profile: FIXTURE_IN }, "api", "IN").version).toBe(0);
    expect(() => parseCountryBody(null, "api")).toThrow();
  });
});

describe("tie-breaks", () => {
  const stale: CountryProfile = { ...FIXTURE_IN, currency: { ...FIXTURE_IN.currency, symbol: "OLD₹" } };

  it("a network copy beats an equally new stored copy (same researchedAt and version)", () => {
    const stored = loaded(stale, 0, "stored");
    const fromStatic = loaded(FIXTURE_IN, 0, "static");
    const fromApi = loaded(FIXTURE_IN, 0, "api");
    expect(isNewer(fromStatic, stored)).toBe(true);
    expect(isNewer(stored, fromStatic)).toBe(false);
    expect(pickNewest([stored, fromStatic])).toBe(fromStatic);
    expect(pickNewest([fromStatic, fromApi])).toBe(fromApi);
    // The provider merges the stored copy first, then the network one: the network one wins the tie.
    const entry = mergeEntry(mergeEntry(undefined, stored, false), fromStatic, true);
    expect(entry.best).toBe(fromStatic);
    expect(entry.best?.profile.currency.symbol).toBe("₹");
  });

  it("this build's bundled BD beats an equally new stored BD; newer data still wins whatever its source", () => {
    expect(pickNewest([loaded(FIXTURE_BD, 0, "bundled"), loaded(FIXTURE_BD, 0, "stored")])?.source).toBe("bundled");
    const newer = loaded({ ...FIXTURE_IN, researchedAt: "2099-01-01" }, 0, "stored");
    expect(pickNewest([loaded(FIXTURE_IN, 0, "api"), newer])).toBe(newer);
    expect(pickNewest([loaded(FIXTURE_IN, 1, "stored"), loaded(FIXTURE_IN, 0, "api")])?.version).toBe(1);
    // Full ties keep the first.
    const a = loaded(FIXTURE_IN, 0, "api");
    expect(pickNewest([a, loaded(FIXTURE_IN, 0, "api")])).toBe(a);
  });
});

describe("storage: sync seed and pruning", () => {
  const g = globalThis as { window?: unknown };
  let map: Map<string, string>;
  beforeEach(() => {
    map = new Map();
    const ls = {
      get length() {
        return map.size;
      },
      key: (i: number) => [...map.keys()][i] ?? null,
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    };
    g.window = { localStorage: ls };
  });
  afterEach(() => {
    delete g.window;
  });

  it("initialEntries reads the stored copy synchronously, so the first render already has the country", () => {
    saveStoredCountry(loaded(FIXTURE_IN, 3, "api"));
    const entries = initialEntries("IN");
    expect(entries.IN?.best?.profile.code).toBe("IN");
    expect(entries.IN?.best?.source).toBe("stored");
    expect(entries.IN?.done).toBe(false);
    const active = resolveActive("IN", entries.IN, loaded(FIXTURE_BD, 0, "bundled"));
    expect(active.profile.currency.code).toBe("INR");
    expect(initialEntries("US")).toEqual({});
  });

  it("keeps only the current country and Bangladesh (and the regional figures)", () => {
    for (const p of [FIXTURE_BD, FIXTURE_IN]) saveStoredCountry(loaded(p, 0, "static"));
    map.set(`${COUNTRY_STORAGE_PREFIX}US`, "{}");
    map.set(`${COUNTRY_STORAGE_PREFIX}PK`, "{}");
    map.set(REGIONS_STORAGE_KEY, "{}");
    map.set("taka-plan.v1", "{}");
    expect(pruneStoredCountries(["IN", "BD"]).sort()).toEqual(["PK", "US"]);
    expect([...map.keys()].sort()).toEqual([countryStorageKey("BD"), countryStorageKey("IN"), REGIONS_STORAGE_KEY, "taka-plan.v1"].sort());
    expect(pruneStoredCountries(["BD"])).toEqual(["IN"]);
  });

  it("pruning without storage, or with a throwing one, does nothing", () => {
    delete g.window;
    expect(pruneStoredCountries(["BD"])).toEqual([]);
    g.window = {
      get localStorage() {
        throw new Error("SecurityError");
      },
    };
    expect(pruneStoredCountries(["BD"])).toEqual([]);
  });
});
