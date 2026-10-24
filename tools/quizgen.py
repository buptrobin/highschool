# -*- coding: utf-8 -*-
"""quizgen.py — 精练页生成器：一份 JSON 数据 → 一个单文件 HTML 页面。

为什么要有它：直接让模型写 300 KB 页面，绝大部分 token 花在照抄模板的
CSS/判分引擎/base64 图上。数据与模板分离后，每节只需要写 10–20 KB 的 JSON。

用法
----
1. 先从一份已验证的成品页里切出模板（只需做一次，换模板时再做）：

       python tools/quizgen.py --make-shell quiz/geo/bx1-c3-s3.html tools/quiz-shell.html

2. 生成：

       python tools/quizgen.py content/quiz/geo/bx1-c4-s1.json out/bx1-c4-s1.html

3. 落位（和以前一样）：

       python tools/quiz-install.py <out.html> geo bx1-c4-s1 --build

spec 结构见文件末尾 SPEC 注释。
"""
import argparse
import base64
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------- 切片锚点

ANCHORS = [
    # (名字, 起始锚点, 结束锚点, 占位符, 结束锚点是否含在切片内)
    ("hero",   '<header class="hero">', '<div class="hud">',  "<!--@@HERO@@-->", False),
    ("map",    '<section id="map">',    '<section id="quiz"', "<!--@@MAP@@-->",  False),
    ("traps",  '<section id="traps">',  "<footer",            "<!--@@TRAPS@@-->", False),
    ("footer", "<footer",               "</footer>",          "<!--@@FOOTER@@-->", True),
    ("data",   "  var BOOK",            "function el(",      "/*@@DATA@@*/",   False),
]


def make_shell(src, dst):
    s = io.open(src, encoding="utf-8").read()
    out = s
    # 先按锚点切片（从后往前替换，避免位置漂移）
    cuts = []
    for name, start_anchor, end_anchor, ph, end_inclusive in ANCHORS:
        i = out.find(start_anchor)
        j = out.find(end_anchor, i + len(start_anchor))
        if i < 0 or j < 0:
            sys.exit("模板里找不到切片「%s」的锚点：%s / %s" % (name, start_anchor, end_anchor))
        if end_inclusive:
            j += len(end_anchor)
        cuts.append((i, j, ph))

    # 图片 + 图函数：从第一个 *_IMG 变量到 function drawSvg(
    m = re.search(r"\n\s*var [A-Z0-9_]+_IMG = \"data:", out)
    k = out.find("function drawSvg(")
    if m and k > 0:
        # 起点回退到行首：否则上一行的 // 注释会把插入的第一行吞掉
        line_start = out.rfind("\n", 0, m.start()) + 1
        cuts.append((line_start, k, "/*@@FIGS@@*/"))
    else:
        sys.exit("模板里找不到图片区（*_IMG 变量）或 drawSvg")

    for i, j, ph in sorted(cuts, reverse=True):
        out = out[:i] + ph + out[j:]

    # 模板来自一份已安装的成品页：剥掉 quiz-install 注入的反向链接与 QUIZ_META，
    # 否则安装时会再注入一次，页面顶部长出两条「‹ 精练目录」。
    for pat in (r"<style>\s*\.qz-back.*?</style>\s*",
                r'<div class="qz-back">.*?</div>\s*',
                r"<script>window\.QUIZ_META\s*=.*?</script>\s*"):
        out, n = re.subn(pat, "", out, count=1, flags=re.S)
        if not n:
            print("提示：模板里没有可剥离的 %s" % pat[:26])

    io.open(dst, "w", encoding="utf-8").write(out)
    print("模板已写出：%s（%d 字符，原页 %d 字符）" % (dst, len(out), len(s)))


# ---------------------------------------------------------------- 渲染片段

def js(v):
    return json.dumps(v, ensure_ascii=False)


def render_hero(sp):
    facts = "".join(
        '<div class="fact"><b>%s</b><span>%s</span></div>' % (f["n"], f["label"])
        for f in sp["facts"])
    return (
        '<header class="hero">\n  <div class="wrap">\n    <div class="hero-grid">\n      <div>\n'
        '        <span class="kicker">%s</span>\n'
        '        <h1>%s<span class="thin">%s</span></h1>\n'
        '        <p class="lede">%s</p>\n'
        '        <div class="facts">%s</div>\n'
        '      </div>\n'
        '      <div class="hero-art" aria-hidden="true">%s</div>\n'
        '    </div>\n  </div>\n</header>\n'
        % (sp["kicker"], sp["title"], sp["thin"], sp["lede"], facts, sp.get("hero_art", "")))


