// A RatesRepo whose every method rejects, for exercising the API fallback paths.
import type { RateKey, RateRow, RatesSnapshot } from "@taka/engine";
import type { ChangeLogEntry, RatePatch, RatesRepo } from "@/lib/server/db";

export class ThrowingRatesRepo implements RatesRepo {
  constructor(private readonly error: Error = new Error("D1_ERROR: simulated failure")) {}

  private fail<T>(): Promise<T> {
    return Promise.reject(this.error);
  }

  getPublished(): Promise<RatesSnapshot> {
    return this.fail();
  }
  getDraft(): Promise<RatesSnapshot | null> {
    return this.fail();
  }
  getVersionRows(_version: number): Promise<RatesSnapshot | null> {
    return this.fail();
  }
  ensureDraft(_now: string): Promise<number> {
    return this.fail();
  }
  updateRow(_version: number, _key: RateKey, _patch: RatePatch, _note: string | null, _now: string): Promise<RateRow> {
    return this.fail();
  }
  publish(_note: string | null, _now: string, _by: string): Promise<number> {
    return this.fail();
  }
  discardDraft(_now: string): Promise<void> {
    return this.fail();
  }
  changeLog(_limit?: number, _before?: number): Promise<ChangeLogEntry[]> {
    return this.fail();
  }
}

/** The error an unmigrated D1 raises, so tests can check the "missing-table" health state. */
export function missingTableError(): Error {
  return new Error("D1_ERROR: no such table: rate_versions: SQLITE_ERROR");
}
