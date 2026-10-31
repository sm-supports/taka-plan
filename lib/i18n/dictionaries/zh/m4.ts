import type { Dictionary } from "../../types";

/** M4 Save-first budget: income − savings = expenses. */
export const m4: Dictionary["m4"] = {
  title: "先存后花预算",
  intro: "把等式倒过来：发薪日先存钱，剩下的再花。养成习惯比金额多少更重要。",
  demo: "示例数字，仅供预览。此视图不使用您自己的输入。",

  section: {
    inputs: "您的数字",
    result: "您的先存后花预算",
    where: "钱去哪里",
    nextStep: "下一步",
  },

  input: {
    takeHome: { label: "每月到手收入", hint: "实际到账的钱。" },
    essentials: { label: "每月必要开支", hint: "房租、伙食、水电煤、交通、学费、给父母的赡养费、月供。" },
    incomeType: { label: "您的收入方式", hint: "自由职业者和企业主按每笔收入的一定比例储蓄，而不是固定金额。" },
    savingsRate: {
      label: "储蓄率",
      hint: "我们建议存到手收入的 {suggested}。您可以调低到自己真正能坚持的任何金额。",
      suggested: "建议：{rate}",
      useSuggested: "采用建议",
    },
    payday: { label: "工资到账日", hint: "我们会建议在第二天转账，赶在钱被花掉之前。" },
    last6Incomes: { label: "最近六个月的收入", hint: "每月一个数字。我们用平均值作为您的到手收入。", month: "第 {n} 个月" },
  },

  result: {
    equation: "{income} − {savings} = {expenses}",
    equationLabel: "收入 − 储蓄 = 开支",
    averageIncome: "平均月收入",
    suggestedRate: "建议储蓄率",
    feasibleRate: "最多能存",
    feasibleRateHint: "扣除必要开支后剩下的部分占收入的比例。",
    savingsRate: "储蓄率",
    savingsAmount: "每月存",
    expensesAllowed: "可花的钱",
    essentialsShortfall: "必要开支超出预算",
    essentialsShortfallHint: "您的必要开支高于储蓄后剩下的钱。请降低储蓄率，或找一项必要开支压缩一下。",
    modeLabel: "您的储蓄方式",
    mode: {
      fixed: "每月固定金额",
      percentOfEachPayment: "每笔收入的一定比例",
    },
    percentOfEachPayment: "每笔收入到账当天，把其中的 {percent} 转入储蓄",
    instrument: "存到",
    instrumentHint: "DPS 在固定日期自动扣款，钱在您花掉之前就存起来了。",
    transferDay: "每月 {day} 日定期转账",
    transferDayUnknown: "告诉我们您的发薪日，我们会建议一个转账日期。",
  },

  next: {
    dps: "请银行为您开一个 DPS，设定每月 {day} 日自动扣款，也就是工资到账的第二天。金额多少都行，养成习惯比金额大小更重要。",
    dpsNoPayday: "请银行为您开一个 DPS，设定在工资到账后第二天自动扣款。金额多少都行，养成习惯比金额大小更重要。",
    percentOfEachPayment: "每笔收入到账当天，在花任何钱之前，先把其中的 {percent} 转入一个单独的储蓄账户。收入多的月份和少的月份都保持同样的比例；等余额稳定后，再改成 DPS。",
  },

  note: {
    instrumentDps: "我们建议用 DPS，因为它在固定日期自动扣款，钱在您花掉之前就存起来了。",
  },

  status: {
    red: "还没有储蓄",
    amber: "存了一点——继续加油",
    green: "每月都先存钱",
  },
};
