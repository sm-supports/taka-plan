// GET /api/countries: published countries with their version and field counts (one GROUP BY query).
import { getCountryRepo } from "@/lib/server/env";
import { json } from "@/lib/server/http";
import type { PublicCountryList } from "@/components/admin/countryTypes";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const all = await getCountryRepo().list();
    const body: PublicCountryList = {
      countries: all.flatMap((c) => (c.publishedVersion === null ? [] : [{ code: c.code, version: c.publishedVersion, sourced: c.sourced, assumption: c.assumption, missing: c.missing }])),
    };
    return json(body, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=86400", "X-Country-Source": "d1" } });
  } catch {
    return json({ error: { code: "UNAVAILABLE", message: "Country data is unavailable" } }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
