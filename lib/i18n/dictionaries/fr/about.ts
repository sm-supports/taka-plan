import type { Dictionary } from "../../types";

/** /{locale}/about: every number from the rates table is a {placeholder}; see ../en/about.ts. */
export const about: Dictionary["about"] = {
  title: "À propos de Taka Plan",
  lead: "Un calculateur gratuit qui indique à une personne qui travaille au Bangladesh combien chaque objectif demande et où placer l'argent chaque mois. Il explique et calcule ; c'est vous qui agissez, via votre propre banque, votre compte BO ou votre assureur.",
  disclaimer: { heading: "Avertissement" },
  method: {
    heading: "Comment le plan est construit",
    intro: "Le plan suit sept étapes dans un ordre fixe : d'abord protéger, puis épargner, puis faire fructifier. Chaque étape est un petit calculateur, et ensemble ils aboutissent à un seul montant mensuel.",
    phase: { protect: "Protéger", save: "Épargner", grow: "Faire fructifier" },
    order:
      "Votre montant mensuel est réparti par ordre de priorité : d'abord le fonds d'urgence, puis les primes d'assurance, puis les dettes coûteuses, et seulement ensuite les objectifs et la retraite. Tant que le fonds d'urgence n'est pas plein, au moins {share} du montant mensuel y va, pour que le reste lance dès aujourd'hui votre habitude d'investir.",
    returnsHeading: "Rendements après impôt et après inflation",
    returns:
      "Chaque rendement est réduit deux fois : d'abord de l'impôt prélevé à la source, puis de l'inflation. La question n'est pas le taux affiché, mais ce que vous gardez et ce que cela pourra encore acheter. Un placement peut verser des intérêts et perdre quand même face à l'inflation : l'application l'indique alors en rouge.",
    exampleCaption: "Avec le tableau des taux actuel :",
    rounding: "Les résultats sont arrondis à un chiffre rond proche, car une projection sur vingt ans n'est jamais exacte à l'unité près. Des fourchettes (basse, attendue, haute) sont affichées quand le rendement futur est incertain.",
    onDevice: "Tous les calculs se font sur votre téléphone, et vos réponses y restent. Le serveur ne garde que le tableau des taux et les données de chaque pays.",
  },
  sources: {
    heading: "Sources et hypothèses",
    intro: "Chaque ligne ci-dessous est une hypothèse utilisée par les calculateurs. Version des taux {version}, publiée le {date}. Les lignes marquées « notre hypothèse » sont des valeurs par défaut que nous avons choisies et pouvons modifier ; les autres sont reprises de la source publiée indiquée à côté.",
    group: {
      macro: "Inflation et taux directeur",
      bank: "Dépôts bancaires",
      sanchayapatra: "Sanchayapatra",
      govt: "Titres d'État",
      market: "Actions et or",
      risk: "Crédit, assurance et longévité",
      tax: "Règles fiscales (exercice 2026-27)",
      policy: "Valeurs par défaut de l'application",
      other: "Autre",
    },
    value: "Valeur",
    dates: "Dates",
    nextReview: "Prochaine révision",
    note: "Remarque",
    slabNext: "{rate} sur les {width} suivants",
    slabRest: "{rate} sur le reste",
    unverifiedHeading: "Pas encore vérifié",
    unverifiedIntro: "Nous n'avons pas pu confirmer ces points, donc aucun calculateur ne s'en sert encore :",
    unverified: [
      "Les primes actuelles d'assurance décès temporaire pour un capital de 10 lakh et de 1 crore.",
      "Les plafonds d'investissement en Sanchayapatra pour 2026.",
      "Le maintien, dans la loi de finances, de l'impôt réduit pour les petits investisseurs en Sanchayapatra.",
      "Un ratio mensualités/revenu de Bangladesh Bank (il ne semble pas en exister ; nous utilisons notre propre seuil).",
      "Les taux du marché pour les prêts personnels et immobiliers.",
    ],
  },
};
