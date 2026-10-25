# -*- coding: utf-8 -*-
"""在北京空白卷里找含关键词的题目段落（带题号）。"""
import io, os, re, sys
import docx

KW = sys.argv[1].split(',')
D = r'C:\wangxp\script\bj-geo-docx'
for fn in sorted(os.listdir(D)):
    if '空白卷' not in fn and '原卷' not in fn and '精编' not in fn:
        continue
    doc = docx.Document(os.path.join(D, fn))
    print('==== ' + fn)
    qno = ''
    for p in doc.paragraphs:
        t = p.text.strip()
        if not t:
            continue
        m = re.match(r'^(\d{1,2})[.．]', t)
        if m:
            qno = m.group(1)
        if any(k in t for k in KW):
            print('  %-4s %s' % (qno, t[:120]))
