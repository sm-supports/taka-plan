/**
 * Asset mix screen (M6). Owned by the m6 UI slice: every string the m6 screens show.
 * `note.*` covers M6_NOTE_KEYS, `gate.*` M6_GATE_KEYS and `howto.*` M6_HOWTO_KEYS.
 * Never name a company, fund, broker or bank.
 */
export const m6 = {
  title: "Asset mix",
  intro: "How to split your long-term money between fixed income, equity and gold, what to buy for each part, and how to keep the split on target.",
  demo: "Sample numbers for preview only. Your own answers are not used on this view.",
  needProfile: "Answer the five starting questions first, so the mix can use your age and how you earn.",
  startLink: "Answer the starting questions",
  backToPlan: "Back to my plan",
  disclaimer: "Educational estimates, not investment advice. Markets can fall and stay down for years, and past returns do not predict future ones.",

  flow: {
    progress: "Question {n} of {total}",
    gate: {
      title: "Do you have an emergency fund and no card debt?",
      hint: "Long-term money comes after a full emergency fund and after card debt is paid off. Here is what your plan says.",
      emergencyOk: "Your emergency fund is full.",
      emergencyMissing: "Your emergency fund is not full yet.",
      cardOk: "You carry no card debt.",
      cardMissing: "You carry a card balance from month to month.",
      openEmergency: "Open the emergency fund",
      openDebt: "Open the debt check",
      allClear: "Good: you are ready to invest for the long term.",
      continue: "Continue",
      continueAnyway: "Continue anyway",
    },
    ageBand: {
      title: "Which age group are you in?",
      hint: "Filled in from your age. Younger savers have more years to ride out a fall.",
    },
    incomeStability: {
      title: "How steady is your income?",
      hint: "Filled in from how you earn. Steadier income can carry a little more risk.",
    },
    horizon: {
      title: "When will you need this money?",
      hint: "Money you need soon should not sit in shares.",
    },
    reaction: {
      title: "If your investments fell 20% in a year, you would…",
      hint: "There is no wrong answer. Be honest: it decides how much equity you can live with.",
    },
    amounts: {
      title: "How much will you invest?",
      hint: "A lump sum, a monthly amount, or both. You can change them later.",
      needOne: "Enter a lump sum or a monthly amount to see your mix.",
      seeResult: "See my mix",
    },
  },

  answer: {
    ageBand: { "0": "50 or older", "1": "35 to 49", "2": "Under 35" },
    incomeStability: { "0": "Business income", "1": "Freelance or irregular", "2": "Salaried" },
    horizon: { "0": "Within 5 years", "1": "In 5 to 10 years", "2": "In more than 10 years" },
    reaction: { "0": "Sell, to stop the loss", "1": "Wait for it to recover", "2": "Buy more while it is cheap" },
  },

  profile: {
    careful: "Careful",
    balanced: "Balanced",
    growth: "Growth",
  },

  bucket: {
    fixedIncome: "Fixed income",
    equity: "Equity",
    gold: "Gold",
  },

  section: {
    result: "Your mix",
    instruments: "What to buy",
    projection: "What it could grow to",
    rebalance: "I already invest",
    inputs: "Your answers",
    netWorth: "Net worth",
    notes: "Good to know",
  },

  input: {
    ageBand: { label: "Age group" },
    incomeStability: { label: "How steady is your income" },
    horizon: { label: "When you need the money" },
    reaction: { label: "If your investments fell 20% in a year" },
    profileOverride: {
      label: "Risk profile",
      hint: "We suggest one from your answers. You can pick another; equity never goes above the cap.",
      suggested: "Suggested from your answers",
    },
    goldShare: {
      label: "Gold share",
      hint: "A hedge, kept between {min} and {max} of the mix.",
      reset: "Back to {share}",
    },
    horizonYears: {
      label: "Years until you need the money",
      hint: "Under {noEquity} years there is no equity; under {cashOnly} year only deposits and bills.",
    },
    lumpSum: {
      label: "Lump sum to invest now",
      hint: "Money you can put away for the long term today.",
    },
    monthly: {
      label: "Monthly amount",
      hint: "What you can add every month.",
    },
    propertyValue: {
      label: "Property you own (optional)",
      hint: "Land or a flat. It counts in your net worth but not in the split, because it cannot be bought or sold in small parts.",
    },
    directShares: {
      label: "Buy shares directly instead of a fund?",
      hint: "Only if you are ready to pick and watch at least ten large companies yourself.",
    },
  },

  result: {
    score: "Risk score {score} of {max}",
    profileLine: "Your profile: {profile}",
    suggestedLine: "Suggested from your answers: {profile}",
    barLabel: "Your mix: {parts}",
    lump: "lump sum",
    monthly: "Each month",
    whySplit: "Why this split?",
    horizon: {
      noEquity: "You need this money within a few years, so the equity part moved to fixed income.",
      cashOnly: "You need this money within a year, so all of it stays in deposits or bills.",
    },
  },

  instrument: {
    title: "{bucket}: {share}",
    primary: "Start with",
    alternatives: "Other choices",
    unavailable: "Not available in your country. Keep this part in fixed income for now.",
    localName: "Local name: {name}",
  },

  projection: {
    intro: "{years} years, {paidIn} paid in. Three cases, because nobody knows which one will happen.",
    introNone: "Enter a lump sum or a monthly amount to see the range.",
    low: "Low",
    base: "Base",
    high: "High",
    rate: "{rate} a year",
    real: "{amount} in today's money",
    lowLosesValue: "In the low case your money grows slower than prices and loses buying power.",
    why: "Why these numbers?",
  },

  rebalance: {
    intro: "Enter what you hold today in each part, and any new money to add. We work out what to buy or sell to get back to your mix.",
    open: "I already invest",
    close: "Hide",
    holding: "{bucket} you hold now",
    newMoney: { label: "New money to add (optional)", hint: "New money goes to the parts that are behind first." },
    clear: "Clear what I hold",
    total: "Total after the change: {amount}",
    buy: "Buy {amount}",
    sell: "Sell {amount}",
    none: "No change",
    target: "Target {share}",
    drift: "Now {current}, {drift} from target",
    triggered: "At least one part is more than {band} away from target: time to rebalance.",
    withinBand: "Every part is within {band} of target. Rebalance once a year anyway.",
    newMoneyOnly: "New money alone closes the gap: nothing needs selling.",
    sellNote: "Selling means exit costs and possibly tax. Where you can, direct new money to the parts that are behind over the next months instead.",
    why: "Why these trades?",
  },

  netWorth: {
    inMix: "Invested in the mix",
    property: "Property (outside the split)",
    total: "Net worth",
  },

  note: {
    capApplied: "Equity is held at the cap, however long your horizon.",
    horizonNoEquity: "You need this money within five years, so it holds no equity. Shares can stay down for years.",
    horizonCashOnly: "You need this money within a year, so it stays in short deposits or treasury bills only.",
    propertyExcluded: "Property counts in your net worth but not in the split: it cannot be bought or sold in small parts or rebalanced.",
    lowLosesValue: "In the low case the money grows slower than prices, so it buys less than what you paid in.",
    noIndexFund: "No index fund, gold bond or property fund is sold here, so the equity part uses a diversified open-end fund and gold is bought as bars or coins.",
    neverBreakCertificates: "Never cash a savings certificate early to rebalance: the rate drops sharply in the early years. Use new money instead.",
    exitCosts: "Before you sell, check exit costs, dividend tax and the price a jeweller will pay for gold.",
  },

  gate: {
    noEmergencyFund: "Fill your emergency fund first. Long-term money you might have to sell in a hurry is not long-term money.",
    cardDebt: "Pay off card debt first. Card interest is far higher than any investment is likely to earn.",
  },

  howto: {
    fixedIncome:
      "Government savings certificates are sold at bank branches and post offices that offer them, treasury bills and bonds through a bank's government securities desk, and term deposits at any scheduled bank. Bring your national ID; larger amounts need a tax ID or proof of a tax return.",
    equityFund:
      "Choose a diversified open-end fund and start a monthly plan with the fund manager or a bank that sells its units. Bring your national ID and a bank account. Spread over many companies; never put this part in one share.",
    directShares:
      "You need a BO account with a brokerage. Hold at least ten large companies across five or more sectors, with no single share above a tenth of this part. Expect to watch them yourself.",
    gold: "Buy 22-carat bars or coins from a jeweller who is a member of the jewellers' association, and keep the receipt. Jewellery costs a making charge and sells back for less, so it is for wearing, not investing.",
  },
} as const;
