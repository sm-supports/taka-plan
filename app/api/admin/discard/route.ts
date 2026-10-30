import { getRatesRepo } from "@/lib/server/env";
import { toResponse } from "@/lib/server/http";
import { NO_STORE, nowIso, requireAdmin, requireCsrf } from "../shared";

export const dynamic = "force-dynamic";

/** POST → drops the draft (no-op when there is none) → 204. */
export async function POST(req: Request): Promise<Response> {
  try {
    await requireAdmin(req);
    requireCsrf(req);
    await getRatesRepo().discardDraft(nowIso());
    return new Response(null, { status: 204, headers: NO_STORE });
  } catch (e) {
    return toResponse(e);
  }
}
