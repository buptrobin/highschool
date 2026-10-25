import json, io, sys, re

gk = json.load(io.open(r'C:\wangxp\script\gk.json', encoding='utf-8'))
bj = json.load(io.open(r'C:\wangxp\script\bj-geo.json', encoding='utf-8'))

kw = sys.argv[1:]
def hit(s):
    return all(k in s for k in kw)

for q in gk:
    blob = (q.get('stem') or '') + ' '.join(q.get('options') or []) + (q.get('material') or '')
    if hit(blob):
        print('== GK %s %s 第%s题 ans=%s fig=%s' % (q.get('year'), q.get('area'), q.get('no'), q.get('answer'), q.get('figures')))
        print('   MAT:', (q.get('material') or '')[-260:].replace('\n', ' '))
        print('   STEM:', (q.get('stem') or '').replace('\n', ' '))
        print('   OPTS:', ' / '.join(q.get('options') or []))
for q in bj:
    blob = (q.get('stem') or '') + ' '.join(q.get('options') or []) + (q.get('material') or '')
    subs = ' '.join([s if isinstance(s, str) else json.dumps(s, ensure_ascii=False) for s in (q.get('subqs') or [])])
    blob += subs
    if hit(blob):
        print('== BJ %s 第%s题 kind=%s ans=%s fig=%s' % (q.get('year'), q.get('no'), q.get('kind'), q.get('answer'), q.get('figures')))
        print('   MAT:', (q.get('material') or '')[-400:].replace('\n', ' '))
        print('   STEM:', (q.get('stem') or '').replace('\n', ' '))
        print('   OPTS:', ' / '.join(q.get('options') or []))
        if subs:
            print('   SUBS:', subs[:900])
