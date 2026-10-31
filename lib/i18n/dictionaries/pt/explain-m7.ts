import type { Dictionary } from "../../types";

export const explainM7: Dictionary["explain"]["m7"] = {
  spendingAtRetirement: {
    title: "Gastos no seu primeiro ano de aposentadoria",
    body: "Os gastos de hoje, {monthlySpending} por mês, vezes 12, corrigidos pelos preços a {inflation} ao ano durante os {retireInYears} anos até você parar: 12 × {monthlySpending} × (1 + {inflation})^{retireInYears}. O aluguel que você recebe é descontado antes, porque também sobe com os preços. Resultado: {result} por ano.",
  },
  corpusContrast: {
    title: "Meta até a idade de comparação",
    body: "O montante que paga {spendingAtRetirement} no primeiro ano, subindo com os preços ({inflation}), durante {retiredForYears} anos, enquanto o resto rende {returnRate} após impostos: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. Aparece só para comparação.",
  },
  corpusPlan: {
    title: "Meta para durar até a idade do plano",
    body: "A mesma fórmula em {retiredForYears} anos: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. É exatamente o montante que o gráfico ano a ano gasta até zerar nessa idade.",
  },
  savingsFv: {
    title: "Sua poupança quando você parar",
    body: "O que você tem hoje, {savings}, investido a {accumulationRate} ao ano durante {retireInYears} anos: {savings} × (1 + {accumulationRate})^{retireInYears} = {result}.",
  },
  providentFund: {
    title: "Fundo de previdência quando você parar",
    body: "O saldo de hoje, {balance}, mais {monthlyContribution} depositados todo mês, ambos crescendo à taxa do próprio fundo, {fundRate}, durante {retireInYears} anos = {result}.",
  },
  gratuity: {
    title: "Gratificação por tempo de serviço",
    body: "Último salário-base de {basicMonthly} ÷ {daysPerMonthCount} dias × {daysCount} dias para cada um dos {serviceYears} anos de serviço = {result}, pago de uma vez quando você sai.",
  },
  fixedPensions: {
    title: "Pensões fixas, avaliadas quando você parar",
    body: "Uma pensão pública de {publicPensionMonthly} por mês a partir dos {pensionFromAgeYears} anos e outra renda fixa de {fixedPensionMonthly} por mês, pagas até a idade do seu plano ({retiredForYears} anos de aposentadoria) sem subir com os preços, valem isto quando você parar, a {returnRate}: {result}. Por isso o poder de compra delas diminui numa aposentadoria longa.",
  },
  gap: {
    title: "Falta montar",
    body: "A meta de {corpus}, menos tudo o que já estará lá (sua poupança, fundo de previdência, gratificação e o valor das pensões fixas), nunca abaixo de zero: {result}.",
  },
  monthly: {
    title: "Poupança mensal",
    body: "O valor que, pago todo mês durante {savingMonths} meses e crescendo a {monthlyRate} ao mês, soma {gap}: {gap} × {monthlyRate} ÷ ((1 + {monthlyRate})^{savingMonths} − 1) = {result}, arredondado para cima para ser suficiente.",
  },
  withdrawal: {
    title: "Retirada do primeiro ano",
    body: "Quanto {savings} pode pagar no primeiro ano, subindo com os preços ({inflation}) a cada ano seguinte, para durar {retiredForYears} anos rendendo {returnRate}: {savings} × ({returnRate} − {inflation}) ÷ (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) = {result}, arredondado para baixo para nunca faltar.",
  },
  safePot: {
    title: "O pote seguro",
    body: "A retirada do primeiro ano, {firstYear}, vezes {potYears} anos = {result}, guardado num lugar seguro e de acesso rápido.",
  },
};
