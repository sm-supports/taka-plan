import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FIXTURE_IN, FIXTURE_US, SAMPLE_PROFILE_IDS, type CountryField } from "@taka/engine";
import { ADMIN_COOKIE, readCookie } from "@/lib/server/admin-auth";
import { setCountryRepoForTests, setRatesRepoForTests } from "@/lib/server/env";
import type { StoredCountry } from "@/lib/server/country-repo";
import { FakeCountryRepo } from "@/test/fakes/fakeCountryRepo";
import { FakeRatesRepo } from "@/test/fakes/fakeRatesRepo";
import type { AdminCountryList, AdminCountryResponse, CountryPreviewResponse } from "@/components/admin/countryTypes";
import { POST as login } from "../login/route";
import { GET as list } from "./route";
import { GET as getCountry, PUT as putCountry } from "./country/route";
import { POST as publish } from "./publish/route";
import { POST as discard } from "./discard/route";
import { GET as preview } from "./preview/route";

const BASE = "http://localhost/api/admin";
const CSRF = { "content-type": "application/json", "x-requested-with": "taka-admin" };
const SRC = { sourceName: "Reserve Bank of India", sourceUrl: "https://www.rbi.org.in/", asOf: "2026-10-01" } as const;
const FDR: CountryField = { value: 0.07, status: "sourced", ...SRC };

function post(path: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`${BASE}/${path}`, { method: "POST", headers: { ...CSRF, ...headers }, body: JSON.stringify(body) });
}
function put(path: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`${BASE}/${path}`, { method: "PUT", headers: { ...CSRF, ...headers }, body: JSON.stringify(body) });
}
function get(path: string, headers: Record<string, string> = {}): Request {
  return new Request(`${BASE}/${path}`, { headers });
}

async function signIn(): Promise<Record<string, string>> {
  const res = await login(post("login", { password: "test-pass-123456" }));
  expect(res.status).toBe(204);
  const token = readCookie(res.headers.get("set-cookie")!.split(";")[0], ADMIN_COOKIE);
  return { cookie: `${ADMIN_COOKIE}=${token}` };
}

