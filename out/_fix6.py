# -*- coding: utf-8 -*-
import io, json

p = r'content/quiz/geo/xx1-c4-s3.json'
s = io.open(p, encoding='utf-8').read()
drops = [
    "<text x='62' y='96' font-size='11.5' fill='#c8402f'>西太平洋（暖池）水温高</text>",
    "<text x='248' y='96' font-size='11.5' fill='#2f6fb3'>东太平洋水温低</text>",
    "<text x='422' y='96' font-size='11.5' fill='#8a94a8'>西太平洋水温偏低</text>",
    "<text x='606' y='96' font-size='11.5' fill='#c8402f'>中、东太平洋异常增温</text>",
]
n = 0
for t in drops:
    if t in s:
        s = s.replace(t, '')
        n += 1
    else:
        print('!! 没找到:', t[:44])
# 补两个简洁标注，放在海面方框上方、箭头外侧
s = s.replace("<rect x='60' y='176' width='96' height='34' rx='6' fill='#fbe6cf'",
              "<text x='108' y='168' text-anchor='middle' font-size='11' font-weight='700' fill='#c8402f'>暖水堆积</text><text x='300' y='168' text-anchor='middle' font-size='11' font-weight='700' fill='#2f6fb3'>冷水上涌</text><rect x='60' y='176' width='96' height='34' rx='6' fill='#fbe6cf'", 1)
s = s.replace("<rect x='420' y='176' width='96' height='34' rx='6' fill='#eef2f7'",
              "<text x='468' y='168' text-anchor='middle' font-size='11' font-weight='700' fill='#2f6fb3'>冷水减弱</text><text x='660' y='168' text-anchor='middle' font-size='11' font-weight='700' fill='#c8402f'>暖水东移</text><rect x='420' y='176' width='96' height='34' rx='6' fill='#eef2f7'", 1)
io.open(p, 'w', encoding='utf-8').write(s)
json.load(io.open(p, encoding='utf-8'))
print('删掉 %d 个重叠标注，补了 4 个短标注' % n)
