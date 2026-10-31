import type { Dictionary } from "../../types";

export const m5: Dictionary["m5"] = {
  title: "Planejador de objetivos",
  intro: "Um objetivo de verdade tem um valor, uma data e a sua idade. Todo mundo tem pelo menos um: a aposentadoria.",

  input: {
    name: { label: "Nome do objetivo", hint: "A faculdade da filha, a entrada de um apartamento, o Hajj, um carro…", placeholder: "Para que você está poupando?" },
    cost: { label: "Custo em dinheiro de hoje", hint: "Quanto custaria se você pagasse hoje. Nós acrescentamos a inflação." },
    years: { label: "Daqui a quantos anos", hint: "Anos inteiros a partir de agora, de {min} a {max}." },
    type: { label: "Tipo de objetivo", hint: "Os custos de educação e saúde sobem mais rápido que os preços em geral, por isso têm sua própria taxa de inflação." },
    addGoal: "Adicionar objetivo",
    removeGoal: "Remover objetivo",
    incomplete: "Um objetivo precisa de nome, custo e número de anos antes de ser salvo.",
    newGoal: "Novo objetivo",
    saveGoal: "Salvar objetivo",
    saved: "Seus objetivos",
  },

  result: {
    horizon: "Prazo",
    inflation: "Inflação aplicada",
    futureValue: "Você vai precisar de",
    futureValueIn: "{fv} em {years}",
    instrument: "Guarde em",
    candidates: "Outras opções para este prazo",
    nominal: "Taxa nominal",
    afterTax: "Após impostos",
    real: "Rendimento real (após impostos e inflação)",
    belowInflation: "Abaixo da inflação: no final, este dinheiro vai comprar menos do que compra hoje",
    monthly: "Poupe todo mês",
    monthlyRange: "Baixo {low} · Esperado {base} · Alto {high}",
    monthlyLow: "Se o rendimento for baixo",
    monthlyBase: "Esperado",
    monthlyHigh: "Se o rendimento for alto",
    months: "Em {months}",
    totalMonthly: "Todos os objetivos juntos",
    invalid: "Falta algo neste objetivo",
    empty: "Nenhum objetivo ainda.",
    goalsCount: "{n} objetivo(s)",
    realAbove: "Supera a inflação após impostos",
    perMonth: "por mês",
  },

  demoBanner: "Objetivos de exemplo. Adicione os seus para ver seus números reais.",

  note: {
    noAllocationYet: "Por enquanto, objetivos longos usam apenas investimentos de renda fixa. Quando a etapa de alocação de ativos estiver pronta, objetivos a mais de cinco anos vão usar uma combinação com algumas ações.",
    belowInflation: "O rendimento esperado deste investimento fica abaixo da inflação após impostos. Você ainda chega ao valor, mas ele vai comprar menos do que você esperava. Um prazo mais longo ou um investimento que renda mais ajuda.",
  },

  status: {
    red: "O rendimento esperado está abaixo da inflação",
    amber: "Alcançável, mas apertado",
    green: "No caminho certo",
  },
};
