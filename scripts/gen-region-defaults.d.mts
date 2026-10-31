/** Types for scripts/gen-region-defaults.mjs (used by test/region-defaults.test.ts). */
type Field = { value: number | null; valueJson?: unknown; status: string; sourceName: string; sourceUrl: string; asOf: string; note?: string | null };
type Defaults = Record<string, Record<string, Field>>;
export const COUNTRIES_DIR: string;
export const SEED_PATH: string;
export const FIELDS_TS: string;
export const OUT_FILE: string;
export const REGIONS: readonly string[];
export const UNKNOWN_MEANS_NULL: readonly string[];
export const MIN_COUNTRIES: number;
export const BASE_COUNTRY: string;
export const SOURCE_NAME: string;
export const SOURCE_URL: string;
export function readFieldSpecs(file?: string): { key: string; kind: "fact" | "assumption" }[];
export function computeRegionDefaults(profiles: unknown[], units: Record<string, string>, specs: { key: string; kind: "fact" | "assumption" }[]): Defaults;
export function genRegionDefaults(dir?: string, seedPath?: string, fieldsTs?: string): { profiles: number; defaults: Defaults };
