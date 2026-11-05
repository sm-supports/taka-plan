/** M4 Save-first budget: income − savings = expenses. */
export const m4 = {
  title: "Save-first budget",
  intro: "Flip the equation. Save first on payday; spend what is left. The habit matters more than the amount.",
  demo: "Sample numbers for preview only. Your own inputs are not used on this view.",

  section: {
    inputs: "Your numbers",
    result: "Your save-first budget",
    where: "Where it goes",
    nextStep: "Next step",
  },

  input: {
    takeHome: { label: "Monthly take-home", hint: "What actually lands in your account." },
    essentials: { label: "Monthly essential spending", hint: "Rent, food, utilities, transport, school fees, support to parents, EMIs." },
    incomeType: { label: "How you earn", hint: "Freelancers and business owners save a share of each payment instead of a fixed sum." },
    savingsRate: {
      label: "Savings rate",
      hint: "We suggest {suggested} of take-home. Lower it to any amount you can actually keep up.",
      suggested: "Suggested: {rate}",
      useSuggested: "Use the suggestion",
    },
    payday: { label: "Day your salary lands", hint: "We will suggest a transfer the day after, before the money gets spent." },
    last6Incomes: { label: "Last six months' income", hint: "One figure per month. We use the average as your take-home.", month: "Month {n}" },
  },

  result: {
    equation: "{income} − {savings} = {expenses}",
    equationLabel: "Income − savings = expenses",
    averageIncome: "Average monthly income",
    suggestedRate: "Suggested savings rate",
    feasibleRate: "Most you could save",
    feasibleRateHint: "What is left after essentials, as a share of income.",
    savingsRate: "Savings rate",
    savingsAmount: "Save each month",
    expensesAllowed: "Left to spend",
    essentialsShortfall: "Essentials over budget by",
    essentialsShortfallHint: "Your essentials are higher than what is left after saving. Lower the rate, or look for one essential to trim.",
    modeLabel: "How you save",
    mode: {
      fixed: "A fixed amount every month",
      percentOfEachPayment: "A share of every payment you receive",
    },
    percentOfEachPayment: "Move {percent} of each payment to savings the day it arrives",
    instrument: "Put it in",
    instrumentHint: "The money moves automatically on a fixed day, so the saving happens before you can spend it.",
    transferDay: "Standing transfer on day {day} of each month",
    transferDayUnknown: "Tell us your payday and we will suggest a transfer date.",
  },

  next: {
    dps: "Ask your bank to open a {product} with auto-debit on day {day} of each month, the day after your salary lands. Any amount is fine; the habit matters more than the size.",
    dpsNoPayday: "Ask your bank to open a {product} with auto-debit on the day after your salary lands. Any amount is fine; the habit matters more than the size.",
    percentOfEachPayment: "The day a payment lands, move {percent} of it to a separate savings account before you spend any of it. Keep the share the same in big months and small ones; once the balance is steady, switch to a fixed monthly transfer.",
  },

  note: {
    instrumentDps: "We suggest an automatic monthly transfer because it happens on a fixed day, so the saving happens before you can spend it.",
  },

  status: {
    red: "Saving nothing yet",
    amber: "Saving a little — keep going",
    green: "Saving first every month",
  },
} as const;
