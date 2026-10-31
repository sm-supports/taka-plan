// Country repository over Cloudflare D1 (migrations/0004_countries.sql): one draft/publish cycle per
// country, ~60 field rows per country version, change log rows tagged with the country code.
//
// Written in the style of D1RatesRepo (lib/server/db.ts): every statement is parameterised (the only
// template pieces are fixed column lists and literal status strings), every mutation is a single
// `db.batch` (one D1 transaction), and each statement guards on the state it expects, so concurrent
// calls converge instead of double-creating a draft, publishing twice or logging a change that did
// not happen. Every query is scoped to one country (Free plan: 10 ms CPU per request).
import {
  COUNTRY_FIELD_KEYS,
  RATES_SEED,
  assertCountryField,
  assertCountryProfile,
  unitsFrom,
  type CountryCode,
  type CountryField,
  type CountryProfile,
  type RateKey,
  type RateUnit,
} from "@taka/engine";
import type { ChangeLogEntry, D1Like, D1ResultLike } from "./db";
import type { CountryMetaPatch, CountryRepo, CountrySummary, StoredCountry } from "./country-repo";
import { META_PATCH_KEYS, assertFieldLimits, pickJsonShape, todayUtc } from "./country-clean";

export { META_PATCH_KEYS };

/** Thrown when a country has neither a published version nor (where relevant) a draft. */
export class CountryNotFoundError extends Error {
  constructor(readonly code: string) {
    super(`No published version for country ${code}`);
    this.name = "CountryNotFoundError";
  }
}

/** Thrown when an edit, publish or discard names a version that is not (or no longer) the country's draft. */
export class NotADraftError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotADraftError";
  }
}

const CC = /^[A-Z]{2}$/;
const FIELD_KEY_SET: ReadonlySet<string> = new Set(COUNTRY_FIELD_KEYS);
const MAX_LOG_PAGE = 500;

let units: Record<RateKey, RateUnit> | null = null;
/** Unit of every rate key, from the bundled seed (computed once per isolate). */
export function countryUnits(): Record<RateKey, RateUnit> {
  units ??= unitsFrom(RATES_SEED.rows as Record<string, { unit: RateUnit }>);
  return units;
}

export function assertCountryCode(code: unknown): asserts code is CountryCode {
  if (typeof code !== "string" || !CC.test(code)) throw new Error(`Invalid country code ${JSON.stringify(code)}`);
}

export function isCountryFieldKey(key: unknown): key is RateKey {
  return typeof key === "string" && FIELD_KEY_SET.has(key);
}

/**
 * Validates one figure for `code`/`key` and returns a clean copy holding only CountryField properties
 * (`valueJson` and `note` only when set), so stray properties never reach the database or the log.
 * On top of the engine validator: source and note length caps, a real `asOf` at most a year ahead
 * (country-clean.ts), and JSON values reduced to the keys their shape knows.
 */
export function cleanCountryField(code: CountryCode, key: RateKey, raw: unknown, today: string = todayUtc()): CountryField {
  if (!isCountryFieldKey(key)) throw new Error(`"${String(key)}" is not a country field key`);
  const unit = countryUnits()[key];
  const f = assertCountryField(code, key, unit, raw);
  assertFieldLimits(`fields.${key}`, f, today);
  const live = f.status !== "missing";
  const out: CountryField = {
    value: live && unit !== "json" && typeof f.value === "number" ? f.value : null,
    status: f.status,
    sourceName: f.sourceName,
    sourceUrl: f.sourceUrl,
    asOf: f.asOf,
  };
  if (live && unit === "json" && f.valueJson !== undefined && f.valueJson !== null) out.valueJson = pickJsonShape(key, f.valueJson);
  if (typeof f.note === "string" && f.note.length > 0) out.note = f.note;
  if (f.status === "missing" && f.absent === true) out.absent = true;
  return out;
}

/** The meta JSON stored in `country_versions.meta`: the profile without `fields`. */
export type CountryMeta = Omit<CountryProfile, "fields">;

