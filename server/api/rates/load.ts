// Loads the published rates snapshot from D1, falling back to the bundled seed on any failure.
// Shared by GET /api/rates (serving) and GET /api/health (reporting).
import { RATES_SEED, assertSnapshot, isEngineError, type RatesSnapshot } from "@taka/engine";
import { NoPublishedVersionError } from "@/lib/server/db";
import { getRatesRepo } from "@/lib/server/env";

export type RatesSource = "d1" | "fallback";
/** "invalid-snapshot": D1 answered but the published version failed assertSnapshot (see `reason`). */
export type DbStatus = "ok" | "missing-table" | "error" | "invalid-snapshot";

export interface LoadedRates {
  snapshot: RatesSnapshot;
  source: RatesSource;
  db: DbStatus;
  /** Version D1 reports as published; null when D1 is unusable or holds no published version. */
  publishedVersion: number | null;
  /** The failure message when `source` is "fallback"; never sent to the public rates response. */
  detail?: string;
  /** Safe one-line reason for /api/health when `db` is "invalid-snapshot", e.g. "rates table missing rows: a, b". */
  reason?: string;
}

let seed: RatesSnapshot | null = null;

/** The bundled seed, validated once. */
export function seedSnapshot(): RatesSnapshot {
  seed ??= assertSnapshot(RATES_SEED);
  return seed;
}

export async function loadRates(): Promise<LoadedRates> {
  let published: RatesSnapshot;
  try {
    published = await getRatesRepo().getPublished();
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    const db: DbStatus = e instanceof NoPublishedVersionError ? "ok" : /no such table/i.test(detail) ? "missing-table" : "error";
    return { snapshot: seedSnapshot(), source: "fallback", db, publishedVersion: null, detail };
  }
  try {
    const snapshot = assertSnapshot(published);
    return { snapshot, source: "d1", db: "ok", publishedVersion: snapshot.version };
  } catch (e) {
    // D1 answered, but the published version is not a complete, valid snapshot (usually rows of a
    // migration that has not run remotely). The validator's message names keys only, never data.
    const message = isEngineError(e) ? e.message : "snapshot failed validation";
    const reason = message.replace(/^snapshot is missing rows:/, "rates table missing rows:").replace(/^(?!rates table)/, "rates table: ");
    const version = typeof (published as { version?: unknown })?.version === "number" ? published.version : null;
    return { snapshot: seedSnapshot(), source: "fallback", db: "invalid-snapshot", publishedVersion: version, detail: message, reason };
  }
}
