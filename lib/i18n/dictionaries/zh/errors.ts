import type { Dictionary } from "../../types";

export const errors: Dictionary["errors"] = {
  generic: "出了点问题，请重试。",
  offline: "您已离线，正在使用已保存的费率；重新联网即可获取最新费率。",
  engineNotReady: "这个计算器还在准备中。",
  invalidInput: "这些数字有些对不上，请检查后重试。",
  missingRate: "这个计算器需要的某个利率缺失，请稍后再试。",
  notFound: "找不到这个页面。",
  unauthorized: "您需要登录才能查看此页面。",
  ratesUnavailable: "无法加载费率表，请检查网络连接后重试。",
};
