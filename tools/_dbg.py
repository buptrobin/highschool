# -*- coding: utf-8 -*-
import io
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

s = io.open("pages/geo/xx3-c1-r1.html", encoding="utf-8").read()
m = re.findall(r'<span class="bdg ([a-z\-]+)">([^<]{0,6})</span>', s)
print("matches:", len(m))
print(m[:6])
for mm in m[:6]:
    print(repr(mm[0]), repr(mm[1]), len(mm[1]))
