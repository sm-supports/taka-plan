/**
 * Applies a country to the rates snapshot. Calculators keep reading plain rate keys; this decides
 * which figure each country field (COUNTRY_FIELD_KEYS) holds for the selected country:
 *
 *   1. the country's own researched field (status sourced or assumption);
 *   2. `missing` with `absent: true` (the scheme or product does not exist): "none" (JSON null, 0,
 *      or the product slot unavailable);
 *   3. gratuity, public pension and old-age allowance (UNKNOWN_MEANS_NULL) not found: null, meaning
 *      unknown, so M7 leaves them out; never another country's rule;
 *   4. else the regional median (data/countries/_regions.json), then the global median, flagged;
 *      money figures there are in US dollars and are converted at the country's dollar rate;
 *   5. else, for a product rate, the country's own nearest rate (PRODUCT_RATE_PROXIES), flagged;
 *   6. else money → the Bangladesh figure converted at the exchange rate; product rates → the slot
 *      is marked unavailable; anything else keeps the Bangladesh row, flagged. A Bangladeshi rate
 *      never prices another country's product.
 *
 * Every non-Bangladesh country field gets a neutral label (NEUTRAL_LABELS) and no market range.
 * App-policy money thresholds are converted from taka. Bangladesh is the identity: its figures are
 * the base snapshot itself, edited in the rates admin.
 */
import { LOCALES, type Instrument, type Locale } from "../types";
import type { RateKey, RateRow, RatesSnapshot } from "../rates";
import { BANGLADESH_ONLY_KEYS, COUNTRY_FIELD_KEYS, NEUTRAL_LABELS, PRODUCT_RATE_SLOTS, UNKNOWN_MEANS_NULL } from "./fields";
import type { CountryContext, CountryField, CountryIndexEntry, CountryProfile, RegionDefaults, RoundingSteps } from "./types";

/** Taka rounding (money.ts): ৳500 lump, ৳100 monthly and interest, ৳1 exact. */
export const BDT_ROUNDING: RoundingSteps = { lump: 500, monthly: 100, interest: 100, exact: 1 };

/** The country whose figures are the base snapshot itself. */
export const BASE_COUNTRY = "BD";

/** Largest 1, 2 or 5 × 10^k that is ≤ x (never below 1). */
export function niceStep(x: number): number {
  if (!Number.isFinite(x) || x <= 1) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  const m = x / p;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p;
}

/**
 * Rounding steps for a currency from its US-dollar rate: monthly ≈ 1 USD, lump ≈ 5 USD.
 * BDT at about 122 per dollar gives 100 and 500, matching the taka steps.
 */
export function roundingForUsdRate(usdRate: number): RoundingSteps {
  const monthly = niceStep(usdRate);
  return { lump: niceStep(usdRate * 5), monthly, interest: monthly, exact: 1 };
}

/** Rounding steps of the snapshot's country (taka steps when no country is applied). */
export function roundingFor(s: Pick<RatesSnapshot, "country">): RoundingSteps {
  return s.country?.rounding ?? BDT_ROUNDING;
}

/** True when the field carries a figure the overlay can apply. */
export function fieldUsable(f: CountryField | undefined | null): boolean {
  if (!f || f.status === "missing") return false;
  return (typeof f.value === "number" && Number.isFinite(f.value)) || (f.valueJson !== undefined && f.valueJson !== null);
}

function joinNotes(...parts: (string | null | undefined)[]): string | null {
  return parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(" ") || null;
}

function regionName(region: string): string {
  return region.replace(/_/g, " ");
}

/** UI locales for a country: its languages that the app translates, then English. */
export function localesForLanguages(languages: readonly string[]): Locale[] {
  const out: Locale[] = [];
  for (const l of languages) if ((LOCALES as readonly string[]).includes(l) && l !== "en" && !out.includes(l as Locale)) out.push(l as Locale);
  out.push("en");
  return out;
}

export function indexEntryFor(p: CountryProfile): CountryIndexEntry {
  return { code: p.code, nameEn: p.nameEn, nameNative: p.nameNative, region: p.region, currency: p.currency.code, languages: p.languages, locales: localesForLanguages(p.languages) };
}

/**
 * Where `absent: true` can mean "none": a scheme or table (JSON rows), a money amount (no deposit
 * insurance, no allowance), a tax (no tax) or a product slot. A rate such as inflation always exists.
 */
export function absenceApplies(key: RateKey, row: Pick<RateRow, "unit">): boolean {
  if (row.unit === "json") return ABSENT_JSON_KEYS.includes(key);
  return row.unit === "bdt" || key.startsWith("tax_") || PRODUCT_RATE_SLOTS[key] !== undefined;
}

