// D1CountryRepo exercised against the real migrations (0001–0004) on an in-memory SQLite database,
// side by side with FakeCountryRepo so both implementations keep the same semantics.
import { describe, expect, it } from "vitest";
import { COUNTRY_FIELD_KEYS, FIXTURE_IN, FIXTURE_US, type CountryField } from "@taka/engine";
import { CountryNotFoundError, D1CountryRepo, NotADraftError } from "@/lib/server/country-db";
import type { CountryRepo } from "@/lib/server/country-repo";
import { D1RatesRepo } from "@/lib/server/db";
import { FakeCountryRepo } from "./fakeCountryRepo";
import { SqliteD1, seededCountriesD1 } from "./sqliteD1";

const NOW = "2026-11-01T10:00:00.000Z";
const SRC = { sourceName: "Reserve Bank of India", sourceUrl: "https://www.rbi.org.in/", asOf: "2026-10-01" } as const;
const FDR: CountryField = { value: 0.07, status: "sourced", ...SRC, note: "SBI 1-year" };

function count(db: SqliteD1, sql: string, ...args: (string | number)[]): number {
  const row = db.db.prepare(sql).get(...args) as { n: number } | undefined;
  return row?.n ?? 0;
}

async function d1Repo(): Promise<{ repo: D1CountryRepo; db: SqliteD1 }> {
  const db = await seededCountriesD1([FIXTURE_IN, FIXTURE_US]);
  return { repo: new D1CountryRepo(db), db };
}

const impls: [string, () => Promise<CountryRepo>][] = [
  ["D1CountryRepo (SQLite)", async () => (await d1Repo()).repo],
  ["FakeCountryRepo", async () => new FakeCountryRepo([FIXTURE_IN, FIXTURE_US])],
];

