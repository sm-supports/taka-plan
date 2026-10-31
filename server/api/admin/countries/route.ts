// GET /api/admin/countries → { countries: CountrySummary[] } (one GROUP BY query, drafts included).
import { getCountryRepo } from "@/lib/server/env";
import { json, toResponse } from "@/lib/server/http";
import type { AdminCountryList } from "@/components/admin/countryTypes";
import { NO_STORE, requireAdmin } from "../shared";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  try {
    await requireAdmin(req);
    const body: AdminCountryList = { countries: await getCountryRepo().list() };
    return json(body, { headers: NO_STORE });
  } catch (e) {
    return toResponse(e);
  }
}
