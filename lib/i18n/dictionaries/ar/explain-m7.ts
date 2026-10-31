import type { Dictionary } from "../../types";

export const explainM7: Dictionary["explain"]["m7"] = {
  spendingAtRetirement: {
    title: "الإنفاق في سنتك الأولى من التقاعد",
    body: "إنفاق اليوم البالغ {monthlySpending} شهريًا، مضروبًا في 12، بعد نموّه مع الأسعار بمعدل {inflation} سنويًا خلال {retireInYears} سنوات حتى توقفك: 12 × {monthlySpending} × (1 + {inflation})^{retireInYears}. يُخصم أولًا الإيجار الذي تتلقاه، لأنه يرتفع أيضًا مع الأسعار. النتيجة: {result} سنويًا.",
  },
  corpusContrast: {
    title: "الهدف حتى سن المقارنة",
    body: "المبلغ الذي يدفع {spendingAtRetirement} في السنة الأولى، مرتفعًا مع الأسعار ({inflation})، لمدة {retiredForYears} سنة بينما يكسب الباقي {returnRate} بعد الضريبة: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. يُعرض للمقارنة فقط.",
  },
  corpusPlan: {
    title: "الهدف ليكفي حتى سن خطتك",
    body: "المعادلة نفسها على مدى {retiredForYears} سنة: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. وهو بالضبط المبلغ الذي ينفقه الرسم البياني سنة بسنة حتى الصفر عند تلك السن.",
  },
  savingsFv: {
    title: "مدخراتك عند التوقف",
    body: "ما لديك اليوم، {savings}، مستثمرًا بمعدل {accumulationRate} سنويًا لمدة {retireInYears} سنوات: {savings} × (1 + {accumulationRate})^{retireInYears} = {result}.",
  },
  providentFund: {
    title: "صندوق الادخار الوظيفي عند التوقف",
    body: "رصيد اليوم البالغ {balance} مضافًا إليه {monthlyContribution} تُدفع كل شهر، وكلاهما ينمو بسعر الصندوق نفسه {fundRate} لمدة {retireInYears} سنوات = {result}.",
  },
  gratuity: {
    title: "مكافأة نهاية الخدمة",
    body: "آخر راتب أساسي {basicMonthly} ÷ {daysPerMonthCount} يومًا × {daysCount} يومًا عن كل سنة من {serviceYears} سنوات الخدمة = {result}، تُدفع مبلغًا مقطوعًا عند ترك العمل.",
  },
  fixedPensions: {
    title: "المعاشات الثابتة، مقيّمة عند التوقف",
    body: "معاش عام بقيمة {publicPensionMonthly} شهريًا من سن {pensionFromAgeYears} ودخل ثابت آخر بقيمة {fixedPensionMonthly} شهريًا، يُدفعان حتى سن خطتك ({retiredForYears} سنة من التقاعد) دون أن يرتفعا مع الأسعار، تساوي قيمتهما عند توقفك، بمعدل {returnRate}: {result}. ولهذا تتقلص قوتهما الشرائية خلال تقاعد طويل.",
  },
  gap: {
    title: "المتبقي للتكوين",
    body: "الهدف {corpus}، ناقص كل ما سيكون موجودًا بالفعل (مدخراتك وصندوق الادخار الوظيفي ومكافأة نهاية الخدمة وقيمة المعاشات الثابتة)، دون أن ينزل عن الصفر: {result}.",
  },
  monthly: {
    title: "الادخار الشهري",
    body: "المبلغ الذي إذا دُفع كل شهر لمدة {savingMonths} شهرًا ونما بمعدل {monthlyRate} شهريًا، بلغ {gap}: {gap} × {monthlyRate} ÷ ((1 + {monthlyRate})^{savingMonths} − 1) = {result}، مقرّبًا إلى الأعلى ليكون كافيًا.",
  },
  withdrawal: {
    title: "سحب السنة الأولى",
    body: "ما يمكن أن يدفعه مبلغ {savings} في السنة الأولى، مرتفعًا مع الأسعار ({inflation}) كل سنة بعدها، ليكفي {retiredForYears} سنة مع عائد {returnRate}: {savings} × ({returnRate} − {inflation}) ÷ (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) = {result}، مقرّبًا إلى الأدنى حتى لا ينقص أبدًا.",
  },
  safePot: {
    title: "الوعاء الآمن",
    body: "سحب السنة الأولى {firstYear} مضروبًا في {potYears} سنوات = {result}، يُحتفظ به في مكان آمن وسريع الوصول.",
  },
};
