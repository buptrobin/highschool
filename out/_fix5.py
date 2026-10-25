# -*- coding: utf-8 -*-
import io, json

p = r'content/quiz/geo/xx1-c4-s2.json'
s = io.open(p, encoding='utf-8').read()
pairs = [
    ("<text x='640' y='262' font-size='11' fill='#8a94a8'>北 ←</text><text x='640' y='60' font-size='11' fill='#8a94a8'># 上为北</text>", ""),
    ("某海区表层海水等温线分布（数值自南向北递减）", "某海区表层海水等温线分布（上北下南，数值自南向北递减）"),
]
for a, b in pairs:
    if a not in s:
        print('!! 没找到:', a[:50])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)
json.load(io.open(p, encoding='utf-8'))
print('OK')
