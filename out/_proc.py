# -*- coding: utf-8 -*-
"""把 qx.py 抽出的原图处理成页面用图：白底合成 → 灰度 → 宽 ≤ maxw → PNG"""
import sys, os
from PIL import Image

src, dst, maxw = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 840
im = Image.open(src)
if im.mode in ('RGBA', 'LA', 'P'):
    im = im.convert('RGBA')
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
    bg.alpha_composite(im)
    im = bg.convert('RGB')
else:
    im = im.convert('RGB')
if im.width > maxw:
    h = int(round(im.height * maxw / im.width))
    im = im.resize((maxw, h), Image.LANCZOS)
im = im.convert('L')
os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
im.save(dst, 'PNG', optimize=True)
print('%s  %dx%d  %.1f KB' % (dst, im.width, im.height, os.path.getsize(dst) / 1024))
