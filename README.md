# Taka Plan

A free, mobile-first Bangla/English personal-finance planner for Bangladesh: five questions, one monthly savings plan, and calculators for an emergency fund, debt health, save-first budgeting and goals. Built with [vinext](https://github.com/cloudflare/vinext) as a static export, hosted on Cloudflare Pages with Pages Functions and D1 for the rates API.

- Product spec: [docs/PRD.md](docs/PRD.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Commands and gotchas: [docs/TOOLING.md](docs/TOOLING.md)
- Deployment: [docs/DEPLOY.md](docs/DEPLOY.md)

## Quick start

```bash
nvm use && npm ci && cp .dev.vars.example .dev.vars
npm run db:migrate:local
npm run build && npm run preview   # http://localhost:8788, same runtime as production
npm run dev                        # http://localhost:3001, fast UI work without the API
```

Taka Plan gives general information, not financial advice.
