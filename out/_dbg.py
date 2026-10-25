# -*- coding: utf-8 -*-
import docx, io, re, sys
from docx.oxml.ns import qn
from PIL import Image

p = sys.argv[1]
needle = sys.argv[2]
doc = docx.Document(p)
body = doc.element.body
blocks = []
for child in body.iterchildren():
    if child.tag == qn('w:p'):
        xml = child.xml
        rids = []
        for m in re.finditer(r'r:embed="(rId\d+)"', xml):
            rids.append(m.group(1))
        for m in re.finditer(r'r:id="(rId\d+)"', xml):
            if m.group(1) not in rids:
                rids.append(m.group(1))
        text = ''.join(n.text or '' for n in child.iter(qn('w:t')))
    else:
        continue
    if rids:
        blocks.append(('img', rids))
    if text.strip():
        blocks.append(('p', text.strip()))
hit = None
for i, (k, v) in enumerate(blocks):
    if k == 'p' and needle in v:
        hit = i
        break
print('hit', hit)
for j in range(max(0, hit - 16), hit + 1):
    k, v = blocks[j]
    if k == 'img':
        for rid in v:
            part = doc.part.related_parts[rid]
            im = Image.open(io.BytesIO(part.blob))
            print(j, rid, im.size, im.mode, len(part.blob) // 1024, 'KB')
    else:
        print(j, 'P', v[:60])
