# Architecture contracts (Stage 0)

> **Superseded hosting notes (31 Oct 2026):** the app now ships as a static export on Cloudflare Pages with Pages Functions for `/api/*` (see [ARCHITECTURE.md](ARCHITECTURE.md) and [DEPLOY.md](DEPLOY.md)). Mentions below of `cloudflare.config.ts`, the `cf` CLI, `app/api/**` route handlers, `proxy.ts` and Workers deploys describe the original build; the engine, rates and i18n contracts are unchanged. Route handlers now live in `server/api/**`.

Extracted from the approved build plan. Every Stage 1 slice codes against the contracts below; the TypeScript files under `packages/engine/src`, `lib/store`, `lib/rates`, `lib/server` and `lib/i18n` are the source of truth where they differ.

## Architecture

### Repo layout (single npm package; engine via path alias `@taka/engine`, own tsconfig + purity test)

```
.nvmrc .gitignore .dev.vars.example .github/workflows/ci.yml
package.json tsconfig.json vite.config.ts vitest.config.ts playwright.config.ts next.config.ts cloudflare.config.ts postcss.config.mjs
docs/{PRD.md (moved), TOOLING.md, ARCHITECTURE.md}
migrations/0001_schema.sql  migrations/0002_seed_rates.sql (GENERATED from seed JSON)
scripts/{gen-seed-migration.mjs, check-bundle.mjs, smoke.sh}
packages/engine/src/           # PURE TS: no react/next/node:/cloudflare:workers/@/ imports
  index.ts types.ts money.ts format.ts rates.ts explain.ts data/rates.seed.json fixtures/profiles.ts
  m1/ m3/ m4/ m5/ plan/ (each: types.ts, <module>.ts, *.test.ts)
app/layout.tsx app/globals.css app/page.tsx app/manifest.ts app/icon.png
app/[locale]/{layout.tsx,page.tsx,start/[step]/page.tsx,plan/page.tsx,m1|m3|m4|m5/page.tsx,about/page.tsx}
app/admin/{layout.tsx,page.tsx,log/page.tsx,preview/page.tsx}
app/api/{health,rates}/route.ts  app/api/admin/{login,logout,rates,publish,discard,preview}/route.ts
components/{ui,explain,onboarding,plan,calculators/{m1,m3,m4,m5},admin,layout,pwa}/
lib/i18n/{config,types,server,provider,useT,useFormat}.ts + dictionaries/{en,bn}/{index,common,onboarding,plan,m1,m3,m4,m5,explain,terms,admin,errors}.ts
lib/store/{types,store,selectors,usePlan}.ts   lib/rates/{provider.tsx,useRates.ts,client.ts,storage.ts}
lib/server/{db.ts (RatesRepo + D1 impl), admin-auth.ts, env.ts, http.ts}   lib/analytics.ts (no-op)
public/{sw.js,icons/}   e2e/{onboarding,offline}.spec.ts   test/{fakes/fakeRatesRepo.ts, stubs/cloudflare-workers.ts, setup.ts}
```

Why alias, not workspace: purity is enforced by the engine's own `tsconfig` (no DOM lib) + `purity.test.ts`; both client and admin route handlers import it; a workspace adds npm/Vite/CI complexity on top of three beta tools for no gain until the engine is published.

### Engine contracts (`packages/engine/src`) — written in full in Stage 0; every slice codes against them

**types.ts** `Locale="bn"|"en"`, `Money=number` (whole taka), `Rate=number` (0.08), `ISODate`, `IncomeType="salaried"|"freelance"|"business"`, `Dependent="partner"|"children"|"parents"`, `Status="red"|"amber"|"green"`, `Instrument="savings_account"|"fdr_3m"|"fdr_1y"|"dps"|"sanchayapatra_5y"|"tbill_91d"|"tbond_5y"|"tbond_10y"|"equity_fund"|"gold"`, `Profile{age,incomeType,takeHome,essentials,dependents,hasDebt}`, `EngineError(code:"MISSING_RATE"|"INVALID_INPUT")`.

**money.ts** `roundMoney(x, "lump"|"monthly"|"exact"|"interest")` → nearest ৳500 / ৳100 / ৳1 / ৳100. Math unrounded internally, rounded once at output; every explain step carries `raw` + `rounded`. Percents 1 dp.

