"use client";
/**
 * The drafts the store kept when the user started again, newest first.
 *
 * - variant "section": a collapsible "Your drafts (n)" block under the plan, with a link to the full page;
 * - variant "page": the /{locale}/drafts screen.
 *
 * Open saves the current answers as a draft (the store's rule: deduplicated, never empty) and loads
 * the chosen one, then goes to the plan when its profile is complete, else to question 1. When
 * saving the current answers would push the oldest unnamed draft out (the cap), a confirm sheet
 * names it first. Opening a draft of another country rewrites the tp_country cookie, and each
 * draft's amounts are written in its own country's currency.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { currencySymbol, setCountryCookie } from "@/lib/country/index-data";
import { createFormatters, useFormat, type Formatters } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { MAX_DRAFTS } from "@/lib/store/drafts";
import { useTakaStore } from "@/lib/store/store";
import type { Draft } from "@/lib/store/types";
import { ConfirmSheet } from "./ConfirmSheet";
import { DraftCard } from "./DraftCard";
import { currencyCodeOf, currentHash, draftLabel, draftToDrop, draftUpdatedAt, saveOutcome } from "./label";
import { showDraftToast } from "./toast";

/** How long Open stays disabled after a tap (covers the navigation; a remount resets it anyway). */
const OPEN_GUARD_MS = 1500;

/** Currencies written in lakh and crore (the rest use international grouping). */
const LAKH_CRORE = new Set(["BDT", "INR", "PKR", "NPR"]);

export interface DraftsListProps {
  variant: "section" | "page";
}

export function DraftsList({ variant }: DraftsListProps) {
  const { t, locale } = useT();
  const f = useFormat();
  const router = useRouter();
  const drafts = useTakaStore((s) => s.drafts);
  const hash = useTakaStore(currentHash);
  const renameDraft = useTakaStore((s) => s.renameDraft);
  const deleteDraft = useTakaStore((s) => s.deleteDraft);
  const [opening, setOpening] = useState<string | null>(null);
  const [pending, setPending] = useState<{ draft: Draft; drop: Draft } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (opening === null) return;
    const id = setTimeout(() => setOpening(null), OPEN_GUARD_MS);
    return () => clearTimeout(id);
  }, [opening]);

  /** One formatter per currency: a draft's amounts are in its own country's currency, whatever is selected now. */
  const formatters = useMemo(() => {
    const cache = new Map<string, Formatters>();
    return (code: string): Formatters => {
      const currency = currencyCodeOf(code);
      if (currency === f.currency.code) return f;
      let x = cache.get(currency);
      if (!x) {
        x = createFormatters(locale, { code: currency, symbol: currencySymbol(currency), decimals: 2, compact: LAKH_CRORE.has(currency) ? "lakh_crore" : "intl" });
        cache.set(currency, x);
      }
      return x;
    };
  }, [f, locale]);

  const labelOf = (d: Draft) => {
    const fd = formatters(d.answers.country);
    return draftLabel(d, t, { locale, money: (n) => fd.money(n), number: (n) => fd.number(n) });
  };

  const open = (d: Draft) => {
    setOpening(d.id);
    const store = useTakaStore.getState();
    const outcome = saveOutcome(store);
    store.openDraft(d.id);
    const after = useTakaStore.getState();
    setCountryCookie(after.country);
    if (outcome === "new") showDraftToast(t("common.drafts.saved"));
    router.push(after.onboarding.completed ? `/${locale}/plan` : `/${locale}/start/1`);
  };

  const onOpen = (d: Draft) => {
    if (opening !== null) return;
    const drop = draftToDrop(useTakaStore.getState());
    if (drop && drop.id !== d.id) setPending({ draft: d, drop });
    else open(d);
  };

  const onDelete = (d: Draft) => {
    deleteDraft(d.id);
    showDraftToast(t("common.drafts.deleted"));
    // The card (and its button) is gone: put focus somewhere predictable.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const list =
    drafts.length === 0 ? (
      <p className="text-sm text-text-muted" data-testid="drafts-empty">
        {t("common.drafts.empty")}
      </p>
    ) : (
      <ul className="flex flex-col gap-3" data-testid="drafts-list">
        {drafts.map((d) => (
          <DraftCard
            key={d.id}
            draft={d}
            label={labelOf(d)}
            updated={t("common.drafts.updated", { date: draftUpdatedAt(d.updatedAt, locale) })}
            current={d.hash === hash}
            busy={opening !== null}
            onOpen={() => onOpen(d)}
            onRename={(name) => renameDraft(d.id, name)}
            onDelete={() => onDelete(d)}
          />
        ))}
      </ul>
    );

  const confirm = (
    <ConfirmSheet
      open={pending !== null}
      title={t("common.drafts.openTitle")}
      body={pending ? `${t("common.drafts.startOverHint")} ${t("common.drafts.capWarning", { max: f.number(MAX_DRAFTS), label: labelOf(pending.drop) })}` : ""}
      confirmLabel={t("common.drafts.openConfirm")}
      cancelLabel={t("common.drafts.cancel")}
      busy={opening !== null}
      onConfirm={() => {
        if (!pending) return;
        const d = pending.draft;
        setPending(null);
        open(d);
      }}
      onCancel={() => setPending(null)}
    />
  );

  if (variant === "page") {
    return (
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-text">
            {t("common.drafts.title")}
          </h1>
          <p className="text-base text-text-muted">{t("common.drafts.intro")}</p>
        </header>
        {list}
        <Link href={`/${locale}/plan`} className="tap inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface px-4 text-base font-semibold text-text hover:bg-surface-muted">
          {t("common.drafts.backToPlan")}
        </Link>
        {confirm}
      </div>
    );
  }

  return (
    <details className="group rounded-card border border-line bg-surface" data-testid="drafts-section">
      <summary className="tap flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <h2 ref={headingRef} tabIndex={-1} className="text-base font-semibold text-text">
          {t("common.drafts.sectionTitle", { count: f.number(drafts.length) })}
        </h2>
        <svg className="h-5 w-5 shrink-0 text-text-muted transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="flex flex-col gap-3 border-t border-line p-4">
        <p className="text-sm text-text-muted">{t("common.drafts.intro")}</p>
        {list}
        <Link href={`/${locale}/drafts`} className="tap inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-base font-semibold text-brand-700 hover:bg-brand-50">
          {t("common.drafts.seeAll")}
        </Link>
      </div>
      {confirm}
    </details>
  );
}
