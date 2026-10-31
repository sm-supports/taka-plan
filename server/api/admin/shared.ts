// Helpers shared by the admin route handlers: session gate, CSRF check, timestamps.
import { CSRF_HEADER, CSRF_VALUE, isAdmin } from "@/lib/server/admin-auth";
import { HttpError } from "@/lib/server/http";

/** Throws 401 unless the request carries a valid admin cookie. */
export async function requireAdmin(req: Request): Promise<void> {
  if (!(await isAdmin(req.headers.get("cookie")))) throw new HttpError(401, "UNAUTHORIZED", "Sign in to the rates admin first");
}

/** Throws 403 unless the request is JSON and carries the X-Requested-With: taka-admin header. */
export function requireCsrf(req: Request): void {
  const ct = (req.headers.get("content-type") ?? "").trim();
  const ok = /^application\/json\b/i.test(ct) && req.headers.get(CSRF_HEADER) === CSRF_VALUE;
  if (!ok) throw new HttpError(403, "FORBIDDEN", "Mutating admin requests must be JSON with X-Requested-With: taka-admin");
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** YYYY-MM-DD for "today" arguments. */
export function todayIso(): string {
  return nowIso().slice(0, 10);
}

export const NO_STORE = { "Cache-Control": "no-store" } as const;
