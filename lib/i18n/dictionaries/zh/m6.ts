import type { Dictionary } from "../../types";

/**
 * Asset mix screen (M6). `note.*` covers M6_NOTE_KEYS, `gate.*` M6_GATE_KEYS and `howto.*` M6_HOWTO_KEYS.
 * Never name a company, fund, broker or bank.
 */
export const m6: Dictionary["m6"] = {
  title: "资产配置",
  intro: "如何把长期资金分配到固定收益、股票和黄金，每一部分该买什么，以及如何让比例保持在目标上。",
  demo: "示例数字，仅供预览。此视图不使用您自己的回答。",
  needProfile: "请先回答五个开始问题，这样配置才能用到您的年龄和收入方式。",
  startLink: "回答开始问题",
  backToPlan: "返回我的计划",
  disclaimer: "仅为教育用途的估算，不构成投资建议。市场可能下跌并持续低迷多年，过去的回报不代表未来的回报。",

  flow: {
    progress: "第 {n} 题，共 {total} 题",
    gate: {
      title: "您有应急基金，而且没有信用卡欠款吗？",
      hint: "长期资金要排在存满应急基金、还清信用卡欠款之后。以下是您的计划显示的情况。",
      emergencyOk: "您的应急基金已存满。",
      emergencyMissing: "您的应急基金还没存满。",
      cardOk: "您没有信用卡欠款。",
      cardMissing: "您的信用卡每月都有未还清的余额。",
      openEmergency: "打开应急基金",
      openDebt: "打开债务体检",
      allClear: "很好：您可以开始长期投资了。",
      continue: "继续",
      continueAnyway: "仍然继续",
    },
    ageBand: {
      title: "您属于哪个年龄段？",
      hint: "根据您的年龄填好。越年轻，越有时间熬过下跌。",
    },
    incomeStability: {
      title: "您的收入有多稳定？",
      hint: "根据您的收入方式填好。收入越稳定，越能承受多一点风险。",
    },
    horizon: {
      title: "您什么时候需要这笔钱？",
      hint: "滑动选择年数。很快就要用的钱不应该放在股票里。",
      band: "这属于：{band}。",
    },
    reaction: {
      title: "如果您的投资一年内下跌 20%，您会……",
      hint: "没有错误答案。请如实回答：它决定了您能接受多少股票。",
    },
    amounts: {
      title: "您打算投资多少？",
      hint: "一次性金额、每月金额，或两者都有。以后可以修改。",
      needOne: "输入一次性金额或每月金额，即可查看您的配置。",
      seeResult: "查看我的配置",
    },
  },

  answer: {
    ageBand: { "0": "50岁及以上", "1": "35到49岁", "2": "35岁以下" },
    incomeStability: { "0": "经营收入", "1": "自由职业或收入不固定", "2": "工薪收入" },
    horizon: { "0": "5年以内", "1": "5到10年后", "2": "10年以上" },
    reaction: { "0": "卖出，止住损失", "1": "等它回升", "2": "趁便宜多买一些" },
  },

  profile: {
    careful: "稳健型",
    balanced: "平衡型",
    growth: "成长型",
  },

  bucket: {
    fixedIncome: "固定收益",
    equity: "股票",
    gold: "黄金",
  },

  section: {
    result: "您的配置",
    instruments: "买什么",
    projection: "可能增长到多少",
    rebalance: "我已经在投资",
    inputs: "您的回答",
    netWorth: "净资产",
    notes: "温馨提示",
  },

  input: {
    ageBand: { label: "年龄段" },
    incomeStability: { label: "收入稳定程度" },
    horizon: { label: "何时需要这笔钱" },
    reaction: { label: "如果您的投资一年内下跌 20%" },
    profileOverride: {
      label: "风险类型",
      hint: "我们根据您的回答建议一种。您也可以选择其他类型；股票比例永远不会超过上限。",
      suggested: "根据您的回答建议",
    },
    goldShare: {
      label: "黄金比例",
      hint: "作为对冲，保持在配置的 {min} 到 {max} 之间。",
      reset: "恢复为 {share}",
    },
    horizonYears: {
      label: "距离需要用钱还有几年",
      hint: "少于 {noEquity} 年不放股票；少于 {cashOnly} 年只放存款和国库券。",
    },
    lumpSum: {
      label: "现在投入的一次性金额",
      hint: "今天就能长期放着不动的钱。",
    },
    monthly: {
      label: "每月金额",
      hint: "您每月能追加的钱。",
    },
    propertyValue: {
      label: "您拥有的房产（选填）",
      hint: "土地或住房。它计入您的净资产，但不参与分配，因为它不能小份买卖。",
    },
    directShares: {
      label: "直接买股票而不是买基金？",
      hint: "只有当您准备好自己挑选并盯住至少十家大公司时才这样做。",
    },
  },

  result: {
    score: "风险评分 {score}/{max}",
    profileLine: "您的类型：{profile}",
    suggestedLine: "根据您的回答建议：{profile}",
    barLabel: "您的配置：{parts}",
    lump: "一次性金额",
    monthly: "每月",
    whySplit: "为什么这样分配？",
    horizon: {
      noEquity: "您几年内就要用这笔钱，所以股票部分已转为固定收益。",
      cashOnly: "您一年内就要用这笔钱，所以全部放在存款或国库券里。",
    },
  },

  instrument: {
    title: "{bucket}：{share}",
    primary: "从这里开始",
    alternatives: "其他选择",
    unavailable: "您所在的国家没有这类产品。这部分暂时放在固定收益里。",
    localName: "当地名称：{name}",
  },

  projection: {
    intro: "{years} 年，共投入 {paidIn}。列出三种情况，因为没人知道哪一种会发生。",
    introNone: "输入一次性金额或每月金额，即可查看范围。",
    low: "偏低",
    base: "基准",
    high: "偏高",
    rate: "每年 {rate}",
    real: "按今天币值约 {amount}",
    lowLosesValue: "在偏低情况下，您的钱增长得比物价慢，购买力会下降。",
    why: "这些数字怎么来的？",
  },

  rebalance: {
    intro: "输入您目前在每一部分持有的金额，以及要追加的新资金。我们会算出买入或卖出多少才能回到您的配置。",
    open: "我已经在投资",
    close: "收起",
    holding: "目前持有的{bucket}",
    newMoney: { label: "要追加的新资金（选填）", hint: "新资金优先投向落后的部分。" },
    clear: "清除持有金额",
    total: "调整后合计：{amount}",
    buy: "买入 {amount}",
    sell: "卖出 {amount}",
    none: "无需调整",
    target: "目标 {share}",
    drift: "当前 {current}，偏离目标 {drift}",
    points: "{value} 个百分点",
    triggered: "至少有一部分偏离目标超过 {band}：该再平衡了。",
    withinBand: "每一部分都在目标的 {band} 以内。不过每年仍要再平衡一次。",
    newMoneyOnly: "仅靠新资金就能补上差距：无需卖出。",
    sellNote: "卖出意味着退出成本，可能还要交税。可以的话，在接下来几个月把新资金投向落后的部分。",
    why: "为什么这样交易？",
  },

  netWorth: {
    inMix: "配置中的投资",
    property: "房产（不参与分配）",
    total: "净资产",
  },

  note: {
    capApplied: "无论您的期限多长，股票比例都保持在上限。",
    horizonNoEquity: "您五年内就要用这笔钱，所以不持有股票。股票可能多年低迷。",
    horizonCashOnly: "您一年内就要用这笔钱，所以只放在短期存款或短期国库券里。",
    propertyExcluded: "房产计入您的净资产，但不参与分配：它不能小份买卖，也无法再平衡。",
    lowLosesValue: "在偏低情况下，钱增长得比物价慢，所以能买到的东西比您投入的少。",
    noIndexFund: "这里没有指数基金、黄金债券或房地产基金出售，所以股票部分使用分散投资的开放式基金，黄金则购买金条或金币。",
    neverBreakCertificates: "永远不要为了再平衡而提前兑付储蓄券：前几年的利率会大幅下降。请用新资金来调整。",
    exitCosts: "卖出前，请确认退出成本、股息税，以及金店愿意为黄金支付的价格。",
  },

  gate: {
    noEmergencyFund: "先存满应急基金。可能要被迫匆忙卖掉的长期资金，就不是真正的长期资金。",
    cardDebt: "先还清信用卡欠款。信用卡利息远高于任何投资可能赚到的收益。",
  },

  howto: {
    fixedIncome:
      "政府储蓄券在出售它的银行网点和邮局购买，国库券和国债通过银行的政府债券柜台购买，定期存款在任何一家持牌银行都能办理。请带上身份证；金额较大时还需要税号或纳税申报证明。",
    equityFund:
      "选择一只分散投资的开放式基金，通过基金管理人或代销其份额的银行开始每月定投。请带上身份证和银行账户。分散到许多公司；永远不要把这部分押在一只股票上。",
    directShares:
      "您需要一个证券账户。至少持有十家大公司的股票，分布在五个或更多行业，任何一只股票都不超过这部分的十分之一。要做好自己盯盘的准备。",
    gold: "从金银首饰行业协会会员的金店购买22K金条或金币，并保留收据。首饰要收加工费，卖回时价格更低，所以它是用来佩戴的，不是用来投资的。",
  },
};
