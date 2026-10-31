/** Types for scripts/gen-seed-migration.mjs (used by test/seed-drift.test.ts). */
type Snapshot = { version: number; publishedAt: string; rows: Record<string, unknown> };
export const V1_KEYS: readonly string[];
export const M2_M6_M7_KEYS: readonly string[];
export const ROW_BATCHES: readonly { file: string; keys: readonly string[]; mode: "seed" | "add" }[];
export function generateSeedSql(snapshot: Snapshot, keys?: readonly string[]): string;
export function generateAddedRowsSql(snapshot: Snapshot, keys: readonly string[], file: string): string;
export function generateAll(snapshot: Snapshot): Record<string, string>;
