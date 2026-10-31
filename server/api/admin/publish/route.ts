import { assertSnapshot } from "@taka/engine";
import { cleanNote } from "@/lib/server/country-clean";
import { getRatesRepo } from "@/lib/server/env";
import { HttpError, json, readJson, toResponse } from "@/lib/server/http";
import { NO_STORE, nowIso, requireAdmin, requireCsrf } from "../shared";

export const dynamic = "force-dynamic";

/** POST {note} → publishes the draft → { version }. */
export async function POST(req: Request): Promise<Response> {
  try {
    await requireAdmin(req);
    requireCsrf(req);
    const body = await readJson<{ note?: unknown }>(req);
    const note = cleanNote(body);
    const repo = getRatesRepo();
    const draft = await repo.getDraft();
    if (!draft) throw new HttpError(409, "NO_DRAFT", "There is no draft to publish");
    try {
      assertSnapshot(draft);
    } catch (e) {
      throw new HttpError(400, "INVALID_DRAFT", e instanceof Error ? e.message : "Draft is invalid");
    }
    const version = await repo.publish(note, nowIso(), "admin");
    return json({ version }, { headers: NO_STORE });
  } catch (e) {
    return toResponse(e);
  }
}
