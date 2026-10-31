// Country repository contract over D1 (migrations/0004_countries.sql). The D1 implementation and
// its in-memory fake live beside lib/server/db.ts; route handlers only see this interface.
import type { CountryCode, CountryField, CountryProfile, RateKey } from "@taka/engine";
import type { ChangeLogEntry } from "./db";

/** A country profile as stored: the published or draft version number travels with it. */
export interface StoredCountry {
  version: number;
  status: "draft" | "published";
  profile: CountryProfile;
}

export interface CountrySummary {
  code: CountryCode;
  publishedVersion: number | null;
  hasDraft: boolean;
  /** Count of fields by status in the published version. */
  sourced: number;
  assumption: number;
  missing: number;
}

export type CountryMetaPatch = Partial<Pick<CountryProfile, "nameEn" | "nameNative" | "languages" | "currency" | "instruments" | "institutions" | "researchedAt" | "reviewedBy">>;

export interface CountryRepo {
  /** Published profile, or null when the country has none. Reads one country only (≈60 rows). */
  getPublished(code: CountryCode): Promise<StoredCountry | null>;
  /** Published version number only (cheap; for ETag checks before reading rows). */
  getPublishedVersion(code: CountryCode): Promise<number | null>;
  getDraft(code: CountryCode): Promise<StoredCountry | null>;
  /** Returns the draft version for `code`, creating N+1 from the published one when absent. */
  ensureDraft(code: CountryCode, now: string): Promise<number>;
  /** Edits one field of the draft and logs old/new JSON. */
  updateField(code: CountryCode, version: number, field: RateKey, value: CountryField, note: string | null, now: string): Promise<CountryField>;
  /** Edits identity, currency, instrument or institution data of the draft. */
  updateMeta(code: CountryCode, version: number, patch: CountryMetaPatch, note: string | null, now: string): Promise<CountryProfile>;
  /** Supersedes the published version of `code` and publishes its draft; returns the new version. */
  publish(code: CountryCode, note: string | null, now: string, by: string): Promise<number>;
  discardDraft(code: CountryCode, now: string): Promise<void>;
  list(): Promise<CountrySummary[]>;
  changeLog(code: CountryCode | null, limit?: number, before?: number): Promise<ChangeLogEntry[]>;
}
