import type { Dictionary } from "../../types";

export const m3: Dictionary["m3"] = {
  title: "Saúde das dívidas",
  intro: "Liste cada empréstimo e cartão pela taxa. Pague primeiro o mais caro e nunca pegue empréstimo para estilo de vida.",

  input: {
    takeHome: { label: "Renda líquida mensal", hint: "O que realmente cai na sua conta todo mês." },
    essentials: { label: "Gastos essenciais mensais", hint: "Aluguel, alimentação, contas da casa, transporte, escola, ajuda aos pais." },
    savingsTarget: { label: "Poupança mensal", hint: "O valor que você poupa primeiro, do orçamento. Ele é reservado antes de qualquer parcela." },
    cashBuffer: { label: "Folga de caixa", hint: "Um pouco de folga todo mês para imprevistos. Sugerimos uma parte da renda líquida; mude se quiser." },
    extraMonthly: { label: "Extra para as dívidas todo mês", hint: "Qualquer valor acima dos pagamentos mínimos. Deixe em branco para usar a folga que tiver." },
    loans: {
      title: "Empréstimos",
      add: "Adicionar empréstimo",
      remove: "Remover empréstimo",
      empty: "Nenhum empréstimo adicionado.",
      type: { label: "Tipo de empréstimo", hint: "Escolha o mais parecido; isso só muda o nome." },
      outstanding: { label: "Valor ainda devido", hint: "O principal que falta hoje, segundo o seu último extrato." },
      annualRate: { label: "Taxa de juros (ao ano)", hint: "A taxa do seu contrato ou extrato." },
      emi: { label: "Parcela mensal", hint: "O valor fixo que você paga todo mês." },
      monthsLeft: { label: "Meses restantes", hint: "Parcelas que ainda faltam pagar." },
    },
    cards: {
      title: "Cartões de crédito",
      add: "Adicionar cartão",
      remove: "Remover cartão",
      empty: "Nenhum cartão adicionado.",
      balance: { label: "Saldo devedor", hint: "O valor da sua última fatura." },
      limit: { label: "Limite do cartão", hint: "O máximo que o banco deixa você gastar." },
      annualRate: { label: "Taxa de juros (ao ano)", hint: "Deixe em branco para usar a taxa legal ou típica de cartão." },
      paysInFull: { label: "Você paga a fatura inteira todo mês, dentro do período sem juros?", hint: "Se sim, o cartão não custa nada. Se não, é o dinheiro mais caro que você tem." },
    },
    scenario: {
      title: "Quanto eu poderia pegar emprestado?",
      annualRate: { label: "Taxa do empréstimo (ao ano)", hint: "A taxa que um banco lhe ofereceu, ou o nosso padrão para empréstimo pessoal." },
      months: { label: "Prazo de pagamento", hint: "Em meses." },
    },
  },

  result: {
    totalEmi: "Total de parcelas mensais",
    emiRatio: "Parcelas em relação à renda líquida",
    emiCapacity: "Capacidade para parcelas",
    emiCapacityHint: "O que sobra para parcelas depois da poupança, dos gastos essenciais e de uma folga de caixa.",
    headroom: "Margem livre",
    headroomHint: "Capacidade para parcelas menos as parcelas que você já paga.",
    maxAffordableLoan: "Maior empréstimo que cabe no bolso",
    scenario: "A {rate} em {months}",
    scenarioEmi: "Parcela mensal deste empréstimo",
    flags: "Alertas",
    noFlags: "Nenhum alerta. Suas dívidas estão sob controle.",
    noDebt: "Nenhum empréstimo ou cartão. Nada a corrigir aqui — continue assim.",
    highInterestDebts: "Dívidas acima de {threshold} ao ano",
    payoffOrder: "Ordem de quitação",
    payoffOrderHint: "Taxa mais alta primeiro. Pague o mínimo de todo o resto e coloque cada centavo que sobrar no topo da lista.",
    avalanche: "Taxa mais alta primeiro",
    snowball: "Menor saldo primeiro",
    interestSaved: "Juros economizados pagando primeiro a taxa mais alta",
    payoffMonths: "Sem dívidas em {months}",
    totalInterest: "Total de juros",
    minPayment: "Pagamento mínimo",
    path: "Se você se sentir sem saída",
    emiRatioNote: "Cada credor define seus próprios limites. Marcamos qualquer valor acima de {threshold} da renda líquida porque sobra pouco para poupar ou absorver um imprevisto.",
    maxLoanNote: "A fórmula exata dá cerca de {loan} para uma parcela mensal de {emi} a {rate} em {months}. Os bancos também olham sua renda e seu histórico, então acrescente sua própria margem de segurança antes de pegar o empréstimo.",
    primaryFlag: "Mais urgente",
    otherFlags: "Também vale corrigir",
    cardLabel: "Cartão de crédito",
    extraUsed: "Extra para as dívidas: {amount} por mês",
    compare: "Comparado com menor saldo primeiro",
    numbers: "Seus números",
    borrow: "Quanto eu poderia pegar emprestado?",
  },

  profile: {
    title: "Do seu perfil",
    hint: "Se mudar estes valores, seu plano também se atualiza.",
  },

  demoBanner: "Números de exemplo. Adicione seus próprios empréstimos e cartões para ver sua situação real.",

  flag: {
    card_carried: {
      title: "Saldo do cartão rolado após o vencimento",
      body: "Os juros sobre o saldo rotativo do cartão chegam a cerca de {rate} ao ano — o dinheiro mais caro que existe. Quite isso antes de qualquer outra dívida.",
    },
    card_utilisation: {
      title: "Uso do cartão acima de {threshold} do limite",
      body: "Você está usando {value} do limite do cartão. Mantenha abaixo da metade: isso reduz a fatura, protege seu registro no CIB e deixa espaço para uma emergência de verdade.",
    },
    emi_ratio: {
      title: "Parcelas acima de {threshold} da renda líquida",
      body: "{value} da sua renda líquida vai para parcelas. Cada credor define seus próprios limites; marcamos qualquer valor acima de {threshold} porque sobra pouco para poupar ou absorver um imprevisto.",
    },
    negative_capacity: {
      title: "Sem espaço para nenhuma parcela",
      body: "Depois da poupança, dos gastos essenciais e de uma folga de caixa, não sobra nada para pagar empréstimos. Corte despesas, aumente a renda ou renegocie a dívida antes de pegar mais empréstimos.",
    },
  },

  path: {
    listLoans: "Anote cada empréstimo e cartão: o valor devido, a taxa e o pagamento mensal. Ordene pela taxa, da mais alta para a mais baixa.",
    tellFamily: "Conte para sua família. Esconder a dívida faz ela crescer; uma casa que sabe pode cortar gastos junta.",
    stopBorrowing: "Pare de pegar qualquer novo empréstimo, inclusive gastos no cartão que você não consegue pagar inteiros este mês.",
    sellUnaffordable: "Venda o que você comprou a crédito e que não podia pagar de verdade — uma moto, um celular, um aparelho — e use o dinheiro na dívida mais cara.",
    refinanceCheaper: "Refinancie só quando o novo empréstimo for claramente mais barato depois das taxas, e nunca para abrir espaço para gastar mais.",
  },

  status: {
    red: "Dívida cara precisa de ação agora",
    amber: "Administrável, mas fique de olho",
    green: "Dívidas sob controle",
  },
};
