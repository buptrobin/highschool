# -*- coding: utf-8 -*-
"""qx-rid.py — 按 rId 精确取图（qx.py 的 --fig 取错图时用这个）。

qx.py 是按“题干关键词 → 邻近图片”猜的，遇到一题一段图、多题共用一段排版
（如 2026 北京卷 Q4/Q5）就会取到相邻题的图。先用 `python tools/qx-rid.py <docx> --list`
看清 rId 与前后文，再按 rId 精确导出。

用法：
    python tools/qx-rid.py <docx> --list
    python tools/qx-rid.py <docx> rId7 out.png
"""
import io
import os
import re
import sys
import zipfile

import docx
from docx.oxml.ns import qn

NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"


def iter_blocks(doc):
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


def list_images(path):
    doc = docx.Document(path)
    blocks = list(iter_blocks(doc))
    for i, (kind, val) in enumerate(blocks):
        if kind != "img":
            continue
        prev = next((b[1] for b in reversed(blocks[:i]) if b[0] == "p"), "")
        nxt = next((b[1] for b in blocks[i + 1:] if b[0] == "p"), "")
        print("%-7s 前: %s" % (val, prev[:60]))
        print("        后: %s" % nxt[:60])
    return blocks


def save(path, rid, out):
    doc = docx.Document(path)
    part = doc.part
    rel = part.rels[rid]
    blob = rel.target_part.blob
    with io.open(out, "wb") as f:
        f.write(blob)
    print("已保存 %s（%s，%.1f KB）" % (out, os.path.basename(rel.target_part.partname), len(blob) / 1024))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    docx_path = sys.argv[1]
    if sys.argv[2] == "--list":
        list_images(docx_path)
    else:
        if len(sys.argv) < 4:
            print("用法: python tools/qx-rid.py <docx> <rId> <out.png>")
            sys.exit(1)
        save(docx_path, sys.argv[2], sys.argv[3])
