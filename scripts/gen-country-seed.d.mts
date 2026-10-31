/** Types for scripts/gen-country-seed.mjs. */
export function readProfiles(dir?: string): Array<Record<string, unknown> & { code: string; fields: Record<string, unknown> }>;
export function generateCountrySeedSql(profiles: ReadonlyArray<{ code: string; fields: Record<string, unknown> }>, publishedAt?: string): string;
