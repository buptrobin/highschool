#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""给 pages/geo/xx3-*.html 挂上共用的 gx.css / gx.js（幂等）。"""
import glob
import io
import os

ROOT = r"C:\wangxp\mygit\highschool"
CSS_LINK = '<link rel="stylesheet" href="../../assets/gx.css">\n'
JS_TAG = '<script src="../../assets/gx.js"></script>\n'

n = 0
for p in sorted(glob.glob(os.path.join(ROOT, "pages", "geo", "xx3-*.html"))):
    s = io.open(p, encoding="utf-8").read()
    orig = s
    if "assets/gx.css" not in s:
        s = s.replace(
            '<link rel="stylesheet" href="../../assets/app.css">\n',
            '<link rel="stylesheet" href="../../assets/app.css">\n' + CSS_LINK, 1)
    if "assets/gx.js" not in s:
        s = s.replace(
            '<script src="../../assets/page.js"></script>\n',
            '<script src="../../assets/page.js"></script>\n' + JS_TAG, 1)
    if s != orig:
        io.open(p, "w", encoding="utf-8", newline="\n").write(s)
        n += 1
print("patched", n)
