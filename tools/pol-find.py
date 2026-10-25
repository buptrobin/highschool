"""政治题库检索

用法：
    python tools/pol-find.py 关键词 [关键词2 ...] [--bj] [--year 2024] [--n 20] [--full]
                                [--kind 选择|主观] [--paper bj2024]

                          --unused  只列还没被任何精练页收过的题
"""
import io
import json
import re
import sys

BANK = r"C:\wangxp\script\pol-gk.json"
USED = r"content\quiz\pol\_used.json"


def main():
    args = [a for a in sys.argv[1:]]
    kw, bj, years, n, full = [], False, [], 8, False
    kind, paper, unused = None, None, False
    i = 0
    while i < len(args):
        a = args[i]
        if a == "--bj":
            bj = True
        elif a == "--year":
            i += 1
            years.append(int(args[i]))
        elif a == "--n":
            i += 1
            n = int(args[i])
        elif a == "--full":
            full = True
        elif a == "--kind":
            i += 1
            kind = args[i]
        elif a == "--paper":
            i += 1
            paper = args[i]
        elif a == "--unused":
            unused = True
        else:
            kw.append(a)
        i += 1
    bank = json.load(io.open(BANK, encoding="utf-8"))
    used = set()
    try:
        used = set(json.load(io.open(USED, encoding="utf-8")))
    except Exception:
        pass
    hits = []
    for q in bank:
        if bj and q["area"] not in ("北京",):
            continue
        if years and q["year"] not in years:
            continue
        if kind and q["kind"] != kind:
            continue
        if paper and q["paper"] != paper:
            continue
        if unused and q["bank"] in used:
            continue
        blob = " ".join([q.get("stem", ""), q.get("material", ""), q.get("ask", ""),
                         q.get("why", ""), " ".join(q.get("opts", []))])
        if kw and not all(k in blob for k in kw):
            continue
        hits.append(q)
    hits.sort(key=lambda q: (-q["year"], q["area"], q["no"]))
    print("命中 %d 道（显示前 %d）" % (len(hits), min(n, len(hits))))
    for q in hits[:n]:
        src = "%d·%s 第%d题" % (q["year"], q["area"], q["no"])
        pad = "  " if q["kind"] == "选择" else "[主观] "
        txt = q["stem"] if q["kind"] == "选择" else (q["ask"] or q["material"])
        txt = re.sub(r"\s+", " ", txt)
        print("%-12s %s%s" % (q["bank"], pad, txt[:100]))
        if full:
            if q["kind"] == "选择":
                for j, o in enumerate(q["opts"]):
                    print("      %s. %s" % ("ABCD"[j], o[:120]))
                print("      答案 %s" % "ABCD"[q["ans"]] if q["ans"] >= 0 else "      答案 ?")
            else:
                print("      材料:", q["material"][:200])
                print("      设问:", q["ask"][:160])
            print("      解析:", q["why"][:220])
            print()


if __name__ == "__main__":
    main()
