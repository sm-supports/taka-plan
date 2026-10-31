import type { Dictionary } from "../../types";

/** Country and language steps on "/" (imported there directly; see en/onboarding.ts). */
export const onboardingEntry: Pick<Dictionary["onboarding"], "country" | "language" | "switchCountry"> = {
  country: {
    title: "您住在哪里？",
    subtitle: "我们会使用您所在国家的货币、利率和储蓄产品。",
    searchLabel: "搜索您的国家",
    searchPlaceholder: "国家名称，英文或您的语言均可",
    suggested: "推荐",
    all: "所有国家",
    results: "匹配的国家",
    noMatch: "没有与“{query}”匹配的国家。",
    currency: "货币：{code}",
    current: "当前选择",
    changeLater: "您随时可以更改国家和语言。",
    intro: "五个简单问题，然后就是您的每月储蓄计划。无需注册账户。",
    disclaimer: "仅为教育用途的估算，不构成理财、税务或法律建议。",
    region: {
      south_asia: "南亚",
      east_asia_pacific: "东亚与太平洋",
      europe_central_asia: "欧洲与中亚",
      latin_america_caribbean: "拉丁美洲与加勒比",
      middle_east_north_africa: "中东与北非",
      north_america: "北美",
      sub_saharan_africa: "撒哈拉以南非洲",
    },
  },
  language: {
    title: "您想使用哪种语言？",
    subtitle: "您随时可以通过顶部菜单切换。",
    country: "国家：{country}",
    notAvailable: "暂不支持您的语言，将使用英文。",
    changeCountry: "更换国家",
  },
  /** "/" when the user picks another country while answers exist: the amounts are in the old currency. */
  switchCountry: {
    title: "为{country}重新开始？",
    body: "您的回答以{currency}计。为{country}重新开始时，当前的回答会保存为草稿，随时可以重新打开。",
    capWarning: "您已有 {max} 份草稿，所以最早一份未命名的草稿将被移除。",
    confirm: "重新开始",
    cancel: "保留我的回答",
    saved: "已保存为草稿",
  },
};

/** Five quick questions, one per screen. */
export const onboarding: Dictionary["onboarding"] = {
  country: onboardingEntry.country,
  language: onboardingEntry.language,
  switchCountry: onboardingEntry.switchCountry,

  languagePick: {
    title: "您想使用哪种语言？",
    subtitle: "您随时可以切换。",
  },

  progress: "第 {n} 题，共 5 题",
  intro: "五个简单问题，然后就是您的计划。无需注册账户。",

  step: {
    1: {
      title: "您今年多大？",
      hint: "年龄决定了您的目标和养老金还有多少年可以增长。",
      placeholder: "您的年龄（岁）",
      label: "您的年龄",
      decadeLabel: "先点一个快捷选项，再在下面填写准确年龄",
      decade: {
        under20: "20岁以下",
        twenties: "20多岁",
        thirties: "30多岁",
        forties: "40多岁",
        fifties: "50多岁",
        sixtyPlus: "60岁及以上",
      },
      unit: "岁",
    },
    2: {
      title: "您每月到手收入是多少？",
      hint: "扣除税款和公积金后，实际到账的金额。",
      hintFreelance: "收入不固定？把最近六个月加起来再除以六。",
      placeholder: "以您的货币计的到手收入",
      label: "每月到手收入",
      incomeTypeLabel: "您靠什么挣钱？",
      incomeTypeHint: {
        salaried: "每月固定工资",
        freelance: "金额不固定的项目或客户付款",
        business: "从自己的生意中提取的利润",
      },
      average: {
        toggle: "按最近六个月计算",
        title: "最近六个月的收入",
        hint: "填写每个月收到的金额。哪个月没有收入就留空。",
        month: "第 {n} 个月",
        result: "六个月平均：{amount}",
        use: "用 {amount} 作为我的到手收入",
        close: "收起",
      },
    },
    3: {
      title: "您每月的必要开支是多少？",
      hint: "房租、伙食、水电煤、交通、学费、给父母的赡养费，以及正在还的月供。不含外出就餐、购物和度假。",
      placeholder: "以您的货币计的必要开支",
      label: "每月必要开支",
      countsTitle: "哪些算必要开支",
      counts: {
        rent: "房租或房贷月供",
        food: "伙食和日用品",
        utilities: "电、燃气、水、电话和网络",
        transport: "交通",
        school: "学费和补习费",
        parents: "给父母的赡养费",
        emi: "正在还的贷款或信用卡月供",
      },
      leaveOut: "不含外出就餐、购物、电子产品和度假。",
      takeHomeReminder: "您的到手收入：{amount}",
      leftOver: "扣除必要开支后剩余：{amount}",
    },
    4: {
      title: "谁依靠您的收入生活？",
      hint: "选出所有符合的人。家人的情况会影响您的应急储备和保险需求。",
      none: "没有人依靠我",
      label: "受抚养人",
      option: {
        partner: "配偶",
        children: "子女",
        parents: "父母",
      },
      optionHint: {
        partner: "依靠您收入的配偶",
        children: "您抚养的任何子女",
        parents: "您赡养的父母或公婆、岳父母",
      },
    },
    5: {
      title: "您有贷款或未还清的信用卡欠款吗？",
      hint: "包括银行贷款、车贷或房贷，以及每月没有全额还清的信用卡账单。",
      yes: "有，我有债务",
      no: "没有债务",
      label: "贷款或信用卡欠款",
      yesNote: "知道了。您的计划会包含债务体检，让成本最高的债务先还。",
      noNote: "很好。您的计划可以直接从储蓄开始。",
      readyTitle: "就这些",
      ready: "您的计划就是根据这五个回答制定的。以后任何一项都可以修改。",
    },
  },

  summary: {
    age: "{age}岁",
    takeHome: "到手收入 {amount}",
    essentials: "必要开支 {amount}",
    /** {list}: the people who depend on the user, already joined ("Partner, Children"). */
    dependents: "依靠您的人：{list}",
    noDependents: "没有人依靠您",
    debt: "有贷款或信用卡欠款",
    noDebt: "没有债务",
  },

  cta: {
    start: "开始",
    seePlan: "查看我的计划",
    next: "下一步",
    back: "返回",
  },

  validation: {
    required: "请输入一个数字以继续。",
    number: "请只输入数字，例如 {example}。",
    ageRange: "请输入 {min} 到 {max} 之间的年龄。",
    positiveAmount: "请输入大于零的金额。",
    essentialsAboveIncome: "必要开支高于您的到手收入。请再核对一下这两个数字——计划仍然可以生成，但储蓄金额会非常小。",
    pickOne: "请至少选择一项，或选择“没有人”。",
  },
};
