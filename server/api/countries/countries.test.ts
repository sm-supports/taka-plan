import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FIXTURE_IN, FIXTURE_US } from "@taka/engine";
import { setCountryRepoForTests } from "@/lib/server/env";
import type { CountryRepo } from "@/lib/server/country-repo";
import { FakeCountryRepo, ThrowingCountryRepo } from "@/test/fakes/fakeCountryRepo";
import type { PublicCountryList, PublicCountryResponse } from "@/components/admin/countryTypes";
import { GET as getCountry } from "./profile/route";
import { GET as listCountries } from "./route";
import { countryEtag, parseCountryCode } from "./shared";

const NOW = "2026-11-01T10:00:00.000Z";
const CACHE = "public, max-age=300, stale-while-revalidate=86400";

function request(code: string, headers: Record<string, string> = {}): Request {
  return new Request(`http://localhost/api/countries/${code}`, { headers });
}

/** Counts calls per repo method, to check the cheap 304 path. */
function counting(repo: CountryRepo): { repo: CountryRepo; calls: Record<string, number> } {
  const calls: Record<string, number> = {};
  const proxy = new Proxy(repo, {
    get(target, prop, receiver) {
      const v = Reflect.get(target, prop, receiver) as unknown;
      if (typeof v !== "function") return v;
      return (...args: unknown[]) => {
        calls[String(prop)] = (calls[String(prop)] ?? 0) + 1;
        return (v as (...a: unknown[]) => unknown).apply(target, args);
      };
    },
  });
  return { repo: proxy, calls };
}

let fake: FakeCountryRepo;
beforeEach(() => {
  fake = new FakeCountryRepo([FIXTURE_IN, FIXTURE_US]);
  setCountryRepoForTests(fake);
});
afterEach(() => setCountryRepoForTests(null));

describe("GET /api/countries/:code", () => {
  it("serves the published profile with its version, ETag, public caching and X-Country-Source: d1", async () => {
    const res = await getCountry(request("IN"), "IN");
    expect(res.status).toBe(200);
    expect(res.headers.get("etag")).toBe('"IN-v1"');
    expect(res.headers.get("cache-control")).toBe(CACHE);
    expect(res.headers.get("x-country-source")).toBe("d1");
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    const body = (await res.json()) as PublicCountryResponse;
    expect(body.version).toBe(1);
    const { version: _v, ...profile } = body;
    expect(profile).toEqual(FIXTURE_IN);
  });

  it("accepts a lower-case code and rejects malformed ones with 400", async () => {
    expect((await getCountry(request("us"), "us")).headers.get("etag")).toBe('"US-v1"');
    for (const bad of ["", "USA", "1N", "I", "../x"]) {
      const res = await getCountry(request(bad), bad);
      expect(res.status, bad).toBe(400);
      expect(((await res.json()) as { error: { code: string } }).error.code).toBe("BAD_COUNTRY");
    }
  });

  it("answers 304 from the version alone when If-None-Match matches", async () => {
    const { repo, calls } = counting(fake);
    setCountryRepoForTests(repo);
    for (const h of ['"IN-v1"', 'W/"IN-v1"', "IN-v1", '"IN-v0", "IN-v1"', "*"]) {
      const res = await getCountry(request("IN", { "If-None-Match": h }), "IN");
      expect(res.status, h).toBe(304);
      expect(res.headers.get("etag")).toBe('"IN-v1"');
      expect(res.headers.get("cache-control")).toBe(CACHE);
      expect(await res.text()).toBe("");
    }
    expect(calls.getPublished).toBeUndefined();
    expect(calls.getPublishedVersion).toBe(5);
    expect((await getCountry(request("IN", { "If-None-Match": '"US-v1"' }), "IN")).status).toBe(200);
  });

  it("the ETag follows the published version", async () => {
    const v = await fake.ensureDraft("IN", NOW);
    await fake.updateField("IN", v, "policy_rate", { value: 0.055, status: "sourced", sourceName: "RBI", sourceUrl: "https://www.rbi.org.in/", asOf: "2026-10-01" }, null, NOW);
    await fake.publish("IN", null, NOW, "admin");
    const res = await getCountry(request("IN", { "If-None-Match": '"IN-v1"' }), "IN");
    expect(res.status).toBe(200);
    expect(res.headers.get("etag")).toBe('"IN-v2"');
    const body = (await res.json()) as PublicCountryResponse;
    expect(body.version).toBe(2);
    expect(body.fields.policy_rate?.value).toBe(0.055);
    expect((await getCountry(request("IN", { "If-None-Match": '"IN-v2"' }), "IN")).status).toBe(304);
  });

  it("404 JSON for a country with no published version (even with If-None-Match)", async () => {
    for (const headers of [{}, { "If-None-Match": '"FR-v1"' }] as Record<string, string>[]) {
      const res = await getCountry(request("FR", headers), "FR");
      expect(res.status).toBe(404);
      expect(((await res.json()) as { error: { code: string } }).error.code).toBe("NOT_FOUND");
      expect(res.headers.get("etag")).toBeNull();
    }
  });

  it("503 JSON with no-store when D1 fails or is not bound, never a throw", async () => {
    setCountryRepoForTests(new ThrowingCountryRepo());
    for (const headers of [{}, { "If-None-Match": '"IN-v1"' }] as Record<string, string>[]) {
      const res = await getCountry(request("IN", headers), "IN");
      expect(res.status).toBe(503);
      expect(res.headers.get("cache-control")).toBe("no-store");
      expect(JSON.stringify(await res.json())).not.toMatch(/simulated/);
    }
    setCountryRepoForTests(null);
    const unbound = await getCountry(request("IN"), "IN");
    expect(unbound.status).toBe(503);
  });

  it("503 when the stored profile fails validation", async () => {
    const broken = new FakeCountryRepo([FIXTURE_IN]);
    broken.getPublished = async () => ({ version: 1, status: "published", profile: { ...FIXTURE_IN, languages: [] } });
    setCountryRepoForTests(broken);
    expect((await getCountry(request("IN"), "IN")).status).toBe(503);
  });
});

describe("GET /api/countries", () => {
  it("lists published countries with version and counts, and no draft state", async () => {
    await fake.ensureDraft("US", NOW);
    const res = await listCountries();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe(CACHE);
    const body = (await res.json()) as PublicCountryList;
    expect(body.countries).toEqual([
      { code: "IN", version: 1, sourced: 0, assumption: 13, missing: 1 },
      { code: "US", version: 1, sourced: 0, assumption: 10, missing: 1 },
    ]);
    expect(JSON.stringify(body)).not.toMatch(/hasDraft/);
  });

  it("503 with no-store on a D1 failure", async () => {
    setCountryRepoForTests(new ThrowingCountryRepo());
    const res = await listCountries();
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});

describe("helpers", () => {
  it("formats ETags and parses codes", () => {
    expect(countryEtag("IN", 12)).toBe('"IN-v12"');
    expect(parseCountryCode("bd")).toBe("BD");
    expect(() => parseCountryCode("BGD")).toThrow(/two letters/);
  });
});
