# Agent brief - shared by every fan-out page of learn-data-monetisation-with-phoebe

Internal build document, filled from course-builder/references/agent-brief.template.md on
2026-10-31. Never link it from an audience page.

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page for YOUR track. Copy its structure, classes, SVG grammar and quiz markup
   EXACTLY, including how many options each question has (4, lettered "A · ", "B · ", ...):
   - Leader: `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-data-monetisation-with-phoebe/courses/b1-three-roads-to-data-revenue.html`
   - Analyst: `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-data-monetisation-with-phoebe/courses/a1-three-prices-for-one-dataset.html`
   Also skim the bench page for voice and how the hand-off to Business Cases is worded:
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-data-monetisation-with-phoebe/courses/a6-the-data-product-pl-desk.html`
2. The source map: the Keelson case, the seams, every widget-printed number ("Widget-printed lines")
   and the citation forms F1-F17. Use ONLY its numbers; never invent a statistic; if a fact is
   missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-data-monetisation-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens:
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-data-monetisation-with-phoebe/assets/style.css`
4. Your page's widget: read `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-data-monetisation-with-phoebe/assets/dm-bench.js`
   for what your mode renders (titles, slider labels, table headers), so your steps name real
   controls and quote what it prints.

## Page skeleton (keep every component)

toolbar (crumb EXACTLY `<a href="../index.html">learn-data-monetisation-with-phoebe</a> / Leader
session N of 4` or `... / Analyst session N of 6`, #toggle-all, #zoom-toggle) · masthead (eyebrow
"Learn Data Monetisation with Phoebe · Leader session N of 4" or "· Analyst session N of 6", h1
with one `<span class="accent">`, .sub, .chip-row with the level chip (b2 "🟢 Leader", b3
"🟡 Leader", b4 "🟠 Leader"; a2 "🟢 Analyst", a3 and a4 "🟡 Analyst", a5 "🟠 Analyst") plus the two
audience chips and the time chip exactly as your template, .agenda a1-a4) · main.wrap ·
section#intro (Part 0 "Where we start": kicker, .lede, .legend pills, .callout.win "★ What you walk
out with tonight.") · 3 Parts, each `section.section#part-N` with section-kicker (klabel "Part N ·
covers ...", h2, `.tag.concept "5 min live"`), a `.lede`, ONE figure, `details.card` accordions
(summary: `.mode.live` or `.mode.self`, title, `.mini`, `.caret ▶`), at least one `.callout.example`
with `span.ex-pill` "Real world" on the page · section#demo-1 Build-along (kicker
`.tag.demo "★ 22 min · everyone works it through"` on Leader pages, `"★ 22 min · everyone builds"`
on Analyst pages, .lede, the widget, ONE figure, `.steps > .step`, each with a `.prompt-box.good`
carrying a `span.label`) · section#exercise Homework (ol, 4 items) · section#quiz (3 x
`.quiz-q data-answer="0-based"`, `p.qtext`, 4 `button.qopt` "A · ...", `p.qwhy`; one
`p.quiz-score` after the last; vary the correct letter across the three) · section#official, h2
EXACTLY "What this session teaches, and where it came from", `.covered > .covered-row` (pill solid
✓ / light ◐ + name + note), then the `.mono` line EXACTLY "Every fact on this page, and its
verification tier, is recorded in the course's source map." · section.cheat#cheatsheet (h3
"Leader session N cheat sheet <span>· pin this</span>" or "Analyst session N cheat sheet ...",
.grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next session" · footer.pagefoot ·
scripts.

