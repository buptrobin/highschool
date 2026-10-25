"""政治题库抽取器：解析卷 docx → JSON

用法：
    python tools/pol-bank.py <真题根> <输出.json> [--years 2022,2023] [--dump 卷id]

解析卷版式（北京 / 山东 / 湖北 / 全国卷基本一致）：
    一、选择题：本题共 15 小题 ...
    1. 材料……（   ）
    A. ①②	B. ①③	C. ②④	D. ③④
    【答案】C 【解析】 【详解】…… 故本题选C。
    二、…… 16. 材料…… 设问 【答案】…… 【解析】……

踩过的坑：
- **注意事项里的「1．答题前…」会被当题号**：只从分区标题之后开抽，且进新分区时题号重新起算
- 江苏 / 河北 / 福建的解析卷**没有【答案】段**，答案只能从「故本题选B」这类句子反推
- 选项可能带点号 `A．`、`A.`，也可能只空格 `A ①③`；四项可能挤在一行（tab 分隔），也可能每段一项
- 浙江卷有「判断题」段（答案 正确／错误），单列 kind=判断，不要混进选择题
"""
import io
import json
import os
import re
import sys

from docx import Document

NUM_RE = re.compile(r"^(\d{1,2})\s*[.．、]\s*")
OPT_ONE = re.compile(r"^([A-D])\s*[.．、]?\s*(.+)$")
ANS_RE = re.compile(r"【答案】\s*([A-D]{1,4})\b")
ANS_FALLBACK = [
    re.compile(r"故本题选\s*([A-D]{1,4})"),
    re.compile(r"故选\s*[:：]?\s*([A-D]{1,4})"),
    re.compile(r"答案\s*[:：]\s*([A-D]{1,4})"),
    re.compile(r"正确选项为\s*([A-D]{1,4})"),
]
HEAD_SEL = re.compile(r"(选择题|单项选择题|第一部分|选择题I|选择题Ⅱ|选择题II)")
HEAD_JUDGE = re.compile(r"判断题")
HEAD_ESSAY = re.compile(r"(非选择题|主观题|第二部分)")
ASK_PAT = re.compile(
    r"^(结合材料|运用|分析|说明|简述|谈谈|为什么|如何|评析|请|阅读材料|从.{0,8}角度|（\d）|\(\d\)|"
    r"有人认为|习近平总书记|党的二十大|新时代|阅读材料)")

AREA_MAP = {
    "北京": "bj", "北京卷": "bj", "天津": "tj", "天津卷": "tj", "上海": "sh",
    "山东": "sd", "山东卷": "sd", "浙江": "zj", "江苏": "js", "江苏卷": "js",
    "河北": "hb", "河北卷": "hb", "湖北": "hub", "湖北卷": "hub", "湖南": "hun",
    "福建": "fj", "辽宁": "ln", "重庆": "cq", "广东": "gd", "广东卷": "gd",
    "海南": "hain", "新课标": "xkb", "新课标卷": "xkb", "全国甲卷": "jial",
    "甲卷": "jial", "全国乙卷": "yil", "乙卷": "yil", "安徽": "ah", "安徽卷": "ah",
    "江西": "jx", "甘肃": "gs", "贵州": "gz", "广西": "gx", "云南": "yn",
    "云南卷": "yn", "河南": "hn", "河南卷": "hn", "陕晋青宁": "sx",
    "陕晋青宁卷": "sx", "黑吉辽蒙": "hjl", "黑吉辽蒙卷": "hjl",
}
BAD_TAG = re.compile(r"(解析|空白|答案|原卷|试题|真题|试卷|Word|word)")
# 卷首「注意事项」里的 1．2．3． 会被当题号，抽出来是这种噪声段
NOISE = re.compile(
    r"(答题前|将本试卷和答题卡|2B铅笔|答题卡上|考试结束后|字体工整|监考员|保持答题卡|"
    r"试卷共|考试用时|准考证号|条形码|不准使用涂改液|作图可先使用铅笔|请按照题号顺序)")


def clean(s):
    return re.sub(r"[ \u3000]+", " ", s.replace("\xa0", " ")).strip()


def parse_name(path):
    base = os.path.basename(path)
    m = re.search(r"(20\d{2})", base)
    year = int(m.group(1)) if m else 0
    tag = ""
    for m2 in re.finditer(r"[（(]([^（()）]+)[）)]", base):
        t = m2.group(1)
        if not BAD_TAG.search(t):
            tag = t
            break
    if not tag:
        m3 = re.search(r"(20\d{2})\s*年?\s*([一-龥]{2,4}?)(?:省)?新?高考政治", base)
        if m3:
            tag = m3.group(2)
        else:
            m4 = re.search(r"([一-龥]{2,4})高考政治", base)
            if m4:
                tag = m4.group(1)
    tag = tag.replace("卷", "").strip()
    pid = AREA_MAP.get(tag) or AREA_MAP.get(tag + "卷") or (tag or "xx")
    round_ = "a" if "1月" in base else ("b" if "6月" in base else "")
    return year, tag or pid, "%s%s%s" % (pid, year, round_)


