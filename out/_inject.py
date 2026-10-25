# -*- coding: utf-8 -*-
"""把 spec 里的图片占位符替换成 base64 data URI（综合题 material 是 innerHTML）。
属性一律用单引号，避免破坏 JSON 字符串。"""
import base64, io, re, sys

spec = r'C:\wangxp\mygit\highschool\content\quiz\geo\xx1-c4-s2.json'
img = r'C:\wangxp\mygit\highschool\content\quiz\figs\xx1-c4-s2\gd23e.png'
token = '__FIG_GD23E__'

s = io.open(spec, encoding='utf-8').read()

# 先修掉上一次注入失败留下的坏块
bad = re.search(r'<img src="data:image/png;base64,[^"]*"[^>]*>', s)
if bad:
    s = s[:bad.start()] + token + s[bad.end():]
    print('已清理旧的注入块')

if token not in s:
    print('没有占位符，跳过')
    sys.exit(0)

b64 = base64.b64encode(open(img, 'rb').read()).decode()
html = ('<img src=\'data:image/png;base64,' + b64 + '\' '
        'alt=\'2023 广东卷第 19 题原卷图：日本海位置及现代洋流分布\' '
        'style=\'width:100%;max-width:560px;height:auto;display:block;margin:10px 0;'
        'border:1px solid #e3e9f2;border-radius:8px\'>')
s = s.replace(token, html)
io.open(spec, 'w', encoding='utf-8').write(s)
print('已替换，spec 现在 %.1f KB' % (len(s) / 1024))
