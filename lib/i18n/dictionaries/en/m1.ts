/** M1 Emergency fund. `rule.*` covers M1_RULE_KEYS, `next.*` covers M1_NEXT_KEYS. */
export const m1 = {
  title: "Emergency fund",
  intro: "Money you can reach within a day or two when income stops or a bill lands. Size it to your family, not to a fixed rule.",

  input: {
    essentials: {
      label: "Monthly essential spending",
      hint: "Rent, food, utilities, transport, school fees, support to parents, existing EMIs.",
    },
    incomeType: {
      label: "How you earn",
      hint: "Freelance and business income is less steady, so the buffer starts bigger.",
    },
    dependents: {
      label: "Who depends on you",
      hint: "Pick everyone that applies.",
    },
    soleEarner: {
      label: "Are you the only earner at home?",
      hint: "If nobody else brings in money, the fund needs to last longer.",
    },
    hasHealthInsurance: {
      label: "Do you have health insurance?",
      hint: "Without cover, a hospital bill comes out of this fund, so it gets bigger.",
    },
    liquidSavings: {
      label: "Savings you can reach today",
      hint: "Cash, savings accounts and FDRs you could cash within a few days. Not Sanchayapatra, shares or gold.",
    },
    months: {
      label: "Months of cover",
      hint: "We suggest a starting point; slide to what feels right for your family, from {min} to {max} months.",
    },
    buildMonths: {
      label: "Build it over",
      hint: "How many months you want to take to fill the fund.",
    },
  },

  result: {
    suggestedMonths: "Suggested cover: {months}",
    months: "Months of cover",
    target: "Target",
    saved: "Already saved",
    gap: "Still to save",
    monthlySaving: "Monthly saving",
    monthsCovered: "Months covered",
    monthsCoveredOf: "{covered} of {months} months covered",
    monthsToFull: "Full in {months}",
    full: "Your emergency fund is full",
    tiers: {
      title: "Where to keep it",
      savingsAccount: "Same-day savings account",
      savingsAccountHint: "One month of essentials you can withdraw the same day.",
      fdrLadder: "3-month FDR ladder",
      fdrLadderHint: "The rest, in three FDRs opened a month apart so one matures every month.",
      fdrPerSlice: "Each FDR",
      banksNeeded: "Banks to spread across",
      banksNeededHint: "Deposit insurance covers only {limit} per bank, so keep no more than that in any one bank.",
      sanchayapatraLayer: "Third layer: Sanchayapatra",
      sanchayapatraLayerHint: "Your buffer is large enough that part of it can sit in Sanchayapatra, which pays more but costs a penalty if cashed early.",
    },
  },

  rule: {
    noStocks: "No shares or equity funds for this money. It must be there, at full value, on a bad day.",
    sanchayapatraThirdLayer: "Sanchayapatra is only a third layer for a very large buffer: it pays more, but cashing it early costs you part of the profit.",
    cardBridge: "A credit card can bridge the one or two days an FDR takes to cash — only if you pay the bill in full inside the grace period.",
    refill: "Used the fund? Refill it before you put money anywhere else.",
    notAnEmergency: "A holiday, a phone or a wedding gift is not an emergency. Save for those as goals.",
  },

  next: {
    openSavings: "Open a savings account at any scheduled bank with your NID; move one month of essentials into it and set up the standing transfer for the rest.",
    fdrLadder: "Visit any scheduled bank with your NID and TIN; ask for a 3-month FDR. Open one each month for three months so one matures every month.",
    splitBanks: "Your fund is bigger than the deposit-insurance limit for one bank. Open FDRs at a second bank so no bank holds more than the limit.",
    full: "Your fund is full. Keep the FDRs rolling, and refill the fund after any withdrawal before saving elsewhere.",
  },

  status: {
    red: "Less than one month covered",
    amber: "Partly covered — keep building",
    green: "Fully covered",
  },
} as const;
