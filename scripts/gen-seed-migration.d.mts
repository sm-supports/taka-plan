/** Types for scripts/gen-seed-migration.mjs (used by test/seed-drift.test.ts). */
export function generateSeedSql(snapshot: { version: number; publishedAt: string; rows: Record<string, unknown> }): string;
