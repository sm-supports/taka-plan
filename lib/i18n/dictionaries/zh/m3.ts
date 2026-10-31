import type { Dictionary } from "../../types";

/** M3 Debt health check. `path.*` covers M3_PATH_KEYS, `flag.<DebtFlagId>` covers every DebtFlagId. */
export const m3: Dictionary["m3"] = {
  title: "债务体检",
  intro: "把每笔贷款和每张信用卡按利率列出来。先还最贵的，永远不要为生活享受借钱。",

  input: {
    takeHome: { label: "每月到手收入", hint: "每月实际到账的钱。" },
    essentials: { label: "每月必要开支", hint: "房租、伙食、水电煤、交通、学费、给父母的赡养费。" },
    savingsTarget: { label: "每月储蓄", hint: "预算中“先存后花”的金额。它在任何月供之前就先留出来。" },
    cashBuffer: { label: "现金缓冲", hint: "每月为意外留一点余地。我们建议取到手收入的一定比例，您也可以修改。" },
    extraMonthly: { label: "每月额外还债", hint: "最低还款额之外的任何金额。留空则使用您所有的余量。" },
    loans: {
      title: "贷款",
      add: "添加贷款",
      remove: "删除贷款",
      empty: "尚未添加贷款。",
      type: { label: "贷款类型", hint: "选最接近的一项；只影响显示的名称。" },
      outstanding: { label: "尚欠金额", hint: "按最新账单，今天剩余的本金。" },
      annualRate: { label: "年利率", hint: "贷款合同或账单上的利率。" },
      emi: { label: "每月月供", hint: "您每月固定还的金额。" },
      monthsLeft: { label: "剩余月数", hint: "还要还的期数。" },
    },
    cards: {
      title: "信用卡",
      add: "添加信用卡",
      remove: "删除信用卡",
      empty: "尚未添加信用卡。",
      balance: { label: "欠款余额", hint: "最新账单上的金额。" },
      limit: { label: "信用额度", hint: "银行允许您消费的最高金额。" },
      annualRate: { label: "年利率", hint: "留空则使用法定或常见的信用卡利率。" },
      paysInFull: { label: "您每月都在免息期内全额还款吗？", hint: "如果是，信用卡不花您一分钱。如果不是，这就是您最贵的钱。" },
    },
    scenario: {
      title: "我能借多少？",
      annualRate: { label: "贷款年利率", hint: "银行给您的报价，或我们为个人贷款设定的默认值。" },
      months: { label: "还款期限", hint: "以月计。" },
    },
  },

  result: {
    totalEmi: "每月月供合计",
    emiRatio: "月供占到手收入的比例",
    emiCapacity: "月供承受能力",
    emiCapacityHint: "扣除储蓄、必要开支和现金缓冲后，可用于月供的钱。",
    headroom: "余量",
    headroomHint: "月供承受能力减去您正在还的月供。",
    maxAffordableLoan: "最多能承受的贷款",
    scenario: "年利率 {rate}，期限 {months}",
    scenarioEmi: "这笔贷款的每月月供",
    flags: "警示",
    noFlags: "没有警示。您的债务在掌控之中。",
    noDebt: "没有贷款或信用卡。这里没什么要处理的——继续保持。",
    highInterestDebts: "年利率高于 {threshold} 的债务",
    payoffOrder: "还款顺序",
    payoffOrderHint: "利率最高的先还。其他债务只还最低额，把每一分闲钱都投向列表最上面那笔。",
    avalanche: "利率最高的先还",
    snowball: "余额最小的先还",
    interestSaved: "先还最高利率可省下的利息",
    payoffMonths: "{months}后还清债务",
    totalInterest: "利息合计",
    minPayment: "最低还款额",
    path: "如果您感到被债务困住",
    emiRatioNote: "贷款方各有自己的上限。月供超过到手收入的 {threshold} 时我们会提醒，因为剩下用来储蓄或应对冲击的钱太少了。",
    maxLoanNote: "按精确公式，年利率 {rate}、期限 {months}、每月月供 {emi}，大约可借 {loan}。银行还会看您的收入和信用记录，所以借钱前请自己再留出安全余地。",
    primaryFlag: "最紧急",
    otherFlags: "同样值得处理",
    cardLabel: "信用卡",
    extraUsed: "每月额外还债：{amount}",
    compare: "与余额最小的先还相比",
    numbers: "您的数字",
    borrow: "我能借多少？",
  },

  profile: {
    title: "来自您的资料",
    hint: "修改这些，您的计划也会随之更新。",
  },

  demoBanner: "示例数字。添加您自己的贷款和信用卡，看看真实情况。",

  flag: {
    card_carried: {
      title: "信用卡欠款过了还款日仍未还清",
      body: "信用卡未还余额的利息约为每年 {rate}——这是最贵的钱。先还清它，再还其他债务。",
    },
    card_utilisation: {
      title: "信用卡使用超过额度的 {threshold}",
      body: "您已用掉信用额度的 {value}。请控制在一半以下：这能降低账单、保护您的 CIB 信用记录，并为真正的紧急情况留出余地。",
    },
    emi_ratio: {
      title: "月供超过到手收入的 {threshold}",
      body: "您到手收入的 {value} 用于月供。贷款方各有自己的上限；超过 {threshold} 时我们会提醒，因为剩下用来储蓄或应对冲击的钱太少了。",
    },
    negative_capacity: {
      title: "没有能力承担任何月供",
      body: "扣除储蓄、必要开支和现金缓冲后，已经没有钱还贷款了。在借更多钱之前，请削减开支、增加收入或重组债务。",
    },
  },

  path: {
    listLoans: "写下每笔贷款和每张信用卡：欠款金额、利率和每月还款额。按利率从高到低排序。",
    tellFamily: "告诉家人。隐瞒债务只会让它越滚越大；家里人都知道了，才能一起节省开支。",
    stopBorrowing: "停止一切新借款，包括本月无法全额还清的信用卡消费。",
    sellUnaffordable: "把用借来的钱买的、其实负担不起的东西卖掉——摩托车、手机、电子产品——把钱用来还最贵的债务。",
    refinanceCheaper: "只有在扣除费用后新贷款明显更便宜时才转贷，而且绝不能为了腾出空间多花钱而转贷。",
  },

  status: {
    red: "高成本债务需要立即处理",
    amber: "可控，但要留意",
    green: "债务在掌控之中",
  },
};
