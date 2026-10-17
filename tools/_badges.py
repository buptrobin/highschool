# -*- coding: utf-8 -*-
import glob
import re
import sys
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8")

VALID = {"bdg-must", "bdg-warn", "bdg-diff", "bdg-ext"}

for f in sorted(glob.glob("pages/geo/xx1-*.html") + glob.glob("pages/geo/xx2-*.html")):
    s = open(f, encoding="utf-8").read()
    labels = re.findall(r'class="bdg ([^"]+)">([^<]+)<', s)
    bad = [c for c, _ in labels if c not in VALID]
    c = Counter(labels)
    key = f.replace("\\", "/").split("pages/geo/")[1][:-5]
    flag = (" BAD:" + ",".join(sorted(set(bad)))) if bad else ""
    print(key, dict(c), flag)
