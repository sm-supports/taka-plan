// Rates repository over Cloudflare D1: versioned rows, one draft at a time, change log.
//
// Every statement below is written against migrations/0001_schema.sql and is fully
// parameterised (no interpolated values; the only template pieces are the fixed column list
// and a fixed set of literal status strings). Mutations run as a single `db.batch`, which D1
// executes as one transaction, and each statement guards on the state it expects so that a
// concurrent call cannot double-create a draft, publish twice, or log a change that did not happen.
import { RATE_KEYS, isRateKey, type RateKey, type RateRow, type RatesSnapshot } from "@taka/engine";

export interface ChangeLogEntry {
  id: number;
  at: string;
  actor: string;
  action: "create_draft" | "edit" | "publish" | "discard_draft";
  version: number;
  key: string | null;
  oldValue: string | null;
  newValue: string | null;
  note: string | null;
}

export type RatePatch = Partial<Pick<RateRow, "value" | "valueJson" | "rangeLow" | "rangeHigh" | "labelEn" | "labelBn" | "sourceName" | "sourceUrl" | "asOf" | "reviewedBy" | "nextReview" | "note">>;

export interface RatesRepo {
  /** The published snapshot; throws when the table is empty. */
  getPublished(): Promise<RatesSnapshot>;
  getDraft(): Promise<RatesSnapshot | null>;
  getVersionRows(version: number): Promise<RatesSnapshot | null>;
  /** Returns the draft version, creating N+1 (copied from published) when absent. */
  ensureDraft(now: string): Promise<number>;
  /** Edits one draft row and logs old/new JSON. */
  updateRow(version: number, key: RateKey, patch: RatePatch, note: string | null, now: string): Promise<RateRow>;
  /** Supersedes the published version and publishes the draft; returns the new version. */
  publish(note: string | null, now: string, by: string): Promise<number>;
  discardDraft(now: string): Promise<void>;
  changeLog(limit?: number, before?: number): Promise<ChangeLogEntry[]>;
}

/** Thrown by `getPublished` when the table is reachable but holds no published version. */
export class NoPublishedVersionError extends Error {
  constructor() {
    super("No published rates version");
    this.name = "NoPublishedVersionError";
  }
}

/** Minimal structural view of the D1 binding, so this file type-checks without the Workers globals. */
export interface D1Like {
  prepare(query: string): D1StatementLike;
  batch(statements: D1StatementLike[]): Promise<D1ResultLike[]>;
}
export interface D1StatementLike {
  bind(...values: unknown[]): D1StatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<D1ResultLike>;
}
/** The part of a D1 write result we read back (row counts); everything else is ignored. */
export interface D1ResultLike {
  success?: boolean;
  meta?: { changes?: number };
}

/** Column shape of the `rates` table. */
interface RateDbRow {
  version: number;
  key: string;
  value: number | null;
  value_json: string | null;
  unit: RateRow["unit"];
  range_low: number | null;
  range_high: number | null;
  label_en: string;
  label_bn: string | null;
  source_name: string;
  source_url: string;
  as_of: string;
  reviewed_by: string;
  next_review: string;
  note: string | null;
  is_app_assumption: number;
}

