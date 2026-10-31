import type { Dictionary } from "../../types";

export const explainM7: Dictionary["explain"]["m7"] = {
  spendingAtRetirement: {
    title: "অবসরের প্রথম বছরের খরচ",
    body: "আজকের মাসিক খরচ {monthlySpending}, ১২ দিয়ে গুণ করে, কাজ ছাড়া পর্যন্ত {retireInYears} বছর ধরে বছরে {inflation} মূল্যস্ফীতিতে বাড়ানো: ১২ × {monthlySpending} × (১ + {inflation})^{retireInYears}। যে ভাড়া পান, বা অবসরে অন্য আয়, আগে বাদ যায়, কারণ সেটাও দামের সঙ্গে বাড়ে। ফল: বছরে {result}।",
  },
  corpusContrast: {
    title: "তুলনার বয়স পর্যন্ত লক্ষ্য",
    body: "যে অঙ্ক প্রথম বছরে {spendingAtRetirement} দেবে, প্রতি বছর দামের সঙ্গে ({inflation}) বাড়বে, আর {retiredForYears} বছর চলবে, যখন বাকিটা কর বাদে {returnRate} মুনাফা পায়: {spendingAtRetirement} × (১ − ((১ + {inflation}) ÷ (১ + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}। শুধু তুলনার জন্য দেখানো হলো।",
  },
  corpusPlan: {
    title: "আপনার বেছে নেওয়া বয়স পর্যন্ত লক্ষ্য",
    body: "একই সূত্র, {retiredForYears} বছরের জন্য: {spendingAtRetirement} × (১ − ((১ + {inflation}) ÷ (১ + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}। বছর-বছরের চার্টে ঠিক এই অঙ্কই সেই বয়সে শূন্যে নামে।",
  },
  savingsFv: {
    title: "কাজ ছাড়ার সময় আপনার সঞ্চয়",
    body: "আজকের {savings}, বছরে {accumulationRate} হারে {retireInYears} বছর বিনিয়োগে থাকলে: {savings} × (১ + {accumulationRate})^{retireInYears} = {result}।",
  },
  providentFund: {
    title: "কাজ ছাড়ার সময় প্রভিডেন্ট ফান্ড",
    body: "আজকের জমা {balance}, তার সঙ্গে প্রতি মাসে {monthlyContribution} জমা, দুটোই ফান্ডের নিজের হার {fundRate}-এ {retireInYears} বছর বাড়লে = {result}।",
  },
  gratuity: {
    title: "গ্র্যাচুইটি",
    body: "শেষ মূল বেতন {basicMonthly} ÷ {daysPerMonthCount} দিন × {daysCount} দিন, চাকরির {serviceYears} বছরের প্রতিটির জন্য = {result}, চাকরি ছাড়ার সময় একসঙ্গে পাওয়া যায়।",
  },
  fixedPensions: {
    title: "নির্দিষ্ট পেনশনের মূল্য, কাজ ছাড়ার সময়",
    body: "মাসে {publicPensionMonthly} সরকারি পেনশন আর {fixedPensionMonthly} অন্য নির্দিষ্ট পেনশন, দাম বাড়লেও না বেড়ে {retiredForYears} বছর ধরে পেলে, {returnRate} হারে এর মূল্য: {result}। তাই দীর্ঘ অবসরে এর কেনার ক্ষমতা কমে যায়।",
  },
  gap: {
    title: "এখনো যা গড়তে হবে",
    body: "লক্ষ্য {corpus}, তা থেকে যা আগেই থাকবে (আপনার সঞ্চয়, প্রভিডেন্ট ফান্ড, গ্র্যাচুইটি আর নির্দিষ্ট পেনশনের মূল্য) বাদ দিয়ে, শূন্যের নিচে নয়: {result}।",
  },
  monthly: {
    title: "মাসিক সঞ্চয়",
    body: "যে অঙ্ক {savingMonths} মাস ধরে প্রতি মাসে দিলে, মাসে {monthlyRate} হারে বেড়ে মোট {gap} হয়: {gap} × {monthlyRate} ÷ ((১ + {monthlyRate})^{savingMonths} − ১) = {result}, যথেষ্ট হওয়ার জন্য ওপরের দিকে গোল করা।",
  },
  withdrawal: {
    title: "প্রথম বছরের উত্তোলন",
    body: "{savings} থেকে প্রথম বছরে যা তোলা যায়, পরের প্রতি বছর দামের সঙ্গে ({inflation}) বাড়িয়ে, যাতে {returnRate} মুনাফায় {retiredForYears} বছর চলে: {savings} × ({returnRate} − {inflation}) ÷ (১ − ((১ + {inflation}) ÷ (১ + {returnRate}))^{retiredForYears}) = {result}, কখনো কম না পড়ার জন্য নিচের দিকে গোল করা।",
  },
  safePot: {
    title: "নিরাপদ পাত্র",
    body: "প্রথম বছরের উত্তোলন {firstYear} গুণ {potYears} বছর = {result}, নিরাপদ আর দ্রুত হাতে পাওয়া যায় এমন জায়গায় রাখা।",
  },
};
