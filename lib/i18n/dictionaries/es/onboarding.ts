import type { Dictionary } from "../../types";

/** Country and language steps on "/" (imported there directly; see en/onboarding.ts). */
export const onboardingEntry: Pick<Dictionary["onboarding"], "country" | "language" | "switchCountry"> = {
  country: {
    title: "¿Dónde vives?",
    subtitle: "Usamos la moneda, las tasas y los productos de ahorro de tu país.",
    searchLabel: "Busca tu país",
    searchPlaceholder: "Nombre del país, en inglés o en tu idioma",
    suggested: "Sugeridos",
    all: "Todos los países",
    results: "Países que coinciden",
    noMatch: "Ningún país coincide con “{query}”.",
    currency: "Moneda: {code}",
    current: "Elección actual",
    changeLater: "Puedes cambiar de país e idioma cuando quieras.",
    intro: "Cinco preguntas rápidas y luego tu plan de ahorro mensual. No necesitas cuenta.",
    disclaimer: "Estimaciones solo con fines educativos; no es asesoría financiera, fiscal ni legal.",
    region: {
      south_asia: "Asia meridional",
      east_asia_pacific: "Asia oriental y el Pacífico",
      europe_central_asia: "Europa y Asia central",
      latin_america_caribbean: "América Latina y el Caribe",
      middle_east_north_africa: "Oriente Medio y norte de África",
      north_america: "América del Norte",
      sub_saharan_africa: "África subsahariana",
    },
  },
  language: {
    title: "¿Qué idioma prefieres?",
    subtitle: "Puedes cambiarlo cuando quieras desde el menú de arriba.",
    country: "País: {country}",
    notAvailable: "Tu idioma aún no está disponible; se usa el inglés.",
    changeCountry: "Cambiar de país",
  },
  /** "/" when the user picks another country while answers exist: the amounts are in the old currency. */
  switchCountry: {
    title: "¿Empezar de cero para {country}?",
    body: "Tus respuestas están en {currency}. Al empezar de cero para {country}, tus respuestas actuales se guardan como borrador para que puedas abrirlas cuando quieras.",
    capWarning: "Ya tienes {max} borradores, así que se eliminará el más antiguo sin nombre.",
    confirm: "Empezar de cero",
    cancel: "Conservar mis respuestas",
    saved: "Guardado como borrador",
  },
};

