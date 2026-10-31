import type { Dictionary } from "../../types";

/** Country and language steps on "/" (imported there directly; see en/onboarding.ts). */
export const onboardingEntry: Pick<Dictionary["onboarding"], "country" | "language" | "switchCountry"> = {
  country: {
    title: "آپ کس ملک میں رہتے ہیں؟",
    subtitle: "ہم آپ کے ملک کی کرنسی، شرحیں اور بچت کے ذرائع استعمال کرتے ہیں۔",
    searchLabel: "اپنا ملک تلاش کریں",
    searchPlaceholder: "ملک کا نام، انگریزی میں یا اپنی زبان میں",
    suggested: "تجویز کردہ",
    all: "تمام ممالک",
    results: "ملتے جلتے ممالک",
    noMatch: "”{query}“ سے کوئی ملک نہیں ملتا۔",
    currency: "کرنسی: {code}",
    current: "موجودہ انتخاب",
    changeLater: "آپ اپنا ملک اور زبان کبھی بھی بدل سکتے ہیں۔",
    intro: "پانچ مختصر سوال، پھر آپ کا ماہانہ بچت پلان۔ کوئی اکاؤنٹ ضروری نہیں۔",
    disclaimer: "صرف تعلیمی اندازے؛ یہ مالی، ٹیکس یا قانونی مشورہ نہیں۔",
    region: {
      south_asia: "جنوبی ایشیا",
      east_asia_pacific: "مشرقی ایشیا اور بحرالکاہل",
      europe_central_asia: "یورپ اور وسطی ایشیا",
      latin_america_caribbean: "لاطینی امریکا اور کیریبین",
      middle_east_north_africa: "مشرقِ وسطیٰ اور شمالی افریقہ",
      north_america: "شمالی امریکا",
      sub_saharan_africa: "صحرائے اعظم کے جنوب میں افریقہ",
    },
  },
  language: {
    title: "آپ کون سی زبان چاہیں گے؟",
    subtitle: "آپ اوپر کے مینو سے کبھی بھی زبان بدل سکتے ہیں۔",
    country: "ملک: {country}",
    notAvailable: "آپ کی زبان ابھی دستیاب نہیں؛ انگریزی استعمال ہو رہی ہے۔",
    changeCountry: "ملک تبدیل کریں",
  },
  /** "/" when the user picks another country while answers exist: the amounts are in the old currency. */
  switchCountry: {
    title: "{country} کے لیے نئے سرے سے شروع کریں؟",
    body: "آپ کے جوابات {currency} میں ہیں۔ {country} کے لیے نئے سرے سے شروع کرنے پر آپ کے موجودہ جوابات ڈرافٹ کے طور پر محفوظ رہیں گے، تاکہ آپ انہیں کبھی بھی دوبارہ کھول سکیں۔",
    capWarning: "آپ کے پاس پہلے ہی {max} ڈرافٹ ہیں، اس لیے بغیر نام کا سب سے پرانا ڈرافٹ ہٹا دیا جائے گا۔",
    confirm: "نئے سرے سے شروع کریں",
    cancel: "میرے جوابات رکھیں",
    saved: "ڈرافٹ کے طور پر محفوظ ہو گیا",
  },
};

