#!/usr/bin/env python3
"""Writes index.html (landing page) with the knowledge map data serialised by json.dumps.
Internal build script; never linked from an audience page."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
B = [("b1-three-roads-to-data-revenue", "Three roads to\ndata revenue", "#34D399", ["Improve, wrap, sell", "Five capabilities", "Not on the balance sheet"]),
     ("b2-is-it-ours-to-sell", "Is it ours\nto sell", "#34D399", ["Lawful basis", "The licence chain", "Anonymous or not"]),
     ("b3-products-prices-and-partners", "Products, prices\nand partners", "#FBBF24", ["The packaging ladder", "Value, not volume", "Who sells it"]),
     ("b4-the-board-call", "The board call", "#FB923C", ["Five rungs", "The risk register", "Go or no-go"])]
A = [("a1-three-prices-for-one-dataset", "Three prices for\none dataset", "#34D399", ["Cost lens", "Market lens", "Economic lens"]),
     ("a2-the-sellable-share", "The sellable\nshare", "#34D399", ["The funnel", "The k threshold", "Cells vs records"]),
     ("a3-package-and-cost-to-serve", "Package and\ncost to serve", "#FBBF24", ["Tiers", "Fixed vs variable", "The cost curve"]),
     ("a4-pricing-a-data-product", "Pricing a\ndata product", "#FBBF24", ["Capture share", "Price search", "Two tiers"]),
     ("a5-partner-deal-maths", "Partner\ndeal maths", "#FB923C", ["Reseller", "Exclusive licence", "The guarantee"]),
     ("a6-the-data-product-pl-desk", "The data product\nP&L desk", "#F87171", ["Five rungs", "Break it", "Hand to finance"])]
MM = {"title": "Data\nmonetisation", "centerColor": "#2E2A08",
      "sessions": [{"label": s[1], "href": "courses/%s.html" % s[0], "color": s[2],
                    "concepts": [{"label": c, "href": "courses/%s.html" % s[0]} for c in s[3]]} for s in B + A]}
tpl = open(os.path.join(HERE, "index.template.html")).read()
out = tpl.replace("/*MINDMAP*/", "window.MINDMAP_DATA = " + json.dumps(MM, indent=2) + ";")
open(os.path.join(HERE, "..", "index.html"), "w").write(out)
print("index.html written")
