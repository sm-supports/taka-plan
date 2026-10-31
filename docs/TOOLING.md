# Tooling notes (verified 31 Oct 2026)

Pinned: vinext 1.4.0 · wrangler 4.156.0 · vite 8.3.0 · react 19.3.1 · typescript 7.0.2 · vitest 5.0.5 · @playwright/test 1.64.1 · zustand 5.0.16.

Hosting is **Cloudflare Pages** (static export + Pages Functions for `/api/*`), built by Pages from the GitHub repository. There is no Cloudflare Worker and no `cf` CLI any more; see [DEPLOY.md](DEPLOY.md) for the production setup and why.

## Node

`.nvmrc` pins 24.22.2 (`engines.node >= 24.22`). Use nvm:

```bash
nvm install && nvm use
```

## Daily commands

| Task | Command | Notes |
| --- | --- | --- |
| Dev server (port 3001) | `npm run dev` | Fast UI work. **No `/api/*` here**: the app falls back to the bundled rates seed and the admin cannot sign in. Use the preview for anything that needs the API. |
| Production build | `npm run build` | `vite build` (static export to `dist/client`) then `scripts/check-export.mjs` |
| Pages preview (port 8788) | `npm run preview` | `wrangler pages dev dist/client` with Functions, local D1 and `.dev.vars`: the same runtime as production |
| Local D1 migrations | `npm run db:migrate:local` | applies `migrations/*.sql` into `.wrangler/state` (the store `npm run preview` reads) via `config/wrangler.local.toml` |
| Query local D1 | `npx wrangler d1 execute taka-plan --local -c config/wrangler.local.toml --persist-to .wrangler/state --command "SELECT COUNT(*) FROM rates"` | no login needed |
| Reset local D1 | `npm run db:reset:local` then migrate again | |
| Regenerate seed migration | `npm run rates:gen-seed` after editing `packages/engine/src/data/rates.seed.json` | |
| Typecheck | `npm run typecheck` | tsc 7 (Go port), app + engine tsconfigs |
| Unit tests | `npm test` | Vitest projects: engine, lib, api (`server/api/**`) |
| Smoke | `npm run smoke` | against the preview on :8788 (`PORT=…` to change) |
| E2E | `npm run test:e2e` | starts `npm run preview` itself; build and migrate first |
| Bundle budget | `npm run check:bundle` | against a running preview |
| Compile Functions only | `npx wrangler pages functions build --outdir /tmp/fn` | what the Pages build does with `functions/` |

First run on a fresh clone:

```bash
nvm use && npm ci && cp .dev.vars.example .dev.vars
npm run db:migrate:local && npm run build && npm run preview
```

Set `WRANGLER_SEND_METRICS=false` to silence wrangler telemetry.

## Gotchas

- **No `wrangler.toml` (or `cloudflare.config.ts`) in the project root.** vinext treats either file as a Cloudflare *Workers* project and then fails the build with "Missing @cloudflare/vite-plugin". The local wrangler configs therefore live in `config/` and are passed with `-c`; `wrangler pages dev` gets its settings as flags (see the `preview` script). Production bindings live in the Pages project (DEPLOY.md).
- vinext's static export **skips** a page without failing when it turns dynamic (`cookies()`, `headers()`, awaited `searchParams`, `force-dynamic`). `scripts/check-export.mjs` fails the build instead, using `dist/server/vinext-prerender.json`, and checks every expected page file. Pages must read query strings with `useSearchParams` in a client component inside `<Suspense>` (see `/m3`, `/m5`), and dynamic segments need `generateStaticParams` (`[locale]`, `start/[step]`).
- Anything that needs the request (locale redirect at `/`, the admin session) runs in the browser: `/` reads the `tp_locale` cookie client-side, and `/admin` asks `GET /api/admin/session`.
- `public/_routes.json` limits Functions to `/api/*`; every page, chunk, icon and `sw.js` is a plain static file (no Functions request quota or CPU used).
- Security headers: static responses get them from `public/_headers`; API responses from `json()` in `lib/server/http.ts`. `test/security-headers.test.ts` keeps both in sync with `lib/server/security-headers.ts`. Pages does not apply `_headers` to Functions responses.
- `check-export.mjs` deletes `dist/client/.vite` (the Vite manifest) so it is never published.
- `migrations/0002_seed_rates.sql` is regenerated from the seed JSON; after changing the seed, run `npm run db:reset:local && npm run db:migrate:local` and restart the preview.
- Secrets for local runs come from `.dev.vars` (copy `.dev.vars.example`; the placeholder `change-me` works only on localhost). Never commit it.
- Wrangler's local runtime supports compatibility dates up to 2026-10-23 (workerd 1.20261023), hence the pinned date.
- npm 11 does not run dependency install scripts by default; wrangler/workerd/esbuild still work because their platform binaries come from optional dependencies.
- `vitest.config.ts` is deliberately separate from `vite.config.ts`: tests must not boot vinext.
- Inside git worktrees created by agent tooling, a hook may refuse commands that source `nvm.sh`; use `export PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH"` instead.
- The Claude desktop "preview" launcher (`.claude/launch.json`) runs a login shell whose cwd is not accessible on this external volume (`getcwd: Operation not permitted`); start servers from a normal shell instead.

## PWA

