// GET /api/countries/:code: one country's published profile from D1 with ETag/304.
// 404 when the country has no published version (the client then uses its static file),
// 503 (never cached) when D1 fails. Cost: one indexed SELECT for a 304, two for a fresh 200
// (three when an If-None-Match did not match).
import { assertCountryProfile } from "@taka/engine";
import { countryUnits } from "@/lib/server/country-db";
import { getCountryRepo } from "@/lib/server/env";
import { HttpError, json, toResponse } from "@/lib/server/http";
import { ifNoneMatchMatches } from "@/server/api/rates/route";
import type { PublicCountryResponse } from "@/components/admin/countryTypes";
import { countryEtag, parseCountryCode } from "../shared";

export const dynamic = "force-dynamic";

const CACHE_PUBLIC = "public, max-age=300, stale-while-revalidate=86400";

function notFound(code: string): Response {
  return json({ error: { code: "NOT_FOUND", message: `No published data for ${code}` } }, { status: 404, headers: { "Cache-Control": "public, max-age=300" } });
}

function unavailable(): Response {
  return json({ error: { code: "UNAVAILABLE", message: "Country data is unavailable; use the bundled copy" } }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

export async function GET(req: Request, rawCode: string): Promise<Response> {
  let code: string;
  try {
    code = parseCountryCode(rawCode);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: { code: e.code, message: e.message } }, { status: 400, headers: { "Cache-Control": "no-store" } });
    return toResponse(e);
  }
  try {
    const repo = getCountryRepo();
    // Revalidation checks the version first: a matching If-None-Match costs one indexed row, no field rows.
    const inm = req.headers.get("if-none-match");
    if (inm) {
      const version = await repo.getPublishedVersion(code);
      if (version === null) return notFound(code);
      if (ifNoneMatchMatches(inm, countryEtag(code, version))) {
        return new Response(null, { status: 304, headers: { ETag: countryEtag(code, version), "Cache-Control": CACHE_PUBLIC, "X-Country-Source": "d1" } });
      }
    }
    const stored = await repo.getPublished(code);
    if (!stored) return notFound(code);
    const profile = assertCountryProfile(stored.profile, countryUnits());
    const body: PublicCountryResponse = { ...profile, version: stored.version };
    return json(body, { status: 200, headers: { ETag: countryEtag(code, stored.version), "Cache-Control": CACHE_PUBLIC, "X-Country-Source": "d1" } });
  } catch {
    return unavailable();
  }
}
