import type { Dictionary } from "../../types";

/** Plan screen. `reason.*` and `next.*` cover PLAN_REASON_KEYS / PLAN_NEXT_KEYS (params: see en/plan.ts). */
export const plan: Dictionary["plan"] = {
  title: "您的计划",
  headline: "每月储蓄 {amount}",
  subhead: "按优先顺序分配到各个用途。点按卡片即可调整，计划会实时更新。",
  emptyGoals: "还没有目标。添加一个吧——养老也算——计划会为它留出空间。",
  builtOn: "基于费率 v{version}",
  demoBanner: "这是用示例数字生成的样例计划，不是您的数据。关闭演示开关打开计划，即可查看您自己的计划。",

  why: {
    headline: "为什么每月存 {amount}？",
    bucket: "为什么给{bucket} {amount}？",
  },

  error: {
    title: "您的计划还没准备好",
    retry: "重试",
  },

  card: {
    amount: "金额",
    instrument: "放在哪里",
    reason: "原因",
    nextStep: "下一步",
    open: "打开计算器",
    priority: "优先级 {n}",
    perMonth: "{amount}/月",
    goalTitle: "目标：{name}",
    bucket: {
      emergency: "应急基金",
      insurance: "保险",
      debt: "还债",
      goal: "目标",
      retirement: "养老",
      future: "未来",
    },
  },

  more: {
    title: "完善您的计划",
    start: "开始",
    edit: "编辑",
    reserved: "计划每月为此预留 {amount}。",
    m2: { title: "保险与健康", body: "您的家人需要多少寿险和医疗保障，大概要花多少钱。" },
    m6: { title: "资产配置", body: "按您的年龄，长期资金如何在固定收益、股票和黄金之间分配。" },
    m7: { title: "养老与家庭", body: "靠自己的钱生活到100岁需要多少，哪些收入来源能减轻负担。" },
  },

  summary: {
    title: "摘要",
    emergencyShare: "在应急基金存满之前，每月金额的{share}投入应急基金。",
    monthsToFull: "应急基金将在{months}后存满。",
    emergencyFull: "您的应急基金已存满。",
    goalsShortfall: "您的目标每月还差 {amount}，目前计划无法覆盖。",
    noShortfall: "所有目标都能放进本月的金额里。",
    retirementShortfall: "养老每月还差 {amount}，目前计划无法覆盖。",
  },

  reason: {
    emergency: "应急基金——每月 {amount} 存入{instrument}——已覆盖 {covered}/{months} 个月",
    emergencyFull: "应急基金——已存满 {months} 个月的必要开支——每次动用后请补足",
    debt: "利率 {rate} 的高息债务——在月供之外每月多还 {amount}——按此进度约{months}还清",
    debtNever: "利率 {rate} 的高息债务——在月供之外每月多还 {amount}——按此进度永远还不清，请多还一些或转到更便宜的贷款",
    debtNone: "利率 {rate} 的高息债务——本月暂时挤不出钱——每笔债务至少还最低还款额",
    goal: "{name}——每月 {amount} 存入{instrument}——{years}后需要 {fv}",
    addGoal: "添加一个目标——每个计划至少需要一个，养老也算",
    insurance: "保险——每月预留 {amount}，用于定期寿险和医疗保障",
    insuranceNone: "保险——本月暂时挤不出钱——保障依然重要，请打开保险检查",
    retirement: "养老——每月 {amount}，让您的钱用到 {planTo} 岁",
    retirementShort: "养老——所需 {need} 中每月投入 {amount}——可用到 {lastsTo} 岁",
    retirementShortNoAge: "养老——所需 {need} 中每月投入 {amount}",
    retirementNone: "养老——每月需要 {need}，本月暂时挤不出钱",
    future: "长期储蓄——每月 {amount} 存入{instrument}，直到您添加目标",
  },

  next: {
    fdrLadder: "带上身份证和税号去任意一家银行，申请一笔3个月期{product}。连续三个月每月开一笔，这样每个月都有一笔到期。",
    openSavings: "带上身份证去任意一家银行开一个{product}。在里面放一个月的必要开支，其余放进3个月期存款。",
    prepayDebt: "打电话给贷款方，问清楚如何提前偿还本金而不被罚息。先还利率最高的债务。",
    dps: "请银行为您开一个{product}，设定在工资到账后第二天自动扣款。金额多少都行，养成习惯比金额大小更重要。",
    sanchayapatra: "带上身份证、税号和一张您银行账户的支票，到出售政府储蓄券的银行网点或邮局，申请一份{product}。",
    tbond: "请银行为您登记参加国债拍卖，竞买5年期或10年期{product}；也可以通过证券账户买入已发行的国债。",
    fdr: "带上身份证和税号去任意一家银行，申请一笔1年期{product}，把存单放在安全的地方。",
    addGoal: "点按“添加目标”，填写名称、按今天价格计的花费，以及还有几年。",
    keepFull: "您的基金已存满：原样放着就好。每次取用后，先把同样的金额补回去，再做其他储蓄，让它保持完整。",
    insurance: "打开保险检查：它会算出您的家人需要多少寿险和医疗保障，以及大概要花多少钱。",
    retirement: "打开养老计划：看看靠自己的钱生活到100岁需要多少，哪些收入来源能减轻负担。",
    allocation: "打开资产配置：按您的年龄，把长期资金分配到固定收益、股票和黄金。",
  },

  note: {
    insuranceSkipped: "您在保险部分的回答无法按当前资料计算，所以本计划暂不包含保险。打开保险检查即可更新。",
    allocationSkipped: "您在资产配置部分的回答无法按当前资料计算，所以计划暂时使用固定收益。打开资产配置即可更新。",
    retirementSkipped: "您在养老部分的回答已与当前资料不符（例如年龄变了），所以本计划暂不包含养老。打开养老计划即可更新。",
  },
};
