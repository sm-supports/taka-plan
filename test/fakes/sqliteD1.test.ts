// D1RatesRepo exercised against the real migrations on an in-memory SQLite database.
import { describe, expect, it } from "vitest";
import { RATES_SEED, RATE_KEYS, assertSnapshot } from "@taka/engine";
import { D1RatesRepo, NoPublishedVersionError } from "@/lib/server/db";
import { SqliteD1, seededSqliteD1 } from "./sqliteD1";

const NOW = "2026-11-01T10:00:00.000Z";

function count(db: SqliteD1, sql: string): number {
  const row = db.db.prepare(sql).get() as { n: number } | undefined;
  return row?.n ?? 0;
}

describe("D1RatesRepo over the real migrations", () => {
  it("getPublished returns the seed snapshot (v1, every RATE_KEYS row) and equals the bundled seed", async () => {
    const repo = new D1RatesRepo(seededSqliteD1());
    const s = await repo.getPublished();
    expect(s.version).toBe(1);
    expect(s.publishedAt).toBe("2026-10-30");
    expect(Object.keys(s.rows)).toHaveLength(RATE_KEYS.length);
    expect(() => assertSnapshot(s)).not.toThrow();
    expect(s.rows).toEqual(assertSnapshot(RATES_SEED).rows);
    expect(await repo.getDraft()).toBeNull();
    expect(await repo.getVersionRows(1)).toEqual(s);
    expect(await repo.getVersionRows(2)).toBeNull();
  });

  it("maps NULL columns to absent optional fields and JSON rows to valueJson", async () => {
    const repo = new D1RatesRepo(seededSqliteD1());
    const { rows } = await repo.getPublished();
    expect(rows.tax_slabs.value).toBeNull();
    expect(Array.isArray(rows.tax_slabs.valueJson)).toBe(true);
    expect(rows.inflation_cpi.valueJson).toBeUndefined();
    expect(rows.bank_deposit_avg_rate).not.toHaveProperty("rangeLow");
    expect(rows.bank_deposit_avg_rate).not.toHaveProperty("rangeHigh");
    expect(rows.bank_deposit_avg_rate).not.toHaveProperty("note");
    expect(rows.bank_deposit_avg_rate.labelBn).toBe("গড় ব্যাংক আমানত সুদহার");
    expect(rows.savings_account_rate.rangeLow).toBe(0.0125);
    expect(rows.savings_account_rate.rangeHigh).toBe(0.03);
    expect(rows.inflation_cpi.isAppAssumption).toBe(false);
    expect(rows.emergency_base_months.isAppAssumption).toBe(true);
  });

  it("throws NoPublishedVersionError on an empty (migrated) table and the raw SQLite error when unmigrated", async () => {
    const empty = new SqliteD1().migrate("0001_schema.sql");
    await expect(new D1RatesRepo(empty).getPublished()).rejects.toBeInstanceOf(NoPublishedVersionError);
    await expect(new D1RatesRepo(new SqliteD1()).getPublished()).rejects.toThrow(/no such table/);
  });

  it("ensureDraft creates v2 copied from v1 in one batch and is idempotent", async () => {
    const db = seededSqliteD1();
    const repo = new D1RatesRepo(db);
    expect(await repo.ensureDraft(NOW)).toBe(2);
    expect(await repo.ensureDraft(NOW)).toBe(2);
    expect(await repo.ensureDraft("2026-12-01T00:00:00.000Z")).toBe(2);
    const draft = await repo.getDraft();
    expect(draft?.version).toBe(2);
    expect(draft?.publishedAt).toBe("2026-11-01");
    expect(draft?.rows).toEqual((await repo.getPublished()).rows);
    expect(count(db, "SELECT COUNT(*) AS n FROM rates WHERE version = 2")).toBe(RATE_KEYS.length);
    expect(count(db, "SELECT COUNT(*) AS n FROM rate_versions")).toBe(2);
    const log = await repo.changeLog();
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ action: "create_draft", version: 2, actor: "admin", note: "copied from v1" });
  });

  it("ensureDraft is a no-op batch when a draft appeared between the read and the write", async () => {
    const db = seededSqliteD1();
    const repo = new D1RatesRepo(db);
    // Simulate the race: another writer inserted the draft after our "no draft" read.
    db.exec("INSERT INTO rate_versions (version, status, created_at) VALUES (2, 'draft', '2026-10-31')");
    db.exec(
      "INSERT INTO rates (version, key, value, value_json, unit, range_low, range_high, label_en, label_bn, source_name, source_url, as_of, reviewed_by, next_review, note, is_app_assumption) SELECT 2, key, value, value_json, unit, range_low, range_high, label_en, label_bn, source_name, source_url, as_of, reviewed_by, next_review, note, is_app_assumption FROM rates WHERE version = 1",
    );
    await db.batch([db.prepare("INSERT INTO change_log (at, actor, action, version) VALUES (?, 'admin', 'create_draft', 2)").bind("2026-10-31")]);
    expect(await repo.ensureDraft(NOW)).toBe(2);
    expect(count(db, "SELECT COUNT(*) AS n FROM rate_versions WHERE status = 'draft'")).toBe(1);
    expect(count(db, "SELECT COUNT(*) AS n FROM rates WHERE version = 2")).toBe(RATE_KEYS.length);
    expect(count(db, "SELECT COUNT(*) AS n FROM change_log")).toBe(1);
  });

  it("ensureDraft throws when nothing is published and leaves no partial rows", async () => {
    // Schema only (0004 adds change_log.country, which the rates log queries filter on).
    const db = new SqliteD1().migrate("0001_schema.sql", "0004_countries.sql");
    await expect(new D1RatesRepo(db).ensureDraft(NOW)).rejects.toThrow(/No published rates version/);
    expect(count(db, "SELECT COUNT(*) AS n FROM rate_versions")).toBe(0);
    expect(count(db, "SELECT COUNT(*) AS n FROM change_log")).toBe(0);
  });

  it("updateRow edits only the draft, logs old/new JSON, and refuses published versions", async () => {
    const repo = new D1RatesRepo(seededSqliteD1());
    await repo.ensureDraft(NOW);
    const row = await repo.updateRow(2, "inflation_cpi", { value: 0.09, note: "bumped", rangeLow: null }, "test edit", NOW);
    expect(row.value).toBe(0.09);
    expect(row.note).toBe("bumped");
    expect((await repo.getDraft())?.rows.inflation_cpi.value).toBe(0.09);
    expect((await repo.getPublished()).rows.inflation_cpi.value).toBe(0.0834);
    const [edit] = await repo.changeLog();
    expect(edit).toMatchObject({ action: "edit", version: 2, key: "inflation_cpi", note: "test edit" });
    expect(JSON.parse(edit.oldValue ?? "{}").value).toBe(0.0834);
    expect(JSON.parse(edit.newValue ?? "{}").value).toBe(0.09);
    await expect(repo.updateRow(1, "inflation_cpi", { value: 0.1 }, null, NOW)).rejects.toThrow(/not a draft/);
    await expect(repo.updateRow(2, "inflation_cpi", { value: null }, null, NOW)).rejects.toThrow(/needs a numeric value or valueJson/);
    await expect(repo.updateRow(2, "inflation_cpi", { value: Number.NaN }, null, NOW)).rejects.toThrow(/needs a numeric value or valueJson/);
    await expect(repo.updateRow(2, "inflation_cpi", { asOf: "yesterday" }, null, NOW)).rejects.toThrow(/YYYY-MM-DD/);
  });

  it("updateRow can clear and set JSON values", async () => {
    const repo = new D1RatesRepo(seededSqliteD1());
    await repo.ensureDraft(NOW);
    const slabs = [{ upTo: 100, rate: 0 }];
    const row = await repo.updateRow(2, "tax_slabs", { valueJson: slabs }, null, NOW);
    expect(row.valueJson).toEqual(slabs);
    expect((await repo.getDraft())?.rows.tax_slabs.valueJson).toEqual(slabs);
  });

  it("publish supersedes v1, promotes v2 in one batch, and logs it", async () => {
    const db = seededSqliteD1();
    const repo = new D1RatesRepo(db);
    await repo.ensureDraft(NOW);
    await repo.updateRow(2, "policy_rate", { value: 0.1 }, null, NOW);
    expect(await repo.publish("rate cut", NOW, "sajat")).toBe(2);
    const published = await repo.getPublished();
    expect(published.version).toBe(2);
    expect(published.publishedAt).toBe("2026-11-01");
    expect(published.rows.policy_rate.value).toBe(0.1);
    expect(await repo.getDraft()).toBeNull();
    expect(count(db, "SELECT COUNT(*) AS n FROM rate_versions WHERE status = 'superseded' AND version = 1")).toBe(1);
    expect(count(db, "SELECT COUNT(*) AS n FROM rate_versions WHERE status = 'published'")).toBe(1);
    const [entry] = await repo.changeLog();
    expect(entry).toMatchObject({ action: "publish", version: 2, actor: "sajat", oldValue: "1", newValue: "2", note: "rate cut" });
    await expect(repo.publish(null, NOW, "sajat")).rejects.toThrow(/No draft to publish/);
    // The next draft is v3 copied from v2.
    expect(await repo.ensureDraft(NOW)).toBe(3);
    expect((await repo.getDraft())?.rows.policy_rate.value).toBe(0.1);
  });

  it("discardDraft deletes rows and version, logs once, and is a no-op without a draft", async () => {
    const db = seededSqliteD1();
    const repo = new D1RatesRepo(db);
    await repo.discardDraft(NOW);
    expect(count(db, "SELECT COUNT(*) AS n FROM change_log")).toBe(0);
    await repo.ensureDraft(NOW);
    await repo.discardDraft(NOW);
    expect(await repo.getDraft()).toBeNull();
    expect(count(db, "SELECT COUNT(*) AS n FROM rates WHERE version = 2")).toBe(0);
    expect(count(db, "SELECT COUNT(*) AS n FROM rate_versions")).toBe(1);
    const [entry] = await repo.changeLog();
    expect(entry).toMatchObject({ action: "discard_draft", version: 2 });
    expect(count(db, "SELECT COUNT(*) AS n FROM change_log")).toBe(2);
    // v1 is untouched and a new draft is again v2.
    expect((await repo.getPublished()).version).toBe(1);
    expect(await repo.ensureDraft(NOW)).toBe(2);
  });

  it("changeLog pages newest-first with a clamped limit and a `before` cursor", async () => {
    const repo = new D1RatesRepo(seededSqliteD1());
    await repo.ensureDraft(NOW);
    await repo.updateRow(2, "inflation_cpi", { value: 0.09 }, "one", NOW);
    await repo.updateRow(2, "inflation_cpi", { value: 0.1 }, "two", NOW);
    const all = await repo.changeLog();
    expect(all.map((e) => e.id)).toEqual([3, 2, 1]);
    expect(all[0].note).toBe("two");
    expect(await repo.changeLog(1)).toHaveLength(1);
    expect(await repo.changeLog(0)).toHaveLength(1);
    expect((await repo.changeLog(50, 3)).map((e) => e.id)).toEqual([2, 1]);
    expect(await repo.changeLog(50, 1)).toEqual([]);
  });

  it("rejects invalid version numbers before touching the database", async () => {
    const repo = new D1RatesRepo(new SqliteD1());
    await expect(repo.getVersionRows(0)).rejects.toThrow(/Invalid version/);
    await expect(repo.getVersionRows(1.5)).rejects.toThrow(/Invalid version/);
    await expect(repo.updateRow(-1, "inflation_cpi", {}, null, NOW)).rejects.toThrow(/Invalid version/);
  });
});
