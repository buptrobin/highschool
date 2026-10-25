# -*- coding: utf-8 -*-
"""抽原卷里某题前后的文本，用来核对答案。用法：_ans.py <docx> <needle> [n]"""
import sys
import docx
from docx.oxml.ns import qn

path, needle = sys.argv[1], sys.argv[2]
n = int(sys.argv[3]) if len(sys.argv) > 3 else 8
doc = docx.Document(path)
ps = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
hit = None
for i, t in enumerate(ps):
    if needle in t:
        hit = i
        break
print('hit', hit)
for t in ps[hit:hit + n]:
    print('   ', t[:160])