def options_from(paras):
    stems, opts = [], []
    for p in paras:
        marks = []
        for m in re.finditer(r"(?<![A-Za-z0-9])([A-D])(?=\s*[.．、\s　])", p):
            if not marks or ord(m.group(1)) == marks[-1][0] + 1:
                marks.append((ord(m.group(1)), m.start(), m.end()))
        if len(marks) >= 2 and marks[0][0] == 65:
            head = p[:marks[0][1]].strip()
            if head:
                stems.append(head)
            for i, (_, s, e) in enumerate(marks):
                end = marks[i + 1][1] if i + 1 < len(marks) else len(p)
                opts.append(clean(p[e:end]))
            continue
        # 福建这类：A 选项的字母丢了，「①③    B.①④  C.②③  D.②④」
        if len(marks) >= 3 and marks[0][0] == 66:
            head = p[:marks[0][1]].strip()
            if head:
                opts.append(clean(head))
                for i, (_, s, e) in enumerate(marks):
                    end = marks[i + 1][1] if i + 1 < len(marks) else len(p)
                    opts.append(clean(p[e:end]))
                continue
        stems.append(p)
    if len(opts) < 4:
        cand = [(i, OPT_ONE.match(p)) for i, p in enumerate(stems)]
        cand = [(i, m.group(1), clean(m.group(2))) for i, m in cand if m and len(m.group(2)) > 1]
        letters = [c[1] for c in cand]
        if len(cand) == 4 and letters == ["A", "B", "C", "D"]:
            opts = [c[2] for c in cand]
            stems = stems[:cand[0][0]]
    return stems, opts


def split_block(block, no=None):
    stem, ans_text, ans_raw, why = [], "", "", []
    zone = "stem"
    skip = False
    for p in block:
        mw = re.match(r"^【(\d{1,2})题(详解|分析|解析)】", p)
        if mw:
            # 别的题的详解混进了本题 block（有的卷子把详解单独排），整段跳过
            skip = no is not None and int(mw.group(1)) != no
            if skip:
                continue
        if skip:
            if re.match(r"^【(答案|解析|详解|分析|点睛|小问)", p):
                skip = False
            else:
                continue
        if p.startswith("【答案】"):
            zone = "ans"
            m = ANS_RE.match(p)
            if m:
                ans_text = m.group(1)
            ans_raw += (" " if ans_raw else "") + p[len("【答案】"):].strip()
            continue
        if p.startswith("【解析】"):
            zone = "why"
            continue
        if re.match(r"^【(详解|分析|点睛|小问)", p):
            zone = "why"
            why.append(re.sub(r"^【[^】]+】", "", p))
            continue
        if zone == "stem":
            stem.append(p)
        elif zone == "ans":
            ans_raw += " " + p
            if len(p) > 4:
                why.append(p)
                zone = "why"
        else:
            why.append(p)
    return stem, ans_text, clean(ans_raw), clean(" ".join(why))


