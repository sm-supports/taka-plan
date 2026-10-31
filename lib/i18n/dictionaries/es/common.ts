/*
 * Spanish (neutral international Spanish), "tú" register throughout.
 *
 * Glossary (English → Spanish), kept consistent across every es/*.ts file:
 *   take-home                  → ingreso neto
 *   essentials                 → gastos esenciales
 *   emergency fund             → fondo de emergencia
 *   savings account            → cuenta de ahorro
 *   fixed deposit / term dep.  → depósito a plazo fijo / depósito a plazo
 *   FDR, DPS, Sanchayapatra    → kept as proper names (Bangladesh products)
 *   FDR ladder                 → escalera de FDR
 *   recurring deposit          → ahorro programado
 *   gov. savings certificate   → certificado de ahorro del Estado
 *   treasury bill / bond       → letra del Tesoro / bono del Tesoro
 *   government bond            → bono del Estado
 *   equity / shares            → renta variable / acciones
 *   fixed income               → renta fija
 *   open-end equity fund       → fondo abierto de renta variable
 *   EMI                        → cuota (mensual)
 *   interest rate              → tasa de interés
 *   headline rate              → tasa nominal
 *   return / real return       → rentabilidad / rentabilidad real
 *   term life insurance        → seguro de vida a término
 *   sum insured / sum assured  → suma asegurada / capital asegurado
 *   premium                    → prima
 *   surrender value            → valor de rescate
 *   endowment policy           → seguro dotal (póliza con ahorro)
 *   cover (insurance)          → cobertura
 *   waiting period             → período de carencia
 *   high-interest debt         → deuda con interés alto
 *   inflation                  → inflación
 *   hedge (gold)               → protección
 *   profit (savings cert.)     → rendimiento
 *   deposit insurance          → seguro de depósitos
 *   grace period               → período de gracia
 *   provident fund             → fondo de previsión
 *   gratuity                   → indemnización por antigüedad
 *   old-age allowance          → subsidio de vejez
 *   annuity                    → renta vitalicia
 *   lump sum                   → suma única
 *   asset mix                  → mezcla de activos
 *   rebalance                  → rebalancear
 *   net worth                  → patrimonio neto
 *   BO account                 → cuenta BO
 *   brokerage                  → casa de bolsa
 *   central bank               → banco central
 */
import type { Dictionary } from "../../types";

