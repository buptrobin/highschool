# -*- coding: utf-8 -*-
"""qx.py — 从原卷解析 docx 里定位一道题：打印上下文文字，并保存该题配图。

用法：
    python tools/qx.py <docx> <题干关键片段> [--fig out.png] [--ctx 2]
"""
import argparse
import io
import os
import re
import sys
import zipfile

import docx
from docx.oxml.ns import qn


def iter_block_items(doc):
    """按文档顺序产出 ('p', text) 与 ('img', rId)。"""
    body = doc.element.body
    for child in body.iterchildren():
        if child.tag == qn("w:p"):
            xml = child.xml
            text = "".join(n.text or "" for n in child.iter(qn("w:t")))
            for m in re.finditer(r'r:embed="(rId\d+)"', xml):
                yield ("img", m.group(1))
            if text.strip():
                yield ("p", text.strip())
        elif child.tag == qn("w:tbl"):
            text = " ".join("".join(n.text or "" for n in c.iter(qn("w:t"))) for c in child.iter(qn("w:tc")))
            if text.strip():
                yield ("p", text.strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("docx")
    ap.add_argument("needle")
    ap.add_argument("--fig", default="")
    ap.add_argument("--ctx", type=int, default=2)
    a = ap.parse_args()

    doc = docx.Document(a.docx)
    blocks = list(iter_block_items(doc))

    hit = None
    for i, (kind, val) in enumerate(blocks):
        if kind == "p" and (a.needle in val or a.needle.replace(" ", "") in val.replace(" ", "")):
            hit = i
            break
    if hit is None:
        sys.exit("没找到题干片段：%s" % a.needle)

    lo, hi = max(0, hit - a.ctx), min(len(blocks), hit + a.ctx + 1)
    for i in range(lo, hi):
        kind, val = blocks[i]
        mark = ">>" if i == hit else "  "
        print("%s %s" % (mark, val[:300].replace("\n", " ")))

    if not a.fig:
        return
    # 该题配图：解析卷里图通常排在材料/题干之前，先往前找，找不到再往后
    rid = None
    for kind, val in reversed(blocks[max(0, hit - 8):hit]):
        if kind == "img":
            rid = val
            break
    if rid is None:
        for kind, val in blocks[hit:]:
            if kind == "img":
                rid = val
                break
    if rid is None:
        sys.exit("这道题附近没有图片")

    part = doc.part.related_parts[rid]
    os.makedirs(os.path.dirname(os.path.abspath(a.fig)), exist_ok=True)
    io.open(a.fig, "wb").write(part.blob)
    print("图已保存：%s（%.1f KB，来自 %s）" % (a.fig, len(part.blob) / 1024, rid))


if __name__ == "__main__":
    main()
