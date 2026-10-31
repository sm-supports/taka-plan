import type { Dictionary } from "../../types";

/** M3 Debt health check. `path.*` covers M3_PATH_KEYS, `flag.<DebtFlagId>` covers every DebtFlagId. */
export const m3: Dictionary["m3"] = {
  title: "Bilan des dettes",
  intro: "Listez chaque prêt et chaque carte par taux. Remboursez d'abord le plus cher, et n'empruntez jamais pour votre train de vie.",

  input: {
    takeHome: { label: "Revenu net mensuel", hint: "Ce qui arrive vraiment sur votre compte chaque mois." },
    essentials: { label: "Dépenses essentielles mensuelles", hint: "Loyer, nourriture, charges, transport, frais de scolarité, aide aux parents." },
    savingsTarget: { label: "Épargne mensuelle", hint: "Votre montant « épargne d'abord » issu du budget. Il est réservé avant toute mensualité." },
    cashBuffer: { label: "Marge de sécurité", hint: "Un peu de marge chaque mois pour l'imprévu. Nous proposons une part du revenu net ; modifiez-la si vous voulez." },
    extraMonthly: { label: "En plus pour les dettes chaque mois", hint: "Tout ce qui dépasse vos paiements minimums. Laissez vide pour utiliser la marge disponible." },
    loans: {
      title: "Prêts",
      add: "Ajouter un prêt",
      remove: "Retirer le prêt",
      empty: "Aucun prêt ajouté.",
      type: { label: "Type de prêt", hint: "Choisissez le plus proche ; cela ne change que le libellé." },
      outstanding: { label: "Montant restant dû", hint: "Le capital restant aujourd'hui, d'après votre dernier relevé." },
      annualRate: { label: "Taux d'intérêt (annuel)", hint: "Le taux indiqué sur votre contrat de prêt ou votre relevé." },
      emi: { label: "Mensualité", hint: "Le montant fixe que vous payez chaque mois." },
      monthsLeft: { label: "Mois restants", hint: "Échéances qu'il reste à payer." },
    },
    cards: {
      title: "Cartes de crédit",
      add: "Ajouter une carte",
      remove: "Retirer la carte",
      empty: "Aucune carte ajoutée.",
      balance: { label: "Solde dû", hint: "Le montant de votre dernier relevé." },
      limit: { label: "Plafond de la carte", hint: "Le maximum que la banque vous laisse dépenser." },
      annualRate: { label: "Taux d'intérêt (annuel)", hint: "Laissez vide pour utiliser le taux légal ou habituel des cartes." },
      paysInFull: { label: "Payez-vous la facture en entier chaque mois, pendant la période sans intérêts ?", hint: "Si oui, la carte ne vous coûte rien. Sinon, c'est l'argent le plus cher que vous ayez." },
    },
    scenario: {
      title: "Combien pourrais-je emprunter ?",
      annualRate: { label: "Taux du prêt (annuel)", hint: "Le taux qu'une banque vous a proposé, ou notre valeur par défaut pour un prêt personnel." },
      months: { label: "Durée de remboursement", hint: "En mois." },
    },
  },

  result: {
    totalEmi: "Total des mensualités",
    emiRatio: "Mensualités en part du revenu net",
    emiCapacity: "Capacité de remboursement",
    emiCapacityHint: "Ce qui reste pour les mensualités après l'épargne, l'essentiel et une marge de sécurité.",
    headroom: "Marge disponible",
    headroomHint: "Capacité de remboursement moins les mensualités que vous payez déjà.",
    maxAffordableLoan: "Prêt maximal supportable",
    scenario: "À {rate} sur {months}",
    scenarioEmi: "Mensualité de ce prêt",
    flags: "Alertes",
    noFlags: "Aucune alerte. Vos dettes sont sous contrôle.",
    noDebt: "Aucun prêt ni carte. Rien à corriger ici : continuez ainsi.",
    highInterestDebts: "Dettes à plus de {threshold} par an",
    payoffOrder: "Ordre de remboursement",
    payoffOrderHint: "Le taux le plus élevé d'abord. Payez le minimum sur tout le reste et mettez chaque somme disponible sur la dette en tête de liste.",
    avalanche: "Taux le plus élevé d'abord",
    snowball: "Plus petit solde d'abord",
    interestSaved: "Intérêts économisés en commençant par le taux le plus élevé",
    payoffMonths: "Libéré des dettes dans {months}",
    totalInterest: "Total des intérêts",
    minPayment: "Paiement minimum",
    path: "Si vous vous sentez pris au piège",
    emiRatioNote: "Les prêteurs fixent leurs propres limites. Nous signalons tout ce qui dépasse {threshold} du revenu net, car il reste alors peu pour épargner ou encaisser un coup dur.",
    maxLoanNote: "La formule exacte donne environ {loan} pour une mensualité de {emi} à {rate} sur {months}. Les banques regardent aussi vos revenus et votre historique : gardez votre propre marge de sécurité avant d'emprunter.",
    primaryFlag: "Le plus urgent",
    otherFlags: "À corriger aussi",
    cardLabel: "Carte de crédit",
    extraUsed: "En plus pour les dettes : {amount} par mois",
    compare: "Par rapport au plus petit solde d'abord",
    numbers: "Vos chiffres",
    borrow: "Combien pourrais-je emprunter ?",
  },

  profile: {
    title: "D'après votre profil",
    hint: "Modifiez-les et votre plan se met aussi à jour.",
  },

  demoBanner: "Chiffres d'exemple. Ajoutez vos propres prêts et cartes pour voir votre situation réelle.",

  flag: {
    card_carried: {
      title: "Solde de carte reporté après l'échéance",
      body: "Les intérêts sur un solde de carte reporté tournent autour de {rate} par an : c'est l'argent le plus cher qui soit. Remboursez-le avant toute autre dette.",
    },
    card_utilisation: {
      title: "Carte utilisée à plus de {threshold} du plafond",
      body: "Vous utilisez {value} du plafond de votre carte. Restez sous la moitié : la facture baisse, votre dossier CIB est protégé et il reste de la marge pour une vraie urgence.",
    },
    emi_ratio: {
      title: "Mensualités au-dessus de {threshold} du revenu net",
      body: "{value} de votre revenu net part en mensualités. Les prêteurs fixent leurs propres limites ; nous signalons tout ce qui dépasse {threshold}, car il reste alors peu pour épargner ou encaisser un coup dur.",
    },
    negative_capacity: {
      title: "Aucune place pour une mensualité",
      body: "Après l'épargne, l'essentiel et une marge de sécurité, il ne reste rien pour rembourser un prêt. Réduisez vos dépenses, augmentez vos revenus ou restructurez la dette avant d'emprunter davantage.",
    },
  },

  path: {
    listLoans: "Notez chaque prêt et chaque carte : le montant dû, le taux et le paiement mensuel. Triez par taux, du plus élevé au plus bas.",
    tellFamily: "Parlez-en à votre famille. Cacher une dette la fait grossir ; un foyer informé peut réduire ses dépenses ensemble.",
    stopBorrowing: "Arrêtez tout nouvel emprunt, y compris les achats par carte que vous ne pouvez pas payer en entier ce mois-ci.",
    sellUnaffordable: "Revendez ce que vous avez acheté à crédit sans vraiment en avoir les moyens (une moto, un téléphone, un gadget) et mettez l'argent sur la dette la plus chère.",
    refinanceCheaper: "Ne refinancez que si le nouveau prêt est nettement moins cher frais compris, et jamais pour libérer de la place pour plus de dépenses.",
  },

  status: {
    red: "Dette coûteuse : agissez maintenant",
    amber: "Gérable, mais à surveiller",
    green: "Dettes sous contrôle",
  },
};