**rates.ts** `RATE_KEYS` const tuple (exhaustive), `RateRow{key,value,valueJson?,unit,rangeLow?,rangeHigh?,labelEn,labelBn?,sourceName,sourceUrl,asOf,reviewedBy,nextReview,note?,isAppAssumption}`, `RatesSnapshot{version,publishedAt,rows}`, `getRate`, `getRow`, `afterTax(n,tax)=n(1−tax)`, `realReturn(n,i)=(1+n)/(1+i)−1` (Fisher), `instrumentNominal/AfterTax/Real(snapshot, instrument)`, `isStale(row,today)`, `staleKeys`, `assertSnapshot(unknown)`. **Rate bounds:** `assertSnapshot` validates values by unit — `rate` and `ratio` finite and 0 ≤ v ≤ 1 (1 = 100%), `bdt` ≥ 0, `months`/`years` > 0 and ≤ 1200, `json` → `valueJson` a non-null object or array, and `tax_slabs` additionally a non-empty array of `{width: number|null (> 0), rate: 0..1}`; a 5.0 FDR rate or a string `tax_slabs` is rejected with `INVALID_INPUT` (`row "<key>": bad value|valueJson`). Instrument→rate key + tax key mapping (bank products → `tax_bank_interest`; Sanchayapatra → `tax_sanchayapatra_profit`). Convention: "today" comparisons use `inflation_cpi`; projections use `inflation_projection`. Vectors: Sanchayapatra 11.83% → 10.647% after tax → **+2.13% real** vs 8.34%; FDR 1-yr 7.5% → 6.75% → **−1.47%** (PRD: +2.1 / −1.5).

**explain.ts** `Assumption{key,value,unit,labelEn,labelBn?,asOf,sourceUrl,sourceName,stale,isAppAssumption}`, `ExplainStep{id,inputs,raw,rounded,unit}`, `Explanation{steps,assumptions,notes}`, `createExplain(snapshot,today)` → `{use(key), step(st), note(key), done()}`. Each module exports `const Mx_STEP_IDS = [...] as const` so UI slices can author dictionary entries in parallel.

**format.ts** `toBanglaDigits`, `fromBanglaDigits`, `groupIndian(1250000)="12,50,000"`, `formatTaka(n,{digits,compact?,sign?})` ("৳12,50,000" / "৳১২,৫০,০০০" / "৳9.0 lakh" / "৳৯.০ লাখ" / "৳1.2 crore"), `formatPercent`, `formatMonths`, `formatAsOf` ("Sep 2026" / "সেপ্টেম্বর ২০২৬"), `parseTakaInput` (accepts "12,50,000", "১২৫০০০", "12.5 lakh").

**m1** `computeEmergencyFund(M1Input, rates, today): M1Result`, `suggestMonths(...)`. `suggested = clamp(6 + 3·[freelance|business] + 2·[soleEarner ∧ dependents] + 2·[¬healthInsurance], 3, 15)`; `target = essentials × months`; `gap = max(0, target − saved)`; `monthly = roundUp(gap / buildMonths(12), "monthly")` (rounded **up** to ৳100 so `monthsToFull ≤ buildMonths`); tiers: 1 month of essentials in a savings account (`tier1 = essentials`, whole taka), rest as 3-month FDR ladder (`tier2 = target − tier1`, `fdrPerSlice = round(tier2/3, "lump")`), `banksNeeded = ceil(target / deposit_insurance_limit)`, `sanchayapatraLayer = target > emergency_large_buffer_threshold`. Status red `<1` month covered, amber `<months`, green. Vector: essentials 25 000, salaried, [partner,children], sole earner, no insurance, saved 50 000 → months 10, target 250 000, monthly 16 700, covered 2.0, banks 2; freelancer+sole+no insurance → 13; all bumps → 15 cap.

**m3** `emi(P,r,n)=P·rm/(1−(1+rm)^−n)` (rm=0 → P/n), `maxLoan(E,r,n)=E·(1−(1+rm)^−n)/rm`, `simulatePayoff(debts, extraMonthly, "avalanche"|"snowball")`, `computeDebtHealth(M3Input, rates, today): M3Result`. `emiCapacity = takeHome − savingsTarget − essentials − cashBuffer(5% takeHome)` (floor 0 + `negative_capacity` flag); `totalEmi = Σ loan.emi + Σ carried-card minimum (5%)`; `headroom = max(0, capacity − totalEmi)`; `maxAffordableLoan = round(maxLoan(headroom, 12%, 60), "lump")`. Flags: card carried → red; utilisation > 50% → amber; EMI ratio > 40% → red. `primaryFlag` = first red by severity `card_carried > emi_ratio > negative_capacity`; other reds demoted to amber (`demotedFromRed`). `interestSaved = snowball.totalInterest − avalanche.totalInterest`. `highInterestDebts` = rate > 15%. **PRD-mandated vectors:** `emi(800000, 0.12, 60) ≈ 17 795.6 → 17 800`; `maxLoan(20000, 0.12, 60) ≈ 899 100.8 → 899 000 (≈ 9.0 lakh)`. Property: avalanche interest ≤ snowball, both terminate.

