# -*- coding: utf-8 -*-
"""把原卷图处理成白底灰度 PNG：白底合成 → 灰度 → 宽 ≤ maxw。"""
import io
import os
import sys

from PIL import Image

RAW = r"C:\wangxp\mygit\highschool\out\raw"
DST = r"C:\wangxp\mygit\highschool\content\quiz\figs"

# (源文件, 目标 slug 目录, 输出名, 目标宽度, 裁剪框 or None)
JOBS = [
    ("p1_bj24q11.png", "xx2-c1-s1", "bj24q11.png", 700, (0, 0, 356, 333)),
    ("p1_bj23q13.png", "xx2-c1-s1", "bj23q13.png", 760, None),
    ("p1_js25q12.png", "xx2-c1-s1", "js25q12.png", 840, None),
    ("p2_hn23q56.png", "xx2-c1-s2", "hn23q56.png", 840, None),
    ("p2_zj24q9.png", "xx2-c1-s2", "zj24q9.png", 700, None),
    ("p2_hb24q15.png", "xx2-c1-s2", "hb24q15.png", 840, None),
    ("p3_zj23q11.png", "xx2-c2-s1", "zj23q11.png", 840, None),
    ("p3_gs24.png", "xx2-c2-s1", "gs24.png", 800, None),
    ("p3_js25q15.png", "xx2-c2-s1", "js25q15.png", 840, None),
    ("e24bj18.png", "xx2-c1-s2", "bj24q18.png", 840, None),
    ("e23bj19.png", "xx2-c1-s2", "bj23q19.png", 840, None),
    ("e24bj17.png", "xx2-c2-s1", "bj24q17.png", 840, None),
    ("e26bj17.png", "xx2-c2-s1", "bj26q17.png", 840, None),
]


def transcode(src, dst, maxw, box=None):
    im = Image.open(src)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    if box:
        im = im.crop(box)
    if im.width > maxw:
        h = max(1, round(im.height * maxw / im.width))
        im = im.resize((maxw, h), Image.LANCZOS)
    im = im.convert("L")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, "PNG", optimize=True)
    return im.size, os.path.getsize(dst)


for src, slug, name, maxw, box in JOBS:
    s = os.path.join(RAW, src)
    if not os.path.exists(s):
        print("MISS", s)
        continue
    out = os.path.join(DST, slug, name)
    size, n = transcode(s, out, maxw, box)
    print("%-22s -> %-14s %-22s %-12s %6.1f KB" % (src, slug, name, "%dx%d" % size, n / 1024))
