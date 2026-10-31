import type { Dictionary } from "../../types";

/**
 * /{locale}/about: title, lead, methodology and the sources-table chrome. Every number that
 * comes from the rates table is a `{placeholder}` filled at render time.
 */
export const about: Dictionary["about"] = {
  title: "关于 Taka Plan",
  lead: "一个免费的计算器，告诉有收入的孟加拉国人每个目标需要多少钱，以及每个月该把钱放在哪里。它负责讲解和计算；具体操作由您通过自己的银行、BO 账户或保险公司完成。",
  disclaimer: { heading: "免责声明" },
  method: {
    heading: "计划是怎么做出来的",
    intro: "计划按固定顺序分七步：先保障，再储蓄，后增值。每一步都是一个小计算器，合起来得出一个每月金额。",
    phase: { protect: "保障", save: "储蓄", grow: "增值" },
    order:
      "您的每月金额按优先顺序分配：先是应急基金，然后是保险保费，再是高成本债务，最后才是目标和养老。在应急基金存满之前，每月金额中至少有{share}投入其中，其余部分让您今天就开始养成投资习惯。",
    returnsHeading: "税后与扣除通胀后的回报",
    returns:
      "每项回报都会扣减两次后再显示：先扣除代扣税款，再扣除通胀。关键不在名义利率，而在于您实际留下多少、这些钱将来还能买到多少。一项产品可能付利息却仍然跑输通胀，出现这种情况时，应用会用红色标出。",
    exampleCaption: "按今天的费率表：",
    rounding: "结果会取整到附近的整数，因为二十年的预测不可能精确到每一塔卡。未来回报不确定时，会显示一个范围（偏低、预期、偏高）。",
    onDevice: "所有计算都在您的手机上进行。服务器只保存费率表，以及您选择登录后保存的计划。",
  },
  sources: {
    heading: "来源与假设",
    intro: "下面每一行都是计算器读取的一项假设。费率版本 {version}，发布于 {date}。标有“我们的假设”的行是我们选定的默认值，可能会调整；其余都摘自旁边链接的公开来源。",
    group: {
      macro: "通胀与政策利率",
      bank: "银行存款",
      sanchayapatra: "Sanchayapatra",
      govt: "政府债券",
      market: "股票与黄金",
      risk: "信贷、保险与寿命",
      tax: "税务规定（FY2026-27）",
      policy: "应用默认设置",
      other: "其他",
    },
    value: "数值",
    dates: "日期",
    nextReview: "下次复核",
    note: "备注",
    slabNext: "接下来的 {width} 按 {rate}",
    slabRest: "其余部分按 {rate}",
    unverifiedHeading: "尚未核实",
    unverifiedIntro: "以下内容我们还无法确认，因此暂时没有计算器依赖它们：",
    unverified: [
      "保额100万塔卡（ten lakh）和1000万塔卡（one crore）的定期寿险当前保费。",
      "2026年 Sanchayapatra 的投资上限。",
      "针对小额 Sanchayapatra 投资者的减税是否在《财政法案》中得以保留。",
      "Bangladesh Bank 的月供收入比上限（似乎并不存在；我们使用自己的阈值）。",
      "全市场的个人贷款和住房贷款利率。",
    ],
  },
};
