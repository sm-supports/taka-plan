/** M5 Goal planner. `note.*` covers M5_NOTE_KEYS. */
export const m5 = {
  title: "Goal planner",
  intro: "A real goal has an amount, a date and your age. Everyone has at least one: retirement.",

  input: {
    name: { label: "Goal name", hint: "Daughter's university, a flat deposit, Hajj, a car…", placeholder: "What are you saving for?" },
    cost: { label: "Cost in today's money", hint: "What it would cost if you paid today. We add inflation for you." },
    years: { label: "Years away", hint: "Whole years from now, {min} to {max}." },
    type: { label: "Type of goal", hint: "Education and health costs rise faster than general prices, so they get their own inflation rate." },
    addGoal: "Add a goal",
    removeGoal: "Remove goal",
    incomplete: "A goal needs a name, a cost and a number of years before it is saved.",
    newGoal: "New goal",
    saveGoal: "Save goal",
    saved: "Your goals",
  },

  result: {
    horizon: "Horizon",
    inflation: "Inflation applied",
    futureValue: "You will need",
    futureValueIn: "{fv} in {years}",
    instrument: "Save it in",
    candidates: "Other options for this horizon",
    nominal: "Headline rate",
    afterTax: "After tax",
    real: "Real return (after tax and inflation)",
    belowInflation: "Below inflation: this money will buy less at the end than it does today",
    monthly: "Save each month",
    monthlyRange: "Low {low} · Expected {base} · High {high}",
    monthlyLow: "If returns are low",
    monthlyBase: "Expected",
    monthlyHigh: "If returns are high",
    months: "Over {months}",
    totalMonthly: "All goals together",
    invalid: "This goal is missing something",
    empty: "No goals yet.",
    goalsCount: "{n} goal(s)",
    realAbove: "Beats inflation after tax",
    perMonth: "a month",
  },

  demoBanner: "Sample goals. Add your own to see your real numbers.",

  note: {
    noAllocationYet: "Long goals use fixed-income instruments only for now. Once the asset-allocation step is in, goals over five years away will use a mix with some equity.",
    belowInflation: "The expected return on this instrument is below inflation after tax. You will still reach the number, but it will buy less than you hoped. A longer horizon or a higher-paying instrument helps.",
  },

  status: {
    red: "Expected return is below inflation",
    amber: "Reachable, but tight",
    green: "On track",
  },
} as const;
