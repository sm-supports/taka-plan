/**
 * `?demo=1` fixture for the M3 page while `computeDebtHealth` is still a stub.
 * Numbers follow the engine contract (docs/ARCHITECTURE-CONTRACTS.md §M3) so the view can be
 * checked end to end; every rate is read from the snapshot. Delete once the engine lands.
 */
import {
  createExplain,
  roundDecimals,
  roundMoney,
  type DebtFlag,
  type DebtSummary,
  type ISODate,
  type M3Input,
  type M3Result,
  type PayoffPlan,
  type RatesSnapshot,
} from "@taka/engine";

export const DEMO_M3_INPUT: M3Input = {
  takeHome: 70000,
  essentials: 25000,
  savingsTarget: 7000,
  loans: [
    { id: "demo-l1", type: "personal", outstanding: 500000, annualRate: 0.14, emi: 17100, monthsLeft: 36 },
    { id: "demo-l2", type: "car", outstanding: 300000, annualRate: 0.1, emi: 9700, monthsLeft: 36 },
  ],
  cards: [{ id: "demo-c1", balance: 60000, limit: 100000, paysInFull: false }],
};

function emi(principal: number, annualRate: number, months: number): number {
  const rm = annualRate / 12;
  if (rm === 0) return principal / months;
  return (principal * rm) / (1 - (1 + rm) ** -months);
}

function maxLoan(capacity: number, annualRate: number, months: number): number {
  const rm = annualRate / 12;
  if (rm === 0) return capacity * months;
  return (capacity * (1 - (1 + rm) ** -months)) / rm;
}

function simulate(debts: DebtSummary[], extra: number, strategy: "avalanche" | "snowball"): PayoffPlan {
  const bal = new Map(debts.map((d) => [d.id, d.balance]));
  const order: string[] = [];
  let totalInterest = 0;
  let months = 0;
  while ([...bal.values()].some((b) => b > 0.5) && months < 600) {
    months += 1;
    let budget = extra;
    for (const d of debts) {
      const b = bal.get(d.id) ?? 0;
      if (b <= 0.5) {
        budget += d.minPayment;
        continue;
      }
      const interest = (b * d.annualRate) / 12;
      totalInterest += interest;
      const pay = Math.min(b + interest, d.minPayment);
      bal.set(d.id, b + interest - pay);
    }
    const open = debts.filter((d) => (bal.get(d.id) ?? 0) > 0.5);
    open.sort((a, b) => (strategy === "avalanche" ? b.annualRate - a.annualRate : (bal.get(a.id) ?? 0) - (bal.get(b.id) ?? 0)));
    for (const d of open) {
      if (budget <= 0) break;
      const b = bal.get(d.id) ?? 0;
      const pay = Math.min(b, budget);
      bal.set(d.id, b - pay);
      budget -= pay;
    }
    for (const d of debts) if ((bal.get(d.id) ?? 0) <= 0.5 && !order.includes(d.id)) order.push(d.id);
  }
  return { order, months, totalInterest: roundMoney(totalInterest, "interest") };
}

