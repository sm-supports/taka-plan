import type { Dictionary } from "../../types";

/** M5 Goal planner. `note.*` covers M5_NOTE_KEYS. */
export const m5: Dictionary["m5"] = {
  title: "Planificateur d'objectifs",
  intro: "Un vrai objectif a un montant, une date et votre âge. Tout le monde en a au moins un : la retraite.",

  input: {
    name: { label: "Nom de l'objectif", hint: "Université de votre fille, apport pour un appartement, Hajj, une voiture…", placeholder: "Pour quoi épargnez-vous ?" },
    cost: { label: "Coût en argent d'aujourd'hui", hint: "Ce que cela coûterait si vous payiez aujourd'hui. Nous ajoutons l'inflation pour vous." },
    years: { label: "Dans combien d'années", hint: "En années entières à partir d'aujourd'hui, de {min} à {max}." },
    type: { label: "Type d'objectif", hint: "Les coûts d'études et de santé augmentent plus vite que les prix en général : ils ont donc leur propre taux d'inflation." },
    addGoal: "Ajouter un objectif",
    removeGoal: "Retirer l'objectif",
    incomplete: "Un objectif a besoin d'un nom, d'un coût et d'un nombre d'années avant d'être enregistré.",
    newGoal: "Nouvel objectif",
    saveGoal: "Enregistrer l'objectif",
    saved: "Vos objectifs",
  },

  result: {
    horizon: "Horizon",
    inflation: "Inflation appliquée",
    futureValue: "Il vous faudra",
    futureValueIn: "{fv} dans {years}",
    instrument: "Où l'épargner",
    candidates: "Autres options pour cet horizon",
    nominal: "Taux affiché",
    afterTax: "Après impôt",
    real: "Rendement réel (après impôt et inflation)",
    belowInflation: "Sous l'inflation : cet argent achètera moins à la fin qu'aujourd'hui",
    monthly: "À épargner chaque mois",
    monthlyRange: "Bas {low} · Attendu {base} · Haut {high}",
    monthlyLow: "Si les rendements sont bas",
    monthlyBase: "Attendu",
    monthlyHigh: "Si les rendements sont hauts",
    months: "Sur {months}",
    totalMonthly: "Tous les objectifs ensemble",
    invalid: "Il manque quelque chose à cet objectif",
    empty: "Aucun objectif pour l'instant.",
    goalsCount: "{n} objectif(s)",
    realAbove: "Bat l'inflation après impôt",
    perMonth: "par mois",
  },

  demoBanner: "Objectifs d'exemple. Ajoutez les vôtres pour voir vos vrais chiffres.",

  note: {
    noAllocationYet: "Pour l'instant, les objectifs lointains n'utilisent que des placements à revenu fixe. Une fois l'étape de répartition des actifs en place, les objectifs à plus de cinq ans utiliseront un mélange avec une part d'actions.",
    belowInflation: "Le rendement attendu de ce placement est inférieur à l'inflation après impôt. Vous atteindrez quand même le montant, mais il achètera moins que prévu. Un horizon plus long ou un placement qui rapporte plus peut aider.",
  },

  status: {
    red: "Rendement attendu sous l'inflation",
    amber: "Atteignable, mais juste",
    green: "En bonne voie",
  },
};
