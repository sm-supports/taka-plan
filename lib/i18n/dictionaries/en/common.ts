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
    why: "Why?",
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
    m2: "Insurance & health",
    m3: "Debt health check",
    m4: "Save-first budget",
    m5: "Goal planner",
    m6: "Asset mix",
    m7: "Retirement & family",
    plan: "Your plan",
  },

  instrument: {
    savings_account: "Savings account",
    fdr_3m: "3-month fixed deposit",
    fdr_1y: "1-year fixed deposit",
    dps: "Recurring deposit",
    sanchayapatra_5y: "Government savings certificate",
    tbill_91d: "91-day treasury bill",
    tbond_5y: "5-year treasury bond",
    tbond_10y: "10-year treasury bond",
    equity_fund: "Open-end equity fund",
    gold: "Gold (22K bars or coins)",
    loan_prepayment: "Extra loan payment",
    term_insurance: "Term life insurance",
  },

  /** Product names inside a sentence, when the country data has none (useProductName). */
  productProse: {
    savings_account: "savings account",
    fdr_3m: "fixed deposit",
    fdr_1y: "fixed deposit",
    dps: "recurring deposit",
    sanchayapatra_5y: "government savings certificate",
    tbill_91d: "treasury bill",
    tbond_5y: "government bond",
    tbond_10y: "government bond",
    equity_fund: "equity fund",
    gold: "gold",
  },

  /** An instrument inside a sentence ("into {instrument}"); {product} is the country's product name. */
  instrumentInline: {
    savings_account: "a {product}",
    fdr_3m: "3-month {product}s",
    fdr_1y: "a 1-year {product}",
    dps: "a {product}",
    sanchayapatra_5y: "a {product}",
    tbill_91d: "91-day {product}s",
    tbond_5y: "a 5-year {product}",
    tbond_10y: "a 10-year {product}",
    equity_fund: "an open-end equity fund",
    gold: "gold bars or coins",
    loan_prepayment: "extra loan payments",
    term_insurance: "term life insurance",
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
  ourSource: "Taka Plan (our assumption)",
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
      "Taka Plan gives estimates for education only. It is not financial, tax or legal advice, and it never names a bank, fund or insurer. Rates and tax rules change several times a year, so check with your bank or insurer before acting on any number here. Past returns don't predict future returns. Your answers stay on your phone.",
    accept: "I understand",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "Choose language",
  },
  /** Header language menu button: {language} is the current language's own name. */
  languageMenu: "Language: {language}",
  changeCountry: "Change country",
  /** Header country link: {country} is the country code shown in the header. */
  countryLink: "Country {country}. Change country",

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

  /** "Start from the beginning" and the drafts it keeps (components/drafts). */
  drafts: {
    startOver: "Start from the beginning",
    startOverHint: "Your current answers are kept as a draft.",
    confirmTitle: "Start from the beginning?",
    confirmBody: "Your current answers are kept as a draft. You can open it again any time from Your drafts.",
    confirm: "Yes, start again",
    cancel: "Cancel",
    saved: "Saved as a draft",
    alreadySaved: "Already saved as a draft",
    deleted: "Draft deleted",
    title: "Your drafts",
    sectionTitle: "Your drafts ({count})",
    intro: "Answers you kept when you started again. Open one to see its plan.",
    empty: "No drafts yet. When you start from the beginning, your current answers are kept here.",
    seeAll: "See all drafts",
    backToPlan: "Back to my plan",
    updated: "Updated {date}",
    current: "Open now",
    open: "Open",
    rename: "Rename",
    renameLabel: "Draft name",
    renameHint: "Up to {max} letters. Leave it empty to use the automatic name.",
    delete: "Delete",
    deleteTitle: "Delete this draft?",
    deleteBody: "It is removed from this phone and cannot be brought back.",
    deleteConfirm: "Yes, delete",
    /** Shown before saving would push the oldest unnamed draft out (lib/store/drafts.ts capDrafts). */
    capWarning: "You already have {max} drafts, so the oldest one without a name, “{label}”, will be removed. Give a draft a name to keep it.",
    openTitle: "Open this draft?",
    openConfirm: "Yes, open it",
    label: {
      age: "Age {age}",
      takeHome: "{amount}/month",
      goalsOne: "{count} goal",
      goalsOther: "{count} goals",
      m2: "Insurance",
      m6: "Investments",
      m7: "Retirement",
    },
  },

  /** Banner under the header about the chosen country's data (components/layout/CountryNotice). */
  countryNotice: {
    noData: "We don't have researched figures for {country} yet, so amounts use Bangladesh's figures and taka.",
    changeCountry: "Change country",
    someFallback: "Some figures for {country} are regional estimates, not its own.",
    about: "Where the numbers come from",
  },
} as const;
