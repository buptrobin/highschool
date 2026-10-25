# -*- coding: utf-8 -*-
import json, io, re, sys
bj = json.load(io.open(r'C:\wangxp\script\bj-geo.json', encoding='utf-8'))
y = sys.argv[1]
full = len(sys.argv) > 2
for q in bj:
    if str(q.get('year')) != y:
        continue
    print('--- %s 北京 第%s题 [%s] ans=%s fig=%s' % (y, q['no'], q.get('kind'), q.get('answer'), q.get('figures')))
    print('Q: ' + (q.get('stem') or '')[:150].replace('\n', ' '))
    if full:
        print('MAT: ' + (q.get('material') or '')[-400:].replace('\n', ' '))
        for i, o in enumerate(q.get('options') or []):
            print('   %s. %s' % ('ABCD'[i], o))
        print('EXP: ' + (q.get('explain') or '')[:200].replace('\n', ' '))