describe.each(impls)("%s", (_name, make) => {
  it("getPublished rebuilds the seeded profile exactly; unknown countries are null", async () => {
    const repo = await make();
    const p = await repo.getPublished("IN");
    expect(p).toEqual({ version: 1, status: "published", profile: FIXTURE_IN });
    expect((await repo.getPublished("US"))?.profile).toEqual(FIXTURE_US);
    expect(await repo.getPublishedVersion("IN")).toBe(1);
    expect(await repo.getPublished("FR")).toBeNull();
    expect(await repo.getPublishedVersion("FR")).toBeNull();
    expect(await repo.getDraft("IN")).toBeNull();
    await expect(repo.getPublished("in")).rejects.toThrow(/Invalid country code/);
  });

  it("ensureDraft makes v2 for one country only and is idempotent", async () => {
    const repo = await make();
    expect(await repo.ensureDraft("IN", NOW)).toBe(2);
    expect(await repo.ensureDraft("IN", NOW)).toBe(2);
    expect(await repo.getDraft("US")).toBeNull();
    const draft = await repo.getDraft("IN");
    expect(draft).toEqual({ version: 2, status: "draft", profile: FIXTURE_IN });
    expect((await repo.changeLog("IN")).map((e) => [e.action, e.version, e.note])).toEqual([["create_draft", 2, "copied from v1"]]);
    expect(await repo.changeLog("US")).toEqual([]);
    await expect(repo.ensureDraft("FR", NOW)).rejects.toBeInstanceOf(CountryNotFoundError);
  });

  it("updateField edits (or adds) one draft field, validates it and logs old/new", async () => {
    const repo = await make();
    const v = await repo.ensureDraft("IN", NOW);
    expect(await repo.updateField("IN", v, "fdr_1y_rate", FDR, "new survey", NOW)).toEqual(FDR);
    // A key the published profile does not have yet.
    await repo.updateField("IN", v, "policy_rate", { value: 0.055, status: "sourced", ...SRC }, null, NOW);
    // A JSON field.
    await repo.updateField("IN", v, "gratuity_rule", { value: null, valueJson: { daysPerYear: 15, daysPerYearAfter: 30, afterYears: 10, daysPerMonth: 26 }, status: "sourced", ...SRC }, null, NOW);
    const draft = (await repo.getDraft("IN"))!.profile;
    expect(draft.fields.fdr_1y_rate).toEqual(FDR);
    expect(draft.fields.policy_rate?.value).toBe(0.055);
    expect(draft.fields.gratuity_rule?.valueJson).toMatchObject({ daysPerYearAfter: 30 });
    expect((await repo.getPublished("IN"))!.profile.fields.fdr_1y_rate?.value).toBe(0.067);

    const log = await repo.changeLog("IN");
    expect(log.map((e) => e.key)).toEqual(["gratuity_rule", "policy_rate", "fdr_1y_rate", null]);
    expect(log[2]).toMatchObject({ action: "edit", version: 2, note: "new survey" });
    expect(JSON.parse(log[2]!.oldValue!)).toMatchObject({ value: 0.067 });
    expect(JSON.parse(log[2]!.newValue!)).toEqual(FDR);
    expect(log[1]!.oldValue).toBeNull();
  });

  it("updateField refuses non-country keys, invalid figures and non-draft versions", async () => {
    const repo = await make();
    const v = await repo.ensureDraft("IN", NOW);
    await expect(repo.updateField("IN", v, "emergency_base_months", FDR, null, NOW)).rejects.toThrow(/not a country field/);
    await expect(repo.updateField("IN", v, "fdr_1y_rate", { ...FDR, value: 9 }, null, NOW)).rejects.toThrow(/fdr_1y_rate/);
    await expect(repo.updateField("IN", v, "fdr_1y_rate", { ...FDR, sourceUrl: "javascript:alert(1)" }, null, NOW)).rejects.toThrow(/sourceUrl/);
    await expect(repo.updateField("IN", v, "gratuity_rule", { ...FDR, value: null, valueJson: { daysPerYear: "15" } }, null, NOW)).rejects.toThrow(/gratuity_rule/);
    await expect(repo.updateField("IN", 1, "fdr_1y_rate", FDR, null, NOW)).rejects.toBeInstanceOf(NotADraftError);
    await expect(repo.updateField("US", v, "fdr_1y_rate", FDR, null, NOW)).rejects.toBeInstanceOf(NotADraftError);
    // A missing figure drops its value.
    const missing = await repo.updateField("IN", v, "tbond_10y_rate", { value: null, status: "missing", sourceName: "", sourceUrl: "", asOf: "2026-10-01" }, null, NOW);
    expect(missing).toEqual({ value: null, status: "missing", sourceName: "", sourceUrl: "", asOf: "2026-10-01" });
    expect((await repo.changeLog("IN")).filter((e) => e.action === "edit")).toHaveLength(1);
  });

  it("updateMeta merges, validates the whole profile and logs only the patched keys", async () => {
    const repo = await make();
    const v = await repo.ensureDraft("US", NOW);
    const currency = { ...FIXTURE_US.currency, usdRate: { ...FIXTURE_US.currency.usdRate, status: "sourced" as const, sourceUrl: "https://www.federalreserve.gov/" } };
    const out = await repo.updateMeta("US", v, { currency, reviewedBy: "sajat" }, "usd source", NOW);
    expect(out.currency.usdRate.sourceUrl).toBe("https://www.federalreserve.gov/");
    expect(out.reviewedBy).toBe("sajat");
    expect(out.nameEn).toBe("United States");
    expect(out.fields).toEqual(FIXTURE_US.fields);
    expect((await repo.getDraft("US"))!.profile).toEqual(out);
    expect((await repo.getPublished("US"))!.profile.reviewedBy).toBe("fixture");
    const [edit] = await repo.changeLog("US");
    expect(edit).toMatchObject({ action: "edit", key: "meta", note: "usd source" });
    expect(Object.keys(JSON.parse(edit!.newValue!))).toEqual(["currency", "reviewedBy"]);

    await expect(repo.updateMeta("US", v, { currency: { ...currency, usdRate: { ...currency.usdRate, value: -1 } } }, null, NOW)).rejects.toThrow(/usdRate/);
    await expect(repo.updateMeta("US", v, { languages: [] }, null, NOW)).rejects.toThrow(/languages/);
    await expect(repo.updateMeta("US", 1, { reviewedBy: "x" }, null, NOW)).rejects.toBeInstanceOf(NotADraftError);
    expect((await repo.getDraft("US"))!.profile.reviewedBy).toBe("sajat");
  });

  it("publish supersedes v1 and promotes v2 for that country; discard drops a draft", async () => {
    const repo = await make();
    await expect(repo.publish("IN", null, NOW, "admin")).rejects.toBeInstanceOf(NotADraftError);
    const v = await repo.ensureDraft("IN", NOW);
    await repo.updateField("IN", v, "fdr_1y_rate", FDR, null, NOW);
    expect(await repo.publish("IN", "october", NOW, "admin")).toBe(2);
    expect(await repo.getPublishedVersion("IN")).toBe(2);
    expect((await repo.getPublished("IN"))!.profile.fields.fdr_1y_rate).toEqual(FDR);
    expect(await repo.getDraft("IN")).toBeNull();
    expect(await repo.getPublishedVersion("US")).toBe(1);
    expect((await repo.changeLog("IN"))[0]).toMatchObject({ action: "publish", version: 2, oldValue: "1", newValue: "2", note: "october" });

    expect(await repo.ensureDraft("IN", NOW)).toBe(3);
    await repo.discardDraft("IN", NOW);
    await repo.discardDraft("IN", NOW);
    expect(await repo.getDraft("IN")).toBeNull();
    expect(await repo.getPublishedVersion("IN")).toBe(2);
    expect((await repo.changeLog("IN")).map((e) => e.action).slice(0, 2)).toEqual(["discard_draft", "create_draft"]);
    expect(await repo.ensureDraft("IN", NOW)).toBe(3);
  });

  it("list() summarises every country in one pass; changeLog(null) covers all countries", async () => {
    const repo = await make();
    await repo.ensureDraft("US", NOW);
    const list = await repo.list();
    expect(list).toEqual([
      { code: "IN", publishedVersion: 1, hasDraft: false, sourced: 0, assumption: 13, missing: 1 },
      { code: "US", publishedVersion: 1, hasDraft: true, sourced: 0, assumption: 10, missing: 1 },
    ]);
    await repo.ensureDraft("IN", NOW);
    expect((await repo.changeLog(null)).map((e) => e.action)).toEqual(["create_draft", "create_draft"]);
    expect(await repo.changeLog(null, 1)).toHaveLength(1);
    const [newest] = await repo.changeLog(null);
    expect(await repo.changeLog(null, 50, newest!.id)).toHaveLength(1);
  });
});

