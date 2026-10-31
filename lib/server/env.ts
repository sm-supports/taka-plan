// Bindings arrive on the Pages Functions context; functions/api/_middleware.ts calls bindEnv() per request.
import { D1CountryRepo } from "./country-db";
import type { CountryRepo } from "./country-repo";
import { D1RatesRepo, type D1Like, type RatesRepo } from "./db";

export interface TakaEnv {
  DB?: D1Like;
  ADMIN_PASSWORD?: string;
  /** Optional HMAC key for admin session cookies (at least 32 characters); without it the key is derived from ADMIN_PASSWORD. */
  SESSION_SECRET?: string;
}

let current: TakaEnv = {};
export function bindEnv(env: TakaEnv): void {
  current = env;
}
export function getEnv(): TakaEnv {
  return current;
}

let override: RatesRepo | null = null;
export function setRatesRepoForTests(repo: RatesRepo | null): void {
  override = repo;
}
export function getRatesRepo(): RatesRepo {
  return override ?? new D1RatesRepo(getEnv().DB as D1Like);
}

let countryOverride: CountryRepo | null = null;
export function setCountryRepoForTests(repo: CountryRepo | null): void {
  countryOverride = repo;
}
export function getCountryRepo(): CountryRepo {
  return countryOverride ?? new D1CountryRepo(getEnv().DB as D1Like);
}

export function getAdminPassword(): string | undefined {
  const p = getEnv().ADMIN_PASSWORD;
  return p && p.length > 0 ? p : undefined;
}

export function getSessionSecret(): string | undefined {
  const s = getEnv().SESSION_SECRET;
  return s && s.length > 0 ? s : undefined;
}
