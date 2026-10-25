# bio-find.py — 生物题库检索（给建页时选题用）
# 用法：
#   python tools/bio-find.py 关键词1 [关键词2 ...] [--year 2022] [--bj] [--n 20] [--full]
#   默认按「北京优先、年份越近越靠前」排序；--full 打印完整题干与解析。
import io, json, sys

BANK = r"C:\wangxp\script\bio-gk.json"


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = [a for a in sys.argv[1:] if a.startswith("--")]
    year = ""
    if "--year" in flags:
        i = sys.argv.index("--year")
        year = sys.argv[i + 1]
        args = [a for a in args if a != year]
    only_bj = "--bj" in flags
    limit = 20
    if "--n" in flags:
        limit = int(sys.argv[sys.argv.index("--n") + 1])
        args = [a for a in args if a != str(limit)]
    full = "--full" in flags

    rows = json.load(io.open(BANK, encoding="utf-8"))
    hits = []
    for r in rows:
        text = r["stem"] + " " + " ".join(r["options"]) + " " + r.get("explain", "")
        if not all(a in text for a in args):
            continue
        if year and r["year"] < year:
            continue
        if only_bj and r["area"] != "北京":
            continue
        hits.append(r)
    hits.sort(key=lambda r: (r["area"] != "北京", -int(r["year"]), int(r["no"])))
    print("命中 %d 道（显示前 %d）" % (len(hits), min(limit, len(hits))))
    for r in hits[:limit]:
        print("\n[%s·%s 第%s题] 答案 %s" % (r["year"], r["area"], r["no"], r["answer"]))
        print("  题干：" + r["stem"][:260])
        for lab, o in zip("ABCD", r["options"]):
            print("   %s. %s" % (lab, o[:110]))
        if full and r.get("explain"):
            print("  解析：" + r["explain"][:700])
        print("  出处：" + r["doc"].split("\\")[-1] + " 段%d" % r["para"])


if __name__ == "__main__":
    main()
