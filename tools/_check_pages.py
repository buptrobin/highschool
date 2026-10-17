# -*- coding: utf-8 -*-
import glob
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

for f in sorted(glob.glob("pages/geo/xx1-*.html")):
    s = open(f, encoding="utf-8").read()
    key = f.split("xx1-")[1][:-5]
    issues = []
    if s.count('<script type="text/markdown" id="md">') != 1:
        issues.append("md-open x%d" % s.count('<script type="text/markdown" id="md">'))
    m = re.search(r'<script type="text/markdown" id="md">(.*?)</script>', s, re.S)
    body = m.group(1) if m else ""
    if "<script" in body:
        issues.append("script-inside-md")
    if 'gx.css' not in s:
        issues.append("no-gx.css")
    if 'gx.js' not in s:
        issues.append("no-gx.js")
    if "</html>" not in s:
        issues.append("no-html-end")
    if s.count("<h1") != 1:
        issues.append("h1 x%d" % s.count("<h1"))
    if body.count('<div class="gx">') != 1:
        issues.append("gx-wrap")
    if body.count('id="gxStage"') != 1:
        issues.append("stage x%d" % body.count('id="gxStage"'))
    print("[%s] %s" % (key, "OK" if not issues else " ".join(issues)))