export function metaOf(p: CountryProfile): CountryMeta {
  const { fields: _fields, ...meta } = p;
  return meta;
}

/** Shallow merge of a meta patch (undefined entries ignored; only META_PATCH_KEYS). */
export function applyMetaPatch(meta: CountryMeta, patch: CountryMetaPatch): CountryMeta {
  const out = { ...meta } as Record<string, unknown>;
  for (const k of META_PATCH_KEYS) if (patch[k] !== undefined) out[k] = patch[k];
  return out as CountryMeta;
}

/** Old and new values of just the patched meta keys, for the change log. */
export function metaDiff(before: CountryMeta, after: CountryMeta, patch: CountryMetaPatch): { old: Record<string, unknown>; next: Record<string, unknown> } {
  const old: Record<string, unknown> = {};
  const next: Record<string, unknown> = {};
  for (const k of META_PATCH_KEYS) {
    if (patch[k] === undefined) continue;
    old[k] = before[k];
    next[k] = after[k];
  }
  return { old, next };
}

/** Column shape of `country_versions`. */
interface VersionDbRow {
  country: string;
  version: number;
  status: "draft" | "published" | "superseded";
  created_at: string;
  published_at: string | null;
  published_by: string | null;
  note: string | null;
  meta: string;
}

/** Column shape of `country_fields`. */
export interface FieldDbRow {
  country: string;
  version: number;
  field: string;
  value: number | null;
  value_json: string | null;
  status: CountryField["status"];
  source_name: string;
  source_url: string;
  as_of: string;
  note: string | null;
  absent?: number | null;
}

interface LogDbRow {
  id: number;
  at: string;
  actor: string;
  action: ChangeLogEntry["action"];
  version: number;
  key: string | null;
  old_value: string | null;
  new_value: string | null;
  note: string | null;
}

interface SummaryDbRow {
  country: string;
  published_version: number | null;
  has_draft: number;
  sourced: number | null;
  assumption: number | null;
  missing: number | null;
}

const VERSION_COLUMNS = "country, version, status, created_at, published_at, published_by, note, meta";
export const FIELD_COLUMNS = "country, version, field, value, value_json, status, source_name, source_url, as_of, note, absent";
const LOG_COLUMNS = "id, at, actor, action, version, key, old_value, new_value, note";
const LOG_INSERT_COLUMNS = "at, actor, action, version, key, old_value, new_value, note, country";

