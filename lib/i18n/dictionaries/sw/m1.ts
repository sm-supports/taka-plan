import type { Dictionary } from "../../types";

/** M1 Emergency fund. `rule.*` covers M1_RULE_KEYS, `next.*` covers M1_NEXT_KEYS. */
export const m1: Dictionary["m1"] = {
  title: "Akiba ya dharura",
  intro: "Pesa unayoweza kuipata ndani ya siku moja au mbili kipato kikikatika au bili ikija. Ilingane na familia yako, si na kanuni moja ya jumla.",
  demo: "Namba za mfano kwa ajili ya kuonyesha tu. Majibu yako hayatumiki kwenye ukurasa huu.",

  section: {
    inputs: "Namba zako",
    result: "Akiba yako ya dharura",
    rules: "Kanuni za pesa hii",
    nextStep: "Hatua inayofuata",
  },

  input: {
    essentials: {
      label: "Matumizi muhimu ya mwezi",
      hint: "Kodi ya nyumba, chakula, huduma, usafiri, ada za shule, msaada kwa wazazi, EMI zilizopo.",
    },
    incomeType: {
      label: "Unavyopata kipato",
      hint: "Kipato cha kazi huru na biashara hakina uhakika sana, kwa hiyo akiba inaanza kubwa zaidi.",
    },
    dependents: {
      label: "Wanaokutegemea",
      hint: "Chagua wote wanaohusika.",
    },
    soleEarner: {
      label: "Je, wewe ndiye pekee unayeleta kipato nyumbani?",
      hint: "Kama hakuna mwingine anayeleta pesa, akiba inahitaji kudumu muda mrefu zaidi.",
    },
    hasHealthInsurance: {
      label: "Je, una bima ya afya?",
      hint: "Bila bima, bili ya hospitali inatoka kwenye akiba hii, kwa hiyo inakuwa kubwa zaidi.",
    },
    liquidSavings: {
      label: "Akiba unayoweza kuipata leo",
      hint: "Pesa taslimu, akaunti za akiba na amana unazoweza kutoa ndani ya siku chache. Si pesa iliyo kwenye {product}, hisa au dhahabu.",
    },
    months: {
      label: "Miezi ya kinga",
      hint: "Tunapendekeza mahali pa kuanzia; telezesha hadi kinachofaa familia yako, kuanzia miezi {min} hadi {max}.",
      suggested: "Pendekezo: {months}",
      useSuggested: "Tumia pendekezo",
    },
    buildMonths: {
      label: "Ijenge kwa muda wa",
      hint: "Miezi mingapi unataka kuchukua kujaza akiba.",
    },
  },

  result: {
    suggestedMonths: "Kinga inayopendekezwa: {months}",
    months: "Miezi ya kinga",
    target: "Lengo",
    saved: "Tayari imewekwa",
    gap: "Kilichobaki kuweka",
    monthlySaving: "Akiba ya kila mwezi",
    monthsCovered: "Miezi iliyolindwa",
    monthsCoveredOf: "{covered} kati ya miezi {months} imelindwa",
    monthsToFull: "Itajaa baada ya {months}",
    full: "Akiba yako ya dharura imejaa",
    tiers: {
      title: "Mahali pa kuiweka",
      savingsAccount: "Akaunti ya akiba ya siku hiyohiyo",
      savingsAccountHint: "Mahitaji muhimu ya mwezi mmoja unayoweza kutoa siku hiyohiyo.",
      fdrLadder: "Ngazi ya amana za miezi 3",
      fdrLadderHint: "Kinachobaki, katika amana tatu za muda maalum zilizofunguliwa kwa tofauti ya mwezi mmoja ili moja ikomae kila mwezi.",
      fdrPerSlice: "Kila amana",
      fdrSlices: "Amana tatu za {amount} kila moja, moja ikifunguliwa kila mwezi.",
      banksNeeded: "Benki za kugawanya",
      banksNeededHint: "Bima ya amana inalinda {limit} tu kwa kila benki, kwa hiyo usiweke zaidi ya hapo kwenye benki moja.",
      sanchayapatraLayer: "Tabaka la tatu: {product}",
      sanchayapatraLayerHint: "Akiba yako ni kubwa kiasi kwamba sehemu yake inaweza kukaa kwenye {product}, inayolipa zaidi lakini ina adhabu ukiitoa mapema.",
    },
  },

  rule: {
    noStocks: "Hakuna hisa wala mifuko ya hisa kwa pesa hii. Lazima iwepo, kwa thamani kamili, siku mbaya.",
    sanchayapatraThirdLayer: "{product} ni tabaka la tatu tu kwa akiba kubwa sana: inalipa zaidi, lakini kuitoa mapema kunakupotezea sehemu ya faida.",
    cardBridge: "Kadi ya mkopo inaweza kuziba siku moja au mbili zinazohitajika kutoa amana ya muda maalum — ikiwa tu unalipa bili yote ndani ya kipindi bila riba.",
    refill: "Umetumia akiba? Ijaze tena kabla ya kuweka pesa mahali pengine popote.",
    notAnEmergency: "Likizo, simu au zawadi ya harusi si dharura. Ziwekee akiba kama malengo.",
  },

  next: {
    openSavings: "Fungua akaunti ya akiba kwenye benki yoyote kwa kitambulisho chako cha taifa; hamishia humo mahitaji muhimu ya mwezi mmoja na weka uhamisho wa kudumu kwa kinachobaki.",
    fdrLadder: "Tembelea benki yoyote ukiwa na kitambulisho cha taifa na namba ya mlipakodi; omba {product} ya miezi 3. Fungua moja kila mwezi kwa miezi mitatu ili moja ikomae kila mwezi.",
    splitBanks: "Akiba yako ni kubwa kuliko kikomo cha bima ya amana kwa benki moja. Fungua amana za muda maalum kwenye benki ya pili ili hakuna benki inayoshika zaidi ya kikomo.",
    full: "Akiba yako imejaa. Endelea kuhuisha amana, na ijaze tena akiba baada ya kila utoaji kabla ya kuweka akiba mahali pengine.",
  },

  status: {
    red: "Chini ya mwezi mmoja umelindwa",
    amber: "Imelindwa kwa sehemu — endelea kujenga",
    green: "Imelindwa kikamilifu",
  },
};
