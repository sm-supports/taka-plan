// Review slice C: strict meta cleaning, field limits, future dates, the 48 KB profile cap and
// publish-time checks (S2, S3, S4).
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FIXTURE_IN, FIXTURE_US, type CountryField } from "@taka/engine";
import { ADMIN_COOKIE, readCookie } from "@/lib/server/admin-auth";
import { MAX_PROFILE_BYTES, addDays, cleanMetaPatch, isRealDate, pickJsonShape, profileBytes, todayUtc } from "@/lib/server/country-clean";
import { cleanCountryField } from "@/lib/server/country-db";
import { setCountryRepoForTests, setRatesRepoForTests } from "@/lib/server/env";
import type { StoredCountry } from "@/lib/server/country-repo";
import { FakeCountryRepo } from "@/test/fakes/fakeCountryRepo";
import { FakeRatesRepo } from "@/test/fakes/fakeRatesRepo";
import { POST as login } from "../login/route";
import { PUT as putCountry } from "./country/route";
import { POST as publish } from "./publish/route";

const BASE = "http://localhost/api/admin";
const CSRF = { "content-type": "application/json", "x-requested-with": "taka-admin" };
const SRC = { sourceName: "Reserve Bank of India", sourceUrl: "https://www.rbi.org.in/", asOf: "2026-10-01" } as const;
const FDR: CountryField = { value: 0.07, status: "sourced", ...SRC };
const TODAY = todayUtc();

function req(method: "PUT" | "POST", path: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`${BASE}/${path}`, { method, headers: { ...CSRF, ...headers }, body: JSON.stringify(body) });
}

async function signIn(): Promise<Record<string, string>> {
  const res = await login(req("POST", "login", { password: "test-pass-123456" }));
  expect(res.status).toBe(204);
  return { cookie: `${ADMIN_COOKIE}=${readCookie(res.headers.get("set-cookie")!.split(";")[0], ADMIN_COOKIE)}` };
}

async function errorOf(res: Response): Promise<{ code: string; message: string }> {
  return ((await res.json()) as { error: { code: string; message: string } }).error;
}

let repo: FakeCountryRepo;
beforeEach(() => {
  repo = new FakeCountryRepo([FIXTURE_IN, FIXTURE_US]);
  setCountryRepoForTests(repo);
  setRatesRepoForTests(new FakeRatesRepo());
});
afterEach(() => {
  setCountryRepoForTests(null);
  setRatesRepoForTests(null);
});