const SQL = {
  versionByStatus: `SELECT ${VERSION_COLUMNS} FROM country_versions WHERE country = ? AND status = ?`,
  versionNumberByStatus: "SELECT version FROM country_versions WHERE country = ? AND status = ?",
  versionByNumber: `SELECT ${VERSION_COLUMNS} FROM country_versions WHERE country = ? AND version = ?`,
  fieldsForVersion: `SELECT ${FIELD_COLUMNS} FROM country_fields WHERE country = ? AND version = ? ORDER BY field`,
  fieldForVersionKey: `SELECT ${FIELD_COLUMNS} FROM country_fields WHERE country = ? AND version = ? AND field = ?`,
  // ensureDraft: all three statements are no-ops once this country has a draft, so the batch is
  // idempotent and safe against two admins (or two tabs) creating the same country's draft at once.
  // The draft number is MAX(version) + 1 for this country only; it copies the published meta.
  insertDraftVersion: `INSERT INTO country_versions (country, version, status, created_at, meta)
    SELECT p.country, n.next, 'draft', ?, p.meta
    FROM country_versions p, (SELECT COALESCE(MAX(version), 0) + 1 AS next FROM country_versions WHERE country = ?) n
    WHERE p.country = ? AND p.status = 'published'
      AND NOT EXISTS (SELECT 1 FROM country_versions WHERE country = ? AND status = 'draft')`,
  copyPublishedFieldsToDraft: `INSERT INTO country_fields (${FIELD_COLUMNS})
    SELECT f.country, d.version, f.field, f.value, f.value_json, f.status, f.source_name, f.source_url, f.as_of, f.note, f.absent
    FROM country_fields f, country_versions p, country_versions d
    WHERE p.country = ? AND p.status = 'published'
      AND d.country = p.country AND d.status = 'draft'
      AND f.country = p.country AND f.version = p.version
      AND NOT EXISTS (SELECT 1 FROM country_fields x WHERE x.country = d.country AND x.version = d.version)`,
  logDraftCreated: `INSERT INTO change_log (${LOG_INSERT_COLUMNS})
    SELECT ?, 'admin', 'create_draft', d.version, NULL, NULL, NULL, 'copied from v' || p.version, d.country
    FROM country_versions d, country_versions p
    WHERE d.country = ? AND d.status = 'draft' AND p.country = d.country AND p.status = 'published'
      AND NOT EXISTS (SELECT 1 FROM change_log l WHERE l.country = d.country AND l.action = 'create_draft' AND l.version = d.version)`,
  // updateField: insert-or-replace one field row, only while the version is still this country's draft.
  upsertDraftField: `INSERT INTO country_fields (${FIELD_COLUMNS})
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    WHERE EXISTS (SELECT 1 FROM country_versions v WHERE v.country = ? AND v.version = ? AND v.status = 'draft')
    ON CONFLICT (country, version, field) DO UPDATE SET
      value = excluded.value, value_json = excluded.value_json, status = excluded.status,
      source_name = excluded.source_name, source_url = excluded.source_url, as_of = excluded.as_of, note = excluded.note,
      absent = excluded.absent`,
  updateDraftMeta: "UPDATE country_versions SET meta = ? WHERE country = ? AND version = ? AND status = 'draft'",
  logIfDraft: `INSERT INTO change_log (${LOG_INSERT_COLUMNS})
    SELECT ?, 'admin', 'edit', ?, ?, ?, ?, ?, ?
    WHERE EXISTS (SELECT 1 FROM country_versions WHERE country = ? AND version = ? AND status = 'draft')`,
  // publish: supersede this country's published version only when the named draft still exists,
  // then promote it, then log — the log is skipped when the promotion did not happen.
  supersedePublished: `UPDATE country_versions SET status = 'superseded'
    WHERE country = ? AND status = 'published'
      AND EXISTS (SELECT 1 FROM country_versions WHERE country = ? AND version = ? AND status = 'draft')`,
  promoteDraft: `UPDATE country_versions SET status = 'published', published_at = ?, published_by = ?, note = ?
    WHERE country = ? AND version = ? AND status = 'draft'`,
  logIfPublished: `INSERT INTO change_log (${LOG_INSERT_COLUMNS})
    SELECT ?, ?, 'publish', ?, NULL, ?, ?, ?, ?
    WHERE EXISTS (SELECT 1 FROM country_versions WHERE country = ? AND version = ? AND status = 'published')`,
  // discardDraft: delete fields and version only while it is still a draft; log only if it is gone.
  deleteDraftFields: `DELETE FROM country_fields
    WHERE country = ? AND version = ?
      AND EXISTS (SELECT 1 FROM country_versions v WHERE v.country = country_fields.country AND v.version = country_fields.version AND v.status = 'draft')`,
  deleteDraftVersion: "DELETE FROM country_versions WHERE country = ? AND version = ? AND status = 'draft'",
  logIfGone: `INSERT INTO change_log (${LOG_INSERT_COLUMNS})
    SELECT ?, 'admin', 'discard_draft', ?, NULL, NULL, NULL, NULL, ?
    WHERE NOT EXISTS (SELECT 1 FROM country_versions WHERE country = ? AND version = ?)`,
  // list: one pass over live versions; only the published version's fields join in (by primary-key prefix).
  summary: `SELECT v.country AS country,
      MAX(CASE WHEN v.status = 'published' THEN v.version END) AS published_version,
      MAX(CASE WHEN v.status = 'draft' THEN 1 ELSE 0 END) AS has_draft,
      SUM(CASE WHEN f.status = 'sourced' THEN 1 ELSE 0 END) AS sourced,
      SUM(CASE WHEN f.status = 'assumption' THEN 1 ELSE 0 END) AS assumption,
      SUM(CASE WHEN f.status = 'missing' THEN 1 ELSE 0 END) AS missing
    FROM country_versions v
    LEFT JOIN country_fields f ON v.status = 'published' AND f.country = v.country AND f.version = v.version
    WHERE v.status IN ('published', 'draft')
    GROUP BY v.country
    ORDER BY v.country`,
  changeLogCountry: `SELECT ${LOG_COLUMNS} FROM change_log WHERE country = ? ORDER BY id DESC LIMIT ?`,
  changeLogCountryBefore: `SELECT ${LOG_COLUMNS} FROM change_log WHERE country = ? AND id < ? ORDER BY id DESC LIMIT ?`,
  changeLogAll: `SELECT ${LOG_COLUMNS} FROM change_log WHERE country IS NOT NULL ORDER BY id DESC LIMIT ?`,
  changeLogAllBefore: `SELECT ${LOG_COLUMNS} FROM change_log WHERE country IS NOT NULL AND id < ? ORDER BY id DESC LIMIT ?`,
} as const;