interface VersionDbRow {
  version: number;
  status: "draft" | "published" | "superseded";
  created_at: string;
  published_at: string | null;
  published_by: string | null;
  note: string | null;
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

const RATE_COLUMNS = "version, key, value, value_json, unit, range_low, range_high, label_en, label_bn, source_name, source_url, as_of, reviewed_by, next_review, note, is_app_assumption";
const VERSION_COLUMNS = "version, status, created_at, published_at, published_by, note";
const LOG_COLUMNS = "id, at, actor, action, version, key, old_value, new_value, note";

const SQL = {
  versionByStatus: `SELECT ${VERSION_COLUMNS} FROM rate_versions WHERE status = ?`,
  versionByNumber: `SELECT ${VERSION_COLUMNS} FROM rate_versions WHERE version = ?`,
  rowsForVersion: `SELECT ${RATE_COLUMNS} FROM rates WHERE version = ? ORDER BY key`,
  rowForVersionKey: `SELECT ${RATE_COLUMNS} FROM rates WHERE version = ? AND key = ?`,
  // ensureDraft: all three statements are no-ops once a draft exists, so the batch is idempotent
  // and safe against two admins (or two tabs) creating a draft at the same moment.
  // (The MAX() sits in a subquery: an aggregate without GROUP BY always yields one row, so a WHERE
  // on the outer SELECT is the only way to make the insert conditional.)
  insertDraftVersion: `INSERT INTO rate_versions (version, status, created_at)
    SELECT n.next, 'draft', ? FROM (SELECT COALESCE(MAX(version), 0) + 1 AS next FROM rate_versions) n
    WHERE EXISTS (SELECT 1 FROM rate_versions WHERE status = 'published')
      AND NOT EXISTS (SELECT 1 FROM rate_versions WHERE status = 'draft')`,
  copyPublishedRowsToDraft: `INSERT INTO rates (${RATE_COLUMNS})
    SELECT d.version, r.key, r.value, r.value_json, r.unit, r.range_low, r.range_high, r.label_en, r.label_bn, r.source_name, r.source_url, r.as_of, r.reviewed_by, r.next_review, r.note, r.is_app_assumption
    FROM rates r, rate_versions d
    WHERE d.status = 'draft'
      AND r.version = (SELECT version FROM rate_versions WHERE status = 'published')
      AND NOT EXISTS (SELECT 1 FROM rates x WHERE x.version = d.version)`,
  logDraftCreated: `INSERT INTO change_log (at, actor, action, version, key, old_value, new_value, note)
    SELECT ?, 'admin', 'create_draft', d.version, NULL, NULL, NULL, 'copied from v' || p.version
    FROM rate_versions d, rate_versions p
    WHERE d.status = 'draft' AND p.status = 'published'
      AND NOT EXISTS (SELECT 1 FROM change_log l WHERE l.action = 'create_draft' AND l.version = d.version)`,
  // updateRow: only rows of a version that is still a draft can change (published versions are immutable).
  updateDraftRow: `UPDATE rates SET value = ?, value_json = ?, range_low = ?, range_high = ?, label_en = ?, label_bn = ?, source_name = ?, source_url = ?, as_of = ?, reviewed_by = ?, next_review = ?, note = ?
    WHERE version = ? AND key = ?
      AND EXISTS (SELECT 1 FROM rate_versions v WHERE v.version = rates.version AND v.status = 'draft')`,
  logIfDraft: `INSERT INTO change_log (at, actor, action, version, key, old_value, new_value, note)
    SELECT ?, ?, ?, ?, ?, ?, ?, ?
    WHERE EXISTS (SELECT 1 FROM rate_versions WHERE version = ? AND status = 'draft')`,
  // publish: supersede the current published version only when the named draft still exists,
  // then promote that draft, then log — the log is skipped when the promotion did not happen.
  supersedePublished: `UPDATE rate_versions SET status = 'superseded'
    WHERE status = 'published'
      AND EXISTS (SELECT 1 FROM rate_versions WHERE version = ? AND status = 'draft')`,
  promoteDraft: `UPDATE rate_versions SET status = 'published', published_at = ?, published_by = ?, note = ?
    WHERE version = ? AND status = 'draft'`,
  logIfPublished: `INSERT INTO change_log (at, actor, action, version, key, old_value, new_value, note)
    SELECT ?, ?, 'publish', ?, NULL, ?, ?, ?
    WHERE EXISTS (SELECT 1 FROM rate_versions WHERE version = ? AND status = 'published')`,
  // discardDraft: delete rows and version only while it is still a draft; log only if it is gone.
  deleteDraftRows: `DELETE FROM rates
    WHERE version = ? AND EXISTS (SELECT 1 FROM rate_versions v WHERE v.version = rates.version AND v.status = 'draft')`,
  deleteDraftVersion: "DELETE FROM rate_versions WHERE version = ? AND status = 'draft'",
  logIfGone: `INSERT INTO change_log (at, actor, action, version, key, old_value, new_value, note)
    SELECT ?, 'admin', 'discard_draft', ?, NULL, NULL, NULL, NULL
    WHERE NOT EXISTS (SELECT 1 FROM rate_versions WHERE version = ?)`,
  changeLog: `SELECT ${LOG_COLUMNS} FROM change_log ORDER BY id DESC LIMIT ?`,
  changeLogBefore: `SELECT ${LOG_COLUMNS} FROM change_log WHERE id < ? ORDER BY id DESC LIMIT ?`,
} as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_LOG_PAGE = 500;

/** snake_case DB row → RateRow. NULL columns become absent optional fields. Unknown keys are skipped by the caller. */
export function rowFromDb(r: RateDbRow): RateRow {
  if (!isRateKey(r.key)) throw new Error(`rates table has unknown key "${r.key}"`);
  const row: RateRow = {
    key: r.key,
    value: r.value === null ? null : Number(r.value),
    unit: r.unit,
    labelEn: r.label_en,
    sourceName: r.source_name,
    sourceUrl: r.source_url,
    asOf: r.as_of,
    reviewedBy: r.reviewed_by,
    nextReview: r.next_review,
    isAppAssumption: Number(r.is_app_assumption) === 1,
  };
  if (r.value_json !== null && r.value_json !== undefined) row.valueJson = JSON.parse(r.value_json) as unknown;
  if (r.range_low !== null && r.range_low !== undefined) row.rangeLow = Number(r.range_low);
  if (r.range_high !== null && r.range_high !== undefined) row.rangeHigh = Number(r.range_high);
  if (r.label_bn !== null && r.label_bn !== undefined) row.labelBn = r.label_bn;
  if (r.note !== null && r.note !== undefined) row.note = r.note;
  return row;
}

/** RateRow → bind values in RATE_COLUMNS order. */
function rowToBind(version: number, row: RateRow): unknown[] {
  return [
    version,
    row.key,
    row.value ?? null,
    row.valueJson === undefined ? null : JSON.stringify(row.valueJson),
    row.unit,
    row.rangeLow ?? null,
    row.rangeHigh ?? null,
    row.labelEn,
    row.labelBn ?? null,
    row.sourceName,
    row.sourceUrl,
    row.asOf,
    row.reviewedBy,
    row.nextReview,
    row.note ?? null,
    row.isAppAssumption ? 1 : 0,
  ];
}

/** Date part of an ISO timestamp (snapshots carry YYYY-MM-DD). */
function dateOf(ts: string): string {
  return ts.slice(0, 10);
}

/** Applies a patch to a row; null clears optional fields, undefined leaves them alone. */
export function applyPatch(row: RateRow, patch: RatePatch): RateRow {
  const defined = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as RatePatch;
  return { ...row, ...defined };
}

/** Rejects a patched row that the `rates` table (or the engine's `assertSnapshot`) would refuse anyway, with a readable message. */
function assertWritableRow(row: RateRow): void {
  const hasValue = typeof row.value === "number" && Number.isFinite(row.value);
  if (!hasValue && row.valueJson === undefined) throw new Error(`row "${row.key}": needs a numeric value or valueJson`);
  if (row.unit === "json" && row.valueJson === undefined) throw new Error(`row "${row.key}": json rows need valueJson`);
  for (const f of ["rangeLow", "rangeHigh"] as const) {
    const v = row[f];
    if (v !== undefined && v !== null && !(typeof v === "number" && Number.isFinite(v))) throw new Error(`row "${row.key}": ${f} must be a number`);
  }
  for (const f of ["labelEn", "sourceName", "sourceUrl", "reviewedBy"] as const) {
    if (typeof row[f] !== "string" || row[f].length === 0) throw new Error(`row "${row.key}": ${f} must be a non-empty string`);
  }
  for (const f of ["asOf", "nextReview"] as const) {
    if (typeof row[f] !== "string" || !ISO_DATE.test(row[f])) throw new Error(`row "${row.key}": ${f} must be YYYY-MM-DD`);
  }
}

function assertVersionNumber(version: number): void {
  if (!Number.isInteger(version) || version < 1) throw new Error(`Invalid version ${String(version)}`);
}

/** Rows changed by a batch statement, or null when the binding did not report it. */
function changesOf(result: D1ResultLike | undefined): number | null {
  const n = result?.meta?.changes;
  return typeof n === "number" ? n : null;
}

export class D1RatesRepo implements RatesRepo {
  constructor(private readonly db: D1Like) {}

