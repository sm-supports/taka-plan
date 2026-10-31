# Taka Plan — architecture (as built, MVP)

Taka Plan is a free, mobile-first Bangla/English personal-finance planner for Bangladesh. The product spec is [PRD.md](PRD.md); the contracts every module codes against are in [ARCHITECTURE-CONTRACTS.md](ARCHITECTURE-CONTRACTS.md); verified commands live in [TOOLING.md](TOOLING.md); Bangla conventions in [BANGLA-STYLE.md](BANGLA-STYLE.md).

## Shape

```
browser (PWA)                    Cloudflare Pages                           D1 (SQLite)
┌─────────────────────┐          ┌──────────────────────────┐              ┌────────────────┐
│ onboarding → plan   │  static  │ dist/client: every page   │              │ rate_versions  │
│ calculators M1 M3   │ ◄──────► │ prebuilt (vinext export)  │              │ rates          │
│ M4 M5 (all maths    │  JSON    │ Functions: /api/rates,    │ ◄──────────► │ change_log     │
│ runs on-device)     │          │ /api/health, /api/admin/* │   RatesRepo  └────────────────┘
│ zustand store       │          └──────────────────────────┘
│ bundled rates seed  │
└─────────────────────┘
```

- **Framework:** [vinext](https://github.com/cloudflare/vinext) (Vite plugin implementing the Next.js 16 App Router API) with `output: "export"`: every page is prebuilt to `dist/client` and served by **Cloudflare Pages** as static files. Only `/api/*` runs on the server, as Pages Functions (`functions/api/**`, thin wrappers around `server/api/**`). `vite.config.ts` wires `vinext()` and the `@taka/engine` alias. Deployment: [DEPLOY.md](DEPLOY.md).
- **Engine** (`packages/engine/src`): pure TypeScript, no I/O, no React (enforced by `purity.test.ts` and its own `tsconfig`). One module per PRD calculator (`m1`, `m3`, `m4`, `m5`) plus `plan` (aggregation), `rates` (typed snapshot of every assumption), `explain` (every result carries the steps and the rate rows it used), `format` (taka, lakh/crore, Bangla digits), `money` (rounding once at the boundary). Runs in the browser for the live plan and in Pages Functions for the admin preview.
- **Rates table:** D1 is the runtime source of truth; `packages/engine/src/data/rates.seed.json` is the launch snapshot bundled into the client (first paint and offline), and `migrations/0002_seed_rates.sql` is generated from it. Published versions are immutable; an admin edit creates draft N+1; publish supersedes N atomically. `GET /api/rates` serves the published version with an ETag and falls back to the bundled seed when D1 is unavailable.
- **Client state:** zustand + `persist` (`taka-plan.v1` in localStorage) holds the five onboarding answers and calculator inputs; `usePlan()` recomputes the plan with `useMemo`. No account, no server-side user data in the MVP.
- **i18n:** `app/[locale]` segment (`bn` default, `en`), one typed dictionary per locale split by namespace; every engine key (`m1.rule.*`, `plan.reason.*`, step ids under `explain.*`) is a dot path into the dictionary, checked by `test/i18n-coverage.test.ts`. Bangla mode always uses Bangla digits.
- **Admin:** single shared password (`ADMIN_PASSWORD` Pages secret), HMAC-signed 12-hour cookie, CSRF header on mutations, preview of three sample profiles before publishing. The admin pages are static; `components/admin/AdminGate.tsx` asks `GET /api/admin/session` and shows the sign-in form or the editor. Every admin API call checks the cookie on the server.
- **PWA:** `app/manifest.ts` and a hand-written `public/sw.js` (network-first navigations, cache-first static chunks, stale-while-revalidate rates); registered only in production builds.
- **Security headers:** `public/_headers` for static responses, `json()` in `lib/server/http.ts` for API responses, both from `lib/server/security-headers.ts` (a test keeps them in sync).
- **Tests:** Vitest projects `engine`, `lib`, `api` (`server/api/**`, with a stub env bound like `functions/api/_middleware.ts` does); Playwright specs for onboarding, offline, static pages and the admin gate, run on the local Pages runtime (`wrangler pages dev`); `scripts/check-export.mjs` fails the build if a page drops out of the export; `scripts/check-bundle.mjs` enforces the 300 KB script-transfer budget.

## Request paths

| Path | Rendering | Data |
| --- | --- | --- |
| `/` | static; the browser reads the `tp_locale` cookie and redirects, or shows the language picker | — |
| `/{bn,en}/start/1..5` | client | store |
| `/{bn,en}/plan`, `/m1`, `/m3`, `/m4`, `/m5` | client (hydration-gated) | store + rates snapshot (bundled → stored → network) |
| `/{bn,en}/about` | static, rendered at build time | bundled seed |
| `/admin/*` | static shell + client gate (`/api/admin/session`) | `/api/admin/*` |
| `/api/rates`, `/api/health`, `/api/admin/*` | Pages Functions | D1 via `RatesRepo` |

## Deployment

Cloudflare Pages builds the GitHub repository on every push (`main` → production, other branches → previews) with `npm run build` into `dist/client`; settings, bindings and the admin secret are in [DEPLOY.md](DEPLOY.md). GitHub Actions (`.github/workflows/ci.yml`) only typechecks, tests, builds and runs the browser tests on the local Pages runtime.

## Out of scope in this cut

M2 insurance, M6 allocation, M7 retirement (the engine keeps hooks in `PlanInput`), phone sign-in and saved plans, reminders, share images, halal mode, analytics (a no-op `track()` keeps call sites ready).
