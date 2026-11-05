import type { Dictionary } from "../../types";

/** M3 Debt health check. `path.*` covers M3_PATH_KEYS, `flag.<DebtFlagId>` covers every DebtFlagId. */
export const m3: Dictionary["m3"] = {
  title: "Ukaguzi wa madeni",
  intro: "Orodhesha kila mkopo na kadi kwa riba yake. Lipa la gharama kubwa zaidi kwanza, na usikope kamwe kwa ajili ya starehe.",

  input: {
    takeHome: { label: "Kipato halisi cha mwezi", hint: "Kinachoingia kwenye akaunti yako kila mwezi." },
    essentials: { label: "Matumizi muhimu ya mwezi", hint: "Kodi ya nyumba, chakula, huduma, usafiri, ada za shule, msaada kwa wazazi." },
    savingsTarget: { label: "Akiba ya mwezi", hint: "Kiasi chako cha akiba-kwanza kutoka kwenye bajeti. Kinatengwa kabla ya EMI yoyote." },
    cashBuffer: { label: "Akiba ya pesa taslimu", hint: "Nafasi kidogo kila mwezi kwa yasiyotarajiwa. Tunapendekeza sehemu ya kipato halisi; ibadilishe ukipenda." },
    extraMonthly: { label: "Ziada kwa madeni kila mwezi", hint: "Chochote juu ya malipo yako ya chini. Acha tupu kutumia nafasi yoyote uliyonayo." },
    loans: {
      title: "Mikopo",
      add: "Ongeza mkopo",
      remove: "Ondoa mkopo",
      empty: "Hakuna mkopo ulioongezwa.",
      type: { label: "Aina ya mkopo", hint: "Chagua inayokaribiana zaidi; inabadilisha jina tu." },
      outstanding: { label: "Kiasi bado unachodaiwa", hint: "Deni la msingi lililobaki leo, kutoka taarifa yako ya karibuni." },
      annualRate: { label: "Riba (kwa mwaka)", hint: "Riba iliyo kwenye mkataba au taarifa ya mkopo wako." },
      emi: { label: "EMI ya mwezi", hint: "Kiasi kisichobadilika unacholipa kila mwezi." },
      monthsLeft: { label: "Miezi iliyobaki", hint: "Marejesho bado ya kulipa." },
    },
    cards: {
      title: "Kadi za mkopo",
      add: "Ongeza kadi",
      remove: "Ondoa kadi",
      empty: "Hakuna kadi iliyoongezwa.",
      balance: { label: "Salio unalodaiwa", hint: "Kiasi kilicho kwenye taarifa yako ya karibuni." },
      limit: { label: "Kikomo cha kadi", hint: "Kiwango cha juu benki inachokuruhusu kutumia." },
      annualRate: { label: "Riba (kwa mwaka)", hint: "Acha tupu kutumia riba ya kisheria au ya kawaida ya kadi." },
      paysInFull: { label: "Je, unalipa bili yote kila mwezi, ndani ya kipindi bila riba?", hint: "Kama ndiyo, kadi haikugharimu chochote. Kama hapana, ndiyo pesa ghali zaidi uliyonayo." },
    },
    scenario: {
      title: "Ningeweza kukopa kiasi gani?",
      annualRate: { label: "Riba ya mkopo (kwa mwaka)", hint: "Riba uliyotajiwa na benki, au chaguo-msingi letu kwa mkopo binafsi." },
      months: { label: "Muda wa kurejesha", hint: "Kwa miezi." },
    },
  },

  result: {
    totalEmi: "Jumla ya EMI za mwezi",
    emiRatio: "EMI kama sehemu ya kipato halisi",
    emiCapacity: "Uwezo wa EMI",
    emiCapacityHint: "Kinachobaki kwa EMI baada ya akiba, mahitaji muhimu na akiba ya pesa taslimu.",
    headroom: "Nafasi iliyobaki",
    headroomHint: "Uwezo wa EMI ukitoa EMI unazolipa tayari.",
    maxAffordableLoan: "Mkopo mkubwa unaoweza kumudu",
    scenario: "Kwa {rate} kwa muda wa {months}",
    scenarioEmi: "EMI ya mwezi kwa mkopo huu",
    flags: "Tahadhari",
    noFlags: "Hakuna tahadhari. Madeni yako yako chini ya udhibiti.",
    noDebt: "Hakuna mikopo wala kadi. Hakuna cha kurekebisha hapa — endelea hivyo.",
    highInterestDebts: "Madeni ya riba zaidi ya {threshold} kwa mwaka",
    payoffOrder: "Mpangilio wa kulipa",
    payoffOrderHint: "Riba kubwa zaidi kwanza. Lipa kiwango cha chini kwa mengine yote na peleka kila senti ya ziada kwenye deni lililo juu ya orodha.",
    avalanche: "Riba kubwa zaidi kwanza",
    snowball: "Salio dogo zaidi kwanza",
    interestSaved: "Riba unayookoa kwa kuanza na riba kubwa zaidi",
    payoffMonths: "Bila deni baada ya {months}",
    totalInterest: "Jumla ya riba",
    minPayment: "Malipo ya chini",
    path: "Ukijihisi umenaswa",
    emiRatioNote: "Wakopeshaji huweka vikomo vyao wenyewe. Tunatahadharisha chochote zaidi ya {threshold} ya kipato halisi kwa sababu kinachobaki ni kidogo kwa akiba au kuhimili mshtuko.",
    maxLoanNote: "Fomula kamili inatoa takriban {loan} kwa EMI ya mwezi ya {emi} kwa {rate} kwa muda wa {months}. Benki pia huangalia kipato na rekodi yako, kwa hiyo ongeza tahadhari yako mwenyewe kabla ya kukopa.",
    primaryFlag: "Ya haraka zaidi",
    otherFlags: "Pia inafaa kurekebisha",
    cardLabel: "Kadi ya mkopo",
    extraUsed: "Ziada kwa madeni: {amount} kwa mwezi",
    compare: "Ukilinganisha na salio dogo zaidi kwanza",
    numbers: "Namba zako",
    borrow: "Ningeweza kukopa kiasi gani?",
  },

  profile: {
    title: "Kutoka kwenye wasifu wako",
    hint: "Ukibadilisha hizi, mpango wako unasasishwa pia.",
  },

  demoBanner: "Namba za mfano. Ongeza mikopo na kadi zako kuona hali yako halisi.",

  flag: {
    card_carried: {
      title: "Salio la kadi limepita tarehe ya kulipa",
      body: "Riba ya salio la kadi linalobaki ni takriban {rate} kwa mwaka — pesa ghali kuliko zote. Lilipe hili kabla ya deni lingine lolote.",
    },
    card_utilisation: {
      title: "Matumizi ya kadi zaidi ya {threshold} ya kikomo",
      body: "Unatumia {value} ya kikomo cha kadi yako. Yaweke chini ya nusu: hilo linapunguza bili, linalinda rekodi yako ya mikopo na linaacha nafasi kwa dharura ya kweli.",
    },
    emi_ratio: {
      title: "EMI zaidi ya {threshold} ya kipato halisi",
      body: "{value} ya kipato chako halisi inaenda kwenye EMI. Wakopeshaji huweka vikomo vyao wenyewe; tunatahadharisha chochote zaidi ya {threshold} kwa sababu kinachobaki ni kidogo kwa akiba au kuhimili mshtuko.",
    },
    negative_capacity: {
      title: "Hakuna nafasi kwa EMI yoyote",
      body: "Baada ya akiba, mahitaji muhimu na akiba ya pesa taslimu, hakuna kinachobaki kwa marejesho ya mkopo. Punguza matumizi, ongeza kipato au panga upya deni kabla ya kukopa zaidi.",
    },
  },

  path: {
    listLoans: "Andika kila mkopo na kadi: kiasi unachodaiwa, riba na malipo ya mwezi. Panga kwa riba, kubwa zaidi kwanza.",
    tellFamily: "Iambie familia yako. Kuficha deni kunalikuza; familia inayojua inaweza kupunguza matumizi pamoja.",
    stopBorrowing: "Acha kukopa kwa namna yoyote mpya, ikiwemo matumizi ya kadi usiyoweza kulipa yote mwezi huu.",
    sellUnaffordable: "Uza chochote ulichonunua kwa mkopo ambacho hukuweza kumudu kweli — pikipiki, simu, kifaa — na peleka pesa kwenye deni la gharama kubwa zaidi.",
    refinanceCheaper: "Hamisha deni kwenye mkopo mpya pale tu mkopo huo una gharama ndogo zaidi kwa wazi baada ya ada, na kamwe si ili kupata nafasi ya kutumia zaidi.",
  },

  status: {
    red: "Deni ghali linahitaji hatua sasa",
    amber: "Linamudika, lakini lifuatilie",
    green: "Madeni chini ya udhibiti",
  },
};
