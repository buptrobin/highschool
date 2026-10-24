#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
根据 content/*.txt 的大纲，生成：
  1. assets/data.js        —— 站点目录数据
  2. pages/<科目>/<slug>.html —— 每一节 / 每个特别知识点的静态页面（仅在缺失时创建）

已存在的页面不会被覆盖，手写内容安全保留。

用法:
    python tools/build.py
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(ROOT, "content")
PAGES_DIR = os.path.join(ROOT, "pages")
QUIZ_DIR = os.path.join(ROOT, "quiz")
ASSETS_DIR = os.path.join(ROOT, "assets")

# id, 显示名, 主色, 浅色, 说明
SUBJECTS = [
    ("math", "数学", "#2563eb", "#eff5ff", "人教A版 · 必修 + 选择性必修"),
    ("geo",  "地理", "#0891b2", "#ecfbff", "人教版 · 必修 + 选择性必修"),
    ("bio",  "生物", "#16a34a", "#f0fdf3", "人教版 · 必修 + 选择性必修"),
    ("pol",  "政治", "#e11d48", "#fff1f4", "统编版 · 必修 + 选择性必修"),
]


def read_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def parse_outline(path):
    """解析大纲文本。

    # [bx1] 必修第一册（自然地理基础）   -> 册
    ## 第一章 宇宙中的地球              -> 章
    ### 第一节 地球的宇宙环境           -> 节
    ### 问题研究：xxx                   -> 问题研究
    """
    books = []
    book = chapter = None
    for raw in read_text(path).splitlines():
        line = raw.strip()
        if not line or line.startswith("//"):
            continue
        if line.startswith("### "):
            text = line[4:].strip()
            if chapter is None:
                continue
            if text.startswith("问题研究"):
                rest = text.split("：", 1)[1].strip() if "：" in text else text
                chapter["items"].append({"kind": "research", "label": "探究", "title": rest})
            else:
                label, title = "", text
                for sep in (" ", "\u3000"):
                    if sep in text:
                        head, tail = text.split(sep, 1)
                        if head and ("节" in head or "框" in head or "课" in head):
                            label, title = head.strip(), tail.strip()
                            break
                chapter["items"].append({"kind": "section", "label": label, "title": title})
        elif line.startswith("## "):
            chapter = {"title": line[3:].strip(), "items": []}
            if book is not None:
                book["chapters"].append(chapter)
        elif line.startswith("# "):
            text = line[2:].strip()
            key = "b%d" % (len(books) + 1)
            if text.startswith("[") and "]" in text:
                key = text[1:text.index("]")].strip() or key
                text = text[text.index("]") + 1:].strip()
            book = {"key": key, "title": text, "chapters": []}
            books.append(book)
            chapter = None
    # 编号 + 生成 slug
    for b in books:
        for ci, ch in enumerate(b["chapters"], 1):
            ns = nr = 0
            for it in ch["items"]:
                if it["kind"] == "research":
                    nr += 1
                    it["slug"] = "%s-c%d-r%d" % (b["key"], ci, nr)
                else:
                    ns += 1
                    it["slug"] = "%s-c%d-s%d" % (b["key"], ci, ns)
    return books


def parse_extras(path):
    out = []
    if not os.path.exists(path):
        return out
    for raw in read_text(path).splitlines():
        line = raw.strip()
        if not line or line.startswith("//"):
            continue
        if line.startswith("- "):
            line = line[2:].strip()
        out.append({"title": line, "slug": "extra-%d" % (len(out) + 1)})
    return out


QUIZ_META_RE = re.compile(r"window\.QUIZ_META\s*=\s*(\{.*?\})\s*;", re.S)


def scan_quiz(sid):
    """扫 quiz/<sid>/*.html，读每页自报的 window.QUIZ_META。

    精练页是自包含的单文件（内联样式、自带判分与错题本），build.py 不解析它的
    正文，只认这一行元数据（由 tools/quiz-install.py 注入）：

        window.QUIZ_META = {"sid":"geo","slug":"bx1-c1-s1","n":17,"title":"..."}

    返回 {slug: {"href": "quiz/geo/bx1-c1-s1.html", "n": 17, "title": "..."}}；
    没有 quiz/ 目录的科目返回空字典。
    """
    out = {}
    page_dir = os.path.join(QUIZ_DIR, sid)
    if not os.path.isdir(page_dir):
        return out
    for name in sorted(os.listdir(page_dir)):
        if not name.endswith(".html"):
            continue
        meta = {}
        try:
            text = read_text(os.path.join(page_dir, name))
        except OSError:
            continue
        m = QUIZ_META_RE.search(text)
        if m:
            try:
                meta = json.loads(m.group(1))
            except ValueError:
                meta = {}
        n = meta.get("n")
        out[name[:-5]] = {
            "href": "quiz/%s/%s" % (sid, name),
            "n": n if isinstance(n, int) else 0,
            "title": meta.get("title") or "",
        }
    return out


PAGE_TPL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="{color}">
<title>{h1} · {subject} · 俯瞰太阳系</title>
<link rel="stylesheet" href="../../assets/app.css">
<link rel="stylesheet" href="../../assets/print.css" media="print">
</head>
<body class="page" style="--accent:{color};--accent-soft:{soft}">

<header class="topbar">
  <div class="wrap topbar-in">
    <a class="back" href="../../subject.html?s={sid}">‹ {subject}</a>
    <button class="done-btn" id="doneBtn" type="button" data-id="{sid}/{slug}">
      <span class="done-box"></span><span class="done-txt">标记已复习</span>
    </button>
  </div>
</header>

<main class="wrap page-wrap">
  <nav class="crumbs">
    <a href="../../index.html">首页</a><span class="sep">/</span>
    <a href="../../subject.html?s={sid}">{subject}</a><span class="sep">/</span>
    <span>{book}</span><span class="sep">/</span>
    <span class="cur">{chapter}</span>
  </nav>

  <h1 class="page-title">{h1}</h1>
  <div class="page-meta">{subject} · {book} · {chapter}</div>

  <article class="content" id="content"></article>

{pager}
</main>

<script>
window.PAGE = {meta};
</script>
<script type="text/markdown" id="md">
</script>
<script src="../../assets/page.js"></script>
</body>
</html>
"""


def build_page(subj, color, soft, book, chapter, item, prev, nxt):
    def link(node, cls, head):
        if not node:
            return '<span class="pager-link is-empty"></span>'
        # 同目录，直接用文件名
        name = node["href"].rsplit("/", 1)[-1]
        return (
            '<a class="pager-link %s" href="%s"><small>%s</small><b>%s</b></a>'
            % (cls, name, head, node["title"])
        )

    pager = ""
    if prev or nxt:
        pager = ('  <nav class="pager">\n    %s%s\n  </nav>'
                 % (link(prev, "prev", "上一节"), link(nxt, "next", "下一节")))

    lbl = item.get("label", "")
    if item.get("kind") == "research":
        h1 = "问题研究：" + item["title"]
    elif lbl:
        h1 = "%s %s" % (lbl, item["title"])
    else:
        h1 = item["title"]
    meta = {
        "sid": subj,
        "slug": item["slug"],
        "title": item["title"],
        "anchor": "#" + item["slug"],
    }
    return PAGE_TPL.format(
        color=color,
        soft=soft,
        sid=subj,
        subject=dict((s[0], s[1]) for s in SUBJECTS)[subj],
        book=book,
        chapter=chapter,
        h1=h1,
        slug=item["slug"],
        pager=pager,
        meta=json.dumps(meta, ensure_ascii=False),
    )


def main():
    data = []
    quiz_map = {}   # "sid/slug" -> {"n": 17, "title": "..."}，给内容页的「去刷题」用
    created = 0
    for sid, name, color, soft, desc in SUBJECTS:
        outline = os.path.join(CONTENT_DIR, sid + ".txt")
        if not os.path.exists(outline):
            print("  ! 缺少大纲: content/%s.txt" % sid)
            continue
        books = parse_outline(outline)
        extras = parse_extras(os.path.join(CONTENT_DIR, sid + ".extra.txt"))
        quizzes = scan_quiz(sid)

        # 扁平序列，用于上一节/下一节
        flat = []
        for b in books:
            for ch in b["chapters"]:
                for it in ch["items"]:
                    href = "pages/%s/%s.html" % (sid, it["slug"])
                    if it["kind"] == "research":
                        disp = "问题研究：" + it["title"]
                    elif it["label"]:
                        disp = "%s %s" % (it["label"], it["title"])
                    else:
                        disp = it["title"]
                    flat.append({
                        "href": href,
                        "title": disp,
                        "item": it, "book": b["title"], "chapter": ch["title"],
                    })

        page_dir = os.path.join(PAGES_DIR, sid)
        os.makedirs(page_dir, exist_ok=True)

        for idx, node in enumerate(flat):
            path = os.path.join(page_dir, node["item"]["slug"] + ".html")
            if not os.path.exists(path):
                html = build_page(
                    sid, color, soft, node["book"], node["chapter"], node["item"],
                    flat[idx - 1] if idx > 0 else None,
                    flat[idx + 1] if idx + 1 < len(flat) else None,
                )
                with open(path, "w", encoding="utf-8") as f:
                    f.write(html)
                created += 1

        for e in extras:
            path = os.path.join(page_dir, e["slug"] + ".html")
            if not os.path.exists(path):
                html = build_page(
                    sid, color, soft, "特别知识点", "专题整理", e, None, None
                )
                with open(path, "w", encoding="utf-8") as f:
                    f.write(html)
                created += 1

        n_ch = sum(len(b["chapters"]) for b in books)
        n_sec = sum(1 for n in flat if n["item"]["kind"] == "section")
        n_res = sum(1 for n in flat if n["item"]["kind"] == "research")

        for b in books:
            for ch in b["chapters"]:
                for it in ch["items"]:
                    it["href"] = "pages/%s/%s.html" % (sid, it["slug"])
                    q = quizzes.get(it["slug"])
                    if q:
                        it["quiz"] = q
        for e in extras:
            e["href"] = "pages/%s/%s.html" % (sid, e["slug"])
            q = quizzes.get(e["slug"])
            if q:
                e["quiz"] = q

        n_quiz = sum(1 for it in (i for b in books for ch in b["chapters"] for i in ch["items"]) if "quiz" in it)
        n_quiz += sum(1 for e in extras if "quiz" in e)
        n_quiz_total = sum(it["quiz"]["n"] for it in (i for b in books for ch in b["chapters"] for i in ch["items"]) if "quiz" in it)
        n_quiz_total += sum(e["quiz"]["n"] for e in extras if "quiz" in e)

        for slug, q in quizzes.items():
            quiz_map["%s/%s" % (sid, slug)] = {"n": q["n"], "title": q["title"]}

        data.append({
            "id": sid, "name": name, "color": color, "soft": soft, "desc": desc,
            "books": books, "extras": extras,
            "stat": {"books": len(books), "chapters": n_ch, "sections": n_sec,
                     "research": n_res, "extras": len(extras),
                     "total": n_sec + n_res + len(extras),
                     "quiz": n_quiz, "quizTotal": n_quiz_total},
        })
        print("  %s  册%d 章%d 节%d 探究%d 专题%d · 精练%d 节/%d 题"
              % (name, len(books), n_ch, n_sec, n_res, len(extras), n_quiz, n_quiz_total))

    os.makedirs(ASSETS_DIR, exist_ok=True)
    out = os.path.join(ASSETS_DIR, "data.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write("/* 由 tools/build.py 自动生成，请勿手改；改 content/*.txt 后重新运行。 */\n")
        f.write("window.SUBJECTS = ")
        f.write(json.dumps(data, ensure_ascii=False, indent=1))
        f.write(";\n")

    # 内容页靠这个小文件决定要不要显示「去刷题」按钮（page.js 按需加载）
    out_quiz = os.path.join(ASSETS_DIR, "quiz-map.js")
    with open(out_quiz, "w", encoding="utf-8") as f:
        f.write("/* 由 tools/build.py 自动生成，请勿手改；新增精练页后重新运行。 */\n")
        f.write("window.QUIZ_MAP = ")
        f.write(json.dumps(quiz_map, ensure_ascii=False, sort_keys=True, indent=0))
        f.write(";\n")

    print("已写出 assets/data.js、assets/quiz-map.js（%d 节有精练），新建页面 %d 个。"
          % (len(quiz_map), created))


if __name__ == "__main__":
    main()
