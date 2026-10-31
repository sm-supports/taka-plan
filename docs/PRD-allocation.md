# Mix Check — Asset Allocation App PRD (Bangladesh)

Oct 31, 2026 · @Sajat

## Overview

Mix Check (working name) is a free, mobile-first web app that tells a Bangladeshi saver how to split their long-term money across fixed income, equity and gold, which local instruments fill each bucket, and when and how to rebalance. It is built on episode 6 of Zerodha Varsity's *Personal Finance for Beginners* series, adapted to what Bangladeshi retail investors can actually buy.

**Problem.** Bangladeshi savers tend to hold one thing: all Sanchayapatra, all FDR, all gold jewellery, or a land plot. Some chase the share market after a rally and leave after a crash. Few hold a deliberate mix or ever rebalance. The Indian advice in the source video names products (index funds, Sovereign Gold Bonds, REITs) that don't exist here, so it can't be followed as given.

**Target users.**

| Segment | Example | What they need first |
| --- | --- | --- |
| New saver, 22–30 | First ৳50,000–5 lakh to invest | A starting split and the first instrument per bucket |
| Single-asset holder | Everything in Sanchayapatra or FDR | What they gain or lose by adding equity or gold |
| Burned share investor | Lost money in DSE, now avoids it | A capped, rules-based equity share and the case for and against |
| Pre-retiree, 45–60 | Large lump sum, short horizon | A safer mix and when to shift it |

**Goals.**

1. One result: a percentage split, the taka amount in each bucket, and the local instrument for each.
2. A rebalancing calculator that says exactly what to buy or sell to return to target.
3. Projections shown as a low / base / high range, after tax and inflation, never one exact number.
4. Bangla and English, cheap Android phones, no sign-up to get a result.

**Non-goals (v1).** No buying or selling, no brokerage or BO account linking, no named shares or mutual funds, no market timing or price forecasts, no commissions.

## Source video: episode 6, asset allocation

The video's thesis: nobody can predict which asset will do best, so split savings across several, start simple (even equal weights), tilt toward equity when young and toward bonds when older, and rebalance every year. The outline below paraphrases the transcript of [*What is Asset Allocation? Learn how to do asset allocation*](https://www.youtube.com/watch?v=LTe0xl8LZuA) (Zerodha Varsity, presented by Karthik Rangappa, 5:38).

| Time | Topic | What the video says | What changes for Bangladesh |
| --- | --- | --- | --- |
| 0:00 | What an asset is | Something with future economic value, such as an FD that matures at a higher amount, land, gold or mutual funds. Assets carry wealth across time. | Same idea. |
| 0:52 | Four asset classes | Gold, real estate, stocks and bonds, each with its own traits. | Same four classes; the instruments inside each differ. |
| 1:07 | Gold | Scarce, easy to value, dense and portable, so a long-standing store of wealth. Investors turn to it under stress; often seen as an inflation hedge. | Bought as physical bars, coins or jewellery only; no gold bonds, ETFs or digital gold. Making charges and VAT eat into returns. |
| 1:59 | Real estate | Land and rental property; every property is unique, can't be moved or split, so each investor's return differs. REITs are the exception. | No REIT is listed. Real estate means a whole plot or flat: large, illiquid, often bought with family money. |
| 2:30 | Financial assets | Exchange-traded assets benefit from standard terms and regulation. Equity is the most liquid; fixed income is the largest. Equity is volatile but, he argues, the main long-term wealth builder. | Bonds for individuals are mostly Sanchayapatra, T-bills/bonds and bank deposits. The DSE's 10-year price record is weak, so the equity claim needs local evidence. |
| 3:07 | Why allocate | If you knew the winner you'd hold only that; you can't, so you split across a basket. | Same. |
| 3:31 | Starting out | Stick to big, liquid assets: large-cap (maybe mid-cap) equity funds plus gold, real estate and bonds. | No index or clearly large-cap-only funds; use diversified open-end funds or a spread of large DSE shares. |
| 3:49 | Equal weights | If unsure, split evenly. Example: ₹10 lakh over four assets = ₹2.5 lakh each. Gold via SGBs, real estate via REITs. | Equal weight across four doesn't work here: real estate can't be bought in ৳2.5 lakh slices. The app splits three liquid buckets and treats property as a separate goal. |
| 4:16 | Young investors | With a long career ahead, up to 70% in equity is reasonable; the rest across gold, bonds and real estate. | 70% stays as the hard cap; the default sits lower because local equity has been weaker (Section 3). |
| 4:36 | Rebalance yearly | If equity drifts from 70% to 80%, sell the excess and move it into the assets that fell behind. | Same; the app calculates the trades and flags tax and exit costs. |
| 5:00 | Older investors | Fewer earning years means less equity and more bonds and debt funds; the right mix depends on age and risk tolerance. | Same; Sanchayapatra's higher rates make the safe side relatively more attractive here. |

