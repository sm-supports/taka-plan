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

- Inside git worktrees created by agent tooling, a hook may refuse commands that source `nvm.sh`; use `export PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH"` instead.
- Build output lives under `.cloudflare/output/v0/workers/default/{bundle,assets}` (not `dist/`). The bare scaffold's client JS was 441 KB raw / 133 KB gzip (React 19 + RSC runtime), so our own code has roughly 160 KB of compressed transfer budget under the PRD's 300 KB target.
- `migrations/0002_seed_rates.sql` is regenerated from the seed JSON; after changing the seed before launch, run `npm run db:reset:local && npm run db:migrate:local` and restart the dev server (the Worker keeps the old SQLite file open).

- `cf d1 … --local` defaults to `~/Library/Preferences/cloudflare/state/v3`, **not** the project. Always pass `--persist-to .cloudflare/state` (the npm scripts do) so the dev server sees the data.
- `cf build` runs Vite directly and ignores npm pre/post scripts. Anything the build needs (seed migration, `public/sw.js`) must be committed, not generated at build time.
- `cloudflare.config.ts` is function-form: `mode === "production"` reads `D1_DATABASE_ID` from the environment; every other mode uses the fixed local id above. Set `D1_DATABASE_ID` **before** the first `cf deploy` so cf does not auto-provision a second database.
- Secrets for local dev come from `.dev.vars` (copy `.dev.vars.example`). Never commit it.
- `vitest.config.ts` is deliberately separate from `vite.config.ts`: tests must not boot vinext or the Cloudflare plugin.
- The Claude desktop "preview" launcher (`.claude/launch.json`) runs a login shell whose cwd is not accessible on this external volume (`getcwd: Operation not permitted`); start the dev server from a normal shell instead.
- First remote deploy needs `cf auth login` (browser OAuth) run by a person; `wrangler login` does not carry over.
