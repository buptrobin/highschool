# -*- coding: utf-8 -*-
import json, io, re, sys

gk = json.load(io.open(r'C:\wangxp\script\gk.json', encoding='utf-8'))
bj = json.load(io.open(r'C:\wangxp\script\bj-geo.json', encoding='utf-8'))

used = set()
for line in io.open(r'C:\wangxp\mygit\highschool\content\quiz\_used-srcs.txt', encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    src, _ = line.split('\t')
    used.add(src)
print('used entries:', len(used))
print()

kw = sys.argv[1].split(',')
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 400

def hit(t):
    return any(k in t for k in kw)

print('===== gk.json =====')
for q in gk:
    blob = (q.get('material') or '') + (q.get('stem') or '')
    if hit(blob):
        src = '%s·%s卷 第%s题' % (q['year'], q['area'], q['no'])
        mark = 'USED' if any(src in u for u in used) else '    '
        ans = q.get('answer') or '?'
        print('%s %s | ans=%s fig=%s' % (mark, src, ans, q.get('figures')))
        print('    Q: %s' % (q.get('stem') or '')[:180])
        print('    M: %s' % (q.get('material') or '')[-160:].replace('\n', ' '))
print()
print('===== bj-geo.json =====')
for q in bj:
    blob = (q.get('material') or '') + (q.get('stem') or '')
    if hit(blob):
        src = '%s·北京卷 第%s题' % (q['year'], q['no'])
        mark = 'USED' if any(src in u for u in used) else '    '
        print('%s %s | ans=%s fig=%s kind=%s' % (mark, src, q.get('answer'), q.get('figures'), q.get('kind')))
        print('    Q: %s' % (q.get('stem') or '')[:200])
        print('    M: %s' % (q.get('material') or '')[-200:].replace('\n', ' '))
