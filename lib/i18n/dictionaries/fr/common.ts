// French (international). Register: "vous", plain and warm. Western digits only.
//
// Glossary (English → français), used consistently across every fr file:
//   emergency fund            → fonds d'urgence
//   take-home (pay)           → revenu net (mensuel)
//   essentials / essential spending → dépenses essentielles
//   dependents                → personnes à charge
//   savings account           → compte d'épargne
//   fixed deposit / term deposit (FDR) → dépôt à terme (FDR kept as a Bangladesh name)
//   recurring deposit (DPS)   → épargne programmée (DPS kept as a Bangladesh name)
//   government savings certificate (Sanchayapatra) → bon d'épargne d'État (Sanchayapatra kept)
//   treasury bill             → bon du Trésor
//   treasury bond / government bond → obligation d'État
//   (open-end) equity fund    → fonds actions (ouvert)
//   shares / equity           → actions
//   fixed income              → revenu fixe
//   asset mix                 → répartition des actifs
//   headline rate             → taux affiché
//   real return               → rendement réel
//   after tax / after inflation → après impôt / après inflation
//   tax deducted at source    → impôt prélevé à la source
//   policy rate               → taux directeur
//   central bank              → banque centrale (Bangladesh Bank kept)
//   EMI (instalment)          → mensualité (EMI kept in Bangladesh-only copy)
//   principal                 → capital
//   prepayment                → remboursement anticipé
//   credit card balance carried → solde de carte de crédit reporté
//   grace period              → période sans intérêts
//   term life insurance       → assurance décès temporaire
//   health insurance / cover  → assurance santé / couverture
//   sum insured               → capital assuré
//   premium                   → prime
//   surrender value           → valeur de rachat
//   annuity                   → rente viagère
//   pension                   → pension / retraite
//   provident fund            → caisse de prévoyance
//   gratuity                  → indemnité de fin de service
//   endowment policy          → assurance mixte
//   claim (insurance)         → sinistre / demande d'indemnisation
//   rebalancing               → rééquilibrage
//   risk profiles             → Prudent / Équilibré / Dynamique
//   scenarios low/base/high   → bas / central / haut
//   maturity                  → échéance
//   deposit ladder            → échelle de dépôts
//   brokerage account         → compte-titres (BO account → compte BO)
//   lump sum                  → somme forfaitaire / capital de départ
//   inflation                 → inflation
import type { Dictionary } from "../../types";

