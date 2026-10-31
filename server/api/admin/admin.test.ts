import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SAMPLE_PROFILE_IDS } from "@taka/engine";
import { FakeRatesRepo } from "@/test/fakes/fakeRatesRepo";
import { setRatesRepoForTests } from "@/lib/server/env";
import { ADMIN_COOKIE, PLACEHOLDER_PASSWORD, createSessionCookie, isAdmin, isLocalHost, readCookie, verifyPassword, verifySessionToken } from "@/lib/server/admin-auth";
import { testEnv as env } from "@/test/stubs/test-env";
import type { AdminRatesResponse, PreviewResponse } from "@/components/admin/types";
import { POST as login } from "./login/route";
import { POST as logout } from "./logout/route";
import { GET as getRates, PUT as putRates } from "./rates/route";
import { POST as publish } from "./publish/route";
import { POST as discard } from "./discard/route";
import { GET as preview } from "./preview/route";
import { GET as session } from "./session/route";

const BASE = "http://localhost/api/admin";
const CSRF = { "content-type": "application/json", "x-requested-with": "taka-admin" };

function post(path: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`${BASE}/${path}`, { method: "POST", headers: { ...CSRF, ...headers }, body: JSON.stringify(body) });
}

function put(path: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`${BASE}/${path}`, { method: "PUT", headers: { ...CSRF, ...headers }, body: JSON.stringify(body) });
}

function get(path: string, headers: Record<string, string> = {}): Request {
  return new Request(`${BASE}/${path}`, { headers });
}

async function signIn(): Promise<Record<string, string>> {
  const res = await login(post("login", { password: "test-pass-123456" }));
  expect(res.status).toBe(204);
  const setCookie = res.headers.get("set-cookie");
  expect(setCookie).toMatch(new RegExp(`^${ADMIN_COOKIE}=\\d+\\.[0-9a-f]{64}; `));
  const token = readCookie(setCookie!.split(";")[0], ADMIN_COOKIE);
  return { cookie: `${ADMIN_COOKIE}=${token}` };
}

describe("admin-auth", () => {
  it("verifyPassword accepts the stub password only", async () => {
    expect(await verifyPassword("test-pass-123456")).toBe(true);
    expect(await verifyPassword("test-pas")).toBe(false);
    expect(await verifyPassword("")).toBe(false);
  });

  it("session tokens expire after 12h and reject tampering", async () => {
    const now = 1_700_000_000_000;
    const token = await createSessionCookie(now);
    expect(token).toMatch(/^\d+\.[0-9a-f]{64}$/);
    expect(await verifySessionToken(token, now)).toBe(true);
    expect(await verifySessionToken(token, now + 12 * 3600 * 1000 - 1)).toBe(true);
    expect(await verifySessionToken(token, now + 12 * 3600 * 1000)).toBe(false);
    const [exp, mac] = token.split(".");
    expect(await verifySessionToken(`${Number(exp) + 1}.${mac}`, now)).toBe(false);
    expect(await verifySessionToken(`${exp}.${"0".repeat(64)}`, now)).toBe(false);
    expect(await verifySessionToken("garbage", now)).toBe(false);
    expect(await isAdmin(`other=1; ${ADMIN_COOKIE}=${token}`, now)).toBe(true);
    expect(await isAdmin({ get: (n) => (n === ADMIN_COOKIE ? { value: token } : undefined) }, now)).toBe(true);
    expect(await isAdmin(null, now)).toBe(false);
  });

  it("treats a malformed cookie as not signed in instead of throwing (SEC-1)", async () => {
    expect(readCookie(`${ADMIN_COOKIE}=%E0%A4%A`, ADMIN_COOKIE)).toBeUndefined();
    expect(await isAdmin(`${ADMIN_COOKIE}=%E0%A4%A`)).toBe(false);
    expect(await isAdmin({ get: () => { throw new Error("cookie store broke"); } })).toBe(false);
    setRatesRepoForTests(new FakeRatesRepo());
    expect((await getRates(get("rates", { cookie: `${ADMIN_COOKIE}=%ZZ` }))).status).toBe(401);
    setRatesRepoForTests(null);
  });

  it("refuses the placeholder password off localhost (SEC-10)", async () => {
    const stub = env as unknown as { ADMIN_PASSWORD: string };
    const real = stub.ADMIN_PASSWORD;
    stub.ADMIN_PASSWORD = PLACEHOLDER_PASSWORD;
    try {
      expect(isLocalHost("http://localhost:3001/api/admin/login")).toBe(true);
      expect(isLocalHost("http://127.0.0.1/x")).toBe(true);
      expect(isLocalHost("https://taka-plan.example.workers.dev/api/admin/login")).toBe(false);
      expect(await verifyPassword(PLACEHOLDER_PASSWORD, "http://localhost:3001/api/admin/login")).toBe(true);
      expect(await verifyPassword(PLACEHOLDER_PASSWORD, "https://taka-plan.example.workers.dev/api/admin/login")).toBe(false);
      expect(await verifyPassword(PLACEHOLDER_PASSWORD)).toBe(false);
    } finally {
      stub.ADMIN_PASSWORD = real;
    }
  });
});

