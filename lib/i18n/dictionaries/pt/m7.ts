import type { Dictionary } from "../../types";

export const m7: Dictionary["m7"] = {
  title: "Aposentadoria e família",
  intro: "Quanto guardar para viver do seu próprio dinheiro, do seu jeito, até os 100 anos.",
  introRetired: "Quanto você pode retirar da sua poupança por mês para que o dinheiro dure, do seu jeito, até os 100 anos.",
  demo: "Números de exemplo, só para visualização. Suas respostas não são usadas nesta tela.",

  flow: {
    mode: {
      title: "Você ainda trabalha ou já se aposentou?",
      hint: "Se trabalha, calculamos quanto guardar por mês. Se já se aposentou, calculamos quanto você pode retirar por ano.",
    },
    age: {
      title: "Quantos anos você tem?",
      hint: "Tirado do seu plano. Mude se não estiver certo.",
      label: "Sua idade",
    },
    retirementAge: {
      title: "Com que idade você quer parar de trabalhar?",
      hint: "A maioria dos empregos no setor privado termina aos {age}. Escolha a idade que combina com seu trabalho e sua saúde.",
      label: "Idade de aposentadoria",
    },
    spending: {
      title: "Quanto sua casa gasta por mês hoje?",
      hint: "Em dinheiro de hoje. Começamos pelos seus gastos essenciais; acrescente o que você continuaria pagando depois de parar de trabalhar.",
      label: "Gastos da casa por mês",
    },
    savings: {
      title: "Quanto você já poupou e investiu até agora?",
      hint: "Poupança, depósitos, {product}, fundos e ações que você guardaria para mais tarde. Não conte sua casa nem seu fundo de previdência (ele entra depois).",
      label: "Poupança e investimentos hoje",
    },
    monthlySaving: {
      title: "Quanto você guarda por mês agora?",
      hint: "Só o dinheiro reservado para mais tarde. Zero é uma resposta válida: é daqui que o plano começa.",
      label: "Quanto guarda por mês agora",
    },
    sex: {
      title: "Você é homem ou mulher?",
      hint: "Opcional. As mulheres vivem em média cerca de dois anos a mais, e o auxílio para idosos começa numa idade diferente.",
      skip: "Pular esta pergunta",
    },
    retireeType: {
      title: "Você se aposentou do setor público ou privado?",
      hint: "Aposentados do governo, de empresas públicas e das Forças Armadas podem usar um certificado de poupança aberto só para eles.",
    },
    retiredSavings: {
      title: "Quanto você tem de poupança agora?",
      hint: "O que recebeu do fundo de previdência e da gratificação por tempo de serviço, FDRs, certificados de poupança e tudo o mais de que você vive.",
      label: "Poupança agora",
    },
    otherIncome: {
      title: "Que outra renda entra por mês?",
      hint: "Uma pensão, aluguel ou qualquer outra coisa além da sua poupança. Deixe em zero se não houver.",
      label: "Outra renda por mês",
    },
    retiredSpending: {
      title: "Quanto sua casa gasta por mês?",
      hint: "Tudo, incluindo remédios e ajuda em casa.",
      label: "Gastos da casa por mês",
    },
    seeResult: "Ver meu plano até os 100",
  },

  mode: {
    working: "Ainda trabalho",
    workingHint: "Encontre a poupança mensal que dure até os 100",
    retired: "Já me aposentei",
    retiredHint: "Encontre uma retirada anual que dure até os 100",
  },
  sex: {
    male: "Homem",
    female: "Mulher",
    unknown: "Prefiro não dizer",
  },
  retireeType: {
    government: "Setor público",
    governmentHint: "Governo, empresa pública ou Forças Armadas",
    private: "Setor privado ou por conta própria",
    privateHint: "Emprego em empresa, negócio próprio ou trabalho autônomo",
  },

  section: {
    inputs: "Seus números",
    sources: "Renda depois de parar de trabalhar",
    result: "Seu plano",
  },

  input: {
    mode: "Trabalhando ou aposentado",
    age: {
      label: "Sua idade",
      hint: "Mudar aqui também muda no seu plano.",
    },
    sex: {
      label: "Homem ou mulher (opcional)",
      hint: "Usado só em duas notas: as mulheres vivem mais em média, e a idade do auxílio para idosos.",
    },
    retirementAge: {
      label: "Idade de aposentadoria",
      hint: "A idade usual aqui é {age}.",
    },
    planToAge: {
      label: "Planejar até a idade de",
      hint: "Por padrão, planejamos até os 100. Você pode baixar até {min}, nunca menos, ou subir até {max}.",
    },
    spending: {
      label: "Gastos da casa por mês, hoje",
      hint: "Em dinheiro de hoje; nós o corrigimos pelos preços até o ano em que você parar de trabalhar.",
    },
    savings: {
      label: "Poupança e investimentos hoje",
      hint: "Guardados para mais tarde. Sem contar sua casa nem seu fundo de previdência.",
    },
    monthlySaving: {
      label: "Quanto guarda por mês agora",
      hint: "O que você já reserva para mais tarde.",
    },
    retireeType: "De onde você se aposentou",
    retiredSavings: {
      label: "Poupança agora",
      hint: "Tudo de que você vive: valores recebidos, FDRs, certificados de poupança.",
    },
    otherIncome: {
      label: "Outra renda por mês",
      hint: "Uma pensão, aluguel ou qualquer outra coisa além da sua poupança.",
    },
  },

  sources: {
    intro: "Acrescente o que você espera ter. Cada fonte reduz o que você precisa poupar.",
    add: "Adicionar",
    remove: "Remover",
    notCounted: "Não contado",
    lowered: "Suas fontes de renda reduzem a poupança mensal em {amount}.",
    retiredIntro: "Sua outra renda já foi contada acima. Estas duas aparecem para completar o quadro, mas nunca são contadas.",
    pf: {
      title: "Fundo de previdência",
      hint: "Cresce à taxa do próprio fundo e é pago de uma vez quando você para de trabalhar.",
      balance: "Saldo hoje",
      contribution: "Contribuição mensal (a sua mais a do empregador)",
      contributionHint: "Hoje, grandes empregadores contribuem mais ou menos o mesmo que você; confira seu contracheque.",
      rate: "Taxa anual do fundo",
      rateHint: "Do extrato anual do seu fundo. Nunca supomos uma, porque os fundos são diferentes.",
    },
    gratuity: {
      title: "Gratificação por tempo de serviço",
      hint: "Um valor pago de uma vez quando você sai: dias do último salário-base para cada ano de serviço, como manda a lei ou pela regra do empregador, se for melhor.",
      years: "Anos de serviço quando você parar",
      basic: "Último salário-base por mês",
      employerDays: "Dias por ano do seu empregador (só se forem mais que os da lei)",
      employerDaysHint: "Deixe vazio para usar a regra da lei.",
    },
    pension: {
      title: "Regime público de previdência",
      hint: "Pago por toda a vida como um valor fixo, então compra menos a cada ano. Nós o avaliamos assim.",
      scheme: "Regime: {name}",
      contribution: "Sua contribuição por mês",
      expected: "Pensão mensal que você espera (se souber)",
      expectedHint: "Deixe vazio e usamos as projeções oficiais do regime.",
    },
    fixedPension: {
      title: "Outra pensão fixa",
      hint: "Qualquer pensão que não sobe com os preços.",
      label: "Pensão por mês",
    },
    rent: {
      title: "Aluguel que você recebe",
      hint: "O aluguel costuma subir com os preços, então é descontado direto dos seus gastos.",
      label: "Aluguel por mês, hoje",
    },
    allowance: {
      title: "Auxílio para idosos",
      hint: "Um pequeno auxílio do Estado, sujeito a análise de renda. Aparece para completar o quadro, mas nunca é contado no plano.",
      label: "Você poderia ter direito?",
      amount: "Cerca de {amount} por mês a partir dos {age} anos",
    },
    family: {
      title: "Ajuda da família",
      hint: "A ajuda dos filhos é bem-vinda, mas eles terão seus próprios gastos. Um bônus, nunca o plano.",
      label: "Ajuda mensal que você talvez receba",
    },
  },

  result: {
    headline: "Guarde por mês",
    caption: "para que seu dinheiro dure até os {planTo}. Meta ao parar aos {retirementAge}: {corpus}.",
    funded: "O que você já tem cobre a meta até os {planTo}. Mantenha investido.",
    currentSaving: "Hoje você guarda {amount} por mês.",
    mixUsed: "Antes de você parar de trabalhar, sua poupança cresce com os rendimentos da sua alocação de ativos.",
    contrast: {
      title: "Planejar até os {contrast} ou até os {planTo}",
      to: "Até os {age} anos",
      target: "Meta",
      monthly: "Por mês",
      extra: "Os {amount} a mais por mês pagam {years} anos a mais vivendo do seu próprio dinheiro, dos {contrast} aos {planTo}.",
      noExtra: "Sua poupança já cobre os anos depois dos {contrast}.",
      footnote: "Os {contrast} aparecem só para comparação: muita gente vive bem além disso.",
    },
    range: {
      title: "Dependendo dos rendimentos",
      low: "Se os rendimentos forem menores",
      base: "Nosso cenário base",
      high: "Se os rendimentos forem maiores",
      hint: "Projeções longas nunca são exatas; mostramos uma faixa e arredondamos todos os valores.",
    },
    chart: {
      title: "Quanto tempo meu dinheiro duraria?",
      hint: "Sua poupança com o que você guarda hoje, ano a ano, em dinheiro de cada ano.",
      label: "Poupança dos {from} aos {to} anos: máximo de {peak} aos {peakAge} anos. {verdict}.",
      axisAge: "Idade",
      retire: "Parar de trabalhar",
    },
    verdict: {
      onTrack: "No caminho para os {age}",
      lastsTo: "Dura até os {age}",
      runsOut: "Acaba aos {age}",
    },
    shift: {
      title: "O que muda começando {years} anos antes ou depois",
      earlier: "Se tivesse começado aos {age}",
      later: "Se começar aos {age}",
      now: "Começando agora, aos {age}",
      perMonth: "{amount} por mês",
      notPossible: "Muito perto da aposentadoria",
      hint: "Mesmos gastos, poupança e idade de aposentadoria; só o início muda.",
    },
    income: {
      title: "O que suas fontes acrescentam",
      pf: "Fundo de previdência ao parar",
      gratuity: "Gratificação por tempo de serviço",
      pensions: "Pensões fixas, avaliadas ao parar",
      publicPension: "Previdência pública por mês",
      rent: "Aluguel por ano ao parar",
      allowance: "Auxílio para idosos por mês",
      family: "Ajuda da família por mês",
    },
    addSources: "Acrescente suas fontes de renda",
    editAnswers: "Mudar suas respostas",
  },

  retired: {
    headline: "Você pode retirar por mês",
    caption: "São {firstYear} no primeiro ano, subindo com os preços a cada ano seguinte, e isso dura até os {planTo}.",
    chartHint: "Sua poupança ano a ano com a retirada acima, em dinheiro de cada ano.",
    range: {
      title: "Quanto você pode retirar, dependendo dos rendimentos",
      low: "Se os rendimentos só acompanharem a inflação",
      hint: "Projeções longas nunca são exatas; mostramos uma faixa e arredondamos todos os valores.",
    },
    runsOut: "Gastando {spending} por mês da poupança, o dinheiro duraria até cerca dos {age} anos.",
    lasts: "Gastando {spending} por mês da poupança, o dinheiro dura até os {planTo}.",
    target: {
      title: "Poupança necessária para os seus gastos",
      hint: "O que seus gastos tirados da poupança exigem, até os {contrast} e até os {planTo}.",
    },
    pot: {
      title: "A regra dos dois potes",
      body: "Deixe {amount} — {years} anos de retiradas — em FDRs e letras do Tesouro que você possa acessar rápido. O resto continua investido e reabastece este pote uma vez por ano.",
    },
    options: {
      title: "Formas de transformar poupança em renda estável",
      localName: "Aqui: {name}",
    },
  },

  bucket: {
    title: "Para onde deve ir este dinheiro?",
    body: "O dinheiro para mais tarde precisa de um lugar que dure mais que qualquer empresa. Onde não se vendem fundos de índice amplos, o plano monta o mais parecido com três partes: um fundo aberto diversificado, por um plano mensal, para crescer; renda garantida pelo governo, como o regime público de previdência, certificados de poupança e títulos do Tesouro; e uma combinação que fica mais segura a cada ano à medida que você se aproxima dos {retirementAge}.",
    bodyRetired: "O dinheiro para o resto da sua vida precisa de um lugar que dure mais que qualquer empresa. Deixe as retiradas dos próximos anos em depósitos e letras do Tesouro que você possa acessar rápido, e o resto em renda garantida pelo governo, como certificados de poupança e títulos do Tesouro, com uma pequena parte num fundo aberto diversificado para crescer.",
    lock: "Marque este dinheiro como “não antes dos {retirementAge}” e não mexa nele até lá.",
    link: "Ver sua alocação de ativos",
  },

  lifeTable: {
    title: "Quanto as pessoas vivem depois dos 60",
    hint: "Média de anos que ainda faltam em cada idade. Metade das pessoas vive mais que a média, por isso o plano nunca para nela.",
    age: "Idade",
    total: "Média",
    men: "Homens",
    women: "Mulheres",
    projected: "Projeção",
    source: "{source}, {date}",
  },
  supportRatio: "Em {fromYear}, havia {fromValue} pessoas em idade de trabalhar para cada pessoa idosa. Até {toYear}, haverá cerca de {toValue}, então conte primeiro com o seu próprio dinheiro.",

  notes: {
    title: "Bom saber",
  },
  backToPlan: "Voltar ao meu plano",

  note: {
    planTo100: "O plano vai até os 100 por padrão porque muitas pessoas que chegam aos 60 vivem bem além dos 80. Você pode baixar, mas nunca para menos de 85.",
    lifeAt60: "A expectativa de vida ao nascer mistura todas as idades desde a infância, por isso parece baixa. Quem chega aos 60 pode esperar, em média, cerca de vinte anos a mais, e metade vive mais que isso.",
    womenLiveLonger: "As mulheres vivem em média cerca de dois anos a mais, então o plano de um casal deve cobrir a aposentadoria mais longa da esposa.",
    familyNotCounted: "A ajuda da família nunca é contada: seus filhos terão suas próprias famílias e gastos. Trate-a como um bônus, não como um plano.",
    allowanceNotCounted: "O auxílio para idosos aparece, mas nunca é contado: é pequeno, depende de análise de renda e pode mudar.",
    pensionFixed: "Uma pensão paga como valor fixo compra menos a cada ano conforme os preços sobem, por isso é avaliada assim.",
    pensionEntryClosed: "O regime público de previdência só aceita novos participantes até a idade de entrada, então ele não é contado para você.",
    supportRatio: "Nas próximas décadas, menos pessoas em idade de trabalhar vão sustentar cada pessoa idosa, então sua própria poupança importa mais.",
    lock: "Guarde este dinheiro só para mais tarde. Mexer nele antes é o motivo mais comum de um plano não chegar lá.",
    startEarlier: "Começar mais cedo reduz muito o valor mensal, porque o dinheiro tem mais tempo para crescer.",
    noStatutoryGratuity: "Não temos registro de lei de gratificação por tempo de serviço no seu país, então contam só os dias do seu empregador. Confira seu contrato ou pergunte ao empregador.",
    lowCaseInflation: "O cenário baixo supõe que, na aposentadoria, seu dinheiro só acompanha os preços, sem rendimento real a mais.",
  },

  option: {
    pensionerCertificate: "Certificado de poupança para aposentados: rendimento mensal, só para aposentados do governo, de empresas públicas e das Forças Armadas, até um limite.",
    savingsCertificate: "Certificado de poupança do governo: rendimento fixo garantido pelo Estado.",
    tbonds: "Títulos do Tesouro: garantidos pelo governo, com cupom fixo a cada seis meses.",
    depositLadder: "Escada de FDR: depósitos que vencem um depois do outro, para liberar algum dinheiro todo ano.",
    annuity: "Renda vitalícia da seguradora estatal: uma pensão por toda a vida, por mais que você viva. A contrapartida: o dinheiro não pode ser deixado como herança.",
  },
};
