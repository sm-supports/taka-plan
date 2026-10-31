import type { Dictionary } from "../../types";

/** Plan screen. Reason params are documented in ../en/plan.ts; the placeholders here must match. */
export const plan: Dictionary["plan"] = {
  title: "Votre plan",
  headline: "Épargnez {amount} par mois",
  subhead: "Réparti entre vos postes par ordre de priorité. Touchez une carte pour l'ajuster ; le plan se met à jour en direct.",
  emptyGoals: "Aucun objectif pour l'instant. Ajoutez-en un (la retraite compte) et le plan lui fera de la place.",
  builtOn: "Basé sur les taux v{version}",
  demoBanner: "Plan d'exemple construit avec des chiffres de démonstration, pas les vôtres. Ouvrez le plan sans le mode démo pour voir le vôtre.",

  why: {
    headline: "Pourquoi épargner {amount} par mois ?",
    bucket: "Pourquoi {amount} pour {bucket} ?",
  },

  error: {
    title: "Votre plan n'est pas encore prêt",
    retry: "Réessayer",
  },

  card: {
    amount: "Montant",
    instrument: "Où",
    reason: "Pourquoi",
    nextStep: "Étape suivante",
    open: "Ouvrir le calculateur",
    priority: "Priorité {n}",
    perMonth: "{amount}/mois",
    goalTitle: "Objectif : {name}",
    bucket: {
      emergency: "Fonds d'urgence",
      insurance: "Assurance",
      debt: "Remboursement des dettes",
      goal: "Objectif",
      retirement: "Retraite",
      future: "Avenir",
    },
  },

  more: {
    title: "Complétez votre plan",
    start: "Commencer",
    edit: "Modifier",
    reserved: "Le plan met de côté {amount} par mois pour cela.",
    m2: { title: "Assurance et santé", body: "La couverture décès et santé dont votre famille a besoin, et son coût approximatif." },
    m6: { title: "Répartition des actifs", body: "Comment répartir l'argent à long terme entre revenu fixe, actions et or selon votre âge." },
    m7: { title: "Retraite et famille", body: "Ce qu'il vous faut pour vivre de votre propre argent jusqu'à 100 ans, et quels revenus réduisent ce besoin." },
  },

  summary: {
    title: "Résumé",
    emergencyShare: "{share} de votre montant mensuel va au fonds d'urgence jusqu'à ce qu'il soit plein.",
    monthsToFull: "Fonds d'urgence plein dans {months}.",
    emergencyFull: "Votre fonds d'urgence est plein.",
    goalsShortfall: "Vos objectifs demandent {amount} de plus par mois que ce que le plan peut contenir pour l'instant.",
    noShortfall: "Chaque objectif tient dans le montant de ce mois.",
    retirementShortfall: "La retraite demande {amount} de plus par mois que ce que le plan peut contenir pour l'instant.",
  },

  reason: {
    emergency: "Fonds d'urgence — {amount}/mois en {instrument} — {covered} mois couverts sur {months}",
    emergencyFull: "Fonds d'urgence — plein à {months} mois de dépenses essentielles — reconstituez-le après chaque retrait",
    debt: "Dette à taux élevé ({rate}) — {amount}/mois en plus de votre mensualité — soldée en environ {months} à ce rythme",
    debtNever: "Dette à taux élevé ({rate}) — {amount}/mois en plus de votre mensualité — à ce rythme, elle ne sera jamais soldée : payez plus ou passez à un prêt moins cher",
    debtNone: "Dette à taux élevé ({rate}) — pas de place ce mois-ci — payez au moins le minimum sur chaque dette",
    goal: "{name} — {amount}/mois en {instrument} — il vous faudra {fv} dans {years}",
    addGoal: "Ajoutez un objectif — chaque plan en demande au moins un, et la retraite compte",
    insurance: "Assurance — {amount}/mois mis de côté pour une assurance décès temporaire et une couverture santé",
    insuranceNone: "Assurance — pas de place ce mois-ci — la couverture reste importante : ouvrez le bilan d'assurance",
    retirement: "Retraite — {amount}/mois pour que votre argent dure jusqu'à {planTo} ans",
    retirementShort: "Retraite — {amount}/mois sur les {need} nécessaires — votre argent dure jusqu'à {lastsTo} ans",
    retirementShortNoAge: "Retraite — {amount}/mois sur les {need} nécessaires",
    retirementNone: "Retraite — pas de place ce mois-ci pour les {need} par mois nécessaires",
    future: "Épargne à long terme — {amount}/mois en {instrument} jusqu'à ce que vous ajoutiez un objectif",
  },

  next: {
    fdrLadder: "Rendez-vous dans une banque avec votre pièce d'identité et votre numéro fiscal ; demandez un {product} à 3 mois. Ouvrez-en un chaque mois pendant trois mois, pour qu'il y en ait un qui arrive à échéance chaque mois.",
    openSavings: "Ouvrez un {product} dans n'importe quelle banque avec votre pièce d'identité. Gardez-y un mois de dépenses essentielles et placez le reste en dépôts à 3 mois.",
    prepayDebt: "Appelez votre prêteur et demandez comment faire un remboursement anticipé de capital sans pénalité. Commencez par la dette au taux le plus élevé.",
    dps: "Demandez à votre banque d'ouvrir un plan {product} avec prélèvement automatique le lendemain du versement de votre salaire. Tout montant convient ; l'habitude compte plus que la somme.",
    sanchayapatra: "Apportez votre pièce d'identité, votre numéro fiscal et un chèque de votre compte bancaire dans une agence bancaire ou un bureau de poste qui vend des bons d'épargne d'État, et demandez : {product}.",
    tbond: "Demandez à votre banque de vous inscrire aux adjudications d'obligations d'État et enchérissez sur une {product} à 5 ou 10 ans ; vous pouvez aussi en acheter une déjà émise via un compte-titres.",
    fdr: "Rendez-vous dans une banque avec votre pièce d'identité et votre numéro fiscal ; demandez un {product} à 1 an et gardez le reçu en lieu sûr.",
    addGoal: "Touchez « Ajouter un objectif », donnez-lui un nom, son coût en argent d'aujourd'hui et dans combien d'années il arrive.",
    keepFull: "Votre fonds est plein : laissez-le où il est. Après tout retrait, remettez le même montant avant toute autre épargne, pour qu'il soit de nouveau complet.",
    insurance: "Ouvrez le bilan d'assurance : il calcule la couverture décès et santé dont votre famille a besoin, et son coût approximatif.",
    retirement: "Ouvrez le plan retraite : voyez ce qu'il vous faut pour vivre de votre propre argent jusqu'à 100 ans, et quels revenus réduisent ce besoin.",
    allocation: "Ouvrez la répartition des actifs : elle répartit l'argent à long terme entre revenu fixe, actions et or selon votre âge.",
  },

  note: {
    insuranceSkipped: "Vos réponses sur l'assurance n'ont pas pu être calculées avec votre profil actuel : l'assurance est donc laissée hors de ce plan pour l'instant. Ouvrez le bilan d'assurance pour les mettre à jour.",
    allocationSkipped: "Vos réponses sur la répartition des actifs n'ont pas pu être calculées avec votre profil actuel : le plan utilise donc le revenu fixe pour l'instant. Ouvrez la répartition des actifs pour les mettre à jour.",
    retirementSkipped: "Vos réponses sur la retraite ne correspondent plus à votre profil (par exemple, votre âge a changé) : la retraite est donc laissée hors de ce plan pour l'instant. Ouvrez le plan retraite pour les mettre à jour.",
  },
};
