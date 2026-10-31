# Plan to 100 — Retirement Longevity App PRD (Bangladesh)

Oct 31, 2026 · @Sajat

## Overview

Plan to 100 (working name) is a free, mobile-first web app that shows a Bangladeshi earner how much they need saved to live on their own money until age 100, how much to put aside each month to get there, and how long their savings would last if they stopped saving today. It is built on the last episode of Zerodha Varsity's *Personal Finance for Beginners* series, adapted to Bangladeshi life expectancy, pension options and investment products.

**Problem.** Most Bangladeshis outside government service have no pension. The default plan is "my children will look after me", which the video calls a mistake. The numbers point the same way: there were 11 working-age people per elderly person in 2022, projected to fall to 6 by 2040. Where people do plan, they usually assume they'll live to about 70 or 80, so the money runs out exactly when health costs are highest. Nothing local answers "will my money last if I live to 95?" in plain Bangla.

**Target users.**

| Segment | Example | What they need first |
| --- | --- | --- |
| Private-sector salaried, 25–45 | Has a provident fund, maybe gratuity, no pension | Gap between PF/gratuity and a to-100 target |
| Freelancers and self-employed | No employer scheme at all | A monthly saving target and a long-horizon vehicle |
| Mid-career, 45–55 | Late start, kids' education still running | Catch-up amount and realistic retirement age |
| Near or in retirement, 55–70 | Lump sum from PF, gratuity or a property sale | How much to withdraw a year so it lasts to 100 |

**Goals.**

1. One number: the monthly saving needed to fund life to 100, alongside the number for planning to 80, so the user sees the gap the video warns about.
2. A "how long will it last" chart for existing savings.
3. All income sources in one place: provident fund, gratuity, Universal Pension Scheme, rent, old-age allowance.
4. A safe-withdrawal plan for people already retired.
5. Bangla and English, cheap Android phones, no sign-up for a result.

**Non-goals (v1).** No selling products, no named funds or shares, no pension enrolment on the user's behalf, no medical life-expectancy predictions.

## Source video: episode 7, longevity risk

The video's thesis: retirement tools assume you die at 80, but you might live to 100, so plan for 100, don't count on your children or the state, and put money you won't touch for decades into something built to outlast any single company: a broad index fund. The outline below paraphrases the transcript of [*How to plan for longevity risk in retirement*](https://www.youtube.com/watch?v=-BU8hyY-ZXk) (Zerodha Varsity, presented by Karthik Rangappa, 6:45).

| Time | Topic | What the video says | What changes for Bangladesh |
| --- | --- | --- | --- |
| 0:00 | A 121-year life | A tweet about a scholar who died at 121 leads him to wonder: what if I live past 100? The scary part isn't health but paying for it. | Same question. |
| 1:18 | The 80-year default | Planners and online tools default to retiring at 60 and living to 80. He calls stopping at 80 a potentially fatal mistake and suggests planning to 100 or beyond. | Life expectancy at birth here is lower (72.3, Section 3), but that average includes early deaths; someone who reaches 60 can expect to live well past it. The app defaults to 100 and shows 80 for contrast. |
| 2:23 | "My kids will look after me" | A friend's plan B is his children. He calls this a horrible mistake: they'll have their own families and costs. The government won't do it either. | Family support is still common, but the app treats it as a bonus, not a plan. State support is the old-age allowance, which is small and means-tested. |
| 3:03 | An instrument that lasts | For hyper-long-term money, the instrument itself must survive. His pick: a broad index fund (Nifty 50, Sensex). | No index fund or ETF trades in Bangladesh. The nearest long-life options are diversified open-end funds, government-backed savings (Pensioner Sanchayapatra, T-bonds) and the Universal Pension Scheme. |
| 3:41 | Why indices survive | Index members are reviewed and replaced; only 12 of the Nifty 50's original companies remain after 25 years, and the Dow has lasted since 1896 through wars and recessions. | The DSEX index renews itself the same way, but it can't be bought as one product. |
| 5:18 | What to do | Find a good index fund, invest regularly (a SIP), treat it as untouchable until old age. | A monthly plan into the long-horizon bucket, locked away in the app's plan until the user's chosen age. |
| 5:33 | The 102-year-old vendor | A 102-year-old woman in Bangalore's KR Market owns two rental properties but still sells vegetables daily because she enjoys it. Money buys independence; purpose keeps you going. | Rental income is a common Bangladeshi retirement source; the app counts it as income. |

