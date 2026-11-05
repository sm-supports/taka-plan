// Simplified Chinese (简体中文). Register: 您, plain and warm. Western digits only. Full-width punctuation.
//
// Glossary (English → 简体中文), used consistently across every zh file:
//   emergency fund            → 应急基金
//   take-home (pay)           → 到手收入（每月）
//   essentials / essential spending → 必要开支
//   dependents                → 依靠您收入的家人（受抚养人）
//   savings account           → 储蓄账户
//   fixed deposit / term deposit (FDR) → 定期存款（孟加拉国名称 FDR 保留）
//   recurring deposit (DPS)   → 零存整取（孟加拉国名称 DPS 保留）
//   government savings certificate (Sanchayapatra) → 政府储蓄券（Sanchayapatra 保留）
//   treasury bill             → 短期国库券
//   treasury bond / government bond → 国债
//   (open-end) equity fund    → （开放式）股票基金
//   shares / equity           → 股票 / 股票类资产
//   fixed income              → 固定收益
//   asset mix                 → 资产配置
//   rebalance                 → 再平衡
//   headline rate             → 名义利率
//   real return               → 实际回报率
//   after tax / after inflation → 税后 / 扣除通胀后
//   tax deducted at source    → 代扣税款
//   policy rate               → 政策利率
//   central bank              → 中央银行（Bangladesh Bank 保留）
//   EMI (instalment)          → 月供（EMI 仅在孟加拉国专用文本中保留）
//   principal                 → 本金
//   prepayment                → 提前还款
//   credit card balance carried → 信用卡未还清余额
//   grace period              → 免息期
//   term life insurance       → 定期寿险
//   health insurance / cover  → 医疗保险 / 保障
//   sum insured               → 保额
//   premium                   → 保费
//   surrender value           → 退保金
//   endowment policy          → 储蓄型（两全）保险
//   annuity                   → 终身年金
//   provident fund            → 公积金
//   gratuity                  → 离职金
//   old-age allowance         → 养老津贴
//   maturity                  → 到期
//   deposit ladder            → 存款阶梯
//   brokerage account         → 证券账户（BO account → BO 账户）
//   lump sum                  → 一次性金额
//   net worth                 → 净资产
//   inflation                 → 通胀
import type { Dictionary } from "../../types";

