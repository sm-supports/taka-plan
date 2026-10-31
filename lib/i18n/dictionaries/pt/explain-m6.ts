import type { Dictionary } from "../../types";

export const explainM6: Dictionary["explain"]["m6"] = {
  score: {
    title: "Pontuação de risco",
    body: "Cada uma das quatro respostas vale de 0 a 2: faixa de idade {ageBandCount}, renda {incomeCount}, quando você vai precisar do dinheiro {horizonCount} e o que faria depois de uma queda de 20% {reactionCount}. Ao todo: {result} de 8. De 0 a 3 é Cauteloso, de 4 a 5 Equilibrado, de 6 a 8 Crescimento.",
  },
  equity: {
    title: "Parte em ações",
    body: "Seu perfil começa com {startShare} em ações até os 30 anos e depois perde um ponto a cada ano, mas nunca fica abaixo de {floorShare}: aos {ageYears} anos isso dá {ageEquityShare}, e nunca passa do teto de {capShare}. Dinheiro necessário em até {noEquityYears} anos não fica em ações, e em até {cashOnlyYears} ano fica só em depósitos ou letras; o seu será necessário em {horizonYears} anos. Ações: {result}.",
  },
  gold: {
    title: "Parte em ouro",
    body: "O ouro é uma proteção, não uma aposta: a sua escolha de {chosenShare}, mantida entre {minShare} e {maxShare}. Ouro: {result}.",
  },
  fixedIncome: {
    title: "Parte em renda fixa",
    body: "Tudo o que não é ações nem ouro: 100% − {equityShare} − {goldShare} = {result}.",
  },
  mixLow: {
    title: "Rendimento da alocação, cenário baixo",
    body: "O rendimento anual de cada parte no cenário baixo, ponderado pela sua participação: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} ao ano.",
  },
  mixBase: {
    title: "Rendimento da alocação, cenário base",
    body: "O rendimento anual de cada parte no cenário base, ponderado pela sua participação: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} ao ano. O cenário base das ações não fica acima dos investimentos seguros, de propósito.",
  },
  mixHigh: {
    title: "Rendimento da alocação, cenário alto",
    body: "O rendimento anual de cada parte no cenário alto, ponderado pela sua participação: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} ao ano.",
  },
  fv: {
    title: "Quanto pode crescer (cenário base)",
    body: "{monthly} por mês e {lumpSum} hoje, crescendo a {mixRate} ao ano ({monthlyRate} ao mês) durante {years} anos. Você investe {paidIn}; no final, poderia ter {result}. Os cenários baixo e alto usam seu próprio rendimento da alocação.",
  },
  real: {
    title: "Em dinheiro de hoje",
    body: "Os preços também sobem. {fv} dividido por (1 + {inflation})^{years} = {result} no que o dinheiro compra hoje.",
  },
  trade: {
    title: "Operações de rebalanceamento",
    body: "Você tem {holdingsTotal} e acrescenta {newMoney}, então o novo total é {result}. A meta de cada parte é a sua participação nesse total ({equityShare}, {goldShare}, {fixedIncomeShare}) menos o que ela tem agora: ações {equityTrade}, ouro {goldTrade}, renda fixa {fixedIncomeTrade} (mais = comprar, menos = vender). O dinheiro novo vai primeiro para as partes abaixo do alvo, e uma parte a mais de {driftBandShare} do alvo é sinal para rebalancear.",
  },
};
