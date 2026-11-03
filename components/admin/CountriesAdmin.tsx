"use client";
/**
 * Country editor: searchable list of countries (GET /api/admin/countries), then one country's
 * fields grouped like COUNTRY_FIELDS, its currency and product names, a sample-plan preview and
 * Publish (unlocked once the preview of the current draft was opened) / Discard.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BASE_COUNTRY,
  COUNTRY_FIELDS,
  RATES_SEED,
  unitsFrom,
  type CountryCode,
  type CountryField,
  type CountryProfile,
  type RateKey,
  type RateUnit,
} from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/components/ui/cn";
import { useT } from "@/lib/i18n/useT";
import { countryApi, errorMessage } from "./api";
import { CountryFieldEditor } from "./CountryFieldEditor";
import { CountryMetaEditor, INSTRUMENT_SLOTS } from "./CountryMetaEditor";
import type { AdminCountryResponse, CountryPreviewResponse, CountrySummary, StoredCountry } from "./countryTypes";
import { formatByUnit, formatWhen, stableJson } from "./format";

const UNITS: Record<RateKey, RateUnit> = unitsFrom(RATES_SEED.rows as Record<string, { unit: RateUnit }>);

/** COUNTRY_FIELDS in order, split where each research group starts (see the comments in fields.ts). */
const GROUP_STARTS: Partial<Record<RateKey, string>> = {
  inflation_cpi: "macro",
  savings_account_rate: "deposits",
  sanchayapatra_5y_rate: "government",
  equity_return_low: "markets",
  life_claim_settlement_rate: "insurance",
  life_expectancy: "retirement",
};
const GROUPS: { id: string; keys: RateKey[] }[] = COUNTRY_FIELDS.reduce<{ id: string; keys: RateKey[] }[]>((acc, f) => {
  const start = GROUP_STARTS[f.key];
  if (start || acc.length === 0) acc.push({ id: start ?? "macro", keys: [] });
  acc[acc.length - 1]!.keys.push(f.key);
  return acc;
}, []);

let regionNames: Intl.DisplayNames | null | undefined;
/** English country name from the browser's CLDR data (the summary list carries codes only). */
function countryName(code: string): string {
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    } catch {
      regionNames = null;
    }
  }
  return regionNames?.of(code) ?? code;
}

type Toast = { kind: "ok" | "error"; text: string } | null;

const PLAIN = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
/** Local-currency amounts: Latin digits, no currency symbol (the admin reads sources in English). */
function plain(n: number): string {
  return PLAIN.format(n);
}