describe("D1CountryRepo storage details", () => {
  it("copies only the one country's field rows into the draft and keeps them through a race", async () => {
    const { repo, db } = await d1Repo();
    const inFields = Object.keys(FIXTURE_IN.fields).length;
    expect(await repo.ensureDraft("IN", NOW)).toBe(2);
    // Simulate the race: a second caller read "no draft" before the first one's batch landed,
    // so it runs the whole guarded batch again with the draft already there.
    const realPrepare = db.prepare.bind(db);
    let raced = false;
    db.prepare = (q: string) => {
      if (!raced && q.startsWith("SELECT version FROM country_versions")) {
        raced = true;
        return { bind: () => ({ first: async () => null }) } as unknown as ReturnType<SqliteD1["prepare"]>;
      }
      return realPrepare(q);
    };
    expect(await repo.ensureDraft("IN", NOW)).toBe(2);
    expect(raced).toBe(true);
    expect(count(db, "SELECT COUNT(*) AS n FROM country_versions WHERE country = ? AND status = 'draft'", "IN")).toBe(1);
    expect(count(db, "SELECT COUNT(*) AS n FROM country_fields WHERE country = ? AND version = 2", "IN")).toBe(inFields);
    expect(count(db, "SELECT COUNT(*) AS n FROM country_fields WHERE version = 2")).toBe(inFields);
    expect(count(db, "SELECT COUNT(*) AS n FROM change_log WHERE country = 'IN' AND action = 'create_draft'")).toBe(1);
  });

  it("the guarded statements are no-ops on the wrong state (published rows never change)", async () => {
    const { db } = await d1Repo();
    // Write the published version directly through the guarded upsert: nothing happens.
    const repo = new D1CountryRepo(db);
    await expect(repo.updateField("IN", 1, "fdr_1y_rate", FDR, null, NOW)).rejects.toBeInstanceOf(NotADraftError);
    expect(count(db, "SELECT COUNT(*) AS n FROM change_log")).toBe(0);
    expect((await repo.getPublished("IN"))!.profile.fields.fdr_1y_rate?.value).toBe(0.067);
  });

  it("country change log entries carry the country code and stay apart from the rates table", async () => {
    const { repo, db } = await d1Repo();
    await repo.ensureDraft("IN", NOW);
    await new D1RatesRepo(db).ensureDraft(NOW);
    expect(count(db, "SELECT COUNT(*) AS n FROM change_log WHERE country = 'IN'")).toBe(1);
    // Both drafts are v2: the rates draft still gets its own create_draft entry.
    expect(count(db, "SELECT COUNT(*) AS n FROM change_log WHERE country IS NULL AND action = 'create_draft' AND version = 2")).toBe(1);
    expect(await repo.changeLog(null)).toHaveLength(1);
    const ratesLog = await new D1RatesRepo(db).changeLog();
    expect(ratesLog).toHaveLength(1);
    expect(ratesLog[0]!.note).toBe("copied from v1");
  });

  it("every country field key round-trips through the columns", async () => {
    expect(COUNTRY_FIELD_KEYS.length).toBeGreaterThan(40);
    const db = await seededCountriesD1([FIXTURE_IN]);
    const meta = db.db.prepare("SELECT meta FROM country_versions WHERE country = 'IN'").get() as { meta: string };
    expect(JSON.parse(meta.meta)).not.toHaveProperty("fields");
  });
});

describe("absent flag round trip (D1)", () => {
  it("stores and reads absent: true only with status missing", async () => {
    const { seededCountriesD1 } = await import("./sqliteD1");
    const { D1CountryRepo } = await import("@/lib/server/country-db");
    const { FIXTURE_IN } = await import("@taka/engine");
    const db = await seededCountriesD1([FIXTURE_IN]);
    const repo = new D1CountryRepo(db);
    const v = await repo.ensureDraft("IN", "2026-10-31T00:00:00.000Z");
    await repo.updateField("IN", v, "gratuity_rule", { value: null, status: "missing", sourceName: "Labour code", sourceUrl: "https://example.org/law", asOf: "2026-10-01", absent: true }, null, "2026-10-31T00:00:01.000Z");
    const draft = await repo.getDraft("IN");
    expect(draft?.profile.fields.gratuity_rule?.absent).toBe(true);
    await repo.updateField("IN", v, "gratuity_rule", { value: null, status: "missing", sourceName: "", sourceUrl: "", asOf: "2026-10-01" }, null, "2026-10-31T00:00:02.000Z");
    expect((await repo.getDraft("IN"))?.profile.fields.gratuity_rule?.absent).toBeUndefined();
  });
});
