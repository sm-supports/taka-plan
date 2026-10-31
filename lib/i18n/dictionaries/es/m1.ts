import type { Dictionary } from "../../types";

/** M1 Emergency fund. `rule.*` covers M1_RULE_KEYS, `next.*` covers M1_NEXT_KEYS. */
export const m1: Dictionary["m1"] = {
  title: "Fondo de emergencia",
  intro: "Dinero al que puedes acceder en uno o dos días cuando se corta el ingreso o llega una factura. Calcúlalo según tu familia, no con una regla fija.",
  demo: "Cifras de ejemplo solo para vista previa. Aquí no se usan tus propios datos.",

  section: {
    inputs: "Tus cifras",
    result: "Tu fondo de emergencia",
    rules: "Reglas para este dinero",
    nextStep: "Siguiente paso",
  },

  input: {
    essentials: {
      label: "Gasto esencial mensual",
      hint: "Alquiler, comida, servicios, transporte, gastos escolares, ayuda a tus padres, cuotas que ya pagas.",
    },
    incomeType: {
      label: "Cómo ganas tu dinero",
      hint: "Los ingresos independientes o de negocio son menos estables, así que el colchón empieza más grande.",
    },
    dependents: {
      label: "Quién depende de ti",
      hint: "Elige a todos los que correspondan.",
    },
    soleEarner: {
      label: "¿Eres la única persona con ingresos en casa?",
      hint: "Si nadie más aporta dinero, el fondo tiene que durar más.",
    },
    hasHealthInsurance: {
      label: "¿Tienes seguro de salud?",
      hint: "Sin cobertura, una cuenta de hospital sale de este fondo, así que debe ser mayor.",
    },
    liquidSavings: {
      label: "Ahorros que puedes usar hoy",
      hint: "Efectivo, cuentas de ahorro y depósitos que podrías cobrar en pocos días. No el dinero en {product}, acciones ni oro.",
    },
    months: {
      label: "Meses de cobertura",
      hint: "Te sugerimos un punto de partida; desliza hasta lo que te parezca bien para tu familia, de {min} a {max} meses.",
      suggested: "Sugerido: {months}",
      useSuggested: "Usar la sugerencia",
    },
    buildMonths: {
      label: "Completarlo en",
      hint: "Cuántos meses quieres tardar en llenar el fondo.",
    },
  },

  result: {
    suggestedMonths: "Cobertura sugerida: {months}",
    months: "Meses de cobertura",
    target: "Objetivo",
    saved: "Ya ahorrado",
    gap: "Falta ahorrar",
    monthlySaving: "Ahorro mensual",
    monthsCovered: "Meses cubiertos",
    monthsCoveredOf: "{covered} de {months} meses cubiertos",
    monthsToFull: "Completo en {months}",
    full: "Tu fondo de emergencia está completo",
    tiers: {
      title: "Dónde guardarlo",
      savingsAccount: "Cuenta de ahorro de retiro inmediato",
      savingsAccountHint: "Un mes de gastos esenciales que puedes retirar el mismo día.",
      fdrLadder: "Escalera de FDR a 3 meses",
      fdrLadderHint: "El resto, en tres FDR abiertos con un mes de diferencia para que venza uno cada mes.",
      fdrPerSlice: "Cada FDR",
      fdrSlices: "Tres FDR de {amount} cada uno, abriendo uno cada mes.",
      banksNeeded: "Bancos entre los que repartirlo",
      banksNeededHint: "El seguro de depósitos solo cubre {limit} por banco, así que no guardes más que eso en un mismo banco.",
      sanchayapatraLayer: "Tercera capa: {product}",
      sanchayapatraLayerHint: "Tu colchón es lo bastante grande como para poner una parte en {product}, que paga más pero tiene penalización si lo cobras antes.",
    },
  },

  rule: {
    noStocks: "Nada de acciones ni fondos de renta variable para este dinero. Tiene que estar ahí, con todo su valor, en un mal día.",
    sanchayapatraThirdLayer: "Usa {product} solo como tercera capa para un colchón muy grande: paga más, pero cobrarlo antes te cuesta parte del rendimiento.",
    cardBridge: "Una tarjeta de crédito puede cubrir los uno o dos días que tarda en cobrarse un FDR, solo si pagas el total dentro del período de gracia.",
    refill: "¿Usaste el fondo? Repónlo antes de poner dinero en cualquier otra cosa.",
    notAnEmergency: "Unas vacaciones, un teléfono o un regalo de boda no son una emergencia. Ahorra para eso como metas.",
  },

  next: {
    openSavings: "Abre una cuenta de ahorro en cualquier banco con tu documento de identidad; pasa ahí un mes de gastos esenciales y programa la transferencia automática para el resto.",
    fdrLadder: "Ve a cualquier banco con tu documento de identidad y tu número fiscal; pide {product} a 3 meses. Abre uno cada mes durante tres meses para que venza uno cada mes.",
    splitBanks: "Tu fondo supera el límite del seguro de depósitos de un banco. Abre FDR en un segundo banco para que ninguno tenga más que el límite.",
    full: "Tu fondo está completo. Sigue renovando los FDR y repón el fondo después de cualquier retiro antes de ahorrar en otra cosa.",
  },

  status: {
    red: "Menos de un mes cubierto",
    amber: "Cubierto en parte: sigue construyéndolo",
    green: "Totalmente cubierto",
  },
};
