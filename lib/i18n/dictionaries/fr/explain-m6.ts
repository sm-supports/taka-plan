import type { Dictionary } from "../../types";

/** "Why this number?" entries for M6 steps. Placeholder names per step: see ../en/explain-m6.ts. */
export const explainM6: Dictionary["explain"]["m6"] = {
  score: {
    title: "Score de risque",
    body: "Chacune des quatre réponses vaut de 0 à 2 : tranche d'âge {ageBandCount}, revenu {incomeCount}, échéance de l'argent {horizonCount}, et réaction après une baisse de 20 % {reactionCount}. Au total : {result} sur 8. De 0 à 3 : Prudent ; 4 à 5 : Équilibré ; 6 à 8 : Dynamique.",
  },
  equity: {
    title: "Part d'actions",
    body: "Votre profil commence à {startShare} d'actions jusqu'à 30 ans, puis un point de moins par année au-delà, mais jamais sous {floorShare} : à {ageYears} ans, cela donne {ageEquityShare}, et jamais au-dessus du plafond de {capShare}. L'argent nécessaire d'ici {noEquityYears} ans ne contient pas d'actions, et d'ici {cashOnlyYears} an uniquement des dépôts ou des bons du Trésor ; le vôtre est nécessaire dans {horizonYears} ans. Actions : {result}.",
  },
  gold: {
    title: "Part d'or",
    body: "L'or est une protection, pas un pari : votre choix de {chosenShare}, gardé entre {minShare} et {maxShare}. Or : {result}.",
  },
  fixedIncome: {
    title: "Part de revenu fixe",
    body: "Tout ce qui n'est ni actions ni or : 100 % − {equityShare} − {goldShare} = {result}.",
  },
  mixLow: {
    title: "Rendement de la répartition, scénario bas",
    body: "Le rendement annuel de chaque part dans le scénario bas, pondéré par sa part : {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} par an.",
  },
  mixBase: {
    title: "Rendement de la répartition, scénario central",
    body: "Le rendement annuel de chaque part dans le scénario central, pondéré par sa part : {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} par an. Le scénario central des actions n'est volontairement pas fixé plus haut que celui des placements sûrs.",
  },
  mixHigh: {
    title: "Rendement de la répartition, scénario haut",
    body: "Le rendement annuel de chaque part dans le scénario haut, pondéré par sa part : {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} par an.",
  },
  fv: {
    title: "Ce que cela pourrait devenir (scénario central)",
    body: "{monthly} par mois et {lumpSum} aujourd'hui, à {mixRate} par an ({monthlyRate} par mois) pendant {years} ans. Vous versez {paidIn} ; à la fin, vous pourriez avoir {result}. Les scénarios bas et haut utilisent leur propre rendement.",
  },
  real: {
    title: "En argent d'aujourd'hui",
    body: "Les prix montent aussi. {fv} divisé par (1 + {inflation})^{years} = {result} en pouvoir d'achat d'aujourd'hui.",
  },
  trade: {
    title: "Opérations de rééquilibrage",
    body: "Vous détenez {holdingsTotal} et ajoutez {newMoney} : le nouveau total est donc {result}. La cible de chaque part est sa part de ce total ({equityShare}, {goldShare}, {fixedIncomeShare}) moins ce qu'elle contient aujourd'hui : actions {equityTrade}, or {goldTrade}, revenu fixe {fixedIncomeTrade} (plus = acheter, moins = vendre). L'argent nouveau va d'abord aux parts en retard, et une part à plus de {driftBandShare} de sa cible signale qu'il faut rééquilibrer.",
  },
};
