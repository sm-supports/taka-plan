// GET /api/health: liveness plus the state of the rates table, which source /api/rates serves and
// whether admin sign-in is usable on this host.
import { adminConfigProblem, type AdminConfigProblem } from "@/lib/server/admin-auth";
import { json } from "@/lib/server/http";
import { loadRates, type DbStatus, type RatesSource } from "@/server/api/rates/load";

export const dynamic = "force-dynamic";

export interface HealthBody {
  ok: true;
  db: DbStatus;
  publishedVersion: number | null;
  ratesSource: RatesSource;
  /** Why /api/rates is on the bundled seed; a short code, never the raw error (SEC-6). Omitted when healthy. */
  detail?: "missing-table" | "query-failed" | "invalid-snapshot";
  /** With detail "invalid-snapshot": which check failed, naming rate keys only ("rates table missing rows: …"). */
  reason?: string;
  /** "ok" when admin sign-in works here, else why it is off (ADMIN_PASSWORD unset, placeholder, under 12 characters). */
  admin: "ok" | AdminConfigProblem;
}

export async function GET(req?: Request): Promise<Response> {
  const { db, publishedVersion, source, reason } = await loadRates();
  const body: HealthBody = { ok: true, db, publishedVersion, ratesSource: source, admin: adminConfigProblem(req?.url) ?? "ok" };
  if (db === "missing-table") body.detail = "missing-table";
  else if (db === "error") body.detail = "query-failed";
  else if (db === "invalid-snapshot") {
    body.detail = "invalid-snapshot";
    if (reason) body.reason = reason;
  }
  return json(body, { headers: { "Cache-Control": "no-store" } });
}
