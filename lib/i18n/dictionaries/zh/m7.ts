import type { Dictionary } from "../../types";

/**
 * Retirement & family screen (M7, "Plan to 100"). `note.*` covers M7_NOTE_KEYS and `option.*`
 * covers M7_OPTION_KEYS. Tone: independence and dignity, never fear; no death imagery.
 */
export const m7: Dictionary["m7"] = {
  title: "养老与家庭",
  intro: "需要存多少钱，才能靠自己的钱、按自己的方式生活到100岁。",
  introRetired: "每个月可以从储蓄中取多少，才能让钱按您自己的方式用到100岁。",
  demo: "示例数字，仅供预览。此视图不使用您自己的输入。",

  flow: {
    mode: {
      title: "您还在工作，还是已经退休？",
      hint: "还在工作的话，我们算出每月要存多少。已经退休的话，我们算出每年可以取多少。",
    },
    age: {
      title: "您今年多大？",
      hint: "来自您的计划。如果不对，请修改。",
      label: "您的年龄",
    },
    retirementAge: {
      title: "您想在几岁停止工作？",
      hint: "大多数私营部门的工作在 {age} 岁结束。请选择适合您工作和身体状况的年龄。",
      label: "退休年龄",
    },
    spending: {
      title: "您家今天每月花多少钱？",
      hint: "按今天的币值。我们以您的必要开支为起点；请加上停止工作后仍要支付的其他开销。",
      label: "家庭每月开支",
    },
    savings: {
      title: "到目前为止您存下和投资了多少？",
      hint: "留作晚年用的储蓄、存款、{product}、基金和股票。不包括自住房，也不包括公积金（公积金在后面单独算）。",
      label: "目前的储蓄和投资",
    },
    monthlySaving: {
      title: "您现在每月存多少？",
      hint: "只算为晚年留出的钱。填零也没关系：计划就从这里开始。",
      label: "目前每月储蓄",
    },
    sex: {
      title: "您是男性还是女性？",
      hint: "选填。女性平均寿命约长两年，而且养老津贴的起领年龄不同。",
      skip: "跳过这个问题",
    },
    retireeType: {
      title: "您是从政府部门还是私营部门退休的？",
      hint: "政府、半政府机构和军队的退休人员可以使用一种只对他们开放的储蓄券。",
    },
    retiredSavings: {
      title: "您现在有哪些储蓄？",
      hint: "您的公积金和离职金、定期存款、储蓄券，以及其他用来生活的钱。",
      label: "现有储蓄",
    },
    otherIncome: {
      title: "每月还有哪些其他收入？",
      hint: "退休金、租金或储蓄以外的任何收入。没有的话就填零。",
      label: "每月其他收入",
    },
    retiredSpending: {
      title: "您家每月花多少钱？",
      hint: "全部开支，包括药费和家政帮手。",
      label: "家庭每月开支",
    },
    seeResult: "查看我的百岁计划",
  },

  mode: {
    working: "还在工作",
    workingHint: "算出能用到100岁的每月储蓄",
    retired: "已经退休",
    retiredHint: "算出能用到100岁的每年取款额",
  },
  sex: {
    male: "男性",
    female: "女性",
    unknown: "不愿透露",
  },
  retireeType: {
    government: "政府部门",
    governmentHint: "政府、半政府机构或军队",
    private: "私营部门或自雇",
    privateHint: "公司工作、经营生意或自由职业",
  },

  section: {
    inputs: "您的数字",
    sources: "停止工作后的收入",
    result: "您的计划",
  },

  input: {
    mode: "在职还是退休",
    age: {
      label: "您的年龄",
      hint: "在这里修改，您的计划中也会同步修改。",
    },
    sex: {
      label: "男性或女性（选填）",
      hint: "只用于两条提示：女性平均寿命更长，以及养老津贴的起领年龄。",
    },
    retirementAge: {
      label: "退休年龄",
      hint: "这里通常的退休年龄是 {age} 岁。",
    },
    planToAge: {
      label: "计划到几岁",
      hint: "我们默认计划到100岁。您可以调低到 {min} 岁，但不能更低，也可以调高到 {max} 岁。",
    },
    spending: {
      label: "今天的家庭每月开支",
      hint: "按今天的币值；我们会按物价把它涨到您停止工作的那一年。",
    },
    savings: {
      label: "目前的储蓄和投资",
      hint: "留作晚年用的钱。不包括自住房和公积金。",
    },
    monthlySaving: {
      label: "目前每月储蓄",
      hint: "您已经在为晚年留出的钱。",
    },
    retireeType: "您从哪里退休",
    retiredSavings: {
      label: "现有储蓄",
      hint: "您用来生活的所有钱：一次性领取的款项、定期存款、储蓄券。",
    },
    otherIncome: {
      label: "每月其他收入",
      hint: "退休金、租金或储蓄以外的任何收入。",
    },
  },

  sources: {
    intro: "添加您预计会有的收入。每一项都能减少您需要存的钱。",
    add: "添加",
    remove: "删除",
    notCounted: "不计入",
    lowered: "您的收入来源让每月储蓄减少了 {amount}。",
    retiredIntro: "您的其他收入已经在上面计入。下面两项只是为了让您看到全貌，从不计入。",
    pf: {
      title: "公积金",
      hint: "按公积金自己的利率增长，在您停止工作时一次性领取。",
      balance: "今天的余额",
      contribution: "每月缴存（您的部分加单位的部分）",
      contributionHint: "大单位现在通常缴存与您差不多的金额；请查看您的工资单。",
      rate: "公积金的年利率",
      rateHint: "见公积金的年度对账单。我们从不假设一个利率，因为各基金不同。",
    },
    gratuity: {
      title: "离职金",
      hint: "离职时一次性领取：按法律规定（或单位更优的规定），每服务一年领若干天的最后基本工资。",
      years: "停止工作时的服务年数",
      basic: "最后的每月基本工资",
      employerDays: "单位规定的每年天数（仅当多于法定天数时填写）",
      employerDaysHint: "留空则按法定规则计算。",
    },
    pension: {
      title: "公共养老金计划",
      hint: "终身按固定金额发放，所以每年能买到的东西越来越少。我们就是这样估值的。",
      scheme: "计划：{name}",
      contribution: "您每月的缴费",
      expected: "您预计每月领取的养老金（如果知道的话）",
      expectedHint: "留空则使用该计划的官方预测。",
    },
    fixedPension: {
      title: "其他固定养老金",
      hint: "任何不随物价上涨的养老金。",
      label: "每月养老金",
    },
    rent: {
      title: "您收到的租金",
      hint: "租金通常随物价上涨，所以直接从您的开支中扣除。",
      label: "今天的每月租金",
    },
    allowance: {
      title: "养老津贴",
      hint: "一笔需经收入审查的小额政府津贴。只为让您看到全貌，从不计入计划。",
      label: "您可能符合条件吗？",
      amount: "从 {age} 岁起每月约 {amount}",
    },
    family: {
      title: "家人的帮助",
      hint: "子女的帮助很好，但他们也会有自己的开销。这是额外的福分，从不是计划的一部分。",
      label: "每月可能得到的帮助",
    },
  },

  result: {
    headline: "每月存",
    caption: "让您的钱用到 {planTo} 岁。在 {retirementAge} 岁停止工作时的目标：{corpus}。",
    funded: "您现有的钱已经足够支撑到 {planTo} 岁的目标。继续保持投资。",
    currentSaving: "您现在每月存 {amount}。",
    mixUsed: "在您停止工作之前，储蓄按您资产配置的回报率增长。",
    contrast: {
      title: "计划到 {contrast} 岁还是 {planTo} 岁",
      to: "到 {age} 岁",
      target: "目标",
      monthly: "每月",
      extra: "每月多存的 {amount}，换来从 {contrast} 岁到 {planTo} 岁、多 {years} 年靠自己的钱生活。",
      noExtra: "您的储蓄已经覆盖了 {contrast} 岁之后的年份。",
      footnote: "{contrast} 岁只用于比较：很多人都活得远远超过这个年龄。",
    },
    range: {
      title: "取决于回报",
      low: "回报偏低时",
      base: "我们的基准情况",
      high: "回报偏高时",
      hint: "长期预测从来都不精确；我们显示一个范围，并把每个数字取整。",
    },
    chart: {
      title: "我的钱能用多久？",
      hint: "按您现在的储蓄额，您的储蓄逐年变化，以各年的币值计。",
      label: "{from} 岁到 {to} 岁的储蓄：在 {peakAge} 岁达到最高 {peak}。{verdict}。",
      axisAge: "年龄",
      retire: "停止工作",
    },
    verdict: {
      onTrack: "有望用到 {age} 岁",
      lastsTo: "可用到 {age} 岁",
      runsOut: "在 {age} 岁用完",
    },
    shift: {
      title: "提早或推迟 {years} 年开始会怎样",
      earlier: "如果您在 {age} 岁就开始",
      later: "如果您在 {age} 岁才开始",
      now: "现在开始，{age} 岁",
      perMonth: "每月 {amount}",
      notPossible: "离退休太近了",
      hint: "开支、储蓄和退休年龄都不变；只改变开始的时间。",
    },
    income: {
      title: "您的收入来源能贡献多少",
      pf: "停止工作时的公积金",
      gratuity: "离职金",
      pensions: "固定养老金，按停止工作时估值",
      publicPension: "每月公共养老金",
      rent: "停止工作时的年租金",
      allowance: "每月养老津贴",
      family: "每月家人的帮助",
    },
    addSources: "添加您的收入来源",
    editAnswers: "修改您的回答",
  },

  retired: {
    headline: "您每月可以取",
    caption: "也就是第一年取 {firstYear}，之后每年随物价上调，可以用到 {planTo} 岁。",
    chartHint: "按上面的取款额，您的储蓄逐年变化，以各年的币值计。",
    range: {
      title: "可以取多少，取决于回报",
      low: "回报仅与通胀持平时",
      hint: "长期预测从来都不精确；我们显示一个范围，并把每个数字取整。",
    },
    runsOut: "按每月从储蓄中支出 {spending} 计算，这笔钱大约能用到 {age} 岁。",
    lasts: "按每月从储蓄中支出 {spending} 计算，这笔钱可以用到 {planTo} 岁。",
    target: {
      title: "按您的开支所需的储蓄",
      hint: "按您从储蓄中支出的金额，到 {contrast} 岁和到 {planTo} 岁各需要多少。",
    },
    pot: {
      title: "两个钱袋法则",
      body: "把 {amount}——{years} 年的取款额——放在能很快取出的定期存款和国库券里。其余部分继续投资，每年为这个钱袋补充一次。",
    },
    options: {
      title: "把储蓄变成稳定收入的方式",
      localName: "在这里叫：{name}",
    },
  },

  bucket: {
    title: "这笔钱该放在哪里？",
    body: "晚年用的钱需要一个比任何一家公司都长久的去处。在没有宽基指数基金出售的地方，计划用三个部分搭建出最接近的组合：通过每月定投买入分散投资的开放式基金，用于增长；有政府担保的收入，例如公共养老金计划、储蓄券和国债；以及一个随着您接近 {retirementAge} 岁、每年变得更稳健的组合。",
    bodyRetired: "余生要用的钱需要一个比任何一家公司都长久的去处。把接下来几年的取款额放在能很快取出的存款和国库券里，其余放在有政府担保的收入产品中，例如储蓄券和国债，再拿一小部分放进分散投资的开放式基金，用于增长。",
    lock: "把这笔钱标记为“{retirementAge} 岁前不动”，在那之前别碰它。",
    link: "查看您的资产配置",
  },

  lifeTable: {
    title: "60岁以后人们还能活多久",
    hint: "每个年龄平均还剩多少年。有一半的人活得比平均值更久，所以计划从不止步于平均值。",
    age: "年龄",
    total: "平均",
    men: "男性",
    women: "女性",
    projected: "预测",
    source: "{source}，{date}",
  },
  supportRatio: "{fromYear}年，每位老年人对应 {fromValue} 名劳动年龄人口。到{toYear}年将只有约 {toValue} 名，所以请首先依靠自己的钱。",

  notes: {
    title: "温馨提示",
  },
  backToPlan: "返回我的计划",

  note: {
    planTo100: "计划默认到100岁，因为许多活到60岁的人会远远活过80岁。您可以调低，但不能低于85岁。",
    lifeAt60: "出生时的预期寿命把童年起的各个年龄都算了进去，所以看起来偏低。活到60岁的人平均还能再活约二十年，而且有一半的人活得更久。",
    womenLiveLonger: "女性平均寿命约长两年，所以夫妻的计划应该覆盖妻子更长的退休生活。",
    familyNotCounted: "家人的帮助从不计入：您的子女会有自己的家庭和开销。把它当作额外的福分，而不是计划。",
    allowanceNotCounted: "养老津贴会显示但从不计入：它金额小、需经收入审查，而且可能变动。",
    pensionFixed: "按固定金额发放的养老金，随着物价上涨每年能买到的越来越少，所以我们按这种方式估值。",
    pensionEntryClosed: "公共养老金计划只接受未超过入保年龄的新成员，所以不为您计入。",
    supportRatio: "在未来几十年里，每位老年人对应的劳动年龄人口会越来越少，所以您自己的储蓄更加重要。",
    lock: "这笔钱只留给晚年用。提前动用是计划落空最常见的原因。",
    startEarlier: "越早开始，每月金额就低得越多，因为钱有更长的时间增长。",
    noStatutoryGratuity: "我们没有您所在国家的离职金法律记录，所以只计算单位自己规定的天数。请查看您的合同或询问单位。",
    lowCaseInflation: "偏低情况假设退休期间您的钱只能跟上物价，没有额外的实际回报。",
  },

  option: {
    pensionerCertificate: "退休人员储蓄券：按月付息，仅限政府、半政府机构和军队的退休人员，有购买上限。",
    savingsCertificate: "政府储蓄券：由国家担保的固定收益。",
    tbonds: "国债：有政府担保，每六个月支付一次固定利息。",
    depositLadder: "存款阶梯：一笔接一笔到期的存款，所以每年都有一些钱可以动用。",
    annuity: "国有保险公司的终身年金：无论活多久都能终身领取。代价是：这笔钱不能传给后人。",
  },
};
