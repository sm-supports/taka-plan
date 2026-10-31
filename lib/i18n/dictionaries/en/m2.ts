/**
 * Insurance & health screen (M2). Every string the m2 screens show.
 * `note.*` covers M2_NOTE_KEYS and `check.*` covers M2_CHECK_KEYS (the engine emits "m2.note.x" / "m2.check.x").
 * `check.claimSettlement` takes {claimSettlement} (a percent); no other check or note takes a placeholder.
 */
export const m2 = {
  title: "Insurance & health",
  intro: "How much life and health cover your family needs, roughly what it costs, and how to check an insurer before you sign.",
  demo: "Sample numbers for preview only. Your own inputs are not used on this view.",
  backToPlan: "Back to my plan",

  needProfile: {
    title: "First, a few questions about you",
    body: "This check uses your age, your income and who depends on you. Answer the five starting questions, then come back here.",
    cta: "Answer the questions",
  },

  flow: {
    eyebrow: "Insurance check",
    smoker: {
      title: "Do you smoke or use tobacco?",
      hint: "Insurers charge smokers more for life cover, so the price range depends on it.",
    },
    lifeCover: {
      title: "How much life cover do you already have?",
      hint: "Add up the sum insured of every life policy you hold, including cover from your employer. Type 0 if you have none.",
      none: "I have none",
    },
    healthCover: {
      title: "How much health cover does your family already have?",
      hint: "The yearly limit of your own or your employer's health policy, for everyone together. Type 0 if you have none.",
      none: "We have none",
    },
    people: {
      title: "Who should the health cover include?",
      hint: "We filled this in from who depends on you. Change it if someone else needs cover.",
    },
    seeResult: "See my result",
  },

  section: {
    inputs: "Your answers",
    result: "The cover your family needs",
    notes: "Good to know",
  },

  input: {
    smoker: {
      label: "Do you smoke or use tobacco?",
      hint: "Smokers pay more for life cover. Say so on any proposal form too.",
    },
    existingLifeCover: {
      label: "Life cover you already have",
      hint: "The sum insured of every life policy you hold, including your employer's. 0 if none.",
    },
    existingHealthCover: {
      label: "Health cover the family already has",
      hint: "The yearly limit of every health policy, yours or your employer's, for everyone together. 0 if none.",
    },
    people: {
      label: "Who the health cover includes",
      hint: "Pick everyone who should be covered.",
    },
    childrenCount: {
      label: "Children to cover",
    },
    parentsCount: {
      label: "Parents to cover",
    },
    parentAge: {
      label: "Age of the older parent",
      hint: "Health cover costs more with age, so the price range uses this.",
    },
    coverToAge: {
      label: "Life cover until age",
      hint: "Most families stop depending on your income once the children are grown, so cover rarely needs to run past retirement.",
    },
    incomeShare: {
      label: "Share of your income the family would need",
      hint: "Without you some costs stop, so the family needs part of your income, not all of it.",
    },
    investments: {
      label: "Investments the family could sell",
      hint: "Shares, funds, savings certificates or gold. Your emergency savings are counted already.",
    },
    youngestChildAge: {
      label: "Age of your youngest child (optional)",
      hint: "Life cover then runs until that child can support themselves, if that comes before the age below.",
    },
  },

  person: {
    self: "Me",
    partner: "Partner",
    child: "Children",
    parent: "Parents",
  },

  status: {
    red: "Big gap in cover",
    amber: "Some cover missing",
    green: "Covered for now",
  },

  life: {
    title: "Life cover",
    label: "Life cover your family needs",
    multiple: "About {multiple} times your yearly income",
    existing: "Cover you already have",
    gap: "Still to buy",
    years: "Years covered",
    yearsValue: "{years} (until age {age})",
    incomeNeed: "To replace your income",
    incomeNeedHint: "What the family would need over those years, in today's money.",
    enough: "The cover you have is enough for now.",
    notNeeded: "Not needed yet",
    why: "Why {amount} of life cover?",
    status: {
      red: "Most of the cover is missing",
      amber: "Part of the cover is missing",
      green: "Enough life cover",
    },
  },

  health: {
    title: "Health cover",
    label: "Health cover for the family",
    caption: "For {people} people",
    captionOne: "For {people} person",
    perPerson: "Per adult",
    perPersonHint: "About what one hospital stay would cost you.",
    existing: "Cover the family already has",
    gap: "Still to buy",
    enough: "The family's health cover is enough for now.",
    why: "Why {amount} of health cover?",
    status: {
      red: "Most of the cover is missing",
      amber: "Part of the cover is missing",
      green: "Enough health cover",
    },
  },

  premium: {
    title: "What it might cost",
    monthly: "Set aside each month",
    caption: "Your plan keeps this aside for the two covers.",
    captionNone: "Nothing more to set aside: the cover you have is enough for now.",
    captionHealth: "Your plan keeps this aside for health cover.",
    captionLife: "Your plan keeps this aside for term life cover.",
    life: "Term life, each year",
    lifeHint: "For {gap} of cover.",
    smokerHint: "For {gap} of cover, at the smoker price.",
    health: "Health cover, each year",
    healthHint: "For {gap} more cover.",
    range: "{low} – {high}",
    none: "Nothing more to buy",
    indicative: "Rough ranges, not quotes",
    why: "Why {amount} a month?",
  },

  policy: {
    title: "Already paying a savings-type policy?",
    hint: "A policy that pays you money back at the end (an endowment policy). See how it compares with plain term cover.",
    intro: "Type the numbers from your policy papers. We compare what the policy pays at the end with buying term cover for the same amount and putting the rest of the premium in a safe deposit.",
    annualPremium: {
      label: "Premium you pay each year",
    },
    sumAssured: {
      label: "Life cover the policy gives",
      hint: "The sum insured written on the policy.",
    },
    termYears: {
      label: "Full policy term",
    },
    yearsPaid: {
      label: "Years already paid",
    },
    expectedMaturity: {
      label: "Amount the policy pays at the end",
      hint: "The maturity value in the insurer's illustration, with the expected bonus.",
    },
    surrenderValue: {
      label: "What the insurer would pay if you stopped today (optional)",
      hint: "The surrender or paid-up value; ask the insurer. Without it the comparison leaves out what stopping gives back.",
    },
    incomplete: "Fill in all five numbers to see the comparison.",
    keep: "If you keep the policy",
    keepHint: "Paid at the end of the term.",
    alternative: "Term cover plus saving the difference",
    alternativeHint: "The rest of each premium goes into {instrument} for the {years} left.",
    termPremium: "Term cover for the same amount, each year",
    remaining: "Years left to pay",
    irr: "The policy's yearly return",
    irrHint: "What the premiums earn each year if the policy pays what it illustrates.",
    verdict: {
      termPlusInvestAhead: "On these numbers, term cover plus saving the difference could leave you about {amount} more at the end.",
      policyAhead: "On these numbers, the policy comes out about {amount} ahead of term cover plus saving the difference.",
      similar: "On these numbers, the two paths end up about the same.",
    },
    clear: "Clear these numbers",
    why: "Why this comparison?",
  },

  checklist: {
    title: "Check the insurer before the policy",
    intro: "A policy is only as good as the claims the insurer pays. Go through this list before you sign.",
    regulatorLink: "Insurance regulator: {name}",
    complaintsLink: "Where to complain: {name}",
  },

  note: {
    noDependents: "Nobody depends on your income and you have no debts, so you do not need life cover yet. Health cover still matters.",
    debtsOnly: "Nobody depends on your income, so life cover only needs to clear your debts, so they never pass to your family.",
    publicCoverBroad: "Public health care pays most hospital bills in your country, so we size your own health cover to a minimum share of a hospital stay.",
    premiumIndicative: "Premiums are rough ranges from typical price tables, not quotes. Your price depends on your health, the insurer and the policy.",
    noTermSold: "We have no price table for pure term cover in your country, so the life premium shows as zero. Ask insurers for a term quote.",
    separateInvesting: "Keep insurance and investing apart: cover is a cost, like rent, and saving for the future is done on its own.",
    policyNotAdvice: "This is a rough comparison, not advice to stop or keep any policy. Stopping a policy early often loses money, so ask the insurer what you would get back before you change anything.",
    policyNoSurrender: "You did not enter what the insurer would pay back if you stopped today, so we count it as zero. Stopping looks worse here than it really is: ask the insurer for the surrender value and add it.",
    policyMatured: "Every premium on this policy is already paid, so there is nothing left to compare. Collect the maturity value when it is due.",
    multipleOutsideBand: "A common rule of thumb is life cover of ten to fifteen times your yearly take-home. Yours is outside that range because of your family, debts and savings; the figure above is worked out for you.",
    noHealthPriceTable: "We have no price table for health insurance in your country, so the health premium shows as zero. Ask insurers for a quote for the cover above.",
  },

  check: {
    regulator: "Make sure the insurer is licensed by the insurance regulator. Look it up on the regulator's website before you sign.",
    claimSettlement: "Ask what share of claims the insurer pays. Across life insurers here it is about {claimSettlement}; choose one that pays well above that.",
    complaints: "Know where to complain. If a claim is refused or delayed for no clear reason, the regulator's complaint desk can step in.",
    waitingPeriods: "Read the waiting periods. Many health policies do not pay for some illnesses in the first year or two.",
    exclusions: "Read the list of what is not covered before you sign, not after a claim.",
    cashlessNetwork: "Check which hospitals take the policy without you paying first, including hospitals near where your family lives.",
    honestProposal: "Answer every question on the proposal form truthfully, including smoking and past illness. A wrong answer is the most common reason claims are refused.",
    buyYoung: "Buy early. Premiums are lower while you are young and healthy, and a later illness can make cover hard to get.",
    medicalTests: "Expect medical tests for larger cover. Do them: they protect your claim later.",
  },
} as const;
