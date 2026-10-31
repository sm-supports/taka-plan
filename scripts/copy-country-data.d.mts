/** Types for scripts/copy-country-data.mjs (used by lib/country/copy-country-data.test.ts). */
type Profile = { code: string; nameEn: string; nameNative: string; region: string; currency: { code: string }; languages: string[] };
type IndexEntry = { code: string; nameEn: string; nameNative: string; region: string; currency: string; languages: string[]; locales: string[] };
export const SOURCE_DIR: string;
export const OUT_DIR: string;
export const LOCALES: readonly string[];
export function localesForLanguages(languages: readonly string[]): string[];
export function indexEntryFor(p: Profile): IndexEntry;
export function copyCountryData(src?: string, out?: string): { profiles: number; indexGenerated: boolean; files: string[] };
