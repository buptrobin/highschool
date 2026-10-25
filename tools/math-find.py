"""math-find.py —— 在数学题库里检索（选题用，先查本地再上网）

题库由 tools/math-bank.py 生成：`C:\\wangxp\\script\\math-gk.json`
每条记录：{year, area, kind, no, stem(HTML，公式是内联图片), opts[4], ans(0-based|None),
          ans_text, src, paper, bank}

用法：
    python tools/math-find.py 双曲线 离心率
    python tools/math-find.py 导数 --bj --year 2024
    python tools/math-find.py 数列 --kind 选择 --unused --n 30
    python tools/math-find.py 立体几何 --full        # 打印完整题干文本与选项

`--unused` 会扫描 content/quiz/math/*.json 里各题的 `bank` 字段，只列还没被任何页面用过的题
（跨页查重靠这个字段，所以组装页面时必须保留 `bank`）。
"""
import glob
import io
import json
import os
import re
import sys

BANK = r"C:\wangxp\script\math-gk.json"
SUBJ = "math"


def plain(html):
    s = re.sub(r"<img[^>]*>", "〔公式〕", html or "")
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", s).strip()


def used_ids():
    seen = set()
    for f in glob.glob(os.path.join("content", "quiz", SUBJ, "*.json")):
        if os.path.basename(f).startswith("_"):
            continue
        try:
            d = json.load(io.open(f, encoding="utf-8"))
        except Exception:
            continue
        for q in d.get("questions", []) + d.get("essays", []):
            b = q.get("bank")
            if b:
                seen.add(b)
    return seen


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2
    kws = []
    want_bj = False
    want_year = None
    want_kind = None
    only_unused = False
    full = False
    n = 20
    i = 0
    while i < len(args):
        a = args[i]
        if a == "--bj":
            want_bj = True
        elif a == "--year":
            i += 1
            want_year = int(args[i])
        elif a == "--kind":
            i += 1
            want_kind = args[i]
        elif a == "--unused":
            only_unused = True
        elif a == "--full":
            full = True
        elif a == "--n":
            i += 1
            n = int(args[i])
        else:
            kws.append(a)
        i += 1

    bank = json.load(io.open(BANK, encoding="utf-8"))
    used = used_ids() if only_unused else set()
    hits = []
    for q in bank:
        t = plain(q["stem"])
        if any(k not in t and k not in (q["area"] or "") for k in kws):
            continue
        if want_bj and "北京" not in q["area"]:
            continue
        if want_year and q["year"] != want_year:
            continue
        if want_kind and q["kind"] != want_kind:
            continue
        if only_unused and q["bank"] in used:
            continue
        hits.append(q)

    print("命中 %d 道（题库 %d 道，已用 %d 道）" % (len(hits), len(bank), len(used)))
    for q in hits[:n]:
        tag = "已用" if q["bank"] in used_ids_cached else "  "
        ans = q.get("ans_text") or ("?" if q.get("ans") is None else "?")
        print("\n[%s] %s｜%s｜%s｜答案 %s" % (q["bank"], q["src"], q["kind"], tag.strip() or "未用", ans))
        print("   " + plain(q["stem"])[:120])
        if full and q.get("opts"):
            for lab, o in zip("ABCD", q["opts"]):
                print("     %s. %s" % (lab, plain(o)[:100]))
    return 0


used_ids_cached = set()

if __name__ == "__main__":
    used_ids_cached = used_ids() if "--unused" in sys.argv else set()
    sys.exit(main())