def render_map(sp):
    m = sp["map"]
    badges = "".join(
        '<span style="background:%s;color:%s;border-radius:999px;padding:4px 12px;'
        'font-size:12.5px;font-weight:600">%s</span>' % (b.get("bg", "#eaf1ff"),
                                                         b.get("fg", "#2050c8"), b["text"])
        for b in sp["freq"]["badges"])
    freq = (
        '<div class="panel" style="border-left:4px solid #2050c8;background:#fffefa">\n'
        '  <p class="panel-title">%s</p>\n'
        '  <div style="display:flex;flex-wrap:wrap;gap:8px;margin:0 0 10px">%s</div>\n'
        '  <p style="margin:0 0 10px;font-size:14px;line-height:1.85;color:#8a4b12;background:#fff6e8;'
        'border:1px solid #f3dcc0;border-radius:10px;padding:10px 12px">%s</p>\n'
        '  <p style="margin:0;font-size:13.5px;line-height:1.85;color:#455267">%s</p>\n'
        '</div>'
        % (sp["freq"]["title"], badges, sp["freq"]["conclusion"], sp["freq"]["body"]))

    cards = []
    first_fig = True
    for c in m.get("cards", []):
        inner = c.get("html", "")
        if c.get("fig"):
            fid = "map-fig" if first_fig else "map-fig-%s" % c["fig"]
            first_fig = False
            inner = '<div class="svg-box" id="%s">%s</div>' % (fid, sp["_figs"].get(c["fig"], ""))
        cards.append('<div class="panel"><p class="panel-title">%s</p>%s</div>' % (c["title"], inner))

    return (
        '<section id="map">\n'
        '  <div class="sec-head"><span class="sec-num">%s</span><h2>%s</h2></div>\n'
        '  <p class="sec-sub">%s</p>\n'
        '  <div class="kmap">%s%s</div>\n'
        '</section>\n'
        % (m.get("num", "00 / 先看地图"), m["title"], m.get("sub", ""), freq, "".join(cards)))


def render_traps(sp):
    t = sp.get("traps") or {}
    blocks = []
    for item in t.get("items", []):
        ps = "".join("<p>%s</p>" % p for p in item["ps"])
        blocks.append('<div class="trap"><span class="x">✕</span><div>%s</div></div>' % ps)
    return (
        '<section id="traps">\n'
        '  <div class="sec-head"><span class="sec-num">%s</span><h2>%s</h2></div>\n'
        '  <p class="sec-sub">%s</p>\n'
        '  <div class="traps">%s</div>\n'
        '</section>\n'
        % (t.get("num", "02 / 收口"), t.get("title", "最容易丢分的几个点"),
           t.get("sub", "考前五分钟扫一遍，比再刷十道题管用。"), "".join(blocks)))


def render_footer(sp):
    parts = []
    for blk in sp.get("footer", []):
        parts.append("<h4>%s</h4>\n<ul>%s</ul>" % (blk["h"], "".join(blk["items"])))
    return "<footer>\n" + "\n".join(parts) + "\n</footer>\n"


