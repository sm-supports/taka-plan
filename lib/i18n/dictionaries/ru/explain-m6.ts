// Placeholders must match ../en/explain-m6.ts exactly.
import type { Dictionary } from "../../types";

export const explainM6: Dictionary["explain"]["m6"] = {
  score: {
    title: "Оценка риска",
    body: "Каждый из четырёх ответов даёт от 0 до 2 баллов: возрастная группа {ageBandCount}, доход {incomeCount}, когда нужны деньги {horizonCount}, и что вы сделаете после падения на 20% {reactionCount}. Всего: {result} из 8. 0–3 — Осторожный, 4–5 — Сбалансированный, 6–8 — Рост.",
  },
  equity: {
    title: "Доля акций",
    body: "Ваш профиль начинается с доли акций {startShare} до 30 лет, затем она уменьшается на 1 процентный пункт за каждый следующий год, но не ниже {floorShare}: в возрасте {ageYears} это {ageEquityShare}, и никогда не выше предела {capShare}. В деньгах, нужных в течение {noEquityYears} лет, акций нет, а в течение {cashOnlyYears} года — только вклады или векселя; ваши нужны через {horizonYears} г. Акции: {result}.",
  },
  gold: {
    title: "Доля золота",
    body: "Золото — это защита от рисков, а не ставка на рост: ваш выбор {chosenShare} в пределах от {minShare} до {maxShare}. Золото: {result}.",
  },
  fixedIncome: {
    title: "Доля фиксированного дохода",
    body: "Всё, что не акции и не золото: 100% − {equityShare} − {goldShare} = {result}.",
  },
  mixLow: {
    title: "Доходность структуры, низкий сценарий",
    body: "Годовая доходность каждой части в низком сценарии, взвешенная по её доле: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} в год.",
  },
  mixBase: {
    title: "Доходность структуры, базовый сценарий",
    body: "Годовая доходность каждой части в базовом сценарии, взвешенная по её доле: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} в год. Базовая доходность акций намеренно задана не выше, чем у надёжных инструментов.",
  },
  mixHigh: {
    title: "Доходность структуры, высокий сценарий",
    body: "Годовая доходность каждой части в высоком сценарии, взвешенная по её доле: {equityShare} × {equityRate} + {goldShare} × {goldRate} + {fixedIncomeShare} × {fixedIncomeRate} = {result} в год.",
  },
  fv: {
    title: "Во что это может вырасти (базовый сценарий)",
    body: "{monthly} в месяц и {lumpSum} сегодня под {mixRate} в год ({monthlyRate} в месяц) в течение {years} г. Вы вкладываете {paidIn}; в конце у вас может быть {result}. Низкий и высокий сценарии используют свою доходность структуры.",
  },
  real: {
    title: "В сегодняшних деньгах",
    body: "Цены тоже растут. {fv}, делённое на (1 + {inflation})^{years}, = {result} по сегодняшней покупательной способности.",
  },
  trade: {
    title: "Сделки для ребалансировки",
    body: "У вас {holdingsTotal}, и вы добавляете {newMoney}, поэтому новый итог — {result}. Цель каждой части — её доля от этого итога ({equityShare}, {goldShare}, {fixedIncomeShare}) минус то, что в ней уже есть: акции {equityTrade}, золото {goldTrade}, фиксированный доход {fixedIncomeTrade} (плюс — купить, минус — продать). Новые деньги сначала идут в отстающие части, а отклонение части от цели больше чем на {driftBandShare} — сигнал к ребалансировке.",
  },
};