/** JSON rows that can be "none": no term-life or health-insurance market, no gratuity law, no public pension, no allowance. */
const ABSENT_JSON_KEYS: readonly RateKey[] = ["insurance_term_premium_table", "health_premium_table", "gratuity_rule", "public_pension_scheme", "old_age_allowance_eligibility"];

/**
 * For a product rate with neither the country's own figure nor a regional or global median: the
 * country's own figures to borrow, nearest first (a 3-month deposit is closest to a treasury bill,
 * a savings certificate to a 5-year bond). Only when none exists is the slot left out.
 */
export const PRODUCT_RATE_PROXIES: Readonly<Partial<Record<RateKey, readonly RateKey[]>>> = {
  savings_account_rate: ["bank_deposit_avg_rate", "fdr_3m_rate", "fdr_1y_rate", "policy_rate"],
  fdr_3m_rate: ["tbill_91d_rate", "fdr_1y_rate", "bank_deposit_avg_rate", "policy_rate"],
  fdr_1y_rate: ["bank_deposit_avg_rate", "fdr_3m_rate", "tbill_91d_rate", "policy_rate"],
  dps_rate: ["fdr_1y_rate", "bank_deposit_avg_rate", "policy_rate"],
  sanchayapatra_5y_rate: ["tbond_5y_rate", "tbond_10y_rate", "fdr_1y_rate"],
  tbill_91d_rate: ["policy_rate", "fdr_3m_rate"],
  tbond_5y_rate: ["tbond_10y_rate", "tbill_91d_rate", "policy_rate"],
  tbond_10y_rate: ["tbond_5y_rate", "tbill_91d_rate", "policy_rate"],
};

export interface WithCountryOptions {
  /** Regional and global medians (data/countries/_regions.json); money figures in US dollars. */
  regions?: RegionDefaults | null;
  /** Taka per US dollar (from the BD profile), for converting Bangladesh money figures. */
  bdUsdRate: number;
}

/**
 * The snapshot the calculators read for country `profile`. `base` is the published Bangladesh
 * snapshot. Never call assertSnapshot on the result (country rates may be negative).
 */
