import json, io, sys, re

gk = json.load(io.open(r'C:\wangxp\script\gk.json', encoding='utf-8'))
bj = json.load(io.open(r'C:\wangxp\script\bj-geo.json', encoding='utf-8'))

used = io.open(r'C:\wangxp\mygit\highschool\content\quiz\_used-srcs.txt', encoding='utf-8').read()

def norm_area(a):
    return re.sub(r'\s+', '', a or '')

def used_gk(year, area, no):
    a = norm_area(area)
    cands = ['%s·%s卷 第%s题' % (year, a, no), '%s·%s 第%s题' % (year, a, no),
             '%s·%s卷 第%s题' % (year, a, no)]
    return any(c in used for c in cands)

def used_bj(year, no):
    c = '%s·北京卷 第%s题' % (year, no)
    return c in used

kws = sys.argv[1:]
def hit(s):
    return all(k in s for k in kws)

print('--- GK unused matches ---')
for q in gk:
    if used_gk(q.get('year'), q.get('area'), q.get('no')):
        continue
    blob = (q.get('stem') or '') + ' '.join(q.get('options') or []) + (q.get('material') or '')
    if hit(blob):
        print('%s %s 第%s题 ans=%s fig=%s | %s | %s' % (q.get('year'), q.get('area'), q.get('no'),
              q.get('answer'), q.get('figures'), (q.get('stem') or '').replace('\n', ' ')[:110],
              ' / '.join(q.get('options') or [])[:90]))
print('--- BJ unused matches ---')
for q in bj:
    if used_bj(q.get('year'), q.get('no')):
        continue
    subs = ' '.join([s if isinstance(s, str) else json.dumps(s, ensure_ascii=False) for s in (q.get('subqs') or [])])
    blob = (q.get('stem') or '') + ' '.join(q.get('options') or []) + (q.get('material') or '') + subs
    if hit(blob):
        print('%s 北京 第%s题 %s fig=%s | %s | %s' % (q.get('year'), q.get('no'), q.get('kind'), q.get('figures'),
              (q.get('stem') or '').replace('\n', ' ')[:110], ' / '.join(q.get('options') or [])[:90]))
        if subs:
            print('    SUBS:', subs[:700])