The full transcript is not reproduced here, since it is Zerodha's content; the video above is the source.

## Bangladesh asset classes (as of 30 Oct 2026)

A Bangladeshi retail investor can build three liquid buckets (fixed income, equity, gold) but not a liquid real-estate one. Right now the safe bucket is unusually strong: Sanchayapatra beats inflation after tax, while the DSE's last decade was weak. Gold had a huge three years and is now falling. The app's defaults have to reflect this, not the Indian video's assumptions.

### What fills each bucket

| Bucket | Instrument | Current return | Getting out | Minimum / access | Tax | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Fixed income | Bangladesh Sanchayapatra, 5-yr | 11.83% (holding ≤ ৳7.5 lakh) | Early encashment pays less: 9.74% in year 1 | Post office, bank, National Savings office | 10% source tax, adjustable on return | [FE, Jul 2026](https://thefinancialexpress.com.bd/home/bangladesh-keeps-national-savings-certificate-interest-rates-unchanged-for-jul-dec), [UNB](https://unb.com.bd/category/Business/july-2025-interest-rates-of-5-year-bangladesh-sanchayapatra-under-national-savings-scheme/163335) |
| Fixed income | T-bill (91-day to 1-year) | 8.56–8.79% | Holds to maturity; T-bonds also trade on DSE (thinly) | From ৳1 lakh via a bank's government securities window | 10% source tax | [Bangladesh Bank, Oct 2026](https://www.bb.org.bd/en/index.php/monetaryactivity/treasury), [BRAC Bank](https://www.legacy.bracbank.com/en/treasury/govtsecurities) |
| Fixed income | T-bond (5 to 10-year) | 8.47–9.27% | As above | As above | 10% source tax | [Bangladesh Bank, Oct 2026](https://www.bb.org.bd/en/index.php/monetaryactivity/treasury) |
| Fixed income | Bank FDR (1 year) | 6.75–8.25% | Breakable, with lower interest | Any bank; insured up to ৳2 lakh per bank | 10% (15% without proof of return) | Bank rate sheets, Jun–Sep 2026; [BSS](https://www.bssnews.net/js-session/376349) |
| Fixed income | Open-end fixed-income fund | About 9–10% a year (2022–24 record) | Redeemed at NAV in about 3 working days | Through the fund manager | Rebate-eligible | [TBS, Nov 2024](https://www.tbsnews.net/economy/stocks/fixed-income-mutual-funds-gain-traction-when-equity-struggles-997701) |
| Equity | Open-end mutual fund (about 90 exist) | Varies by fund | Redeemed at NAV via the fund manager | Monthly plans from ৳1,000–5,000 | Rebate-eligible; dividends taxed 15% | [Ekush](https://ekushwml.com/insights/how-to-invest-in-mutual-funds-bangladesh), [TBS, Jun 2026](https://www.tbsnews.net/economy/banking/why-you-should-open-least-one-idlc-sip-account-june-2026-1455476) |
| Equity | Listed shares on DSE | DSEX 5,417; +1.45% a year price-only over 10 years; −26% from Sep 2021 peak | Sold on exchange, settles in days | BO account via a broker | Rebate-eligible; dividends taxed 15% | [DSE](https://www.dse.com.bd/), [Dhaka Tribune, 2016 level](https://www.dhakatribune.com/business/stock/8119/stocks-end-flat-for-2nd-day) |
| Gold | 22K bars, coins or jewellery | ৳2,20,858 per bhori; +122% in 3 years, −16% from the Jan 2026 peak | Sold to a jeweller, usually below the selling price | Any BAJUS member jeweller | 5% VAT; jewellery adds a making charge (minimum 6%) | [FE / BAJUS, Oct 2026](https://thefinancialexpress.com.bd/trade/gold-prices-cut-by-tk-3324-per-bhori-in-bangladesh), [UNB](https://unb.com.bd/news/tag/147191) |
| Real estate | Land or flat | Not tracked | Months to sell; legal and registration costs | Whole property only; no REIT is listed | Registration and gains taxes | [TBS, REIT rules 2024](https://www.tbsnews.net/node/912676) |

Inflation is 8.34% (BBS, Sep 2026). After 10% tax that leaves Sanchayapatra at about +2.1% a year in real terms, a 10-year T-bond at about 0%, and a 1-year FDR at about −1.5%.

### What this means for the product

- **No local index fund, ETF, gold bond, digital gold or REIT exists.** Every video recommendation for a specific product needs a substitute, and the app must say so plainly.
- **Equity's long-run case is unproven on local data.** The DSEX price index grew about 1.45% a year over 10 years, far below T-bills; dividends are excluded and their yield wasn't found, so the total return is somewhat higher. The app keeps equity in the mix for diversification and possible recovery, but defaults below the video's 70%, and its base equity return is set no higher than safe instruments.
- **Gold is volatile here too.** It rose 122% in three years, then fell 16% from its peak in nine months. Buying as jewellery costs a making charge plus VAT up front. The app treats gold as a 5–15% hedge, bought as bars or coins.
- **Real estate is a goal, not a slice.** Without REITs it can't be bought in monthly amounts or rebalanced. The app tracks property the user already owns as part of net worth but excludes it from the percentage split.
- **The safe side is crowded at the top.** Sanchayapatra investment caps (৳30–50 lakh per scheme, from 2020 sources, unconfirmed for 2026) and proof-of-return rules above ৳10 lakh mean larger savers need T-bonds and funds as well.
- **Rates move twice a year.** Sanchayapatra rates are reviewed every six months; T-bill yields swung from 10.2% (May 2026) to 7.7% (Oct 2026) and back to 8.6%. Every figure the app shows carries its as-of date.

## Core features

Five features turn the video's advice into numbers: a risk check picks a profile, the allocation engine sets the split for the user's age, the instrument map says what to buy in each bucket, the rebalancer says what to trade, and projections show the likely range. Every rate and default lives in an admin rates table with an as-of date.

### F1. Risk check

Four questions, one per screen, each scored 0–2: age band; income stability (salaried / freelance / business); how long until the money is needed; "If your investments fell 20% in a year, you would… sell / wait / buy more". Total 0–3 = Careful, 4–5 = Balanced, 6–8 = Growth. The user can override the result, but never above the 70% equity cap.

### F2. Allocation by age

```latex
\text{Equity \%} = \min\!\left(E_0,\ \max\!\left(E_{\min},\ E_0 - \max(0,\ \text{age} - 30)\right)\right)
```

```latex
\text{Gold \%} = 10 \qquad \text{Fixed income \%} = 100 - \text{Equity \%} - \text{Gold \%}
```

| Profile | Equity to age 30 (E₀) | Equity floor (E\_min) | Gold |
| --- | --- | --- | --- |
| Careful | 30% | 10% | 10% |
| Balanced (default) | 45% | 15% | 10% |
| Growth | 60% | 20% | 10% |

&#91;embedded content: App defaults (our assumption), drawn from the formula in F2; 70% cap from episode 6\]

These defaults are our choice, not the video's: they sit below its 70% equity ceiling because the DSE's 10-year record is weak (Section 3). Gold is adjustable from 5% to 15%.

**Horizon override:** money needed within 5 years gets no equity, whatever the profile. Money needed within 1 year goes to FDR or T-bills only. Property is shown in net worth but left out of the split.

### F3. Instrument map

The allocation becomes a shopping list of instrument types, never named products.

| Bucket | Default instrument | When to use the alternative |
| --- | --- | --- |
| Fixed income | Sanchayapatra (5-yr or 3-month profit) | Above the scheme cap, or money needed within 3 years: T-bills/bonds, fixed-income fund or FDR |
| Equity | Diversified open-end mutual fund via a monthly plan | Direct DSE shares only if the user opts in: at least 10 large companies across 5+ sectors, no single share above 10% of equity |
| Gold | 22K bars or coins from a BAJUS member jeweller | Jewellery only for use, not investment (making charge and resale loss) |

Each card ends with the how-to: documents needed (NID, TIN or proof of return above the thresholds), where to go, minimums.

### F4. Rebalancer

The user enters current values `V_b` per bucket and any new money `N`. With target weights `w_b`:

```latex
\text{Trade}_b = w_b\,\left(\textstyle\sum V + N\right) - V_b
```

Positive = buy, negative = sell. **Triggers:** once a year on a date the user picks, or sooner if any bucket drifts more than 5 points from target. **Rule order:** first direct new money to the under-weight buckets; sell only if that can't close the gap within 12 months. The app never suggests breaking a Sanchayapatra early to rebalance (it shows the year-1 rate drop instead), and flags dividend tax and exit costs before any sale.

**Worked example (hypothetical):** target 45 / 10 / 45 (equity / gold / fixed income) on ৳10 lakh. After a rally the holdings are ৳5.5 lakh / ৳1.5 lakh / ৳3 lakh. Trades: sell ৳1 lakh of equity and ৳50,000 of gold, buy ৳1.5 lakh of fixed income. With ৳1.5 lakh of new money instead, the app puts all of it into fixed income and the drift closes without selling anything.

### F5. Projection

A monthly amount `M` for `n` years at the mix's after-tax return:

```latex
r_{\text{mix}} = \sum_b w_b\, r_b \qquad FV = M \times \frac{(1 + r_m)^{12n} - 1}{r_m} \qquad r_m = (1 + r_{\text{mix}})^{1/12} - 1
```

Shown in today's taka too (divided by `(1 + i)^n`), and always as three numbers: low, base and high.

| Bucket | Low | Base | High |
| --- | --- | --- | --- |
| Fixed income (after tax) | 6.5% | 8.5% | 10.5% |
| Equity | 2% | 9% | 14% |
| Gold | 2% | 8% | 12% |

These are our assumptions, set so equity's base is no better than safe instruments; they are rows in the rates table and are reviewed every six months.

**Worked example (hypothetical):** ৳10,000 a month for 20 years in the Balanced age-30 split (45 / 10 / 45), held constant for simplicity; ৳24 lakh paid in. Mix return 4.0% / 8.7% / 12.2% gives about ৳36.5 lakh / ৳61.5 lakh / ৳93.6 lakh, or ৳7.8 / ৳13.2 / ৳20.1 lakh in today's taka at 8% inflation. In the low case the money grows slower than inflation and loses buying power, which the app says plainly.

## User flow and UX

A new user gets a split and a shopping list in about two minutes, with no account.

1. **Language:** বাংলা or English; taka with lakh/crore grouping, Bangla digits in Bangla mode.
2. **Gate check:** "Do you have an emergency fund and no card debt?" If not, the app says to fix those first (episodes 1 and 3) and links to them, but still lets the user continue.
3. **Risk check (F1):** four questions, one per screen.
4. **Amounts:** a lump sum, a monthly amount, or both; when the money is needed.
5. **Result screen:** a three-part bar (fixed income / equity / gold) with percentages and taka amounts, the instrument card for each bucket, and the projection range for the monthly amount.
6. **"I already invest"** opens the rebalancer (F4): the user enters what they hold per bucket and gets buy/sell amounts.
7. **Optional save:** phone + OTP for the yearly rebalance reminder on a date the user picks.

**Interface rules:** one question per screen; sliders with typed fallback; a tap-to-explain for every term (asset allocation, rebalancing, NAV, BO account, T-bill, bhori); "Why this split?" on the result shows the formula and the user's age and profile; projections never shown as a single number; no product or broker names; works offline after first load and on a low-cost Android phone over 3G.

## Data, technical notes, compliance and risks

All calculations run on the device; the server holds the rates and defaults table and, for signed-in users, their saved holdings.

**Rates and defaults table** (each row: value, unit, source URL, as-of date, next-review date; rows past review show "may be outdated"): instrument rates (Sanchayapatra, T-bills/bonds, FDR, fund categories), gold price, DSEX level, inflation, the low/base/high return assumptions, profile parameters (E₀, E\_min, gold %), the drift band (5 points) and the equity cap (70%). Rates are reviewed at least every six months, in line with the Sanchayapatra review cycle.

**Admin:** password-protected editor with a change log and a preview of how three sample users' splits and projections change before publishing.

**Engine and stack:** one pure TypeScript package with unit tests for the allocation formula at the knees (ages 30, the floor age, 70), the rebalancer (with and without new money) and the projection (including `r = 0`); Next.js on Cloudflare Pages, Workers API, D1; PWA offline cache.

**Personal data:** phone + OTP only to save; holdings stored as bucket totals, never account, BO or certificate numbers; one-tap delete.

**Compliance.** The app gives a generic, rules-based split by instrument type and names no fund, share or broker, which should keep it outside investment-adviser registration; a Bangladeshi lawyer should confirm this against BSEC rules before launch. Disclaimer on every result: educational estimates, not investment advice; markets can fall and stay down for years; past returns don't predict future ones.

| Risk | Mitigation |
| --- | --- |
| Equity losses blamed on the app | Defaults below the video's 70%; no equity for money needed within 5 years; low case shown first |
| Users chase last year's winner (gold's 3-year run) | Projections use long-run assumptions, not recent returns; gold capped at 15% |
| Breaking Sanchayapatra early to rebalance | Rebalancer uses new money first and shows the encashment penalty |
| Stale rates | As-of date on every figure; six-monthly review; "may be outdated" tag |
| False precision | Low / base / high always; amounts rounded to ৳500 |

## MVP scope, roadmap, metrics and open questions

The MVP ships the risk check, the age-based split with its instrument map, and the projection, because they need only formulas and a small rates table. The rebalancer follows once users can save holdings.

1. **MVP:** onboarding with the gate check, F1 risk check, F2 allocation, F3 instrument map, F5 projection, rates admin, Bangla and English.
2. **v1.1:** F4 rebalancer, phone sign-in, saved holdings, yearly rebalance reminder.
3. **v2:** goal-based splits (several goals with different horizons), halal-only mode (Islamic deposits, Sukuk, Shariah funds), merge into the wider Taka Plan app.

**Success metrics (first 90 days):**

| Metric | Target |
| --- | --- |
| Open → result screen | 65% |
| Median time to result | under 2 minutes |
| "Why this split?" taps per result | at least 1 |
| Users who save and set a rebalance date (after v1.1) | 15% of results |
| Rates rows past review date | 0 |

**Open questions:**

- [ ] Does a generic, product-free allocation tool need BSEC registration as an adviser? Get a lawyer's view.
- [ ] What is the DSE's dividend yield over the last 10 years? It would turn the price-only return into a total return and could change the equity defaults.
- [ ] How are capital gains on listed shares and mutual fund units taxed for individuals in FY2026-27? Not yet researched.
- [ ] Are the 2020 Sanchayapatra investment caps still in force?
- [ ] Should gold be optional (0% allowed) for users who see it as jewellery only?
- [ ] Ship separately or as part of Taka Plan? Final name ("Mix Check" is a placeholder).
