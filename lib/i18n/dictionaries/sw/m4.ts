import type { Dictionary } from "../../types";

/** M4 Save-first budget: income − savings = expenses. */
export const m4: Dictionary["m4"] = {
  title: "Bajeti ya akiba kwanza",
  intro: "Geuza hesabu. Weka akiba kwanza siku ya mshahara; tumia kinachobaki. Tabia ni muhimu kuliko kiasi.",
  demo: "Namba za mfano kwa ajili ya kuonyesha tu. Majibu yako hayatumiki kwenye ukurasa huu.",

  section: {
    inputs: "Namba zako",
    result: "Bajeti yako ya akiba kwanza",
    where: "Inakokwenda",
    nextStep: "Hatua inayofuata",
  },

  input: {
    takeHome: { label: "Kipato halisi cha mwezi", hint: "Kinachoingia kwenye akaunti yako." },
    essentials: { label: "Matumizi muhimu ya mwezi", hint: "Kodi ya nyumba, chakula, huduma, usafiri, ada za shule, msaada kwa wazazi, EMI." },
    incomeType: { label: "Unavyopata kipato", hint: "Wafanyakazi huru na wafanyabiashara huweka akiba sehemu ya kila malipo badala ya kiasi kisichobadilika." },
    savingsRate: {
      label: "Kiwango cha akiba",
      hint: "Tunapendekeza {suggested} ya kipato halisi. Kipunguze hadi kiasi chochote unachoweza kudumisha kweli.",
      suggested: "Pendekezo: {rate}",
      useSuggested: "Tumia pendekezo",
    },
    payday: { label: "Siku mshahara unapoingia", hint: "Tutapendekeza uhamisho siku inayofuata, kabla pesa haijatumika." },
    last6Incomes: { label: "Kipato cha miezi sita iliyopita", hint: "Namba moja kwa kila mwezi. Tunatumia wastani kama kipato chako halisi.", month: "Mwezi {n}" },
  },

  result: {
    equation: "{income} − {savings} = {expenses}",
    equationLabel: "Kipato − akiba = matumizi",
    averageIncome: "Wastani wa kipato cha mwezi",
    suggestedRate: "Kiwango cha akiba kinachopendekezwa",
    feasibleRate: "Kiwango cha juu unachoweza kuweka",
    feasibleRateHint: "Kinachobaki baada ya mahitaji muhimu, kama sehemu ya kipato.",
    savingsRate: "Kiwango cha akiba",
    savingsAmount: "Weka akiba kila mwezi",
    expensesAllowed: "Kinachobaki kutumia",
    essentialsShortfall: "Mahitaji muhimu yamezidi bajeti kwa",
    essentialsShortfallHint: "Mahitaji yako muhimu ni zaidi ya kinachobaki baada ya akiba. Punguza kiwango, au tafuta hitaji moja muhimu la kupunguza.",
    modeLabel: "Unavyoweka akiba",
    mode: {
      fixed: "Kiasi kisichobadilika kila mwezi",
      percentOfEachPayment: "Sehemu ya kila malipo unayopokea",
    },
    percentOfEachPayment: "Hamishia {percent} ya kila malipo kwenye akiba siku yanapoingia",
    instrument: "Iweke kwenye",
    instrumentHint: "Pesa zinahamishwa kiotomatiki siku maalum, kwa hiyo akiba inafanyika kabla hujaweza kuitumia.",
    transferDay: "Uhamisho wa kudumu siku ya {day} ya kila mwezi",
    transferDayUnknown: "Tuambie siku ya mshahara wako na tutapendekeza tarehe ya uhamisho.",
  },

  next: {
    dps: "Omba benki yako ikufungulie {product} kwa makato ya kiotomatiki siku ya {day} ya kila mwezi, siku moja baada ya mshahara kuingia. Kiasi chochote kinafaa; tabia ni muhimu kuliko ukubwa.",
    dpsNoPayday: "Omba benki yako ikufungulie {product} kwa makato ya kiotomatiki siku moja baada ya mshahara kuingia. Kiasi chochote kinafaa; tabia ni muhimu kuliko ukubwa.",
    percentOfEachPayment: "Siku malipo yanapoingia, hamishia {percent} yake kwenye akaunti tofauti ya akiba kabla ya kutumia chochote. Weka sehemu ileile katika miezi mikubwa na midogo; salio likishatulia, hamia kwenye uhamisho wa kiasi maalum kila mwezi.",
  },

  note: {
    instrumentDps: "Tunapendekeza uhamisho wa kiotomatiki wa kila mwezi kwa sababu unafanyika siku maalum, kwa hiyo akiba inafanyika kabla hujaweza kuitumia.",
  },

  status: {
    red: "Bado hakuna akiba",
    amber: "Unaweka akiba kidogo — endelea",
    green: "Unaweka akiba kwanza kila mwezi",
  },
};
