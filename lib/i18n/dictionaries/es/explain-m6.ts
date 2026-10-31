import type { Dictionary } from "../../types";

/** "Why this number?" entries for M6 steps; placeholders are documented in ../en/explain-m6.ts. */
export const explainM6: Dictionary["explain"]["m6"] = {
  score: {
    title: "Puntuación de riesgo",
    body: "Cada una de las cuatro respuestas vale de 0 a 2: grupo de edad {ageBandCount}, ingreso {incomeCount}, cuándo necesitas el dinero {horizonCount} y qué harías tras una caída del 20% {reactionCount}. En total: {result} de 8. De 0 a 3 es Prudente, de 4 a 5 Equilibrado y de 6 a 8 Crecimiento.",
  },
  equity: {
    title: "Parte en renta variable",
    body: "Tu perfil empieza con {startShare} de renta variable hasta los 30 años y luego baja un punto por cada año más, pero nunca por debajo de {floorShare}: a los {ageYears} eso da {ageEquityShare}, y nunca por encima del tope de {capShare}. El dinero que necesitas en menos de {noEquityYears} años no lleva renta variable, y en menos de {cashOnlyYears} año solo depósitos o letras; el tuyo lo necesitas en {horizonYears} años. Renta variable: {result}.",
  },
  gold: {
    title: "Parte en oro",
    body: "El oro es una protección, no una apuesta: lo que elegiste, {chosenShare}, mantenido entre {minShare} y {maxShare}. Oro: {result}.",
  },
  fixedIncome: {
    title: "Parte en renta fija",
    body: "Todo lo que no es renta variable ni oro: 100% − {equityShare} − {goldShare} = {result}.",
  },
  mixLow: {
    title: "Rentabilidad de la mezcla, caso bajo",
    body: "La rentabilidad anual de cada parte en el caso bajo, ponderada por su peso: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} al año.",
  },
  mixBase: {
    title: "Rentabilidad de la mezcla, caso base",
    body: "La rentabilidad anual de cada parte en el caso base, ponderada por su peso: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} al año. A propósito, la base de la renta variable no es más alta que la de los instrumentos seguros.",
  },
  mixHigh: {
    title: "Rentabilidad de la mezcla, caso alto",
    body: "La rentabilidad anual de cada parte en el caso alto, ponderada por su peso: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} al año.",
  },
  fv: {
    title: "Hasta dónde podría crecer (caso base)",
    body: "{monthly} al mes y {lumpSum} hoy, creciendo al {mixRate} anual ({monthlyRate} al mes) durante {years} años. Aportas {paidIn}; al final podrías tener {result}. Los casos bajo y alto usan su propia rentabilidad de la mezcla.",
  },
  real: {
    title: "En dinero de hoy",
    body: "Los precios también suben. {fv} dividido entre (1 + {inflation})^{years} = {result} en lo que compra el dinero hoy.",
  },
  trade: {
    title: "Operaciones para rebalancear",
    body: "Tienes {holdingsTotal} y añades {newMoney}, así que el nuevo total es {result}. Cada parte debe llegar a su peso en ese total ({equityShare}, {goldShare}, {fixedIncomeShare}); la operación es esa meta menos lo que tiene ahora: renta variable {equityTrade}, oro {goldTrade}, renta fija {fixedIncomeTrade} (más = comprar, menos = vender). El dinero nuevo va primero a las partes que están por debajo, y una parte que se aleja más de {driftBandShare} del objetivo es señal para rebalancear.",
  },
};
