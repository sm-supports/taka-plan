import type { Dictionary } from "../../types";

/**
 * Retirement & family screen (M7, "Plan to 100"). `note.*` covers M7_NOTE_KEYS and `option.*`
 * covers M7_OPTION_KEYS. Tone: independence and dignity, never fear; no death imagery.
 */
export const m7: Dictionary["m7"] = {
  title: "Jubilación y familia",
  intro: "Cuánto apartar para vivir de tu propio dinero, a tu manera, hasta los 100.",
  introRetired: "Cuánto puedes sacar de tus ahorros cada mes para que tu dinero dure, a tu manera, hasta los 100.",
  demo: "Cifras de ejemplo solo para vista previa. Aquí no se usan tus propios datos.",

  flow: {
    mode: {
      title: "¿Sigues trabajando o ya te jubilaste?",
      hint: "Si trabajas, calculamos cuánto apartar cada mes. Si ya te jubilaste, calculamos cuánto puedes sacar cada año.",
    },
    age: {
      title: "¿Cuántos años tienes?",
      hint: "Tomado de tu plan. Cámbialo si no es correcto.",
      label: "Tu edad",
    },
    retirementAge: {
      title: "¿A qué edad quieres dejar de trabajar?",
      hint: "La mayoría de los empleos privados terminan a los {age}. Elige la edad que encaje con tu trabajo y tu salud.",
      label: "Edad de jubilación",
    },
    spending: {
      title: "¿Cuánto gasta tu hogar al mes hoy?",
      hint: "En dinero de hoy. Partimos de tus gastos esenciales; añade lo que seguirías pagando después de dejar de trabajar.",
      label: "Gasto del hogar al mes",
    },
    savings: {
      title: "¿Cuánto has ahorrado e invertido hasta ahora?",
      hint: "Ahorros, depósitos, {product}, fondos y acciones que guardarías para más adelante. No tu vivienda ni tu fondo de previsión (eso va después).",
      label: "Ahorros e inversiones hoy",
    },
    monthlySaving: {
      title: "¿Cuánto apartas cada mes ahora?",
      hint: "Solo el dinero que apartas para más adelante. Cero es una buena respuesta: aquí empieza el plan.",
      label: "Ahorro mensual actual",
    },
    sex: {
      title: "¿Eres hombre o mujer?",
      hint: "Opcional. Las mujeres viven unos dos años más en promedio, y el subsidio de vejez empieza a otra edad.",
      skip: "Omitir esta pregunta",
    },
    retireeType: {
      title: "¿Te jubilaste del sector público o del privado?",
      hint: "Quienes se jubilan del sector público, de entidades semipúblicas o de las fuerzas armadas pueden usar un certificado de ahorro reservado para ellos.",
    },
    retiredSavings: {
      title: "¿Qué ahorros tienes ahora?",
      hint: "Lo que cobraste del fondo de previsión y la indemnización por antigüedad, depósitos a plazo fijo, certificados de ahorro y todo lo demás de lo que vives.",
      label: "Ahorros actuales",
    },
    otherIncome: {
      title: "¿Qué otros ingresos recibes cada mes?",
      hint: "Una pensión, un alquiler o cualquier otra cosa aparte de tus ahorros. Déjalo en cero si no tienes nada.",
      label: "Otros ingresos al mes",
    },
    retiredSpending: {
      title: "¿Cuánto gasta tu hogar al mes?",
      hint: "Todo, incluidos medicamentos y ayuda en casa.",
      label: "Gasto del hogar al mes",
    },
    seeResult: "Ver mi plan hasta los 100",
  },

  mode: {
    working: "Sigo trabajando",
    workingHint: "Calcula el ahorro mensual que dura hasta los 100",
    retired: "Ya me jubilé",
    retiredHint: "Calcula un retiro anual que dure hasta los 100",
  },
  sex: {
    male: "Hombre",
    female: "Mujer",
    unknown: "Prefiero no decirlo",
  },
  retireeType: {
    government: "Sector público",
    governmentHint: "Sector público, entidades semipúblicas o fuerzas armadas",
    private: "Privado o por cuenta propia",
    privateHint: "Empleo en empresa, negocio o trabajo independiente",
  },

  section: {
    inputs: "Tus cifras",
    sources: "Ingresos después de dejar de trabajar",
    result: "Tu plan",
  },

  input: {
    mode: "Trabajo o jubilación",
    age: {
      label: "Tu edad",
      hint: "Si la cambias aquí, también cambia en tu plan.",
    },
    sex: {
      label: "Hombre o mujer (opcional)",
      hint: "Solo se usa para dos notas: las mujeres viven más en promedio, y la edad del subsidio de vejez.",
    },
    retirementAge: {
      label: "Edad de jubilación",
      hint: "La edad habitual aquí es {age}.",
    },
    planToAge: {
      label: "Planificar hasta los",
      hint: "Por defecto planificamos hasta los 100. Puedes bajarlo hasta {min}, nunca menos, o subirlo hasta {max}.",
    },
    spending: {
      label: "Gasto del hogar al mes, hoy",
      hint: "En dinero de hoy; lo hacemos crecer con los precios hasta el año en que dejes de trabajar.",
    },
    savings: {
      label: "Ahorros e inversiones hoy",
      hint: "Guardados para más adelante. No tu vivienda ni tu fondo de previsión.",
    },
    monthlySaving: {
      label: "Ahorro mensual actual",
      hint: "Lo que ya apartas para más adelante.",
    },
    retireeType: "De dónde te jubilaste",
    retiredSavings: {
      label: "Ahorros actuales",
      hint: "Todo lo que te da para vivir: liquidaciones, depósitos a plazo fijo, certificados de ahorro.",
    },
    otherIncome: {
      label: "Otros ingresos al mes",
      hint: "Una pensión, un alquiler o cualquier otra cosa aparte de tus ahorros.",
    },
  },

  sources: {
    intro: "Añade lo que esperas tener. Cada uno reduce lo que necesitas ahorrar.",
    add: "Añadir",
    remove: "Quitar",
    notCounted: "No se cuenta",
    lowered: "Tus fuentes de ingreso reducen el ahorro mensual en {amount}.",
    retiredIntro: "Tus otros ingresos ya se cuentan arriba. Estos dos se muestran para tener el panorama completo, pero nunca se cuentan.",
    pf: {
      title: "Fondo de previsión",
      hint: "Crece a la tasa propia del fondo y se paga como suma única cuando dejas de trabajar.",
      balance: "Saldo hoy",
      contribution: "Aporte mensual (tu parte más la de tu empleador)",
      contributionHint: "Los empleadores grandes ahora aportan más o menos lo mismo que tú; revisa tu recibo de sueldo.",
      rate: "Tasa anual del fondo",
      rateHint: "Del estado anual de tu fondo. Nunca suponemos una, porque cada fondo es distinto.",
    },
    gratuity: {
      title: "Indemnización por antigüedad",
      hint: "Una suma única al irte: días del último sueldo base por cada año de servicio, según la ley o la regla de tu empleador si es mejor.",
      years: "Años de servicio al dejar de trabajar",
      basic: "Último sueldo base mensual",
      employerDays: "Días por año de tu empleador (solo si son más que los de la ley)",
      employerDaysHint: "Déjalo vacío para usar la regla de la ley.",
    },
    pension: {
      title: "Sistema público de pensiones",
      hint: "Se paga de por vida como monto fijo, así que cada año compra menos. Lo valoramos así.",
      scheme: "Sistema: {name}",
      contribution: "Tu aporte al mes",
      expected: "Pensión mensual que esperas (si la sabes)",
      expectedHint: "Déjalo vacío y usamos las proyecciones oficiales del sistema.",
    },
    fixedPension: {
      title: "Otra pensión fija",
      hint: "Cualquier pensión que no sube con los precios.",
      label: "Pensión al mes",
    },
    rent: {
      title: "Alquiler que recibes",
      hint: "El alquiler suele subir con los precios, así que se resta directamente de tu gasto.",
      label: "Alquiler al mes, hoy",
    },
    allowance: {
      title: "Subsidio de vejez",
      hint: "Una ayuda estatal pequeña y sujeta a requisitos de ingresos. Se muestra para tener el panorama completo, nunca se cuenta en el plan.",
      label: "¿Podrías tener derecho?",
      amount: "Unos {amount} al mes desde los {age}",
    },
    family: {
      title: "Ayuda de la familia",
      hint: "La ayuda de los hijos es bienvenida, pero tendrán sus propios gastos. Un extra, nunca el plan.",
      label: "Ayuda mensual que podrías recibir",
    },
  },

  result: {
    headline: "Aparta cada mes",
    caption: "para que tu dinero dure hasta los {planTo}. Objetivo al dejar de trabajar a los {retirementAge}: {corpus}.",
    funded: "Lo que ya tienes cubre el objetivo hasta los {planTo}. Mantenlo invertido.",
    currentSaving: "Ahora apartas {amount} al mes.",
    mixUsed: "Antes de dejar de trabajar, tus ahorros crecen con la rentabilidad de tu mezcla de activos.",
    contrast: {
      title: "Planificar hasta los {contrast} o hasta los {planTo}",
      to: "Hasta los {age}",
      target: "Objetivo",
      monthly: "Al mes",
      extra: "Los {amount} extra al mes cubren {years} años más viviendo de tu propio dinero, de los {contrast} a los {planTo}.",
      noExtra: "Tus ahorros ya cubren los años después de los {contrast}.",
      footnote: "Los {contrast} años se muestran solo para comparar: mucha gente vive bastante más.",
    },
    range: {
      title: "Según la rentabilidad",
      low: "Si la rentabilidad es menor",
      base: "Nuestro caso base",
      high: "Si la rentabilidad es mayor",
      hint: "Las proyecciones largas nunca son exactas; mostramos un rango y redondeamos cada cifra.",
    },
    chart: {
      title: "¿Cuánto duraría mi dinero?",
      hint: "Tus ahorros con lo que apartas ahora, año por año, en el dinero de cada año.",
      label: "Ahorros de los {from} a los {to} años: máximo de {peak} a los {peakAge}. {verdict}.",
      axisAge: "Edad",
      retire: "Fin del trabajo",
    },
    verdict: {
      onTrack: "Vas bien hasta los {age}",
      lastsTo: "Dura hasta los {age}",
      runsOut: "Se acaba a los {age}",
    },
    shift: {
      title: "Qué cambia empezar {years} años antes o después",
      earlier: "Si hubieras empezado a los {age}",
      later: "Si empiezas a los {age}",
      now: "Empezando ahora, a los {age}",
      perMonth: "{amount} al mes",
      notPossible: "Demasiado cerca de la jubilación",
      hint: "Mismo gasto, ahorros y edad de jubilación; solo cambia el inicio.",
    },
    income: {
      title: "Lo que aportan tus fuentes",
      pf: "Fondo de previsión al dejar de trabajar",
      gratuity: "Indemnización por antigüedad",
      pensions: "Pensiones fijas, valoradas al dejar de trabajar",
      publicPension: "Pensión pública al mes",
      rent: "Alquiler al año al dejar de trabajar",
      allowance: "Subsidio de vejez al mes",
      family: "Ayuda de la familia al mes",
    },
    addSources: "Añade tus fuentes de ingreso",
    editAnswers: "Cambiar tus respuestas",
  },

  retired: {
    headline: "Puedes sacar cada mes",
    caption: "Son {firstYear} el primer año; después sube cada año con los precios y dura hasta los {planTo}.",
    chartHint: "Tus ahorros año por año con el retiro de arriba, en el dinero de cada año.",
    range: {
      title: "Lo que puedes sacar, según la rentabilidad",
      low: "Si la rentabilidad solo iguala la inflación",
      hint: "Las proyecciones largas nunca son exactas; mostramos un rango y redondeamos cada cifra.",
    },
    runsOut: "Con un gasto de {spending} al mes de tus ahorros, el dinero duraría hasta los {age} aproximadamente.",
    lasts: "Con un gasto de {spending} al mes de tus ahorros, el dinero dura hasta los {planTo}.",
    target: {
      title: "Ahorros necesarios para tu gasto",
      hint: "Lo que necesitas ahorrado para cubrir tu gasto, hasta los {contrast} y hasta los {planTo}.",
    },
    pot: {
      title: "La regla de las dos bolsas",
      body: "Guarda {amount} ({years} años de retiros) en depósitos a plazo fijo y letras del Tesoro a los que puedas acceder rápido. El resto sigue invertido y rellena esta bolsa una vez al año.",
    },
    options: {
      title: "Formas de convertir ahorros en un ingreso estable",
      localName: "Aquí: {name}",
    },
  },

  bucket: {
    title: "¿A dónde debería ir este dinero?",
    body: "El dinero para más adelante necesita un lugar que dure más que cualquier empresa. Donde no se venden fondos indexados amplios, el plan arma lo más parecido con tres partes: un fondo abierto diversificado con un plan mensual para crecer; ingresos respaldados por el Estado, como el sistema público de pensiones, los certificados de ahorro y los bonos del Tesoro; y una mezcla que se vuelve más segura cada año a medida que te acercas a los {retirementAge}.",
    bodyRetired: "El dinero para el resto de tu vida necesita un lugar que dure más que cualquier empresa. Guarda los retiros de los próximos años en depósitos y letras del Tesoro a los que puedas acceder rápido, y el resto en ingresos respaldados por el Estado, como certificados de ahorro y bonos del Tesoro, con una parte pequeña en un fondo abierto diversificado para crecer.",
    lock: "Marca este dinero como “no antes de los {retirementAge}” y no lo toques hasta entonces.",
    link: "Ver tu mezcla de activos",
  },

  lifeTable: {
    title: "Cuánto vive la gente después de los 60",
    hint: "Años promedio que quedan por delante a cada edad. La mitad de las personas vive más que el promedio, por eso el plan nunca se detiene ahí.",
    age: "Edad",
    total: "Promedio",
    men: "Hombres",
    women: "Mujeres",
    projected: "Proyección",
    source: "{source}, {date}",
  },
  supportRatio: "En {fromYear} había {fromValue} personas en edad de trabajar por cada persona mayor. Para {toYear} habrá unas {toValue}, así que planifica primero con tu propio dinero.",

  notes: {
    title: "Para tener en cuenta",
  },
  backToPlan: "Volver a mi plan",

  note: {
    planTo100: "Por defecto el plan llega a los 100, porque muchas personas que llegan a los 60 viven bastante más de 80. Puedes bajarlo, pero nunca por debajo de 85.",
    lifeAt60: "La esperanza de vida al nacer incluye todas las edades desde la infancia, por eso parece baja. Quien llega a los 60 puede esperar unos veinte años más en promedio, y la mitad vive más.",
    womenLiveLonger: "Las mujeres viven unos dos años más en promedio, así que el plan de una pareja debe cubrir la jubilación más larga de la esposa.",
    familyNotCounted: "La ayuda de la familia nunca se cuenta: tus hijos tendrán sus propias familias y gastos. Tómala como un extra, no como un plan.",
    allowanceNotCounted: "El subsidio de vejez se muestra pero nunca se cuenta: es pequeño, depende de los ingresos y puede cambiar.",
    pensionFixed: "Una pensión que se paga como monto fijo compra menos cada año a medida que suben los precios, así que se valora de esa forma.",
    pensionEntryClosed: "El sistema público de pensiones solo acepta nuevos afiliados hasta su edad de ingreso, así que no se cuenta en tu caso.",
    supportRatio: "En las próximas décadas habrá menos personas en edad de trabajar por cada persona mayor, así que tus propios ahorros importan más.",
    lock: "Guarda este dinero solo para más adelante. Tocarlo antes de tiempo es la causa más común de que un plan se quede corto.",
    startEarlier: "Empezar antes baja mucho el monto mensual, porque el dinero tiene más tiempo para crecer.",
    noStatutoryGratuity: "No tenemos registrada una ley de indemnización por antigüedad en tu país, así que solo cuentan los días propios de tu empleador. Revisa tu contrato o pregunta a tu empleador.",
    lowCaseInflation: "El caso bajo supone que, durante la jubilación, tu dinero solo sigue el ritmo de los precios, sin rentabilidad real adicional.",
  },

  option: {
    pensionerCertificate: "Certificado de ahorro para pensionados: rendimiento mensual, solo para jubilados del sector público, de entidades semipúblicas y de las fuerzas armadas, hasta un límite.",
    savingsCertificate: "Certificado de ahorro del Estado: un rendimiento fijo respaldado por el Estado.",
    tbonds: "Bonos del Tesoro: respaldados por el Estado, con un cupón fijo cada seis meses.",
    depositLadder: "Escalera de depósitos: depósitos que vencen uno tras otro, para que cada año quede libre algo de dinero.",
    annuity: "Renta vitalicia de la aseguradora estatal: una pensión de por vida, vivas lo que vivas. A cambio, el dinero no se puede heredar.",
  },
};
