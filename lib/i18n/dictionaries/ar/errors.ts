import type { Dictionary } from "../../types";

export const errors: Dictionary["errors"] = {
  generic: "حدث خطأ ما. حاول مجددًا.",
  offline: "أنت غير متصل. نستخدم الأسعار المحفوظة؛ أعد الاتصال للحصول على أحدثها.",
  engineNotReady: "هذه الحاسبة لا تزال قيد الإعداد.",
  invalidInput: "بعض هذه الأرقام غير متّسقة. راجعها وحاول مجددًا.",
  missingRate: "ينقص سعرٌ تحتاجه هذه الحاسبة. حاول مجددًا لاحقًا.",
  notFound: "لم نعثر على تلك الصفحة.",
  unauthorized: "عليك تسجيل الدخول لرؤية هذه الصفحة.",
  ratesUnavailable: "تعذّر تحميل جدول الأسعار. تحقّق من اتصالك وحاول مجددًا.",
};
