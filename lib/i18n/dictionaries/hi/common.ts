/*
 * Hindi (hi) dictionary. Register: polite "आप", plain everyday Hindi, Western digits.
 * Glossary (term → Hindi), used the same way in every file:
 *   savings account → बचत खाता
 *   fixed deposit → सावधि जमा (FD); FDR (Bangladesh product name) → FDR
 *   recurring deposit → आवर्ती जमा (RD); DPS (Bangladesh product name) → DPS
 *   government savings certificate → सरकारी बचत पत्र; Sanchayapatra → संचयपत्र
 *   treasury bill → ट्रेज़री बिल; treasury bond → ट्रेज़री बॉन्ड; government bond → सरकारी बॉन्ड
 *   equity fund → इक्विटी फ़ंड; shares → शेयर; gold → सोना; fixed income → निश्चित आय
 *   emergency fund → आपातकालीन फ़ंड
 *   take-home → टेक-होम (हाथ में आने वाली आय); essentials → ज़रूरी खर्च
 *   inflation → महँगाई; after tax → टैक्स के बाद; real return → वास्तविक रिटर्न
 *   interest rate → ब्याज दर; headline rate → घोषित दर; policy rate → नीतिगत दर
 *   term life insurance → टर्म जीवन बीमा; health insurance → स्वास्थ्य बीमा
 *   sum insured / cover → बीमा राशि / बीमा कवर; premium → प्रीमियम
 *   loan → लोन; debt → कर्ज़; EMI → EMI; principal → मूलधन; credit card → क्रेडिट कार्ड
 *   dependents → आश्रित; retirement → रिटायरमेंट; pension → पेंशन
 *   provident fund → भविष्य निधि (PF); deposit insurance → जमा बीमा
 *   central bank → केंद्रीय बैंक; Bangladesh Bank → बांग्लादेश बैंक
 *   asset mix → एसेट मिक्स; brokerage account → ब्रोकरेज खाता; BO account → BO खाता
 *   annuity → एन्युटी; surrender value → सरेंडर वैल्यू; national ID → राष्ट्रीय पहचान पत्र
 *   gratuity → ग्रेच्युटी; endowment policy → एंडाउमेंट पॉलिसी; maturity / matures → मैच्योरिटी / मैच्योर होना
 *   FDR ladder → FDR सीढ़ी; grace period → ग्रेस पीरियड; rebalance → रीबैलेंस; hedge → जोखिम से बचाव
 *   net worth → नेट वर्थ; property → ज़मीन-मकान; risk profile Careful/Balanced/Growth → सावधान/संतुलित/ग्रोथ
 */
import type { Dictionary } from "../../types";

