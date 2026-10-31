/* run-ladder.js - the node side of the canon: prints the same keys as dm_reference.py.
 * Run: node materials/run-ladder.js > materials/canon-js.json */
var D = require("../assets/dm-live.js");
function pick(o, ks) { var r = {}; ks.forEach(function (k) { r[k] = o[k]; }); return r; }
function fun(x) {
  var o = pick(x, ["eligible", "keptCells", "placed", "published", "cellCoverage", "sellableShare"]);
  o.left = x.steps.map(function (s) { return s.left; });
  return o;
}
var f = D.funnel(), t = D.funnel(D.TIGHT), base = D.desk(D.BASE);
var sp = D.copy(D.BASE); sp.price = 40; sp.adds = 7; sp.churn = 0.08;
var tf = fun(t);
var out = {
  lenses: D.lensTable().map(function (r) { return pick(r, ["id", "cost", "market", "economic", "costRank", "marketRank", "economicRank"]); }),
  funnel: fun(f),
  tight: { left: tf.left, keptCells: tf.keptCells, cellCoverage: tf.cellCoverage, sellableShare: tf.sellableShare },
  kCurve: D.kCurve(),
  cost: {}, costFixed: D.costPerCustomer(10, D.MIX).fixed, costVar: D.costPerCustomer(10, D.MIX).variable,
  costPlus16: D.costPerCustomer(16, D.MIX).total * 1.3,
  single: D.bestSingle(D.CAPTURE, 9), tiered: D.bestTiered(D.CAPTURE),
  single40: D.single(40, D.CAPTURE, 9), single24: D.single(24, D.CAPTURE, 9),
  deal: D.dealTable(),
  desk: { cf: base.cf, customers: base.rows.map(function (r) { return r.customers; }),
    revenue: base.rows.map(function (r) { return r.revenue; }), cum: base.rows.map(function (r) { return r.cum; }),
    breakeven: base.breakeven, npv: base.npv },
  sponsorExclusiveCum: D.desk(sp, { exclusive: D.EXCLUSIVE }).cum, sponsorCum: D.desk(sp).cum,
  rungs: D.RUNGS.map(function (r) { var x = D.rung(r); delete x.label; return x; })
};
[5, 10, 16, 20, 40, 80].forEach(function (n) { out.cost[String(n)] = D.costPerCustomer(n, D.MIX).total; });
process.stdout.write(JSON.stringify(out, null, 1));