**m4** `computeSaveFirst(M4Input, rates, today): M4Result`. `avg = mean(last6Incomes) || takeHome`; `feasible = max(0,(avg − essentials)/avg)`; `suggested = min(20%, feasible)`; `savingsRate = min(input ?? suggested, feasible)`; `amount = round(avg × rate, "monthly")`; `expensesAllowed = avg − amount`; freelance/business → `mode="percentOfEachPayment"`; instrument `dps`; `transferDay = payday+1`. Amber when squeezed below suggested, red when feasible ≤ 0. Vectors: 50 000/30 000 → 10 000; 50 000/45 000 → 5 000 amber; freelancer [40,60,30,70,50,50]k → avg 50 000, 20% of each payment.

**m5** `futureValue(C,i,n)=C(1+i)^n`, `sinkingFundMonthly(FV, r, months)=FV·rm/((1+rm)^n−1)` (rm=0 → FV/n), `horizonFor(years)` (<3 short, 3–5 medium, >5 long), `instrumentsFor(h, allocation?)` (M6 hook; MVP long = `[sanchayapatra_5y, tbond_10y]` + note), `computeGoals(M5Input, rates, today): M5Result`. Candidates: short `[fdr_1y, dps, tbill_91d]`, medium `[sanchayapatra_5y, tbond_5y]`. `base` = highest after-tax candidate, `low` = lowest, `high` = base. `monthly` is sized from the **unrounded** FV (`fvRaw`); the `m5.monthly` step records raw and rounded (5 lakh / 5 y → base 9 300). `real = realReturn(afterTax, inflation of this goal)` (education/health use their own rows), `belowInflation = real < 0` → red; `realVsCpi` (Fisher vs `inflation_cpi`) is for display only. The `m5.real` step inputs `{afterTax, inflation}` carry the goal's inflation. Goal valid only with name, cost > 0, 1 ≤ years ≤ 40; invalid returned `valid:false`, excluded from totals. Vector: 500 000, 5 y, 8% → FV 734 500; Sanchayapatra path monthly ≈ 9 300; FDR 1-yr path real −1.47% → red.

**plan** `computePlan(PlanInput, rates, today): Plan`, `profileToPlanInput(profile, overrides?)`. `PlanInput{profile,m1,m4,m3?,m5?, insurance? (M2 hook), allocation? (M6), retirement? (M7)}`. Buckets `emergency|insurance|debt|goal|future` with `priority, amount, instrument, status, demotedFromRed, reasonKey, reasonParams, nextStepKey, module`. Algorithm: `B = budget.savingsAmount`; emergency (if `gap > 0`) `= min(gap, clamp(m1.monthlySaving, minShare × B, maxShare × B))` with `minShare = plan_emergency_min_share` (0.6), `maxShare = plan_emergency_max_share` (0.8), both read via `ex.use`; when `gap < minShare × B` the cap at the gap wins. Emergency instrument `savings_account` while `m1.saved < tiers.savingsAccount`, else `fdr_3m` (nextStepKey `plan.next.openSavings` / `plan.next.fdrLadder`); the instrument id is also passed as `reasonParams.instrument`. Insurance only if hook present; debt if any high-interest debts `= min(remaining, Σ balance / debt_payoff_target_months)` instrument `loan_prepayment`, `reasonParams.months = ceil(Σ balance / amount)` (the target months when amount is 0); goals split `remaining` ∝ `monthly.base`, `goalsShortfall` recorded, one `plan.goalAllocation` step per goal. **Bucket rules:** any bucket whose amount is 0 is dropped, except the emergency bucket when the fund is already full (`gap === 0`): it stays first with amount 0, status green, `plan.reason.emergencyFull`, `plan.next.keepFull`. A `future` bucket (DPS, `plan.reason.addGoal`, `plan.next.addGoal`) absorbs whatever remains after emergency/insurance/debt/goals so `monthlyTotal === B` whenever `B > 0`; it is omitted when the remainder is 0 (B = 0 with an unfilled fund → no buckets). One-red rule: keep the lowest-priority red, demote others to amber. Vectors: 50 000/30 000, no dependents, saved 0 → B 10 000, months 8, target 240 000, M1 monthly 20 000 → emergency 8 000 (80% cap), 2 000 to future; saved 200 000 → M1 monthly 3 400 → emergency 6 000 (60% floor), 4 000 to future; saved 238 500 → gap 1 500 → emergency 1 500, 8 500 to future.

