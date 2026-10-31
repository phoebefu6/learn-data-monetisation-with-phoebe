/* dm-live.js - the data monetisation engine for learn-data-monetisation-with-phoebe.
 * Pure functions, no DOM. Runs in the browser (window.DMX) and in node (module.exports).
 * materials/dm_reference.py mirrors every function; materials/compare-ladder.py checks the two
 * agree by value. Every Keelson Mutual number is CONSTRUCTED for teaching (thousands of currency
 * units per year unless stated). The arithmetic is real: the sellable-share funnel, the
 * anonymity-threshold suppression, the three value lenses, the cost curve, the price search, the
 * partner simulation and the P&L desk are computed, never looked up. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DMX = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var SEED = 20261031;
  var DRAWS = 5000;

  function copy(o) { var r = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) r[k] = o[k]; return r; }
  function withInput(p, k, v) { var q = copy(p); q[k] = v; return q; }
  function rnd(x) { return Math.floor(x + 0.5); }       /* half-up, identical in Python */

  /* mulberry32: identical in materials/dm_reference.py */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t = (t ^ (t + (Math.imul(t ^ (t >>> 7), t | 61) >>> 0))) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function tri(u, a, m, b) {         /* triangular inverse CDF */
    if (b === a) return m;
    var c = (m - a) / (b - a);
    return u < c ? a + Math.sqrt(u * (b - a) * (m - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - m));
  }
  function quant(sorted, q) { return sorted[Math.floor(q * (sorted.length - 1))]; }

  /* ---------- Analyst session 1: three prices for one dataset ----------
   * cost lens: what it cost to build and keep (annual cost x years held)
   * market lens: what buyers would pay (licence fee x buyers who may lawfully buy)
   * economic lens: what it earns in use (annual benefit minus annual run cost, x years of life) */
  var ASSETS = [
    { id: "motor", name: "Motor claims history", cost: 310, held: 8, buyers: 14, fee: 45, benefit: 520, run: 60, life: 5 },
    { id: "home", name: "Home claims and weather perils", cost: 140, held: 6, buyers: 6, fee: 30, benefit: 180, run: 25, life: 5 },
    { id: "invoice", name: "Repairer invoice lines", cost: 90, held: 5, buyers: 0, fee: 0, benefit: 260, run: 20, life: 5, note: "supplier contract bars onward use" },
    { id: "telem", name: "Telematics pilot", cost: 220, held: 2, buyers: 3, fee: 20, benefit: 40, run: 35, life: 3 },
    { id: "calls", name: "Claims call transcripts", cost: 60, held: 4, buyers: 0, fee: 0, benefit: 90, run: 15, life: 4, note: "no consent for any external use" }
  ];
  function lenses(a) {
    return {
      id: a.id, name: a.name,
      cost: a.cost * a.held,
      market: a.buyers * a.fee,
      economic: (a.benefit - a.run) * a.life
    };
  }
  function lensTable(list) {
    var rows = (list || ASSETS).map(lenses);
    ["cost", "market", "economic"].forEach(function (k) {
      var order = rows.slice().sort(function (x, y) { return y[k] - x[k] || (x.id < y.id ? -1 : 1); });
      order.forEach(function (r, i) { r[k + "Rank"] = i + 1; });
    });
    return rows;
  }

  /* ---------- Analyst session 2: the sellable share ----------
   * Records leave in order: notice did not cover reuse, customer objected, third-party licence
   * forbids onward use, special-category (injury, health) claims. The rest are aggregated into
   * region x vehicle class x quarter cells; a cell with fewer than k records is suppressed. */
  var FUNNEL = { records: 180000, notice: 0.08, objected: 0.03, licence: 0.12, special: 0.07, k: 10, regions: 12, classes: 8, quarters: 12 };
  var STAGES = [
    { key: "notice", label: "Privacy notice did not cover reuse" },
    { key: "objected", label: "Customer objected to analytics use" },
    { key: "licence", label: "Third-party licence forbids onward use" },
    { key: "special", label: "Injury claims (health data) held back" }
  ];
  /* cell weights are fixed by the seed, so every run builds the same grid */
  var GRID = (function () {
    var r = rng(SEED), wr = [], wc = [], w = [], i, j, q, tot = 0;
    for (i = 0; i < FUNNEL.regions; i++) { var u = r(); wr.push(0.08 + 2 * u * u * u); }
    for (j = 0; j < FUNNEL.classes; j++) { var v = r(); wc.push(0.1 + 1.6 * v * v); }
    for (i = 0; i < FUNNEL.regions; i++) {
      for (j = 0; j < FUNNEL.classes; j++) {
        for (q = 0; q < FUNNEL.quarters; q++) {
          var x = wr[i] * wc[j] * (1 + 0.02 * q) * (0.6 + 0.8 * r());
          w.push(x); tot += x;
        }
      }
    }
    for (i = 0; i < w.length; i++) w[i] = w[i] / tot;
    return w;
  }());
  function funnel(f) {
    f = f || FUNNEL;
    var n = f.records, steps = [{ key: "start", label: "Motor claims records, 3 years", left: n, lost: 0 }];
    STAGES.forEach(function (s) {
      var lost = rnd(n * f[s.key]);
      n = n - lost;
      steps.push({ key: s.key, label: s.label, left: n, lost: lost });
    });
    var eligible = n, cells = 0, kept = 0, keptRecords = 0, placed = 0;
    for (var i = 0; i < GRID.length; i++) {
      var c = Math.floor(eligible * GRID[i]);
      placed += c; cells++;
      if (c >= f.k) { kept++; keptRecords += c; }
    }
    steps.push({ key: "k", label: "Cells under " + f.k + " records suppressed", left: keptRecords, lost: placed - keptRecords });
    return {
      steps: steps, eligible: eligible, cells: cells, keptCells: kept, placed: placed,
      published: keptRecords, cellCoverage: kept / cells, sellableShare: keptRecords / f.records
    };
  }
  var BASE_COVER = funnel(FUNNEL).cellCoverage;
  function kCurve(f, ks) {
    return (ks || [5, 10, 15, 20, 25, 30, 40, 50]).map(function (k) {
      var x = funnel(withInput(f || FUNNEL, "k", k));
      return { k: k, cellCoverage: x.cellCoverage, sellableShare: x.sellableShare, keptCells: x.keptCells };
    });
  }

  /* ---------- Analyst session 3: package and cost to serve ---------- */
  var PLATFORM = { build: 120, run: 150 };   /* anonymisation pipeline, data steward, DPIA, legal review */
  var TIERS = [
    { id: "report", name: "Quarterly index report", build: 40, serve: 1.5 },
    { id: "dash", name: "Dashboard", build: 90, serve: 4 },
    { id: "api", name: "API feed", build: 160, serve: 9 },
    { id: "bespoke", name: "Bespoke analysis", build: 0, serve: 35 }
  ];
  var AMORT = 3;                               /* tier builds spread over three years */
  /* mix: { tierId: share of customers }, shares summing to 1 */
  function costPerCustomer(n, mix) {
    var fixed = PLATFORM.run + PLATFORM.build / AMORT, varc = 0;
    TIERS.forEach(function (t) {
      var s = mix[t.id] || 0;
      if (s > 0) { fixed += t.build / AMORT; varc += s * t.serve; }
    });
    return { fixed: fixed, perCustomerFixed: fixed / n, variable: varc, total: fixed / n + varc };
  }
  var MIX = { report: 0.5, api: 0.4, bespoke: 0.1 };

  /* ---------- Analyst session 4: pricing a data product ----------
   * A constructed buyer population: each buyer's yearly value from the index, and a capture
   * share (the most of that value a buyer will hand over). */
  var SEGMENTS = [
    { id: "fleet", name: "Fleet operators", n: 60, lo: 10, hi: 90 },
    { id: "repair", name: "Repair networks", n: 25, lo: 20, hi: 160 },
    { id: "parts", name: "Parts makers", n: 10, lo: 60, hi: 320 },
    { id: "ins", name: "Smaller insurers", n: 15, lo: 40, hi: 240 }
  ];
  var CAPTURE = 0.25;
  var BUYERS = (function () {
    var r = rng(SEED + 1), out = [];
    SEGMENTS.forEach(function (s) {
      for (var i = 0; i < s.n; i++) { var u = r(); out.push({ seg: s.id, value: s.lo + (s.hi - s.lo) * u * u }); }
    });
    return out;
  }());
  function wtp(b, capture, mult) { return b.value * capture * (mult == null ? 1 : mult); }
  /* one price for everyone: buyers whose willingness to pay reaches it */
  function single(price, capture, serve, mult) {
    var n = 0;
    for (var i = 0; i < BUYERS.length; i++) if (wtp(BUYERS[i], capture, mult) >= price) n++;
    return { price: price, buyers: n, revenue: n * price, contribution: n * (price - serve) };
  }
  function bestSingle(capture, serve, mult) {
    var best = null;
    for (var p = 1; p <= 150; p += 0.5) {
      var x = single(p, capture, serve, mult);
      if (!best || x.contribution > best.contribution + 1e-9) best = x;
    }
    return best;
  }
  /* two tiers: Standard (report, half the value) and Pro (API, the full value); each buyer takes
   * the tier with the larger surplus, Pro on a tie, nothing when both surpluses are negative */
  var STD_SHARE = 0.5;
  function tiered(ps, pp, capture, mult) {
    var ns = 0, np = 0;
    for (var i = 0; i < BUYERS.length; i++) {
      var w = wtp(BUYERS[i], capture, mult), ss = w * STD_SHARE - ps, sp = w - pp;
      if (sp >= 0 && sp >= ss) np++;
      else if (ss >= 0) ns++;
    }
    var sS = TIERS[0].serve, sP = TIERS[2].serve;
    return { ps: ps, pp: pp, std: ns, pro: np, revenue: ns * ps + np * pp, contribution: ns * (ps - sS) + np * (pp - sP) };
  }
  function bestTiered(capture, mult) {
    var best = null;
    for (var ps = 2; ps <= 60; ps += 1) {
      for (var pp = ps + 1; pp <= 150; pp += 1) {
        var x = tiered(ps, pp, capture, mult);
        if (!best || x.contribution > best.contribution + 1e-9) best = x;
      }
    }
    return best;
  }
  function costPlus(n, markup) { return costPerCustomer(n, MIX).total * (1 + markup); }

  /* ---------- Analyst session 5: partner deal maths ----------
   * Three routes for the index, one steady-state year, each simulated over its uncertain driver. */
  var DEAL = {
    price: 32, serve: 8, sales: 5,
    direct: [10, 16, 22],          /* customers Keelson signs itself: low, likely, high */
    reach: [1.2, 1.8, 2.6],        /* reseller's customers as a multiple of direct */
    commission: 0.3,
    partnerCust: [20, 45, 90],     /* exclusive licensee's customers */
    partnerPrice: 32, share: 0.2, mg: 300
  };
  function dealYear(route, d, u) {
    var direct = tri(u, d.direct[0], d.direct[1], d.direct[2]);
    if (route === "direct") return direct * (d.price - d.serve - d.sales);
    if (route === "reseller") {
      var c = direct * tri(u, d.reach[0], d.reach[1], d.reach[2]);
      return c * (d.price * (1 - d.commission) - d.serve);
    }
    var pc = tri(u, d.partnerCust[0], d.partnerCust[1], d.partnerCust[2]);
    return Math.max(d.mg, d.share * pc * d.partnerPrice);
  }
  function dealSim(route, d, n, seed) {
    d = d || DEAL; n = n || DRAWS;
    var r = rng(seed == null ? SEED + 2 : seed), out = [], floor = 0;
    for (var i = 0; i < n; i++) {
      var v = dealYear(route, d, r());
      if (route === "exclusive" && v === d.mg) floor++;
      out.push(v);
    }
    var s = out.slice().sort(function (a, b) { return a - b; }), mean = 0;
    for (i = 0; i < n; i++) mean += out[i];
    return { route: route, p10: quant(s, 0.1), p50: quant(s, 0.5), p90: quant(s, 0.9), mean: mean / n, atFloor: floor / n };
  }
  function dealTable(d) {
    return ["direct", "reseller", "exclusive"].map(function (k) { return dealSim(k, d); });
  }

  /* ---------- Analyst session 6: the data product P&L desk ---------- */
  var BASE = {
    build: 330, run: 150, cust1: 6, adds: 4, churn: 0.15, price: 32, serve: 8, sales: 5,
    partner: 0.3, commission: 0.3, years: 5
  };
  var KEYS = ["build", "run", "cust1", "adds", "churn", "price", "serve", "sales", "partner", "commission"];
  var LABELS = {
    build: "Build cost (year 0)", run: "Fixed run cost per year", cust1: "Customers in year 1",
    adds: "New customers per year after", churn: "Customers lost per year", price: "Price per customer per year",
    serve: "Cost to serve per customer", sales: "Cost to win a customer", partner: "Share sold through a partner",
    commission: "Partner commission"
  };
  var RANGES = {
    build: [300, 430], run: [130, 220], cust1: [3, 9], adds: [2, 7], churn: [0.08, 0.25],
    price: [26, 40], serve: [6, 11], sales: [3, 8], partner: [0.15, 0.5], commission: [0.2, 0.4]
  };
  var RATE = 0.09;                     /* Keelson's hurdle, the same one Business Cases uses */
  /* opts: { funnel: funnel params (coverage scales price), exclusive: {mg, share, reach} } */
  function desk(p, opts) {
    opts = opts || {};
    var cover = opts.funnel ? funnel(opts.funnel).cellCoverage : BASE_COVER;
    var mult = cover / BASE_COVER;
    var cf = [-p.build], rows = [], c = 0, cum = -p.build;
    for (var t = 1; t <= p.years; t++) {
      var adds = t === 1 ? p.cust1 : p.adds;
      c = t === 1 ? p.cust1 : c * (1 - p.churn) + p.adds;
      var gross = c * p.price * mult, rev, serveC, salesC;
      if (opts.exclusive) {
        var x = opts.exclusive;
        rev = Math.max(x.mg, x.share * c * x.reach * p.price * mult);
        serveC = 0; salesC = 0;
      } else {
        rev = gross * (1 - p.partner * p.commission);
        serveC = c * p.serve; salesC = adds * p.sales * (1 - p.partner);
      }
      var cash = rev - p.run - serveC - salesC;
      cum += cash;
      cf.push(cash);
      rows.push({ year: t, customers: c, revenue: rev, serve: serveC, sales: salesC, run: p.run, cash: cash, cum: cum,
        margin: rev > 0 ? (rev - serveC) / rev : null });
    }
    return { cf: cf, rows: rows, cover: cover, mult: mult, cum: cum, breakeven: breakeven(cf), npv: npvAt(cf, RATE) };
  }
  function npvAt(cf, r) {
    var s = 0;
    for (var t = 0; t < cf.length; t++) s += cf[t] / Math.pow(1 + r, t);
    return s;
  }
  /* years until cumulative cash turns non-negative, linear within the year; null if never */
  function breakeven(cf) {
    var cum = 0;
    for (var t = 0; t < cf.length; t++) {
      var next = cum + cf[t];
      if (t > 0 && next >= 0 && cum < 0) return (t - 1) + (-cum) / cf[t];
      cum = next;
    }
    return null;
  }
  function simulate(p, opts, certain, n, seed) {
    n = n || DRAWS; certain = certain || [];
    var r = rng(seed == null ? SEED + 3 : seed), out = [], never = 0;
    for (var i = 0; i < n; i++) {
      var q = copy(p);
      for (var j = 0; j < KEYS.length; j++) {
        var k = KEYS[j], u = r();
        if (certain.indexOf(k) === -1) q[k] = tri(u, Math.min(RANGES[k][0], p[k]), p[k], Math.max(RANGES[k][1], p[k]));
      }
      var d = desk(q, opts);
      if (d.breakeven == null) never++;
      out.push(d.cum);
    }
    var s = out.slice().sort(function (a, b) { return a - b; }), mean = 0;
    for (i = 0; i < n; i++) mean += out[i];
    return { n: n, p10: quant(s, 0.1), p50: quant(s, 0.5), p90: quant(s, 0.9), mean: mean / n, pNever: never / n, sorted: s };
  }
  var EXCLUSIVE = { mg: 300, share: 0.2, reach: 2.5 };
  var TIGHT = { records: 180000, notice: 0.2, objected: 0.03, licence: 0.12, special: 0.07, k: 25, regions: 12, classes: 8, quarters: 12 };
  var RUNGS = [
    { id: "base", label: "Base case", set: {}, opts: {}, certain: [] },
    { id: "sponsor", label: "The sponsor's case", set: { price: 40, adds: 7, churn: 0.08 }, opts: {}, certain: [] },
    { id: "tight", label: "Consent and anonymity tightened", set: {}, opts: { funnel: TIGHT }, certain: [] },
    { id: "exclusive", label: "One exclusive licensee", set: {}, opts: { exclusive: EXCLUSIVE }, certain: [] },
    { id: "certain", label: "Every input held certain (break)", set: {}, opts: {}, certain: KEYS.slice() }
  ];
  function rung(r) {
    var p = copy(BASE);
    for (var k in r.set) if (Object.prototype.hasOwnProperty.call(r.set, k)) p[k] = r.set[k];
    var d = desk(p, r.opts), s = simulate(p, r.opts, r.certain);
    return { id: r.id, label: r.label, y5rev: d.rows[d.rows.length - 1].revenue, cum: d.cum, breakeven: d.breakeven,
      npv: d.npv, cover: d.cover, p10: s.p10, p50: s.p50, p90: s.p90, pNever: s.pNever };
  }

  return {
    SEED: SEED, DRAWS: DRAWS, copy: copy, withInput: withInput, rng: rng, tri: tri,
    ASSETS: ASSETS, lenses: lenses, lensTable: lensTable,
    FUNNEL: FUNNEL, STAGES: STAGES, GRID: GRID, funnel: funnel, kCurve: kCurve, BASE_COVER: BASE_COVER,
    PLATFORM: PLATFORM, TIERS: TIERS, AMORT: AMORT, MIX: MIX, costPerCustomer: costPerCustomer,
    SEGMENTS: SEGMENTS, CAPTURE: CAPTURE, BUYERS: BUYERS, single: single, bestSingle: bestSingle,
    STD_SHARE: STD_SHARE, tiered: tiered, bestTiered: bestTiered, costPlus: costPlus,
    DEAL: DEAL, dealSim: dealSim, dealTable: dealTable,
    BASE: BASE, KEYS: KEYS, LABELS: LABELS, RANGES: RANGES, RATE: RATE, desk: desk, npvAt: npvAt,
    breakeven: breakeven, simulate: simulate, EXCLUSIVE: EXCLUSIVE, TIGHT: TIGHT, RUNGS: RUNGS, rung: rung
  };
}));
