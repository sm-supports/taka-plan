// Input names per step are documented in ../en/explain.ts; the placeholders here must match.
import type { Dictionary } from "../../types";
import { explainM2 } from "./explain-m2";
import { explainM6 } from "./explain-m6";
import { explainM7 } from "./explain-m7";

export const explain: Dictionary["explain"] = {
  m2: explainM2,
  m6: explainM6,
  m7: explainM7,
  m1: {
    months: {
      title: "أشهر التغطية",
      body: "نبدأ من {base} أشهر. الدخل غير المنتظم يضيف {bumpIrregular}، وكونك المعيل الوحيد مع وجود مُعالين يضيف {bumpSoleEarner}، وعدم وجود تأمين صحي يضيف {bumpNoHealth}. يبقى الاقتراح بين {min} و{max} أشهر: {result}. والمؤشر بيدك لتحرّكه.",
    },
    target: {
      title: "هدف صندوق الطوارئ",
      body: "نفقاتك الأساسية الشهرية مضروبة في أشهر التغطية: {essentials} × {months} = {result}. تُحسب الأساسيات فقط، لأن كل ما عداها يتوقف في حالة الطوارئ.",
    },
    gap: {
      title: "المتبقي للادخار",
      body: "الهدف ناقص ما يمكنك الوصول إليه اليوم: {target} − {saved} = {result}. لا ينزل أبدًا عن الصفر؛ والاحتياطي الأكبر من المخطط لا بأس به.",
    },
    monthly: {
      title: "الادخار الشهري",
      body: "الفجوة موزّعة على الأشهر التي اخترتها لتكوينه: {gap} ÷ {buildMonths} = {result} شهريًا.",
    },
    covered: {
      title: "الأشهر المغطاة",
      body: "عدد أشهر الأساسيات التي تكفيها مدخراتك الحالية: {saved} ÷ {essentials} = {result}.",
    },
    tier1: {
      title: "المستوى 1: حساب توفير للسحب في اليوم نفسه",
      body: "تبقى نفقات شهر واحد من الأساسيات في حساب توفير يمكنك السحب منه اليوم: {essentials} = {result}. هذا مال الأسبوع الأول من أي طارئ.",
    },
    tier2: {
      title: "المستوى 2: سلّم FDR لمدة 3 أشهر",
      body: "كل ما يزيد على المستوى 1 يذهب إلى FDR: {target} − {tier1} = {result}، مقسّمًا على ثلاث FDR تُفتح بفارق شهر لتستحق واحدة كل شهر.",
    },
    banks: {
      title: "عدد البنوك اللازمة",
      body: "يغطي تأمين الودائع {limit} لكل بنك، والصندوق كله في ودائع مصرفية، لذا يُقسَّم الهدف: {target} ÷ {limit}، مقرّبًا إلى الأعلى، = {result} بنك.",
    },
  },

  m3: {
    totalEmi: {
      title: "إجمالي الأقساط الشهرية",
      body: "كل أقساط القروض مضافًا إليها الحد الأدنى لأي رصيد بطاقة مُرحَّل: {emis} + {cardMinimums} = {result}.",
    },
    emiRatio: {
      title: "الأقساط كنسبة من صافي الدخل",
      body: "إجمالي الأقساط مقسومًا على صافي الدخل: {totalEmi} ÷ {takeHome} = {result}. تضع الجهات المُقرضة حدودها الخاصة؛ وننبّه إلى النسبة المرتفعة لأنه لا يتبقى إلا القليل للادخار.",
    },
    capacity: {
      title: "القدرة على الأقساط",
      body: "ما يتبقى لسداد القروض بعد أن تدّخر أولًا وتدفع الأساسيات وتحتفظ باحتياطي نقدي: {takeHome} − {savings} − {essentials} − {buffer} = {result}.",
    },
    maxLoan: {
      title: "أقصى قرض يمكنك تحمّله",
      body: "معادلة القسط المعتادة معكوسة. بسعر شهري {monthlyRate} على مدى {months} شهرًا: {capacity} × (1 − (1 + {monthlyRate})^−{months}) ÷ {monthlyRate} = {result}. أضف هامش أمان خاصًا بك قبل أن تقترض.",
    },
    scenarioEmi: {
      title: "القسط الشهري لهذا القرض",
      body: "معادلة القسط المعتادة. لمبلغ {principal} بسعر شهري {monthlyRate} على مدى {months} شهرًا: {principal} × {monthlyRate} ÷ (1 − (1 + {monthlyRate})^−{months}) = {result}.",
    },
    interestSaved: {
      title: "الفائدة الموفَّرة",
      body: "سداد الدين الأعلى فائدة أولًا يكلّف {avalancheInterest} من إجمالي الفائدة؛ والأصغر رصيدًا أولًا يكلّف {snowballInterest}. الفرق، {result}، هو ما توفّره بالبدء بالأعلى فائدة.",
    },
  },

  m4: {
    average: {
      title: "متوسط الدخل الشهري",
      body: "يُحسب متوسط الدخل على آخر {months} شهر: {total} ÷ {months} = {result}. للراتب الثابت هذا ببساطة صافي دخلك؛ وعلى العاملين المستقلين وأصحاب الأعمال إدخال آخر ستة أشهر لتتوازن التقلبات.",
    },
    feasible: {
      title: "أقصى ما يمكنك ادخاره",
      body: "ما يتبقى بعد الأساسيات، كنسبة من الدخل: ({average} − {essentials}) ÷ {average} = {result}. لا تتجاوز النسبة المقترحة هذا الحد أبدًا.",
    },
    amount: {
      title: "الادخار الشهري",
      body: "الدخل مضروبًا في نسبة ادخارك: {average} × {rate} = {result}. يُنقل هذا إلى الادخار يوم الراتب، قبل إنفاق أي شيء.",
    },
    expenses: {
      title: "المتبقي للإنفاق",
      body: "الدخل ناقص الادخار هو ما تعيش منه: {average} − {savings} = {result}. هذه هي الفكرة كلها: ادّخر أولًا، وأنفق الباقي.",
    },
  },

  m5: {
    fv: {
      title: "الكلفة المستقبلية للهدف",
      body: "كلفة اليوم بعد نموّها بالتضخم كل سنة حتى موعد الهدف: {cost} × (1 + {inflation})^{years} = {result}. هذا هو الرقم الذي عليك بلوغه فعلًا.",
    },
    rate: {
      title: "العائد بعد الضريبة",
      body: "عائد {instrument} هو {nominal} سنويًا قبل الضريبة. بعد خصم ضريبة {tax} من المنبع، يبقى لك {result} سنويًا.",
    },
    monthly: {
      title: "الادخار الشهري اللازم",
      body: "المبلغ الذي ينمو إلى الكلفة المستقبلية بسعر شهري {monthlyRate} على مدى {months} شهرًا: {fv} × {monthlyRate} ÷ ((1 + {monthlyRate})^{months} − 1) = {result}.",
    },
    real: {
      title: "العائد الحقيقي",
      body: "ما يكسبه مالك من قوة شرائية كل سنة: (1 + {afterTax}) ÷ (1 + {inflation}) − 1 = {result}. القيمة دون الصفر تعني أن الأداة تخسر أمام التضخم رغم أنها تدفع فائدة.",
    },
  },

  plan: {
    total: {
      title: "مبلغك الشهري",
      body: "مبلغ الادخار أولًا من ميزانيتك: {savings} = {result}. كل وعاء أدناه يُقتطع من هذا الرقم الواحد.",
    },
    emergencyShare: {
      title: "حصة صندوق الطوارئ",
      body: "حتى يكتمل الصندوق، يأخذ صندوق الطوارئ ما تطلبه حاسبته، {m1Monthly} شهريًا، لكن ضمن {minShare} إلى {maxShare} من مبلغك الشهري ({total}) لتحصل الأوعية الأخرى على شيء. ولا يأخذ أبدًا أكثر من {gap} المتبقية للادخار: {result}.",
    },
    debtShare: {
      title: "حصة الديون مرتفعة الفائدة",
      body: "ما يتبقى بعد صندوق الطوارئ يذهب إلى أي دين فوق خط الفائدة المرتفعة، حتى حاجة السداد (كل الأرصدة مرتفعة الفائدة ÷ الأشهر المستهدفة): min({remaining}, {headroom}) = {result}.",
    },
    goalsShare: {
      title: "حصة الأهداف",
      body: "كل ما يتبقى يموّل أهدافك: min({remaining}, {goalsNeed}) = {result}. إن كان أقل مما تحتاجه الأهداف، تُظهر الخطة العجز.",
    },
    goalAllocation: {
      title: "حصة هذا الهدف",
      body: "يحتاج هذا الهدف {need} شهريًا، وتحتاج أهدافك كلها معًا {goalsNeed}. يُقسَّم المتبقي {remaining} بعد الأوعية أعلاه بهذه النسبة: {remaining} × {need} ÷ {goalsNeed} = {result}.",
    },
  },
};
