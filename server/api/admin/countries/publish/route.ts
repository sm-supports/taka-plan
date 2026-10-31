// POST /api/admin/countries/:code/publish { note } → { version }: validates and publishes that country's draft.
import { assertCountryProfile } from "@taka/engine";
import { countryUnits } from "@/lib/server/country-db";
import { getCountryRepo } from "@/lib/server/env";
import { HttpError, json, readJson } from "@/lib/server/http";
import { countryErrorResponse, noteOf, parseCountryCode } from "@/server/api/countries/shared";
import { NO_STORE, nowIso, requireAdmin, requireCsrf } from "../../shared";

export const dynamic = "force-dynamic";

export async function POST(req: Request, rawCode: string): Promise<Response> {
  try {
    await requireAdmin(req);
    requireCsrf(req);
    const code = parseCountryCode(rawCode);
    const note = noteOf(await readJson<unknown>(req));
    const repo = getCountryRepo();
    const draft = await repo.getDraft(code);
    if (!draft) throw new HttpError(409, "NO_DRAFT", `${code} has no draft to publish`);
    try {
      assertCountryProfile(draft.profile, countryUnits());
    } catch (e) {
      throw new HttpError(400, "INVALID_DRAFT", e instanceof Error ? e.message : "Draft is invalid");
    }
    const version = await repo.publish(code, note, nowIso(), "admin");
    return json({ version }, { headers: NO_STORE });
  } catch (e) {
    return countryErrorResponse(e);
  }
}