**fixtures/profiles.ts** `SAMPLE_PROFILES: {firstJob, freelancer, familyWithDebt}` (PRD segments: ৳45k salaried no debt; freelancer avg ৳90k irregular; two-earner ৳120k with 12% home loan EMI 25k + carried card). Used by engine tests, i18n coverage test, admin preview, Playwright smoke.

### Rates table

**D1 schema** (`migrations/0001_schema.sql`): `rate_versions(version PK, status 'draft'|'published'|'superseded', created_at, published_at, published_by, note)` with partial unique indexes so at most one published and one draft; `rates(version FK, key, value REAL, value_json, unit, range_low, range_high, label_en, label_bn, source_name, source_url, as_of, reviewed_by, next_review, note, is_app_assumption, PK(version,key))`; `change_log(id, at, actor, action 'create_draft'|'edit'|'publish'|'discard_draft', version, key, old_value, new_value, note)`. Published versions immutable; first edit after publish copies N → draft N+1; publish supersedes + promotes in one `db.batch`. **Published version = `SELECT version FROM rate_versions WHERE status='published'`**; the API echoes it, the client stores it.

**Seed** `packages/engine/src/data/rates.seed.json` (version 1, publishedAt 2026-10-30, reviewedBy sajat) = every row of the PRD's "Rates and assumptions" + "Tax rules" tables, plus app-policy rows flagged `isAppAssumption`. Keys: `inflation_cpi 0.0834`, `inflation_projection 0.08`, `policy_rate 0.095`, `savings_account_rate 0.02 [0.0125–0.03]`, `fdr_3m_rate 0.07`, `fdr_1y_rate 0.075`, `dps_rate 0.09`, `bank_deposit_avg_rate 0.0616`, `sanchayapatra_5y_rate 0.1183`, `sanchayapatra_5y_rate_above_cap 0.118`, `sanchayapatra_tier_cap 750000`, `sanchayapatra_5y_year1_rate 0.097`, `paribar_sanchayapatra_5y_rate 0.1193`, `pensioner_sanchayapatra_5y_rate 0.1198`, `sanchayapatra_3m_profit_3y_rate 0.1182`, `tbill_91d_rate 0.085`, `tbond_5y_rate 0.085`, `tbond_10y_rate 0.0925`, `equity_return_{low,base,high} 0.02/0.09/0.14`, `gold_return_base 0.08`, `gold_22k_per_bhori 220858`, `credit_card_rate_cap 0.25`, `deposit_insurance_limit 200000`, `life_claim_settlement_rate 0.57`, `oop_health_share 0.793`, `life_expectancy 72.3`, `plan_to_age 100`, `ups_return_fy2526 0.1172`; tax: `tax_free_threshold_general 400000`, `tax_free_threshold_women_senior 450000` (note: confirm 4.25), `tax_slabs` json, `min_tax 5000`, `min_tax_new 1000`, `rebate_share_of_income 0.03`, `rebate_share_of_investment 0.10`, `rebate_cap 750000`, `rebate_dps_cap 120000`, `rebate_govt_securities_cap 500000`, `tax_sanchayapatra_profit 0.10`, `tax_bank_interest 0.10`, `tax_bank_interest_no_return 0.15`, `proof_of_return_threshold 1000000`; app policy: `emergency_base_months 6`, `emergency_bump_irregular_income 3`, `emergency_bump_sole_earner 2`, `emergency_bump_no_health_insurance 2`, `emergency_min_months 3`, `emergency_max_months 15`, `emergency_build_months_default 12`, `emergency_large_buffer_threshold 1000000`, `cash_buffer_share 0.05`, `card_min_payment_share 0.05`, `emi_ratio_red 0.40`, `card_utilisation_amber 0.50`, `high_interest_debt_threshold 0.15`, `personal_loan_rate_default 0.12`, `savings_rate_default 0.20`, `plan_emergency_min_share 0.60`, `plan_emergency_max_share 0.80`, `debt_payoff_target_months 12`, `goal_inflation_education 0.10`, `goal_inflation_health 0.10`. Source URLs and as-of dates copied from the PRD tables. `scripts/gen-seed-migration.mjs` generates `0002_seed_rates.sql`; a drift test asserts the committed file matches.