Head: the template's social meta block with this page's own description/title/url;
`<title>Leader session N · <Title> - learn data monetisation with phoebe</title>` (or Analyst);
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.
Scripts at the end, exactly as the templates: `dm-live.js?v=1`, `dm-bench.js?v=1`, then `app.js?v=1`.
The widget is `<div class="dmx-widget" data-mode="MODE"></div>` placed right after the build-along
.lede, before its figure (Leader b4 adds `data-inputs="off"` to show the rungs and results only).

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "Analyst session 5" style cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map. Widget numbers: quote ONLY the lines under "Widget-printed
  lines" in the map, verbatim and in the same format (k = thousands, one decimal, e.g. +40.3k,
  32.0k, 72.4%). For a hand calculation you show, show the arithmetic and check it; it must agree
  with the map. Never invent a Keelson number the engine does not print.
- Citations ONLY in the forms F1-F17 of the map. Hard traps from fact-checking:
  CISR's 51/31/18 are shares of RETURNS (never revenue, never share of firms); CISR's third road is
  "selling information offerings" (never "information solutions"); the five capabilities are "as of
  July 2026"; never print a valuation formula as Laney's; IAS 38 never mentions data (say "by
  analogy"); PDPA business improvement exception does not cover selling to unrelated third parties
  "on the text", an inference; PDPC anonymisation guidance is Chapter 3 of the Selected Topics
  guidelines; Data Act Arts 8-9 apply only where a holder is OBLIGED to share, never a general price
  rule; Reddit's $203.0 million is aggregate contract value over two to three years with no
  counterparty named, the Google figure is "reportedly" about $60 million a year; Verisk and
  LexisNexis numbers are their own statements; never attribute "tiered", "usage-based" or "high
  fixed cost" to Pei; no success or failure rate for data monetisation exists: teach the absence.
- A cell-size threshold (k) is ONE control; never say it makes data anonymous on its own.
- NEVER "lottery" or "lotteries"; say the mechanism ("a random draw", "a seeded draw").
- Default to the English word. No Chinese terms needed here.
- Titles, widget ids and class names must not collide with siblings. Do not use these titles:
  "What a customer is worth", "Which input moves the answer", "Value is a range", "Funding and value
  tracking", "The first three bets", "The P&L as arithmetic", "Pricing" alone. Do not invent new CSS
  classes; use the template's classes only.
