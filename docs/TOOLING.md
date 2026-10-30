# Tooling notes (verified 30 Oct 2026)

Pinned: vinext 1.4.0 · @vinext/cloudflare 1.3.0 · cf 1.0.0-beta.26 · @cloudflare/vite-plugin 2.0.0-beta.v.8 · vite 8.3.0 · react 19.3.1 · typescript 7.0.2 · vitest 5.0.5 · @playwright/test 1.64.1 · zustand 5.0.16.

## Node

`cf` requires Node `^22.23 || ^24.22 || ^26.12`. Use nvm:

```bash
nvm install 24 && nvm use
```

`.nvmrc` pins 24. `engines.node >= 24.22` in package.json.

## Daily commands

| Task | Command | Verified |
| --- | --- | --- |
| Dev server (port 3001) | `npm run dev` | boots in ~5 s; `/api/hello`, `/api/health` answer |
| Worker binding types | `npx cf workers types` → `.cloudflare/types/index.d.ts` | `Env` is inferred from `cloudflare.config.ts` |
| Local D1 migrations | `npm run db:migrate:local` | applies `migrations/*.sql` into `.cloudflare/state/v3/d1`, which is the same store the dev server reads (health route shows `publishedVersion: 1`) |
| Query local D1 | `npx cf d1 raw 00000000-0000-4000-8000-000000000001 --sql "SELECT 1" --local --persist-to .cloudflare/state` | works without login |
| Reset local D1 | `npm run db:reset:local` then migrate again | |
| Regenerate seed migration | `npm run rates:gen-seed` after editing `packages/engine/src/data/rates.seed.json` | |
| Typecheck | `npm run typecheck` | tsc 7 (Go port) |
| Unit tests | `npm test` | Vitest projects: engine, lib, api |
| E2E | `npm run test:e2e` | starts the dev server itself |
| Production build | `npm run build` then `npm run start` (Vite preview of the built Worker) | |
| Deploy dry run (no login) | `npx cf build && npx cf deploy --prebuilt --mode production --dry-run` | |

Set `CF_SEND_TELEMETRY=false` to silence cf telemetry. Non-interactive cf prompts (e.g. migrations confirm) auto-accept when `CI=1`.

## Gotchas

- `cf d1 … --local` defaults to `~/Library/Preferences/cloudflare/state/v3`, **not** the project. Always pass `--persist-to .cloudflare/state` (the npm scripts do) so the dev server sees the data.
- `cf build` runs Vite directly and ignores npm pre/post scripts. Anything the build needs (seed migration, `public/sw.js`) must be committed, not generated at build time.
- `cloudflare.config.ts` is function-form: `mode === "production"` reads `D1_DATABASE_ID` from the environment; every other mode uses the fixed local id above. Set `D1_DATABASE_ID` **before** the first `cf deploy` so cf does not auto-provision a second database.
- Secrets for local dev come from `.dev.vars` (copy `.dev.vars.example`). Never commit it.
- `vitest.config.ts` is deliberately separate from `vite.config.ts`: tests must not boot vinext or the Cloudflare plugin.
- The Claude desktop "preview" launcher (`.claude/launch.json`) runs a login shell whose cwd is not accessible on this external volume (`getcwd: Operation not permitted`); start the dev server from a normal shell instead.
- First remote deploy needs `cf auth login` (browser OAuth) run by a person; `wrangler login` does not carry over.

## PWA and CI

Owned by the pwa-ci slice. Verified against `npm run build && npx vite preview` (vinext 1.4.0) on 30 Oct 2026.

### Files

| File | What it does |
| --- | --- |
| `app/manifest.ts` | `MetadataRoute.Manifest` served by vinext at **`/manifest.webmanifest`** (`application/manifest+json`); vinext injects `<link rel="manifest">` into every page. Colours come from `app/globals.css` tokens (`--color-page` background, `--color-brand-600` theme). |
| `public/icons/` | `icon-192.png`, `icon-512.png`, `maskable-512.png` (generated once from `icon.svg`, committed) and `icon.svg` (hand-written). The favicon (`app/icon.png`, a vinext metadata route) belongs to the app-shell slice, not here. The PNGs were rendered by a dependency-free generator kept out of the repo; recover it with `git show 6a16a89:scripts/gen-icons.mjs` if the colours change. |
| `public/sw.js` | Hand-written service worker, no workbox. Served from the assets binding at `/sw.js` (`text/javascript`). |
| `components/pwa/RegisterSW.tsx` | Registers `/sw.js` only in production bundles (`process.env.NODE_ENV` is inlined by Vite, so the dev server never registers anything) and shows a bilingual "new version — tap to reload" toast when a newer worker has installed behind a controlled page. Mounted once in `app/layout.tsx`. |
| `scripts/check-bundle.mjs` | First-paint JavaScript budget (`npm run check:bundle`). |
| `e2e/onboarding.spec.ts`, `e2e/offline.spec.ts` | Playwright smoke tests (see below). |
| `.github/workflows/ci.yml` | GitHub Actions: `check`, `e2e`, `deploy`. |

