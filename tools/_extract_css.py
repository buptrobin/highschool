#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一次性脚本：从 bx1-c1-s1.html 抽出讲义样式，生成 assets/gx.css。"""
import io
import re

src = r"C:\wangxp\mygit\highschool\pages\geo\bx1-c1-s1.html"
dst = r"C:\wangxp\mygit\highschool\assets\gx.css"

s = io.open(src, encoding="utf-8").read()
m = re.search(r"<style>\n(.*?)\n</style>", s, re.S)
css = m.group(1)
head = "/* 讲义版共用样式 · 抽自 pages/geo/bx1-c1-s1.html，选择子必修1 各页复用 */\n"
io.open(dst, "w", encoding="utf-8").write(head + css + "\n")
print("wrote", len(css), "chars")
