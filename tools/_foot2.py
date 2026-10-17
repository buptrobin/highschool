# -*- coding: utf-8 -*-
import glob
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

for f in sorted(glob.glob("pages/geo/xx2-*.html")):
    s = open(f, encoding="utf-8").read()
    m = re.search(r'<footer class="gx-foot">(.*?)</footer>', s, re.S)
    t = re.sub(r"<[^>]+>", " ", m.group(1)) if m else "MISSING"
    t = re.sub(r"\s+", " ", t).strip()
    key = f.replace("\\", "/").split("pages/geo/")[1][:-5]
    print("[" + key + "] " + t[:190])
