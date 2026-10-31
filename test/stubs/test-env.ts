// Stand-in for the Pages Functions env in route-handler tests (bound by test/stubs/bind-env.ts).
export const testEnv: { DB: undefined; ADMIN_PASSWORD: string } = {
  DB: undefined,
  ADMIN_PASSWORD: "test-pass-123456",
};
