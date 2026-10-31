import { afterEach, describe, expect, it } from "vitest";
import { RATES_SEED, RATE_KEYS, assertSnapshot, type RatesSnapshot } from "@taka/engine";
import { setRatesRepoForTests } from "@/lib/server/env";
import { FakeRatesRepo } from "@/test/fakes/fakeRatesRepo";
import { ThrowingRatesRepo, missingTableError } from "@/test/fakes/throwingRatesRepo";
import { GET, etagFor, ifNoneMatchMatches } from "./route";

const NOW = "2026-11-01T10:00:00.000Z";

function request(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/rates", { headers });
}

afterEach(() => setRatesRepoForTests(null));

describe("GET /api/rates", () => {
  it("serves the published snapshot from the repo with ETag v1, public caching and X-Rates-Source: d1", async () => {
    setRatesRepoForTests(new FakeRatesRepo());
    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(res.headers.get("etag")).toBe('"v1"');
    expect(res.headers.get("cache-control")).toBe("public, max-age=300, stale-while-revalidate=86400");
    expect(res.headers.get("x-rates-source")).toBe("d1");
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    const body = (await res.json()) as RatesSnapshot;
    expect(body.version).toBe(1);
    expect(body.publishedAt).toBe("2026-10-30");
    expect(Object.keys(body.rows)).toHaveLength(RATE_KEYS.length);
    expect(() => assertSnapshot(body)).not.toThrow();
    expect(body.rows.inflation_cpi.value).toBe(0.0834);
  });

  it("answers 304 with the same ETag when If-None-Match matches", async () => {
    setRatesRepoForTests(new FakeRatesRepo());
    const res = await GET(request({ "If-None-Match": '"v1"' }));
    expect(res.status).toBe(304);
    expect(res.headers.get("etag")).toBe('"v1"');
    expect(res.headers.get("x-rates-source")).toBe("d1");
    expect(res.headers.get("cache-control")).toBe("public, max-age=300, stale-while-revalidate=86400");
    expect(await res.text()).toBe("");
  });

  it("accepts weak, bare and list forms of If-None-Match", async () => {
    setRatesRepoForTests(new FakeRatesRepo());
    for (const h of ['W/"v1"', "v1", '"v0", "v1"', "*"]) {
      const res = await GET(request({ "If-None-Match": h }));
      expect(res.status, h).toBe(304);
    }
    const miss = await GET(request({ "If-None-Match": '"v2"' }));
    expect(miss.status).toBe(200);
  });

  it("the ETag follows the published version", async () => {
    const repo = new FakeRatesRepo();
    await repo.ensureDraft(NOW);
    await repo.updateRow(2, "policy_rate", { value: 0.1 }, null, NOW);
    await repo.publish("cut", NOW, "sajat");
    setRatesRepoForTests(repo);
    const stale = await GET(request({ "If-None-Match": '"v1"' }));
    expect(stale.status).toBe(200);
    expect(stale.headers.get("etag")).toBe('"v2"');
    const body = (await stale.json()) as RatesSnapshot;
    expect(body.version).toBe(2);
    expect(body.rows.policy_rate.value).toBe(0.1);
    expect((await GET(request({ "If-None-Match": '"v2"' }))).status).toBe(304);
  });

  it("falls back to the bundled seed (200, no-store, X-Rates-Source: fallback) when the repo throws", async () => {
    setRatesRepoForTests(new ThrowingRatesRepo());
    const res = await GET(request({ "If-None-Match": '"v1"' }));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-rates-source")).toBe("fallback");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("etag")).toBeNull();
    const body = (await res.json()) as RatesSnapshot;
    expect(body).toEqual(assertSnapshot(RATES_SEED));
    expect(Object.keys(body.rows)).toHaveLength(RATE_KEYS.length);
    expect(JSON.stringify(body)).not.toMatch(/simulated failure/);
  });

  it("falls back on an unmigrated database (no such table)", async () => {
    setRatesRepoForTests(new ThrowingRatesRepo(missingTableError()));
    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(res.headers.get("x-rates-source")).toBe("fallback");
    expect(((await res.json()) as RatesSnapshot).version).toBe(1);
  });

  it("falls back when no repo is configured (D1 binding missing)", async () => {
    setRatesRepoForTests(null);
    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(res.headers.get("x-rates-source")).toBe("fallback");
    expect(((await res.json()) as RatesSnapshot).version).toBe(1);
  });

  it("falls back when the repo returns an invalid snapshot", async () => {
    const broken = new FakeRatesRepo();
    broken.getPublished = async () => ({ version: 7, publishedAt: "2026-11-01", rows: {} as RatesSnapshot["rows"] });
    setRatesRepoForTests(broken);
    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(res.headers.get("x-rates-source")).toBe("fallback");
    expect(((await res.json()) as RatesSnapshot).version).toBe(1);
  });
});

describe("etag helpers", () => {
  it("formats and matches", () => {
    expect(etagFor(12)).toBe('"v12"');
    expect(ifNoneMatchMatches(null, '"v1"')).toBe(false);
    expect(ifNoneMatchMatches("", '"v1"')).toBe(false);
    expect(ifNoneMatchMatches('"v1"', '"v1"')).toBe(true);
    expect(ifNoneMatchMatches('"v10"', '"v1"')).toBe(false);
    expect(ifNoneMatchMatches(' W/"v1" , "v3"', '"v1"')).toBe(true);
  });
});
