// S6: passwords under 12 characters are refused off a local host (admin treated as not configured),
// and an optional SESSION_SECRET keys the session HMAC instead of the password.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ADMIN_COOKIE, MIN_PASSWORD_LENGTH, adminConfigProblem, createSessionCookie, isAdmin, readCookie, verifyPassword, verifySessionToken } from "@/lib/server/admin-auth";
import { setRatesRepoForTests } from "@/lib/server/env";
import { FakeRatesRepo } from "@/test/fakes/fakeRatesRepo";
import { testEnv } from "@/test/stubs/test-env";
import { GET as health, type HealthBody } from "../health/route";
import { POST as login } from "./login/route";
import { GET as getRates } from "./rates/route";
import { GET as session } from "./session/route";

const env = testEnv as unknown as { ADMIN_PASSWORD?: string; SESSION_SECRET?: string };
const REAL_PASSWORD = env.ADMIN_PASSWORD;
const LIVE = "https://taka-plan.pages.dev";
const LOCAL = "http://localhost:3001";
const CSRF = { "content-type": "application/json", "x-requested-with": "taka-admin" };
const SECRET = "s".repeat(40);

function loginAt(origin: string, password: string): Promise<Response> {
  return login(new Request(`${origin}/api/admin/login`, { method: "POST", headers: CSRF, body: JSON.stringify({ password }) }));
}

function tokenOf(res: Response): string {
  return readCookie(res.headers.get("set-cookie")!.split(";")[0], ADMIN_COOKIE)!;
}

beforeEach(() => setRatesRepoForTests(new FakeRatesRepo()));
afterEach(() => {
  env.ADMIN_PASSWORD = REAL_PASSWORD;
  delete env.SESSION_SECRET;
  setRatesRepoForTests(null);
});

describe("short ADMIN_PASSWORD (S6)", () => {
  it("is refused off localhost with 503 ADMIN_DISABLED after the delay, and allowed on localhost", async () => {
    env.ADMIN_PASSWORD = "elevenchars";
    expect(env.ADMIN_PASSWORD.length).toBe(MIN_PASSWORD_LENGTH - 1);
    const started = Date.now();
    const live = await loginAt(LIVE, "elevenchars");
    expect(live.status).toBe(503);
    expect(Date.now() - started).toBeGreaterThanOrEqual(450);
    expect(live.headers.get("set-cookie")).toBeNull();
    const err = ((await live.json()) as { error: { code: string; message: string } }).error;
    expect(err.code).toBe("ADMIN_DISABLED");
    expect(err.message).toMatch(/at least 12 characters/);
    expect(await verifyPassword("elevenchars", `${LIVE}/api/admin/login`)).toBe(false);
    expect(await verifyPassword("elevenchars")).toBe(false);

    const local = await loginAt(LOCAL, "elevenchars");
    expect(local.status).toBe(204);
  });

  it("ends sessions already open when the password is shortened, off localhost only", async () => {
    const token = tokenOf(await loginAt(LIVE, REAL_PASSWORD!));
    const cookie = `${ADMIN_COOKIE}=${token}`;
    expect(await (await session(new Request(`${LIVE}/api/admin/session`, { headers: { cookie } }))).json()).toEqual({ admin: true });
    env.ADMIN_PASSWORD = "short";
    expect(await (await session(new Request(`${LIVE}/api/admin/session`, { headers: { cookie } }))).json()).toEqual({ admin: false });
    expect((await getRates(new Request(`${LIVE}/api/admin/rates`, { headers: { cookie } }))).status).toBe(401);
    expect(await isAdmin(cookie)).toBe(false);
  });

  it("twelve characters is enough", async () => {
    env.ADMIN_PASSWORD = "twelve-chars";
    expect(adminConfigProblem(LIVE)).toBeNull();
    expect((await loginAt(LIVE, "twelve-chars")).status).toBe(204);
  });

  it("an unset password or the placeholder is reported as such", async () => {
    env.ADMIN_PASSWORD = "";
    expect(adminConfigProblem(LIVE)).toBe("not-set");
    expect(adminConfigProblem(LOCAL)).toBe("not-set");
    const res = await loginAt(LIVE, "anything-at-all");
    expect(res.status).toBe(503);
    expect(((await res.json()) as { error: { message: string } }).error.message).toMatch(/not set/);
    env.ADMIN_PASSWORD = "change-me";
    expect(adminConfigProblem(LIVE)).toBe("placeholder");
    expect(adminConfigProblem(LOCAL)).toBeNull();
  });

  it("GET /api/health says why the admin is locked on this host", async () => {
    const at = (origin: string) => health(new Request(`${origin}/api/health`)).then((r) => r.json() as Promise<HealthBody>);
    expect((await at(LIVE)).admin).toBe("ok");
    env.ADMIN_PASSWORD = "elevenchars";
    expect((await at(LIVE)).admin).toBe("too-short");
    expect((await at(LOCAL)).admin).toBe("ok");
    env.ADMIN_PASSWORD = "";
    expect((await at(LIVE)).admin).toBe("not-set");
  });
});

describe("SESSION_SECRET (S6)", () => {
  const now = 1_800_000_000_000;

  it("keys the session HMAC when set: tokens differ from password-keyed ones and survive a password change", async () => {
    const byPassword = await createSessionCookie(now);
    env.SESSION_SECRET = SECRET;
    const bySecret = await createSessionCookie(now);
    expect(bySecret).not.toBe(byPassword);
    expect(await verifySessionToken(bySecret, now)).toBe(true);
    expect(await verifySessionToken(byPassword, now)).toBe(false);
    env.ADMIN_PASSWORD = "a-different-long-password";
    expect(await verifySessionToken(bySecret, now)).toBe(true);
  });

  it("rotating the secret signs everyone out", async () => {
    env.SESSION_SECRET = SECRET;
    const token = await createSessionCookie(now);
    env.SESSION_SECRET = "t".repeat(40);
    expect(await verifySessionToken(token, now)).toBe(false);
  });

  it("is ignored when shorter than 32 characters (the password-derived key is used)", async () => {
    const byPassword = await createSessionCookie(now);
    env.SESSION_SECRET = "too-short-secret";
    expect(await createSessionCookie(now)).toBe(byPassword);
  });

  it("never opens the admin without a password", async () => {
    env.SESSION_SECRET = SECRET;
    const token = await createSessionCookie(now);
    env.ADMIN_PASSWORD = "";
    expect(await verifySessionToken(token, now)).toBe(false);
    await expect(createSessionCookie(now)).rejects.toThrow(/ADMIN_PASSWORD/);
  });

  it("login issues secret-keyed cookies that the admin routes accept", async () => {
    env.SESSION_SECRET = SECRET;
    const token = tokenOf(await loginAt(LIVE, REAL_PASSWORD!));
    expect((await getRates(new Request(`${LIVE}/api/admin/rates`, { headers: { cookie: `${ADMIN_COOKIE}=${token}` } }))).status).toBe(200);
    delete env.SESSION_SECRET;
    expect((await getRates(new Request(`${LIVE}/api/admin/rates`, { headers: { cookie: `${ADMIN_COOKIE}=${token}` } }))).status).toBe(401);
  });
});
