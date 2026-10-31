import type { Dictionary } from "../../types";

/** M5 Goal planner. `note.*` covers M5_NOTE_KEYS. */
export const m5: Dictionary["m5"] = {
  title: "目标规划",
  intro: "一个真正的目标要有金额、日期和您的年龄。每个人至少都有一个目标：养老。",

  input: {
    name: { label: "目标名称", hint: "女儿上大学、买房首付、朝觐、买车……", placeholder: "您在为什么存钱？" },
    cost: { label: "按今天价格计的花费", hint: "如果今天就付需要多少钱。通胀由我们帮您算。" },
    years: { label: "还有几年", hint: "从现在起的整年数，{min} 到 {max} 年。" },
    type: { label: "目标类型", hint: "教育和医疗费用比一般物价涨得快，所以有各自的通胀率。" },
    addGoal: "添加目标",
    removeGoal: "删除目标",
    incomplete: "目标需要填写名称、花费和年数才能保存。",
    newGoal: "新目标",
    saveGoal: "保存目标",
    saved: "您的目标",
  },

  result: {
    horizon: "期限",
    inflation: "采用的通胀率",
    futureValue: "您将需要",
    futureValueIn: "{years}后需要 {fv}",
    instrument: "存到",
    candidates: "这个期限的其他选择",
    nominal: "名义利率",
    afterTax: "税后",
    real: "实际回报率（扣除税款和通胀后）",
    belowInflation: "低于通胀：到期时这笔钱能买到的东西比今天少",
    monthly: "每月存",
    monthlyRange: "偏低 {low} · 预期 {base} · 偏高 {high}",
    monthlyLow: "回报偏低时",
    monthlyBase: "预期",
    monthlyHigh: "回报偏高时",
    months: "共{months}",
    totalMonthly: "所有目标合计",
    invalid: "这个目标缺少信息",
    empty: "还没有目标。",
    goalsCount: "{n} 个目标",
    realAbove: "税后跑赢通胀",
    perMonth: "每月",
  },

  demoBanner: "示例目标。添加您自己的目标，看看真实数字。",

  note: {
    noAllocationYet: "长期目标目前只使用固定收益产品。资产配置步骤上线后，五年以上的目标将使用包含部分股票的组合。",
    belowInflation: "这项产品税后的预期回报低于通胀。您仍能达到这个数字，但它能买到的东西会比您期望的少。更长的期限或收益更高的产品会有帮助。",
  },

  status: {
    red: "预期回报低于通胀",
    amber: "可以达到，但比较紧",
    green: "进展顺利",
  },
};
