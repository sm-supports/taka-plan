import type { Dictionary } from "../../types";

export const explainM2: Dictionary["explain"]["m2"] = {
  years: {
    title: "যত বছরের বিমা",
    body: "জীবন বিমা চলবে আপনার আজকের বয়স {ageYears} থেকে {coverToAgeYears} বছর বয়স পর্যন্ত, যখন পরিবার সাধারণত আর আপনার আয়ের ওপর নির্ভর করে না: {result} বছর। এটা কখনো শূন্যের নিচে যায় না।",
  },
  incomeNeed: {
    title: "যতটা আয়ের বদলে টাকা লাগবে",
    body: "পরিবারের লাগবে আপনার মাসিক টেক-হোম {takeHome}-এর {incomeShare}: বছরে {yearlyNeed}। দাম বাড়ার সঙ্গে এই দরকার বছরে {inflation} হারে বাড়বে, {coveredYears} বছর ধরে। আজ পাওয়া টাকা নিরাপদে কর বাদ দেওয়ার আগে {nominal}, {tax} কর বাদে {afterTax} মুনাফা দিতে পারে, তাই ওই সব বছরের খরচ চালাতে আজ এককালীন লাগবে {result}।",
  },
  lifeCover: {
    title: "যত জীবন বিমা দরকার",
    body: "আয়ের বদলে লাগবে {incomeNeed}, তার সঙ্গে ঋণ {debts} আর পড়াশোনার লক্ষ্য {educationGoals}, বাদ যাবে পরিবারের হাতের সঞ্চয় {liquidSavings} আর বিনিয়োগ {investments}: {result}। এটা কখনো শূন্যের নিচে যায় না।",
  },
  lifeGap: {
    title: "আরও যত জীবন বিমা কিনতে হবে",
    body: "যত বিমা দরকার, তা থেকে এখনকার বিমা বাদ: {cover} − {existingLifeCover} = {result}।",
  },
  perStay: {
    title: "প্রতি প্রাপ্তবয়স্কের স্বাস্থ্যবিমা",
    body: "হাসপাতালে একবার ভর্তি হলে সাধারণত খরচ হয় প্রায় {hospitalCost}। চিকিৎসা খরচের {oopShare} পরিবারগুলো নিজের পকেট থেকে দেয়; আমরা অন্তত {publicFloorShare} ধরি, তাই ধরা হলো {appliedShare}: প্রতি প্রাপ্তবয়স্কের জন্য {result} বিমা।",
  },
  healthTarget: {
    title: "পরিবারের জন্য স্বাস্থ্যবিমা",
    body: "প্রতি প্রাপ্তবয়স্কের বিমা {perStay}, গুণ বিমায় থাকা {peopleCount} জনের মোট ওজন {weightCount} (সন্তানের ওজন বড়দের চেয়ে কম, বাবা-মায়ের বেশি): {result}।",
  },
  healthGap: {
    title: "আরও যত স্বাস্থ্যবিমা কিনতে হবে",
    body: "পরিবারের লক্ষ্য থেকে এখনকার স্বাস্থ্যবিমা বাদ: {target} − {existingHealthCover} = {result}।",
  },
  lifePremium: {
    title: "টার্ম লাইফ বিমার বছরের প্রিমিয়াম",
    body: "আপনার বয়সে প্রতি {per} বিমার জন্য টার্ম লাইফ বিমার খরচ বছরে প্রায় {bandLow} থেকে {bandHigh}, ধূমপানের জন্য গুণ {smokerMultipleCount}। {gap} বিমার জন্য তা বছরে {premiumLow} থেকে {premiumHigh}; মাঝামাঝি {result}।",
  },
  healthPremium: {
    title: "স্বাস্থ্যবিমার বছরের প্রিমিয়াম",
    body: "স্বাস্থ্যবিমার দাম ধরা হয় প্রতি {per} বিমার জন্য, প্রত্যেকের বয়স অনুযায়ী। {peopleCount} জনের জন্য আরও {gap} বিমায় বছরে {premiumLow} থেকে {premiumHigh}; মাঝামাঝি {result}।",
  },
  monthlyNeed: {
    title: "প্রতি মাসে যা আলাদা রাখবেন",
    body: "দুই বছরের পরিসরের মাঝামাঝি, টার্ম লাইফ {lifePremium} আর স্বাস্থ্য {healthPremium}, {months} মাসে ভাগ করে: মাসে {result}।",
  },
  policyTerm: {
    title: "একই অঙ্কের টার্ম বিমা",
    body: "পলিসির বিমা অঙ্ক {sumAssured}-এর টার্ম লাইফ বিমায় আপনার বয়সে প্রতি {per}-এর জন্য বছরে প্রায় {bandLow} থেকে {bandHigh} লাগে, ধূমপানের জন্য গুণ {smokerMultipleCount}। মাঝামাঝি বছরে {result}।",
  },
  policyInvest: {
    title: "বাকি টাকা সঞ্চয় করলে",
    body: "আপনার প্রিমিয়াম {annualPremium} থেকে টার্ম প্রিমিয়াম {termPremium} বাদ দিলে বছরে থাকে {yearlyDifference}। বাকি {remainingYears} বছরের প্রতি বছরের শুরুতে এটা কর বাদে {afterTax} মুনাফার নিরাপদ আমানতে রাখলে হয় {result}।",
  },
  policyIrr: {
    title: "পলিসির বার্ষিক মুনাফা",
    body: "{termYears} বছর ধরে বছরে {annualPremium} দিয়ে মেয়াদ শেষে {expectedMaturity} পাওয়া মানে বছরে প্রায় {result} মুনাফা। এর বদলে বাকি টাকা সঞ্চয় করলে হতো {investValue}, পার্থক্য {difference}।",
  },
};