/** Five quick questions, one per screen. */
export const onboarding: Dictionary["onboarding"] = {
  country: onboardingEntry.country,
  language: onboardingEntry.language,
  switchCountry: onboardingEntry.switchCountry,

  languagePick: {
    title: "¿Qué idioma prefieres?",
    subtitle: "Puedes cambiarlo cuando quieras.",
  },

  progress: "Pregunta {n} de 5",
  intro: "Cinco preguntas rápidas y luego tu plan. No necesitas cuenta.",

  step: {
    1: {
      title: "¿Cuántos años tienes?",
      hint: "Tu edad define cuánto tiempo tienen para crecer tus metas y tu jubilación.",
      placeholder: "Tu edad en años",
      label: "Tu edad",
      decadeLabel: "Toca un atajo y luego corrige la edad exacta abajo",
      decade: {
        under20: "Menos de 20",
        twenties: "20 a 29",
        thirties: "30 a 39",
        forties: "40 a 49",
        fifties: "50 a 59",
        sixtyPlus: "60 o más",
      },
      unit: "años",
    },
    2: {
      title: "¿Cuál es tu ingreso neto mensual?",
      hint: "Lo que de verdad llega a tu cuenta después de impuestos y fondo de previsión.",
      hintFreelance: "¿Ingresos irregulares? Suma los últimos seis meses y divide entre seis.",
      placeholder: "Ingreso neto en tu moneda",
      label: "Ingreso neto mensual",
      incomeTypeLabel: "¿Cómo ganas tu dinero?",
      incomeTypeHint: {
        salaried: "Un sueldo fijo cada mes",
        freelance: "Pagos por proyecto o cliente que varían",
        business: "La ganancia que retiras de tu propio negocio",
      },
      average: {
        toggle: "Calcularlo con los últimos seis meses",
        title: "Ingresos de los últimos seis meses",
        hint: "Escribe lo que recibiste cada mes. Deja un mes en blanco si no tuviste nada.",
        month: "Mes {n}",
        result: "Promedio de seis meses: {amount}",
        use: "Usar {amount} como mi ingreso neto",
        close: "Ocultar",
      },
    },
    3: {
      title: "¿Cuánto gastas en lo esencial cada mes?",
      hint: "Alquiler, comida, servicios, transporte, gastos escolares, ayuda a tus padres y cualquier cuota que ya pagues. Deja fuera comer afuera, compras y vacaciones.",
      placeholder: "Gasto esencial en tu moneda",
      label: "Gasto esencial mensual",
      countsTitle: "Qué cuenta como esencial",
      counts: {
        rent: "Alquiler o cuota de la hipoteca",
        food: "Comida y supermercado",
        utilities: "Luz, gas, agua, teléfono e internet",
        transport: "Transporte",
        school: "Gastos escolares y clases particulares",
        parents: "Ayuda que envías a tus padres",
        emi: "Cualquier cuota de préstamo o tarjeta que ya pagues",
      },
      leaveOut: "Deja fuera comer afuera, compras, aparatos y vacaciones.",
      takeHomeReminder: "Tu ingreso neto: {amount}",
      leftOver: "Te queda después de lo esencial: {amount}",
    },
    4: {
      title: "¿Quién depende de tu ingreso?",
      hint: "Elige a todos los que correspondan. Las personas a tu cargo cambian tu colchón de emergencia y el seguro que necesitas.",
      none: "Nadie depende de mí",
      label: "Personas a cargo",
      option: {
        partner: "Pareja",
        children: "Hijos",
        parents: "Padres",
      },
      optionHint: {
        partner: "Cónyuge o pareja que depende de tu ingreso",
        children: "Cualquier hijo o hija que mantienes",
        parents: "Padres o suegros que mantienes",
      },
    },
    5: {
      title: "¿Tienes préstamos o un saldo de tarjeta de crédito pendiente?",
      hint: "Cuenta préstamos bancarios, de auto o hipotecarios, y cualquier tarjeta que no pagas por completo cada mes.",
      yes: "Sí, tengo deudas",
      no: "Sin deudas",
      label: "Préstamos o saldos de tarjeta",
      yesNote: "Bueno saberlo. Tu plan incluirá una revisión de deudas para pagar primero la más cara.",
      noNote: "Genial. Tu plan puede ir directo al ahorro.",
      readyTitle: "Eso es todo",
      ready: "Tu plan se arma con estas cinco respuestas. Puedes cambiar cualquiera más adelante.",
    },
  },

  summary: {
    age: "{age} años",
    takeHome: "Ingreso neto {amount}",
    essentials: "Gastos esenciales {amount}",
    /** {list}: the people who depend on the user, already joined ("Partner, Children"). */
    dependents: "Dependen de ti: {list}",
    noDependents: "Nadie depende de ti",
    debt: "Con préstamos o deuda de tarjeta",
    noDebt: "Sin deudas",
  },

  cta: {
    start: "Empezar",
    seePlan: "Ver mi plan",
    next: "Siguiente",
    back: "Atrás",
  },

  validation: {
    required: "Escribe un número para continuar.",
    number: "Escribe solo dígitos, por ejemplo {example}.",
    ageRange: "Escribe una edad entre {min} y {max}.",
    positiveAmount: "Escribe un monto mayor que cero.",
    essentialsAboveIncome: "Tus gastos esenciales superan tu ingreso neto. Revisa ambas cifras: el plan puede funcionar igual, pero el ahorro será muy pequeño.",
    pickOne: "Elige al menos una opción, o “Nadie”.",
  },
};
