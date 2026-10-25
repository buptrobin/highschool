# -*- coding: utf-8 -*-
"""扫描原卷 docx，找出含指定关键词的段落（排除解析段）。"""
import io, os, re, sys
import docx

KW = sys.argv[1]
DIRS = [r'C:\wangxp\script\gk-recent']
out = []
for d in DIRS:
    for fn in sorted(os.listdir(d)):
        if not fn.endswith('.docx'):
            continue
        path = os.path.join(d, fn)
        try:
            doc = docx.Document(path)
        except Exception as e:
            out.append('!! %s %s' % (fn, e))
            continue
        hit = []
        for p in doc.paragraphs:
            t = p.text.strip()
            if not t or KW not in t:
                continue
            if '故选' in t or t.startswith('【') or '解析' in t[:8] or '点睛' in t[:12]:
                continue
            hit.append(t[:160].replace('\n', ' '))
        if hit:
            out.append('=== %s' % fn)
            for h in hit[:16]:
                out.append('    ' + h)
io.open(r'C:\wangxp\mygit\highschool\out\_docxhit.txt', 'w', encoding='utf-8').write('\n'.join(out))
print(len(out))
