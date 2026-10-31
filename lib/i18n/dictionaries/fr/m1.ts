import type { Dictionary } from "../../types";

/** M1 Emergency fund. `rule.*` covers M1_RULE_KEYS, `next.*` covers M1_NEXT_KEYS. */
export const m1: Dictionary["m1"] = {
  title: "Fonds d'urgence",
  intro: "De l'argent accessible en un ou deux jours quand le revenu s'arrête ou qu'une facture tombe. Dimensionnez-le pour votre famille, pas selon une règle fixe.",
  demo: "Chiffres d'exemple pour l'aperçu uniquement. Vos propres réponses ne sont pas utilisées ici.",

  section: {
    inputs: "Vos chiffres",
    result: "Votre fonds d'urgence",
    rules: "Règles pour cet argent",
    nextStep: "Étape suivante",
  },

  input: {
    essentials: {
      label: "Dépenses essentielles mensuelles",
      hint: "Loyer, nourriture, charges, transport, frais de scolarité, aide aux parents, mensualités en cours.",
    },
    incomeType: {
      label: "Comment vous gagnez votre vie",
      hint: "Un revenu d'indépendant ou d'entreprise est moins régulier : la réserve démarre donc plus haut.",
    },
    dependents: {
      label: "Qui dépend de vous",
      hint: "Cochez tout ce qui s'applique.",
    },
    soleEarner: {
      label: "Êtes-vous le seul revenu du foyer ?",
      hint: "Si personne d'autre ne rapporte d'argent, le fonds doit durer plus longtemps.",
    },
    hasHealthInsurance: {
      label: "Avez-vous une assurance santé ?",
      hint: "Sans couverture, une facture d'hôpital sort de ce fonds : il doit donc être plus gros.",
    },
    liquidSavings: {
      label: "Épargne accessible aujourd'hui",
      hint: "Espèces, comptes d'épargne et dépôts que vous pourriez retirer en quelques jours. Pas l'argent placé en {product}, en actions ou en or.",
    },
    months: {
      label: "Mois de couverture",
      hint: "Nous proposons un point de départ ; ajustez selon ce qui convient à votre famille, de {min} à {max} mois.",
      suggested: "Suggestion : {months}",
      useSuggested: "Utiliser la suggestion",
    },
    buildMonths: {
      label: "Le constituer en",
      hint: "Le nombre de mois que vous voulez prendre pour remplir le fonds.",
    },
  },

  result: {
    suggestedMonths: "Couverture suggérée : {months}",
    months: "Mois de couverture",
    target: "Objectif",
    saved: "Déjà épargné",
    gap: "Reste à épargner",
    monthlySaving: "Épargne mensuelle",
    monthsCovered: "Mois couverts",
    monthsCoveredOf: "{covered} mois couverts sur {months}",
    monthsToFull: "Plein dans {months}",
    full: "Votre fonds d'urgence est plein",
    tiers: {
      title: "Où le garder",
      savingsAccount: "Compte d'épargne disponible le jour même",
      savingsAccountHint: "Un mois de dépenses essentielles, retirable le jour même.",
      fdrLadder: "Échelle de FDR à 3 mois",
      fdrLadderHint: "Le reste, dans trois FDR ouverts à un mois d'écart, pour que l'un arrive à échéance chaque mois.",
      fdrPerSlice: "Chaque FDR",
      fdrSlices: "Trois FDR de {amount} chacun, un ouvert chaque mois.",
      banksNeeded: "Banques à utiliser",
      banksNeededHint: "La garantie des dépôts ne couvre que {limit} par banque : ne gardez donc pas plus que cela dans une même banque.",
      sanchayapatraLayer: "Troisième niveau : {product}",
      sanchayapatraLayerHint: "Votre réserve est assez grande pour qu'une partie soit placée en {product}, qui rapporte plus mais coûte une pénalité en cas de retrait anticipé.",
    },
  },

  rule: {
    noStocks: "Pas d'actions ni de fonds actions pour cet argent. Il doit être là, à sa pleine valeur, même un mauvais jour.",
    sanchayapatraThirdLayer: "Le placement en {product} n'est qu'un troisième niveau, pour une très grosse réserve : il rapporte plus, mais un retrait anticipé vous coûte une partie du gain.",
    cardBridge: "Une carte de crédit peut faire le lien pendant le jour ou les deux jours qu'il faut pour retirer un FDR, à condition de payer la facture en entier pendant la période sans intérêts.",
    refill: "Vous avez puisé dans le fonds ? Reconstituez-le avant de placer de l'argent ailleurs.",
    notAnEmergency: "Des vacances, un téléphone ou un cadeau de mariage ne sont pas des urgences. Traitez-les comme des objectifs d'épargne.",
  },

  next: {
    openSavings: "Ouvrez un compte d'épargne dans n'importe quelle banque avec votre pièce d'identité ; versez-y un mois de dépenses essentielles et mettez en place un virement permanent pour le reste.",
    fdrLadder: "Rendez-vous dans une banque avec votre pièce d'identité et votre numéro fiscal ; demandez un {product} à 3 mois. Ouvrez-en un chaque mois pendant trois mois, pour qu'il y en ait un qui arrive à échéance chaque mois.",
    splitBanks: "Votre fonds dépasse le plafond de garantie des dépôts d'une banque. Ouvrez des FDR dans une deuxième banque pour qu'aucune ne détienne plus que ce plafond.",
    full: "Votre fonds est plein. Renouvelez les FDR au fil des échéances, et reconstituez le fonds après tout retrait avant d'épargner ailleurs.",
  },

  status: {
    red: "Moins d'un mois couvert",
    amber: "Partiellement couvert — continuez",
    green: "Entièrement couvert",
  },
};
