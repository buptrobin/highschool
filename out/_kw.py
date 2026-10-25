# -*- coding: utf-8 -*-
import json, io, re, sys

gk = json.load(io.open(r'C:\wangxp\script\gk.json', encoding='utf-8'))
bj = json.load(io.open(r'C:\wangxp\script\bj-geo.json', encoding='utf-8'))

def norm_area(a):
    return a.replace(' ', '').replace('卷', '')

used = []
for line in io.open(r'C:\wangxp\mygit\highschool\content\quiz\_used-srcs.txt', encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    src, page = line.split('\t')
    m = re.match(r'(\d{4})·(.+?)卷 第(\d+)题', src)
    if not m:
        continue
    a = norm_area(m.group(2))
    month = ''
    if '浙江' in a:
        month = '1' if '1' in a else ('6' if '6' in a else '')
        a = '浙江'
    used.append((m.group(1), a, month, int(m.group(3)), page))

def month_of(t):
    head = t[:200]
    if '浙江' in head and '1月' in head: return '1'
    if '浙江' in head and '6月' in head: return '6'
    return ''

PAT = sys.argv[1]
rows = []
for q, isbj in [(q, False) for q in gk] + [(q, True) for q in bj]:
    blob = (q.get('stem') or '') + ' ' + (q.get('material') or '') + ' ' + ' '.join(q.get('options') or [])
    if not re.search(PAT, blob):
        continue
    if isbj:
        mark = 'USED' if any(u[0] == str(q['year']) and u[1] == '北京' and u[3] == q['no'] for u in used) else '.   '
        tag = '%s %s 北京 第%s题' % (mark, q['year'], q['no'])
    else:
        y = str(q['year']); a = norm_area(q['area']); mo = month_of(q.get('material') or '')
        mark = 'USED' if any(u[0] == y and u[1] == a and u[3] == q['no'] and (u[2] == mo or not u[2] or not mo) for u in used) else '.   '
        tag = '%s %s %s%s 第%s题' % (mark, y, a, ('(' + mo + '月)') if mo else '', q['no'])
    rows.append('%s ans=%s fig=%s :: %s' % (tag, q.get('answer') or '?', q.get('figures'), (q.get('stem') or '')[:120].replace('\n', '')))
print('\n'.join(rows))
