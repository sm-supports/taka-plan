import { assertSnapshot, isRateKey, type RateRow } from "@taka/engine";
import { applyPatch, type RatePatch } from "@/lib/server/db";
import { getRatesRepo } from "@/lib/server/env";
import { HttpError, json, readJson, toResponse } from "@/lib/server/http";
import { NO_STORE, nowIso, requireAdmin, requireCsrf } from "../shared";

export const dynamic = "force-dynamic";

const LOG_PAGE = 50;

/** GET → { published, draft | null, changeLog (last 50) }; `?before=<id>` pages the log further back. */
export async function GET(req: Request): Promise<Response> {
  try {
    await requireAdmin(req);
    const beforeRaw = new URL(req.url).searchParams.get("before");
    const before = beforeRaw !== null && /^\d+$/.test(beforeRaw) ? Number(beforeRaw) : undefined;
    const repo = getRatesRepo();
    const [published, draft, changeLog] = await Promise.all([repo.getPublished(), repo.getDraft(), repo.changeLog(LOG_PAGE, before)]);
    return json({ published, draft, changeLog }, { headers: NO_STORE });
  } catch (e) {
    return toResponse(e);
  }
}

const PATCH_FIELDS = ["value", "valueJson", "rangeLow", "rangeHigh", "labelEn", "labelBn", "sourceName", "sourceUrl", "asOf", "reviewedBy", "nextReview", "note"] as const;
type PatchField = (typeof PATCH_FIELDS)[number];
const STRING_FIELDS: ReadonlySet<PatchField> = new Set<PatchField>(["labelEn", "labelBn", "sourceName", "sourceUrl", "asOf", "reviewedBy", "nextReview", "note"]);
const NUMBER_FIELDS: ReadonlySet<PatchField> = new Set<PatchField>(["value", "rangeLow", "rangeHigh"]);
const REQUIRED_FIELDS: ReadonlySet<PatchField> = new Set<PatchField>(["labelEn", "sourceName", "sourceUrl", "asOf", "reviewedBy", "nextReview"]);

/** Keeps only known fields with plausible types; assertSnapshot does the semantic checks. */
function sanitisePatch(raw: unknown): RatePatch {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new HttpError(400, "BAD_PATCH", "patch must be an object");
  const src = raw as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const f of PATCH_FIELDS) {
    if (!(f in src) || src[f] === undefined) continue;
    const v = src[f];
    if (v === null) {
      if (REQUIRED_FIELDS.has(f)) throw new HttpError(400, "BAD_PATCH", `${f} cannot be empty`);
      patch[f] = null;
      continue;
    }
    if (STRING_FIELDS.has(f) && typeof v !== "string") throw new HttpError(400, "BAD_PATCH", `${f} must be a string`);
    if (NUMBER_FIELDS.has(f) && (typeof v !== "number" || !Number.isFinite(v))) throw new HttpError(400, "BAD_PATCH", `${f} must be a finite number`);
    patch[f] = typeof v === "string" ? v.trim() : v;
  }
  if (Object.keys(patch).length === 0) throw new HttpError(400, "BAD_PATCH", "patch is empty");
  return patch as RatePatch;
}

function invalidRow(e: unknown): HttpError {
  return new HttpError(400, "INVALID_ROW", e instanceof Error ? e.message : "Row is invalid");
}

/** A patch that restores every editable field of `row` (null clears what the row did not have). */
function rollbackPatch(row: RateRow): RatePatch {
  return {
    value: row.value,
    valueJson: row.valueJson,
    rangeLow: row.rangeLow ?? null,
    rangeHigh: row.rangeHigh ?? null,
    labelEn: row.labelEn,
    labelBn: row.labelBn ?? null,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    asOf: row.asOf,
    reviewedBy: row.reviewedBy,
    nextReview: row.nextReview,
    note: row.note ?? null,
  };
}

/** PUT {key, patch, note} → edits one draft row (creating the draft when absent) and returns the draft. */
export async function PUT(req: Request): Promise<Response> {
  try {
    await requireAdmin(req);
    requireCsrf(req);
    const body = await readJson<{ key?: unknown; patch?: unknown; note?: unknown }>(req);
    const key = typeof body?.key === "string" ? body.key : "";
    if (!isRateKey(key)) throw new HttpError(400, "BAD_KEY", `Unknown rates key "${key}"`);
    const patch = sanitisePatch(body.patch);
    const note = typeof body.note === "string" && body.note.trim().length > 0 ? body.note.trim() : null;

    const repo = getRatesRepo();
    const now = nowIso();
    const version = await repo.ensureDraft(now);
    const before = await repo.getDraft();
    if (!before) throw new HttpError(500, "NO_DRAFT", "Draft vanished");
    const oldRow = before.rows[key];

    // Validate the would-be draft first so an invalid edit never reaches the store.
    try {
      assertSnapshot({ ...before, rows: { ...before.rows, [key]: applyPatch(oldRow, patch) } });
    } catch (e) {
      throw invalidRow(e);
    }

    await repo.updateRow(version, key, patch, note, now);
    const draft = await repo.getDraft();
    if (!draft) throw new HttpError(500, "NO_DRAFT", "Draft vanished");
    // Belt and braces: the stored draft must validate too, else roll the edit back and reject.
    try {
      assertSnapshot(draft);
    } catch (e) {
      await repo.updateRow(version, key, rollbackPatch(oldRow), "rollback: invalid edit", nowIso());
      throw invalidRow(e);
    }
    return json(draft, { headers: NO_STORE });
  } catch (e) {
    return toResponse(e);
  }
}
