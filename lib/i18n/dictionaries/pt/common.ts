/*
 * Portuguese (neutral, Brazil-friendly). Register: "você", plain and warm.
 * Glossary (term → translation), used consistently across all pt files:
 *   take-home (pay)            → renda líquida
 *   essentials / essential spending → gastos essenciais
 *   emergency fund             → reserva de emergência
 *   savings account            → conta poupança
 *   fixed deposit / FDR        → depósito a prazo (FDR kept as a Bangladesh name)
 *   recurring deposit / DPS    → depósito programado (DPS kept as a Bangladesh name)
 *   government savings certificate → certificado de poupança do governo (Sanchayapatra kept)
 *   treasury bill              → letra do Tesouro
 *   treasury bond / government bond → título do Tesouro / título público
 *   equity fund (open-end)     → fundo de ações (aberto)
 *   fixed income               → renda fixa
 *   shares / equity            → ações
 *   asset mix                  → alocação de ativos
 *   brokerage account          → conta em corretora
 *   term life insurance        → seguro de vida temporário
 *   health cover               → cobertura de saúde
 *   sum insured / cover        → capital segurado / cobertura
 *   premium                    → prêmio
 *   surrender value            → valor de resgate
 *   EMI (loan instalment)      → parcela (EMI)
 *   principal                  → principal (saldo devedor)
 *   credit card balance carried → saldo rotativo do cartão
 *   grace period               → período sem juros
 *   interest rate / rate       → taxa de juros / taxa
 *   policy rate                → taxa básica de juros
 *   central bank               → banco central (Bangladesh Bank kept)
 *   inflation                  → inflação
 *   real return                → rendimento real
 *   headline rate              → taxa nominal
 *   after tax                  → após impostos
 *   provident fund             → fundo de previdência
 *   retirement / pension       → aposentadoria / pensão
 *   public pension scheme      → regime público de previdência
 *   gratuity                   → gratificação por tempo de serviço
 *   annuity (lifetime)         → renda vitalícia
 *   endowment policy           → seguro dotal (apólice com poupança)
 *   paid-up value              → valor saldado
 *   return / yield             → rendimento (interest → juros)
 *   rebalance                  → rebalancear
 *   old-age allowance          → auxílio para idosos
 *   plan bucket                → destino (do dinheiro); "share to X" → "parte para X"
 *   national ID / tax number   → documento de identidade / número fiscal
 *   dependents                 → dependentes
 */
import type { Dictionary } from "../../types";

