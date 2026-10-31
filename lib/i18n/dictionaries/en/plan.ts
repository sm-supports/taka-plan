/**
 * Plan screen. `reason.*` and `next.*` cover PLAN_REASON_KEYS / PLAN_NEXT_KEYS.
 * Reason params (all pre-formatted strings):
 *   emergency:     {amount} {covered} {months} {instrument}
 *   emergencyFull: {months}
 *   debt:          {rate} {amount} {months} (+ count)
 *   goal:          {name} {amount} {instrument} {fv} {years}
 *   addGoal:       —
 *   insurance:     {amount}
 *   retirement:    {amount} {planTo}
 *   future:        {amount} {instrument}
 */
export const plan = {
  title: "Your plan",
  headline: "Save {amount} a month",
  subhead: "Split across your buckets in priority order. Tap a card to adjust it; the plan updates live.",
  emptyGoals: "No goals yet. Add one — retirement counts — and the plan will make room for it.",
  builtOn: "Built on rates v{version}",
  demoBanner: "Sample plan built from demo numbers, not yours. Open the plan without the demo switch to see your own.",

  why: {
    headline: "Why save {amount} a month?",
    bucket: "Why {amount} for {bucket}?",
  },

  error: {
    title: "Your plan is not ready yet",
    retry: "Try again",
  },

  card: {
    amount: "Amount",
    instrument: "Where",
    reason: "Why",
    nextStep: "Next step",
    open: "Open calculator",
    priority: "Priority {n}",
    perMonth: "{amount}/month",
    goalTitle: "Goal: {name}",
    bucket: {
      emergency: "Emergency fund",
      insurance: "Insurance",
      debt: "Debt payoff",
      goal: "Goal",
      retirement: "Retirement",
      future: "Future",
    },
  },

  more: {
    title: "Complete your plan",
    start: "Start",
    edit: "Edit",
    reserved: "The plan sets aside {amount} a month for this.",
    m2: { title: "Insurance & health", body: "How much life and health cover your family needs, and what it should roughly cost." },
    m6: { title: "Asset mix", body: "How to split long-term money across fixed income, shares and gold for your age." },
    m7: { title: "Retirement & family", body: "What you need to live on your own money to 100, and which income sources lower it." },
  },

  summary: {
    title: "Summary",
    emergencyShare: "{share} of your monthly amount goes to the emergency fund until it is full.",
    monthsToFull: "Emergency fund full in {months}.",
    emergencyFull: "Your emergency fund is full.",
    goalsShortfall: "Your goals need {amount} more a month than the plan can fit right now.",
    noShortfall: "Every goal fits inside this month's amount.",
    retirementShortfall: "Retirement needs {amount} more a month than the plan can fit right now.",
  },

  reason: {
    emergency: "Emergency fund — {amount}/month into {instrument} — you have {covered} of {months} months covered",
    emergencyFull: "Emergency fund — full at {months} months of essentials — keep it topped up after any use",
    debt: "High-interest debt at {rate} — {amount}/month on top of your EMI — cleared in about {months} at this pace",
    goal: "{name} — {amount}/month into {instrument} — you will need {fv} in {years}",
    addGoal: "Add a goal — every plan needs at least one, and retirement counts",
    insurance: "Insurance — {amount}/month set aside for term life and health cover",
    retirement: "Retirement — {amount}/month so your money lasts to age {planTo}",
    retirementShort: "Retirement — {amount}/month of the {need} you need — lasts to age {lastsTo}",
    future: "Long-term savings — {amount}/month into {instrument} until you add a goal",
  },

  next: {
    fdrLadder: "Visit any bank with your national ID and tax number; ask for a 3-month {product}. Open one each month for three months so one matures every month.",
    openSavings: "Open a {product} at any bank with your national ID. Keep one month of essentials there and leave the rest in 3-month deposits.",
    prepayDebt: "Call your lender and ask how to make an extra principal payment without a penalty. Put it on the highest-rate debt first.",
    dps: "Ask your bank to open a {product} with auto-debit on the day after your salary lands. Any amount is fine; the habit matters more than the size.",
    sanchayapatra: "Take your national ID, your tax number and a cheque from your bank account to a bank branch or post office that sells government savings certificates, and ask for a {product}.",
    tbond: "Ask your bank to register you for government bond auctions and bid for a 5- or 10-year {product}; you can also buy one already issued through a brokerage account.",
    fdr: "Visit any bank with your national ID and tax number; ask for a 1-year {product} and keep the receipt somewhere safe.",
    addGoal: "Tap “Add a goal”, give it a name, its cost in today's money and how many years away it is.",
    keepFull: "Your fund is full: leave it where it is. After any withdrawal, put the same amount back before any other saving, so it is whole again.",
    insurance: "Open the insurance check: it works out the life and health cover your family needs and what it should roughly cost.",
    retirement: "Open the retirement plan: see what you need to live on your own money to 100, and which income sources lower it.",
    allocation: "Open the asset mix: it splits long-term money across fixed income, shares and gold for your age.",
  },
} as const;
