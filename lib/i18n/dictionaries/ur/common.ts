/*
 * Urdu (ur) dictionary. Register: polite, plain, second person آپ. Digits: Western (0-9).
 * Punctuation: Urdu full stop ۔ comma ، question mark ؟ semicolon ؛
 *
 * Glossary (English → Urdu), used the same way in every file:
 *   emergency fund → ہنگامی فنڈ
 *   take-home (pay) → خالص آمدنی (ہاتھ میں آنے والی ماہانہ آمدنی)
 *   essential spending / essentials → ضروری اخراجات
 *   savings → بچت ؛ save first → پہلے بچت
 *   savings account → بچت اکاؤنٹ
 *   fixed / term deposit → میعادی ڈپازٹ ؛ deposit → ڈپازٹ
 *   recurring deposit → ماہانہ بچت اسکیم
 *   government savings certificate → سرکاری بچت سرٹیفکیٹ
 *   treasury bill → ٹریژری بل ؛ treasury / government bond → ٹریژری بانڈ / سرکاری بانڈ
 *   equity → ایکویٹی ؛ shares → حصص ؛ equity fund → ایکویٹی فنڈ ؛ open-end fund → اوپن اینڈ فنڈ
 *   gold bars or coins → سونے کے بسکٹ یا سکے
 *   fixed income → مقررہ آمدنی
 *   asset mix → اثاثوں کی تقسیم ؛ rebalance → توازن بحال کرنا
 *   insurance → بیمہ ؛ insurer → بیمہ کمپنی ؛ premium → پریمیم ؛ policy → پالیسی ؛ claim → کلیم
 *   life cover → زندگی کا بیمہ ؛ health cover → صحت کا بیمہ ؛ term life → ٹرم لائف بیمہ
 *   sum insured → زرِ بیمہ ؛ surrender value → سرنڈر ویلیو ؛ maturity value → میچورٹی کی رقم
 *   debt / loan → قرض ؛ EMI → ماہانہ قسط (EMI) ؛ principal → اصل رقم ؛ balance → بقایا
 *   credit card → کریڈٹ کارڈ ؛ grace period → رعایتی مدت
 *   interest → سود ؛ profit → منافع ؛ return → منافع ؛ rate → شرح
 *   headline rate → ظاہری شرح ؛ real return → حقیقی منافع
 *   inflation → مہنگائی ؛ tax deducted at source → منبع پر کٹا ٹیکس
 *   lump sum → یکمشت رقم ؛ net worth → خالص مالیت
 *   retirement → ریٹائرمنٹ ؛ provident fund → پراویڈنٹ فنڈ ؛ gratuity → گریجویٹی
 *   pension → پنشن ؛ old-age allowance → بڑھاپا الاؤنس ؛ annuity → تاحیات اینوئٹی
 *   deposit insurance → ڈپازٹ بیمہ ؛ central bank → مرکزی بینک
 *   mature (deposit) → میچور ہونا ؛ refinance → ری فنانس ؛ pot (two-pot rule) → حصہ ؛ withdrawal → نکاسی
 *   dependents → زیرِ کفالت افراد
 *   Proper names kept as-is or transliterated: Taka Plan, FDR, DPS, BO account (BO اکاؤنٹ),
 *   CIB, Sanchayapatra → سنچیاپترا, Bangladesh Bank → بنگلہ دیش بینک, taka → ٹکا (৳)
 */
import type { Dictionary } from "../../types";

