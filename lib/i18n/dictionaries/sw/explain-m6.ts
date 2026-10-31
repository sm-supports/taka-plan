// "Why this number?" entries for M6 steps; placeholder names are documented in ../en/explain-m6.ts.
import type { Dictionary } from "../../types";

export const explainM6: Dictionary["explain"]["m6"] = {
  score: {
    title: "Alama ya hatari",
    body: "Kila jibu kati ya manne linapata alama 0 hadi 2: kundi la umri {ageBandCount}, kipato {incomeCount}, unapohitaji pesa {horizonCount}, na ungefanya nini baada ya kushuka kwa 20% {reactionCount}. Kwa pamoja: {result} kati ya 8. 0 hadi 3 ni Tahadhari, 4 hadi 5 ni Uwiano, 6 hadi 8 ni Ukuaji.",
  },
  equity: {
    title: "Sehemu ya hisa",
    body: "Wasifu wako unaanza na hisa {startShare} hadi umri wa miaka 30, kisha pointi moja chini kwa kila mwaka baada ya hapo, lakini kamwe si chini ya {floorShare}: ukiwa na miaka {ageYears}, hiyo inatoa {ageEquityShare}, na kamwe si juu ya kikomo cha {capShare}. Pesa inayohitajika ndani ya miaka {noEquityYears} haina hisa, na ndani ya mwaka {cashOnlyYears} ni amana au hati za hazina tu; yako inahitajika baada ya miaka {horizonYears}. Hisa: {result}.",
  },
  gold: {
    title: "Sehemu ya dhahabu",
    body: "Dhahabu ni kinga, si kamari: chaguo lako la {chosenShare}, linalobaki kati ya {minShare} na {maxShare}. Dhahabu: {result}.",
  },
  fixedIncome: {
    title: "Sehemu ya mapato ya kudumu",
    body: "Kila kisicho hisa wala dhahabu: 100% − {equityShare} − {goldShare} = {result}.",
  },
  mixLow: {
    title: "Faida ya mchanganyiko, hali ya chini",
    body: "Faida ya mwaka ya hali ya chini ya kila sehemu ikipimwa kwa sehemu yake: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} kwa mwaka.",
  },
  mixBase: {
    title: "Faida ya mchanganyiko, hali ya msingi",
    body: "Faida ya mwaka ya hali ya msingi ya kila sehemu ikipimwa kwa sehemu yake: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} kwa mwaka. Msingi wa hisa umewekwa kwa makusudi usizidi ule wa bidhaa salama.",
  },
  mixHigh: {
    title: "Faida ya mchanganyiko, hali ya juu",
    body: "Faida ya mwaka ya hali ya juu ya kila sehemu ikipimwa kwa sehemu yake: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} kwa mwaka.",
  },
  fv: {
    title: "Inaweza kukua hadi kiasi gani (hali ya msingi)",
    body: "{monthly} kwa mwezi na {lumpSum} leo, zikikua kwa {mixRate} kwa mwaka ({monthlyRate} kwa mwezi) kwa miaka {years}. Unaweka {paidIn}; mwishoni unaweza kuwa na {result}. Hali za chini na juu zinatumia faida zao za mchanganyiko.",
  },
  real: {
    title: "Kwa pesa ya leo",
    body: "Bei nazo zinapanda. {fv} ikigawanywa kwa (1 + {inflation})^{years} = {result} kwa kile pesa inachonunua leo.",
  },
  trade: {
    title: "Mabadiliko ya kusawazisha",
    body: "Unamiliki {holdingsTotal} na kuongeza {newMoney}, kwa hiyo jumla mpya ni {result}. Lengo la kila sehemu ni sehemu yake ya jumla hiyo ({equityShare}, {goldShare}, {fixedIncomeShare}) ukitoa inachomiliki sasa: hisa {equityTrade}, dhahabu {goldTrade}, mapato ya kudumu {fixedIncomeTrade} (jumlisha = nunua, toa = uza). Pesa mpya inaenda kwanza kwenye sehemu zilizo nyuma, na sehemu iliyo mbali na lengo kwa zaidi ya {driftBandShare} ni ishara ya kusawazisha.",
  },
};
