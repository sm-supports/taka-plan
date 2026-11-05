// Swahili (standard East African Kiswahili). Register: "wewe" forms, plain and warm. Western digits only.
//
// Glossary (English → Kiswahili), used consistently across every sw file:
//   emergency fund            → akiba ya dharura
//   take-home (pay)           → kipato halisi (cha mwezi)
//   essentials / essential spending → mahitaji muhimu / matumizi muhimu
//   dependents                → wanaokutegemea
//   savings account           → akaunti ya akiba
//   fixed deposit / term deposit (FDR) → amana ya muda maalum (FDR kept as a Bangladesh name)
//   recurring deposit (DPS)   → amana ya kila mwezi (DPS kept as a Bangladesh name)
//   government savings certificate (Sanchayapatra) → hati ya akiba ya serikali (Sanchayapatra kept)
//   treasury bill             → hati ya hazina
//   treasury bond / government bond → hatifungani ya serikali
//   (open-end) equity fund    → mfuko wa hisa (wa wazi)
//   shares / equity           → hisa
//   fixed income              → mapato ya kudumu
//   asset mix                 → mchanganyiko wa mali
//   headline rate             → kiwango kilichotangazwa
//   real return               → faida halisi
//   after tax / after inflation → baada ya kodi / baada ya mfumuko wa bei
//   inflation                 → mfumuko wa bei
//   tax deducted at source    → kodi ya zuio
//   policy rate               → riba ya benki kuu
//   central bank              → benki kuu (Bangladesh Bank kept)
//   interest / rate           → riba / kiwango
//   EMI (instalment)          → rejesho la mwezi (EMI kept in Bangladesh-only copy)
//   principal                 → deni la msingi
//   prepayment                → malipo ya ziada ya mkopo
//   credit card               → kadi ya mkopo
//   grace period              → kipindi bila riba
//   term life insurance       → bima ya maisha ya muda
//   health insurance / cover  → bima ya afya / kinga
//   sum insured               → kiasi cha bima
//   premium                   → ada ya bima
//   surrender value           → thamani ya kusitisha
//   annuity                   → malipo ya maisha yote (annuity)
//   gratuity                  → kiinua mgongo
//   net worth                 → thamani ya mali zako
//   rebalance                 → kusawazisha
//   cover (insurance amount)  → kinga / bima; premium (price) → ada ya bima
//   pension                   → pensheni
//   provident fund            → mfuko wa akiba ya wafanyakazi
//   maturity                  → kukomaa (amana inapokomaa); maturity value → thamani ya ukomavu
//   deposit ladder            → ngazi ya amana
//   brokerage account         → akaunti ya udalali (BO account kept)
//   lump sum                  → mkupuo
//   retirement                → kustaafu / uzeeni
//   goal                      → lengo (malengo)
//   draft                     → rasimu
//   calculator                → kikokotoo
import type { Dictionary } from "../../types";

