import type { Dictionary } from "../../types";

/** M5 Goal planner. `note.*` covers M5_NOTE_KEYS. */
export const m5: Dictionary["m5"] = {
  title: "Planificador de metas",
  intro: "Una meta real tiene un monto, una fecha y tu edad. Todo el mundo tiene al menos una: la jubilación.",

  input: {
    name: { label: "Nombre de la meta", hint: "La universidad de tu hija, la entrada de una vivienda, una peregrinación, un auto…", placeholder: "¿Para qué ahorras?" },
    cost: { label: "Costo en dinero de hoy", hint: "Lo que costaría si lo pagaras hoy. Nosotros añadimos la inflación." },
    years: { label: "Años que faltan", hint: "Años completos desde hoy, de {min} a {max}." },
    type: { label: "Tipo de meta", hint: "Los costos de educación y salud suben más rápido que los precios en general, así que tienen su propia tasa de inflación." },
    addGoal: "Añadir una meta",
    removeGoal: "Quitar meta",
    incomplete: "Una meta necesita un nombre, un costo y un número de años para guardarse.",
    newGoal: "Nueva meta",
    saveGoal: "Guardar meta",
    saved: "Tus metas",
  },

  result: {
    horizon: "Horizonte",
    inflation: "Inflación aplicada",
    futureValue: "Necesitarás",
    futureValueIn: "{fv} en {years}",
    instrument: "Ahórralo en",
    candidates: "Otras opciones para este horizonte",
    nominal: "Tasa nominal",
    afterTax: "Después de impuestos",
    real: "Rentabilidad real (después de impuestos e inflación)",
    belowInflation: "Por debajo de la inflación: al final este dinero comprará menos que hoy",
    monthly: "Ahorra cada mes",
    monthlyRange: "Bajo {low} · Esperado {base} · Alto {high}",
    monthlyLow: "Si la rentabilidad es baja",
    monthlyBase: "Esperado",
    monthlyHigh: "Si la rentabilidad es alta",
    months: "Durante {months}",
    totalMonthly: "Todas las metas juntas",
    invalid: "A esta meta le falta algo",
    empty: "Aún no hay metas.",
    goalsCount: "{n} meta(s)",
    realAbove: "Supera la inflación después de impuestos",
    perMonth: "al mes",
  },

  demoBanner: "Metas de ejemplo. Añade las tuyas para ver tus cifras reales.",

  note: {
    noAllocationYet: "Por ahora, las metas lejanas usan solo instrumentos de renta fija. Cuando esté listo el paso de mezcla de activos, las metas a más de cinco años usarán una mezcla con algo de renta variable.",
    belowInflation: "La rentabilidad esperada de este instrumento está por debajo de la inflación después de impuestos. Aun así llegarás a la cifra, pero comprará menos de lo que esperabas. Ayuda un horizonte más largo o un instrumento que pague más.",
  },

  status: {
    red: "La rentabilidad esperada está por debajo de la inflación",
    amber: "Alcanzable, pero justo",
    green: "Vas bien",
  },
};
