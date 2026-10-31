import type { Dictionary } from "../../types";

/** "Why this number?" entries for M7 steps; placeholders are documented in ../en/explain-m7.ts. */
export const explainM7: Dictionary["explain"]["m7"] = {
  spendingAtRetirement: {
    title: "Gasto en tu primer año de jubilación",
    body: "Tu gasto actual de {monthlySpending} al mes, por 12, aumentado con los precios al {inflation} anual durante los {retireInYears} años que faltan para dejar de trabajar: 12 × {monthlySpending} × (1 + {inflation})^{retireInYears}. Primero se resta el alquiler que recibes, porque también sube con los precios. Resultado: {result} al año.",
  },
  corpusContrast: {
    title: "Objetivo hasta la edad de comparación",
    body: "La bolsa que paga {spendingAtRetirement} el primer año, subiendo con los precios ({inflation}), durante {retiredForYears} años mientras el resto rinde {returnRate} después de impuestos: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. Se muestra solo para comparar.",
  },
  corpusPlan: {
    title: "Objetivo para llegar a la edad de tu plan",
    body: "La misma fórmula durante {retiredForYears} años: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. Es exactamente la bolsa que el gráfico año por año gasta hasta cero a esa edad.",
  },
  savingsFv: {
    title: "Tus ahorros al dejar de trabajar",
    body: "Lo que tienes hoy, {savings}, invertido al {accumulationRate} anual durante {retireInYears} años: {savings} × (1 + {accumulationRate})^{retireInYears} = {result}.",
  },
  providentFund: {
    title: "Fondo de previsión al dejar de trabajar",
    body: "El saldo actual de {balance} más {monthlyContribution} aportados cada mes, todo creciendo a la tasa propia del fondo de {fundRate} durante {retireInYears} años = {result}.",
  },
  gratuity: {
    title: "Indemnización por antigüedad",
    body: "Último sueldo base de {basicMonthly} ÷ {daysPerMonthCount} días × {daysCount} días por cada uno de los {serviceYears} años de servicio = {result}, pagado como suma única al irte.",
  },
  fixedPensions: {
    title: "Pensiones fijas, valoradas al dejar de trabajar",
    body: "Una pensión pública de {publicPensionMonthly} al mes desde los {pensionFromAgeYears} y otros ingresos fijos de {fixedPensionMonthly} al mes, pagados hasta la edad de tu plan ({retiredForYears} años de jubilación) sin subir con los precios, valen esto al dejar de trabajar, al {returnRate}: {result}. Por eso su poder de compra se reduce en una jubilación larga.",
  },
  gap: {
    title: "Falta reunir",
    body: "El objetivo de {corpus}, menos todo lo que ya estará ahí (tus ahorros, el fondo de previsión, la indemnización por antigüedad y el valor de las pensiones fijas), nunca por debajo de cero: {result}.",
  },
  monthly: {
    title: "Ahorro mensual",
    body: "El monto que, pagado cada mes durante {savingMonths} meses y creciendo al {monthlyRate} mensual, suma {gap}: {gap} × {monthlyRate} ÷ ((1 + {monthlyRate})^{savingMonths} − 1) = {result}, redondeado hacia arriba para que alcance.",
  },
  withdrawal: {
    title: "Retiro del primer año",
    body: "Lo que {savings} puede pagar el primer año, subiendo con los precios ({inflation}) cada año después, para que dure {retiredForYears} años rindiendo {returnRate}: {savings} × ({returnRate} − {inflation}) ÷ (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) = {result}, redondeado hacia abajo para que nunca falte.",
  },
  safePot: {
    title: "La bolsa segura",
    body: "El retiro del primer año, {firstYear}, por {potYears} años = {result}, guardado en un lugar seguro y de acceso rápido.",
  },
};
