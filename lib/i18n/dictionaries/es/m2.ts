import type { Dictionary } from "../../types";

/**
 * Insurance & health screen (M2). `note.*` covers M2_NOTE_KEYS and `check.*` covers M2_CHECK_KEYS.
 * `check.claimSettlement` takes {claimSettlement} (a percent); no other check or note takes a placeholder.
 */
export const m2: Dictionary["m2"] = {
  title: "Seguros y salud",
  intro: "Cuánta cobertura de vida y de salud necesita tu familia, cuánto cuesta más o menos y cómo revisar una aseguradora antes de firmar.",
  demo: "Cifras de ejemplo solo para vista previa. Aquí no se usan tus propios datos.",
  backToPlan: "Volver a mi plan",

  needProfile: {
    title: "Primero, unas preguntas sobre ti",
    body: "Esta revisión usa tu edad, tu ingreso y quién depende de ti. Responde las cinco preguntas iniciales y luego vuelve aquí.",
    cta: "Responder las preguntas",
  },

  flow: {
    eyebrow: "Revisión de seguros",
    smoker: {
      title: "¿Fumas o consumes tabaco?",
      hint: "Las aseguradoras cobran más a quienes fuman por el seguro de vida, así que el rango de precios depende de esto.",
    },
    lifeCover: {
      title: "¿Cuánta cobertura de vida tienes ya?",
      hint: "Suma las sumas aseguradas de todas tus pólizas de vida, incluida la cobertura de tu empleador. Escribe 0 si no tienes ninguna.",
      none: "No tengo ninguna",
    },
    healthCover: {
      title: "¿Cuánta cobertura de salud tiene ya tu familia?",
      hint: "El límite anual de tu póliza de salud o la de tu empleador, para todos juntos. Escribe 0 si no tienen ninguna.",
      none: "No tenemos ninguna",
    },
    people: {
      title: "¿A quién debe incluir la cobertura de salud?",
      hint: "Lo completamos según quién depende de ti. Cámbialo si otra persona necesita cobertura.",
    },
    seeResult: "Ver mi resultado",
  },

  section: {
    inputs: "Tus respuestas",
    result: "La cobertura que necesita tu familia",
    notes: "Para tener en cuenta",
  },

  input: {
    smoker: {
      label: "¿Fumas o consumes tabaco?",
      hint: "Quienes fuman pagan más por el seguro de vida. Dilo también en cualquier solicitud.",
    },
    existingLifeCover: {
      label: "Cobertura de vida que ya tienes",
      hint: "La suma asegurada de todas tus pólizas de vida, incluida la de tu empleador. 0 si no tienes.",
    },
    existingHealthCover: {
      label: "Cobertura de salud que ya tiene la familia",
      hint: "El límite anual de todas las pólizas de salud, tuyas o de tu empleador, para todos juntos. 0 si no tienen.",
    },
    people: {
      label: "A quién incluye la cobertura de salud",
      hint: "Elige a todas las personas que deben quedar cubiertas.",
    },
    childrenCount: {
      label: "Hijos a cubrir",
    },
    parentsCount: {
      label: "Padres a cubrir",
    },
    parentAge: {
      label: "Edad del padre o la madre mayor",
      hint: "La cobertura de salud cuesta más con la edad, así que el rango de precios usa este dato.",
    },
    coverToAge: {
      label: "Cobertura de vida hasta los",
      hint: "La mayoría de las familias dejan de depender de tu ingreso cuando los hijos crecen, así que la cobertura rara vez necesita ir más allá de la jubilación.",
    },
    incomeShare: {
      label: "Parte de tu ingreso que necesitaría la familia",
      hint: "Sin ti, algunos gastos desaparecen, así que la familia necesita parte de tu ingreso, no todo.",
    },
    investments: {
      label: "Inversiones que la familia podría vender",
      hint: "Acciones, fondos, certificados de ahorro u oro. Tus ahorros de emergencia ya están contados.",
    },
    youngestChildAge: {
      label: "Edad de tu hijo menor (opcional)",
      hint: "Así la cobertura de vida dura hasta que ese hijo pueda mantenerse, si eso ocurre antes de la edad de abajo.",
    },
  },

  person: {
    self: "Yo",
    partner: "Pareja",
    child: "Hijos",
    parent: "Padres",
  },

  status: {
    red: "Gran falta de cobertura",
    amber: "Falta algo de cobertura",
    green: "Cubierto por ahora",
  },

  life: {
    title: "Seguro de vida",
    label: "Cobertura de vida que necesita tu familia",
    multiple: "Unas {multiple} veces tu ingreso anual",
    existing: "Cobertura que ya tienes",
    gap: "Falta contratar",
    years: "Años de cobertura",
    yearsValue: "{years} (hasta los {age})",
    incomeNeed: "Para reemplazar tu ingreso",
    incomeNeedHint: "Lo que la familia necesitaría durante esos años, en dinero de hoy.",
    enough: "La cobertura que tienes alcanza por ahora.",
    notNeeded: "Aún no hace falta",
    why: "¿Por qué {amount} de cobertura de vida?",
    status: {
      red: "Falta la mayor parte de la cobertura",
      amber: "Falta parte de la cobertura",
      green: "Cobertura de vida suficiente",
    },
  },

  health: {
    title: "Seguro de salud",
    label: "Cobertura de salud para la familia",
    caption: "Para {people} personas",
    captionOne: "Para {people} persona",
    perPerson: "Por adulto",
    perPersonHint: "Más o menos lo que te costaría una hospitalización.",
    existing: "Cobertura que ya tiene la familia",
    gap: "Falta contratar",
    enough: "La cobertura de salud de la familia alcanza por ahora.",
    why: "¿Por qué {amount} de cobertura de salud?",
    status: {
      red: "Falta la mayor parte de la cobertura",
      amber: "Falta parte de la cobertura",
      green: "Cobertura de salud suficiente",
    },
  },

  premium: {
    title: "Cuánto podría costar",
    monthly: "Aparta cada mes",
    caption: "Tu plan aparta esto para las dos coberturas.",
    captionNone: "No hace falta apartar más: la cobertura que tienes alcanza por ahora.",
    captionHealth: "Tu plan aparta esto para la cobertura de salud.",
    captionLife: "Tu plan aparta esto para el seguro de vida a término.",
    life: "Vida a término, al año",
    lifeHint: "Por {gap} de cobertura.",
    smokerHint: "Por {gap} de cobertura, con precio de fumador.",
    health: "Seguro de salud, al año",
    healthHint: "Por {gap} más de cobertura.",
    range: "{low} – {high}",
    none: "No hay que contratar más",
    indicative: "Rangos aproximados, no cotizaciones",
    why: "¿Por qué {amount} al mes?",
  },

  policy: {
    title: "¿Ya pagas una póliza con ahorro?",
    hint: "Una póliza que te devuelve dinero al final (un seguro dotal). Mira cómo se compara con un seguro a término simple.",
    intro: "Escribe las cifras de los papeles de tu póliza. Comparamos lo que paga la póliza al final con contratar un seguro a término por el mismo monto y poner el resto de la prima en un depósito seguro.",
    annualPremium: {
      label: "Prima que pagas al año",
    },
    sumAssured: {
      label: "Cobertura de vida de la póliza",
      hint: "El capital asegurado que figura en la póliza.",
    },
    termYears: {
      label: "Plazo total de la póliza",
    },
    yearsPaid: {
      label: "Años ya pagados",
    },
    expectedMaturity: {
      label: "Monto que paga la póliza al final",
      hint: "El valor al vencimiento de la proyección de la aseguradora, con el bono esperado.",
    },
    surrenderValue: {
      label: "Lo que te pagaría la aseguradora si la dejas hoy (opcional)",
      hint: "El valor de rescate o de póliza saldada; pregúntalo a la aseguradora. Sin él, la comparación no incluye lo que recuperas al dejarla.",
    },
    incomplete: "Completa las cinco cifras para ver la comparación.",
    keep: "Si mantienes la póliza",
    keepHint: "Se paga al final del plazo.",
    alternative: "Seguro a término y ahorrar la diferencia",
    alternativeHint: "El resto de cada prima va a {instrument} durante los {years} que quedan.",
    atLeast: "Al menos {amount}",
    surrenderPart: "Incluye {amount} del valor de rescate, con su crecimiento hasta el final.",
    termPremium: "Seguro a término por el mismo monto, al año",
    remaining: "Años que faltan por pagar",
    irr: "Rentabilidad anual de la póliza",
    irrHint: "Lo que rinden las primas cada año si la póliza paga lo que proyecta.",
    verdict: {
      termPlusInvestAhead: "Con estas cifras, el seguro a término más ahorrar la diferencia podría dejarte unos {amount} más al final.",
      policyAhead: "Con estas cifras, la póliza sale ganando por unos {amount} frente al seguro a término más ahorrar la diferencia.",
      similar: "Con estas cifras, los dos caminos terminan más o menos igual.",
    },
    clear: "Borrar estas cifras",
    why: "¿Por qué esta comparación?",
  },

  checklist: {
    title: "Revisa la aseguradora antes que la póliza",
    intro: "Una póliza vale lo que valen las reclamaciones que paga la aseguradora. Repasa esta lista antes de firmar.",
    regulatorLink: "Regulador de seguros: {name}",
    complaintsLink: "Dónde reclamar: {name}",
  },

  note: {
    noDependents: "Nadie depende de tu ingreso y no tienes deudas, así que aún no necesitas seguro de vida. El seguro de salud sigue importando.",
    debtsOnly: "Nadie depende de tu ingreso, así que el seguro de vida solo tiene que cubrir tus deudas, para que nunca pasen a tu familia.",
    publicCoverBroad: "En tu país, la sanidad pública paga la mayoría de las cuentas de hospital, así que calculamos tu propia cobertura de salud como una parte mínima de una hospitalización.",
    premiumIndicative: "Las primas son rangos aproximados de tablas de precios típicas, no cotizaciones. Tu precio depende de tu salud, la aseguradora y la póliza.",
    noTermSold: "No tenemos tabla de precios de seguro de vida a término puro en tu país, así que la prima de vida aparece en cero. Pide una cotización a término a las aseguradoras.",
    separateInvesting: "Mantén separados el seguro y la inversión: la cobertura es un gasto, como el alquiler, y ahorrar para el futuro se hace aparte.",
    policyNotAdvice: "Esta es una comparación aproximada, no un consejo para dejar o mantener una póliza. Dejar una póliza antes de tiempo suele hacer perder dinero, así que pregunta a la aseguradora cuánto recuperarías antes de cambiar nada.",
    policyNoSurrender: "No escribiste lo que la aseguradora te devolvería si la dejas hoy, así que lo contamos como cero. Aquí dejarla parece peor de lo que es: pide el valor de rescate a la aseguradora y añádelo.",
    policyMatured: "Todas las primas de esta póliza ya están pagadas, así que no queda nada que comparar. Cobra el valor al vencimiento cuando corresponda.",
    multipleOutsideBand: "Una regla práctica común es tener una cobertura de vida de diez a quince veces tu ingreso neto anual. La tuya está fuera de ese rango por tu familia, tus deudas y tus ahorros; la cifra de arriba está calculada para ti.",
    noHealthPriceTable: "No tenemos tabla de precios de seguros de salud en tu país, así que la prima de salud aparece en cero. Pide a las aseguradoras una cotización por la cobertura de arriba.",
  },

  check: {
    regulator: "Comprueba que la aseguradora tenga licencia del regulador de seguros. Búscala en el sitio web del regulador antes de firmar.",
    claimSettlement: "Pregunta qué parte de las reclamaciones paga la aseguradora. Entre las aseguradoras de vida de aquí ronda el {claimSettlement}; elige una que pague bastante más que eso.",
    complaints: "Ten claro dónde reclamar. Si rechazan o retrasan una reclamación sin un motivo claro, la oficina de quejas del regulador puede intervenir.",
    waitingPeriods: "Lee los períodos de carencia. Muchas pólizas de salud no pagan algunas enfermedades durante el primer año o los dos primeros.",
    exclusions: "Lee la lista de lo que no está cubierto antes de firmar, no después de una reclamación.",
    cashlessNetwork: "Revisa qué hospitales aceptan la póliza sin que pagues primero, incluidos los hospitales cerca de donde vive tu familia.",
    honestProposal: "Responde con la verdad cada pregunta de la solicitud, también sobre tabaco y enfermedades pasadas. Una respuesta falsa es la causa más común de que se rechace una reclamación.",
    buyYoung: "Contrata pronto. Las primas son más bajas mientras eres joven y estás sano, y una enfermedad más adelante puede dificultar conseguir cobertura.",
    medicalTests: "Cuenta con exámenes médicos para coberturas grandes. Hazlos: protegen tu reclamación más adelante.",
  },
};
