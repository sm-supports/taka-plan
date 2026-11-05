// Russian. Register: «вы» (lower case), plain and warm. Western digits only.
// Placeholders often hold a number with its own unit, so the copy avoids number agreement around
// them: "мес." for months, «до возраста {age}» for ages, «Целей: {count}» for counts.
//
// Glossary (English → русский), used consistently across every ru file:
//   emergency fund            → резервный фонд
//   take-home (pay)           → доход на руки
//   essentials / essential spending → обязательные расходы
//   dependents                → те, кто зависит от вашего дохода (иждивенцы)
//   savings account           → сберегательный счёт
//   fixed deposit / term deposit (FDR) → срочный вклад (FDR kept as a Bangladesh name)
//   recurring deposit (DPS)   → накопительный вклад (DPS kept as a Bangladesh name)
//   government savings certificate (Sanchayapatra) → государственный сберегательный сертификат (Sanchayapatra kept)
//   treasury bill             → казначейский вексель
//   treasury bond / government bond → казначейская облигация / государственная облигация
//   (open-end) equity fund    → открытый фонд акций
//   shares / equity           → акции
//   fixed income              → фиксированный доход
//   asset mix                 → структура активов
//   headline rate             → номинальная ставка
//   real return               → реальная доходность
//   after tax / after inflation → после налога / с учётом инфляции
//   tax deducted at source    → налог, удержанный у источника
//   policy rate               → ключевая ставка
//   central bank              → центральный банк (Bangladesh Bank kept)
//   EMI (instalment)          → ежемесячный платёж по кредиту (EMI kept in Bangladesh-only copy)
//   principal                 → основной долг
//   prepayment                → досрочное погашение
//   credit card balance carried → долг по карте, перенесённый на следующий месяц
//   grace period              → льготный период
//   term life insurance       → срочное страхование жизни
//   health insurance / cover  → медицинская страховка / покрытие
//   sum insured               → страховая сумма
//   premium                   → страховой взнос
//   surrender value           → выкупная сумма
//   annuity                   → пожизненная рента (аннуитет)
//   pension                   → пенсия
//   provident fund            → пенсионный фонд работодателя
//   gratuity                  → выходное пособие за выслугу лет
//   maturity                  → погашение / срок погашения
//   deposit ladder            → лестница вкладов
//   brokerage account         → брокерский счёт (BO account → BO-счёт)
//   lump sum                  → единовременная сумма
//   inflation                 → инфляция
//   rebalance                 → ребалансировка
import type { Dictionary } from "../../types";

