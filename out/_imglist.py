# -*- coding: utf-8 -*-
"""列出 docx 里的所有图片及其前一段文字，便于按题干选图。"""
import sys, io
import docx
from docx.oxml.ns import qn
import re

path = sys.argv[1]
doc = docx.Document(path)
body = doc.element.body
blocks = []
for child in body.iterchildren():
    if child.tag == qn("w:p"):
        xml = child.xml
        text = "".join(n.text or "" for n in child.iter(qn("w:t")))
        for m in re.finditer(r'r:embed="(rId\d+)"', xml):
            blocks.append(('img', m.group(1)))
        if text.strip():
            blocks.append(('p', text.strip()))
    elif child.tag == qn("w:tbl"):
        text = " ".join("".join(n.text or "" for n in c.iter(qn("w:t"))) for c in child.iter(qn("w:tc")))
        if text.strip():
            blocks.append(('p', text.strip()))

last = ''
for i, (k, v) in enumerate(blocks):
    if k == 'img':
        part = doc.part.related_parts[v]
        print('%4d %s  %.1fKB  prev: %s' % (i, v, len(part.blob) / 1024, last[:70]))
    else:
        last = v
