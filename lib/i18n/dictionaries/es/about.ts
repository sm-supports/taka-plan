import type { Dictionary } from "../../types";

/** /{locale}/about (see en/about.ts): every rates-table number is a `{placeholder}`. */
export const about: Dictionary["about"] = {
  title: "Acerca de Taka Plan",
  lead: "Una calculadora gratuita que le dice a quien trabaja en Bangladés cuánto necesita cada meta y dónde poner el dinero cada mes. Enseña y calcula; tú actúas a través de tu propio banco, cuenta BO o aseguradora.",
  disclaimer: { heading: "Aviso" },
  method: {
    heading: "Cómo se arma el plan",
    intro: "El plan sigue siete pasos en un orden fijo: primero proteger, luego ahorrar y después hacer crecer. Cada paso es una pequeña calculadora, y juntas dan un único monto mensual.",
    phase: { protect: "Proteger", save: "Ahorrar", grow: "Crecer" },
    order:
      "Tu monto mensual se reparte por orden de prioridad: primero el fondo de emergencia, luego las primas de seguro, después cualquier deuda cara y solo entonces las metas y la jubilación. Hasta que el fondo de emergencia esté completo, al menos {share} del monto mensual va a él, para que el resto empiece hoy tu hábito de invertir.",
    returnsHeading: "Rentabilidad después de impuestos y de inflación",
    returns:
      "Cada rentabilidad se muestra con dos recortes: primero después del impuesto retenido en la fuente y luego después de la inflación. La tasa nominal no es lo que importa; lo que importa es lo que te queda y lo que aún podrá comprar. Un instrumento puede pagar intereses y aun así perder frente a la inflación, y la app lo indica en rojo cuando pasa.",
    exampleCaption: "Con la tabla de tasas de hoy:",
    rounding: "Los resultados se redondean a una cifra cercana, porque una proyección a veinte años nunca es exacta al último taka. Se muestran rangos (bajo, esperado, alto) donde la rentabilidad futura es incierta.",
    onDevice: "Todos los cálculos se hacen en tu teléfono. El servidor solo guarda la tabla de tasas y, si decides iniciar sesión, tu plan guardado.",
  },
  sources: {
    heading: "Fuentes y supuestos",
    intro: "Cada fila de abajo es un supuesto que usan las calculadoras. Versión de tasas {version}, publicada el {date}. Las filas marcadas “nuestro supuesto” son valores por defecto que elegimos y podemos cambiar; el resto se copia de la fuente publicada enlazada junto a cada una.",
    group: {
      macro: "Inflación y tasa de política monetaria",
      bank: "Depósitos bancarios",
      sanchayapatra: "Sanchayapatra",
      govt: "Valores del Estado",
      market: "Renta variable y oro",
      risk: "Crédito, seguros y longevidad",
      tax: "Normas fiscales (año fiscal 2026-27)",
      policy: "Valores por defecto de la app",
      other: "Otros",
    },
    value: "Valor",
    dates: "Fechas",
    nextReview: "Próxima revisión",
    note: "Nota",
    slabNext: "{rate} sobre los siguientes {width}",
    slabRest: "{rate} sobre el resto",
    unverifiedHeading: "Aún sin verificar",
    unverifiedIntro: "No hemos podido confirmar lo siguiente, así que ninguna calculadora depende de ello todavía:",
    unverified: [
      "Primas actuales de seguro de vida a término para coberturas de diez lakh y de un crore.",
      "Límites de inversión en Sanchayapatra para 2026.",
      "Si el impuesto reducido para pequeños inversores en Sanchayapatra se mantuvo en la Ley de Finanzas.",
      "Un límite de cuota sobre ingresos fijado por el Bangladesh Bank (no parece existir; usamos nuestro propio umbral).",
      "Tasas de préstamos personales e hipotecarios de todo el mercado.",
    ],
  },
};