/** Five quick questions, one per screen. */
export const onboarding: Dictionary["onboarding"] = {
  country: onboardingEntry.country,
  language: onboardingEntry.language,
  switchCountry: onboardingEntry.switchCountry,

  languagePick: {
    title: "آپ کون سی زبان چاہیں گے؟",
    subtitle: "آپ کبھی بھی زبان بدل سکتے ہیں۔",
  },

  progress: "سوال {n} از 5",
  intro: "پانچ مختصر سوال، پھر آپ کا پلان۔ کوئی اکاؤنٹ ضروری نہیں۔",

  step: {
    1: {
      title: "آپ کی عمر کیا ہے؟",
      hint: "آپ کی عمر سے طے ہوتا ہے کہ آپ کے مقاصد اور ریٹائرمنٹ کی رقم کو بڑھنے کے لیے کتنا وقت ملے گا۔",
      placeholder: "آپ کی عمر، سالوں میں",
      label: "آپ کی عمر",
      decadeLabel: "کوئی ایک انتخاب چنیں، پھر نیچے صحیح عمر درج کریں",
      decade: {
        under20: "20 سے کم",
        twenties: "20 کی دہائی",
        thirties: "30 کی دہائی",
        forties: "40 کی دہائی",
        fifties: "50 کی دہائی",
        sixtyPlus: "60 یا زیادہ",
      },
      unit: "سال",
    },
    2: {
      title: "آپ کی ماہانہ خالص آمدنی کتنی ہے؟",
      hint: "وہ رقم جو ٹیکس اور پراویڈنٹ فنڈ کے بعد واقعی آپ کے اکاؤنٹ میں آتی ہے۔",
      hintFreelance: "آمدنی بے قاعدہ ہے؟ پچھلے چھ مہینوں کی آمدنی جمع کر کے چھ سے تقسیم کریں۔",
      placeholder: "اپنی کرنسی میں خالص آمدنی",
      label: "ماہانہ خالص آمدنی",
      incomeTypeLabel: "آپ کیسے کماتے ہیں؟",
      incomeTypeHint: {
        salaried: "ہر مہینے مقررہ تنخواہ",
        freelance: "پروجیکٹ یا کلائنٹ سے ادائیگیاں جو بدلتی رہتی ہیں",
        business: "اپنے کاروبار سے نکالا گیا منافع",
      },
      average: {
        toggle: "پچھلے چھ مہینوں سے حساب لگائیں",
        title: "پچھلے چھ مہینوں کی آمدنی",
        hint: "ہر مہینے جو ملا وہ لکھیں۔ جس مہینے کچھ نہ ملا ہو اسے خالی چھوڑ دیں۔",
        month: "مہینہ {n}",
        result: "چھ ماہ کی اوسط: {amount}",
        use: "{amount} کو میری خالص آمدنی بنائیں",
        close: "چھپائیں",
      },
    },
    3: {
      title: "آپ ہر مہینے ضروری اخراجات پر کتنا خرچ کرتے ہیں؟",
      hint: "کرایہ، کھانا، بل، آمد و رفت، اسکول فیس، والدین کی مدد اور جو قسطیں آپ پہلے سے ادا کر رہے ہیں۔ باہر کھانا، شاپنگ اور چھٹیاں شامل نہ کریں۔",
      placeholder: "اپنی کرنسی میں ضروری اخراجات",
      label: "ماہانہ ضروری اخراجات",
      countsTitle: "ضروری اخراجات میں کیا شامل ہے",
      counts: {
        rent: "کرایہ یا گھر کے قرض کی قسط",
        food: "کھانا اور سودا سلف",
        utilities: "بجلی، گیس، پانی، فون اور انٹرنیٹ",
        transport: "آمد و رفت",
        school: "اسکول اور ٹیوشن فیس",
        parents: "والدین کو بھیجی جانے والی مدد",
        emi: "قرض یا کارڈ کی کوئی قسط جو آپ پہلے سے ادا کر رہے ہیں",
      },
      leaveOut: "باہر کھانا، شاپنگ، گیجٹس اور چھٹیاں شامل نہ کریں۔",
      takeHomeReminder: "آپ کی خالص آمدنی: {amount}",
      leftOver: "ضروری اخراجات کے بعد باقی: {amount}",
    },
    4: {
      title: "آپ کی آمدنی پر کون انحصار کرتا ہے؟",
      hint: "جو بھی لاگو ہوں سب چنیں۔ زیرِ کفالت افراد سے آپ کے ہنگامی فنڈ اور بیمہ کی ضرورت بدلتی ہے۔",
      none: "کوئی مجھ پر انحصار نہیں کرتا",
      label: "زیرِ کفالت افراد",
      option: {
        partner: "شریکِ حیات",
        children: "بچے",
        parents: "والدین",
      },
      optionHint: {
        partner: "شوہر یا بیوی جو آپ کی آمدنی پر انحصار کرتے ہیں",
        children: "کوئی بھی بچہ جس کی آپ کفالت کرتے ہیں",
        parents: "والدین یا سسرال والے جن کی آپ مدد کرتے ہیں",
      },
    },
    5: {
      title: "کیا آپ پر کوئی قرض ہے، یا کریڈٹ کارڈ کا بقایا جو آپ آگے لے جاتے ہیں؟",
      hint: "بینک قرض، گاڑی یا گھر کا قرض، اور کارڈ کا کوئی بھی بل جو آپ ہر مہینے پورا ادا نہیں کرتے، سب شامل کریں۔",
      yes: "ہاں، مجھ پر قرض ہے",
      no: "کوئی قرض نہیں",
      label: "قرض یا کارڈ کے بقایا",
      yesNote: "جاننا اچھا ہوا۔ آپ کے پلان میں قرض کا جائزہ شامل ہوگا تاکہ سب سے مہنگا قرض پہلے ادا ہو۔",
      noNote: "بہت خوب۔ آپ کا پلان سیدھا بچت پر جا سکتا ہے۔",
      readyTitle: "بس، اتنا ہی",
      ready: "آپ کا پلان ان پانچ جوابات سے بنتا ہے۔ آپ ان میں سے کوئی بھی جواب بعد میں بدل سکتے ہیں۔",
    },
  },

  summary: {
    age: "عمر {age}",
    takeHome: "خالص آمدنی {amount}",
    essentials: "ضروری اخراجات {amount}",
    /** {list}: the people who depend on the user, already joined ("Partner, Children"). */
    dependents: "آپ پر انحصار: {list}",
    noDependents: "آپ پر کوئی انحصار نہیں کرتا",
    debt: "قرض یا کارڈ کا بقایا ہے",
    noDebt: "کوئی قرض نہیں",
  },

  cta: {
    start: "شروع کریں",
    seePlan: "میرا پلان دیکھیں",
    next: "آگے",
    back: "پیچھے",
  },

  validation: {
    required: "آگے بڑھنے کے لیے براہِ کرم ایک عدد درج کریں۔",
    number: "صرف ہندسے درج کریں، جیسے {example}۔",
    ageRange: "{min} اور {max} کے درمیان عمر درج کریں۔",
    positiveAmount: "صفر سے زیادہ رقم درج کریں۔",
    essentialsAboveIncome: "ضروری اخراجات آپ کی خالص آمدنی سے زیادہ ہیں۔ دونوں اعداد دوبارہ دیکھ لیں — پلان پھر بھی بن سکتا ہے، لیکن بچت کی رقم بہت کم ہوگی۔",
    pickOne: "کم از کم ایک انتخاب چنیں، یا ”کوئی نہیں“۔",
  },
};
