# qa-dupcheck.py — 跨页查重：同一道真题（年份+卷别+题号）不许出现在两个精练页里
# 用法：python tools/qa-dupcheck.py [quiz/geo]
# 退出码 1 表示发现重复，输出重复项及所在页面。
import io, os, re, sys, glob, collections

root = sys.argv[1] if len(sys.argv) > 1 else "quiz/geo"
pat_src = re.compile(r'src:"([^"]+)"')
pat_id = re.compile(r"id:(\d+)")
pat_kind = re.compile(r'kind:"([^"]+)"')

# 只认 "2024·江苏卷 第1题" 这类能定位的出处；原创/模拟不参与
real = re.compile(r"(\d{4})·(.+?) 第\s*(\d+)\s*题")

seen = collections.defaultdict(list)
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
    for b in re.split(r"\n    \{", s[i:j])[1:]:
        m = pat_src.search(b)
        if not m:
            continue
        kind = pat_kind.search(b)
        if kind and kind.group(1) != "real":
            continue
        k = real.match(m.group(1))
        if not k:
            continue
        key = (k.group(1), k.group(2).replace(" 卷", "卷").strip(), k.group(3))
        seen[key].append(slug)

dups = {k: v for k, v in seen.items() if len(set(v)) > 1}
total = sum(len(v) for v in seen.values())
print("扫描 %d 页，真题题位 %d 个，去重后 %d 道" % (len(glob.glob(os.path.join(root, "*.html"))), total, len(seen)))
if dups:
    print("\n发现跨页重复：")
    for (y, a, n), slugs in sorted(dups.items()):
        print("  %s·%s 第%s题  ->  %s" % (y, a, n, ", ".join(sorted(set(slugs)))))
    sys.exit(1)
print("无跨页重复。")
