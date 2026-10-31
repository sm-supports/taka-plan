import type { Dictionary } from "../../types";

/** M4 Save-first budget: income − savings = expenses. */
export const m4: Dictionary["m4"] = {
  title: "Budget « épargne d'abord »",
  intro: "Inversez l'équation. Épargnez d'abord le jour de la paie ; dépensez ce qui reste. L'habitude compte plus que le montant.",
  demo: "Chiffres d'exemple pour l'aperçu uniquement. Vos propres réponses ne sont pas utilisées ici.",

  section: {
    inputs: "Vos chiffres",
    result: "Votre budget « épargne d'abord »",
    where: "Où va l'argent",
    nextStep: "Étape suivante",
  },

  input: {
    takeHome: { label: "Revenu net mensuel", hint: "Ce qui arrive vraiment sur votre compte." },
    essentials: { label: "Dépenses essentielles mensuelles", hint: "Loyer, nourriture, charges, transport, frais de scolarité, aide aux parents, mensualités." },
    incomeType: { label: "Comment vous gagnez votre vie", hint: "Les indépendants et chefs d'entreprise épargnent une part de chaque paiement plutôt qu'une somme fixe." },
    savingsRate: {
      label: "Taux d'épargne",
      hint: "Nous proposons {suggested} du revenu net. Baissez-le à un montant que vous pouvez vraiment tenir.",
      suggested: "Suggestion : {rate}",
      useSuggested: "Utiliser la suggestion",
    },
    payday: { label: "Jour de versement du salaire", hint: "Nous proposerons un virement le lendemain, avant que l'argent soit dépensé." },
    last6Incomes: { label: "Revenus des six derniers mois", hint: "Un montant par mois. Nous utilisons la moyenne comme revenu net.", month: "Mois {n}" },
  },

  result: {
    equation: "{income} − {savings} = {expenses}",
    equationLabel: "Revenu − épargne = dépenses",
    averageIncome: "Revenu mensuel moyen",
    suggestedRate: "Taux d'épargne suggéré",
    feasibleRate: "Épargne maximale possible",
    feasibleRateHint: "Ce qui reste après l'essentiel, en part du revenu.",
    savingsRate: "Taux d'épargne",
    savingsAmount: "À épargner chaque mois",
    expensesAllowed: "Reste à dépenser",
    essentialsShortfall: "Dépassement de l'essentiel",
    essentialsShortfallHint: "Votre essentiel dépasse ce qui reste après l'épargne. Baissez le taux, ou cherchez une dépense essentielle à réduire.",
    modeLabel: "Comment vous épargnez",
    mode: {
      fixed: "Un montant fixe chaque mois",
      percentOfEachPayment: "Une part de chaque paiement reçu",
    },
    percentOfEachPayment: "Versez {percent} de chaque paiement sur votre épargne le jour où il arrive",
    instrument: "Où le placer",
    instrumentHint: "Un DPS est prélevé automatiquement à jour fixe : l'épargne se fait avant que vous puissiez dépenser.",
    transferDay: "Virement permanent le {day} de chaque mois",
    transferDayUnknown: "Indiquez votre jour de paie et nous proposerons une date de virement.",
  },

  next: {
    dps: "Demandez à votre banque d'ouvrir un DPS avec prélèvement automatique le {day} de chaque mois, le lendemain du versement de votre salaire. Tout montant convient ; l'habitude compte plus que la somme.",
    dpsNoPayday: "Demandez à votre banque d'ouvrir un DPS avec prélèvement automatique le lendemain du versement de votre salaire. Tout montant convient ; l'habitude compte plus que la somme.",
    percentOfEachPayment: "Le jour où un paiement arrive, versez-en {percent} sur un compte d'épargne séparé avant d'en dépenser la moindre partie. Gardez la même part les bons et les mauvais mois ; une fois le solde stable, transformez-le en DPS.",
  },

  note: {
    instrumentDps: "Nous proposons un DPS car il est prélevé automatiquement à jour fixe : l'épargne se fait avant que vous puissiez dépenser.",
  },

  status: {
    red: "Aucune épargne pour l'instant",
    amber: "Un peu d'épargne — continuez",
    green: "Épargne d'abord, chaque mois",
  },
};
