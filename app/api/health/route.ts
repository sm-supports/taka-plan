// GET /api/health: liveness plus the state of the rates table and which source /api/rates serves.
import { json } from "@/lib/server/http";
import { loadRates, type DbStatus, type RatesSource } from "@/app/api/rates/load";

export const dynamic = "force-dynamic";

export interface HealthBody {
  ok: true;
  db: DbStatus;
  publishedVersion: number | null;
  ratesSource: RatesSource;
  /** Failure message when D1 could not serve; omitted when healthy. */
  detail?: string;
}

export async function GET(): Promise<Response> {
  const { db, publishedVersion, source, detail } = await loadRates();
  const body: HealthBody = { ok: true, db, publishedVersion, ratesSource: source };
  if (detail !== undefined) body.detail = detail;
  return json(body, { headers: { "Cache-Control": "no-store" } });
}
