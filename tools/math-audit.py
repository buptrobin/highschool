"""数学精练页体检：挑出「解析过简」和「综合题要点不齐」的页。

用法：
    python tools/math-audit.py              # 扫 content/quiz/math/*.json
    python tools/math-audit.py --min 45     # 阈值调高/调低

注意：数学解析里的公式是图，纯文字往往只有十几个字（「根据交集的运算可知，<图>，
故选：A」），所以按「文字数 + 25×公式图数」计分，别只数文字。
"""
import argparse
import glob
import io
import json
import os
import re

TAG = re.compile(r"<[^>]+>")
IMG = re.compile(r"<img[^>]*>")


def plain(s):
    return re.sub(r"\s+", " ", TAG.sub("", s or "")).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--min", type=int, default=45, help="低于这个分算解析过简")
    ap.add_argument("--dir", default=os.path.join("content", "quiz", "math"))
    args = ap.parse_args()

    bad = []
    files = [f for f in sorted(glob.glob(os.path.join(args.dir, "*.json")))
             if not os.path.basename(f).startswith("_")]
    for f in files:
        d = json.load(io.open(f, encoding="utf-8"))
        slug = d.get("slug") or os.path.basename(f)[:-5]
        for q in d.get("questions", []):
            why = q.get("why", "")
            w = plain(why)
            score = len(w) + 25 * len(IMG.findall(why))
            if score < args.min:
                bad.append((slug, q.get("id"), q.get("src", "")[:22], score, w[:40]))
        for e in d.get("essays", []):
            asks, pts = e.get("asks") or [], e.get("points") or []
            if len(asks) != len(pts):
                bad.append((slug, e.get("id"), "综合题 asks/points 不齐",
                            len(pts), (e.get("title") or "")[:30]))
            elif not pts:
                bad.append((slug, e.get("id"), "综合题没有要点", 0,
                            (e.get("title") or "")[:30]))

    print("扫描 %d 页" % len(files))
    if not bad:
        print("全部通过：没有解析过简或要点不全的题")
        return 0
    for slug, qid, src, n, head in bad:
        print("%-14s #%-4s %-22s %4d 分  %s" % (slug, qid, src, n, head))
    print("\n共 %d 处需要补" % len(bad))
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
