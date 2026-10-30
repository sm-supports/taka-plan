// Fetches the published rates snapshot from the API and validates it.
import { assertSnapshot, type RatesSnapshot } from "@taka/engine";

export async function fetchRates(init?: { signal?: AbortSignal }): Promise<{ snapshot: RatesSnapshot; source: "network" }> {
  const res = await fetch("/api/rates", { signal: init?.signal, headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`GET /api/rates failed: ${res.status}`);
  const body: unknown = await res.json();
  return { snapshot: assertSnapshot(body), source: "network" };
}
