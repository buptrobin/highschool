# qa-dupcheck.py — 跨页查重
# 用法：python tools/qa-dupcheck.py [quiz/geo]
# 退出码 1 表示发现**不允许**的重复。
#
# 规则（用户定的）：
#   选择题：同一道真题全站只能出现一次，跨册也不行。
#   综合题：允许多册复用——综合题知识点多，在必修/选必不同册里各出现一次是合理的；
#           但**同一本书内部**仍然不许重复（同一册两节收同一道大题没有意义）。
#   跨册复用的综合题只打印提示，不判失败。
import io, os, re, sys, glob, collections

root = sys.argv[1] if len(sys.argv) > 1 else "quiz/geo"
pat_src = re.compile(r'src:"([^"]+)"')
pat_kind = re.compile(r'kind:"([^"]+)"')

# 只认 "2024·江苏卷 第1题" 这类能定位的出处；原创/模拟不参与
# 空格可有可无："2024·北京 第5题" 和 "2024·湖南卷第9题" 都要认（后者以前整条漏检）
real = re.compile(r"(\d{4})·(.+?)\s*第\s*(\d+)\s*题")


def book_of(slug):
    """bx1-c1-s1 -> bx1；xx3-c4-s2 -> xx3"""
    return slug.split("-")[0]


seen = collections.defaultdict(list)   # key -> [(slug, kind)]
for path in sorted(glob.glob(os.path.join(root, "*.html"))):
    slug = os.path.basename(path)[:-5]
    if slug.startswith("_"):
        continue
    s = io.open(path, encoding="utf-8").read()
    i = s.find("var QS = [")
    if i < 0:
        print("!! %s 找不到 QS 数据段" % slug)
        continue
    j = s.find("var ESSAYS", i)
    e = s.find("var ", s.find("];", j)) if j > 0 else -1
    for seg_i, seg in enumerate((s[i:j], s[j:e])):
        label = "选择题" if seg_i == 0 else "综合题"
        for b in re.split(r"\n    \{", seg)[1:]:
            m = pat_src.search(b)
            if not m:
                continue
            kind = pat_kind.search(b)
            if kind and kind.group(1) != "real":
                continue
            k = real.match(m.group(1))
            if not k:
                continue
            # 卷名归一：各页写「2024·北京 第3题」与「2024·北京卷 第3题」的都有，
            # 不归一就会漏查重（2026-10 生物组发现）
            # 卷名归一：「卷」字去掉、「1 月」与不加月份视为同一张卷（浙江 1 月是主卷），
            # 「6 月」必须保留（浙江同年有 1 月、6 月两套）——2026-10 生物组发现漏检
            area = k.group(2).replace("卷", "").replace("　", "").replace(" ", "").strip()
            area = re.sub(r"1月$", "", area)
            key = (k.group(1), area, k.group(3))
            seen[key].append((slug, label))

bad, reused = {}, {}
for key, occ in seen.items():
    slugs = sorted({s for s, _ in occ})
    if len(slugs) < 2:
        continue
    label = occ[0][1]
    if label == "综合题":
        books = {book_of(s) for s in slugs}
        if len(books) < len(slugs):      # 同一本书里撞了 → 不允许
            bad[key] = (label, slugs)
        else:                            # 跨册复用 → 允许，仅提示
            reused[key] = (label, slugs)
    else:
        bad[key] = (label, slugs)

total = sum(len(v) for v in seen.values())
npages = len([p for p in glob.glob(os.path.join(root, "*.html"))
              if not os.path.basename(p).startswith("_")])
print("扫描 %d 页，真题题位 %d 个，去重后 %d 道" % (npages, total, len(seen)))

if reused:
    print("\n跨册复用的综合题（按规则允许，仅供参考）：%d 处" % len(reused))
    for (y, a, n), (label, slugs) in sorted(reused.items()):
        print("  %s·%s 第%s题  ->  %s" % (y, a, n, ", ".join(slugs)))

if bad:
    print("\n发现不允许的重复：")
    for (y, a, n), (label, slugs) in sorted(bad.items()):
        print("  %s·%s 第%s题（%s）  ->  %s" % (y, a, n, label, ", ".join(slugs)))
    sys.exit(1)

print("\n无不允许的重复。")
