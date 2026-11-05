/**
 * The English names people in Bangladesh know, for that country only (useProductName, TermSheet).
 * The English dictionary uses plain words that fit every country. The Bangla dictionary keeps these
 * names itself, so it has no file like this.
 */
export const bangladeshEn = {
  instrument: {
    fdr_3m: "3-month FDR",
    fdr_1y: "1-year FDR",
    dps: "DPS",
  },
  terms: {
    fdr: {
      title: "FDR (fixed deposit receipt)",
      body: "A lump sum you lock in a bank for a fixed term, from a few months to a few years, at a fixed rate. Cashing it early usually costs you the interest. Deposit insurance covers only a limited amount per bank.",
    },
    dps: {
      title: "DPS (deposit pension scheme)",
      body: "A monthly savings scheme at a bank: a fixed amount is auto-debited on the same day each month for a set number of years and paid back with interest at the end. It is the easiest way to save first, because the money leaves before you can spend it.",
    },
    sanchayapatra: {
      title: "Sanchayapatra (national savings certificate)",
      body: "A government savings certificate sold through banks and post offices, usually for three or five years, with a rate the government reviews twice a year. It pays more than bank deposits but pays less if you cash it in early, and there are limits on how much one person may hold.",
    },
    bo_account: {
      title: "BO account",
      body: "A beneficiary owner account with a brokerage, needed to buy or hold shares, mutual fund units or bonds listed on the stock exchange. Opening one needs your NID, a bank account and a small fee.",
    },
    cib: {
      title: "CIB report",
      body: "Bangladesh Bank's credit record on every borrower, which lenders check before approving a loan or card. Late or missed payments stay on it and make future borrowing harder or more expensive.",
    },
    tbill: {
      title: "Treasury bill",
      body: "A short-term government IOU, sold at auction for 91, 182 or 364 days. You buy it below face value and receive the full amount at maturity; the difference is your return. Backed by the government, so very safe.",
    },
    tbond: {
      title: "Treasury bond",
      body: "A longer-term government IOU, from two to twenty years, that pays interest twice a year. Bought at Bangladesh Bank auctions through a bank or on the stock exchange through a BO account.",
    },
    ladder: {
      title: "FDR ladder",
      body: "Instead of one big FDR, you open several smaller ones a month apart. Then one matures every month, so you can always reach some cash soon without breaking a deposit early.",
    },
    real_return: {
      title: "Real return",
      body: "What your money gains in buying power after tax and inflation. An FDR paying a high headline rate can still have a negative real return if prices rise faster than the interest you keep.",
    },
  },
} as const;