**Serving:** `GET /api/rates` → published `RatesSnapshot`, `ETag "v<n>"`, `Cache-Control: public, max-age=300, stale-while-revalidate=86400`, 304 on match; on any D1 error (incl. unmigrated DB) → bundled seed with `X-Rates-Source: fallback`. `GET /api/health` → `{ok, db, publishedVersion}`. Client `RatesProvider`: initial = bundled seed (sync, first paint + offline), then localStorage copy if newer, then network; `useRates()` → `{snapshot, source, staleKeys}`. `lib/server/db.ts` exposes `RatesRepo` interface (`getPublished, getDraft, ensureDraft, updateRow, publish, discardDraft, changeLog, getVersionRows`) over `D1Database`; `test/fakes/fakeRatesRepo.ts` in-memory impl.

### Routes, state, UI

| Path | Notes |
| --- | --- |
| `/` | server: `tp_locale` cookie → redirect `/bn` or `/en`; else `<LanguagePicker/>` (both labels, big buttons, sets cookie + store) |
| `/{locale}` | client: onboarding done → `/plan`, else `/start/1` |
| `/{locale}/start/[step]` | 1 age · 2 take-home (freelancer 6-month average hint) · 3 essentials · 4 dependents multi-select · 5 loans/cards y/n. Disclaimer modal on step 1 until seen. Step 5 CTA "See my plan". |
| `/{locale}/plan` | headline "Save ৳X a month", BucketCards in priority order linking to calculators; `?why=<id>` opens WhyDrawer, `?term=<key>` opens TermSheet |
| `/{locale}/m1` `/m3` `/m4` `/m5` | prefilled from store; input changes update the store → plan live |
| `/{locale}/about` | server: disclaimer, methodology, every rate row with as-of |
| `/admin`, `/admin/log`, `/admin/preview` | server gate (cookie) + client pages |

`app/[locale]/layout.tsx` (server): validate locale (`notFound()`), `getDictionary(locale)`, `<Providers>` (I18n → Rates → store hydration gate) + `<AppShell>` (header: LocaleSwitch, RatesVersionBadge, OfflineBadge; footer: Disclaimer). Root layout renders `lang="bn"`; a tiny client `<HtmlLang/>` fixes `document.documentElement.lang`.

**State** (`lib/store`): zustand + `persist` (key `taka-plan.v1`, `version: 1`, migrate stub): `{schemaVersion, locale, onboarding{step,completed,disclaimerSeen}, profile, m1 overrides, m3{loans,cards,extraMonthly,scenario}, m4{savingsRate,payday,last6Incomes}, m5{goals}}` + actions. `usePlan()` = `useMemo(computePlan(profileToPlanInput(...)))` with `EngineError` → inline error card. `<HydrationGate>` shows a skeleton until rehydrated.

**UI rules → components:** `StepFrame` (one question, progress dots, ≥48 px CTA); `ChoiceButtons` not selects; `SliderWithNumber` (range + `MoneyInput`, `inputMode=numeric`, Bangla-digit preview, `parseTakaInput`); `StatusPill` honours `demotedFromRed`; `<Term k="fdr">` → `TermSheet` (terms: fdr, dps, sanchayapatra, bo_account, sum_insured, emi, cib, tbill, tbond, ladder, real_return, take_home, grace_period); `WhyButton` → `WhyDrawer` (steps via dictionary templates with `inputs`/`rounded` substituted, then `AssumptionRow`s with as-of, source link, `StaleTag` for stale or app-assumption rows, then notes); every bucket card ends with `nextStepKey` text. Budget: no UI/chart/icon libs, inline SVG, system font stack (`system-ui, "Noto Sans Bengali", "Hind Siliguri"`), per-locale dictionary chunks via RSC payload, calculators as separate routes (natural code-split), no `next/dynamic`.

