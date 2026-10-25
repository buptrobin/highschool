# -*- coding: utf-8 -*-
"""直接核对成品页的数据段：QS 条数、ESSAYS 条数、图数、facts。"""
import io, re

for slug in ('xx1-c4-s1', 'xx1-c4-s2', 'xx1-c4-s3'):
    s = io.open('quiz/geo/%s.html' % slug, encoding='utf-8').read()
    i = s.find('var QS = [')
    j = s.find('var ESSAYS', i)
    qs = s[i:j]
    n_q = len(re.findall(r'\n    \{\n      id:\d+,', qs))
    n_real = len(re.findall(r'kind:"real"', qs))
    k = s.find('var ESSAYS')
    n_e = len(re.findall(r'\n    \{\n      id:\d+, lv:\d+, src:', s[k:k + 200000]))
    figs = re.findall(r'var FIG = \{', s)
    n_fig = len(re.findall(r'buildFig', s))
    facts = re.search(r'<div class="facts">(.{0,400})', s, re.S)
    ft = re.sub(r'<[^>]+>', ' ', facts.group(1)) if facts else ''
    ft = re.sub(r'\s+', ' ', ft)[:60]
    print('%s  选择 %d 条（real %d）  综合 %d 条  facts:%s' % (slug, n_q, n_real, n_e, ft))
