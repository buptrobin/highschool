"""math-assemble.py —— 把「选题清单」+ 题库 组装成精练页 spec

为什么要多这一层：数学题的题干里公式是**图片**（原卷 WMF 转的 PNG），一段题干就有
5–10 个 base64 图。如果让模型直接写 spec，光贴这些 base64 就把上下文烧光了，还容易
贴错。所以分工是：

    模型只写「选题清单」：哪道题（bank id）、难度、解析、提示、页面文案
    本工具负责：从题库取题干/选项/答案，把公式图转成 data URI 内联，写出完整 spec

用法：
    python tools/math-assemble.py <slug> [--pick content/quiz/math/_pick/<slug>.json]
    python tools/math-assemble.py --all

清单格式（content/quiz/math/_pick/<slug>.json）：
{
  "slug": "bx1-c1-s1",
  "kicker": "人教A版 · 必修第一册 · 第一章第一节",
  "title": "集合的概念",
  "thin": "北京真题 2 道 · 外地真题 3 道 · 原创 7 道 · 5 关 12 题",
  "lede": "……",
  "hero_art": "<svg …>",
  "book": {"book": "必修第一册", "chapter": "第一章 集合与常用逻辑用语", "section": "1.1 集合的概念"},
  "topics": {"1": "…", "2": "…"},
  "levels": [{"id":1,"name":"…","sub":"…","badge":"基础","color":"#…","lcl":"#…"}, …5 个…],
  "freq": {"badges":[{"text":"…"}], "conclusion":"…", "body":"…"},
  "map": {"num":"00 / 先看地图","title":"…","sub":"…","cards":[{"title":"…","fig":"k1"}]},
  "figures": {"k1": {"svg": "<svg …>"}},
  "questions": [{"bank":"bj2025#3","lv":1,"star":2,"why":"…","tip":"…"}, …],
  "essays": [{"bank":"bj2025#18","lv":5,"star":3,"title":"…",
              "asks":[{"q":"…","pt":4}],"points":[["…","…"]],"tip":"…"}, …],
  "footer": [{"h":"…","items":["<li>…</li>"]}]
}

题目里的 `bank` 字段会保留在 spec 里，跨页查重（tools/qa-dupcheck.py 的 bank 版）靠它。
"""
import argparse
import base64
import glob
import io
import json
import os
import re
import sys

from PIL import Image

BANK = r"C:\wangxp\script\math-gk.json"
SRCROOT = os.path.join("out", "mathsrc")
OUTDIR = os.path.join("content", "quiz", "math")
PICKDIR = os.path.join(OUTDIR, "_pick")
MAX_H = 170      # 公式图显示高度不过 20-30px，留 5 倍余量足够，再大只是让页面变胖
MAX_W = 900


def load_bank():
    bank = json.load(io.open(BANK, encoding="utf-8"))
    return {q["bank"]: q for q in bank}