export const common: Dictionary["common"] = {
  appName: "Taka Plan",
  tagline: "Combien il vous faut pour chaque objectif, et où placer l'argent chaque mois.",
  loading: "Chargement…",
  yes: "Oui",
  no: "Non",
  optional: "Facultatif",

  nav: {
    home: "Accueil",
    plan: "Mon plan",
    calculators: "Calculateurs",
    admin: "Admin des taux",
    language: "Langue",
  },

  button: {
    next: "Suivant",
    back: "Retour",
    seePlan: "Voir mon plan",
    whyThisNumber: "Pourquoi ce chiffre ?",
    why: "Pourquoi ?",
    close: "Fermer",
    edit: "Modifier",
    save: "Enregistrer",
    cancel: "Annuler",
    reset: "Recommencer",
    tryAgain: "Réessayer",
    learnMore: "En savoir plus",
    add: "Ajouter",
    remove: "Retirer",
    done: "Terminé",
    skip: "Passer",
    openCalculator: "Ouvrir le calculateur",
  },

  status: {
    red: "À traiter maintenant",
    amber: "À surveiller",
    green: "En bonne voie",
  },
  alsoNeedsAttention: "À traiter aussi",

  module: {
    m1: "Fonds d'urgence",
    m2: "Assurance et santé",
    m3: "Bilan des dettes",
    m4: "Budget « épargne d'abord »",
    m5: "Planificateur d'objectifs",
    m6: "Répartition des actifs",
    m7: "Retraite et famille",
    plan: "Votre plan",
  },

  instrument: {
    savings_account: "Compte d'épargne",
    fdr_3m: "FDR à 3 mois",
    fdr_1y: "FDR à 1 an",
    dps: "DPS",
    sanchayapatra_5y: "Bon d'épargne d'État",
    tbill_91d: "Bon du Trésor à 91 jours",
    tbond_5y: "Obligation d'État à 5 ans",
    tbond_10y: "Obligation d'État à 10 ans",
    equity_fund: "Fonds actions ouvert",
    gold: "Or (lingots ou pièces 22 carats)",
    loan_prepayment: "Remboursement anticipé de prêt",
    term_insurance: "Assurance décès temporaire",
  },

  /** Product names inside a sentence, when the country data has none (useProductName). */
  productProse: {
    savings_account: "compte d'épargne",
    fdr_3m: "dépôt à terme",
    fdr_1y: "dépôt à terme",
    dps: "épargne programmée",
    sanchayapatra_5y: "bon d'épargne d'État",
    tbill_91d: "bon du Trésor",
    tbond_5y: "obligation d'État",
    tbond_10y: "obligation d'État",
    equity_fund: "fonds actions",
    gold: "or",
  },

  /** An instrument inside a sentence ("en {instrument}"); {product} is the country's product name. No article, so any gender fits. */
  instrumentInline: {
    savings_account: "{product}",
    fdr_3m: "{product} à 3 mois",
    fdr_1y: "{product} à 1 an",
    dps: "{product}",
    sanchayapatra_5y: "{product}",
    tbill_91d: "{product} à 91 jours",
    tbond_5y: "{product} à 5 ans",
    tbond_10y: "{product} à 10 ans",
    equity_fund: "fonds actions ouvert",
    gold: "or (lingots ou pièces)",
    loan_prepayment: "remboursement anticipé de prêt",
    term_insurance: "assurance décès temporaire",
  },

  unit: {
    month: "mois",
    months: "mois",
    year: "an",
    years: "ans",
    perMonth: "/mois",
    perYear: "par an",
    taka: "৳",
    percent: "%",
  },

  offline: "Vous êtes hors ligne — taux enregistrés utilisés",
  ratesVersion: "Taux v{version}, {asOf}",
  mayBeOutdated: "Peut-être dépassé",
  ourAssumption: "Notre hypothèse",
  ourSource: "Taka Plan (notre hypothèse)",
  source: "Source",
  asOf: "Au {date}",
  range: "Fourchette {low}–{high}",
  afterTax: "Après impôt",
  afterInflation: "Après inflation",
  headline: "Taux affiché",

  disclaimer: {
    short:
      "Estimations à but éducatif uniquement ; ni conseil financier, fiscal ou juridique. Les taux changent : vérifiez auprès de votre banque ou assureur avant d'agir. Les rendements passés ne préjugent pas des rendements futurs.",
    title: "Avant de commencer",
    body:
      "Taka Plan donne des estimations à but éducatif uniquement. Ce n'est ni un conseil financier, ni fiscal, ni juridique, et l'application ne cite jamais de banque, de fonds ou d'assureur. Les taux et les règles fiscales changent plusieurs fois par an : vérifiez auprès de votre banque ou assureur avant d'agir sur un chiffre affiché ici. Les rendements passés ne préjugent pas des rendements futurs. Vos réponses restent sur votre téléphone, sauf si vous choisissez d'enregistrer un plan.",
    accept: "J'ai compris",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "Choisir la langue",
  },
  /** Header language menu button: {language} is the current language's own name. */
  languageMenu: "Langue : {language}",
  changeCountry: "Changer de pays",
  /** Header country link: {country} is the country code shown in the header. */
  countryLink: "Pays {country}. Changer de pays",

  incomeType: {
    salaried: "Salarié",
    freelance: "Indépendant",
    business: "Chef d'entreprise",
  },

  dependent: {
    none: "Personne",
    partner: "Conjoint",
    children: "Enfants",
    parents: "Parents",
  },

  goalType: {
    general: "Général",
    education: "Études",
    health: "Santé",
    wedding: "Mariage",
    vehicle: "Véhicule",
    home: "Logement ou terrain",
    travel: "Voyage",
  },

  loanType: {
    personal: "Prêt personnel",
    home: "Prêt immobilier",
    car: "Prêt auto",
    education: "Prêt étudiant",
    other: "Autre prêt",
  },

  horizon: {
    short: "Moins de 3 ans",
    medium: "3 à 5 ans",
    long: "Plus de 5 ans",
  },

  explain: {
    title: "Pourquoi ce chiffre ?",
    steps: "Comment nous l'avons calculé",
    assumptions: "Taux utilisés",
    notes: "Remarques",
    stale: "Ce taux a dépassé sa date de révision",
  },

  /** "Start from the beginning" and the drafts it keeps (components/drafts). */
  drafts: {
    startOver: "Tout recommencer",
    startOverHint: "Vos réponses actuelles sont gardées en brouillon.",
    confirmTitle: "Tout recommencer ?",
    confirmBody: "Vos réponses actuelles sont gardées en brouillon. Vous pouvez le rouvrir à tout moment depuis Vos brouillons.",
    confirm: "Oui, recommencer",
    cancel: "Annuler",
    saved: "Enregistré en brouillon",
    alreadySaved: "Déjà enregistré en brouillon",
    deleted: "Brouillon supprimé",
    title: "Vos brouillons",
    sectionTitle: "Vos brouillons ({count})",
    intro: "Les réponses gardées quand vous avez recommencé. Ouvrez-en un pour voir son plan.",
    empty: "Aucun brouillon pour l'instant. Quand vous recommencez, vos réponses actuelles sont gardées ici.",
    seeAll: "Voir tous les brouillons",
    backToPlan: "Retour à mon plan",
    updated: "Modifié le {date}",
    current: "Ouvert",
    open: "Ouvrir",
    rename: "Renommer",
    renameLabel: "Nom du brouillon",
    renameHint: "{max} caractères maximum. Laissez vide pour garder le nom automatique.",
    delete: "Supprimer",
    deleteTitle: "Supprimer ce brouillon ?",
    deleteBody: "Il sera effacé de ce téléphone et ne pourra pas être récupéré.",
    deleteConfirm: "Oui, supprimer",
    /** Shown before saving would push the oldest unnamed draft out (lib/store/drafts.ts capDrafts). */
    capWarning: "Vous avez déjà {max} brouillons : le plus ancien sans nom, « {label} », sera donc supprimé. Donnez un nom à un brouillon pour le garder.",
    openTitle: "Ouvrir ce brouillon ?",
    openConfirm: "Oui, l'ouvrir",
    label: {
      age: "{age} ans",
      takeHome: "{amount}/mois",
      goalsOne: "{count} objectif",
      goalsOther: "{count} objectifs",
      m2: "Assurance",
      m6: "Placements",
      m7: "Retraite",
    },
  },

  /** Banner under the header about the chosen country's data (components/layout/CountryNotice). */
  countryNotice: {
    noData: "Nous n'avons pas encore de chiffres vérifiés pour {country} : les montants utilisent donc les chiffres du Bangladesh et le taka.",
    changeCountry: "Changer de pays",
    someFallback: "Certains chiffres pour {country} sont des estimations régionales, pas les siens.",
    about: "D'où viennent les chiffres",
  },
};
