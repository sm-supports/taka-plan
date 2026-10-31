// GET/PUT /api/admin/countries/:code: one country's published + draft profile, and draft edits.
import { isEngineError } from "@taka/engine";
import { META_PATCH_KEYS, cleanCountryField, isCountryFieldKey } from "@/lib/server/country-db";
import type { CountryMetaPatch } from "@/lib/server/country-repo";
import { getCountryRepo } from "@/lib/server/env";
import { HttpError, json, readJson } from "@/lib/server/http";
import type { AdminCountryResponse } from "@/components/admin/countryTypes";
import { countryErrorResponse, noteOf, parseCountryCode } from "@/server/api/countries/shared";
import { NO_STORE, nowIso, requireAdmin, requireCsrf } from "../../shared";

export const dynamic = "force-dynamic";

const LOG_PAGE = 50;
const META_KEY_SET: ReadonlySet<string> = new Set(META_PATCH_KEYS);

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

/** Keeps only the patchable meta keys; anything else (code, iso3, region, fields, …) is a 400. */
function sanitiseMeta(raw: unknown): CountryMetaPatch {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new HttpError(400, "BAD_PATCH", "meta must be an object");
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!META_KEY_SET.has(k)) throw new HttpError(400, "BAD_PATCH", `meta.${k} cannot be edited`);
    if (v === undefined) continue;
    if (v === null) throw new HttpError(400, "BAD_PATCH", `meta.${k} cannot be empty`);
    patch[k] = v;
  }
  if (Object.keys(patch).length === 0) throw new HttpError(400, "BAD_PATCH", "meta patch is empty");
  return patch as CountryMetaPatch;
}

function invalid(code: string, e: unknown): HttpError {
  return new HttpError(400, code, e instanceof Error ? e.message : "Invalid value");
}

/**
 * PUT { field, value: CountryField, note } or { meta: CountryMetaPatch, note } → edits the draft
 * (creating it from the published version when absent) and returns that country's draft.
 */
export async function PUT(req: Request, rawCode: string): Promise<Response> {
  try {
    await requireAdmin(req);
    requireCsrf(req);
    const code = parseCountryCode(rawCode);
    const body = await readJson<{ field?: unknown; value?: unknown; meta?: unknown; note?: unknown }>(req);
    if (typeof body !== "object" || body === null) throw new HttpError(400, "BAD_REQUEST", "Body must be an object");
    const hasField = body.field !== undefined;
    const hasMeta = body.meta !== undefined;
    if (hasField === hasMeta) throw new HttpError(400, "BAD_REQUEST", "Send either { field, value } or { meta }");
    const note = noteOf(body);
    const repo = getCountryRepo();

    if (hasField) {
      if (!isCountryFieldKey(body.field)) throw new HttpError(400, "BAD_FIELD", `"${String(body.field)}" is not a country field`);
      const field = body.field;
      // Validate before touching D1 so an invalid edit never creates a draft.
      let value;
      try {
        value = cleanCountryField(code, field, body.value);
      } catch (e) {
        throw invalid("INVALID_FIELD", e);
      }
      const version = await repo.ensureDraft(code, nowIso());
      await repo.updateField(code, version, field, value, note, nowIso());
    } else {
      const patch = sanitiseMeta(body.meta);
      const version = await repo.ensureDraft(code, nowIso());
      try {
        await repo.updateMeta(code, version, patch, note, nowIso());
      } catch (e) {
        if (isEngineError(e)) throw invalid("INVALID_META", e);
        throw e;
      }
    }
    const draft = await repo.getDraft(code);
    if (!draft) throw new HttpError(409, "NO_DRAFT", "The draft was published or discarded meanwhile");
    return json(draft, { headers: NO_STORE });
  } catch (e) {
    return countryErrorResponse(e);
  }
}
