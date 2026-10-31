import { roundingFor } from "../country/overlay";
import { createExplain } from "../explain";
import { mean, roundDecimals, roundMoney, sum } from "../money";
import type { RatesSnapshot } from "../rates";
import { assertInput, isFiniteNumber, type ISODate, type Rate, type Status } from "../types";
import { M4_NOTE_KEYS, type M4Input, type M4Result } from "./types";

const INCOME_TYPES: ReadonlySet<string> = new Set(["salaried", "freelance", "business"]);
/** Tolerance for "squeezed below the suggestion" comparisons on decimal rates. */
const RATE_EPSILON = 1e-9;
/** Calendar days used to wrap the transfer day (payday 31 → day 1). */
const DAYS_IN_MONTH = 31;

/**
 * M4 Save-first budget: income − savings = expenses.
 * Suggested rate = min(savings_rate_default, feasible); the user may lower it.
 * Freelance/business incomes are smoothed over `last6Incomes` and saved as a share of each payment.
 */
export function computeSaveFirst(input: M4Input, rates: RatesSnapshot, today: ISODate): M4Result {
  validate(input);
  const R = roundingFor(rates);
  const ex = createExplain(rates, today);

  // m4.average: smoothed income (freelance/business) or take-home as is.
  const incomes = input.last6Incomes !== undefined && input.last6Incomes.length > 0 ? input.last6Incomes : [input.takeHome];
  const rawAverage = mean(incomes);
  const averageIncome = ex.step({
    id: "m4.average",
    inputs: { months: incomes.length, total: sum(incomes) },
    raw: rawAverage,
    rounded: roundMoney(rawAverage, "exact", R),
    unit: "bdt",
  });
  assertInput(averageIncome > 0, "average income must be greater than zero", { averageIncome });

  // m4.feasible: share of income left after essentials.
  const feasibleRate: Rate = Math.max(0, (averageIncome - input.essentials) / averageIncome);
  ex.step({
    id: "m4.feasible",
    inputs: { average: averageIncome, essentials: input.essentials },
    raw: feasibleRate,
    rounded: roundDecimals(feasibleRate, 3),
    unit: "rate",
  });

  const defaultRate = ex.use("savings_rate_default");
  const suggestedRate: Rate = Math.min(defaultRate, feasibleRate);
  const savingsRate: Rate = Math.min(input.savingsRate ?? suggestedRate, feasibleRate);

  // m4.amount: income × rate, rounded to the nearest ৳100 at the boundary.
  const rawAmount = averageIncome * savingsRate;
  const savingsAmount = ex.step({
    id: "m4.amount",
    inputs: { average: averageIncome, rate: savingsRate },
    raw: rawAmount,
    rounded: roundMoney(rawAmount, "monthly", R),
    unit: "bdt",
  });

  // m4.expenses: what is left to live on.
  const rawExpenses = averageIncome - savingsAmount;
  const expensesAllowed = ex.step({
    id: "m4.expenses",
    inputs: { average: averageIncome, savings: savingsAmount },
    raw: rawExpenses,
    rounded: roundMoney(rawExpenses, "exact", R),
    unit: "bdt",
  });

  const essentialsShortfall = roundMoney(Math.max(0, input.essentials - expensesAllowed), "exact", R);

  const mode = input.incomeType === "salaried" ? "fixed" : "percentOfEachPayment";
  // The instrument is fixed to a DPS in the MVP (auto-debit on a set day); say so in "Why this number?".
  ex.note(M4_NOTE_KEYS[0]);

  const transferDay = input.payday === undefined ? null : (input.payday % DAYS_IN_MONTH) + 1;

  // Amber when the rate actually used sits below the app default (20%): either feasibility
  // squeezed the suggestion down, or the user chose less than the suggestion. Compared against
  // the default rather than `suggestedRate`, since the suggestion is itself capped by feasibility
  // (PRD vector 50 000 / 45 000 → 10%, amber).
  const squeezed = savingsRate < defaultRate - RATE_EPSILON;
  const loweredByUser = input.savingsRate !== undefined && input.savingsRate < suggestedRate - RATE_EPSILON;
  let status: Status = "green";
  if (feasibleRate <= 0) status = "red";
  else if (squeezed || loweredByUser) status = "amber";

  const result: M4Result = {
    averageIncome,
    suggestedRate,
    feasibleRate,
    savingsRate,
    savingsAmount,
    expensesAllowed,
    essentialsShortfall,
    mode,
    instrument: "dps",
    transferDay,
    status,
    explain: ex.done(),
  };
  if (mode === "percentOfEachPayment") result.percentOfEachPayment = savingsRate;
  return result;
}

function validate(input: M4Input): void {
  assertInput(typeof input === "object" && input !== null, "input must be an object");
  assertInput(isFiniteNumber(input.takeHome) && input.takeHome >= 0, "takeHome must be a finite number ≥ 0", { takeHome: input.takeHome });
  assertInput(isFiniteNumber(input.essentials) && input.essentials >= 0, "essentials must be a finite number ≥ 0", { essentials: input.essentials });
  assertInput(INCOME_TYPES.has(input.incomeType), "incomeType must be salaried, freelance or business", { incomeType: input.incomeType });
  if (input.savingsRate !== undefined) {
    assertInput(isFiniteNumber(input.savingsRate) && input.savingsRate >= 0 && input.savingsRate <= 1, "savingsRate must be between 0 and 1", {
      savingsRate: input.savingsRate,
    });
  }
  if (input.payday !== undefined) {
    assertInput(Number.isInteger(input.payday) && input.payday >= 1 && input.payday <= DAYS_IN_MONTH, "payday must be a day of the month (1–31)", {
      payday: input.payday,
    });
  }
  if (input.last6Incomes !== undefined) {
    assertInput(Array.isArray(input.last6Incomes), "last6Incomes must be an array", { last6Incomes: input.last6Incomes });
    for (const x of input.last6Incomes) assertInput(isFiniteNumber(x) && x >= 0, "every income in last6Incomes must be a finite number ≥ 0", { income: x });
  }
}
