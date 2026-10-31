import type { Dictionary } from "../../types";

/** Country and language steps on "/" (imported there directly; see en/onboarding.ts). */
export const onboardingEntry: Pick<Dictionary["onboarding"], "country" | "language" | "switchCountry"> = {
  country: {
    title: "Onde você mora?",
    subtitle: "Usamos a moeda, as taxas e os produtos de poupança do seu país.",
    searchLabel: "Procure o seu país",
    searchPlaceholder: "Nome do país, em inglês ou no seu idioma",
    suggested: "Sugeridos",
    all: "Todos os países",
    results: "Países encontrados",
    noMatch: "Nenhum país corresponde a “{query}”.",
    currency: "Moeda: {code}",
    current: "Escolha atual",
    changeLater: "Você pode mudar o país e o idioma quando quiser.",
    intro: "Cinco perguntas rápidas e depois o seu plano mensal de poupança. Não precisa criar conta.",
    disclaimer: "Estimativas apenas para fins educativos; não é aconselhamento financeiro, fiscal ou jurídico.",
    region: {
      south_asia: "Sul da Ásia",
      east_asia_pacific: "Leste da Ásia e Pacífico",
      europe_central_asia: "Europa e Ásia Central",
      latin_america_caribbean: "América Latina e Caribe",
      middle_east_north_africa: "Oriente Médio e Norte da África",
      north_america: "América do Norte",
      sub_saharan_africa: "África Subsaariana",
    },
  },
  language: {
    title: "Qual idioma você prefere?",
    subtitle: "Você pode trocar quando quiser pelo menu no topo.",
    country: "País: {country}",
    notAvailable: "Seu idioma ainda não está disponível; usamos o inglês.",
    changeCountry: "Mudar de país",
  },
  switchCountry: {
    title: "Começar do zero para {country}?",
    body: "Suas respostas estão em {currency}. Começar do zero para {country} guarda suas respostas atuais como rascunho, para você abri-las de novo quando quiser.",
    capWarning: "Você já tem {max} rascunhos, então o mais antigo sem nome será removido.",
    confirm: "Começar do zero",
    cancel: "Manter minhas respostas",
    saved: "Salvo como rascunho",
  },
};

/** Five quick questions, one per screen. */
export const onboarding: Dictionary["onboarding"] = {
  country: onboardingEntry.country,
  language: onboardingEntry.language,
  switchCountry: onboardingEntry.switchCountry,

  languagePick: {
    title: "Qual idioma você prefere?",
    subtitle: "Você pode trocar quando quiser.",
  },

  progress: "Pergunta {n} de 5",
  intro: "Cinco perguntas rápidas e depois o seu plano. Não precisa criar conta.",

  step: {
    1: {
      title: "Quantos anos você tem?",
      hint: "Sua idade define quanto tempo seus objetivos e sua aposentadoria têm para crescer.",
      placeholder: "Sua idade em anos",
      label: "Sua idade",
      decadeLabel: "Toque num atalho e depois ajuste a idade exata abaixo",
      decade: {
        under20: "Menos de 20",
        twenties: "20 a 29",
        thirties: "30 a 39",
        forties: "40 a 49",
        fifties: "50 a 59",
        sixtyPlus: "60 ou mais",
      },
      unit: "anos",
    },
    2: {
      title: "Qual é a sua renda líquida mensal?",
      hint: "O valor que realmente cai na sua conta depois dos impostos e das contribuições para a previdência.",
      hintFreelance: "Renda variável? Some os últimos seis meses e divida por seis.",
      placeholder: "Renda líquida na sua moeda",
      label: "Renda líquida mensal",
      incomeTypeLabel: "Como você ganha dinheiro?",
      incomeTypeHint: {
        salaried: "Um salário fixo todo mês",
        freelance: "Pagamentos de projetos ou clientes que variam",
        business: "O lucro que você retira do seu próprio negócio",
      },
      average: {
        toggle: "Calcular a partir dos últimos seis meses",
        title: "Renda dos últimos seis meses",
        hint: "Digite o que você recebeu em cada mês. Deixe o mês em branco se não recebeu nada.",
        month: "Mês {n}",
        result: "Média de seis meses: {amount}",
        use: "Usar {amount} como minha renda líquida",
        close: "Ocultar",
      },
    },
    3: {
      title: "Quanto você gasta por mês com o essencial?",
      hint: "Aluguel, alimentação, contas da casa, transporte, escola, ajuda aos pais e as parcelas que você já paga. Deixe de fora restaurantes, compras e viagens.",
      placeholder: "Gastos essenciais na sua moeda",
      label: "Gastos essenciais mensais",
      countsTitle: "O que conta como essencial",
      counts: {
        rent: "Aluguel ou parcela do financiamento da casa",
        food: "Alimentação e mercado",
        utilities: "Luz, gás, água, telefone e internet",
        transport: "Transporte",
        school: "Escola e mensalidades",
        parents: "Ajuda que você manda aos pais",
        emi: "Qualquer parcela de empréstimo ou cartão que você já paga",
      },
      leaveOut: "Deixe de fora restaurantes, compras, eletrônicos e viagens.",
      takeHomeReminder: "Sua renda líquida: {amount}",
      leftOver: "Sobra depois do essencial: {amount}",
    },
    4: {
      title: "Quem depende da sua renda?",
      hint: "Marque todos que se aplicam. Os dependentes mudam sua reserva de emergência e sua necessidade de seguro.",
      none: "Ninguém depende de mim",
      label: "Dependentes",
      option: {
        partner: "Cônjuge",
        children: "Filhos",
        parents: "Pais",
      },
      optionHint: {
        partner: "Cônjuge ou parceiro que depende da sua renda",
        children: "Qualquer filho que você sustenta",
        parents: "Pais ou sogros que você sustenta",
      },
    },
    5: {
      title: "Você tem empréstimos ou saldo no cartão que passa para o mês seguinte?",
      hint: "Conte empréstimos bancários, financiamentos de carro ou casa e qualquer fatura de cartão que você não paga inteira todo mês.",
      yes: "Sim, tenho dívidas",
      no: "Sem dívidas",
      label: "Empréstimos ou saldo no cartão",
      yesNote: "Bom saber. Seu plano vai incluir uma análise das dívidas para que a mais cara seja paga primeiro.",
      noNote: "Ótimo. Seu plano pode ir direto para a poupança.",
      readyTitle: "Isso é tudo",
      ready: "Seu plano é montado a partir destas cinco respostas. Você pode mudar qualquer uma delas depois.",
    },
  },

  summary: {
    age: "{age} anos",
    takeHome: "Renda líquida {amount}",
    essentials: "Essenciais {amount}",
    /** {list}: the people who depend on the user, already joined ("Partner, Children"). */
    dependents: "Dependem de você: {list}",
    noDependents: "Ninguém depende de você",
    debt: "Tem empréstimos ou dívida no cartão",
    noDebt: "Sem dívidas",
  },

  cta: {
    start: "Começar",
    seePlan: "Ver meu plano",
    next: "Avançar",
    back: "Voltar",
  },

  validation: {
    required: "Digite um número para continuar.",
    number: "Use só algarismos, como {example}.",
    ageRange: "Digite uma idade entre {min} e {max}.",
    positiveAmount: "Digite um valor maior que zero.",
    essentialsAboveIncome: "Os gastos essenciais estão maiores que a sua renda líquida. Confira os dois números — o plano ainda funciona, mas o valor a poupar será bem pequeno.",
    pickOne: "Escolha pelo menos uma opção, ou “Ninguém”.",
  },
};
