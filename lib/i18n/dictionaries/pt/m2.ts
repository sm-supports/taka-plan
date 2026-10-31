import type { Dictionary } from "../../types";

export const m2: Dictionary["m2"] = {
  title: "Seguros e saúde",
  intro: "Quanta cobertura de vida e de saúde sua família precisa, quanto custa mais ou menos e como avaliar uma seguradora antes de assinar.",
  demo: "Números de exemplo, só para visualização. Suas respostas não são usadas nesta tela.",
  backToPlan: "Voltar ao meu plano",

  needProfile: {
    title: "Primeiro, algumas perguntas sobre você",
    body: "Esta análise usa sua idade, sua renda e quem depende de você. Responda às cinco perguntas iniciais e depois volte aqui.",
    cta: "Responder às perguntas",
  },

  flow: {
    eyebrow: "Análise de seguros",
    smoker: {
      title: "Você fuma ou usa tabaco?",
      hint: "As seguradoras cobram mais de fumantes pelo seguro de vida, então a faixa de preço depende disso.",
    },
    lifeCover: {
      title: "Quanta cobertura de vida você já tem?",
      hint: "Some o capital segurado de todas as apólices de vida que você tem, incluindo a do seu empregador. Digite 0 se não tiver nenhuma.",
      none: "Não tenho",
    },
    healthCover: {
      title: "Quanta cobertura de saúde sua família já tem?",
      hint: "O limite anual da sua apólice de saúde ou da do seu empregador, para todos juntos. Digite 0 se não tiver nenhuma.",
      none: "Não temos",
    },
    people: {
      title: "Quem a cobertura de saúde deve incluir?",
      hint: "Preenchemos com base em quem depende de você. Mude se outra pessoa precisar de cobertura.",
    },
    seeResult: "Ver meu resultado",
  },

  section: {
    inputs: "Suas respostas",
    result: "A cobertura de que sua família precisa",
    notes: "Bom saber",
  },

  input: {
    smoker: {
      label: "Você fuma ou usa tabaco?",
      hint: "Fumantes pagam mais pelo seguro de vida. Informe isso também em qualquer proposta.",
    },
    existingLifeCover: {
      label: "Cobertura de vida que você já tem",
      hint: "O capital segurado de todas as suas apólices de vida, incluindo a do empregador. 0 se não tiver.",
    },
    existingHealthCover: {
      label: "Cobertura de saúde que a família já tem",
      hint: "O limite anual de todas as apólices de saúde, suas ou do empregador, para todos juntos. 0 se não tiver.",
    },
    people: {
      label: "Quem a cobertura de saúde inclui",
      hint: "Marque todos que devem ser cobertos.",
    },
    childrenCount: {
      label: "Filhos a cobrir",
    },
    parentsCount: {
      label: "Pais a cobrir",
    },
    parentAge: {
      label: "Idade do mais velho dos pais",
      hint: "A cobertura de saúde fica mais cara com a idade, então a faixa de preço usa este dado.",
    },
    coverToAge: {
      label: "Cobertura de vida até a idade de",
      hint: "A maioria das famílias deixa de depender da sua renda quando os filhos crescem, então a cobertura raramente precisa ir além da aposentadoria.",
    },
    incomeShare: {
      label: "Parte da sua renda de que a família precisaria",
      hint: "Sem você, alguns gastos param, então a família precisa de parte da sua renda, não dela toda.",
    },
    investments: {
      label: "Investimentos que a família poderia vender",
      hint: "Ações, fundos, certificados de poupança ou ouro. Sua reserva de emergência já foi contada.",
    },
    youngestChildAge: {
      label: "Idade do filho mais novo (opcional)",
      hint: "A cobertura de vida vai então até esse filho poder se sustentar, se isso vier antes da idade abaixo.",
    },
  },

  person: {
    self: "Eu",
    partner: "Cônjuge",
    child: "Filhos",
    parent: "Pais",
  },

  status: {
    red: "Grande falta de cobertura",
    amber: "Falta parte da cobertura",
    green: "Coberto por enquanto",
  },

  life: {
    title: "Cobertura de vida",
    label: "Cobertura de vida de que sua família precisa",
    multiple: "Cerca de {multiple} vezes a sua renda anual",
    existing: "Cobertura que você já tem",
    gap: "Falta contratar",
    years: "Anos cobertos",
    yearsValue: "{years} (até os {age} anos)",
    incomeNeed: "Para substituir sua renda",
    incomeNeedHint: "O que a família precisaria ao longo desses anos, em dinheiro de hoje.",
    enough: "A cobertura que você tem é suficiente por enquanto.",
    notNeeded: "Ainda não é necessária",
    why: "Por que {amount} de cobertura de vida?",
    status: {
      red: "Falta a maior parte da cobertura",
      amber: "Falta parte da cobertura",
      green: "Cobertura de vida suficiente",
    },
  },

  health: {
    title: "Cobertura de saúde",
    label: "Cobertura de saúde para a família",
    caption: "Para {people} pessoas",
    captionOne: "Para {people} pessoa",
    perPerson: "Por adulto",
    perPersonHint: "Mais ou menos o que custaria uma internação.",
    existing: "Cobertura que a família já tem",
    gap: "Falta contratar",
    enough: "A cobertura de saúde da família é suficiente por enquanto.",
    why: "Por que {amount} de cobertura de saúde?",
    status: {
      red: "Falta a maior parte da cobertura",
      amber: "Falta parte da cobertura",
      green: "Cobertura de saúde suficiente",
    },
  },

  premium: {
    title: "Quanto pode custar",
    monthly: "Separe todo mês",
    caption: "Seu plano reserva este valor para as duas coberturas.",
    captionNone: "Nada mais a reservar: a cobertura que você tem é suficiente por enquanto.",
    captionHealth: "Seu plano reserva este valor para a cobertura de saúde.",
    captionLife: "Seu plano reserva este valor para o seguro de vida temporário.",
    life: "Seguro temporário, por ano",
    lifeHint: "Para {gap} de cobertura.",
    smokerHint: "Para {gap} de cobertura, no preço para fumantes.",
    health: "Cobertura de saúde, por ano",
    healthHint: "Para {gap} a mais de cobertura.",
    range: "{low} – {high}",
    none: "Nada mais a contratar",
    indicative: "Faixas aproximadas, não cotações",
    why: "Por que {amount} por mês?",
  },

  policy: {
    title: "Já paga uma apólice com poupança?",
    hint: "Uma apólice que devolve dinheiro no final (seguro dotal). Veja como ela se compara com um seguro temporário simples.",
    intro: "Digite os números dos documentos da sua apólice. Comparamos o que a apólice paga no final com contratar um seguro temporário do mesmo valor e colocar o resto do prêmio num depósito seguro.",
    annualPremium: {
      label: "Prêmio que você paga por ano",
    },
    sumAssured: {
      label: "Cobertura de vida que a apólice dá",
      hint: "O capital segurado escrito na apólice.",
    },
    termYears: {
      label: "Prazo total da apólice",
    },
    yearsPaid: {
      label: "Anos já pagos",
    },
    expectedMaturity: {
      label: "Valor que a apólice paga no final",
      hint: "O valor de vencimento na simulação da seguradora, com o bônus esperado.",
    },
    surrenderValue: {
      label: "Quanto a seguradora pagaria se você parasse hoje (opcional)",
      hint: "O valor de resgate ou saldado; pergunte à seguradora. Sem ele, a comparação deixa de fora o que parar devolve.",
    },
    incomplete: "Preencha os cinco números para ver a comparação.",
    keep: "Se você mantiver a apólice",
    keepHint: "Pago no fim do prazo.",
    alternative: "Seguro temporário e poupar a diferença",
    alternativeHint: "O resto de cada prêmio vai para {instrument} pelos {years} restantes.",
    atLeast: "Pelo menos {amount}",
    surrenderPart: "Inclui {amount} do valor de resgate, corrigido até o final.",
    termPremium: "Seguro temporário do mesmo valor, por ano",
    remaining: "Anos que faltam pagar",
    irr: "Rendimento anual da apólice",
    irrHint: "Quanto os prêmios rendem por ano se a apólice pagar o que mostra na simulação.",
    verdict: {
      termPlusInvestAhead: "Com estes números, o seguro temporário mais poupar a diferença poderia deixar você com cerca de {amount} a mais no final.",
      policyAhead: "Com estes números, a apólice termina cerca de {amount} à frente do seguro temporário mais poupar a diferença.",
      similar: "Com estes números, os dois caminhos terminam mais ou menos iguais.",
    },
    clear: "Limpar estes números",
    why: "Por que esta comparação?",
  },

  checklist: {
    title: "Avalie a seguradora antes da apólice",
    intro: "Uma apólice só vale tanto quanto os sinistros que a seguradora paga. Passe por esta lista antes de assinar.",
    regulatorLink: "Órgão regulador de seguros: {name}",
    complaintsLink: "Onde reclamar: {name}",
  },

  note: {
    noDependents: "Ninguém depende da sua renda e você não tem dívidas, então ainda não precisa de seguro de vida. A cobertura de saúde continua importante.",
    debtsOnly: "Ninguém depende da sua renda, então o seguro de vida só precisa quitar suas dívidas, para que elas nunca passem para sua família.",
    publicCoverBroad: "No seu país, a saúde pública paga a maior parte das contas de hospital, então dimensionamos sua cobertura de saúde própria para uma parte mínima de uma internação.",
    premiumIndicative: "Os prêmios são faixas aproximadas, tiradas de tabelas de preços típicas, não cotações. Seu preço depende da sua saúde, da seguradora e da apólice.",
    noTermSold: "Não temos tabela de preços de seguro de vida temporário puro no seu país, então o prêmio de vida aparece como zero. Peça uma cotação de seguro temporário às seguradoras.",
    separateInvesting: "Mantenha seguro e investimento separados: a cobertura é um custo, como o aluguel, e poupar para o futuro se faz à parte.",
    policyNotAdvice: "Esta é uma comparação aproximada, não um conselho para cancelar ou manter qualquer apólice. Parar uma apólice antes do prazo muitas vezes dá prejuízo, então pergunte à seguradora quanto você receberia de volta antes de mudar qualquer coisa.",
    policyNoSurrender: "Você não informou quanto a seguradora devolveria se você parasse hoje, então contamos como zero. Aqui, parar parece pior do que realmente é: peça o valor de resgate à seguradora e acrescente-o.",
    policyMatured: "Todos os prêmios desta apólice já foram pagos, então não há mais o que comparar. Receba o valor de vencimento quando chegar a data.",
    multipleOutsideBand: "Uma regra prática comum é ter cobertura de vida de dez a quinze vezes a sua renda líquida anual. A sua está fora dessa faixa por causa da sua família, das dívidas e da poupança; o valor acima foi calculado para você.",
    noHealthPriceTable: "Não temos tabela de preços de seguro saúde no seu país, então o prêmio de saúde aparece como zero. Peça às seguradoras uma cotação para a cobertura acima.",
  },

  check: {
    regulator: "Confirme que a seguradora é autorizada pelo órgão regulador de seguros. Consulte o site do órgão antes de assinar.",
    claimSettlement: "Pergunte que parte dos sinistros a seguradora paga. Entre as seguradoras de vida daqui, fica em torno de {claimSettlement}; escolha uma que pague bem acima disso.",
    complaints: "Saiba onde reclamar. Se um sinistro for negado ou atrasado sem motivo claro, o setor de reclamações do órgão regulador pode intervir.",
    waitingPeriods: "Leia os prazos de carência. Muitas apólices de saúde não pagam algumas doenças no primeiro ou no segundo ano.",
    exclusions: "Leia a lista do que não é coberto antes de assinar, não depois de um sinistro.",
    cashlessNetwork: "Veja quais hospitais aceitam a apólice sem que você pague antes, incluindo hospitais perto de onde sua família mora.",
    honestProposal: "Responda a todas as perguntas da proposta com sinceridade, incluindo fumo e doenças anteriores. Uma resposta errada é o motivo mais comum de sinistros negados.",
    buyYoung: "Contrate cedo. Os prêmios são menores enquanto você é jovem e saudável, e uma doença mais tarde pode dificultar a contratação.",
    medicalTests: "Espere exames médicos para coberturas maiores. Faça-os: eles protegem seu sinistro mais tarde.",
  },
};
