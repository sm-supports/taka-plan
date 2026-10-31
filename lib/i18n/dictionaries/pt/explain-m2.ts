import type { Dictionary } from "../../types";

export const explainM2: Dictionary["explain"]["m2"] = {
  years: {
    title: "Anos de cobertura",
    body: "A cobertura de vida vai da sua idade hoje, {ageYears}, até os {coverToAgeYears} anos, quando a família normalmente já não depende da sua renda, ou até seu filho mais novo completar {childIndependentAgeYears} anos, se você informou a idade dele e isso vier antes: {result} anos. Nunca fica abaixo de zero.",
  },
  incomeNeed: {
    title: "Renda a substituir",
    body: "A família precisaria de {incomeShare} da sua renda líquida de {takeHome} por mês: {yearlyNeed} por ano. Essa necessidade cresce com os preços, a {inflation} ao ano, durante {coveredYears} anos. Dinheiro guardado hoje numa aplicação segura poderia render {afterTax} após impostos, ou seja, {realRate} ao ano acima da alta dos preços; então o valor único que, guardado hoje, paga a necessidade de cada ano, a partir de agora, é {result}.",
  },
  lifeCover: {
    title: "Cobertura de vida necessária",
    body: "A renda a substituir, {incomeNeed}, mais as dívidas, {debts}, e os objetivos de educação, {educationGoals}, menos a poupança que a família pode acessar, {liquidSavings}, e os investimentos, {investments}: {result}. Nunca fica abaixo de zero.",
  },
  lifeGap: {
    title: "Cobertura de vida que falta contratar",
    body: "A cobertura necessária menos a cobertura que você já tem: {cover} − {existingLifeCover} = {result}.",
  },
  perStay: {
    title: "Cobertura de saúde por adulto",
    body: "Uma internação típica custa cerca de {hospitalCost}. As famílias pagam do próprio bolso {oopShare} dos gastos com saúde; usamos pelo menos {publicFloorShare}, então consideramos {appliedShare}: {result} de cobertura por adulto.",
  },
  healthTarget: {
    title: "Cobertura de saúde para a família",
    body: "A cobertura por adulto, {perStay}, vezes o peso das {peopleCount} pessoas cobertas, {weightCount} no total (uma criança conta menos que um adulto, um dos pais conta mais): {result}.",
  },
  healthGap: {
    title: "Cobertura de saúde que falta contratar",
    body: "A meta da família menos a cobertura de saúde que você já tem: {target} − {existingHealthCover} = {result}.",
  },
  lifePremium: {
    title: "Prêmio anual do seguro de vida temporário",
    body: "O seguro de vida temporário custa cerca de {bandLow} a {bandHigh} por ano para cada {per} de cobertura na sua idade, vezes {smokerMultipleCount} se você fuma. Para {gap} de cobertura, isso dá {premiumLow} a {premiumHigh} por ano; o meio da faixa é {result}.",
  },
  healthPremium: {
    title: "Prêmio anual de saúde",
    body: "A cobertura de saúde tem preço para cada {per} de cobertura, conforme a idade de cada pessoa. Para {gap} a mais de cobertura, para {peopleCount} pessoas, isso dá {premiumLow} a {premiumHigh} por ano; o meio da faixa é {result}.",
  },
  monthlyNeed: {
    title: "Para separar todo mês",
    body: "O meio das duas faixas anuais, seguro temporário {lifePremium} mais saúde {healthPremium}, dividido por {months} meses: {result} por mês.",
  },
  policyTerm: {
    title: "Seguro temporário do mesmo valor",
    body: "Um seguro de vida temporário com a cobertura da apólice, {sumAssured}, custa cerca de {bandLow} a {bandHigh} por ano para cada {per} na sua idade, vezes {smokerMultipleCount} se você fuma. O meio da faixa é {result} por ano.",
  },
  policyInvest: {
    title: "Poupar a diferença",
    body: "Se você parasse agora, o que a seguradora devolve, {surrenderValue}, cresce até {surrenderValueFV} num depósito seguro que rende {afterTax} após impostos. Seu prêmio de {annualPremium} menos o prêmio do temporário, {termPremium}, deixa {yearlyDifference} por ano; aplicado no mesmo depósito no início de cada um dos {remainingYears} anos restantes, tudo junto chega a {result}.",
  },
  policyIrr: {
    title: "Rendimento anual da apólice",
    body: "Manter a apólice significa abrir mão de {surrenderValue} hoje e pagar {annualPremium} por ano durante os {remainingYears} anos que faltam de {termYears}, para receber {expectedMaturity} no final: como ganhar {result} ao ano sobre esse dinheiro. Parar e poupar a diferença chegaria a {investValue}, uma diferença de {difference}.",
  },
};
