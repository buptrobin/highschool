# -*- coding: utf-8 -*-
import io, json

p = r'content/quiz/geo/xx1-c4-s2.json'
s = io.open(p, encoding='utf-8').read()
pairs = [
    ("<g font-size='11.5' fill='#c8402f'><text x='48' y='120'>22℃</text><text x='48' y='162'>20℃</text><text x='48' y='208'>18℃</text><text x='48' y='252'>16℃</text></g>",
     "<g font-size='11.5' font-weight='700' fill='#c8402f'><text x='48' y='120'>16℃</text><text x='48' y='162'>18℃</text><text x='48' y='208'>20℃</text><text x='48' y='252'>22℃</text></g><text x='640' y='262' font-size='11' fill='#8a94a8'>北 ←</text><text x='640' y='60' font-size='11' fill='#8a94a8'># 上为北</text>"),
    ("<path d='M300 96 C330 92 360 84 392 76' fill='none' stroke='#c8402f' stroke-width='3.5' marker-end='url(#ocArw)'/>",
     "<path d='M340 106 C366 98 388 90 408 82' fill='none' stroke='#c8402f' stroke-width='3.5' marker-end='url(#ocArw)'/>"),
    ("<text x='404' y='72' font-size='12' font-weight='700' fill='#c8402f'>等温线向北凸出 → 暖流自南向北</text>",
     "<text x='424' y='66' font-size='12' font-weight='700' fill='#c8402f'>等温线向北凸出 → 暖流自南向北</text>"),
]
for a, b in pairs:
    if a not in s:
        print('!! 没找到:', a[:50])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)
json.load(io.open(p, encoding='utf-8'))
print('OK ociso 已修正')