/** snake_case DB row → CountryField. NULL columns become absent optional fields. */
export function fieldFromDb(r: FieldDbRow): CountryField {
  const f: CountryField = {
    value: r.value === null || r.value === undefined ? null : Number(r.value),
    status: r.status,
    sourceName: r.source_name,
    sourceUrl: r.source_url,
    asOf: r.as_of,
  };
  if (r.value_json !== null && r.value_json !== undefined) f.valueJson = JSON.parse(r.value_json) as unknown;
  if (r.note !== null && r.note !== undefined) f.note = r.note;
  if (Number(r.absent) === 1) f.absent = true;
  return f;
}

/** CountryField → bind values in FIELD_COLUMNS order. */
export function fieldToBind(code: CountryCode, version: number, key: RateKey, f: CountryField): unknown[] {
  return [
    code,
    version,
    key,
    typeof f.value === "number" ? f.value : null,
    f.valueJson === undefined || f.valueJson === null ? null : JSON.stringify(f.valueJson),
    f.status,
    f.sourceName,
    f.sourceUrl,
    f.asOf,
    f.note ?? null,
    f.status === "missing" && f.absent === true ? 1 : 0,
  ];
}

function assertVersionNumber(version: number): void {
  if (!Number.isInteger(version) || version < 1) throw new Error(`Invalid version ${String(version)}`);
}

/** Rows changed by a batch statement, or null when the binding did not report it. */
function changesOf(result: D1ResultLike | undefined): number | null {
  const n = result?.meta?.changes;
  return typeof n === "number" ? n : null;
}

function logPageSize(limit: number): number {
  return Number.isInteger(limit) ? Math.min(Math.max(limit, 1), MAX_LOG_PAGE) : 50;
}

function logFromDb(r: LogDbRow): ChangeLogEntry {
  return {
    id: r.id,
    at: r.at,
    actor: r.actor,
    action: r.action,
    version: r.version,
    key: r.key ?? null,
    oldValue: r.old_value ?? null,
    newValue: r.new_value ?? null,
    note: r.note ?? null,
  };
}

export class D1CountryRepo implements CountryRepo {
  constructor(private readonly db: D1Like) {}

  private versionByStatus(code: CountryCode, status: "draft" | "published"): Promise<VersionDbRow | null> {
    return this.db.prepare(SQL.versionByStatus).bind(code, status).first<VersionDbRow>();
  }

  private versionByNumber(code: CountryCode, version: number): Promise<VersionDbRow | null> {
    return this.db.prepare(SQL.versionByNumber).bind(code, version).first<VersionDbRow>();
  }

  private async fieldsFor(code: CountryCode, version: number): Promise<CountryProfile["fields"]> {
    const { results } = await this.db.prepare(SQL.fieldsForVersion).bind(code, version).all<FieldDbRow>();
    const fields: CountryProfile["fields"] = {};
    for (const r of results) if (isCountryFieldKey(r.field)) fields[r.field] = fieldFromDb(r);
    return fields;
  }