export const common: Dictionary["common"] = {
  appName: "Taka Plan",
  tagline: "हर लक्ष्य के लिए कितना पैसा चाहिए, और हर महीने उसे कहाँ रखें।",
  loading: "लोड हो रहा है…",
  yes: "हाँ",
  no: "नहीं",
  optional: "वैकल्पिक",

  nav: {
    home: "होम",
    plan: "मेरा प्लान",
    calculators: "कैलकुलेटर",
    admin: "दरें (एडमिन)",
    language: "भाषा",
  },

  button: {
    next: "आगे",
    back: "पीछे",
    seePlan: "मेरा प्लान देखें",
    whyThisNumber: "यह संख्या क्यों?",
    why: "क्यों?",
    close: "बंद करें",
    edit: "बदलें",
    save: "सेव करें",
    cancel: "रद्द करें",
    reset: "फिर से शुरू करें",
    tryAgain: "फिर से कोशिश करें",
    learnMore: "और जानें",
    add: "जोड़ें",
    remove: "हटाएँ",
    done: "हो गया",
    skip: "छोड़ें",
    openCalculator: "कैलकुलेटर खोलें",
  },

  status: {
    red: "अभी ध्यान दें",
    amber: "इस पर नज़र रखें",
    green: "सही राह पर",
  },
  alsoNeedsAttention: "इन पर भी ध्यान दें",

  module: {
    m1: "आपातकालीन फ़ंड",
    m2: "बीमा और स्वास्थ्य",
    m3: "कर्ज़ की जाँच",
    m4: "पहले बचत वाला बजट",
    m5: "लक्ष्य प्लानर",
    m6: "एसेट मिक्स",
    m7: "रिटायरमेंट और परिवार",
    plan: "आपका प्लान",
  },

  instrument: {
    savings_account: "बचत खाता",
    fdr_3m: "3 महीने की FDR",
    fdr_1y: "1 साल की FDR",
    dps: "DPS",
    sanchayapatra_5y: "सरकारी बचत पत्र",
    tbill_91d: "91 दिन का ट्रेज़री बिल",
    tbond_5y: "5 साल का ट्रेज़री बॉन्ड",
    tbond_10y: "10 साल का ट्रेज़री बॉन्ड",
    equity_fund: "ओपन-एंड इक्विटी फ़ंड",
    gold: "सोना (22K बार या सिक्के)",
    loan_prepayment: "लोन का अतिरिक्त भुगतान",
    term_insurance: "टर्म जीवन बीमा",
  },

  /** Product names inside a sentence, when the country data has none (useProductName). */
  productProse: {
    savings_account: "बचत खाता",
    fdr_3m: "सावधि जमा",
    fdr_1y: "सावधि जमा",
    dps: "आवर्ती जमा",
    sanchayapatra_5y: "सरकारी बचत पत्र",
    tbill_91d: "ट्रेज़री बिल",
    tbond_5y: "सरकारी बॉन्ड",
    tbond_10y: "सरकारी बॉन्ड",
    equity_fund: "इक्विटी फ़ंड",
    gold: "सोना",
  },

  /** An instrument inside a sentence ("into {instrument}"); {product} is the country's product name. */
  instrumentInline: {
    savings_account: "{product}",
    fdr_3m: "3 महीने की {product}",
    fdr_1y: "1 साल की {product}",
    dps: "{product}",
    sanchayapatra_5y: "{product}",
    tbill_91d: "91 दिन के {product}",
    tbond_5y: "5 साल के {product}",
    tbond_10y: "10 साल के {product}",
    equity_fund: "ओपन-एंड इक्विटी फ़ंड",
    gold: "सोने के बार या सिक्के",
    loan_prepayment: "लोन का अतिरिक्त भुगतान",
    term_insurance: "टर्म जीवन बीमा",
  },

  unit: {
    month: "महीना",
    months: "महीने",
    year: "साल",
    years: "साल",
    perMonth: "/महीना",
    perYear: "सालाना",
    taka: "৳",
    percent: "%",
  },

  offline: "आप ऑफ़लाइन हैं — सेव की गई दरें इस्तेमाल हो रही हैं",
  ratesVersion: "दरें v{version}, {asOf}",
  mayBeOutdated: "पुरानी हो सकती है",
  ourAssumption: "हमारा अनुमान",
  ourSource: "Taka Plan (हमारा अनुमान)",
  source: "स्रोत",
  asOf: "{date} तक",
  range: "दायरा {low}–{high}",
  afterTax: "टैक्स के बाद",
  afterInflation: "महँगाई के बाद",
  headline: "घोषित दर",

  disclaimer: {
    short:
      "केवल सीखने के लिए अनुमान; यह वित्तीय, टैक्स या कानूनी सलाह नहीं है। दरें बदलती रहती हैं — कोई कदम उठाने से पहले अपने बैंक या बीमा कंपनी से पुष्टि करें। पिछला रिटर्न भविष्य के रिटर्न की गारंटी नहीं है।",
    title: "शुरू करने से पहले",
    body:
      "Taka Plan केवल सीखने के लिए अनुमान देता है। यह वित्तीय, टैक्स या कानूनी सलाह नहीं है, और यह कभी किसी बैंक, फ़ंड या बीमा कंपनी का नाम नहीं लेता। दरें और टैक्स नियम साल में कई बार बदलते हैं, इसलिए यहाँ की किसी भी संख्या पर कदम उठाने से पहले अपने बैंक या बीमा कंपनी से पुष्टि करें। पिछला रिटर्न भविष्य के रिटर्न की गारंटी नहीं है। जब तक आप प्लान सेव करना न चुनें, आपके जवाब आपके फ़ोन पर ही रहते हैं।",
    accept: "मैं समझता/समझती हूँ",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "भाषा चुनें",
  },
  /** Header language menu button: {language} is the current language's own name. */
  languageMenu: "भाषा: {language}",
  changeCountry: "देश बदलें",
  /** Header country link: {country} is the country code shown in the header. */
  countryLink: "देश {country}। देश बदलें",

  incomeType: {
    salaried: "नौकरीपेशा",
    freelance: "फ़्रीलांसर",
    business: "व्यवसायी",
  },

  dependent: {
    none: "कोई नहीं",
    partner: "जीवनसाथी",
    children: "बच्चे",
    parents: "माता-पिता",
  },

  goalType: {
    general: "सामान्य",
    education: "पढ़ाई",
    health: "स्वास्थ्य",
    wedding: "शादी",
    vehicle: "वाहन",
    home: "घर या ज़मीन",
    travel: "यात्रा",
  },

  loanType: {
    personal: "पर्सनल लोन",
    home: "होम लोन",
    car: "कार लोन",
    education: "एजुकेशन लोन",
    other: "अन्य लोन",
  },

  horizon: {
    short: "3 साल से कम",
    medium: "3 से 5 साल",
    long: "5 साल से ज़्यादा",
  },

  explain: {
    title: "यह संख्या क्यों?",
    steps: "हम यहाँ कैसे पहुँचे",
    assumptions: "इस्तेमाल की गई दरें",
    notes: "नोट",
    stale: "इस दर की समीक्षा की तारीख निकल चुकी है",
  },

  /** "Start from the beginning" and the drafts it keeps (components/drafts). */
  drafts: {
    startOver: "शुरू से शुरू करें",
    startOverHint: "आपके अभी के जवाब ड्राफ़्ट के रूप में रखे जाते हैं।",
    confirmTitle: "शुरू से शुरू करें?",
    confirmBody: "आपके अभी के जवाब ड्राफ़्ट के रूप में रखे जाते हैं। आप उन्हें कभी भी “आपके ड्राफ़्ट” से फिर खोल सकते हैं।",
    confirm: "हाँ, फिर से शुरू करें",
    cancel: "रद्द करें",
    saved: "ड्राफ़्ट के रूप में सेव हुआ",
    alreadySaved: "पहले से ड्राफ़्ट में सेव है",
    deleted: "ड्राफ़्ट हटा दिया गया",
    title: "आपके ड्राफ़्ट",
    sectionTitle: "आपके ड्राफ़्ट ({count})",
    intro: "फिर से शुरू करते समय रखे गए जवाब। किसी एक को खोलकर उसका प्लान देखें।",
    empty: "अभी कोई ड्राफ़्ट नहीं है। जब आप शुरू से शुरू करेंगे, आपके अभी के जवाब यहाँ रखे जाएँगे।",
    seeAll: "सभी ड्राफ़्ट देखें",
    backToPlan: "मेरे प्लान पर वापस",
    updated: "{date} को अपडेट हुआ",
    current: "अभी खुला है",
    open: "खोलें",
    rename: "नाम बदलें",
    renameLabel: "ड्राफ़्ट का नाम",
    renameHint: "ज़्यादा से ज़्यादा {max} अक्षर। अपने-आप बने नाम के लिए खाली छोड़ दें।",
    delete: "हटाएँ",
    deleteTitle: "यह ड्राफ़्ट हटाएँ?",
    deleteBody: "यह इस फ़ोन से हट जाएगा और वापस नहीं लाया जा सकेगा।",
    deleteConfirm: "हाँ, हटाएँ",
    /** Shown before saving would push the oldest unnamed draft out (lib/store/drafts.ts capDrafts). */
    capWarning: "आपके पास पहले से {max} ड्राफ़्ट हैं, इसलिए बिना नाम वाला सबसे पुराना ड्राफ़्ट, “{label}”, हटा दिया जाएगा। किसी ड्राफ़्ट को रखना हो तो उसे नाम दें।",
    openTitle: "यह ड्राफ़्ट खोलें?",
    openConfirm: "हाँ, खोलें",
    label: {
      age: "उम्र {age}",
      takeHome: "{amount}/महीना",
      goalsOne: "{count} लक्ष्य",
      goalsOther: "{count} लक्ष्य",
      m2: "बीमा",
      m6: "निवेश",
      m7: "रिटायरमेंट",
    },
  },

  /** Banner under the header about the chosen country's data (components/layout/CountryNotice). */
  countryNotice: {
    noData: "हमारे पास अभी {country} के लिए जाँचे-परखे आँकड़े नहीं हैं, इसलिए रकमें बांग्लादेश के आँकड़ों और टका में दिखाई गई हैं।",
    changeCountry: "देश बदलें",
    someFallback: "{country} के कुछ आँकड़े क्षेत्रीय अनुमान हैं, उसके अपने नहीं।",
    about: "ये संख्याएँ कहाँ से आती हैं",
  },
};
