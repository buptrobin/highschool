# -*- coding: utf-8 -*-
import io, json

p = r'content/quiz/geo/xx1-c4-s1.json'
s = io.open(p, encoding='utf-8').read()
pairs = [
    ('及其与长江水位高程的对比关系。第Ⅳ河段已进入感潮河段。',
     '及其与长江水位高程的对比关系。'),
    ('"why": "Ⅳ 河段已经进入感潮河段，湖泊湖底却<b>低于海平面</b>',
     '"why": "图中 Ⅳ 河段位于标注“感潮河段”的范围内，湖泊湖底却<b>低于海平面</b>'),
]
for a, b in pairs:
    if a not in s:
        print('!! 没找到:', a[:46])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)
d = json.load(io.open(p, encoding='utf-8'))
q8 = [q for q in d['questions'] if q['id'] == 8][0]
print('Q8 material:', q8['material'][-40:])
print('Q8 why:', q8['why'][:60])
