import type { Dictionary } from "../../types";

/** M1 Emergency fund. `rule.*` covers M1_RULE_KEYS, `next.*` covers M1_NEXT_KEYS. */
export const m1: Dictionary["m1"] = {
  title: "应急基金",
  intro: "当收入中断或突然来一笔账单时，一两天内就能拿到的钱。它的大小要按您的家庭来定，而不是套用固定规则。",
  demo: "示例数字，仅供预览。此视图不使用您自己的输入。",

  section: {
    inputs: "您的数字",
    result: "您的应急基金",
    rules: "这笔钱的规则",
    nextStep: "下一步",
  },

  input: {
    essentials: {
      label: "每月必要开支",
      hint: "房租、伙食、水电煤、交通、学费、给父母的赡养费、正在还的月供。",
    },
    incomeType: {
      label: "您的收入方式",
      hint: "自由职业和经营收入不太稳定，所以储备的起点更高。",
    },
    dependents: {
      label: "谁依靠您",
      hint: "选出所有符合的人。",
    },
    soleEarner: {
      label: "您是家里唯一挣钱的人吗？",
      hint: "如果没有其他人挣钱，这笔基金需要撑得更久。",
    },
    hasHealthInsurance: {
      label: "您有医疗保险吗？",
      hint: "没有保障的话，住院费要从这笔基金里出，所以它要更大。",
    },
    liquidSavings: {
      label: "今天就能动用的储蓄",
      hint: "现金、储蓄账户，以及几天内就能取出的存款。不包括{product}、股票或黄金里的钱。",
    },
    months: {
      label: "覆盖月数",
      hint: "我们给出一个起点；您可以按家庭的实际感受在 {min} 到 {max} 个月之间调整。",
      suggested: "建议：{months}",
      useSuggested: "采用建议",
    },
    buildMonths: {
      label: "分几个月存满",
      hint: "您打算用多少个月把基金存满。",
    },
  },

  result: {
    suggestedMonths: "建议覆盖：{months}",
    months: "覆盖月数",
    target: "目标",
    saved: "已存",
    gap: "还需存",
    monthlySaving: "每月储蓄",
    monthsCovered: "已覆盖月数",
    monthsCoveredOf: "已覆盖 {covered}/{months} 个月",
    monthsToFull: "{months}后存满",
    full: "您的应急基金已存满",
    tiers: {
      title: "放在哪里",
      savingsAccount: "当天可取的储蓄账户",
      savingsAccountHint: "一个月的必要开支，当天就能取出。",
      fdrLadder: "3个月期存款阶梯",
      fdrLadderHint: "其余部分分成三笔定期存款，连续三个月每月开一笔，这样每个月都有一笔到期。",
      fdrPerSlice: "每笔存款",
      fdrSlices: "三笔存款，每笔 {amount}，每月开一笔。",
      banksNeeded: "需要分散到的银行数",
      banksNeededHint: "存款保险每家银行只保障 {limit}，所以任何一家银行的存款都不要超过这个数。",
      sanchayapatraLayer: "第三层：{product}",
      sanchayapatraLayerHint: "您的储备够大，可以把一部分放进{product}，收益更高，但提前兑付会被扣钱。",
    },
  },

  rule: {
    noStocks: "这笔钱不要放股票或股票基金。哪怕在最糟的日子，它也必须足额都在。",
    sanchayapatraThirdLayer: "{product}只适合作为超大储备的第三层：收益更高，但提前兑付会损失部分收益。",
    cardBridge: "定期存款兑现需要一两天，这期间可以用信用卡过渡——前提是在免息期内全额还清账单。",
    refill: "用过这笔基金？先把它补满，再把钱放到其他地方。",
    notAnEmergency: "度假、买手机或婚礼礼金都不算紧急情况。请把它们当作目标来存钱。",
  },

  next: {
    openSavings: "带上身份证去任意一家银行开一个储蓄账户；把一个月的必要开支转进去，其余部分设置定期转账。",
    fdrLadder: "带上身份证和税号去任意一家银行，申请一笔3个月期{product}。连续三个月每月开一笔，这样每个月都有一笔到期。",
    splitBanks: "您的基金超过了单家银行的存款保险上限。到第二家银行开定期存款，让每家银行的存款都不超过上限。",
    full: "您的基金已存满。让存款继续滚存；每次取用后，先补满基金，再做其他储蓄。",
  },

  status: {
    red: "覆盖不足一个月",
    amber: "部分覆盖——继续存",
    green: "已完全覆盖",
  },
};
