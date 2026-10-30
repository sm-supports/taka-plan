/** Five quick questions, one per screen. */
export const onboarding = {
  languagePick: {
    title: "Which language would you like?",
    subtitle: "You can switch at any time.",
  },

  progress: "Question {n} of 5",
  intro: "Five quick questions, then your plan. No account needed.",

  step: {
    1: {
      title: "How old are you?",
      hint: "Your age sets how long your goals and retirement have to grow.",
      placeholder: "Your age in years",
      label: "Your age",
      decadeLabel: "Tap a shortcut, then correct the exact age below",
      decade: {
        under20: "Under 20",
        twenties: "20s",
        thirties: "30s",
        forties: "40s",
        fifties: "50s",
        sixtyPlus: "60 and over",
      },
      unit: "years",
    },
    2: {
      title: "What is your monthly take-home?",
      hint: "The amount that actually lands in your account after tax and provident fund.",
      hintFreelance: "Irregular income? Add up the last six months and divide by six.",
      placeholder: "Take-home in taka",
      label: "Monthly take-home",
      incomeTypeLabel: "How do you earn?",
      incomeTypeHint: {
        salaried: "A fixed salary every month",
        freelance: "Project or client payments that vary",
        business: "Profit you draw from your own business",
      },
      average: {
        toggle: "Work it out from the last six months",
        title: "Last six months' income",
        hint: "Type what you received each month. Leave a month blank if you had nothing.",
        month: "Month {n}",
        result: "Six-month average: {amount}",
        use: "Use {amount} as my take-home",
        close: "Hide",
      },
    },
    3: {
      title: "How much do you spend on essentials each month?",
      hint: "Rent, food, utilities, transport, school fees, support to parents and any EMIs you already pay. Leave out eating out, shopping and holidays.",
      placeholder: "Essential spending in taka",
      label: "Monthly essential spending",
      countsTitle: "What counts as essential",
      counts: {
        rent: "Rent or home-loan EMI",
        food: "Food and groceries",
        utilities: "Electricity, gas, water, phone and internet",
        transport: "Transport",
        school: "School and tuition fees",
        parents: "Support you send to parents",
        emi: "Any loan or card EMI you already pay",
      },
      leaveOut: "Leave out eating out, shopping, gadgets and holidays.",
      takeHomeReminder: "Your take-home: {amount}",
      leftOver: "Left after essentials: {amount}",
    },
    4: {
      title: "Who depends on your income?",
      hint: "Pick everyone that applies. Dependents change your emergency buffer and insurance needs.",
      none: "No one depends on me",
      label: "Dependents",
      option: {
        partner: "Partner",
        children: "Children",
        parents: "Parents",
      },
      optionHint: {
        partner: "A spouse who relies on your income",
        children: "Any child you support",
        parents: "Parents or in-laws you support",
      },
    },
    5: {
      title: "Do you have any loans or a credit-card balance you carry?",
      hint: "Count bank loans, car or home loans, and any card bill you do not pay in full each month.",
      yes: "Yes, I have debt",
      no: "No debt",
      label: "Loans or card balances",
      yesNote: "Good to know. Your plan will include a debt check so the costliest debt gets paid first.",
      noNote: "Great. Your plan can go straight to saving.",
      readyTitle: "That's everything",
      ready: "Your plan is built from these five answers. You can change any of them later.",
    },
  },

  summary: {
    age: "Age {age}",
    takeHome: "Take-home {amount}",
    essentials: "Essentials {amount}",
  },

  cta: {
    start: "Start",
    seePlan: "See my plan",
    next: "Next",
    back: "Back",
  },

  validation: {
    required: "Please enter a number to continue.",
    number: "Enter digits only, like {example}.",
    ageRange: "Enter an age between {min} and {max}.",
    positiveAmount: "Enter an amount above zero.",
    essentialsAboveIncome: "Essentials are higher than your take-home. Double-check both numbers — the plan can still work, but the savings number will be very small.",
    pickOne: "Pick at least one option, or “No one”.",
  },
} as const;
