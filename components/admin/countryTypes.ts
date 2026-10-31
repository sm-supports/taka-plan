// Wire types for the country endpoints, shared by the route handlers and the admin pages (no runtime code).
import type { CountryCode, CountryField, CountryProfile, Money, RateKey, SampleProfileId } from "@taka/engine";
import type { CountryMetaPatch, CountrySummary, StoredCountry } from "@/lib/server/country-repo";
import type { ChangeLogEntry } from "@/lib/server/db";
import type { PreviewError } from "./types";

/** GET /api/countries/:code (200): the published profile plus its version. */
export type PublicCountryResponse = CountryProfile & { version: number };

/** One row of GET /api/countries (published countries only; no draft state). */
export interface PublicCountrySummary {
  code: CountryCode;
  version: number;
  sourced: number;
  assumption: number;
  missing: number;
}

/** GET /api/countries */
export interface PublicCountryList {
  countries: PublicCountrySummary[];
}

/** GET /api/admin/countries */
export interface AdminCountryList {
  countries: CountrySummary[];
}

/** GET /api/admin/countries/:code */
export interface AdminCountryResponse {
  code: CountryCode;
  published: StoredCountry | null;
  draft: StoredCountry | null;
  changeLog: ChangeLogEntry[];
}

/** PUT /api/admin/countries/:code body: one field, or a meta patch. The response is the draft (StoredCountry). */
export type EditCountryRequest = { field: RateKey; value: CountryField; note?: string } | { meta: CountryMetaPatch; note?: string };

export type CountryPreviewOutcome = { monthlyTotal: Money } | PreviewError;

export interface CountryPreviewProfile {
  id: SampleProfileId;
  published: CountryPreviewOutcome;
  draft: CountryPreviewOutcome | null;
}

/** GET /api/admin/countries/:code/preview */
export interface CountryPreviewResponse {
  code: CountryCode;
  today: string;
  published: { version: number };
  draft: { version: number } | null;
  /** Country field keys whose figure (value, status or source) differs in the draft. */
  changedFields: RateKey[];
  /** Meta keys (currency, instruments, …) that differ in the draft. */
  changedMeta: string[];
  profiles: CountryPreviewProfile[];
}

export type { CountryMetaPatch, CountrySummary, StoredCountry };