describe("meta cleaner (S3)", () => {
  const instruments = FIXTURE_IN.instruments;
  const cases: [string, unknown, string][] = [
    ["unknown instrument slot", { instruments: { ...instruments, crypto: { available: true, localName: null } } }, "INVALID_META"],
    ["missing instrument slot", { instruments: { fdr_1y: instruments.fdr_1y } }, "INVALID_META"],
    ["unknown instrument property", { instruments: { ...instruments, dps: { ...instruments.dps, onclick: "x" } } }, "INVALID_META"],
    ["non-boolean available", { instruments: { ...instruments, dps: { available: "yes", localName: null } } }, "INVALID_META"],
    ["long local name", { instruments: { ...instruments, dps: { available: true, localName: "x".repeat(101) } } }, "INVALID_META"],
    ["instrument sourceUrl javascript:", { instruments: { ...instruments, dps: { available: true, localName: null, sourceUrl: "javascript:alert(1)" } } }, "INVALID_META"],
    ["unknown institution", { institutions: { centralBank: { name: "RBI", url: "https://www.rbi.org.in/" }, bestBroker: { name: "x", url: "https://x.example/" } } }, "INVALID_META"],
    ["unknown institution property", { institutions: { centralBank: { name: "RBI", url: "https://www.rbi.org.in/", logo: "x" } } }, "INVALID_META"],
    ["institution docs/ link", { institutions: { centralBank: { name: "RBI", url: "docs/PRD.md" } } }, "INVALID_META"],
    ["institution data: link", { institutions: { centralBank: { name: "RBI", url: "data:text/html,hi" } } }, "INVALID_META"],
    ["long institution note", { institutions: { centralBank: { name: "RBI", url: "https://www.rbi.org.in/", note: "x".repeat(1001) } } }, "INVALID_META"],
    ["long nameEn", { nameEn: "x".repeat(101) }, "INVALID_META"],
    ["blank reviewedBy", { reviewedBy: "  " }, "INVALID_META"],
    ["numeric nameNative", { nameNative: 7 }, "INVALID_META"],
    ["duplicate language", { languages: ["hi", "hi"] }, "INVALID_META"],
    ["currency extra property", { currency: { ...FIXTURE_IN.currency, rate: 1 } }, "INVALID_META"],
    ["usdRate out of range", { currency: { ...FIXTURE_IN.currency, usdRate: { ...FIXTURE_IN.currency.usdRate, value: 1e8 } } }, "INVALID_META"],
    ["usdRate missing status", { currency: { ...FIXTURE_IN.currency, usdRate: { ...FIXTURE_IN.currency.usdRate, status: "missing", value: null } } }, "INVALID_META"],
    ["researchedAt not a real date", { researchedAt: "2026-02-30" }, "INVALID_META"],
    ["researchedAt in the future (S2)", { researchedAt: addDays(TODAY, 2) }, "INVALID_DATE"],
    ["usdRate asOf two years ahead", { currency: { ...FIXTURE_IN.currency, usdRate: { ...FIXTURE_IN.currency.usdRate, asOf: addDays(TODAY, 800) } } }, "INVALID_DATE"],
  ];

  it("rejects every bad patch with 400 and creates no draft", async () => {
    const auth = await signIn();
    for (const [label, meta, code] of cases) {
      const res = await putCountry(req("PUT", "countries/IN", { meta }, auth), "IN");
      expect(res.status, label).toBe(400);
      expect((await errorOf(res)).code, label).toBe(code);
    }
    expect(await repo.getDraft("IN")).toBeNull();
  });

  it("accepts researchedAt today and tomorrow, and drops nothing it knows", async () => {
    const auth = await signIn();
    const res = await putCountry(req("PUT", "countries/IN", { meta: { researchedAt: TODAY } }, auth), "IN");
    expect(res.status).toBe(200);
    expect(((await res.json()) as StoredCountry).profile.researchedAt).toBe(TODAY);
    expect((await putCountry(req("PUT", "countries/IN", { meta: { researchedAt: addDays(TODAY, 1) } }, auth), "IN")).status).toBe(200);
    const inst = { centralBank: { name: "Reserve Bank of India", url: "https://www.rbi.org.in/", note: "monetary policy" }, statistics: null };
    const ok = await putCountry(req("PUT", "countries/IN", { meta: { institutions: inst } }, auth), "IN");
    expect(ok.status).toBe(200);
    expect(((await ok.json()) as StoredCountry).profile.institutions).toEqual(inst);
  });

  it("cleanMetaPatch copies values, so stray nested properties never survive", () => {
    const patch = cleanMetaPatch({ currency: FIXTURE_IN.currency, languages: ["hi", "en"] }, TODAY);
    expect(patch.currency).toEqual(FIXTURE_IN.currency);
    expect(patch.currency).not.toBe(FIXTURE_IN.currency);
    expect(() => cleanMetaPatch({ region: "south_asia" }, TODAY)).toThrow(/cannot be edited/);
  });

  it("refuses a change-log note over 1,000 characters", async () => {
    const auth = await signIn();
    const res = await putCountry(req("PUT", "countries/IN", { field: "fdr_1y_rate", value: FDR, note: "n".repeat(1001) }, auth), "IN");
    expect(res.status).toBe(400);
    expect((await errorOf(res)).code).toBe("BAD_NOTE");
    expect(await repo.getDraft("IN")).toBeNull();
  });
});

