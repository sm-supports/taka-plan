# Deploying Taka Plan (Cloudflare Pages + GitHub)

Taka Plan is hosted on **Cloudflare Pages**, connected to the public GitHub repository `realsajat/taka-plan`. Pages builds every push itself: `main` goes to production, any other branch to a preview URL. There is no Cloudflare Worker, and GitHub Actions only runs checks (TOOLING.md), so GitHub stores no Cloudflare credentials.

## What runs where

| Part | Where | Notes |
| --- | --- | --- |
| Every page (`/`, `/bn/*`, `/en/*`, `/admin/*`), JS/CSS chunks, icons, `sw.js`, manifest | Pages static files from `dist/client` | Prebuilt by vinext's static export. No server rendering, so no Functions quota or CPU is used for page views. |
| `/api/rates`, `/api/health`, `/api/admin/*` | Pages Functions (`functions/api/**`) | Limited by `public/_routes.json` (`include: ["/api/*"]`). Thin wrappers around `server/api/**`. |
| Rates tables | D1 database `taka-plan` (`3ef54377-b581-44fd-baf8-438aa5247226`) | Bound as `DB` in production only. |
| Admin password | Pages secret `ADMIN_PASSWORD` (production) | Set by a person in the dashboard; never in the repository. |

Why static export plus Functions rather than the whole vinext server on Pages: the account is on the Workers **Free** plan (10 ms CPU per Functions request, 100 000 requests a day). Server-rendering every page view would risk the CPU limit; static pages cost nothing.

## Pages project settings

| Setting | Value |
| --- | --- |
| Project name | `taka-plan` (site at `https://taka-plan.pages.dev`) |
| Source | GitHub `realsajat/taka-plan`, production branch `main` |
| Build command | `npm run build` |
| Build output directory | `dist/client` |
| Root directory | (repository root) |
| Environment variable (build) | `NODE_VERSION` = `24.22.2` (production and preview) |
| Functions compatibility date | `2026-10-23` (production and preview) |
| D1 binding (production) | `DB` → `taka-plan` |
| D1 binding (preview) | none: previews serve the bundled seed and the admin stays locked |
| Secret (production) | `ADMIN_PASSWORD`, at least 12 characters |

Pages installs dependencies with `npm ci` before the build command. Functions in `functions/` are compiled by the Pages build automatically.

## One-time setup

1. **GitHub access for Cloudflare.** Install the Cloudflare Pages GitHub app on the `realsajat` account with access to `taka-plan` (dashboard: Workers & Pages → Create → Pages → Connect to Git). A project connected to Git cannot later be switched to Direct Upload, or back.
2. **Create the project** with the settings above, from the dashboard or with the cf CLI (`npx cf@1.0.0-beta.26 pages create …`; cf can create and edit Pages projects but refuses to deploy them).
3. **Database.** The remote D1 already holds the schema and the published v1 rates (65 rows). For a new database: `npx wrangler d1 create taka-plan`, put its id in `config/wrangler.remote.toml` and in the project's D1 binding, then `npm run db:migrate:remote` (needs `npx wrangler login`).
4. **Admin password.** Dashboard → Workers & Pages → `taka-plan` → Settings → Variables and Secrets → Production → Add → type **Secret**, name `ADMIN_PASSWORD`. Then **retry the latest production deployment** (Deployments → … → Retry), because a Pages deployment only sees variables that existed when it was built. Until then every admin sign-in is refused, by design.

## Day to day

- Push to `main` → production deploy. Push another branch or open a PR → preview deploy at `https://<branch>.taka-plan.pages.dev`.
- Rates are edited live in `/admin` (no deploy needed). Changing the launch seed (`rates.seed.json`) needs a new migration for an existing database.
- Check a deployment: `curl https://taka-plan.pages.dev/api/health` should report `"db":"ok"` and `"ratesSource":"d1"`; `PORT` is local-only, so for the live site use `BASE_URL=https://taka-plan.pages.dev npx playwright test e2e/static-pages.spec.ts` (admin test needs `E2E_ADMIN_PASSWORD`).

## Rolling back

Dashboard → Deployments → pick an earlier production deployment → Rollback. The D1 data is not rolled back; publish an older rates version from `/admin` if needed.
