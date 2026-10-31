import type { Dictionary } from "../../types";

/** Plan screen. Reason params are documented in en/plan.ts; the placeholders here must match. */
export const plan: Dictionary["plan"] = {
  title: "Tu plan",
  headline: "Ahorra {amount} al mes",
  subhead: "Repartido entre tus apartados por orden de prioridad. Toca una tarjeta para ajustarla; el plan se actualiza al instante.",
  emptyGoals: "Aún no hay metas. Añade una (la jubilación cuenta) y el plan le hará espacio.",
  builtOn: "Basado en las tasas v{version}",
  demoBanner: "Plan de ejemplo con cifras de demostración, no las tuyas. Abre el plan sin el modo demo para ver el tuyo.",

  why: {
    headline: "¿Por qué ahorrar {amount} al mes?",
    bucket: "¿Por qué {amount} para {bucket}?",
  },

  error: {
    title: "Tu plan aún no está listo",
    retry: "Reintentar",
  },

  card: {
    amount: "Monto",
    instrument: "Dónde",
    reason: "Por qué",
    nextStep: "Siguiente paso",
    open: "Abrir calculadora",
    priority: "Prioridad {n}",
    perMonth: "{amount}/mes",
    goalTitle: "Meta: {name}",
    bucket: {
      emergency: "Fondo de emergencia",
      insurance: "Seguros",
      debt: "Pago de deudas",
      goal: "Meta",
      retirement: "Jubilación",
      future: "Futuro",
    },
  },

  more: {
    title: "Completa tu plan",
    start: "Empezar",
    edit: "Editar",
    reserved: "El plan aparta {amount} al mes para esto.",
    m2: { title: "Seguros y salud", body: "Cuánta cobertura de vida y de salud necesita tu familia, y cuánto debería costar más o menos." },
    m6: { title: "Mezcla de activos", body: "Cómo repartir el dinero a largo plazo entre renta fija, acciones y oro según tu edad." },
    m7: { title: "Jubilación y familia", body: "Lo que necesitas para vivir de tu propio dinero hasta los 100, y qué fuentes de ingreso lo reducen." },
  },

  summary: {
    title: "Resumen",
    emergencyShare: "{share} de tu monto mensual va al fondo de emergencia hasta completarlo.",
    monthsToFull: "Fondo de emergencia completo en {months}.",
    emergencyFull: "Tu fondo de emergencia está completo.",
    goalsShortfall: "Tus metas necesitan {amount} más al mes de lo que el plan puede cubrir ahora.",
    noShortfall: "Todas tus metas caben en el monto de este mes.",
    retirementShortfall: "La jubilación necesita {amount} más al mes de lo que el plan puede cubrir ahora.",
  },

  reason: {
    emergency: "Fondo de emergencia: {amount}/mes en {instrument}; tienes cubiertos {covered} de {months} meses",
    emergencyFull: "Fondo de emergencia: completo con {months} meses de gastos esenciales; repónlo después de cualquier uso",
    debt: "Deuda con interés alto al {rate}: {amount}/mes además de tu cuota; saldada en unos {months} a este ritmo",
    debtNever: "Deuda con interés alto al {rate}: {amount}/mes además de tu cuota; a este ritmo nunca se salda, así que paga más o pásala a un préstamo más barato",
    debtNone: "Deuda con interés alto al {rate}: este mes aún no cabe nada; paga al menos el mínimo de cada deuda",
    goal: "{name}: {amount}/mes en {instrument}; necesitarás {fv} en {years}",
    addGoal: "Añade una meta: todo plan necesita al menos una, y la jubilación cuenta",
    insurance: "Seguros: {amount}/mes apartados para seguro de vida a término y de salud",
    insuranceNone: "Seguros: este mes aún no cabe nada; la cobertura sigue importando, así que abre la revisión de seguros",
    retirement: "Jubilación: {amount}/mes para que tu dinero dure hasta los {planTo} años",
    retirementShort: "Jubilación: {amount}/mes de los {need} que necesitas; dura hasta los {lastsTo} años",
    retirementShortNoAge: "Jubilación: {amount}/mes de los {need} que necesitas",
    retirementNone: "Jubilación: este mes aún no cabe nada de los {need} al mes que necesitas",
    future: "Ahorro a largo plazo: {amount}/mes en {instrument} hasta que añadas una meta",
  },

  next: {
    fdrLadder: "Ve a cualquier banco con tu documento de identidad y tu número fiscal; pide {product} a 3 meses. Abre uno cada mes durante tres meses para que venza uno cada mes.",
    openSavings: "Abre {product} en cualquier banco con tu documento de identidad. Deja ahí un mes de gastos esenciales y el resto en depósitos a 3 meses.",
    prepayDebt: "Llama a tu prestamista y pregunta cómo hacer un pago extra al capital sin penalización. Ponlo primero en la deuda con la tasa más alta.",
    dps: "Pide a tu banco abrir {product} con débito automático el día después de que llegue tu sueldo. Cualquier monto sirve; el hábito importa más que la cantidad.",
    sanchayapatra: "Lleva tu documento de identidad, tu número fiscal y un cheque de tu cuenta bancaria a una sucursal bancaria u oficina de correos que venda certificados de ahorro del Estado, y pide {product}.",
    tbond: "Pide a tu banco que te registre para las subastas de bonos del Estado y haz una oferta por {product} a 5 o 10 años; también puedes comprar uno ya emitido con una cuenta de valores.",
    fdr: "Ve a cualquier banco con tu documento de identidad y tu número fiscal; pide {product} a 1 año y guarda el comprobante en un lugar seguro.",
    addGoal: "Toca “Añadir una meta”, ponle un nombre, su costo en dinero de hoy y en cuántos años la necesitas.",
    keepFull: "Tu fondo está completo: déjalo donde está. Después de cualquier retiro, repón el mismo monto antes de cualquier otro ahorro para que vuelva a estar entero.",
    insurance: "Abre la revisión de seguros: calcula la cobertura de vida y de salud que necesita tu familia y cuánto debería costar más o menos.",
    retirement: "Abre el plan de jubilación: mira lo que necesitas para vivir de tu propio dinero hasta los 100 y qué fuentes de ingreso lo reducen.",
    allocation: "Abre la mezcla de activos: reparte el dinero a largo plazo entre renta fija, acciones y oro según tu edad.",
  },

  note: {
    insuranceSkipped: "Tus respuestas de seguros no se pudieron calcular con tu perfil actual, así que por ahora los seguros quedan fuera de este plan. Abre la revisión de seguros para actualizarlas.",
    allocationSkipped: "Tus respuestas de la mezcla de activos no se pudieron calcular con tu perfil actual, así que por ahora el plan usa renta fija. Abre la mezcla de activos para actualizarlas.",
    retirementSkipped: "Tus respuestas de jubilación ya no encajan con tu perfil (por ejemplo, cambió tu edad), así que por ahora la jubilación queda fuera de este plan. Abre el plan de jubilación para actualizarlas.",
  },
};
