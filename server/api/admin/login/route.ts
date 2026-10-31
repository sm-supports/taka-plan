import { createSessionCookie, isSecureRequest, sessionCookieHeader, verifyPassword } from "@/lib/server/admin-auth";
import { httpError, readJson, toResponse } from "@/lib/server/http";
import { NO_STORE, requireCsrf } from "../shared";

export const dynamic = "force-dynamic";

/** Delay before answering a failed login, so guessing stays slow. */
const FAIL_DELAY_MS = 500;

/** POST {password} → 204 + session cookie, or 401 after a short delay. */
export async function POST(req: Request): Promise<Response> {
  try {
    requireCsrf(req);
    const body = await readJson<{ password?: unknown }>(req);
    const password = typeof body?.password === "string" ? body.password : "";
    if (!(await verifyPassword(password, req.url))) {
      await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
      return httpError(401, "BAD_PASSWORD", "Wrong password");
    }
    const token = await createSessionCookie();
    return new Response(null, { status: 204, headers: { ...NO_STORE, "Set-Cookie": sessionCookieHeader(token, isSecureRequest(req)) } });
  } catch (e) {
    return toResponse(e);
  }
}
