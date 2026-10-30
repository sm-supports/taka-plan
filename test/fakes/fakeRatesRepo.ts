// In-memory RatesRepo with the same draft/publish/change-log semantics as D1RatesRepo.
import { RATES_SEED, assertSnapshot, type RateKey, type RateRow, type RatesSnapshot } from "@taka/engine";
import { applyPatch, type ChangeLogEntry, type RatePatch, type RatesRepo } from "@/lib/server/db";

interface FakeVersion {
  version: number;
  status: "draft" | "published" | "superseded";
  createdAt: string;
  publishedAt: string | null;
  publishedBy: string | null;
  note: string | null;
  rows: Record<RateKey, RateRow>;
}

function cloneRows(rows: Record<RateKey, RateRow>): Record<RateKey, RateRow> {
  return JSON.parse(JSON.stringify(rows)) as Record<RateKey, RateRow>;
}

export class FakeRatesRepo implements RatesRepo {
  private versions = new Map<number, FakeVersion>();
  private log: ChangeLogEntry[] = [];
  private nextLogId = 1;

  constructor(seed: RatesSnapshot = assertSnapshot(RATES_SEED)) {
    this.versions.set(seed.version, {
      version: seed.version,
      status: "published",
      createdAt: seed.publishedAt,
      publishedAt: seed.publishedAt,
      publishedBy: "seed",
      note: null,
      rows: cloneRows(seed.rows),
    });
  }

  private find(status: FakeVersion["status"]): FakeVersion | undefined {
    for (const v of this.versions.values()) if (v.status === status) return v;
    return undefined;
  }

  private snapshot(v: FakeVersion): RatesSnapshot {
    const at = v.status === "draft" || !v.publishedAt ? v.createdAt : v.publishedAt;
    return { version: v.version, publishedAt: at.slice(0, 10), rows: cloneRows(v.rows) };
  }

  private addLog(e: Omit<ChangeLogEntry, "id">): void {
    this.log.push({ id: this.nextLogId++, ...e });
  }

  async getPublished(): Promise<RatesSnapshot> {
    const v = this.find("published");
    if (!v) throw new Error("No published rates version");
    return this.snapshot(v);
  }

  async getDraft(): Promise<RatesSnapshot | null> {
    const v = this.find("draft");
    return v ? this.snapshot(v) : null;
  }

  async getVersionRows(version: number): Promise<RatesSnapshot | null> {
    const v = this.versions.get(version);
    return v ? this.snapshot(v) : null;
  }

  async ensureDraft(now: string): Promise<number> {
    const draft = this.find("draft");
    if (draft) return draft.version;
    const published = this.find("published");
    if (!published) throw new Error("No published rates version to draft from");
    const next = published.version + 1;
    this.versions.set(next, { version: next, status: "draft", createdAt: now, publishedAt: null, publishedBy: null, note: null, rows: cloneRows(published.rows) });
    this.addLog({ at: now, actor: "admin", action: "create_draft", version: next, key: null, oldValue: null, newValue: null, note: `copied from v${published.version}` });
    return next;
  }

  async updateRow(version: number, key: RateKey, patch: RatePatch, note: string | null, now: string): Promise<RateRow> {
    const v = this.versions.get(version);
    if (!v || v.status !== "draft") throw new Error(`Version ${version} is not a draft`);
    const oldRow = v.rows[key];
    if (!oldRow) throw new Error(`No row "${key}" in version ${version}`);
    const newRow = applyPatch(oldRow, patch);
    v.rows[key] = newRow;
    this.addLog({ at: now, actor: "admin", action: "edit", version, key, oldValue: JSON.stringify(oldRow), newValue: JSON.stringify(newRow), note });
    return { ...newRow };
  }

  async publish(note: string | null, now: string, by: string): Promise<number> {
    const draft = this.find("draft");
    if (!draft) throw new Error("No draft to publish");
    const published = this.find("published");
    if (published) published.status = "superseded";
    draft.status = "published";
    draft.publishedAt = now;
    draft.publishedBy = by;
    draft.note = note;
    this.addLog({ at: now, actor: by, action: "publish", version: draft.version, key: null, oldValue: published ? String(published.version) : null, newValue: String(draft.version), note });
    return draft.version;
  }

  async discardDraft(now: string): Promise<void> {
    const draft = this.find("draft");
    if (!draft) return;
    this.versions.delete(draft.version);
    this.addLog({ at: now, actor: "admin", action: "discard_draft", version: draft.version, key: null, oldValue: null, newValue: null, note: null });
  }

  async changeLog(limit = 50, before?: number): Promise<ChangeLogEntry[]> {
    return this.log
      .filter((e) => before === undefined || e.id < before)
      .sort((a, b) => b.id - a.id)
      .slice(0, limit)
      .map((e) => ({ ...e }));
  }
}