export const common: Dictionary["common"] = {
  appName: "Taka Plan",
  tagline: "Quanto você precisa para cada objetivo e onde guardar o dinheiro todo mês.",
  loading: "Carregando…",
  yes: "Sim",
  no: "Não",
  optional: "Opcional",

  nav: {
    home: "Início",
    plan: "Meu plano",
    calculators: "Calculadoras",
    admin: "Admin de taxas",
    language: "Idioma",
  },

  button: {
    next: "Avançar",
    back: "Voltar",
    seePlan: "Ver meu plano",
    whyThisNumber: "Por que este número?",
    why: "Por quê?",
    close: "Fechar",
    edit: "Editar",
    save: "Salvar",
    cancel: "Cancelar",
    reset: "Recomeçar",
    tryAgain: "Tentar de novo",
    learnMore: "Saiba mais",
    add: "Adicionar",
    remove: "Remover",
    done: "Pronto",
    skip: "Pular",
    openCalculator: "Abrir calculadora",
  },

  status: {
    red: "Precisa de atenção agora",
    amber: "Fique de olho",
    green: "No caminho certo",
  },
  alsoNeedsAttention: "Também precisa de atenção",

  module: {
    m1: "Reserva de emergência",
    m2: "Seguros e saúde",
    m3: "Saúde das dívidas",
    m4: "Orçamento: poupar primeiro",
    m5: "Planejador de objetivos",
    m6: "Alocação de ativos",
    m7: "Aposentadoria e família",
    plan: "Seu plano",
  },

  instrument: {
    savings_account: "Conta poupança",
    fdr_3m: "FDR de 3 meses",
    fdr_1y: "FDR de 1 ano",
    dps: "DPS",
    sanchayapatra_5y: "Certificado de poupança do governo",
    tbill_91d: "Letra do Tesouro de 91 dias",
    tbond_5y: "Título do Tesouro de 5 anos",
    tbond_10y: "Título do Tesouro de 10 anos",
    equity_fund: "Fundo de ações aberto",
    gold: "Ouro (barras ou moedas 22K)",
    loan_prepayment: "Pagamento extra do empréstimo",
    term_insurance: "Seguro de vida temporário",
  },

  /** Product names inside a sentence, when the country data has none (useProductName). */
  productProse: {
    savings_account: "conta poupança",
    fdr_3m: "depósito a prazo",
    fdr_1y: "depósito a prazo",
    dps: "depósito programado",
    sanchayapatra_5y: "certificado de poupança do governo",
    tbill_91d: "letra do Tesouro",
    tbond_5y: "título público",
    tbond_10y: "título público",
    equity_fund: "fundo de ações",
    gold: "ouro",
  },

  /** An instrument inside a sentence ("into {instrument}"); {product} is the country's product name. */
  instrumentInline: {
    savings_account: "{product}",
    fdr_3m: "{product} de 3 meses",
    fdr_1y: "{product} de 1 ano",
    dps: "{product}",
    sanchayapatra_5y: "{product}",
    tbill_91d: "{product} de 91 dias",
    tbond_5y: "{product} de 5 anos",
    tbond_10y: "{product} de 10 anos",
    equity_fund: "um fundo de ações aberto",
    gold: "barras ou moedas de ouro",
    loan_prepayment: "pagamentos extras do empréstimo",
    term_insurance: "seguro de vida temporário",
  },

  unit: {
    month: "mês",
    months: "meses",
    year: "ano",
    years: "anos",
    perMonth: "/mês",
    perYear: "por ano",
    taka: "৳",
    percent: "%",
  },

  offline: "Você está offline — usando as taxas salvas",
  ratesVersion: "Taxas v{version}, {asOf}",
  mayBeOutdated: "Pode estar desatualizado",
  ourAssumption: "Nossa premissa",
  ourSource: "Taka Plan (nossa premissa)",
  source: "Fonte",
  asOf: "Em {date}",
  range: "Faixa {low}–{high}",
  afterTax: "Após impostos",
  afterInflation: "Após a inflação",
  headline: "Taxa nominal",

  disclaimer: {
    short:
      "Estimativas apenas para fins educativos; não é aconselhamento financeiro, fiscal ou jurídico. As taxas mudam — confirme com seu banco ou seguradora antes de agir. Rendimentos passados não garantem rendimentos futuros.",
    title: "Antes de começar",
    body:
      "O Taka Plan dá estimativas apenas para fins educativos. Não é aconselhamento financeiro, fiscal ou jurídico, e nunca indica um banco, fundo ou seguradora. Taxas e regras de impostos mudam várias vezes por ano, então confirme com seu banco ou seguradora antes de agir com base em qualquer número daqui. Rendimentos passados não garantem rendimentos futuros. Suas respostas ficam no seu celular, a menos que você decida salvar um plano.",
    accept: "Entendi",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "Escolha o idioma",
  },
  /** Header language menu button: {language} is the current language's own name. */
  languageMenu: "Idioma: {language}",
  changeCountry: "Mudar de país",
  /** Header country link: {country} is the country code shown in the header. */
  countryLink: "País {country}. Mudar de país",

  incomeType: {
    salaried: "Assalariado",
    freelance: "Autônomo",
    business: "Empresário",
  },

  dependent: {
    none: "Ninguém",
    partner: "Cônjuge",
    children: "Filhos",
    parents: "Pais",
  },

  goalType: {
    general: "Geral",
    education: "Educação",
    health: "Saúde",
    wedding: "Casamento",
    vehicle: "Veículo",
    home: "Casa ou terreno",
    travel: "Viagem",
  },

  loanType: {
    personal: "Empréstimo pessoal",
    home: "Financiamento imobiliário",
    car: "Financiamento de veículo",
    education: "Crédito estudantil",
    other: "Outro empréstimo",
  },

  horizon: {
    short: "Menos de 3 anos",
    medium: "De 3 a 5 anos",
    long: "Mais de 5 anos",
  },

  explain: {
    title: "Por que este número?",
    steps: "Como chegamos aqui",
    assumptions: "Taxas usadas",
    notes: "Notas",
    stale: "Esta taxa passou da data de revisão",
  },

  /** "Start from the beginning" and the drafts it keeps (components/drafts). */
  drafts: {
    startOver: "Começar do início",
    startOverHint: "Suas respostas atuais ficam salvas como rascunho.",
    confirmTitle: "Começar do início?",
    confirmBody: "Suas respostas atuais ficam salvas como rascunho. Você pode abri-lo de novo quando quiser em Seus rascunhos.",
    confirm: "Sim, recomeçar",
    cancel: "Cancelar",
    saved: "Salvo como rascunho",
    alreadySaved: "Já salvo como rascunho",
    deleted: "Rascunho excluído",
    title: "Seus rascunhos",
    sectionTitle: "Seus rascunhos ({count})",
    intro: "Respostas que você guardou ao recomeçar. Abra uma para ver o plano dela.",
    empty: "Nenhum rascunho ainda. Quando você começar do início, suas respostas atuais ficam guardadas aqui.",
    seeAll: "Ver todos os rascunhos",
    backToPlan: "Voltar ao meu plano",
    updated: "Atualizado em {date}",
    current: "Aberto agora",
    open: "Abrir",
    rename: "Renomear",
    renameLabel: "Nome do rascunho",
    renameHint: "Até {max} letras. Deixe vazio para usar o nome automático.",
    delete: "Excluir",
    deleteTitle: "Excluir este rascunho?",
    deleteBody: "Ele será removido deste celular e não poderá ser recuperado.",
    deleteConfirm: "Sim, excluir",
    /** Shown before saving would push the oldest unnamed draft out (lib/store/drafts.ts capDrafts). */
    capWarning: "Você já tem {max} rascunhos, então o mais antigo sem nome, “{label}”, será removido. Dê um nome a um rascunho para mantê-lo.",
    openTitle: "Abrir este rascunho?",
    openConfirm: "Sim, abrir",
    label: {
      age: "{age} anos",
      takeHome: "{amount}/mês",
      goalsOne: "{count} objetivo",
      goalsOther: "{count} objetivos",
      m2: "Seguros",
      m6: "Investimentos",
      m7: "Aposentadoria",
    },
  },

  /** Banner under the header about the chosen country's data (components/layout/CountryNotice). */
  countryNotice: {
    noData: "Ainda não temos dados pesquisados para {country}, então os valores usam os números e a moeda (taka) de Bangladesh.",
    changeCountry: "Mudar de país",
    someFallback: "Alguns números de {country} são estimativas regionais, não do próprio país.",
    about: "De onde vêm os números",
  },
};
