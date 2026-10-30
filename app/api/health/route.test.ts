import { afterEach, describe, expect, it } from "vitest";
import { setRatesRepoForTests } from "@/lib/server/env";
import { FakeRatesRepo } from "@/test/fakes/fakeRatesRepo";
import { ThrowingRatesRepo, missingTableError } from "@/test/fakes/throwingRatesRepo";
import { GET, type HealthBody } from "./route";

afterEach(() => setRatesRepoForTests(null));

describe("GET /api/health", () => {
  it("reports db ok, the published version and ratesSource d1 with a healthy repo", async () => {
    setRatesRepoForTests(new FakeRatesRepo());
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = (await res.json()) as HealthBody;
    expect(body).toEqual({ ok: true, db: "ok", publishedVersion: 1, ratesSource: "d1" });
  });

  it("reports db error and ratesSource fallback when the repo throws, staying ok (liveness)", async () => {
    setRatesRepoForTests(new ThrowingRatesRepo());
    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as HealthBody;
    expect(body.ok).toBe(true);
    expect(body.db).toBe("error");
    expect(body.publishedVersion).toBeNull();
    expect(body.ratesSource).toBe("fallback");
    expect(body.detail).toMatch(/simulated failure/);
  });

  it("reports missing-table when the database is not migrated", async () => {
    setRatesRepoForTests(new ThrowingRatesRepo(missingTableError()));
    const body = (await (await GET()).json()) as HealthBody;
    expect(body).toMatchObject({ ok: true, db: "missing-table", publishedVersion: null, ratesSource: "fallback" });
  });

  it("reports db ok but no published version (fallback) on a migrated, empty table", async () => {
    const empty = new FakeRatesRepo();
    await empty.ensureDraft("2026-11-01T00:00:00.000Z");
    // Strip the published version to mimic a migrated table whose seed was removed.
    empty.getPublished = async () => {
      const { NoPublishedVersionError } = await import("@/lib/server/db");
      throw new NoPublishedVersionError();
    };
    setRatesRepoForTests(empty);
    const body = (await (await GET()).json()) as HealthBody;
    expect(body).toMatchObject({ ok: true, db: "ok", publishedVersion: null, ratesSource: "fallback" });
  });

  it("reports error when no repo is configured (D1 binding missing)", async () => {
    setRatesRepoForTests(null);
    const body = (await (await GET()).json()) as HealthBody;
    expect(body).toMatchObject({ ok: true, db: "error", publishedVersion: null, ratesSource: "fallback" });
  });
});
