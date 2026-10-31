// "এই সংখ্যা কেন?" — M6 ধাপগুলোর বাংলা ব্যাখ্যা। ইনপুটের নাম ../en/explain-m6.ts-এ দেওয়া; placeholder হুবহু মিলতে হবে।
import type { Dictionary } from "../../types";

export const explainM6: Dictionary["explain"]["m6"] = {
  score: {
    title: "ঝুঁকির স্কোর",
    body: "চারটি উত্তরের প্রতিটিতে ০ থেকে ২ নম্বর: বয়সের দল {ageBandCount}, আয় {incomeCount}, টাকা কবে লাগবে {horizonCount}, আর ২০% পতনের পর আপনি কী করবেন {reactionCount}। মোট: ৮-এর মধ্যে {result}। ০ থেকে ৩ সতর্ক, ৪ থেকে ৫ ভারসাম্যপূর্ণ, ৬ থেকে ৮ বৃদ্ধিমুখী।",
  },
  equity: {
    title: "শেয়ারের ভাগ",
    body: "আপনার ধরনে ৩০ বছর বয়স পর্যন্ত শেয়ার {startShare}, তারপর প্রতি বছরে এক পয়েন্ট কম, তবে কখনো {floorShare}-এর নিচে নয়: {ageYears} বছর বয়সে তা {ageEquityShare}, আর কখনো {capShare} সীমার ওপরে নয়। {noEquityYears} বছরের মধ্যে লাগবে এমন টাকায় শেয়ার থাকে না, আর {cashOnlyYears} বছরের মধ্যে লাগলে শুধু আমানত বা বিল; আপনার টাকা লাগবে {horizonYears} বছর পরে। শেয়ার: {result}।",
  },
  gold: {
    title: "সোনার ভাগ",
    body: "সোনা ঝুঁকি সামলানোর জন্য, বাজির জন্য নয়: আপনার বেছে নেওয়া {chosenShare}, রাখা হয় {minShare} থেকে {maxShare}-এর মধ্যে। সোনা: {result}।",
  },
  fixedIncome: {
    title: "স্থির আয়ের ভাগ",
    body: "শেয়ার আর সোনার বাইরে যা থাকে: ১০০% − {equityShare} − {goldShare} = {result}।",
  },
  mixLow: {
    title: "মিশ্রণের মুনাফা, কম সম্ভাবনা",
    body: "প্রতিটি ভাগের কম সম্ভাবনার বার্ষিক মুনাফা, তার ভাগ দিয়ে গুণ করে যোগ: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = বছরে {result}।",
  },
  mixBase: {
    title: "মিশ্রণের মুনাফা, মাঝামাঝি সম্ভাবনা",
    body: "প্রতিটি ভাগের মাঝামাঝি সম্ভাবনার বার্ষিক মুনাফা, তার ভাগ দিয়ে গুণ করে যোগ: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = বছরে {result}। শেয়ারের মাঝামাঝি মুনাফা ইচ্ছা করেই নিরাপদ বিনিয়োগের চেয়ে বেশি ধরা হয়নি।",
  },
  mixHigh: {
    title: "মিশ্রণের মুনাফা, বেশি সম্ভাবনা",
    body: "প্রতিটি ভাগের বেশি সম্ভাবনার বার্ষিক মুনাফা, তার ভাগ দিয়ে গুণ করে যোগ: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = বছরে {result}।",
  },
  fv: {
    title: "কত হতে পারে (মাঝামাঝি সম্ভাবনা)",
    body: "মাসে {monthly} আর আজ {lumpSum}, বছরে {mixRate} (মাসে {monthlyRate}) হারে {years} বছর ধরে বাড়লে। আপনি জমা দেবেন {paidIn}; শেষে হতে পারে {result}। কম আর বেশি সম্ভাবনায় নিজ নিজ মিশ্রণের মুনাফা ধরা হয়।",
  },
  real: {
    title: "আজকের টাকায়",
    body: "দামও বাড়ে। {fv} ÷ (১ + {inflation})^{years} = আজকের হিসাবে {result}।",
  },
  trade: {
    title: "ভাগ ঠিক করার কেনাবেচা",
    body: "আপনার আছে {holdingsTotal}, যোগ করছেন {newMoney}, তাই নতুন মোট {result}। প্রতিটি ভাগের লক্ষ্য হলো ওই মোটের তার অংশ ({equityShare}, {goldShare}, {fixedIncomeShare}) বাদ এখন যা আছে: শেয়ার {equityTrade}, সোনা {goldTrade}, স্থির আয় {fixedIncomeTrade} (যোগ চিহ্ন = কিনুন, বিয়োগ চিহ্ন = বেচুন)। নতুন টাকা আগে পিছিয়ে থাকা ভাগে যায়, আর কোনো ভাগ লক্ষ্য থেকে {driftBandShare}-এর বেশি সরে গেলে ভাগ ঠিক করার সময়।",
  },
};
