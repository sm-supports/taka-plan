#!/usr/bin/env node
// Build step (runs before copy-country-data): writes the regional fallback figures.
//
//   packages/engine/src/data/countries/<CC>.json  →  packages/engine/src/data/countries/_regions.json
//
// For every numeric country field (COUNTRY_FIELDS in packages/engine/src/country/fields.ts) it takes
// the median per World Bank region and over all countries ("global") of the figures the research
// found: status "sourced" for facts, "sourced" or "assumption" for our forward-looking assumptions.
// Money figures (unit "bdt" = local currency) are divided by each country's dollar rate, so the
// file holds them in US dollars and the overlay converts them back with the selected country's rate.
// For the JSON tables that may fall back (premium tables, life table, support ratio) it copies the
// table of the median country by one summary number. Gratuity, public pension and old-age allowance
// are never filled from other countries (unknown stays unknown), so they are not written.
//
// A median needs at least MIN_COUNTRIES figures (one country's figure is not a regional default);
// a JSON table needs one, and is never Bangladesh's own table. The output is deterministic: asOf is the latest asOf among the figures used.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const COUNTRIES_DIR = path.join(root, "packages/engine/src/data/countries");
export const SEED_PATH = path.join(root, "packages/engine/src/data/rates.seed.json");
export const FIELDS_TS = path.join(root, "packages/engine/src/country/fields.ts");
export const OUT_FILE = path.join(COUNTRIES_DIR, "_regions.json");

/** Same list as REGIONS in packages/engine/src/country/types.ts. */
export const REGIONS = ["south_asia", "east_asia_pacific", "europe_central_asia", "latin_america_caribbean", "middle_east_north_africa", "north_america", "sub_saharan_africa"];
const REGION_NAMES = {
  south_asia: "South Asia",
  east_asia_pacific: "East Asia and Pacific",
  europe_central_asia: "Europe and Central Asia",
  latin_america_caribbean: "Latin America and the Caribbean",
  middle_east_north_africa: "the Middle East and North Africa",
  north_america: "North America",
  sub_saharan_africa: "Sub-Saharan Africa",
};
/** Same list as UNKNOWN_MEANS_NULL in country/fields.ts: never taken from other countries. */
export const UNKNOWN_MEANS_NULL = ["gratuity_rule", "public_pension_scheme", "old_age_allowance_monthly", "old_age_allowance_eligibility"];
export const MIN_COUNTRIES = 3;
/** The base country (overlay.ts BASE_COUNTRY): its numbers count in medians, its tables are never copied. */
export const BASE_COUNTRY = "BD";
export const SOURCE_NAME = "Taka Plan (our assumption)";
export const SOURCE_URL = "docs/CONTRACTS-V2.md";

