#!/usr/bin/env node
// Build step (runs before `vite build`): publishes the country data files as static JSON.
//
//   packages/engine/src/data/countries/<CC>.json, index.json, _regions.json
//     → public/data/countries/   (gitignored; Vite copies public/ into dist/client)
//
// _global/ (World Bank and CLDR inputs for the research) is never published. When index.json is
// absent it is generated from the profiles with the same mapping as the engine's indexEntryFor
// (country/overlay.ts), duplicated here because a .mjs build script cannot import TypeScript;
// lib/country/copy-country-data.test.ts keeps the two in step. No country files: nothing to do.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SOURCE_DIR = path.join(root, "packages/engine/src/data/countries");
export const OUT_DIR = path.join(root, "public/data/countries");

/** Same list as LOCALES in packages/engine/src/types.ts. */
export const LOCALES = ["bn", "en", "hi", "ur", "ar", "es", "fr", "pt", "id", "zh", "ru", "sw"];

/** Mirror of localesForLanguages (country/overlay.ts): translated country languages, then English. */
export function localesForLanguages(languages) {
  const out = [];
  for (const l of languages) if (LOCALES.includes(l) && l !== "en" && !out.includes(l)) out.push(l);
  out.push("en");
  return out;
}

/** Mirror of indexEntryFor (country/overlay.ts). */
export function indexEntryFor(p) {
  return { code: p.code, nameEn: p.nameEn, nameNative: p.nameNative, region: p.region, currency: p.currency.code, languages: p.languages, locales: localesForLanguages(p.languages) };
}

const PROFILE_FILE = /^[A-Z]{2}\.json$/;

/**
 * Copies the publishable files from `src` to `out` (replacing `out`), writing index.json when the
 * source has none. Returns what was written; `{ profiles: 0 }` (and no `out`) when there is no data.
 */
export function copyCountryData(src = SOURCE_DIR, out = OUT_DIR) {
  const names = fs.existsSync(src) ? fs.readdirSync(src).filter((n) => fs.statSync(path.join(src, n)).isFile()) : [];
  const profiles = names.filter((n) => PROFILE_FILE.test(n)).sort();
  fs.rmSync(out, { recursive: true, force: true });
  if (profiles.length === 0) return { profiles: 0, indexGenerated: false, files: [] };

  fs.mkdirSync(out, { recursive: true });
  const files = [];
  for (const n of names) {
    if (!PROFILE_FILE.test(n) && n !== "index.json" && n !== "_regions.json") continue;
    // Parse and re-serialise: a malformed file fails the build here, and the output is minified.
    const body = JSON.parse(fs.readFileSync(path.join(src, n), "utf8"));
    fs.writeFileSync(path.join(out, n), JSON.stringify(body));
    files.push(n);
  }
  let indexGenerated = false;
  if (!names.includes("index.json")) {
    const index = profiles.map((n) => indexEntryFor(JSON.parse(fs.readFileSync(path.join(src, n), "utf8"))));
    fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(index));
    files.push("index.json");
    indexGenerated = true;
  }
  return { profiles: profiles.length, indexGenerated, files: files.sort() };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = copyCountryData();
  if (r.profiles > 0) console.log(`copy-country-data: ${r.profiles} profile(s) → public/data/countries${r.indexGenerated ? " (index.json generated)" : ""}`);
}
