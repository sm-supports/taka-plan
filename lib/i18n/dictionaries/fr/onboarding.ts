import type { Dictionary } from "../../types";

/** Country and language steps on "/" (imported there directly; see en/onboarding.ts). */
export const onboardingEntry: Pick<Dictionary["onboarding"], "country" | "language" | "switchCountry"> = {
  country: {
    title: "Où vivez-vous ?",
    subtitle: "Nous utilisons la monnaie, les taux et les produits d'épargne de votre pays.",
    searchLabel: "Rechercher votre pays",
    searchPlaceholder: "Nom du pays, en anglais ou dans votre langue",
    suggested: "Suggestions",
    all: "Tous les pays",
    results: "Pays correspondants",
    noMatch: "Aucun pays ne correspond à « {query} ».",
    currency: "Monnaie : {code}",
    current: "Choix actuel",
    changeLater: "Vous pouvez changer de pays et de langue à tout moment.",
    intro: "Cinq questions rapides, puis votre plan d'épargne mensuel. Aucun compte nécessaire.",
    disclaimer: "Estimations à but éducatif uniquement ; ni conseil financier, fiscal ou juridique.",
    region: {
      south_asia: "Asie du Sud",
      east_asia_pacific: "Asie de l'Est et Pacifique",
      europe_central_asia: "Europe et Asie centrale",
      latin_america_caribbean: "Amérique latine et Caraïbes",
      middle_east_north_africa: "Moyen-Orient et Afrique du Nord",
      north_america: "Amérique du Nord",
      sub_saharan_africa: "Afrique subsaharienne",
    },
  },
  language: {
    title: "Dans quelle langue ?",
    subtitle: "Vous pouvez changer à tout moment depuis le menu en haut.",
    country: "Pays : {country}",
    notAvailable: "Votre langue n'est pas encore disponible ; l'anglais est utilisé.",
    changeCountry: "Changer de pays",
  },
  /** "/" when the user picks another country while answers exist: the amounts are in the old currency. */
  switchCountry: {
    title: "Repartir de zéro pour {country} ?",
    body: "Vos réponses sont en {currency}. Repartir de zéro pour {country} garde vos réponses actuelles en brouillon, que vous pourrez rouvrir à tout moment.",
    capWarning: "Vous avez déjà {max} brouillons : le plus ancien sans nom sera donc supprimé.",
    confirm: "Repartir de zéro",
    cancel: "Garder mes réponses",
    saved: "Enregistré en brouillon",
  },
};

