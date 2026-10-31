import type { Dictionary } from "../../types";

/** Country and language steps on "/" (imported there directly; see en/onboarding.ts). */
export const onboardingEntry: Pick<Dictionary["onboarding"], "country" | "language" | "switchCountry"> = {
  country: {
    title: "أين تعيش؟",
    subtitle: "نستخدم عملة بلدك وأسعاره ومنتجات الادخار فيه.",
    searchLabel: "ابحث عن بلدك",
    searchPlaceholder: "اسم البلد بالإنجليزية أو بلغتك",
    suggested: "مقترحة",
    all: "كل البلدان",
    results: "البلدان المطابقة",
    noMatch: "لا يوجد بلد يطابق «{query}».",
    currency: "العملة: {code}",
    current: "الاختيار الحالي",
    changeLater: "يمكنك تغيير بلدك ولغتك في أي وقت.",
    intro: "خمسة أسئلة سريعة، ثم خطة ادخارك الشهرية. لا حاجة إلى حساب.",
    disclaimer: "تقديرات للتعلّم فقط، وليست نصيحة مالية أو ضريبية أو قانونية.",
    region: {
      south_asia: "جنوب آسيا",
      east_asia_pacific: "شرق آسيا والمحيط الهادئ",
      europe_central_asia: "أوروبا وآسيا الوسطى",
      latin_america_caribbean: "أمريكا اللاتينية والكاريبي",
      middle_east_north_africa: "الشرق الأوسط وشمال أفريقيا",
      north_america: "أمريكا الشمالية",
      sub_saharan_africa: "أفريقيا جنوب الصحراء",
    },
  },
  language: {
    title: "أي لغة تفضّل؟",
    subtitle: "يمكنك التبديل في أي وقت من القائمة في الأعلى.",
    country: "البلد: {country}",
    notAvailable: "لغتك غير متاحة بعد؛ نستخدم الإنجليزية.",
    changeCountry: "تغيير البلد",
  },
  /** "/" when the user picks another country while answers exist: the amounts are in the old currency. */
  switchCountry: {
    title: "البدء من جديد لـ {country}؟",
    body: "إجاباتك بعملة {currency}. البدء من جديد لـ {country} يحفظ إجاباتك الحالية كمسودة، لتتمكن من فتحها مجددًا في أي وقت.",
    capWarning: "لديك بالفعل {max} مسودات، لذا ستُحذف أقدم مسودة بلا اسم.",
    confirm: "ابدأ من جديد",
    cancel: "احتفظ بإجاباتي",
    saved: "حُفظت كمسودة",
  },
};

