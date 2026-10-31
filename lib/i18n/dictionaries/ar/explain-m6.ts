import type { Dictionary } from "../../types";

export const explainM6: Dictionary["explain"]["m6"] = {
  score: {
    title: "درجة المخاطر",
    body: "كل إجابة من الإجابات الأربع تحصل على 0 إلى 2: الفئة العمرية {ageBandCount}، والدخل {incomeCount}، وموعد حاجتك إلى المال {horizonCount}، وما ستفعله بعد هبوط 20% {reactionCount}. المجموع: {result} من 8. من 0 إلى 3 حذر، ومن 4 إلى 5 متوازن، ومن 6 إلى 8 نمو.",
  },
  equity: {
    title: "حصة الأسهم",
    body: "يبدأ ملفك بحصة أسهم {startShare} حتى سن 30، ثم تقل نقطة واحدة عن كل سنة بعدها، لكن لا تنزل أبدًا عن {floorShare}: في سن {ageYears} يعطي ذلك {ageEquityShare}، ولا تتجاوز أبدًا الحد الأقصى {capShare}. المال المطلوب خلال {noEquityYears} سنوات لا يحتوي على أسهم، وخلال {cashOnlyYears} سنة ودائع أو أذون فقط؛ ومالك مطلوب بعد {horizonYears} سنوات. الأسهم: {result}.",
  },
  gold: {
    title: "حصة الذهب",
    body: "الذهب وسيلة تحوّط لا رهان: اختيارك {chosenShare}، ضمن {minShare} إلى {maxShare}. الذهب: {result}.",
  },
  fixedIncome: {
    title: "حصة الدخل الثابت",
    body: "كل ما ليس أسهمًا أو ذهبًا: 100% − {equityShare} − {goldShare} = {result}.",
  },
  mixLow: {
    title: "عائد التوزيع، الحالة المنخفضة",
    body: "العائد السنوي لكل جزء في الحالة المنخفضة مرجّحًا بحصته: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} سنويًا.",
  },
  mixBase: {
    title: "عائد التوزيع، الحالة الأساسية",
    body: "العائد السنوي لكل جزء في الحالة الأساسية مرجّحًا بحصته: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} سنويًا. العائد الأساسي للأسهم مضبوط عمدًا بما لا يزيد على الأدوات الآمنة.",
  },
  mixHigh: {
    title: "عائد التوزيع، الحالة المرتفعة",
    body: "العائد السنوي لكل جزء في الحالة المرتفعة مرجّحًا بحصته: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} سنويًا.",
  },
  fv: {
    title: "إلى كم قد ينمو (الحالة الأساسية)",
    body: "{monthly} شهريًا و{lumpSum} اليوم، تنمو بمعدل {mixRate} سنويًا ({monthlyRate} شهريًا) لمدة {years} سنوات. تدفع {paidIn}؛ وفي النهاية قد يكون لديك {result}. تستخدم الحالتان المنخفضة والمرتفعة عائد التوزيع الخاص بكل منهما.",
  },
  real: {
    title: "بأسعار اليوم",
    body: "الأسعار ترتفع أيضًا. {fv} مقسومًا على (1 + {inflation})^{years} = {result} بما يشتريه المال اليوم.",
  },
  trade: {
    title: "عمليات إعادة التوازن",
    body: "تملك {holdingsTotal} وتضيف {newMoney}، فيصبح الإجمالي الجديد {result}. المستهدف لكل جزء هو حصته من هذا الإجمالي ({equityShare}، {goldShare}، {fixedIncomeShare}) ناقص ما يملكه الآن: الأسهم {equityTrade}، الذهب {goldTrade}، الدخل الثابت {fixedIncomeTrade} (الموجب = شراء، السالب = بيع). يذهب المال الجديد أولًا إلى الأجزاء المتأخرة، والجزء الذي يبتعد أكثر من {driftBandShare} عن المستهدف إشارة لإعادة التوازن.",
  },
};
