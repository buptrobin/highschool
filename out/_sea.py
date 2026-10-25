# -*- coding: utf-8 -*-
import json, io, re, sys

gk = json.load(io.open(r'C:\wangxp\script\gk.json', encoding='utf-8'))
bj = json.load(io.open(r'C:\wangxp\script\bj-geo.json', encoding='utf-8'))

def norm_area(a):
    a = a.replace(' ', '').replace('卷', '')
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
    a = norm_area(m.group(2))
    month = ''
    if '浙江' in a:
        if '1' in a:
            month = '1'
        elif '6' in a:
            month = '6'
        a = '浙江'
    used.append((m.group(1), a, month, int(m.group(3)), page))

def month_of(t):
    head = t[:200]
    if '浙江' in head and '1月' in head: return '1'
    if '浙江' in head and '6月' in head: return '6'
    return ''

def find(blob):
    out = []
    for m in re.finditer(r'[^。；\n]{0,40}(洋流|暖流|寒流|渔场|渔业|厄尔尼诺|拉尼娜|海—气|海气|海雾|冰山|浮冰|涌升|上升流|环流|信风|季风洋流|海水温度|表层海水|盐度|密度流|潮汐|波浪)[^。；\n]{0,40}', blob):
        out.append(m.group(0))
    return out[:4]

rows = []
for q in gk:
    kw = (q.get('stem') or '') + ' ' + (q.get('material') or '') + ' ' + ' '.join(q.get('options') or [])
    h = find(kw)
    if not h: continue
    y = str(q['year']); a = norm_area(q['area']); mo = month_of(q.get('material') or '')
    mark = 'USED' if any(u[0] == y and u[1] == a and u[3] == q['no'] and (u[2] == mo or not u[2] or not mo) for u in used) else '.   '
    rows.append('%s %s %s%s 第%s题 ans=%s fig=%s :: %s || %s' % (mark, y, a, ('(' + mo + '月)') if mo else '', q['no'], q.get('answer') or '?', q.get('figures'), (q.get('stem') or '')[:70].replace('\n', ''), ' / '.join(h)[:120]))
for q in bj:
    kw = (q.get('stem') or '') + ' ' + (q.get('material') or '') + ' ' + ' '.join(q.get('options') or [])
    h = find(kw)
    if not h: continue
    mark = 'USED' if any(u[0] == str(q['year']) and u[1] == '北京' and u[3] == q['no'] for u in used) else '.   '
    rows.append('%s %s 北京 第%s题[%s] ans=%s fig=%s :: %s || %s' % (mark, q['year'], q['no'], q.get('kind'), q.get('answer') or '?', q.get('figures'), (q.get('stem') or '')[:70].replace('\n', ''), ' / '.join(h)[:120]))
io.open(r'C:\wangxp\mygit\highschool\out\_sea.txt', 'w', encoding='utf-8').write('\n'.join(rows))
print(len(rows))
