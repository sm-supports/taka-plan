"use client";
/** Bottom sheet for a country draft's exchange rate and local product names (a meta patch). */
import { useMemo, useState, type FormEvent } from "react";
import type { CountryField, CountryProfile, Instrument, InstrumentInfo } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useT } from "@/lib/i18n/useT";
import { countryApi, errorMessage } from "./api";
import type { CountryMetaPatch, StoredCountry } from "./countryTypes";
import { inputToValue, isIsoDate, stableJson } from "./format";
import { Field, inputClass } from "./RateRowEditor";

export const INSTRUMENT_SLOTS: readonly Instrument[] = ["savings_account", "fdr_3m", "fdr_1y", "dps", "sanchayapatra_5y", "tbill_91d", "tbond_5y", "tbond_10y", "equity_fund", "gold"];
const URL_OK = /^(https?:\/\/\S+|docs\/\S+)$/;

export interface CountryMetaEditorProps {
  profile: CountryProfile | null;
  onClose: () => void;
  onSaved: (draft: StoredCountry) => void;
}

interface Form {
  usdValue: string;
  usdStatus: "sourced" | "assumption";
  usdSourceName: string;
  usdSourceUrl: string;
  usdAsOf: string;
  instruments: Record<Instrument, { available: boolean; localName: string; localNameEn: string }>;
  changeNote: string;
}

function fromProfile(p: CountryProfile): Form {
  const u = p.currency.usdRate;
  return {
    usdValue: u.value === null ? "" : String(u.value),
    usdStatus: u.status === "sourced" ? "sourced" : "assumption",
    usdSourceName: u.sourceName,
    usdSourceUrl: u.sourceUrl,
    usdAsOf: u.asOf,
    instruments: Object.fromEntries(
      INSTRUMENT_SLOTS.map((s) => {
        const i = p.instruments[s];
        return [s, { available: i?.available ?? true, localName: i?.localName ?? "", localNameEn: i?.localNameEn ?? "" }];
      }),
    ) as Form["instruments"],
    changeNote: "",
  };
}

type Errors = Partial<Record<"usdValue" | "usdSourceName" | "usdSourceUrl" | "usdAsOf", string>>;
type T = (key: string, params?: Record<string, string | number>) => string;

/** The meta patch the form describes (only changed parts), or errors that block saving. */
export function buildMetaPatch(p: CountryProfile, form: Form, t: T): { patch: CountryMetaPatch; errors: Errors } {
  const errors: Errors = {};
  const value = inputToValue(form.usdValue, "ratio");
  if (value === null || !(value > 0)) errors.usdValue = t("admin.validation.number");
  if (form.usdSourceName.trim() === "") errors.usdSourceName = t("admin.validation.required");
  if (!URL_OK.test(form.usdSourceUrl.trim())) errors.usdSourceUrl = t("admin.validation.url");
  if (!isIsoDate(form.usdAsOf.trim())) errors.usdAsOf = t("admin.validation.date");

  const patch: CountryMetaPatch = {};
  const usdRate: CountryField = { ...p.currency.usdRate, value, status: form.usdStatus, sourceName: form.usdSourceName.trim(), sourceUrl: form.usdSourceUrl.trim(), asOf: form.usdAsOf.trim() };
  if (Object.keys(errors).length === 0 && stableJson(usdRate) !== stableJson(p.currency.usdRate)) patch.currency = { ...p.currency, usdRate };

  const instruments = { ...p.instruments };
  for (const s of INSTRUMENT_SLOTS) {
    const f = form.instruments[s];
    const before: InstrumentInfo = p.instruments[s] ?? { available: true, localName: null };
    const next: InstrumentInfo = { ...before, available: f.available, localName: f.localName.trim() || null };
    if (f.localNameEn.trim() !== "") next.localNameEn = f.localNameEn.trim();
    else if (next.localNameEn !== undefined) next.localNameEn = null;
    instruments[s] = next;
  }
  if (stableJson(instruments) !== stableJson(p.instruments)) patch.instruments = instruments;
  return { patch, errors };
}

export function CountryMetaEditor({ profile, onClose, onSaved }: CountryMetaEditorProps) {
  return profile ? <EditorBody key={profile.code} profile={profile} onClose={onClose} onSaved={onSaved} /> : null;
}

