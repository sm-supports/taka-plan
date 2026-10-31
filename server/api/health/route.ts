// GET /api/health: liveness plus the state of the rates table and which source /api/rates serves.
import { json } from "@/lib/server/http";
import { loadRates, type DbStatus, type RatesSource } from "@/server/api/rates/load";

export const dynamic = "force-dynamic";

export interface HealthBody {
  ok: true;
  db: DbStatus;
  publishedVersion: number | null;
  ratesSource: RatesSource;
  /** Why /api/rates is on the bundled seed; a short code, never the raw error (SEC-6). Omitted when healthy. */
  detail?: "missing-table" | "query-failed";
}

export async function GET(): Promise<Response> {
  const { db, publishedVersion, source } = await loadRates();
  const body: HealthBody = { ok: true, db, publishedVersion, ratesSource: source };
  if (db === "missing-table") body.detail = "missing-table";
  else if (db === "error") body.detail = "query-failed";
  return json(body, { headers: { "Cache-Control": "no-store" } });
}
