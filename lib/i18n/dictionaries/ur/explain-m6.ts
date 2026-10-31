import type { Dictionary } from "../../types";

export const explainM6: Dictionary["explain"]["m6"] = {
  score: {
    title: "خطرے کا اسکور",
    body: "چاروں جوابات میں سے ہر ایک کو 0 سے 2 نمبر ملتے ہیں: عمر کا گروپ {ageBandCount}، آمدنی {incomeCount}، رقم کب چاہیے {horizonCount}، اور 20% گراوٹ کے بعد آپ کیا کریں گے {reactionCount}۔ کل: 8 میں سے {result}۔ 0 سے 3 محتاط، 4 سے 5 متوازن، 6 سے 8 بڑھوتری۔",
  },
  equity: {
    title: "ایکویٹی کا حصہ",
    body: "آپ کی پروفائل 30 سال کی عمر تک {startShare} ایکویٹی سے شروع ہوتی ہے، پھر اس کے بعد ہر سال ایک پوائنٹ کم، لیکن کبھی {floorShare} سے نیچے نہیں: {ageYears} پر یہ {ageEquityShare} بنتا ہے، اور کبھی {capShare} کی حد سے اوپر نہیں۔ جو رقم {noEquityYears} سال کے اندر چاہیے اس میں کوئی ایکویٹی نہیں، اور {cashOnlyYears} سال کے اندر صرف ڈپازٹ یا ٹریژری بل؛ آپ کو یہ رقم {horizonYears} سال میں چاہیے۔ ایکویٹی: {result}۔",
  },
  gold: {
    title: "سونے کا حصہ",
    body: "سونا تحفظ کا ذریعہ ہے، جوا نہیں: آپ کا انتخاب {chosenShare}، {minShare} اور {maxShare} کے درمیان رکھا گیا۔ سونا: {result}۔",
  },
  fixedIncome: {
    title: "مقررہ آمدنی کا حصہ",
    body: "جو کچھ ایکویٹی یا سونا نہیں: 100% − {equityShare} − {goldShare} = {result}۔",
  },
  mixLow: {
    title: "تقسیم کا منافع، کم صورت",
    body: "ہر حصے کا کم صورت والا سالانہ منافع، اس کے حصے کے وزن سے: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} سالانہ۔",
  },
  mixBase: {
    title: "تقسیم کا منافع، بنیادی صورت",
    body: "ہر حصے کا بنیادی صورت والا سالانہ منافع، اس کے حصے کے وزن سے: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} سالانہ۔ ایکویٹی کی بنیادی شرح جان بوجھ کر محفوظ ذرائع سے زیادہ نہیں رکھی گئی۔",
  },
  mixHigh: {
    title: "تقسیم کا منافع، زیادہ صورت",
    body: "ہر حصے کا زیادہ صورت والا سالانہ منافع، اس کے حصے کے وزن سے: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} سالانہ۔",
  },
  fv: {
    title: "یہ کتنی بڑھ سکتی ہے (بنیادی صورت)",
    body: "{monthly} ماہانہ اور آج {lumpSum}، {years} سال تک {mixRate} سالانہ ({monthlyRate} ماہانہ) پر بڑھتے ہوئے۔ آپ {paidIn} جمع کرتے ہیں؛ آخر میں آپ کے پاس {result} ہو سکتے ہیں۔ کم اور زیادہ صورتیں اپنا اپنا تقسیم کا منافع استعمال کرتی ہیں۔",
  },
  real: {
    title: "آج کی قیمت میں",
    body: "قیمتیں بھی بڑھتی ہیں۔ {fv} تقسیم (1 + {inflation})^{years} = {result}، آج کی قوتِ خرید میں۔",
  },
  trade: {
    title: "توازن بحال کرنے کے لین دین",
    body: "آپ کے پاس {holdingsTotal} ہیں اور آپ {newMoney} شامل کرتے ہیں، اس لیے نیا کل {result} ہے۔ ہر حصے کا ہدف اس کل میں اس کا حصہ ({equityShare}، {goldShare}، {fixedIncomeShare}) منفی جو ابھی اس میں ہے: ایکویٹی {equityTrade}، سونا {goldTrade}، مقررہ آمدنی {fixedIncomeTrade} (مثبت = خریدیں، منفی = بیچیں)۔ نئی رقم پہلے پیچھے رہ جانے والے حصوں میں جاتی ہے، اور ہدف سے {driftBandShare} سے زیادہ دور کوئی حصہ توازن بحال کرنے کا اشارہ ہے۔",
  },
};