async function errorCode(res: Response): Promise<string> {
  return ((await res.json()) as { error: { code: string } }).error.code;
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

describe("admin country routes", () => {
  it("every handler is 401 without a cookie", async () => {
    expect((await list(get("countries"))).status).toBe(401);
    expect((await getCountry(get("countries/IN"), "IN")).status).toBe(401);
    expect((await putCountry(put("countries/IN", { field: "fdr_1y_rate", value: FDR }), "IN")).status).toBe(401);
    expect((await publish(post("countries/IN/publish", {}), "IN")).status).toBe(401);
    expect((await discard(post("countries/IN/discard", {}), "IN")).status).toBe(401);
    expect((await preview(get("countries/IN/preview"), "IN")).status).toBe(401);
    expect((await getCountry(get("countries/IN", { cookie: `${ADMIN_COOKIE}=1.abc` }), "IN")).status).toBe(401);
  });

  it("mutations need JSON + X-Requested-With, else 403", async () => {
    const auth = await signIn();
    expect((await putCountry(put("countries/IN", { field: "fdr_1y_rate", value: FDR }, { ...auth, "x-requested-with": "" }), "IN")).status).toBe(403);
    expect((await putCountry(put("countries/IN", { field: "fdr_1y_rate", value: FDR }, { ...auth, "content-type": "text/plain" }), "IN")).status).toBe(403);
    expect((await publish(post("countries/IN/publish", {}, { ...auth, "x-requested-with": "nope" }), "IN")).status).toBe(403);
    expect((await discard(post("countries/IN/discard", {}, { ...auth, "x-requested-with": "" }), "IN")).status).toBe(403);
    expect(await repo.getDraft("IN")).toBeNull();
  });

  it("GET list returns every country with counts and draft state", async () => {
    const auth = await signIn();
    await repo.ensureDraft("US", "2026-11-01T00:00:00.000Z");
    const res = await list(get("countries", auth));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = (await res.json()) as AdminCountryList;
    expect(body.countries).toEqual([
      { code: "IN", publishedVersion: 1, hasDraft: false, sourced: 0, assumption: 13, missing: 1 },
      { code: "US", publishedVersion: 1, hasDraft: true, sourced: 0, assumption: 10, missing: 1 },
    ]);
  });

  it("GET one country: published, no draft, empty log; 404 for an unknown country, 400 for a bad code", async () => {
    const auth = await signIn();
    const res = await getCountry(get("countries/in", auth), "in");
    expect(res.status).toBe(200);
    const body = (await res.json()) as AdminCountryResponse;
    expect(body.code).toBe("IN");
    expect(body.published).toEqual({ version: 1, status: "published", profile: FIXTURE_IN });
    expect(body.draft).toBeNull();
    expect(body.changeLog).toEqual([]);
    const missing = await getCountry(get("countries/FR", auth), "FR");
    expect(missing.status).toBe(404);
    expect(await errorCode(missing)).toBe("NOT_FOUND");
    expect((await getCountry(get("countries/FRA", auth), "FRA")).status).toBe(400);
  });

  it("PUT a field creates draft v2 for that country only and returns the draft", async () => {
    const auth = await signIn();
    const res = await putCountry(put("countries/IN", { field: "fdr_1y_rate", value: { ...FDR, extra: "dropped" }, note: "survey" }, auth), "IN");
    expect(res.status).toBe(200);
    const draft = (await res.json()) as StoredCountry;
    expect(draft.version).toBe(2);
    expect(draft.status).toBe("draft");
    expect(draft.profile.code).toBe("IN");
    expect(draft.profile.fields.fdr_1y_rate).toEqual(FDR);
    expect(await repo.getDraft("US")).toBeNull();

    const all = (await (await getCountry(get("countries/IN", auth), "IN")).json()) as AdminCountryResponse;
    expect(all.published?.profile.fields.fdr_1y_rate?.value).toBe(0.067);
    expect(all.draft?.version).toBe(2);
    expect(all.changeLog.map((e) => e.action)).toEqual(["edit", "create_draft"]);
    expect(all.changeLog[0]).toMatchObject({ key: "fdr_1y_rate", version: 2, note: "survey" });
  });

  it("PUT validation: 400 for bad bodies, non-country keys and invalid figures; nothing reaches the store", async () => {
    const auth = await signIn();
    const cases: [unknown, string][] = [
      [{}, "BAD_REQUEST"],
      [{ field: "fdr_1y_rate", value: FDR, meta: { reviewedBy: "x" } }, "BAD_REQUEST"],
      [{ field: "emergency_base_months", value: FDR }, "BAD_FIELD"],
      [{ field: "nope", value: FDR }, "BAD_FIELD"],
      [{ field: "fdr_1y_rate", value: { ...FDR, value: "7%" } }, "INVALID_FIELD"],
      [{ field: "fdr_1y_rate", value: { ...FDR, value: 9 } }, "INVALID_FIELD"],
      [{ field: "fdr_1y_rate", value: { ...FDR, sourceUrl: "javascript:alert(1)" } }, "INVALID_FIELD"],
      [{ field: "fdr_1y_rate", value: { ...FDR, asOf: "01/10/2026" } }, "INVALID_FIELD"],
      [{ field: "gratuity_rule", value: { ...FDR, value: null, valueJson: { daysPerYear: "15" } } }, "INVALID_FIELD"],
      [{ field: "fdr_1y_rate", value: null }, "INVALID_FIELD"],
      [{ meta: { code: "XX" } }, "BAD_PATCH"],
      [{ meta: { fields: {} } }, "BAD_PATCH"],
      [{ meta: {} }, "BAD_PATCH"],
      [{ meta: [] }, "BAD_PATCH"],
    ];
    for (const [body, code] of cases) {
      const res = await putCountry(put("countries/IN", body, auth), "IN");
      expect(res.status, JSON.stringify(body)).toBe(400);
      expect(await errorCode(res), JSON.stringify(body)).toBe(code);
    }
    expect(await repo.getDraft("IN")).toBeNull();
    // An invalid meta value is refused before any draft exists; with a draft, the draft keeps the old value.
    const badMeta = await putCountry(put("countries/IN", { meta: { languages: ["Hindi"] } }, auth), "IN");
    expect(badMeta.status).toBe(400);
    expect(await errorCode(badMeta)).toBe("INVALID_META");
    expect(await repo.getDraft("IN")).toBeNull();
    await putCountry(put("countries/IN", { field: "fdr_1y_rate", value: FDR }, auth), "IN");
    expect((await putCountry(put("countries/IN", { meta: { languages: ["Hindi"] } }, auth), "IN")).status).toBe(400);
    expect((await repo.getDraft("IN"))?.profile.languages).toEqual(FIXTURE_IN.languages);
    // Unknown country.
    expect((await putCountry(put("countries/FR", { field: "fdr_1y_rate", value: FDR }, auth), "FR")).status).toBe(404);
  });

  it("PUT meta merges currency and instrument names into the draft", async () => {
    const auth = await signIn();
    const currency = { ...FIXTURE_IN.currency, usdRate: { ...FIXTURE_IN.currency.usdRate, value: 85.5 } };
    const instruments = { ...FIXTURE_IN.instruments, fdr_1y: { available: true, localName: "सावधि जमा", localNameEn: "Fixed deposit" } };
    const res = await putCountry(put("countries/IN", { meta: { currency, instruments }, note: "fx" }, auth), "IN");
    expect(res.status).toBe(200);
    const draft = (await res.json()) as StoredCountry;
    expect(draft.profile.currency.usdRate.value).toBe(85.5);
    expect(draft.profile.instruments.fdr_1y.localNameEn).toBe("Fixed deposit");
    expect(draft.profile.nameEn).toBe("India");
    expect(draft.profile.fields).toEqual(FIXTURE_IN.fields);
  });

  it("rejects bodies over 64 KB with 413", async () => {
    const auth = await signIn();
    const res = await putCountry(put("countries/IN", { field: "fdr_1y_rate", value: FDR, note: "x".repeat(70 * 1024) }, auth), "IN");
    expect(res.status).toBe(413);
  });

  it("publish bumps the version (409 without a draft); discard drops the draft", async () => {
    const auth = await signIn();
    const none = await publish(post("countries/IN/publish", { note: "x" }, auth), "IN");
    expect(none.status).toBe(409);
    expect(await errorCode(none)).toBe("NO_DRAFT");

    await putCountry(put("countries/IN", { field: "fdr_1y_rate", value: FDR }, auth), "IN");
    const res = await publish(post("countries/IN/publish", { note: "october" }, auth), "IN");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ version: 2 });
    expect(await repo.getPublishedVersion("IN")).toBe(2);
    expect(await repo.getPublishedVersion("US")).toBe(1);
    const after = (await (await getCountry(get("countries/IN", auth), "IN")).json()) as AdminCountryResponse;
    expect(after.draft).toBeNull();
    expect(after.published?.profile.fields.fdr_1y_rate).toEqual(FDR);
    expect(after.changeLog[0]).toMatchObject({ action: "publish", version: 2, note: "october" });

    await putCountry(put("countries/IN", { field: "fdr_1y_rate", value: { ...FDR, value: 0.071 } }, auth), "IN");
    expect((await discard(post("countries/IN/discard", {}, auth), "IN")).status).toBe(204);
    expect((await discard(post("countries/IN/discard", {}, auth), "IN")).status).toBe(204);
    expect(await repo.getDraft("IN")).toBeNull();
    expect(await repo.getPublishedVersion("IN")).toBe(2);
    const counts = (await (await list(get("countries", auth))).json()) as AdminCountryList;
    expect(counts.countries.find((c) => c.code === "IN")).toEqual({ code: "IN", publishedVersion: 2, hasDraft: false, sourced: 1, assumption: 12, missing: 1 });
  });

  it("publish refuses an invalid draft with 400", async () => {
    const auth = await signIn();
    await putCountry(put("countries/IN", { field: "fdr_1y_rate", value: FDR }, auth), "IN");
    const real = repo.getDraft.bind(repo);
    repo.getDraft = async (code) => {
      const d = await real(code);
      return d && { ...d, profile: { ...d.profile, iso3: "india" } };
    };
    const res = await publish(post("countries/IN/publish", {}, auth), "IN");
    expect(res.status).toBe(400);
    expect(await errorCode(res)).toBe("INVALID_DRAFT");
    expect(await repo.getPublishedVersion("IN")).toBe(1);
  });

  it("preview compares the sample plans for this country's published profile and draft", async () => {
    const auth = await signIn();
    const noDraft = (await (await preview(get("countries/IN/preview", auth), "IN")).json()) as CountryPreviewResponse;
    expect(noDraft.code).toBe("IN");
    expect(noDraft.published.version).toBe(1);
    expect(noDraft.draft).toBeNull();
    expect(noDraft.changedFields).toEqual([]);
    expect(noDraft.profiles.map((p) => p.id)).toEqual([...SAMPLE_PROFILE_IDS]);
    for (const p of noDraft.profiles) {
      expect(p.draft).toBeNull();
      expect("error" in p.published ? p.published.error : typeof p.published.monthlyTotal).toMatch(/engine-|number/);
    }

    await putCountry(put("countries/IN", { field: "inflation_cpi", value: { value: 0.09, status: "sourced", ...SRC } }, auth), "IN");
    const currency = { ...FIXTURE_IN.currency, usdRate: { ...FIXTURE_IN.currency.usdRate, value: 90 } };
    await putCountry(put("countries/IN", { meta: { currency } }, auth), "IN");
    const res = await preview(get("countries/IN/preview", auth), "IN");
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = (await res.json()) as CountryPreviewResponse;
    expect(body.draft?.version).toBe(2);
    expect(body.changedFields).toEqual(["inflation_cpi"]);
    expect(body.changedMeta).toEqual(["currency"]);
    expect(body.profiles).toHaveLength(3);
    for (const p of body.profiles) expect(p.draft).not.toBeNull();

    expect((await preview(get("countries/FR/preview", auth), "FR")).status).toBe(404);
  });
});