describe("field limits (S2, S3, S4)", () => {
  it("rejects long sources and notes, unreal and far-future asOf dates", async () => {
    const auth = await signIn();
    const cases: [string, CountryField, string][] = [
      ["long sourceName", { ...FDR, sourceName: "s".repeat(301) }, "INVALID_FIELD"],
      ["long sourceUrl", { ...FDR, sourceUrl: `https://x.example/${"p".repeat(300)}` }, "INVALID_FIELD"],
      ["long note", { ...FDR, note: "n".repeat(1001) }, "INVALID_FIELD"],
      ["unreal asOf", { ...FDR, asOf: "2026-13-01" }, "INVALID_DATE"],
      ["asOf 2026-02-30", { ...FDR, asOf: "2026-02-30" }, "INVALID_DATE"],
      ["asOf two years ahead", { ...FDR, asOf: addDays(TODAY, 800) }, "INVALID_DATE"],
    ];
    for (const [label, value, code] of cases) {
      const res = await putCountry(req("PUT", "countries/IN", { field: "fdr_1y_rate", value }, auth), "IN");
      expect(res.status, label).toBe(400);
      // The engine validator (country/validate.ts) may refuse the same figure first, as INVALID_FIELD.
      const got = (await errorOf(res)).code;
      expect(code === "INVALID_DATE" ? ["INVALID_DATE", "INVALID_FIELD"] : [code], label).toContain(got);
    }
    expect(await repo.getDraft("IN")).toBeNull();
  });

  it("strips properties a JSON shape does not know, at every level", async () => {
    const auth = await signIn();
    const gratuity = { value: null, status: "sourced", ...SRC, valueJson: { daysPerYear: 15, daysPerMonth: 26, script: "<b>", nested: { a: 1 } } };
    const res = await putCountry(req("PUT", "countries/IN", { field: "gratuity_rule", value: gratuity }, auth), "IN");
    expect(res.status).toBe(200);
    expect(((await res.json()) as StoredCountry).profile.fields.gratuity_rule?.valueJson).toEqual({ daysPerYear: 15, daysPerMonth: 26 });
    expect(pickJsonShape("support_ratio", { points: [{ year: 2026, value: 8, x: 1 }], extra: true })).toEqual({ points: [{ year: 2026, value: 8 }] });
    expect(pickJsonShape("insurance_term_premium_table", { per: 1000, smokerMultiplier: 1.5, bands: [{ maxAge: 40, low: 1, high: 2, junk: 0 }], j: 1 })).toEqual({
      per: 1000,
      smokerMultiplier: 1.5,
      bands: [{ maxAge: 40, low: 1, high: 2 }],
    });
    // Fixture data survives cleaning unchanged.
    for (const [k, f] of Object.entries(FIXTURE_IN.fields)) expect(cleanCountryField("IN", k as never, f, TODAY)).toEqual(f);
  });

  it("413 PROFILE_TOO_LARGE when an edit would push the profile over 48 KB; nothing is written", async () => {
    const auth = await signIn();
    const rows = Array.from({ length: 2300 }, (_, i) => ({ age: i % 120, total: 20.5 }));
    const table = { value: null, status: "sourced", ...SRC, valueJson: { rows } };
    const body = JSON.stringify({ field: "life_table_remaining", value: table });
    expect(body.length).toBeLessThan(64 * 1024);
    expect(profileBytes({ ...FIXTURE_IN, fields: { ...FIXTURE_IN.fields, life_table_remaining: table as CountryField } })).toBeGreaterThan(MAX_PROFILE_BYTES);
    const res = await putCountry(req("PUT", "countries/IN", { field: "life_table_remaining", value: table }, auth), "IN");
    expect(res.status).toBe(413);
    expect((await errorOf(res)).code).toBe("PROFILE_TOO_LARGE");
    expect(await repo.getDraft("IN")).toBeNull();
    // A table that fits is fine.
    const small = { ...table, valueJson: { rows: rows.slice(0, 40) } };
    expect((await putCountry(req("PUT", "countries/IN", { field: "life_table_remaining", value: small }, auth), "IN")).status).toBe(200);
  });

  it("isRealDate and addDays", () => {
    expect(isRealDate("2028-02-29")).toBe(true);
    expect(isRealDate("2027-02-29")).toBe(false);
    expect(isRealDate("2026-1-01")).toBe(false);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("publish checks (S2, S3)", () => {
  async function publishWithDraft(mutate: (d: StoredCountry) => StoredCountry): Promise<Response> {
    const auth = await signIn();
    await putCountry(req("PUT", "countries/IN", { field: "fdr_1y_rate", value: FDR }, auth), "IN");
    const real = repo.getDraft.bind(repo);
    repo.getDraft = async (code) => {
      const d = await real(code);
      return d && mutate(d);
    };
    return publish(req("POST", "countries/IN/publish", {}, auth), "IN");
  }

  it("refuses a draft whose researchedAt is in the future (it would outrank every client copy)", async () => {
    const res = await publishWithDraft((d) => ({ ...d, profile: { ...d.profile, researchedAt: addDays(TODAY, 30) } }));
    expect(res.status).toBe(400);
    const err = await errorOf(res);
    expect(err.code).toBe("INVALID_DRAFT");
    expect(err.message).toMatch(/researchedAt .* is in the future/);
    expect(await repo.getPublishedVersion("IN")).toBe(1);
  });

  it("refuses a draft over the size cap", async () => {
    const rows = Array.from({ length: 2300 }, (_, i) => ({ age: i % 120, total: 20.5 }));
    const res = await publishWithDraft((d) => ({ ...d, profile: { ...d.profile, fields: { ...d.profile.fields, life_table_remaining: { value: null, status: "sourced", ...SRC, valueJson: { rows } } } } }));
    expect(res.status).toBe(400);
    expect((await errorOf(res)).message).toMatch(/limit is 48 KB/);
    expect(await repo.getPublishedVersion("IN")).toBe(1);
  });

  it("refuses a change-log note over 1,000 characters", async () => {
    const auth = await signIn();
    await putCountry(req("PUT", "countries/IN", { field: "fdr_1y_rate", value: FDR }, auth), "IN");
    const res = await publish(req("POST", "countries/IN/publish", { note: "n".repeat(1001) }, auth), "IN");
    expect(res.status).toBe(400);
    expect(await repo.getPublishedVersion("IN")).toBe(1);
  });
});
