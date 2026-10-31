"use client";
/** Bottom sheet that edits one researched figure of a country draft (same pattern as RateRowEditor). */
import { useMemo, useState, type FormEvent } from "react";
import type { CountryCode, CountryField, FieldStatus, RateKey, RateUnit } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useT } from "@/lib/i18n/useT";
import { countryApi, errorMessage } from "./api";
import type { StoredCountry } from "./countryTypes";
import { inputToValue, isIsoDate, stableJson, valueToInput } from "./format";
import { Field, inputClass } from "./RateRowEditor";

export const FIELD_STATUSES: readonly FieldStatus[] = ["sourced", "assumption", "missing"];
const URL_OK = /^(https?:\/\/\S+|docs\/\S+)$/;

export interface CountryFieldEditorProps {
  code: CountryCode;
  currency: string;
  /** The field being edited, with its base unit; null closes the sheet. */
  target: { key: RateKey; unit: RateUnit; field: CountryField | undefined } | null;
  onClose: () => void;
  onSaved: (draft: StoredCountry, key: RateKey) => void;
}

interface Form {
  status: FieldStatus;
  value: string;
  valueJson: string;
  sourceName: string;
  sourceUrl: string;
  asOf: string;
  note: string;
  changeNote: string;
}

type Errors = Partial<Record<keyof Form, string>>;
type T = (key: string, params?: Record<string, string | number>) => string;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function fromField(unit: RateUnit, f: CountryField | undefined): Form {
  return {
    status: f?.status ?? "sourced",
    value: valueToInput(f?.value ?? null, unit),
    valueJson: f?.valueJson === undefined || f.valueJson === null ? "" : JSON.stringify(f.valueJson, null, 2),
    sourceName: f?.sourceName ?? "",
    sourceUrl: f?.sourceUrl ?? "",
    asOf: f?.asOf ?? today(),
    note: f?.note ?? "",
    changeNote: "",
  };
}

/** The CountryField the form describes, or errors that block saving. */
export function buildCountryField(unit: RateUnit, form: Form, t: T): { field: CountryField | null; errors: Errors } {
  const errors: Errors = {};
  const missing = form.status === "missing";
  const field: CountryField = { value: null, status: form.status, sourceName: form.sourceName.trim(), sourceUrl: form.sourceUrl.trim(), asOf: form.asOf.trim() };
  if (!missing) {
    if (unit === "json") {
      const text = form.valueJson.trim();
      if (text === "") errors.valueJson = t("admin.validation.required");
      else {
        try {
          field.valueJson = JSON.parse(text) as unknown;
        } catch {
          errors.valueJson = t("admin.editor.invalidJson");
        }
      }
    } else {
      const v = inputToValue(form.value, unit);
      if (v === null) errors.value = t("admin.validation.number");
      else field.value = v;
    }
    if (field.sourceName === "") errors.sourceName = t("admin.validation.required");
    if (field.sourceUrl === "") errors.sourceUrl = t("admin.validation.required");
  }
  if (field.sourceUrl !== "" && !URL_OK.test(field.sourceUrl)) errors.sourceUrl = t("admin.validation.url");
  if (!isIsoDate(field.asOf)) errors.asOf = t("admin.validation.date");
  const note = form.note.trim();
  if (note !== "") field.note = note;
  return { field: Object.keys(errors).length === 0 ? field : null, errors };
}

export function CountryFieldEditor(props: CountryFieldEditorProps) {
  return props.target ? <EditorBody key={props.target.key} {...props} target={props.target} /> : null;
}

function EditorBody({ code, currency, target, onClose, onSaved }: CountryFieldEditorProps & { target: NonNullable<CountryFieldEditorProps["target"]> }) {
  const { t } = useT();
  const { key, unit, field: current } = target;
  const [form, setForm] = useState<Form>(() => fromField(unit, current));
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { field, errors } = useMemo(() => buildCountryField(unit, form, t), [unit, form, t]);
  const dirty = field !== null && stableJson(field) !== stableJson(current ?? null);
  const missing = form.status === "missing";
  const valueLabel = unit === "rate" ? t("admin.editor.valueRate") : unit === "bdt" ? t("admin.countries.editor.valueMoney", { currency }) : t("admin.editor.valueNumber");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!field || !dirty || busy) return;
    setBusy(true);
    setServerError(null);
    try {
      const draft = await countryApi.edit(code, { field: key, value: field, note: form.changeNote.trim() || undefined });
      onSaved(draft, key);
    } catch (err) {
      setServerError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Sheet open onClose={onClose} title={t("admin.countries.editor.title", { code, key })}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field id="cf-status" label={t("admin.countries.editor.status")}>
          <select id="cf-status" value={form.status} onChange={set("status")} className={inputClass(undefined)}>
            {FIELD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`admin.countries.status.${s}`)}
              </option>
            ))}
          </select>
        </Field>

        {missing ? (
          <p className="text-sm text-text-muted">{t("admin.countries.editor.missingHint")}</p>
        ) : unit === "json" ? (
          <Field id="cf-valueJson" label={t("admin.editor.valueJson")} error={errors.valueJson}>
            <textarea id="cf-valueJson" rows={6} value={form.valueJson} onChange={set("valueJson")} className={inputClass(errors.valueJson, "font-mono text-sm")} />
          </Field>
        ) : (
          <Field id="cf-value" label={valueLabel} error={errors.value}>
            <input id="cf-value" type="text" inputMode="decimal" value={form.value} onChange={set("value")} className={inputClass(errors.value, "text-xl font-semibold tabular-nums")} />
          </Field>
        )}

        <Field id="cf-asOf" label={t("admin.editor.asOf")} error={errors.asOf}>
          <input id="cf-asOf" type="date" value={form.asOf} onChange={set("asOf")} className={inputClass(errors.asOf)} />
        </Field>
        <Field id="cf-sourceName" label={t("admin.editor.sourceName")} error={errors.sourceName}>
          <input id="cf-sourceName" type="text" value={form.sourceName} onChange={set("sourceName")} className={inputClass(errors.sourceName)} />
        </Field>
        <Field id="cf-sourceUrl" label={t("admin.editor.sourceUrl")} error={errors.sourceUrl}>
          <input id="cf-sourceUrl" type="url" inputMode="url" value={form.sourceUrl} onChange={set("sourceUrl")} className={inputClass(errors.sourceUrl, "text-sm")} />
        </Field>
        <Field id="cf-note" label={t("admin.editor.note")}>
          <input id="cf-note" type="text" value={form.note} onChange={set("note")} className={inputClass(undefined)} />
        </Field>
        <Field id="cf-changeNote" label={t("admin.editor.changeNote")}>
          <input id="cf-changeNote" type="text" value={form.changeNote} onChange={set("changeNote")} className={inputClass(undefined)} />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm text-status-red">
            {t("admin.state.error", { message: serverError })}
          </p>
        )}
        {field !== null && !dirty && <p className="text-sm text-text-muted">{t("admin.editor.unchanged")}</p>}

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" fullWidth loading={busy} disabled={!dirty}>
            {t("admin.countries.editor.save")}
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={busy}>
            {t("admin.action.cancel")}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
