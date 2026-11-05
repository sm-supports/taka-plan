/** M3 Debt health check. `path.*` covers M3_PATH_KEYS, `flag.<DebtFlagId>` covers every DebtFlagId. */
export const m3 = {
  title: "Debt health check",
  intro: "List every loan and card by rate. Pay the costliest first, and never borrow for lifestyle.",

  input: {
    takeHome: { label: "Monthly take-home", hint: "What actually lands in your account each month." },
    essentials: { label: "Monthly essential spending", hint: "Rent, food, utilities, transport, school fees, support to parents." },
    savingsTarget: { label: "Monthly savings", hint: "Your save-first amount from the budget. It is reserved before any EMI." },
    cashBuffer: { label: "Cash buffer", hint: "A little slack each month for the unexpected. We suggest a share of take-home; change it if you like." },
    extraMonthly: { label: "Extra towards debt each month", hint: "Anything above your minimum payments. Leave blank to use whatever headroom you have." },
    loans: {
      title: "Loans",
      add: "Add a loan",
      remove: "Remove loan",
      empty: "No loans added.",
      type: { label: "Loan type", hint: "Pick the closest match; it only changes the label." },
      outstanding: { label: "Amount still owed", hint: "The principal left today, from your latest statement." },
      annualRate: { label: "Interest rate (a year)", hint: "The rate on your loan agreement or statement." },
      emi: { label: "Monthly EMI", hint: "The fixed amount you pay each month." },
      monthsLeft: { label: "Months left", hint: "Instalments still to pay." },
    },
    cards: {
      title: "Credit cards",
      add: "Add a card",
      remove: "Remove card",
      empty: "No cards added.",
      balance: { label: "Balance owed", hint: "The amount on your latest statement." },
      limit: { label: "Card limit", hint: "The maximum the bank lets you spend." },
      annualRate: { label: "Interest rate (a year)", hint: "Leave blank to use the legal or typical card rate." },
      paysInFull: { label: "Do you pay the full bill every month, inside the grace period?", hint: "If yes, the card costs you nothing. If no, it is the most expensive money you have." },
    },
    scenario: {
      title: "How much could I borrow?",
      annualRate: { label: "Loan rate (a year)", hint: "The rate a bank has quoted you, or our default for a personal loan." },
      months: { label: "Repayment period", hint: "In months." },
    },
  },

  result: {
    totalEmi: "Total monthly EMIs",
    emiRatio: "EMIs as a share of take-home",
    emiCapacity: "EMI capacity",
    emiCapacityHint: "What is left for EMIs after savings, essentials and a cash buffer.",
    headroom: "Headroom",
    headroomHint: "EMI capacity minus the EMIs you already pay.",
    maxAffordableLoan: "Maximum affordable loan",
    scenario: "At {rate} over {months}",
    scenarioEmi: "Monthly EMI for this loan",
    flags: "Flags",
    noFlags: "No flags. Your debt is under control.",
    noDebt: "No loans or cards. Nothing to fix here — keep it that way.",
    highInterestDebts: "Debt above {threshold} a year",
    payoffOrder: "Payoff order",
    payoffOrderHint: "Highest rate first. Pay the minimum on everything else and put all your spare money toward the top of the list.",
    avalanche: "Highest rate first",
    snowball: "Smallest balance first",
    interestSaved: "Interest saved by going highest-rate first",
    payoffMonths: "Debt-free in {months}",
    totalInterest: "Total interest",
    minPayment: "Minimum payment",
    path: "If you feel trapped",
    emiRatioNote: "Lenders set their own limits. We flag anything above {threshold} of take-home because little is left to save or absorb a shock.",
    maxLoanNote: "The exact formula gives about {loan} for a {emi} monthly EMI at {rate} over {months}. Banks also look at your income and record, so add your own safety margin before you borrow.",
    primaryFlag: "Most urgent",
    otherFlags: "Also worth fixing",
    cardLabel: "Credit card",
    extraUsed: "Extra towards debt: {amount} a month",
    compare: "Compared with smallest balance first",
    numbers: "Your numbers",
    borrow: "How much could I borrow?",
  },

  profile: {
    title: "From your profile",
    hint: "Change these and your plan updates too.",
  },

  demoBanner: "Sample numbers. Add your own loans and cards to see your real picture.",

  flag: {
    card_carried: {
      title: "Card balance carried past the due date",
      body: "Interest on a carried card balance runs at about {rate} a year — the most expensive money there is. Clear this before any other debt.",
    },
    card_utilisation: {
      title: "Card use above {threshold} of the limit",
      body: "You are using {value} of your card limit. Keep it under half: it lowers the bill, protects your CIB record and leaves room for a real emergency.",
    },
    emi_ratio: {
      title: "EMIs above {threshold} of take-home",
      body: "{value} of your take-home goes to EMIs. Lenders set their own limits; we flag anything above {threshold} because little is left to save or absorb a shock.",
    },
    negative_capacity: {
      title: "No room for any EMI",
      body: "After savings, essentials and a cash buffer, nothing is left for loan payments. Cut expenses, raise income or restructure the debt before borrowing more.",
    },
  },

  path: {
    listLoans: "Write down every loan and card: the amount owed, the rate and the monthly payment. Sort by rate, highest first.",
    tellFamily: "Tell your family. Hiding debt makes it grow; a household that knows can cut spending together.",
    stopBorrowing: "Stop all new borrowing, including card spending you cannot pay in full this month.",
    sellUnaffordable: "Sell anything you bought on credit that you could not really afford — a bike, a phone, a gadget — and put the money on the costliest debt.",
    refinanceCheaper: "Refinance only when the new loan is clearly cheaper after fees, and never to free up room for more spending.",
  },

  status: {
    red: "Expensive debt needs action now",
    amber: "Manageable, but watch it",
    green: "Debt under control",
  },
} as const;
