import type { Dictionary } from "../../types";

export const plan: Dictionary["plan"] = {
  title: "Seu plano",
  headline: "Poupe {amount} por mês",
  subhead: "Dividido entre os destinos do seu dinheiro, por ordem de prioridade. Toque num cartão para ajustar; o plano se atualiza na hora.",
  emptyGoals: "Nenhum objetivo ainda. Adicione um — a aposentadoria também conta — e o plano abrirá espaço para ele.",
  builtOn: "Feito com as taxas v{version}",
  demoBanner: "Plano de exemplo feito com números de demonstração, não os seus. Abra o plano sem a opção de demonstração para ver o seu.",

  why: {
    headline: "Por que poupar {amount} por mês?",
    bucket: "Por que {amount} para {bucket}?",
  },

  error: {
    title: "Seu plano ainda não está pronto",
    retry: "Tentar de novo",
  },

  card: {
    amount: "Valor",
    instrument: "Onde",
    reason: "Por quê",
    nextStep: "Próximo passo",
    open: "Abrir calculadora",
    priority: "Prioridade {n}",
    perMonth: "{amount}/mês",
    goalTitle: "Objetivo: {name}",
    bucket: {
      emergency: "Reserva de emergência",
      insurance: "Seguros",
      debt: "Quitação de dívidas",
      goal: "Objetivo",
      retirement: "Aposentadoria",
      future: "Futuro",
    },
  },

  more: {
    title: "Complete seu plano",
    start: "Começar",
    edit: "Editar",
    reserved: "O plano separa {amount} por mês para isto.",
    m2: { title: "Seguros e saúde", body: "Quanta cobertura de vida e de saúde sua família precisa, e quanto deve custar, mais ou menos." },
    m6: { title: "Alocação de ativos", body: "Como dividir o dinheiro de longo prazo entre renda fixa, ações e ouro para a sua idade." },
    m7: { title: "Aposentadoria e família", body: "Quanto você precisa para viver do seu próprio dinheiro até os 100 anos, e quais fontes de renda reduzem esse valor." },
  },

  summary: {
    title: "Resumo",
    emergencyShare: "{share} do seu valor mensal vai para a reserva de emergência até ela ficar completa.",
    monthsToFull: "Reserva de emergência completa em {months}.",
    emergencyFull: "Sua reserva de emergência está completa.",
    goalsShortfall: "Seus objetivos precisam de {amount} a mais por mês do que o plano consegue encaixar agora.",
    noShortfall: "Todos os objetivos cabem no valor deste mês.",
    retirementShortfall: "A aposentadoria precisa de {amount} a mais por mês do que o plano consegue encaixar agora.",
  },

  reason: {
    emergency: "Reserva de emergência — {amount}/mês em {instrument} — você já cobriu {covered} de {months} meses",
    emergencyFull: "Reserva de emergência — completa com {months} meses de gastos essenciais — reponha depois de qualquer uso",
    debt: "Dívida com juros altos de {rate} — {amount}/mês além da sua parcela — quitada em cerca de {months} neste ritmo",
    debtNever: "Dívida com juros altos de {rate} — {amount}/mês além da sua parcela — neste ritmo ela nunca acaba, então pague mais ou leve-a para um empréstimo mais barato",
    debtNone: "Dívida com juros altos de {rate} — nada cabe este mês ainda — pague pelo menos o mínimo de cada dívida",
    goal: "{name} — {amount}/mês em {instrument} — você vai precisar de {fv} em {years}",
    addGoal: "Adicione um objetivo — todo plano precisa de pelo menos um, e a aposentadoria conta",
    insurance: "Seguros — {amount}/mês reservados para seguro de vida temporário e cobertura de saúde",
    insuranceNone: "Seguros — nada cabe este mês ainda — a cobertura continua importante, então abra a análise de seguros",
    retirement: "Aposentadoria — {amount}/mês para o seu dinheiro durar até os {planTo} anos",
    retirementShort: "Aposentadoria — {amount}/mês dos {need} de que você precisa — dura até os {lastsTo} anos",
    retirementShortNoAge: "Aposentadoria — {amount}/mês dos {need} de que você precisa",
    retirementNone: "Aposentadoria — nada cabe este mês ainda dos {need} por mês de que você precisa",
    future: "Poupança de longo prazo — {amount}/mês em {instrument} até você adicionar um objetivo",
  },

  next: {
    fdrLadder: "Vá a qualquer banco com seu documento de identidade e seu número fiscal e peça um {product} de 3 meses. Abra um por mês durante três meses, para que um vença todo mês.",
    openSavings: "Abra uma {product} em qualquer banco com seu documento de identidade. Deixe nela um mês de gastos essenciais e o resto em depósitos de 3 meses.",
    prepayDebt: "Ligue para quem lhe emprestou e pergunte como fazer um pagamento extra do principal sem multa. Comece pela dívida com a taxa mais alta.",
    dps: "Peça ao seu banco para abrir um {product} com débito automático no dia seguinte ao do seu salário. Qualquer valor serve; o hábito importa mais que o tamanho.",
    sanchayapatra: "Leve seu documento de identidade, seu número fiscal e um cheque da sua conta bancária a uma agência bancária ou dos correios que venda certificados de poupança do governo e peça um {product}.",
    tbond: "Peça ao seu banco para cadastrá-lo nos leilões de títulos públicos e dê um lance num {product} de 5 ou 10 anos; você também pode comprar um já emitido por uma conta em corretora.",
    fdr: "Vá a qualquer banco com seu documento de identidade e seu número fiscal, peça um {product} de 1 ano e guarde o comprovante num lugar seguro.",
    addGoal: "Toque em “Adicionar objetivo”, dê um nome, o custo em dinheiro de hoje e em quantos anos ele vai acontecer.",
    keepFull: "Sua reserva está completa: deixe-a onde está. Depois de qualquer saque, reponha o mesmo valor antes de qualquer outra poupança, para que ela fique inteira de novo.",
    insurance: "Abra a análise de seguros: ela calcula a cobertura de vida e de saúde que sua família precisa e quanto deve custar, mais ou menos.",
    retirement: "Abra o plano de aposentadoria: veja quanto você precisa para viver do seu próprio dinheiro até os 100 anos, e quais fontes de renda reduzem esse valor.",
    allocation: "Abra a alocação de ativos: ela divide o dinheiro de longo prazo entre renda fixa, ações e ouro para a sua idade.",
  },

  note: {
    insuranceSkipped: "Não foi possível calcular suas respostas de seguros com o seu perfil atual, então os seguros ficam fora deste plano por enquanto. Abra a análise de seguros para atualizá-las.",
    allocationSkipped: "Não foi possível calcular suas respostas de alocação de ativos com o seu perfil atual, então o plano usa renda fixa por enquanto. Abra a alocação de ativos para atualizá-las.",
    retirementSkipped: "Suas respostas de aposentadoria não combinam mais com o seu perfil (por exemplo, sua idade mudou), então a aposentadoria fica fora deste plano por enquanto. Abra o plano de aposentadoria para atualizá-las.",
  },
};
