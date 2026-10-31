// Input names per step are documented in ../en/explain.ts; the placeholders here must match.
import type { Dictionary } from "../../types";
import { explainM2 } from "./explain-m2";
import { explainM6 } from "./explain-m6";
import { explainM7 } from "./explain-m7";

export const explain: Dictionary["explain"] = {
  m2: explainM2,
  m6: explainM6,
  m7: explainM7,
  m1: {
    months: {
      title: "Miezi ya kinga",
      body: "Tunaanza na miezi {base}. Kipato kisicho cha kawaida kinaongeza {bumpIrregular}, kuwa mpokeaji kipato pekee mwenye wanaokutegemea kunaongeza {bumpSoleEarner}, na kutokuwa na bima ya afya kunaongeza {bumpNoHealth}. Pendekezo linabaki kati ya miezi {min} na {max}: {result}. Kitelezi ni chako kukisogeza.",
    },
    target: {
      title: "Lengo la akiba ya dharura",
      body: "Mahitaji yako muhimu ya mwezi mara miezi ya kinga: {essentials} × {months} = {result}. Mahitaji muhimu tu ndiyo yanahesabiwa, kwa sababu wakati wa dharura kila kitu kingine kinasimama.",
    },
    gap: {
      title: "Kilichobaki kuweka",
      body: "Lengo ukitoa unachoweza kupata leo tayari: {target} − {saved} = {result}. Haishuki chini ya sifuri; akiba kubwa kuliko ilivyopangwa ni sawa.",
    },
    monthly: {
      title: "Akiba ya kila mwezi",
      body: "Pengo likigawanywa kwa miezi uliyochagua kuijenga: {gap} ÷ {buildMonths} = {result} kwa mwezi.",
    },
    covered: {
      title: "Miezi iliyolindwa",
      body: "Akiba yako ya sasa ingebeba miezi mingapi ya mahitaji muhimu: {saved} ÷ {essentials} = {result}.",
    },
    tier1: {
      title: "Tabaka la 1: akaunti ya akiba ya siku hiyohiyo",
      body: "Mahitaji muhimu ya mwezi mmoja yanabaki kwenye akaunti ya akiba unayoweza kutoa leo: {essentials} = {result}. Hii ndiyo pesa ya wiki ya kwanza ya dharura yoyote.",
    },
    tier2: {
      title: "Tabaka la 2: ngazi ya FDR za miezi 3",
      body: "Kila kitu juu ya tabaka la 1 kinaenda kwenye FDR: {target} − {tier1} = {result}, kikigawanywa katika FDR tatu zilizofunguliwa kwa tofauti ya mwezi mmoja ili moja ikomae kila mwezi.",
    },
    banks: {
      title: "Benki zinazohitajika",
      body: "Bima ya amana inalinda {limit} kwa kila benki, na akiba yote iko kwenye amana za benki, kwa hiyo lengo linagawanywa: {target} ÷ {limit}, ikizungushwa juu, = benki {result}.",
    },
  },

  m3: {
    totalEmi: {
      title: "Jumla ya EMI za mwezi",
      body: "EMI zote za mikopo pamoja na malipo ya chini kwa salio lolote la kadi linalobaki: {emis} + {cardMinimums} = {result}.",
    },
    emiRatio: {
      title: "EMI kama sehemu ya kipato halisi",
      body: "Jumla ya EMI ikigawanywa kwa kipato halisi: {totalEmi} ÷ {takeHome} = {result}. Wakopeshaji huweka vikomo vyao wenyewe; tunatahadharisha sehemu kubwa kwa sababu kinachobaki kwa akiba ni kidogo.",
    },
    capacity: {
      title: "Uwezo wa EMI",
      body: "Kinachobaki kwa marejesho ya mkopo baada ya kuweka akiba kwanza, kulipa mahitaji muhimu na kuweka akiba ya pesa taslimu: {takeHome} − {savings} − {essentials} − {buffer} = {result}.",
    },
    maxLoan: {
      title: "Mkopo mkubwa unaoweza kumudu",
      body: "Fomula ya kawaida ya EMI ikitumika kinyume. Kwa riba ya mwezi ya {monthlyRate} kwa miezi {months}: {capacity} × (1 − (1 + {monthlyRate})^−{months}) ÷ {monthlyRate} = {result}. Ongeza tahadhari yako mwenyewe kabla ya kukopa.",
    },
    scenarioEmi: {
      title: "EMI ya mwezi kwa mkopo huu",
      body: "Fomula ya kawaida ya EMI. Kwa {principal} kwa riba ya mwezi ya {monthlyRate} kwa miezi {months}: {principal} × {monthlyRate} ÷ (1 − (1 + {monthlyRate})^−{months}) = {result}.",
    },
    interestSaved: {
      title: "Riba unayookoa",
      body: "Kulipa deni la riba kubwa zaidi kwanza kunagharimu {avalancheInterest} kwa jumla ya riba; salio dogo zaidi kwanza kunagharimu {snowballInterest}. Tofauti, {result}, ndiyo unayookoa kwa kuanza na riba kubwa zaidi.",
    },
  },

  m4: {
    average: {
      title: "Wastani wa kipato cha mwezi",
      body: "Wastani wa kipato unachukuliwa kwa miezi {months} iliyopita: {total} ÷ {months} = {result}. Kwa mshahara usiobadilika hiki ni kipato chako halisi tu; wafanyakazi huru na wafanyabiashara waweke miezi yao sita iliyopita ili mabadiliko yasawazike.",
    },
    feasible: {
      title: "Kiwango cha juu unachoweza kuweka",
      body: "Kinachobaki baada ya mahitaji muhimu, kama sehemu ya kipato: ({average} − {essentials}) ÷ {average} = {result}. Kiwango kinachopendekezwa hakipiti hiki kamwe.",
    },
    amount: {
      title: "Akiba ya kila mwezi",
      body: "Kipato mara kiwango chako cha akiba: {average} × {rate} = {result}. Hiki kinahamia kwenye akiba siku ya mshahara, kabla ya kutumia chochote.",
    },
    expenses: {
      title: "Kinachobaki kutumia",
      body: "Kipato ukitoa akiba ndicho unachoishi nacho: {average} − {savings} = {result}. Hilo ndilo wazo zima: weka akiba kwanza, tumia kinachobaki.",
    },
  },

  m5: {
    fv: {
      title: "Gharama ya baadaye ya lengo",
      body: "Gharama ya leo ikikua kwa mfumuko wa bei kila mwaka hadi lengo: {cost} × (1 + {inflation})^{years} = {result}. Hiki ndicho kiasi unachopaswa kufikia kweli.",
    },
    rate: {
      title: "Faida baada ya kodi",
      body: "{instrument} inalipa {nominal} kwa mwaka kabla ya kodi. Baada ya kodi ya zuio ya {tax}, unabaki na {result} kwa mwaka.",
    },
    monthly: {
      title: "Akiba ya kila mwezi inayohitajika",
      body: "Kiasi kinachokua hadi gharama ya baadaye kwa riba ya mwezi ya {monthlyRate} kwa miezi {months}: {fv} × {monthlyRate} ÷ ((1 + {monthlyRate})^{months} − 1) = {result}.",
    },
    real: {
      title: "Faida halisi",
      body: "Kile pesa yako inachopata katika uwezo wa kununua kila mwaka: (1 + {afterTax}) ÷ (1 + {inflation}) − 1 = {result}. Chini ya sifuri inamaanisha bidhaa inashindwa na mfumuko wa bei ingawa inalipa riba.",
    },
  },

  plan: {
    total: {
      title: "Kiasi chako cha kila mwezi",
      body: "Kiasi cha akiba-kwanza kutoka bajeti yako: {savings} = {result}. Kila fungu hapa chini linatoka kwenye namba hii moja.",
    },
    emergencyShare: {
      title: "Sehemu ya akiba ya dharura",
      body: "Hadi akiba ijae, akiba ya dharura inachukua kile kikokotoo chake kinachoomba, {m1Monthly} kwa mwezi, lakini kiasi hicho kinabaki kati ya {minShare} na {maxShare} ya kiasi chako cha kila mwezi ({total}) ili mafungu mengine yapate kitu. Haichukui kamwe zaidi ya {gap} iliyobaki kuweka: {result}.",
    },
    debtShare: {
      title: "Sehemu ya deni la riba kubwa",
      body: "Kinachobaki baada ya akiba ya dharura kinaenda kwenye deni lolote lililo juu ya mstari wa riba kubwa, hadi hitaji la kulipa (salio zote za riba kubwa ÷ miezi lengwa): min({remaining}, {headroom}) = {result}.",
    },
    goalsShare: {
      title: "Sehemu ya malengo",
      body: "Chochote kinachobaki kinagharimia malengo yako: min({remaining}, {goalsNeed}) = {result}. Kikiwa kidogo kuliko malengo yanavyohitaji, mpango unaonyesha upungufu.",
    },
    goalAllocation: {
      title: "Sehemu ya lengo hili",
      body: "Lengo hili linahitaji {need} kwa mwezi na malengo yako yote kwa pamoja yanahitaji {goalsNeed}. {remaining} iliyobaki baada ya mafungu ya juu inagawanywa kwa uwiano huo: {remaining} × {need} ÷ {goalsNeed} = {result}.",
    },
  },
};
