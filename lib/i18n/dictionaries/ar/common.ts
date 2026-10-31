// Arabic (Modern Standard Arabic, right-to-left). Machine translation, review pending.
// Register: polite second person (generic masculine imperative), Western digits 0-9.
//
// Glossary (term → Arabic):
//   emergency fund → صندوق الطوارئ
//   take-home (pay) → صافي الدخل
//   essentials / essential spending → النفقات الأساسية
//   savings account → حساب توفير
//   fixed deposit / term deposit → وديعة لأجل (Bangladesh copy keeps "FDR")
//   recurring deposit → وديعة ادخار شهرية (Bangladesh copy keeps "DPS")
//   government savings certificate → شهادة ادخار حكومية (Bangladesh copy keeps "Sanchayapatra")
//   treasury bill → أذون الخزانة / إذن خزانة
//   treasury bond / government bond → سندات الخزانة / سند حكومي
//   open-end equity fund → صندوق أسهم مفتوح
//   equity / shares → الأسهم
//   fixed income → الدخل الثابت
//   gold → الذهب
//   asset mix → توزيع الأصول
//   rebalance → إعادة التوازن
//   term life insurance → تأمين الحياة المؤقت
//   health insurance / cover → التأمين الصحي / التغطية الصحية
//   sum insured → مبلغ التأمين
//   premium → قسط التأمين
//   EMI → القسط الشهري (EMI)
//   interest rate → سعر الفائدة
//   inflation → التضخم
//   real return → العائد الحقيقي
//   after tax → بعد الضريبة
//   headline rate → السعر المعلن
//   deposit insurance → تأمين الودائع
//   ladder (of deposits) → سلّم الودائع
//   grace period → فترة السماح
//   credit card → بطاقة ائتمان
//   provident fund → صندوق الادخار الوظيفي
//   gratuity → مكافأة نهاية الخدمة
//   pension → معاش تقاعدي
//   annuity → عقد دخل مدى الحياة (معاش مدى الحياة)
//   old-age allowance → إعانة الشيخوخة
//   lump sum → مبلغ مقطوع
//   net worth → صافي الثروة
//   central bank → البنك المركزي (Bangladesh Bank → بنك بنغلاديش)
import type { Dictionary } from "../../types";

