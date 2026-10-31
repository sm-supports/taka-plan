// In-memory CountryRepo with the same per-country draft/publish/change-log semantics as D1CountryRepo.
import { FIXTURE_IN, FIXTURE_US, assertCountryProfile, type CountryCode, type CountryField, type CountryProfile, type RateKey } from "@taka/engine";
import type { ChangeLogEntry } from "@/lib/server/db";
import type { CountryMetaPatch, CountryRepo, CountrySummary, StoredCountry } from "@/lib/server/country-repo";
import {
  CountryNotFoundError,
  NotADraftError,
  applyMetaPatch,
  assertCountryCode,
  cleanCountryField,
  countryUnits,
  isCountryFieldKey,
  metaDiff,
  metaOf,
  type CountryMeta,
} from "@/lib/server/country-db";

interface FakeVersion {
  version: number;
  status: "draft" | "published" | "superseded";
  createdAt: string;
  publishedAt: string | null;
  publishedBy: string | null;
  note: string | null;
  meta: CountryMeta;
  fields: CountryProfile["fields"];
}

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

export class FakeCountryRepo implements CountryRepo {
  /** country → version → row */
  private countries = new Map<CountryCode, Map<number, FakeVersion>>();
  private log: (ChangeLogEntry & { country: CountryCode })[] = [];
  private nextLogId = 1;

  /** Seeds each profile as published version 1 (defaults: FIXTURE_IN and FIXTURE_US). */
  constructor(profiles: readonly CountryProfile[] = [FIXTURE_IN, FIXTURE_US], now = "2026-10-30T00:00:00.000Z") {
    for (const p of profiles) {
      const valid = assertCountryProfile(clone(p), countryUnits());
      const fields: CountryProfile["fields"] = {};
      for (const [k, f] of Object.entries(valid.fields) as [RateKey, CountryField][]) fields[k] = cleanCountryField(p.code, k, f);
      this.countries.set(p.code, new Map([[1, { version: 1, status: "published", createdAt: now, publishedAt: now, publishedBy: "seed", note: null, meta: metaOf(valid), fields }]]));
    }
  }

  private versions(code: CountryCode): Map<number, FakeVersion> {
    assertCountryCode(code);
    let m = this.countries.get(code);
    if (!m) {
      m = new Map();
      this.countries.set(code, m);
    }
    return m;
  }

  private find(code: CountryCode, status: FakeVersion["status"]): FakeVersion | undefined {
    for (const v of this.versions(code).values()) if (v.status === status) return v;
    return undefined;
  }

  private stored(code: CountryCode, v: FakeVersion): StoredCountry {
    return { version: v.version, status: v.status === "draft" ? "draft" : "published", profile: clone({ ...v.meta, code, fields: v.fields }) };
  }

  private addLog(country: CountryCode, e: Omit<ChangeLogEntry, "id">): void {
    this.log.push({ id: this.nextLogId++, country, ...e });
  }

  async getPublished(code: CountryCode): Promise<StoredCountry | null> {
    const v = this.find(code, "published");
    return v ? this.stored(code, v) : null;
  }

  async getPublishedVersion(code: CountryCode): Promise<number | null> {
    return this.find(code, "published")?.version ?? null;
  }

  async getDraft(code: CountryCode): Promise<StoredCountry | null> {
    const v = this.find(code, "draft");
    return v ? this.stored(code, v) : null;
  }

  async ensureDraft(code: CountryCode, now: string): Promise<number> {
    const draft = this.find(code, "draft");
    if (draft) return draft.version;
    const published = this.find(code, "published");
    if (!published) throw new CountryNotFoundError(code);
    const next = Math.max(...this.versions(code).keys()) + 1;
    this.versions(code).set(next, { version: next, status: "draft", createdAt: now, publishedAt: null, publishedBy: null, note: null, meta: clone(published.meta), fields: clone(published.fields) });
    this.addLog(code, { at: now, actor: "admin", action: "create_draft", version: next, key: null, oldValue: null, newValue: null, note: `copied from v${published.version}` });
    return next;
  }

