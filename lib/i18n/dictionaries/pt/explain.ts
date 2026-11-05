// Input names per step are documented in ../en/explain.ts; the placeholders here must match.
import type { Dictionary } from "../../types";
import { explainM2 } from "./explain-m2";
import { explainM6 } from "./explain-m6";
import { explainM7 } from "./explain-m7";

export const explain: Dictionary["explain"] = {
  m2: explainM2,
  m6: explainM6,
  m7: explainM7,
  m1: {
    months: {
      title: "Meses de cobertura",
      body: "Começamos com {base} meses. Renda variável acrescenta {bumpIrregular}, ser a única pessoa com renda e ter dependentes acrescenta {bumpSoleEarner}, e não ter seguro saúde acrescenta {bumpNoHealth}. A sugestão fica entre {min} e {max} meses: {result}. O controle deslizante é seu para mover.",
    },
    target: {
      title: "Meta da reserva de emergência",
      body: "Seus gastos essenciais mensais vezes os meses de cobertura: {essentials} × {months} = {result}. Só os essenciais contam, porque numa emergência todo o resto para.",
    },
    gap: {
      title: "Falta guardar",
      body: "A meta menos o que você já pode acessar hoje: {target} − {saved} = {result}. Nunca fica abaixo de zero; uma reserva maior que o planejado não tem problema.",
    },
    monthly: {
      title: "Poupança mensal",
      body: "A diferença dividida pelos meses que você escolheu para montar a reserva: {gap} ÷ {buildMonths} = {result} por mês.",
    },
    covered: {
      title: "Meses cobertos",
      body: "Quantos meses de gastos essenciais sua poupança atual cobriria: {saved} ÷ {essentials} = {result}.",
    },
    tier1: {
      title: "Camada 1: conta poupança com saque no mesmo dia",
      body: "Um mês de gastos essenciais fica numa conta poupança da qual você pode sacar hoje: {essentials} = {result}. É o dinheiro para a primeira semana de qualquer emergência.",
    },
    tier2: {
      title: "Camada 2: escada de depósitos de 3 meses",
      body: "Tudo acima da camada 1 vai para depósitos a prazo: {target} − {tier1} = {result}, dividido em três depósitos abertos com um mês de diferença, para que um vença todo mês.",
    },
    banks: {
      title: "Bancos necessários",
      body: "O seguro de depósitos cobre {limit} por banco, e toda a reserva fica em depósitos bancários, então a meta é dividida: {target} ÷ {limit}, arredondado para cima, = {result} banco(s).",
    },
  },

  m3: {
    totalEmi: {
      title: "Total de parcelas mensais",
      body: "Todas as parcelas de empréstimos mais o pagamento mínimo de qualquer saldo de cartão que você carrega: {emis} + {cardMinimums} = {result}.",
    },
    emiRatio: {
      title: "Parcelas em relação à renda líquida",
      body: "Total de parcelas dividido pela renda líquida: {totalEmi} ÷ {takeHome} = {result}. Cada credor define seus próprios limites; marcamos uma parte alta porque sobra pouco para poupar.",
    },
    capacity: {
      title: "Capacidade para parcelas",
      body: "O que sobra para pagar empréstimos depois de poupar primeiro, pagar os essenciais e manter uma folga de caixa: {takeHome} − {savings} − {essentials} − {buffer} = {result}.",
    },
    maxLoan: {
      title: "Maior empréstimo que cabe no bolso",
      body: "A fórmula padrão da parcela, ao contrário. Com uma taxa mensal de {monthlyRate} em {months} meses: {capacity} × (1 − (1 + {monthlyRate})^−{months}) ÷ {monthlyRate} = {result}. Acrescente sua própria margem de segurança antes de pegar o empréstimo.",
    },
    scenarioEmi: {
      title: "Parcela mensal deste empréstimo",
      body: "A fórmula padrão da parcela. Para {principal} a uma taxa mensal de {monthlyRate} em {months} meses: {principal} × {monthlyRate} ÷ (1 − (1 + {monthlyRate})^−{months}) = {result}.",
    },
    interestSaved: {
      title: "Juros economizados",
      body: "Pagar primeiro a dívida com a taxa mais alta custa {avalancheInterest} em juros no total; começar pelo menor saldo custa {snowballInterest}. A diferença, {result}, é o que você economiza pagando primeiro a taxa mais alta.",
    },
  },

  m4: {
    average: {
      title: "Renda mensal média",
      body: "A renda é a média dos últimos {months} mês(es): {total} ÷ {months} = {result}. Para um salário fixo, é simplesmente sua renda líquida; autônomos e empresários devem informar os últimos seis meses para equilibrar as variações.",
    },
    feasible: {
      title: "O máximo que você poderia poupar",
      body: "O que sobra depois dos gastos essenciais, como parte da renda: ({average} − {essentials}) ÷ {average} = {result}. A taxa sugerida nunca passa disso.",
    },
    amount: {
      title: "Poupança mensal",
      body: "Renda vezes sua taxa de poupança: {average} × {rate} = {result}. Esse valor vai para a poupança no dia do pagamento, antes de qualquer gasto.",
    },
    expenses: {
      title: "Sobra para gastar",
      body: "Renda menos poupança é aquilo de que você vive: {average} − {savings} = {result}. Essa é a ideia toda: poupe primeiro, gaste o resto.",
    },
  },

  m5: {
    fv: {
      title: "Custo futuro do objetivo",
      body: "O custo de hoje corrigido pela inflação a cada ano até o objetivo: {cost} × (1 + {inflation})^{years} = {result}. Este é o valor que você realmente precisa alcançar.",
    },
    rate: {
      title: "Rendimento após impostos",
      body: "{instrument} paga {nominal} ao ano antes dos impostos. Depois dos {tax} de imposto retido na fonte, você fica com {result} ao ano.",
    },
    monthly: {
      title: "Poupança mensal necessária",
      body: "O valor que cresce até o custo futuro a uma taxa mensal de {monthlyRate} em {months} meses: {fv} × {monthlyRate} ÷ ((1 + {monthlyRate})^{months} − 1) = {result}.",
    },
    real: {
      title: "Rendimento real",
      body: "Quanto seu dinheiro ganha em poder de compra por ano: (1 + {afterTax}) ÷ (1 + {inflation}) − 1 = {result}. Abaixo de zero significa que o investimento perde para a inflação, mesmo pagando juros.",
    },
  },

  plan: {
    total: {
      title: "Seu valor mensal",
      body: "O valor a poupar primeiro, do seu orçamento: {savings} = {result}. Cada destino abaixo sai deste único número.",
    },
    emergencyShare: {
      title: "Parte para a reserva de emergência",
      body: "Até a reserva ficar completa, ela recebe o que sua calculadora pede, {m1Monthly} por mês, mas mantido entre {minShare} e {maxShare} do seu valor mensal ({total}), para que os outros destinos ainda recebam algo. Nunca recebe mais que os {gap} que faltam guardar: {result}.",
    },
    debtShare: {
      title: "Parte para dívidas com juros altos",
      body: "O que sobra depois da reserva de emergência vai para qualquer dívida acima da linha de juros altos, até a necessidade de quitação (todos os saldos com juros altos ÷ os meses-alvo): mín({remaining}, {headroom}) = {result}.",
    },
    goalsShare: {
      title: "Parte para os objetivos",
      body: "O que restar financia seus objetivos: mín({remaining}, {goalsNeed}) = {result}. Se for menos do que os objetivos precisam, o plano mostra a diferença.",
    },
    goalAllocation: {
      title: "Parte para este objetivo",
      body: "Este objetivo precisa de {need} por mês, e todos os seus objetivos juntos precisam de {goalsNeed}. Os {remaining} que sobram depois dos destinos acima são divididos nessa proporção: {remaining} × {need} ÷ {goalsNeed} = {result}.",
    },
  },
};
