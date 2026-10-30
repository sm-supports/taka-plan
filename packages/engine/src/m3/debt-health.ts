import { createExplain } from "../explain";
import { roundDecimals, roundMoney, sum } from "../money";
import type { RatesSnapshot } from "../rates";
import { assertInput, isFiniteNumber, type ISODate, type Money } from "../types";
import { emi, maxLoan } from "./emi";
import { applyOneRedRule, buildFlags, isCarried, statusFromFlags } from "./flags";
import { simulatePayoff } from "./payoff";
import { M3_PATH_KEYS, type Card, type DebtSummary, type Loan, type LoanScenario, type M3Input, type M3Result } from "./types";

function assertMoney(x: unknown, name: string): asserts x is Money {
  assertInput(isFiniteNumber(x) && x >= 0, `${name} must be a finite amount ≥ 0`, { [name]: x });
}

function assertRate(x: unknown, name: string): asserts x is number {
  assertInput(isFiniteNumber(x) && x >= 0, `${name} must be a finite rate ≥ 0`, { [name]: x });
}

function assertLoan(l: Loan, i: number): void {
  assertInput(typeof l.id === "string" && l.id.length > 0, `loans[${i}].id must be a non-empty string`);
  assertMoney(l.outstanding, `loans[${i}].outstanding`);
  assertRate(l.annualRate, `loans[${i}].annualRate`);
  assertMoney(l.emi, `loans[${i}].emi`);
  assertInput(isFiniteNumber(l.monthsLeft) && l.monthsLeft >= 0, `loans[${i}].monthsLeft must be ≥ 0`, { monthsLeft: l.monthsLeft });
}

function assertCard(c: Card, i: number): void {
  assertInput(typeof c.id === "string" && c.id.length > 0, `cards[${i}].id must be a non-empty string`);
  assertMoney(c.balance, `cards[${i}].balance`);
  assertMoney(c.limit, `cards[${i}].limit`);
  if (c.annualRate !== undefined) assertRate(c.annualRate, `cards[${i}].annualRate`);
  assertInput(typeof c.paysInFull === "boolean", `cards[${i}].paysInFull must be a boolean`);
}

function assertScenario(s: LoanScenario): void {
  assertRate(s.annualRate, "scenario.annualRate");
  assertInput(isFiniteNumber(s.months) && s.months > 0, "scenario.months must be > 0", { months: s.months });
}

function validate(input: M3Input): void {
  assertInput(typeof input === "object" && input !== null, "input must be an object");
  assertMoney(input.takeHome, "takeHome");
  assertMoney(input.essentials, "essentials");
  assertMoney(input.savingsTarget, "savingsTarget");
  if (input.cashBuffer !== undefined) assertMoney(input.cashBuffer, "cashBuffer");
  if (input.extraMonthly !== undefined) assertMoney(input.extraMonthly, "extraMonthly");
  assertInput(Array.isArray(input.loans), "loans must be an array");
  assertInput(Array.isArray(input.cards), "cards must be an array");
  input.loans.forEach(assertLoan);
  input.cards.forEach(assertCard);
  if (input.scenario !== undefined) assertScenario(input.scenario);
}

/**
 * M3 debt health check (PRD "M3. Debt health check", contracts §M3).
 * Every threshold and default comes from the rates snapshot; rounding happens once, at the output.
 */
