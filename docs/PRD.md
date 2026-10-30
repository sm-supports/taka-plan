# Taka Plan — Personal Finance App PRD (Bangladesh)

Oct 30, 2026 · @Sajat

## Overview

Taka Plan (working name) is a free, mobile-first web app that tells a Bangladeshi earner, in under five minutes, how much money they need for each financial goal and where to put it each month. It follows the seven-step order of Zerodha Varsity's *Personal Finance for Beginners* series, rebuilt for Bangladeshi products, rates and tax rules.

**Problem.** Most Bangladeshi personal-finance content is either Indian (wrong products, wrong taxes) or product marketing from banks and insurers. People default to Sanchayapatra, DPS and gold without knowing how much they need, in what order, or why. Nothing local answers "I earn ৳X, what do I do with it?" in one screen.

**Target users.**

| Segment | Example | What they need first |
| --- | --- | --- |
| First-job salaried, 22–30 | ৳35,000–80,000 take-home, no savings habit | Emergency fund target, a monthly savings number |
| Freelancers and self-employed | Irregular USD income, no employer PF or insurance | Bigger emergency buffer, health cover, retirement plan |
| Young families, 28–40 | One or two earners, kids, parents to support | Life and health cover amounts, debt check, goal plans |
| Overloaded borrowers | Several loans or a revolving credit card | Debt-payoff order and an EMI-capacity check |

**Goals.**

1. One plan screen: a single monthly amount split across buckets, with the instrument for each.
2. Every number explained in one tap: the formula, the assumption and its source date.
3. Works in Bangla and English, on a cheap Android phone and a slow connection.
4. No sign-up needed to get a plan.

**Non-goals (v1).** No buying or selling of products, no brokerage, no account linking, no stock or fund picks by name, no personalised investment advice. The app teaches and calculates; the user acts through their own bank, BO account or insurer.

## Source material: the seven episodes

