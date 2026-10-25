# -*- coding: utf-8 -*-
import io, json

p = r'content/quiz/geo/xx1-c4-s1.json'
s = io.open(p, encoding='utf-8').read()

old_start = '"lwcurve": {'
i = s.index(old_start)
j = s.index('},', i)
old = s[i:j + 2]
new = '''"lwcurve": {
      "svg": "<svg viewBox='0 0 760 330'><rect width='760' height='330' fill='#fff'/><text x='18' y='26' font-size='13' font-weight='700' fill='#4b5a86'>三种典型补给类型的流量过程线（示意）</text><line x1='60' y1='46' x2='60' y2='240' stroke='#8a9bb5' stroke-width='1.4'/><line x1='60' y1='240' x2='726' y2='240' stroke='#8a9bb5' stroke-width='1.4'/><text x='24' y='54' font-size='11' fill='#4b5a86'>流量</text><text x='694' y='258' font-size='11' fill='#4b5a86'>时间</text><g font-size='11' fill='#8a94a8'><text x='80' y='258'>1月</text><text x='240' y='258'>4月</text><text x='400' y='258'>7月</text><text x='560' y='258'>10月</text><text x='690' y='258'>12月</text></g><path d='M60 212 C140 206 200 200 260 182 C320 162 360 88 420 82 C480 78 540 154 620 190 L726 210' fill='none' stroke='#2f6fb3' stroke-width='2.5'/><path d='M60 218 C150 216 220 210 280 192 C340 174 380 108 440 104 C520 100 600 174 726 204' fill='none' stroke='#c8402f' stroke-width='2.5' stroke-dasharray='7 5'/><path d='M60 190 C180 188 300 186 420 184 C540 182 640 182 726 180' fill='none' stroke='#4f9d69' stroke-width='2.5'/><g><rect x='70' y='52' width='300' height='96' rx='8' fill='#ffffff' fill-opacity='0.92' stroke='#e3e9f2'/><line x1='84' y1='74' x2='112' y2='74' stroke='#2f6fb3' stroke-width='2.5'/><text x='120' y='78' font-size='11.5' fill='#2f6fb3' font-weight='700'>雨水补给：峰随雨，夏季最高</text><line x1='84' y1='104' x2='112' y2='104' stroke='#c8402f' stroke-width='2.5' stroke-dasharray='7 5'/><text x='120' y='108' font-size='11.5' fill='#c8402f' font-weight='700'>冰雪融水：峰随气温，略滞后</text><line x1='84' y1='134' x2='112' y2='134' stroke='#4f9d69' stroke-width='2.5'/><text x='120' y='138' font-size='11.5' fill='#4f9d69' font-weight='700'>地下水补给：全年平直，无汛期</text></g><text x='60' y='286' font-size='11.5' fill='#8a94a8'>读图口诀：先看峰值出现的月份，再看峰形“陡还是缓”——陡峰＋夏季＝降水；</text><text x='60' y='306' font-size='11.5' fill='#8a94a8'>缓峰＋夏季＋滞后＝冰雪融水；全年无峰＝地下水补给。</text></svg>"
    },'''
s = s[:i] + new + s[j + 2:]
io.open(p, 'w', encoding='utf-8').write(s)
d = json.load(io.open(p, encoding='utf-8'))
print('OK，lwcurve 长度', len(d['figures']['lwcurve']['svg']))
