# Taka Plan — architecture (as built, MVP)

Taka Plan is a free, mobile-first Bangla/English personal-finance planner for Bangladesh. The product spec is [PRD.md](PRD.md); the contracts every module codes against are in [ARCHITECTURE-CONTRACTS.md](ARCHITECTURE-CONTRACTS.md); verified commands live in [TOOLING.md](TOOLING.md); Bangla conventions in [BANGLA-STYLE.md](BANGLA-STYLE.md).

## Shape

```
browser (PWA)                    Cloudflare Worker (vinext)                 D1 (SQLite)
┌─────────────────────┐          ┌──────────────────────────┐              ┌────────────────┐
│ onboarding → plan   │  RSC/SSR │ app/[locale]/* pages      │              │ rate_versions  │
│ calculators M1 M3   │ ◄──────► │ app/api/rates, /health    │ ◄──────────► │ rates          │
│ M4 M5 (all maths    │  JSON    │ app/api/admin/* (cookie)  │   RatesRepo  │ change_log     │
│ runs on-device)     │          │ app/admin/* (password)    │              └────────────────┘
│ zustand store       │          └──────────────────────────┘
│ bundled rates seed  │
└─────────────────────┘
```

- **Framework:** [vinext](https://github.com/cloudflare/vinext) (Vite plugin implementing the Next.js 16 App Router API), deployed to Cloudflare Workers with Static Assets. Config is the typed `cloudflare.config.ts` read by the `cf` CLI; `vite.config.ts` wires `vinext()` + `cloudflare()` and the `@taka/engine` alias.
- **Engine** (`packages/engine/src`): pure TypeScript, no I/O, no React (enforced by `purity.test.ts` and its own `tsconfig`). One module per PRD calculator (`m1`, `m3`, `m4`, `m5`) plus `plan` (aggregation), `rates` (typed snapshot of every assumption), `explain` (every result carries the steps and the rate rows it used), `format` (taka, lakh/crore, Bangla digits), `money` (rounding once at the boundary). Runs in the browser for the live plan and in the Worker for the admin preview.
- **Rates table:** D1 is the runtime source of truth; `packages/engine/src/data/rates.seed.json` is the launch snapshot bundled into the client (first paint and offline), and `migrations/0002_seed_rates.sql` is generated from it. Published versions are immutable; an admin edit creates draft N+1; publish supersedes N atomically. `GET /api/rates` serves the published version with an ETag and falls back to the bundled seed when D1 is unavailable.
- **Client state:** zustand + `persist` (`taka-plan.v1` in localStorage) holds the five onboarding answers and calculator inputs; `usePlan()` recomputes the plan with `useMemo`. No account, no server-side user data in the MVP.
- **i18n:** `app/[locale]` segment (`bn` default, `en`), one typed dictionary per locale split by namespace; every engine key (`m1.rule.*`, `plan.reason.*`, step ids under `explain.*`) is a dot path into the dictionary, checked by `test/i18n-coverage.test.ts`. Bangla mode always uses Bangla digits.
- **Admin:** single shared password (`ADMIN_PASSWORD` secret), HMAC-signed 12-hour cookie, CSRF header on mutations, preview of three sample profiles before publishing.
- **PWA:** `app/manifest.ts` and a hand-written `public/sw.js` (network-first navigations, cache-first static chunks, stale-while-revalidate rates); registered only in production builds.
- **Tests:** Vitest projects `engine`, `lib`, `api` (the last stubs `cloudflare:workers`); Playwright smoke for onboarding and offline; `scripts/check-bundle.mjs` enforces the 300 KB script-transfer budget on the plan page.

## Request paths

| Path | Rendering | Data |
| --- | --- | --- |
| `/` | server; redirects by `tp_locale` cookie or shows the language picker | — |
| `/{bn,en}/start/1..5` | client | store |
| `/{bn,en}/plan`, `/m1`, `/m3`, `/m4`, `/m5` | client (hydration-gated) | store + rates snapshot (bundled → stored → network) |
| `/{bn,en}/about` | server | bundled seed |
| `/admin/*` | server gate + client | `/api/admin/*` |
| `/api/rates`, `/api/health` | Worker | D1 via `RatesRepo` |

## Deployment

CI (`.github/workflows/ci.yml`) typechecks, tests and does a dry-run deploy on every push; pushes to `main` deploy with `npx cf deploy --prebuilt --mode production` using `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and the `D1_DATABASE_ID` variable. Local development never needs the remote database id (function-form `cloudflare.config.ts`).

## Out of scope in this cut

M2 insurance, M6 allocation, M7 retirement (the engine keeps hooks in `PlanInput`), phone sign-in and saved plans, reminders, share images, halal mode, analytics (a no-op `track()` keeps call sites ready).
