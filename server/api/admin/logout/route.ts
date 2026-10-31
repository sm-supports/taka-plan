import { clearSessionCookie, isSecureRequest } from "@/lib/server/admin-auth";
import { toResponse } from "@/lib/server/http";
import { NO_STORE, requireAdmin, requireCsrf } from "../shared";

export const dynamic = "force-dynamic";

/** POST → 204 and clears the session cookie. */
export async function POST(req: Request): Promise<Response> {
  try {
    await requireAdmin(req);
    requireCsrf(req);
    return new Response(null, { status: 204, headers: { ...NO_STORE, "Set-Cookie": clearSessionCookie(isSecureRequest(req)) } });
  } catch (e) {
    return toResponse(e);
  }
}
