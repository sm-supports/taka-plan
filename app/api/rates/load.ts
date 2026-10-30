// Loads the published rates snapshot from D1, falling back to the bundled seed on any failure.
// Shared by GET /api/rates (serving) and GET /api/health (reporting).
import { RATES_SEED, assertSnapshot, type RatesSnapshot } from "@taka/engine";
import { NoPublishedVersionError } from "@/lib/server/db";
import { getRatesRepo } from "@/lib/server/env";

export type RatesSource = "d1" | "fallback";
export type DbStatus = "ok" | "missing-table" | "error";

export interface LoadedRates {
  snapshot: RatesSnapshot;
  source: RatesSource;
  db: DbStatus;
  /** Version D1 reports as published; null when D1 is unusable or holds no published version. */
  publishedVersion: number | null;
  /** The failure message when `source` is "fallback"; never sent to the public rates response. */
  detail?: string;
}

let seed: RatesSnapshot | null = null;

/** The bundled seed, validated once. */
export function seedSnapshot(): RatesSnapshot {
  seed ??= assertSnapshot(RATES_SEED);
  return seed;
}

export async function loadRates(): Promise<LoadedRates> {
  try {
    const snapshot = assertSnapshot(await getRatesRepo().getPublished());
    return { snapshot, source: "d1", db: "ok", publishedVersion: snapshot.version };
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    const db: DbStatus = e instanceof NoPublishedVersionError ? "ok" : /no such table/i.test(detail) ? "missing-table" : "error";
    return { snapshot: seedSnapshot(), source: "fallback", db, publishedVersion: null, detail };
  }
}
