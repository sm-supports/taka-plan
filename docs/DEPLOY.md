# Deploying Taka Plan (Cloudflare Pages + GitHub)

Taka Plan is hosted on **Cloudflare Pages**, connected to the public GitHub repository `sm-supports/taka-plan` (moved from `realsajat/taka-plan` on 31 Oct 2026; the old address redirects). Pages builds every push itself: `main` goes to production, any other branch to a preview URL. There is no Cloudflare Worker, and GitHub Actions only runs checks (TOOLING.md), so GitHub stores no Cloudflare credentials.

## What runs where

| Part | Where | Notes |
| --- | --- | --- |
| Every page (`/`, `/bn/*`, `/en/*`, `/admin/*`), JS/CSS chunks, icons, `sw.js`, manifest | Pages static files from `dist/client` | Prebuilt by vinext's static export. No server rendering, so no Functions quota or CPU is used for page views. |
| `/api/rates`, `/api/health`, `/api/countries*`, `/api/admin/*` | Pages Functions (`functions/api/**`) | Limited by `public/_routes.json` (`include: ["/api/*"]`). Thin wrappers around `server/api/**`. |
| Rates and country tables | D1 database `taka-plan` (`3ef54377-b581-44fd-baf8-438aa5247226`) | Bound as `DB` in production only. |
| Admin password | Pages secret `ADMIN_PASSWORD` (production) | Set by a person in the dashboard; never in the repository. At least 12 characters, else admin sign-in stays off. |
| Session key (optional) | Pages secret `SESSION_SECRET` (production) | At least 32 random characters. When set, it signs the admin session cookie instead of a key derived from `ADMIN_PASSWORD`. |

Why static export plus Functions rather than the whole vinext server on Pages: the account is on the Workers **Free** plan (10 ms CPU per Functions request, 100 000 requests a day). Server-rendering every page view would risk the CPU limit; static pages cost nothing.

## Pages project settings

| Setting | Value |
| --- | --- |
| Project name | `taka-plan` (site at `https://taka-plan.pages.dev`) |
| Source | GitHub `sm-supports/taka-plan`, production branch `main` |
| Build command | `npm run build` |
| Build output directory | `dist/client` |
| Root directory | (repository root) |
| Environment variable (build) | `NODE_VERSION` = `24.22.2` (production and preview) |
| Functions compatibility date | `2026-10-23` (production and preview) |
| D1 binding (production) | `DB` → `taka-plan` |
| D1 binding (preview) | none: previews serve the bundled seed and the admin stays locked |
| Secret (production) | `ADMIN_PASSWORD`, at least 12 characters (shorter is refused off localhost) |
| Secret (production, optional) | `SESSION_SECRET`, at least 32 characters (shorter is ignored) |

Pages installs dependencies with `npm ci` before the build command. Functions in `functions/` are compiled by the Pages build automatically.

## One-time setup

1. **GitHub access for Cloudflare.** The Cloudflare Pages GitHub app is installed on the `sm-supports` organisation, which is why the repository lives there (an attempt to create the project for `realsajat/taka-plan` failed with Cloudflare error 8000011). Connect from the dashboard: Workers & Pages → Create → Pages → Connect to Git. A project connected to Git cannot later be switched to Direct Upload, or back.
2. **Create the project** with the settings above, from the dashboard or with the cf CLI (`npx cf@1.0.0-beta.26 pages create --body …`; cf can create and edit Pages projects but refuses to deploy them). A project made in the dashboard starts with an empty output directory, no D1 binding and no `NODE_VERSION`; fix them afterwards with `npx cf@1.0.0-beta.26 pages edit taka-plan --body '{"build_config":…,"deployment_configs":…}'` or in Settings, then trigger a new build.
3. **Database.** The remote D1 already holds the schema and the published v1 rates (65 rows). For a new database: `npx wrangler d1 create taka-plan`, put its id in `config/wrangler.remote.toml` and in the project's D1 binding, then `npm run db:migrate:remote` (needs `npx wrangler login`).
4. **Admin password.** Dashboard → Workers & Pages → `taka-plan` → Settings → Variables and Secrets → Production → Add → type **Secret**, name `ADMIN_PASSWORD`. Then **retry the latest production deployment** (Deployments → … → Retry, or `npx cf@1.0.0-beta.26 pages deployments retry <deployment-id> --project-name taka-plan`), because a Pages deployment only sees variables that existed when it was built. Set on 31 Oct 2026. Until then every admin sign-in is refused, by design.
   - The password must be **at least 12 characters**. A shorter one (or the `change-me` placeholder from `.dev.vars.example`) counts as not configured anywhere but `localhost`: sign-in answers 503 `ADMIN_DISABLED` with the reason, sessions already open stop working, and `GET /api/health` reports `"admin":"too-short"` (or `"placeholder"`, `"not-set"`). If the current secret is shorter, replace it and retry the deployment.
5. **Session key (optional, recommended).** Add a second secret `SESSION_SECRET` the same way, at least 32 random characters (`openssl rand -hex 32`), then retry the deployment. With it the session cookie is signed with this key rather than one derived from the password, so a stolen cookie reveals nothing about the password. Changing `SESSION_SECRET` signs every admin out; changing only the password then does not (rotate both if the password leaked). A value under 32 characters is ignored.

## Day to day

