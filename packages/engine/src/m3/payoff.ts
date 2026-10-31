import { roundMoney, type RoundSteps } from "../money";
import { assertInput, isFiniteNumber, type Money } from "../types";
import type { DebtSummary, PayoffPlan } from "./types";

export type PayoffStrategy = "avalanche" | "snowball";

interface OpenDebt {
  id: string;
  balance: number;
  monthlyRate: number;
  minPayment: number;
  /** Position in the input list; the final tie-breaker so results are deterministic. */
  index: number;
}

/** Balances below half a taka count as cleared; floating-point dust never keeps a debt open. */
const CLEARED_BELOW = 0.5;

function assertDebt(d: DebtSummary, i: number): void {
  assertInput(typeof d.id === "string" && d.id.length > 0, `debts[${i}].id must be a non-empty string`, { index: i });
  assertInput(isFiniteNumber(d.balance) && d.balance >= 0, `debts[${i}].balance must be a finite amount ≥ 0`, { id: d.id, balance: d.balance });
  assertInput(isFiniteNumber(d.annualRate) && d.annualRate >= 0, `debts[${i}].annualRate must be a finite rate ≥ 0`, { id: d.id, annualRate: d.annualRate });
  assertInput(isFiniteNumber(d.minPayment) && d.minPayment >= 0, `debts[${i}].minPayment must be a finite amount ≥ 0`, { id: d.id, minPayment: d.minPayment });
}

/** Avalanche: highest rate first, tie → smaller balance. Snowball: smallest balance first, tie → higher rate. */
function compareTargets(strategy: PayoffStrategy): (a: OpenDebt, b: OpenDebt) => number {
  return (a, b) => {
    const byRate = b.monthlyRate - a.monthlyRate;
    const byBalance = a.balance - b.balance;
    const primary = strategy === "avalanche" ? byRate : byBalance;
    const secondary = strategy === "avalanche" ? byBalance : byRate;
    return primary !== 0 ? primary : secondary !== 0 ? secondary : a.index - b.index;
  };
}

/**
 * Month-by-month simulation. Each debt accrues balance × r/12, pays its minimum,
 * and `extraMonthly` plus freed minimums go to the target debt (highest rate for
 * avalanche, smallest balance for snowball). Stops at `maxMonths`.
 *
 * Interest is accumulated unrounded and rounded once ("interest") at the end.
 * If the debts are not cleared within `maxMonths`, `months` = maxMonths and
 * `order` lists only the debts cleared so far.
 * `steps` = the currency's rounding steps (`roundingFor(rates)`); omitted = taka steps.
 */
export function simulatePayoff(debts: DebtSummary[], extraMonthly: Money, strategy: PayoffStrategy, maxMonths = 600, steps?: RoundSteps): PayoffPlan {
  const R = steps;
  assertInput(Array.isArray(debts), "debts must be an array", { debts });
  assertInput(isFiniteNumber(extraMonthly) && extraMonthly >= 0, "extraMonthly must be a finite amount ≥ 0", { extraMonthly });
  assertInput(Number.isInteger(maxMonths) && maxMonths > 0, "maxMonths must be a positive integer", { maxMonths });
  assertInput(strategy === "avalanche" || strategy === "snowball", "strategy must be avalanche or snowball", { strategy });
  debts.forEach(assertDebt);

  const byTarget = compareTargets(strategy);
  const order: string[] = [];
  let open: OpenDebt[] = debts
    .map((d, index) => ({ id: d.id, balance: d.balance, monthlyRate: d.annualRate / 12, minPayment: d.minPayment, index }))
    .filter((d) => d.balance >= CLEARED_BELOW);
  // Minimums of debts already cleared keep flowing to the target ("freed minimums").
  let freedMinimums = 0;
  let totalInterest = 0;
  let months = 0;

  while (open.length > 0 && months < maxMonths) {
    months += 1;
    let pool = extraMonthly + freedMinimums;

    // 1. Every open debt accrues interest and pays its own minimum.
    for (const d of open) {
      const interest = d.balance * d.monthlyRate;
      totalInterest += interest;
      d.balance += interest;
      const pay = Math.min(d.minPayment, d.balance);
      d.balance -= pay;
      // A minimum larger than what was left is freed for the target this same month.
      pool += d.minPayment - pay;
    }

    // 2. The pool goes to the target; whatever is left cascades to the next target.
    const targets = [...open].sort(byTarget);
    for (const t of targets) {
      if (pool <= 0) break;
      if (t.balance < CLEARED_BELOW) continue;
      const pay = Math.min(pool, t.balance);
      t.balance -= pay;
      pool -= pay;
    }

    // 3. Close debts that reached zero, in strategy order, and free their minimums.
    for (const d of targets) {
      if (d.balance < CLEARED_BELOW) {
        order.push(d.id);
        freedMinimums += d.minPayment;
      }
    }
    open = open.filter((d) => d.balance >= CLEARED_BELOW);
  }

  return { order, months, totalInterest: roundMoney(totalInterest, "interest", R) };
}