  private async stored(v: VersionDbRow): Promise<StoredCountry> {
    const meta = JSON.parse(v.meta) as CountryMeta;
    const fields = await this.fieldsFor(v.country, v.version);
    return { version: v.version, status: v.status === "draft" ? "draft" : "published", profile: { ...meta, code: v.country, fields } };
  }

  async getPublished(code: CountryCode): Promise<StoredCountry | null> {
    assertCountryCode(code);
    const v = await this.versionByStatus(code, "published");
    return v ? this.stored(v) : null;
  }

  async getPublishedVersion(code: CountryCode): Promise<number | null> {
    assertCountryCode(code);
    const row = await this.db.prepare(SQL.versionNumberByStatus).bind(code, "published").first<{ version: number }>();
    return row ? Number(row.version) : null;
  }

  async getDraft(code: CountryCode): Promise<StoredCountry | null> {
    assertCountryCode(code);
    const v = await this.versionByStatus(code, "draft");
    return v ? this.stored(v) : null;
  }

  async ensureDraft(code: CountryCode, now: string): Promise<number> {
    assertCountryCode(code);
    const existing = await this.db.prepare(SQL.versionNumberByStatus).bind(code, "draft").first<{ version: number }>();
    if (existing) return Number(existing.version);
    // One transaction; every statement is a no-op once the draft exists, so a concurrent call
    // converges on the same draft instead of violating the one-draft-per-country index.
    await this.db.batch([
      this.db.prepare(SQL.insertDraftVersion).bind(now, code, code, code),
      this.db.prepare(SQL.copyPublishedFieldsToDraft).bind(code),
      this.db.prepare(SQL.logDraftCreated).bind(now, code),
    ]);
    const draft = await this.db.prepare(SQL.versionNumberByStatus).bind(code, "draft").first<{ version: number }>();
    if (!draft) throw new CountryNotFoundError(code);
    return Number(draft.version);
  }

  async updateField(code: CountryCode, version: number, field: RateKey, value: CountryField, note: string | null, now: string): Promise<CountryField> {
    assertCountryCode(code);
    assertVersionNumber(version);
    if (!isCountryFieldKey(field)) throw new Error(`"${String(field)}" is not a country field key`);
    const next = cleanCountryField(code, field, value);
    const v = await this.versionByNumber(code, version);
    if (!v || v.status !== "draft") throw new NotADraftError(`${code} version ${version} is not a draft`);
    const old = await this.db.prepare(SQL.fieldForVersionKey).bind(code, version, field).first<FieldDbRow>();
    const oldJson = old ? JSON.stringify(fieldFromDb(old)) : null;
    const results = await this.db.batch([
      this.db.prepare(SQL.upsertDraftField).bind(...fieldToBind(code, version, field, next), code, version),
      this.db.prepare(SQL.logIfDraft).bind(now, version, field, oldJson, JSON.stringify(next), note, code, code, version),
    ]);
    if (changesOf(results[0]) === 0) throw new NotADraftError(`${code} version ${version} is not a draft`);
    return next;
  }

  async updateMeta(code: CountryCode, version: number, patch: CountryMetaPatch, note: string | null, now: string): Promise<CountryProfile> {
    assertCountryCode(code);
    assertVersionNumber(version);
    const v = await this.versionByNumber(code, version);
    if (!v || v.status !== "draft") throw new NotADraftError(`${code} version ${version} is not a draft`);
    const before = JSON.parse(v.meta) as CountryMeta;
    const after = applyMetaPatch(before, patch);
    const fields = await this.fieldsFor(code, version);
    const profile = assertCountryProfile({ ...after, code, fields }, countryUnits());
    const { old, next } = metaDiff(before, after, patch);
    const results = await this.db.batch([
      this.db.prepare(SQL.updateDraftMeta).bind(JSON.stringify(metaOf(profile)), code, version),
      this.db.prepare(SQL.logIfDraft).bind(now, version, "meta", JSON.stringify(old), JSON.stringify(next), note, code, code, version),
    ]);
    if (changesOf(results[0]) === 0) throw new NotADraftError(`${code} version ${version} is not a draft`);
    return profile;
  }