/** COUNTRY_FIELDS keys and kinds, read from fields.ts (a .mjs build script cannot import TypeScript). */
export function readFieldSpecs(file = FIELDS_TS) {
  const src = fs.readFileSync(file, "utf8");
  const start = src.indexOf("export const COUNTRY_FIELDS");
  const end = src.indexOf("] as const;", start);
  const block = src.slice(start, end);
  return [...block.matchAll(/\{\s*key:\s*"([a-z0-9_]+)",\s*kind:\s*"(fact|assumption)"/g)].map((m) => ({ key: m[1], kind: m[2] }));
}

function median(sorted) {
  const n = sorted.length;
  return n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

function roundFor(unit, key, v) {
  if (key.startsWith("retirement_age_")) return Math.round(v);
  switch (unit) {
    case "rate":
      return Math.round(v * 10000) / 10000;
    case "ratio":
      return Math.round(v * 1000) / 1000;
    case "bdt":
      return Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 100) / 100;
    default:
      return Math.round(v * 10) / 10;
  }
}

function bandAt(table, age) {
  const bands = Array.isArray(table?.bands) ? table.bands : [];
  return bands.find((b) => b.maxAge >= age) ?? bands[bands.length - 1];
}

/** One number per JSON table, to pick the median country's table. */
const JSON_SUMMARY = {
  insurance_term_premium_table: (t) => {
    const b = bandAt(t, 40);
    return b && t.per > 0 ? (b.low + b.high) / 2 / t.per : null;
  },
  health_premium_table: (t) => {
    const b = bandAt(t, 40);
    return b && t.per > 0 ? (b.low + b.high) / 2 / t.per : null;
  },
  life_table_remaining: (t) => {
    const rows = Array.isArray(t?.rows) ? t.rows : [];
    const r = rows.find((x) => x.age === 65) ?? rows[0];
    return typeof r?.total === "number" ? r.total : null;
  },
  support_ratio: (t) => {
    const p = Array.isArray(t?.points) ? t.points[0] : undefined;
    return typeof p?.value === "number" ? p.value : null;
  },
};

function usable(f, kind) {
  if (!f || typeof f !== "object") return false;
  if (kind === "fact" ? f.status !== "sourced" : f.status !== "sourced" && f.status !== "assumption") return false;
  if (typeof f.sourceUrl !== "string" || !/^(https?:\/\/|docs\/)/.test(f.sourceUrl)) return false;
  return true;
}

/**
 * The RegionDefaults object for `profiles` (parsed CountryProfile JSON). `units` maps rate key → unit
 * (from rates.seed.json), `specs` is readFieldSpecs().
 */
export function computeRegionDefaults(profiles, units, specs) {
  const groups = { global: profiles };
  for (const r of REGIONS) {
    const list = profiles.filter((p) => p.region === r);
    if (list.length > 0) groups[r] = list;
  }
  const out = {};
  for (const [group, list] of Object.entries(groups)) {
    const where = group === "global" ? "worldwide" : `in ${REGION_NAMES[group] ?? group}`;
    const fields = {};
    for (const { key, kind } of specs) {
      if (UNKNOWN_MEANS_NULL.includes(key)) continue;
      const unit = units[key];
      if (unit === "json") {
        const summary = JSON_SUMMARY[key];
        if (!summary) continue;
        const cands = [];
        for (const p of list) {
          // Never Bangladesh's own table: other countries must not inherit the base country's rules.
          if (p.code === BASE_COUNTRY) continue;
          const f = p.fields?.[key];
          if (!usable(f, kind) || f.valueJson === null || typeof f.valueJson !== "object") continue;
          const s = summary(f.valueJson);
          if (typeof s === "number" && Number.isFinite(s)) cands.push({ s, p, f });
        }
        if (cands.length < 1) continue;
        cands.sort((a, b) => a.s - b.s || a.p.code.localeCompare(b.p.code));
        const pick = cands[Math.floor((cands.length - 1) / 2)];
        fields[key] = {
          value: null,
          valueJson: pick.f.valueJson,
          status: "assumption",
          sourceName: SOURCE_NAME,
          sourceUrl: SOURCE_URL,
          asOf: cands.map((c) => c.f.asOf).sort().at(-1),
          note: cands.length === 1 ? `Table from ${pick.p.nameEn}, the only sourced table ${where}.` : `Table from ${pick.p.nameEn}, the median of ${cands.length} sourced countries ${where}.`,
        };
        continue;
      }
      const vals = [];
      const dates = [];
      for (const p of list) {
        const f = p.fields?.[key];
        if (!usable(f, kind) || typeof f.value !== "number" || !Number.isFinite(f.value)) continue;
        let v = f.value;
        if (unit === "bdt") {
          const usd = p.currency?.usdRate?.value;
          if (typeof usd !== "number" || !(usd > 0)) continue;
          v = v / usd;
        }
        vals.push(v);
        dates.push(f.asOf);
      }
      if (vals.length < MIN_COUNTRIES) continue;
      vals.sort((a, b) => a - b);
      fields[key] = {
        value: roundFor(unit, key, median(vals)),
        status: "assumption",
        sourceName: SOURCE_NAME,
        sourceUrl: SOURCE_URL,
        asOf: dates.sort().at(-1),
        note: `Median of ${vals.length} sourced countries ${where}${unit === "bdt" ? ", in US dollars" : ""}.`,
      };
    }
    out[group] = fields;
  }
  // Regions in REGIONS order, then global.
  const ordered = {};
  for (const r of REGIONS) if (out[r]) ordered[r] = out[r];
  ordered.global = out.global;
  return ordered;
}

/** Reads the country files and the seed, returns the defaults (does not write). */
export function genRegionDefaults(dir = COUNTRIES_DIR, seedPath = SEED_PATH, fieldsTs = FIELDS_TS) {
  const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => /^[A-Z]{2}\.json$/.test(n)).sort() : [];
  const profiles = names.map((n) => JSON.parse(fs.readFileSync(path.join(dir, n), "utf8")));
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  const units = Object.fromEntries(Object.entries(seed.rows).map(([k, r]) => [k, r.unit]));
  return { profiles: profiles.length, defaults: computeRegionDefaults(profiles, units, readFieldSpecs(fieldsTs)) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { profiles, defaults } = genRegionDefaults();
  if (profiles === 0) {
    console.log("gen-region-defaults: no country files, nothing to do");
  } else {
    const body = `${JSON.stringify(defaults, null, 2)}\n`;
    const prev = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : null;
    if (prev !== body) fs.writeFileSync(OUT_FILE, body);
    const n = Object.values(defaults).reduce((t, f) => t + Object.keys(f).length, 0);
    console.log(`gen-region-defaults: ${profiles} profile(s) → _regions.json (${Object.keys(defaults).length} groups, ${n} figures)`);
  }
}
