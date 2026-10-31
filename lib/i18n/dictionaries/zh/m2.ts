import type { Dictionary } from "../../types";

/**
 * Insurance & health screen (M2). `note.*` covers M2_NOTE_KEYS and `check.*` covers M2_CHECK_KEYS.
 * `check.claimSettlement` takes {claimSettlement} (a percent); no other check or note takes a placeholder.
 */
export const m2: Dictionary["m2"] = {
  title: "保险与健康",
  intro: "您的家人需要多少寿险和医疗保障、大概要花多少钱，以及签约前如何考察保险公司。",
  demo: "示例数字，仅供预览。此视图不使用您自己的输入。",
  backToPlan: "返回我的计划",

  needProfile: {
    title: "先回答几个关于您的问题",
    body: "这项检查会用到您的年龄、收入和依靠您的人。先回答五个开始问题，再回到这里。",
    cta: "回答问题",
  },

  flow: {
    eyebrow: "保险检查",
    smoker: {
      title: "您吸烟或使用烟草制品吗？",
      hint: "保险公司对吸烟者的寿险收费更高，所以价格区间取决于这一点。",
    },
    lifeCover: {
      title: "您已经有多少寿险保障？",
      hint: "把您持有的每份寿险保单的保额加起来，包括单位提供的保障。没有就填 0。",
      none: "我没有",
    },
    healthCover: {
      title: "您的家人已经有多少医疗保障？",
      hint: "您自己或单位医疗保单的年度限额，全家合计。没有就填 0。",
      none: "我们没有",
    },
    people: {
      title: "医疗保障应该包括谁？",
      hint: "我们已根据依靠您的人预先填好。如果还有其他人需要保障，请修改。",
    },
    seeResult: "查看结果",
  },

  section: {
    inputs: "您的回答",
    result: "您的家人需要的保障",
    notes: "温馨提示",
  },

  input: {
    smoker: {
      label: "您吸烟或使用烟草制品吗？",
      hint: "吸烟者的寿险更贵。在任何投保单上也要如实说明。",
    },
    existingLifeCover: {
      label: "已有的寿险保障",
      hint: "您持有的每份寿险保单的保额，包括单位提供的。没有就填 0。",
    },
    existingHealthCover: {
      label: "家人已有的医疗保障",
      hint: "每份医疗保单的年度限额，不论是您自己的还是单位的，全家合计。没有就填 0。",
    },
    people: {
      label: "医疗保障包括谁",
      hint: "选出所有应该被保障的人。",
    },
    childrenCount: {
      label: "要保障的子女人数",
    },
    parentsCount: {
      label: "要保障的父母人数",
    },
    parentAge: {
      label: "年长一方父母的年龄",
      hint: "年龄越大医疗保障越贵，所以价格区间会用到这个数字。",
    },
    coverToAge: {
      label: "寿险保障到几岁",
      hint: "孩子长大后，大多数家庭就不再依靠您的收入，所以保障很少需要超过退休年龄。",
    },
    incomeShare: {
      label: "家人需要您收入的几成",
      hint: "没有了您，有些开支也会停止，所以家人只需要您收入的一部分，而不是全部。",
    },
    investments: {
      label: "家人可以变卖的投资",
      hint: "股票、基金、储蓄券或黄金。您的应急储蓄已经算进去了。",
    },
    youngestChildAge: {
      label: "最小孩子的年龄（选填）",
      hint: "如果孩子能自立的时间早于下面的年龄，寿险就保障到那个孩子能自立为止。",
    },
  },

  person: {
    self: "我",
    partner: "配偶",
    child: "子女",
    parent: "父母",
  },

  status: {
    red: "保障缺口很大",
    amber: "保障有所欠缺",
    green: "目前保障充足",
  },

  life: {
    title: "寿险保障",
    label: "家人需要的寿险保障",
    multiple: "约为您年收入的 {multiple} 倍",
    existing: "已有的保障",
    gap: "还需购买",
    years: "保障年数",
    yearsValue: "{years}（到 {age} 岁）",
    incomeNeed: "用于替代您的收入",
    incomeNeedHint: "这些年里家人需要的钱，按今天的币值计。",
    enough: "您已有的保障目前足够。",
    notNeeded: "暂时不需要",
    why: "为什么需要 {amount} 的寿险保障？",
    status: {
      red: "大部分保障缺失",
      amber: "部分保障缺失",
      green: "寿险保障充足",
    },
  },

  health: {
    title: "医疗保障",
    label: "家庭医疗保障",
    caption: "覆盖 {people} 人",
    captionOne: "覆盖 {people} 人",
    perPerson: "每位成人",
    perPersonHint: "大约是住院一次的花费。",
    existing: "家人已有的保障",
    gap: "还需购买",
    enough: "家人的医疗保障目前足够。",
    why: "为什么需要 {amount} 的医疗保障？",
    status: {
      red: "大部分保障缺失",
      amber: "部分保障缺失",
      green: "医疗保障充足",
    },
  },

  premium: {
    title: "大概要花多少",
    monthly: "每月预留",
    caption: "您的计划会为这两项保障预留这笔钱。",
    captionNone: "无需再预留：您已有的保障目前足够。",
    captionHealth: "您的计划会为医疗保障预留这笔钱。",
    captionLife: "您的计划会为定期寿险预留这笔钱。",
    life: "定期寿险，每年",
    lifeHint: "保额 {gap}。",
    smokerHint: "保额 {gap}，按吸烟者价格。",
    health: "医疗保障，每年",
    healthHint: "增加 {gap} 的保障。",
    range: "{low} – {high}",
    none: "无需再买",
    indicative: "粗略范围，并非报价",
    why: "为什么每月 {amount}？",
  },

  policy: {
    title: "已经在交储蓄型保单？",
    hint: "到期会返还一笔钱的保单（两全保险）。看看它和单纯的定期保障相比如何。",
    intro: "按保单文件填写数字。我们会把保单到期支付的金额，与“买同等保额的定期寿险，把剩下的保费存进安全存款”进行比较。",
    annualPremium: {
      label: "每年交的保费",
    },
    sumAssured: {
      label: "保单提供的寿险保障",
      hint: "保单上写的保额。",
    },
    termYears: {
      label: "保单总期限",
    },
    yearsPaid: {
      label: "已交年数",
    },
    expectedMaturity: {
      label: "保单到期支付的金额",
      hint: "保险公司利益演示中的满期金，含预期红利。",
    },
    surrenderValue: {
      label: "如果今天停交，保险公司会退多少（选填）",
      hint: "退保金或减额交清后的价值，请向保险公司询问。不填的话，比较中不计入停交能拿回的钱。",
    },
    incomplete: "填好全部五个数字才能看到比较结果。",
    keep: "如果保留保单",
    keepHint: "在保单期满时支付。",
    alternative: "定期保障加存下差额",
    alternativeHint: "每笔保费剩下的部分在剩余的 {years} 里存入{instrument}。",
    atLeast: "至少 {amount}",
    surrenderPart: "含退保金 {amount}，增长到期末。",
    termPremium: "同等保额的定期保障，每年",
    remaining: "剩余缴费年数",
    irr: "保单的年回报率",
    irrHint: "如果保单按演示金额支付，保费每年能赚多少。",
    verdict: {
      termPlusInvestAhead: "按这些数字，定期保障加存下差额，到期末可能多出约 {amount}。",
      policyAhead: "按这些数字，保单比定期保障加存下差额多出约 {amount}。",
      similar: "按这些数字，两条路的结果差不多。",
    },
    clear: "清除这些数字",
    why: "为什么这样比较？",
  },

  checklist: {
    title: "先看保险公司，再看保单",
    intro: "保单好不好，取决于保险公司是否真的理赔。签约前请逐项核对这份清单。",
    regulatorLink: "保险监管机构：{name}",
    complaintsLink: "投诉渠道：{name}",
  },

  note: {
    noDependents: "没有人依靠您的收入，您也没有债务，所以暂时不需要寿险。医疗保障依然重要。",
    debtsOnly: "没有人依靠您的收入，所以寿险只需覆盖您的债务，确保债务不会落到家人身上。",
    publicCoverBroad: "在您的国家，公共医疗承担了大部分住院费用，所以我们只把您自己的医疗保障定为住院费用的一个最低比例。",
    premiumIndicative: "保费是根据常见价格表得出的粗略范围，并非报价。您的价格取决于您的健康状况、保险公司和保单。",
    noTermSold: "我们没有您所在国家纯定期寿险的价格表，所以寿险保费显示为零。请向保险公司询问定期寿险报价。",
    separateInvesting: "保险和投资要分开：保障是一项开支，就像房租；为未来储蓄要单独进行。",
    policyNotAdvice: "这只是粗略比较，并不是建议您停交或保留任何保单。提前停交保单往往会亏钱，所以在做任何改变前，请先问保险公司能退给您多少。",
    policyNoSurrender: "您没有填写今天停交时保险公司会退的金额，所以我们按零计算。这样停交看起来比实际更不划算：请向保险公司询问退保金并填上。",
    policyMatured: "这份保单的保费已全部交完，没有可比较的了。到期时领取满期金即可。",
    multipleOutsideBand: "常见的经验法则是寿险保额为年到手收入的十到十五倍。由于您的家庭、债务和储蓄情况，您的数字在这个范围之外；上面的数字是专门为您算出的。",
    noHealthPriceTable: "我们没有您所在国家医疗保险的价格表，所以医疗保费显示为零。请向保险公司询问上述保障的报价。",
  },

  check: {
    regulator: "确认保险公司持有保险监管机构颁发的牌照。签约前在监管机构的网站上查一查。",
    claimSettlement: "问问保险公司的理赔率是多少。这里寿险公司的平均理赔率约为 {claimSettlement}；请选择明显高于这个数字的公司。",
    complaints: "知道去哪里投诉。如果理赔被无故拒绝或拖延，监管机构的投诉部门可以介入。",
    waitingPeriods: "看清等待期。许多医疗保单在头一两年不赔某些疾病。",
    exclusions: "在签约前，而不是在理赔后，读一读不保什么。",
    cashlessNetwork: "确认哪些医院可以直接结算、无需您先垫付，包括您家人住处附近的医院。",
    honestProposal: "如实回答投保单上的每个问题，包括吸烟和既往病史。回答不实是理赔被拒最常见的原因。",
    buyYoung: "趁早买。年轻健康时保费更低，以后生病可能就很难买到保障了。",
    medicalTests: "保额较大时要做体检。去做吧：它能保护您将来的理赔。",
  },
};