function EditorBody({ profile, onClose, onSaved }: { profile: CountryProfile } & Omit<CountryMetaEditorProps, "profile">) {
  const { t } = useT();
  const [form, setForm] = useState<Form>(() => fromProfile(profile));
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const set = (k: "usdValue" | "usdStatus" | "usdSourceName" | "usdSourceUrl" | "usdAsOf" | "changeNote") => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setSlot = (s: Instrument, patch: Partial<Form["instruments"][Instrument]>) => setForm((f) => ({ ...f, instruments: { ...f.instruments, [s]: { ...f.instruments[s], ...patch } } }));

  const { patch, errors } = useMemo(() => buildMetaPatch(profile, form, t), [profile, form, t]);
  const valid = Object.keys(errors).length === 0;
  const dirty = Object.keys(patch).length > 0;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid || !dirty || busy) return;
    setBusy(true);
    setServerError(null);
    try {
      onSaved(await countryApi.edit(profile.code, { meta: patch, note: form.changeNote.trim() || undefined }));
    } catch (err) {
      setServerError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Sheet open onClose={onClose} title={t("admin.countries.metaEditor.title", { code: profile.code })}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field id="cm-usd" label={t("admin.countries.meta.usdRate", { currency: profile.currency.code })} error={errors.usdValue}>
          <input id="cm-usd" type="text" inputMode="decimal" value={form.usdValue} onChange={set("usdValue")} className={inputClass(errors.usdValue, "text-xl font-semibold tabular-nums")} />
        </Field>
        <Field id="cm-usdStatus" label={t("admin.countries.metaEditor.usdRateStatus")}>
          <select id="cm-usdStatus" value={form.usdStatus} onChange={set("usdStatus")} className={inputClass(undefined)}>
            <option value="sourced">{t("admin.countries.status.sourced")}</option>
            <option value="assumption">{t("admin.countries.status.assumption")}</option>
          </select>
        </Field>
        <Field id="cm-usdAsOf" label={t("admin.editor.asOf")} error={errors.usdAsOf}>
          <input id="cm-usdAsOf" type="date" value={form.usdAsOf} onChange={set("usdAsOf")} className={inputClass(errors.usdAsOf)} />
        </Field>
        <Field id="cm-usdSourceName" label={t("admin.editor.sourceName")} error={errors.usdSourceName}>
          <input id="cm-usdSourceName" type="text" value={form.usdSourceName} onChange={set("usdSourceName")} className={inputClass(errors.usdSourceName)} />
        </Field>
        <Field id="cm-usdSourceUrl" label={t("admin.editor.sourceUrl")} error={errors.usdSourceUrl}>
          <input id="cm-usdSourceUrl" type="url" inputMode="url" value={form.usdSourceUrl} onChange={set("usdSourceUrl")} className={inputClass(errors.usdSourceUrl, "text-sm")} />
        </Field>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-base font-bold">{t("admin.countries.meta.instruments")}</legend>
          {INSTRUMENT_SLOTS.map((s) => {
            const f = form.instruments[s];
            return (
              <div key={s} className="flex flex-col gap-2 rounded-xl border border-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{t(`common.instrument.${s}`)}</span>
                  <label className="tap inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={f.available} onChange={(e) => setSlot(s, { available: e.target.checked })} className="h-5 w-5" />
                    {t("admin.countries.meta.available")}
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Field id={`cm-${s}-local`} label={t("admin.countries.meta.localName")}>
                    <input id={`cm-${s}-local`} type="text" value={f.localName} onChange={(e) => setSlot(s, { localName: e.target.value })} className={inputClass(undefined)} />
                  </Field>
                  <Field id={`cm-${s}-en`} label={t("admin.countries.meta.localNameEn")}>
                    <input id={`cm-${s}-en`} type="text" value={f.localNameEn} onChange={(e) => setSlot(s, { localNameEn: e.target.value })} className={inputClass(undefined)} />
                  </Field>
                </div>
              </div>
            );
          })}
        </fieldset>

        <Field id="cm-changeNote" label={t("admin.editor.changeNote")}>
          <input id="cm-changeNote" type="text" value={form.changeNote} onChange={set("changeNote")} className={inputClass(undefined)} />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm text-status-red">
            {t("admin.state.error", { message: serverError })}
          </p>
        )}
        {valid && !dirty && <p className="text-sm text-text-muted">{t("admin.editor.unchanged")}</p>}

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" fullWidth loading={busy} disabled={!valid || !dirty}>
            {t("admin.countries.metaEditor.save")}
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={busy}>
            {t("admin.action.cancel")}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
