# -*- coding: utf-8 -*-
import json, io, re, sys

gk = json.load(io.open(r'C:\wangxp\script\gk.json', encoding='utf-8'))
bj = json.load(io.open(r'C:\wangxp\script\bj-geo.json', encoding='utf-8'))

spec = sys.argv[1]  # e.g. "2024|福建|1-16"
y, a, rng = spec.split('|')
lo, hi = (rng.split('-') + [rng])[:2]
lo, hi = int(lo), int(hi)

src = gk if a != '北京' or int(y) < 2021 or True else gk
pool = gk if a != '北京' else bj
out = []
for q in pool:
    if str(q.get('year')) != y:
        continue
    if a == '北京':
        pass
    elif q.get('area') != a:
        continue
    if not (lo <= q['no'] <= hi):
        continue
    mat = (q.get('material') or '')
    m = re.search(r'(20\d\d年.{0,40}?)(地理|试题)', mat)
    out.append('--- %s %s 第%s题 [%s] ans=%s fig=%s' % (y, a, q['no'], q.get('kind'), q.get('answer'), q.get('figures')))
    out.append('MAT: ' + mat[-320:].replace('\n', ' '))
    out.append('Q  : ' + (q.get('stem') or ''))
    for i, o in enumerate(q.get('options') or []):
        out.append('   %s. %s' % ('ABCD'[i], o))
    out.append('EXP: ' + (q.get('explain') or '')[:300].replace('\n', ' '))
print('\n'.join(out))
