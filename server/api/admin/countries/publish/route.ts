// POST /api/admin/countries/:code/publish { note } → { version }: validates and publishes that country's draft.
// Before publishing, the draft must pass the profile validator, the server limits (dates not in the
// future, string and size caps) and run the three sample plans through withCountry + computePlan
// without throwing; otherwise 400 INVALID_DRAFT with the reason, and nothing is published.
import { SAMPLE_PROFILES, SAMPLE_PROFILE_IDS, assertCountryProfile, computePlan, withCountry, type CountryProfile, type RatesSnapshot } from "@taka/engine";
import { assertProfileLimits, cleanNote } from "@/lib/server/country-clean";
import { countryUnits } from "@/lib/server/country-db";
import type { CountryRepo } from "@/lib/server/country-repo";
import { getCountryRepo } from "@/lib/server/env";
import { HttpError, json, readJson } from "@/lib/server/http";
import { loadRates } from "@/server/api/rates/load";
import { countryErrorResponse, parseCountryCode } from "@/server/api/countries/shared";
import { bdUsdRateFor } from "../preview/route";
import { NO_STORE, nowIso, requireAdmin, requireCsrf, todayIso } from "../../shared";

export const dynamic = "force-dynamic";

function invalidDraft(e: unknown, prefix = ""): HttpError {
  const message = e instanceof Error ? e.message : "Draft is invalid";
  return new HttpError(400, "INVALID_DRAFT", `${prefix}${message}`);
}

/** Throws 400 INVALID_DRAFT unless every sample plan computes with `profile` overlaid on `base`. */
export function assertSamplePlansRun(base: RatesSnapshot, profile: CountryProfile, bdUsdRate: number, today: string): void {
  let snapshot: RatesSnapshot;
  try {
    snapshot = withCountry(base, profile, { bdUsdRate });
  } catch (e) {
    throw invalidDraft(e, "The country overlay fails with this draft: ");
  }
  for (const id of SAMPLE_PROFILE_IDS) {
    try {
      computePlan(SAMPLE_PROFILES[id], snapshot, today);
    } catch (e) {
      throw invalidDraft(e, `Sample plan "${id}" fails with this draft: `);
    }
  }
}

async function checkDraft(repo: CountryRepo, profile: CountryProfile, today: string): Promise<void> {
  try {
    assertCountryProfile(profile, countryUnits());
    assertProfileLimits(profile, today);
  } catch (e) {
    throw invalidDraft(e);
  }
  const [rates, bdUsdRate] = await Promise.all([loadRates(), bdUsdRateFor(repo, profile)]);
  assertSamplePlansRun(rates.snapshot, profile, bdUsdRate, today);
}

export async function POST(req: Request, rawCode: string): Promise<Response> {
  try {
    await requireAdmin(req);
    requireCsrf(req);
    const code = parseCountryCode(rawCode);
    const note = cleanNote(await readJson<unknown>(req));
    const repo = getCountryRepo();
    const draft = await repo.getDraft(code);
    if (!draft) throw new HttpError(409, "NO_DRAFT", `${code} has no draft to publish`);
    await checkDraft(repo, draft.profile, todayIso());
    const version = await repo.publish(code, note, nowIso(), "admin");
    return json({ version }, { headers: NO_STORE });
  } catch (e) {
    return countryErrorResponse(e);
  }
}
