import type { Dictionary } from "../../types";

/**
 * Retirement & family screen (M7, "Plan to 100"). Tone: independence and dignity, never fear;
 * no death imagery. See ../en/m7.ts.
 */
export const m7: Dictionary["m7"] = {
  title: "Retraite et famille",
  intro: "Combien mettre de côté pour vivre de votre propre argent, à votre façon, jusqu'à 100 ans.",
  introRetired: "Combien vous pouvez retirer de votre épargne chaque mois pour que votre argent dure, à votre façon, jusqu'à 100 ans.",
  demo: "Chiffres d'exemple pour l'aperçu uniquement. Vos propres réponses ne sont pas utilisées ici.",

  flow: {
    mode: {
      title: "Travaillez-vous encore, ou êtes-vous déjà à la retraite ?",
      hint: "En activité, nous calculons ce qu'il faut mettre de côté chaque mois. À la retraite, nous calculons ce que vous pouvez retirer chaque année.",
    },
    age: {
      title: "Quel âge avez-vous ?",
      hint: "Repris de votre plan. Modifiez-le s'il n'est pas juste.",
      label: "Votre âge",
    },
    retirementAge: {
      title: "À quel âge voulez-vous arrêter de travailler ?",
      hint: "La plupart des emplois du secteur privé s'arrêtent à {age} ans. Choisissez l'âge qui convient à votre travail et à votre santé.",
      label: "Âge de départ à la retraite",
    },
    spending: {
      title: "Combien votre foyer dépense-t-il par mois aujourd'hui ?",
      hint: "En argent d'aujourd'hui. Nous sommes partis de vos dépenses essentielles ; ajoutez ce que vous paieriez encore après avoir arrêté de travailler.",
      label: "Dépenses du foyer par mois",
    },
    savings: {
      title: "Qu'avez-vous épargné et investi jusqu'ici ?",
      hint: "Épargne, dépôts, {product}, fonds et actions que vous garderiez pour plus tard. Pas votre logement, ni votre caisse de prévoyance (elle vient ensuite).",
      label: "Épargne et placements aujourd'hui",
    },
    monthlySaving: {
      title: "Combien mettez-vous de côté chaque mois en ce moment ?",
      hint: "Uniquement l'argent mis de côté pour plus tard. Zéro est une bonne réponse : c'est là que le plan commence.",
      label: "Épargne mensuelle actuelle",
    },
    sex: {
      title: "Êtes-vous un homme ou une femme ?",
      hint: "Facultatif. Les femmes vivent en moyenne environ deux ans de plus, et l'allocation vieillesse commence à un âge différent.",
      skip: "Passer cette question",
    },
    retireeType: {
      title: "Avez-vous pris votre retraite du public ou du privé ?",
      hint: "Les retraités de la fonction publique, du parapublic et des forces armées ont accès à un bon d'épargne qui leur est réservé.",
    },
    retiredSavings: {
      title: "Quelle épargne avez-vous aujourd'hui ?",
      hint: "Vos versements de caisse de prévoyance et d'indemnité de fin de service, vos FDR, vos bons d'épargne et tout ce dont vous vivez.",
      label: "Épargne actuelle",
    },
    otherIncome: {
      title: "Qu'est-ce qui rentre d'autre chaque mois ?",
      hint: "Une pension, un loyer ou tout autre revenu en plus de votre épargne. Laissez zéro s'il n'y a rien.",
      label: "Autres revenus par mois",
    },
    retiredSpending: {
      title: "Combien votre foyer dépense-t-il par mois ?",
      hint: "Tout compris, y compris les médicaments et l'aide à domicile.",
      label: "Dépenses du foyer par mois",
    },
    seeResult: "Voir mon plan jusqu'à 100 ans",
  },

  mode: {
    working: "En activité",
    workingHint: "Trouver l'épargne mensuelle pour tenir jusqu'à 100 ans",
    retired: "Déjà à la retraite",
    retiredHint: "Trouver un retrait annuel pour tenir jusqu'à 100 ans",
  },
  sex: {
    male: "Homme",
    female: "Femme",
    unknown: "Je préfère ne pas répondre",
  },
  retireeType: {
    government: "Public",
    governmentHint: "Fonction publique, parapublic ou forces armées",
    private: "Privé ou indépendant",
    privateHint: "Salarié du privé, entrepreneur ou indépendant",
  },

  section: {
    inputs: "Vos chiffres",
    sources: "Revenus après l'arrêt du travail",
    result: "Votre plan",
  },

  input: {
    mode: "En activité ou à la retraite",
    age: {
      label: "Votre âge",
      hint: "Le modifier ici le modifie aussi dans votre plan.",
    },
    sex: {
      label: "Homme ou femme (facultatif)",
      hint: "Utilisé seulement pour deux remarques : les femmes vivent plus longtemps en moyenne, et l'âge de l'allocation vieillesse.",
    },
    retirementAge: {
      label: "Âge de départ à la retraite",
      hint: "L'âge habituel ici est {age} ans.",
    },
    planToAge: {
      label: "Planifier jusqu'à l'âge de",
      hint: "Par défaut, nous planifions jusqu'à 100 ans. Vous pouvez descendre jusqu'à {min}, jamais moins, ou monter jusqu'à {max}.",
    },
    spending: {
      label: "Dépenses du foyer par mois, aujourd'hui",
      hint: "En argent d'aujourd'hui ; nous les faisons évoluer avec les prix jusqu'à l'année où vous arrêtez de travailler.",
    },
    savings: {
      label: "Épargne et placements aujourd'hui",
      hint: "Gardés pour plus tard. Pas votre logement, ni votre caisse de prévoyance.",
    },
    monthlySaving: {
      label: "Épargne mensuelle actuelle",
      hint: "Ce que vous mettez déjà de côté pour plus tard.",
    },
    retireeType: "Secteur de départ à la retraite",
    retiredSavings: {
      label: "Épargne actuelle",
      hint: "Tout ce dont vous vivez : versements, FDR, bons d'épargne.",
    },
    otherIncome: {
      label: "Autres revenus par mois",
      hint: "Une pension, un loyer ou tout autre revenu en plus de votre épargne.",
    },
  },

  sources: {
    intro: "Ajoutez ce que vous pensez avoir. Chaque source réduit ce que vous devez épargner.",
    add: "Ajouter",
    remove: "Retirer",
    notCounted: "Non compté",
    lowered: "Vos sources de revenus réduisent l'épargne mensuelle de {amount}.",
    retiredIntro: "Vos autres revenus sont déjà comptés ci-dessus. Ces deux-là sont montrés pour avoir une vue complète, jamais comptés.",
    pf: {
      title: "Caisse de prévoyance",
      hint: "Fructifie au taux propre de la caisse, puis vous est versé en capital quand vous arrêtez de travailler.",
      balance: "Solde aujourd'hui",
      contribution: "Versé chaque mois (votre part plus celle de l'employeur)",
      contributionHint: "Les grands employeurs versent désormais à peu près autant que vous ; vérifiez votre fiche de paie.",
      rate: "Taux annuel de la caisse",
      rateHint: "D'après le relevé annuel de votre caisse. Nous n'en supposons jamais un, car les caisses diffèrent.",
    },
    gratuity: {
      title: "Indemnité de fin de service",
      hint: "Un capital versé à votre départ : un nombre de jours du dernier salaire de base par année de service, selon la loi, ou selon la règle de votre employeur si elle est plus favorable.",
      years: "Années de service à votre départ",
      basic: "Dernier salaire de base mensuel",
      employerDays: "Jours par an selon votre employeur (seulement si plus que la loi)",
      employerDaysHint: "Laissez vide pour utiliser la règle légale.",
    },
    pension: {
      title: "Régime de retraite public",
      hint: "Versée à vie en montant fixe, elle achète donc moins chaque année. Nous l'évaluons ainsi.",
      scheme: "Régime : {name}",
      contribution: "Votre cotisation par mois",
      expected: "Pension mensuelle attendue (si vous la connaissez)",
      expectedHint: "Laissez vide et nous utilisons les projections officielles du régime.",
    },
    fixedPension: {
      title: "Autre pension fixe",
      hint: "Toute pension qui n'augmente pas avec les prix.",
      label: "Pension par mois",
    },
    rent: {
      title: "Loyers perçus",
      hint: "Un loyer suit en général les prix : il se déduit donc directement de vos dépenses.",
      label: "Loyer par mois, aujourd'hui",
    },
    allowance: {
      title: "Allocation vieillesse",
      hint: "Une petite allocation de l'État, sous conditions de ressources. Montrée pour une vue complète, jamais comptée dans le plan.",
      label: "Pourriez-vous y avoir droit ?",
      amount: "Environ {amount} par mois à partir de {age} ans",
    },
    family: {
      title: "Aide de la famille",
      hint: "L'aide des enfants est bienvenue, mais ils auront leurs propres frais. Un bonus, jamais le plan.",
      label: "Aide mensuelle que vous pourriez recevoir",
    },
  },

  result: {
    headline: "À mettre de côté chaque mois",
    caption: "pour que votre argent dure jusqu'à {planTo} ans. Objectif à votre départ à {retirementAge} ans : {corpus}.",
    funded: "Ce que vous avez couvre déjà l'objectif jusqu'à {planTo} ans. Gardez-le investi.",
    currentSaving: "Vous mettez de côté {amount} par mois en ce moment.",
    mixUsed: "Avant votre départ, votre épargne croît aux rendements de votre répartition des actifs.",
    contrast: {
      title: "Planifier jusqu'à {contrast} ou {planTo} ans",
      to: "Jusqu'à {age} ans",
      target: "Objectif",
      monthly: "Par mois",
      extra: "Les {amount} de plus par mois financent {years} années de plus à vivre de votre propre argent, de {contrast} à {planTo} ans.",
      noExtra: "Votre épargne couvre déjà les années après {contrast} ans.",
      footnote: "{contrast} ans n'est indiqué qu'à titre de comparaison : beaucoup de gens vivent bien au-delà.",
    },
    range: {
      title: "Selon les rendements",
      low: "Si les rendements sont plus bas",
      base: "Notre scénario central",
      high: "Si les rendements sont plus hauts",
      hint: "Les projections longues ne sont jamais exactes ; nous montrons une fourchette et arrondissons chaque chiffre.",
    },
    chart: {
      title: "Combien de temps mon argent durerait-il ?",
      hint: "Votre épargne avec ce que vous mettez de côté aujourd'hui, année par année, en argent de chaque année.",
      label: "Épargne de {from} à {to} ans : au plus haut, {peak}, à {peakAge} ans. {verdict}.",
      axisAge: "Âge",
      retire: "Arrêt du travail",
    },
    verdict: {
      onTrack: "En bonne voie jusqu'à {age} ans",
      lastsTo: "Dure jusqu'à {age} ans",
      runsOut: "Épuisée à {age} ans",
    },
    shift: {
      title: "Ce que change un début {years} ans plus tôt ou plus tard",
      earlier: "Si vous aviez commencé à {age} ans",
      later: "Si vous commencez à {age} ans",
      now: "En commençant maintenant, à {age} ans",
      perMonth: "{amount} par mois",
      notPossible: "Trop près de la retraite",
      hint: "Mêmes dépenses, épargne et âge de départ ; seul le début change.",
    },
    income: {
      title: "Ce qu'apportent vos sources",
      pf: "Caisse de prévoyance à votre départ",
      gratuity: "Indemnité de fin de service",
      pensions: "Pensions fixes, évaluées à votre départ",
      publicPension: "Retraite publique par mois",
      rent: "Loyers par an à votre départ",
      allowance: "Allocation vieillesse par mois",
      family: "Aide de la famille par mois",
    },
    addSources: "Ajouter vos sources de revenus",
    editAnswers: "Modifier vos réponses",
  },

  retired: {
    headline: "Vous pouvez retirer chaque mois",
    caption: "Soit {firstYear} la première année, puis une hausse chaque année avec les prix, et cela dure jusqu'à {planTo} ans.",
    chartHint: "Votre épargne année par année avec le retrait ci-dessus, en argent de chaque année.",
    range: {
      title: "Ce que vous pouvez retirer, selon les rendements",
      low: "Si les rendements suivent juste l'inflation",
      hint: "Les projections longues ne sont jamais exactes ; nous montrons une fourchette et arrondissons chaque chiffre.",
    },
    runsOut: "Avec {spending} par mois pris sur votre épargne, l'argent durerait jusqu'à environ {age} ans.",
    lasts: "Avec {spending} par mois pris sur votre épargne, l'argent dure jusqu'à {planTo} ans.",
    target: {
      title: "Épargne nécessaire pour vos dépenses",
      hint: "Ce que demandent vos dépenses prises sur l'épargne, jusqu'à {contrast} ans et jusqu'à {planTo} ans.",
    },
    pot: {
      title: "La règle des deux poches",
      body: "Gardez {amount} ({years} années de retraits) en FDR et en bons du Trésor accessibles rapidement. Le reste demeure investi et réalimente cette poche une fois par an.",
    },
    options: {
      title: "Comment transformer l'épargne en revenu régulier",
      localName: "Ici : {name}",
    },
  },

  bucket: {
    title: "Où placer cet argent ?",
    body: "L'argent pour plus tard a besoin d'un abri qui survit à n'importe quelle entreprise. Là où aucun fonds indiciel large n'est vendu, le plan construit l'équivalent le plus proche en trois parts : un fonds ouvert diversifié via un plan mensuel, pour la croissance ; des revenus garantis par l'État, comme le régime de retraite public, les bons d'épargne et les obligations d'État ; et une répartition qui devient plus prudente chaque année à l'approche de {retirementAge} ans.",
    bodyRetired: "L'argent pour le reste de votre vie a besoin d'un abri qui survit à n'importe quelle entreprise. Gardez les retraits des prochaines années en dépôts et en bons du Trésor accessibles rapidement, et le reste en revenus garantis par l'État, comme les bons d'épargne et les obligations d'État, avec une petite part dans un fonds ouvert diversifié pour la croissance.",
    lock: "Marquez cet argent « pas avant {retirementAge} ans » et n'y touchez pas d'ici là.",
    link: "Voir votre répartition des actifs",
  },

  lifeTable: {
    title: "Combien de temps on vit après 60 ans",
    hint: "Le nombre moyen d'années restantes à chaque âge. La moitié des gens vivent plus longtemps que la moyenne : c'est pourquoi le plan ne s'y arrête jamais.",
    age: "Âge",
    total: "Moyenne",
    men: "Hommes",
    women: "Femmes",
    projected: "Projection",
    source: "{source}, {date}",
  },
  supportRatio: "En {fromYear}, il y avait {fromValue} personnes en âge de travailler pour chaque personne âgée. D'ici {toYear}, il y en aura environ {toValue} : comptez donc d'abord sur votre propre argent.",

  notes: {
    title: "Bon à savoir",
  },
  backToPlan: "Retour à mon plan",

  note: {
    planTo100: "Le plan va jusqu'à 100 ans par défaut, car beaucoup de personnes qui atteignent 60 ans vivent bien au-delà de 80. Vous pouvez le réduire, mais jamais sous 85 ans.",
    lifeAt60: "L'espérance de vie à la naissance mélange tous les âges dès l'enfance, elle paraît donc basse. Une personne qui atteint 60 ans peut compter sur environ vingt ans de plus en moyenne, et la moitié vit plus longtemps.",
    womenLiveLonger: "Les femmes vivent en moyenne environ deux ans de plus : le plan d'un couple doit donc couvrir la retraite plus longue de l'épouse.",
    familyNotCounted: "L'aide de la famille n'est jamais comptée : vos enfants auront leur propre famille et leurs propres frais. Voyez-la comme un bonus, pas comme un plan.",
    allowanceNotCounted: "L'allocation vieillesse est montrée mais jamais comptée : elle est petite, sous conditions de ressources et peut changer.",
    pensionFixed: "Une pension versée en montant fixe achète moins chaque année quand les prix montent : elle est donc évaluée ainsi.",
    pensionEntryClosed: "Le régime de retraite public n'accepte de nouveaux membres que jusqu'à son âge d'entrée : il n'est donc pas compté pour vous.",
    supportRatio: "Dans les prochaines décennies, moins de personnes en âge de travailler soutiendront chaque personne âgée : votre propre épargne compte donc davantage.",
    lock: "Gardez cet argent uniquement pour plus tard. Y toucher trop tôt est la raison la plus courante pour laquelle un plan ne suffit pas.",
    startEarlier: "Commencer plus tôt réduit beaucoup le montant mensuel, car l'argent a plus de temps pour fructifier.",
    noStatutoryGratuity: "Nous n'avons pas de loi sur l'indemnité de fin de service pour votre pays : seuls les jours prévus par votre employeur comptent. Vérifiez votre contrat ou demandez à votre employeur.",
    lowCaseInflation: "Le scénario bas suppose que votre argent suit seulement les prix pendant la retraite, sans rendement réel en plus.",
  },

  option: {
    pensionerCertificate: "Bon d'épargne pour retraités : revenu mensuel, réservé aux retraités de la fonction publique, du parapublic et des forces armées, dans une certaine limite.",
    savingsCertificate: "Bon d'épargne d'État : un revenu fixe garanti par l'État.",
    tbonds: "Obligations d'État : garanties par l'État, avec un coupon fixe tous les six mois.",
    depositLadder: "Échelle de FDR : des dépôts qui arrivent à échéance l'un après l'autre, pour libérer de l'argent chaque année.",
    annuity: "Rente viagère de l'assureur public : une pension à vie, quelle que soit votre longévité. La contrepartie : l'argent ne peut pas être transmis.",
  },
};
