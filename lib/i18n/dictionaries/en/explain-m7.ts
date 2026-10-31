/**
 * "Why this number?" entries for M7 steps (explain.m7.<step>), owned by the m7 UI slice.
 * Placeholders are the engine's input names (ex.step calls in packages/engine/src/m7/retirement.ts)
 * plus {result}. A step the working and retired paths share uses only the names both send:
 *
 *   m7.spendingAtRetirement  {monthlySpending} {inflation} {retireInYears} {result}
 *                            (+ working: rentMonthly, rentAtRetirement)
 *   m7.corpusContrast        {spendingAtRetirement} {returnRate} {inflation} {retiredForYears} {result}
 *   m7.corpusPlan            {spendingAtRetirement} {returnRate} {inflation} {retiredForYears} {result}
 *   m7.savingsFv             {savings} {accumulationRate} {retireInYears} {result}
 *   m7.providentFund         {balance} {monthlyContribution} {fundRate} {retireInYears} {result}
 *   m7.gratuity              {basicMonthly} {daysPerMonthCount} {daysCount} {serviceYears} {result}
 *   m7.fixedPensions         {publicPensionMonthly} {fixedPensionMonthly} {returnRate} {retiredForYears} {pensionFromAgeYears} {result}
 *                            (only when a pension or, retired, other income was added; also providentFund / gratuity)
 *   m7.gap                   {corpus} {fixedPensions} {result}  (+ working: savingsFv, providentFund, gratuity; retired: savings)
 *   m7.monthly               {gap} {monthlyRate} {savingMonths} {result}
 *   m7.withdrawal            {savings} {returnRate} {inflation} {retiredForYears} {result}
 *   m7.safePot               {firstYear} {potYears} {result}
 */
export const explainM7 = {
  spendingAtRetirement: {
    title: "Spending in your first year of retirement",
    body: "Today's spending of {monthlySpending} a month, times 12, grown by prices at {inflation} a year for the {retireInYears} years until you stop: 12 × {monthlySpending} × (1 + {inflation})^{retireInYears}. Rent you receive comes off first, since it also rises with prices. Result: {result} a year.",
  },
  corpusContrast: {
    title: "Target to the comparison age",
    body: "The pot that pays {spendingAtRetirement} in the first year, rising with prices ({inflation}), for {retiredForYears} years while the rest earns {returnRate} after tax: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. Shown only for comparison.",
  },
  corpusPlan: {
    title: "Target to last to your plan-to age",
    body: "The same formula over {retiredForYears} years: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. It is exactly the pot the year-by-year chart spends down to zero at that age.",
  },
  savingsFv: {
    title: "Your savings when you stop",
    body: "What you have today, {savings}, left invested at {accumulationRate} a year for {retireInYears} years: {savings} × (1 + {accumulationRate})^{retireInYears} = {result}.",
  },
  providentFund: {
    title: "Provident fund when you stop",
    body: "Today's balance of {balance} plus {monthlyContribution} paid in each month, both growing at the fund's own rate of {fundRate} for {retireInYears} years = {result}.",
  },
  gratuity: {
    title: "Gratuity",
    body: "Last basic pay of {basicMonthly} ÷ {daysPerMonthCount} days × {daysCount} days for each of {serviceYears} years of service = {result}, paid as a lump sum when you leave.",
  },
  fixedPensions: {
    title: "Fixed pensions, valued when you stop",
    body: "A public pension of {publicPensionMonthly} a month from age {pensionFromAgeYears} and other fixed income of {fixedPensionMonthly} a month, paid until your plan-to age ({retiredForYears} years of retirement) without rising with prices, are worth this much when you stop, at {returnRate}: {result}. That is why their buying power shrinks over a long retirement.",
  },
  gap: {
    title: "Still to build",
    body: "The target of {corpus}, minus everything that will already be there (your savings, provident fund, gratuity and the value of fixed pensions), never below zero: {result}.",
  },
  monthly: {
    title: "Monthly saving",
    body: "The amount that, paid every month for {savingMonths} months and growing at {monthlyRate} a month, adds up to {gap}: {gap} × {monthlyRate} ÷ ((1 + {monthlyRate})^{savingMonths} − 1) = {result}, rounded up so it is enough.",
  },
  withdrawal: {
    title: "First-year withdrawal",
    body: "What {savings} can pay in the first year, rising with prices ({inflation}) each year after, so it lasts {retiredForYears} years while earning {returnRate}: {savings} × ({returnRate} − {inflation}) ÷ (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) = {result}, rounded down so it never runs short.",
  },
  safePot: {
    title: "The safe pot",
    body: "The first year's withdrawal of {firstYear} times {potYears} years = {result}, kept somewhere safe and quick to reach.",
  },
} as const;
