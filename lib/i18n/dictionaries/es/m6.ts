import type { Dictionary } from "../../types";

/**
 * Asset mix screen (M6). `note.*` covers M6_NOTE_KEYS, `gate.*` M6_GATE_KEYS and `howto.*` M6_HOWTO_KEYS.
 * Never name a company, fund, broker or bank.
 */
export const m6: Dictionary["m6"] = {
  title: "Mezcla de activos",
  intro: "Cómo repartir tu dinero a largo plazo entre renta fija, renta variable y oro, qué comprar para cada parte y cómo mantener el reparto en su objetivo.",
  demo: "Cifras de ejemplo solo para vista previa. Aquí no se usan tus propias respuestas.",
  needProfile: "Primero responde las cinco preguntas iniciales, para que la mezcla pueda usar tu edad y cómo ganas tu dinero.",
  startLink: "Responder las preguntas iniciales",
  backToPlan: "Volver a mi plan",
  disclaimer: "Estimaciones educativas, no asesoría de inversión. Los mercados pueden caer y seguir abajo durante años, y las rentabilidades pasadas no predicen las futuras.",

  flow: {
    progress: "Pregunta {n} de {total}",
    gate: {
      title: "¿Tienes un fondo de emergencia y ninguna deuda de tarjeta?",
      hint: "El dinero a largo plazo va después de un fondo de emergencia completo y de pagar la deuda de tarjeta. Esto es lo que dice tu plan.",
      emergencyOk: "Tu fondo de emergencia está completo.",
      emergencyMissing: "Tu fondo de emergencia aún no está completo.",
      cardOk: "No arrastras deuda de tarjeta.",
      cardMissing: "Arrastras un saldo de tarjeta de un mes a otro.",
      openEmergency: "Abrir el fondo de emergencia",
      openDebt: "Abrir la revisión de deudas",
      allClear: "Bien: estás listo para invertir a largo plazo.",
      continue: "Continuar",
      continueAnyway: "Continuar de todos modos",
    },
    ageBand: {
      title: "¿En qué grupo de edad estás?",
      hint: "Lo completamos con tu edad. Quien es más joven tiene más años para aguantar una caída.",
    },
    incomeStability: {
      title: "¿Qué tan estable es tu ingreso?",
      hint: "Lo completamos según cómo ganas tu dinero. Un ingreso más estable puede asumir un poco más de riesgo.",
    },
    horizon: {
      title: "¿Cuándo necesitarás este dinero?",
      hint: "Desliza hasta el número de años. El dinero que necesitas pronto no debe estar en acciones.",
      band: "Eso cuenta como: {band}.",
    },
    reaction: {
      title: "Si tus inversiones cayeran un 20% en un año, tú…",
      hint: "No hay respuesta incorrecta. Sé honesto: define cuánta renta variable puedes soportar.",
    },
    amounts: {
      title: "¿Cuánto vas a invertir?",
      hint: "Una suma única, un monto mensual o ambos. Puedes cambiarlos después.",
      needOne: "Escribe una suma única o un monto mensual para ver tu mezcla.",
      seeResult: "Ver mi mezcla",
    },
  },

  answer: {
    ageBand: { "0": "50 o más", "1": "De 35 a 49", "2": "Menos de 35" },
    incomeStability: { "0": "Ingresos de negocio", "1": "Independiente o irregular", "2": "Asalariado" },
    horizon: { "0": "En menos de 5 años", "1": "Dentro de 5 a 10 años", "2": "En más de 10 años" },
    reaction: { "0": "Vendería, para frenar la pérdida", "1": "Esperaría a que se recupere", "2": "Compraría más mientras está barato" },
  },

  profile: {
    careful: "Prudente",
    balanced: "Equilibrado",
    growth: "Crecimiento",
  },

  bucket: {
    fixedIncome: "Renta fija",
    equity: "Renta variable",
    gold: "Oro",
  },

  section: {
    result: "Tu mezcla",
    instruments: "Qué comprar",
    projection: "Hasta dónde podría crecer",
    rebalance: "Ya invierto",
    inputs: "Tus respuestas",
    netWorth: "Patrimonio neto",
    notes: "Para tener en cuenta",
  },

  input: {
    ageBand: { label: "Grupo de edad" },
    incomeStability: { label: "Qué tan estable es tu ingreso" },
    horizon: { label: "Cuándo necesitas el dinero" },
    reaction: { label: "Si tus inversiones cayeran un 20% en un año" },
    profileOverride: {
      label: "Perfil de riesgo",
      hint: "Sugerimos uno según tus respuestas. Puedes elegir otro; la renta variable nunca supera el tope.",
      suggested: "Sugerido según tus respuestas",
    },
    goldShare: {
      label: "Parte en oro",
      hint: "Sirve de protección; se mantiene entre {min} y {max} de la mezcla.",
      reset: "Volver a {share}",
    },
    horizonYears: {
      label: "Años hasta que necesites el dinero",
      hint: "Con menos de {noEquity} años no hay renta variable; con menos de {cashOnly} año, solo depósitos y letras.",
    },
    lumpSum: {
      label: "Suma única para invertir ahora",
      hint: "Dinero que puedes apartar hoy a largo plazo.",
    },
    monthly: {
      label: "Monto mensual",
      hint: "Lo que puedes añadir cada mes.",
    },
    propertyValue: {
      label: "Inmuebles que tienes (opcional)",
      hint: "Un terreno o una vivienda. Cuenta en tu patrimonio neto pero no en el reparto, porque no se puede comprar ni vender en partes pequeñas.",
    },
    directShares: {
      label: "¿Comprar acciones directamente en vez de un fondo?",
      hint: "Solo si estás listo para elegir y seguir tú mismo al menos diez empresas grandes.",
    },
  },

  result: {
    score: "Puntuación de riesgo {score} de {max}",
    profileLine: "Tu perfil: {profile}",
    suggestedLine: "Sugerido según tus respuestas: {profile}",
    barLabel: "Tu mezcla: {parts}",
    lump: "suma única",
    monthly: "Cada mes",
    whySplit: "¿Por qué este reparto?",
    horizon: {
      noEquity: "Necesitas este dinero en pocos años, así que la parte de renta variable pasó a renta fija.",
      cashOnly: "Necesitas este dinero en menos de un año, así que todo queda en depósitos o letras.",
    },
  },

  instrument: {
    title: "{bucket}: {share}",
    primary: "Empieza con",
    alternatives: "Otras opciones",
    unavailable: "No disponible en tu país. Por ahora mantén esta parte en renta fija.",
    localName: "Nombre local: {name}",
  },

  projection: {
    intro: "{years} años, {paidIn} aportados. Tres casos, porque nadie sabe cuál ocurrirá.",
    introNone: "Escribe una suma única o un monto mensual para ver el rango.",
    low: "Bajo",
    base: "Base",
    high: "Alto",
    rate: "{rate} al año",
    real: "{amount} en dinero de hoy",
    lowLosesValue: "En el caso bajo tu dinero crece más lento que los precios y pierde poder de compra.",
    why: "¿Por qué estas cifras?",
  },

  rebalance: {
    intro: "Escribe lo que tienes hoy en cada parte y el dinero nuevo que quieras añadir. Calculamos qué comprar o vender para volver a tu mezcla.",
    open: "Ya invierto",
    close: "Ocultar",
    holding: "{bucket} que tienes ahora",
    newMoney: { label: "Dinero nuevo para añadir (opcional)", hint: "El dinero nuevo va primero a las partes que están por debajo." },
    clear: "Borrar lo que tengo",
    total: "Total después del cambio: {amount}",
    buy: "Comprar {amount}",
    sell: "Vender {amount}",
    none: "Sin cambios",
    target: "Objetivo {share}",
    drift: "Ahora {current}, a {drift} del objetivo",
    points: "{value} puntos",
    triggered: "Al menos una parte se aleja más de {band} del objetivo: es momento de rebalancear.",
    withinBand: "Cada parte está a menos de {band} del objetivo. Rebalancea una vez al año de todos modos.",
    newMoneyOnly: "Solo con el dinero nuevo se cierra la diferencia: no hace falta vender nada.",
    sellNote: "Vender implica costos de salida y quizá impuestos. Cuando puedas, mejor dirige el dinero nuevo a las partes que están por debajo durante los próximos meses.",
    why: "¿Por qué estas operaciones?",
  },

  netWorth: {
    inMix: "Invertido en la mezcla",
    property: "Inmuebles (fuera del reparto)",
    total: "Patrimonio neto",
  },

  note: {
    capApplied: "La renta variable se mantiene en el tope, por largo que sea tu horizonte.",
    horizonNoEquity: "Necesitas este dinero en menos de cinco años, así que no lleva renta variable. Las acciones pueden pasar años a la baja.",
    horizonCashOnly: "Necesitas este dinero en menos de un año, así que queda solo en depósitos cortos o letras del Tesoro.",
    propertyExcluded: "Los inmuebles cuentan en tu patrimonio neto pero no en el reparto: no se pueden comprar ni vender en partes pequeñas ni rebalancear.",
    lowLosesValue: "En el caso bajo el dinero crece más lento que los precios, así que compra menos de lo que aportaste.",
    noIndexFund: "Aquí no se venden fondos indexados, bonos de oro ni fondos inmobiliarios, así que la parte de renta variable usa un fondo abierto diversificado y el oro se compra en lingotes o monedas.",
    neverBreakCertificates: "Nunca cobres antes un certificado de ahorro para rebalancear: la tasa baja mucho en los primeros años. Usa dinero nuevo.",
    exitCosts: "Antes de vender, revisa los costos de salida, el impuesto sobre dividendos y el precio que te pagará un joyero por el oro.",
  },

  gate: {
    noEmergencyFund: "Primero completa tu fondo de emergencia. El dinero a largo plazo que quizá tengas que vender con prisa no es dinero a largo plazo.",
    cardDebt: "Primero paga la deuda de tarjeta. El interés de la tarjeta es mucho más alto de lo que probablemente rinda cualquier inversión.",
  },

  howto: {
    fixedIncome:
      "Los certificados de ahorro del Estado se venden en sucursales bancarias y oficinas de correos que los ofrecen; las letras y los bonos del Tesoro, en la mesa de valores del Estado de un banco; y los depósitos a plazo, en cualquier banco autorizado. Lleva tu documento de identidad; los montos grandes piden un número fiscal o un comprobante de declaración de impuestos.",
    equityFund:
      "Elige un fondo abierto diversificado e inicia un plan mensual con la gestora del fondo o con un banco que venda sus participaciones. Lleva tu documento de identidad y una cuenta bancaria. Reparte entre muchas empresas; nunca pongas esta parte en una sola acción.",
    directShares:
      "Necesitas una cuenta BO en una casa de bolsa. Ten al menos diez empresas grandes de cinco o más sectores, sin que ninguna acción supere una décima parte de esta porción. Prepárate para seguirlas tú mismo.",
    gold: "Compra lingotes o monedas de 22 quilates a un joyero miembro de la asociación de joyeros y guarda el comprobante. Las joyas tienen un costo de fabricación y se revenden por menos, así que son para llevar, no para invertir.",
  },
};
