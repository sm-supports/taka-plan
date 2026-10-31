import type { Dictionary } from "../../types";

/** "Why this number?" entries for M7 steps. Placeholder names per step: see ../en/explain-m7.ts. */
export const explainM7: Dictionary["explain"]["m7"] = {
  spendingAtRetirement: {
    title: "Dépenses de votre première année de retraite",
    body: "Vos dépenses actuelles de {monthlySpending} par mois, multipliées par 12, augmentées avec les prix de {inflation} par an pendant les {retireInYears} années avant votre départ : 12 × {monthlySpending} × (1 + {inflation})^{retireInYears}. Les loyers perçus sont déduits d'abord, car ils suivent aussi les prix. Résultat : {result} par an.",
  },
  corpusContrast: {
    title: "Objectif jusqu'à l'âge de comparaison",
    body: "Le capital qui verse {spendingAtRetirement} la première année, en hausse avec les prix ({inflation}), pendant {retiredForYears} ans, pendant que le reste rapporte {returnRate} après impôt : {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. Indiqué seulement à titre de comparaison.",
  },
  corpusPlan: {
    title: "Objectif jusqu'à l'âge visé par le plan",
    body: "La même formule sur {retiredForYears} ans : {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. C'est exactement le capital que le graphique année par année ramène à zéro à cet âge.",
  },
  savingsFv: {
    title: "Votre épargne à votre départ",
    body: "Ce que vous avez aujourd'hui, {savings}, laissé investi à {accumulationRate} par an pendant {retireInYears} ans : {savings} × (1 + {accumulationRate})^{retireInYears} = {result}.",
  },
  providentFund: {
    title: "Caisse de prévoyance à votre départ",
    body: "Le solde actuel de {balance} plus {monthlyContribution} versés chaque mois, le tout croissant au taux propre de la caisse, {fundRate}, pendant {retireInYears} ans = {result}.",
  },
  gratuity: {
    title: "Indemnité de fin de service",
    body: "Dernier salaire de base de {basicMonthly} ÷ {daysPerMonthCount} jours × {daysCount} jours pour chacune des {serviceYears} années de service = {result}, versé en capital à votre départ.",
  },
  fixedPensions: {
    title: "Pensions fixes, évaluées à votre départ",
    body: "Une retraite publique de {publicPensionMonthly} par mois à partir de {pensionFromAgeYears} ans et d'autres revenus fixes de {fixedPensionMonthly} par mois, versés jusqu'à l'âge visé par le plan ({retiredForYears} années de retraite) sans suivre les prix, valent à votre départ, actualisées à {returnRate} : {result}. C'est pourquoi leur pouvoir d'achat fond sur une longue retraite.",
  },
  gap: {
    title: "Reste à constituer",
    body: "L'objectif de {corpus}, moins tout ce qui sera déjà là (votre épargne, la caisse de prévoyance, l'indemnité de fin de service et la valeur des pensions fixes), jamais en dessous de zéro : {result}.",
  },
  monthly: {
    title: "Épargne mensuelle",
    body: "Le montant qui, versé chaque mois pendant {savingMonths} mois et croissant de {monthlyRate} par mois, atteint {gap} : {gap} × {monthlyRate} ÷ ((1 + {monthlyRate})^{savingMonths} − 1) = {result}, arrondi au supérieur pour suffire.",
  },
  withdrawal: {
    title: "Retrait de la première année",
    body: "Ce que {savings} peut verser la première année, en hausse avec les prix ({inflation}) chaque année ensuite, pour durer {retiredForYears} ans en rapportant {returnRate} : {savings} × ({returnRate} − {inflation}) ÷ (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) = {result}, arrondi à l'inférieur pour ne jamais manquer.",
  },
  safePot: {
    title: "La poche de sécurité",
    body: "Le retrait de la première année, {firstYear}, multiplié par {potYears} ans = {result}, gardé dans un endroit sûr et rapidement accessible.",
  },
};
