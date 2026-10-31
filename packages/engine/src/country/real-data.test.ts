/**
 * The shipped country files (data/countries/*.json) and the generated regional defaults
 * (_regions.json, scripts/gen-region-defaults.mjs) through the validator, the overlay and the
 * whole plan. New research files are picked up automatically.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import seed from "../data/rates.seed.json";
import { SAMPLE_PROFILES, SAMPLE_PROFILE_IDS } from "../fixtures/profiles";
import { computePlan } from "../plan/plan";
import { assertSnapshot, type RateKey } from "../rates";
import { BANGLADESH_ONLY_KEYS, COUNTRY_FIELD_KEYS, NEUTRAL_LABELS, UNKNOWN_MEANS_NULL } from "./fields";
import { BASE_COUNTRY, fieldUsable, withCountry } from "./overlay";
import type { CountryProfile, RegionDefaults } from "./types";
import { assertCountryProfile, parseRegionDefaults, unitsFrom } from "./validate";

const DIR = join(__dirname, "../data/countries");
const base = assertSnapshot(seed);
const units = unitsFrom(base.rows);
const today = new Date().toISOString().slice(0, 10);

const files = existsSync(DIR) ? readdirSync(DIR).filter((n) => /^[A-Z]{2}\.json$/.test(n)).sort() : [];
const raw = files.map((n) => ({ file: n, body: JSON.parse(readFileSync(join(DIR, n), "utf8")) as unknown }));
const regionsPath = join(DIR, "_regions.json");
const regions: RegionDefaults = existsSync(regionsPath) ? parseRegionDefaults(JSON.parse(readFileSync(regionsPath, "utf8")), units) : {};
const bdBody = raw.find((r) => r.file === "BD.json")?.body as CountryProfile | undefined;
const bdUsdRate = bdBody?.currency.usdRate.value ?? 122;

/** Labels and notes must not carry Bangladeshi names into another country. */
const BD_WORDS = /Bangladesh|Sanchayapatra|\bFDR\b|\bDPS\b|Universal Pension|taka|সঞ্চয়পত্র|বাংলাদেশ|এফডিআর|ডিপিএস/i;

describe.skipIf(files.length === 0)("shipped country files", () => {
  it.each(raw.map((r) => [r.file, r.body] as const))("%s validates", (_file, body) => {
    expect(() => assertCountryProfile(body, units, { today })).not.toThrow();
  });

  it("the generated _regions.json loses nothing in validation and covers every group with countries", () => {
    expect(existsSync(regionsPath)).toBe(true);
    const parsed = JSON.parse(readFileSync(regionsPath, "utf8")) as Record<string, Record<string, unknown>>;
    for (const [group, fields] of Object.entries(parsed)) expect(Object.keys(regions[group as keyof RegionDefaults] ?? {}).sort(), group).toEqual(Object.keys(fields).sort());
    expect(regions.global).toBeDefined();
    for (const r of raw) expect(regions[(r.body as CountryProfile).region], (r.body as CountryProfile).region).toBeDefined();
  });

  describe.each(raw.map((r) => [r.file, r.body as CountryProfile] as const))("%s overlaid", (_file, profile) => {
    const s = withCountry(base, profile, { regions, bdUsdRate });

    it("applies without throwing and keeps every row", () => {
      for (const key of Object.keys(base.rows)) expect(s.rows[key as RateKey], key).toBeDefined();
      expect(s.country?.code).toBe(profile.code);
    });

    it.skipIf(profile.code === BASE_COUNTRY)("never leaks a Bangladeshi rate, range or label", () => {
      for (const key of COUNTRY_FIELD_KEYS) {
        const row = s.rows[key];
        const bd = base.rows[key];
        const own = fieldUsable(profile.fields[key]);
        expect(row.rangeLow ?? null, key).toBeNull();
        expect(row.rangeHigh ?? null, key).toBeNull();
        expect(row.labelEn, key).toBe(NEUTRAL_LABELS[key]?.en);
        expect(row.labelEn, key).not.toMatch(BD_WORDS);
        expect(row.labelBn ?? "", key).not.toMatch(BD_WORDS);
        if (!own) {
          // A fallback row never carries the Bangladeshi source.
          if (bd.unit === "rate") expect(row.sourceName, key).not.toBe(bd.sourceName);
          if (UNKNOWN_MEANS_NULL.includes(key) && profile.fields[key]?.absent !== true) {
            expect(row.unit === "json" ? row.valueJson : row.value, key).toBeNull();
          }
        }
      }
      expect(s.country?.notApplicable).toEqual([...BANGLADESH_ONLY_KEYS]);
      // Hospital cost: the country's own figure or a US-dollar regional figure, never taka converted.
      if (!fieldUsable(profile.fields.health_hospitalisation_cost)) expect(s.rows.health_hospitalisation_cost.note).toMatch(/median/i);
    });

    it.each(SAMPLE_PROFILE_IDS)("computePlan(%s) does not throw", (id) => {
      let error: unknown = null;
      try {
        computePlan(SAMPLE_PROFILES[id], s, "2026-10-31");
      } catch (e) {
        error = e;
      }
      expect(error, `${profile.code} ${id}: ${String(error)}`).toBeNull();
    });
  });
});
