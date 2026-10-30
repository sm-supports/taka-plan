/**
 * Strings that exist only on the About page. They live here rather than in the shared
 * dictionaries because `en/common.ts` (the key source of truth) is frozen for this slice;
 * the integration stage should hoist this object into an `about` namespace in
 * lib/i18n/dictionaries/{en,bn}/about.ts (see notesForIntegration of the i18n-bn slice).
 *
 * Every number in this copy that comes from the rates table is a `{placeholder}` filled at
 * render time; literal digits appear only inside fixed names such as the fiscal year.
 */
import type { RateKey } from "@taka/engine";
import type { Locale } from "@/lib/i18n/config";

export type RateGroupId = "macro" | "bank" | "sanchayapatra" | "govt" | "market" | "risk" | "tax" | "policy" | "other";

/** Display order of the sources table and which rows fall in each group. Unlisted keys render under "other". */
export const RATE_GROUPS: ReadonlyArray<{ id: RateGroupId; keys: readonly RateKey[] }> = [
  { id: "macro", keys: ["inflation_cpi", "inflation_projection", "policy_rate"] },
  { id: "bank", keys: ["savings_account_rate", "fdr_3m_rate", "fdr_1y_rate", "dps_rate", "bank_deposit_avg_rate"] },
  {
    id: "sanchayapatra",
    keys: [
      "sanchayapatra_5y_rate",
      "sanchayapatra_5y_rate_above_cap",
      "sanchayapatra_tier_cap",
      "sanchayapatra_5y_year1_rate",
      "paribar_sanchayapatra_5y_rate",
      "pensioner_sanchayapatra_5y_rate",
      "sanchayapatra_3m_profit_3y_rate",
    ],
  },
  { id: "govt", keys: ["tbill_91d_rate", "tbond_5y_rate", "tbond_10y_rate"] },
  { id: "market", keys: ["equity_return_low", "equity_return_base", "equity_return_high", "gold_return_base", "gold_22k_per_bhori"] },
  {
    id: "risk",
    keys: ["credit_card_rate_cap", "deposit_insurance_limit", "life_claim_settlement_rate", "oop_health_share", "life_expectancy", "plan_to_age", "ups_return_fy2526"],
  },
  {
    id: "tax",
    keys: [
      "tax_free_threshold_general",
      "tax_free_threshold_women_senior",
      "tax_slabs",
      "min_tax",
      "min_tax_new",
      "rebate_share_of_income",
      "rebate_share_of_investment",
      "rebate_cap",
      "rebate_dps_cap",
      "rebate_govt_securities_cap",
      "tax_sanchayapatra_profit",
      "tax_bank_interest",
      "tax_bank_interest_no_return",
      "proof_of_return_threshold",
    ],
  },
  {
    id: "policy",
    keys: [
      "emergency_base_months",
      "emergency_bump_irregular_income",
      "emergency_bump_sole_earner",
      "emergency_bump_no_health_insurance",
      "emergency_min_months",
      "emergency_max_months",
      "emergency_build_months_default",
      "emergency_large_buffer_threshold",
      "cash_buffer_share",
      "card_min_payment_share",
      "emi_ratio_red",
      "card_utilisation_amber",
      "high_interest_debt_threshold",
      "personal_loan_rate_default",
      "savings_rate_default",
      "plan_emergency_min_share",
      "debt_payoff_target_months",
      "goal_inflation_education",
      "goal_inflation_health",
    ],
  },
];

export interface AboutCopy {
  title: string;
  lead: string;
  disclaimer: { heading: string };
  method: {
    heading: string;
    intro: string;
    phase: { protect: string; save: string; grow: string };
    /** {share} = plan_emergency_min_share, formatted. */
    order: string;
    returnsHeading: string;
    returns: string;
    exampleCaption: string;
    rounding: string;
    onDevice: string;
  };
  sources: {
    heading: string;
    /** {version} {date} formatted. */
    intro: string;
    group: Record<RateGroupId, string>;
    value: string;
    dates: string;
    nextReview: string;
    note: string;
    /** Tax slab lines: {rate} {width}. */
    slabNext: string;
    slabRest: string;
    unverifiedHeading: string;
    unverifiedIntro: string;
    unverified: readonly string[];
  };
}