| File | What it does |
| --- | --- |
| `public/manifest.webmanifest` | Static web app manifest (`application/manifest+json` via `public/_headers`); `app/layout.tsx` links it. Colours mirror `app/globals.css` (`--color-page` background, `--color-brand-600` theme). |
| `public/icons/` | `icon-192.png`, `icon-512.png`, `maskable-512.png` (generated once from `icon.svg`, committed) and `icon.svg`. The PNG generator is kept out of the repo; recover it with `git show 6a16a89:scripts/gen-icons.mjs` if the colours change. |
| `public/sw.js` | Hand-written service worker, no workbox. |
| `components/pwa/RegisterSW.tsx` | Registers `/sw.js?v=<build id>` only in production bundles and shows a bilingual "new version — tap to reload" toast. The build id is read in `app/layout.tsx` at build time (`process.env.__VINEXT_BUILD_ID`, else `BUILD_ID`, else `"dev"`) and baked into the exported HTML. |

### Service worker strategy (`public/sw.js`)

- `CACHE_VERSION` names the cache: `taka-<build id>-<SW_REVISION>`, where the build id comes from the worker's own URL (`/sw.js?v=…`) and `SW_REVISION` is a constant in `sw.js`. A new deploy registers a new worker URL and gets a fresh cache; `activate` deletes every other `taka-*` cache and calls `clients.claim()`. Bump `SW_REVISION` by hand whenever the precache list or a strategy changes.
- **install**: precaches `/`, `/bn/plan`, `/en/plan`, `/manifest.webmanifest`, `/api/rates`, `/data/countries/index.json`. A failure skips that URL instead of failing the install.
- **navigations**: network-first with a 3 s timeout, then the cached page, then the cached same-locale `/plan` shell. Loads with a search string are served but never stored.
- `/_next/static/*`: cache-first (content-hashed, immutable). `/api/rates`: stale-while-revalidate. `/data/countries/*` and `/api/countries/*`: stale-while-revalidate keyed by the full URL. `/admin*` and `/api/admin*`: never intercepted, never cached.

## Countries (runtime)

| Piece | What it does |
| --- | --- |
| `scripts/copy-country-data.mjs` | First step of `npm run build`. Copies `packages/engine/src/data/countries/<CC>.json`, `index.json` and `_regions.json` (never `_global/`) to `public/data/countries/` (gitignored), minified; writes `index.json` from the profiles when the research left none (same mapping as the engine's `indexEntryFor`, kept in step by `lib/country/copy-country-data.test.ts`). No profile files: does nothing and removes a stale output. |
| `public/_headers` | `/data/countries/*`: `public, max-age=3600, stale-while-revalidate=86400`. |
| `scripts/check-export.mjs` | Requires `dist/client/data/countries/index.json` once any profile is published. |
| `lib/country/bundled.ts` | Bundles `data/countries/BD.json` through `import.meta.glob` (matches nothing, without error, while the file is absent), else `FIXTURE_BD`. |
| `lib/country/provider.tsx` | `<CountryProvider>` (inside `<RatesProvider>`, `components/layout/Providers.tsx`): for `store.country` takes the bundled BD profile (BD only), the localStorage copy `taka-plan.country.<CC>`, then `/data/countries/<CC>.json` and `/api/countries/<CC>` together (either may 404); the newest by `researchedAt`, then version, wins and is stored. `_regions.json` is optional (`taka-plan.country._regions`). Bangladesh is shown until a profile arrives and when the code has no data (`source: "fallback"`). |
| `lib/country/useCountry.ts` | `useCountry()` → `{ code, profile, context, snapshot, loading, source, regions }`; `useCountryRates()` → the overlaid snapshot (`withCountry`) that `usePlan` and every calculator read. `useRates()` stays for the version and staleness badges. |
| `lib/i18n/useFormat.ts` | `money()` and `parseMoney()` follow the country's currency (`formatMoney` / `parseMoneyInput` in the engine); `taka()` is always taka. |

Try a country locally: put a profile in `packages/engine/src/data/countries/IN.json`, run `node scripts/copy-country-data.mjs` (`npm run dev` does not run it; `npm run build` does), and set `country` in the `taka-plan.v1` localStorage entry (until the picker lands).

### Bundle budget

Loads `/bn/plan?demo=1` and `/` in Playwright's Chromium (375 px, cache disabled, service worker blocked) and sums the transfer size of every script response via CDP. When the server sends no `Content-Encoding` (local preview), the gzip size of each body is used, which is what Cloudflare's edge sends. Fails above `BUNDLE_LIMIT` (default 300 000 bytes). 31 Oct 2026 on the Pages preview: 189 KB for the two pages' scripts.

### E2E

- `onboarding.spec.ts`: `/` → English → five answers → `/en/plan` in at most 8 taps, then the locale switch and a Bangla digit.
- `offline.spec.ts`: waits for the service worker to control the page and cache `/bn/plan`, goes offline, reloads, and asserts the service worker answered.
- `static-pages.spec.ts`: the client-side locale redirect at `/`, client navigation through the exported `.txt` RSC payloads, the 404 page for an unknown locale, and the admin gate (wrong password, sign-in, sign-out). The admin password comes from `E2E_ADMIN_PASSWORD` or `.dev.vars`.

## CI (`.github/workflows/ci.yml`)

- Triggers: every pull request, and pushes to `main`.
- `check`: `npm ci` → typecheck → unit tests → `npm run build` (with the export guard) → `wrangler pages functions build`.
- `e2e`: installs Chromium, migrates the local D1, builds, starts `npm run preview` in the background, then `npm run smoke`, all Playwright specs and the bundle budget. The Playwright report is uploaded as an artifact.
- No deploy job: Cloudflare Pages builds and deploys the repository itself (DEPLOY.md). GitHub holds no Cloudflare credentials.