**PWA:** `app/manifest.ts` (standalone, lang bn, icons 192/512/maskable); hand-written `public/sw.js` (no workbox): precache `/`, `/bn/plan`, `/en/plan`, manifest, `/api/rates`; navigations network-first 3 s → cached same-locale `/plan` shell; `/_next/static/*` cache-first; `/api/rates` SWR; never cache `/admin*`/`/api/admin*`; versioned cache name, `clients.claim()`. `components/pwa/RegisterSW.tsx` registers only in production builds, shows "new version, tap to reload" toast. `runWorkerFirst: ["/*", "!/_next/static/*"]` keeps `/sw.js` served from ASSETS at root scope.

### Admin

- Gate: `app/admin/layout.tsx` (server, `dynamic = "force-dynamic"`) → `isAdmin(cookies())` else `<LoginForm/>`.
- `lib/server/admin-auth.ts`: `verifyPassword` (SHA-256 both sides, `crypto.subtle.timingSafeEqual`), `createSessionCookie` (`"<exp>.<hmac>"`, HMAC-SHA256 keyed by `SHA-256("taka-admin:"+ADMIN_PASSWORD)`, 12 h), `isAdmin`, `clearSessionCookie`. Cookie `tp_admin` HttpOnly SameSite=Strict Path=/ Secure-when-https. Mutating handlers require JSON + `X-Requested-With: taka-admin`. 500 ms sleep on failed login.
- Handlers (all 401 without cookie except login): `POST /api/admin/login {password}` → 204 + cookie; `POST /api/admin/logout`; `GET /api/admin/rates` → `{published, draft|null, changeLog}`; `PUT /api/admin/rates {key, patch, note}` → `ensureDraft` + `updateRow` + log, validated by `assertSnapshot`; `POST /api/admin/publish {note}` → batch supersede/publish/log → `{version}`; `POST /api/admin/discard`; `GET /api/admin/preview` → `computePlan` over `SAMPLE_PROFILES` for published vs draft → per-profile `PlanSummary` + `changedKeys` (engine runs server-side here, as the PRD requires).
- Pages: `/admin` table (key, value, range, as-of, next review with stale highlight, source link, edit → `RateRowEditor` sheet; "Publish draft vN" disabled until preview viewed this session); `/admin/log`; `/admin/preview` three profile cards with published→draft deltas.
- Secrets: `.dev.vars` locally (gitignored, `.dev.vars.example` committed); production `ADMIN_PASSWORD` set once via dashboard or `cf` (find exact command with `cf cli search "put worker secret"`).

### i18n

`lib/i18n/config.ts` (`locales=["bn","en"]`, `defaultLocale="bn"`, `isLocale`). Dictionaries per namespace, `en/index.ts` composes; `type Dictionary = DeepReplace<typeof en, string>`; `bn/index.ts` typed `Dictionary` (missing Bangla key = type error). `getDictionary(locale)` dynamic-imports one locale. `useT()` dot-path keys with `{param}` interpolation; `useFormat()` binds `digits = locale==="bn" ? "bn" : "latn"` to engine `format.ts` (Bangla mode always Bangla digits). `LocaleSwitch` sets `tp_locale` cookie (1 y, Lax) + store, `router.replace` with swapped prefix. Explainers: `explain[stepId] = {title, body}` templates; assumption labels come from the rate row (`labelBn ?? labelEn`), never the dictionary. `test/i18n-coverage.test.ts` runs the engine over `SAMPLE_PROFILES` and asserts every step id, note, reasonKey, nextStepKey exists non-empty in both dictionaries. UI slices write provisional Bangla for their namespace (`// TODO(bn-review)`); the `i18n-bn` slice reviews.

### cloudflare.config.ts (function form so local dev never needs the remote D1 id)

```ts
import { bindings, defineConfig, defineWorker } from "cf/config";
const LOCAL_D1_ID = "00000000-0000-4000-8000-000000000001";
export default defineConfig(({ mode }) => ({
  worker: defineWorker({
    name: "taka-plan", entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-30", compatibilityFlags: ["nodejs_compat"],
    assets: { htmlHandling: "none", notFoundHandling: "none", runWorkerFirst: ["/*", "!/_next/static/*"] },
    env: {
      ASSETS: bindings.assets(),
      DB: bindings.d1({ name: "taka-plan", id: mode === "production" ? process.env.D1_DATABASE_ID : LOCAL_D1_ID }),
      ADMIN_PASSWORD: bindings.secret(),
    },
  }),
}));
```

### package.json scripts

