# Official course map - learn-data-monetisation-with-phoebe ("Data Monetisation")

Internal build document. Never link it from an audience page. Built 2026-10-31.
Bucket biz, diff 3, audience both: data and AI leaders who decide whether data leaves the building
for money, and the analyst who builds the numbers. Two tracks, 10 sessions x 45 min: Leader b1-b4
(no code, worked on paper and on widgets) + Analyst a1-a6 (hands-on, browser widgets running the real
engine). a6 is the bench, the data product P&L desk.

## Seams (pick a side out loud)

| Topic | Owner | Here |
|---|---|---|
| Improve route: data used inside the firm, funding models, value signals | learn-data-strategy (s5) | named as one of three routes in b1, never taught |
| NPV, IRR, payback, tornado, switching values, benefits register | learn-business-cases-roi | the desk prints NPV at 9% once and hands the cash flows over; link a3, a4 |
| Consent law in operational detail (PDPA obligations, DNC) | learn-pdpa-dnc, learn-data-governance | b2/a2 teach only what makes data SELLABLE; link out |
| Anonymisation maths (k-anonymity proofs, differential privacy) | learn-privacy-engineering (PLANNED, no link) | a2 uses a cell-size threshold as a product control and says it is not anonymisation on its own |
| Consumer price elasticity, price tests on retail goods | learn-pricing-analytics (PLANNED, no link) | a4 is B2B data pricing: value to buyer, capture share, tiers |
| A tour of data product types | learn-data-product (d1) | b3 uses packaging only as a selling decision |
| Image rights and licensing for generated media | learn-ai-design a4, learn-ai-media 06 | not covered |

This course = the wrap and sell routes: what is ours to sell, what it is worth, how to package and
price it, who sells it, and whether the P&L survives.

## The running case (constructed, labelled on every page and widget)

**Keelson Mutual**, the invented mid-size insurer from Data Strategy and Business Cases. People:
Maya Okafor (CDO), Tom Reyes (COO), Ines Carvalho (CFO), and NEW **Sefa Adjei, head of partnerships**
(name grepped across the estate 2026-10-31: zero hits). Keelson writes motor and home insurance.
The idea on the table: the **Keelson Repair Cost Index**, an aggregated quarterly index of motor
repair cost and claim frequency by region and vehicle class, built from Keelson's own motor claims,
sold to fleet operators, repair networks, parts makers and smaller insurers. (Name grepped: zero
hits.) Every Keelson number is constructed, in thousands of currency units per year unless stated.
Pages say "constructed" for every Keelson example and "your numbers will differ" for learner work.

Earlier Keelson facts that still hold (from the siblings, do not contradict): CDQ (claims data quality
fix, 260) is live; CFT (claims fast-track triage) was the business case in Business Cases; Keelson's
hurdle rate is 9%.

### Engine inputs (assets/dm-live.js; Python mirror materials/dm_reference.py)

a1 assets (cost/yr, years held, lawful buyers, fee per buyer/yr, benefit/yr in use, run/yr, life):
motor claims history 310, 8, 14, 45, 520, 60, 5 · home claims and weather perils 140, 6, 6, 30, 180, 25, 5
· repairer invoice lines 90, 5, 0 (supplier contract bars onward use), -, 260, 20, 5 · telematics
pilot 220, 2, 3, 20, 40, 35, 3 · claims call transcripts 60, 4, 0 (no consent for external use), -, 90,
15, 4. Lenses: cost = cost x held; market = buyers x fee; economic = (benefit - run) x life.

a2 funnel: 180,000 motor claims records (3 years). Leave in order: privacy notice did not cover reuse
8%, customer objected 3%, third-party licence forbids onward use 12%, injury claims (health data)
held back 7%. Remainder aggregated into 12 regions x 8 vehicle classes x 12 quarters = 1,152 cells
(weights fixed by seed 20261031); a cell under k records is suppressed. Base k = 10.

a3 cost: shared platform build 120, run 150/yr (pipeline, data steward, DPIA, legal review). Tiers
(build, cost to serve per customer/yr): quarterly index report 40, 1.5 · dashboard 90, 4 · API feed
160, 9 · bespoke analysis 0, 35. Builds spread over 3 years. Customer mix: report 50%, API 40%,
bespoke 10%.

