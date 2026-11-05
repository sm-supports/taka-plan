import type { Dictionary } from "../../types";

/** Asset mix screen (M6). Never name a company, fund, broker or bank. */
export const m6: Dictionary["m6"] = {
  title: "Mchanganyiko wa mali",
  intro: "Jinsi ya kugawa pesa yako ya muda mrefu kati ya mapato ya kudumu, hisa na dhahabu, nini cha kununua kwa kila sehemu, na jinsi ya kudumisha mgawanyo uliolengwa.",
  demo: "Namba za mfano kwa ajili ya kuonyesha tu. Majibu yako hayatumiki kwenye ukurasa huu.",
  needProfile: "Jibu kwanza maswali matano ya mwanzo, ili mchanganyiko utumie umri wako na unavyopata kipato.",
  startLink: "Jibu maswali ya mwanzo",
  backToPlan: "Rudi kwenye mpango wangu",
  disclaimer: "Makadirio ya kujifunza, si ushauri wa uwekezaji. Masoko yanaweza kushuka na kubaki chini kwa miaka, na faida za zamani hazitabiri za baadaye.",

  flow: {
    progress: "Swali {n} kati ya {total}",
    gate: {
      title: "Je, una akiba ya dharura na huna deni la kadi?",
      hint: "Pesa ya muda mrefu inakuja baada ya akiba ya dharura iliyojaa na baada ya deni la kadi kulipwa. Hiki ndicho mpango wako unasema.",
      emergencyOk: "Akiba yako ya dharura imejaa.",
      emergencyMissing: "Akiba yako ya dharura bado haijajaa.",
      cardOk: "Huna deni la kadi linalobaki.",
      cardMissing: "Una salio la kadi linalohamia mwezi hadi mwezi.",
      openEmergency: "Fungua akiba ya dharura",
      openDebt: "Fungua ukaguzi wa madeni",
      allClear: "Vizuri: uko tayari kuwekeza kwa muda mrefu.",
      continue: "Endelea",
      continueAnyway: "Endelea hata hivyo",
    },
    ageBand: {
      title: "Uko katika kundi gani la umri?",
      hint: "Imejazwa kutokana na umri wako. Wawekaji akiba vijana wana miaka zaidi ya kuvumilia anguko.",
    },
    incomeStability: {
      title: "Kipato chako kina uthabiti kiasi gani?",
      hint: "Imejazwa kutokana na unavyopata kipato. Kipato thabiti zaidi kinaweza kubeba hatari kidogo zaidi.",
    },
    horizon: {
      title: "Utahitaji pesa hii lini?",
      hint: "Telezesha hadi idadi ya miaka. Pesa unayoihitaji karibuni haipaswi kukaa kwenye hisa.",
      band: "Hiyo inahesabika kama: {band}.",
    },
    reaction: {
      title: "Uwekezaji wako ukishuka 20% kwa mwaka mmoja, ungefanya…",
      hint: "Hakuna jibu baya. Kuwa mkweli: linaamua kiasi cha hisa unachoweza kuvumilia.",
    },
    amounts: {
      title: "Utawekeza kiasi gani?",
      hint: "Mkupuo, kiasi cha kila mwezi, au vyote viwili. Unaweza kuvibadilisha baadaye.",
      needOne: "Weka mkupuo au kiasi cha kila mwezi kuona mchanganyiko wako.",
      seeResult: "Ona mchanganyiko wangu",
    },
  },

  answer: {
    ageBand: { "0": "50 au zaidi", "1": "35 hadi 49", "2": "Chini ya 35" },
    incomeStability: { "0": "Kipato cha biashara", "1": "Kazi huru au kisicho cha kawaida", "2": "Mshahara" },
    horizon: { "0": "Ndani ya miaka 5", "1": "Baada ya miaka 5 hadi 10", "2": "Baada ya zaidi ya miaka 10" },
    reaction: { "0": "Kuuza, ili kuzuia hasara", "1": "Kusubiri irudi", "2": "Kununua zaidi wakati bei iko chini" },
  },

  profile: {
    careful: "Tahadhari",
    balanced: "Uwiano",
    growth: "Ukuaji",
  },

  bucket: {
    fixedIncome: "Mapato ya kudumu",
    equity: "Hisa",
    gold: "Dhahabu",
  },

  section: {
    result: "Mchanganyiko wako",
    instruments: "Nini cha kununua",
    projection: "Inaweza kukua hadi kiasi gani",
    rebalance: "Tayari ninawekeza",
    inputs: "Majibu yako",
    netWorth: "Thamani ya mali zako",
    notes: "Vizuri kujua",
  },

  input: {
    ageBand: { label: "Kundi la umri" },
    incomeStability: { label: "Uthabiti wa kipato chako" },
    horizon: { label: "Unapohitaji pesa" },
    reaction: { label: "Uwekezaji wako ukishuka 20% kwa mwaka mmoja" },
    profileOverride: {
      label: "Wasifu wa hatari",
      hint: "Tunapendekeza mmoja kutokana na majibu yako. Unaweza kuchagua mwingine; hisa hazipiti kamwe kikomo.",
      suggested: "Unapendekezwa kutokana na majibu yako",
    },
    goldShare: {
      label: "Sehemu ya dhahabu",
      hint: "Kinga dhidi ya hatari, inayobaki kati ya {min} na {max} ya mchanganyiko.",
      reset: "Rudi kwenye {share}",
    },
    horizonYears: {
      label: "Miaka hadi utakapohitaji pesa",
      hint: "Chini ya miaka {noEquity} hakuna hisa; chini ya mwaka {cashOnly} ni amana na hati za hazina tu.",
    },
    lumpSum: {
      label: "Mkupuo wa kuwekeza sasa",
      hint: "Pesa unayoweza kuweka kwa muda mrefu leo.",
    },
    monthly: {
      label: "Kiasi cha kila mwezi",
      hint: "Unachoweza kuongeza kila mwezi.",
    },
    propertyValue: {
      label: "Mali isiyohamishika unayomiliki (si lazima)",
      hint: "Ardhi au nyumba. Inahesabiwa kwenye thamani ya mali zako lakini si kwenye mgawanyo, kwa sababu haiwezi kununuliwa au kuuzwa kwa vipande vidogo.",
    },
    directShares: {
      label: "Kununua hisa moja kwa moja badala ya mfuko?",
      hint: "Ikiwa tu uko tayari kuchagua na kufuatilia angalau kampuni kumi kubwa mwenyewe.",
    },
  },

  result: {
    score: "Alama ya hatari {score} kati ya {max}",
    profileLine: "Wasifu wako: {profile}",
    suggestedLine: "Unapendekezwa kutokana na majibu yako: {profile}",
    barLabel: "Mchanganyiko wako: {parts}",
    lump: "mkupuo",
    monthly: "Kila mwezi",
    whySplit: "Kwa nini mgawanyo huu?",
    horizon: {
      noEquity: "Unahitaji pesa hii ndani ya miaka michache, kwa hiyo sehemu ya hisa imehamishiwa kwenye mapato ya kudumu.",
      cashOnly: "Unahitaji pesa hii ndani ya mwaka mmoja, kwa hiyo yote inabaki kwenye amana au hati za hazina.",
    },
  },

  instrument: {
    title: "{bucket}: {share}",
    primary: "Anza na",
    alternatives: "Chaguo zingine",
    unavailable: "Haipatikani katika nchi yako. Weka sehemu hii kwenye mapato ya kudumu kwa sasa.",
    localName: "Jina la hapa: {name}",
  },

  projection: {
    intro: "Miaka {years}, {paidIn} zimewekwa. Hali tatu, kwa sababu hakuna anayejua ipi itatokea.",
    introNone: "Weka mkupuo au kiasi cha kila mwezi kuona makadirio.",
    low: "Chini",
    base: "Msingi",
    high: "Juu",
    rate: "{rate} kwa mwaka",
    real: "{amount} kwa pesa ya leo",
    lowLosesValue: "Katika hali ya chini pesa yako inakua polepole kuliko bei na inapoteza uwezo wa kununua.",
    why: "Kwa nini namba hizi?",
  },

  rebalance: {
    intro: "Weka unachomiliki leo katika kila sehemu, na pesa mpya yoyote ya kuongeza. Tunakokotoa nini cha kununua au kuuza ili kurudi kwenye mchanganyiko wako.",
    open: "Tayari ninawekeza",
    close: "Ficha",
    holding: "{bucket} unayomiliki sasa",
    newMoney: { label: "Pesa mpya ya kuongeza (si lazima)", hint: "Pesa mpya inaenda kwanza kwenye sehemu zilizo nyuma." },
    clear: "Futa ninachomiliki",
    total: "Jumla baada ya mabadiliko: {amount}",
    buy: "Nunua {amount}",
    sell: "Uza {amount}",
    none: "Hakuna mabadiliko",
    target: "Lengo {share}",
    drift: "Sasa {current}, {drift} kutoka lengo",
    points: "Pointi {value}",
    triggered: "Angalau sehemu moja iko mbali na lengo kwa zaidi ya {band}: ni wakati wa kusawazisha.",
    withinBand: "Kila sehemu iko ndani ya {band} ya lengo. Sawazisha mara moja kwa mwaka hata hivyo.",
    newMoneyOnly: "Pesa mpya pekee inaziba pengo: hakuna kinachohitaji kuuzwa.",
    sellNote: "Kuuza kunamaanisha gharama za kutoka na huenda kodi. Pale unapoweza, elekeza pesa mpya kwenye sehemu zilizo nyuma katika miezi ijayo badala yake.",
    why: "Kwa nini mabadiliko haya?",
  },

  netWorth: {
    inMix: "Iliyowekezwa kwenye mchanganyiko",
    property: "Mali isiyohamishika (nje ya mgawanyo)",
    total: "Thamani ya mali zako",
  },

  note: {
    capApplied: "Hisa zimebaki kwenye kikomo, hata muda wako uwe mrefu kiasi gani.",
    horizonNoEquity: "Unahitaji pesa hii ndani ya miaka mitano, kwa hiyo haina hisa. Hisa zinaweza kubaki chini kwa miaka.",
    horizonCashOnly: "Unahitaji pesa hii ndani ya mwaka mmoja, kwa hiyo inabaki kwenye amana fupi au hati za hazina tu.",
    propertyExcluded: "Mali isiyohamishika inahesabiwa kwenye thamani ya mali zako lakini si kwenye mgawanyo: haiwezi kununuliwa au kuuzwa kwa vipande vidogo wala kusawazishwa.",
    lowLosesValue: "Katika hali ya chini pesa inakua polepole kuliko bei, kwa hiyo inanunua kidogo kuliko ulichoweka.",
    noIndexFund: "Hakuna mfuko wa fahirisi, hatifungani ya dhahabu wala mfuko wa mali isiyohamishika unaouzwa hapa, kwa hiyo sehemu ya hisa inatumia mfuko wa wazi uliotawanywa na dhahabu inanunuliwa kama vipande au sarafu.",
    neverBreakCertificates: "Usitoe kamwe hati ya akiba mapema ili kusawazisha: riba inashuka sana katika miaka ya mwanzo. Tumia pesa mpya badala yake.",
    exitCosts: "Kabla ya kuuza, kagua gharama za kutoka, kodi ya gawio na bei ambayo sonara atalipa kwa dhahabu.",
  },

  gate: {
    noEmergencyFund: "Jaza akiba yako ya dharura kwanza. Pesa ya muda mrefu ambayo huenda ukalazimika kuiuza haraka si pesa ya muda mrefu.",
    cardDebt: "Lipa deni la kadi kwanza. Riba ya kadi ni kubwa mno kuliko faida ambayo uwekezaji wowote unaweza kupata.",
  },

  howto: {
    fixedIncome:
      "Hati za akiba za serikali zinauzwa kwenye matawi ya benki na posta zinazozitoa, hati za hazina na hatifungani kupitia dawati la dhamana za serikali la benki, na amana za muda maalum kwenye benki yoyote iliyosajiliwa. Beba kitambulisho chako cha taifa; kiasi kikubwa kinahitaji namba ya mlipakodi au uthibitisho wa ritani ya kodi.",
    equityFund:
      "Chagua mfuko wa wazi uliotawanywa na anza mpango wa kila mwezi na msimamizi wa mfuko au benki inayouza vipande vyake. Beba kitambulisho chako cha taifa na akaunti ya benki. Tawanya kwenye kampuni nyingi; usiweke kamwe sehemu hii kwenye hisa moja.",
    directShares:
      "Unahitaji akaunti ya udalali. Miliki angalau kampuni kumi kubwa katika sekta tano au zaidi, bila hisa moja kuzidi sehemu ya kumi ya sehemu hii. Tarajia kuzifuatilia mwenyewe.",
    gold: "Nunua vipande au sarafu za karati 22 kutoka kwa sonara aliye mwanachama wa chama cha masonara, na uhifadhi risiti. Mapambo yana gharama ya utengenezaji na yanauzwa tena kwa bei ndogo, kwa hiyo ni ya kuvaa, si ya kuwekeza.",
  },
};
