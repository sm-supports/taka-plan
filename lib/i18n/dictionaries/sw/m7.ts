import type { Dictionary } from "../../types";

/** Retirement & family screen (M7, "Plan to 100"). Tone: independence and dignity, never fear. */
export const m7: Dictionary["m7"] = {
  title: "Kustaafu na familia",
  intro: "Kiasi cha kuweka kando ili uishi kwa pesa yako mwenyewe, kwa masharti yako mwenyewe, hadi miaka 100.",
  introRetired: "Kiasi unachoweza kutoa kwenye akiba yako kila mwezi ili pesa yako idumu, kwa masharti yako mwenyewe, hadi miaka 100.",
  demo: "Namba za mfano kwa ajili ya kuonyesha tu. Majibu yako hayatumiki kwenye ukurasa huu.",

  flow: {
    mode: {
      title: "Bado unafanya kazi, au tayari umestaafu?",
      hint: "Ukiwa kazini, tunakokotoa kiasi cha kuweka kando kila mwezi. Ukiwa umestaafu, tunakokotoa unachoweza kutoa kila mwaka.",
    },
    age: {
      title: "Una umri gani?",
      hint: "Kutoka kwenye mpango wako. Ubadilishe kama si sahihi.",
      label: "Umri wako",
    },
    retirementAge: {
      title: "Ungependa kuacha kazi ukiwa na umri gani?",
      hint: "Kazi nyingi za sekta binafsi zinaisha ukiwa na miaka {age}. Chagua umri unaofaa kazi na afya yako.",
      label: "Umri wa kustaafu",
    },
    spending: {
      title: "Kaya yako inatumia kiasi gani kwa mwezi leo?",
      hint: "Kwa pesa ya leo. Tumeanza na matumizi yako muhimu; ongeza chochote ambacho bado ungelipia baada ya kuacha kazi.",
      label: "Matumizi ya kaya kwa mwezi",
    },
    savings: {
      title: "Umeweka akiba na kuwekeza kiasi gani hadi sasa?",
      hint: "Akiba, amana, {product}, mifuko na hisa ambazo ungezitunza kwa maisha ya baadaye. Si nyumba yako, na si mfuko wako wa akiba ya wafanyakazi (huo unakuja baadaye).",
      label: "Akiba na uwekezaji leo",
    },
    monthlySaving: {
      title: "Unaweka kando kiasi gani kila mwezi sasa?",
      hint: "Pesa iliyotengwa kwa maisha ya baadaye tu. Sifuri ni jibu zuri: hapa ndipo mpango unaanzia.",
      label: "Akiba ya mwezi sasa",
    },
    sex: {
      title: "Wewe ni mwanamume au mwanamke?",
      hint: "Si lazima. Wanawake huishi takriban miaka miwili zaidi kwa wastani, na posho ya wazee inaanza katika umri tofauti.",
      skip: "Ruka swali hili",
    },
    retireeType: {
      title: "Ulistaafu kutoka kazi ya serikali au binafsi?",
      hint: "Wastaafu wa serikali, mashirika ya umma na majeshi wanaweza kutumia hati ya akiba iliyo wazi kwao tu.",
    },
    retiredSavings: {
      title: "Una akiba gani sasa?",
      hint: "Malipo yako ya mfuko wa akiba ya wafanyakazi na kiinua mgongo, amana za muda maalum, hati za akiba na chochote kingine unachoishi nacho.",
      label: "Akiba sasa",
    },
    otherIncome: {
      title: "Nini kingine kinaingia kila mwezi?",
      hint: "Pensheni, kodi ya pango au chochote kingine mbali na akiba yako. Acha sifuri kama hakuna.",
      label: "Kipato kingine kwa mwezi",
    },
    retiredSpending: {
      title: "Kaya yako inatumia kiasi gani kwa mwezi?",
      hint: "Kila kitu, ikiwemo dawa na msaada wa nyumbani.",
      label: "Matumizi ya kaya kwa mwezi",
    },
    seeResult: "Ona mpango wangu hadi 100",
  },

  mode: {
    working: "Bado nafanya kazi",
    workingHint: "Pata akiba ya kila mwezi inayodumu hadi 100",
    retired: "Tayari nimestaafu",
    retiredHint: "Pata kiasi cha kutoa kila mwaka kinachodumu hadi 100",
  },
  sex: {
    male: "Mwanamume",
    female: "Mwanamke",
    unknown: "Sipendi kusema",
  },
  retireeType: {
    government: "Serikali",
    governmentHint: "Serikali, mashirika ya umma au majeshi",
    private: "Binafsi au kujiajiri",
    privateHint: "Kazi ya kampuni, biashara au kazi huru",
  },

  section: {
    inputs: "Namba zako",
    sources: "Kipato baada ya kuacha kazi",
    result: "Mpango wako",
  },

  input: {
    mode: "Kazini au umestaafu",
    age: {
      label: "Umri wako",
      hint: "Ukiubadilisha hapa, unabadilika pia kwenye mpango wako.",
    },
    sex: {
      label: "Mwanamume au mwanamke (si lazima)",
      hint: "Inatumika kwa maelezo mawili tu: wanawake huishi muda mrefu zaidi kwa wastani, na umri wa posho ya wazee.",
    },
    retirementAge: {
      label: "Umri wa kustaafu",
      hint: "Umri wa kawaida hapa ni {age}.",
    },
    planToAge: {
      label: "Panga hadi umri wa",
      hint: "Tunapanga hadi 100 kwa chaguo-msingi. Unaweza kupunguza hadi {min}, si chini ya hapo, au kuongeza hadi {max}.",
    },
    spending: {
      label: "Matumizi ya kaya kwa mwezi, leo",
      hint: "Kwa pesa ya leo; tunayaongeza kulingana na bei hadi mwaka utakaoacha kazi.",
    },
    savings: {
      label: "Akiba na uwekezaji leo",
      hint: "Zilizotunzwa kwa maisha ya baadaye. Si nyumba yako, si mfuko wako wa akiba ya wafanyakazi.",
    },
    monthlySaving: {
      label: "Akiba ya mwezi sasa",
      hint: "Unachoweka kando tayari kwa maisha ya baadaye.",
    },
    retireeType: "Ulikostaafu",
    retiredSavings: {
      label: "Akiba sasa",
      hint: "Kila kitu unachoishi nacho: malipo ya kustaafu, amana za muda maalum, hati za akiba.",
    },
    otherIncome: {
      label: "Kipato kingine kwa mwezi",
      hint: "Pensheni, kodi ya pango au chochote kingine mbali na akiba yako.",
    },
  },

  sources: {
    intro: "Ongeza unachotarajia kuwa nacho. Kila kimoja kinapunguza unachohitaji kuweka akiba.",
    add: "Ongeza",
    remove: "Ondoa",
    notCounted: "Hakihesabiwi",
    lowered: "Vyanzo vyako vya kipato vinapunguza akiba ya kila mwezi kwa {amount}.",
    retiredIntro: "Kipato chako kingine tayari kimehesabiwa juu. Hivi viwili vinaonyeshwa kwa picha kamili tu, havihesabiwi kamwe.",
    pf: {
      title: "Mfuko wa akiba ya wafanyakazi",
      hint: "Unakua kwa kiwango cha mfuko wenyewe, kisha unalipwa kwa mkupuo unapoacha kazi.",
      balance: "Salio leo",
      contribution: "Kinachochangiwa kila mwezi (sehemu yako pamoja na ya mwajiri)",
      contributionHint: "Waajiri wakubwa sasa huchangia takriban sawa na wewe; kagua hati yako ya mshahara.",
      rate: "Kiwango cha mwaka cha mfuko",
      rateHint: "Kutoka taarifa ya mwaka ya mfuko wako. Hatukisii kamwe kimoja, kwa sababu mifuko inatofautiana.",
    },
    gratuity: {
      title: "Kiinua mgongo",
      hint: "Mkupuo unapoondoka: siku za mshahara wa msingi wa mwisho kwa kila mwaka wa huduma, kama sheria inavyoeleza au kanuni ya mwajiri wako ikiwa ni bora zaidi.",
      years: "Miaka ya huduma utakapoacha",
      basic: "Mshahara wa msingi wa mwisho kwa mwezi",
      employerDays: "Siku za mwajiri wako kwa mwaka (ikiwa tu ni zaidi ya sheria)",
      employerDaysHint: "Acha tupu kutumia kanuni ya sheria.",
    },
    pension: {
      title: "Mpango wa pensheni wa umma",
      hint: "Unalipwa maisha yote kama kiasi kisichobadilika, kwa hiyo unanunua kidogo kila mwaka. Tunauthaminisha hivyo.",
      scheme: "Mpango: {name}",
      contribution: "Mchango wako kwa mwezi",
      expected: "Pensheni ya mwezi unayotarajia (kama unaijua)",
      expectedHint: "Acha tupu na tutatumia makadirio rasmi ya mpango.",
    },
    fixedPension: {
      title: "Pensheni nyingine isiyobadilika",
      hint: "Pensheni yoyote isiyopanda kulingana na bei.",
      label: "Pensheni kwa mwezi",
    },
    rent: {
      title: "Kodi ya pango unayopokea",
      hint: "Kodi ya pango kwa kawaida hupanda kulingana na bei, kwa hiyo inatolewa moja kwa moja kwenye matumizi yako.",
      label: "Kodi ya pango kwa mwezi, leo",
    },
    allowance: {
      title: "Posho ya wazee",
      hint: "Posho ndogo ya serikali kulingana na hali ya kipato. Inaonyeshwa kwa picha kamili tu, haihesabiwi kamwe kwenye mpango.",
      label: "Je, unaweza kustahili?",
      amount: "Takriban {amount} kwa mwezi kuanzia umri wa {age}",
    },
    family: {
      title: "Msaada kutoka kwa familia",
      hint: "Msaada wa watoto unakaribishwa, lakini watakuwa na gharama zao. Ni ziada, si mpango.",
      label: "Msaada wa mwezi unaoweza kupata",
    },
  },

  result: {
    headline: "Weka kando kila mwezi",
    caption: "ili pesa yako idumu hadi {planTo}. Lengo utakapoacha kazi ukiwa na miaka {retirementAge}: {corpus}.",
    funded: "Ulichonacho tayari kinatosha lengo hadi {planTo}. Endelea kukiwekeza.",
    currentSaving: "Unaweka kando {amount} kwa mwezi sasa.",
    mixUsed: "Kabla ya kuacha kazi, akiba yako inakua kwa faida za mchanganyiko wako wa mali.",
    contrast: {
      title: "Kupanga hadi {contrast} au hadi {planTo}",
      to: "Hadi umri wa {age}",
      target: "Lengo",
      monthly: "Kwa mwezi",
      extra: "Ziada ya {amount} kwa mwezi inalipia miaka {years} zaidi ya kuishi kwa pesa yako mwenyewe, kutoka {contrast} hadi {planTo}.",
      noExtra: "Akiba yako tayari inatosha miaka baada ya {contrast}.",
      footnote: "{contrast} inaonyeshwa kwa kulinganisha tu: watu wengi huishi zaidi ya hapo.",
    },
    range: {
      title: "Kulingana na faida",
      low: "Faida ikiwa ndogo",
      base: "Hali yetu ya msingi",
      high: "Faida ikiwa kubwa",
      hint: "Makadirio ya muda mrefu hayawi sahihi kamwe; tunaonyesha kiwango na kuzungusha kila namba.",
    },
    chart: {
      title: "Pesa yangu ingedumu muda gani?",
      hint: "Akiba yako kwa kiasi unachoweka kando sasa, mwaka kwa mwaka, kwa pesa ya kila mwaka.",
      label: "Akiba kuanzia umri wa {from} hadi {to}: juu kabisa {peak} katika umri wa {peakAge}. {verdict}.",
      axisAge: "Umri",
      retire: "Kuacha kazi",
    },
    verdict: {
      onTrack: "Uko sawa hadi umri wa {age}",
      lastsTo: "Inadumu hadi umri wa {age}",
      runsOut: "Inaisha ukiwa na miaka {age}",
    },
    shift: {
      title: "Kuanza miaka {years} mapema au baadaye kunabadilisha nini",
      earlier: "Kama ungeanza ukiwa na miaka {age}",
      later: "Ukianza ukiwa na miaka {age}",
      now: "Ukianza sasa, ukiwa na miaka {age}",
      perMonth: "{amount} kwa mwezi",
      notPossible: "Karibu mno na kustaafu",
      hint: "Matumizi, akiba na umri wa kustaafu ni yaleyale; mwanzo tu unasogea.",
    },
    income: {
      title: "Vyanzo vyako vinaongeza nini",
      pf: "Mfuko wa akiba ya wafanyakazi unapoacha kazi",
      gratuity: "Kiinua mgongo",
      pensions: "Pensheni zisizobadilika, zikithaminishwa unapoacha kazi",
      publicPension: "Pensheni ya umma kwa mwezi",
      rent: "Kodi ya pango kwa mwaka unapoacha kazi",
      allowance: "Posho ya wazee kwa mwezi",
      family: "Msaada kutoka kwa familia kwa mwezi",
    },
    addSources: "Ongeza vyanzo vyako vya kipato",
    editAnswers: "Badilisha majibu yako",
  },

  retired: {
    headline: "Unaweza kutoa kila mwezi",
    caption: "Hiyo ni {firstYear} katika mwaka wa kwanza, ikipanda kulingana na bei kila mwaka unaofuata, na inadumu hadi {planTo}.",
    chartHint: "Akiba yako mwaka kwa mwaka kwa utoaji ulio juu, kwa pesa ya kila mwaka.",
    range: {
      title: "Unachoweza kutoa, kulingana na faida",
      low: "Faida ikilingana tu na mfumuko wa bei",
      hint: "Makadirio ya muda mrefu hayawi sahihi kamwe; tunaonyesha kiwango na kuzungusha kila namba.",
    },
    runsOut: "Kwa matumizi yako ya {spending} kwa mwezi kutoka akiba, pesa ingedumu hadi takriban {age}.",
    lasts: "Kwa matumizi yako ya {spending} kwa mwezi kutoka akiba, pesa inadumu hadi {planTo}.",
    target: {
      title: "Akiba inayohitajika kwa matumizi yako",
      hint: "Kile matumizi yako kutoka akiba yanahitaji, hadi {contrast} na hadi {planTo}.",
    },
    pot: {
      title: "Kanuni ya vyungu viwili",
      body: "Weka {amount} — utoaji wa miaka {years} — kwenye amana za muda maalum na hati za hazina unazoweza kufikia haraka. Kinachobaki kinabaki kimewekezwa na kujaza chungu hiki mara moja kwa mwaka.",
    },
    options: {
      title: "Njia za kugeuza akiba kuwa kipato thabiti",
      localName: "Hapa: {name}",
    },
  },

  bucket: {
    title: "Pesa hii iende wapi?",
    body: "Pesa ya maisha ya baadaye inahitaji mahali panapodumu kuliko kampuni yoyote moja. Pale ambapo hakuna mfuko mpana wa fahirisi unaouzwa, mpango unajenga kitu kilicho karibu zaidi kwa sehemu tatu: mfuko wa wazi uliotawanywa kupitia mpango wa kila mwezi kwa ukuaji; kipato kinachodhaminiwa na serikali kama mpango wa pensheni wa umma, hati za akiba na hatifungani za serikali; na mchanganyiko unaokuwa salama zaidi kila mwaka unapokaribia {retirementAge}.",
    bodyRetired: "Pesa ya maisha yako yote yaliyobaki inahitaji mahali panapodumu kuliko kampuni yoyote moja. Weka utoaji wa miaka michache ijayo kwenye amana na hati za hazina unazoweza kufikia haraka, na kinachobaki kwenye kipato kinachodhaminiwa na serikali kama hati za akiba na hatifungani za serikali, na sehemu ndogo kwenye mfuko wa wazi uliotawanywa kwa ukuaji.",
    lock: "Iwekee pesa hii alama “si kabla ya {retirementAge}” na usiiguse hadi wakati huo.",
    link: "Ona mchanganyiko wako wa mali",
  },

  lifeTable: {
    title: "Watu huishi muda gani baada ya miaka 60",
    hint: "Wastani wa miaka iliyobaki katika kila umri. Nusu ya watu huishi zaidi ya wastani, ndiyo maana mpango hausimami hapo.",
    age: "Umri",
    total: "Wastani",
    men: "Wanaume",
    women: "Wanawake",
    projected: "Makadirio",
    source: "{source}, {date}",
  },
  supportRatio: "Mwaka {fromYear} kulikuwa na watu {fromValue} wa umri wa kufanya kazi kwa kila mzee mmoja. Kufikia {toYear} watakuwa takriban {toValue}, kwa hiyo panga kwa pesa yako mwenyewe kwanza.",

  notes: {
    title: "Vizuri kujua",
  },
  backToPlan: "Rudi kwenye mpango wangu",

  note: {
    planTo100: "Mpango unaenda hadi 100 kwa chaguo-msingi kwa sababu watu wengi wanaofikia miaka 60 huishi zaidi ya 80. Unaweza kuupunguza, lakini si chini ya 85.",
    lifeAt60: "Matarajio ya kuishi tangu kuzaliwa yanachanganya kila umri kuanzia utotoni, kwa hiyo yanaonekana madogo. Mtu anayefikia miaka 60 anaweza kutarajia takriban miaka ishirini zaidi kwa wastani, na nusu huishi zaidi.",
    womenLiveLonger: "Wanawake huishi takriban miaka miwili zaidi kwa wastani, kwa hiyo mpango wa wanandoa unapaswa kufunika kustaafu kurefu zaidi kwa mke.",
    familyNotCounted: "Msaada kutoka kwa familia hauhesabiwi kamwe: watoto wako watakuwa na familia na gharama zao. Uchukulie kama ziada, si mpango.",
    allowanceNotCounted: "Posho ya wazee inaonyeshwa lakini haihesabiwi kamwe: ni ndogo, inategemea hali ya kipato na inaweza kubadilika.",
    pensionFixed: "Pensheni inayolipwa kama kiasi kisichobadilika inanunua kidogo kila mwaka bei zinapopanda, kwa hiyo inathaminishwa hivyo.",
    pensionEntryClosed: "Mpango wa pensheni wa umma unapokea wanachama wapya hadi umri wake wa kujiunga tu, kwa hiyo hauhesabiwi kwako.",
    supportRatio: "Watu wachache wa umri wa kufanya kazi watamsaidia kila mzee katika miongo ijayo, kwa hiyo akiba yako mwenyewe ni muhimu zaidi.",
    lock: "Tunza pesa hii kwa maisha ya baadaye tu. Kuigusa mapema ndiyo sababu kuu ya mpango kupungukiwa.",
    startEarlier: "Kuanza mapema kunapunguza kiasi cha kila mwezi sana, kwa sababu pesa inapata muda mrefu zaidi wa kukua.",
    noStatutoryGratuity: "Hatuna sheria ya kiinua mgongo kwenye kumbukumbu kwa nchi yako, kwa hiyo siku za mwajiri wako pekee ndizo zinahesabiwa. Kagua mkataba wako au muulize mwajiri wako.",
    lowCaseInflation: "Hali ya chini inachukulia kuwa pesa yako inaendana tu na bei wakati wa kustaafu, bila faida halisi juu yake.",
  },

  option: {
    pensionerCertificate: "Hati ya akiba ya wastaafu: faida ya kila mwezi, kwa wastaafu wa serikali, mashirika ya umma na majeshi tu, hadi kikomo fulani.",
    savingsCertificate: "Hati ya akiba ya serikali: faida isiyobadilika inayodhaminiwa na serikali.",
    tbonds: "Hatifungani za serikali: zinadhaminiwa na serikali, zikiwa na riba isiyobadilika kila miezi sita.",
    depositLadder: "Ngazi ya amana: amana zinazokomaa moja baada ya nyingine, ili pesa fulani iwe huru kila mwaka.",
    annuity: "Malipo ya maisha yote (annuity) kutoka kampuni ya bima ya serikali: pensheni ya maisha yote hata uishi muda gani. Upande wa pili: pesa haiwezi kurithishwa.",
  },
};