def render_data(sp):
    lines = ["  /* ---- 数据层（由 quizgen 生成，勿手改） ---- */"]
    b = sp["book"]
    lines.append('  var BOOK = {book:%s, chapter:%s, section:%s};'
                 % (js(b["book"]), js(b["chapter"]), js(b["section"])))
    lines.append('  var TOPIC = {%s};' % ", ".join(
        '%d:%s' % (int(k), js(v)) for k, v in sorted(sp["topics"].items(), key=lambda x: int(x[0]))))
    lines.append('  var LEVELS = [')
    for lv in sp["levels"]:
        lines.append('    {id:%d, name:%s, sub:%s, badge:%s, color:%s, lcl:%s},'
                     % (lv["id"], js(lv["name"]), js(lv["sub"]), js(lv["badge"]),
                        js(lv["color"]), js(lv["lcl"])))
    lines.append('  ];')
    lines.append('  var QS = [')
    for q in sp["questions"]:
        fields = ['id:%d' % q["id"], 'lv:%d' % q["lv"], 'src:%s' % js(q["src"]),
                  'kind:%s' % js(q.get("kind", "orig")), 'star:%d' % q.get("star", 2)]
        if q.get("svg"):
            fields.append('svg:%s' % js(q["svg"]))
        # 引擎没有渲染 material 的位置，材料折进题干（stem 走 innerHTML，允许标签）
        stem = q["stem"]
        if q.get("material"):
            stem = ('<span style="display:block;margin:0 0 10px;padding:8px 10px;'
                    'background:#f7f9fc;border-left:3px solid #c9d6e8;border-radius:6px;'
                    'font-size:13.5px;line-height:1.8;color:#455267">%s</span>' % q["material"]) + stem
        lines.append('    {')
        lines.append('      ' + ", ".join(fields) + ",")
        lines.append('      stem:%s,' % js(stem))
        lines.append('      opts:[%s],' % ", ".join(js(o) for o in q["opts"]))
        lines.append('      ans:%d,' % q["ans"])
        lines.append('      why:%s,' % js(q["why"]))
        if q.get("tip"):
            lines.append('      tip:%s' % js(q["tip"]))
        lines.append('    },')
    lines.append('  ];')
    lines.append('  var ESSAYS = [')
    for e in sp.get("essays", []):
        asks = ", ".join('{q:%s, pt:%d}' % (js(a["q"]), a["pt"]) for a in e["asks"])
        pts = ",\n".join("        [%s]" % ", ".join(js(p) for p in ps) for ps in e["points"])
        lines.append('    {')
        lines.append('      id:%d, lv:%d, src:%s, star:%d, title:%s,'
                     % (e["id"], e.get("lv", 5), js(e["src"]), e.get("star", 3), js(e["title"])))
        lines.append('      material:%s,' % js(e["material"]))
        lines.append('      asks:[%s],' % asks)
        lines.append('      points:[\n%s\n      ],' % pts)
        if e.get("tip"):
            lines.append('      tip:%s' % js(e["tip"]))
        lines.append('    },')
    lines.append('  ];')
    return "\n".join(lines)


def render_figs(sp):
    """图：图片转 base64 内嵌；SVG 直接内联。统一登记到 FIG。"""
    out, regs = ["\n  /* ---- 图：内联 SVG / base64 配图 ---- */"], []
    for key, f in (sp.get("figures") or {}).items():
        fn = "buildFig" + re.sub(r"[^A-Za-z0-9]", "_", key).upper()
        if "img" in f:
            path = f["img"] if os.path.isabs(f["img"]) else os.path.join(ROOT, f["img"])
            raw = open(path, "rb").read()
            mime = "image/jpeg" if path.lower().endswith((".jpg", ".jpeg")) else "image/png"
            uri = "data:%s;base64,%s" % (mime, base64.b64encode(raw).decode())
            var = "IMG_" + re.sub(r"[^A-Za-z0-9]", "_", key).upper()
            out.append('  var %s = "%s";' % (var, uri))
            html = ('<img src="\'+%s+\'" alt="%s" style="width:100%%;height:auto;display:block;'
                    'border-radius:10px%s">'
                    % (var, f.get("alt", ""),
                       (";max-width:%dpx;margin:0 auto" % f["maxw"]) if f.get("maxw") else ""))
            out.append('  function %s(host){ host.innerHTML = \'%s\'; }' % (fn, html))
        else:
            html = '<div class="svg-box">%s</div>' % f["svg"]
            out.append('  function %s(host){ host.innerHTML = %s; }' % (fn, js(html)))
        regs.append('    %s: %s' % (js(key), fn))
    out.append('  var FIG = {')
    out.append(",\n".join(regs))
    out.append('  };')
    return "\n".join(out)


