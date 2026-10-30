/**
 * "Why this number?" — one { title, body } per engine ExplainStep id, keyed by the id's last
 * segment (step "m1.target" → explain.m1.target). The `body` is a plain-words explanation
 * with the formula written out using `{placeholder}` slots. The UI fills every slot with
 * an already-formatted string (taka, percent, months) from `useFormat`.
 *
 * Input names each step's `inputs` must provide (plus `{result}` = the step's rounded value):
 *
 *   m1.months    {base} {bumpIrregular} {bumpSoleEarner} {bumpNoHealth} {min} {max} {suggested} {source} {result}
 *   m1.target    {essentials} {months} {result}
 *   m1.gap       {target} {saved} {result}
 *   m1.monthly   {gap} {buildMonths} {result}
 *   m1.covered   {saved} {essentials} {result}
 *   m1.tier1     {essentials} {result}
 *   m1.tier2     {target} {tier1} {result}
 *   m1.banks     {target} {tier2} {limit} {result}
 *
 *   m3.totalEmi       {emis} {cardMinimums} {result}
 *   m3.emiRatio       {totalEmi} {takeHome} {result}
 *   m3.capacity       {takeHome} {savings} {essentials} {buffer} {result}
 *   m3.maxLoan        {capacity} {monthlyRate} {months} {result}
 *   m3.scenarioEmi    {principal} {monthlyRate} {months} {result}
 *   m3.interestSaved  {snowballInterest} {avalancheInterest} {result}
 *
 *   m4.average   {months} {total} {result}
 *   m4.feasible  {average} {essentials} {result}
 *   m4.amount    {average} {rate} {result}
 *   m4.expenses  {average} {savings} {result}
 *
 *   m5.fv        {cost} {inflation} {years} {result}
 *   m5.rate      {instrument} {nominal} {tax} {result}
 *   m5.monthly   {fv} {monthlyRate} {months} {result}
 *   m5.real      {afterTax} {inflation} {result}
 *
 *   plan.total           {savings} {result}
 *   plan.emergencyShare  {total} {minShare} {gap} {result}
 *   plan.debtShare       {remaining} {headroom} {result}
 *   plan.goalsShare      {remaining} {goalsNeed} {result}
 */
