import type { Status } from "../types";
import type { Card, DebtFlag, DebtFlagId } from "./types";

/** Thresholds read from the rates snapshot by computeDebtHealth (never literals here). */
export interface FlagThresholds {
  /** card_utilisation_amber: balance / limit above this → amber. */
  cardUtilisationAmber: number;
  /** emi_ratio_red: totalEmi / takeHome above this → red. */
  emiRatioRed: number;
}

export interface FlagInputs {
  cards: readonly Card[];
  /** totalEmi / takeHome (0 when takeHome is 0). */
  emiRatio: number;
  /** Unfloored EMI capacity; negative → negative_capacity flag with the shortfall as value. */
  rawCapacity: number;
}

/** Severity order for the one-red rule: lower index wins. */
export const FLAG_SEVERITY: readonly DebtFlagId[] = ["card_carried", "emi_ratio", "negative_capacity", "card_utilisation"];

/** A card counts as "carried" when a balance rolls past the due date. */
export function isCarried(card: Pick<Card, "balance" | "paysInFull">): boolean {
  return card.balance > 0 && !card.paysInFull;
}

/** Raw flags before the one-red rule, in card order then household order. Only triggered flags are listed. */
export function buildFlags(input: FlagInputs, t: FlagThresholds): DebtFlag[] {
  const flags: DebtFlag[] = [];
  for (const card of input.cards) {
    if (isCarried(card)) {
      flags.push({ id: "card_carried", status: "red", ref: card.id, value: card.balance, demotedFromRed: false });
    }
    if (card.limit > 0) {
      const utilisation = card.balance / card.limit;
      if (utilisation > t.cardUtilisationAmber) {
        flags.push({ id: "card_utilisation", status: "amber", ref: card.id, value: utilisation, demotedFromRed: false });
      }
    }
  }
  if (input.emiRatio > t.emiRatioRed) {
    flags.push({ id: "emi_ratio", status: "red", value: input.emiRatio, demotedFromRed: false });
  }
  if (input.rawCapacity < 0) {
    flags.push({ id: "negative_capacity", status: "red", value: -input.rawCapacity, demotedFromRed: false });
  }
  return flags;
}

function severity(id: DebtFlagId): number {
  const i = FLAG_SEVERITY.indexOf(id);
  return i === -1 ? FLAG_SEVERITY.length : i;
}

/** Among reds: lowest severity index first, then the larger value, then input order. */
function moreUrgent(a: DebtFlag, b: DebtFlag): boolean {
  const sa = severity(a.id);
  const sb = severity(b.id);
  if (sa !== sb) return sa < sb;
  return a.value > b.value;
}

/**
 * One-red rule: the single most urgent red stays red (card_carried > emi_ratio > negative_capacity,
 * ties by larger value); every other red becomes amber with `demotedFromRed = true`.
 * Returns new flag objects in the original order; the input is not mutated.
 */
export function applyOneRedRule(flags: readonly DebtFlag[]): { flags: DebtFlag[]; primaryFlag: DebtFlag | null } {
  let primary: DebtFlag | null = null;
  for (const f of flags) {
    if (f.status !== "red") continue;
    if (primary === null || moreUrgent(f, primary)) primary = f;
  }
  const out = flags.map((f): DebtFlag => {
    if (f.status === "red" && f !== primary) return { ...f, status: "amber", demotedFromRed: true };
    return { ...f };
  });
  const primaryFlag = primary === null ? null : (out.find((f) => f.status === "red") ?? null);
  return { flags: out, primaryFlag };
}

/** red when a primary red exists, amber when any amber (incl. demoted) remains, else green. */
export function statusFromFlags(flags: readonly DebtFlag[], primaryFlag: DebtFlag | null): Status {
  if (primaryFlag !== null) return "red";
  return flags.some((f) => f.status === "amber") ? "amber" : "green";
}
