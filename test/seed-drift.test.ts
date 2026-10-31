import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import seed from "@taka/engine/data/rates.seed.json";
import { generateAll } from "../scripts/gen-seed-migration.mjs";

/** The generated rates migrations must be regenerated whenever the seed JSON changes. */
describe("seed migrations", () => {
  for (const [file, sql] of Object.entries(generateAll(seed))) {
    it(`${file} matches the committed migration file`, () => {
      const committed = readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8");
      expect(committed).toBe(sql);
    });
  }
});
