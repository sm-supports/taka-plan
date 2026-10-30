"use client";
/** Bottom sheet that edits one rates row and sends only the changed fields as a patch. */
import { useMemo, useState, type FormEvent } from "react";
import type { RateRow, RatesSnapshot } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/components/ui/cn";
import { useT } from "@/lib/i18n/useT";
import type { RatePatch } from "@/lib/server/db";
import { adminApi, errorMessage } from "./api";
import { formatValue, inputToValue, isIsoDate, valueToInput } from "./format";

export interface RateRowEditorProps {
  row: RateRow | null;
  onClose: () => void;
  onSaved: (draft: RatesSnapshot, key: RateRow["key"]) => void;
}

interface Form {
  value: string;
  valueJson: string;
  rangeLow: string;
  rangeHigh: string;
  labelEn: string;
  labelBn: string;
  sourceName: string;
  sourceUrl: string;
  asOf: string;
  reviewedBy: string;
  nextReview: string;
  note: string;
  changeNote: string;
}

function fromRow(row: RateRow): Form {
  return {
    value: valueToInput(row.value, row.unit),
    valueJson: row.valueJson === undefined ? "" : JSON.stringify(row.valueJson, null, 2),
    rangeLow: valueToInput(row.rangeLow, row.unit),
    rangeHigh: valueToInput(row.rangeHigh, row.unit),
    labelEn: row.labelEn,
    labelBn: row.labelBn ?? "",
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    asOf: row.asOf,
    reviewedBy: row.reviewedBy,
    nextReview: row.nextReview,
    note: row.note ?? "",
    changeNote: "",
  };
}

type Errors = Partial<Record<keyof Form, string>>;

export function RateRowEditor({ row, onClose, onSaved }: RateRowEditorProps) {
  return row ? <EditorBody key={row.key} row={row} onClose={onClose} onSaved={onSaved} /> : null;
}

function EditorBody({ row, onClose, onSaved }: { row: RateRow } & Omit<RateRowEditorProps, "row">) {
  const { t } = useT();
  const [form, setForm] = useState<Form>(() => fromRow(row));
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isJson = row.unit === "json";

  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { patch, errors } = useMemo(() => buildPatch(row, form, t), [row, form, t]);
  const dirty = Object.keys(patch).length > 0;
  const valid = Object.keys(errors).length === 0;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!dirty || !valid || busy) return;
    setBusy(true);
    setServerError(null);
    try {
      const draft = await adminApi.editRow({ key: row.key, patch, note: form.changeNote.trim() || undefined });
      onSaved(draft, row.key);
    } catch (err) {
      setServerError(errorMessage(err));
      setBusy(false);
    }
  }

  const valueLabel = row.unit === "rate" ? t("admin.editor.valueRate") : row.unit === "bdt" ? t("admin.editor.valueBdt") : t("admin.editor.valueNumber");

  return (
    <Sheet open onClose={onClose} title={t("admin.editor.title", { key: row.key })}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <p className="text-sm text-text-muted">{t("admin.editor.current", { value: formatValue(row) })}</p>

        {isJson ? (
          <Field id="f-valueJson" label={t("admin.editor.valueJson")} error={errors.valueJson}>
            <textarea id="f-valueJson" rows={6} value={form.valueJson} onChange={set("valueJson")} className={inputClass(errors.valueJson, "font-mono text-sm")} />
          </Field>
        ) : (
          <Field id="f-value" label={valueLabel} error={errors.value}>
            <input id="f-value" type="text" inputMode="decimal" value={form.value} onChange={set("value")} className={inputClass(errors.value, "text-xl font-semibold tabular-nums")} />
          </Field>
        )}

        {!isJson && (
          <div className="grid grid-cols-2 gap-3">
            <Field id="f-rangeLow" label={t("admin.editor.rangeLow")} error={errors.rangeLow}>
              <input id="f-rangeLow" type="text" inputMode="decimal" value={form.rangeLow} onChange={set("rangeLow")} className={inputClass(errors.rangeLow)} />
            </Field>
            <Field id="f-rangeHigh" label={t("admin.editor.rangeHigh")} error={errors.rangeHigh}>
              <input id="f-rangeHigh" type="text" inputMode="decimal" value={form.rangeHigh} onChange={set("rangeHigh")} className={inputClass(errors.rangeHigh)} />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field id="f-asOf" label={t("admin.editor.asOf")} error={errors.asOf}>
            <input id="f-asOf" type="date" value={form.asOf} onChange={set("asOf")} className={inputClass(errors.asOf)} />
          </Field>
          <Field id="f-nextReview" label={t("admin.editor.nextReview")} error={errors.nextReview}>
            <input id="f-nextReview" type="date" value={form.nextReview} onChange={set("nextReview")} className={inputClass(errors.nextReview)} />
          </Field>
        </div>

        <Field id="f-sourceName" label={t("admin.editor.sourceName")} error={errors.sourceName}>
          <input id="f-sourceName" type="text" value={form.sourceName} onChange={set("sourceName")} className={inputClass(errors.sourceName)} />
        </Field>
        <Field id="f-sourceUrl" label={t("admin.editor.sourceUrl")} error={errors.sourceUrl}>
          <input id="f-sourceUrl" type="url" inputMode="url" value={form.sourceUrl} onChange={set("sourceUrl")} className={inputClass(errors.sourceUrl, "text-sm")} />
        </Field>
        <Field id="f-reviewedBy" label={t("admin.editor.reviewedBy")} error={errors.reviewedBy}>
          <input id="f-reviewedBy" type="text" value={form.reviewedBy} onChange={set("reviewedBy")} className={inputClass(errors.reviewedBy)} />
        </Field>
        <Field id="f-labelEn" label={t("admin.editor.labelEn")} error={errors.labelEn}>
          <input id="f-labelEn" type="text" value={form.labelEn} onChange={set("labelEn")} className={inputClass(errors.labelEn)} />
        </Field>
        <Field id="f-labelBn" label={t("admin.editor.labelBn")} error={errors.labelBn}>
          <input id="f-labelBn" type="text" lang="bn" value={form.labelBn} onChange={set("labelBn")} className={inputClass(errors.labelBn)} />
        </Field>
        <Field id="f-note" label={t("admin.editor.note")} error={errors.note}>
          <input id="f-note" type="text" value={form.note} onChange={set("note")} className={inputClass(errors.note)} />
        </Field>
        <Field id="f-changeNote" label={t("admin.editor.changeNote")}>
          <input id="f-changeNote" type="text" value={form.changeNote} onChange={set("changeNote")} className={inputClass(undefined)} />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm text-status-red">
            {t("admin.state.error", { message: serverError })}
          </p>
        )}
        {!dirty && <p className="text-sm text-text-muted">{t("admin.editor.unchanged")}</p>}

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" fullWidth loading={busy} disabled={!dirty || !valid}>
            {t("admin.action.save")}
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={busy}>
            {t("admin.action.cancel")}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

function inputClass(error: string | undefined, extra?: string): string {
  return cn("tap w-full rounded-xl border bg-surface px-3 py-2 text-base", error ? "border-status-red" : "border-line focus:border-brand-500", extra);
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-status-red">
          {error}
        </p>
      )}
    </div>
  );
}

