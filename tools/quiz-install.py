#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 exam-practice-page 生成的单文件精练页落位到 quiz/<科目>/<slug>.html。

精练页本身是自包含的（内联 CSS/JS、自带判分与错题本），所以这里只做两件
极小的事，让它能被站点编目：

  1. 注入 window.QUIZ_META = {"sid":..,"slug":..,"n":..,"title":..}
     —— tools/build.py 靠它把精练挂到目录树上（题目数、有无）
  2. 顶部加一条「‹ 返回目录」出口，指回 subject.html?s=<科目>&quiz=1

题数和标题默认自动取值，一般不用手写：
  · 题数   ← 页面里的「题目总数」那一格
  · 标题   ← content/<科目>.txt 大纲里该 slug 的条目（与解析页同源）

用法:
    python tools/quiz-install.py <生成页.html> <科目> <slug> [题数] [--title 标题] [--build] [--force]

例:
    python tools/quiz-install.py C:/wangxp/script/geo-cosmic.html geo bx1-c1-s1 --build
"""
import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build  # noqa: E402  复用科目表、大纲解析与根目录

SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
META_MARK = "window.QUIZ_META"
COUNT_RE = re.compile(r'<div class="fact">\s*<b>(\d+)</b>\s*<span>\s*题目总数\s*</span>')

BACK_STYLE = """<style>
.qz-back { padding: 10px 16px 0; font: 500 13px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; }
.qz-back a { color: #5a6472; text-decoration: none; }
.qz-back a:hover { color: #2563eb; }
@media print { .qz-back { display: none; } }
</style>
"""


def back_bar(sid, name):
    href = "../../subject.html?s=%s&quiz=1" % sid
    return '%s<div class="qz-back"><a href="%s">‹ %s · 真题精练目录</a></div>\n' % (BACK_STYLE, href, name)


def detect_count(html):
    """从页面里的「题目总数」那一格读题数（skill 模板的 .facts 区块）。"""
    m = COUNT_RE.search(html)
    return int(m.group(1)) if m else None


def outline_title(sid, slug):
    """按 slug 从大纲反查标题，保证和解析页同名；查不到返回 None。"""
    outline = os.path.join(build.CONTENT_DIR, sid + ".txt")
    if os.path.exists(outline):
        for b in build.parse_outline(outline):
            for ch in b["chapters"]:
                for it in ch["items"]:
                    if it["slug"] == slug:
                        return it["title"]
    for e in build.parse_extras(os.path.join(build.CONTENT_DIR, sid + ".extra.txt")):
        if e["slug"] == slug:
            return e["title"]
    return None


def main():
    ap = argparse.ArgumentParser(description="把精练页落位到 quiz/<科目>/ 并注入站点元数据")
    ap.add_argument("src", help="生成好的单文件精练页")
    ap.add_argument("sid", help="科目 id：%s" % " / ".join(s[0] for s in build.SUBJECTS))
    ap.add_argument("slug", help="章节 slug，如 bx1-c1-s1（与解析页同名）")
    ap.add_argument("n", nargs="?", type=int, default=None,
                    help="题目总数；省略时从页面里读")
    ap.add_argument("--title", default="", help="节标题；省略时从 content 大纲反查")
    ap.add_argument("--build", action="store_true", help="落位后顺便跑一遍 tools/build.py")
    ap.add_argument("--force", action="store_true", help="允许覆盖已存在的精练页")
    args = ap.parse_args()

    names = dict((s[0], s[1]) for s in build.SUBJECTS)
    if args.sid not in names:
        sys.exit("科目不存在: %s（可选: %s）" % (args.sid, ", ".join(names)))
    if not SLUG_RE.match(args.slug):
        sys.exit("slug 不合法: %s" % args.slug)

    src = os.path.abspath(args.src)
    if not os.path.exists(src):
        sys.exit("找不到源文件: %s" % src)

    page_dir = os.path.join(build.QUIZ_DIR, args.sid)
    dest = os.path.join(page_dir, args.slug + ".html")
    if os.path.exists(dest) and not args.force:
        sys.exit("已存在: %s（要覆盖加 --force）" % dest)

    with open(src, "r", encoding="utf-8") as f:
        html = f.read()

    if META_MARK in html and not args.force:
        sys.exit("源文件已含 %s，像是落位过的页面；确认后加 --force" % META_MARK)

    # ---- 题数：显式传入 > 页面里读 ----
    detected = detect_count(html)
    count = args.n if args.n is not None else detected
    if count is None:
        sys.exit("读不出题目总数（页面里没有「题目总数」那一格），请显式传入题数")
    if count <= 0:
        sys.exit("题数必须大于 0")
    if args.n is not None and detected is not None and args.n != detected:
        print("! 传入 %d 题，页面里写的是 %d 题；按传入的记。" % (args.n, detected))

    # ---- 标题：显式传入 > 大纲反查 ----
    found = outline_title(args.sid, args.slug)
    if not found and not args.title:
        print("! 大纲里没有 slug=%s：页面能落位，但目录树上不会出现这一节。" % args.slug)
    title = args.title or found or ""

    # 1. 元数据：插在 </head> 前
    meta = {"sid": args.sid, "slug": args.slug, "n": count, "title": title}
    meta_tag = '<script>window.QUIZ_META = %s;</script>\n' % json.dumps(meta, ensure_ascii=False)
    if "</head>" not in html:
        sys.exit("源文件缺少 </head>，不是完整的 HTML 页面")
    html = html.replace("</head>", meta_tag + "</head>", 1)

    # 2. 返回目录：插在 <body> 后
    if "<body>" not in html:
        sys.exit("源文件缺少 <body>")
    html = html.replace("<body>", "<body>\n" + back_bar(args.sid, names[args.sid]), 1)

    os.makedirs(page_dir, exist_ok=True)
    with open(dest, "w", encoding="utf-8") as f:
        f.write(html)

    rel = os.path.relpath(dest, build.ROOT).replace("\\", "/")
    print("已写入 %s" % rel)
    print("  科目: %s   节: %s   题数: %d" % (names[args.sid], title or args.slug, count))

    if args.build:
        print("")
        build.main()
    else:
        print("下一步: python tools/build.py")


if __name__ == "__main__":
    main()