a4 pricing: 110 constructed prospects: fleet operators 60 (yearly value from the index 10-90),
repair networks 25 (20-160), parts makers 10 (60-320), smaller insurers 15 (40-240), values seeded
(seed 20261032), skewed low. Capture share 25%: a buyer pays at most a quarter of the yearly value it
gets (constructed assumption, a lever on the widget). Single product = API (cost to serve 9). Two
tiers: Standard = the report at half the value (serve 1.5), Pro = the API at full value (serve 9).

a5 deals (one steady-state year, 5,000 draws, seed 20261033): price 32, serve 8, sales cost 5 per
customer. Direct customers triangular(10, 16, 22). Reseller reach x triangular(1.2, 1.8, 2.6), 30%
commission, Keelson still serves. Exclusive licensee: customers triangular(20, 45, 90) at 32, Keelson
receives max(minimum guarantee 300, 20% of licensee revenue); nobody else may buy.

a6 desk (base; range low-high): build 330 (300-430) · fixed run 150 (130-220) · customers year 1: 6
(3-9) · new customers per year after: 4 (2-7) · customers lost per year 15% (8%-25%) · price per
customer 32 (26-40) · cost to serve 8 (6-11) · cost to win a customer 5 (3-8) · share sold through a
partner 30% (15%-50%) · partner commission 30% (20%-40%). Five years. Customers(t) = previous x (1 -
churn) + new. Revenue = customers x price x (cells published / 92.6%) x (1 - partner share x
commission). Cash = revenue - run - customers x serve - new customers x sales cost x (1 - partner
share). Year 0 = -build. Simulation: 5,000 draws, seed 20261034, triangular per input.
Exclusive option: revenue = max(300, 20% x customers x 2.5 x price); Keelson pays no serve or sales
cost. Tightened option: notice share 20%, k 25.

## Widget-printed lines (canon; quote ONLY these numbers, verbatim)

Python and node agree on every value (materials/compare-ladder.py, exit 0, planted 0.1% fault
caught). Format: k = thousands, one decimal; shares one decimal.

**Three lenses (a1, b1)**, cost / market / economic, ranks in brackets:
motor claims history 2480.0k (1) / 630.0k (1) / 2300.0k (1) · home claims and weather perils 840.0k
(2) / 180.0k (2) / 775.0k (3) · repairer invoice lines 450.0k (3) / 0.0k (5) / 1200.0k (2) ·
telematics pilot 440.0k (4) / 60.0k (3) / 15.0k (5) · claims call transcripts 240.0k (5) / 0.0k (4)
/ 300.0k (4). Headline: the invoice lines are worth 1200.0k in use and 0.0k on the market; the
telematics pilot cost 440.0k and earns 15.0k.

**Funnel (a2, b2), base:** 180,000 -> 165,600 (notice, -14,400) -> 160,632 (objected, -4,968) ->
141,356 (licence, -19,276) -> 131,461 (injury claims, -9,895) -> 130,304 in published cells (584
records lost in suppressed cells). Cells published 1,067 of 1,152 (92.6%). Sellable share 72.4%.
**k curve** (cells published / records in published cells): k 5: 99.0% / 72.7% · k 10: 92.6% / 72.4%
· k 15: 86.4% / 71.9% · k 20: 79.3% / 71.2% · k 25: 74.1% / 70.4% · k 30: 67.5% / 69.3% · k 40:
57.9% / 67.2% · k 50: 50.1% / 64.9%. Headline: raising k from 10 to 50 loses 42.5 points of cells but
7.5 points of records; the cells that vanish are the small regions and rare vehicles, which is where
buyers want detail.
**Tightened (notice 20%, k 25):** 180,000 -> 144,000 -> 139,680 -> 122,918 -> 114,314 -> 108,747.
Cells published 791 (68.7%). Sellable share 60.4%.

**Cost per customer (a3)**, mix report 50% / API 40% / bespoke 10%: shared fixed 256.7k a year
(platform run 150 + builds 120+40+160 spread over 3 years), cost to serve one more customer 7.9k
(7.85). Per customer: 5 customers 59.2k · 10: 33.5k · 16: 23.9k · 20: 20.7k · 40: 14.3k · 80: 11.1k.
Cost-plus at 16 customers with a 30% markup: 31.1k.

