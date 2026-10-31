// GET /api/admin/countries/:code/preview: the three sample plans with this country's published
// profile vs its draft, both overlaid on the published Bangladesh rates (withCountry), plus the
// fields and meta keys that differ. Reads one country (+ the BD profile for its dollar rate).
import { COUNTRY_FIELD_KEYS, SAMPLE_PROFILES, SAMPLE_PROFILE_IDS, withCountry, type CountryProfile, type PlanInput, type RatesSnapshot } from "@taka/engine";
import { META_PATCH_KEYS } from "@/lib/server/country-db";
import type { CountryRepo } from "@/lib/server/country-repo";
import { getCountryRepo } from "@/lib/server/env";
import { HttpError, json } from "@/lib/server/http";
import type { CountryPreviewOutcome, CountryPreviewResponse } from "@/components/admin/countryTypes";
import { stableJson } from "@/components/admin/format";
import { previewFor } from "@/server/api/admin/preview/route";
import { loadRates } from "@/server/api/rates/load";
import { countryErrorResponse, parseCountryCode } from "@/server/api/countries/shared";
import { NO_STORE, requireAdmin, todayIso } from "../../shared";

export const dynamic = "force-dynamic";

/** Taka per US dollar when D1 holds no Bangladesh profile yet (matches FIXTURE_BD). */
export const DEFAULT_BD_USD_RATE = 122;

/** Taka per US dollar for overlaying `profile`: its own rate for BD, else the published BD profile's. */
export async function bdUsdRateFor(repo: CountryRepo, profile: CountryProfile): Promise<number> {
  const bd = profile.code === "BD" ? profile : (await repo.getPublished("BD").catch(() => null))?.profile;
  const v = bd?.currency.usdRate.value;
  return typeof v === "number" && v > 0 ? v : DEFAULT_BD_USD_RATE;
}

export function changedFields(a: CountryProfile, b: CountryProfile): CountryPreviewResponse["changedFields"] {
  return COUNTRY_FIELD_KEYS.filter((k) => stableJson(a.fields[k]) !== stableJson(b.fields[k]));
}

export function changedMeta(a: CountryProfile, b: CountryProfile): string[] {
  return META_PATCH_KEYS.filter((k) => stableJson(a[k]) !== stableJson(b[k]));
}

function outcome(input: PlanInput, snapshot: RatesSnapshot, today: string): CountryPreviewOutcome {
  const o = previewFor(input, snapshot, today);
  return "error" in o ? o : { monthlyTotal: o.monthlyTotal };
}

export async function GET(req: Request, rawCode: string): Promise<Response> {
  try {
    await requireAdmin(req);
    const code = parseCountryCode(rawCode);
    const repo = getCountryRepo();
    const [published, draft, rates] = await Promise.all([repo.getPublished(code), repo.getDraft(code), loadRates()]);
    if (!published) throw new HttpError(404, "NOT_FOUND", `No published data for country ${code}`);
    const bdUsdRate = await bdUsdRateFor(repo, published.profile);
    const today = todayIso();
    const pubSnap = withCountry(rates.snapshot, published.profile, { bdUsdRate });
    const draftSnap = draft ? withCountry(rates.snapshot, draft.profile, { bdUsdRate }) : null;
    const body: CountryPreviewResponse = {
      code,
      today,
      published: { version: published.version },
      draft: draft ? { version: draft.version } : null,
      changedFields: draft ? changedFields(published.profile, draft.profile) : [],
      changedMeta: draft ? changedMeta(published.profile, draft.profile) : [],
      profiles: SAMPLE_PROFILE_IDS.map((id) => ({
        id,
        published: outcome(SAMPLE_PROFILES[id], pubSnap, today),
        draft: draftSnap ? outcome(SAMPLE_PROFILES[id], draftSnap, today) : null,
      })),
    };
    return json(body, { headers: NO_STORE });
  } catch (e) {
    return countryErrorResponse(e);
  }
}
