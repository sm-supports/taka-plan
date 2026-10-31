import type { Dictionary } from "../../types";

/** "Why this number?" entries for M7 steps (explain.m7.<step>). Placeholders: see ../en/explain-m7.ts. */
export const explainM7: Dictionary["explain"]["m7"] = {
  spendingAtRetirement: {
    title: "退休第一年的开支",
    body: "今天每月开支 {monthlySpending}，乘以 12，按每年 {inflation} 的物价涨幅增长到您停止工作前的 {retireInYears} 年：12 × {monthlySpending} × (1 + {inflation})^{retireInYears}。您收到的租金也随物价上涨，所以先从中扣除。结果：每年 {result}。",
  },
  corpusContrast: {
    title: "到比较年龄的目标",
    body: "这笔资金第一年支付 {spendingAtRetirement}，之后随物价（{inflation}）上涨，支付 {retiredForYears} 年，其余部分税后赚 {returnRate}：{spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}。仅用于比较。",
  },
  corpusPlan: {
    title: "用到计划年龄的目标",
    body: "同一个公式，期限 {retiredForYears} 年：{spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}。它正好是逐年图表中在那个年龄花到零的那笔资金。",
  },
  savingsFv: {
    title: "停止工作时的储蓄",
    body: "您今天拥有的 {savings}，按每年 {accumulationRate} 继续投资 {retireInYears} 年：{savings} × (1 + {accumulationRate})^{retireInYears} = {result}。",
  },
  providentFund: {
    title: "停止工作时的公积金",
    body: "今天的余额 {balance}，加上每月缴存的 {monthlyContribution}，都按公积金自己的利率 {fundRate} 增长 {retireInYears} 年 = {result}。",
  },
  gratuity: {
    title: "离职金",
    body: "最后的月基本工资 {basicMonthly} ÷ {daysPerMonthCount} 天 × 每年 {daysCount} 天 × {serviceYears} 年服务 = {result}，离职时一次性领取。",
  },
  fixedPensions: {
    title: "固定养老金，按停止工作时估值",
    body: "从 {pensionFromAgeYears} 岁起每月 {publicPensionMonthly} 的公共养老金，加上每月 {fixedPensionMonthly} 的其他固定收入，支付到您的计划年龄（退休 {retiredForYears} 年）且不随物价上涨，按 {returnRate} 计算，在您停止工作时价值：{result}。这就是为什么在漫长的退休生活中，它们的购买力会缩水。",
  },
  gap: {
    title: "还需积累",
    body: "目标 {corpus}，减去届时已经有的一切（您的储蓄、公积金、离职金和固定养老金的价值），不低于零：{result}。",
  },
  monthly: {
    title: "每月储蓄",
    body: "每月存入、持续 {savingMonths} 个月、按每月 {monthlyRate} 增长，合计达到 {gap} 的金额：{gap} × {monthlyRate} ÷ ((1 + {monthlyRate})^{savingMonths} − 1) = {result}，向上取整以确保足够。",
  },
  withdrawal: {
    title: "第一年取款额",
    body: "{savings} 在第一年能支付的金额，之后每年随物价（{inflation}）上调，在赚取 {returnRate} 的同时能用 {retiredForYears} 年：{savings} × ({returnRate} − {inflation}) ÷ (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) = {result}，向下取整以确保不会不够用。",
  },
  safePot: {
    title: "安全钱袋",
    body: "第一年的取款额 {firstYear} 乘以 {potYears} 年 = {result}，放在安全且能很快取出的地方。",
  },
};
