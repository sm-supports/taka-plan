import type { Dictionary } from "../../types";

/** Insurance & health screen (M2). `check.claimSettlement` takes {claimSettlement}; see ../en/m2.ts. */
export const m2: Dictionary["m2"] = {
  title: "Assurance et santé",
  intro: "La couverture décès et santé dont votre famille a besoin, son coût approximatif, et comment vérifier un assureur avant de signer.",
  demo: "Chiffres d'exemple pour l'aperçu uniquement. Vos propres réponses ne sont pas utilisées ici.",
  backToPlan: "Retour à mon plan",

  needProfile: {
    title: "D'abord, quelques questions sur vous",
    body: "Ce bilan utilise votre âge, votre revenu et les personnes qui dépendent de vous. Répondez aux cinq questions de départ, puis revenez ici.",
    cta: "Répondre aux questions",
  },

  flow: {
    eyebrow: "Bilan d'assurance",
    smoker: {
      title: "Fumez-vous ou consommez-vous du tabac ?",
      hint: "Les assureurs font payer plus cher l'assurance décès aux fumeurs : la fourchette de prix en dépend.",
    },
    lifeCover: {
      title: "Quel capital décès avez-vous déjà ?",
      hint: "Additionnez le capital assuré de chaque contrat décès que vous avez, y compris celui de votre employeur. Saisissez 0 si vous n'en avez pas.",
      none: "Je n'en ai pas",
    },
    healthCover: {
      title: "Quelle couverture santé votre famille a-t-elle déjà ?",
      hint: "Le plafond annuel de votre contrat santé ou de celui de votre employeur, pour tout le monde ensemble. Saisissez 0 si vous n'en avez pas.",
      none: "Nous n'en avons pas",
    },
    people: {
      title: "Qui la couverture santé doit-elle inclure ?",
      hint: "Nous l'avons rempli d'après les personnes qui dépendent de vous. Modifiez-le si quelqu'un d'autre doit être couvert.",
    },
    seeResult: "Voir mon résultat",
  },

  section: {
    inputs: "Vos réponses",
    result: "La couverture dont votre famille a besoin",
    notes: "Bon à savoir",
  },

  input: {
    smoker: {
      label: "Fumez-vous ou consommez-vous du tabac ?",
      hint: "Les fumeurs paient plus cher l'assurance décès. Indiquez-le aussi sur tout formulaire de souscription.",
    },
    existingLifeCover: {
      label: "Assurance décès que vous avez déjà",
      hint: "Le capital assuré de chaque contrat décès que vous avez, y compris celui de votre employeur. 0 si aucun.",
    },
    existingHealthCover: {
      label: "Couverture santé que la famille a déjà",
      hint: "Le plafond annuel de chaque contrat santé, le vôtre ou celui de votre employeur, pour tout le monde ensemble. 0 si aucun.",
    },
    people: {
      label: "Qui la couverture santé inclut",
      hint: "Cochez toutes les personnes à couvrir.",
    },
    childrenCount: {
      label: "Enfants à couvrir",
    },
    parentsCount: {
      label: "Parents à couvrir",
    },
    parentAge: {
      label: "Âge du parent le plus âgé",
      hint: "La couverture santé coûte plus cher avec l'âge : la fourchette de prix en tient compte.",
    },
    coverToAge: {
      label: "Assurance décès jusqu'à l'âge de",
      hint: "La plupart des familles ne dépendent plus de votre revenu une fois les enfants grands : la couverture va donc rarement au-delà de la retraite.",
    },
    incomeShare: {
      label: "Part de votre revenu dont la famille aurait besoin",
      hint: "Sans vous, certains frais disparaissent : la famille a besoin d'une partie de votre revenu, pas de la totalité.",
    },
    investments: {
      label: "Placements que la famille pourrait vendre",
      hint: "Actions, fonds, bons d'épargne ou or. Votre épargne d'urgence est déjà comptée.",
    },
    youngestChildAge: {
      label: "Âge de votre plus jeune enfant (facultatif)",
      hint: "L'assurance décès court alors jusqu'à ce que cet enfant puisse subvenir à ses besoins, si cela arrive avant l'âge ci-dessous.",
    },
  },

  person: {
    self: "Moi",
    partner: "Conjoint",
    child: "Enfants",
    parent: "Parents",
  },

  status: {
    red: "Couverture très insuffisante",
    amber: "Une partie de la couverture manque",
    green: "Couvert pour l'instant",
  },

  life: {
    title: "Assurance décès",
    label: "Assurance décès nécessaire pour votre famille",
    multiple: "Environ {multiple} fois votre revenu annuel",
    existing: "Couverture que vous avez déjà",
    gap: "Reste à souscrire",
    years: "Années couvertes",
    yearsValue: "{years} (jusqu'à {age} ans)",
    incomeNeed: "Pour remplacer votre revenu",
    incomeNeedHint: "Ce dont la famille aurait besoin sur ces années, en argent d'aujourd'hui.",
    enough: "Votre couverture actuelle suffit pour l'instant.",
    notNeeded: "Pas encore nécessaire",
    why: "Pourquoi {amount} d'assurance décès ?",
    status: {
      red: "L'essentiel de la couverture manque",
      amber: "Une partie de la couverture manque",
      green: "Assurance décès suffisante",
    },
  },

  health: {
    title: "Couverture santé",
    label: "Couverture santé pour la famille",
    caption: "Pour {people} personnes",
    captionOne: "Pour {people} personne",
    perPerson: "Par adulte",
    perPersonHint: "À peu près ce que vous coûterait une hospitalisation.",
    existing: "Couverture que la famille a déjà",
    gap: "Reste à souscrire",
    enough: "La couverture santé de la famille suffit pour l'instant.",
    why: "Pourquoi {amount} de couverture santé ?",
    status: {
      red: "L'essentiel de la couverture manque",
      amber: "Une partie de la couverture manque",
      green: "Couverture santé suffisante",
    },
  },

  premium: {
    title: "Ce que cela pourrait coûter",
    monthly: "À mettre de côté chaque mois",
    caption: "Votre plan met ce montant de côté pour les deux couvertures.",
    captionNone: "Rien de plus à mettre de côté : votre couverture actuelle suffit pour l'instant.",
    captionHealth: "Votre plan met ce montant de côté pour la couverture santé.",
    captionLife: "Votre plan met ce montant de côté pour l'assurance décès temporaire.",
    life: "Assurance décès, par an",
    lifeHint: "Pour {gap} de couverture.",
    smokerHint: "Pour {gap} de couverture, au tarif fumeur.",
    health: "Couverture santé, par an",
    healthHint: "Pour {gap} de couverture en plus.",
    range: "{low} – {high}",
    none: "Rien de plus à souscrire",
    indicative: "Fourchettes indicatives, pas des devis",
    why: "Pourquoi {amount} par mois ?",
  },

  policy: {
    title: "Vous payez déjà un contrat avec épargne ?",
    hint: "Un contrat qui vous reverse de l'argent à la fin (assurance mixte). Voyez comment il se compare à une simple assurance décès temporaire.",
    intro: "Saisissez les chiffres de vos documents de contrat. Nous comparons ce que le contrat verse à la fin avec une assurance décès temporaire du même montant, le reste de la prime étant placé dans un dépôt sûr.",
    annualPremium: {
      label: "Prime que vous payez chaque année",
    },
    sumAssured: {
      label: "Capital décès du contrat",
      hint: "Le capital assuré inscrit sur le contrat.",
    },
    termYears: {
      label: "Durée totale du contrat",
    },
    yearsPaid: {
      label: "Années déjà payées",
    },
    expectedMaturity: {
      label: "Montant versé par le contrat à la fin",
      hint: "La valeur à l'échéance dans la simulation de l'assureur, avec la participation attendue.",
    },
    surrenderValue: {
      label: "Ce que l'assureur paierait si vous arrêtiez aujourd'hui (facultatif)",
      hint: "La valeur de rachat ou de réduction ; demandez-la à l'assureur. Sans elle, la comparaison ignore ce que l'arrêt vous rendrait.",
    },
    incomplete: "Remplissez les cinq chiffres pour voir la comparaison.",
    keep: "Si vous gardez le contrat",
    keepHint: "Versé à la fin du contrat.",
    alternative: "Assurance temporaire et épargne de la différence",
    alternativeHint: "Le reste de chaque prime est placé en {instrument} pendant les {years} restants.",
    atLeast: "Au moins {amount}",
    surrenderPart: "Dont {amount} de valeur de rachat, capitalisés jusqu'à la fin.",
    termPremium: "Assurance temporaire du même montant, par an",
    remaining: "Années restant à payer",
    irr: "Rendement annuel du contrat",
    irrHint: "Ce que rapportent les primes chaque année si le contrat verse ce qu'annonce la simulation.",
    verdict: {
      termPlusInvestAhead: "Avec ces chiffres, l'assurance temporaire et l'épargne de la différence pourraient vous laisser environ {amount} de plus à la fin.",
      policyAhead: "Avec ces chiffres, le contrat rapporte environ {amount} de plus que l'assurance temporaire et l'épargne de la différence.",
      similar: "Avec ces chiffres, les deux options aboutissent à peu près au même résultat.",
    },
    clear: "Effacer ces chiffres",
    why: "Pourquoi cette comparaison ?",
  },

  checklist: {
    title: "Vérifiez l'assureur avant le contrat",
    intro: "Un contrat ne vaut que par les indemnisations que l'assureur verse vraiment. Parcourez cette liste avant de signer.",
    regulatorLink: "Autorité de contrôle des assurances : {name}",
    complaintsLink: "Où réclamer : {name}",
  },

  note: {
    noDependents: "Personne ne dépend de votre revenu et vous n'avez pas de dettes : vous n'avez donc pas encore besoin d'assurance décès. La couverture santé reste importante.",
    debtsOnly: "Personne ne dépend de votre revenu : l'assurance décès doit seulement couvrir vos dettes, pour qu'elles ne passent jamais à votre famille.",
    publicCoverBroad: "Dans votre pays, le système de santé public paie la plupart des frais d'hôpital : nous calibrons donc votre propre couverture santé sur une part minimale d'une hospitalisation.",
    premiumIndicative: "Les primes sont des fourchettes indicatives tirées de grilles tarifaires courantes, pas des devis. Votre prix dépend de votre santé, de l'assureur et du contrat.",
    noTermSold: "Nous n'avons pas de grille tarifaire pour l'assurance décès temporaire pure dans votre pays : la prime décès affiche donc zéro. Demandez un devis aux assureurs.",
    separateInvesting: "Séparez assurance et placement : la couverture est un coût, comme le loyer, et l'épargne pour l'avenir se fait à part.",
    policyNotAdvice: "Ceci est une comparaison approximative, pas un conseil d'arrêter ou de garder un contrat. Arrêter un contrat tôt fait souvent perdre de l'argent : demandez à l'assureur ce que vous récupéreriez avant de changer quoi que ce soit.",
    policyNoSurrender: "Vous n'avez pas indiqué ce que l'assureur vous rendrait si vous arrêtiez aujourd'hui : nous le comptons donc comme zéro. L'arrêt paraît ici moins intéressant qu'en réalité : demandez la valeur de rachat à l'assureur et ajoutez-la.",
    policyMatured: "Toutes les primes de ce contrat sont déjà payées : il n'y a donc plus rien à comparer. Encaissez la valeur à l'échéance le moment venu.",
    multipleOutsideBand: "Une règle courante veut une assurance décès de dix à quinze fois votre revenu net annuel. La vôtre sort de cette fourchette à cause de votre famille, de vos dettes et de votre épargne ; le chiffre ci-dessus est calculé pour vous.",
    noHealthPriceTable: "Nous n'avons pas de grille tarifaire pour l'assurance santé dans votre pays : la prime santé affiche donc zéro. Demandez aux assureurs un devis pour la couverture ci-dessus.",
  },

  check: {
    regulator: "Vérifiez que l'assureur est agréé par l'autorité de contrôle des assurances. Cherchez-le sur le site de l'autorité avant de signer.",
    claimSettlement: "Demandez quel est le taux de règlement des sinistres de l'assureur. Chez les assureurs vie d'ici, c'est environ {claimSettlement} ; choisissez-en un nettement au-dessus.",
    complaints: "Sachez où réclamer. Si une indemnisation est refusée ou retardée sans raison claire, le service des réclamations de l'autorité peut intervenir.",
    waitingPeriods: "Lisez les délais de carence. Beaucoup de contrats santé ne paient pas certaines maladies la première ou les deux premières années.",
    exclusions: "Lisez la liste de ce qui n'est pas couvert avant de signer, pas après un sinistre.",
    cashlessNetwork: "Vérifiez quels hôpitaux acceptent le contrat sans avance de frais, y compris près de chez votre famille.",
    honestProposal: "Répondez sincèrement à chaque question du formulaire de souscription, y compris sur le tabac et les maladies passées. Une réponse fausse est la cause la plus fréquente de refus d'indemnisation.",
    buyYoung: "Souscrivez tôt. Les primes sont plus basses quand vous êtes jeune et en bonne santé, et une maladie plus tard peut rendre la couverture difficile à obtenir.",
    medicalTests: "Attendez-vous à des examens médicaux pour une couverture élevée. Faites-les : ils protègent vos futures demandes d'indemnisation.",
  },
};