export const common: Dictionary["common"] = {
  appName: "Taka Plan",
  tagline: "ہر مقصد کے لیے کتنی رقم چاہیے، اور ہر مہینے اسے کہاں رکھیں۔",
  loading: "لوڈ ہو رہا ہے…",
  yes: "ہاں",
  no: "نہیں",
  optional: "اختیاری",

  nav: {
    home: "ہوم",
    plan: "میرا پلان",
    calculators: "کیلکولیٹر",
    admin: "شرحوں کا ایڈمن",
    language: "زبان",
  },

  button: {
    next: "آگے",
    back: "پیچھے",
    seePlan: "میرا پلان دیکھیں",
    whyThisNumber: "یہ عدد کیوں؟",
    why: "کیوں؟",
    close: "بند کریں",
    edit: "تبدیل کریں",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    reset: "نئے سرے سے",
    tryAgain: "دوبارہ کوشش کریں",
    learnMore: "مزید جانیں",
    add: "شامل کریں",
    remove: "ہٹائیں",
    done: "ہو گیا",
    skip: "چھوڑیں",
    openCalculator: "کیلکولیٹر کھولیں",
  },

  status: {
    red: "فوری توجہ درکار",
    amber: "اس پر نظر رکھیں",
    green: "درست سمت میں",
  },
  alsoNeedsAttention: "اس پر بھی توجہ درکار ہے",

  module: {
    m1: "ہنگامی فنڈ",
    m2: "بیمہ اور صحت",
    m3: "قرض کا جائزہ",
    m4: "پہلے بچت والا بجٹ",
    m5: "مقاصد کا منصوبہ",
    m6: "اثاثوں کی تقسیم",
    m7: "ریٹائرمنٹ اور خاندان",
    plan: "آپ کا پلان",
  },

  instrument: {
    savings_account: "بچت اکاؤنٹ",
    fdr_3m: "3 ماہ کا FDR",
    fdr_1y: "1 سال کا FDR",
    dps: "DPS",
    sanchayapatra_5y: "سرکاری بچت سرٹیفکیٹ",
    tbill_91d: "91 دن کا ٹریژری بل",
    tbond_5y: "5 سال کا ٹریژری بانڈ",
    tbond_10y: "10 سال کا ٹریژری بانڈ",
    equity_fund: "اوپن اینڈ ایکویٹی فنڈ",
    gold: "سونا (22 قیراط کے بسکٹ یا سکے)",
    loan_prepayment: "قرض کی اضافی ادائیگی",
    term_insurance: "ٹرم لائف بیمہ",
  },

  /** Product names inside a sentence, when the country data has none (useProductName). */
  productProse: {
    savings_account: "بچت اکاؤنٹ",
    fdr_3m: "میعادی ڈپازٹ",
    fdr_1y: "میعادی ڈپازٹ",
    dps: "ماہانہ بچت اسکیم",
    sanchayapatra_5y: "سرکاری بچت سرٹیفکیٹ",
    tbill_91d: "ٹریژری بل",
    tbond_5y: "سرکاری بانڈ",
    tbond_10y: "سرکاری بانڈ",
    equity_fund: "ایکویٹی فنڈ",
    gold: "سونا",
  },

  /** An instrument inside a sentence ("{instrument} میں"); {product} is the country's product name. */
  instrumentInline: {
    savings_account: "{product}",
    fdr_3m: "3 ماہ کے {product}",
    fdr_1y: "1 سال کا {product}",
    dps: "{product}",
    sanchayapatra_5y: "{product}",
    tbill_91d: "91 دن کے {product}",
    tbond_5y: "5 سال کا {product}",
    tbond_10y: "10 سال کا {product}",
    equity_fund: "اوپن اینڈ ایکویٹی فنڈ",
    gold: "سونے کے بسکٹ یا سکے",
    loan_prepayment: "قرض کی اضافی ادائیگیاں",
    term_insurance: "ٹرم لائف بیمہ",
  },

  unit: {
    month: "ماہ",
    months: "ماہ",
    year: "سال",
    years: "سال",
    perMonth: "/ماہ",
    perYear: "سالانہ",
    taka: "৳",
    percent: "%",
  },

  offline: "آپ آف لائن ہیں — محفوظ شدہ شرحیں استعمال ہو رہی ہیں",
  ratesVersion: "شرحیں v{version}، {asOf}",
  mayBeOutdated: "پرانی ہو سکتی ہیں",
  ourAssumption: "ہمارا اندازہ",
  ourSource: "Taka Plan (ہمارا اندازہ)",
  source: "ماخذ",
  asOf: "بتاریخ {date}",
  range: "حد {low}–{high}",
  afterTax: "ٹیکس کے بعد",
  afterInflation: "مہنگائی کے بعد",
  headline: "ظاہری شرح",

  disclaimer: {
    short:
      "صرف تعلیمی اندازے؛ یہ مالی، ٹیکس یا قانونی مشورہ نہیں۔ شرحیں بدلتی رہتی ہیں — کوئی قدم اٹھانے سے پہلے اپنے بینک یا بیمہ کمپنی سے تصدیق کریں۔ ماضی کا منافع مستقبل کے منافع کی ضمانت نہیں۔",
    title: "شروع کرنے سے پہلے",
    body:
      "Taka Plan صرف تعلیمی مقصد کے لیے اندازے دیتا ہے۔ یہ مالی، ٹیکس یا قانونی مشورہ نہیں، اور یہ کبھی کسی بینک، فنڈ یا بیمہ کمپنی کا نام نہیں لیتا۔ شرحیں اور ٹیکس کے قواعد سال میں کئی بار بدلتے ہیں، اس لیے یہاں دی گئی کسی بھی رقم پر عمل کرنے سے پہلے اپنے بینک یا بیمہ کمپنی سے تصدیق کریں۔ ماضی کا منافع مستقبل کے منافع کی ضمانت نہیں۔ آپ کے جوابات آپ کے فون ہی میں رہتے ہیں۔",
    accept: "میں نے سمجھ لیا",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "زبان منتخب کریں",
  },
  /** Header language menu button: {language} is the current language's own name. */
  languageMenu: "زبان: {language}",
  changeCountry: "ملک تبدیل کریں",
  /** Header country link: {country} is the country code shown in the header. */
  countryLink: "ملک {country}۔ ملک تبدیل کریں",

  incomeType: {
    salaried: "تنخواہ دار",
    freelance: "فری لانسر",
    business: "کاروباری",
  },

  dependent: {
    none: "کوئی نہیں",
    partner: "شریکِ حیات",
    children: "بچے",
    parents: "والدین",
  },

  goalType: {
    general: "عام",
    education: "تعلیم",
    health: "صحت",
    wedding: "شادی",
    vehicle: "گاڑی",
    home: "گھر یا زمین",
    travel: "سفر",
  },

  loanType: {
    personal: "ذاتی قرض",
    home: "گھر کا قرض",
    car: "گاڑی کا قرض",
    education: "تعلیمی قرض",
    other: "دیگر قرض",
  },

  horizon: {
    short: "3 سال سے کم",
    medium: "3 سے 5 سال",
    long: "5 سال سے زیادہ",
  },

  explain: {
    title: "یہ عدد کیوں؟",
    steps: "ہم یہاں تک کیسے پہنچے",
    assumptions: "استعمال شدہ شرحیں",
    notes: "نوٹس",
    stale: "اس شرح کے جائزے کی تاریخ گزر چکی ہے",
  },

  /** "Start from the beginning" and the drafts it keeps (components/drafts). */
  drafts: {
    startOver: "شروع سے آغاز کریں",
    startOverHint: "آپ کے موجودہ جوابات ڈرافٹ کے طور پر محفوظ رہیں گے۔",
    confirmTitle: "شروع سے آغاز کریں؟",
    confirmBody: "آپ کے موجودہ جوابات ڈرافٹ کے طور پر محفوظ رہیں گے۔ آپ اسے کبھی بھی ”آپ کے ڈرافٹ“ سے دوبارہ کھول سکتے ہیں۔",
    confirm: "ہاں، دوبارہ شروع کریں",
    cancel: "منسوخ",
    saved: "ڈرافٹ کے طور پر محفوظ ہو گیا",
    alreadySaved: "پہلے ہی ڈرافٹ کے طور پر محفوظ ہے",
    deleted: "ڈرافٹ حذف ہو گیا",
    title: "آپ کے ڈرافٹ",
    sectionTitle: "آپ کے ڈرافٹ ({count})",
    intro: "وہ جوابات جو آپ نے دوبارہ شروع کرتے وقت محفوظ رکھے۔ کوئی ایک کھول کر اس کا پلان دیکھیں۔",
    empty: "ابھی کوئی ڈرافٹ نہیں۔ جب آپ شروع سے آغاز کریں گے تو آپ کے موجودہ جوابات یہاں محفوظ ہو جائیں گے۔",
    seeAll: "تمام ڈرافٹ دیکھیں",
    backToPlan: "میرے پلان پر واپس",
    updated: "اپ ڈیٹ: {date}",
    current: "ابھی کھلا ہے",
    open: "کھولیں",
    rename: "نام بدلیں",
    renameLabel: "ڈرافٹ کا نام",
    renameHint: "زیادہ سے زیادہ {max} حروف۔ خودکار نام کے لیے خالی چھوڑ دیں۔",
    delete: "حذف کریں",
    deleteTitle: "یہ ڈرافٹ حذف کریں؟",
    deleteBody: "یہ اس فون سے ہٹا دیا جائے گا اور واپس نہیں لایا جا سکے گا۔",
    deleteConfirm: "ہاں، حذف کریں",
    /** Shown before saving would push the oldest unnamed draft out (lib/store/drafts.ts capDrafts). */
    capWarning: "آپ کے پاس پہلے ہی {max} ڈرافٹ ہیں، اس لیے بغیر نام کا سب سے پرانا ڈرافٹ ”{label}“ ہٹا دیا جائے گا۔ کسی ڈرافٹ کو رکھنے کے لیے اسے نام دیں۔",
    openTitle: "یہ ڈرافٹ کھولیں؟",
    openConfirm: "ہاں، کھولیں",
    label: {
      age: "عمر {age}",
      takeHome: "{amount}/ماہ",
      goalsOne: "{count} مقصد",
      goalsOther: "{count} مقاصد",
      m2: "بیمہ",
      m6: "سرمایہ کاری",
      m7: "ریٹائرمنٹ",
    },
  },

  /** Banner under the header about the chosen country's data (components/layout/CountryNotice). */
  countryNotice: {
    noData: "ہمارے پاس ابھی {country} کے تحقیق شدہ اعداد و شمار نہیں ہیں، اس لیے رقوم بنگلہ دیش کے اعداد و شمار اور ٹکا میں دکھائی گئی ہیں۔",
    changeCountry: "ملک تبدیل کریں",
    someFallback: "{country} کے کچھ اعداد و شمار علاقائی اندازے ہیں، خود اس ملک کے نہیں۔",
    about: "یہ اعداد کہاں سے آتے ہیں",
  },
};