export function buildDemoM3Result(input: M3Input, s: RatesSnapshot, today: ISODate): M3Result {
  const x = createExplain(s, today);
  const bufferShare = x.use("cash_buffer_share");
  const cardMinShare = x.use("card_min_payment_share");
  const emiRatioRed = x.use("emi_ratio_red");
  const utilAmber = x.use("card_utilisation_amber");
  const highThreshold = x.use("high_interest_debt_threshold");
  const cardCap = x.use("credit_card_rate_cap");
  const scenarioRate = input.scenario?.annualRate ?? x.use("personal_loan_rate_default");
  const scenarioMonths = input.scenario?.months ?? 60;

  const buffer = input.cashBuffer ?? input.takeHome * bufferShare;
  const emis = input.loans.reduce((a, l) => a + l.emi, 0);
  const carried = input.cards.filter((c) => !c.paysInFull);
  const cardMinimums = carried.reduce((a, c) => a + c.balance * cardMinShare, 0);
  const totalEmiRaw = emis + cardMinimums;
  const totalEmi = x.step({ id: "m3.totalEmi", inputs: { emis, cardMinimums }, raw: totalEmiRaw, rounded: roundMoney(totalEmiRaw, "exact"), unit: "bdt" });
  const ratioRaw = input.takeHome > 0 ? totalEmiRaw / input.takeHome : 0;
  const emiRatio = x.step({ id: "m3.emiRatio", inputs: { totalEmi: totalEmiRaw, takeHome: input.takeHome }, raw: ratioRaw, rounded: roundDecimals(ratioRaw, 3), unit: "rate" });
  const capRaw = input.takeHome - input.savingsTarget - input.essentials - buffer;
  const emiCapacity = x.step({
    id: "m3.capacity",
    inputs: { takeHome: input.takeHome, savings: input.savingsTarget, essentials: input.essentials, buffer },
    raw: capRaw,
    rounded: roundMoney(Math.max(0, capRaw), "monthly"),
    unit: "bdt",
  });
  const headroomRaw = Math.max(0, capRaw - totalEmiRaw);
  const headroom = roundMoney(headroomRaw, "monthly");
  const maxRaw = maxLoan(headroomRaw, scenarioRate, scenarioMonths);
  const maxAffordableLoan = x.step({
    id: "m3.maxLoan",
    inputs: { capacity: headroomRaw, monthlyRate: scenarioRate / 12, months: scenarioMonths },
    raw: maxRaw,
    rounded: roundMoney(maxRaw, "lump"),
    unit: "bdt",
  });
  const scenEmiRaw = emi(maxAffordableLoan, scenarioRate, scenarioMonths);
  const scenarioEmi = x.step({
    id: "m3.scenarioEmi",
    inputs: { principal: maxAffordableLoan, monthlyRate: scenarioRate / 12, months: scenarioMonths },
    raw: scenEmiRaw,
    rounded: roundMoney(scenEmiRaw, "monthly"),
    unit: "bdt",
  });

  const flags: DebtFlag[] = [];
  for (const c of carried) flags.push({ id: "card_carried", status: "red", ref: c.id, value: c.balance, demotedFromRed: false });
  for (const c of input.cards) {
    const util = c.limit > 0 ? c.balance / c.limit : 0;
    if (util > utilAmber) flags.push({ id: "card_utilisation", status: "amber", ref: c.id, value: util, demotedFromRed: false });
  }
  if (ratioRaw > emiRatioRed) flags.push({ id: "emi_ratio", status: "red", value: ratioRaw, demotedFromRed: false });
  if (capRaw < 0) flags.push({ id: "negative_capacity", status: "red", value: capRaw, demotedFromRed: false });
  const severity: Record<DebtFlag["id"], number> = { card_carried: 0, emi_ratio: 1, negative_capacity: 2, card_utilisation: 3 };
  const reds = flags.filter((f) => f.status === "red").sort((a, b) => severity[a.id] - severity[b.id]);
  const primaryFlag = reds[0] ?? null;
  for (const f of reds) if (f !== primaryFlag) Object.assign(f, { status: "amber", demotedFromRed: true });
  const status = primaryFlag ? "red" : flags.length > 0 ? "amber" : "green";

  const debts: DebtSummary[] = [
    ...input.loans.map((l) => ({ id: l.id, kind: "loan" as const, balance: l.outstanding, annualRate: l.annualRate, minPayment: l.emi })),
    ...carried.map((c) => ({ id: c.id, kind: "card" as const, balance: c.balance, annualRate: c.annualRate ?? cardCap, minPayment: c.balance * cardMinShare })),
  ];
  const extra = input.extraMonthly ?? headroomRaw;
  const avalanche = simulate(debts, extra, "avalanche");
  const snowball = simulate(debts, extra, "snowball");
  const savedRaw = Math.max(0, snowball.totalInterest - avalanche.totalInterest);
  const interestSaved = x.step({
    id: "m3.interestSaved",
    inputs: { snowballInterest: snowball.totalInterest, avalancheInterest: avalanche.totalInterest },
    raw: savedRaw,
    rounded: roundMoney(savedRaw, "interest"),
    unit: "bdt",
  });

  return {
    totalEmi,
    emiRatio,
    emiCapacity,
    headroom,
    maxAffordableLoan,
    scenario: { annualRate: scenarioRate, months: scenarioMonths, emi: scenarioEmi },
    flags,
    primaryFlag,
    status,
    highInterestDebts: debts.filter((d) => d.annualRate > highThreshold),
    avalanche,
    snowball,
    interestSaved,
    debtTrapPath: ["m3.path.listLoans", "m3.path.tellFamily", "m3.path.stopBorrowing", "m3.path.sellUnaffordable", "m3.path.refinanceCheaper"],
    explain: x.done(),
  };
}
