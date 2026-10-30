/** Five quick questions, one per screen. */
export const onboarding = {
  languagePick: {
    title: "Which language would you like?",
    subtitle: "You can switch at any time.",
  },

  progress: "Question {n} of 5",

  step: {
    1: {
      title: "How old are you?",
      hint: "Your age sets how long your goals and retirement have to grow.",
      placeholder: "Your age in years",
    },
    2: {
      title: "What is your monthly take-home?",
      hint: "The amount that actually lands in your account after tax and provident fund.",
      hintFreelance: "Irregular income? Add up the last six months and divide by six.",
      placeholder: "Take-home in taka",
    },
    3: {
      title: "How much do you spend on essentials each month?",
      hint: "Rent, food, utilities, transport, school fees, support to parents and any EMIs you already pay. Leave out eating out, shopping and holidays.",
      placeholder: "Essential spending in taka",
    },
    4: {
      title: "Who depends on your income?",
      hint: "Pick everyone that applies. Dependents change your emergency buffer and insurance needs.",
      none: "No one depends on me",
    },
    5: {
      title: "Do you have any loans or a credit-card balance you carry?",
      hint: "Count bank loans, car or home loans, and any card bill you do not pay in full each month.",
      yes: "Yes, I have debt",
      no: "No debt",
    },
  },

  cta: {
    start: "Start",
    seePlan: "See my plan",
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
