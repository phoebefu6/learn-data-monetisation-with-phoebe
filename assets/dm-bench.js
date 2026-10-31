/* dm-bench.js - the data monetisation widgets. Renders into any element with class "dmx-widget":
 *   data-mode="lenses"  Analyst session 1 (and Leader session 1), three prices for one dataset
 *   data-mode="funnel"  Analyst session 2 (and Leader session 2), the sellable share and the k threshold
 *   data-mode="cost"    Analyst session 3, cost to serve and the cost curve
 *   data-mode="price"   Analyst session 4 (and Leader session 3), one price or two tiers
 *   data-mode="deal"    Analyst session 5, direct, reseller or exclusive licence
 *   data-mode="desk"    Analyst session 6 (and Leader session 4), the data product P&L desk
 * Every number is computed by dm-live.js when the page loads or a control changes. */
(function () {
  "use strict";
  var D = window.DMX;
  if (!D) return;
  var HONEST = "Keelson Mutual is constructed; every input is invented for teaching. The arithmetic is real and runs in your browser.";
  var STEP = { build: 5, run: 5, cust1: 1, adds: 1, churn: 0.01, price: 1, serve: 0.5, sales: 0.5, partner: 0.05, commission: 0.05 };

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function rd(x, k) { return Math.floor(x * k + 0.5) / k; }
  function k1(x) { var v = rd(x, 10); return (v > 0 ? "+" : v < 0 ? "-" : "") + Math.abs(v).toFixed(1) + "k"; }
  function kp(x) { return rd(x, 10).toFixed(1) + "k"; }
  function pc(x) { return x == null ? "none" : rd(x * 100, 10).toFixed(1) + "%"; }
  function num(x) { return Math.round(x).toLocaleString("en-US"); }
  function yrs(x) { return x == null ? "not within 5 years" : rd(x, 10).toFixed(1) + " years"; }
  function fmtIn(k, v) {
    if (k === "churn" || k === "partner" || k === "commission") return pc(v);
    if (k === "cust1" || k === "adds") return Math.round(v) + " customers";
    return kp(v);
  }
  function shell(root, title, hint) {
    var w = el("div", "wk dmx-wk"), h = el("div", "wk-head");
    h.appendChild(el("b", null, title)); if (hint) h.appendChild(el("span", "wk-hint", hint));
    var body = el("div", "wk-body"), foot = el("div", "wk-foot");
    foot.appendChild(el("span", "dmx-kind", "constructed inputs · real arithmetic"));
    foot.appendChild(document.createTextNode(" " + HONEST));
    w.appendChild(h); w.appendChild(body); w.appendChild(foot); root.appendChild(w); return body;
  }
  function metrics(box, list) {
    var m = el("div", "mb-metrics dmx-metrics");
    list.forEach(function (x) {
      var c = el("div", "mb-metric" + (x.bad ? " dmx-neg" : ""));
      c.appendChild(el("span", "mb-mvalue", x.v)); c.appendChild(el("span", "mb-mlabel", x.l)); m.appendChild(c);
    });
    box.appendChild(m); return m;
  }
  function table(head, rows) {
    var w = el("div", "mk-tablewrap"), t = el("table", "mk-table dmx-table"), tr = el("tr");
    head.forEach(function (h) { tr.appendChild(el("th", null, h)); });
    var th = el("thead"); th.appendChild(tr); t.appendChild(th);
    var tb = el("tbody");
    rows.forEach(function (r) {
      var row = el("tr", r.cls || null);
      r.cells.forEach(function (c) { row.appendChild(el("td", null, c)); });
      tb.appendChild(row);
    });
    t.appendChild(tb); w.appendChild(t); return w;
  }
  function check(parent, label, on, cb) {
    var lab = el("label", "mb-ctl"), inp = document.createElement("input"); inp.type = "checkbox"; inp.checked = !!on;
    inp.setAttribute("aria-label", label); inp.addEventListener("change", function () { cb(inp.checked); });
    lab.appendChild(inp); lab.appendChild(document.createTextNode(label)); parent.appendChild(lab); return inp;
  }
  function slider(parent, label, min, max, step, value, fmt, cb) {
    var lab = el("label", "mb-ctl mb-range dmx-range"); lab.appendChild(el("span", "dmx-rlabel", label));
    var inp = document.createElement("input"); inp.type = "range"; inp.min = min; inp.max = max; inp.step = step; inp.value = value;
    inp.setAttribute("aria-label", label);
    var out = el("b", null, fmt(+value));
    inp.addEventListener("input", function () { out.textContent = fmt(+inp.value); cb(+inp.value); });
    lab.appendChild(inp); lab.appendChild(out); parent.appendChild(lab);
    return { input: inp, set: function (v) { inp.value = v; out.textContent = fmt(+v); } };
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  /* horizontal bars from zero, one row per item (reuses the tornado row layout) */
  function hbars(box, rows, max, fmt) {
    var wrap = el("div", "dmx-tornado");
    rows.forEach(function (r, i) {
      var row = el("div", "dmx-trow" + (r.top ? " is-top" : ""));
      row.appendChild(el("span", "dmx-tlab", r.label));
      var tr = el("span", "dmx-ttrack"), bar = el("i", "dmx-bar");
      bar.style.left = "0%"; bar.style.width = "calc(" + (max > 0 ? (100 * r.value / max).toFixed(2) : "0") + "% + 2px)";
      tr.appendChild(bar); row.appendChild(tr);
      row.appendChild(el("span", "dmx-tval", fmt(r.value)));
      wrap.appendChild(row);
    });
    box.appendChild(wrap);
  }
  function histogram(box, sim, label) {
    var s = sim.sorted, n = s.length, lo = s[0], hi = s[n - 1];
    var wrap = el("div", "dmx-hist");
    if (hi - lo < 1e-9) {
      wrap.appendChild(el("p", "dmx-flat", "Every draw gives the same answer, " + k1(lo) + ". With no uncertainty in the inputs there is no range to report."));
      box.appendChild(wrap); return;
    }
    var bins = 30, w = (hi - lo) / bins, cnt = [], i, max = 0;
    for (i = 0; i < bins; i++) cnt.push(0);
    for (i = 0; i < n; i++) cnt[Math.min(bins - 1, Math.floor((s[i] - lo) / w))]++;
    cnt.forEach(function (c) { max = Math.max(max, c); });
    var bars = el("div", "dmx-hbars");
    cnt.forEach(function (c, j) {
      var b = el("i", (lo + (j + 1) * w) <= 0 ? "is-neg" : ""); b.style.height = (100 * c / max).toFixed(1) + "%"; bars.appendChild(b);
    });
    wrap.appendChild(bars);
    var ax = el("div", "dmx-hax"); ax.appendChild(el("span", null, k1(lo))); ax.appendChild(el("span", null, label || "")); ax.appendChild(el("span", null, k1(hi))); wrap.appendChild(ax);
    box.appendChild(wrap);
  }

  /* ---------- a1 / b1: three prices for one dataset ---------- */
  function lensesMode(root) {
    var body = shell(root, "Three prices for one dataset", "Cost, market and economic lens on five Keelson assets");
    var ctl = el("div", "mb-ctls"), out = el("div"), ignore = false, lens = "economic";
    var pick = el("div", "mb-presets dmx-rungs");
    [["cost", "Cost lens"], ["market", "Market lens"], ["economic", "Economic lens"]].forEach(function (x) {
      var lab = el("label", "mb-preset" + (x[0] === lens ? " is-on" : "")), inp = document.createElement("input");
      inp.type = "radio"; inp.name = "dmx-lens-" + Math.random().toString(36).slice(2, 7); inp.checked = x[0] === lens;
      inp.setAttribute("aria-label", x[1]);
      inp.addEventListener("change", function () { pick.querySelectorAll(".mb-preset").forEach(function (n) { n.classList.remove("is-on"); }); lab.classList.add("is-on"); lens = x[0]; draw(); });
      lab.appendChild(inp); lab.appendChild(el("span", "mb-pname", x[1])); pick.appendChild(lab);
    });
    check(ctl, "Pretend every asset may be sold (ignore licences and consent)", false, function (v) { ignore = v; draw(); });
    body.appendChild(pick); body.appendChild(ctl); body.appendChild(out);
    function draw() {
      clear(out);
      var list = D.ASSETS.map(function (a) {
        var q = D.copy(a);
        if (ignore && a.buyers === 0) { q.buyers = 6; q.fee = 30; }
        return q;
      });
      var rows = D.lensTable(list), max = 0;
      rows.forEach(function (r) { max = Math.max(max, r[lens]); });
      var sorted = rows.slice().sort(function (a, b) { return a[lens + "Rank"] - b[lens + "Rank"]; });
      hbars(out, sorted.map(function (r, i) { return { label: r.name, value: r[lens], top: i === 0 }; }), max, kp);
      out.appendChild(table(["Asset", "Cost lens", "Market lens", "Economic lens", "Rank: cost / market / economic"], rows.map(function (r) {
        var a = D.ASSETS.filter(function (x) { return x.id === r.id; })[0];
        return { cls: a.note && !ignore ? "dmx-flag" : null, cells: [r.name + (a.note && !ignore ? " (" + a.note + ")" : ""), kp(r.cost), kp(r.market), kp(r.economic), r.costRank + " / " + r.marketRank + " / " + r.economicRank] };
      })));
      out.appendChild(el("p", "dmx-note", "Cost lens = yearly cost x years held. Market lens = lawful buyers x yearly licence fee. Economic lens = (yearly benefit in use - yearly run cost) x years of useful life. All in thousands."));
    }
    draw();
  }

  /* ---------- a2 / b2: the sellable share ---------- */
  function funnelMode(root) {
    var body = shell(root, "The sellable share", "Lawful basis, objections, licences, special category, then the k threshold");
    var f = D.copy(D.FUNNEL), ctl = el("div", "dmx-inputs"), out = el("div");
    slider(ctl, "Notice did not cover reuse", 0, 0.4, 0.01, f.notice, pc, function (v) { f.notice = v; draw(); });
    slider(ctl, "Customers who objected", 0, 0.2, 0.01, f.objected, pc, function (v) { f.objected = v; draw(); });
    slider(ctl, "Third-party licence forbids onward use", 0, 0.4, 0.01, f.licence, pc, function (v) { f.licence = v; draw(); });
    slider(ctl, "Injury claims held back", 0, 0.2, 0.01, f.special, pc, function (v) { f.special = v; draw(); });
    slider(ctl, "Smallest cell you will publish (k)", 2, 60, 1, f.k, function (v) { return v + " records"; }, function (v) { f.k = v; draw(); });
    body.appendChild(ctl); body.appendChild(out);
    function draw() {
      clear(out);
      var x = D.funnel(f);
      hbars(out, x.steps.map(function (s, i) { return { label: s.label, value: s.left, top: i === x.steps.length - 1 }; }), f.records, num);
      metrics(out, [
        { v: pc(x.sellableShare), l: "of records end up in a published cell" },
        { v: num(x.keptCells) + " of " + num(x.cells), l: "cells published (" + pc(x.cellCoverage) + ")" },
        { v: num(x.placed - x.published), l: "records lost to suppressed cells" }
      ]);
      out.appendChild(el("h4", "dmx-h", "Raise k and watch the two shares part"));
      out.appendChild(table(["k", "Cells published", "Records in published cells"], D.kCurve(f).map(function (r) {
        return { cls: r.k === f.k ? "dmx-near" : null, cells: [String(r.k), pc(r.cellCoverage) + " (" + num(r.keptCells) + ")", pc(r.sellableShare)] };
      })));
      out.appendChild(el("p", "dmx-note", "Grid: 12 regions x 8 vehicle classes x 12 quarters = 1,152 cells, fixed by seed " + D.SEED + ". A threshold on cell size is one control among several; it does not by itself make data anonymous."));
    }
    draw();
  }

  /* ---------- a3: package and cost to serve ---------- */
  function costMode(root) {
    var body = shell(root, "Package and cost to serve", "High fixed cost, low cost per extra customer");
    var n = 16, markup = 0.3, ctl = el("div", "dmx-inputs"), out = el("div");
    slider(ctl, "Paying customers", 2, 100, 1, n, function (v) { return v + " customers"; }, function (v) { n = v; draw(); });
    slider(ctl, "Cost-plus markup", 0, 1, 0.05, markup, pc, function (v) { markup = v; draw(); });
    body.appendChild(ctl); body.appendChild(out);
    function draw() {
      clear(out);
      var c = D.costPerCustomer(n, D.MIX);
      metrics(out, [
        { v: kp(c.total), l: "cost per customer per year" },
        { v: kp(c.perCustomerFixed), l: "of which shared fixed cost" },
        { v: kp(c.variable), l: "of which cost to serve one more" },
        { v: kp(c.total * (1 + markup)), l: "cost-plus price at " + pc(markup) }
      ]);
      out.appendChild(table(["Tier", "Build (spread over " + D.AMORT + " years)", "Cost to serve per customer", "Share of customers"], D.TIERS.map(function (t) {
        return { cells: [t.name, kp(t.build), kp(t.serve), pc(D.MIX[t.id] || 0)] };
      }).concat([{ cls: "dmx-near", cells: ["Shared platform (pipeline, steward, DPIA, legal)", kp(D.PLATFORM.build), "run " + kp(D.PLATFORM.run) + " per year", "every customer"] }])));
      out.appendChild(el("h4", "dmx-h", "The cost curve"));
      out.appendChild(table(["Customers", "Cost per customer"], [5, 10, 16, 20, 40, 80].map(function (m) {
        return { cls: m === n ? "dmx-near" : null, cells: [String(m), kp(D.costPerCustomer(m, D.MIX).total)] };
      })));
    }
    draw();
  }

  /* ---------- a4 / b3: pricing a data product ---------- */
  function priceMode(root) {
    var body = shell(root, "One price, or two tiers", "110 constructed prospects, each with a yearly value from the index");
    var cap = D.CAPTURE, price = 32, ctl = el("div", "dmx-inputs"), out = el("div");
    var serve = D.TIERS[2].serve;
    slider(ctl, "Share of value a buyer will pay", 0.1, 0.4, 0.01, cap, pc, function (v) { cap = v; draw(); });
    slider(ctl, "Your API price per year", 4, 80, 1, price, kp, function (v) { price = v; draw(); });
    body.appendChild(ctl); body.appendChild(out);
    function draw() {
      clear(out);
      var s = D.single(price, cap, serve), best = D.bestSingle(cap, serve), t = D.bestTiered(cap);
      metrics(out, [
        { v: String(s.buyers), l: "buyers at " + kp(price) },
        { v: kp(s.contribution), l: "contribution (price minus cost to serve)", bad: s.contribution < 0 },
        { v: kp(best.price) + " / " + kp(best.contribution), l: "best single price / its contribution" },
        { v: kp(t.ps) + " + " + kp(t.pp), l: "best Standard + Pro prices (" + kp(t.contribution) + ")" }
      ]);
      var prof = el("div", "dmx-profile"), bars = el("div", "dmx-pbars"), vals = [], mx = 0, pp;
      for (pp = 4; pp <= 80; pp += 2) { var c = D.single(pp, cap, serve).contribution; vals.push([pp, c]); mx = Math.max(mx, Math.abs(c)); }
      vals.forEach(function (v) {
        var col = el("span", "dmx-pcol" + (Math.abs(v[0] - price) < 1 ? " is-here" : "")), b = el("i", v[1] < 0 ? "is-neg" : "");
        b.style.bottom = "0"; b.style.height = (mx > 0 ? 100 * Math.abs(v[1]) / mx : 0).toFixed(1) + "%"; col.appendChild(b); bars.appendChild(col);
      });
      prof.appendChild(bars);
      var ax = el("div", "dmx-hax"); ax.appendChild(el("span", null, "price 4.0k")); ax.appendChild(el("span", null, "contribution by price")); ax.appendChild(el("span", null, "80.0k")); prof.appendChild(ax);
      out.appendChild(prof);
      out.appendChild(table(["Segment", "Prospects", "Buy at " + kp(price)], D.SEGMENTS.map(function (g) {
        var n = 0; D.BUYERS.forEach(function (b) { if (b.seg === g.id && b.value * cap >= price) n++; });
        return { cells: [g.name, String(g.n), String(n)] };
      })));
      out.appendChild(el("p", "dmx-note", "Two tiers: Standard (the report, half the value, cost to serve " + kp(D.TIERS[0].serve) + ") and Pro (the API, full value, " + kp(serve) + "). Best pair sells " + t.std + " Standard and " + t.pro + " Pro for revenue " + kp(t.revenue) + "."));
    }
    draw();
  }

  /* ---------- a5: partner deal maths ---------- */
  function dealMode(root) {
    var body = shell(root, "Direct, reseller or exclusive", "One steady-state year, 5,000 seeded draws per route");
    var d = JSON.parse(JSON.stringify(D.DEAL)), ctl = el("div", "dmx-inputs"), out = el("div");
    slider(ctl, "Reseller commission", 0.1, 0.5, 0.05, d.commission, pc, function (v) { d.commission = v; draw(); });
    slider(ctl, "Exclusive minimum guarantee", 0, 600, 20, d.mg, kp, function (v) { d.mg = v; draw(); });
    slider(ctl, "Exclusive revenue share", 0.05, 0.5, 0.05, d.share, pc, function (v) { d.share = v; draw(); });
    body.appendChild(ctl); body.appendChild(out);
    var NAMES = { direct: "Sell direct", reseller: "Through a reseller", exclusive: "One exclusive licensee" };
    function draw() {
      clear(out);
      var rows = D.dealTable(d);
      out.appendChild(table(["Route", "P10", "P50", "P90", "Mean", "Years at the guarantee"], rows.map(function (r) {
        return { cells: [NAMES[r.route], k1(r.p10), k1(r.p50), k1(r.p90), k1(r.mean), r.route === "exclusive" ? pc(r.atFloor) : "-"] };
      })));
      out.appendChild(el("p", "dmx-note", "Direct: Keelson's own customers x (price " + kp(d.price) + " - serve " + kp(d.serve) + " - sales " + kp(d.sales) + "). Reseller: more customers, Keelson keeps " + pc(1 - d.commission) + " of price and still serves them. Exclusive: the larger of the guarantee and " + pc(d.share) + " of the licensee's revenue; nobody else may buy."));
    }
    draw();
  }

  /* ---------- a6 / b4: the P&L desk ---------- */
  function deskMode(root) {
    var lean = root.getAttribute("data-inputs") === "off";
    var body = shell(root, "The data product P&L desk", lean ? "Pick a rung; every number is computed" : "Pick a rung, then move anything");
    var p = D.copy(D.BASE), o = {}, certain = [], ctrls = {}, flags = {};
    var pre = el("div", "mb-presets dmx-rungs"), inputs = el("div", "dmx-inputs"), tog = el("div", "mb-ctls"), out = el("div");
    var nm = "dmx-rung-" + Math.random().toString(36).slice(2, 7);
    D.RUNGS.forEach(function (r, i) {
      var lab = el("label", "mb-preset" + (r.id === "certain" ? " is-anti" : "") + (i === 0 ? " is-on" : ""));
      var inp = document.createElement("input"); inp.type = "radio"; inp.name = nm; inp.checked = i === 0;
      inp.setAttribute("aria-label", r.label);
      inp.addEventListener("change", function () {
        pre.querySelectorAll(".mb-preset").forEach(function (x) { x.classList.remove("is-on"); }); lab.classList.add("is-on"); apply(r);
      });
      lab.appendChild(inp); lab.appendChild(el("span", "mb-pname", (i + 1) + ". " + r.label)); pre.appendChild(lab);
    });
    D.KEYS.forEach(function (k) {
      ctrls[k] = slider(inputs, D.LABELS[k], D.RANGES[k][0], D.RANGES[k][1], STEP[k], p[k], function (v) { return fmtIn(k, v); }, function (v) { p[k] = v; draw(); });
    });
    flags.tight = check(tog, "Tighten consent and anonymity (notice 20%, k 25)", false, function (v) { if (v) o.funnel = D.TIGHT; else delete o.funnel; draw(); });
    flags.excl = check(tog, "Sell through one exclusive licensee", false, function (v) { if (v) o.exclusive = D.EXCLUSIVE; else delete o.exclusive; draw(); });
    flags.certain = check(tog, "Hold every input certain", false, function (v) { certain = v ? D.KEYS.slice() : []; draw(); });
    body.appendChild(pre);
    if (!lean) { body.appendChild(inputs); body.appendChild(tog); }
    body.appendChild(out);
    function apply(r) {
      p = D.copy(D.BASE); for (var k in r.set) p[k] = r.set[k];
      o = {}; if (r.opts.funnel) o.funnel = r.opts.funnel; if (r.opts.exclusive) o.exclusive = r.opts.exclusive;
      certain = r.certain.slice();
      D.KEYS.forEach(function (k) { ctrls[k].set(p[k]); });
      flags.tight.checked = !!o.funnel; flags.excl.checked = !!o.exclusive; flags.certain.checked = certain.length > 0;
      draw();
    }
    function draw() {
      clear(out);
      var d = D.desk(p, o), sim = D.simulate(p, o, certain);
      out.appendChild(el("h4", "dmx-h", "Five years, year by year"));
      out.appendChild(table(["Year", "Customers", "Revenue", "Cash", "Cumulative cash"], [{ cells: ["0 (build)", "-", "-", k1(d.cf[0]), k1(d.cf[0])] }].concat(d.rows.map(function (r) {
        return { cls: r.cum < 0 ? null : "dmx-near", cells: [String(r.year), rd(r.customers, 10).toFixed(1), kp(r.revenue), k1(r.cash), k1(r.cum)] };
      }))));
      metrics(out, [
        { v: k1(d.cum), l: "cumulative cash after year 5", bad: d.cum < 0 },
        { v: yrs(d.breakeven), l: "cash break-even" },
        { v: pc(d.cover), l: "cells published (prices scale with it)" },
        { v: k1(d.npv), l: "NPV at Keelson's 9% hurdle", bad: d.npv < 0 }
      ]);
      out.appendChild(el("h4", "dmx-h", "The range"));
      metrics(out, [
        { v: k1(sim.p10), l: "P10 cumulative cash", bad: sim.p10 < 0 }, { v: k1(sim.p50), l: "P50", bad: sim.p50 < 0 },
        { v: k1(sim.p90), l: "P90", bad: sim.p90 < 0 }, { v: pc(sim.pNever), l: "chance of no break-even in 5 years", bad: sim.pNever > 0.5 }
      ]);
      histogram(out, sim, "cumulative cash, year 5");
      out.appendChild(el("p", "dmx-note", "Cash flows to take to a business case: " + d.cf.map(k1).join(", ") + ". Seed " + (D.SEED + 3) + ", " + num(sim.n) + " draws, each input from a triangular range around the value shown."));
      out.appendChild(el("h4", "dmx-h", "The ladder, every rung computed"));
      out.appendChild(table(["Rung", "Year-5 revenue", "5-year cash", "Break-even", "P10", "P50", "P90", "No break-even"], D.RUNGS.map(function (r) {
        var x = D.rung(r);
        return { cells: [r.label, kp(x.y5rev), k1(x.cum), yrs(x.breakeven), k1(x.p10), k1(x.p50), k1(x.p90), pc(x.pNever)] };
      })));
    }
    draw();
  }

  var MODES = { lenses: lensesMode, funnel: funnelMode, cost: costMode, price: priceMode, deal: dealMode, desk: deskMode };
  document.querySelectorAll(".dmx-widget").forEach(function (root) {
    var f = MODES[root.getAttribute("data-mode")];
    if (f) f(root);
  });
}());