export const common: Dictionary["common"] = {
  appName: "Taka Plan",
  tagline: "Cuánto necesitas para cada meta y dónde ponerlo cada mes.",
  loading: "Cargando…",
  yes: "Sí",
  no: "No",
  optional: "Opcional",

  nav: {
    home: "Inicio",
    plan: "Mi plan",
    calculators: "Calculadoras",
    admin: "Admin. de tasas",
    language: "Idioma",
  },

  button: {
    next: "Siguiente",
    back: "Atrás",
    seePlan: "Ver mi plan",
    whyThisNumber: "¿Por qué esta cifra?",
    why: "¿Por qué?",
    close: "Cerrar",
    edit: "Editar",
    save: "Guardar",
    cancel: "Cancelar",
    reset: "Empezar de nuevo",
    tryAgain: "Reintentar",
    learnMore: "Más información",
    add: "Añadir",
    remove: "Quitar",
    done: "Listo",
    skip: "Omitir",
    openCalculator: "Abrir calculadora",
  },

  status: {
    red: "Requiere atención ya",
    amber: "Vigílalo",
    green: "Vas bien",
  },
  alsoNeedsAttention: "También requiere atención",

  module: {
    m1: "Fondo de emergencia",
    m2: "Seguros y salud",
    m3: "Revisión de deudas",
    m4: "Presupuesto con ahorro primero",
    m5: "Planificador de metas",
    m6: "Mezcla de activos",
    m7: "Jubilación y familia",
    plan: "Tu plan",
  },

  instrument: {
    savings_account: "Cuenta de ahorro",
    fdr_3m: "FDR a 3 meses",
    fdr_1y: "FDR a 1 año",
    dps: "DPS",
    sanchayapatra_5y: "Certificado de ahorro del Estado",
    tbill_91d: "Letra del Tesoro a 91 días",
    tbond_5y: "Bono del Tesoro a 5 años",
    tbond_10y: "Bono del Tesoro a 10 años",
    equity_fund: "Fondo abierto de renta variable",
    gold: "Oro (lingotes o monedas de 22K)",
    loan_prepayment: "Pago extra del préstamo",
    term_insurance: "Seguro de vida a término",
  },

  /** Product names inside a sentence, when the country data has none (useProductName). */
  productProse: {
    savings_account: "cuenta de ahorro",
    fdr_3m: "depósito a plazo fijo",
    fdr_1y: "depósito a plazo fijo",
    dps: "ahorro programado",
    sanchayapatra_5y: "certificado de ahorro del Estado",
    tbill_91d: "letra del Tesoro",
    tbond_5y: "bono del Estado",
    tbond_10y: "bono del Estado",
    equity_fund: "fondo de renta variable",
    gold: "oro",
  },

  /** An instrument inside a sentence ("into {instrument}"); {product} is the country's product name. */
  instrumentInline: {
    savings_account: "{product}",
    fdr_3m: "{product} a 3 meses",
    fdr_1y: "{product} a 1 año",
    dps: "{product}",
    sanchayapatra_5y: "{product}",
    tbill_91d: "{product} a 91 días",
    tbond_5y: "{product} a 5 años",
    tbond_10y: "{product} a 10 años",
    equity_fund: "un fondo abierto de renta variable",
    gold: "lingotes o monedas de oro",
    loan_prepayment: "pagos extra del préstamo",
    term_insurance: "un seguro de vida a término",
  },

  unit: {
    month: "mes",
    months: "meses",
    year: "año",
    years: "años",
    perMonth: "/mes",
    perYear: "al año",
    taka: "৳",
    percent: "%",
  },

  offline: "Sin conexión: usando tasas guardadas",
  ratesVersion: "Tasas v{version}, {asOf}",
  mayBeOutdated: "Puede estar desactualizado",
  ourAssumption: "Nuestro supuesto",
  ourSource: "Taka Plan (nuestro supuesto)",
  source: "Fuente",
  asOf: "Al {date}",
  range: "Rango {low}–{high}",
  afterTax: "Después de impuestos",
  afterInflation: "Después de inflación",
  headline: "Tasa nominal",

  disclaimer: {
    short:
      "Estimaciones solo con fines educativos; no es asesoría financiera, fiscal ni legal. Las tasas cambian: consulta con tu banco o aseguradora antes de actuar. Las rentabilidades pasadas no predicen las futuras.",
    title: "Antes de empezar",
    body:
      "Taka Plan ofrece estimaciones solo con fines educativos. No es asesoría financiera, fiscal ni legal, y nunca recomienda un banco, fondo o aseguradora. Las tasas y las normas fiscales cambian varias veces al año, así que consulta con tu banco o aseguradora antes de actuar según cualquier cifra de aquí. Las rentabilidades pasadas no predicen las futuras. Tus respuestas se quedan en tu teléfono, salvo que decidas guardar un plan.",
    accept: "Entendido",
  },

  language: {
    bn: "বাংলা",
    en: "English",
    pick: "Elige el idioma",
  },
  /** Header language menu button: {language} is the current language's own name. */
  languageMenu: "Idioma: {language}",
  changeCountry: "Cambiar de país",
  /** Header country link: {country} is the country code shown in the header. */
  countryLink: "País {country}. Cambiar de país",

  incomeType: {
    salaried: "Asalariado",
    freelance: "Independiente",
    business: "Dueño de negocio",
  },

  dependent: {
    none: "Nadie",
    partner: "Pareja",
    children: "Hijos",
    parents: "Padres",
  },

  goalType: {
    general: "General",
    education: "Educación",
    health: "Salud",
    wedding: "Boda",
    vehicle: "Vehículo",
    home: "Vivienda o terreno",
    travel: "Viajes",
  },

  loanType: {
    personal: "Préstamo personal",
    home: "Préstamo hipotecario",
    car: "Préstamo de auto",
    education: "Préstamo educativo",
    other: "Otro préstamo",
  },

  horizon: {
    short: "Menos de 3 años",
    medium: "De 3 a 5 años",
    long: "Más de 5 años",
  },

  explain: {
    title: "¿Por qué esta cifra?",
    steps: "Cómo llegamos aquí",
    assumptions: "Tasas usadas",
    notes: "Notas",
    stale: "Esta tasa ya pasó su fecha de revisión",
  },

  /** "Start from the beginning" and the drafts it keeps (components/drafts). */
  drafts: {
    startOver: "Empezar desde el principio",
    startOverHint: "Tus respuestas actuales se guardan como borrador.",
    confirmTitle: "¿Empezar desde el principio?",
    confirmBody: "Tus respuestas actuales se guardan como borrador. Puedes volver a abrirlo cuando quieras desde Tus borradores.",
    confirm: "Sí, empezar de nuevo",
    cancel: "Cancelar",
    saved: "Guardado como borrador",
    alreadySaved: "Ya está guardado como borrador",
    deleted: "Borrador eliminado",
    title: "Tus borradores",
    sectionTitle: "Tus borradores ({count})",
    intro: "Respuestas que guardaste al empezar de nuevo. Abre una para ver su plan.",
    empty: "Aún no hay borradores. Cuando empiezas desde el principio, tus respuestas actuales se guardan aquí.",
    seeAll: "Ver todos los borradores",
    backToPlan: "Volver a mi plan",
    updated: "Actualizado el {date}",
    current: "Abierto ahora",
    open: "Abrir",
    rename: "Renombrar",
    renameLabel: "Nombre del borrador",
    renameHint: "Hasta {max} letras. Déjalo vacío para usar el nombre automático.",
    delete: "Eliminar",
    deleteTitle: "¿Eliminar este borrador?",
    deleteBody: "Se borra de este teléfono y no se puede recuperar.",
    deleteConfirm: "Sí, eliminar",
    /** Shown before saving would push the oldest unnamed draft out (lib/store/drafts.ts capDrafts). */
    capWarning: "Ya tienes {max} borradores, así que se eliminará el más antiguo sin nombre, “{label}”. Ponle nombre a un borrador para conservarlo.",
    openTitle: "¿Abrir este borrador?",
    openConfirm: "Sí, abrirlo",
    label: {
      age: "{age} años",
      takeHome: "{amount}/mes",
      goalsOne: "{count} meta",
      goalsOther: "{count} metas",
      m2: "Seguros",
      m6: "Inversiones",
      m7: "Jubilación",
    },
  },

  /** Banner under the header about the chosen country's data (components/layout/CountryNotice). */
  countryNotice: {
    noData: "Aún no tenemos cifras investigadas para {country}, así que los montos usan las cifras de Bangladés y el taka.",
    changeCountry: "Cambiar de país",
    someFallback: "Algunas cifras de {country} son estimaciones regionales, no propias del país.",
    about: "De dónde salen las cifras",
  },
};