- Running case: Keelson Mutual (constructed motor and home insurer), Maya Okafor (CDO), Tom Reyes
  (COO), Ines Carvalho (CFO), Sefa Adjei (head of partnerships). The product: the Keelson Repair Cost
  Index (quarterly, motor repair cost and claim frequency by region and vehicle class, from Keelson's
  motor claims). Say "constructed" on the page for every Keelson example ("Constructed Keelson Mutual
  example." at the end of each Real world callout that uses Keelson). Never Phoebe's own employer,
  clients or projects.
- Learner exercises on their own data: say "your numbers will differ".

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): ink `#1F1E14` · muted `#5A5848` · accent `#494412`
· accent-deep `#2E2A08` · accent-mid `#6B641E` · accent-soft `#DDD7A8` · accent-50 `#F8F6E6` ·
faint `#CFCCB8` · hairline `#E8E6D8` · teal (contrast) `#0E5C66` · teal-ink `#083A40` · teal-50
`#E6F3F4` · `#FFFFFF` · universal reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a wrong-way panel or a
below-zero mark.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="the data, not the shape">` > `<defs>` + `<style>` + content, then
  `<figcaption>🔍 Click to zoom - takeaway</figcaption>`. Grow H, never W.
- Prefix unique per figure, used for every class and id: `<page id><letter>`, e.g. `b2a`, `b2b`,
  `b2c`, `b2d`, `a3a` ... Never reuse another page's prefix.
- `<defs>` holds three things with the figure prefix P: a wobble filter `id="PSk"`
  (`feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="<int>"` +
  `feDisplacementMap scale="2.4" xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%"
  width="106%" height="106%"`), a hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one
  accent line, opacity .5), an open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, ink
  stroke 1.6). ALL shapes sit inside ONE `<g filter="url(#PSk)" fill="none" stroke="#1F1E14"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`; rects carry a tiny rotation
  (-4 to 4 degrees for hand-placed items, under 1 for panels). Fills: white, accent-50, the hachure
  for "the pile" or "the data", and the teal ONLY for the one thing the figure is about. One doodle
  anchor per figure, simple strokes, never a mascot. Text classes: `.PH` 800 12px ink heading ·
  `.PL` 600 12px ink label · `.PS` 400 11px muted · `.PB` 800 11px teal-ink · `.PV` 800 16-20px
  accent-deep value · `.PW` 800 12px white on a fill (teal only) · `.PA` 700 11px accent-deep axis
  caption · `.PR` 700 11px #991B1B for a below-zero or wrong-way label · `.PN` 400 12px muted note.
  Hand-stacked items must not overlap as painted rects (the gate flags a pile). Text over a hachure
  fill sits on a white rect placed OUTSIDE the filtered group.
- ALL `<text>` outside any filtered group, sans stack, never below 10.5px.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110
  chars; 40px between neighbouring point labels; bottom note 22px below the last row, H clears it by
  8px. No path may cross a text label (the gate flags line-through-text). Keep every label inside
  the box it describes. When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along. Draw the MECHANISM (records leaving a
  funnel at each rights check; cells on a grid going dark under k; a cost curve falling as customers
  grow; buyers' willingness to pay as a sorted staircase with the price line cutting it; two tiers
  sorting buyers by surplus; three deal routes with floor and cap; the licence chain from supplier
  to buyer), never a metaphor literally, never decoration.

## Voice and honesty

Every Part gets a real-world story: a sourced fact from the map (F1-F17) where one exists,
otherwise a constructed Keelson story labelled as such. Keelson numbers are quoted from the map;
nothing else about Keelson gets a number.

## Cross-links (absolute URLs)

- Business Cases & ROI (NPV, IRR, ranges; never re-teach): https://phoebefu6.github.io/learn-business-cases-roi-with-phoebe/
  - NPV, IRR and payback: https://phoebefu6.github.io/learn-business-cases-roi-with-phoebe/courses/a3-npv-irr-and-payback.html
  - The range and the option to wait: https://phoebefu6.github.io/learn-business-cases-roi-with-phoebe/courses/a5-the-range-and-the-option-to-wait.html
- Data Strategy (improve road, funding and value signals): https://phoebefu6.github.io/learn-data-strategy-with-phoebe/
- PDPA and Do Not Call in operational detail: https://phoebefu6.github.io/learn-pdpa-dnc-with-phoebe/
- Data Governance: https://phoebefu6.github.io/learn-data-governance-with-phoebe/
- Data Products tour: https://phoebefu6.github.io/learn-data-product-with-phoebe/
- Privacy Engineering (k-anonymity, differential privacy): PLANNED, mention as "planned", no link.
- Pricing Analytics (consumer elasticity): PLANNED, mention as "planned", no link.
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chains and session titles

Leader: b1 Three roads to data revenue → b2 Is it ours to sell → b3 Products, prices and partners
→ b4 The board call (b4's next: "Next: Three prices for one dataset →" to
a1-three-prices-for-one-dataset.html).
Analyst: a1 Three prices for one dataset → a2 The sellable share → a3 Package and cost to serve →
a4 Pricing a data product → a5 Partner deal maths → a6 The data product P&amp;L desk.
Footer left: "Leader session N of 4 · learn-data-monetisation-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>" (or Analyst N of 6).
Footer right: "<a href="PREV.html">← Prev: Title</a> &nbsp;·&nbsp; <a href="NEXT.html">Next: Title →</a>".
Files: b2-is-it-ours-to-sell.html, b3-products-prices-and-partners.html, b4-the-board-call.html,
a2-the-sellable-share.html, a3-package-and-cost-to-serve.html, a4-pricing-a-data-product.html,
a5-partner-deal-maths.html.

Session titles (exact, sentence case, one accent span in h1): b2 "Is it ours to sell", b3
"Products, prices and partners", b4 "The board call", a2 "The sellable share", a3 "Package and cost
to serve", a4 "Pricing a data product", a5 "Partner deal maths".
