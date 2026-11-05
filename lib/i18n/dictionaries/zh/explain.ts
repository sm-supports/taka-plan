// Input names per step are documented in ../en/explain.ts; the placeholders here must match.
import type { Dictionary } from "../../types";
import { explainM2 } from "./explain-m2";
import { explainM6 } from "./explain-m6";
import { explainM7 } from "./explain-m7";

export const explain: Dictionary["explain"] = {
  m2: explainM2,
  m6: explainM6,
  m7: explainM7,
  m1: {
    months: {
      title: "覆盖月数",
      body: "我们从 {base} 个月开始。收入不固定加 {bumpIrregular}，有受抚养人且您是唯一挣钱的人加 {bumpSoleEarner}，没有医疗保险加 {bumpNoHealth}。建议值保持在 {min} 到 {max} 个月之间：{result}。滑块由您自己调整。",
    },
    target: {
      title: "应急基金目标",
      body: "每月必要开支乘以覆盖月数：{essentials} × {months} = {result}。只算必要开支，因为在紧急情况下，其他开销都会停下来。",
    },
    gap: {
      title: "还需存",
      body: "目标减去您今天已能动用的钱：{target} − {saved} = {result}。它永远不会低于零；储备比计划多一些也没关系。",
    },
    monthly: {
      title: "每月储蓄",
      body: "把缺口分摊到您选择的存满月数里：{gap} ÷ {buildMonths} = 每月 {result}。",
    },
    covered: {
      title: "已覆盖月数",
      body: "您现在的储蓄能支撑几个月的必要开支：{saved} ÷ {essentials} = {result}。",
    },
    tier1: {
      title: "第一层：当天可取的储蓄账户",
      body: "一个月的必要开支放在今天就能取出的储蓄账户里：{essentials} = {result}。这是任何紧急情况第一周要用的钱。",
    },
    tier2: {
      title: "第二层：3个月期存款阶梯",
      body: "第一层以外的部分都放进定期存款：{target} − {tier1} = {result}，分成三笔存款，连续三个月每月开一笔，这样每个月都有一笔到期。",
    },
    banks: {
      title: "需要的银行数",
      body: "存款保险每家银行保障 {limit}，而整笔基金都存在银行里，所以把目标拆分：{target} ÷ {limit}，向上取整 = {result} 家银行。",
    },
  },

  m3: {
    totalEmi: {
      title: "每月月供合计",
      body: "所有贷款的月供，加上未还清信用卡余额的最低还款额：{emis} + {cardMinimums} = {result}。",
    },
    emiRatio: {
      title: "月供占到手收入的比例",
      body: "月供合计除以到手收入：{totalEmi} ÷ {takeHome} = {result}。贷款方各有自己的上限；比例偏高时我们会提醒，因为剩下用来储蓄的钱太少了。",
    },
    capacity: {
      title: "月供承受能力",
      body: "先储蓄、付完必要开支并留出现金缓冲后，剩下可以用来还贷款的钱：{takeHome} − {savings} − {essentials} − {buffer} = {result}。",
    },
    maxLoan: {
      title: "最多能承受的贷款",
      body: "把标准月供公式倒过来算。月利率 {monthlyRate}，期限 {months} 个月：{capacity} × (1 − (1 + {monthlyRate})^−{months}) ÷ {monthlyRate} = {result}。借钱前请自己再留出安全余地。",
    },
    scenarioEmi: {
      title: "这笔贷款的每月月供",
      body: "标准月供公式。借款 {principal}，月利率 {monthlyRate}，期限 {months} 个月：{principal} × {monthlyRate} ÷ (1 − (1 + {monthlyRate})^−{months}) = {result}。",
    },
    interestSaved: {
      title: "省下的利息",
      body: "先还利率最高的债务，利息合计 {avalancheInterest}；先还余额最小的，利息合计 {snowballInterest}。两者相差 {result}，这就是先还最高利率为您省下的钱。",
    },
  },

  m4: {
    average: {
      title: "平均月收入",
      body: "按最近 {months} 个月的收入取平均：{total} ÷ {months} = {result}。固定工资的话，这就是您的到手收入；自由职业者和企业主应填写最近六个月，让波动被抹平。",
    },
    feasible: {
      title: "最多能存",
      body: "扣除必要开支后剩下的部分占收入的比例：({average} − {essentials}) ÷ {average} = {result}。建议的储蓄率永远不会超过这个数。",
    },
    amount: {
      title: "每月储蓄",
      body: "收入乘以您的储蓄率：{average} × {rate} = {result}。发薪日就把这笔钱转入储蓄，在任何花销之前。",
    },
    expenses: {
      title: "可花的钱",
      body: "收入减去储蓄，就是您的生活费：{average} − {savings} = {result}。核心思路就是：先存钱，再花剩下的。",
    },
  },

  m5: {
    fv: {
      title: "目标的未来花费",
      body: "今天的花费按通胀逐年增长到目标那一年：{cost} × (1 + {inflation})^{years} = {result}。这才是您真正要达到的数字。",
    },
    rate: {
      title: "税后回报",
      body: "{instrument}税前每年支付 {nominal}。扣除 {tax} 的代扣税款后，您每年实际留下 {result}。",
    },
    monthly: {
      title: "每月需要存",
      body: "按月利率 {monthlyRate}、存 {months} 个月，能增长到未来花费的金额：{fv} × {monthlyRate} ÷ ((1 + {monthlyRate})^{months} − 1) = {result}。",
    },
    real: {
      title: "实际回报率",
      body: "您的钱每年在购买力上的增长：(1 + {afterTax}) ÷ (1 + {inflation}) − 1 = {result}。低于零意味着这项产品虽然付利息，却跑输了通胀。",
    },
  },

  plan: {
    total: {
      title: "您的每月金额",
      body: "预算中“先存后花”的金额：{savings} = {result}。下面每个用途都从这一个数字里划出。",
    },
    emergencyShare: {
      title: "应急基金的份额",
      body: "在基金存满之前，应急基金按其计算器的要求每月拿 {m1Monthly}，但控制在您每月金额（{total}）的 {minShare} 到 {maxShare} 之间，让其他用途也能分到一些。它永远不会超过还需存的 {gap}：{result}。",
    },
    debtShare: {
      title: "高息债务的份额",
      body: "应急基金之后剩下的钱，用来偿还高于高息线的债务，最多到还清所需的金额（所有高息余额 ÷ 目标月数）：min({remaining}, {headroom}) = {result}。",
    },
    goalsShare: {
      title: "目标的份额",
      body: "剩下的钱都用于您的目标：min({remaining}, {goalsNeed}) = {result}。如果少于目标所需，计划会显示缺口。",
    },
    goalAllocation: {
      title: "这个目标的份额",
      body: "这个目标每月需要 {need}，您所有目标合计每月需要 {goalsNeed}。上面各用途分配后剩下的 {remaining} 按这个比例分配：{remaining} × {need} ÷ {goalsNeed} = {result}。",
    },
  },
};
