/**
 * "Why this number?" entries for M2 steps (explain.m2.<step>). Placeholders are the input names
 * computeInsurance passes to each step (packages/engine/src/m2/insurance.ts), plus {result}:
 *
 *   m2.years          {ageYears} {coverToAgeYears} {youngestChildAgeYears} {childIndependentAgeYears} {result}
 *   m2.incomeNeed     {takeHome} {incomeShare} {yearlyNeed} {inflation} {afterTax} {realRate} {coveredYears} {result}
 *   m2.lifeCover      {incomeNeed} {debts} {educationGoals} {liquidSavings} {investments} {result}
 *   m2.lifeGap        {cover} {existingLifeCover} {result}
 *   m2.perStay        {hospitalCost} {oopShare} {publicFloorShare} {appliedShare} {result}
 *   m2.healthTarget   {perStay} {peopleCount} {weightCount} {result}
 *   m2.healthGap      {target} {existingHealthCover} {result}
 *   m2.lifePremium    {gap} {per} {bandLow} {bandHigh} {smokerMultipleCount} {premiumLow} {premiumHigh} {result}
 *   m2.healthPremium  {gap} {peopleCount} {per} {premiumLow} {premiumHigh} {result}
 *   m2.monthlyNeed    {lifePremium} {healthPremium} {months} {result}
 *   m2.policyTerm     {sumAssured} {per} {bandLow} {bandHigh} {smokerMultipleCount} {result}
 *   m2.policyInvest   {annualPremium} {termPremium} {yearlyDifference} {afterTax} {remainingYears} {surrenderValue} {surrenderValueFV} {result}
 *   m2.policyIrr      {annualPremium} {termYears} {remainingYears} {surrenderValue} {expectedMaturity} {investValue} {difference} {result}
 */
export const explainM2 = {
  years: {
    title: "Years of cover",
    body: "Life cover runs from your age today, {ageYears}, until age {coverToAgeYears}, when the family usually no longer depends on your income, or until your youngest child turns {childIndependentAgeYears} if you gave the child's age and that comes first: {result} years. It never goes below zero.",
  },
  incomeNeed: {
    title: "Income to replace",
    body: "The family would need {incomeShare} of your take-home {takeHome} a month: {yearlyNeed} a year. That need grows with prices at {inflation} a year for {coveredYears} years. Money set aside today in safe savings could earn {afterTax} after tax, which is {realRate} a year more than prices rise, so the lump sum today that pays every year's need, starting now, is {result}.",
  },
  lifeCover: {
    title: "Life cover needed",
    body: "The income to replace {incomeNeed}, plus debts {debts} and education goals {educationGoals}, minus savings the family can reach {liquidSavings} and investments {investments}: {result}. It never goes below zero.",
  },
  lifeGap: {
    title: "Life cover still to buy",
    body: "The cover needed minus the cover you already have: {cover} − {existingLifeCover} = {result}.",
  },
  perStay: {
    title: "Health cover per adult",
    body: "A typical hospital stay costs about {hospitalCost}. Families pay {oopShare} of health costs themselves; we use at least {publicFloorShare}, so we take {appliedShare}: {result} of cover per adult.",
  },
  healthTarget: {
    title: "Health cover for the family",
    body: "The cover per adult {perStay} times the weight of the {peopleCount} people covered, {weightCount} in all (a child counts less than an adult, a parent more): {result}.",
  },
  healthGap: {
    title: "Health cover still to buy",
    body: "The family's target minus the health cover you already have: {target} − {existingHealthCover} = {result}.",
  },
  lifePremium: {
    title: "Yearly term life premium",
    body: "Term life costs about {bandLow} to {bandHigh} a year for every {per} of cover at your age, times {smokerMultipleCount} for smoking. For {gap} of cover that is {premiumLow} to {premiumHigh} a year; the middle is {result}.",
  },
  healthPremium: {
    title: "Yearly health premium",
    body: "Health cover is priced for every {per} of cover, by each person's age. For {gap} more cover across {peopleCount} people that is {premiumLow} to {premiumHigh} a year; the middle is {result}.",
  },
  monthlyNeed: {
    title: "To set aside each month",
    body: "The middle of the two yearly ranges, term life {lifePremium} plus health {healthPremium}, spread over {months} months: {result} a month.",
  },
  policyTerm: {
    title: "Term cover for the same amount",
    body: "Term life for the policy's cover {sumAssured} costs about {bandLow} to {bandHigh} a year for every {per} at your age, times {smokerMultipleCount} for smoking. The middle is {result} a year.",
  },
  policyInvest: {
    title: "Saving the difference",
    body: "If you stopped now, what the insurer pays back, {surrenderValue}, grows to {surrenderValueFV} in a safe deposit earning {afterTax} after tax. Your premium {annualPremium} minus the term premium {termPremium} leaves {yearlyDifference} a year; put into the same deposit at the start of each of the {remainingYears} years left, all together it comes to {result}.",
  },
  policyIrr: {
    title: "The policy's yearly return",
    body: "Keeping the policy means giving up {surrenderValue} today and paying {annualPremium} a year for the {remainingYears} years left of {termYears}, to get {expectedMaturity} at the end: like earning {result} a year on that money. Stopping and saving the difference instead would reach {investValue}, a difference of {difference}.",
  },
} as const;
