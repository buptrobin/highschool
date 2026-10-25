# bio-audit.py — 拿北京【答案卷】独立核对题库里北京选择题的答案
# 题库答案是从【解析卷】抽的；这里换成另一个文件（答案卷）再抽一遍，两边对不上就报出来。
# 用法：python tools/bio-audit.py            （只核北京，2023—2026）
#       python tools/bio-audit.py 2024 2025  （指定年份）
import glob, io, json, os, re, sys

import docx

BANK = r"C:\wangxp\script\bio-gk.json"
ANS_ROOT = r"C:\baidunetdiskdownload\【2】北京2026高考真题"
ANS = re.compile(r"答案\s*[：:]\s*([A-D]+)")
ANS_BRACKET = re.compile(r"[\[【]\s*答案\s*[\]】]\s*([A-D]+)")   # 2024 用「1. [答案] D」
NO_PATTERNS = [
    re.compile(r"^第\s*(\d{1,2})\s*题"),          # 2026
    re.compile(r"^题目\s*(\d{1,2})"),             # 2025
    re.compile(r"^(\d{1,2})\s*[.．、]\s*\[答案\]"),  # 2024
]


def parse_key(year):
    """返回 {题号: 答案}"""
    hits = glob.glob(os.path.join(ANS_ROOT, "**", "%s年高考生物试卷（北京）（答案）.docx" % year),
                     recursive=True)
    if not hits:
        return {}
    ps = [p.text.replace("\u200b", "").replace("\xa0", " ").strip()
          for p in docx.Document(hits[0]).paragraphs]
    ps = [p for p in ps if p]

    ans, cur = {}, None
    seq = 0
    for t in ps:
        no = None
        for pat in NO_PATTERNS:
            m = pat.match(t)
            if m:
                no = int(m.group(1))
                break
        if no is not None:
            cur = no
            am = ANS.search(t) or ANS_BRACKET.search(t)
            if am:
                ans[cur] = am.group(1)
            continue
        am = ANS.search(t) or ANS_BRACKET.search(t)
        if not am:
            continue
        if cur is None:
            # 2023 那种只按顺序排、不给题号的答案卷
            seq += 1
            cur = seq
        ans.setdefault(cur, am.group(1))
        cur = None
    return ans


def main():
    years = sys.argv[1:] or ["2023", "2024", "2025", "2026"]
    rows = json.load(io.open(BANK, encoding="utf-8"))
    total_bad = 0
    for y in years:
        key = parse_key(y)
        bank = {r["no"]: r for r in rows if r["year"] == y and r["area"] == "北京"}
        if not key:
            print("%s：答案卷没抽到，跳过" % y)
            continue
        bad = []
        missing = []
        for no in sorted(key):
            if no not in bank:
                missing.append(no)
                continue
            if bank[no]["answer"] != key[no]:
                bad.append((no, bank[no]["answer"], key[no], bank[no]["stem"][:38]))
        print("%s：答案卷 %d 条，题库 %d 条，冲突 %d，题库缺 %s"
              % (y, len(key), len(bank), len(bad), missing or "无"))
        for no, a, b, stem in bad:
            print("   第%-2d题 题库 %s / 答案卷 %s  | %s" % (no, a, b, stem))
        total_bad += len(bad)
    print("\n合计冲突:", total_bad)


if __name__ == "__main__":
    main()