export const explain = {
  m1: {
    months: {
      title: "Months of cover",
      body: "We start at {base} months. Irregular income adds {bumpIrregular}, being the only earner with dependents adds {bumpSoleEarner}, and having no health insurance adds {bumpNoHealth}. The suggestion stays between {min} and {max} months: {result}. The slider is yours to move.",
    },
    target: {
      title: "Emergency fund target",
      body: "Your monthly essentials times the months of cover: {essentials} × {months} = {result}. Only essentials count, because in an emergency everything else stops.",
    },
    gap: {
      title: "Still to save",
      body: "The target minus what you can already reach today: {target} − {saved} = {result}. It never goes below zero; a bigger buffer than planned is fine.",
    },
    monthly: {
      title: "Monthly saving",
      body: "The gap spread over the months you chose to build it: {gap} ÷ {buildMonths} = {result} a month.",
    },
    covered: {
      title: "Months covered",
      body: "How many months of essentials your current savings would carry: {saved} ÷ {essentials} = {result}.",
    },
    tier1: {
      title: "Tier 1: same-day savings account",
      body: "One month of essentials stays in a savings account you can withdraw from today: {essentials} = {result}. This is the money for the first week of any emergency.",
    },
    tier2: {
      title: "Tier 2: 3-month FDR ladder",
      body: "Everything above tier 1 goes into FDRs: {target} − {tier1} = {result}, split into three FDRs opened a month apart so one matures every month.",
    },
    banks: {
      title: "Banks needed",
      body: "Deposit insurance covers {limit} per bank, and the whole fund sits in bank deposits, so the target is split: {target} ÷ {limit}, rounded up, = {result} bank(s).",
    },
  },

  m3: {
    totalEmi: {
      title: "Total monthly EMIs",
      body: "All loan EMIs plus the minimum payment on any card balance you carry: {emis} + {cardMinimums} = {result}.",
    },
    emiRatio: {
      title: "EMIs as a share of take-home",
      body: "Total EMIs divided by take-home: {totalEmi} ÷ {takeHome} = {result}. Bangladesh Bank sets no fixed limit; we flag a high share because little is left to save.",
    },
    capacity: {
      title: "EMI capacity",
      body: "What is left for loan payments after you save first, pay essentials and keep a cash buffer: {takeHome} − {savings} − {essentials} − {buffer} = {result}.",
    },
    maxLoan: {
      title: "Maximum affordable loan",
      body: "The standard EMI formula run backwards. With a monthly rate of {monthlyRate} over {months} months: {capacity} × (1 − (1 + {monthlyRate})^−{months}) ÷ {monthlyRate} = {result}. Add your own safety margin before you borrow.",
    },
    scenarioEmi: {
      title: "Monthly EMI for this loan",
      body: "The standard EMI formula. For {principal} at a monthly rate of {monthlyRate} over {months} months: {principal} × {monthlyRate} ÷ (1 − (1 + {monthlyRate})^−{months}) = {result}.",
    },
    interestSaved: {
      title: "Interest saved",
      body: "Paying the highest-rate debt first costs {avalancheInterest} in total interest; smallest-balance first costs {snowballInterest}. The difference, {result}, is what highest-rate-first saves you.",
    },
  },

  m4: {
    average: {
      title: "Average monthly income",
      body: "Income is averaged over the last {months} month(s): {total} ÷ {months} = {result}. For a fixed salary this is simply your take-home; freelancers and business owners should enter their last six months so swings even out.",
    },
    feasible: {
      title: "Most you could save",
      body: "What is left after essentials, as a share of income: ({average} − {essentials}) ÷ {average} = {result}. The suggested rate never goes above this.",
    },
    amount: {
      title: "Monthly saving",
      body: "Income times your savings rate: {average} × {rate} = {result}. This moves to savings on payday, before anything is spent.",
    },
    expenses: {
      title: "Left to spend",
      body: "Income minus savings is what you live on: {average} − {savings} = {result}. That is the whole idea: save first, spend the rest.",
    },
  },

  m5: {
    fv: {
      title: "Future cost of the goal",
      body: "Today's cost grown by inflation for every year until the goal: {cost} × (1 + {inflation})^{years} = {result}. This is the number you actually have to reach.",
    },
    rate: {
      title: "Return after tax",
      body: "{instrument} pays {nominal} a year before tax. After the {tax} tax deducted at source, you keep {result} a year.",
    },
    monthly: {
      title: "Monthly saving needed",
      body: "The amount that grows to the future cost at a monthly rate of {monthlyRate} over {months} months: {fv} × {monthlyRate} ÷ ((1 + {monthlyRate})^{months} − 1) = {result}.",
    },
    real: {
      title: "Real return",
      body: "What your money gains in buying power each year: (1 + {afterTax}) ÷ (1 + {inflation}) − 1 = {result}. Below zero means the instrument loses to inflation even though it pays interest.",
    },
  },

  plan: {
    total: {
      title: "Your monthly amount",
      body: "The save-first amount from your budget: {savings} = {result}. Every bucket below is carved out of this one number.",
    },
    emergencyShare: {
      title: "Share to the emergency fund",
      body: "Until the fund is full, at least {minShare} of the monthly amount goes to it, and never more than the {gap} still to save: {total} × {minShare} = {result}. The rest starts your investing habit today.",
    },
    debtShare: {
      title: "Share to high-interest debt",
      body: "What is left after the emergency fund goes to any debt above the high-interest line, up to your headroom: min({remaining}, {headroom}) = {result}.",
    },
    goalsShare: {
      title: "Share to goals",
      body: "Whatever remains funds your goals: min({remaining}, {goalsNeed}) = {result}. If it is less than the goals need, the plan shows the shortfall.",
    },
  },
} as const;
