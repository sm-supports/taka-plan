import type { Dictionary } from "../../types";

/** "Why this number?" entries for M2 steps. Placeholder names per step: see ../en/explain-m2.ts. */
export const explainM2: Dictionary["explain"]["m2"] = {
  years: {
    title: "Années de couverture",
    body: "L'assurance décès court de votre âge actuel, {ageYears} ans, jusqu'à {coverToAgeYears} ans, quand la famille ne dépend généralement plus de votre revenu, ou jusqu'à ce que votre plus jeune enfant ait {childIndependentAgeYears} ans si vous avez indiqué son âge et que cela arrive avant : {result} ans. Jamais en dessous de zéro.",
  },
  incomeNeed: {
    title: "Revenu à remplacer",
    body: "La famille aurait besoin de {incomeShare} de votre revenu net de {takeHome} par mois : {yearlyNeed} par an. Ce besoin augmente avec les prix de {inflation} par an pendant {coveredYears} ans. L'argent placé aujourd'hui en épargne sûre pourrait rapporter {afterTax} après impôt, soit {realRate} par an de plus que la hausse des prix ; la somme à avoir aujourd'hui pour payer le besoin de chaque année, dès maintenant, est donc de {result}.",
  },
  lifeCover: {
    title: "Assurance décès nécessaire",
    body: "Le revenu à remplacer {incomeNeed}, plus les dettes {debts} et les objectifs d'études {educationGoals}, moins l'épargne accessible à la famille {liquidSavings} et les placements {investments} : {result}. Jamais en dessous de zéro.",
  },
  lifeGap: {
    title: "Assurance décès restant à souscrire",
    body: "La couverture nécessaire moins celle que vous avez déjà : {cover} − {existingLifeCover} = {result}.",
  },
  perStay: {
    title: "Couverture santé par adulte",
    body: "Une hospitalisation type coûte environ {hospitalCost}. Les familles paient elles-mêmes {oopShare} des frais de santé ; nous retenons au moins {publicFloorShare}, donc nous prenons {appliedShare} : {result} de couverture par adulte.",
  },
  healthTarget: {
    title: "Couverture santé pour la famille",
    body: "La couverture par adulte {perStay} multipliée par le poids des {peopleCount} personnes couvertes, {weightCount} au total (un enfant compte moins qu'un adulte, un parent plus) : {result}.",
  },
  healthGap: {
    title: "Couverture santé restant à souscrire",
    body: "L'objectif de la famille moins la couverture santé que vous avez déjà : {target} − {existingHealthCover} = {result}.",
  },
  lifePremium: {
    title: "Prime annuelle d'assurance décès temporaire",
    body: "L'assurance décès temporaire coûte environ {bandLow} à {bandHigh} par an pour chaque tranche de {per} de couverture à votre âge, multiplié par {smokerMultipleCount} pour les fumeurs. Pour {gap} de couverture, cela fait {premiumLow} à {premiumHigh} par an ; le point médian est {result}.",
  },
  healthPremium: {
    title: "Prime annuelle d'assurance santé",
    body: "La couverture santé est tarifée par tranche de {per} de couverture, selon l'âge de chaque personne. Pour {gap} de couverture en plus pour {peopleCount} personnes, cela fait {premiumLow} à {premiumHigh} par an ; le point médian est {result}.",
  },
  monthlyNeed: {
    title: "À mettre de côté chaque mois",
    body: "Les points médians des deux fourchettes annuelles, assurance décès {lifePremium} plus santé {healthPremium}, réparti sur {months} mois : {result} par mois.",
  },
  policyTerm: {
    title: "Assurance temporaire du même montant",
    body: "Une assurance décès temporaire pour le capital du contrat, {sumAssured}, coûte environ {bandLow} à {bandHigh} par an pour chaque tranche de {per} à votre âge, multiplié par {smokerMultipleCount} pour les fumeurs. Le point médian est {result} par an.",
  },
  policyInvest: {
    title: "Épargner la différence",
    body: "Si vous arrêtiez maintenant, ce que l'assureur vous rendrait, {surrenderValue}, deviendrait {surrenderValueFV} dans un dépôt sûr rapportant {afterTax} après impôt. Votre prime de {annualPremium} moins la prime temporaire de {termPremium} laisse {yearlyDifference} par an ; placée dans le même dépôt au début de chacune des {remainingYears} années restantes, le tout atteint {result}.",
  },
  policyIrr: {
    title: "Rendement annuel du contrat",
    body: "Garder le contrat, c'est renoncer à {surrenderValue} aujourd'hui et payer {annualPremium} par an pendant les {remainingYears} années restantes sur {termYears}, pour recevoir {expectedMaturity} à la fin : comme gagner {result} par an sur cet argent. Arrêter et épargner la différence atteindrait plutôt {investValue}, soit un écart de {difference}.",
  },
};
