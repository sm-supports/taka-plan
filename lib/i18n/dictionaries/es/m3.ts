import type { Dictionary } from "../../types";

/** M3 Debt health check. `path.*` covers M3_PATH_KEYS, `flag.<DebtFlagId>` covers every DebtFlagId. */
export const m3: Dictionary["m3"] = {
  title: "Revisión de deudas",
  intro: "Ordena cada préstamo y tarjeta por tasa. Paga primero la más cara y nunca pidas prestado para darte gustos.",

  input: {
    takeHome: { label: "Ingreso neto mensual", hint: "Lo que de verdad llega a tu cuenta cada mes." },
    essentials: { label: "Gasto esencial mensual", hint: "Alquiler, comida, servicios, transporte, gastos escolares, ayuda a tus padres." },
    savingsTarget: { label: "Ahorro mensual", hint: "Tu monto de ahorro primero del presupuesto. Se reserva antes de cualquier cuota." },
    cashBuffer: { label: "Margen de efectivo", hint: "Un pequeño margen cada mes para imprevistos. Sugerimos una parte del ingreso neto; cámbiala si quieres." },
    extraMonthly: { label: "Extra para deudas cada mes", hint: "Lo que pagues por encima de los mínimos. Déjalo en blanco para usar el margen que tengas." },
    loans: {
      title: "Préstamos",
      add: "Añadir un préstamo",
      remove: "Quitar préstamo",
      empty: "No hay préstamos añadidos.",
      type: { label: "Tipo de préstamo", hint: "Elige el más parecido; solo cambia la etiqueta." },
      outstanding: { label: "Monto que aún debes", hint: "El capital pendiente hoy, según tu último estado de cuenta." },
      annualRate: { label: "Tasa de interés (anual)", hint: "La tasa de tu contrato de préstamo o estado de cuenta." },
      emi: { label: "Cuota mensual", hint: "El monto fijo que pagas cada mes." },
      monthsLeft: { label: "Meses restantes", hint: "Cuotas que aún faltan por pagar." },
    },
    cards: {
      title: "Tarjetas de crédito",
      add: "Añadir una tarjeta",
      remove: "Quitar tarjeta",
      empty: "No hay tarjetas añadidas.",
      balance: { label: "Saldo adeudado", hint: "El monto de tu último estado de cuenta." },
      limit: { label: "Límite de la tarjeta", hint: "Lo máximo que el banco te deja gastar." },
      annualRate: { label: "Tasa de interés (anual)", hint: "Déjalo en blanco para usar la tasa legal o habitual de las tarjetas." },
      paysInFull: { label: "¿Pagas el total cada mes, dentro del período de gracia?", hint: "Si es así, la tarjeta no te cuesta nada. Si no, es el dinero más caro que tienes." },
    },
    scenario: {
      title: "¿Cuánto podría pedir prestado?",
      annualRate: { label: "Tasa del préstamo (anual)", hint: "La tasa que te ofreció un banco, o nuestro valor por defecto para un préstamo personal." },
      months: { label: "Plazo de pago", hint: "En meses." },
    },
  },

  result: {
    totalEmi: "Total de cuotas mensuales",
    emiRatio: "Cuotas como parte del ingreso neto",
    emiCapacity: "Capacidad de pago",
    emiCapacityHint: "Lo que queda para cuotas después del ahorro, los gastos esenciales y un margen de efectivo.",
    headroom: "Margen disponible",
    headroomHint: "Capacidad de pago menos las cuotas que ya pagas.",
    maxAffordableLoan: "Préstamo máximo asumible",
    scenario: "Al {rate} en {months}",
    scenarioEmi: "Cuota mensual de este préstamo",
    flags: "Alertas",
    noFlags: "Sin alertas. Tu deuda está bajo control.",
    noDebt: "Sin préstamos ni tarjetas. Nada que arreglar aquí: sigue así.",
    highInterestDebts: "Deuda por encima del {threshold} anual",
    payoffOrder: "Orden de pago",
    payoffOrderHint: "Primero la tasa más alta. Paga el mínimo en todo lo demás y destina cada taka que te sobre a la primera de la lista.",
    avalanche: "Primero la tasa más alta",
    snowball: "Primero el saldo más pequeño",
    interestSaved: "Intereses ahorrados al empezar por la tasa más alta",
    payoffMonths: "Sin deudas en {months}",
    totalInterest: "Intereses totales",
    minPayment: "Pago mínimo",
    path: "Si te sientes atrapado",
    emiRatioNote: "Cada prestamista fija sus propios límites. Marcamos todo lo que supere el {threshold} del ingreso neto porque queda poco para ahorrar o absorber un golpe.",
    maxLoanNote: "La fórmula exacta da unos {loan} para una cuota mensual de {emi} al {rate} en {months}. Los bancos también miran tu ingreso y tu historial, así que añade tu propio margen de seguridad antes de pedir prestado.",
    primaryFlag: "Lo más urgente",
    otherFlags: "También conviene arreglar",
    cardLabel: "Tarjeta de crédito",
    extraUsed: "Extra para deudas: {amount} al mes",
    compare: "Comparado con empezar por el saldo más pequeño",
    numbers: "Tus cifras",
    borrow: "¿Cuánto podría pedir prestado?",
  },

  profile: {
    title: "De tu perfil",
    hint: "Si los cambias, tu plan también se actualiza.",
  },

  demoBanner: "Cifras de ejemplo. Añade tus propios préstamos y tarjetas para ver tu situación real.",

  flag: {
    card_carried: {
      title: "Saldo de tarjeta arrastrado tras la fecha de pago",
      body: "El interés de un saldo de tarjeta pendiente ronda el {rate} anual: el dinero más caro que existe. Liquídalo antes que cualquier otra deuda.",
    },
    card_utilisation: {
      title: "Uso de la tarjeta por encima del {threshold} del límite",
      body: "Estás usando el {value} del límite de tu tarjeta. Mantenlo por debajo de la mitad: baja la factura, protege tu historial CIB y deja espacio para una emergencia real.",
    },
    emi_ratio: {
      title: "Cuotas por encima del {threshold} del ingreso neto",
      body: "El {value} de tu ingreso neto se va en cuotas. Cada prestamista fija sus propios límites; marcamos todo lo que supere el {threshold} porque queda poco para ahorrar o absorber un golpe.",
    },
    negative_capacity: {
      title: "No hay espacio para ninguna cuota",
      body: "Después del ahorro, los gastos esenciales y un margen de efectivo, no queda nada para pagar préstamos. Recorta gastos, aumenta tus ingresos o reestructura la deuda antes de pedir más.",
    },
  },

  path: {
    listLoans: "Anota cada préstamo y tarjeta: lo que debes, la tasa y el pago mensual. Ordénalos por tasa, de la más alta a la más baja.",
    tellFamily: "Cuéntaselo a tu familia. Esconder una deuda la hace crecer; un hogar que lo sabe puede recortar gastos en conjunto.",
    stopBorrowing: "Deja de pedir prestado, incluidas las compras con tarjeta que no puedas pagar por completo este mes.",
    sellUnaffordable: "Vende lo que compraste a crédito y que en realidad no podías pagar (una moto, un teléfono, un aparato) y pon ese dinero en la deuda más cara.",
    refinanceCheaper: "Refinancia solo cuando el nuevo préstamo sea claramente más barato tras las comisiones, y nunca para hacer espacio a más gastos.",
  },

  status: {
    red: "La deuda cara requiere acción ya",
    amber: "Manejable, pero vigílala",
    green: "Deuda bajo control",
  },
};
