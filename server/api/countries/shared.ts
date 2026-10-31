// Helpers shared by the public and admin country handlers.
import { isEngineError, type CountryCode } from "@taka/engine";
import { CountryNotFoundError, NotADraftError } from "@/lib/server/country-db";
import { HttpError, httpError, toResponse } from "@/lib/server/http";

const CODE = /^[A-Za-z]{2}$/;

/** A Pages Functions route param (string, or string[] for catch-alls) as one string. */
export function paramOf(p: string | string[] | undefined): string {
  return (Array.isArray(p) ? p[0] : p) ?? "";
}

/** ISO 3166-1 alpha-2 from a URL segment, upper-cased; 400 BAD_COUNTRY otherwise. */
export function parseCountryCode(raw: unknown): CountryCode {
  if (typeof raw !== "string" || !CODE.test(raw)) throw new HttpError(400, "BAD_COUNTRY", "Country code must be two letters (ISO 3166-1 alpha-2)");
  return raw.toUpperCase();
}

/** Strong ETag for a country's published version: `"IN-v3"`. */
export function countryEtag(code: CountryCode, version: number): string {
  return `"${code}-v${version}"`;
}

/** Maps repository errors to HTTP: unknown country 404, lost draft 409, invalid figure 400; else toResponse. */
export function countryErrorResponse(e: unknown): Response {
  if (e instanceof CountryNotFoundError) return httpError(404, "NOT_FOUND", e.message);
  if (e instanceof NotADraftError) return httpError(409, "NO_DRAFT", e.message);
  if (isEngineError(e) && e.code === "INVALID_INPUT") return httpError(400, "INVALID_INPUT", e.message);
  return toResponse(e);
}
