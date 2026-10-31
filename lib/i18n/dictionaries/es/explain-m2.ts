import type { Dictionary } from "../../types";

/** "Why this number?" entries for M2 steps; placeholders are documented in ../en/explain-m2.ts. */
export const explainM2: Dictionary["explain"]["m2"] = {
  years: {
    title: "Años de cobertura",
    body: "El seguro de vida va desde tu edad actual, {ageYears}, hasta los {coverToAgeYears}, cuando la familia normalmente ya no depende de tu ingreso, o hasta que tu hijo menor cumpla {childIndependentAgeYears} si indicaste su edad y eso llega antes: {result} años. Nunca baja de cero.",
  },
  incomeNeed: {
    title: "Ingreso a reemplazar",
    body: "La familia necesitaría el {incomeShare} de tu ingreso neto de {takeHome} al mes: {yearlyNeed} al año. Esa necesidad crece con los precios al {inflation} anual durante {coveredYears} años. El dinero que se aparte hoy en ahorro seguro podría rendir {afterTax} después de impuestos, es decir, {realRate} al año más de lo que suben los precios, así que la suma única de hoy que paga la necesidad de cada año, empezando ya, es {result}.",
  },
  lifeCover: {
    title: "Cobertura de vida necesaria",
    body: "El ingreso a reemplazar {incomeNeed}, más deudas {debts} y metas de educación {educationGoals}, menos los ahorros que la familia puede usar {liquidSavings} y las inversiones {investments}: {result}. Nunca baja de cero.",
  },
  lifeGap: {
    title: "Cobertura de vida que falta contratar",
    body: "La cobertura necesaria menos la que ya tienes: {cover} − {existingLifeCover} = {result}.",
  },
  perStay: {
    title: "Cobertura de salud por adulto",
    body: "Una hospitalización típica cuesta unos {hospitalCost}. Las familias pagan de su bolsillo el {oopShare} de los gastos de salud; usamos al menos el {publicFloorShare}, así que tomamos el {appliedShare}: {result} de cobertura por adulto.",
  },
  healthTarget: {
    title: "Cobertura de salud para la familia",
    body: "La cobertura por adulto {perStay} por el peso de las {peopleCount} personas cubiertas, {weightCount} en total (un hijo cuenta menos que un adulto y un padre o madre, más): {result}.",
  },
  healthGap: {
    title: "Cobertura de salud que falta contratar",
    body: "El objetivo de la familia menos la cobertura de salud que ya tienes: {target} − {existingHealthCover} = {result}.",
  },
  lifePremium: {
    title: "Prima anual del seguro de vida a término",
    body: "El seguro de vida a término cuesta entre {bandLow} y {bandHigh} al año por cada {per} de cobertura a tu edad, por {smokerMultipleCount} si fumas. Para {gap} de cobertura son de {premiumLow} a {premiumHigh} al año; el punto medio es {result}.",
  },
  healthPremium: {
    title: "Prima anual del seguro de salud",
    body: "La cobertura de salud se cotiza por cada {per} de cobertura, según la edad de cada persona. Para {gap} más de cobertura entre {peopleCount} personas son de {premiumLow} a {premiumHigh} al año; el punto medio es {result}.",
  },
  monthlyNeed: {
    title: "Para apartar cada mes",
    body: "El punto medio de los dos rangos anuales, vida a término {lifePremium} más salud {healthPremium}, repartido en {months} meses: {result} al mes.",
  },
  policyTerm: {
    title: "Seguro a término por el mismo monto",
    body: "Un seguro de vida a término por la cobertura de la póliza, {sumAssured}, cuesta entre {bandLow} y {bandHigh} al año por cada {per} a tu edad, por {smokerMultipleCount} si fumas. El punto medio es {result} al año.",
  },
  policyInvest: {
    title: "Ahorrar la diferencia",
    body: "Si la dejaras ahora, lo que te devuelve la aseguradora, {surrenderValue}, crece hasta {surrenderValueFV} en un depósito seguro que rinde {afterTax} después de impuestos. Tu prima de {annualPremium} menos la prima a término de {termPremium} deja {yearlyDifference} al año; si la pones en el mismo depósito al inicio de cada uno de los {remainingYears} años que quedan, en total suma {result}.",
  },
  policyIrr: {
    title: "Rentabilidad anual de la póliza",
    body: "Mantener la póliza significa renunciar hoy a {surrenderValue} y pagar {annualPremium} al año durante los {remainingYears} años que quedan de {termYears}, para recibir {expectedMaturity} al final: como ganar {result} al año sobre ese dinero. Dejarla y ahorrar la diferencia llegaría a {investValue}, una diferencia de {difference}.",
  },
};
