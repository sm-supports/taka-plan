// Rates repository over Cloudflare D1: versioned rows, one draft at a time, change log.
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

/** Minimal structural view of the D1 binding, so this file type-checks without the Workers globals. */
export interface D1Like {
  prepare(query: string): D1StatementLike;
  batch(statements: D1StatementLike[]): Promise<unknown[]>;
}
export interface D1StatementLike {
  bind(...values: unknown[]): D1StatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
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

/** snake_case DB row → RateRow. Unknown keys are skipped by the caller. */
export function rowFromDb(r: RateDbRow): RateRow {
  if (!isRateKey(r.key)) throw new Error(`rates table has unknown key "${r.key}"`);
  const row: RateRow = {
    key: r.key,
    value: r.value,
    unit: r.unit,
    labelEn: r.label_en,
    sourceName: r.source_name,
    sourceUrl: r.source_url,
    asOf: r.as_of,
    reviewedBy: r.reviewed_by,
    nextReview: r.next_review,
    isAppAssumption: r.is_app_assumption === 1,
  };
  if (r.value_json !== null) row.valueJson = JSON.parse(r.value_json) as unknown;
  if (r.range_low !== null) row.rangeLow = r.range_low;
  if (r.range_high !== null) row.rangeHigh = r.range_high;
  if (r.label_bn !== null) row.labelBn = r.label_bn;
  if (r.note !== null) row.note = r.note;
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

export class D1RatesRepo implements RatesRepo {
  constructor(private db: D1Like) {}

  private async version(where: string, ...bind: unknown[]): Promise<VersionDbRow | null> {
    return this.db.prepare(`SELECT version, status, created_at, published_at, published_by, note FROM rate_versions WHERE ${where}`).bind(...bind).first<VersionDbRow>();
  }

  private async snapshotFor(v: VersionDbRow): Promise<RatesSnapshot> {
    const { results } = await this.db.prepare(`SELECT ${RATE_COLUMNS} FROM rates WHERE version = ?`).bind(v.version).all<RateDbRow>();
    const rows = {} as Record<RateKey, RateRow>;
    for (const r of results) if (isRateKey(r.key)) rows[r.key] = rowFromDb(r);
    const publishedAt = dateOf(v.status === "draft" || !v.published_at ? v.created_at : v.published_at);
    return { version: v.version, publishedAt, rows };
  }

  async getPublished(): Promise<RatesSnapshot> {
    const v = await this.version("status = 'published'");
    if (!v) throw new Error("No published rates version");
    return this.snapshotFor(v);
  }

  async getDraft(): Promise<RatesSnapshot | null> {
    const v = await this.version("status = 'draft'");
    return v ? this.snapshotFor(v) : null;
  }

  async getVersionRows(version: number): Promise<RatesSnapshot | null> {
    const v = await this.version("version = ?", version);
    return v ? this.snapshotFor(v) : null;
  }

  async ensureDraft(now: string): Promise<number> {
    const draft = await this.version("status = 'draft'");
    if (draft) return draft.version;
    const published = await this.version("status = 'published'");
    if (!published) throw new Error("No published rates version to draft from");
    const next = published.version + 1;
    await this.db.batch([
      this.db.prepare("INSERT INTO rate_versions (version, status, created_at) VALUES (?, 'draft', ?)").bind(next, now),
      this.db
        .prepare(
          `INSERT INTO rates (${RATE_COLUMNS}) SELECT ?, key, value, value_json, unit, range_low, range_high, label_en, label_bn, source_name, source_url, as_of, reviewed_by, next_review, note, is_app_assumption FROM rates WHERE version = ?`,
        )
        .bind(next, published.version),
      this.log(now, "create_draft", next, null, null, null, `copied from v${published.version}`),
    ]);
    return next;
  }

  async updateRow(version: number, key: RateKey, patch: RatePatch, note: string | null, now: string): Promise<RateRow> {
    const v = await this.version("version = ?", version);
    if (!v || v.status !== "draft") throw new Error(`Version ${version} is not a draft`);
    const old = await this.db.prepare(`SELECT ${RATE_COLUMNS} FROM rates WHERE version = ? AND key = ?`).bind(version, key).first<RateDbRow>();
    if (!old) throw new Error(`No row "${key}" in version ${version}`);
    const oldRow = rowFromDb(old);
    const newRow = applyPatch(oldRow, patch);
    const b = rowToBind(version, newRow);
    await this.db.batch([
      this.db
        .prepare(
          "UPDATE rates SET value = ?, value_json = ?, range_low = ?, range_high = ?, label_en = ?, label_bn = ?, source_name = ?, source_url = ?, as_of = ?, reviewed_by = ?, next_review = ?, note = ? WHERE version = ? AND key = ?",
        )
        .bind(b[2], b[3], b[5], b[6], b[7], b[8], b[9], b[10], b[11], b[12], b[13], b[14], version, key),
      this.log(now, "edit", version, key, JSON.stringify(oldRow), JSON.stringify(newRow), note),
    ]);
    return newRow;
  }

  async publish(note: string | null, now: string, by: string): Promise<number> {
    const draft = await this.version("status = 'draft'");
    if (!draft) throw new Error("No draft to publish");
    const published = await this.version("status = 'published'");
    await this.db.batch([
      this.db.prepare("UPDATE rate_versions SET status = 'superseded' WHERE status = 'published'"),
      this.db.prepare("UPDATE rate_versions SET status = 'published', published_at = ?, published_by = ?, note = ? WHERE version = ?").bind(now, by, note, draft.version),
      this.log(now, "publish", draft.version, null, published ? String(published.version) : null, String(draft.version), note, by),
    ]);
    return draft.version;
  }

  async discardDraft(now: string): Promise<void> {
    const draft = await this.version("status = 'draft'");
    if (!draft) return;
    await this.db.batch([
      this.db.prepare("DELETE FROM rates WHERE version = ?").bind(draft.version),
      this.db.prepare("DELETE FROM rate_versions WHERE version = ?").bind(draft.version),
      this.log(now, "discard_draft", draft.version, null, null, null, null),
    ]);
  }

  async changeLog(limit = 50, before?: number): Promise<ChangeLogEntry[]> {
    const where = before !== undefined ? "WHERE id < ?" : "";
    const stmt = this.db.prepare(`SELECT id, at, actor, action, version, key, old_value, new_value, note FROM change_log ${where} ORDER BY id DESC LIMIT ?`);
    const { results } = await (before !== undefined ? stmt.bind(before, limit) : stmt.bind(limit)).all<LogDbRow>();
    return results.map((r) => ({ id: r.id, at: r.at, actor: r.actor, action: r.action, version: r.version, key: r.key, oldValue: r.old_value, newValue: r.new_value, note: r.note }));
  }

  private log(at: string, action: ChangeLogEntry["action"], version: number, key: string | null, oldValue: string | null, newValue: string | null, note: string | null, actor = "admin"): D1StatementLike {
    return this.db.prepare("INSERT INTO change_log (at, actor, action, version, key, old_value, new_value, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(at, actor, action, version, key, oldValue, newValue, note);
  }
}

/** Keys in canonical order, for admin listings. */
export const RATE_KEY_ORDER: readonly RateKey[] = RATE_KEYS;