def build(spec_path, out_path):
    sp = json.load(io.open(spec_path, encoding="utf-8"))
    sp["_figs"] = {k: v.get("svg", "") for k, v in (sp.get("figures") or {}).items()}
    shell = io.open(os.path.join(ROOT, "tools", "quiz-shell.html"), encoding="utf-8").read()

    nq = len(sp["questions"])
    sp.setdefault("facts", [
        {"n": nq, "label": "选择题"},
        {"n": sum(1 for q in sp["questions"] if q.get("kind") == "real"), "label": "真题"},
        {"n": len(sp.get("essays", [])), "label": "综合大题"},
        {"n": len(sp["levels"]), "label": "难度关卡"},
    ])

    body = {
        "<!--@@HERO@@-->": render_hero(sp),
        "<!--@@MAP@@-->": render_map(sp),
        "<!--@@TRAPS@@-->": render_traps(sp),
        "<!--@@FOOTER@@-->": render_footer(sp),
        "/*@@DATA@@*/": render_data(sp),
        "/*@@FIGS@@*/": render_figs(sp),
    }
    out = shell
    for k, v in body.items():
        if k not in out:
            sys.exit("模板缺少占位符：%s" % k)
        out = out.replace(k, v)

    # 错题本 key、页面标题、返回链接
    out = re.sub(r'var STORE_KEY = "[^"]*"', 'var STORE_KEY = "%s"' % sp["store_key"], out)
    out = re.sub(r"<title>[^<]*</title>", "<title>%s</title>" % sp["title"], out, count=1)
    out = out.replace("‹ 地理 · 真题精练目录›", "‹ %s · 真题精练目录›" % sp.get("subject_name", "地理"))

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    io.open(out_path, "w", encoding="utf-8").write(out)
    print("已生成 %s（%d 题 + %d 综合，%d 字符）" % (out_path, nq, len(sp.get("essays", [])), len(out)))


SPEC = r"""
{
  "slug": "bx1-c4-s1", "subject_name": "地理",
  "kicker": "人教版 · 必修第一册 · 第四章第一节",
  "title": "常见地貌类型",
  "thin": "北京卷 2 道 · 外地真题 5 道 · 5 关 15 题",
  "lede": "…一句话主线，可用 <b>标签</b>…",
  "hero_art": "<svg viewBox='0 0 300 300'>…</svg>",
  "store_key": "geo-landform1-v1",
  "book": {"book": "必修第一册", "chapter": "第四章 地貌", "section": "第一节 常见地貌类型"},
  "topics": {"1": "流水地貌", "2": "喀斯特地貌"},
  "levels": [{"id":1,"name":"…","sub":"…","badge":"基础","color":"#4858d4","lcl":"#eef0ff"}],
  "freq": {"title": "高考考频 · 北京等级考 2021—2026（越近权重越高）",
           "badges": [{"text":"近 3 年北京 0 题"}, {"text":"外地近 3 年 5 题","bg":"#eef7f6","fg":"#0f7f7c"}],
           "conclusion": "<b>一句话结论：</b>…", "body": "北京卷：…"},
  "map": {"num":"00 / 先看地图","title":"…","sub":"…",
          "cards":[{"title":"① …","fig":"river"},{"title":"② …","html":"<p>…</p>"}]},
  "questions": [{"id":1,"lv":1,"kind":"real","src":"2024·北京卷 第9题","star":2,
                 "svg":"bj24","stem":"…","opts":["A…","B…","C…","D…"],"ans":0,
                 "why":"…","tip":"…"}],
  "essays": [{"id":16,"lv":5,"src":"原创·综合题","star":3,"title":"…","material":"…",
              "asks":[{"q":"…","pt":6}],"points":[["…","…"]],"tip":"…"}],
  "traps": {"title":"…","sub":"…","items":[{"ps":["<b>…</b>…","…"]}]},
  "footer": [{"h":"怎么用这份材料","items":["<li>…</li>"]},
             {"h":"题目来源说明","items":["<li><b>北京真题（2 道）：</b>…</li>"]}],
  "figures": {"river": {"svg": "<svg …</svg>"},
              "bj24": {"img": "content/quiz/figs/bx1-c4-s1/bj24.png", "alt": "2024 北京卷第 9 题原卷图"}}
}
"""


def main():
    ap = argparse.ArgumentParser(description="精练页生成器：JSON → 单文件 HTML")
    ap.add_argument("spec_or_src")
    ap.add_argument("out", nargs="?", default=None)
    ap.add_argument("--make-shell", action="store_true", help="把一份成品页切成模板")
    args = ap.parse_args()
    if args.make_shell:
        if not args.out:
            sys.exit("--make-shell 需要输出路径")
        make_shell(args.spec_or_src, args.out)
    else:
        if not args.out:
            sys.exit("需要输出路径：quizgen.py spec.json out.html")
        build(args.spec_or_src, args.out)


if __name__ == "__main__":
    main()