### Service worker strategy (`public/sw.js`)

- `CACHE_VERSION` names the cache (`taka-v1`). Bump it whenever the precache list or a strategy changes; `activate` deletes every other `taka-*` cache and calls `clients.claim()`.
- **install**: precaches `/`, `/bn/plan`, `/en/plan`, `/manifest.webmanifest`, `/api/rates`. Each URL is fetched independently; a failure (offline, route not deployed yet) skips that URL instead of failing the install. Redirected responses are re-wrapped so the Cache API can answer a navigation with them.
- **navigations**: network-first with a 3 s timeout, then the cached page itself, then the cached same-locale `/plan` shell (locale from the first path segment, default `bn`). Successful query-free loads of a precached URL or `/{locale}/plan` refresh the cache; a load with a search string (`/bn/plan?demo=1`) is served but never stored, so the shell entry (keyed by pathname) stays the plain page.
- `/_next/static/*`: cache-first (content-hashed, immutable).
- `/api/rates`: stale-while-revalidate (cached copy answers immediately, network refreshes the cache).
- `/admin*` and `/api/admin*`: never intercepted, never cached. Everything else: network only (no `respondWith`).

### Bundle budget

```bash
npm run build && npm run start                       # production preview on :3001
BASE_URL=http://localhost:3001 npm run check:bundle  # BASE_URL defaults to :3001
```

Loads `/bn/plan?demo=1` and `/` in Playwright's Chromium (375 px, cache disabled, service worker blocked) and sums the transfer size of every script response via CDP (`Network.loadingFinished` `encodedDataLength`). Vite preview sends no `Content-Encoding`, so in that case the script reports the gzip size of each body as the transfer size (that is what Cloudflare's edge sends). Fails with exit 1 above `BUNDLE_LIMIT` (default 300 000 bytes). Always run it against a production build; the dev server serves unminified modules. Baseline on 30 Oct 2026 (stub plan page): ~161 KB gzip / ~531 KB raw for `/bn/plan`, ~150 KB gzip for `/`.

### E2E

```bash
npm run test:e2e                                                    # onboarding spec; Playwright starts the dev server on :3001
E2E_EXPECT_PLAN=1 npm run test:e2e                                  # once the engine is wired: require the "Save …" headline
npm run build && npm run start                                      # then, in another shell:
BASE_URL=http://localhost:3001 npx playwright test e2e/offline.spec.ts
```

- `onboarding.spec.ts`: `/` → English → five answers (28 / 50 000 / 30 000 / no one / no debt) → `/en/plan`, asserts at most 8 taps (the one-time disclaimer "I understand" is not counted), then the header locale switch and a Bangla digit on the page. Without `E2E_EXPECT_PLAN=1` the plan page may still show the `errors.engineNotReady` message, and the test **skips** (does not fail) when `/en/start/1` shows no question input because `app/[locale]/start/[step]` is not landed yet.
- `offline.spec.ts`: skipped unless `BASE_URL` is set (the service worker registers only in production builds). Waits for the worker to control the page and for `/bn/plan` to land in the `taka-*` cache, then `context.setOffline(true)`, reloads, and asserts the reload was answered by the service worker and the headline is still on the page.

### CI (`.github/workflows/ci.yml`)

- Triggers: every pull request, and pushes to `main` (not every branch, so a PR branch is not checked twice).
- `check`: `npm ci` → `npm run typecheck` (which runs `cf workers types` itself) → `npm test` → `npx cf build` → `npx cf deploy --prebuilt --mode production --dry-run` (needs no login; `D1_DATABASE_ID` comes from repository **variables**).
- `e2e` (`continue-on-error: true` while the UI slices land): installs Chromium, migrates the local D1, runs the onboarding spec against the dev server, then builds, starts the preview on :3001 in the background, runs the offline spec and `npm run check:bundle` against it. The Playwright report is uploaded as an artifact.
- `deploy` (push to `main`, after `check`): `npx cf build && npx cf deploy --prebuilt --mode production` with secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and variable `D1_DATABASE_ID`. Remote D1 migrations (`npm run db:migrate:remote`) stay a manual step until the token scopes are proven; `/api/rates` serves the bundled seed with `X-Rates-Source: fallback` meanwhile.
