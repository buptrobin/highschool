# -*- coding: utf-8 -*-
import glob
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

for f in sorted(glob.glob("pages/geo/xx2-*.html")):
    s = open(f, encoding="utf-8").read()
    m = re.search(r'<p class="ans-b">(.*?)</p>', s, re.S)
    t = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else "MISSING"
    t = re.sub(r"\s+", " ", t)
    key = f.split("xx2-")[1][:-5]
    print("[" + key + "] " + t[:300])
    print()
