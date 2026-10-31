import { ADMIN_PROBLEM_MESSAGES, adminConfigProblem, createSessionCookie, isSecureRequest, sessionCookieHeader, verifyPassword } from "@/lib/server/admin-auth";
import { httpError, readJson, toResponse } from "@/lib/server/http";
import { NO_STORE, requireCsrf } from "../shared";

export const dynamic = "force-dynamic";

/** Delay before answering a failed login, so guessing stays slow. */
const FAIL_DELAY_MS = 500;

function slow(): Promise<void> {
  return new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
}

/**
 * POST {password} → 204 + session cookie; 401 after a short delay on a wrong password; 503
 * ADMIN_DISABLED (same delay) when ADMIN_PASSWORD is unset, the placeholder or under 12 characters
 * off a local host, with a message saying which.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    requireCsrf(req);
    const body = await readJson<{ password?: unknown }>(req);
    const password = typeof body?.password === "string" ? body.password : "";
    const problem = adminConfigProblem(req.url);
    if (problem !== null) {
      await slow();
      return httpError(503, "ADMIN_DISABLED", ADMIN_PROBLEM_MESSAGES[problem]);
    }
    if (!(await verifyPassword(password, req.url))) {
      await slow();
      return httpError(401, "BAD_PASSWORD", "Wrong password");
    }
    const token = await createSessionCookie();
    return new Response(null, { status: 204, headers: { ...NO_STORE, "Set-Cookie": sessionCookieHeader(token, isSecureRequest(req)) } });
  } catch (e) {
    return toResponse(e);
  }
}
