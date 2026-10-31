import type { Dictionary } from "../../types";

export const explainM2: Dictionary["explain"]["m2"] = {
  years: {
    title: "بیمہ کے سال",
    body: "زندگی کا بیمہ آپ کی آج کی عمر {ageYears} سے {coverToAgeYears} سال کی عمر تک چلتا ہے، جب خاندان عموماً آپ کی آمدنی پر انحصار نہیں کرتا؛ یا اگر آپ نے بچے کی عمر دی ہے اور وہ پہلے آتا ہو تو تب تک جب سب سے چھوٹا بچہ {childIndependentAgeYears} سال کا ہو جائے: {result} سال۔ یہ کبھی صفر سے نیچے نہیں جاتا۔",
  },
  incomeNeed: {
    title: "آمدنی کا متبادل",
    body: "خاندان کو آپ کی ماہانہ خالص آمدنی {takeHome} کا {incomeShare} چاہیے ہوگا: {yearlyNeed} سالانہ۔ یہ ضرورت {coveredYears} سال تک قیمتوں کے ساتھ {inflation} سالانہ بڑھتی ہے۔ آج محفوظ بچت میں رکھی رقم ٹیکس کے بعد {afterTax} کما سکتی ہے، جو قیمتوں کے اضافے سے {realRate} سالانہ زیادہ ہے؛ اس لیے آج سے شروع ہو کر ہر سال کی ضرورت پوری کرنے والی آج کی یکمشت رقم {result} ہے۔",
  },
  lifeCover: {
    title: "درکار زندگی کا بیمہ",
    body: "آمدنی کا متبادل {incomeNeed}، جمع قرض {debts} اور تعلیمی مقاصد {educationGoals}، منفی خاندان کی دسترس میں بچت {liquidSavings} اور سرمایہ کاری {investments}: {result}۔ یہ کبھی صفر سے نیچے نہیں جاتا۔",
  },
  lifeGap: {
    title: "ابھی خریدنے والا زندگی کا بیمہ",
    body: "درکار بیمہ منفی پہلے سے موجود بیمہ: {cover} − {existingLifeCover} = {result}۔",
  },
  perStay: {
    title: "فی بالغ صحت کا بیمہ",
    body: "ہسپتال میں ایک عام داخلے پر تقریباً {hospitalCost} خرچ آتا ہے۔ خاندان صحت کے خرچ کا {oopShare} خود ادا کرتے ہیں؛ ہم کم از کم {publicFloorShare} لیتے ہیں، اس لیے {appliedShare} لیا گیا: فی بالغ {result} کا بیمہ۔",
  },
  healthTarget: {
    title: "خاندان کے لیے صحت کا بیمہ",
    body: "فی بالغ بیمہ {perStay} ضرب بیمہ شدہ {peopleCount} افراد کا وزن، کل {weightCount} (بچہ بالغ سے کم شمار ہوتا ہے، والدین زیادہ): {result}۔",
  },
  healthGap: {
    title: "ابھی خریدنے والا صحت کا بیمہ",
    body: "خاندان کا ہدف منفی پہلے سے موجود صحت کا بیمہ: {target} − {existingHealthCover} = {result}۔",
  },
  lifePremium: {
    title: "ٹرم لائف کا سالانہ پریمیم",
    body: "آپ کی عمر میں ٹرم لائف بیمہ ہر {per} کے لیے تقریباً {bandLow} سے {bandHigh} سالانہ کا پڑتا ہے، تمباکو کے لیے ضرب {smokerMultipleCount}۔ {gap} کے بیمہ کے لیے یہ {premiumLow} سے {premiumHigh} سالانہ بنتا ہے؛ درمیانی رقم {result} ہے۔",
  },
  healthPremium: {
    title: "صحت کا سالانہ پریمیم",
    body: "صحت کے بیمہ کی قیمت ہر {per} کے حساب سے، ہر فرد کی عمر کے مطابق لگتی ہے۔ {peopleCount} افراد کے لیے مزید {gap} کے بیمہ پر یہ {premiumLow} سے {premiumHigh} سالانہ بنتا ہے؛ درمیانی رقم {result} ہے۔",
  },
  monthlyNeed: {
    title: "ہر مہینے الگ رکھنے کی رقم",
    body: "دونوں سالانہ حدوں کی درمیانی رقم، ٹرم لائف {lifePremium} جمع صحت {healthPremium}، {months} ماہ پر بانٹ کر: {result} ماہانہ۔",
  },
  policyTerm: {
    title: "اتنی ہی رقم کا ٹرم بیمہ",
    body: "پالیسی کے بیمہ {sumAssured} کے لیے ٹرم لائف آپ کی عمر میں ہر {per} کے لیے تقریباً {bandLow} سے {bandHigh} سالانہ کا پڑتا ہے، تمباکو کے لیے ضرب {smokerMultipleCount}۔ درمیانی رقم {result} سالانہ ہے۔",
  },
  policyInvest: {
    title: "فرق کی بچت",
    body: "اگر آپ ابھی پالیسی بند کریں تو بیمہ کمپنی جو واپس دے گی، {surrenderValue}، وہ ٹیکس کے بعد {afterTax} کمانے والے محفوظ ڈپازٹ میں بڑھ کر {surrenderValueFV} بن جاتی ہے۔ آپ کا پریمیم {annualPremium} منفی ٹرم پریمیم {termPremium} سے {yearlyDifference} سالانہ بچتا ہے؛ اسے باقی {remainingYears} سالوں میں سے ہر سال کے شروع میں اسی ڈپازٹ میں ڈالیں تو سب ملا کر {result} بنتا ہے۔",
  },
  policyIrr: {
    title: "پالیسی کا سالانہ منافع",
    body: "پالیسی جاری رکھنے کا مطلب ہے آج {surrenderValue} چھوڑنا اور {termYears} میں سے باقی {remainingYears} سال تک {annualPremium} سالانہ ادا کرنا، تاکہ آخر میں {expectedMaturity} ملے: گویا اس رقم پر {result} سالانہ کمانا۔ اس کے بجائے پالیسی بند کر کے فرق کی بچت کریں تو {investValue} تک پہنچیں گے، یعنی {difference} کا فرق۔",
  },
};
