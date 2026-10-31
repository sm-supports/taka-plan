import type { Dictionary } from "../../types";

export const errors: Dictionary["errors"] = {
  generic: "Un problème est survenu. Veuillez réessayer.",
  offline: "Vous êtes hors ligne. Les taux enregistrés sont utilisés ; reconnectez-vous pour avoir les derniers.",
  engineNotReady: "Ce calculateur est encore en préparation.",
  invalidInput: "Certains de ces chiffres ne collent pas. Vérifiez-les et réessayez.",
  missingRate: "Il manque un taux dont ce calculateur a besoin. Veuillez réessayer plus tard.",
  notFound: "Nous n'avons pas trouvé cette page.",
  unauthorized: "Vous devez vous connecter pour voir cette page.",
  ratesUnavailable: "Le tableau des taux n'a pas pu être chargé. Vérifiez votre connexion et réessayez.",
};
