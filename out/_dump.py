# -*- coding: utf-8 -*-
import json, io, re

gk = json.load(io.open(r'C:\wangxp\script\gk.json', encoding='utf-8'))
bj = json.load(io.open(r'C:\wangxp\script\bj-geo.json', encoding='utf-8'))

def norm_area(a):
    a = a.replace(' ', '')
    a = a.replace('卷', '')
    if a.startswith('浙江'):
        return '浙江'
    return a

used = []
for line in io.open(r'C:\wangxp\mygit\highschool\content\quiz\_used-srcs.txt', encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    src, page = line.split('\t')
    m = re.match(r'(\d{4})·(.+?)卷 第(\d+)题', src)
    if not m:
        continue
    y, a, n = m.group(1), norm_area(m.group(2)), int(m.group(3))
    month = ''
    if '浙江' in a:
        if '1' in m.group(2).replace('第', '') and '月' in m.group(2):
            month = '1'
        elif '6' in m.group(2):
            month = '6'
    used.append((y, a, month, n, page))
print('parsed used:', len(used))

def month_of(t):
    head = t[:200]
    if '1月' in head and '浙江' in head:
        return '1'
    if '6月' in head and '浙江' in head:
        return '6'
    if '一月' in head or '1月选考' in head:
        return '1'
    return ''

rows = []
for q in gk:
    t = (q.get('material') or '')
    y = str(q['year']); a = norm_area(q['area']); n = q['no']
    mo = month_of(t)
    mark = 'USED' if any(u[0] == y and u[1] == a and u[3] == n and (not u[2] or not mo or u[2] == mo) for u in used) else '.   '
    kw = (q.get('stem') or '') + (q.get('material') or '')
    rows.append((mark, '%s %s%s 第%s题' % (mark, y, a + (mo + '月' if mo else ''), n), q.get('answer') or '?', q.get('figures'), (q.get('stem') or '')[:110].replace('\n', ''), kw))
for q in bj:
    y = str(q['year']); n = q['no']
    mark = 'USED' if any(u[0] == y and u[1] == '北京' and u[3] == n for u in used) else '.   '
    kw = (q.get('stem') or '') + (q.get('material') or '')
    rows.append((mark, '%s %s北京 第%s题[%s]' % (mark, y, n, q.get('kind')), q.get('answer') or '?', q.get('figures'), (q.get('stem') or '')[:110].replace('\n', ''), kw))

with io.open(r'C:\wangxp\mygit\highschool\out\_all.txt', 'w', encoding='utf-8') as f:
    for r in rows:
        f.write('%s | ans=%s fig=%s | %s\n' % (r[1], r[2], r[3], r[4]))
print('wrote', len(rows))