def img_data_uri(paper, rel):
    """rel 形如 img/image3.png（相对 out/mathsrc/<paper>/）"""
    path = os.path.join(SRCROOT, paper, rel)
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    with Image.open(path) as im:
        im = im.convert("L")
        w, h = im.size
        k = min(1.0, MAX_H / float(h), MAX_W / float(w))
        if k < 1.0:
            im = im.resize((max(1, int(w * k)), max(1, int(h * k))), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


IMG_RE = re.compile(r'<img[^>]*src="(img/[^"]+)"[^>]*>')


def inline_images(html, paper, cache):
    def rep(m):
        rel = m.group(1)
        key = (paper, rel)
        if key not in cache:
            cache[key] = img_data_uri(paper, rel)
        # 把相对 src 换成 data URI，行内样式保留
        return m.group(0).replace('src="%s"' % rel, 'src="%s"' % cache[key])

    return IMG_RE.sub(rep, html or "")


def build(slug, pick, bank, cache):
    if not pick.get("questions"):
        raise SystemExit("%s: 清单里没有 questions" % slug)
    if "thin" not in pick:
        raise SystemExit(
            "%s: _pick 清单缺 thin 字段。带 store_key/slug 又没有 thin 的 JSON 是「成品 spec」，"
            "不是选题清单——多半是拿 spec 当清单写坏了，照 content/quiz/math/_pick/README.md 补 thin" % slug
        )
    out = {
        "slug": slug,
        "subject_name": "数学",
        "kicker": pick["kicker"],
        "title": pick["title"],
        "thin": pick["thin"],
        "lede": pick["lede"],
        "hero_art": pick["hero_art"],
        "store_key": pick.get("store_key") or ("math-%s-v1" % slug),
        "book": pick["book"],
        "topics": pick["topics"],
        "levels": pick["levels"],
        "freq": pick["freq"],
        "map": pick["map"],
        "questions": [],
        "essays": [],
        "footer": pick["footer"],
        "traps": pick.get("traps"),
        "figures": pick.get("figures", {}),
    }
    missing = []
    for i, p in enumerate(pick["questions"], 1):
        if p.get("orig"):
            # 原创题：题干选项直接写在清单里（没有公式图，纯 HTML/Unicode）
            if len(p.get("opts") or []) != 4:
                raise SystemExit("%s: 原创题 %s 选项不是 4 个" % (slug, p.get("stem", "")[:20]))
            out["questions"].append({
                "id": i,
                "lv": p["lv"],
                "kind": p.get("kind", "orig"),
                "src": p.get("src", "原创"),
                "bank": None,
                "star": p.get("star", 2),
                "stem": p["stem"],
                "opts": p["opts"],
                "ans": p["ans"],
                # 原创题没有 paper（题库编号），why 规定是纯文本，不能走 inline_images
                "why": p.get("why", ""),
                "tip": p.get("tip", ""),
            })
            continue
        q = bank.get(p["bank"])
        if not q:
            missing.append(p["bank"])
            continue
        if not q.get("opts"):
            raise SystemExit("%s: %s 没有拆出选项，不能当选择题用" % (slug, p["bank"]))
        if q.get("ans") is None:
            raise SystemExit("%s: %s 没有答案，不能收" % (slug, p["bank"]))
        out["questions"].append({
            "id": i,
            "lv": p["lv"],
            "kind": "real",
            "src": q["src"],
            "bank": p["bank"],
            "star": p.get("star", 2),
            "stem": inline_images(q["stem"], q["paper"], cache),
            "opts": [inline_images(o, q["paper"], cache) for o in q["opts"]],
            "ans": q["ans"],
            "why": inline_images(p.get("why") or q.get("why", ""), q.get("why_paper") or q["paper"], cache),
            "tip": p.get("tip", ""),
        })
    for j, e in enumerate(pick.get("essays", [])):
        if e.get("orig"):
            out["essays"].append({
                "id": len(out["questions"]) + j + 1,
                "lv": 5,
                "kind": "orig",
                "src": e.get("src", "原创"),
                "bank": None,
                "star": e.get("star", 3),
                "title": e["title"],
                "material": e["material"],
                "asks": e["asks"],
                "points": e["points"],
                "tip": e.get("tip", ""),
            })
            continue
        q = bank.get(e["bank"])
        if not q:
            missing.append(e["bank"])
            continue
        out["essays"].append({
            "id": len(out["questions"]) + j + 1,
            "lv": 5,
            "kind": "real",
            "src": q["src"],
            "bank": e["bank"],
            "star": e.get("star", 3),
            "title": e["title"],
            "material": e.get("material") or inline_images(q["stem"], q["paper"], cache),
            "asks": e["asks"],
            "points": e["points"],
            "tip": e.get("tip", ""),
        })
    if missing:
        raise SystemExit("%s: 题库里找不到 %s" % (slug, missing))
    return out


def check(slug, spec):
    errs = []
    if len(spec["levels"]) != 5:
        errs.append("levels=%d（必须 5 关）" % len(spec["levels"]))
    for q in spec["questions"]:
        if len(q["opts"]) != 4:
            errs.append("Q%d 选项 %d 个" % (q["id"], len(q["opts"])))
        if not (1 <= q["star"] <= 3):
            errs.append("Q%d star=%d" % (q["id"], q["star"]))
        if not q["why"]:
            errs.append("Q%d 没写解析" % q["id"])
    for e in spec["essays"]:
        if e["lv"] != 5:
            errs.append("综合题 lv=%d" % e["lv"])
        if not e["asks"] or not e["points"] or len(e["asks"]) != len(e["points"]):
            errs.append("综合题 %d 的 asks/points 不齐" % e["id"])
    for k in ("thin", "lede", "hero_art", "freq", "map", "footer"):
        if not spec.get(k):
            errs.append("缺字段 %s" % k)
    return errs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slugs", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--check-only", action="store_true")
    args = ap.parse_args()
    bank = load_bank()
    cache = {}
    if args.all:
        targets = sorted(glob.glob(os.path.join(PICKDIR, "*.json")))
    else:
        targets = [os.path.join(PICKDIR, "%s.json" % s) for s in args.slugs]
    if not targets:
        print("没有要组装的清单")
        return 2
    bad = 0
    for path in targets:
        slug = os.path.basename(path)[:-5]
        pick = json.load(io.open(path, encoding="utf-8"))
        spec = build(slug, pick, bank, cache)
        errs = check(slug, spec)
        if errs:
            bad += 1
            print("✗ %-14s %s" % (slug, "；".join(errs)))
            continue
        if args.check_only:
            print("✓ %-14s %d 题（选择 %d + 综合 %d）" % (slug, len(spec["questions"]) + len(spec["essays"]), len(spec["questions"]), len(spec["essays"])))
            continue
        os.makedirs(OUTDIR, exist_ok=True)
        dst = os.path.join(OUTDIR, slug + ".json")
        with io.open(dst, "w", encoding="utf-8", newline="\n") as fh:
            json.dump(spec, fh, ensure_ascii=False, indent=2)
        kb = os.path.getsize(dst) / 1024.0
        print("✓ %-14s %d 题  %6.0f KB  → %s" % (slug, len(spec["questions"]) + len(spec["essays"]), kb, dst))
    if bad:
        print("有 %d 个清单不合格" % bad)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