  private versionByStatus(status: VersionDbRow["status"]): Promise<VersionDbRow | null> {
    return this.db.prepare(SQL.versionByStatus).bind(status).first<VersionDbRow>();
  }

  private versionByNumber(version: number): Promise<VersionDbRow | null> {
    return this.db.prepare(SQL.versionByNumber).bind(version).first<VersionDbRow>();
  }

  private async snapshotFor(v: VersionDbRow): Promise<RatesSnapshot> {
    const { results } = await this.db.prepare(SQL.rowsForVersion).bind(v.version).all<RateDbRow>();
    const rows = {} as Record<RateKey, RateRow>;
    for (const r of results) if (isRateKey(r.key)) rows[r.key] = rowFromDb(r);
    const publishedAt = dateOf(v.status === "draft" || !v.published_at ? v.created_at : v.published_at);
    return { version: v.version, publishedAt, rows };
  }

  async getPublished(): Promise<RatesSnapshot> {
    const v = await this.versionByStatus("published");
    if (!v) throw new NoPublishedVersionError();
    return this.snapshotFor(v);
  }

  async getDraft(): Promise<RatesSnapshot | null> {
    const v = await this.versionByStatus("draft");
    return v ? this.snapshotFor(v) : null;
  }

  async getVersionRows(version: number): Promise<RatesSnapshot | null> {
    assertVersionNumber(version);
    const v = await this.versionByNumber(version);
    return v ? this.snapshotFor(v) : null;
  }

