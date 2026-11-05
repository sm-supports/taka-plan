import type { Dictionary } from "../../types";

export const m1: Dictionary["m1"] = {
  title: "Reserva de emergência",
  intro: "Dinheiro que você consegue acessar em um ou dois dias quando a renda para ou chega uma conta. Dimensione-a para a sua família, não por uma regra fixa.",
  demo: "Números de exemplo, só para visualização. Suas respostas não são usadas nesta tela.",

  section: {
    inputs: "Seus números",
    result: "Sua reserva de emergência",
    rules: "Regras para este dinheiro",
    nextStep: "Próximo passo",
  },

  input: {
    essentials: {
      label: "Gastos essenciais mensais",
      hint: "Aluguel, alimentação, contas da casa, transporte, escola, ajuda aos pais, parcelas que já paga.",
    },
    incomeType: {
      label: "Como você ganha dinheiro",
      hint: "A renda de autônomos e empresários é menos estável, então a reserva começa maior.",
    },
    dependents: {
      label: "Quem depende de você",
      hint: "Marque todos que se aplicam.",
    },
    soleEarner: {
      label: "Você é a única pessoa com renda em casa?",
      hint: "Se ninguém mais traz dinheiro, a reserva precisa durar mais.",
    },
    hasHealthInsurance: {
      label: "Você tem seguro saúde?",
      hint: "Sem cobertura, uma conta de hospital sai desta reserva, então ela fica maior.",
    },
    liquidSavings: {
      label: "Poupança que você pode acessar hoje",
      hint: "Dinheiro em espécie, contas poupança e depósitos que você poderia resgatar em poucos dias. Não conte dinheiro em {product}, ações ou ouro.",
    },
    months: {
      label: "Meses de cobertura",
      hint: "Sugerimos um ponto de partida; deslize até o que parecer certo para a sua família, de {min} a {max} meses.",
      suggested: "Sugestão: {months}",
      useSuggested: "Usar a sugestão",
    },
    buildMonths: {
      label: "Montar em",
      hint: "Em quantos meses você quer completar a reserva.",
    },
  },

  result: {
    suggestedMonths: "Cobertura sugerida: {months}",
    months: "Meses de cobertura",
    target: "Meta",
    saved: "Já guardado",
    gap: "Falta guardar",
    monthlySaving: "Poupança mensal",
    monthsCovered: "Meses cobertos",
    monthsCoveredOf: "{covered} de {months} meses cobertos",
    monthsToFull: "Completa em {months}",
    full: "Sua reserva de emergência está completa",
    tiers: {
      title: "Onde guardar",
      savingsAccount: "Conta poupança com saque no mesmo dia",
      savingsAccountHint: "Um mês de gastos essenciais que você pode sacar no mesmo dia.",
      fdrLadder: "Escada de depósitos de 3 meses",
      fdrLadderHint: "O restante, em três depósitos a prazo abertos com um mês de diferença, para que um vença todo mês.",
      fdrPerSlice: "Cada depósito",
      fdrSlices: "Três depósitos de {amount} cada, um aberto a cada mês.",
      banksNeeded: "Bancos para dividir",
      banksNeededHint: "O seguro de depósitos cobre só {limit} por banco, então não deixe mais que isso em nenhum banco.",
      sanchayapatraLayer: "Terceira camada: {product}",
      sanchayapatraLayerHint: "Sua reserva é grande o bastante para que parte dela fique em {product}, que rende mais, mas tem multa se resgatado antes do prazo.",
    },
  },

  rule: {
    noStocks: "Nada de ações ou fundos de ações para este dinheiro. Ele precisa estar lá, com valor cheio, num dia ruim.",
    sanchayapatraThirdLayer: "{product} é só uma terceira camada para uma reserva muito grande: rende mais, mas resgatar antes do prazo custa parte do ganho.",
    cardBridge: "Um cartão de crédito pode cobrir os um ou dois dias que um depósito a prazo leva para ser resgatado — só se você pagar a fatura inteira dentro do período sem juros.",
    refill: "Usou a reserva? Reponha antes de colocar dinheiro em qualquer outro lugar.",
    notAnEmergency: "Uma viagem, um celular ou um presente de casamento não é emergência. Poupe para eles como objetivos.",
  },

  next: {
    openSavings: "Abra uma conta poupança em qualquer banco com seu documento de identidade; transfira para ela um mês de gastos essenciais e programe a transferência automática do restante.",
    fdrLadder: "Vá a qualquer banco com seu documento de identidade e seu número fiscal e peça um {product} de 3 meses. Abra um por mês durante três meses, para que um vença todo mês.",
    splitBanks: "Sua reserva é maior que o limite do seguro de depósitos para um banco. Abra depósitos a prazo num segundo banco, para que nenhum banco guarde mais que o limite.",
    full: "Sua reserva está completa. Continue renovando os depósitos e, depois de qualquer saque, reponha a reserva antes de poupar para outra coisa.",
  },

  status: {
    red: "Menos de um mês coberto",
    amber: "Cobertura parcial — continue montando",
    green: "Totalmente coberta",
  },
};
