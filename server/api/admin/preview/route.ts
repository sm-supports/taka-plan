import { RATE_KEYS, SAMPLE_PROFILES, SAMPLE_PROFILE_IDS, computePlan, type Plan, type PlanInput, type RateKey, type RatesSnapshot } from "@taka/engine";
import { getRatesRepo } from "@/lib/server/env";
import { json, toResponse } from "@/lib/server/http";
import type { PreviewOutcome, PreviewProfile, PreviewResponse, PlanSummary } from "@/components/admin/types";
import { NO_STORE, requireAdmin, todayIso } from "../shared";

export const dynamic = "force-dynamic";

export function summarise(plan: Plan): PlanSummary {
  return {
    monthlyTotal: plan.monthlyTotal,
    buckets: plan.buckets.map((b) => ({ id: b.id, refId: b.refId, amount: b.amount, status: b.status, instrument: b.instrument })),
    emergencyTarget: plan.emergency.target,
    goals: (plan.goals?.goals ?? []).filter((g) => g.valid).map((g) => ({ id: g.goalId, monthly: g.monthly.base })),
  };
}

/** Runs the engine for one profile; an engine that is not wired yet (or throws) becomes a per-profile error, never a 500. */
export function previewFor(input: PlanInput, snapshot: RatesSnapshot, today: string): PreviewOutcome {
  try {
    return summarise(computePlan(input, snapshot, today));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: /not implemented/i.test(message) ? "engine-not-ready" : "engine-error", message };
  }
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/** Keys whose value or valueJson differ between two snapshots. */
export function changedKeys(a: RatesSnapshot, b: RatesSnapshot): RateKey[] {
  return RATE_KEYS.filter((k) => {
    const ra = a.rows[k];
    const rb = b.rows[k];
    if (!ra || !rb) return ra !== rb;
    return !sameValue(ra.value, rb.value) || !sameValue(ra.valueJson, rb.valueJson);
  });
}

/** GET → published vs draft plan summaries for the three sample profiles. */
export async function GET(req: Request): Promise<Response> {
  try {
    await requireAdmin(req);
    const repo = getRatesRepo();
    const [published, draft] = await Promise.all([repo.getPublished(), repo.getDraft()]);
    const today = todayIso();
    const profiles: PreviewProfile[] = SAMPLE_PROFILE_IDS.map((id) => ({
      id,
      published: previewFor(SAMPLE_PROFILES[id], published, today),
      draft: draft ? previewFor(SAMPLE_PROFILES[id], draft, today) : null,
    }));
    const body: PreviewResponse = {
      today,
      published: { version: published.version, publishedAt: published.publishedAt },
      draft: draft ? { version: draft.version, publishedAt: draft.publishedAt } : null,
      changedKeys: draft ? changedKeys(published, draft) : [],
      profiles,
    };
    return json(body, { headers: NO_STORE });
  } catch (e) {
    return toResponse(e);
  }
}
