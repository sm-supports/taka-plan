import type { Dictionary } from "../../types";

export const errors: Dictionary["errors"] = {
  generic: "Algo salió mal. Inténtalo de nuevo.",
  offline: "Estás sin conexión. Se usan las tasas guardadas; vuelve a conectarte para obtener las más recientes.",
  engineNotReady: "Esta calculadora aún se está preparando.",
  invalidInput: "Algunas de estas cifras no cuadran. Revísalas e inténtalo de nuevo.",
  missingRate: "Falta una tasa que esta calculadora necesita. Inténtalo más tarde.",
  notFound: "No encontramos esa página.",
  unauthorized: "Necesitas iniciar sesión para ver esta página.",
  ratesUnavailable: "No se pudo cargar la tabla de tasas. Revisa tu conexión e inténtalo de nuevo.",
};
