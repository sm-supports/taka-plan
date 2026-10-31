import type { Dictionary } from "../../types";

/** Tap-to-explain glossary. Bangladesh-specific, no product or bank names. */
export const terms: Dictionary["terms"] = {
  fdr: {
    title: "FDR (depósito a plazo fijo)",
    body: "Una suma que dejas inmovilizada en un banco por un plazo fijo, de unos meses a unos años, a una tasa fija. Retirarla antes suele costarte los intereses. El seguro de depósitos solo cubre un monto limitado por banco.",
  },
  dps: {
    title: "DPS (plan de ahorro programado)",
    body: "Un plan de ahorro mensual en un banco: se debita automáticamente un monto fijo el mismo día cada mes durante varios años y al final se devuelve con intereses. Es la forma más fácil de ahorrar primero, porque el dinero sale antes de que puedas gastarlo.",
  },
  sanchayapatra: {
    title: "Sanchayapatra (certificado nacional de ahorro)",
    body: "Un certificado de ahorro del Estado que se vende en bancos y oficinas de correos, normalmente a tres o cinco años, con una tasa que el gobierno revisa dos veces al año. Paga más que los depósitos bancarios, pero paga menos si lo cobras antes, y hay límites a cuánto puede tener cada persona.",
  },
  bo_account: {
    title: "Cuenta BO",
    body: "Una cuenta de titular beneficiario en una casa de bolsa, necesaria para comprar o tener acciones, participaciones de fondos o bonos que cotizan en bolsa. Para abrirla necesitas tu documento de identidad, una cuenta bancaria y una pequeña comisión.",
  },
  sum_insured: {
    title: "Suma asegurada",
    body: "Lo máximo que pagará una póliza de seguro. En un seguro de vida a término es lo que recibe tu familia si falleces; en un seguro de salud es el tope anual de gastos hospitalarios que cubre la aseguradora.",
  },
  emi: {
    title: "Cuota mensual (EMI)",
    body: "El monto fijo que pagas cada mes a quien te prestó. Al principio casi todo es interés; más adelante, casi todo es capital. Suma todas tus cuotas para ver cuánto de tu ingreso ya está comprometido.",
  },
  cib: {
    title: "Informe CIB",
    body: "El historial crediticio que el Bangladesh Bank lleva de cada deudor, y que los prestamistas consultan antes de aprobar un préstamo o una tarjeta. Los pagos atrasados o no hechos quedan registrados y hacen que pedir prestado después sea más difícil o más caro.",
  },
  tbill: {
    title: "Letra del Tesoro",
    body: "Un pagaré del Estado a corto plazo, que se subasta a 91, 182 o 364 días. La compras por debajo de su valor nominal y al vencimiento recibes el monto completo; la diferencia es tu rentabilidad. La respalda el Estado, así que es muy segura.",
  },
  tbond: {
    title: "Bono del Tesoro",
    body: "Un pagaré del Estado a más largo plazo, de dos a veinte años, que paga intereses dos veces al año. Se compra en las subastas del Bangladesh Bank a través de un banco, o en la bolsa con una cuenta BO.",
  },
  ladder: {
    title: "Escalera de FDR",
    body: "En lugar de un solo FDR grande, abres varios más pequeños con un mes de diferencia. Así vence uno cada mes y siempre puedes tener algo de efectivo pronto sin romper un depósito antes de tiempo.",
  },
  real_return: {
    title: "Rentabilidad real",
    body: "Lo que tu dinero gana en poder de compra después de impuestos e inflación. Un FDR con una tasa nominal alta puede tener una rentabilidad real negativa si los precios suben más rápido que el interés que te queda.",
  },
  take_home: {
    title: "Ingreso neto",
    body: "El dinero que de verdad llega a tu cuenta cada mes después de impuestos, fondo de previsión y otras deducciones. Si eres independiente o tienes un negocio, usa el promedio de los últimos seis meses.",
  },
  grace_period: {
    title: "Período de gracia",
    body: "Los días entre el estado de cuenta de la tarjeta de crédito y su fecha de pago en los que no se cobran intereses. Si pagas el total dentro de ese plazo, la tarjeta no te cuesta nada; si dejas saldo pendiente, se cobran intereses por cada compra.",
  },
};
