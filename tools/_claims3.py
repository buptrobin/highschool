# -*- coding: utf-8 -*-
import glob
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

for f in sorted(glob.glob("pages/geo/xx3-*.html")):
    s = open(f, encoding="utf-8").read()
    key = f.replace("\\", "/").split("pages/geo/")[1][:-5]
    m = re.search(r'<p class="gx-claim">(.*?)</p>', s, re.S)
    claim = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else "MISSING"
    claim = re.sub(r"\s+", " ", claim)
    print("[" + key + "] " + claim[:200])
