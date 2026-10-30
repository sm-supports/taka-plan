import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import seed from "@taka/engine/data/rates.seed.json";
import { generateSeedSql } from "../scripts/gen-seed-migration.mjs";

/** migrations/0002_seed_rates.sql must be regenerated whenever the seed JSON changes. */
describe("seed migration", () => {
  it("matches the committed migration file", () => {
    const committed = readFileSync(new URL("../migrations/0002_seed_rates.sql", import.meta.url), "utf8");
    expect(committed).toBe(generateSeedSql(seed));
  });
});
