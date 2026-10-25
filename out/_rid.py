# -*- coding: utf-8 -*-
"""按 rId 直接导出 docx 里的一张图。用法：_rid.py <docx> <rId> <out>"""
import docx, io, sys
from PIL import Image
p, rid, out = sys.argv[1], sys.argv[2], sys.argv[3]
doc = docx.Document(p)
part = doc.part.related_parts[rid]
im = Image.open(io.BytesIO(part.blob))
if im.mode in ('RGBA', 'LA', 'P', 'CMYK'):
    im = im.convert('RGB')
im.save(out, 'PNG')
print('%s %dx%d %.1fKB' % (out, im.width, im.height, len(part.blob) / 1024))