`dev` `vite dev --port 3001` · `build` `vite build` · `start` `vite preview` (built Worker) · `deploy` `vinext-cloudflare deploy` · `typecheck` `cf workers types && tsc --noEmit && tsc -p packages/engine/tsconfig.json --noEmit` · `test` `vitest run` · `test:e2e` `playwright test` · `check:bundle` · `db:migrate:local` `cf d1 migrations apply $LOCAL_D1_ID --local --persist-to .cloudflare/state --dir migrations` · `db:migrate:remote` · `db:reset:local` · `rates:gen-seed` · `smoke`.

`vitest.config.ts` is separate from `vite.config.ts` (otherwise Vitest boots vinext + the Cloudflare plugin): projects `engine` / `lib` / `api` (api aliases `cloudflare:workers` → `test/stubs/cloudflare-workers.ts`; handlers get the repo via `lib/server/env.ts#getRatesRepo()` which tests override).


## Section index for slice prompts

- §M1 = "**m1**" paragraph under Engine contracts · §M3 = "**m3**" · §M4 = "**m4**" · §M5 = "**m5**" · §plan = "**plan**"
- §rates-serving = "**Serving:**" paragraph under Rates table · §admin = "### Admin" · §pwa = "**PWA:**" paragraph · §ci = CI bullet under Verified toolchain facts and the pwa-ci slice spec

## Explain-template input names

The engine's `ExplainStep.inputs` must supply exactly these names (the UI formats them and adds `{result}` = the step's rounded value). Authoritative copy: header comment of `lib/i18n/dictionaries/en/explain.ts`.

| Step id | inputs |
| --- | --- |
| m1.months | base, bumpIrregular, bumpSoleEarner, bumpNoHealth, min, max (+ suggested, source) — month counts, format as plain numbers |
| m1.target | essentials, months |
| m1.gap | target, saved |
| m1.monthly | gap, buildMonths |
| m1.covered | saved, essentials |
| m1.tier1 | essentials |
| m1.tier2 | target, tier1 |
| m1.banks | target, tier2, limit (banksNeeded = ceil(target ÷ limit): the whole fund sits in deposits) |
| m3.totalEmi | emis, cardMinimums |
| m3.emiRatio | totalEmi, takeHome |
| m3.capacity | takeHome, savings, essentials, buffer |
| m3.maxLoan | capacity, monthlyRate, months |
| m3.scenarioEmi | principal, monthlyRate, months |
| m3.interestSaved | snowballInterest, avalancheInterest |
| m4.average | months, total |
| m4.feasible | average, essentials |
| m4.amount | average, rate |
| m4.expenses | average, savings |
| m5.fv | cost, inflation, years |
| m5.rate | instrument, nominal, tax |
| m5.monthly | fv, monthlyRate, months |
| m5.real | afterTax, inflation |
| plan.total | savings |
| plan.emergencyShare | total, minShare, maxShare, m1Monthly, gap (result = the emergency amount = min(gap, clamp(m1Monthly, minShare × total, maxShare × total))) |
| plan.debtShare | remaining, headroom |
| plan.goalsShare | remaining, goalsNeed |
| plan.goalAllocation | goalId, need, goalsNeed, remaining — one step per goal bucket, emitted after plan.goalsShare; `raw` = unrounded share `remaining × need ÷ goalsNeed`, `rounded` = the allocated amount, unit bdt. `goalId` is an id, not a taka amount |

Units: pass raw numbers; the UI formats by the step's `unit` and by name (names ending in Rate/inflation/tax/share → percent; months/years/count → number; everything else → taka). Instrument names are passed as the Instrument id and translated by the UI.

## Dictionary params the engine must supply