/** Shared strings: app chrome, buttons, status labels, instrument names, enum labels, disclaimer. */
export const common: Dictionary["common"] = {
  appName: "Taka Plan",
  tagline: "每个目标需要多少钱，每个月该把钱放在哪里。",
  loading: "加载中…",
  yes: "是",
  no: "否",
  optional: "选填",

  nav: {
    home: "首页",
    plan: "我的计划",
    calculators: "计算器",
    admin: "费率管理",
    language: "语言",
  },

  button: {
    next: "下一步",
    back: "返回",
    seePlan: "查看我的计划",
    whyThisNumber: "这个数字怎么来的？",
    why: "为什么？",
    close: "关闭",
    edit: "编辑",
    save: "保存",
    cancel: "取消",
    reset: "重新开始",
    tryAgain: "重试",
    learnMore: "了解更多",
    add: "添加",
    remove: "删除",
    done: "完成",
    skip: "跳过",
    openCalculator: "打开计算器",
  },

  status: {
    red: "需要立即处理",
    amber: "需要留意",
    green: "进展顺利",
  },
  alsoNeedsAttention: "同样需要留意",

  module: {
    m1: "应急基金",
    m2: "保险与健康",
    m3: "债务体检",
    m4: "先存后花预算",
    m5: "目标规划",
    m6: "资产配置",
    m7: "养老与家庭",
    plan: "您的计划",
  },

  instrument: {
    savings_account: "储蓄账户",
    fdr_3m: "3个月期定期存款",
    fdr_1y: "1年期定期存款",
    dps: "零存整取",
    sanchayapatra_5y: "政府储蓄券",
    tbill_91d: "91天期短期国库券",
    tbond_5y: "5年期国债",
    tbond_10y: "10年期国债",
    equity_fund: "开放式股票基金",
    gold: "黄金（22K 金条或金币）",
    loan_prepayment: "额外还款",
    term_insurance: "定期寿险",
  },

  /** Product names inside a sentence, when the country data has none (useProductName). */
  productProse: {
    savings_account: "储蓄账户",
    fdr_3m: "定期存款",
    fdr_1y: "定期存款",
    dps: "零存整取",
    sanchayapatra_5y: "政府储蓄券",
    tbill_91d: "短期国库券",
    tbond_5y: "国债",
    tbond_10y: "国债",
    equity_fund: "股票基金",
    gold: "黄金",
  },

  /** An instrument inside a sentence ("into {instrument}"); {product} is the country's product name. */
  instrumentInline: {
    savings_account: "{product}",
    fdr_3m: "3个月期{product}",
    fdr_1y: "1年期{product}",
    dps: "{product}",
    sanchayapatra_5y: "{product}",
    tbill_91d: "91天期{product}",
    tbond_5y: "5年期{product}",
    tbond_10y: "10年期{product}",
    equity_fund: "开放式股票基金",
    gold: "金条或金币",
    loan_prepayment: "额外还款",
    term_insurance: "定期寿险",
  },

  unit: {
    month: "个月",
    months: "个月",
    year: "年",
    years: "年",
    perMonth: "/月",
    perYear: "每年",
    taka: "৳",
    percent: "%",
  },

  offline: "您已离线，正在使用已保存的费率",
  ratesVersion: "费率 v{version}，{asOf}",
  mayBeOutdated: "可能已过时",
  ourAssumption: "我们的假设",
  ourSource: "Taka Plan（我们的假设）",
  source: "来源",
  asOf: "截至 {date}",
  range: "范围 {low}–{high}",
  afterTax: "税后",
  afterInflation: "扣除通胀后",
  headline: "名义利率",

  disclaimer: {
    short:
      "仅为教育用途的估算，不构成理财、税务或法律建议。利率会变动，行动前请向您的银行或保险公司确认。过去的回报不代表未来的回报。",
    title: "开始之前",
    body:
      "Taka Plan 提供的估算仅用于教育，不构成理财、税务或法律建议，也从不点名任何银行、基金或保险公司。利率和税务规定每年会变动好几次，所以在根据这里的任何数字行动前，请先向您的银行或保险公司确认。过去的回报不代表未来的回报。您的回答只保存在您的手机上。",
    accept: "我明白了",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "选择语言",
  },
  /** Header language menu button: {language} is the current language's own name. */
  languageMenu: "语言：{language}",
  changeCountry: "更换国家",
  /** Header country link: {country} is the country code shown in the header. */
  countryLink: "国家 {country}。更换国家",

  incomeType: {
    salaried: "工薪族",
    freelance: "自由职业者",
    business: "企业主",
  },

  dependent: {
    none: "没有人",
    partner: "配偶",
    children: "子女",
    parents: "父母",
  },

  goalType: {
    general: "一般",
    education: "教育",
    health: "健康",
    wedding: "婚礼",
    vehicle: "车辆",
    home: "住房或土地",
    travel: "旅行",
  },

  loanType: {
    personal: "个人贷款",
    home: "住房贷款",
    car: "汽车贷款",
    education: "助学贷款",
    other: "其他贷款",
  },

  horizon: {
    short: "3年以内",
    medium: "3到5年",
    long: "5年以上",
  },

  explain: {
    title: "这个数字怎么来的？",
    steps: "计算过程",
    assumptions: "所用利率",
    notes: "说明",
    stale: "这个利率已过复核日期",
  },

  /** "Start from the beginning" and the drafts it keeps (components/drafts). */
  drafts: {
    startOver: "从头开始",
    startOverHint: "您当前的回答会保存为草稿。",
    confirmTitle: "要从头开始吗？",
    confirmBody: "您当前的回答会保存为草稿，随时可以在“您的草稿”中重新打开。",
    confirm: "是的，重新开始",
    cancel: "取消",
    saved: "已保存为草稿",
    alreadySaved: "已经保存为草稿",
    deleted: "草稿已删除",
    title: "您的草稿",
    sectionTitle: "您的草稿（{count}）",
    intro: "这些是您重新开始时保留的回答。打开一份即可查看它的计划。",
    empty: "还没有草稿。当您从头开始时，当前的回答会保存在这里。",
    seeAll: "查看全部草稿",
    backToPlan: "返回我的计划",
    updated: "更新于 {date}",
    current: "当前打开",
    open: "打开",
    rename: "重命名",
    renameLabel: "草稿名称",
    renameHint: "最多 {max} 个字。留空则使用自动名称。",
    delete: "删除",
    deleteTitle: "删除这份草稿？",
    deleteBody: "它会从这部手机上移除，且无法恢复。",
    deleteConfirm: "是的，删除",
    /** Shown before saving would push the oldest unnamed draft out (lib/store/drafts.ts capDrafts). */
    capWarning: "您已有 {max} 份草稿，所以最早一份未命名的草稿“{label}”将被移除。给草稿起个名字就能保留它。",
    openTitle: "打开这份草稿？",
    openConfirm: "是的，打开",
    label: {
      age: "{age}岁",
      takeHome: "{amount}/月",
      goalsOne: "{count}个目标",
      goalsOther: "{count}个目标",
      m2: "保险",
      m6: "投资",
      m7: "养老",
    },
  },

  /** Banner under the header about the chosen country's data (components/layout/CountryNotice). */
  countryNotice: {
    noData: "我们还没有{country}的调研数据，所以金额暂用孟加拉国的数据和塔卡。",
    changeCountry: "更换国家",
    someFallback: "{country}的部分数据是地区估算值，并非该国自己的数据。",
    about: "数字从哪里来",
  },
};
