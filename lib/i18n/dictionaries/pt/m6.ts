import type { Dictionary } from "../../types";

export const m6: Dictionary["m6"] = {
  title: "Alocação de ativos",
  intro: "Como dividir seu dinheiro de longo prazo entre renda fixa, ações e ouro, o que comprar para cada parte e como manter a divisão no alvo.",
  demo: "Números de exemplo, só para visualização. Suas respostas não são usadas nesta tela.",
  needProfile: "Responda primeiro às cinco perguntas iniciais, para que a alocação possa usar sua idade e a forma como você ganha dinheiro.",
  startLink: "Responder às perguntas iniciais",
  backToPlan: "Voltar ao meu plano",
  disclaimer: "Estimativas educativas, não recomendação de investimento. Os mercados podem cair e ficar em baixa por anos, e rendimentos passados não garantem os futuros.",

  flow: {
    progress: "Pergunta {n} de {total}",
    gate: {
      title: "Você tem reserva de emergência e nenhuma dívida no cartão?",
      hint: "O dinheiro de longo prazo vem depois de uma reserva de emergência completa e de quitar a dívida do cartão. Veja o que seu plano diz.",
      emergencyOk: "Sua reserva de emergência está completa.",
      emergencyMissing: "Sua reserva de emergência ainda não está completa.",
      cardOk: "Você não carrega dívida no cartão.",
      cardMissing: "Você carrega saldo do cartão de um mês para o outro.",
      openEmergency: "Abrir a reserva de emergência",
      openDebt: "Abrir a análise de dívidas",
      allClear: "Ótimo: você está pronto para investir no longo prazo.",
      continue: "Continuar",
      continueAnyway: "Continuar mesmo assim",
    },
    ageBand: {
      title: "Em que faixa de idade você está?",
      hint: "Preenchido a partir da sua idade. Quem é mais jovem tem mais anos para atravessar uma queda.",
    },
    incomeStability: {
      title: "Quão estável é sua renda?",
      hint: "Preenchido a partir de como você ganha dinheiro. Uma renda mais estável aguenta um pouco mais de risco.",
    },
    horizon: {
      title: "Quando você vai precisar deste dinheiro?",
      hint: "Deslize até o número de anos. Dinheiro de que você vai precisar logo não deve ficar em ações.",
      band: "Isso conta como: {band}.",
    },
    reaction: {
      title: "Se seus investimentos caíssem 20% em um ano, você…",
      hint: "Não há resposta errada. Seja sincero: isso decide quantas ações você aguenta ter.",
    },
    amounts: {
      title: "Quanto você vai investir?",
      hint: "Um valor de uma vez, um valor mensal ou os dois. Você pode mudar depois.",
      needOne: "Digite um valor de uma vez ou um valor mensal para ver sua alocação.",
      seeResult: "Ver minha alocação",
    },
  },

  answer: {
    ageBand: { "0": "50 ou mais", "1": "De 35 a 49", "2": "Menos de 35" },
    incomeStability: { "0": "Renda de negócio próprio", "1": "Autônoma ou variável", "2": "Salário" },
    horizon: { "0": "Em até 5 anos", "1": "De 5 a 10 anos", "2": "Em mais de 10 anos" },
    reaction: { "0": "Venderia, para parar a perda", "1": "Esperaria a recuperação", "2": "Compraria mais enquanto está barato" },
  },

  profile: {
    careful: "Cauteloso",
    balanced: "Equilibrado",
    growth: "Crescimento",
  },

  bucket: {
    fixedIncome: "Renda fixa",
    equity: "Ações",
    gold: "Ouro",
  },

  section: {
    result: "Sua alocação",
    instruments: "O que comprar",
    projection: "Quanto pode crescer",
    rebalance: "Já invisto",
    inputs: "Suas respostas",
    netWorth: "Patrimônio",
    notes: "Bom saber",
  },

  input: {
    ageBand: { label: "Faixa de idade" },
    incomeStability: { label: "Quão estável é sua renda" },
    horizon: { label: "Quando você vai precisar do dinheiro" },
    reaction: { label: "Se seus investimentos caíssem 20% em um ano" },
    profileOverride: {
      label: "Perfil de risco",
      hint: "Sugerimos um a partir das suas respostas. Você pode escolher outro; as ações nunca passam do teto.",
      suggested: "Sugerido pelas suas respostas",
    },
    goldShare: {
      label: "Parte em ouro",
      hint: "Uma proteção, mantida entre {min} e {max} da alocação.",
      reset: "Voltar a {share}",
    },
    horizonYears: {
      label: "Anos até precisar do dinheiro",
      hint: "Com menos de {noEquity} anos, nada de ações; com menos de {cashOnly} ano, só depósitos e letras.",
    },
    lumpSum: {
      label: "Valor para investir agora",
      hint: "Dinheiro que você pode guardar hoje para o longo prazo.",
    },
    monthly: {
      label: "Valor mensal",
      hint: "Quanto você pode acrescentar todo mês.",
    },
    propertyValue: {
      label: "Imóvel próprio (opcional)",
      hint: "Terreno ou apartamento. Conta no seu patrimônio, mas não na divisão, porque não dá para comprar ou vender em pequenas partes.",
    },
    directShares: {
      label: "Comprar ações diretamente em vez de um fundo?",
      hint: "Só se você estiver disposto a escolher e acompanhar pelo menos dez grandes empresas por conta própria.",
    },
  },

  result: {
    score: "Pontuação de risco {score} de {max}",
    profileLine: "Seu perfil: {profile}",
    suggestedLine: "Sugerido pelas suas respostas: {profile}",
    barLabel: "Sua alocação: {parts}",
    lump: "valor de uma vez",
    monthly: "Todo mês",
    whySplit: "Por que esta divisão?",
    horizon: {
      noEquity: "Você vai precisar deste dinheiro em poucos anos, então a parte em ações passou para renda fixa.",
      cashOnly: "Você vai precisar deste dinheiro em até um ano, então tudo fica em depósitos ou letras.",
    },
  },

  instrument: {
    title: "{bucket}: {share}",
    primary: "Comece com",
    alternatives: "Outras opções",
    unavailable: "Não disponível no seu país. Por enquanto, deixe esta parte em renda fixa.",
    localName: "Nome local: {name}",
  },

  projection: {
    intro: "{years} anos, {paidIn} investidos. Três cenários, porque ninguém sabe qual vai acontecer.",
    introNone: "Digite um valor de uma vez ou um valor mensal para ver a faixa.",
    low: "Baixo",
    base: "Base",
    high: "Alto",
    rate: "{rate} ao ano",
    real: "{amount} em dinheiro de hoje",
    lowLosesValue: "No cenário baixo, seu dinheiro cresce mais devagar que os preços e perde poder de compra.",
    why: "Por que estes números?",
  },

  rebalance: {
    intro: "Digite quanto você tem hoje em cada parte e qualquer dinheiro novo a acrescentar. Calculamos o que comprar ou vender para voltar à sua alocação.",
    open: "Já invisto",
    close: "Ocultar",
    holding: "{bucket} que você tem agora",
    newMoney: { label: "Dinheiro novo a acrescentar (opcional)", hint: "O dinheiro novo vai primeiro para as partes que estão abaixo do alvo." },
    clear: "Limpar o que tenho",
    total: "Total depois da mudança: {amount}",
    buy: "Comprar {amount}",
    sell: "Vender {amount}",
    none: "Sem mudança",
    target: "Alvo {share}",
    drift: "Agora {current}, {drift} fora do alvo",
    points: "{value} pontos",
    triggered: "Pelo menos uma parte está a mais de {band} do alvo: hora de rebalancear.",
    withinBand: "Todas as partes estão a menos de {band} do alvo. Rebalanceie uma vez por ano mesmo assim.",
    newMoneyOnly: "Só o dinheiro novo já fecha a diferença: não é preciso vender nada.",
    sellNote: "Vender tem custos de saída e talvez impostos. Quando puder, direcione o dinheiro novo dos próximos meses para as partes que estão abaixo do alvo.",
    why: "Por que estas operações?",
  },

  netWorth: {
    inMix: "Investido na alocação",
    property: "Imóvel (fora da divisão)",
    total: "Patrimônio",
  },

  note: {
    capApplied: "As ações ficam no teto, por mais longo que seja o seu prazo.",
    horizonNoEquity: "Você vai precisar deste dinheiro em até cinco anos, então ele não fica em ações. As ações podem ficar em baixa por anos.",
    horizonCashOnly: "Você vai precisar deste dinheiro em até um ano, então ele fica só em depósitos curtos ou letras do Tesouro.",
    propertyExcluded: "O imóvel conta no seu patrimônio, mas não na divisão: não dá para comprar ou vender em pequenas partes nem rebalancear.",
    lowLosesValue: "No cenário baixo, o dinheiro cresce mais devagar que os preços, então compra menos do que você investiu.",
    noIndexFund: "Aqui não se vendem fundos de índice, títulos lastreados em ouro nem fundos imobiliários, então a parte em ações usa um fundo aberto diversificado e o ouro é comprado em barras ou moedas.",
    neverBreakCertificates: "Nunca resgate um certificado de poupança antes do prazo para rebalancear: a taxa cai muito nos primeiros anos. Use dinheiro novo.",
    exitCosts: "Antes de vender, confira os custos de saída, o imposto sobre dividendos e o preço que um joalheiro pagará pelo ouro.",
  },

  gate: {
    noEmergencyFund: "Complete primeiro sua reserva de emergência. Dinheiro de longo prazo que você talvez precise vender às pressas não é dinheiro de longo prazo.",
    cardDebt: "Quite primeiro a dívida do cartão. Os juros do cartão são muito maiores do que qualquer investimento deve render.",
  },

  howto: {
    fixedIncome:
      "Os certificados de poupança do governo são vendidos nas agências bancárias e dos correios que os oferecem; letras e títulos do Tesouro, pela mesa de títulos públicos de um banco; e depósitos a prazo, em qualquer banco autorizado. Leve seu documento de identidade; valores maiores exigem um número fiscal ou comprovante de declaração de imposto de renda.",
    equityFund:
      "Escolha um fundo aberto diversificado e comece um plano mensal com a gestora do fundo ou com um banco que venda suas cotas. Leve seu documento de identidade e tenha uma conta bancária. Diversifique entre muitas empresas; nunca coloque esta parte numa única ação.",
    directShares:
      "Você precisa de uma conta BO numa corretora. Tenha pelo menos dez grandes empresas de cinco ou mais setores, sem nenhuma ação acima de um décimo desta parte. Conte com acompanhá-las por conta própria.",
    gold: "Compre barras ou moedas de 22 quilates de um joalheiro filiado à associação de joalheiros e guarde o recibo. Joias têm custo de feitio e são revendidas por menos, então servem para usar, não para investir.",
  },
};
