# -*- coding: utf-8 -*-
"""把本批三页用到的真题登记到 content/quiz/_used-srcs.txt（追加，不改动已有行）。"""
import io, os

p = r'content/quiz/_used-srcs.txt'
rows = [
    ('2025·安徽卷 第9题', 'xx1-c4-s1'),
    ('2025·安徽卷 第10题', 'xx1-c4-s1'),
    ('2025·黑吉辽蒙卷 第9题', 'xx1-c4-s1'),
    ('2025·黑吉辽蒙卷 第10题', 'xx1-c4-s1'),
    ('2025·广东卷 第16题', 'xx1-c4-s1'),
    ('2024·江苏卷 第10题', 'xx1-c4-s1'),
    ('2024·广东卷 第9题', 'xx1-c4-s2'),
    ('2024·海南卷 第10题', 'xx1-c4-s2'),
    ('2023·广东卷 第19题', 'xx1-c4-s2'),
    ('2023·北京卷 第5题', 'xx1-c4-s3'),
    ('2023·北京卷 第6题', 'xx1-c4-s3'),
    ('2024·天津卷 第3题', 'xx1-c4-s3'),
    ('2024·天津卷 第4题', 'xx1-c4-s3'),
    ('2023·河北卷 第10题', 'xx1-c4-s3'),
    ('2023·河北卷 第11题', 'xx1-c4-s3'),
    ('2024·浙江（1月）卷 第24题', 'xx1-c4-s3'),
    ('2024·浙江（1月）卷 第25题', 'xx1-c4-s3'),
]

old = io.open(p, encoding='utf-8').read()
exist = set()
for line in old.splitlines():
    if '\t' in line:
        exist.add(line.split('\t')[0].strip())

add = ['%s\t%s' % (k, v) for k, v in rows if k not in exist]
if add:
    with io.open(p, 'a', encoding='utf-8') as f:
        if not old.endswith('\n'):
            f.write('\n')
        f.write('\n'.join(add) + '\n')
print('追加 %d 行，跳过已存在 %d 行' % (len(add), len(rows) - len(add)))
