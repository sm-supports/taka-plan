// POST /api/admin/countries/:code/discard → 204: drops that country's draft (no-op when there is none).
import { getCountryRepo } from "@/lib/server/env";
import { countryErrorResponse, parseCountryCode } from "@/server/api/countries/shared";
import { NO_STORE, nowIso, requireAdmin, requireCsrf } from "../../shared";

export const dynamic = "force-dynamic";

export async function POST(req: Request, rawCode: string): Promise<Response> {
  try {
    await requireAdmin(req);
    requireCsrf(req);
    const code = parseCountryCode(rawCode);
    await getCountryRepo().discardDraft(code, nowIso());
    return new Response(null, { status: 204, headers: NO_STORE });
  } catch (e) {
    return countryErrorResponse(e);
  }
}
