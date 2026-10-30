# Bangla style guide (বাংলা লেখার নিয়ম)

Owner: the `i18n-bn` slice. Applies to every string under `lib/i18n/dictionaries/bn/**`, to
`labelBn` in `packages/engine/src/data/rates.seed.json`, and to any Bangla copy a page keeps
locally (for example `app/[locale]/about/copy.ts`). The checks at the end are enforced by
`test/i18n-coverage.test.ts` where they can be, and by review where they cannot.

## 1. Voice

Write like a patient officer at a bank branch explaining something across the desk: plain words,
short sentences, one idea per sentence, and always a next step. Not a translated English
brochure, not a legal notice, not a textbook.

- **Register: formal আপনি, always.** আপনি / আপনার / আপনাকে, verbs in -ুন / -েন (বেছে নিন, দেখুন,
  রাখবেন). Never তুমি or তুই, never the impersonal passive where "আপনি" fits.
- **Say what to do, then why.** "আগে সঞ্চয় করুন; যা থাকে তা খরচ করুন।" beats a paragraph of theory.
- **Short sentences.** If an English sentence has two clauses joined by "and", consider two Bangla
  sentences. Use "—" (em dash) for a single aside, as the English does, but not more than one per
  sentence.
- **Prefer the everyday word** when it is exact: খরচ not ব্যয় (except in fixed phrases such as
  স্বাস্থ্য ব্যয়), টাকা not অর্থ, বাড়ি not গৃহ, আগে not পূর্বে, পরে not পশ্চাৎ, দরকার/লাগবে not
  প্রয়োজনীয়তা, বদলান not পরিবর্তন করুন. Sanskrit-heavy words are fine when they are the common
  term (মূল্যস্ফীতি, সঞ্চয়, মুনাফা, আমানত, অবসর).
- **Bank words stay bank words.** Use the term a teller would use, in Bangla script, not a coined
  translation (see the glossary). Never invent a Bangla word for FDR or DPS.
- **No product, bank, fund or insurer names.** "যেকোনো তফসিলি ব্যাংক", "সঞ্চয়পত্র বিক্রি করে এমন
  ব্যাংক শাখা বা ডাকঘর". The same rule as English.
- **Punctuation:** Bangla full stop "।" ends every sentence, including the last one in a body
  string. Question mark "?" and colon ":" are Latin. Quotes are curly “ ”. Lists inside a sentence
  use "," and "আর" / "বা" for the last item; "এবং" / "অথবা" only in formal lists.
- **Hyphen after a placeholder** is allowed when Bangla grammar needs a case ending on a
  substituted word: "{instrument}-এ", "{threshold}-এর বেশি". Avoid it after a placeholder that
  already ends in a unit word ("{months}" renders as "৮ মাস", so write "{months} পর", never
  "{months}-এ").

## 2. Digits

**Bangla digits everywhere in bn mode** — amounts, percentages, counts, dates, version numbers,
step numbers, and digits inside fixed copy. The PRD rule is "Bangla digits in Bangla mode"; there
is no exception for taka or percent.

| Thing | Bangla | Not |
| --- | --- | --- |
| Amount | ৳১২,৫০,০০০ | ৳12,50,000 · ১২,৫০,০০০ টাকা in a table cell |
| Compact amount | ৳৯.০ লাখ · ৳১.২ কোটি | ৳9.0 lakh · ৯ লক্ষ |
| Percent | ৮.৩% · −১.৫% | 8.3% · ৮.৩ শতাংশ in a table cell |
| Count | ৮ মাস · ২টি ব্যাংক | 8 মাস |
| Date | সেপ্টেম্বর ২০২৬ | Sep 2026 · ৩০/০৯/২০২৬ |
| Formula in explain copy | (১ + {inflation})^{years} | (1 + {inflation})^{years} |