export const common: Dictionary["common"] = {
  appName: "Taka Plan",
  tagline: "كم تحتاج لكل هدف، وأين تضع المال كل شهر.",
  loading: "جارٍ التحميل…",
  yes: "نعم",
  no: "لا",
  optional: "اختياري",

  nav: {
    home: "الرئيسية",
    plan: "خطتي",
    calculators: "الحاسبات",
    admin: "إدارة الأسعار",
    language: "اللغة",
  },

  button: {
    next: "التالي",
    back: "رجوع",
    seePlan: "اعرض خطتي",
    whyThisNumber: "لماذا هذا الرقم؟",
    why: "لماذا؟",
    close: "إغلاق",
    edit: "تعديل",
    save: "حفظ",
    cancel: "إلغاء",
    reset: "البدء من جديد",
    tryAgain: "حاول مجددًا",
    learnMore: "اعرف المزيد",
    add: "إضافة",
    remove: "حذف",
    done: "تم",
    skip: "تخطَّ",
    openCalculator: "افتح الحاسبة",
  },

  status: {
    red: "يحتاج إلى اهتمام الآن",
    amber: "انتبه لهذا",
    green: "على المسار الصحيح",
  },
  alsoNeedsAttention: "يحتاج أيضًا إلى اهتمام",

  module: {
    m1: "صندوق الطوارئ",
    m2: "التأمين والصحة",
    m3: "فحص صحة الديون",
    m4: "ميزانية الادخار أولًا",
    m5: "مخطط الأهداف",
    m6: "توزيع الأصول",
    m7: "التقاعد والعائلة",
    plan: "خطتك",
  },

  instrument: {
    savings_account: "حساب توفير",
    fdr_3m: "FDR لمدة 3 أشهر",
    fdr_1y: "FDR لمدة سنة",
    dps: "DPS",
    sanchayapatra_5y: "شهادة ادخار حكومية",
    tbill_91d: "إذن خزانة لمدة 91 يومًا",
    tbond_5y: "سند خزانة لمدة 5 سنوات",
    tbond_10y: "سند خزانة لمدة 10 سنوات",
    equity_fund: "صندوق أسهم مفتوح",
    gold: "ذهب (سبائك أو عملات عيار 22)",
    loan_prepayment: "دفعة إضافية للقرض",
    term_insurance: "تأمين الحياة المؤقت",
  },

  /** Product names inside a sentence, when the country data has none (useProductName). */
  productProse: {
    savings_account: "حساب توفير",
    fdr_3m: "وديعة لأجل",
    fdr_1y: "وديعة لأجل",
    dps: "وديعة ادخار شهرية",
    sanchayapatra_5y: "شهادة ادخار حكومية",
    tbill_91d: "أذون الخزانة",
    tbond_5y: "سند حكومي",
    tbond_10y: "سند حكومي",
    equity_fund: "صندوق أسهم",
    gold: "الذهب",
  },

  /** An instrument inside a sentence ("into {instrument}"); {product} is the country's product name. */
  instrumentInline: {
    savings_account: "{product}",
    fdr_3m: "{product} لمدة 3 أشهر",
    fdr_1y: "{product} لمدة سنة",
    dps: "{product}",
    sanchayapatra_5y: "{product}",
    tbill_91d: "{product} لمدة 91 يومًا",
    tbond_5y: "{product} لمدة 5 سنوات",
    tbond_10y: "{product} لمدة 10 سنوات",
    equity_fund: "صندوق أسهم مفتوح",
    gold: "سبائك أو عملات ذهبية",
    loan_prepayment: "دفعات إضافية للقرض",
    term_insurance: "تأمين الحياة المؤقت",
  },

  unit: {
    month: "شهر",
    months: "أشهر",
    year: "سنة",
    years: "سنوات",
    perMonth: "شهريًا",
    perYear: "سنويًا",
    taka: "৳",
    percent: "%",
  },

  offline: "أنت غير متصل — نستخدم الأسعار المحفوظة",
  ratesVersion: "إصدار الأسعار {version}، {asOf}",
  mayBeOutdated: "قد تكون قديمة",
  ourAssumption: "افتراضنا",
  ourSource: "Taka Plan (افتراضنا)",
  source: "المصدر",
  asOf: "حتى {date}",
  range: "النطاق {low}–{high}",
  afterTax: "بعد الضريبة",
  afterInflation: "بعد التضخم",
  headline: "السعر المعلن",

  disclaimer: {
    short:
      "تقديرات للتعلّم فقط، وليست نصيحة مالية أو ضريبية أو قانونية. الأسعار تتغير — راجع بنكك أو شركة التأمين قبل أن تتصرف. العوائد السابقة لا تتنبأ بالعوائد المستقبلية.",
    title: "قبل أن تبدأ",
    body:
      "يقدّم Taka Plan تقديرات للتعلّم فقط. وهو ليس نصيحة مالية أو ضريبية أو قانونية، ولا يذكر أبدًا اسم أي بنك أو صندوق أو شركة تأمين. تتغير الأسعار وقواعد الضرائب عدة مرات في السنة، فراجع بنكك أو شركة التأمين قبل أن تتصرف بناءً على أي رقم هنا. العوائد السابقة لا تتنبأ بالعوائد المستقبلية. تبقى إجاباتك على هاتفك ما لم تختر حفظ خطة.",
    accept: "فهمت",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "اختر اللغة",
  },
  /** Header language menu button: {language} is the current language's own name. */
  languageMenu: "اللغة: {language}",
  changeCountry: "تغيير البلد",
  /** Header country link: {country} is the country code shown in the header. */
  countryLink: "البلد {country}. تغيير البلد",

  incomeType: {
    salaried: "موظف براتب",
    freelance: "عامل مستقل",
    business: "صاحب عمل",
  },

  dependent: {
    none: "لا أحد",
    partner: "الزوج أو الزوجة",
    children: "الأبناء",
    parents: "الوالدان",
  },

  goalType: {
    general: "عام",
    education: "التعليم",
    health: "الصحة",
    wedding: "الزواج",
    vehicle: "سيارة",
    home: "منزل أو أرض",
    travel: "سفر",
  },

  loanType: {
    personal: "قرض شخصي",
    home: "قرض سكني",
    car: "قرض سيارة",
    education: "قرض تعليمي",
    other: "قرض آخر",
  },

  horizon: {
    short: "أقل من 3 سنوات",
    medium: "من 3 إلى 5 سنوات",
    long: "أكثر من 5 سنوات",
  },

  explain: {
    title: "لماذا هذا الرقم؟",
    steps: "كيف وصلنا إليه",
    assumptions: "الأسعار المستخدمة",
    notes: "ملاحظات",
    stale: "تجاوز هذا السعر موعد مراجعته",
  },

  /** "Start from the beginning" and the drafts it keeps (components/drafts). */
  drafts: {
    startOver: "البدء من البداية",
    startOverHint: "تُحفظ إجاباتك الحالية كمسودة.",
    confirmTitle: "البدء من البداية؟",
    confirmBody: "تُحفظ إجاباتك الحالية كمسودة. يمكنك فتحها مجددًا في أي وقت من «مسوداتك».",
    confirm: "نعم، ابدأ من جديد",
    cancel: "إلغاء",
    saved: "حُفظت كمسودة",
    alreadySaved: "محفوظة كمسودة بالفعل",
    deleted: "حُذفت المسودة",
    title: "مسوداتك",
    sectionTitle: "مسوداتك ({count})",
    intro: "إجابات احتفظت بها عندما بدأت من جديد. افتح إحداها لترى خطتها.",
    empty: "لا توجد مسودات بعد. عندما تبدأ من البداية، تُحفظ إجاباتك الحالية هنا.",
    seeAll: "عرض كل المسودات",
    backToPlan: "العودة إلى خطتي",
    updated: "حُدّثت {date}",
    current: "مفتوحة الآن",
    open: "فتح",
    rename: "إعادة تسمية",
    renameLabel: "اسم المسودة",
    renameHint: "حتى {max} حرفًا. اتركه فارغًا لاستخدام الاسم التلقائي.",
    delete: "حذف",
    deleteTitle: "حذف هذه المسودة؟",
    deleteBody: "ستُزال من هذا الهاتف ولا يمكن استرجاعها.",
    deleteConfirm: "نعم، احذفها",
    /** Shown before saving would push the oldest unnamed draft out (lib/store/drafts.ts capDrafts). */
    capWarning: "لديك بالفعل {max} مسودات، لذا ستُحذف أقدم مسودة بلا اسم، «{label}». سمِّ المسودة لتحتفظ بها.",
    openTitle: "فتح هذه المسودة؟",
    openConfirm: "نعم، افتحها",
    label: {
      age: "العمر {age}",
      takeHome: "{amount} شهريًا",
      goalsOne: "{count} هدف",
      goalsOther: "{count} أهداف",
      m2: "التأمين",
      m6: "الاستثمارات",
      m7: "التقاعد",
    },
  },

  /** Banner under the header about the chosen country's data (components/layout/CountryNotice). */
  countryNotice: {
    noData: "لا تتوفر لدينا بعد أرقام موثّقة لـ {country}، لذا تستخدم المبالغ أرقام بنغلاديش وعملة التاكا.",
    changeCountry: "تغيير البلد",
    someFallback: "بعض الأرقام الخاصة بـ {country} تقديرات إقليمية وليست أرقامه الخاصة.",
    about: "من أين تأتي الأرقام",
  },
};
