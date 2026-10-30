// TODO(bn-review): reviewed by i18n-bn slice
import type { Dictionary } from "../../types";

export const admin: Dictionary["admin"] = {
  title: "রেট অ্যাডমিন",
  login: {
    title: "রেট অ্যাডমিন সাইন-ইন",
    password: "পাসওয়ার্ড",
    submit: "সাইন ইন",
    failed: "পাসওয়ার্ড ভুল।",
    signOut: "সাইন আউট",
  },

  table: {
    key: "কী",
    label: "নাম",
    value: "মান",
    unit: "একক",
    range: "পরিসর",
    asOf: "তারিখ পর্যন্ত",
    nextReview: "পরের পর্যালোচনা",
    source: "সূত্র",
    sourceUrl: "সূত্রের লিংক",
    reviewedBy: "পর্যালোচনা করেছেন",
    note: "নোট",
    ourAssumption: "আমাদের অনুমান",
    stale: "পর্যালোচনার তারিখ পেরিয়েছে",
    empty: "এখনো কোনো সারি নেই।",
  },

  action: {
    edit: "বদলান",
    save: "সারি সেভ করুন",
    cancel: "বাতিল",
    publish: "খসড়া সংস্করণ {version} প্রকাশ করুন",
    discard: "খসড়া বাতিল করুন",
    previewFirst: "আগে প্রিভিউ দেখুন",
    preview: "প্রিভিউ",
    newDraft: "খসড়া শুরু করুন",
  },

  state: {
    published: "প্রকাশিত সংস্করণ {version}",
    draft: "খসড়া সংস্করণ {version}",
    noDraft: "কোনো খসড়া নেই। শুরু করতে একটি সারি বদলান।",
    unsaved: "সেভ না করা পরিবর্তন",
    saved: "সেভ হয়েছে",
    publishedAt: "প্রকাশিত {date}",
  },

  preview: {
    title: "প্রিভিউ: তিনটি নমুনা প্ল্যান কীভাবে বদলায়",
    profile: {
      first_job: "প্রথম চাকরি",
      freelancer: "ফ্রিল্যান্সার",
      family_with_debt: "ঋণসহ পরিবার",
    },
    published: "প্রকাশিত",
    draft: "খসড়া",
    changed: "বদলেছে",
    unchanged: "বদলায়নি",
    monthlyTotal: "মাসিক অঙ্ক",
    bucket: "খাত",
    before: "আগে",
    after: "পরে",
  },

  changeLog: {
    title: "পরিবর্তনের তালিকা",
    version: "সংস্করণ",
    when: "কখন",
    who: "কে",
    key: "কী",
    from: "আগে ছিল",
    to: "এখন",
    note: "নোট",
    empty: "এখনো কোনো পরিবর্তন নেই।",
  },

  validation: {
    number: "একটি সংখ্যা লিখুন।",
    date: "তারিখ লিখুন YYYY-MM-DD আকারে।",
    url: "পুরো লিংক লিখুন।",
    required: "এই ঘরটি পূরণ করতে হবে।",
    reviewBeforeAsOf: "পরের পর্যালোচনার তারিখ অবশ্যই তথ্যের তারিখের পরে হতে হবে।",
  },
};