export function CountriesAdmin() {
  const [selected, setSelected] = useState<CountryCode | null>(null);
  const [list, setList] = useState<CountrySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reloadList = useCallback(async () => {
    setError(null);
    try {
      setList((await countryApi.list()).countries);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);
  useEffect(() => {
    void reloadList();
  }, [reloadList]);

  if (selected) {
    return (
      <CountryDetail
        code={selected}
        onBack={() => {
          setSelected(null);
          void reloadList();
        }}
      />
    );
  }
  return <CountryList list={list} error={error} onReload={reloadList} onPick={setSelected} />;
}

function CountryList({ list, error, onReload, onPick }: { list: CountrySummary[] | null; error: string | null; onReload: () => Promise<void>; onPick: (code: CountryCode) => void }) {
  const { t } = useT();
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    if (!list) return [];
    const q = query.trim().toLowerCase();
    return list.filter((c) => q === "" || c.code.toLowerCase().includes(q) || countryName(c.code).toLowerCase().includes(q));
  }, [list, query]);

  if (error && !list) return <ErrorBox message={error} onRetry={onReload} />;
  if (!list) return <Skeleton page />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t("admin.countries.title")}</h1>
      <div className="flex flex-col gap-2">
        <label htmlFor="country-search" className="sr-only">
          {t("admin.countries.search")}
        </label>
        <input
          id="country-search"
          type="search"
          placeholder={t("admin.countries.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="tap w-full rounded-xl border border-line bg-surface px-4 py-2 text-base"
        />
        <span className="text-sm text-text-muted">{t("admin.countries.showing", { shown: shown.length, total: list.length })}</span>
      </div>
      {list.length === 0 ? (
        <p className="text-text-muted">{t("admin.countries.empty")}</p>
      ) : shown.length === 0 ? (
        <p className="text-text-muted">{t("admin.countries.noMatch")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {shown.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => onPick(c.code)}
                className="tap flex w-full flex-col gap-1 rounded-card border border-line bg-surface p-3 text-start shadow-sm hover:bg-surface-muted"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-semibold">
                    <span className="font-mono text-text-muted">{c.code}</span> {countryName(c.code)}
                  </span>
                  <span className="flex shrink-0 gap-1.5">
                    {c.hasDraft && <Tag tone="warn">{t("admin.countries.hasDraft")}</Tag>}
                    <Tag>{c.publishedVersion === null ? t("admin.countries.notPublished") : t("admin.countries.version", { version: c.publishedVersion })}</Tag>
                  </span>
                </span>
                <span className="text-sm text-text-muted">{t("admin.countries.counts", { sourced: c.sourced, assumption: c.assumption, missing: c.missing })}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CountryDetail({ code, onBack }: { code: CountryCode; onBack: () => void }) {
  const { t } = useT();
  const [data, setData] = useState<AdminCountryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [editing, setEditing] = useState<RateKey | null>(null);
  const [editingMeta, setEditingMeta] = useState(false);
  const [preview, setPreview] = useState<{ body: CountryPreviewResponse; draftHash: string | null } | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setData(await countryApi.get(code));
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [code]);
  useEffect(() => {
    void reload();
  }, [reload]);

  const shown: StoredCountry | null = data ? (data.draft ?? data.published) : null;
  const draftHash = data?.draft ? stableJson(data.draft) : null;

  function onDraftSaved(draft: StoredCountry, text: string) {
    setData((d) => (d ? { ...d, draft } : d));
    setToast({ kind: "ok", text });
    // The log changed on the server; refresh it quietly.
    void countryApi.get(code).then((d) => setData((cur) => (cur ? { ...cur, changeLog: d.changeLog } : d)), () => undefined);
  }

  if (error && !data) return <ErrorBox message={error} onRetry={reload} onBack={onBack} />;
  if (!data || !shown) return <Skeleton page />;

  const profile = shown.profile;
  const published = data.published?.profile ?? null;
  const editingKey = editing;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="ghost" onClick={onBack} className="-ms-2">
          ← {t("admin.countries.back")}
        </Button>
        <h1 className="text-2xl font-bold">
          <span className="font-mono text-text-muted">{code}</span> {profile.nameEn}
        </h1>
        <p className="text-sm text-text-muted">
          {profile.nameNative} · {profile.currency.code} {profile.currency.symbol}
        </p>
      </div>

      <DraftBar
        code={code}
        data={data}
        previewOk={preview !== null && preview.draftHash !== null && preview.draftHash === draftHash}
        previewStale={preview !== null && preview.draftHash !== null && preview.draftHash !== draftHash}
        onPreview={async () => {
          try {
            const body = await countryApi.preview(code);
            // The preview was computed from the server's draft as of this request.
            setPreview({ body, draftHash: body.draft ? draftHash : null });
          } catch (e) {
            setToast({ kind: "error", text: t("admin.state.error", { message: errorMessage(e) }) });
          }
        }}
        preview={preview?.body ?? null}
        onDone={(text) => {
          setPreview(null);
          setToast({ kind: "ok", text });
          void reload();
        }}
        onError={(message) => setToast({ kind: "error", text: t("admin.state.error", { message }) })}
      />

      {toast && (
        <p role="status" aria-live="polite" className={cn("rounded-xl px-4 py-3 text-sm", toast.kind === "ok" ? "bg-status-green-soft text-status-green" : "bg-status-red-soft text-status-red")}>
          {toast.text}
        </p>
      )}

      <MetaCard profile={profile} published={published} isDraft={data.draft !== null} onEdit={() => setEditingMeta(true)} />

      {code === BASE_COUNTRY && (
        <p role="note" className="rounded-xl bg-status-amber-soft px-4 py-3 text-sm">
          {t("admin.countries.baseFieldsReadOnly")}
        </p>
      )}

      {GROUPS.map((g) => (
        <section key={g.id} className="flex flex-col gap-2" aria-labelledby={`group-${g.id}`}>
          <h2 id={`group-${g.id}`} className="text-lg font-bold">
            {t(`admin.countries.group.${g.id}`)}
          </h2>
          <ul className="flex flex-col gap-2">
            {g.keys.map((key) => {
              const field = profile.fields[key];
              const before = published?.fields[key];
              const edited = data.draft !== null && stableJson(field ?? null) !== stableJson(before ?? null);
              return (
                <li key={key}>
                  <FieldCard fieldKey={key} field={field} before={edited ? (before ?? null) : undefined} currency={profile.currency.code} onEdit={code === BASE_COUNTRY ? undefined : () => setEditing(key)} />
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {data.changeLog.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">{t("admin.countries.recentChanges", { code })}</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {data.changeLog.slice(0, 15).map((e) => (
              <li key={e.id} className="flex flex-wrap gap-x-2 border-b border-line py-1">
                <span className="tabular-nums text-text-muted">{formatWhen(e.at)}</span>
                <span className="font-semibold">{t(`admin.changeLog.action.${e.action}`)}</span>
                <span>v{e.version}</span>
                {e.key && <span className="font-mono">{e.key}</span>}
                {e.note && <span className="text-text-muted">· {e.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <CountryFieldEditor
        code={code}
        currency={profile.currency.code}
        target={editingKey ? { key: editingKey, unit: UNITS[editingKey], field: profile.fields[editingKey] } : null}
        onClose={() => setEditing(null)}
        onSaved={(draft, key) => {
          setEditing(null);
          onDraftSaved(draft, t("admin.countries.state.fieldSaved", { key, code, version: draft.version }));
        }}
      />
      <CountryMetaEditor
        profile={editingMeta ? profile : null}
        onClose={() => setEditingMeta(false)}
        onSaved={(draft) => {
          setEditingMeta(false);
          onDraftSaved(draft, t("admin.countries.state.metaSaved", { code, version: draft.version }));
        }}
      />
    </div>
  );
}

interface DraftBarProps {
  code: CountryCode;
  data: AdminCountryResponse;
  previewOk: boolean;
  previewStale: boolean;
  preview: CountryPreviewResponse | null;
  onPreview: () => Promise<void>;
  onDone: (text: string) => void;
  onError: (message: string) => void;
}

function DraftBar({ code, data, previewOk, previewStale, preview, onPreview, onDone, onError }: DraftBarProps) {
  const { t } = useT();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"publish" | "discard" | "preview" | null>(null);
  const [confirming, setConfirming] = useState<"publish" | "discard" | null>(null);
  const draft = data.draft;
  const publishedVersion = data.published?.version ?? null;

  if (!draft) {
    return (
      <section className="flex flex-col gap-1 rounded-card border border-line bg-surface p-4">
        <h2 className="text-lg font-bold text-brand-700">{publishedVersion === null ? t("admin.countries.notPublished") : t("admin.state.published", { version: publishedVersion })}</h2>
        <p className="text-sm text-text-muted">{t("admin.countries.state.noDraft")}</p>
      </section>
    );
  }

  async function run(kind: "publish" | "discard") {
    setConfirming(null);
    setBusy(kind);
    try {
      if (kind === "publish") {
        const { version } = await countryApi.publish(code, note);
        setNote("");
        onDone(t("admin.countries.state.published", { code, version }));
      } else {
        await countryApi.discard(code);
        onDone(t("admin.countries.state.discarded", { code }));
      }
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function openPreview() {
    setBusy("preview");
    try {
      await onPreview();
    } finally {
      setBusy(null);
    }
  }

  const confirmKey = confirming === "publish" ? "admin.countries.state.confirmPublish" : "admin.countries.state.confirmDiscard";

  return (
    <section aria-label={t("admin.state.draft", { version: draft.version })} className="flex flex-col gap-3 rounded-card border border-status-amber bg-status-amber-soft p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-status-amber">{t("admin.state.draft", { version: draft.version })}</h2>
        {publishedVersion !== null && <span className="text-sm text-text-muted">{t("admin.state.published", { version: publishedVersion })}</span>}
      </div>
      <p className="text-sm text-text-muted">{t("admin.countries.state.draftExplainer", { code, version: publishedVersion ?? "—" })}</p>

      <Button variant="secondary" onClick={openPreview} loading={busy === "preview"} disabled={busy !== null && busy !== "preview"}>
        {preview ? t("admin.countries.preview.reopen") : t("admin.countries.preview.open")}
      </Button>
      {preview && <PreviewSummary preview={preview} />}
      <p className="text-sm" aria-live="polite">
        {previewOk ? t("admin.countries.preview.seen", { version: draft.version }) : previewStale ? t("admin.countries.preview.outdated") : t("admin.countries.preview.required")}
      </p>

      <label htmlFor="country-publish-note" className="flex flex-col gap-1 text-sm font-semibold">
        {t("admin.state.publishNote")}
        <input id="country-publish-note" type="text" value={note} onChange={(e) => setNote(e.target.value)} className="tap w-full rounded-xl border border-line bg-surface px-3 py-2 text-base font-normal" />
      </label>

      {confirming ? (
        <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3" role="group" aria-label={t(confirmKey, { code, version: draft.version })}>
          <p className="text-sm font-semibold">{t(confirmKey, { code, version: draft.version })}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => void run(confirming)} fullWidth>
              {t(confirming === "publish" ? "admin.action.yesPublish" : "admin.action.yesDiscard", { version: draft.version })}
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(null)} fullWidth>
              {t("admin.action.cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => setConfirming("publish")} loading={busy === "publish"} disabled={!previewOk || busy !== null} fullWidth>
            {t("admin.action.publish", { version: draft.version })}
          </Button>
          <Button variant="secondary" onClick={() => setConfirming("discard")} loading={busy === "discard"} disabled={busy !== null} fullWidth>
            {t("admin.action.discard")}
          </Button>
        </div>
      )}
    </section>
  );
}

function PreviewSummary({ preview }: { preview: CountryPreviewResponse }) {
  const { t } = useT();
  const noChanges = preview.changedFields.length === 0 && preview.changedMeta.length === 0;
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3">
      <h3 className="font-semibold">{t("admin.countries.preview.title")}</h3>
      {noChanges ? (
        <p className="text-sm text-text-muted">{t("admin.countries.preview.noChanges")}</p>
      ) : (
        <>
          {preview.changedFields.length > 0 && (
            <>
              <p className="text-sm">{t("admin.countries.preview.changedFields", { count: preview.changedFields.length })}</p>
              <ul className="flex flex-wrap gap-1.5">
                {preview.changedFields.map((k) => (
                  <li key={k} className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-xs">
                    {k}
                  </li>
                ))}
              </ul>
            </>
          )}
          {preview.changedMeta.length > 0 && <p className="text-sm">{t("admin.countries.preview.changedMeta", { list: preview.changedMeta.join(", ") })}</p>}
        </>
      )}
      <ul className="flex flex-col gap-1">
        {preview.profiles.map((p) => {
          const before = "error" in p.published ? null : p.published.monthlyTotal;
          const after = p.draft && !("error" in p.draft) ? p.draft.monthlyTotal : null;
          const changed = before !== null && after !== null && before !== after;
          return (
            <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span>{t(`admin.preview.profile.${PROFILE_KEY[p.id]}`)}</span>
              <span className="tabular-nums">
                {before === null ? t("admin.preview.engineError", { message: "error" in p.published ? (p.published.message ?? p.published.error) : "" }) : plain(before)}
                {changed && (
                  <>
                    {" → "}
                    <span className="font-semibold text-status-amber">{plain(after)}</span>
                  </>
                )}
                {!changed && after !== null && <span className="text-xs text-text-faint"> · {t("admin.preview.unchanged")}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const PROFILE_KEY: Record<CountryPreviewResponse["profiles"][number]["id"], string> = { firstJob: "first_job", freelancer: "freelancer", familyWithDebt: "family_with_debt" };

function MetaCard({ profile, published, isDraft, onEdit }: { profile: CountryProfile; published: CountryProfile | null; isDraft: boolean; onEdit: () => void }) {
  const { t } = useT();
  const usd = profile.currency.usdRate;
  const edited = isDraft && published !== null && (stableJson(profile.currency) !== stableJson(published.currency) || stableJson(profile.instruments) !== stableJson(published.instruments));
  return (
    <article className={cn("flex flex-col gap-3 rounded-card border bg-surface p-4 shadow-sm", edited ? "border-status-amber" : "border-line")}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold">{t("admin.countries.meta.title")}</h2>
        <Button variant="secondary" onClick={onEdit} className="shrink-0">
          {t("admin.action.edit")}
        </Button>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-sm text-text-muted">{t("admin.countries.meta.usdRate", { currency: profile.currency.code })}</span>
        <span className="text-2xl font-bold tabular-nums">{usd.value ?? "—"}</span>
        <StatusTag status={usd.status} />
      </div>
      <SourceLine field={usd} />
      <h3 className="font-semibold">{t("admin.countries.meta.instruments")}</h3>
      <dl className="grid grid-cols-1 gap-x-3 gap-y-1 text-sm sm:grid-cols-2">
        {INSTRUMENT_SLOTS.map((s) => {
          const i = profile.instruments[s];
          return (
            <div key={s} className="flex flex-col">
              <dt className="text-text-muted">{t(`common.instrument.${s}`)}</dt>
              <dd className={cn(!i?.available && "text-text-faint line-through")}>
                {i?.available === false ? t("admin.countries.meta.notOffered") : [i?.localName, i?.localNameEn].filter(Boolean).join(" · ") || "—"}
              </dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}

/** Without `onEdit` the card is read-only (Bangladesh: its figures live in the rates admin). */
function FieldCard({ fieldKey, field, before, currency, onEdit }: { fieldKey: RateKey; field: CountryField | undefined; before: CountryField | null | undefined; currency: string; onEdit?: () => void }) {
  const { t } = useT();
  const unit = UNITS[fieldKey];
  const edited = before !== undefined;
  return (
    <article className={cn("flex flex-col gap-1.5 rounded-card border bg-surface p-3 shadow-sm", edited ? "border-status-amber" : "border-line")} aria-labelledby={`cf-${fieldKey}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`cf-${fieldKey}`} className="truncate font-mono text-sm text-text-muted">
            {fieldKey}
          </h3>
          <p className={cn("break-words tabular-nums", field && field.status !== "missing" ? "text-xl font-bold" : "text-text-muted")}>
            {field ? fieldValue(field, unit, currency) : t("admin.countries.notSet")}
          </p>
        </div>
        {onEdit && (
          <Button variant="secondary" onClick={onEdit} aria-label={`${t("admin.action.edit")} ${fieldKey}`} className="shrink-0">
            {t("admin.action.edit")}
          </Button>
        )}
      </div>
      {edited && <p className="text-sm text-status-amber">{t("admin.table.publishedWas", { value: before ? fieldValue(before, unit, currency) : "—" })}</p>}
      <div className="flex flex-wrap items-center gap-1.5">
        {field && <StatusTag status={field.status} />}
        {edited && <Tag tone="warn">{t("admin.table.edited")}</Tag>}
        {field && <span className="text-sm text-text-muted">{t("admin.table.asOf")} <span className="tabular-nums">{field.asOf}</span></span>}
      </div>
      {field && <SourceLine field={field} />}
    </article>
  );
}

function fieldValue(f: CountryField, unit: RateUnit, currency: string): string {
  if (f.status === "missing") return "—";
  if (unit === "json") return f.valueJson === undefined ? "—" : JSON.stringify(f.valueJson);
  if (f.value === null) return "—";
  if (unit === "bdt") return `${plain(f.value)} ${currency}`;
  return formatByUnit(f.value, unit);
}

function SourceLine({ field }: { field: CountryField }) {
  const { t } = useT();
  if (!field.sourceName && !field.sourceUrl && !field.note) return null;
  const external = /^https?:\/\//.test(field.sourceUrl);
  return (
    <p className="min-w-0 text-sm">
      <span className="text-text-muted">{t("admin.table.source")}: </span>
      {external ? (
        <a href={field.sourceUrl} target="_blank" rel="noopener noreferrer" className="break-words text-brand-700 underline">
          {field.sourceName || field.sourceUrl}
        </a>
      ) : (
        <span title={field.sourceUrl}>{field.sourceName || field.sourceUrl}</span>
      )}
      {field.note && <span className="text-text-muted"> · {field.note}</span>}
    </p>
  );
}

function StatusTag({ status }: { status: CountryField["status"] }) {
  const { t } = useT();
  const tone = status === "sourced" ? "bg-status-green-soft text-status-green" : status === "assumption" ? "bg-status-amber-soft text-status-amber" : "bg-status-red-soft text-status-red";
  return <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold", tone)}>{t(`admin.countries.status.${status}`)}</span>;
}

function Tag({ tone = "muted", children }: { tone?: "muted" | "warn"; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-xs", tone === "warn" ? "bg-status-amber-soft text-status-amber" : "bg-surface-muted text-text-muted")}>{children}</span>;
}

function ErrorBox({ message, onRetry, onBack }: { message: string; onRetry: () => Promise<void>; onBack?: () => void }) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-3 rounded-card border border-status-red bg-status-red-soft p-4">
      <p role="alert">{t("admin.state.error", { message })}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" onClick={() => void onRetry()}>
          {t("admin.action.reload")}
        </Button>
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            {t("admin.countries.back")}
          </Button>
        )}
      </div>
    </div>
  );
}