The series' order is the product's order: protect first (emergency fund, insurance, debt), then save, then grow (goals, allocation, retirement). The principles transfer to Bangladesh; about half the named products do not exist here. Summaries below are paraphrased from the episode transcripts, presented by Karthik Rangappa ([playlist](https://www.youtube.com/playlist?list=PLX2SHiKfualHj_3Ms2t8cCd9tUpQHA9MW)).

| # | Episode | Core lesson | What changes for Bangladesh |
| --- | --- | --- | --- |
| 1 | [Emergency fund](https://www.youtube.com/watch?v=vO2KGm8NM8E) | Size it to your family, not a fixed 6 months (6, 10, even 15 months is fine). Build it monthly or carve it out of existing savings. Keep it in low-volatility, fast-access places, never stocks. A credit card's interest-free period can bridge a 1–2 day withdrawal delay. Refill it after use; a holiday is not an emergency. | Liquid and arbitrage funds don't exist here; a few open-end fixed-income funds redeem in about 3 working days. Default to a savings account plus short FDRs. Sanchayapatra breaks early at a penalty, so it is a poor first layer. |
| 2 | [Life and health insurance](https://www.youtube.com/watch?v=FTipNuw9q5U) | Two covers: term life (if anyone depends on your income) and health (everyone, bought young). Never mix insurance with investment. Term cover to about 60, not 99. Add a critical-illness rider. Disclose your health honestly. Pick the insurer before the policy; read exclusions and waiting periods. | Savings-style endowment policies dominate sales; pure term is less common. Several life insurers have failed to pay claims, so insurer reliability is the first filter. Retail health insurance is thin, so the emergency fund carries more medical risk. |
| 3 | [Debt trap](https://www.youtube.com/watch?v=fG4Y_lw9qZw) | Don't borrow for lifestyle. Card debt is the most expensive money there is. To escape: tell your family, list every loan by rate, pay the costliest first, sell what you couldn't afford, refinance cheaper. A card used well: pay in full inside the grace period, self-cap at about half the limit. Affordable EMI = take-home minus savings, expenses and a cash buffer. | Same rules. Bangladesh Bank caps card rates and sets grace-period norms (current figures in the next section). CIB reports matter for future loans. |
| 4 | [Saving early](https://www.youtube.com/watch?v=NVBCKPNqH8o) | Flip the equation: income − savings = expenses. Save first on payday. Start now with any amount; the habit matters more than the size. Don't let choosing an instrument stop you; a plain savings account or FD is fine at first. | Unchanged. DPS is the natural local "save first" tool, since it auto-debits monthly. |
| 5 | [Wealth creation](https://www.youtube.com/watch?v=7n09a37zA9M) | A real goal has an amount, a horizon and your current age. Everyone has at least one: retirement. Long-term wealth needs some equity and 10–20 years. Start with a monthly plan in a large-cap fund, and don't check it daily or stop when markets fall. | Bangladesh's equity market is smaller and more volatile, with fewer good fund choices. Sanchayapatra and T-bonds pay high nominal rates, so the app must compare growth against inflation, not just against zero. |
| 6 | [Asset allocation](https://www.youtube.com/watch?v=LTe0xl8LZuA) | Four asset classes: equity, bonds, gold, real estate. If unsure, split equally. The young can go up to about 70% equity; shift toward bonds with age. Rebalance once a year. | No Sovereign Gold Bonds and no REITs. Gold means physical jewellery or bars; real estate means land or flats, which are lumpy and illiquid. Bonds mean Sanchayapatra, T-bills/bonds, FDR. |
| 7 | [Longevity risk](https://www.youtube.com/watch?v=-BU8hyY-ZXk) | Plan to live to 100, not 80. Don't count on children or the state. For money you won't touch for decades, use a broad index fund and add to it regularly. | Bangladesh has no broad, low-cost index fund comparable to a Nifty 50 fund. The Universal Pension Scheme is the closest long-horizon local vehicle; its terms and track record need checking. |

**One correction to the source.** Episode 3's worked example says a ৳20,000-a-month EMI supports about 8 lakh at 12% over 5 years. The standard EMI formula gives about 9.0 lakh (8 lakh at those terms is about ৳17,800 a month). The video's figure is a safe round-down; the app should show the exact formula result and let the user add a safety margin.

## Bangladesh financial landscape (as of 30 Oct 2026)

After 10% source tax and 8.34% inflation, only Sanchayapatra pays a clearly positive real return today; FDRs, DPS and T-bills roughly break even or lose purchasing power. That one fact shapes the app: it must always show returns after tax and after inflation, not the headline rate.

&#91;embedded content: Bank rate sheets (Jun–Sep 2026), Directorate of National Savings (Jul–Dec 2026), Bangladesh Bank auctions (Oct 2026), BBS inflation (Sep 2026)\]

Each bar is what one taka gains or loses in buying power per year, using the app defaults in the table below. Hover a bar for its headline and after-tax rate.

### Rates and assumptions table (launch values)

These are the starting rows for the admin rates table. Ranges come from individual bank rate sheets; the app default is a mid-point we chose and can change.

| Key | Current value | App default | As of | Source |
| --- | --- | --- | --- | --- |
| Inflation (CPI, point-to-point) | 8.34% (food 7.22%, non-food 9.30%) | 8% for projections | Sep 2026 | [UNB / BBS](https://unb.com.bd/category/Business/food-inflation-rises-pushes-up-overall-inflation-in-september/197246) |
| Bangladesh Bank policy rate | 9.50% | — | 30 Sep 2026 | [UNB](https://unb.com.bd/category/Business/bb-unveils-first-quarterly-monetary-policy-keeps-policy-rate-unchanged-at-95/196649) |
| Savings account | 1.25–3% | 2% | Sep 2026 | Bank Asia, Southeast, NRB rate sheets |
| FDR, 3 months | 6.25–8% | 7% | Jun–Sep 2026 | [Southeast Bank](https://southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf), [Bank Asia](https://bankasia-bd.com/other/charges), [NRB Bank](https://www.nrbbankbd.com/wp-content/uploads/2026/06/Interest-Rate-on-Deposit-Products-effective-from-7th-June-2026-NRB.pdf) |
| FDR, 1 year | 6.75–8.25% | 7.5% | Jun–Sep 2026 | same |
| DPS (monthly scheme) | 8.25–10.5% | 9% | Jun–Sep 2026 | same |
| Bank deposit average (all banks) | 6.16% | — | Aug 2026 | [Bangladesh Bank](https://www.bb.org.bd/en/index.php/econdata/intrate) |
| Bangladesh Sanchayapatra, 5-yr | 11.83% (≤ ৳7.5 lakh held), 11.80% above | 11.83% | Jul–Dec 2026 | [Financial Express](https://thefinancialexpress.com.bd/home/bangladesh-keeps-national-savings-certificate-interest-rates-unchanged-for-jul-dec) |
| Paribar Sanchayapatra, 5-yr | 11.93% / 11.80% | 11.93% | Jul–Dec 2026 | same |
| Pensioner Sanchayapatra, 5-yr | 11.98% / 11.80% | 11.98% | Jul–Dec 2026 | [TBS, Jul 2025 table](https://www.tbsnews.net/economy/interest-rates-reduced-all-types-savings-instruments-1178261) |
| 3-month profit Sanchayapatra, 3-yr | 11.82% / 11.77% | 11.82% | Jul–Dec 2026 | [Financial Express](https://thefinancialexpress.com.bd/home/bangladesh-keeps-national-savings-certificate-interest-rates-unchanged-for-jul-dec) |
| 91-day T-bill | 8.56% | 8.5% | 26 Oct 2026 | [Bangladesh Bank auctions](https://www.bb.org.bd/en/index.php/monetaryactivity/treasury) |
| 5-yr T-bond | 8.47% | 8.5% | 14 Oct 2026 | same |
| 10-yr T-bond | 9.27% | 9.25% | 25 Oct 2026 | same |
| Equity (DSEX, price only) | +1.45% a year over 10 years; −26% from the Sep 2021 peak | Low 2% / base 9% / high 14% (our assumption) | 29 Oct 2026 | [DSE](https://www.dse.com.bd/), [Dhaka Tribune, Oct 2016](https://www.dhakatribune.com/business/stock/8119/stocks-end-flat-for-2nd-day) |
| Gold, 22K per bhori | ৳2,20,858 (+122% in 3 years, −16% from Jan 2026 peak) | Base = inflation (our assumption) | 25 Oct 2026 | [Financial Express / BAJUS](https://thefinancialexpress.com.bd/trade/gold-prices-cut-by-tk-3324-per-bhori-in-bangladesh) |
| Credit card interest cap | 25% a year, on the unpaid balance only | 25% | 15 Mar 2026 | [UNB](https://unb.com.bd/category/Business/bangladesh-bank-raises-credit-card-loan-limit-to-tk-40-lakh/181670) |
| Deposit insurance | ৳2 lakh per depositor, per bank | ৳2 lakh | 10 Apr 2026 | [BSS](https://www.bssnews.net/js-session/376349) |
| Life-insurer claim settlement | 57%, ৳70 bn unpaid | — | Jun 2026 | [Financial Express](https://thefinancialexpress.com.bd/stock/idra-targets-75pc-claim-settlement-rate-amid-tk-70b-backlog) |
| Out-of-pocket share of health spending | 79.3% | — | 2023 | World Bank WDI (secondary source) |
| Life expectancy at birth | 72.3 years (men 70.8, women 73.8) | Plan to 100 anyway | SVRS 2023 | [Prothom Alo / BBS](https://en.prothomalo.com/bangladesh/cqjsjk3buz) |

### Tax rules that change the math (FY2026-27)

| Rule | Value | Source |
| --- | --- | --- |
| Tax-free income, general | ৳4,00,000 | [UNB, 29 Jun 2026](https://unb.com.bd/category/bangladesh/parliament-passes-finance-bill-tax-free-threshold-set-at-tk-4-lakh-for-next-year/189471) |
| Tax-free income, women and 65+ | ৳4,50,000 (PwC); ৳4,25,000 in the bill — confirm | [PwC summary](https://www.pwc.com/bd/en/assets/pdfs/budget/finance-act-2026-key-amendments.pdf) |
| Slabs above the threshold | 10% on next ৳3 lakh, 15% next ৳4 lakh, 20% next ৳5 lakh, 25% next ৳20 lakh, 30% on the rest | [PwC Tax Summaries](https://taxsummaries.pwc.com/bangladesh/individual/taxes-on-personal-income) |
| Minimum tax | ৳5,000 (৳1,000 for new taxpayers) | same |
| Investment rebate | Lowest of: 3% of taxable income, 10% of eligible investment, ৳7.5 lakh | [Daily Star, 16 Jun 2026](https://www.thedailystar.net/business/economy/news/new-tax-regime-may-hit-middle-class-hardest-4199691) |
| Rebate-eligible | Life premiums, DPS up to ৳1.2 lakh a year, Sanchayapatra and govt securities up to ৳5 lakh, listed shares, mutual funds, recognised PF | [Prothom Alo, 19 Jun 2026](https://en.prothomalo.com/business/local/b5wzpvxzdz) |
| Tax on Sanchayapatra profit | 10%, now an advance tax adjustable on the return | [Observer, 11 Jul 2026](https://observerbd.com/news/582881) |
| Tax on bank interest | 10%; 15% without proof of return filing (inferred from the 1.5× rule) | [TRW, 20 Oct 2026](https://trw.co/withholding-tax-bangladesh/) |
| Proof of return needed | Deposits or Sanchayapatra above ৳10 lakh (one source still says ৳5 lakh) | [Daily Star, Jun 2025](https://www.thedailystar.net/business/news/where-will-you-still-need-submit-proof-tax-return-filing-3914716) |

### What the numbers mean for the product

- **The "FD for safety" advice still holds, but it isn't growth.** A 1-year FDR at 7.5% nets 6.75% after tax, about −1.5% a year in real terms. Fine for an emergency fund, wrong for a 10-year goal.
- **Sanchayapatra is the strongest safe option today** at about +2.1% real after tax, but its rate is reviewed every six months and it pays only 9.7% if cashed in year 1. Investment caps (৳30–50 lakh per scheme) come from 2020 sources and need confirming.
- **The series' equity case is weak on Bangladeshi data.** DSEX price growth averaged 1.45% a year over 10 years, far below T-bills. Dividends are excluded and not found, so the true total return is somewhat higher. The app must not promise equity outperformance; its base equity return (9%) is deliberately set no higher than safe instruments, so equity earns its place only through diversification.
- **No local equivalents exist** for liquid funds, arbitrage funds, index funds, ETFs, Sovereign Gold Bonds or REITs (REIT rules were gazetted in 2024, but none is listed). About 90 open-end mutual funds exist, including a handful of fixed-income funds that redeem in about 3 working days and returned roughly 9–10% in 2022–24.
- **Deposit insurance covers only ৳2 lakh per bank.** Emergency funds above that should be split across banks; M1 will say so.
- **Insurance is a trust problem.** With 57% of life claims settled, insurer choice matters more than policy features, exactly as episode 2 warns. Out-of-pocket health spending near 80% means M1's "no health insurance" bump (+2 months) is justified.
- **Retirement vehicle:** the Universal Pension Scheme has four live schemes (Progoti, Surokkha, Samata, Probash), about 3.8 lakh subscribers and an 11.72% FY25-26 return rate, with contributions from ৳1,000 a month for ages 18–50 ([upension.gov.bd](https://www.upension.gov.bd/), [bdnews24, Sep 2026](https://bdnews24.com/bangladesh/4hvw1x2wqy)). Worth including in M7 as an option, with policy-change risk noted.

**Not yet verified:** current term-life premiums for ৳10 lakh and ৳1 crore cover; Sanchayapatra 2026 investment ceilings; whether the 5% small-investor Sanchayapatra tax survived the Finance Act; a Bangladesh Bank EMI-to-income ratio (none appears to exist); market-wide personal and home loan rates.

## Core features: seven calculators, one plan

The app is seven small calculators, one per episode, that feed a single monthly plan. Each calculator asks at most five questions, shows one big number, and says where that money should go. Every rate it uses comes from the rates table in the previous section, never hard-coded.

### M1. Emergency fund

**Asks:** monthly essential spending (rent, food, utilities, transport, school fees, support to parents, existing EMIs); income type (salaried / freelance / business); number of dependents; health insurance yes/no; liquid savings today.

**Months of cover (suggested, user can slide 3–15):** start at 6; +3 if income is freelance or business; +2 if the user is the only earner and has dependents; +2 if there is no health insurance. Cap at 15. The series' point stands: the slider is the user's call, the suggestion is only a starting point.

```latex
\text{Target} = E_{\text{monthly}} \times M \qquad \text{Monthly saving} = \frac{\max(0,\ \text{Target} - \text{Saved})}{\text{months to build}}
```

**Where to keep it (two tiers):**

1. One month of expenses in a bank savings account the user can withdraw from on the same day.
2. The rest in 3-month FDRs, opened one per month so one matures every month (a ladder). Keep no more than ৳2 lakh per bank, the deposit insurance limit.

**Rules shown to the user:** no stocks or mutual funds for this money; Sanchayapatra only as a third layer for very large buffers (early-encashment penalty); a credit card may bridge a 1–2 day gap if paid in full; refill the fund after any use; a holiday or phone is not an emergency.

### M2. Insurance needs

**Life (term) cover**, only if someone depends on the user's income:

```latex
\text{Cover} = (\text{annual support to dependents} \times \text{years needed}) + \text{loans outstanding} + \text{children's education goals} - \text{investments} - \text{existing cover}
```

"Years needed" runs until the youngest dependent is self-supporting or the user turns 60, whichever comes first. The app also shows a 10–15× annual income cross-check. Cover ends at 60, not 99 (episode 2). This formula is our addition; the series leaves the amount to an adviser.

**Health cover:** suggested sum insured per family member from the rates table, plus a note that any shortfall is added to the emergency fund target in M1.

**Endowment check:** if the user already pays a savings-type life policy, show premium paid vs. the cost of an equivalent term plan, and what the difference would grow to in a DPS. The app does not tell anyone to surrender a policy; it shows the numbers and the surrender-loss warning.

**Insurer checklist:** claim-settlement record (IDRA data), cashless hospital list, waiting periods and exclusions, honest disclosure of health and smoking.

### M3. Debt health check

**Asks:** each loan (type, outstanding, rate, EMI, months left) and each card (balance, limit, rate, pays in full yes/no).

```latex
\text{EMI capacity} = \text{take-home} - \text{savings target} - \text{essential expenses} - \text{cash buffer}
```

```latex
\text{Max affordable loan} = \text{EMI capacity} \times \frac{1 - (1+r)^{-n}}{r} \qquad r = \frac{\text{annual rate}}{12}
```

**Flags:** any card balance carried past the due date (red); card use above 50% of limit (amber); total EMIs above 40% of take-home (red; our default, since Bangladesh Bank sets no fixed ratio). **Payoff order:** highest rate first (avalanche) by default, with the interest saved shown against smallest-balance-first. **Debt-trap path:** list loans, tell the family, stop new borrowing, sell unaffordable assets, refinance only at a lower rate.

### M4. Save-first budget

The app rewrites the user's own numbers as income − savings = expenses. Suggested savings rate is 20% of take-home, editable down to any amount; the series says the habit matters more than the size. It suggests a DPS or standing transfer dated the day after payday. Freelancers get a percentage of each payment received instead of a fixed monthly amount, based on their 6-month average income.

### M5. Goal planner

**Asks:** goal name, cost in today's taka, years away. Age comes from the profile. A goal without all three is not saved (episode 5).

```latex
FV = C \times (1 + i)^{n} \qquad \text{Monthly saving} = \frac{FV \times r_m}{(1 + r_m)^{12n} - 1}
```

`i` = inflation for the goal type, `r_m` = monthly return of the instrument mix for that horizon. **Instrument by horizon:** under 3 years: FDR, DPS or T-bills; 3–5 years: Sanchayapatra or T-bonds; over 5 years: the M6 allocation. If the expected return is below inflation, the app says so in red.

### M6. Asset allocation

Three liquid buckets plus real estate as a goal (land and flats are too lumpy for a monthly plan).

| Bucket | Bangladeshi instruments | Role |
| --- | --- | --- |
| Fixed income | Sanchayapatra, T-bills/bonds, FDR, DPS | Stability, income |
| Equity | Open-end mutual funds, diversified DSE shares via a BO account | Long-term growth |
| Gold | 22K bars or coins (jewellery loses its making charge on resale) | Crisis and inflation hedge |
| Real estate | Land or flat, planned as an M5 goal | Not in the monthly split |

**Default split:** a 4-question risk check (age, income stability, horizon, reaction to a 20% fall) picks Careful, Balanced or Growth. Equity is capped at 70% for anyone, per episode 6. A once-a-year reminder rebalances any bucket that has drifted more than 5 points.

### M7. Retirement to 100

Plans to age 100 by default, not 80 (episode 7).

```latex
E_R = E_0 (1+i)^{R-A} \qquad \text{Corpus} = 12E_R \times \frac{1 - \left(\frac{1+i}{1+r}\right)^{100-R}}{r - i}
```

`E_0` = monthly expenses today, `A` = age, `R` = retirement age (default 60), `i` = inflation, `r` = post-retirement return. The monthly saving needed is the corpus minus the future value of existing provident fund, pension and savings, run through the M5 formula. If `r = i`, use `12E_R × (100 − R)` / (1 + r).

### The plan screen

One monthly amount, filled in priority order: emergency fund, then insurance premiums, then any debt above 15% interest, then goals and retirement by the M6 split. Until the emergency fund is full, at least 60% of the monthly amount goes to it, so the user still starts the investing habit (episode 4).

## User flow and UX

A new user gets a full plan from five questions in under three minutes, with no account. Everything else is optional depth.

1. **Language pick** on first open: বাংলা or English. Numbers always in taka with lakh/crore grouping (৳১২,৫০,০০০ / ৳12,50,000), with Bangla digits in Bangla mode.
2. **Five quick questions:** age; monthly take-home (or 6-month average for freelancers); monthly essential spending; dependents (none / partner / children / parents, multi-select); loans or card balances (yes/no).
3. **Plan screen:** one number at the top ("Save ৳X a month"), then 3–5 cards in priority order, each with its amount, its instrument and a one-line reason. Example: "Emergency fund — ৳9,000/month into a 3-month FDR ladder — you have 0 of 8 months covered."
4. **Tap a card** to open its calculator (M1–M7), pre-filled. Changing any input updates the plan screen live.
5. **"Why this number?"** on every result opens the formula in plain words, the rates used and their as-of dates.
6. **Optional save:** phone number + OTP to keep the plan, get the payday reminder and the yearly rebalance nudge.

**No-brainer rules for the interface:**

- One question per screen in onboarding, big tap targets, sliders with typed-number fallback.
- Defaults filled for everything except income and spending; the user only corrects.
- Red, amber and green status per card; at most one red shown at a time, the most urgent.
- No jargon without a tap-to-explain (FDR, DPS, Sanchayapatra, BO account, sum insured).
- Each instrument card ends with a concrete next step ("Visit any scheduled bank with NID and TIN; ask for a 3-month FDR"), never a product or brand link.
- Works offline after first load; under 300 KB of JavaScript on first paint; tested on a ৳10,000 Android phone over 3G.

## Data, rates admin and technical notes

All math runs on the device; the server only stores the rates table and, for signed-in users, their saved plan. Rates change several times a year in Bangladesh, so the rates table is the one part that must be easy to update and impossible to get silently wrong.

**Rates table (one row per assumption).** Fields: key, value, unit, source URL, as-of date, reviewed-by, next-review date. The app shows the as-of date beside every number that uses it. Any row older than its review date shows a grey "may be outdated" tag.

**Admin.** A password-protected page to edit rows, with a change log and a preview of how three sample profiles' plans change before publishing. Publishing bumps a version number; saved plans record which version they were built on.

**Calculation engine.** One pure TypeScript package (no I/O) holding every M1–M7 formula, with unit tests against hand-checked cases, including the episode 3 EMI example. The same package runs in the browser and in any server-side share-image renderer.

**Suggested stack.** Next.js + TypeScript on Cloudflare Pages; Workers for the API; D1 for the rates table, plans and change log; R2 for generated share images. PWA with offline cache of the rates table.

**Data kept per signed-in user:** phone number, the inputs they typed, plan versions. No NID, bank or card numbers, ever. Delete-my-data in one tap.

**Analytics (anonymous):** onboarding drop-off per question, plan screen reached, which card opened, "Why this number?" taps, reminder opt-ins.

## Compliance, disclaimers and risks

The app stays an educational calculator: it names instrument types, never specific funds, shares, banks or insurers, and takes no commission. That keeps it clear of acting as an investment adviser or insurance agent, but a Bangladeshi lawyer should confirm this before launch (open question below).

**Disclaimer, shown once at onboarding and in the footer of every result:** estimates for education only; not financial, tax or legal advice; rates change, check with your bank or insurer before acting; past returns don't predict future returns.

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Stale rates | Sanchayapatra, FDR and tax rules change several times a year | As-of date on every number; review dates; grey "may be outdated" tag |
| False precision | A 20-year projection looks exact but isn't | Show ranges (low / expected / high return) on M5 and M7, round to the nearest ৳500 |
| Users read it as advice | Real money decisions follow | No product names; "next step" points to a process, not a seller |
| Equity losses blamed on the app | DSE has had long, deep drawdowns | Equity capped at 70%; 5-year minimum horizon for any equity share; risk check before showing equity |
| Insurer failure | Some life insurers have not paid claims | Insurer checklist points users to IDRA's published data |
| Personal data | Income and debts are sensitive | Phone-only sign-in, no NID or account numbers, one-tap delete |
| Shariah preference | Many users avoid interest | Halal-only toggle swapping in Islamic deposit schemes and Sukuk (v2) |

## MVP scope, roadmap, metrics and open questions

The MVP ships the plan screen with M1, M3, M4 and M5, because those need only local, well-documented rates. Insurance, allocation and retirement follow once their assumptions are checked.

1. **MVP:** onboarding, plan screen, M1 emergency fund, M3 debt check, M4 save-first budget, M5 goal planner (fixed-income instruments only), rates admin, Bangla and English.
2. **v1.1:** M2 insurance needs and insurer checklist, M6 allocation with the risk check, M7 retirement to 100, phone sign-in, payday reminders.
3. **v2:** halal-only mode, shareable plan image, tax-rebate optimiser (which eligible investments cut the user's tax most), family plans with two earners.

**Success metrics (first 90 days after launch):**

| Metric | Target |
| --- | --- |
| Onboarding completion (open → plan screen) | 60% |
| Median time to plan screen | under 3 minutes |
| Users who open at least one calculator after the plan | 40% |
| "Why this number?" taps per plan | at least 1 |
| Plans saved (signed in) | 15% of completed plans |
| Rates rows past review date | 0 |

**Open questions:**

- [ ] Does a free calculator that names instrument types need any BSEC or IDRA registration? Get a lawyer's view.
- [ ] Which health-cover sum insured per person is realistic for Dhaka hospital costs? Needs hospital price data, not just insurer brochures.
- [ ] Is any Bangladeshi mutual fund cheap and diversified enough to recommend as the default equity type, or should equity default to "diversified open-end fund" with a checklist?
- [ ] Is the Universal Pension Scheme reliable enough to count toward M7, given policy changes since 2024?
- [ ] Final product name ("Taka Plan" is a placeholder; check trademark and domain).
