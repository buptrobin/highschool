# -*- coding: utf-8 -*-
import io, json

p = r'content/quiz/geo/xx1-c4-s1.json'
s = io.open(p, encoding='utf-8').read()
old = ('2025 广东卷第 15 题（沿江湖泊与长江相互补给最显著的河段）已被“区域发展”页收走，'
       '为避免跨页重复，本页只收第 16 题；')
new = ('2025 广东卷第 15 题（沿江湖泊与长江相互补给最显著的河段）的正解落在流域上下游协同与流域治理上，'
       '经查重裁决归“流域内协调发展”页（xx2-c4-s1），本页只收同组的第 16 题；')
if old not in s:
    print('!! 没找到旧句')
s = s.replace(old, new)

old2 = '2025 广东卷第 16 题（长江中下游沿江湖泊的湖底高程与补泄关系，配原卷高程对比图）'
new2 = '2025 广东卷第 16 题（长江中下游沿江湖泊的湖底高程与长江水位的对比关系，配原卷高程对比图）'
if old2 not in s:
    print('!! 没找到旧句2')
s = s.replace(old2, new2)

io.open(p, 'w', encoding='utf-8').write(s)
json.load(io.open(p, encoding='utf-8'))
print('footer 已更新')