export const common: Dictionary["common"] = {
  appName: "Taka Plan",
  tagline: "Сколько нужно на каждую цель и куда откладывать деньги каждый месяц.",
  loading: "Загрузка…",
  yes: "Да",
  no: "Нет",
  optional: "Необязательно",

  nav: {
    home: "Главная",
    plan: "Мой план",
    calculators: "Калькуляторы",
    admin: "Админка ставок",
    language: "Язык",
  },

  button: {
    next: "Далее",
    back: "Назад",
    seePlan: "Посмотреть план",
    whyThisNumber: "Почему такая сумма?",
    why: "Почему?",
    close: "Закрыть",
    edit: "Изменить",
    save: "Сохранить",
    cancel: "Отмена",
    reset: "Начать заново",
    tryAgain: "Повторить",
    learnMore: "Подробнее",
    add: "Добавить",
    remove: "Удалить",
    done: "Готово",
    skip: "Пропустить",
    openCalculator: "Открыть калькулятор",
  },

  status: {
    red: "Нужно заняться сейчас",
    amber: "Стоит присмотреться",
    green: "Всё по плану",
  },
  alsoNeedsAttention: "Также требует внимания",

  module: {
    m1: "Резервный фонд",
    m2: "Страхование и здоровье",
    m3: "Проверка долгов",
    m4: "Бюджет «сначала сбережения»",
    m5: "Планировщик целей",
    m6: "Структура активов",
    m7: "Пенсия и семья",
    plan: "Ваш план",
  },

  instrument: {
    savings_account: "Сберегательный счёт",
    fdr_3m: "FDR на 3 месяца",
    fdr_1y: "FDR на 1 год",
    dps: "DPS",
    sanchayapatra_5y: "Государственный сберегательный сертификат",
    tbill_91d: "Казначейский вексель на 91 день",
    tbond_5y: "Казначейская облигация на 5 лет",
    tbond_10y: "Казначейская облигация на 10 лет",
    equity_fund: "Открытый фонд акций",
    gold: "Золото (слитки или монеты 22K)",
    loan_prepayment: "Досрочное погашение кредита",
    term_insurance: "Срочное страхование жизни",
  },

  /** Product names inside a sentence, when the country data has none (useProductName). */
  productProse: {
    savings_account: "сберегательный счёт",
    fdr_3m: "срочный вклад",
    fdr_1y: "срочный вклад",
    dps: "накопительный вклад",
    sanchayapatra_5y: "государственный сберегательный сертификат",
    tbill_91d: "казначейский вексель",
    tbond_5y: "государственная облигация",
    tbond_10y: "государственная облигация",
    equity_fund: "фонд акций",
    gold: "золото",
  },

  /** An instrument inside a sentence ("into {instrument}"); {product} is the country's product name. */
  instrumentInline: {
    savings_account: "{product}",
    fdr_3m: "{product} на 3 месяца",
    fdr_1y: "{product} на 1 год",
    dps: "{product}",
    sanchayapatra_5y: "{product}",
    tbill_91d: "{product} на 91 день",
    tbond_5y: "{product} на 5 лет",
    tbond_10y: "{product} на 10 лет",
    equity_fund: "открытый фонд акций",
    gold: "золото в слитках или монетах",
    loan_prepayment: "досрочное погашение кредита",
    term_insurance: "срочное страхование жизни",
  },

  unit: {
    month: "месяц",
    months: "мес.",
    year: "год",
    years: "г.",
    perMonth: "/мес.",
    perYear: "в год",
    taka: "৳",
    percent: "%",
  },

  offline: "Нет сети — используются сохранённые ставки",
  ratesVersion: "Ставки v{version}, {asOf}",
  mayBeOutdated: "Могут быть устаревшими",
  ourAssumption: "Наше допущение",
  ourSource: "Taka Plan (наше допущение)",
  source: "Источник",
  asOf: "На {date}",
  range: "Диапазон {low}–{high}",
  afterTax: "После налога",
  afterInflation: "С учётом инфляции",
  headline: "Номинальная ставка",

  disclaimer: {
    short:
      "Оценки только для обучения; это не финансовая, налоговая или юридическая консультация. Ставки меняются — уточните в банке или страховой компании, прежде чем действовать. Прошлая доходность не гарантирует будущей.",
    title: "Прежде чем начать",
    body:
      "Taka Plan даёт оценки только в учебных целях. Это не финансовая, налоговая или юридическая консультация, и приложение никогда не называет конкретный банк, фонд или страховую компанию. Ставки и налоговые правила меняются несколько раз в год, поэтому уточните в банке или страховой компании, прежде чем опираться на любую цифру отсюда. Прошлая доходность не гарантирует будущей. Ваши ответы остаются на телефоне.",
    accept: "Понятно",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "Выберите язык",
  },
  /** Header language menu button: {language} is the current language's own name. */
  languageMenu: "Язык: {language}",
  changeCountry: "Сменить страну",
  /** Header country link: {country} is the country code shown in the header. */
  countryLink: "Страна {country}. Сменить страну",

  incomeType: {
    salaried: "Работаю по найму",
    freelance: "Фрилансер",
    business: "Владелец бизнеса",
  },

  dependent: {
    none: "Никто",
    partner: "Супруг(а)",
    children: "Дети",
    parents: "Родители",
  },

  goalType: {
    general: "Общая",
    education: "Образование",
    health: "Здоровье",
    wedding: "Свадьба",
    vehicle: "Транспорт",
    home: "Жильё или земля",
    travel: "Путешествия",
  },

  loanType: {
    personal: "Потребительский кредит",
    home: "Ипотека",
    car: "Автокредит",
    education: "Образовательный кредит",
    other: "Другой кредит",
  },

  horizon: {
    short: "До 3 лет",
    medium: "От 3 до 5 лет",
    long: "Больше 5 лет",
  },

  explain: {
    title: "Почему такая сумма?",
    steps: "Как мы посчитали",
    assumptions: "Использованные ставки",
    notes: "Примечания",
    stale: "Срок пересмотра этой ставки прошёл",
  },

  /** "Start from the beginning" and the drafts it keeps (components/drafts). */
  drafts: {
    startOver: "Начать с начала",
    startOverHint: "Текущие ответы сохранятся как черновик.",
    confirmTitle: "Начать с начала?",
    confirmBody: "Текущие ответы сохранятся как черновик. Его можно открыть в любой момент в разделе «Ваши черновики».",
    confirm: "Да, начать заново",
    cancel: "Отмена",
    saved: "Сохранено как черновик",
    alreadySaved: "Уже сохранено как черновик",
    deleted: "Черновик удалён",
    title: "Ваши черновики",
    sectionTitle: "Ваши черновики ({count})",
    intro: "Ответы, сохранённые, когда вы начинали заново. Откройте любой, чтобы увидеть его план.",
    empty: "Черновиков пока нет. Когда вы начнёте с начала, текущие ответы сохранятся здесь.",
    seeAll: "Все черновики",
    backToPlan: "Назад к плану",
    updated: "Обновлено {date}",
    current: "Открыт сейчас",
    open: "Открыть",
    rename: "Переименовать",
    renameLabel: "Название черновика",
    renameHint: "Не больше {max} символов. Оставьте пустым, чтобы использовать название по умолчанию.",
    delete: "Удалить",
    deleteTitle: "Удалить черновик?",
    deleteBody: "Он будет удалён с этого телефона без возможности восстановления.",
    deleteConfirm: "Да, удалить",
    /** Shown before saving would push the oldest unnamed draft out (lib/store/drafts.ts capDrafts). */
    capWarning: "У вас уже {max} черновиков, поэтому самый старый без названия, «{label}», будет удалён. Дайте черновику название, чтобы сохранить его.",
    openTitle: "Открыть этот черновик?",
    openConfirm: "Да, открыть",
    label: {
      age: "Возраст {age}",
      takeHome: "{amount}/мес.",
      goalsOne: "Целей: {count}",
      goalsOther: "Целей: {count}",
      m2: "Страхование",
      m6: "Инвестиции",
      m7: "Пенсия",
    },
  },

  /** Banner under the header about the chosen country's data (components/layout/CountryNotice). */
  countryNotice: {
    noData: "У нас пока нет проверенных данных для страны {country}, поэтому суммы считаются по данным Бангладеш и в таках.",
    changeCountry: "Сменить страну",
    someFallback: "Часть данных для страны {country} — региональные оценки, а не собственные данные страны.",
    about: "Откуда берутся цифры",
  },
};