def extract_paper(path, verbose=False):
    ps = [clean(x.text) for x in Document(path).paragraphs]
    ps = [p for p in ps if p]
    # 有的卷子把「【8题详解】」这类段落在题目之间单独排，会被并进上一题的 block，
    # 导致 why 错位（#9 拿到 8 题详解）。这里先按题号收集，最后覆盖回对应题。
    why_map, cur = {}, None
    for p in ps:
        mw = re.match(r"^【(\d{1,2})题(详解|分析|解析)】", p)
        if mw:
            cur = int(mw.group(1))
            why_map[cur] = re.sub(r"^【[^】]+】", "", p)
            continue
        if cur is None:
            continue
        if NUM_RE.match(p) or (len(p) < 120 and (HEAD_SEL.search(p) or HEAD_JUDGE.search(p) or HEAD_ESSAY.search(p))):
            cur = None
            continue
        why_map[cur] = (why_map[cur] + " " + p).strip()
    year, area, paper = parse_name(path)
    out = []
    section = "pre"
    expect = None
    i, n = 0, len(ps)
    while i < n:
        p = ps[i]
        if len(p) < 80 and HEAD_JUDGE.search(p):
            section, expect = "judge", None
            i += 1
            continue
        if len(p) < 120 and HEAD_SEL.search(p) and not re.match(r"^\d", p):
            section, expect = "sel", None
            i += 1
            continue
        if len(p) < 120 and HEAD_ESSAY.search(p) and not NUM_RE.match(p):
            section, expect = "essay", None
            i += 1
            continue
        m = NUM_RE.match(p)
        if section == "pre":
            # 福建这类整卷没有分区标题，第一个「1. 长题干」就是选择题起点
            if m and int(m.group(1)) == 1 and len(p) > 40:
                section, expect = "sel", 1
            else:
                i += 1
                continue
        if not m:
            i += 1
            continue
        no = int(m.group(1))
        if expect is None:
            expect = no
        if no != expect:
            i += 1
            continue
        first = p[m.end():].strip()
        block = [first] if first else []
        j = i + 1
        while j < n:
            q = ps[j]
            if len(q) < 120 and (HEAD_SEL.search(q) or HEAD_JUDGE.search(q) or HEAD_ESSAY.search(q)) \
                    and not NUM_RE.match(q):
                break
            m2 = NUM_RE.match(q)
            if m2 and int(m2.group(1)) == no + 1:
                break
            block.append(q)
            j += 1
        i = j
        stem_paras, ans_text, ans_raw, why = split_block(block, no)
        stems, opts = options_from([x for x in stem_paras if not x.startswith("【")])
        if not ans_text:
            for rx in ANS_FALLBACK:
                mm = rx.search(why) or rx.search(ans_raw)
                if mm:
                    ans_text = mm.group(1)
                    break
        if len(opts) == 4 and ans_text[:1] in ("A", "B", "C", "D"):
            kind = "选择"
        elif re.match(r"^[√×✓✗]|^(正确|错误)", ans_raw):
            kind = "判断"
        else:
            kind = "主观"
        rec = {
            "bank": "%s#%d" % (paper, no), "paper": paper, "year": year,
            "area": area, "no": no, "kind": kind,
            "stem": "", "material": "", "ask": "", "opts": [], "ans": -1,
            "ans_text": "", "ans_raw": ans_raw, "why": why,
        }
        if why_map.get(no, "").strip():
            rec["why"] = clean(why_map[no])
        if kind == "选择":
            rec["stem"] = clean(" ".join(stems))
            rec["opts"] = opts
            rec["ans"] = ord(ans_text[0]) - 65
            rec["ans_text"] = ans_text
        elif kind == "主观":
            ask_at = None
            for k in range(len(stems) - 1, -1, -1):
                if ASK_PAT.match(stems[k]) and len(stems[k]) < 320:
                    ask_at = k
                    break
            if ask_at is None:
                ask_at = len(stems) - 1
            rec["material"] = clean(" ".join(stems[:ask_at]))
            rec["ask"] = clean(" ".join(stems[ask_at:]))
        else:
            rec["stem"] = clean(" ".join(stems))
        body = rec["material"] + rec["ask"] + rec["stem"]
        if len(body) < 140 and NOISE.search(body):
            # 注意事项被当题号抽出来的噪声段，直接丢
            expect = no + 1
            continue
        out.append(rec)
        expect = no + 1
        if verbose:
            print("  #%d [%s] %s ans=%s opts=%d | %s" % (
                no, section, kind, rec["ans_text"], len(opts),
                (rec["ask"] or rec["stem"])[:60]))
    return out


def main():
    root, out_path = sys.argv[1], sys.argv[2]
    years = None
    dump = None
    if "--years" in sys.argv:
        years = {int(x) for x in sys.argv[sys.argv.index("--years") + 1].split(",")}
    if "--dump" in sys.argv:
        dump = sys.argv[sys.argv.index("--dump") + 1]
    files = []
    for dirpath, _, names in os.walk(root):
        for nm in names:
            if not nm.endswith(".docx"):
                continue
            if "解析" not in nm and "答案" not in nm:
                continue
            m = re.search(r"(20\d{2})", nm)
            if years and (not m or int(m.group(1)) not in years):
                continue
            files.append(os.path.join(dirpath, nm))
    files.sort()
    bank, stat = [], []
    for f in files:
        try:
            recs = extract_paper(f, verbose=(dump is not None and dump in f))
        except Exception as e:
            print("!! %s: %s" % (os.path.basename(f), e))
            continue
        if not recs:
            print("?? 抽到 0 题:", os.path.basename(f))
            continue
        bank.extend(recs)
        sel = sum(1 for r in recs if r["kind"] == "选择")
        jud = sum(1 for r in recs if r["kind"] == "判断")
        stat.append((recs[0]["year"], recs[0]["area"], len(recs), sel, jud))
    seen = set()
    for q in bank:
        if q["bank"] in seen:
            k = 2
            while "%s%c" % (q["bank"], 96 + k) in seen:
                k += 1
            q["bank"] = "%s%c" % (q["bank"], 96 + k)
        seen.add(q["bank"])
    io.open(out_path, "w", encoding="utf-8", newline="\n").write(
        json.dumps(bank, ensure_ascii=False, indent=1))
    for y, a, tot, sel, jud in sorted(stat, key=lambda x: (-x[0], x[1])):
        print("%d %-6s 题 %2d  选择 %2d  判断 %2d" % (y, a, tot, sel, jud))
    print("卷数 %d，题数 %d，选择题 %d，主观题 %d" % (
        len(stat), len(bank), sum(1 for r in bank if r["kind"] == "选择"),
        sum(1 for r in bank if r["kind"] == "主观")))


if __name__ == "__main__":
    main()
