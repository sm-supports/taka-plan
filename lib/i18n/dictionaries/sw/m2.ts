import type { Dictionary } from "../../types";

/** Insurance & health screen (M2). `check.claimSettlement` takes {claimSettlement}; see ../en/m2.ts. */
export const m2: Dictionary["m2"] = {
  title: "Bima na afya",
  intro: "Kinga ya maisha na afya ambayo familia yako inahitaji, takriban gharama yake, na jinsi ya kukagua kampuni ya bima kabla ya kusaini.",
  demo: "Namba za mfano kwa ajili ya kuonyesha tu. Majibu yako hayatumiki kwenye ukurasa huu.",
  backToPlan: "Rudi kwenye mpango wangu",

  needProfile: {
    title: "Kwanza, maswali machache kukuhusu",
    body: "Ukaguzi huu unatumia umri wako, kipato chako na wanaokutegemea. Jibu maswali matano ya mwanzo, kisha urudi hapa.",
    cta: "Jibu maswali",
  },

  flow: {
    eyebrow: "Ukaguzi wa bima",
    smoker: {
      title: "Je, unavuta sigara au unatumia tumbaku?",
      hint: "Kampuni za bima huwatoza wavutaji zaidi kwa bima ya maisha, kwa hiyo makadirio ya bei yanategemea hili.",
    },
    lifeCover: {
      title: "Una bima ya maisha ya kiasi gani tayari?",
      hint: "Jumlisha kiasi cha bima cha kila sera ya maisha uliyonayo, ikiwemo bima kutoka kwa mwajiri wako. Andika 0 kama huna.",
      none: "Sina",
    },
    healthCover: {
      title: "Familia yako ina bima ya afya ya kiasi gani tayari?",
      hint: "Kikomo cha mwaka cha sera yako ya afya au ya mwajiri wako, kwa wote kwa pamoja. Andika 0 kama hamna.",
      none: "Hatuna",
    },
    people: {
      title: "Bima ya afya iwahusishe nani?",
      hint: "Tumejaza hili kutokana na wanaokutegemea. Libadilishe kama mtu mwingine anahitaji bima.",
    },
    seeResult: "Ona matokeo yangu",
  },

  section: {
    inputs: "Majibu yako",
    result: "Kinga ambayo familia yako inahitaji",
    notes: "Vizuri kujua",
  },

  input: {
    smoker: {
      label: "Je, unavuta sigara au unatumia tumbaku?",
      hint: "Wavutaji hulipa zaidi kwa bima ya maisha. Lieleze pia kwenye fomu yoyote ya maombi.",
    },
    existingLifeCover: {
      label: "Bima ya maisha uliyonayo tayari",
      hint: "Kiasi cha bima cha kila sera ya maisha uliyonayo, ikiwemo ya mwajiri wako. 0 kama huna.",
    },
    existingHealthCover: {
      label: "Bima ya afya ambayo familia inayo tayari",
      hint: "Kikomo cha mwaka cha kila sera ya afya, yako au ya mwajiri wako, kwa wote kwa pamoja. 0 kama hamna.",
    },
    people: {
      label: "Wanaohusishwa na bima ya afya",
      hint: "Chagua kila mtu anayepaswa kulindwa.",
    },
    childrenCount: {
      label: "Watoto wa kulindwa",
    },
    parentsCount: {
      label: "Wazazi wa kulindwa",
    },
    parentAge: {
      label: "Umri wa mzazi mkubwa zaidi",
      hint: "Bima ya afya hugharimu zaidi kadiri umri unavyoongezeka, kwa hiyo makadirio ya bei yanatumia hili.",
    },
    coverToAge: {
      label: "Bima ya maisha hadi umri wa",
      hint: "Familia nyingi huacha kutegemea kipato chako watoto wakishakua, kwa hiyo bima mara chache inahitaji kupita umri wa kustaafu.",
    },
    incomeShare: {
      label: "Sehemu ya kipato chako ambayo familia ingehitaji",
      hint: "Bila wewe baadhi ya gharama zinakoma, kwa hiyo familia inahitaji sehemu ya kipato chako, si chote.",
    },
    investments: {
      label: "Uwekezaji ambao familia ingeweza kuuza",
      hint: "Hisa, mifuko, hati za akiba au dhahabu. Akiba yako ya dharura tayari imehesabiwa.",
    },
    youngestChildAge: {
      label: "Umri wa mtoto wako mdogo zaidi (si lazima)",
      hint: "Bima ya maisha itadumu hadi mtoto huyo aweze kujitegemea, ikiwa hilo litatokea kabla ya umri ulio hapa chini.",
    },
  },

  person: {
    self: "Mimi",
    partner: "Mwenzi",
    child: "Watoto",
    parent: "Wazazi",
  },

  status: {
    red: "Pengo kubwa la kinga",
    amber: "Sehemu ya kinga haipo",
    green: "Umelindwa kwa sasa",
  },

  life: {
    title: "Bima ya maisha",
    label: "Bima ya maisha ambayo familia yako inahitaji",
    multiple: "Takriban mara {multiple} ya kipato chako cha mwaka",
    existing: "Bima uliyonayo tayari",
    gap: "Kilichobaki kununua",
    years: "Miaka ya kinga",
    yearsValue: "{years} (hadi umri wa {age})",
    incomeNeed: "Kufidia kipato chako",
    incomeNeedHint: "Kile familia ingehitaji kwa miaka hiyo, kwa pesa ya leo.",
    enough: "Bima uliyonayo inatosha kwa sasa.",
    notNeeded: "Bado haihitajiki",
    why: "Kwa nini bima ya maisha ya {amount}?",
    status: {
      red: "Sehemu kubwa ya kinga haipo",
      amber: "Sehemu ya kinga haipo",
      green: "Bima ya maisha inatosha",
    },
  },

  health: {
    title: "Bima ya afya",
    label: "Bima ya afya ya familia",
    caption: "Kwa watu {people}",
    captionOne: "Kwa mtu {people}",
    perPerson: "Kwa kila mtu mzima",
    perPersonHint: "Takriban gharama ya kulazwa hospitali mara moja.",
    existing: "Bima ambayo familia inayo tayari",
    gap: "Kilichobaki kununua",
    enough: "Bima ya afya ya familia inatosha kwa sasa.",
    why: "Kwa nini bima ya afya ya {amount}?",
    status: {
      red: "Sehemu kubwa ya kinga haipo",
      amber: "Sehemu ya kinga haipo",
      green: "Bima ya afya inatosha",
    },
  },

  premium: {
    title: "Huenda ikagharimu kiasi gani",
    monthly: "Tenga kila mwezi",
    caption: "Mpango wako unatenga kiasi hiki kwa bima hizi mbili.",
    captionNone: "Hakuna zaidi cha kutenga: bima uliyonayo inatosha kwa sasa.",
    captionHealth: "Mpango wako unatenga kiasi hiki kwa bima ya afya.",
    captionLife: "Mpango wako unatenga kiasi hiki kwa bima ya maisha ya muda.",
    life: "Bima ya maisha ya muda, kila mwaka",
    lifeHint: "Kwa kinga ya {gap}.",
    smokerHint: "Kwa kinga ya {gap}, kwa bei ya mvutaji.",
    health: "Bima ya afya, kila mwaka",
    healthHint: "Kwa kinga ya ziada ya {gap}.",
    range: "{low} – {high}",
    none: "Hakuna zaidi cha kununua",
    indicative: "Makadirio ya jumla, si nukuu za bei",
    why: "Kwa nini {amount} kwa mwezi?",
  },

  policy: {
    title: "Tayari unalipia sera ya aina ya akiba?",
    hint: "Sera inayokurudishia pesa mwishoni (sera ya endowment). Ona inavyolinganishwa na bima ya maisha ya muda tu.",
    intro: "Andika namba kutoka kwenye karatasi za sera yako. Tunalinganisha kile sera inacholipa mwishoni na kununua bima ya maisha ya muda ya kiasi hichohicho na kuweka sehemu iliyobaki ya ada kwenye amana salama.",
    annualPremium: {
      label: "Ada unayolipa kila mwaka",
    },
    sumAssured: {
      label: "Bima ya maisha ambayo sera inatoa",
      hint: "Kiasi cha bima kilichoandikwa kwenye sera.",
    },
    termYears: {
      label: "Muda kamili wa sera",
    },
    yearsPaid: {
      label: "Miaka uliyokwisha kulipa",
    },
    expectedMaturity: {
      label: "Kiasi ambacho sera inalipa mwishoni",
      hint: "Thamani ya ukomavu kwenye makadirio ya kampuni ya bima, pamoja na bonasi inayotarajiwa.",
    },
    surrenderValue: {
      label: "Kampuni ya bima ingelipa nini ukisitisha leo (si lazima)",
      hint: "Thamani ya kusitisha au thamani iliyolipwa; uliza kampuni ya bima. Bila hiyo, ulinganisho unaacha nje kile kusitisha kunarudisha.",
    },
    incomplete: "Jaza namba zote tano kuona ulinganisho.",
    keep: "Ukiendelea na sera",
    keepHint: "Inalipwa mwishoni mwa muda.",
    alternative: "Bima ya muda pamoja na kuweka akiba tofauti",
    alternativeHint: "Sehemu iliyobaki ya kila ada inaenda kwenye {instrument} kwa {years} zilizobaki.",
    atLeast: "Angalau {amount}",
    surrenderPart: "Inajumuisha {amount} kutoka thamani ya kusitisha, ikikua hadi mwisho.",
    termPremium: "Bima ya muda ya kiasi hichohicho, kila mwaka",
    remaining: "Miaka iliyobaki kulipa",
    irr: "Faida ya mwaka ya sera",
    irrHint: "Kile ada zako zinapata kila mwaka ikiwa sera italipa kama makadirio yake yanavyoonyesha.",
    verdict: {
      termPlusInvestAhead: "Kwa namba hizi, bima ya muda pamoja na kuweka akiba tofauti inaweza kukubakizia takriban {amount} zaidi mwishoni.",
      policyAhead: "Kwa namba hizi, sera inazidi bima ya muda pamoja na kuweka akiba tofauti kwa takriban {amount}.",
      similar: "Kwa namba hizi, njia zote mbili zinaishia karibu sawa.",
    },
    clear: "Futa namba hizi",
    why: "Kwa nini ulinganisho huu?",
  },

  checklist: {
    title: "Kagua kampuni ya bima kabla ya sera",
    intro: "Sera ni nzuri tu kwa kiwango cha madai ambayo kampuni ya bima inalipa. Pitia orodha hii kabla ya kusaini.",
    regulatorLink: "Mdhibiti wa bima: {name}",
    complaintsLink: "Mahali pa kulalamika: {name}",
  },

  note: {
    noDependents: "Hakuna anayetegemea kipato chako na huna madeni, kwa hiyo bado huhitaji bima ya maisha. Bima ya afya bado ni muhimu.",
    debtsOnly: "Hakuna anayetegemea kipato chako, kwa hiyo bima ya maisha inahitaji tu kulipa madeni yako, ili yasiiangukie familia yako.",
    publicCoverBroad: "Huduma ya afya ya umma inalipa bili nyingi za hospitali katika nchi yako, kwa hiyo tunakadiria bima yako ya afya kwa sehemu ndogo ya gharama ya kulazwa hospitali.",
    premiumIndicative: "Ada ni makadirio ya jumla kutoka majedwali ya bei ya kawaida, si nukuu. Bei yako inategemea afya yako, kampuni ya bima na sera.",
    noTermSold: "Hatuna jedwali la bei la bima ya maisha ya muda tu katika nchi yako, kwa hiyo ada ya bima ya maisha inaonyeshwa kama sifuri. Omba kampuni za bima nukuu ya bima ya muda.",
    separateInvesting: "Tenganisha bima na uwekezaji: bima ni gharama, kama kodi ya nyumba, na kuweka akiba kwa ajili ya baadaye kunafanyika peke yake.",
    policyNotAdvice: "Huu ni ulinganisho wa jumla, si ushauri wa kusitisha au kuendelea na sera yoyote. Kusitisha sera mapema mara nyingi kunapoteza pesa, kwa hiyo uliza kampuni ya bima utapata nini kabla ya kubadilisha chochote.",
    policyNoSurrender: "Hukuweka kile kampuni ya bima ingerudisha ukisitisha leo, kwa hiyo tunakihesabu kama sifuri. Kusitisha kunaonekana kubaya hapa kuliko kulivyo kweli: omba kampuni ya bima thamani ya kusitisha na uiongeze.",
    policyMatured: "Kila ada ya sera hii tayari imelipwa, kwa hiyo hakuna kilichobaki cha kulinganisha. Chukua thamani ya ukomavu wakati wake ukifika.",
    multipleOutsideBand: "Kanuni ya kawaida ni bima ya maisha ya mara kumi hadi kumi na tano ya kipato chako halisi cha mwaka. Yako iko nje ya kiwango hicho kwa sababu ya familia, madeni na akiba yako; kiasi kilicho juu kimekokotolewa kwa ajili yako.",
    noHealthPriceTable: "Hatuna jedwali la bei la bima ya afya katika nchi yako, kwa hiyo ada ya bima ya afya inaonyeshwa kama sifuri. Omba kampuni za bima nukuu ya kinga iliyo juu.",
  },

  check: {
    regulator: "Hakikisha kampuni ya bima imepewa leseni na mdhibiti wa bima. Itafute kwenye tovuti ya mdhibiti kabla ya kusaini.",
    claimSettlement: "Uliza kampuni ya bima inalipa asilimia ngapi ya madai. Kwa kampuni za bima ya maisha hapa ni takriban {claimSettlement}; chagua inayolipa juu ya kiwango hicho kwa kiasi kikubwa.",
    complaints: "Jua mahali pa kulalamika. Dai likikataliwa au kucheleweshwa bila sababu wazi, dawati la malalamiko la mdhibiti linaweza kuingilia kati.",
    waitingPeriods: "Soma vipindi vya kusubiri. Sera nyingi za afya hazilipii baadhi ya magonjwa katika mwaka wa kwanza au wa pili.",
    exclusions: "Soma orodha ya yasiyolindwa kabla ya kusaini, si baada ya dai.",
    cashlessNetwork: "Kagua hospitali zipi zinapokea sera bila wewe kulipa kwanza, zikiwemo hospitali zilizo karibu na familia yako.",
    honestProposal: "Jibu kila swali kwenye fomu ya maombi kwa ukweli, ikiwemo uvutaji sigara na magonjwa ya zamani. Jibu lisilo sahihi ndiyo sababu kuu ya madai kukataliwa.",
    buyYoung: "Nunua mapema. Ada ni ndogo ukiwa kijana na mwenye afya, na ugonjwa wa baadaye unaweza kufanya bima iwe vigumu kupata.",
    medicalTests: "Tarajia vipimo vya afya kwa bima kubwa. Vifanye: vinalinda dai lako baadaye.",
  },
};
