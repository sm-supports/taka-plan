/**
 * /{locale}/about: title, lead, methodology and the sources-table chrome. Every number that
 * comes from the rates table is a `{placeholder}` filled at render time; literal digits appear
 * only inside fixed names such as the fiscal year. Row labels come from the rates row itself.
 */
export const about = {
  title: "About Taka Plan",
  lead: "A free calculator that tells a Bangladeshi earner how much each goal needs and where to put the money every month. It teaches and calculates; you act through your own bank, BO account or insurer.",
  disclaimer: { heading: "Disclaimer" },
  method: {
    heading: "How the plan is built",
    intro: "The plan follows seven steps in a fixed order: protect first, then save, then grow. Each step is one small calculator, and together they feed a single monthly amount.",
    phase: { protect: "Protect", save: "Save", grow: "Grow" },
    order:
      "Your monthly amount is filled in priority order: the emergency fund first, then insurance premiums, then any expensive debt, and only then goals and retirement. Until the emergency fund is full at least {share} of the monthly amount goes to it, so the rest still starts your investing habit today.",
    returnsHeading: "Returns after tax and after inflation",
    returns:
      "Every return is shown twice trimmed: first after the tax deducted at source, then after inflation. The headline rate is not the question; what you keep, and what it will still buy, is. An instrument can pay interest and still lose to inflation, and the app says so in red when it does.",
    exampleCaption: "With today's rates table:",
    rounding: "Results are rounded to a nearby round figure because a twenty-year projection is never exact to the taka. Ranges (low, expected, high) are shown where the future return is uncertain.",
    onDevice: "All maths runs on your phone. The server only keeps the rates table and, if you choose to sign in, your saved plan.",
  },
  sources: {
    heading: "Sources and assumptions",
    intro: "Every row below is one assumption the calculators read. Rates version {version}, published {date}. Rows tagged “our assumption” are defaults we chose and can change; the rest are copied from the published source linked beside each one.",
    group: {
      macro: "Inflation and policy rate",
      bank: "Bank deposits",
      sanchayapatra: "Sanchayapatra",
      govt: "Government securities",
      market: "Equity and gold",
      risk: "Credit, insurance and longevity",
      tax: "Tax rules (FY2026-27)",
      policy: "App policy defaults",
      other: "Other",
    },
    value: "Value",
    dates: "Dates",
    nextReview: "Next review",
    note: "Note",
    slabNext: "{rate} on the next {width}",
    slabRest: "{rate} on the rest",
    unverifiedHeading: "Not yet verified",
    unverifiedIntro: "We have not been able to confirm these, so no calculator relies on them yet:",
    unverified: [
      "Current term-life premiums for ten-lakh and one-crore cover.",
      "Sanchayapatra investment ceilings for 2026.",
      "Whether the reduced tax for small Sanchayapatra investors survived the Finance Act.",
      "A Bangladesh Bank EMI-to-income ratio (none appears to exist; we use our own threshold).",
      "Market-wide personal and home loan rates.",
    ],
  },
} as const;
