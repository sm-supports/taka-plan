// The only file that touches `cloudflare:workers`. Tests swap the repo via setRatesRepoForTests.
import { env } from "cloudflare:workers";
import { D1RatesRepo, type RatesRepo } from "./db";

interface TakaEnv {
  DB: D1Database;
  ADMIN_PASSWORD?: string;
}

export function getEnv(): TakaEnv {
  return env as unknown as TakaEnv;
}

let override: RatesRepo | null = null;

/** Inject an in-memory repo for route-handler tests; pass null to restore D1. */
export function setRatesRepoForTests(repo: RatesRepo | null): void {
  override = repo;
}

export function getRatesRepo(): RatesRepo {
  return override ?? new D1RatesRepo(getEnv().DB);
}

export function getAdminPassword(): string | undefined {
  const p = getEnv().ADMIN_PASSWORD;
  return p && p.length > 0 ? p : undefined;
}
