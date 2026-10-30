/**
 * Plan screen. `reason.*` and `next.*` cover PLAN_REASON_KEYS / PLAN_NEXT_KEYS.
 * Reason params (all pre-formatted strings):
 *   emergency:     {amount} {covered} {months}
 *   emergencyFull: {months}
 *   debt:          {rate} {amount} {months}
 *   goal:          {name} {amount} {instrument} {fv} {years}
 *   addGoal:       —
 *   insurance:     {amount}
 */
export const plan = {
  title: "Your plan",
  headline: "Save {amount} a month",
  subhead: "Split across your buckets in priority order. Tap a card to adjust it; the plan updates live.",
  emptyGoals: "No goals yet. Add one — retirement counts — and the plan will make room for it.",
  builtOn: "Built on rates v{version}",

  card: {
    amount: "Amount",
    instrument: "Where",
    reason: "Why",
    nextStep: "Next step",
    open: "Open calculator",
    priority: "Priority {n}",
    perMonth: "{amount}/month",
    bucket: {
      emergency: "Emergency fund",
      insurance: "Insurance",
      debt: "Debt payoff",
      goal: "Goal",
      future: "Future",
    },
  },

  summary: {
    title: "Summary",
    emergencyShare: "{share} of your monthly amount goes to the emergency fund until it is full.",
    monthsToFull: "Emergency fund full in {months}.",
    emergencyFull: "Your emergency fund is full.",
    goalsShortfall: "Your goals need {amount} more a month than the plan can fit right now.",
    noShortfall: "Every goal fits inside this month's amount.",
  },

  reason: {
    emergency: "Emergency fund — {amount}/month into a 3-month FDR ladder — you have {covered} of {months} months covered",
    emergencyFull: "Emergency fund — full at {months} months of essentials — keep it topped up after any use",
    debt: "High-interest debt at {rate} — {amount}/month on top of your EMI — cleared in about {months}",
    goal: "{name} — {amount}/month into {instrument} — you will need {fv} in {years}",
    addGoal: "Add a goal — every plan needs at least one, and retirement counts",
    insurance: "Insurance — {amount}/month set aside for term life and health cover",
  },

  next: {
    fdrLadder: "Visit any scheduled bank with your NID and TIN; ask for a 3-month FDR. Open one each month for three months so one matures every month.",
    openSavings: "Open a savings account at any scheduled bank with your NID. Keep one month of essentials there and leave the rest in FDRs.",
    prepayDebt: "Call your lender and ask how to make an extra principal payment without a penalty. Put it on the highest-rate debt first.",
    dps: "Ask your bank to open a DPS with auto-debit on the day after your salary lands. Any amount is fine; the habit matters more than the size.",
    sanchayapatra: "Take your NID, TIN and a cheque from your bank account to any bank branch or post office that sells Sanchayapatra; ask for the 5-year certificate.",
    tbond: "Ask your bank to register you for treasury auctions and bid for a 5- or 10-year bond; you can also buy an already-issued bond through a BO account.",
    fdr: "Visit any scheduled bank with your NID and TIN; ask for a 1-year FDR and keep the receipt somewhere safe.",
    addGoal: "Tap “Add a goal”, give it a name, its cost in today's taka and how many years away it is.",
  },
} as const;
