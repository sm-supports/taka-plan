// S3: publish runs withCountry + computePlan for the three sample profiles on the draft and refuses
// it (400 INVALID_DRAFT, nothing published) when any of them throws. computePlan is wrapped so a
// test can make one sample plan fail for a chosen draft figure; everything else is the real engine.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_IN, FIXTURE_US, type CountryField, type RatesSnapshot } from "@taka/engine";
import { ADMIN_COOKIE, readCookie } from "@/lib/server/admin-auth";
import { setCountryRepoForTests, setRatesRepoForTests } from "@/lib/server/env";
import { FakeCountryRepo } from "@/test/fakes/fakeCountryRepo";
import { FakeRatesRepo } from "@/test/fakes/fakeRatesRepo";

/** A policy rate the engine "cannot handle": computePlan throws for the familyWithDebt profile when it sees it. */
const POISON_POLICY_RATE = 0.4321;

vi.mock("@taka/engine", async (importOriginal) => {
  const real = await importOriginal<typeof import("@taka/engine")>();
  return {
    ...real,
    computePlan: vi.fn((input: Parameters<typeof real.computePlan>[0], snapshot: RatesSnapshot, today: string) => {
      if (snapshot.rows.policy_rate?.value === POISON_POLICY_RATE && input === real.SAMPLE_PROFILES.familyWithDebt) throw new Error("retirementAge must be later than age");
      return real.computePlan(input, snapshot, today);
    }),
  };
});

const { computePlan } = await import("@taka/engine");
const { POST: login } = await import("../login/route");
const { PUT: putCountry } = await import("./country/route");
const { POST: publish } = await import("./publish/route");

const BASE = "http://localhost/api/admin";
const CSRF = { "content-type": "application/json", "x-requested-with": "taka-admin" };
const SRC = { sourceName: "Reserve Bank of India", sourceUrl: "https://www.rbi.org.in/", asOf: "2026-10-01" } as const;

function req(method: "PUT" | "POST", path: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`${BASE}/${path}`, { method, headers: { ...CSRF, ...headers }, body: JSON.stringify(body) });
}

async function signIn(): Promise<Record<string, string>> {
  const res = await login(req("POST", "login", { password: "test-pass-123456" }));
  expect(res.status).toBe(204);
  return { cookie: `${ADMIN_COOKIE}=${readCookie(res.headers.get("set-cookie")!.split(";")[0], ADMIN_COOKIE)}` };
}

let repo: FakeCountryRepo;
beforeEach(() => {
  repo = new FakeCountryRepo([FIXTURE_IN, FIXTURE_US]);
  setCountryRepoForTests(repo);
  setRatesRepoForTests(new FakeRatesRepo());
  vi.mocked(computePlan).mockClear();
});
afterEach(() => {
  setCountryRepoForTests(null);
  setRatesRepoForTests(null);
});

describe("POST /api/admin/countries/:code/publish runs the sample plans first", () => {
  it("400 INVALID_DRAFT naming the failing sample plan; nothing is published and the draft stays", async () => {
    const auth = await signIn();
    const poison: CountryField = { value: POISON_POLICY_RATE, status: "sourced", ...SRC };
    expect((await putCountry(req("PUT", "countries/IN", { field: "policy_rate", value: poison }, auth), "IN")).status).toBe(200);
    const res = await publish(req("POST", "countries/IN/publish", { note: "bad" }, auth), "IN");
    expect(res.status).toBe(400);
    const err = ((await res.json()) as { error: { code: string; message: string } }).error;
    expect(err.code).toBe("INVALID_DRAFT");
    expect(err.message).toMatch(/Sample plan "familyWithDebt" fails with this draft: retirementAge must be later than age/);
    expect(await repo.getPublishedVersion("IN")).toBe(1);
    expect((await repo.getDraft("IN"))?.profile.fields.policy_rate?.value).toBe(POISON_POLICY_RATE);
  });

  it("publishes once every sample plan computes, after running all three on the overlaid draft", async () => {
    const auth = await signIn();
    const fine: CountryField = { value: 0.055, status: "sourced", ...SRC };
    await putCountry(req("PUT", "countries/IN", { field: "policy_rate", value: fine }, auth), "IN");
    const res = await publish(req("POST", "countries/IN/publish", {}, auth), "IN");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ version: 2 });
    expect(vi.mocked(computePlan)).toHaveBeenCalledTimes(3);
    // The plans ran on the overlaid snapshot: the draft's policy rate, the country context set.
    const snapshot = vi.mocked(computePlan).mock.calls[0]![1];
    expect(snapshot.rows.policy_rate.value).toBe(0.055);
    expect(snapshot.country?.code).toBe("IN");
  });
});
