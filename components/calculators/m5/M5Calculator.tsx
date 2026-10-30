"use client";
/**
 * M5 Goal planner page body. Saved goals come from the store and edit in place (valid patches
 * only); a new goal lives in a local draft until name, cost and years are all valid (PRD).
 * With `demo`, a fixture replaces the store and the stub engine.
 */
import { useMemo, useState } from "react";
import { computeGoals, type Goal, type M5Input, type M5Result } from "@taka/engine";
import { Button } from "@/components/ui/Button";
import { BigNumber } from "@/components/ui/BigNumber";
import { Card } from "@/components/ui/Card";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { useFormat } from "@/lib/i18n/useFormat";
import { useT } from "@/lib/i18n/useT";
import { useRates } from "@/lib/rates/useRates";
import { makeId, useTakaStore } from "@/lib/store/store";
import { engineErrorKey, todayISO } from "@/components/calculators/m3/engineError";
import { DEMO_M5_INPUT, buildDemoM5Result } from "./demo";
import { GoalEditor } from "./GoalEditor";
import { GoalResultCard } from "./GoalResultCard";
import { EMPTY_DRAFT, applyOneRed, draftToGoal, isValidDraft, type GoalDraft } from "./goals";

export interface M5CalculatorProps {
  demo?: boolean;
}

/** Age is only a label input for M5 in the MVP; used when onboarding has not set one yet. */
const FALLBACK_AGE = 30;

export function M5Calculator({ demo = false }: M5CalculatorProps) {
  const { t } = useT();
  const f = useFormat();
  const { snapshot } = useRates();
  const [today] = useState(todayISO);

  const age = useTakaStore((s) => s.profile.age);
  const goals = useTakaStore((s) => s.m5.goals);
  const addGoal = useTakaStore((s) => s.addGoal);
  const updateGoal = useTakaStore((s) => s.updateGoal);
  const removeGoal = useTakaStore((s) => s.removeGoal);

  const [draft, setDraft] = useState<GoalDraft>(EMPTY_DRAFT);
  const [draftTouched, setDraftTouched] = useState(false);
  /** Per saved goal, the in-progress edit (may be temporarily invalid; only valid states are written). */
  const [edits, setEdits] = useState<Record<string, GoalDraft>>({});

  const input: M5Input = useMemo(() => (demo ? DEMO_M5_INPUT : { goals, age: age ?? FALLBACK_AGE }), [demo, goals, age]);

  const computed = useMemo<{ result: M5Result | null; errorKey: string | null }>(() => {
    try {
      return { result: demo ? buildDemoM5Result(input, snapshot, today) : computeGoals(input, snapshot, today), errorKey: null };
    } catch (e) {
      return { result: null, errorKey: engineErrorKey(e) };
    }
  }, [demo, input, snapshot, today]);

  const shownStatuses = useMemo(() => {
    const results = computed.result?.goals ?? [];
    return applyOneRed(results.map((g) => g.status));
  }, [computed.result]);

  const draftValid = isValidDraft(draft);
  const onSaveDraft = () => {
    if (!isValidDraft(draft)) {
      setDraftTouched(true);
      return;
    }
    addGoal(draftToGoal(draft, makeId("goal")));
    setDraft(EMPTY_DRAFT);
    setDraftTouched(false);
  };

  const editFor = (g: Goal): GoalDraft => edits[g.id] ?? { name: g.name, cost: g.cost, years: g.years, type: g.type };
  const onEdit = (g: Goal, patch: Partial<GoalDraft>) => {
    if (demo) return;
    const next = { ...editFor(g), ...patch };
    setEdits((e) => ({ ...e, [g.id]: next }));
    if (isValidDraft(next)) updateGoal(g.id, draftToGoal(next, g.id));
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-text">{t("m5.title")}</h1>
        <p className="mt-1 text-base text-text-muted">{t("m5.intro")}</p>
      </header>

      {demo && (
        <p role="status" className="rounded-xl border border-status-amber/30 bg-status-amber-soft px-3 py-2 text-sm text-text">
          {t("m5.demoBanner")}
        </p>
      )}

      {/* Headline: all goals together */}
      {computed.result && computed.result.goals.some((g) => g.valid) && (
        <Card>
          <BigNumber label={t("m5.result.totalMonthly")} value={f.taka(computed.result.totalMonthly)} caption={t("m5.result.goalsCount", { n: f.number(computed.result.goals.filter((g) => g.valid).length) })} />
        </Card>
      )}
      {!computed.result && <ErrorCard title={t("m5.title")} message={t(computed.errorKey ?? "errors.generic")} />}

      {/* Saved goals, each with its editor and result */}
      <section aria-labelledby="m5-saved" className="flex flex-col gap-4">
        <h2 id="m5-saved" className="text-lg font-bold text-text">
          {t("m5.input.saved")}
        </h2>
        {input.goals.length === 0 && <p className="text-sm text-text-muted">{t("m5.result.empty")}</p>}
        {input.goals.map((g, i) => {
          const result = computed.result?.goals.find((r) => r.goalId === g.id);
          const edit = editFor(g);
          return (
            <div key={g.id} className="flex flex-col gap-3">
              <details className="rounded-card border border-line bg-surface">
                <summary className="tap flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-base font-semibold text-text">
                  <span>
                    {g.name} · {f.taka(g.cost, { compact: true })} · {f.number(g.years)} {t(g.years === 1 ? "common.unit.year" : "common.unit.years")}
                  </span>
                  <span className="text-sm font-medium text-brand-700">{t("common.button.edit")}</span>
                </summary>
                <div className="flex flex-col gap-4 border-t border-line p-4">
                  <GoalEditor id={`goal-${g.id}`} draft={edit} onChange={(patch) => onEdit(g, patch)} incompleteMessage={isValidDraft(edit) ? undefined : t("m5.input.incomplete")} />
                  <Button variant="secondary" onClick={() => !demo && removeGoal(g.id)} disabled={demo}>
                    {t("m5.input.removeGoal")}
                  </Button>
                </div>
              </details>
              {result && <GoalResultCard name={g.name} result={result} shown={shownStatuses[i] ?? { status: result.status, demotedFromRed: false }} />}
            </div>
          );
        })}
      </section>

      {/* New goal draft: saved only when complete */}
      <Card header={<h2 className="text-lg font-bold text-text">{t("m5.input.newGoal")}</h2>}>
        <GoalEditor id="goal-new" draft={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} incompleteMessage={draftTouched && !draftValid ? t("m5.input.incomplete") : undefined} />
        <Button fullWidth size="lg" className="mt-4" onClick={onSaveDraft} disabled={demo || !draftValid}>
          {t("m5.input.saveGoal")}
        </Button>
        {!draftValid && !draftTouched && <p className="mt-2 text-center text-sm text-text-muted">{t("m5.input.incomplete")}</p>}
      </Card>
    </div>
  );
}
