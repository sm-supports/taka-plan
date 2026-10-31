import { describe, expect, it } from "vitest";
import { FIXTURE_IN, FIXTURE_US } from "@taka/engine";
import { D1CountryRepo } from "@/lib/server/country-db";
import { generateCountrySeedSql } from "../scripts/gen-country-seed.mjs";
import { SqliteD1 } from "./fakes/sqliteD1";

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
});
