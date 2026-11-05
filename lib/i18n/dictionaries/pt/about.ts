import type { Dictionary } from "../../types";

export const about: Dictionary["about"] = {
  title: "Sobre o Taka Plan",
  lead: "Uma calculadora gratuita que mostra quanto cada objetivo exige e onde colocar o dinheiro todo mês. Ela ensina e calcula; quem age é você, pelo seu banco, sua corretora ou sua seguradora.",
  disclaimer: { heading: "Aviso" },
  method: {
    heading: "Como o plano é montado",
    intro: "O plano segue sete etapas numa ordem fixa: primeiro proteger, depois poupar, depois fazer crescer. Cada etapa é uma pequena calculadora, e juntas elas formam um único valor mensal.",
    phase: { protect: "Proteger", save: "Poupar", grow: "Crescer" },
    order:
      "Seu valor mensal é distribuído por ordem de prioridade: primeiro a reserva de emergência, depois os prêmios de seguro, depois qualquer dívida cara e só então os objetivos e a aposentadoria. Até a reserva de emergência ficar completa, pelo menos {share} do valor mensal vai para ela, para que o restante já comece hoje o seu hábito de investir.",
    returnsHeading: "Rendimentos após impostos e após a inflação",
    returns:
      "Todo rendimento aparece com dois descontos: primeiro após o imposto retido na fonte, depois após a inflação. A pergunta não é a taxa nominal, e sim o que você fica e o que isso ainda vai comprar. Um investimento pode pagar juros e mesmo assim perder para a inflação, e o app avisa em vermelho quando isso acontece.",
    exampleCaption: "Com a tabela de taxas de hoje:",
    rounding: "Os resultados são arredondados para um valor redondo próximo, porque uma projeção de vinte anos nunca é exata até o último centavo. Faixas (baixa, esperada, alta) aparecem quando o rendimento futuro é incerto.",
    onDevice: "Todos os cálculos rodam no seu celular, e suas respostas ficam nele. O servidor guarda apenas a tabela de taxas e os dados de cada país.",
  },
  sources: {
    heading: "Fontes e premissas",
    intro: "Cada linha abaixo é uma premissa que as calculadoras leem. Taxas versão {version}, publicada em {date}. As linhas marcadas como “nossa premissa” são valores padrão que escolhemos e podemos mudar; as demais foram copiadas da fonte publicada indicada ao lado de cada uma.",
    group: {
      macro: "Inflação e taxa básica de juros",
      bank: "Depósitos bancários",
      sanchayapatra: "Sanchayapatra",
      govt: "Títulos públicos",
      market: "Ações e ouro",
      risk: "Crédito, seguros e longevidade",
      tax: "Regras de impostos (FY2026-27)",
      policy: "Padrões do app",
      other: "Outros",
    },
    value: "Valor",
    dates: "Datas",
    nextReview: "Próxima revisão",
    note: "Nota",
    slabNext: "{rate} sobre os próximos {width}",
    slabRest: "{rate} sobre o restante",
    unverifiedHeading: "Ainda não verificado",
    unverifiedIntro: "Ainda não conseguimos confirmar estes itens, então nenhuma calculadora depende deles por enquanto:",
    unverified: [
      "Prêmios atuais de seguro de vida temporário para coberturas de 10 lakh e de 1 crore.",
      "Limites de investimento em Sanchayapatra para 2026.",
      "Se o imposto reduzido para pequenos investidores em Sanchayapatra continuou após a Lei de Finanças.",
      "Uma relação parcela/renda do Bangladesh Bank (parece não existir; usamos nosso próprio limite).",
      "Taxas de mercado para empréstimos pessoais e financiamento imobiliário.",
    ],
  },
};
