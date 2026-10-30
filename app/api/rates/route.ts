// GET /api/rates: the published rates snapshot with ETag/304 and a bundled-seed fallback.
import { json } from "@/lib/server/http";
import { loadRates } from "./load";

export const dynamic = "force-dynamic";

const CACHE_PUBLIC = "public, max-age=300, stale-while-revalidate=86400";

/** Strong ETag for a published version: `"v<n>"`. */
export function etagFor(version: number): string {
  return `"v${version}"`;
}

/** True when the If-None-Match header names this ETag (quoted, weak, bare, or in a list), or is `*`. */
export function ifNoneMatchMatches(header: string | null, etag: string): boolean {
  if (!header) return false;
  const bare = etag.replace(/^W\//, "").replace(/^"|"$/g, "");
  return header.split(",").some((part) => {
    const p = part.trim();
    if (p === "*") return true;
    return p.replace(/^W\//, "").replace(/^"|"$/g, "") === bare;
  });
}

export async function GET(req: Request): Promise<Response> {
  const loaded = await loadRates();
  if (loaded.source === "fallback") {
    return json(loaded.snapshot, { status: 200, headers: { "Cache-Control": "no-store", "X-Rates-Source": "fallback" } });
  }
  const etag = etagFor(loaded.snapshot.version);
  const headers = { ETag: etag, "Cache-Control": CACHE_PUBLIC, "X-Rates-Source": "d1" };
  if (ifNoneMatchMatches(req.headers.get("if-none-match"), etag)) return new Response(null, { status: 304, headers });
  return json(loaded.snapshot, { status: 200, headers });
}