**Pricing (a4, b3)**, capture 25%: best single API price 32.0k, 18 buyers, revenue 576.0k,
contribution 414.0k. At 40.0k: 10 buyers, contribution 310.0k. At 24.0k: 22 buyers, contribution
330.0k. Best two tiers: Standard 9.0k + Pro 25.0k, 18 Standard + 18 Pro = 36 buyers, revenue 612.0k,
contribution 423.0k. **Buyers at 32.0k by segment:** fleet operators 0 of 60, repair networks 4 of 25, parts makers 6 of
10, smaller insurers 8 of 15. At the best single price the biggest buyer group is Keelson's own
competitors (question 2 of Leader session 1).
**Cost at 16 customers (a3 widget default):** 23.9k per customer, of which shared fixed 16.0k and
serve 7.9k; cost-plus at 30% 31.1k.
**Two tiers by segment (Standard / Pro / neither):** fleet operators 8 / 0 / 52 · repair networks
5 / 4 / 16 · parts makers 4 / 6 / 0 · smaller insurers 1 / 8 / 6. The Standard tier is what brings
fleet operators in at all. Cells suppressed at k 10: 85 of 1,152.
Headline: tiers double the buyers and add 9.0k of contribution; the cost-plus
price (31.1k) lands next to the value price (32.0k) here by coincidence, not by method.

**Deals (a5)**, one year, P10 / P50 / P90 / mean: direct +240.2k / +304.8k / +366.9k / +304.0k ·
reseller +270.4k / +429.0k / +629.8k / +440.3k · exclusive +300.0k / +323.8k / +462.2k / +354.7k,
at the guarantee in 41.0% of draws.

**Per customer per year (a5 by hand):** direct 32.0k - 8.0k - 5.0k = 19.0k; reseller 32.0k x 70% - 8.0k
= 14.4k (22.4k after commission).

**P&L desk base case (a6, b4):** cash flows -330.0k, -44.3k, +28.2k, +83.8k, +131.1k, +171.4k.
Customers 6.0, 9.1, 11.7, 14.0, 15.9. Revenue +174.7k, +265.0k, +341.7k, +406.9k, +462.4k (shown
without sign in the year table: 174.7k ... 462.4k). Cumulative -374.3k, -346.1k, -262.2k, -131.1k,
+40.3k. Cash break-even 4.8 years. NPV at 9% -77.9k. Cells published 92.6%.
**Ladder** (year-5 revenue / 5-year cash / break-even / P10 / P50 / P90 / no break-even in 5 years):
1 Base case 462.4k / +40.3k / 4.8 years / -364.0k / -47.3k / +347.6k / 56.4%
2 The sponsor's case (price 40, 7 new a year, 8% lost) 1059.7k / +1362.4k / 2.4 years / -100.7k /
  +350.5k / +836.3k / 17.3%
3 Consent and anonymity tightened 342.8k / -386.7k / not within 5 years / -727.6k / -487.5k /
  -199.7k / 98.2% (cells published 68.7%)
4 One exclusive licensee 300.0k / +420.0k / 2.2 years / +178.3k / +338.7k / +456.8k / 0.0%
5 Every input held certain (break) 462.4k / +40.3k / 4.8 years / +40.3k / +40.3k / +40.3k / 0.0%
NPV at 9% by rung: base -77.9k, sponsor +877.2k, tight -397.6k, exclusive +253.4k.
**Exclusivity's cost:** with the sponsor's inputs, selling direct ends year 5 at +1362.4k; the
exclusive licence ends at +953.4k. The guarantee wins in a thin market and caps a strong one.
**Gross margin** (revenue minus cost to serve, over revenue): 72.5% in every year of the base case.
**Build composition:** 330 = platform 120 + report tier 40 + API tier 160 + legal set-up 10.
**Year 1 by hand:** 6 customers x 32 = 192.0k gross; partner commission takes 30% x 30% = 9%, so
revenue 174.7k (174.72); serve 6 x 8 = 48.0k; sales 6 x 5 x 70% = 21.0k; run 150.0k; cash -44.3k.
**Discounted at 9% (present values / cumulative):** -330.0 / -330.0 · -40.6 / -370.6 · +23.7 /
-346.9 · +64.7 / -282.2 · +92.9 / -189.2 · +111.4 / -77.9 (k).
**Tightened price effect:** cells published 68.7% / 92.6% = 74.1% of the base price, so 32.0k
behaves like 23.7k.
**Hand-off:** the base case breaks even on cash in year 5 yet has NPV -77.9k at the 9% hurdle. That
is the conversation Business Cases a3 teaches; the desk prints the cash flows to take there.