export const ABOUT_COPY: Record<Locale, AboutCopy> = {
  en: {
    title: "About Taka Plan",
    lead: "A free calculator that tells a Bangladeshi earner how much each goal needs and where to put the money every month. It teaches and calculates; you act through your own bank, BO account or insurer.",
    disclaimer: { heading: "Disclaimer" },
    method: {
      heading: "How the plan is built",
      intro: "The plan follows seven steps in a fixed order: protect first, then save, then grow. Each step is one small calculator, and together they feed a single monthly amount.",
      phase: { protect: "Protect", save: "Save", grow: "Grow" },
      order:
        "Your monthly amount is filled in priority order: the emergency fund first, then insurance premiums, then any expensive debt, and only then goals and retirement. Until the emergency fund is full at least {share} of the monthly amount goes to it, so the rest still starts your investing habit today.",
      returnsHeading: "Returns after tax and after inflation",
      returns:
        "Every return is shown twice trimmed: first after the tax deducted at source, then after inflation. The headline rate is not the question; what you keep, and what it will still buy, is. An instrument can pay interest and still lose to inflation, and the app says so in red when it does.",
      exampleCaption: "With today's rates table:",
      rounding: "Results are rounded to a nearby round figure because a twenty-year projection is never exact to the taka. Ranges (low, expected, high) are shown where the future return is uncertain.",
      onDevice: "All maths runs on your phone. The server only keeps the rates table and, if you choose to sign in, your saved plan.",
    },
    sources: {
      heading: "Sources and assumptions",
      intro: "Every row below is one assumption the calculators read. Rates version {version}, published {date}. Rows tagged “our assumption” are defaults we chose and can change; the rest are copied from the published source linked beside each one.",
      group: {
        macro: "Inflation and policy rate",
        bank: "Bank deposits",
        sanchayapatra: "Sanchayapatra",
        govt: "Government securities",
        market: "Equity and gold",
        risk: "Credit, insurance and longevity",
        tax: "Tax rules (FY2026-27)",
        policy: "App policy defaults",
        other: "Other",
      },
      value: "Value",
      dates: "Dates",
      nextReview: "Next review",
      note: "Note",
      slabNext: "{rate} on the next {width}",
      slabRest: "{rate} on the rest",
      unverifiedHeading: "Not yet verified",
      unverifiedIntro: "We have not been able to confirm these, so no calculator relies on them yet:",
      unverified: [
        "Current term-life premiums for ten-lakh and one-crore cover.",
        "Sanchayapatra investment ceilings for 2026.",
        "Whether the reduced tax for small Sanchayapatra investors survived the Finance Act.",
        "A Bangladesh Bank EMI-to-income ratio (none appears to exist; we use our own threshold).",
        "Market-wide personal and home loan rates.",
      ],
    },
  },
  bn: {
    title: "টাকা প্ল্যান সম্পর্কে",
    lead: "একটি বিনামূল্যের ক্যালকুলেটর, যা একজন বাংলাদেশি উপার্জনকারীকে বলে দেয় প্রতিটি লক্ষ্যের জন্য কত টাকা লাগবে আর প্রতি মাসে সেই টাকা কোথায় রাখবেন। এটি শেখায় আর হিসাব করে; কাজটা আপনি করবেন নিজের ব্যাংক, বিও অ্যাকাউন্ট বা বিমা কোম্পানির মাধ্যমে।",
    disclaimer: { heading: "দায়মুক্তি" },
    method: {
      heading: "প্ল্যানটা কীভাবে তৈরি হয়",
      intro: "প্ল্যানটি সাতটি ধাপে সাজানো, আর ধাপগুলোর ক্রম বাঁধা: আগে সুরক্ষা, তারপর সঞ্চয়, তারপর বৃদ্ধি। প্রতিটি ধাপ একটি ছোট ক্যালকুলেটর, আর সবগুলো মিলে একটিমাত্র মাসিক অঙ্ক তৈরি করে।",
      phase: { protect: "সুরক্ষা", save: "সঞ্চয়", grow: "বৃদ্ধি" },
      order:
        "আপনার মাসিক অঙ্কটি গুরুত্বের ক্রমে ভাগ হয়: প্রথমে জরুরি তহবিল, তারপর বিমার প্রিমিয়াম, তারপর বেশি সুদের ঋণ, আর সবশেষে লক্ষ্য ও অবসর। জরুরি তহবিল পূর্ণ না হওয়া পর্যন্ত মাসিক অঙ্কের অন্তত {share} সেখানে যায়, তবে বাকিটা দিয়ে আজ থেকেই বিনিয়োগের অভ্যাস শুরু হয়।",
      returnsHeading: "কর বাদে, মূল্যস্ফীতি বাদে মুনাফা",
      returns:
        "প্রতিটি মুনাফা আমরা দুবার ছেঁটে দেখাই: প্রথমে উৎসে কাটা কর বাদ দিয়ে, তারপর মূল্যস্ফীতি বাদ দিয়ে। ঘোষিত হারটা আসল প্রশ্ন নয়; আপনার হাতে কী থাকে, আর তা দিয়ে কত জিনিস কেনা যাবে — সেটাই আসল। কোনো খাত সুদ দিয়েও মূল্যস্ফীতির কাছে হারতে পারে, আর তখন অ্যাপ সেটা লাল রঙে বলে দেয়।",
      exampleCaption: "আজকের রেটের তালিকা অনুযায়ী:",
      rounding: "ফল কাছাকাছি একটি গোল সংখ্যায় দেখানো হয়, কারণ বিশ বছরের প্রক্ষেপণ কখনো টাকা-পর্যন্ত নির্ভুল হয় না। ভবিষ্যতের মুনাফা অনিশ্চিত হলে একটি পরিসর (কম, প্রত্যাশিত, বেশি) দেখানো হয়।",
      onDevice: "সব হিসাব আপনার ফোনেই হয়। সার্ভারে শুধু রেটের তালিকা থাকে, আর আপনি সাইন ইন করলে আপনার সেভ করা প্ল্যান।",
    },
    sources: {
      heading: "সূত্র ও অনুমান",
      intro: "নিচের প্রতিটি সারি একটি ধরে নেওয়া মান, যা ক্যালকুলেটরগুলো পড়ে। রেট সংস্করণ {version}, প্রকাশিত {date}। “আমাদের অনুমান” চিহ্নিত সারিগুলো আমরা নিজেরা বেছে নিয়েছি আর বদলাতে পারি; বাকিগুলো পাশের সূত্র থেকে হুবহু নেওয়া।",
      group: {
        macro: "মূল্যস্ফীতি ও নীতি সুদহার",
        bank: "ব্যাংক আমানত",
        sanchayapatra: "সঞ্চয়পত্র",
        govt: "সরকারি সিকিউরিটিজ",
        market: "শেয়ার ও সোনা",
        risk: "ঋণ, বিমা ও আয়ু",
        tax: "করের নিয়ম (২০২৬-২৭ অর্থবছর)",
        policy: "অ্যাপের নিজস্ব নীতি",
        other: "অন্যান্য",
      },
      value: "মান",
      dates: "তারিখ",
      nextReview: "পরের পর্যালোচনা",
      note: "নোট",
      slabNext: "পরের {width}-এ {rate}",
      slabRest: "বাকিটায় {rate}",
      unverifiedHeading: "এখনো যাচাই হয়নি",
      unverifiedIntro: "এই তথ্যগুলো আমরা এখনো নিশ্চিত করতে পারিনি, তাই কোনো ক্যালকুলেটর এগুলোর ওপর ভরসা করে না:",
      unverified: [
        "দশ লাখ ও এক কোটি টাকার কভারে টার্ম লাইফ বিমার বর্তমান প্রিমিয়াম।",
        "২০২৬ সালে সঞ্চয়পত্রে বিনিয়োগের সর্বোচ্চ সীমা।",
        "ছোট বিনিয়োগকারীদের সঞ্চয়পত্রের কমানো কর অর্থ আইনে টিকে আছে কি না।",
        "বাংলাদেশ ব্যাংকের কোনো ইএমআই-আয় অনুপাত (এমন কিছু আছে বলে মনে হয় না; আমরা নিজেদের সীমা ব্যবহার করি)।",
        "বাজারজুড়ে পার্সোনাল লোন ও হোম লোনের সুদের হার।",
      ],
    },
  },
};
