import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

/** Liveness + local D1 wiring check. Refined by the d1-api slice. */
export async function GET() {
  let db: "ok" | "missing-table" | "error" = "error";
  let publishedVersion: number | null = null;
  let detail: string | undefined;
  try {
    const row = await env.DB.prepare("SELECT version FROM rate_versions WHERE status = 'published'").first<{ version: number }>();
    publishedVersion = row?.version ?? null;
    db = "ok";
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    detail = msg;
    db = /no such table/i.test(msg) ? "missing-table" : "error";
  }
  return Response.json({ ok: true, db, publishedVersion, detail }, { headers: { "Cache-Control": "no-store" } });
}