- `plan.reason.*` → `reasonParams`: emergency `{amount, covered, months, instrument}` (`instrument` = the bucket's Instrument id, `savings_account` or `fdr_3m`); emergencyFull `{months}`; debt `{rate, amount, months, count}` where `months = ceil(Σ high-interest balance ÷ amount)`; goal `{name, amount, need, instrument, fv, years}`; addGoal none; insurance `{amount}`.
- `PLAN_NEXT_KEYS` = fdrLadder, openSavings, **keepFull** (full emergency fund: "keep it where it is, refill after use"), prepayDebt, dps, sanchayapatra, tbond, fdr, addGoal. `PLAN_STEP_IDS` = total, emergencyShare, debtShare, goalsShare, **goalAllocation**.
- `m3.flag.<id>` params (UI builds from the flag): card_carried `{rate}`; card_utilisation `{threshold, value}`; emi_ratio `{threshold, value}`; negative_capacity none — so `DebtFlag.value` must be the ratio/utilisation, and the UI reads thresholds from the snapshot.
- Server code imports `translate`/`getPath` from `lib/i18n/translate.ts` (pure), never from `useT.ts` ("use client").
- `onboarding.progress` = "Question {n} of 5": pass only `{n}`.

## Store / rates / server API (as built)

- `lib/store/store.ts`: `useTakaStore`, `useHydrated()`, `makeId(prefix)`. `lib/store/selectors.ts`: `selectProfile`, `selectOnboardingDone`, `selectPlanOverrides` (→ `{ m1: Partial<M1Input>; m3?: M3Input; m4: M4Input; m5?: M5Input }`). `lib/store/usePlan.ts`: `usePlan(): { plan, error, today }`.
- `lib/rates`: `RatesProvider`, `useRates()` → `{ snapshot, source, version, staleKeys }`; `fetchRates`, `loadStoredSnapshot`/`saveStoredSnapshot`.
- `lib/server/db.ts`: `RatesRepo`, `D1RatesRepo`, `ChangeLogEntry`, `RatePatch`, `applyPatch`. `lib/server/env.ts`: `getEnv`, `getRatesRepo`, `setRatesRepoForTests`, `getAdminPassword`. `lib/server/http.ts`: `json`, `httpError`, `readJson`, `HttpError`, `toResponse`. `test/fakes/fakeRatesRepo.ts`: `FakeRatesRepo`.
- `lib/i18n`: `config.ts` (`locales`, `defaultLocale`, `isLocale`, `resolveLocale`, `LOCALE_COOKIE`), `server.ts` (`getDictionary`, `localeFromCookie`), `provider.tsx` (`I18nProvider`), `useT.ts` (`useT()` → `{ t, locale, dict }`), `useFormat.ts` (`useFormat()`, `createFormatters(locale)`), `translate.ts` (`translate`, `getPath`, `interpolate`).


## Integration notes (Stage 2, as built)

- **M1 rounding:** target, gap, saved, savingsAccount (= one month of essentials) and fdrLadder are whole taka ("exact"); fdrPerSlice "lump" (৳500); monthlySaving rounded **up** to ৳100 (`roundMoneyUp`, money.ts) so the fund is full inside the build period (200 000/12 → 16 700; 40 000/12 → 3 400; 200 000/24 → 8 400). Status uses the 1-dp monthsCovered shown to the user. The 15-month cap is unreachable with the seed (6+3+2+2 = 13); the cap is only tested with a raised base row.
- **M3:** emiRatio includes carried-card minimums (flags vector: (20000+6000+3000)/60000 = 0.4833). Scenario defaults come from `personal_loan_rate_default` and `personal_loan_tenure_default_months`. `highInterestDebts` uses a strict `>` on the threshold. A debt whose minimum never covers interest runs to 600 months and is omitted from `order`.
- **M4:** status amber when the rate is squeezed below `savings_rate_default` or the user picks a rate below the suggestion; always attaches note `m4.note.instrumentDps`; m4.average is emitted for everyone (months = 1 for salaried).
- **M5:** `belowInflation` compares the after-tax return with the inflation the goal is priced with (8% projection, or 10% for education/health), so a 2-year DPS goal (8.1% after tax) is green with the launch seed while `realVsCpi` (vs 8.34% CPI) is slightly negative for display. The monthly amount is sized from the unrounded FV. Horizon thresholds (3/5 years) and the 1–40 year bounds are validation constants, not rate rows.
- **plan:** a `future` bucket (DPS, plan.reason.addGoal) absorbs any surplus so monthlyTotal always equals the M4 savings amount when it is > 0. The emergency amount is clamped to 60–80% of the budget and capped at the remaining gap; zero-amount buckets are dropped except the full-fund emergency bucket (`plan.next.keepFull`). Seed fixtures: firstJob 9 000 → emergency 7 200 + goal 1 800; freelancer 18 000 → 14 400 + goal 3 600; familyWithDebt 24 000 → 19 200 + debt 4 800 (13 months), the education goal gets nothing and has no bucket.
- **d1-api:** `/api/health` → `{ ok, db, publishedVersion, ratesSource, detail? }`; `/api/rates` ETag is the quoted strong form `"v<n>"`; fallback has no ETag and `Cache-Control: no-store`.
- **Explain formatting (UI):** names ending in rate/inflation/tax/share plus nominal/afterTax/real/monthlyRate → percent; months/years/count and the m1.months inputs → plain numbers; Instrument ids → `common.instrument.*`; everything else taka.
