// GET/PUT /api/admin/countries/:code: one country's published + draft profile, and draft edits.
import { BASE_COUNTRY, assertCountryProfile, isEngineError, type CountryField, type CountryProfile } from "@taka/engine";
import { assertProfileSize, cleanMetaPatch, cleanNote } from "@/lib/server/country-clean";
import { CountryNotFoundError, applyMetaPatch, cleanCountryField, countryUnits, isCountryFieldKey, metaOf } from "@/lib/server/country-db";
import { getCountryRepo } from "@/lib/server/env";
import { HttpError, json, readJson } from "@/lib/server/http";
import type { AdminCountryResponse } from "@/components/admin/countryTypes";
import { countryErrorResponse, parseCountryCode } from "@/server/api/countries/shared";
import { NO_STORE, nowIso, requireAdmin, requireCsrf, todayIso } from "../../shared";

export const dynamic = "force-dynamic";

const LOG_PAGE = 50;

/** GET → { code, published, draft, changeLog (this country, last 50) }; `?before=<id>` pages the log. 404 for an unknown country. */
export async function GET(req: Request, rawCode: string): Promise<Response> {
  try {
    await requireAdmin(req);
    const code = parseCountryCode(rawCode);
    const beforeRaw = new URL(req.url).searchParams.get("before");
    const before = beforeRaw !== null && /^\d+$/.test(beforeRaw) ? Number(beforeRaw) : undefined;
    const repo = getCountryRepo();
    const [published, draft, changeLog] = await Promise.all([repo.getPublished(code), repo.getDraft(code), repo.changeLog(code, LOG_PAGE, before)]);
    if (!published && !draft) throw new HttpError(404, "NOT_FOUND", `No data for country ${code}`);
    const body: AdminCountryResponse = { code, published, draft, changeLog };
    return json(body, { headers: NO_STORE });
  } catch (e) {
    return countryErrorResponse(e);
  }
}

function invalid(code: string, e: unknown): HttpError {
  if (e instanceof HttpError) return e;
  return new HttpError(400, code, e instanceof Error ? e.message : "Invalid value");
}

/**
 * PUT { field, value: CountryField, note } or { meta: CountryMetaPatch, note } → edits the draft
 * (creating it from the published version when absent) and returns that country's draft. Field
 * edits for Bangladesh are refused (409 BASE_COUNTRY_FIELDS): its figures come from the rates table.
 * The edit is cleaned (lib/server/country-clean.ts) and the profile it would produce is validated
 * and size-capped (48 KB, 413 PROFILE_TOO_LARGE) before anything is written, so a rejected edit
 * never creates a draft.
 */
export async function PUT(req: Request, rawCode: string): Promise<Response> {
  try {
    await requireAdmin(req);
    requireCsrf(req);
    const code = parseCountryCode(rawCode);
    const body = await readJson<{ field?: unknown; value?: unknown; meta?: unknown; note?: unknown }>(req);
    if (typeof body !== "object" || body === null || Array.isArray(body)) throw new HttpError(400, "BAD_REQUEST", "Body must be an object");
    const hasField = body.field !== undefined;
    const hasMeta = body.meta !== undefined;
    if (hasField === hasMeta) throw new HttpError(400, "BAD_REQUEST", "Send either { field, value } or { meta }");
    const note = cleanNote(body);
    const today = todayIso();
    const repo = getCountryRepo();

    let candidate: (base: CountryProfile) => CountryProfile;
    let apply: (version: number) => Promise<unknown>;
    if (hasField) {
      // withCountry never reads Bangladesh's fields (its figures are the rates table), so an edit here
      // would publish and change nothing. Its meta (exchange rate, product names) does apply.
      if (code === BASE_COUNTRY) throw new HttpError(409, "BASE_COUNTRY_FIELDS", "Bangladesh's figures are edited in the rates admin, not here");
      if (!isCountryFieldKey(body.field)) throw new HttpError(400, "BAD_FIELD", `"${String(body.field)}" is not a country field`);
      const field = body.field;
      let value: CountryField;
      try {
        value = cleanCountryField(code, field, body.value, today);
      } catch (e) {
        throw invalid("INVALID_FIELD", e);
      }
      candidate = (base) => ({ ...base, fields: { ...base.fields, [field]: value } });
      apply = (version) => repo.updateField(code, version, field, value, note, nowIso());
    } else {
      const patch = cleanMetaPatch(body.meta, today);
      candidate = (base) => {
        try {
          return assertCountryProfile({ ...applyMetaPatch(metaOf(base), patch), code, fields: base.fields }, countryUnits());
        } catch (e) {
          throw invalid("INVALID_META", e);
        }
      };
      apply = (version) => repo.updateMeta(code, version, patch, note, nowIso());
    }

    // The profile this edit would produce, checked before D1 is written.
    const base = (await repo.getDraft(code)) ?? (await repo.getPublished(code));
    if (!base) throw new CountryNotFoundError(code);
    assertProfileSize(candidate(base.profile));

    const version = await repo.ensureDraft(code, nowIso());
    try {
      await apply(version);
    } catch (e) {
      if (isEngineError(e)) throw invalid(hasField ? "INVALID_FIELD" : "INVALID_META", e);
      throw e;
    }
    const draft = await repo.getDraft(code);
    if (!draft) throw new HttpError(409, "NO_DRAFT", "The draft was published or discarded meanwhile");
    return json(draft, { headers: NO_STORE });
  } catch (e) {
    return countryErrorResponse(e);
  }
}
