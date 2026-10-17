# -*- coding: utf-8 -*-
"""按徽章文字归一化四色类名（只改 class，不改文字）。"""
import glob
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

RULES = {
    "必考": "bdg-must",
    "核心": "bdg-must",
    "易错": "bdg-warn",
    "反直觉": "bdg-warn",
    "辨析": "bdg-diff",
    "互动": "bdg-diff",
    "延伸": "bdg-ext",
    "拓展": "bdg-ext",
    "背景": "bdg-ext",
    "方法": "bdg-ext",
}

pat = re.compile(r'<span class="bdg (bdg-[a-z]+)">([^<]+)</span>')
total = 0
for f in sorted(glob.glob("pages/geo/xx1-*.html") + glob.glob("pages/geo/xx2-*.html")):
    s = open(f, encoding="utf-8").read()
    changes = []

    def sub(m):
        cur, label = m.group(1), m.group(2)
        want = RULES.get(label)
        if want and want != cur:
            changes.append("%s %s->%s" % (label, cur, want))
            return '<span class="bdg %s">%s</span>' % (want, label)
        return m.group(0)

    new = pat.sub(sub, s)
    if new != s:
        open(f, "w", encoding="utf-8", newline="\n").write(new)
        total += len(changes)
        print(f.replace("\\", "/").split("pages/geo/")[1], ";".join(changes))
print("changed", total)
