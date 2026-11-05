import type { Dictionary } from "../../types";

/** Asset mix screen (M6). Never name a company, fund, broker or bank. See ../en/m6.ts. */
export const m6: Dictionary["m6"] = {
  title: "Répartition des actifs",
  intro: "Comment répartir votre argent à long terme entre revenu fixe, actions et or, quoi acheter pour chaque part, et comment garder la répartition sur sa cible.",
  demo: "Chiffres d'exemple pour l'aperçu uniquement. Vos propres réponses ne sont pas utilisées ici.",
  needProfile: "Répondez d'abord aux cinq questions de départ, pour que la répartition tienne compte de votre âge et de votre façon de gagner votre vie.",
  startLink: "Répondre aux questions de départ",
  backToPlan: "Retour à mon plan",
  disclaimer: "Estimations à but éducatif, pas un conseil en investissement. Les marchés peuvent baisser et rester bas pendant des années, et les rendements passés ne préjugent pas des rendements futurs.",

  flow: {
    progress: "Question {n} sur {total}",
    gate: {
      title: "Avez-vous un fonds d'urgence et aucune dette de carte ?",
      hint: "L'argent à long terme vient après un fonds d'urgence plein et des dettes de carte remboursées. Voici ce que dit votre plan.",
      emergencyOk: "Votre fonds d'urgence est plein.",
      emergencyMissing: "Votre fonds d'urgence n'est pas encore plein.",
      cardOk: "Vous ne reportez aucune dette de carte.",
      cardMissing: "Vous reportez un solde de carte d'un mois sur l'autre.",
      openEmergency: "Ouvrir le fonds d'urgence",
      openDebt: "Ouvrir le bilan des dettes",
      allClear: "Parfait : tout est prêt pour investir à long terme.",
      continue: "Continuer",
      continueAnyway: "Continuer quand même",
    },
    ageBand: {
      title: "Dans quelle tranche d'âge êtes-vous ?",
      hint: "Rempli d'après votre âge. Plus on est jeune, plus on a d'années pour traverser une baisse.",
    },
    incomeStability: {
      title: "Votre revenu est-il régulier ?",
      hint: "Rempli d'après votre façon de gagner votre vie. Un revenu plus régulier peut supporter un peu plus de risque.",
    },
    horizon: {
      title: "Quand aurez-vous besoin de cet argent ?",
      hint: "Choisissez le nombre d'années. L'argent dont vous aurez bientôt besoin ne doit pas être en actions.",
      band: "Cela correspond à : {band}.",
    },
    reaction: {
      title: "Si vos placements baissaient de 20 % en un an, vous…",
      hint: "Il n'y a pas de mauvaise réponse. Soyez honnête : cela décide de la part d'actions que vous pouvez supporter.",
    },
    amounts: {
      title: "Combien allez-vous investir ?",
      hint: "Une somme de départ, un montant mensuel, ou les deux. Vous pourrez les modifier plus tard.",
      needOne: "Saisissez une somme de départ ou un montant mensuel pour voir votre répartition.",
      seeResult: "Voir ma répartition",
    },
  },

  answer: {
    ageBand: { "0": "50 ans ou plus", "1": "35 à 49 ans", "2": "Moins de 35 ans" },
    incomeStability: { "0": "Revenu d'entreprise", "1": "Indépendant ou irrégulier", "2": "Salarié" },
    horizon: { "0": "D'ici 5 ans", "1": "Dans 5 à 10 ans", "2": "Dans plus de 10 ans" },
    reaction: { "0": "Je vends, pour arrêter la perte", "1": "J'attends que ça remonte", "2": "J'achète plus tant que c'est bas" },
  },

  profile: {
    careful: "Prudent",
    balanced: "Équilibré",
    growth: "Dynamique",
  },

  bucket: {
    fixedIncome: "Revenu fixe",
    equity: "Actions",
    gold: "Or",
  },

  section: {
    result: "Votre répartition",
    instruments: "Quoi acheter",
    projection: "Ce que cela pourrait devenir",
    rebalance: "J'investis déjà",
    inputs: "Vos réponses",
    netWorth: "Patrimoine net",
    notes: "Bon à savoir",
  },

  input: {
    ageBand: { label: "Tranche d'âge" },
    incomeStability: { label: "Régularité de votre revenu" },
    horizon: { label: "Quand vous aurez besoin de l'argent" },
    reaction: { label: "Si vos placements baissaient de 20 % en un an" },
    profileOverride: {
      label: "Profil de risque",
      hint: "Nous en proposons un d'après vos réponses. Vous pouvez en choisir un autre ; la part d'actions ne dépasse jamais le plafond.",
      suggested: "Suggéré d'après vos réponses",
    },
    goldShare: {
      label: "Part d'or",
      hint: "Une protection, gardée entre {min} et {max} de la répartition.",
      reset: "Revenir à {share}",
    },
    horizonYears: {
      label: "Années avant d'avoir besoin de l'argent",
      hint: "Sous {noEquity} ans, pas d'actions ; sous {cashOnly} an, uniquement des dépôts et des bons du Trésor.",
    },
    lumpSum: {
      label: "Somme à investir maintenant",
      hint: "L'argent que vous pouvez mettre de côté à long terme dès aujourd'hui.",
    },
    monthly: {
      label: "Montant mensuel",
      hint: "Ce que vous pouvez ajouter chaque mois.",
    },
    propertyValue: {
      label: "Biens immobiliers que vous possédez (facultatif)",
      hint: "Un terrain ou un appartement. Il compte dans votre patrimoine net mais pas dans la répartition, car il ne s'achète ni ne se vend par petites parts.",
    },
    directShares: {
      label: "Acheter des actions en direct plutôt qu'un fonds ?",
      hint: "Seulement si vous voulez choisir et suivre vous-même au moins dix grandes entreprises.",
    },
  },

  result: {
    score: "Score de risque {score} sur {max}",
    profileLine: "Votre profil : {profile}",
    suggestedLine: "Suggéré d'après vos réponses : {profile}",
    barLabel: "Votre répartition : {parts}",
    lump: "somme de départ",
    monthly: "Chaque mois",
    whySplit: "Pourquoi cette répartition ?",
    horizon: {
      noEquity: "Vous avez besoin de cet argent d'ici quelques années : la part d'actions est donc passée en revenu fixe.",
      cashOnly: "Vous avez besoin de cet argent d'ici un an : tout reste donc en dépôts ou en bons du Trésor.",
    },
  },

  instrument: {
    title: "{bucket} : {share}",
    primary: "Commencez par",
    alternatives: "Autres choix",
    unavailable: "Non disponible dans votre pays. Gardez cette part en revenu fixe pour l'instant.",
    localName: "Nom local : {name}",
  },

  projection: {
    intro: "{years} ans, {paidIn} versés. Trois scénarios, car personne ne sait lequel se produira.",
    introNone: "Saisissez une somme de départ ou un montant mensuel pour voir la fourchette.",
    low: "Bas",
    base: "Central",
    high: "Haut",
    rate: "{rate} par an",
    real: "{amount} en argent d'aujourd'hui",
    lowLosesValue: "Dans le scénario bas, votre argent croît moins vite que les prix et perd du pouvoir d'achat.",
    why: "Pourquoi ces chiffres ?",
  },

  rebalance: {
    intro: "Saisissez ce que vous détenez aujourd'hui dans chaque part, et l'argent nouveau à ajouter. Nous calculons quoi acheter ou vendre pour revenir à votre répartition.",
    open: "J'investis déjà",
    close: "Masquer",
    holding: "{bucket} : montant actuel",
    newMoney: { label: "Argent nouveau à ajouter (facultatif)", hint: "L'argent nouveau va d'abord aux parts en retard." },
    clear: "Effacer ce que je détiens",
    total: "Total après le changement : {amount}",
    buy: "Acheter {amount}",
    sell: "Vendre {amount}",
    none: "Aucun changement",
    target: "Cible {share}",
    drift: "Actuellement {current}, à {drift} de la cible",
    points: "{value} points",
    triggered: "Au moins une part s'écarte de plus de {band} de sa cible : il est temps de rééquilibrer.",
    withinBand: "Chaque part est à moins de {band} de sa cible. Rééquilibrez quand même une fois par an.",
    newMoneyOnly: "L'argent nouveau suffit à combler l'écart : rien à vendre.",
    sellNote: "Vendre entraîne des frais de sortie et parfois un impôt. Si possible, orientez plutôt l'argent nouveau vers les parts en retard au cours des prochains mois.",
    why: "Pourquoi ces opérations ?",
  },

  netWorth: {
    inMix: "Investi dans la répartition",
    property: "Immobilier (hors répartition)",
    total: "Patrimoine net",
  },

  note: {
    capApplied: "La part d'actions est maintenue au plafond, quel que soit votre horizon.",
    horizonNoEquity: "Vous avez besoin de cet argent d'ici cinq ans : il ne contient donc pas d'actions. Les actions peuvent rester basses pendant des années.",
    horizonCashOnly: "Vous avez besoin de cet argent d'ici un an : il reste donc uniquement en dépôts courts ou en bons du Trésor.",
    propertyExcluded: "L'immobilier compte dans votre patrimoine net mais pas dans la répartition : il ne s'achète ni ne se vend par petites parts et ne se rééquilibre pas.",
    lowLosesValue: "Dans le scénario bas, l'argent croît moins vite que les prix : il achète donc moins que ce que vous avez versé.",
    noIndexFund: "Aucun fonds indiciel, obligation indexée sur l'or ou fonds immobilier n'est vendu ici : la part d'actions utilise donc un fonds ouvert diversifié, et l'or s'achète en lingots ou en pièces.",
    neverBreakCertificates: "Ne revendez jamais un bon d'épargne avant terme pour rééquilibrer : le rendement chute fortement en cas de sortie les premières années. Utilisez plutôt de l'argent nouveau.",
    exitCosts: "Avant de vendre, vérifiez les frais de sortie, l'impôt sur les dividendes et le prix qu'un bijoutier paiera pour l'or.",
  },

  gate: {
    noEmergencyFund: "Remplissez d'abord votre fonds d'urgence. De l'argent à long terme que vous pourriez devoir vendre en urgence n'est pas de l'argent à long terme.",
    cardDebt: "Remboursez d'abord vos dettes de carte. Les intérêts de carte sont bien plus élevés que ce qu'un placement a des chances de rapporter.",
  },

  howto: {
    fixedIncome:
      "Les bons d'épargne d'État se vendent dans les agences bancaires et bureaux de poste qui les proposent, les bons et obligations du Trésor via le service titres d'État d'une banque, et les dépôts à terme dans toute banque agréée. Apportez votre pièce d'identité ; les montants plus élevés demandent un numéro fiscal ou une preuve de déclaration d'impôt.",
    equityFund:
      "Choisissez un fonds ouvert diversifié et lancez un plan mensuel auprès de la société de gestion ou d'une banque qui vend ses parts. Apportez votre pièce d'identité et un relevé de compte bancaire. Répartissez sur de nombreuses entreprises ; ne mettez jamais cette part dans une seule action.",
    directShares:
      "Il vous faut un compte-titres auprès d'un courtier. Détenez au moins dix grandes entreprises dans cinq secteurs ou plus, sans qu'une seule action dépasse un dixième de cette part. Prévoyez de les suivre vous-même.",
    gold: "Achetez des lingots ou des pièces 22 carats chez un bijoutier membre de l'association des bijoutiers, et gardez le reçu. Les bijoux coûtent des frais de façon et se revendent moins cher : ils sont faits pour être portés, pas pour investir.",
  },
};
