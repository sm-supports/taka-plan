import { bindings, defineConfig, defineWorker } from "cf/config";

/**
 * Local development never needs the remote D1 id: the Vite plugin simulates the
 * database under .cloudflare/state. Production reads D1_DATABASE_ID (set in CI
 * after `cf d1 create --name taka-plan`).
 */
const LOCAL_D1_ID = "00000000-0000-4000-8000-000000000001";

export default defineConfig(({ mode }) => ({
  worker: defineWorker({
    name: "taka-plan",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-30",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      DB: bindings.d1({
        name: "taka-plan",
        id: mode === "production" ? process.env.D1_DATABASE_ID : LOCAL_D1_ID,
      }),
      ADMIN_PASSWORD: bindings.secret(),
    },
  }),
}));
