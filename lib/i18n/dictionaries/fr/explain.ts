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
      title: "Mois de couverture",
      body: "Nous partons de {base} mois. Un revenu irrégulier ajoute {bumpIrregular}, être le seul revenu avec des personnes à charge ajoute {bumpSoleEarner}, et ne pas avoir d'assurance santé ajoute {bumpNoHealth}. La suggestion reste entre {min} et {max} mois : {result}. À vous de déplacer le curseur.",
    },
    target: {
      title: "Objectif du fonds d'urgence",
      body: "Vos dépenses essentielles mensuelles multipliées par les mois de couverture : {essentials} × {months} = {result}. Seul l'essentiel compte, car en cas d'urgence tout le reste s'arrête.",
    },
    gap: {
      title: "Reste à épargner",
      body: "L'objectif moins ce qui est déjà accessible aujourd'hui : {target} − {saved} = {result}. Jamais en dessous de zéro ; une réserve plus grande que prévu, c'est très bien.",
    },
    monthly: {
      title: "Épargne mensuelle",
      body: "L'écart réparti sur le nombre de mois choisi pour le constituer : {gap} ÷ {buildMonths} = {result} par mois.",
    },
    covered: {
      title: "Mois couverts",
      body: "Combien de mois de dépenses essentielles votre épargne actuelle couvrirait : {saved} ÷ {essentials} = {result}.",
    },
    tier1: {
      title: "Niveau 1 : compte d'épargne disponible le jour même",
      body: "Un mois de dépenses essentielles reste sur un compte d'épargne retirable aujourd'hui : {essentials} = {result}. C'est l'argent de la première semaine de toute urgence.",
    },
    tier2: {
      title: "Niveau 2 : échelle de dépôts à 3 mois",
      body: "Tout ce qui dépasse le niveau 1 va en dépôts à terme : {target} − {tier1} = {result}, réparti en trois dépôts ouverts à un mois d'écart, pour que l'un arrive à échéance chaque mois.",
    },
    banks: {
      title: "Banques nécessaires",
      body: "La garantie des dépôts couvre {limit} par banque, et tout le fonds est en dépôts bancaires, donc l'objectif est réparti : {target} ÷ {limit}, arrondi au supérieur, = {result} banque(s).",
    },
  },

  m3: {
    totalEmi: {
      title: "Total des mensualités",
      body: "Toutes les mensualités de prêt plus le paiement minimum de tout solde de carte reporté : {emis} + {cardMinimums} = {result}.",
    },
    emiRatio: {
      title: "Mensualités en part du revenu net",
      body: "Total des mensualités divisé par le revenu net : {totalEmi} ÷ {takeHome} = {result}. Les prêteurs fixent leurs propres limites ; nous signalons une part élevée, car il reste alors peu pour épargner.",
    },
    capacity: {
      title: "Capacité de remboursement",
      body: "Ce qui reste pour rembourser des prêts après avoir épargné d'abord, payé l'essentiel et gardé une marge de sécurité : {takeHome} − {savings} − {essentials} − {buffer} = {result}.",
    },
    maxLoan: {
      title: "Prêt maximal supportable",
      body: "La formule classique de la mensualité, à l'envers. Avec un taux mensuel de {monthlyRate} sur {months} mois : {capacity} × (1 − (1 + {monthlyRate})^−{months}) ÷ {monthlyRate} = {result}. Gardez votre propre marge de sécurité avant d'emprunter.",
    },
    scenarioEmi: {
      title: "Mensualité de ce prêt",
      body: "La formule classique de la mensualité. Pour {principal} à un taux mensuel de {monthlyRate} sur {months} mois : {principal} × {monthlyRate} ÷ (1 − (1 + {monthlyRate})^−{months}) = {result}.",
    },
    interestSaved: {
      title: "Intérêts économisés",
      body: "Rembourser d'abord la dette au taux le plus élevé coûte {avalancheInterest} d'intérêts au total ; commencer par le plus petit solde coûte {snowballInterest}. La différence, {result}, est ce que vous économisez en commençant par le taux le plus élevé.",
    },
  },

  m4: {
    average: {
      title: "Revenu mensuel moyen",
      body: "Le revenu est la moyenne des {months} dernier(s) mois : {total} ÷ {months} = {result}. Pour un salaire fixe, c'est simplement votre revenu net ; les indépendants et chefs d'entreprise devraient saisir leurs six derniers mois pour lisser les variations.",
    },
    feasible: {
      title: "Épargne maximale possible",
      body: "Ce qui reste après l'essentiel, en part du revenu : ({average} − {essentials}) ÷ {average} = {result}. Le taux suggéré ne dépasse jamais cette valeur.",
    },
    amount: {
      title: "Épargne mensuelle",
      body: "Le revenu multiplié par votre taux d'épargne : {average} × {rate} = {result}. Cette somme part vers l'épargne le jour de la paie, avant toute dépense.",
    },
    expenses: {
      title: "Reste à dépenser",
      body: "Le revenu moins l'épargne, c'est ce dont vous vivez : {average} − {savings} = {result}. Toute l'idée est là : épargner d'abord, dépenser le reste.",
    },
  },

  m5: {
    fv: {
      title: "Coût futur de l'objectif",
      body: "Le coût d'aujourd'hui augmenté de l'inflation pour chaque année jusqu'à l'objectif : {cost} × (1 + {inflation})^{years} = {result}. C'est le montant que vous devez vraiment atteindre.",
    },
    rate: {
      title: "Rendement après impôt",
      body: "{instrument} : {nominal} par an avant impôt. Après {tax} d'impôt prélevé à la source, vous gardez {result} par an.",
    },
    monthly: {
      title: "Épargne mensuelle nécessaire",
      body: "Le montant qui atteint le coût futur à un taux mensuel de {monthlyRate} sur {months} mois : {fv} × {monthlyRate} ÷ ((1 + {monthlyRate})^{months} − 1) = {result}.",
    },
    real: {
      title: "Rendement réel",
      body: "Ce que votre argent gagne en pouvoir d'achat chaque année : (1 + {afterTax}) ÷ (1 + {inflation}) − 1 = {result}. En dessous de zéro, le placement perd face à l'inflation même s'il verse des intérêts.",
    },
  },

  plan: {
    total: {
      title: "Votre montant mensuel",
      body: "Le montant « épargne d'abord » de votre budget : {savings} = {result}. Chaque poste ci-dessous est pris sur ce seul chiffre.",
    },
    emergencyShare: {
      title: "Part du fonds d'urgence",
      body: "Tant que le fonds n'est pas plein, il reçoit ce que demande son calculateur, {m1Monthly} par mois, mais en restant entre {minShare} et {maxShare} de votre montant mensuel ({total}), pour que les autres postes reçoivent quand même quelque chose. Il ne prend jamais plus que les {gap} qu'il reste à épargner : {result}.",
    },
    debtShare: {
      title: "Part des dettes à taux élevé",
      body: "Ce qui reste après le fonds d'urgence va aux dettes au-dessus du seuil de taux élevé, jusqu'au besoin de remboursement (tous les soldes à taux élevé ÷ le nombre de mois visé) : min({remaining}, {headroom}) = {result}.",
    },
    goalsShare: {
      title: "Part des objectifs",
      body: "Ce qui reste finance vos objectifs : min({remaining}, {goalsNeed}) = {result}. Si c'est moins que ce que demandent les objectifs, le plan montre le manque.",
    },
    goalAllocation: {
      title: "Part de cet objectif",
      body: "Cet objectif demande {need} par mois et tous vos objectifs ensemble {goalsNeed}. Les {remaining} restants après les postes ci-dessus sont répartis dans cette proportion : {remaining} × {need} ÷ {goalsNeed} = {result}.",
    },
  },
};
