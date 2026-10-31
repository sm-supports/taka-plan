// "Why this number?" entries for M7 steps; placeholder names are documented in ../en/explain-m7.ts.
import type { Dictionary } from "../../types";

export const explainM7: Dictionary["explain"]["m7"] = {
  spendingAtRetirement: {
    title: "Matumizi katika mwaka wako wa kwanza wa kustaafu",
    body: "Matumizi ya leo ya {monthlySpending} kwa mwezi, mara 12, yakikua na bei kwa {inflation} kwa mwaka kwa miaka {retireInYears} hadi utakapoacha kazi: 12 × {monthlySpending} × (1 + {inflation})^{retireInYears}. Kodi ya pango unayopokea inatolewa kwanza, kwa kuwa nayo inapanda na bei. Matokeo: {result} kwa mwaka.",
  },
  corpusContrast: {
    title: "Lengo hadi umri wa kulinganisha",
    body: "Akiba inayolipa {spendingAtRetirement} katika mwaka wa kwanza, ikipanda na bei ({inflation}), kwa miaka {retiredForYears} huku kinachobaki kikipata {returnRate} baada ya kodi: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. Inaonyeshwa kwa kulinganisha tu.",
  },
  corpusPlan: {
    title: "Lengo la kudumu hadi umri wa mpango wako",
    body: "Fomula ileile kwa miaka {retiredForYears}: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. Ndiyo hasa akiba ambayo chati ya mwaka kwa mwaka inaitumia hadi sifuri katika umri huo.",
  },
  savingsFv: {
    title: "Akiba yako utakapoacha kazi",
    body: "Ulichonacho leo, {savings}, kikibaki kimewekezwa kwa {accumulationRate} kwa mwaka kwa miaka {retireInYears}: {savings} × (1 + {accumulationRate})^{retireInYears} = {result}.",
  },
  providentFund: {
    title: "Mfuko wa akiba ya wafanyakazi utakapoacha kazi",
    body: "Salio la leo la {balance} pamoja na {monthlyContribution} zinazolipwa kila mwezi, vyote vikikua kwa kiwango cha mfuko chenyewe cha {fundRate} kwa miaka {retireInYears} = {result}.",
  },
  gratuity: {
    title: "Kiinua mgongo",
    body: "Mshahara wa msingi wa mwisho wa {basicMonthly} ÷ siku {daysPerMonthCount} × siku {daysCount} kwa kila moja ya miaka {serviceYears} ya huduma = {result}, unaolipwa kwa mkupuo unapoondoka.",
  },
  fixedPensions: {
    title: "Pensheni zisizobadilika, zikithaminishwa unapoacha kazi",
    body: "Pensheni ya umma ya {publicPensionMonthly} kwa mwezi kuanzia umri wa {pensionFromAgeYears} na kipato kingine kisichobadilika cha {fixedPensionMonthly} kwa mwezi, vinavyolipwa hadi umri wa mpango wako (miaka {retiredForYears} ya kustaafu) bila kupanda na bei, vina thamani hii unapoacha kazi, kwa {returnRate}: {result}. Ndiyo sababu uwezo wao wa kununua unapungua katika kustaafu kwa muda mrefu.",
  },
  gap: {
    title: "Bado kujenga",
    body: "Lengo la {corpus}, ukitoa kila kitu kitakachokuwepo tayari (akiba yako, mfuko wa akiba ya wafanyakazi, kiinua mgongo na thamani ya pensheni zisizobadilika), kamwe si chini ya sifuri: {result}.",
  },
  monthly: {
    title: "Akiba ya kila mwezi",
    body: "Kiasi ambacho, kikilipwa kila mwezi kwa miezi {savingMonths} na kukua kwa {monthlyRate} kwa mwezi, kinafikia {gap}: {gap} × {monthlyRate} ÷ ((1 + {monthlyRate})^{savingMonths} − 1) = {result}, kimezungushwa juu ili kitoshe.",
  },
  withdrawal: {
    title: "Utoaji wa mwaka wa kwanza",
    body: "Kile {savings} kinaweza kulipa katika mwaka wa kwanza, kikipanda na bei ({inflation}) kila mwaka unaofuata, ili kidumu miaka {retiredForYears} huku kikipata {returnRate}: {savings} × ({returnRate} − {inflation}) ÷ (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) = {result}, kimezungushwa chini ili kisipungue kamwe.",
  },
  safePot: {
    title: "Chungu salama",
    body: "Utoaji wa mwaka wa kwanza wa {firstYear} mara miaka {potYears} = {result}, unaotunzwa mahali salama na rahisi kufikia.",
  },
};