export function withCountry(base: RatesSnapshot, profile: CountryProfile, opts: WithCountryOptions): RatesSnapshot {
  const own$ = profile.currency.usdRate.value;
  const usdRate = typeof own$ === "number" && own$ > 0 ? own$ : opts.bdUsdRate;
  const rows = { ...base.rows } as Record<RateKey, RateRow>;
  const fallbackKeys: RateKey[] = [];
  const isBase = profile.code === BASE_COUNTRY;
  const unavailable = new Set<Instrument>();
  for (const [k, v] of Object.entries(profile.instruments) as [Instrument, CountryProfile["instruments"][Instrument]][]) if (!v.available) unavailable.add(k);

  if (!isBase) {
    const name = profile.nameEn;
    const regional = opts.regions?.[profile.region] ?? {};
    const global = opts.regions?.global ?? {};

    for (const key of COUNTRY_FIELD_KEYS) {
      const baseRow = base.rows[key];
      const own = profile.fields[key];
      const label = NEUTRAL_LABELS[key];
      const isJson = baseRow.unit === "json";
      const slot = PRODUCT_RATE_SLOTS[key];
      /** The base row with this country's neutral label and no (Bangladeshi) market range. */
      const neutral: RateRow = { ...baseRow, labelEn: label?.en ?? baseRow.labelEn, labelBn: label?.bn ?? baseRow.labelBn ?? null, rangeLow: null, rangeHigh: null };
      const fromField = (f: CountryField, value: number | null, note: string | null, flagged: boolean): RateRow => ({
        ...neutral,
        value: isJson ? null : value,
        valueJson: isJson ? f.valueJson : undefined,
        sourceName: f.sourceName,
        sourceUrl: f.sourceUrl,
        asOf: f.asOf,
        note,
        isAppAssumption: f.status === "assumption" || flagged,
      });

      // 1. The country's own figure.
      if (own && fieldUsable(own)) {
        rows[key] = fromField(own, own.value ?? null, own.note ?? null, false);
        continue;
      }

      // 2. Researched and found not to exist.
      if (own?.status === "missing" && own.absent === true && absenceApplies(key, baseRow)) {
        if (slot) unavailable.add(slot);
        if (!slot) {
          rows[key] = {
            ...neutral,
            value: isJson ? null : 0,
            valueJson: isJson ? null : undefined,
            sourceName: own.sourceName,
            sourceUrl: own.sourceUrl,
            asOf: own.asOf,
            note: joinNotes(own.note, `None in ${name}.`),
            isAppAssumption: false,
          };
          continue;
        }
        // A product slot that does not exist: priced below only so nothing reads a Bangladeshi rate.
      }

      // 3. Unknown stays unknown for gratuity, public pension and old-age allowance.
      if (UNKNOWN_MEANS_NULL.includes(key)) {
        rows[key] = {
          ...neutral,
          value: null,
          valueJson: isJson ? null : undefined,
          sourceName: own?.sourceName ?? "",
          sourceUrl: own?.sourceUrl ?? "",
          asOf: own?.asOf || profile.researchedAt,
          note: joinNotes(own?.note, `Not found for ${name}; left out of the plan.`),
          isAppAssumption: false,
        };
        continue;
      }

      // 4. Regional, then global median.
      const reg = fieldUsable(regional[key]) ? { f: regional[key] as CountryField, where: `Regional median for ${regionName(profile.region)}` } : fieldUsable(global[key]) ? { f: global[key] as CountryField, where: "Global median" } : null;
      if (reg) {
        const v = reg.f.value ?? null;
        const local = baseRow.unit === "bdt" && v !== null ? Math.round(v * usdRate) : v;
        const converted = baseRow.unit === "bdt" ? ` Converted from US dollars at ${usdRate} ${profile.currency.code} per dollar.` : "";
        rows[key] = fromField(reg.f, local, joinNotes(reg.f.note, `${reg.where}; ${name} publishes none we could find.${converted}`), true);
        fallbackKeys.push(key);
        continue;
      }

      // 5. A product rate with no regional figure: the country's own nearest rate, flagged.
      const proxyKey = slot ? PRODUCT_RATE_PROXIES[key]?.find((k) => fieldUsable(profile.fields[k])) : undefined;
      const proxy = proxyKey ? profile.fields[proxyKey] : undefined;
      if (proxyKey && proxy) {
        rows[key] = fromField(proxy, proxy.value ?? null, `No figure or regional median found for ${name}; ${NEUTRAL_LABELS[proxyKey]?.en ?? proxyKey} used instead.`, true);
        fallbackKeys.push(key);
        continue;
      }

      // 6. Nothing anywhere.
      if (baseRow.unit === "bdt" && baseRow.value !== null) {
        rows[key] = { ...neutral, value: Math.round((baseRow.value * usdRate) / opts.bdUsdRate), isAppAssumption: true, note: `No figure found for ${name}; Bangladesh figure converted at ${usdRate} ${profile.currency.code} per US dollar.` };
      } else if (slot) {
        unavailable.add(slot);
        rows[key] = { ...neutral, isAppAssumption: true, note: `No figure found for ${name}; this product is left out of the plan.` };
      } else {
        rows[key] = { ...neutral, isAppAssumption: true, note: `No figure found for ${name}; Bangladesh value shown${isJson ? " (as a share of the amount, not in taka)" : ""}.` };
      }
      fallbackKeys.push(key);
    }

    // An allowance with eligibility ages but no amount cannot be counted: leave both out.
    if (rows.old_age_allowance_monthly.value === null && rows.old_age_allowance_eligibility.valueJson !== null) {
      rows.old_age_allowance_eligibility = { ...rows.old_age_allowance_eligibility, valueJson: null, note: joinNotes(rows.old_age_allowance_eligibility.note, "No monthly amount found, so the allowance is left out of the plan.") };
    }

    // App-policy money thresholds are scaled to the local currency.
    for (const [key, row] of Object.entries(base.rows) as [RateKey, RateRow][]) {
      if (row.unit !== "bdt" || COUNTRY_FIELD_KEYS.includes(key) || BANGLADESH_ONLY_KEYS.includes(key) || row.value === null) continue;
      rows[key] = {
        ...row,
        value: Math.round((row.value * usdRate) / opts.bdUsdRate),
        rangeLow: null,
        rangeHigh: null,
        note: joinNotes(row.note, `Converted from taka at ${usdRate} ${profile.currency.code} per US dollar.`),
      };
    }
  }

  const instrumentNames: CountryContext["instrumentNames"] = {};
  for (const [k, v] of Object.entries(profile.instruments) as [Instrument, CountryProfile["instruments"][Instrument]][]) {
    if (v.available && !unavailable.has(k) && v.localName) instrumentNames[k] = { local: v.localName, en: v.localNameEn ?? null };
  }

  const country: CountryContext = {
    code: profile.code,
    nameEn: profile.nameEn,
    region: profile.region,
    currency: { code: profile.currency.code, symbol: profile.currency.symbol, decimals: profile.currency.decimals, compact: profile.currency.compact, usdRate },
    rounding: isBase ? BDT_ROUNDING : roundingForUsdRate(usdRate),
    unavailable: [...unavailable],
    instrumentNames,
    notApplicable: isBase ? [] : [...BANGLADESH_ONLY_KEYS],
    fallbackKeys,
    institutions: profile.institutions,
  };
  return { ...base, rows, country };
}
