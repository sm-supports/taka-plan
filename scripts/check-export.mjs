#!/usr/bin/env node
// Post-build guard for the static export that Cloudflare Pages serves (dist/client).
//
// vinext's `output: "export"` skips a page without failing the build when the page turns
// dynamic (cookies(), awaited searchParams, force-dynamic). This script fails the build instead,
// checks that every page and Pages control file is present, and removes build-only files that
// must not be published (the Vite manifest under .vite/).
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist/client");
const problems = [];

if (!existsSync(out)) {
  console.error("check-export: dist/client is missing; run `vite build` first");
  process.exit(1);
}

// 1. Nothing build-only in the published folder.
for (const p of [".vite", ".assetsignore"]) rmSync(path.join(out, p), { recursive: true, force: true });

// 2. vinext's prerender report: every route must have been rendered.
const reportPath = path.join(root, "dist/server/vinext-prerender.json");
if (existsSync(reportPath)) {
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const routes = Array.isArray(report) ? report : (report.routes ?? []);
  for (const r of routes) {
    const status = r.status ?? r.result;
    if (status && status !== "rendered" && status !== "ok" && status !== "success") {
      problems.push(`route ${r.route ?? r.path ?? JSON.stringify(r)} was ${status}${r.reason ? ` (${r.reason})` : ""}`);
    }
  }
} else {
  problems.push("dist/server/vinext-prerender.json is missing (did the export run?)");
}

// 3. The pages and files the app and the service worker rely on.
const LOCALES = ["bn", "en", "hi", "ur", "ar", "es", "fr", "pt", "id", "zh", "ru", "sw"];
const PAGES = ["", "/plan", "/drafts", "/m1", "/m3", "/m4", "/m5", "/about", "/start/1", "/start/2", "/start/3", "/start/4", "/start/5"];
const required = ["index.html", "404.html", "admin.html", "admin/log.html", "admin/preview.html", "admin/countries.html", "_headers", "_routes.json", "manifest.webmanifest", "sw.js"];
for (const l of LOCALES) for (const p of PAGES) required.push(`${l}${p}.html`);
// Country data (scripts/copy-country-data.mjs): once any profile is published, the picker's index must be too.
const countryOut = path.join(out, "data/countries");
if (existsSync(path.join(root, "public/data/countries")) || (existsSync(countryOut) && readdirSync(countryOut).some((n) => /^[A-Z]{2}\.json$/.test(n)))) {
  required.push("data/countries/index.json");
}
for (const f of required) if (!existsSync(path.join(out, f))) problems.push(`missing dist/client/${f}`);

// 4. Functions may only run for /api/*; everything else must stay static.
try {
  const routes = JSON.parse(readFileSync(path.join(out, "_routes.json"), "utf8"));
  if (JSON.stringify(routes.include) !== JSON.stringify(["/api/*"])) problems.push(`_routes.json include is ${JSON.stringify(routes.include)}, expected ["/api/*"]`);
} catch (e) {
  problems.push(`_routes.json unreadable: ${e.message}`);
}

// 5. Pages limits: 20,000 files, 25 MiB per file.
let files = 0;
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const f = path.join(dir, name);
    const st = statSync(f);
    if (st.isDirectory()) walk(f);
    else {
      files++;
      if (st.size > 25 * 1024 * 1024) problems.push(`${path.relative(out, f)} is larger than 25 MiB`);
    }
  }
})(out);
if (files > 20000) problems.push(`${files} files exceeds the Pages limit of 20,000`);

if (problems.length) {
  console.error(`check-export: ${problems.length} problem(s)\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}
console.log(`check-export: dist/client ok (${files} files, ${required.length} required pages and files present)`);
