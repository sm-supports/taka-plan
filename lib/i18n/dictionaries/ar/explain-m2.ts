import type { Dictionary } from "../../types";

export const explainM2: Dictionary["explain"]["m2"] = {
  years: {
    title: "سنوات التغطية",
    body: "يمتد التأمين على الحياة من عمرك اليوم، {ageYears}، حتى سن {coverToAgeYears}، حين لا تعود العائلة عادةً معتمدة على دخلك، أو حتى يبلغ أصغر أبنائك {childIndependentAgeYears} إن ذكرت عمره وجاء ذلك أولًا: {result} سنة. لا ينزل أبدًا عن الصفر.",
  },
  incomeNeed: {
    title: "الدخل المطلوب تعويضه",
    body: "ستحتاج العائلة {incomeShare} من صافي دخلك البالغ {takeHome} شهريًا: {yearlyNeed} سنويًا. تنمو هذه الحاجة مع الأسعار بمعدل {inflation} سنويًا لمدة {coveredYears} سنة. المال المخصص اليوم في مدخرات آمنة قد يكسب {afterTax} بعد الضريبة، أي {realRate} سنويًا فوق ارتفاع الأسعار، لذا فالمبلغ المقطوع اليوم الذي يغطي حاجة كل سنة، بدءًا من الآن، هو {result}.",
  },
  lifeCover: {
    title: "التأمين على الحياة المطلوب",
    body: "الدخل المطلوب تعويضه {incomeNeed}، مضافًا إليه الديون {debts} وأهداف التعليم {educationGoals}، ناقص المدخرات التي تصل إليها العائلة {liquidSavings} والاستثمارات {investments}: {result}. لا ينزل أبدًا عن الصفر.",
  },
  lifeGap: {
    title: "التأمين على الحياة المتبقي للشراء",
    body: "التغطية المطلوبة ناقص التغطية التي لديك بالفعل: {cover} − {existingLifeCover} = {result}.",
  },
  perStay: {
    title: "التأمين الصحي لكل بالغ",
    body: "تكلّف الإقامة المعتادة في المستشفى نحو {hospitalCost}. تدفع العائلات {oopShare} من التكاليف الصحية بنفسها؛ ونستخدم {publicFloorShare} على الأقل، لذا نأخذ {appliedShare}: {result} تغطية لكل بالغ.",
  },
  healthTarget: {
    title: "التأمين الصحي للعائلة",
    body: "التغطية لكل بالغ {perStay} مضروبة في وزن الأشخاص المشمولين وعددهم {peopleCount}، أي {weightCount} إجمالًا (يُحسب الطفل أقل من البالغ، والوالد أكثر): {result}.",
  },
  healthGap: {
    title: "التأمين الصحي المتبقي للشراء",
    body: "هدف العائلة ناقص التأمين الصحي الذي لديك بالفعل: {target} − {existingHealthCover} = {result}.",
  },
  lifePremium: {
    title: "القسط السنوي لتأمين الحياة المؤقت",
    body: "يكلّف تأمين الحياة المؤقت نحو {bandLow} إلى {bandHigh} سنويًا لكل {per} من التغطية في عمرك، مضروبًا في {smokerMultipleCount} للتدخين. لتغطية بقيمة {gap} يصبح {premiumLow} إلى {premiumHigh} سنويًا؛ والوسط {result}.",
  },
  healthPremium: {
    title: "القسط الصحي السنوي",
    body: "يُسعَّر التأمين الصحي لكل {per} من التغطية، حسب عمر كل شخص. لتغطية إضافية بقيمة {gap} لـ {peopleCount} أشخاص يصبح {premiumLow} إلى {premiumHigh} سنويًا؛ والوسط {result}.",
  },
  monthlyNeed: {
    title: "ما تخصّصه كل شهر",
    body: "وسط النطاقين السنويين، تأمين الحياة المؤقت {lifePremium} مضافًا إليه التأمين الصحي {healthPremium}، موزّعًا على {months} شهرًا: {result} شهريًا.",
  },
  policyTerm: {
    title: "تأمين مؤقت بالمبلغ نفسه",
    body: "يكلّف تأمين الحياة المؤقت لتغطية الوثيقة {sumAssured} نحو {bandLow} إلى {bandHigh} سنويًا لكل {per} في عمرك، مضروبًا في {smokerMultipleCount} للتدخين. الوسط {result} سنويًا.",
  },
  policyInvest: {
    title: "ادخار الفرق",
    body: "إن توقفت الآن، فما تعيده شركة التأمين، {surrenderValue}، ينمو إلى {surrenderValueFV} في وديعة آمنة تكسب {afterTax} بعد الضريبة. قسطك {annualPremium} ناقص قسط التأمين المؤقت {termPremium} يترك {yearlyDifference} سنويًا؛ وبوضعه في الوديعة نفسها في بداية كل سنة من السنوات المتبقية {remainingYears}، يصل المجموع إلى {result}.",
  },
  policyIrr: {
    title: "العائد السنوي للوثيقة",
    body: "الاحتفاظ بالوثيقة يعني التخلي عن {surrenderValue} اليوم ودفع {annualPremium} سنويًا للسنوات المتبقية {remainingYears} من أصل {termYears}، للحصول على {expectedMaturity} في النهاية: كأنك تكسب {result} سنويًا على ذلك المال. أما التوقف وادخار الفرق فسيبلغ {investValue}، بفارق {difference}.",
  },
};