export function computeDebtHealth(input: M3Input, rates: RatesSnapshot, today: ISODate): M3Result {
  validate(input);
  const ex = createExplain(rates, today);

  // Policy rows. Thresholds are always recorded so "Why this number?" can show them.
  const cardMinShare = ex.use("card_min_payment_share");
  const emiRatioRed = ex.use("emi_ratio_red");
  const cardUtilisationAmber = ex.use("card_utilisation_amber");
  const highInterestThreshold = ex.use("high_interest_debt_threshold");

  const cashBuffer = input.cashBuffer ?? input.takeHome * ex.use("cash_buffer_share");
  const scenario: LoanScenario = input.scenario ?? { annualRate: ex.use("personal_loan_rate_default"), months: ex.use("personal_loan_tenure_default_months") };
  const cardRate = (c: Card): number => c.annualRate ?? ex.use("credit_card_rate_cap");

  // Carried cards: balance > 0 and not paid in full inside the grace period.
  const carriedCards = input.cards.filter(isCarried);
  const cardMinimum = (c: Card): number => c.balance * cardMinShare;

  // totalEmi = Σ loan.emi + Σ carried-card minimums.
  const loanEmis = sum(input.loans.map((l) => l.emi));
  const cardMinimums = sum(carriedCards.map(cardMinimum));
  const totalEmiRaw = loanEmis + cardMinimums;
  const emiRatio = input.takeHome > 0 ? totalEmiRaw / input.takeHome : 0;

  // EMI capacity = take-home − savings target − essentials − cash buffer (floored at 0).
  const rawCapacity = input.takeHome - input.savingsTarget - input.essentials - cashBuffer;
  const emiCapacityRaw = Math.max(0, rawCapacity);
  const headroomRaw = Math.max(0, emiCapacityRaw - totalEmiRaw);

  // "How much could I borrow?" scenario on the headroom.
  const maxLoanRaw = maxLoan(headroomRaw, scenario.annualRate, scenario.months);
  const maxAffordableLoan = roundMoney(maxLoanRaw, "lump");
  const scenarioEmiRaw = emi(maxAffordableLoan, scenario.annualRate, scenario.months);
  const scenarioEmi = roundMoney(scenarioEmiRaw, "monthly");

  // Flags and the one-red rule.
  const rawFlags = buildFlags({ cards: input.cards, emiRatio, rawCapacity }, { cardUtilisationAmber, emiRatioRed });
  const { flags, primaryFlag } = applyOneRedRule(rawFlags);
  const status = statusFromFlags(flags, primaryFlag);

  // Debt summaries: loans (minimum = EMI) and carried cards (minimum = balance × share).
  const loanSummary = (l: Loan): DebtSummary => ({ id: l.id, kind: "loan", balance: l.outstanding, annualRate: l.annualRate, minPayment: l.emi });
  const cardSummary = (c: Card): DebtSummary => ({ id: c.id, kind: "card", balance: c.balance, annualRate: cardRate(c), minPayment: cardMinimum(c) });
  const debts: DebtSummary[] = [...input.loans.map(loanSummary), ...carriedCards.map(cardSummary)];
  const highInterestDebts = debts
    .filter((d) => d.annualRate > highInterestThreshold)
    .map((d) => ({ ...d, minPayment: roundMoney(d.minPayment, "exact") }));

  // Payoff: avalanche vs snowball with the extra amount (default: headroom).
  const extraMonthly = input.extraMonthly ?? headroomRaw;
  const avalanche = simulatePayoff(debts, extraMonthly, "avalanche");
  const snowball = simulatePayoff(debts, extraMonthly, "snowball");
  const interestSavedRaw = Math.max(0, snowball.totalInterest - avalanche.totalInterest);
  const interestSaved = roundMoney(interestSavedRaw, "interest");

  // Explanation steps, in M3_STEP_IDS order.
  const totalEmi = ex.step({ id: "m3.totalEmi", inputs: { emis: loanEmis, cardMinimums }, raw: totalEmiRaw, rounded: roundMoney(totalEmiRaw, "exact"), unit: "bdt" });
  ex.step({ id: "m3.emiRatio", inputs: { totalEmi, takeHome: input.takeHome }, raw: emiRatio, rounded: roundDecimals(emiRatio, 3), unit: "rate" });
  const emiCapacity = ex.step({
    id: "m3.capacity",
    inputs: { takeHome: input.takeHome, savings: input.savingsTarget, essentials: input.essentials, buffer: cashBuffer },
    raw: rawCapacity,
    rounded: roundMoney(emiCapacityRaw, "monthly"),
    unit: "bdt",
  });
  const monthlyRate = scenario.annualRate / 12;
  ex.step({ id: "m3.maxLoan", inputs: { capacity: headroomRaw, monthlyRate, months: scenario.months }, raw: maxLoanRaw, rounded: maxAffordableLoan, unit: "bdt" });
  ex.step({ id: "m3.scenarioEmi", inputs: { principal: maxAffordableLoan, monthlyRate, months: scenario.months }, raw: scenarioEmiRaw, rounded: scenarioEmi, unit: "bdt" });
  ex.step({
    id: "m3.interestSaved",
    inputs: { snowballInterest: snowball.totalInterest, avalancheInterest: avalanche.totalInterest },
    raw: interestSavedRaw,
    rounded: interestSaved,
    unit: "bdt",
  });

  return {
    totalEmi,
    emiRatio,
    emiCapacity,
    headroom: roundMoney(headroomRaw, "monthly"),
    maxAffordableLoan,
    scenario: { annualRate: scenario.annualRate, months: scenario.months, emi: scenarioEmi },
    flags,
    primaryFlag,
    status,
    highInterestDebts,
    avalanche,
    snowball,
    interestSaved,
    debtTrapPath: [...M3_PATH_KEYS],
    explain: ex.done(),
  };
}
