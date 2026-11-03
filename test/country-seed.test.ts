import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FIXTURE_IN, FIXTURE_US } from "@taka/engine";
import { D1CountryRepo } from "@/lib/server/country-db";
import { generateCountrySeedSql, readProfiles } from "../scripts/gen-country-seed.mjs";
import { SqliteD1 } from "./fakes/sqliteD1";

/** D1 has no "no note" vs "note: null" distinction; the reader leaves the key out. */
function withoutNullNotes<T extends { fields: Record<string, unknown> }>(p: T): T {
  const fields = Object.fromEntries(Object.entries(p.fields).map(([k, f]) => [k, Object.fromEntries(Object.entries(f as object).filter(([key, v]) => !(key === "note" && v === null)))]));
  return { ...p, fields };
}

/** The generated country seed loads into the real schema and reads back as the same profiles. */
describe("country seed migration (0006)", () => {
  it("loads into 0004's tables and round-trips through D1CountryRepo", async () => {
    const sql = generateCountrySeedSql([FIXTURE_IN, FIXTURE_US] as never);
    const db = new SqliteD1().migrate("0001_schema.sql", "0002_seed_rates.sql", "0003_rates_m2_m6_m7.sql", "0004_countries.sql", "0005_rates_plan_v2.sql");
    db.exec(sql);
    const repo = new D1CountryRepo(db);
    const india = await repo.getPublished("IN");
    expect(india?.version).toBe(1);
    expect(india?.profile.currency.code).toBe("INR");
    expect(Object.keys(india?.profile.fields ?? {}).sort()).toEqual(Object.keys(FIXTURE_IN.fields).sort());
    expect((await repo.getPublished("US"))?.profile.nameEn).toBe("United States");
  });

  // 0006 is frozen (applied in production); corrections to the v1 seed ship as later migrations.
  // The JSON is the offline copy of what those migrations publish, so the two must agree.
  it("every migration together publishes exactly the shipped country JSON (v1)", async () => {
    const files = readdirSync(new URL("../migrations/", import.meta.url)).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort();
    const repo = new D1CountryRepo(new SqliteD1().migrate(...files));
    const profiles = readProfiles();
    expect(profiles).toHaveLength(197);
    for (const json of profiles) {
      const stored = await repo.getPublished(json.code);
      expect(stored?.version, json.code).toBe(1);
      expect(stored?.profile, `${json.code}: edit the JSON and D1 together (a new migration), never 0006`).toEqual(withoutNullNotes(json));
    }
  });
});
