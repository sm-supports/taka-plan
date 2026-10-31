// Placeholders must match ../en/explain-m7.ts exactly.
import type { Dictionary } from "../../types";

export const explainM7: Dictionary["explain"]["m7"] = {
  spendingAtRetirement: {
    title: "Расходы в первый год на пенсии",
    body: "Сегодняшние расходы {monthlySpending} в месяц, умноженные на 12 и увеличенные вместе с ценами на {inflation} в год за {retireInYears} г. до ухода с работы: 12 × {monthlySpending} × (1 + {inflation})^{retireInYears}. Получаемая арендная плата вычитается заранее, потому что она тоже растёт вместе с ценами. Итог: {result} в год.",
  },
  corpusContrast: {
    title: "Цель до возраста для сравнения",
    body: "Сумма, которая выплачивает {spendingAtRetirement} в первый год с ростом вместе с ценами ({inflation}) в течение {retiredForYears} г., пока остаток приносит {returnRate} после налога: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. Показано только для сравнения.",
  },
  corpusPlan: {
    title: "Цель, которой хватит до выбранного возраста",
    body: "Та же формула на {retiredForYears} г.: {spendingAtRetirement} × (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) ÷ ({returnRate} − {inflation}) = {result}. Это ровно та сумма, которую график по годам расходует до нуля к этому возрасту.",
  },
  savingsFv: {
    title: "Ваши сбережения к уходу с работы",
    body: "То, что у вас есть сегодня, {savings}, вложенное под {accumulationRate} в год на {retireInYears} г.: {savings} × (1 + {accumulationRate})^{retireInYears} = {result}.",
  },
  providentFund: {
    title: "Пенсионный фонд работодателя к уходу с работы",
    body: "Сегодняшний остаток {balance} плюс ежемесячные взносы {monthlyContribution}, которые растут по ставке самого фонда {fundRate} в течение {retireInYears} г. = {result}.",
  },
  gratuity: {
    title: "Выходное пособие",
    body: "Последний базовый оклад {basicMonthly} ÷ {daysPerMonthCount} дн. × {daysCount} дн. за каждый год стажа (лет: {serviceYears}) = {result}, выплачивается единовременно при уходе.",
  },
  fixedPensions: {
    title: "Фиксированные пенсии, оценка на момент ухода",
    body: "Государственная пенсия {publicPensionMonthly} в месяц с возраста {pensionFromAgeYears} и другой фиксированный доход {fixedPensionMonthly} в месяц, которые выплачиваются до выбранного возраста ({retiredForYears} г. на пенсии) без роста вместе с ценами, на момент ухода стоят столько при ставке {returnRate}: {result}. Поэтому за долгую пенсию их покупательная способность сокращается.",
  },
  gap: {
    title: "Осталось накопить",
    body: "Цель {corpus} минус всё, что уже будет (ваши сбережения, пенсионный фонд работодателя, выходное пособие и стоимость фиксированных пенсий), но не меньше нуля: {result}.",
  },
  monthly: {
    title: "Откладывать в месяц",
    body: "Сумма, которая при ежемесячных взносах в течение {savingMonths} мес. и росте на {monthlyRate} в месяц даёт {gap}: {gap} × {monthlyRate} ÷ ((1 + {monthlyRate})^{savingMonths} − 1) = {result}, с округлением вверх, чтобы точно хватило.",
  },
  withdrawal: {
    title: "Снятие в первый год",
    body: "Сколько {savings} может выплатить в первый год, с ростом вместе с ценами ({inflation}) каждый следующий год, чтобы денег хватило на {retiredForYears} г. при доходности {returnRate}: {savings} × ({returnRate} − {inflation}) ÷ (1 − ((1 + {inflation}) ÷ (1 + {returnRate}))^{retiredForYears}) = {result}, с округлением вниз, чтобы денег всегда хватало.",
  },
  safePot: {
    title: "Надёжная корзина",
    body: "Снятие первого года {firstYear}, умноженное на {potYears} г. = {result}, хранится в надёжном месте с быстрым доступом.",
  },
};