  async ensureDraft(now: string): Promise<number> {
    const existing = await this.versionByStatus("draft");
    if (existing) return existing.version;
    // One transaction; every statement is a no-op when a draft already exists, so a second
    // concurrent call converges on the same draft instead of violating the one-draft index.
    await this.db.batch([
      this.db.prepare(SQL.insertDraftVersion).bind(now),
      this.db.prepare(SQL.copyPublishedRowsToDraft),
      this.db.prepare(SQL.logDraftCreated).bind(now),
    ]);
    const draft = await this.versionByStatus("draft");
    if (!draft) throw new Error("No published rates version to draft from");
    return draft.version;
  }

  async updateRow(version: number, key: RateKey, patch: RatePatch, note: string | null, now: string): Promise<RateRow> {
    assertVersionNumber(version);
    if (!isRateKey(key)) throw new Error(`Unknown rates key "${String(key)}"`);
    const v = await this.versionByNumber(version);
    if (!v || v.status !== "draft") throw new Error(`Version ${version} is not a draft`);
    const old = await this.db.prepare(SQL.rowForVersionKey).bind(version, key).first<RateDbRow>();
    if (!old) throw new Error(`No row "${key}" in version ${version}`);
    const oldRow = rowFromDb(old);
    const newRow = applyPatch(oldRow, patch);
    assertWritableRow(newRow);
    const [, , value, valueJson, , rangeLow, rangeHigh, labelEn, labelBn, sourceName, sourceUrl, asOf, reviewedBy, nextReview, rowNote] = rowToBind(version, newRow);
    const results = await this.db.batch([
      this.db.prepare(SQL.updateDraftRow).bind(value, valueJson, rangeLow, rangeHigh, labelEn, labelBn, sourceName, sourceUrl, asOf, reviewedBy, nextReview, rowNote, version, key),
      this.db.prepare(SQL.logIfDraft).bind(now, "admin", "edit", version, key, JSON.stringify(oldRow), JSON.stringify(newRow), note, version),
    ]);
    if (changesOf(results[0]) === 0) throw new Error(`Version ${version} is not a draft`);
    return newRow;
  }

  async publish(note: string | null, now: string, by: string): Promise<number> {
    const draft = await this.versionByStatus("draft");
    if (!draft) throw new Error("No draft to publish");
    const published = await this.versionByStatus("published");
    const results = await this.db.batch([
      this.db.prepare(SQL.supersedePublished).bind(draft.version),
      this.db.prepare(SQL.promoteDraft).bind(now, by, note, draft.version),
      this.db.prepare(SQL.logIfPublished).bind(now, by, draft.version, published ? String(published.version) : null, String(draft.version), note, draft.version),
    ]);
    if (changesOf(results[1]) === 0) throw new Error("No draft to publish");
    return draft.version;
  }

  async discardDraft(now: string): Promise<void> {
    const draft = await this.versionByStatus("draft");
    if (!draft) return;
    await this.db.batch([
      this.db.prepare(SQL.deleteDraftRows).bind(draft.version),
      this.db.prepare(SQL.deleteDraftVersion).bind(draft.version),
      this.db.prepare(SQL.logIfGone).bind(now, draft.version, draft.version),
    ]);
  }

  async changeLog(limit = 50, before?: number): Promise<ChangeLogEntry[]> {
    const n = Number.isInteger(limit) ? Math.min(Math.max(limit, 1), MAX_LOG_PAGE) : 50;
    const stmt =
      before !== undefined && Number.isInteger(before)
        ? this.db.prepare(SQL.changeLogBefore).bind(before, n)
        : this.db.prepare(SQL.changeLog).bind(n);
    const { results } = await stmt.all<LogDbRow>();
    return results.map((r) => ({
      id: r.id,
      at: r.at,
      actor: r.actor,
      action: r.action,
      version: r.version,
      key: r.key ?? null,
      oldValue: r.old_value ?? null,
      newValue: r.new_value ?? null,
      note: r.note ?? null,
    }));
  }
}

/** Keys in canonical order, for admin listings. */
export const RATE_KEY_ORDER: readonly RateKey[] = RATE_KEYS;