The full transcript is not reproduced here, since it is Zerodha's content; the video above is the source.

## Bangladesh retirement landscape (as of 31 Oct 2026)

A Bangladeshi who reaches 60 can expect to live about 20 more years, to around 80, so a plan that stops at 80 fails for roughly half of them. Meanwhile most private-sector and informal workers have no pension, the state allowance is ৳700 a month, and the number of working-age people per elderly person is set to halve by 2040. The video's "plan to 100, don't rely on your kids or the state" fits Bangladesh at least as well as India.

### How long people live after 60

| Age | Remaining years (BBS, SVRS 2020) | Remaining years (UN projection for 2026) |
| --- | --- | --- |
| 60 | 19.6 (men 18.5, women 20.7) | 21.2 (men 19.9, women 22.5) |
| 65 | 16.0 (men 15.1, women 16.9) | 17.4 |
| 70 | 13.0 | — |
| 80 | 8.9 | 8.1 |

Life expectancy at birth is 72.3 (SVRS 2023), but that figure is pulled down by deaths in childhood and middle age; it is the wrong number for retirement planning. Sources: [BBS life table via lifetable.de](<https://www.lifetable.de/File/GetDocument/data\\BGD\\BGD000020202020AU1.pdf>), [georank (UN WPP)](https://georank.org/life-expectancy/bangladesh), [Prothom Alo](https://en.prothomalo.com/bangladesh/cqjsjk3buz). Women live about two years longer, so a couple's plan must cover the wife's longer retirement.

### An ageing country

| Measure | Value | Source |
| --- | --- | --- |
| People aged 60+ | About 1.5 crore, 9.3% of the population (Census 2022) | [Observer, Aug 2026](https://observerbd.com/news/589132) |
| Projected 60+ in 2050 | About 3.6 crore, 22% (UNFPA) | [Daily Star, Mar 2024](https://www.thedailystar.net/opinion/editorial/news/senior-citizens-need-better-policy-support-3576061) |
| Working-age people per elderly person | 11 in 2022, projected 6 by 2040 and 3 by 2065 | [TBS, Sep 2022](https://www.tbsnews.net/node/506314) |
| "Ageing society" (7% aged 65+) | Expected around 2029 | same |
| Out-of-pocket share of health spending | 79.3%; medicines are over half of it; households with a member 60+ spend more | [Daily Star / BIDS](https://online91.thedailystar.net/business/economy/news/65-healthcare-needs-unmet-out-pocket-costs-soar-bids-4170346), [PLOS ONE 2025](https://ideas.repec.org/a/plo/pone00/0320429.html) |

Family support is still the norm in surveys (82.8% of 60+ people in one Chittagong-area study rely on sons), but there is no national figure, and the shrinking support ratio is the trend the app plans against ([YPSA survey](https://repository.uwl.ac.uk/id/eprint/13022/1/Executive%20summary.pdf)).

### Retirement income sources

| Source | Who gets it | What it pays | Source |
| --- | --- | --- | --- |
| Old-age allowance | Men 65+, women 62+, very low income; not government pensioners | ৳700 a month (৳1,000 over 90), from July 2026; 62 lakh recipients | [TBS, Jun 2026](https://www.tbsnews.net/node/1460791), [DSS](https://dss.kushtia.gov.bd/en/site/page/RWzQ-%E0%A6%AC%E0%A7%9F%E0%A6%B8%E0%A7%8D%E0%A6%95-%E0%A6%AD%E0%A6%BE%E0%A6%A4%E0%A6%BE) (income ceiling may be outdated) |
| Universal Pension Scheme | Ages 18–50 join (4 schemes); pension from 60 | For life, a fixed amount; nominee paid until the pensioner would have turned 80 (raised from 75 in Sep 2026). Official projections: ৳1,000 a month for 10 years gives about ৳1,530 a month; for 42 years about ৳34,465. No guaranteed rate | [upension.gov.bd](https://www.upension.gov.bd/Public/PensionBriefEn), [Daily Star, Aug 2023](https://www.thedailystar.net/business/news/universal-pension-scheme-all-you-need-know-3396451), [Prothom Alo, Sep 2026](https://en.prothomalo.com/bangladesh/78biukinbv) |
| Provident fund | Mandatory for employers with 100+ permanent workers under the Nov 2025 ordinance: 7–8% of basic pay, matched by the employer (or the Progoti pension instead) | Lump sum at exit | [WTW, Mar 2026](https://www.wtwco.com/en-mu/insights/2026/03/bangladesh-new-mandate-for-provident-funds-for-large-employers) (final 2026 Act terms unconfirmed) |
| Gratuity | Private-sector workers under the Labour Act | At least 30 days' last wages per completed year; 45 days per year after 10 years | [Labour Act 2006, s.2(10)](https://cdn2.ogrlegal.com/files/labour/act/Bangladesh-Labour-Act-2006_English-Upto-2018.pdf) |
| Lifetime annuity | Anyone 20–60 | Jiban Bima Corporation's Pension Bima (Oct 2025): lifetime pension from 55–65, minimum ৳10,000 a year, 10 years guaranteed | [Prothom Alo, Oct 2025](https://en.prothomalo.com/business/local/8xug6mocj1) |
| Pensioner Sanchayapatra | **Government, semi-government and armed-forces retirees only**, up to ৳50 lakh of PF + gratuity | 11.98% (≤ ৳7.5 lakh held), monthly profit; no source tax up to ৳5 lakh | [UNB, Mar 2025](https://unb.com.bd/category/bangladesh/pensioner-sanchayapatra-in-bangladesh-revised-profit-rates-in-2025/154533) |

Retirement age is 60 in the private sector (Labour Act s.28) and 59 for government servants. Informal workers, over 85% of the workforce, have almost none of the above.

### Tax treatment (FY2026-27)

Universal Pension contributions count toward the investment rebate and its pension is tax-free; recognised PF and approved pension or superannuation payouts are exempt; gratuity from an approved fund is exempt up to ৳2.5 crore; women and people aged 65+ have a ৳4.5 lakh tax-free threshold ([PwC Tax Summaries](https://taxsummaries.pwc.com/bangladesh/individual/income-determination), [upension.gov.bd](https://www.upension.gov.bd/Public/PensionBriefEn)).

### What this means for the product

- **Default to 100 is justified by the data.** Average remaining life at 60 is 19.6–21.2 years, so "to 80" is roughly a coin flip. The explainer shows this table; the plan never uses life expectancy as the end age.
- **The Universal Pension is a fixed amount, not inflation-linked.** F2 values it as a level annuity, so its buying power visibly shrinks over a long retirement. It also caps entry at 50, so late starters can't use it.
- **Private-sector retirees can't buy Pensioner Sanchayapatra.** F4 must offer them other safe income options (5-year Sanchayapatra, T-bonds, FDR ladders) and mention lifetime annuities as a way to insure against outliving money.
- **The old-age allowance is never counted** in the plan; ৳700 a month is a safety net for the very poor.
- **The provident fund rules are new and not yet confirmed in final law.** F2 asks the user for their own PF rate rather than assuming one.

## Core features

Four features make the video's "plan to 100" concrete: a retirement calculator that shows the 80-versus-100 gap, an income-sources sheet, a long-horizon bucket that stands in for the index fund Bangladesh doesn't have, and a withdrawal plan for people already retired. Every rate lives in an admin rates table with an as-of date.

### F1. Retirement-to-100 calculator

**Asks:** age; planned retirement age (default 60); monthly household spending today; savings and investments today; monthly saving now; plan-to age (default 100, slider 85–105).

```latex
E_R = 12\,E_0\,(1+i)^{R-A} \qquad \text{Corpus} = E_R \times \frac{1 - \left(\frac{1+i}{1+r}\right)^{L-R}}{r - i}
```

```latex
\text{Gap} = \text{Corpus} - \text{FV(savings)} - \text{PF} - \text{Gratuity} - \text{PV(fixed pensions)} \qquad M = \text{Gap} \times \frac{r_m}{(1+r_m)^{12(R-A)} - 1}
```

`E_0` = monthly spending today, `A` = age, `R` = retirement age, `L` = plan-to age, `i` = inflation, `r` = after-tax return in retirement, `r_m` = monthly return before retirement from the long-horizon mix (F3). If `r = i`, the corpus is `E_R × (L − R) / (1 + r)`. Income that rises with prices (rent) is subtracted from `E_R` before the corpus formula; fixed payments (a pension that doesn't rise) are valued with a level annuity and subtracted from the corpus.

**The 80-versus-100 card:** the result always shows two numbers side by side, "to 80" and "to 100", with the extra monthly saving that buys those 20 years.

&#91;embedded content: Hypothetical example computed from the F1 formula; 8% inflation (BBS Sep 2026, rounded), 10% after-tax return (our assumption)\]

**Worked example (hypothetical):** someone retiring at 60 who spends ৳50,000 a month needs about ৳92 lakh to last to 80, or ৳1.56 crore to last to 100. For someone aged 30 today who spends ৳40,000 a month, 8% inflation turns that into about ৳48 lakh a year by 60. The targets become about ৳7.4 crore (to 80) and ৳12.6 crore (to 100), or about ৳43,600 and ৳73,800 a month saved from now at 9%, before counting PF, gratuity or pension. Numbers this large are why the app leads with the monthly amount, subtracts every income source, and shows what starting earlier changes.

### F2. Income sources

One screen listing every source the user expects after retirement, each turned into a monthly figure at retirement:

| Source | Input | How the app treats it |
| --- | --- | --- |
| Provident fund | Current balance, monthly contribution (own + employer; 7–8% of basic each at employers with 100+ staff under the new rules) | Grown to retirement at the fund's rate, then a lump sum |
| Gratuity | Years of service, basic pay | Lump sum at retirement: at least 30 days' last wages per year of service, 45 days after 10 years (Labour Act), or the employer's own rule if higher |
| Universal Pension Scheme | Scheme and monthly contribution | Monthly pension from the official projection; paid for life as a fixed amount, so valued as a level annuity |
| Rent | Monthly rent today | Rises with inflation; subtracted from spending |
| Old-age allowance | Eligible yes/no | Shown separately, never counted (৳700 a month, means-tested, men 65+ and women 62+) |
| Family support | Optional | Never counted, matching the video: a bonus, not a plan |

### F3. Long-horizon bucket

The video's answer is an index fund held for decades. With none available here, the app builds the closest local equivalent from three parts and labels each one honestly:

1. **Growth:** a diversified open-end mutual fund through a monthly plan, as the stand-in for an index fund. The app explains why it's weaker: an active fund depends on its manager, unlike an index, which renews itself.
2. **Government-backed income:** the Universal Pension Scheme for people aged 18–50 (fixed lifetime pension from 60; contributions earn the tax rebate, the pension is tax-free), and government savings instruments and T-bonds, which carry no default risk.
3. **Rebalance with age:** the split follows the Mix Check allocation rule (equity share falls one point a year after 30), so the bucket gets safer toward retirement.

**Lock:** money in this bucket is marked "not for anything before age R" in the plan, the app's version of the video's "forget about it until old age".

### F4. Withdrawal plan (already retired)

**Asks:** age, savings now, other monthly income, plan-to age.

```latex
W_1 = \text{Savings} \times \frac{r - i}{1 - \left(\frac{1+i}{1+r}\right)^{L - A}}
```

`W_1` = what can be withdrawn in the first year, rising with inflation each year after. Example: ৳1 crore at 60, planning to 100, at 10% return and 8% inflation, supports about ৳3.85 lakh in year one, about ৳32,000 a month. Spending above that is shown with the age the money would run out.

**Two-pot rule:** keep the next 3 years' withdrawals in safe, quickly available instruments (FDR, T-bills); the rest stays invested, refilling the safe pot once a year.

**Income options by retiree type:** government retirees can put up to ৳50 lakh of PF and gratuity into Pensioner Sanchayapatra (monthly profit); private-sector retirees can't, so the app suggests 5-year Sanchayapatra, T-bonds and an FDR ladder instead. For anyone worried about outliving their money, the app explains lifetime annuities (e.g. the state insurer's pension plan) as insurance against a very long life, with the trade-off that the money can't be passed on.

## User flow and UX

A new user sees their to-100 number in five questions and under three minutes, with no account.

1. **Language:** বাংলা or English; taka with lakh/crore grouping, Bangla digits in Bangla mode.
2. **Fork:** "Are you still working, or already retired?" Working users go to F1; retired users go to F4.
3. **Five questions, one per screen:** age; retirement age; monthly spending today; savings today; saving per month now.
4. **Result screen:** the 80-versus-100 card (two targets and the monthly saving for each), the "how long would my money last" line chart for the user's own numbers, and a one-line verdict: "On track to 100" (green), "Lasts to 84" (amber) or "Runs out at 71" (red).
5. **"Add your income sources"** opens F2; each added source lowers the target live.
6. **"Where should this money go?"** opens F3, with the monthly amount split into the long-horizon bucket.
7. **Optional save:** phone + OTP for a yearly check-in on the user's birthday, when the plan is recalculated at the new age.

**Interface rules:** plan-to age defaults to 100 and the slider can't go below 85; the 80 figure is shown only as the contrast, never as a default. Every figure has a "Why this number?" tap showing the formula and the as-of date of each rate. Results are rounded to the nearest ৳500 a month and ৳1 lakh of corpus. Tone is about independence and dignity, not fear; no use of death imagery. Works offline after first load and on a low-cost Android phone over 3G.

## Data, technical notes, compliance and risks

All calculations run on the device; the server holds the rates table and, for signed-in users, their saved inputs.

**Rates table** (each row: value, unit, source URL, as-of date, next-review date; rows past review show "may be outdated"): inflation; pre- and post-retirement after-tax returns (low / base / high); Universal Pension Scheme contribution limits and pension tables; old-age allowance amount and eligibility; Pensioner Sanchayapatra rate; life expectancy at 60 (for the explainer only, never as the plan-to age).

**Engine and stack:** one pure TypeScript package with unit tests for the corpus formula (including the `r = i` case), the year-by-year simulation that draws the chart (it must reach exactly zero at the plan-to age), the level-annuity value of a fixed pension, and the withdrawal formula; Next.js on Cloudflare Pages, Workers API, D1; PWA offline cache.

**Personal data:** phone + OTP only to save; amounts only, never PF, pension or account numbers; one-tap delete.

**Compliance.** The app names no product or provider beyond public government schemes and takes no commission, which should keep it outside adviser rules; a Bangladeshi lawyer should confirm this. Disclaimer on every result: educational estimates, not financial advice; returns, inflation and government scheme rules can change.

| Risk | Mitigation |
| --- | --- |
| Very large targets discourage users | Show the monthly amount first, then the corpus; show what starting 5 years earlier or later changes |
| Long-horizon projections look exact | Low / base / high always; rounded figures; recalculated every year |
| Return assumptions too rosy over 40 years | Base post-retirement return no higher than the safe-instrument rate after tax |
| Government scheme rules change | Scheme tables are rates-table rows with review dates; the app shows when each was last checked |
| Users over-count family support | Family support is never counted in the plan |

## MVP scope, roadmap, metrics and open questions

The MVP ships the retirement calculator with its 80-versus-100 card and chart, plus the withdrawal plan, because both need only formulas and a few rates. Income sources and the long-horizon bucket follow once the scheme tables are confirmed.

1. **MVP:** onboarding fork, F1 calculator with the 80-versus-100 card and chart, F4 withdrawal plan, rates admin, Bangla and English.
2. **v1.1:** F2 income sources (PF, gratuity, Universal Pension Scheme, rent), F3 long-horizon bucket, phone sign-in, birthday check-in.
3. **v2:** couple mode (two ages, two incomes, the survivor's needs), health-cost reserve for ages 75+, merge into the wider Taka Plan app.

**Success metrics (first 90 days):**

| Metric | Target |
| --- | --- |
| Open → result | 65% |
| Median time to result | under 3 minutes |
| Users who add at least one income source (after v1.1) | 30% |
| Users who move the plan-to slider | 20% |
| Saved plans with a birthday check-in | 15% |

**Open questions:**

- [ ] Does a retirement calculator that mentions government schemes need any regulator approval? Get a lawyer's view.
- [ ] Should the default plan-to age be 100 for everyone, or adjusted (e.g. 95) with 100 one tap away, given lower local life expectancy?
- [ ] Is a separate health-cost reserve for very old age needed in v1, given high out-of-pocket health spending?
- [ ] Ship separately or inside Taka Plan? Final name ("Plan to 100" is a placeholder).