describe("admin routes", () => {
  beforeEach(() => setRatesRepoForTests(new FakeRatesRepo()));
  afterEach(() => setRatesRepoForTests(null));

  it("login: 401 on a wrong password (after the delay), 204 + cookie on the right one", async () => {
    const started = Date.now();
    const bad = await login(post("login", { password: "nope" }));
    expect(bad.status).toBe(401);
    expect(Date.now() - started).toBeGreaterThanOrEqual(450);
    expect(bad.headers.get("set-cookie")).toBeNull();

    const res = await login(post("login", { password: "test-pass-123456" }));
    expect(res.status).toBe(204);
    const cookie = res.headers.get("set-cookie")!;
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/");
    expect(cookie).not.toContain("Secure");

    const https = await login(new Request("https://example.com/api/admin/login", { method: "POST", headers: CSRF, body: JSON.stringify({ password: "test-pass-123456" }) }));
    expect(https.headers.get("set-cookie")).toContain("; Secure");
  });

  it("session: admin false without a cookie or with a forged one, true after sign-in, never cached", async () => {
    const anon = await session(get("session"));
    expect(anon.status).toBe(200);
    expect(anon.headers.get("cache-control")).toBe("no-store");
    expect(await anon.json()).toEqual({ admin: false });
    expect(await (await session(get("session", { cookie: `${ADMIN_COOKIE}=9999999999999.${"0".repeat(64)}` }))).json()).toEqual({ admin: false });
    expect(await (await session(get("session", await signIn()))).json()).toEqual({ admin: true });
  });

  it("login without the CSRF header is 403", async () => {
    const res = await login(post("login", { password: "test-pass-123456" }, { "x-requested-with": "" }));
    expect(res.status).toBe(403);
  });

  it("GET rates is 401 without a cookie and returns published v1 with one", async () => {
    expect((await getRates(get("rates"))).status).toBe(401);
    expect((await getRates(get("rates", { cookie: `${ADMIN_COOKIE}=123.abc` }))).status).toBe(401);
    const auth = await signIn();
    const res = await getRates(get("rates", auth));
    expect(res.status).toBe(200);
    const body = (await res.json()) as AdminRatesResponse;
    expect(body.published.version).toBe(1);
    expect(body.draft).toBeNull();
    expect(body.changeLog).toEqual([]);
    expect(body.published.rows.inflation_cpi.value).toBe(0.0834);
  });

  it("every other handler is 401 without a cookie", async () => {
    expect((await putRates(put("rates", { key: "inflation_cpi", patch: { value: 0.09 } }))).status).toBe(401);
    expect((await publish(post("publish", { note: "x" }))).status).toBe(401);
    expect((await discard(post("discard", {}))).status).toBe(401);
    expect((await preview(get("preview"))).status).toBe(401);
    expect((await logout(post("logout", {}))).status).toBe(401);
  });

  it("mutating handlers need JSON + X-Requested-With, else 403", async () => {
    const auth = await signIn();
    expect((await putRates(put("rates", { key: "inflation_cpi", patch: { value: 0.09 } }, { ...auth, "x-requested-with": "" }))).status).toBe(403);
    expect((await putRates(put("rates", { key: "inflation_cpi", patch: { value: 0.09 } }, { ...auth, "content-type": "text/plain" }))).status).toBe(403);
    expect((await publish(post("publish", { note: "x" }, { ...auth, "x-requested-with": "nope" }))).status).toBe(403);
    expect((await discard(post("discard", {}, { ...auth, "x-requested-with": "" }))).status).toBe(403);
    expect((await logout(post("logout", {}, { ...auth, "content-type": "text/plain" }))).status).toBe(403);
  });

  it("PUT rates creates draft v2, applies the patch and logs it; GET then shows the draft", async () => {
    const auth = await signIn();
    const res = await putRates(put("rates", { key: "inflation_cpi", patch: { value: 0.09, note: "bumped" }, note: "monthly review" }, auth));
    expect(res.status).toBe(200);
    const draft = (await res.json()) as AdminRatesResponse["published"];
    expect(draft.version).toBe(2);
    expect(draft.rows.inflation_cpi.value).toBe(0.09);
    expect(draft.rows.inflation_cpi.note).toBe("bumped");

    const all = (await (await getRates(get("rates", auth))).json()) as AdminRatesResponse;
    expect(all.published.version).toBe(1);
    expect(all.published.rows.inflation_cpi.value).toBe(0.0834);
    expect(all.draft?.version).toBe(2);
    expect(all.changeLog.map((e) => e.action)).toEqual(["edit", "create_draft"]);
    expect(all.changeLog[0]).toMatchObject({ key: "inflation_cpi", version: 2, note: "monthly review" });
  });

  it("PUT rates rejects bad source URLs and non-object JSON values with 400 (SEC-4, SEC-7)", async () => {
    const auth = await signIn();
    for (const sourceUrl of ["javascript:alert(1)", "ftp://x", "PRD.md", "data:text/html,hi", ""]) {
      const res = await putRates(put("rates", { key: "inflation_cpi", patch: { sourceUrl } }, auth));
      expect(res.status, sourceUrl).toBe(400);
    }
    for (const sourceUrl of ["https://www.bb.org.bd/", "http://example.org/rates", "docs/PRD.md#rates"]) {
      expect((await putRates(put("rates", { key: "inflation_cpi", patch: { sourceUrl } }, auth))).status, sourceUrl).toBe(200);
    }
    for (const valueJson of [null, 1, "slabs", true]) {
      expect((await putRates(put("rates", { key: "tax_slabs", patch: { valueJson } }, auth))).status, String(valueJson)).toBe(400);
    }
    expect((await putRates(put("rates", { key: "tax_slabs", patch: { valueJson: [{ width: null, rate: 0.1 }] } }, auth))).status).toBe(200);
  });

  it("rejects bodies over 64 KB with 413 (SEC-5)", async () => {
    const auth = await signIn();
    const huge = { key: "inflation_cpi", patch: { note: "x".repeat(70 * 1024) } };
    expect((await putRates(put("rates", huge, auth))).status).toBe(413);
    const lying = new Request(`${BASE}/rates`, { method: "PUT", headers: { ...CSRF, ...auth, "content-length": String(10 * 1024 * 1024) }, body: JSON.stringify({ key: "inflation_cpi", patch: { value: 0.09 } }) });
    expect((await putRates(lying)).status).toBe(413);
  });

  it("PUT rates rejects unknown keys, bad patches and invalid rows with 400", async () => {
    const auth = await signIn();
    expect((await putRates(put("rates", { key: "nope", patch: { value: 1 } }, auth))).status).toBe(400);
    expect((await putRates(put("rates", { key: "inflation_cpi", patch: {} }, auth))).status).toBe(400);
    expect((await putRates(put("rates", { key: "inflation_cpi", patch: { value: "9%" } }, auth))).status).toBe(400);
    const badDate = await putRates(put("rates", { key: "inflation_cpi", patch: { asOf: "30/09/2026" } }, auth));
    expect(badDate.status).toBe(400);
    expect(((await badDate.json()) as { error: { code: string } }).error.code).toBe("INVALID_ROW");
    // The invalid edit never reached the draft.
    const all = (await (await getRates(get("rates", auth))).json()) as AdminRatesResponse;
    expect(all.draft?.rows.inflation_cpi.asOf).toBe("2026-09-30");
  });

  it("publish → v2 is published; discard removes a draft", async () => {
    const auth = await signIn();
    expect((await publish(post("publish", { note: "x" }, auth))).status).toBe(409);
    await putRates(put("rates", { key: "policy_rate", patch: { value: 0.1 } }, auth));
    const res = await publish(post("publish", { note: "rate change" }, auth));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ version: 2 });
    const all = (await (await getRates(get("rates", auth))).json()) as AdminRatesResponse;
    expect(all.published.version).toBe(2);
    expect(all.published.rows.policy_rate.value).toBe(0.1);
    expect(all.draft).toBeNull();
    expect(all.changeLog[0]).toMatchObject({ action: "publish", version: 2, note: "rate change" });

    await putRates(put("rates", { key: "policy_rate", patch: { value: 0.11 } }, auth));
    expect((await discard(post("discard", {}, auth))).status).toBe(204);
    const after = (await (await getRates(get("rates", auth))).json()) as AdminRatesResponse;
    expect(after.draft).toBeNull();
    expect(after.published.version).toBe(2);
  });

  it("preview returns the three sample profiles with published vs draft and changedKeys", async () => {
    const auth = await signIn();
    const noDraft = (await (await preview(get("preview", auth))).json()) as PreviewResponse;
    expect(noDraft.profiles.map((p) => p.id)).toEqual([...SAMPLE_PROFILE_IDS]);
    expect(noDraft.draft).toBeNull();
    expect(noDraft.changedKeys).toEqual([]);
    for (const p of noDraft.profiles) {
      expect(p.draft).toBeNull();
      // Every module the sample profiles answer (M1–M7) is wired: a real summary, never an error marker.
      expect("error" in p.published ? p.published.error : typeof p.published.monthlyTotal).toBe("number");
    }
    // familyWithDebt answered the insurance check: with a card open, insurance takes half of what the fund leaves and the card the rest.
    const family = noDraft.profiles.find((p) => p.id === "familyWithDebt")?.published;
    expect(family && !("error" in family) ? family.buckets.map((b) => [b.id, b.amount, b.instrument]) : family).toEqual([
      ["emergency", 19200, "fdr_3m"],
      ["insurance", 2400, "term_insurance"],
      ["debt", 2400, "loan_prepayment"],
      ["retirement", 0, "equity_fund"],
    ]);

    await putRates(put("rates", { key: "dps_rate", patch: { value: 0.1 } }, auth));
    await putRates(put("rates", { key: "tax_slabs", patch: { valueJson: [{ width: null, rate: 0.1 }] } }, auth));
    const res = await preview(get("preview", auth));
    expect(res.status).toBe(200);
    const body = (await res.json()) as PreviewResponse;
    expect(body.published.version).toBe(1);
    expect(body.draft?.version).toBe(2);
    expect(body.changedKeys).toEqual(["dps_rate", "tax_slabs"]);
    expect(body.profiles).toHaveLength(3);
    for (const p of body.profiles) expect(p.draft).not.toBeNull();
  });

  it("logout clears the cookie", async () => {
    const auth = await signIn();
    const res = await logout(post("logout", {}, auth));
    expect(res.status).toBe(204);
    expect(res.headers.get("set-cookie")).toMatch(new RegExp(`^${ADMIN_COOKIE}=; Max-Age=0`));
  });
});