- **Never hard-code a number** that comes from the rates table or from the user: use a
  `{placeholder}` and let `useFormat()` / the engine formatters produce the string. Dictionary copy
  may contain a digit only when it is part of a fixed name ("৫ বছর মেয়াদি সঞ্চয়পত্র", "১০০ বছর
  পর্যন্ত অবসর", "২০২৬-২৭ অর্থবছর", "৯১ দিনের ট্রেজারি বিল").
- **Operators** (+ − × ÷ = ^ %) and function names in formulas stay as they are; the digits around
  them switch to Bangla.
- **Grouping** follows the Indian system in both languages: ১২,৫০,০০০ (lakh/crore grouping), never
  ১,২৫০,০০০.
- **Taka sign** "৳" sits before the number with no space: ৳৯,০০০. In running prose "টাকা" after the
  number is fine ("৯,০০০ টাকা"), but a table cell or a headline always uses "৳".
- **Counters:** -টি for things and -জন for people: ২টি ব্যাংক, ৩টি প্রশ্ন, ২ জন নির্ভরশীল. Months and
  years take no counter: ৮ মাস, ৫ বছর.

## 3. Lakh and crore

- **লাখ** and **কোটি**, spelled exactly so. Not লক্ষ (literary), not "lakh", not "L". The parser
  accepts লক্ষ as input; the app never writes it.
- Compact form only where the English would also be compact (headline figures, chips). Tables and
  "Why this number?" steps show the full grouped amount.
- One decimal in compact form: ৳৯.০ লাখ, ৳১.২ কোটি. Thousands are never compacted (৳৫০,০০০, not
  ৫০ হাজার).

## 4. Months and dates

Month names, as `formatAsOf` emits them:

জানুয়ারি · ফেব্রুয়ারি · মার্চ · এপ্রিল · মে · জুন · জুলাই · আগস্ট · সেপ্টেম্বর · অক্টোবর · নভেম্বর · ডিসেম্বর

- "As of" dates are month + year: "সেপ্টেম্বর ২০২৬ অনুযায়ী". Use `common.asOf` ("{date} অনুযায়ী"),
  never "পর্যন্ত" (which means "until").
- Fiscal year: "২০২৬-২৭ অর্থবছর". Half-years as the source names them: "জুলাই–ডিসেম্বর ২০২৬".
- Durations: "৮ মাস", "৫ বছর", "৩ থেকে ৫ বছর", "৫ বছরের বেশি". "{months} পর" for "in N months",
  "{months} ধরে" for "over N months", "{months}-এর মধ্যে" is acceptable only when the placeholder
  is a bare number.

## 5. Status colours

Statuses are short, action-shaped, and never alarming. The traffic-light colour carries the
severity; the words say what to do.

| Status | Shared label (`common.status`) | Pattern for a module-specific label |
| --- | --- | --- |
| red | এখনই নজর দিন | What is wrong + "এখনই": "দামি ঋণে এখনই পদক্ষেপ দরকার", "এক মাসের খরচও জমা নেই" |
| amber | খেয়াল রাখুন | Reassure + keep going: "সামলানো যাচ্ছে, তবে নজর রাখুন", "আংশিক জমা — গড়ে তুলতে থাকুন" |
| green | ঠিক পথে আছেন | Plain confirmation: "ঋণ নিয়ন্ত্রণে", "পুরোটা জমা আছে" |

- A demoted red (shown amber with `common.alsoNeedsAttention`, "এটাও দেখা দরকার") keeps its amber
  wording; the caption carries the "also".
- No exclamation marks. No "সতর্কবার্তা", "বিপদ", "জরুরি সতর্কতা". The word জরুরি is reserved for
  the emergency fund (জরুরি তহবিল) and "জরুরি অবস্থা".
- The red reason for a goal is always the inflation sentence: "প্রত্যাশিত মুনাফা মূল্যস্ফীতির নিচে".

## 6. Glossary (the 13 tap-to-explain terms)

These are the only spellings to use anywhere in the app. The `terms.*.title` in
`lib/i18n/dictionaries/bn/terms.ts` is the source of truth; a test asserts each title contains the
form below.

| Key | English | Bangla (use this) | Do not write |
| --- | --- | --- | --- |
| fdr | FDR | এফডিআর | স্থায়ী আমানত, FDR, ফিক্সড ডিপোজিট (alone) |
| dps | DPS | ডিপিএস | DPS, মাসিক আমানত প্রকল্প |
| sanchayapatra | Sanchayapatra | সঞ্চয়পত্র | সঞ্চয় পত্র, জাতীয় সঞ্চয় সনদ (alone) |
| bo_account | BO account | বিও অ্যাকাউন্ট | BO হিসাব, বিও হিসাব |
| sum_insured | Sum insured | বিমা অঙ্ক | বিমাকৃত অর্থ, কভারেজ |
| emi | EMI | ইএমআই | EMI, সমান মাসিক কিস্তি (alone); plain "কিস্তি" is fine in prose |
| cib | CIB report | সিআইবি রিপোর্ট | CIB, ঋণ তথ্য ব্যুরো |
| tbill | Treasury bill | ট্রেজারি বিল | টি-বিল, ট্রেজারি বিল্‌ |
| tbond | Treasury bond | ট্রেজারি বন্ড | টি-বন্ড, সরকারি বন্ড (alone) |
| ladder | FDR ladder | এফডিআর ল্যাডার | সিঁড়ি, মই |
| real_return | Real return | প্রকৃত মুনাফা | বাস্তব রিটার্ন, রিয়েল রিটার্ন |
| take_home | Take-home | টেক-হোম আয় (short: টেক-হোম) | হাতে পাওয়া বেতন, নিট বেতন |
| grace_period | Grace period | গ্রেস পিরিয়ড | অনুগ্রহকাল, সুদমুক্ত সময় |

Other fixed spellings used across the app:

| English | Bangla |
| --- | --- |
| NID | এনআইডি |
| TIN | টিন (not টিআইএন) |
| savings account | সেভিংস অ্যাকাউন্ট |
| credit card | ক্রেডিট কার্ড |
| card limit | কার্ডের লিমিট |
| statement | স্টেটমেন্ট |
| scheduled bank | তফসিলি ব্যাংক |
| post office | ডাকঘর |
| deposit insurance | আমানত বিমা |
| provident fund | প্রভিডেন্ট ফান্ড |
| mutual fund (open-end) | ওপেন-এন্ড মিউচুয়াল ফান্ড |
| equity / shares | শেয়ার (ইকুইটি only in "ইকুইটি ফান্ড" style compound words) |
| interest (bank) / profit (Sanchayapatra, Islamic) | সুদ / মুনাফা |
| headline rate | ঘোষিত হার |
| after tax / after inflation | কর বাদে / মূল্যস্ফীতি বাদে |
| inflation | মূল্যস্ফীতি |
| emergency fund | জরুরি তহবিল |
| essentials (spending) | অত্যাবশ্যক খরচ |
| dependents | নির্ভরশীল (যারা আপনার ওপর নির্ভর করে) |
| sole earner | একমাত্র উপার্জনকারী |
| goal | লক্ষ্য |
| retirement | অবসর |
| bucket (plan card) | খাত |
| instrument | খাত (where to keep money); "কোথায় রাখবেন" as a label |
| rates table / rates version | রেটের তালিকা / রেট সংস্করণ |
| our assumption | আমাদের অনুমান |
| may be outdated | পুরোনো হয়ে থাকতে পারে |
| Why this number? | এই সংখ্যাটা কেন? |
| plan | প্ল্যান (not পরিকল্পনা, except "লক্ষ্যের পরিকল্পনা" as the M5 name) |
| save (button) / save (money) | সেভ করুন / সঞ্চয় |
| sign in / sign out | সাইন ইন / সাইন আউট |
| draft / publish (admin) | খসড়া / প্রকাশ |

"রেট" is used for a rates-table row (রেটের তালিকা, রেট সংস্করণ); "হার" for the rate inside a
sentence (সুদের হার, মুনাফার হার, সঞ্চয়ের হার).

## 7. Review checklist

Apply to every `bn/*.ts` file and to Bangla copy kept beside a page. The first five are automated
in `test/i18n-coverage.test.ts`; the rest are a reading pass.

1. [ ] Same key set and the same `{placeholders}` as the English file (automated).
2. [ ] No empty string (automated).
3. [ ] No Latin "lakh", "crore", "month" in any string (automated, whole dictionary).
4. [ ] No Latin digit `0-9` in a string, including digits inside formulas (automated for
       common/terms/errors; extend the test's namespace list once a file passes).
5. [ ] No তুমি / তুই register (automated for common/terms/errors).
6. [ ] Every sentence ends with "।"; no "." at the end of a Bangla sentence; no "!".
7. [ ] Glossary spellings only (section 6); in particular টিন not টিআইএন, বিমা অঙ্ক not বিমাকৃত
       অঙ্ক, সেভিংস অ্যাকাউন্ট not সঞ্চয়ী হিসাব.
8. [ ] Module names match `common.module.*` wherever a module title is repeated (`m3.title`,
       `m4.title`, `m5.title`, plan card headings).
9. [ ] A placeholder that renders with a unit word (`{months}`, `{years}`) is followed by a
       postposition, not a case suffix: "{months} পর", not "{months}-এ".
10. [ ] No bank, fund, insurer or product name; "যেকোনো তফসিলি ব্যাংক" is the pattern.
11. [ ] Numbers that come from the rates table are placeholders, not literals; a literal digit is
        only inside a fixed name.
12. [ ] Statuses follow the red/amber/green patterns in section 5 and contain no alarm words.
13. [ ] Each "next step" string names the documents to carry (এনআইডি, টিন), the place to go
        (ব্যাংক শাখা, ডাকঘর) and the thing to ask for, in that order.
14. [ ] Error strings say what went wrong and what to do, in two short sentences.
15. [ ] Read it aloud: if it sounds like a translated sentence ("…এর জন্য আপনার প্রয়োজন হবে…"),
        rewrite it the way a person would say it.