## Per-session coverage

Leader (no code; widgets used read-only or lightly)
- b1 Three roads to data revenue: improve / wrap / sell (MIT CISR), the five capabilities, direct vs
  indirect (Laney), three lenses on one dataset (widget lenses), data is not on the balance sheet.
- b2 Is it ours to sell: lawful basis and purpose compatibility, consent and objection, licence
  chain (inbound terms bind outbound use), special-category data, anonymisation vs pseudonymisation,
  the sellable share (widget funnel), the Data Act and data intermediaries as context.
- b3 Products, prices and partners: packaging ladder (raw, aggregated, index, insight, API,
  embedded), pricing by value not volume, tiers (widget price), partner routes, real deals (Reddit,
  Verisk) with reported-tier caveats.
- b4 The board call: the desk ladder (widget desk, data-inputs="off"), what each rung says, the
  risk register (consent drift, re-identification, reputational, cannibalisation, concentration in
  one licensee), the go / no-go paper, hand-off to a business case.

Analyst (hands-on)
- a1 Three prices for one dataset: inventory, three lenses computed, why they disagree, Laney's six
  models as the fuller set (tiered per source-facts).
- a2 The sellable share: the funnel built stage by stage, the k threshold computed on the grid, cells
  vs records, what a threshold is not.
- a3 Package and cost to serve: tiers, shared fixed vs variable, the cost curve, cost-plus as a floor.
- a4 Pricing a data product: value to buyer x capture share, single price search, two tiers,
  segments, Pei's survey for the pricing families.
- a5 Partner deal maths: direct, reseller, exclusive; minimum guarantee as a floor; the simulation;
  contract terms that carry the numbers (field of use, term, audit, exclusivity scope).
- a6 The data product P&L desk: the five rungs, the range, the hand-off.

## Not covered (honest list)

