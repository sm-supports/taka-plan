#!/usr/bin/env node
// Fetches the cross-country datasets the country research starts from, into
// packages/engine/src/data/countries/_global/:
//   worldbank.json  most recent value per country for a set of World Bank WDI indicators
//   cldr.json       currency (ISO 4217), narrow symbol, minor-unit digits and languages per territory (Unicode CLDR 46)
// Usage: node scripts/fetch-global-country-data.mjs   (network; re-run before a research refresh)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "packages/engine/src/data/countries/_global");
fs.mkdirSync(outDir, { recursive: true });

const WB_INDICATORS = {
  "FP.CPI.TOTL.ZG": "Inflation, consumer prices (annual %)",
  "PA.NUS.FCRF": "Official exchange rate (LCU per US$, period average)",
  "SP.DYN.LE00.IN": "Life expectancy at birth, total (years)",
  "SP.DYN.LE00.MA.IN": "Life expectancy at birth, male (years)",
  "SP.DYN.LE00.FE.IN": "Life expectancy at birth, female (years)",
  "SH.XPD.OOPC.CH.ZS": "Out-of-pocket expenditure (% of current health expenditure)",
  "FR.INR.DPST": "Deposit interest rate (%)",
  "FR.INR.LEND": "Lending interest rate (%)",
  "SP.POP.DPND.OL": "Age dependency ratio, old (% of working-age population)",
  "SP.POP.65UP.TO.ZS": "Population ages 65 and above (% of total population)",
};

async function getJson(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return await res.json();
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function worldBank() {
  const data = {};
  const indicators = {};
  for (const [id, name] of Object.entries(WB_INDICATORS)) {
    const url = `https://api.worldbank.org/v2/country/all/indicator/${id}?format=json&per_page=20000&mrnev=1`;
    const json = await getJson(url);
    const rows = Array.isArray(json) ? (json[1] ?? []) : [];
    indicators[id] = { name, sourceUrl: `https://data.worldbank.org/indicator/${id}`, apiUrl: url, lastUpdated: json?.[0]?.lastupdated ?? null };
    for (const r of rows) {
      const iso3 = r.countryiso3code;
      if (!iso3 || r.value === null || r.value === undefined) continue;
      (data[iso3] ??= {})[id] = { value: r.value, year: Number(r.date) };
    }
    console.log(`worldbank ${id}: ${rows.filter((r) => r.value !== null).length} values`);
  }
  return { fetchedAt: new Date().toISOString().slice(0, 10), source: "World Bank World Development Indicators API v2", indicators, data };
}

async function cldr() {
  const base = "https://cdn.jsdelivr.net/npm";
  const currencyData = await getJson(`${base}/cldr-core@46.0.0/supplemental/currencyData.json`);
  const territoryInfo = await getJson(`${base}/cldr-core@46.0.0/supplemental/territoryInfo.json`);
  const currencies = await getJson(`${base}/cldr-numbers-full@46.0.0/main/en/currencies.json`);
  const fractions = currencyData.supplemental.currencyData.fractions;
  const regions = currencyData.supplemental.currencyData.region;
  const names = currencies.main.en.numbers.currencies;
  const info = territoryInfo.supplemental.territoryInfo;
  const out = {};
  for (const [territory, list] of Object.entries(regions)) {
    if (!/^[A-Z]{2}$/.test(territory)) continue;
    // Current tender: entries without _to, preferring legal tender.
    const current = list
      .map((o) => Object.entries(o)[0])
      .filter(([, v]) => !v._to && v._tender !== "false")
      .map(([code]) => code);
    const code = current[current.length - 1];
    if (!code) continue;
    const frac = fractions[code] ?? fractions.DEFAULT;
    const n = names[code] ?? {};
    const langs = Object.entries(info[territory]?.languagePopulation ?? {})
      .map(([lang, v]) => ({ lang: lang.split("_")[0], percent: Number(v._populationPercent ?? 0), official: Boolean(v._officialStatus) }))
      .sort((a, b) => b.percent - a.percent);
    out[territory] = {
      currency: code,
      currencyName: n.displayName ?? code,
      symbol: n["symbol-alt-narrow"] ?? n.symbol ?? code,
      decimals: Number(frac._digits ?? 2),
      languages: langs,
    };
  }
  return { fetchedAt: new Date().toISOString().slice(0, 10), source: "Unicode CLDR 46 (cldr-core, cldr-numbers-full)", sourceUrl: "https://cldr.unicode.org/", territories: out };
}

const wb = await worldBank();
fs.writeFileSync(path.join(outDir, "worldbank.json"), JSON.stringify(wb, null, 1) + "\n");
const c = await cldr();
fs.writeFileSync(path.join(outDir, "cldr.json"), JSON.stringify(c, null, 1) + "\n");
console.log(`wrote ${Object.keys(wb.data).length} World Bank economies, ${Object.keys(c.territories).length} CLDR territories`);
