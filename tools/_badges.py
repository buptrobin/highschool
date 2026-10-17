# -*- coding: utf-8 -*-
import glob
import re
import sys
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8")

for f in sorted(glob.glob("pages/geo/xx1-*.html")):
    s = open(f, encoding="utf-8").read()
    labels = re.findall(r'class="bdg ([^"]+)">([^<]+)<', s)
    c = Counter(labels)
    key = f.split("xx1-")[1][:-5]
    print(key, dict(c))