Tax treatment of data revenue; transfer pricing for data between group companies; antitrust review of
data pooling (named as a risk only); sector rules beyond the general privacy laws named (e.g. insurer
regulators' own guidance); valuation for M&A; data marketplaces' own fee schedules (they change); any
claim about the size of the "data monetisation market" (vendor estimates disagree; not used).


## Citation forms (use exactly; full rows in source-facts.md)

- **F1 CISR definition and roads:** Wixom, Beath and Owens, Data Is Everybody's Business: The
  Fundamentals of Data Monetization (MIT Press, 2023). Definition, quote CISR: "Data monetization is
  the act of turning data into money." Three ways: improving work, wrapping products, selling
  information offerings (briefing wording; do not use "information solutions"). Selling "is not just
  about selling data; it's also about selling insights".
- **F2 CISR returns split:** MIT CISR press release, 16 Oct 2023: 51% of monetisation RETURNS from
  improving, 31% from wrapping, 18% from selling. Shares of returns; never revenue, never share of firms.
- **F3 CISR revenue spread:** MIT CISR briefings Nov 2024 and July 2026 (survey of 349 executives):
  top performers attribute 11 percent of revenues to data monetisation, more than five times the 2
  percent of the bottom. Self-reported survey, not audited.
- **F4 CISR capabilities (as of July 2026):** data management, data platform, data science, customer
  understanding, acceptable data use; the July 2026 briefing adds a sixth, AI explanation. Names have
  changed since 2019; say "as of July 2026".
- **F5 Laney:** Doug Laney, Infonomics (book). Six models from his own slides (TDWI 2020 keynote; US
  DOE talk July 2020): foundational IVI, BVI, PVI; financial CVI, MVI, EVI, each posed as a question.
  His published FORMULAS were not verified: never print a formula as Laney's. The widget's three
  lenses are simplified teaching versions named after the cost, market and economic idea. Direct vs
  indirect monetisation from the same slides (indirect includes "Publishing branded indices"; direct
  includes "Selling raw data through brokers or data markets", "Offering insights, analyses and
  reports").
- **F6 IMDA/PDPC Trusted Data Sharing Framework (28 Jun 2019):** four parts (strategy; legal and
  regulatory; technical and organisational; operationalising); companion guide names three valuation
  approaches: market, cost, income. Read via factsheet and announcement only.
- **F7 Accounting:** IAS 38 para 63: internally generated brands, mastheads, publishing titles,
  customer lists and similar items "shall not be recognised as intangible assets"; para 57 six
  development criteria. IAS 38 never mentions data or databases: applying it to data is an inference
  by analogy, and pages must say so. IASB has a research project on intangibles (reported).
- **F8 GDPR (Regulation (EU) 2016/679):** Art 6(1) six lawful bases; Art 6(4) compatibility of a new
  purpose (link, context, nature of data incl. special categories...); Art 7(3) "as easy to withdraw
  as to give consent"; Art 4(5) pseudonymisation (still personal data); Recital 26 anonymous
  information outside the Regulation; Art 9(1) data concerning health prohibited unless an Art 9(2)
  exception; Art 21 right to object to processing on bases (e) or (f); Art 83(5) up to 20m EUR or 4%
  of worldwide turnover, whichever is higher.
- **F9 Singapore PDPA:** consent s13; deemed consent by notification s15A (adverse-effect assessment,
  reasonable opt-out period); business improvement exception covers USE within the organisation and
  sharing only within a group of related companies, so a sale to an unrelated third party is not
  covered on the text (an inference: say so); legitimate interests exception needs an adverse-effect
  assessment. Cite PDPC Advisory Guidelines on Key Concepts (revised 29 April 2026) and PDPC
  Advisory Guidelines on Selected Topics, Chapter 3 Anonymisation (revised 23 May 2024): "anonymised
  data is not personal data".
- **F10 EU Data Act (Regulation (EU) 2023/2854):** applies from 12 September 2025 (staggered parts
  to 2026 and 2027). Art 8 fair, reasonable, non-discriminatory terms and Art 9 reasonable,
  non-discriminatory compensation that "may include a margin" apply ONLY where a holder is obliged to
  make data available; they are not a price rule for voluntary sales. Data Governance Act (2022/868)
  data intermediation services, applies from 24 September 2023. The Commission's Digital Omnibus
  (Nov 2025) proposes repealing the DGA into the Data Act: proposal, not adopted as at 2026-10-31.
- **F11 Pooled claims precedent (vendor self-statements, attribute them):** Verisk ClaimSearch, a
  contributory "give to get" claims database, over 1.8 billion US claims, about 95% of the US P&C
  market (Verisk blog, 31 Jul 2025). LexisNexis C.L.U.E. auto: up to seven years of claims, 99.6% of
  the auto industry contributing (vendor page, reported).
- **F12 Reddit:** S-1 (Feb 2024): data licensing contracts entered January 2024 with aggregate
  contract value $203.0 million over two to three years, no counterparty named; minimum $66.4 million
  expected in 2024. Google deal "reportedly" about $60 million a year (Reuters, 22 Feb 2024, unnamed
  sources). 10-K FY2025: Other revenue $140.0 million (content licensing plus products sold to users,
  not licensing alone), licensing from two partners. 10-Q filed 30 Oct 2026: those agreements are
  "approaching the end of their respective current terms". Concentration risk is the lesson.
- **F13 Strava Metro:** free of charge to urban planners, city governments, transport departments
  and safe infrastructure advocates since September 2020 (reported, Bicycle Retailer). Never state a
  previous price. An example of choosing NOT to charge.
- **F14 ODI Data Spectrum:** data runs "from closed to shared to open".
- **F15 Pei:** Jian Pei, "A Survey on Data Pricing: From Economics to Data Science", IEEE Transactions
  on Knowledge and Data Engineering 34(10), 2022 (online 2020). Information goods have "zero marginal
  costs" and are non-rival; pricing models include versioning, bundling, subscription, auctions and
  query-based pricing. Never attribute "tiered", "usage-based" or "high fixed cost" to Pei (the high
  fixed cost point is ours, from the a3 cost curve).
- **F16 Gartner:** "by 2022, 90% of corporate strategies will explicitly mention information as a
  critical enterprise asset" was a 2019 PREDICTION (reported); Gartner's own Oct 2019 baseline:
  fewer than 50% of documented strategies mentioned data and analytics. No later measurement found.
- **F17 CONTESTED:** no reputable success rate for data monetisation initiatives exists. BARC 2019
  (Tableau-sponsored, about 200 respondents): 17 percent of companies had established initiatives
  (adoption, not success). Never quote a failure or success rate; teach the absence.

## Facts and citations

See materials/source-facts.md (verified 2026-10-31). Use only VERIFIED or CORRECTED rows; say
"reported" for SECONDARY; never quote a NOT FOUND row.