/** Five quick questions, one per screen. */
export const onboarding: Dictionary["onboarding"] = {
  country: onboardingEntry.country,
  language: onboardingEntry.language,
  switchCountry: onboardingEntry.switchCountry,

  languagePick: {
    title: "Dans quelle langue ?",
    subtitle: "Vous pouvez changer à tout moment.",
  },

  progress: "Question {n} sur 5",
  intro: "Cinq questions rapides, puis votre plan. Aucun compte nécessaire.",

  step: {
    1: {
      title: "Quel âge avez-vous ?",
      hint: "Votre âge fixe le temps dont vos objectifs et votre retraite disposent pour grandir.",
      placeholder: "Votre âge en années",
      label: "Votre âge",
      decadeLabel: "Touchez un raccourci, puis corrigez l'âge exact ci-dessous",
      decade: {
        under20: "Moins de 20",
        twenties: "20-29",
        thirties: "30-39",
        forties: "40-49",
        fifties: "50-59",
        sixtyPlus: "60 et plus",
      },
      unit: "ans",
    },
    2: {
      title: "Quel est votre revenu net mensuel ?",
      hint: "Le montant qui arrive vraiment sur votre compte après impôt et caisse de prévoyance.",
      hintFreelance: "Revenu irrégulier ? Additionnez les six derniers mois et divisez par six.",
      placeholder: "Revenu net dans votre monnaie",
      label: "Revenu net mensuel",
      incomeTypeLabel: "Comment gagnez-vous votre vie ?",
      incomeTypeHint: {
        salaried: "Un salaire fixe chaque mois",
        freelance: "Des paiements de projets ou de clients qui varient",
        business: "Le bénéfice que vous tirez de votre entreprise",
      },
      average: {
        toggle: "Le calculer sur les six derniers mois",
        title: "Revenus des six derniers mois",
        hint: "Saisissez ce que vous avez reçu chaque mois. Laissez vide un mois sans revenu.",
        month: "Mois {n}",
        result: "Moyenne sur six mois : {amount}",
        use: "Utiliser {amount} comme revenu net",
        close: "Masquer",
      },
    },
    3: {
      title: "Combien dépensez-vous pour l'essentiel chaque mois ?",
      hint: "Loyer, nourriture, charges, transport, frais de scolarité, aide aux parents et toutes les mensualités de prêt que vous payez déjà. Laissez de côté restaurants, shopping et vacances.",
      placeholder: "Dépenses essentielles dans votre monnaie",
      label: "Dépenses essentielles mensuelles",
      countsTitle: "Ce qui compte comme essentiel",
      counts: {
        rent: "Loyer ou mensualité de prêt immobilier",
        food: "Nourriture et courses",
        utilities: "Électricité, gaz, eau, téléphone et internet",
        transport: "Transport",
        school: "Frais de scolarité et cours",
        parents: "Aide que vous envoyez à vos parents",
        emi: "Toute mensualité de prêt ou de carte déjà payée",
      },
      leaveOut: "Laissez de côté restaurants, shopping, gadgets et vacances.",
      takeHomeReminder: "Votre revenu net : {amount}",
      leftOver: "Reste après l'essentiel : {amount}",
    },
    4: {
      title: "Qui dépend de votre revenu ?",
      hint: "Cochez tout ce qui s'applique. Les personnes à charge changent votre réserve d'urgence et vos besoins d'assurance.",
      none: "Personne ne dépend de moi",
      label: "Personnes à charge",
      option: {
        partner: "Conjoint",
        children: "Enfants",
        parents: "Parents",
      },
      optionHint: {
        partner: "Un conjoint qui compte sur votre revenu",
        children: "Tout enfant que vous faites vivre",
        parents: "Parents ou beaux-parents que vous aidez",
      },
    },
    5: {
      title: "Avez-vous des prêts ou un solde de carte de crédit reporté ?",
      hint: "Comptez les prêts bancaires, auto ou immobiliers, et toute facture de carte que vous ne payez pas en entier chaque mois.",
      yes: "Oui, j'ai des dettes",
      no: "Pas de dettes",
      label: "Prêts ou soldes de carte",
      yesNote: "Bon à savoir. Votre plan inclura un bilan des dettes pour rembourser d'abord la plus chère.",
      noNote: "Parfait. Votre plan peut passer directement à l'épargne.",
      readyTitle: "C'est tout",
      ready: "Votre plan est construit à partir de ces cinq réponses. Vous pourrez les modifier plus tard.",
    },
  },

  summary: {
    age: "{age} ans",
    takeHome: "Revenu net {amount}",
    essentials: "Essentiel {amount}",
    /** {list}: the people who depend on the user, already joined ("Conjoint, Enfants"). */
    dependents: "À votre charge : {list}",
    noDependents: "Personne à votre charge",
    debt: "A des prêts ou des dettes de carte",
    noDebt: "Pas de dettes",
  },

  cta: {
    start: "Commencer",
    seePlan: "Voir mon plan",
    next: "Suivant",
    back: "Retour",
  },

  validation: {
    required: "Saisissez un nombre pour continuer.",
    number: "Saisissez uniquement des chiffres, comme {example}.",
    ageRange: "Saisissez un âge entre {min} et {max}.",
    positiveAmount: "Saisissez un montant supérieur à zéro.",
    essentialsAboveIncome: "L'essentiel dépasse votre revenu net. Vérifiez les deux chiffres : le plan peut quand même fonctionner, mais le montant d'épargne sera très faible.",
    pickOne: "Choisissez au moins une option, ou « Personne ne dépend de moi ».",
  },
};
