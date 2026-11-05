import type { Dictionary } from "../../types";

/** M4 Save-first budget: income − savings = expenses. */
export const m4: Dictionary["m4"] = {
  title: "Presupuesto con ahorro primero",
  intro: "Da la vuelta a la ecuación. Ahorra primero el día de pago y gasta lo que quede. El hábito importa más que el monto.",
  demo: "Cifras de ejemplo solo para vista previa. Aquí no se usan tus propios datos.",

  section: {
    inputs: "Tus cifras",
    result: "Tu presupuesto con ahorro primero",
    where: "A dónde va",
    nextStep: "Siguiente paso",
  },

  input: {
    takeHome: { label: "Ingreso neto mensual", hint: "Lo que de verdad llega a tu cuenta." },
    essentials: { label: "Gasto esencial mensual", hint: "Alquiler, comida, servicios, transporte, gastos escolares, ayuda a tus padres, cuotas." },
    incomeType: { label: "Cómo ganas tu dinero", hint: "Si eres independiente o tienes un negocio, ahorra una parte de cada pago en lugar de una suma fija." },
    savingsRate: {
      label: "Tasa de ahorro",
      hint: "Sugerimos el {suggested} del ingreso neto. Bájala a lo que de verdad puedas mantener.",
      suggested: "Sugerida: {rate}",
      useSuggested: "Usar la sugerencia",
    },
    payday: { label: "Día en que cobras el sueldo", hint: "Te sugeriremos una transferencia al día siguiente, antes de que se gaste el dinero." },
    last6Incomes: { label: "Ingresos de los últimos seis meses", hint: "Una cifra por mes. Usamos el promedio como tu ingreso neto.", month: "Mes {n}" },
  },

  result: {
    equation: "{income} − {savings} = {expenses}",
    equationLabel: "Ingresos − ahorro = gastos",
    averageIncome: "Ingreso mensual promedio",
    suggestedRate: "Tasa de ahorro sugerida",
    feasibleRate: "Lo máximo que podrías ahorrar",
    feasibleRateHint: "Lo que queda después de los gastos esenciales, como parte del ingreso.",
    savingsRate: "Tasa de ahorro",
    savingsAmount: "Ahorra cada mes",
    expensesAllowed: "Queda para gastar",
    essentialsShortfall: "Gastos esenciales por encima del presupuesto en",
    essentialsShortfallHint: "Tus gastos esenciales superan lo que queda después de ahorrar. Baja la tasa o busca un gasto esencial que recortar.",
    modeLabel: "Cómo ahorras",
    mode: {
      fixed: "Un monto fijo cada mes",
      percentOfEachPayment: "Una parte de cada pago que recibes",
    },
    percentOfEachPayment: "Pasa el {percent} de cada pago al ahorro el mismo día que llega",
    instrument: "Ponlo en",
    instrumentHint: "El dinero se mueve automáticamente un día fijo, así que el ahorro ocurre antes de que puedas gastarlo.",
    transferDay: "Transferencia automática el día {day} de cada mes",
    transferDayUnknown: "Dinos tu día de pago y te sugeriremos una fecha de transferencia.",
  },

  next: {
    dps: "Pide a tu banco que abra este producto: {product}, con débito automático el día {day} de cada mes, el día después de que llegue tu sueldo. Cualquier monto sirve; el hábito importa más que la cantidad.",
    dpsNoPayday: "Pide a tu banco que abra este producto: {product}, con débito automático el día después de que llegue tu sueldo. Cualquier monto sirve; el hábito importa más que la cantidad.",
    percentOfEachPayment: "El día que llegue un pago, pasa el {percent} a una cuenta de ahorro aparte antes de gastar nada. Mantén la misma parte en los meses buenos y en los flojos; cuando el saldo sea estable, cambia a una transferencia mensual fija.",
  },

  note: {
    instrumentDps: "Sugerimos una transferencia mensual automática porque se hace un día fijo, así que el ahorro ocurre antes de que puedas gastarlo.",
  },

  status: {
    red: "Aún no ahorras nada",
    amber: "Ahorras un poco: sigue así",
    green: "Ahorras primero cada mes",
  },
};