  async publish(code: CountryCode, note: string | null, now: string, by: string): Promise<number> {
    assertCountryCode(code);
    const draft = await this.db.prepare(SQL.versionNumberByStatus).bind(code, "draft").first<{ version: number }>();
    if (!draft) throw new NotADraftError(`${code} has no draft to publish`);
    const published = await this.db.prepare(SQL.versionNumberByStatus).bind(code, "published").first<{ version: number }>();
    const d = Number(draft.version);
    const results = await this.db.batch([
      this.db.prepare(SQL.supersedePublished).bind(code, code, d),
      this.db.prepare(SQL.promoteDraft).bind(now, by, note, code, d),
      this.db.prepare(SQL.logIfPublished).bind(now, by, d, published ? String(published.version) : null, String(d), note, code, code, d),
    ]);
    if (changesOf(results[1]) === 0) throw new NotADraftError(`${code} has no draft to publish`);
    return d;
  }

  async discardDraft(code: CountryCode, now: string): Promise<void> {
    assertCountryCode(code);
    const draft = await this.db.prepare(SQL.versionNumberByStatus).bind(code, "draft").first<{ version: number }>();
    if (!draft) return;
    const d = Number(draft.version);
    await this.db.batch([
      this.db.prepare(SQL.deleteDraftFields).bind(code, d),
      this.db.prepare(SQL.deleteDraftVersion).bind(code, d),
      this.db.prepare(SQL.logIfGone).bind(now, d, code, code, d),
    ]);
  }

  async list(): Promise<CountrySummary[]> {
    const { results } = await this.db.prepare(SQL.summary).all<SummaryDbRow>();
    return results.map((r) => ({
      code: r.country,
      publishedVersion: r.published_version === null || r.published_version === undefined ? null : Number(r.published_version),
      hasDraft: Number(r.has_draft) === 1,
      sourced: Number(r.sourced ?? 0),
      assumption: Number(r.assumption ?? 0),
      missing: Number(r.missing ?? 0),
    }));
  }

  async changeLog(code: CountryCode | null, limit = 50, before?: number): Promise<ChangeLogEntry[]> {
    if (code !== null) assertCountryCode(code);
    const n = logPageSize(limit);
    const paged = before !== undefined && Number.isInteger(before);
    const stmt =
      code === null
        ? paged
          ? this.db.prepare(SQL.changeLogAllBefore).bind(before, n)
          : this.db.prepare(SQL.changeLogAll).bind(n)
        : paged
          ? this.db.prepare(SQL.changeLogCountryBefore).bind(code, before, n)
          : this.db.prepare(SQL.changeLogCountry).bind(code, n);
    const { results } = await stmt.all<LogDbRow>();
    return results.map(logFromDb);
  }
}

/**
 * Statements that insert `profiles` as published version 1 (for tests and seed tooling): one
 * country_versions row plus one country_fields row per field, each country in its own batch.
 */
export async function insertPublishedCountries(db: D1Like, profiles: readonly CountryProfile[], now = "2026-10-30T00:00:00.000Z", version = 1): Promise<void> {
  for (const p of profiles) {
    assertCountryProfile(p, countryUnits());
    const stmts = [
      db.prepare(`INSERT INTO country_versions (${VERSION_COLUMNS}) VALUES (?, ?, 'published', ?, ?, 'seed', NULL, ?)`).bind(p.code, version, now, now, JSON.stringify(metaOf(p))),
      ...(Object.entries(p.fields) as [RateKey, CountryField][]).map(([k, f]) =>
        db.prepare(`INSERT INTO country_fields (${FIELD_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(...fieldToBind(p.code, version, k, cleanCountryField(p.code, k, f))),
      ),
    ];
    await db.batch(stmts);
  }
}