export const common: Dictionary["common"] = {
  appName: "Taka Plan",
  tagline: "Kiasi unachohitaji kwa kila lengo, na mahali pa kukiweka kila mwezi.",
  loading: "Inapakia…",
  yes: "Ndiyo",
  no: "Hapana",
  optional: "Si lazima",

  nav: {
    home: "Mwanzo",
    plan: "Mpango wangu",
    calculators: "Vikokotoo",
    admin: "Usimamizi wa viwango",
    language: "Lugha",
  },

  button: {
    next: "Endelea",
    back: "Rudi",
    seePlan: "Ona mpango wangu",
    whyThisNumber: "Kwa nini kiasi hiki?",
    why: "Kwa nini?",
    close: "Funga",
    edit: "Hariri",
    save: "Hifadhi",
    cancel: "Ghairi",
    reset: "Anza upya",
    tryAgain: "Jaribu tena",
    learnMore: "Soma zaidi",
    add: "Ongeza",
    remove: "Ondoa",
    done: "Maliza",
    skip: "Ruka",
    openCalculator: "Fungua kikokotoo",
  },

  status: {
    red: "Inahitaji hatua sasa",
    amber: "Fuatilia hili",
    green: "Uko sawa",
  },
  alsoNeedsAttention: "Pia inahitaji hatua",

  module: {
    m1: "Akiba ya dharura",
    m2: "Bima na afya",
    m3: "Ukaguzi wa madeni",
    m4: "Bajeti ya akiba kwanza",
    m5: "Mpangaji wa malengo",
    m6: "Mchanganyiko wa mali",
    m7: "Kustaafu na familia",
    plan: "Mpango wako",
  },

  instrument: {
    savings_account: "Akaunti ya akiba",
    fdr_3m: "FDR ya miezi 3",
    fdr_1y: "FDR ya mwaka 1",
    dps: "DPS",
    sanchayapatra_5y: "Hati ya akiba ya serikali",
    tbill_91d: "Hati ya hazina ya siku 91",
    tbond_5y: "Hatifungani ya serikali ya miaka 5",
    tbond_10y: "Hatifungani ya serikali ya miaka 10",
    equity_fund: "Mfuko wa hisa wa wazi",
    gold: "Dhahabu (vipande au sarafu za 22K)",
    loan_prepayment: "Malipo ya ziada ya mkopo",
    term_insurance: "Bima ya maisha ya muda",
  },

  /** Product names inside a sentence, when the country data has none (useProductName). */
  productProse: {
    savings_account: "akaunti ya akiba",
    fdr_3m: "amana ya muda maalum",
    fdr_1y: "amana ya muda maalum",
    dps: "amana ya kila mwezi",
    sanchayapatra_5y: "hati ya akiba ya serikali",
    tbill_91d: "hati ya hazina",
    tbond_5y: "hatifungani ya serikali",
    tbond_10y: "hatifungani ya serikali",
    equity_fund: "mfuko wa hisa",
    gold: "dhahabu",
  },

  /** An instrument inside a sentence ("into {instrument}"); {product} is the country's product name. */
  instrumentInline: {
    savings_account: "{product}",
    fdr_3m: "{product} za miezi 3",
    fdr_1y: "{product} ya mwaka 1",
    dps: "{product}",
    sanchayapatra_5y: "{product}",
    tbill_91d: "{product} za siku 91",
    tbond_5y: "{product} ya miaka 5",
    tbond_10y: "{product} ya miaka 10",
    equity_fund: "mfuko wa hisa wa wazi",
    gold: "vipande au sarafu za dhahabu",
    loan_prepayment: "malipo ya ziada ya mkopo",
    term_insurance: "bima ya maisha ya muda",
  },

  unit: {
    month: "mwezi",
    months: "miezi",
    year: "mwaka",
    years: "miaka",
    perMonth: "/mwezi",
    perYear: "kwa mwaka",
    taka: "৳",
    percent: "%",
  },

  offline: "Huna mtandao — tunatumia viwango vilivyohifadhiwa",
  ratesVersion: "Viwango v{version}, {asOf}",
  mayBeOutdated: "Huenda vimepitwa na wakati",
  ourAssumption: "Makisio yetu",
  ourSource: "Taka Plan (makisio yetu)",
  source: "Chanzo",
  asOf: "Kufikia {date}",
  range: "Kati ya {low}–{high}",
  afterTax: "Baada ya kodi",
  afterInflation: "Baada ya mfumuko wa bei",
  headline: "Kiwango kilichotangazwa",

  disclaimer: {
    short:
      "Makadirio kwa ajili ya kujifunza tu; si ushauri wa kifedha, wa kodi wala wa kisheria. Viwango hubadilika — wasiliana na benki au kampuni yako ya bima kabla ya kuchukua hatua. Faida za zamani hazitabiri faida za baadaye.",
    title: "Kabla hujaanza",
    body:
      "Taka Plan inatoa makadirio kwa ajili ya kujifunza tu. Si ushauri wa kifedha, wa kodi wala wa kisheria, na haitaji kamwe jina la benki, mfuko au kampuni ya bima. Viwango na sheria za kodi hubadilika mara kadhaa kwa mwaka, kwa hiyo wasiliana na benki au kampuni yako ya bima kabla ya kutumia namba yoyote hapa. Faida za zamani hazitabiri faida za baadaye. Majibu yako yanabaki kwenye simu yako.",
    accept: "Nimeelewa",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "Chagua lugha",
  },
  /** Header language menu button: {language} is the current language's own name. */
  languageMenu: "Lugha: {language}",
  changeCountry: "Badilisha nchi",
  /** Header country link: {country} is the country code shown in the header. */
  countryLink: "Nchi {country}. Badilisha nchi",

  incomeType: {
    salaried: "Mwajiriwa",
    freelance: "Mfanyakazi huru",
    business: "Mfanyabiashara",
  },

  dependent: {
    none: "Hakuna",
    partner: "Mwenzi",
    children: "Watoto",
    parents: "Wazazi",
  },

  goalType: {
    general: "Jumla",
    education: "Elimu",
    health: "Afya",
    wedding: "Harusi",
    vehicle: "Gari",
    home: "Nyumba au ardhi",
    travel: "Safari",
  },

  loanType: {
    personal: "Mkopo binafsi",
    home: "Mkopo wa nyumba",
    car: "Mkopo wa gari",
    education: "Mkopo wa elimu",
    other: "Mkopo mwingine",
  },

  horizon: {
    short: "Chini ya miaka 3",
    medium: "Miaka 3 hadi 5",
    long: "Zaidi ya miaka 5",
  },

  explain: {
    title: "Kwa nini kiasi hiki?",
    steps: "Tulivyofikia hapa",
    assumptions: "Viwango vilivyotumika",
    notes: "Maelezo",
    stale: "Kiwango hiki kimepita tarehe yake ya kukaguliwa",
  },

  /** "Start from the beginning" and the drafts it keeps (components/drafts). */
  drafts: {
    startOver: "Anza tangu mwanzo",
    startOverHint: "Majibu yako ya sasa yanahifadhiwa kama rasimu.",
    confirmTitle: "Uanze tangu mwanzo?",
    confirmBody: "Majibu yako ya sasa yanahifadhiwa kama rasimu. Unaweza kuifungua tena wakati wowote kutoka Rasimu zako.",
    confirm: "Ndiyo, anza upya",
    cancel: "Ghairi",
    saved: "Imehifadhiwa kama rasimu",
    alreadySaved: "Tayari imehifadhiwa kama rasimu",
    deleted: "Rasimu imefutwa",
    title: "Rasimu zako",
    sectionTitle: "Rasimu zako ({count})",
    intro: "Majibu uliyohifadhi ulipoanza upya. Fungua moja kuona mpango wake.",
    empty: "Bado hakuna rasimu. Ukianza tangu mwanzo, majibu yako ya sasa yatahifadhiwa hapa.",
    seeAll: "Ona rasimu zote",
    backToPlan: "Rudi kwenye mpango wangu",
    updated: "Imesasishwa {date}",
    current: "Iliyo wazi sasa",
    open: "Fungua",
    rename: "Badilisha jina",
    renameLabel: "Jina la rasimu",
    renameHint: "Hadi herufi {max}. Liache tupu ili kutumia jina la kiotomatiki.",
    delete: "Futa",
    deleteTitle: "Ufute rasimu hii?",
    deleteBody: "Itaondolewa kwenye simu hii na haiwezi kurudishwa.",
    deleteConfirm: "Ndiyo, futa",
    /** Shown before saving would push the oldest unnamed draft out (lib/store/drafts.ts capDrafts). */
    capWarning: "Tayari una rasimu {max}, kwa hiyo ile ya zamani zaidi isiyo na jina, “{label}”, itaondolewa. Ipe rasimu jina ili kuibakiza.",
    openTitle: "Ufungue rasimu hii?",
    openConfirm: "Ndiyo, ifungue",
    label: {
      age: "Umri {age}",
      takeHome: "{amount}/mwezi",
      goalsOne: "Lengo {count}",
      goalsOther: "Malengo {count}",
      m2: "Bima",
      m6: "Uwekezaji",
      m7: "Kustaafu",
    },
  },

  /** Banner under the header about the chosen country's data (components/layout/CountryNotice). */
  countryNotice: {
    noData: "Bado hatuna takwimu zilizofanyiwa utafiti za {country}, kwa hiyo kiasi kinatumia takwimu na sarafu ya Bangladesh (taka).",
    changeCountry: "Badilisha nchi",
    someFallback: "Baadhi ya takwimu za {country} ni makadirio ya kikanda, si zake yenyewe.",
    about: "Namba zinatoka wapi",
  },
};