type T = (key: string, params?: Record<string, string | number>) => string;

/** Diff the form against the row: only changed fields go in the patch; errors block saving. */
export function buildPatch(row: RateRow, form: Form, t: T): { patch: RatePatch; errors: Errors } {
  const patch: RatePatch = {};
  const errors: Errors = {};

  if (row.unit === "json") {
    const text = form.valueJson.trim();
    if (text === "") errors.valueJson = t("admin.validation.required");
    else {
      try {
        const parsed: unknown = JSON.parse(text);
        if (JSON.stringify(parsed) !== JSON.stringify(row.valueJson)) patch.valueJson = parsed;
      } catch {
        errors.valueJson = t("admin.editor.invalidJson");
      }
    }
  } else {
    const v = inputToValue(form.value, row.unit);
    if (form.value.trim() === "" || v === null) errors.value = t("admin.validation.number");
    else if (v !== row.value) patch.value = v;

    for (const f of ["rangeLow", "rangeHigh"] as const) {
      const text = form[f].trim();
      const current = row[f] ?? null;
      if (text === "") {
        if (current !== null) patch[f] = null;
        continue;
      }
      const n = inputToValue(text, row.unit);
      if (n === null) errors[f] = t("admin.validation.number");
      else if (n !== current) patch[f] = n;
    }
  }

  for (const f of ["labelEn", "sourceName", "reviewedBy"] as const) {
    const text = form[f].trim();
    if (text === "") errors[f] = t("admin.validation.required");
    else if (text !== row[f]) patch[f] = text;
  }

  const url = form.sourceUrl.trim();
  if (url === "") errors.sourceUrl = t("admin.validation.required");
  else if (!/^(https?:\/\/\S+|docs\/\S+)$/.test(url)) errors.sourceUrl = t("admin.validation.url");
  else if (url !== row.sourceUrl) patch.sourceUrl = url;

  for (const f of ["asOf", "nextReview"] as const) {
    const text = form[f].trim();
    if (!isIsoDate(text)) errors[f] = t("admin.validation.date");
    else if (text !== row[f]) patch[f] = text;
  }
  if (!errors.asOf && !errors.nextReview && form.nextReview <= form.asOf) errors.nextReview = t("admin.validation.reviewBeforeAsOf");

  for (const f of ["labelBn", "note"] as const) {
    const text = form[f].trim();
    const current = row[f] ?? null;
    if (text === "") {
      if (current !== null) patch[f] = null;
    } else if (text !== current) patch[f] = text;
  }

  return { patch, errors };
}
