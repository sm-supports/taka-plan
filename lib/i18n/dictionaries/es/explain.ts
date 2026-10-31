// Input names per step are documented in ../en/explain.ts; the placeholders here must match.
import type { Dictionary } from "../../types";
import { explainM2 } from "./explain-m2";
import { explainM6 } from "./explain-m6";
import { explainM7 } from "./explain-m7";

export const explain: Dictionary["explain"] = {
  m2: explainM2,
  m6: explainM6,
  m7: explainM7,
  m1: {
    months: {
      title: "Meses de cobertura",
      body: "Empezamos con {base} meses. Un ingreso irregular suma {bumpIrregular}, ser la única persona con ingresos y tener personas a cargo suma {bumpSoleEarner}, y no tener seguro de salud suma {bumpNoHealth}. La sugerencia queda entre {min} y {max} meses: {result}. Puedes mover el control como quieras.",
    },
    target: {
      title: "Objetivo del fondo de emergencia",
      body: "Tus gastos esenciales mensuales por los meses de cobertura: {essentials} × {months} = {result}. Solo cuentan los gastos esenciales, porque en una emergencia todo lo demás se detiene.",
    },
    gap: {
      title: "Falta ahorrar",
      body: "El objetivo menos lo que ya puedes usar hoy: {target} − {saved} = {result}. Nunca baja de cero; un colchón mayor de lo planeado está bien.",
    },
    monthly: {
      title: "Ahorro mensual",
      body: "La diferencia repartida entre los meses que elegiste para completarlo: {gap} ÷ {buildMonths} = {result} al mes.",
    },
    covered: {
      title: "Meses cubiertos",
      body: "Cuántos meses de gastos esenciales cubrirían tus ahorros actuales: {saved} ÷ {essentials} = {result}.",
    },
    tier1: {
      title: "Nivel 1: cuenta de ahorro de retiro inmediato",
      body: "Un mes de gastos esenciales queda en una cuenta de ahorro de la que puedes retirar hoy: {essentials} = {result}. Es el dinero para la primera semana de cualquier emergencia.",
    },
    tier2: {
      title: "Nivel 2: escalera de FDR a 3 meses",
      body: "Todo lo que supera el nivel 1 va a FDR: {target} − {tier1} = {result}, repartido en tres FDR abiertos con un mes de diferencia para que venza uno cada mes.",
    },
    banks: {
      title: "Bancos necesarios",
      body: "El seguro de depósitos cubre {limit} por banco, y todo el fondo está en depósitos bancarios, así que el objetivo se reparte: {target} ÷ {limit}, redondeado hacia arriba, = {result} banco(s).",
    },
  },

  m3: {
    totalEmi: {
      title: "Total de cuotas mensuales",
      body: "Todas las cuotas de préstamos más el pago mínimo de cualquier saldo de tarjeta pendiente: {emis} + {cardMinimums} = {result}.",
    },
    emiRatio: {
      title: "Cuotas como parte del ingreso neto",
      body: "Total de cuotas dividido entre el ingreso neto: {totalEmi} ÷ {takeHome} = {result}. Cada prestamista fija sus propios límites; marcamos una parte alta porque queda poco para ahorrar.",
    },
    capacity: {
      title: "Capacidad de pago",
      body: "Lo que queda para pagar préstamos después de ahorrar primero, pagar los gastos esenciales y guardar un margen de efectivo: {takeHome} − {savings} − {essentials} − {buffer} = {result}.",
    },
    maxLoan: {
      title: "Préstamo máximo asumible",
      body: "La fórmula estándar de la cuota, al revés. Con una tasa mensual de {monthlyRate} durante {months} meses: {capacity} × (1 − (1 + {monthlyRate})^−{months}) ÷ {monthlyRate} = {result}. Añade tu propio margen de seguridad antes de pedir prestado.",
    },
    scenarioEmi: {
      title: "Cuota mensual de este préstamo",
      body: "La fórmula estándar de la cuota. Para {principal} a una tasa mensual de {monthlyRate} durante {months} meses: {principal} × {monthlyRate} ÷ (1 − (1 + {monthlyRate})^−{months}) = {result}.",
    },
    interestSaved: {
      title: "Intereses ahorrados",
      body: "Pagar primero la deuda con la tasa más alta cuesta {avalancheInterest} en intereses totales; empezar por el saldo más pequeño cuesta {snowballInterest}. La diferencia, {result}, es lo que te ahorras empezando por la tasa más alta.",
    },
  },

  m4: {
    average: {
      title: "Ingreso mensual promedio",
      body: "El ingreso se promedia en los últimos {months} mes(es): {total} ÷ {months} = {result}. Con un sueldo fijo es simplemente tu ingreso neto; si eres independiente o tienes un negocio, escribe tus últimos seis meses para suavizar los altibajos.",
    },
    feasible: {
      title: "Lo máximo que podrías ahorrar",
      body: "Lo que queda después de los gastos esenciales, como parte del ingreso: ({average} − {essentials}) ÷ {average} = {result}. La tasa sugerida nunca supera esto.",
    },
    amount: {
      title: "Ahorro mensual",
      body: "El ingreso por tu tasa de ahorro: {average} × {rate} = {result}. Esto pasa al ahorro el día de pago, antes de gastar nada.",
    },
    expenses: {
      title: "Queda para gastar",
      body: "Ingresos menos ahorro es lo que tienes para vivir: {average} − {savings} = {result}. Esa es toda la idea: ahorra primero y gasta el resto.",
    },
  },

  m5: {
    fv: {
      title: "Costo futuro de la meta",
      body: "El costo de hoy aumentado por la inflación cada año hasta la meta: {cost} × (1 + {inflation})^{years} = {result}. Esta es la cifra a la que de verdad tienes que llegar.",
    },
    rate: {
      title: "Rentabilidad después de impuestos",
      body: "{instrument} paga {nominal} al año antes de impuestos. Después del impuesto del {tax} retenido en la fuente, te quedas con {result} al año.",
    },
    monthly: {
      title: "Ahorro mensual necesario",
      body: "El monto que crece hasta el costo futuro a una tasa mensual de {monthlyRate} durante {months} meses: {fv} × {monthlyRate} ÷ ((1 + {monthlyRate})^{months} − 1) = {result}.",
    },
    real: {
      title: "Rentabilidad real",
      body: "Lo que tu dinero gana en poder de compra cada año: (1 + {afterTax}) ÷ (1 + {inflation}) − 1 = {result}. Por debajo de cero significa que el instrumento pierde frente a la inflación aunque pague intereses.",
    },
  },

  plan: {
    total: {
      title: "Tu monto mensual",
      body: "El monto de ahorro primero de tu presupuesto: {savings} = {result}. Cada apartado de abajo sale de esta única cifra.",
    },
    emergencyShare: {
      title: "Parte para el fondo de emergencia",
      body: "Hasta que el fondo esté completo, recibe lo que pide su calculadora, {m1Monthly} al mes, pero dentro de un rango de {minShare} a {maxShare} de tu monto mensual ({total}) para que los demás apartados también reciban algo. Nunca recibe más de los {gap} que faltan por ahorrar: {result}.",
    },
    debtShare: {
      title: "Parte para la deuda con interés alto",
      body: "Lo que queda después del fondo de emergencia va a cualquier deuda por encima del umbral de interés alto, hasta lo necesario para saldarla (todos los saldos con interés alto ÷ los meses objetivo): mín({remaining}, {headroom}) = {result}.",
    },
    goalsShare: {
      title: "Parte para las metas",
      body: "Lo que quede financia tus metas: mín({remaining}, {goalsNeed}) = {result}. Si es menos de lo que necesitan las metas, el plan muestra la diferencia.",
    },
    goalAllocation: {
      title: "Parte para esta meta",
      body: "Esta meta necesita {need} al mes y todas tus metas juntas necesitan {goalsNeed}. Los {remaining} que quedan después de los apartados de arriba se reparten en esa proporción: {remaining} × {need} ÷ {goalsNeed} = {result}.",
    },
  },
};
