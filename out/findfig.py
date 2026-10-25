# -*- coding: utf-8 -*-
"""按文档顺序列出「文字块 / 图片」序列，支持 r:embed 与 VML r:id；可按序号导出图片。"""
import io
import re
import sys

import docx
from docx.oxml.ns import qn

RID = re.compile(r'r:(?:embed|id)="(rId\d+)"')


def walk(el):
    """深度优先，产出 ('p', text) 与 ('img', rId)，保持文档顺序。"""
    for child in el.iterchildren():
        if child.tag == qn("w:p"):
            text = "".join(n.text or "" for n in child.iter(qn("w:t")))
            for m in RID.finditer(child.xml):
                yield ("img", m.group(1))
            if text.strip():
                yield ("p", text.strip())
        elif child.tag == qn("w:tbl"):
            for sub in walk(child):
                yield sub
        else:
            for sub in walk(child):
                yield sub


def main():
    path = sys.argv[1]
    doc = docx.Document(path)
    blocks = list(walk(doc.element.body))
    if len(sys.argv) == 2:
        for i, (k, v) in enumerate(blocks):
            print(i, k, v if k == "img" else v[:80])
        return
    needle = sys.argv[2]
    ctx = int(sys.argv[3]) if len(sys.argv) > 3 else 6
    hit = None
    for i, (k, v) in enumerate(blocks):
        if k == "p" and needle.replace(" ", "") in v.replace(" ", ""):
            hit = i
            break
    if hit is None:
        sys.exit("no hit")
    for i in range(max(0, hit - ctx), min(len(blocks), hit + ctx + 1)):
        k, v = blocks[i]
        print("%s [%d] %s %s" % (">>" if i == hit else "  ", i, k, v if k == "img" else v[:100]))
    if len(sys.argv) > 4:
        rid, out = sys.argv[4], sys.argv[5]
        part = doc.part.related_parts[rid]
        io.open(out, "wb").write(part.blob)
        print("saved", out, len(part.blob))


if __name__ == "__main__":
    main()