/** Five quick questions, one per screen. */
export const onboarding: Dictionary["onboarding"] = {
  country: onboardingEntry.country,
  language: onboardingEntry.language,
  switchCountry: onboardingEntry.switchCountry,

  languagePick: {
    title: "أي لغة تفضّل؟",
    subtitle: "يمكنك التبديل في أي وقت.",
  },

  progress: "السؤال {n} من 5",
  intro: "خمسة أسئلة سريعة، ثم خطتك. لا حاجة إلى حساب.",

  step: {
    1: {
      title: "كم عمرك؟",
      hint: "يحدد عمرك المدة المتاحة لنمو أهدافك وتقاعدك.",
      placeholder: "عمرك بالسنوات",
      label: "عمرك",
      decadeLabel: "اختر اختصارًا، ثم صحّح العمر الدقيق بالأسفل",
      decade: {
        under20: "أقل من 20",
        twenties: "العشرينات",
        thirties: "الثلاثينات",
        forties: "الأربعينات",
        fifties: "الخمسينات",
        sixtyPlus: "60 فأكثر",
      },
      unit: "سنة",
    },
    2: {
      title: "ما صافي دخلك الشهري؟",
      hint: "المبلغ الذي يصل فعلًا إلى حسابك بعد الضريبة وصندوق الادخار الوظيفي.",
      hintFreelance: "دخل غير منتظم؟ اجمع آخر ستة أشهر واقسم على ستة.",
      placeholder: "صافي الدخل بعملتك",
      label: "صافي الدخل الشهري",
      incomeTypeLabel: "كيف تكسب دخلك؟",
      incomeTypeHint: {
        salaried: "راتب ثابت كل شهر",
        freelance: "دفعات من مشاريع أو عملاء تتفاوت",
        business: "أرباح تسحبها من عملك الخاص",
      },
      average: {
        toggle: "احسبه من آخر ستة أشهر",
        title: "دخل آخر ستة أشهر",
        hint: "اكتب ما تلقيته في كل شهر. اترك الشهر فارغًا إن لم تتلقَّ شيئًا.",
        month: "الشهر {n}",
        result: "متوسط ستة أشهر: {amount}",
        use: "استخدم {amount} كصافي دخلي",
        close: "إخفاء",
      },
    },
    3: {
      title: "كم تنفق على الأساسيات كل شهر؟",
      hint: "الإيجار والطعام والخدمات والمواصلات والرسوم الدراسية ودعم الوالدين وأي أقساط شهرية تدفعها بالفعل. استبعد الأكل خارج المنزل والتسوق والإجازات.",
      placeholder: "الإنفاق الأساسي بعملتك",
      label: "الإنفاق الأساسي الشهري",
      countsTitle: "ما الذي يُعدّ أساسيًا",
      counts: {
        rent: "الإيجار أو قسط القرض السكني",
        food: "الطعام والبقالة",
        utilities: "الكهرباء والغاز والماء والهاتف والإنترنت",
        transport: "المواصلات",
        school: "الرسوم المدرسية والدراسية",
        parents: "الدعم الذي ترسله إلى والديك",
        emi: "أي قسط قرض أو بطاقة تدفعه بالفعل",
      },
      leaveOut: "استبعد الأكل خارج المنزل والتسوق والأجهزة والإجازات.",
      takeHomeReminder: "صافي دخلك: {amount}",
      leftOver: "المتبقي بعد الأساسيات: {amount}",
    },
    4: {
      title: "مَن يعتمد على دخلك؟",
      hint: "اختر كل من ينطبق عليه ذلك. المُعالون يغيّرون حجم احتياطي الطوارئ واحتياجات التأمين.",
      none: "لا أحد يعتمد عليّ",
      label: "المُعالون",
      option: {
        partner: "الزوج أو الزوجة",
        children: "الأبناء",
        parents: "الوالدان",
      },
      optionHint: {
        partner: "زوج أو زوجة يعتمد على دخلك",
        children: "أي طفل تعيله",
        parents: "والداك أو والدا شريكك ممن تعيلهم",
      },
    },
    5: {
      title: "هل لديك قروض أو رصيد بطاقة ائتمان مُرحَّل؟",
      hint: "احسب القروض المصرفية وقروض السيارة أو السكن، وأي فاتورة بطاقة لا تسددها كاملة كل شهر.",
      yes: "نعم، عليّ ديون",
      no: "لا ديون",
      label: "القروض أو أرصدة البطاقات",
      yesNote: "شكرًا للتوضيح. ستتضمن خطتك فحصًا للديون حتى يُسدَّد الدين الأعلى كلفة أولًا.",
      noNote: "رائع. يمكن لخطتك أن تنتقل مباشرة إلى الادخار.",
      readyTitle: "هذا كل شيء",
      ready: "تُبنى خطتك من هذه الإجابات الخمس. يمكنك تغيير أي منها لاحقًا.",
    },
  },

  summary: {
    age: "العمر {age}",
    takeHome: "صافي الدخل {amount}",
    essentials: "الأساسيات {amount}",
    /** {list}: the people who depend on the user, already joined ("Partner, Children"). */
    dependents: "يعتمد عليك: {list}",
    noDependents: "لا أحد يعتمد عليك",
    debt: "عليك قروض أو ديون بطاقات",
    noDebt: "لا ديون",
  },

  cta: {
    start: "ابدأ",
    seePlan: "اعرض خطتي",
    next: "التالي",
    back: "رجوع",
  },

  validation: {
    required: "أدخل رقمًا للمتابعة.",
    number: "أدخل أرقامًا فقط، مثل {example}.",
    ageRange: "أدخل عمرًا بين {min} و{max}.",
    positiveAmount: "أدخل مبلغًا أكبر من الصفر.",
    essentialsAboveIncome: "الأساسيات أعلى من صافي دخلك. راجع الرقمين — يمكن أن تعمل الخطة، لكن مبلغ الادخار سيكون صغيرًا جدًا.",
    pickOne: "اختر خيارًا واحدًا على الأقل، أو «لا أحد».",
  },
};