  async updateField(code: CountryCode, version: number, field: RateKey, value: CountryField, note: string | null, now: string): Promise<CountryField> {
    if (!isCountryFieldKey(field)) throw new Error(`"${String(field)}" is not a country field key`);
    const next = cleanCountryField(code, field, value);
    const v = this.versions(code).get(version);
    if (!v || v.status !== "draft") throw new NotADraftError(`${code} version ${version} is not a draft`);
    const old = v.fields[field];
    v.fields[field] = clone(next);
    this.addLog(code, { at: now, actor: "admin", action: "edit", version, key: field, oldValue: old ? JSON.stringify(old) : null, newValue: JSON.stringify(next), note });
    return clone(next);
  }

  async updateMeta(code: CountryCode, version: number, patch: CountryMetaPatch, note: string | null, now: string): Promise<CountryProfile> {
    const v = this.versions(code).get(version);
    if (!v || v.status !== "draft") throw new NotADraftError(`${code} version ${version} is not a draft`);
    const after = applyMetaPatch(v.meta, patch);
    const profile = assertCountryProfile(clone({ ...after, code, fields: v.fields }), countryUnits());
    const { old, next } = metaDiff(v.meta, after, patch);
    v.meta = metaOf(profile);
    this.addLog(code, { at: now, actor: "admin", action: "edit", version, key: "meta", oldValue: JSON.stringify(old), newValue: JSON.stringify(next), note });
    return clone(profile);
  }

  async publish(code: CountryCode, note: string | null, now: string, by: string): Promise<number> {
    const draft = this.find(code, "draft");
    if (!draft) throw new NotADraftError(`${code} has no draft to publish`);
    const published = this.find(code, "published");
    if (published) published.status = "superseded";
    draft.status = "published";
    draft.publishedAt = now;
    draft.publishedBy = by;
    draft.note = note;
    this.addLog(code, { at: now, actor: by, action: "publish", version: draft.version, key: null, oldValue: published ? String(published.version) : null, newValue: String(draft.version), note });
    return draft.version;
  }

  async discardDraft(code: CountryCode, now: string): Promise<void> {
    const draft = this.find(code, "draft");
    if (!draft) return;
    this.versions(code).delete(draft.version);
    this.addLog(code, { at: now, actor: "admin", action: "discard_draft", version: draft.version, key: null, oldValue: null, newValue: null, note: null });
  }

  async list(): Promise<CountrySummary[]> {
    const out: CountrySummary[] = [];
    for (const code of [...this.countries.keys()].sort()) {
      const published = this.find(code, "published");
      const draft = this.find(code, "draft");
      if (!published && !draft) continue;
      const statuses = Object.values(published?.fields ?? {}).map((f) => f!.status);
      out.push({
        code,
        publishedVersion: published?.version ?? null,
        hasDraft: draft !== undefined,
        sourced: statuses.filter((s) => s === "sourced").length,
        assumption: statuses.filter((s) => s === "assumption").length,
        missing: statuses.filter((s) => s === "missing").length,
      });
    }
    return out;
  }

  async changeLog(code: CountryCode | null, limit = 50, before?: number): Promise<ChangeLogEntry[]> {
    if (code !== null) assertCountryCode(code);
    return this.log
      .filter((e) => (code === null || e.country === code) && (before === undefined || e.id < before))
      .sort((a, b) => b.id - a.id)
      .slice(0, limit)
      .map(({ country: _country, ...e }) => ({ ...e }));
  }
}

/** A CountryRepo whose every method rejects, for exercising the 503 paths. */
export class ThrowingCountryRepo implements CountryRepo {
  constructor(private readonly error: Error = new Error("D1_ERROR: simulated failure")) {}
  private fail<T>(): Promise<T> {
    return Promise.reject(this.error);
  }
  getPublished(): Promise<StoredCountry | null> {
    return this.fail();
  }
  getPublishedVersion(): Promise<number | null> {
    return this.fail();
  }
  getDraft(): Promise<StoredCountry | null> {
    return this.fail();
  }
  ensureDraft(): Promise<number> {
    return this.fail();
  }
  updateField(): Promise<CountryField> {
    return this.fail();
  }
  updateMeta(): Promise<CountryProfile> {
    return this.fail();
  }
  publish(): Promise<number> {
    return this.fail();
  }
  discardDraft(): Promise<void> {
    return this.fail();
  }
  list(): Promise<CountrySummary[]> {
    return this.fail();
  }
  changeLog(): Promise<ChangeLogEntry[]> {
    return this.fail();
  }
}
