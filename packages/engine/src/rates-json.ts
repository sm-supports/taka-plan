/**
 * Shapes of the JSON-valued rate rows, so a malformed admin edit or country file cannot reach a
 * calculator. Used by assertSnapshot (rates.ts) and assertCountryProfile (country/validate.ts).
 */

export interface PremiumBand {
  /** Band applies up to and including this age. */
  maxAge: number;
  low: number;
  high: number;
}

/** insurance_term_premium_table: yearly premium per `per` units of cover. */
export interface TermPremiumTable {
  per: number;
  smokerMultiplier: number;
  bands: PremiumBand[];
}

/** health_premium_table: yearly premium per `per` units of cover. */
export interface HealthPremiumTable {
  per: number;
  bands: PremiumBand[];
}

/** health_cover_weights: share of one hospital stay to insure per person. */
export interface HealthCoverWeights {
  self: number;
  partner: number;
  child: number;
  parent: number;
}

/** allocation_profiles: equity share to age 30 (e0) and floor (emin) per risk profile. */
export type AllocationProfiles = Record<"careful" | "balanced" | "growth", { e0: number; emin: number }>;

export interface OldAgeAllowanceEligibility {
  menAge: number;
  womenAge: number;
  over90Monthly?: number | null;
  meansTested: boolean;
}

export interface GratuityRule {
  daysPerYear: number;
  daysPerYearAfter?: number | null;
  afterYears?: number | null;
  daysPerMonth: number;
}

export interface PensionProjection {
  monthlyContribution: number;
  years: number;
  monthlyPension: number;
}

export interface PublicPensionScheme {
  entryAgeMin?: number | null;
  entryAgeMax?: number | null;
  pensionFromAge: number;
  nomineeUntilAge?: number | null;
  inflationLinked: boolean;
  taxFree?: boolean | null;
  projections?: PensionProjection[];
}

export interface LifeTableRow {
  age: number;
  total: number;
  men?: number | null;
  women?: number | null;
  projected?: number | null;
  projectedMen?: number | null;
  projectedWomen?: number | null;
}

export interface LifeTableRemaining {
  rows: LifeTableRow[];
}

export interface SupportRatio {
  points: { year: number; value: number }[];
}

const num = (x: unknown, lo = 0, hi = Number.MAX_SAFE_INTEGER): x is number => typeof x === "number" && Number.isFinite(x) && x >= lo && x <= hi;
const optNum = (x: unknown, lo = 0, hi = Number.MAX_SAFE_INTEGER) => x === undefined || x === null || num(x, lo, hi);
const obj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

function bandsOk(b: unknown): boolean {
  if (!Array.isArray(b) || b.length === 0) return false;
  let prev = 0;
  for (const x of b) {
    if (!obj(x) || !num(x.maxAge, 1, 130) || !num(x.low) || !num(x.high) || (x.low as number) > (x.high as number) || (x.maxAge as number) <= prev) return false;
    prev = x.maxAge as number;
  }
  return true;
}

/** Validators by rate key. A key not listed here only has to be a non-null object or array. */
export const JSON_SHAPES: Partial<Record<string, (v: unknown) => boolean>> = {
  insurance_term_premium_table: (v) => obj(v) && num(v.per, 1) && num(v.smokerMultiplier, 1, 5) && bandsOk(v.bands),
  health_premium_table: (v) => obj(v) && num(v.per, 1) && bandsOk(v.bands),
  health_cover_weights: (v) => obj(v) && ["self", "partner", "child", "parent"].every((k) => num(v[k], 0, 10)),
  allocation_profiles: (v) =>
    obj(v) &&
    ["careful", "balanced", "growth"].every((k) => {
      const p = v[k];
      return obj(p) && num(p.e0, 0, 1) && num(p.emin, 0, 1) && (p.emin as number) <= (p.e0 as number);
    }),
  old_age_allowance_eligibility: (v) => obj(v) && num(v.menAge, 0, 120) && num(v.womenAge, 0, 120) && optNum(v.over90Monthly) && typeof v.meansTested === "boolean",
  gratuity_rule: (v) => obj(v) && num(v.daysPerYear, 0, 366) && optNum(v.daysPerYearAfter, 0, 366) && optNum(v.afterYears, 0, 60) && num(v.daysPerMonth, 1, 31),
  public_pension_scheme: (v) =>
    obj(v) &&
    optNum(v.entryAgeMin, 0, 120) &&
    optNum(v.entryAgeMax, 0, 120) &&
    num(v.pensionFromAge, 0, 120) &&
    optNum(v.nomineeUntilAge, 0, 130) &&
    typeof v.inflationLinked === "boolean" &&
    (v.taxFree === undefined || v.taxFree === null || typeof v.taxFree === "boolean") &&
    (v.projections === undefined || (Array.isArray(v.projections) && v.projections.every((p) => obj(p) && num(p.monthlyContribution) && num(p.years, 0, 80) && num(p.monthlyPension)))),
  life_table_remaining: (v) =>
    obj(v) &&
    Array.isArray(v.rows) &&
    v.rows.length > 0 &&
    v.rows.every((r) => obj(r) && num(r.age, 0, 120) && num(r.total, 0, 80) && ["men", "women", "projected", "projectedMen", "projectedWomen"].every((k) => optNum(r[k], 0, 80))),
  support_ratio: (v) => obj(v) && Array.isArray(v.points) && v.points.length > 0 && v.points.every((p) => obj(p) && num(p.year, 1950, 2200) && num(p.value, 0, 100)),
};

/** True when `value` has the shape required for rate key `key` (any object or array for unlisted keys). */
export function jsonShapeOk(key: string, value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const check = JSON_SHAPES[key];
  return check ? check(value) : true;
}
