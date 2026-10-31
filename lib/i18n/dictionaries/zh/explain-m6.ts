import type { Dictionary } from "../../types";

/** "Why this number?" entries for M6 steps (explain.m6.<step>). Placeholders: see ../en/explain-m6.ts. */
export const explainM6: Dictionary["explain"]["m6"] = {
  score: {
    title: "风险评分",
    body: "四个回答各得 0 到 2 分：年龄段 {ageBandCount}，收入 {incomeCount}，何时需要用钱 {horizonCount}，下跌 20% 后您会怎么做 {reactionCount}。合计：{result}/8。0 到 3 分为稳健型，4 到 5 分为平衡型，6 到 8 分为成长型。",
  },
  equity: {
    title: "股票比例",
    body: "您的类型在30岁前从 {startShare} 的股票比例开始，之后每年减少一个百分点，但不低于 {floorShare}：{ageYears} 岁时为 {ageEquityShare}，并且不超过上限 {capShare}。{noEquityYears} 年内要用的钱不放股票，{cashOnlyYears} 年内要用的钱只放存款或国库券；您的钱在 {horizonYears} 年后要用。股票：{result}。",
  },
  gold: {
    title: "黄金比例",
    body: "黄金用来对冲，不是用来押注：您选择的 {chosenShare}，保持在 {minShare} 到 {maxShare} 之间。黄金：{result}。",
  },
  fixedIncome: {
    title: "固定收益比例",
    body: "股票和黄金以外的全部：100% − {equityShare} − {goldShare} = {result}。",
  },
  mixLow: {
    title: "组合回报，偏低情况",
    body: "各部分偏低情况的年回报按其比例加权：{equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = 每年 {result}。",
  },
  mixBase: {
    title: "组合回报，基准情况",
    body: "各部分基准情况的年回报按其比例加权：{equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = 每年 {result}。股票的基准回报特意设得不高于安全产品。",
  },
  mixHigh: {
    title: "组合回报，偏高情况",
    body: "各部分偏高情况的年回报按其比例加权：{equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = 每年 {result}。",
  },
  fv: {
    title: "可能增长到多少（基准情况）",
    body: "每月 {monthly}，加上今天的 {lumpSum}，按每年 {mixRate}（每月 {monthlyRate}）增长 {years} 年。您共投入 {paidIn}；期末可能有 {result}。偏低和偏高情况使用各自的组合回报。",
  },
  real: {
    title: "按今天的币值",
    body: "物价也会上涨。{fv} 除以 (1 + {inflation})^{years} = 按今天购买力计的 {result}。",
  },
  trade: {
    title: "再平衡交易",
    body: "您持有 {holdingsTotal}，追加 {newMoney}，新的合计为 {result}。每部分的目标是它在合计中的比例（{equityShare}、{goldShare}、{fixedIncomeShare}）减去目前持有的金额：股票 {equityTrade}，黄金 {goldTrade}，固定收益 {fixedIncomeTrade}（正数 = 买入，负数 = 卖出）。新资金优先投向落后的部分；某部分偏离目标超过 {driftBandShare}，就是该再平衡的信号。",
  },
};