- Push to `main` → production deploy. Push another branch or open a PR → preview deploy at `https://<branch>.taka-plan.pages.dev`.
- Rates are edited live in `/admin` (no deploy needed). Changing the launch seed (`rates.seed.json`) needs a new migration for an existing database.
- Check a deployment: `curl https://taka-plan.pages.dev/api/health` should report `"db":"ok"`, `"ratesSource":"d1"` and `"admin":"ok"`. `"db":"invalid-snapshot"` means D1 answered but the published rates failed validation; `reason` says why, e.g. `"rates table missing rows: insurance_term_premium_table, …"` when a rates migration has not been applied remotely (the site then serves the bundled seed); `PORT` is local-only, so for the live site use `BASE_URL=https://taka-plan.pages.dev npx playwright test e2e/static-pages.spec.ts` (admin test needs `E2E_ADMIN_PASSWORD`).

## API endpoints

Every handler reads one country at most (Free plan: 10 ms CPU per Functions request). Admin endpoints need the `tp_admin` cookie; mutations also need `Content-Type: application/json` and `X-Requested-With: taka-admin`, and bodies are capped at 64 KB.

| Endpoint | Answer | D1 queries |
| --- | --- | --- |
| `GET /api/rates` | published Bangladesh rates snapshot, ETag `"v<n>"` | 2 |
| `GET /api/health` | `{ ok, db, publishedVersion, ratesSource, admin, detail?, reason? }`; `db` is `ok`, `missing-table`, `error` or `invalid-snapshot` (then `reason` names the failing check); `admin` is `ok`, `not-set`, `placeholder` or `too-short` | 2 |
| `GET /api/countries/:code` | `{ version, status: "published", profile: CountryProfile }` (the `StoredCountry` shape that `lib/country/loader.ts` `parseCountryBody` reads); ETag `"<CODE>-v<n>"`, `public, max-age=300, stale-while-revalidate=86400`, `X-Country-Source: d1`. 304 on a matching `If-None-Match` (version lookup only), 404 JSON when the country has no published version (the client uses its static file), 400 for a bad code, 503 `no-store` when D1 fails | 1 for a 304, 2 for a 200 |
| `GET /api/admin/countries` | `{ countries: CountrySummary[] }` (with `hasDraft`) | 1 |
| `GET /api/admin/countries/:code` | `{ code, published, draft, changeLog }`; `?before=<id>` pages the log | 5 |
| `PUT /api/admin/countries/:code` | body `{ field, value: CountryField, note? }` or `{ meta: CountryMetaPatch, note? }`; creates the draft when absent and returns it (`StoredCountry`). Cleaned before anything is written (`lib/server/country-clean.ts`): meta keys, instrument slots, institution keys and their properties must be known and typed; names ≤ 100 characters, sources and URLs ≤ 300, notes ≤ 1,000; `researchedAt` no later than tomorrow, `asOf` no later than a year ahead, both real dates; JSON figures keep only the keys of their shape. 400 `BAD_PATCH` / `INVALID_META` / `INVALID_FIELD` / `INVALID_DATE` / `BAD_NOTE`, 413 `PROFILE_TOO_LARGE` when the profile would pass 48 KB | about 8 |
| `POST /api/admin/countries/:code/publish` | body `{ note? }` → `{ version }`; 409 without a draft; 400 `INVALID_DRAFT` (nothing published) when the draft fails validation, the limits above, or any of the three sample plans throws under `withCountry` + `computePlan` | 6 |
| `POST /api/admin/countries/:code/discard` | 204 | 2 |
| `GET /api/admin/countries/:code/preview` | three sample plans, published vs draft (`withCountry` over the published rates), with `changedFields` and `changedMeta` | about 8 |

There is no public `GET /api/countries` list (the client never used one); the list is admin-only at `GET /api/admin/countries`.

### Remote migrations before deploying v2

Production D1 has applied only `0001_schema.sql` and `0002_seed_rates.sql`. **Apply these in this order before pushing the v2 code to `main`**, with `npm run db:migrate:remote` (wrangler applies pending files in file-name order and records each in `d1_migrations`):

1. `0003_rates_m2_m6_m7.sql`: M2/M6/M7 rate rows for the published and draft versions.
2. `0004_countries.sql`: `country_versions`, `country_fields`, `change_log.country`. The rates repository filters `change_log` on `country IS NULL`, so the admin rates log fails without it.
3. `0005_rates_plan_v2.sql`: plan v2 rate rows.
4. `0006_seed_countries.sql`: the country seed (published v1 per country), once it is in the repository; until then the country editor lists nothing and clients use the static country files.

0003 and 0005 are not applied yet, so they may still be regenerated (`npm run rates:gen-seed`) until the moment they run; after that they are frozen like 0002. Without 0003 and 0005 the published rates miss rows, `/api/rates` serves the bundled seed and `/api/health` says `"db":"invalid-snapshot"` with `"reason":"rates table missing rows: …"`. Check afterwards with `npx wrangler d1 migrations list taka-plan --remote -c config/wrangler.remote.toml` (nothing pending) and `/api/health` (`"db":"ok"`, `"ratesSource":"d1"`).

## Rolling back

Dashboard → Deployments → pick an earlier production deployment → Rollback. The D1 data is not rolled back; publish an older rates version from `/admin` if needed.
