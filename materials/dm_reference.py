"""dm_reference.py - Python mirror of assets/dm-live.js, written independently so the two can be
compared by value (materials/compare-ladder.py). Stdlib only. Every Keelson number is constructed.

Run:  python3 materials/dm_reference.py > materials/canon-py.json
"""
from __future__ import annotations

import json
import math
import sys

SEED, DRAWS = 20261031, 5000


def rng(seed: int):
    """mulberry32, bit for bit the same as dm-live.js."""
    state = [seed & 0xFFFFFFFF]

    def imul(a: int, b: int) -> int:
        return (a * b) & 0xFFFFFFFF

    def nxt() -> float:
        state[0] = (state[0] + 0x6D2B79F5) & 0xFFFFFFFF
        t = state[0]
        t = imul(t ^ (t >> 15), t | 1)
        t = (t ^ ((t + imul(t ^ (t >> 7), t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296

    return nxt


def tri(u: float, a: float, m: float, b: float) -> float:
    if b == a:
        return m
    c = (m - a) / (b - a)
    if u < c:
        return a + math.sqrt(u * (b - a) * (m - a))
    return b - math.sqrt((1 - u) * (b - a) * (b - m))


def quant(s: list[float], q: float) -> float:
    return s[math.floor(q * (len(s) - 1))]


def half_up(x: float) -> int:
    return math.floor(x + 0.5)


# ---------- Analyst session 1: three prices for one dataset ----------
ASSETS = [
    {"id": "motor", "cost": 310, "held": 8, "buyers": 14, "fee": 45, "benefit": 520, "run": 60, "life": 5},
    {"id": "home", "cost": 140, "held": 6, "buyers": 6, "fee": 30, "benefit": 180, "run": 25, "life": 5},
    {"id": "invoice", "cost": 90, "held": 5, "buyers": 0, "fee": 0, "benefit": 260, "run": 20, "life": 5},
    {"id": "telem", "cost": 220, "held": 2, "buyers": 3, "fee": 20, "benefit": 40, "run": 35, "life": 3},
    {"id": "calls", "cost": 60, "held": 4, "buyers": 0, "fee": 0, "benefit": 90, "run": 15, "life": 4},
]


def lens_table() -> list[dict]:
    rows = [{"id": a["id"], "cost": a["cost"] * a["held"], "market": a["buyers"] * a["fee"],
             "economic": (a["benefit"] - a["run"]) * a["life"]} for a in ASSETS]
    for k in ("cost", "market", "economic"):
        order = sorted(rows, key=lambda r: (-r[k], r["id"]))
        for i, r in enumerate(order):
            r[k + "Rank"] = i + 1
    return rows


# ---------- Analyst session 2: the sellable share ----------
FUNNEL = {"records": 180000, "notice": 0.08, "objected": 0.03, "licence": 0.12, "special": 0.07,
          "k": 10, "regions": 12, "classes": 8, "quarters": 12}
STAGES = ["notice", "objected", "licence", "special"]


def make_grid() -> list[float]:
    r = rng(SEED)
    wr = []
    wc = []
    for _ in range(FUNNEL["regions"]):
        u = r()
        wr.append(0.08 + 2 * u * u * u)
    for _ in range(FUNNEL["classes"]):
        v = r()
        wc.append(0.1 + 1.6 * v * v)
    w = []
    tot = 0.0
    for i in range(FUNNEL["regions"]):
        for j in range(FUNNEL["classes"]):
            for q in range(FUNNEL["quarters"]):
                x = wr[i] * wc[j] * (1 + 0.02 * q) * (0.6 + 0.8 * r())
                w.append(x)
                tot += x
    return [x / tot for x in w]


GRID = make_grid()


def funnel(f: dict | None = None) -> dict:
    f = f or FUNNEL
    n = f["records"]
    left = [n]
    for s in STAGES:
        n = n - half_up(n * f[s])
        left.append(n)
    eligible = n
    kept = kept_rec = placed = 0
    for g in GRID:
        c = math.floor(eligible * g)
        placed += c
        if c >= f["k"]:
            kept += 1
            kept_rec += c
    return {"left": left + [kept_rec], "eligible": eligible, "keptCells": kept, "placed": placed,
            "published": kept_rec, "cellCoverage": kept / len(GRID), "sellableShare": kept_rec / f["records"]}


BASE_COVER = funnel()["cellCoverage"]


def k_curve() -> list[dict]:
    out = []
    for k in (5, 10, 15, 20, 25, 30, 40, 50):
        x = funnel({**FUNNEL, "k": k})
        out.append({"k": k, "cellCoverage": x["cellCoverage"], "sellableShare": x["sellableShare"],
                    "keptCells": x["keptCells"]})
    return out


# ---------- Analyst session 3: package and cost to serve ----------
PLATFORM = {"build": 120, "run": 150}
TIERS = [("report", 40, 1.5), ("dash", 90, 4), ("api", 160, 9), ("bespoke", 0, 35)]
AMORT = 3
MIX = {"report": 0.5, "api": 0.4, "bespoke": 0.1}


def cost_per_customer(n: float, mix: dict) -> dict:
    fixed = PLATFORM["run"] + PLATFORM["build"] / AMORT
    varc = 0.0
    for tid, build, serve in TIERS:
        s = mix.get(tid, 0)
        if s > 0:
            fixed += build / AMORT
            varc += s * serve
    return {"fixed": fixed, "perCustomerFixed": fixed / n, "variable": varc, "total": fixed / n + varc}


# ---------- Analyst session 4: pricing ----------
SEGMENTS = [("fleet", 60, 10, 90), ("repair", 25, 20, 160), ("parts", 10, 60, 320), ("ins", 15, 40, 240)]
CAPTURE = 0.25
STD_SHARE = 0.5


def make_buyers() -> list[float]:
    r = rng(SEED + 1)
    out = []
    for _sid, n, lo, hi in SEGMENTS:
        for _ in range(n):
            u = r()
            out.append(lo + (hi - lo) * u * u)
    return out


BUYERS = make_buyers()


def single(price: float, capture: float, serve: float) -> dict:
    n = sum(1 for v in BUYERS if v * capture * 1 >= price)
    return {"price": price, "buyers": n, "revenue": n * price, "contribution": n * (price - serve)}


def best_single(capture: float, serve: float) -> dict:
    best = None
    p = 1.0
    while p <= 150:
        x = single(p, capture, serve)
        if best is None or x["contribution"] > best["contribution"] + 1e-9:
            best = x
        p += 0.5
    return best


def tiered(ps: float, pp: float, capture: float) -> dict:
    ns = np_ = 0
    for v in BUYERS:
        w = v * capture * 1
        ss = w * STD_SHARE - ps
        sp = w - pp
        if sp >= 0 and sp >= ss:
            np_ += 1
        elif ss >= 0:
            ns += 1
    return {"ps": ps, "pp": pp, "std": ns, "pro": np_, "revenue": ns * ps + np_ * pp,
            "contribution": ns * (ps - 1.5) + np_ * (pp - 9)}


def best_tiered(capture: float) -> dict:
    best = None
    for ps in range(2, 61):
        for pp in range(ps + 1, 151):
            x = tiered(ps, pp, capture)
            if best is None or x["contribution"] > best["contribution"] + 1e-9:
                best = x
    return best


# ---------- Analyst session 5: partner deal maths ----------
DEAL = {"price": 32, "serve": 8, "sales": 5, "direct": (10, 16, 22), "reach": (1.2, 1.8, 2.6),
        "commission": 0.3, "partnerCust": (20, 45, 90), "partnerPrice": 32, "share": 0.2, "mg": 300}


def deal_year(route: str, d: dict, u: float) -> float:
    direct = tri(u, *d["direct"])
    if route == "direct":
        return direct * (d["price"] - d["serve"] - d["sales"])
    if route == "reseller":
        c = direct * tri(u, *d["reach"])
        return c * (d["price"] * (1 - d["commission"]) - d["serve"])
    pc = tri(u, *d["partnerCust"])
    return max(d["mg"], d["share"] * pc * d["partnerPrice"])


def deal_sim(route: str, d: dict = DEAL) -> dict:
    r = rng(SEED + 2)
    out = []
    floor = 0
    for _ in range(DRAWS):
        v = deal_year(route, d, r())
        if route == "exclusive" and v == d["mg"]:
            floor += 1
        out.append(v)
    s = sorted(out)
    return {"route": route, "p10": quant(s, 0.1), "p50": quant(s, 0.5), "p90": quant(s, 0.9),
            "mean": sum(out) / DRAWS, "atFloor": floor / DRAWS}


# ---------- Analyst session 6: the P&L desk ----------
BASE = {"build": 330, "run": 150, "cust1": 6, "adds": 4, "churn": 0.15, "price": 32, "serve": 8,
        "sales": 5, "partner": 0.3, "commission": 0.3, "years": 5}
KEYS = ["build", "run", "cust1", "adds", "churn", "price", "serve", "sales", "partner", "commission"]
RANGES = {"build": (300, 430), "run": (130, 220), "cust1": (3, 9), "adds": (2, 7), "churn": (0.08, 0.25),
          "price": (26, 40), "serve": (6, 11), "sales": (3, 8), "partner": (0.15, 0.5),
          "commission": (0.2, 0.4)}
RATE = 0.09
EXCLUSIVE = {"mg": 300, "share": 0.2, "reach": 2.5}
TIGHT = {**FUNNEL, "notice": 0.2, "k": 25}


def npv_at(cf: list[float], r: float) -> float:
    return sum(c / (1 + r) ** t for t, c in enumerate(cf))


def breakeven(cf: list[float]):
    cum = 0.0
    for t, c in enumerate(cf):
        nxt = cum + c
        if t > 0 and nxt >= 0 and cum < 0:
            return (t - 1) + (-cum) / c
        cum = nxt
    return None


def desk(p: dict, opts: dict | None = None) -> dict:
    opts = opts or {}
    cover = funnel(opts["funnel"])["cellCoverage"] if opts.get("funnel") else BASE_COVER
    mult = cover / BASE_COVER
    cf = [-p["build"]]
    rows = []
    c = 0.0
    cum = -p["build"]
    for t in range(1, p["years"] + 1):
        adds = p["cust1"] if t == 1 else p["adds"]
        c = p["cust1"] if t == 1 else c * (1 - p["churn"]) + p["adds"]
        gross = c * p["price"] * mult
        if opts.get("exclusive"):
            x = opts["exclusive"]
            rev = max(x["mg"], x["share"] * c * x["reach"] * p["price"] * mult)
            serve_c = sales_c = 0.0
        else:
            rev = gross * (1 - p["partner"] * p["commission"])
            serve_c = c * p["serve"]
            sales_c = adds * p["sales"] * (1 - p["partner"])
        cash = rev - p["run"] - serve_c - sales_c
        cum += cash
        cf.append(cash)
        rows.append({"customers": c, "revenue": rev, "cash": cash, "cum": cum})
    return {"cf": cf, "rows": rows, "cover": cover, "cum": cum, "breakeven": breakeven(cf), "npv": npv_at(cf, RATE)}


def simulate(p: dict, opts: dict | None = None, certain: list | None = None) -> dict:
    certain = certain or []
    r = rng(SEED + 3)
    out = []
    never = 0
    for _ in range(DRAWS):
        q = dict(p)
        for k in KEYS:
            u = r()
            if k not in certain:
                q[k] = tri(u, min(RANGES[k][0], p[k]), p[k], max(RANGES[k][1], p[k]))
        d = desk(q, opts)
        if d["breakeven"] is None:
            never += 1
        out.append(d["cum"])
    s = sorted(out)
    return {"p10": quant(s, 0.1), "p50": quant(s, 0.5), "p90": quant(s, 0.9), "mean": sum(out) / DRAWS,
            "pNever": never / DRAWS}


RUNGS = [("base", {}, {}, []), ("sponsor", {"price": 40, "adds": 7, "churn": 0.08}, {}, []),
         ("tight", {}, {"funnel": TIGHT}, []), ("exclusive", {}, {"exclusive": EXCLUSIVE}, []),
         ("certain", {}, {}, KEYS)]


def rungs() -> list[dict]:
    out = []
    for rid, st, opts, certain in RUNGS:
        p = {**BASE, **st}
        d = desk(p, opts)
        s = simulate(p, opts, certain)
        out.append({"id": rid, "y5rev": d["rows"][-1]["revenue"], "cum": d["cum"], "breakeven": d["breakeven"],
                    "npv": d["npv"], "cover": d["cover"], "p10": s["p10"], "p50": s["p50"], "p90": s["p90"],
                    "pNever": s["pNever"]})
    return out


def canon() -> dict:
    f = funnel()
    t = funnel(TIGHT)
    base = desk(BASE)
    sponsor_excl = desk({**BASE, "price": 40, "adds": 7, "churn": 0.08}, {"exclusive": EXCLUSIVE})
    sponsor = desk({**BASE, "price": 40, "adds": 7, "churn": 0.08})
    return {
        "lenses": lens_table(),
        "funnel": {k: f[k] for k in ("left", "eligible", "keptCells", "placed", "published", "cellCoverage",
                                     "sellableShare")},
        "tight": {k: t[k] for k in ("left", "keptCells", "cellCoverage", "sellableShare")},
        "kCurve": k_curve(),
        "cost": {str(n): cost_per_customer(n, MIX)["total"] for n in (5, 10, 16, 20, 40, 80)},
        "costFixed": cost_per_customer(10, MIX)["fixed"], "costVar": cost_per_customer(10, MIX)["variable"],
        "costPlus16": cost_per_customer(16, MIX)["total"] * 1.3,
        "single": best_single(CAPTURE, 9), "tiered": best_tiered(CAPTURE),
        "single40": single(40, CAPTURE, 9), "single24": single(24, CAPTURE, 9),
        "deal": [deal_sim(k) for k in ("direct", "reseller", "exclusive")],
        "desk": {"cf": base["cf"], "customers": [r["customers"] for r in base["rows"]],
                 "revenue": [r["revenue"] for r in base["rows"]], "cum": [r["cum"] for r in base["rows"]],
                 "breakeven": base["breakeven"], "npv": base["npv"]},
        "sponsorExclusiveCum": sponsor_excl["cum"], "sponsorCum": sponsor["cum"],
        "rungs": rungs(),
    }


if __name__ == "__main__":
    json.dump(canon(), sys.stdout, indent=1)
