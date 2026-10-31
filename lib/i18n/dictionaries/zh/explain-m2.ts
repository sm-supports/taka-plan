import type { Dictionary } from "../../types";

/** "Why this number?" entries for M2 steps (explain.m2.<step>). Placeholders: see ../en/explain-m2.ts. */
export const explainM2: Dictionary["explain"]["m2"] = {
  years: {
    title: "保障年数",
    body: "寿险从您今天的年龄 {ageYears} 岁起，保障到 {coverToAgeYears} 岁（通常这时家人已不再依靠您的收入）；如果您填写了孩子的年龄，并且最小的孩子满 {childIndependentAgeYears} 岁的时间更早，就保障到那时为止：{result} 年。它永远不会低于零。",
  },
  incomeNeed: {
    title: "需要替代的收入",
    body: "家人每月需要您到手收入 {takeHome} 的 {incomeShare}：每年 {yearlyNeed}。这笔需求按每年 {inflation} 随物价上涨，持续 {coveredYears} 年。今天存进安全储蓄的钱税后可赚 {afterTax}，比物价每年多涨 {realRate}，所以从现在起支付每年所需的一次性金额是 {result}。",
  },
  lifeCover: {
    title: "需要的寿险保障",
    body: "需要替代的收入 {incomeNeed}，加上债务 {debts} 和教育目标 {educationGoals}，减去家人能动用的储蓄 {liquidSavings} 和投资 {investments}：{result}。它永远不会低于零。",
  },
  lifeGap: {
    title: "还需购买的寿险保障",
    body: "需要的保障减去您已有的保障：{cover} − {existingLifeCover} = {result}。",
  },
  perStay: {
    title: "每位成人的医疗保障",
    body: "一次普通住院约花费 {hospitalCost}。家庭自付医疗费用的 {oopShare}；我们至少按 {publicFloorShare} 计算，所以取 {appliedShare}：每位成人的保障为 {result}。",
  },
  healthTarget: {
    title: "家庭医疗保障",
    body: "每位成人的保障 {perStay}，乘以被保障的 {peopleCount} 人的权重，合计 {weightCount}（孩子的权重低于成人，父母的权重高于成人）：{result}。",
  },
  healthGap: {
    title: "还需购买的医疗保障",
    body: "家庭目标减去您已有的医疗保障：{target} − {existingHealthCover} = {result}。",
  },
  lifePremium: {
    title: "每年定期寿险保费",
    body: "按您的年龄，每 {per} 保额的定期寿险每年约 {bandLow} 到 {bandHigh}，吸烟者乘以 {smokerMultipleCount}。{gap} 的保额每年需 {premiumLow} 到 {premiumHigh}；中间值为 {result}。",
  },
  healthPremium: {
    title: "每年医疗保费",
    body: "医疗保障按每 {per} 保额、根据每个人的年龄定价。为 {peopleCount} 人增加 {gap} 的保障，每年需 {premiumLow} 到 {premiumHigh}；中间值为 {result}。",
  },
  monthlyNeed: {
    title: "每月预留",
    body: "两个年度范围的中间值，定期寿险 {lifePremium} 加医疗 {healthPremium}，分摊到 {months} 个月：每月 {result}。",
  },
  policyTerm: {
    title: "同等保额的定期保障",
    body: "保单保额 {sumAssured} 的定期寿险，按您的年龄每 {per} 每年约 {bandLow} 到 {bandHigh}，吸烟者乘以 {smokerMultipleCount}。中间值为每年 {result}。",
  },
  policyInvest: {
    title: "存下差额",
    body: "如果现在停交，保险公司退还的 {surrenderValue} 存入税后收益 {afterTax} 的安全存款，会增长到 {surrenderValueFV}。您的保费 {annualPremium} 减去定期保费 {termPremium}，每年剩下 {yearlyDifference}；在剩余 {remainingYears} 年里每年年初存入同样的存款，合计为 {result}。",
  },
  policyIrr: {
    title: "保单的年回报率",
    body: "保留保单意味着放弃今天的 {surrenderValue}，并在 {termYears} 年期限的剩余 {remainingYears} 年里每年交 {annualPremium}，到期拿到 {expectedMaturity}：相当于这笔钱每年赚 {result}。如果停交并存下差额，可以达到 {investValue}，相差 {difference}。",
  },
};
