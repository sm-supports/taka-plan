/** Shared strings: app chrome, buttons, status labels, instrument names, enum labels, disclaimer. */
export const common = {
  appName: "Taka Plan",
  tagline: "How much you need for each goal, and where to put it every month.",
  loading: "Loading…",
  yes: "Yes",
  no: "No",
  optional: "Optional",

  nav: {
    home: "Home",
    plan: "My plan",
    calculators: "Calculators",
    admin: "Rates admin",
    language: "Language",
  },

  button: {
    next: "Next",
    back: "Back",
    seePlan: "See my plan",
    whyThisNumber: "Why this number?",
    close: "Close",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    reset: "Start over",
    tryAgain: "Try again",
    learnMore: "Learn more",
    add: "Add",
    remove: "Remove",
    done: "Done",
    skip: "Skip",
    openCalculator: "Open calculator",
  },

  status: {
    red: "Needs attention now",
    amber: "Watch this",
    green: "On track",
  },
  alsoNeedsAttention: "Also needs attention",

  module: {
    m1: "Emergency fund",
    m2: "Insurance needs",
    m3: "Debt health check",
    m4: "Save-first budget",
    m5: "Goal planner",
    m6: "Asset allocation",
    m7: "Retirement to 100",
    plan: "Your plan",
  },

  instrument: {
    savings_account: "Savings account",
    fdr_3m: "3-month FDR",
    fdr_1y: "1-year FDR",
    dps: "DPS",
    sanchayapatra_5y: "5-year Sanchayapatra",
    tbill_91d: "91-day treasury bill",
    tbond_5y: "5-year treasury bond",
    tbond_10y: "10-year treasury bond",
    equity_fund: "Open-end equity fund",
    gold: "Gold (22K bars or coins)",
    loan_prepayment: "Extra loan payment",
    term_insurance: "Term life insurance",
  },

  unit: {
    month: "month",
    months: "months",
    year: "year",
    years: "years",
    perMonth: "/month",
    perYear: "a year",
    taka: "৳",
    percent: "%",
  },

  offline: "You're offline — using saved rates",
  ratesVersion: "Rates v{version}, {asOf}",
  mayBeOutdated: "May be outdated",
  ourAssumption: "Our assumption",
  source: "Source",
  asOf: "As of {date}",
  range: "Range {low}–{high}",
  afterTax: "After tax",
  afterInflation: "After inflation",
  headline: "Headline rate",

  disclaimer: {
    short:
      "Estimates for education only; not financial, tax or legal advice. Rates change — check with your bank or insurer before acting. Past returns don't predict future returns.",
    title: "Before you start",
    body:
      "Taka Plan gives estimates for education only. It is not financial, tax or legal advice, and it never names a bank, fund or insurer. Rates and tax rules in Bangladesh change several times a year, so check with your bank or insurer before acting on any number here. Past returns don't predict future returns. Your answers stay on your phone unless you choose to save a plan.",
    accept: "I understand",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "Choose language",
  },

  incomeType: {
    salaried: "Salaried",
    freelance: "Freelancer",
    business: "Business owner",
  },

  dependent: {
    none: "No one",
    partner: "Partner",
    children: "Children",
    parents: "Parents",
  },

  goalType: {
    general: "General",
    education: "Education",
    health: "Health",
    wedding: "Wedding",
    vehicle: "Vehicle",
    home: "Home or land",
    travel: "Travel",
  },

  loanType: {
    personal: "Personal loan",
    home: "Home loan",
    car: "Car loan",
    education: "Education loan",
    other: "Other loan",
  },

  horizon: {
    short: "Under 3 years",
    medium: "3 to 5 years",
    long: "Over 5 years",
  },

  explain: {
    title: "Why this number?",
    steps: "How we got here",
    assumptions: "Rates used",
    notes: "Notes",
    stale: "This rate is past its review date",
  },
} as const;
