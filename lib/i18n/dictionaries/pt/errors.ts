import type { Dictionary } from "../../types";

export const errors: Dictionary["errors"] = {
  generic: "Algo deu errado. Tente de novo.",
  offline: "Você está offline. Estamos usando as taxas salvas; conecte-se para obter as mais recentes.",
  engineNotReady: "Esta calculadora ainda está sendo preparada.",
  invalidInput: "Alguns destes números não batem. Confira e tente de novo.",
  missingRate: "Falta uma taxa de que esta calculadora precisa. Tente de novo mais tarde.",
  notFound: "Não encontramos essa página.",
  unauthorized: "Você precisa entrar para ver esta página.",
  ratesUnavailable: "Não foi possível carregar a tabela de taxas. Verifique sua conexão e tente de novo.",
};
