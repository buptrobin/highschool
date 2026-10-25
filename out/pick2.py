# -*- coding: utf-8 -*-
"""列出主题关键词命中、且未被任何精练页占用的真题。"""
import glob
import io
import json
import os
import re
import sys

ROOT = r"C:\wangxp\mygit\highschool"
pat_src = re.compile(r'src:"([^"]+)"')
pat_kind = re.compile(r'kind:"([^"]+)"')
real = re.compile(r"(\d{4})·(.+?) 第\s*(\d+)\s*题")


def norm(a):
    return (a or "").replace(" ", "").replace("卷", "")


def used_set():
    used = set()
    for path in sorted(glob.glob(os.path.join(ROOT, "quiz", "geo", "*.html"))):
        s = io.open(path, encoding="utf-8").read()
        i = s.find("var QS = [")
        j = s.find("var ESSAYS", i)
        for b in re.split(r"\n    \{", s[i:j])[1:]:
            m = pat_src.search(b)
            kd = pat_kind.search(b)
            if not m or (kd and kd.group(1) != "real"):
                continue
            k = real.match(m.group(1))
            if k:
                used.add((k.group(1), norm(k.group(2)), int(k.group(3))))
    return used


def is_used(used, y, a, no):
    na = norm(a)
    for uy, ua, un in used:
        if uy == y and un == no and (na in ua or ua in na):
            return True
    return False


def main():
    kws = sys.argv[1].split(",")
    used = used_set()
    qs = []
    for f in [r"C:\wangxp\script\gk.json", r"C:\wangxp\script\bj-geo.json"]:
        for q in json.load(io.open(f, encoding="utf-8")):
            if "SUBS" in str(q.get("material"))[:40]:
                continue
            qs.append(q)
    out = []
    for q in qs:
        t = (q.get("stem") or "") + (q.get("material") or "")
        if not any(k in t for k in kws):
            continue
        if q.get("answer") is None or q.get("no") is None:
            continue
        y, a, no = str(q.get("year")), q.get("area"), q.get("no")
        if is_used(used, y, a, no):
            continue
        stem = re.sub(r"\s+", " ", (q.get("stem") or ""))[:78]
        out.append((y, a or "?", no, q.get("answer"), stem))
    for o in sorted(out):
        print(" | ".join(map(str, o)))
    print("---- 共 %d 条" % len(out))


if __name__ == "__main__":
    main()
