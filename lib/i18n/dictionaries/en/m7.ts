/**
 * Retirement & family screen (M7, "Plan to 100"). Owned by the m7 UI slice: every string the m7
 * screens show. `note.*` covers M7_NOTE_KEYS and `option.*` covers M7_OPTION_KEYS (engine keys,
 * shown without placeholders). Tone: independence and dignity, never fear; no death imagery.
 */
export const m7 = {
  title: "Retirement & family",
  intro: "How much to put aside so you can live on your own money, on your own terms, to 100.",
  introRetired: "How much you can take out of your savings each month so your money lasts, on your own terms, to 100.",
  demo: "Sample numbers for preview only. Your own inputs are not used on this view.",

  flow: {
    mode: {
      title: "Are you still working, or already retired?",
      hint: "Working, we work out what to put aside each month. Retired, we work out what you can take out each year.",
    },
    age: {
      title: "How old are you?",
      hint: "From your plan. Change it if it is not right.",
      label: "Your age",
    },
    retirementAge: {
      title: "At what age do you want to stop working?",
      hint: "Most private-sector jobs end at {age}. Pick the age that fits your work and health.",
      label: "Retirement age",
    },
    spending: {
      title: "What does your household spend a month today?",
      hint: "In today's money. We started from your essential spending; add anything you would still pay for after you stop working.",
      label: "Household spending a month",
    },
    savings: {
      title: "What have you saved and invested so far?",
      hint: "Savings, deposits, {product}, funds and shares you would keep for later life. Not your home, and not your provident fund (that comes later).",
      label: "Savings and investments today",
    },
    monthlySaving: {
      title: "How much do you put aside each month now?",
      hint: "Only money set aside for later life. Zero is a fine answer: this is where the plan starts.",
      label: "Saving a month now",
    },
    sex: {
      title: "Are you a man or a woman?",
      hint: "Optional. Women live about two years longer on average, and the old-age allowance starts at a different age.",
      skip: "Skip this question",
    },
    retireeType: {
      title: "Did you retire from government or private work?",
      hint: "Government, semi-government and armed-forces retirees can use a savings certificate only open to them.",
    },
    retiredSavings: {
      title: "What savings do you have now?",
      hint: "Your provident fund and gratuity payouts, fixed deposits, savings certificates and anything else you live on.",
      label: "Savings now",
    },
    otherIncome: {
      title: "What else comes in each month?",
      hint: "A pension, rent or anything else besides your savings. Leave it at zero if nothing does.",
      label: "Other income a month",
    },
    retiredSpending: {
      title: "What does your household spend a month?",
      hint: "Everything, including medicine and help at home.",
      label: "Household spending a month",
    },
    seeResult: "See my plan to 100",
  },

  mode: {
    working: "Still working",
    workingHint: "Find the monthly saving that lasts to 100",
    retired: "Already retired",
    retiredHint: "Find a yearly withdrawal that lasts to 100",
  },
  sex: {
    male: "Man",
    female: "Woman",
    unknown: "Prefer not to say",
  },
  retireeType: {
    government: "Government",
    governmentHint: "Government, semi-government or armed forces",
    private: "Private or self-employed",
    privateHint: "Company job, business or freelance work",
  },

  section: {
    inputs: "Your numbers",
    sources: "Income after you stop working",
    result: "Your plan",
  },

  input: {
    mode: "Working or retired",
    age: {
      label: "Your age",
      hint: "Changing it here changes it in your plan too.",
    },
    sex: {
      label: "Man or woman (optional)",
      hint: "Only used for two notes: women live longer on average, and the old-age allowance age.",
    },
    retirementAge: {
      label: "Retirement age",
      hint: "The usual age here is {age}.",
    },
    planToAge: {
      label: "Plan to age",
      hint: "We plan to 100 by default. You can lower it to {min}, never below, or raise it to {max}.",
    },
    spending: {
      label: "Household spending a month, today",
      hint: "In today's money; we grow it with prices to the year you stop working.",
    },
    savings: {
      label: "Savings and investments today",
      hint: "Kept for later life. Not your home, not your provident fund.",
    },
    monthlySaving: {
      label: "Saving a month now",
      hint: "What you already put aside for later life.",
    },
    retireeType: "Where you retired from",
    retiredSavings: {
      label: "Savings now",
      hint: "Everything you live on: payouts, fixed deposits, savings certificates.",
    },
    otherIncome: {
      label: "Other income a month",
      hint: "A pension, rent or anything else besides your savings.",
    },
  },

  sources: {
    intro: "Add what you expect to have. Each one lowers what you need to save.",
    add: "Add",
    remove: "Remove",
    notCounted: "Not counted",
    lowered: "Your income sources lower the monthly saving by {amount}.",
    retiredIntro: "Your other income is already counted above. These two are shown for the full picture, never counted.",
    pf: {
      title: "Provident fund",
      hint: "Grown at the fund's own rate, then paid out as a lump sum when you stop working.",
      balance: "Balance today",
      contribution: "Paid in each month (your share plus your employer's)",
      contributionHint: "Large employers now put in about the same as you; check your payslip.",
      rate: "The fund's yearly rate",
      rateHint: "From your fund's yearly statement. We never assume one, because funds differ.",
    },
    gratuity: {
      title: "Gratuity",
      hint: "A lump sum when you leave: days of last basic pay for each year of service, as the law sets out or your employer's rule if better.",
      years: "Years of service when you stop",
      basic: "Last basic pay a month",
      employerDays: "Your employer's days per year (only if more than the law)",
      employerDaysHint: "Leave empty to use the law's rule.",
    },
    pension: {
      title: "Public pension scheme",
      hint: "Paid for life as a fixed amount, so it buys less each year. We value it that way.",
      scheme: "Scheme: {name}",
      contribution: "Your contribution a month",
      expected: "Pension a month you expect (if you know it)",
      expectedHint: "Leave empty and we use the scheme's official projections.",
    },
    fixedPension: {
      title: "Other fixed pension",
      hint: "Any pension that does not rise with prices.",
      label: "Pension a month",
    },
    rent: {
      title: "Rent you receive",
      hint: "Rent usually rises with prices, so it comes straight off your spending.",
      label: "Rent a month, today",
    },
    allowance: {
      title: "Old-age allowance",
      hint: "A small, means-tested state allowance. Shown for the full picture, never counted in the plan.",
      label: "Could you be eligible?",
      amount: "About {amount} a month from age {age}",
    },
    family: {
      title: "Help from family",
      hint: "Children's help is welcome, but they will have their own costs. A bonus, never the plan.",
      label: "Help a month you might get",
    },
  },

  result: {
    headline: "Put aside each month",
    caption: "so your money lasts to {planTo}. Target when you stop at {retirementAge}: {corpus}.",
    funded: "What you have already covers the target to {planTo}. Keep it invested.",
    currentSaving: "You put aside {amount} a month now.",
    mixUsed: "Before you stop working, your savings grow at the returns of your asset mix.",
    contrast: {
      title: "Planning to {contrast} or to {planTo}",
      to: "To age {age}",
      target: "Target",
      monthly: "A month",
      extra: "The extra {amount} a month pays for {years} more years of living on your own money, from {contrast} to {planTo}.",
      noExtra: "Your savings already cover the years past {contrast}.",
      footnote: "{contrast} is shown only for comparison: many people live well past it.",
    },
    range: {
      title: "Depending on returns",
      low: "If returns are lower",
      base: "Our base case",
      high: "If returns are higher",
      hint: "Long projections are never exact; we show a range and round every figure.",
    },
    chart: {
      title: "How long would my money last?",
      hint: "Your savings at what you put aside now, year by year, in the money of each year.",
      label: "Savings from age {from} to {to}: highest at {peak} at age {peakAge}. {verdict}.",
      axisAge: "Age",
      retire: "Stop work",
    },
    verdict: {
      onTrack: "On track to {age}",
      lastsTo: "Lasts to {age}",
      runsOut: "Runs out at {age}",
    },
    shift: {
      title: "What starting {years} years earlier or later changes",
      earlier: "Had you started at {age}",
      later: "If you start at {age}",
      now: "Starting now, at {age}",
      perMonth: "{amount} a month",
      notPossible: "Too close to retirement",
      hint: "Same spending, savings and retirement age; only the start moves.",
    },
    income: {
      title: "What your sources add",
      pf: "Provident fund when you stop",
      gratuity: "Gratuity",
      pensions: "Fixed pensions, valued when you stop",
      publicPension: "Public pension a month",
      rent: "Rent a year when you stop",
      allowance: "Old-age allowance a month",
      family: "Help from family a month",
    },
    addSources: "Add your income sources",
    editAnswers: "Change your answers",
  },

  retired: {
    headline: "You can take out each month",
    caption: "That is {firstYear} in the first year, rising with prices each year after, and it lasts to {planTo}.",
    chartHint: "Your savings year by year at the withdrawal above, in the money of each year.",
    range: {
      title: "What you can take out, depending on returns",
      low: "If returns only match inflation",
      hint: "Long projections are never exact; we show a range and round every figure.",
    },
    runsOut: "At your spending of {spending} a month from savings, the money would last to about {age}.",
    lasts: "At your spending of {spending} a month from savings, the money lasts to {planTo}.",
    target: {
      title: "Savings needed at your spending",
      hint: "What your spending from savings needs, to {contrast} and to {planTo}.",
    },
    pot: {
      title: "The two-pot rule",
      body: "Keep {amount} — {years} years of withdrawals — in fixed deposits and treasury bills you can reach quickly. The rest stays invested and refills this pot once a year.",
    },
    options: {
      title: "Ways to turn savings into steady income",
      localName: "Here: {name}",
    },
  },

  bucket: {
    title: "Where should this money go?",
    body: "Money for later life needs a home that outlasts any one company. Where no broad index fund is sold, the plan builds the nearest thing from three parts: a diversified open-end fund through a monthly plan for growth; government-backed income such as the public pension scheme, savings certificates and treasury bonds; and a mix that gets safer every year as you get closer to {retirementAge}.",
    bodyRetired: "Money for the rest of your life needs a home that outlasts any one company. Keep the next few years of withdrawals in deposits and treasury bills you can reach quickly, and the rest in government-backed income such as savings certificates and treasury bonds, with a small part in a diversified open-end fund for growth.",
    lock: "Mark this money “not before {retirementAge}” and leave it alone until then.",
    link: "See your asset mix",
  },

  lifeTable: {
    title: "How long people live after 60",
    hint: "Average years still ahead at each age. Half of people live longer than the average, which is why the plan never stops at it.",
    age: "Age",
    total: "Average",
    men: "Men",
    women: "Women",
    projected: "Projection",
    source: "{source}, {date}",
  },
  supportRatio: "In {fromYear} there were {fromValue} working-age people for each older person. By {toYear} there will be about {toValue}, so plan on your own money first.",

  notes: {
    title: "Good to know",
  },
  backToPlan: "Back to my plan",

  note: {
    planTo100: "The plan runs to 100 by default because many people who reach 60 live well past 80. You can lower it, but never below 85.",
    lifeAt60: "Life expectancy at birth mixes in every age from childhood on, so it looks low. Someone who reaches 60 can expect about twenty more years on average, and half live longer.",
    womenLiveLonger: "Women live about two years longer on average, so a couple's plan should cover the wife's longer retirement.",
    familyNotCounted: "Help from family is never counted: your children will have their own families and costs. Treat it as a bonus, not a plan.",
    allowanceNotCounted: "The old-age allowance is shown but never counted: it is small, means-tested and can change.",
    pensionFixed: "A pension paid as a fixed amount buys less every year as prices rise, so it is valued that way.",
    pensionEntryClosed: "The public pension scheme only takes new members up to its entry age, so it is not counted for you.",
    supportRatio: "Fewer working-age people will support each older person in the coming decades, so your own savings matter more.",
    lock: "Keep this money for later life only. Touching it early is the most common reason a plan falls short.",
    startEarlier: "Starting earlier lowers the monthly amount a lot, because the money has longer to grow.",
    noStatutoryGratuity: "We have no gratuity law on record for your country, so only your employer's own days count. Check your contract or ask your employer.",
    lowCaseInflation: "The low case assumes your money only keeps up with prices in retirement, with no real return on top.",
  },

  option: {
    pensionerCertificate: "Pensioner savings certificate: monthly profit, for government, semi-government and armed-forces retirees only, up to a limit.",
    savingsCertificate: "Government savings certificate: a fixed profit backed by the state.",
    tbonds: "Treasury bonds: government-backed, with a fixed coupon every six months.",
    depositLadder: "Deposit ladder: deposits that mature one after another, so some money comes free every year.",
    annuity: "Lifetime annuity from the state insurer: a pension for life however long you live. The trade-off: the money cannot be passed on.",
  },
} as const;
