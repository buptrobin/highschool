# -*- coding: utf-8 -*-
"""从原卷 docx 提取某题配图（兼容 DrawingML r:embed 与 VML v:imagedata）。

用法：_fig.py <docx> <needle> <out_raw.png> [lookback=16]
规则：在 [hit-lookback, hit] 窗口内取「最近的一张大图」（宽高都 ≥150px）；
      窗口内没有就在 hit 之后 10 段内找第一张大图。
"""
import sys, io, re, os
import docx
from docx.oxml.ns import qn
from PIL import Image

path, needle, out = sys.argv[1], sys.argv[2], sys.argv[3]
look = int(sys.argv[4]) if len(sys.argv) > 4 else 16

doc = docx.Document(path)
body = doc.element.body
blocks = []
for child in body.iterchildren():
    if child.tag == qn("w:p"):
        xml = child.xml
        rids = []
        for m in re.finditer(r'r:embed="(rId\d+)"', xml):
            rids.append(m.group(1))
        for m in re.finditer(r'r:id="(rId\d+)"', xml):
            if m.group(1) not in rids:
                rids.append(m.group(1))
        text = "".join(n.text or '' for n in child.iter(qn("w:t")))
    elif child.tag == qn("w:tbl"):
        xml = child.xml
        rids = []
        for m in re.finditer(r'r:embed="(rId\d+)"', xml):
            rids.append(m.group(1))
        for m in re.finditer(r'r:id="(rId\d+)"', xml):
            if m.group(1) not in rids:
                rids.append(m.group(1))
        text = " ".join("".join(n.text or '' for n in c.iter(qn("w:t"))) for c in child.iter(qn("w:tc")))
    else:
        continue
    if rids:
        blocks.append(('img', rids))
    if text.strip():
        blocks.append(('p', text.strip()))

hit = None
for i, (k, v) in enumerate(blocks):
    if k == 'p' and (needle in v or needle.replace(' ', '') in v.replace(' ', '')):
        hit = i
        break
if hit is None:
    sys.exit('没找到：%s' % needle)

def big(rid):
    try:
        part = doc.part.related_parts[rid]
        im = Image.open(io.BytesIO(part.blob))
        return im if (im.width >= 150 and im.height >= 150) else None
    except Exception:
        return None

cand = None
for k, v in reversed(blocks[max(0, hit - look):hit]):
    if k != 'img':
        continue
    for rid in v:
        im = big(rid)
        if im is not None:
            cand = im
            break
    if cand:
        break
if cand is None:
    for k, v in blocks[hit:hit + 11]:
        if k == 'img':
            for rid in v:
                im = big(rid)
                if im is not None:
                    cand = im
                    break
        if cand:
            break
if cand is None:
    sys.exit('附近没有可用图')
if cand.mode in ('RGBA', 'LA', 'P'):
    cand = cand.convert('RGBA')
    bg = Image.new('RGBA', cand.size, (255, 255, 255, 255))
    bg.alpha_composite(cand)
    cand = bg.convert('RGB')
else:
    cand = cand.convert('RGB')
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
cand.save(out, 'PNG')
print('%s  %dx%d  %.1fKB' % (out, cand.width, cand.height, os.path.getsize(out) / 1024))
