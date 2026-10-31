import type { Dictionary } from "../../types";

/** M5 Goal planner. `note.*` covers M5_NOTE_KEYS. */
export const m5: Dictionary["m5"] = {
  title: "Mpangaji wa malengo",
  intro: "Lengo la kweli lina kiasi, tarehe na umri wako. Kila mtu ana angalau moja: kustaafu.",

  input: {
    name: { label: "Jina la lengo", hint: "Chuo kikuu cha binti, malipo ya awali ya nyumba, Hija, gari…", placeholder: "Unawekea akiba nini?" },
    cost: { label: "Gharama kwa pesa ya leo", hint: "Ingegharimu kiasi gani ukilipa leo. Tunakuongezea mfumuko wa bei." },
    years: { label: "Miaka iliyobaki", hint: "Miaka kamili kuanzia sasa, {min} hadi {max}." },
    type: { label: "Aina ya lengo", hint: "Gharama za elimu na afya hupanda haraka kuliko bei za jumla, kwa hiyo zina kiwango chao cha mfumuko wa bei." },
    addGoal: "Ongeza lengo",
    removeGoal: "Ondoa lengo",
    incomplete: "Lengo linahitaji jina, gharama na idadi ya miaka kabla ya kuhifadhiwa.",
    newGoal: "Lengo jipya",
    saveGoal: "Hifadhi lengo",
    saved: "Malengo yako",
  },

  result: {
    horizon: "Muda",
    inflation: "Mfumuko wa bei uliotumika",
    futureValue: "Utahitaji",
    futureValueIn: "{fv} baada ya {years}",
    instrument: "Iweke kwenye",
    candidates: "Chaguo zingine kwa muda huu",
    nominal: "Kiwango kilichotangazwa",
    afterTax: "Baada ya kodi",
    real: "Faida halisi (baada ya kodi na mfumuko wa bei)",
    belowInflation: "Chini ya mfumuko wa bei: pesa hii itanunua kidogo mwishoni kuliko inavyonunua leo",
    monthly: "Weka akiba kila mwezi",
    monthlyRange: "Chini {low} · Inayotarajiwa {base} · Juu {high}",
    monthlyLow: "Faida ikiwa ndogo",
    monthlyBase: "Inayotarajiwa",
    monthlyHigh: "Faida ikiwa kubwa",
    months: "Kwa muda wa {months}",
    totalMonthly: "Malengo yote kwa pamoja",
    invalid: "Lengo hili limekosa kitu",
    empty: "Bado hakuna malengo.",
    goalsCount: "Malengo {n}",
    realAbove: "Inashinda mfumuko wa bei baada ya kodi",
    perMonth: "kwa mwezi",
  },

  demoBanner: "Malengo ya mfano. Ongeza yako kuona namba zako halisi.",

  note: {
    noAllocationYet: "Malengo ya muda mrefu yanatumia bidhaa za mapato ya kudumu tu kwa sasa. Hatua ya mchanganyiko wa mali ikishaingia, malengo ya zaidi ya miaka mitano yatatumia mchanganyiko wenye hisa kiasi.",
    belowInflation: "Faida inayotarajiwa kwenye bidhaa hii iko chini ya mfumuko wa bei baada ya kodi. Bado utafikia kiasi hicho, lakini kitanunua kidogo kuliko ulivyotarajia. Muda mrefu zaidi au bidhaa inayolipa zaidi inasaidia.",
  },

  status: {
    red: "Faida inayotarajiwa iko chini ya mfumuko wa bei",
    amber: "Inafikika, lakini kwa shida",
    green: "Uko sawa",
  },
};
