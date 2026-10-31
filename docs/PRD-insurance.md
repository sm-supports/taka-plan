# Bima Check — Insurance Needs App PRD (Bangladesh)

Oct 31, 2026 · @Sajat

## Overview

Bima Check (working name) is a free, mobile-first web app that tells a Bangladeshi earner in under five minutes how much life and health cover their family needs, what it should roughly cost, and how to judge a policy or an insurer before signing. It is built on episode 2 of Zerodha Varsity's *Personal Finance for Beginners* series, adapted to Bangladeshi products, rules and claim realities.

**Problem.** Most Bangladeshis meet insurance through an agent selling a savings-style endowment policy. They rarely know how much cover they need, whether a pure term plan would protect their family better for less, or whether the insurer actually pays claims. Health costs are mostly paid out of pocket, so one hospital stay can wipe out savings. Nothing local answers "how much cover do I need, and is this policy any good?" in plain Bangla.

**Target users.**

| Segment | Example | What they need first |
| --- | --- | --- |
| Sole or main earner with dependents | Salaried, 28–45, spouse, children, parents | Life cover amount, term vs. what they hold now |
| Young single earner, 22–30 | First job, supports parents | Health cover; whether life cover is needed yet |
| Freelancers and self-employed | No employer group insurance | Health and life cover from scratch |
| Existing policyholders | Paying an endowment or DPS-linked policy | "Is my policy worth keeping?" check |

**Goals.**

1. One result screen: life cover needed, health cover needed, the gap against what the user already has, and a rough yearly premium range.
2. A policy checker that compares an existing savings-type policy with term cover plus saving the difference.
3. An insurer checklist built on regulator data, so users check the insurer before the product.
4. Bangla and English, cheap Android phones, no sign-up to get a result.

**Non-goals (v1).** No selling or brokering policies, no commissions, no named product recommendations, no claim filing on the user's behalf, no telling anyone to cancel a policy. The app explains and calculates; the user buys through an insurer or agent of their choice.

## Source video: episode 2, life and health insurance

The video's thesis: after an emergency fund, every family needs two covers, term life and health, bought early, kept separate from investing, and bought from an insurer that pays claims. The outline below paraphrases the transcript of [*Common mistakes while buying Life & Health Insurance*](https://www.youtube.com/watch?v=FTipNuw9q5U) (Zerodha Varsity, presented by Karthik Rangappa, 9:14; tips credited to Ditto Insurance).

| Time | Topic | What the video says | What changes for Bangladesh |
| --- | --- | --- | --- |
| 0:00 | Intro | Insurance is the second building block after the emergency fund; both can be built in parallel. | Same. |
| 0:50 | Why insure | All planning starts with covering risk. Two covers are essential: term life and health. | Same. |
| 1:16 | Term life | If your family depends on your income, a term plan pays them a lump sum if you die. Example: a yearly premium of about ₹15,000 buys ₹1.5 crore of cover. | Pure term is sold far less than endowment plans; affordable high-cover term may be hard to find. Premium examples must be local. |
| 2:32 | How much, how long | Amount, term and premium are best settled with a *trusted* agent, because policy clauses can mislead. | The app replaces the "ask an agent" step with a formula, since agents here mostly earn on savings plans. |
| 2:59 | Don't mix | Mixing insurance and investment gives you a weak version of both. Treat the premium as an expense. | The single most important local message: most policies sold are mixed savings-plus-cover products. |
| 3:29 | Health cover | Covers hospitalisation and surgery. Indian medical inflation is cited at up to 15%. Cover the whole family, including elderly parents. | Retail health cover is thin and limits are low; most health costs are paid out of pocket, so the emergency fund carries more of the load. |
| 3:59 | Buy young | Young people get serious illnesses too; an early diagnosis can make you uninsurable, and premiums are lower when young. | Same. |
| 4:57 | Term tip 1 | Insurers expect you to be fit; medical tests can delay, raise the price of, or reject an application. | Check local medical-test thresholds by sum assured. |
| 5:35 | Term tip 2 | Smokers pay considerably more. | Same. |
| 5:45 | Term tip 3 | A critical-illness rider replaces income during serious illness; worth the extra premium. | Check rider availability and stand-alone critical-illness plans. |
| 6:09 | Term tip 4 | Don't buy cover to age 99; dependents usually stop relying on you around 60. | Same; cover to 60 by default. |
| 6:30 | Tip 5 (both) | A good adviser helps most at claim time, because insurers may reject on slight suspicion. | Regulator complaint channels matter more than advisers, given low claim settlement. |
| 6:59 | Health tip 1 | Never lie on the proposal form; the insurer finds out at claim time. | Same. |
| 7:27 | Health tip 2 | Pick the insurer before the policy; features mean little if claims are refused. | Same, and more urgent: several life insurers are in distress. |
| 7:52 | Health tip 3 | Frequent travellers should avoid zonal co-payment and choose nationwide cover. | Check whether plans are cashless outside Dhaka. |
| 8:31 | Health tip 4 | Read the exclusions; some "specific illness" lists hide serious conditions behind a two-year wait. | Same; the app shows the waiting-period checklist. |

The full transcript is not reproduced here, since it is Zerodha's content; the video above is the source.
