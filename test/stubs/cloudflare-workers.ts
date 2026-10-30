// Vitest stand-in for the `cloudflare:workers` module in route-handler tests.
export const env: { DB: undefined; ADMIN_PASSWORD: string; ASSETS: undefined } = {
  DB: undefined,
  ADMIN_PASSWORD: "test-pass",
  ASSETS: undefined,
};
