import type { Dictionary } from "../../types";

/** Tap-to-explain glossary. Bangladesh-specific, no product or bank names. */
export const terms: Dictionary["terms"] = {
  fdr: {
    title: "FDR (dépôt à terme)",
    body: "Une somme bloquée dans une banque pour une durée fixe, de quelques mois à quelques années, à un taux fixe. Le retirer avant l'échéance fait en général perdre les intérêts. La garantie des dépôts ne couvre qu'un montant limité par banque.",
  },
  dps: {
    title: "DPS (épargne programmée)",
    body: "Un plan d'épargne mensuel en banque : un montant fixe est prélevé automatiquement le même jour chaque mois pendant un nombre d'années donné, puis rendu avec les intérêts à la fin. C'est la façon la plus simple d'épargner d'abord, car l'argent part avant que vous puissiez le dépenser.",
  },
  sanchayapatra: {
    title: "Sanchayapatra (bon d'épargne national)",
    body: "Un bon d'épargne d'État vendu par les banques et les bureaux de poste, en général sur trois ou cinq ans, à un taux que l'État révise deux fois par an. Il rapporte plus que les dépôts bancaires, mais moins si vous le revendez avant terme, et le montant qu'une personne peut détenir est plafonné.",
  },
  bo_account: {
    title: "Compte BO",
    body: "Un compte « beneficiary owner » auprès d'un courtier, nécessaire pour acheter ou détenir des actions, des parts de fonds ou des obligations cotées en bourse. Pour l'ouvrir, il faut votre NID, un compte bancaire et de petits frais.",
  },
  sum_insured: {
    title: "Capital assuré",
    body: "Le montant maximal qu'un contrat d'assurance versera. Pour l'assurance décès, c'est ce que reçoit votre famille si vous décédez ; pour la santé, c'est le plafond annuel des frais d'hôpital pris en charge par l'assureur.",
  },
  emi: {
    title: "EMI (mensualité constante)",
    body: "Le montant fixe que vous versez chaque mois au prêteur pour un prêt. Au début, c'est surtout des intérêts ; plus tard, surtout du capital. Additionnez toutes vos mensualités pour voir quelle part de votre revenu est déjà prise.",
  },
  cib: {
    title: "Rapport CIB",
    body: "Le fichier de crédit de Bangladesh Bank sur chaque emprunteur, que les prêteurs consultent avant d'accorder un prêt ou une carte. Les retards et impayés y restent inscrits et rendent les emprunts futurs plus difficiles ou plus chers.",
  },
  tbill: {
    title: "Bon du Trésor",
    body: "Une reconnaissance de dette de l'État à court terme, vendue aux enchères pour 91, 182 ou 364 jours. Vous l'achetez sous sa valeur nominale et recevez le montant complet à l'échéance ; la différence est votre rendement. Garanti par l'État, donc très sûr.",
  },
  tbond: {
    title: "Obligation d'État",
    body: "Une reconnaissance de dette de l'État à plus long terme, de deux à vingt ans, qui verse des intérêts deux fois par an. Elle s'achète aux enchères de Bangladesh Bank via une banque, ou en bourse via un compte BO.",
  },
  ladder: {
    title: "Échelle de FDR",
    body: "Au lieu d'un seul gros FDR, vous en ouvrez plusieurs plus petits à un mois d'écart. Ainsi, l'un arrive à échéance chaque mois, et vous avez toujours accès à de l'argent bientôt, sans casser un dépôt avant terme.",
  },
  real_return: {
    title: "Rendement réel",
    body: "Ce que votre argent gagne en pouvoir d'achat après impôt et inflation. Un FDR au taux affiché élevé peut quand même avoir un rendement réel négatif si les prix montent plus vite que les intérêts que vous gardez.",
  },
  take_home: {
    title: "Revenu net",
    body: "L'argent qui arrive vraiment sur votre compte chaque mois, après impôt, caisse de prévoyance et autres retenues. Si vous êtes indépendant ou chef d'entreprise, prenez la moyenne des six derniers mois.",
  },
  grace_period: {
    title: "Période sans intérêts",
    body: "Les jours entre le relevé de carte de crédit et sa date d'échéance, pendant lesquels aucun intérêt n'est facturé. Payez la totalité dans ce délai et la carte ne coûte rien ; reportez un solde au-delà et des intérêts courent sur chaque achat.",
  },
};
