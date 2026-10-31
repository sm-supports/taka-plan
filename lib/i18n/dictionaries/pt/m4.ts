import type { Dictionary } from "../../types";

export const m4: Dictionary["m4"] = {
  title: "Orçamento: poupar primeiro",
  intro: "Inverta a conta. Poupe primeiro no dia do pagamento; gaste o que sobrar. O hábito importa mais que o valor.",
  demo: "Números de exemplo, só para visualização. Suas respostas não são usadas nesta tela.",

  section: {
    inputs: "Seus números",
    result: "Seu orçamento de poupar primeiro",
    where: "Para onde vai",
    nextStep: "Próximo passo",
  },

  input: {
    takeHome: { label: "Renda líquida mensal", hint: "O que realmente cai na sua conta." },
    essentials: { label: "Gastos essenciais mensais", hint: "Aluguel, alimentação, contas da casa, transporte, escola, ajuda aos pais, parcelas." },
    incomeType: { label: "Como você ganha dinheiro", hint: "Autônomos e empresários poupam uma parte de cada pagamento em vez de um valor fixo." },
    savingsRate: {
      label: "Taxa de poupança",
      hint: "Sugerimos {suggested} da renda líquida. Reduza para qualquer valor que você consiga manter de verdade.",
      suggested: "Sugestão: {rate}",
      useSuggested: "Usar a sugestão",
    },
    payday: { label: "Dia em que o salário cai", hint: "Vamos sugerir uma transferência no dia seguinte, antes que o dinheiro seja gasto." },
    last6Incomes: { label: "Renda dos últimos seis meses", hint: "Um valor por mês. Usamos a média como sua renda líquida.", month: "Mês {n}" },
  },

  result: {
    equation: "{income} − {savings} = {expenses}",
    equationLabel: "Renda − poupança = gastos",
    averageIncome: "Renda mensal média",
    suggestedRate: "Taxa de poupança sugerida",
    feasibleRate: "O máximo que você poderia poupar",
    feasibleRateHint: "O que sobra depois dos gastos essenciais, como parte da renda.",
    savingsRate: "Taxa de poupança",
    savingsAmount: "Poupe todo mês",
    expensesAllowed: "Sobra para gastar",
    essentialsShortfall: "Essenciais acima do orçamento em",
    essentialsShortfallHint: "Seus gastos essenciais são maiores que o que sobra depois de poupar. Reduza a taxa ou procure um gasto essencial para cortar.",
    modeLabel: "Como você poupa",
    mode: {
      fixed: "Um valor fixo todo mês",
      percentOfEachPayment: "Uma parte de cada pagamento que você recebe",
    },
    percentOfEachPayment: "Transfira {percent} de cada pagamento para a poupança no dia em que ele chegar",
    instrument: "Coloque em",
    instrumentHint: "Um DPS debita automaticamente num dia fixo, então a poupança acontece antes que você possa gastar.",
    transferDay: "Transferência automática no dia {day} de cada mês",
    transferDayUnknown: "Diga o dia do seu pagamento e sugerimos uma data de transferência.",
  },

  next: {
    dps: "Peça ao seu banco para abrir um DPS com débito automático no dia {day} de cada mês, o dia seguinte ao do seu salário. Qualquer valor serve; o hábito importa mais que o tamanho.",
    dpsNoPayday: "Peça ao seu banco para abrir um DPS com débito automático no dia seguinte ao do seu salário. Qualquer valor serve; o hábito importa mais que o tamanho.",
    percentOfEachPayment: "No dia em que um pagamento cair, transfira {percent} dele para uma conta poupança separada antes de gastar qualquer parte. Mantenha a mesma proporção nos meses bons e nos fracos; quando o saldo estiver estável, transforme-o num DPS.",
  },

  note: {
    instrumentDps: "Sugerimos um DPS porque ele debita automaticamente num dia fixo, então a poupança acontece antes que você possa gastar.",
  },

  status: {
    red: "Ainda sem poupar nada",
    amber: "Poupando um pouco — continue",
    green: "Poupando primeiro todo mês",
  },
};
