/**
 * "Why this number?" entries for M6 steps (explain.m6.<step>), owned by the m6 UI slice.
 *
 * Input names each step provides (plus {result} = the step's rounded value), from m6/allocation.ts:
 *
 *   m6.score        {ageBandCount} {incomeCount} {horizonCount} {reactionCount}
 *   m6.equity       {ageYears} {startShare} {floorShare} {capShare} {ageEquityShare} {horizonYears} {noEquityYears} {cashOnlyYears}
 *   m6.gold         {chosenShare} {minShare} {maxShare}
 *   m6.fixedIncome  {equityShare} {goldShare}
 *   m6.mixLow/Base/High  {equityShare} {goldShare} {fixedIncomeShare} {equityRate} {goldRate} {fixedIncomeRate}
 *   m6.fv           {monthly} {lumpSum} {mixRate} {monthlyRate} {years} {paidIn}
 *   m6.real         {fv} {inflation} {years}
 *   m6.trade        {holdingsTotal} {newMoney} {equityShare} {goldShare} {fixedIncomeShare} {driftBandShare} {equityTrade} {goldTrade} {fixedIncomeTrade}
 */
export const explainM6 = {
  score: {
    title: "Risk score",
    body: "Each of the four answers scores 0 to 2: age group {ageBandCount}, income {incomeCount}, when you need the money {horizonCount}, and what you would do after a 20% fall {reactionCount}. Together: {result} of 8. 0 to 3 is Careful, 4 to 5 Balanced, 6 to 8 Growth.",
  },
  equity: {
    title: "Equity share",
    body: "Your profile starts at {startShare} equity up to age 30, then one point less for each year after that, but never below {floorShare}: at {ageYears} that gives {ageEquityShare}, and never above the cap of {capShare}. Money needed within {noEquityYears} years holds no equity, and within {cashOnlyYears} year only deposits or bills; yours is needed in {horizonYears} years. Equity: {result}.",
  },
  gold: {
    title: "Gold share",
    body: "Gold is a hedge, not a bet: your choice of {chosenShare}, kept between {minShare} and {maxShare}. Gold: {result}.",
  },
  fixedIncome: {
    title: "Fixed income share",
    body: "Everything that is not equity or gold: 100% − {equityShare} − {goldShare} = {result}.",
  },
  mixLow: {
    title: "Mix return, low case",
    body: "Each part's low-case yearly return weighted by its share: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} a year.",
  },
  mixBase: {
    title: "Mix return, base case",
    body: "Each part's base-case yearly return weighted by its share: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} a year. Equity's base is set no higher than safe instruments, on purpose.",
  },
  mixHigh: {
    title: "Mix return, high case",
    body: "Each part's high-case yearly return weighted by its share: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} a year.",
  },
  fv: {
    title: "What it could grow to (base case)",
    body: "{monthly} a month and {lumpSum} today, growing at {mixRate} a year ({monthlyRate} a month) for {years} years. You pay in {paidIn}; at the end you could have {result}. The low and high cases use their own mix return.",
  },
  real: {
    title: "In today's money",
    body: "Prices rise too. {fv} divided by (1 + {inflation})^{years} = {result} in what money buys today.",
  },
  trade: {
    title: "Rebalancing trades",
    body: "You hold {holdingsTotal} and add {newMoney}, so the new total is {result}. Each part's target is its share of that total ({equityShare}, {goldShare}, {fixedIncomeShare}) minus what it holds now: equity {equityTrade}, gold {goldTrade}, fixed income {fixedIncomeTrade} (plus = buy, minus = sell). New money goes to the parts that are behind first, and a part more than {driftBandShare} off target is a signal to rebalance.",
  },
} as const;
