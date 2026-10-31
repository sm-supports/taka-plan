import type { Dictionary } from "../../types";

export const explainM7: Dictionary["explain"]["m7"] = {
  spendingAtRetirement: {
    title: "ریٹائرمنٹ کے پہلے سال کا خرچ",
    body: "آج کا ماہانہ خرچ {monthlySpending}، ضرب 12، کام چھوڑنے تک کے {retireInYears} سال {inflation} سالانہ قیمتوں کے ساتھ بڑھا کر: 12 × {monthlySpending} × (1 + {inflation})^{retireInYears}۔ آپ کو ملنے والا کرایہ پہلے منہا ہوتا ہے، کیونکہ وہ بھی قیمتوں کے ساتھ بڑھتا ہے۔ نتیجہ: {result} سالانہ۔",
  },
  corpusContrast: {
    title: "موازنے کی عمر تک کا ہدف",
    body: "وہ رقم جو پہلے سال {spendingAtRetirement} دے، قیمتوں ({inflation}) کے ساتھ بڑھتی ہوئی، {retiredForYears} سال تک، جبکہ باقی رقم ٹیکس کے بعد {returnRate} کماتی رہے: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}۔ صرف موازنے کے لیے دکھایا گیا ہے۔",
  },
  corpusPlan: {
    title: "پلان کی عمر تک چلنے والا ہدف",
    body: "یہی فارمولا {retiredForYears} سال کے لیے: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}۔ یہ بالکل وہی رقم ہے جسے سال بہ سال کا چارٹ اس عمر پر خرچ کر کے صفر تک لاتا ہے۔",
  },
  savingsFv: {
    title: "کام چھوڑنے پر آپ کی بچت",
    body: "آج آپ کے پاس جو ہے، {savings}، {retireInYears} سال تک {accumulationRate} سالانہ پر سرمایہ کاری میں رہے: {savings} × (1 + {accumulationRate})^{retireInYears} = {result}۔",
  },
  providentFund: {
    title: "کام چھوڑنے پر پراویڈنٹ فنڈ",
    body: "آج کا بقایا {balance} جمع ہر مہینے جمع ہونے والے {monthlyContribution}، دونوں فنڈ کی اپنی شرح {fundRate} پر {retireInYears} سال بڑھتے ہوئے = {result}۔",
  },
  gratuity: {
    title: "گریجویٹی",
    body: "آخری بنیادی تنخواہ {basicMonthly} ÷ {daysPerMonthCount} دن × {daysCount} دن، ملازمت کے {serviceYears} سالوں میں سے ہر سال کے لیے = {result}، ملازمت چھوڑنے پر یکمشت ادا۔",
  },
  fixedPensions: {
    title: "مقررہ پنشن، کام چھوڑنے کے وقت کی قدر",
    body: "{pensionFromAgeYears} سال کی عمر سے {publicPensionMonthly} ماہانہ سرکاری پنشن اور {fixedPensionMonthly} ماہانہ دیگر مقررہ آمدنی، جو قیمتوں کے ساتھ بڑھے بغیر آپ کی پلان کی عمر تک ({retiredForYears} سال کی ریٹائرمنٹ) ملتی رہیں، کام چھوڑنے کے وقت {returnRate} پر اتنی قدر رکھتی ہیں: {result}۔ اسی لیے لمبی ریٹائرمنٹ میں ان کی قوتِ خرید گھٹتی جاتی ہے۔",
  },
  gap: {
    title: "ابھی بنانا ہے",
    body: "ہدف {corpus}، منفی وہ سب جو پہلے سے موجود ہوگا (آپ کی بچت، پراویڈنٹ فنڈ، گریجویٹی اور مقررہ پنشن کی قدر)، کبھی صفر سے نیچے نہیں: {result}۔",
  },
  monthly: {
    title: "ماہانہ بچت",
    body: "وہ رقم جو {savingMonths} ماہ تک ہر مہینے جمع ہو اور {monthlyRate} ماہانہ پر بڑھے تو {gap} بن جائے: {gap} × {monthlyRate} ÷ ((1 + {monthlyRate})^{savingMonths} − 1) = {result}، اوپر کی طرف گول تاکہ کافی ہو۔",
  },
  withdrawal: {
    title: "پہلے سال کی نکاسی",
    body: "{savings} پہلے سال کتنا دے سکتی ہے، اس کے بعد ہر سال قیمتوں ({inflation}) کے ساتھ بڑھتا ہوا، تاکہ {returnRate} کماتے ہوئے {retiredForYears} سال چلے: {savings} × ({returnRate} − {inflation}) ÷ (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) = {result}، نیچے کی طرف گول تاکہ کبھی کم نہ پڑے۔",
  },
  safePot: {
    title: "محفوظ حصہ",
    body: "پہلے سال کی نکاسی {firstYear} ضرب {potYears} سال = {result}، کسی محفوظ جگہ رکھی جائے جہاں سے جلد مل سکے۔",
  },
};
