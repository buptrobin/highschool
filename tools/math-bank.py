"""math-bank.py —— 把「空白卷 + 答案卷」拼成数学题库（JSON）

为什么不用现成题库：本机没有数学的 JSON 题库（只有地理、生物），但**有原卷 docx**。
数学公式在 docx 里全是 OLE 对象，纯文本抽取会丢公式，所以走
`tools/math-docx.py` 的路子：文字 + 公式 WMF→PNG 内联，题干形状与原卷一致。

输入：若干 (空白卷 docx, 答案 docx, 元信息) 组合
输出：C:\\wangxp\\script\\math-gk.json
    [{year, area, kind: 选择|填空|解答, no, stem, opts[4], ans, ans_text, src}]

用法：
    # 先把卷子抽成 segs.json（见 math-docx.py），再：
    python tools/math-bank.py --manifest tools/math-papers.json --out C:\\wangxp\\script\\math-gk.json

manifest 是论文清单（year/area/blank/answer 路径），由主控维护。
"""
import argparse
import io
import json
import os
import re
import sys

from xml.sax.saxutils import escape

LETTERS = "ABCD"


def clean(html):
    """去掉行内图片标签，留纯文本，用于关键词检索与查重"""
    return re.sub(r"<[^>]+>", "", html).strip()


def split_options(html):
    """把一段里连排的 A. … B. … C. … D. … 拆成四项。
    只在 A、B、C、D 四个标记都按顺序出现时才拆，否则返回 None。

    两种排版都要认：`A. 8`（带点号）和 `A 8`（北京 2025 第 8 题就是后者，字母后直接
    跟空格）。字母后既无点号也无空格的（如“AB两点”）不当作选项标记。
    """
    marks = []
    for ch in LETTERS:
        m = re.search(r"(?<![A-Za-z])%s(?:\s*[.．、]|\s+)" % ch, html)
        marks.append(m.start() if m else -1)
    if any(m < 0 for m in marks) or marks != sorted(marks):
        return None
    out = []
    for i, st in enumerate(marks):
        end = marks[i + 1] if i + 1 < len(marks) else len(html)
        seg = html[st:end]
        seg = re.sub(r"^[A-D](?:\s*[.．、]|\s+)\s*", "", seg).strip()
        out.append(seg)
    return out


Q_RE = re.compile(r"^\s*(\d{1,2})(?:[.．、]|\s)\s*(?=\S)")


SECTION_RE = re.compile(r"^(第[一二三四]部分|[一二三四][、.]\s*(?:单项选择题|多项选择题|不定项选择题|选择题|单选题|多选题|双选题|填空题|解答题|选考题))")


def group_questions(segs):
    """按题号把段落聚成题目；返回 [(kind, no, [段落html…])]

    遇到「第二部分（非选择题…）」「三、解答题…」这类分区标题必须**结束**当前题目，
    否则最后一道选择题会把后面整段分区标题吸进题干（北京 2025 第 10 题踩过）。
    """
    has_sections = any(SECTION_RE.match(s["text"]) and not re.match(r"^第[一二三四]部分", s["text"]) for s in segs)
    section = None
    groups = []
    cur = None
    for s in segs:
        t = s["text"]
        if SECTION_RE.match(t):
            if re.match(r"^第[一二三四]部分", t):
                cur = None          # 只是分区标记，不改 section（后面还有「二、填空题」）
                continue
            if re.search(r"选择题|单选题|多选题|双选题", t):
                section = "选择"
            elif "填空题" in t:
                section = "填空"
            elif "解答题" in t or "选考题" in t:
                section = "解答"
            cur = None
            continue
        if re.match(r"^(第[ⅠⅡⅢIV]+卷|注意事项|参考公式|祝各位考生|绝密)", t) or (
            re.search(r"答题前|准考证号|条形码|2B铅笔|考试结束后|答题卡上", t) and len(t) < 120
        ):
            cur = None                  # 「第Ⅱ卷 / 注意事项 / 参考公式」之后重新起题
            continue
        m = Q_RE.match(t)
        # 有分区标题的卷子（绝大多数）必须进了分区才开始收题，否则「注意事项」里的
        # 「1．每小题选出答案后…」会被当成第 1 题（天津 2024 就这么错位过）。
        # 2026 北京这类整卷没有分区标题的，才允许裸题号。
        if m and (section is not None or not has_sections):
            no = int(m.group(1))
            prev = groups[-1][1] if groups else 0
            if not groups or (no > prev and no <= prev + 3):
                cur = [section, no, [s["html"]]]
                groups.append(cur)
                continue
        if cur is not None:
            cur[2].append(s["html"])
    return [(g[0], g[1], g[2]) for g in groups]


def load_answers(path):
    """从答案卷 docx 里读答案表。两种排版：
    - 表格：1.D | 2.B | …（北京卷常见）
    - 正文：1.【答案】D 或 1.D
    """
    from docx import Document

    d = Document(path)
    ans = {}
    for tbl in d.tables:
        for row in tbl.rows:
            for cell in row.cells:
                t = cell.text.strip()
                for m in re.finditer(r"(\d{1,2})\s*[.．、]\s*([A-D])", t):
                    ans[int(m.group(1))] = m.group(2)
    txt = "\n".join(p.text for p in d.paragraphs)
    # 解析卷主流排版：题号段 → 选项段 → 【答案】A 单独成段，题号要顺序跟踪
    cur_no = None
    for para in d.paragraphs:
        s = para.text.strip()
        m = re.match(r"^(\d{1,2})(?:[.．、]|\s)\s*(?=\S)", s)
        if m:
            cur_no = int(m.group(1))
            continue
        m = re.match(r"^【答案】\s*([A-D]+)", s)
        if m and cur_no is not None:
            ans[cur_no] = m.group(1)
    for m in re.finditer(r"(\d{1,2})\s*[.．、]\s*【答案】\s*([A-D])", txt):
        ans.setdefault(int(m.group(1)), m.group(2))
    for m in re.finditer(r"^\s*(\d{1,2})\s*[.．、]\s*([A-D])\s*$", txt, re.M):
        ans.setdefault(int(m.group(1)), m.group(2))
    return ans


WHY_TAGS = ("【解析】", "【分析】", "【详解】", "【点睛】", "【小问", "【思路】")


def load_why(segdir):
    """从解析卷的 segs.json 里抽每道题的详解。

    解析卷的排版是：`N. 题干` → `A. … B. …` → `【答案】A` → `【分析】…` → `【详解】…`。
    详解里同样有公式图，所以直接复用 segs 的 html（图片已内联成 <img>），比让模型
    凭考点"编"一段解析可靠得多——数学的解析离了公式根本没法看。
    """
    path = os.path.join(segdir, "segs.json")
    if not os.path.exists(path):
        return {}
    segs = json.load(io.open(path, encoding="utf-8"))
    why = {}
    cur = None
    on = False
    for s in segs:
        t = s["text"].strip()
        if not t:
            continue
        if re.match(r"^(第[一二三四]部分|[一二三四][、.]\s*(?:单项选择题|多项选择题|选择题|单选题|多选题|填空题|解答题|选考题))", t):
            cur = None                  # 详解写到下一分区就停，否则会把「第二部分…」吸进解析
            on = False
            continue
        if Q_RE.match(t):
            cur = int(Q_RE.match(t).group(1))
            on = False
            continue
        if cur is None:
            continue
        if t.startswith("【答案】"):
            on = True
            rest = re.sub(r"^【答案】\s*[A-D]?\s*", "", t).strip()
            if rest:
                why.setdefault(cur, []).append(escape(rest))
            continue
        if t.startswith(WHY_TAGS):
            on = True
            continue
        if on:
            html = s["html"]
            cut = html.find("第二部分")
            if cut > 0:
                html = html[:cut]
            why.setdefault(cur, []).append(html)
    return {k: "".join(v).strip() for k, v in why.items()}


def build_paper(meta, segdir):
    segs = json.load(io.open(os.path.join(segdir, "segs.json"), encoding="utf-8"))
    groups = group_questions(segs)
    answers = load_answers(meta["answer"]) if meta.get("answer") else {}
    why_map = load_why(os.path.join(os.path.dirname(segdir.rstrip("\\/")), meta["id"] + "_ans"))
    out = []
    for kind, no, paras in groups:
        html = " ".join(paras).strip()
        # 题干与选项分离：选项可能在同一段，也可能在后续段
        head = paras[0]
        rest = " ".join(paras[1:]) if len(paras) > 1 else ""
        opts = split_options(rest) or split_options(head)
        if opts:
            stem = head if (split_options(rest) is None and split_options(head)) else head
            if split_options(rest) is not None:
                stem = head
            stem = re.sub(r"^(?:\d{1,2})(?:[.．、]|\s)\s*", "", stem).strip()
        else:
            stem = re.sub(r"^(?:\d{1,2})(?:[.．、]|\s)\s*", "", head).strip()
            opts = None
            if rest:
                stem = (stem + " " + rest).strip()
        ent = {
            "bank": "%s#%d" % (meta["id"], no),
            "year": meta["year"],
            "area": meta["area"],
            "kind": kind,
            "no": no,
            "stem": stem,
            "opts": opts,
            "ans": None,
            "ans_text": answers.get(no),
            "why": why_map.get(no, ""),
            "src": "%s·%s 第%d题" % (meta["year"], meta["area"], no),
            "paper": meta.get("id", ""),
            # 详解来自 <id>_ans 卷，图号与空白卷完全不是一套，内联时必须用它自己的目录
            "why_paper": (meta.get("id", "") + "_ans") if why_map.get(no) else "",
        }
        if opts and answers.get(no) and answers.get(no) in LETTERS:
            ent["ans"] = LETTERS.index(answers[no])
        # 题型以「拆出四个选项」为准，分区标题只作兜底：2026 北京整卷没有分区标题，
        # 靠标题判题型会把 10 道选择题全判成无选项。
        if opts:
            ent["kind"] = "选择" if not ent["ans_text"] or len(ent["ans_text"]) == 1 else "多选"
        else:
            ent["kind"] = kind or ("解答" if len(clean(stem)) > 150 or "（1）" in clean(stem) else "填空")
        out.append(ent)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", required=True, help="卷子清单 json")
    ap.add_argument("--segroot", default=os.path.join("out", "mathsrc"))
    ap.add_argument("--out", default=r"C:\wangxp\script\math-gk.json")
    args = ap.parse_args()
    papers = json.load(io.open(args.manifest, encoding="utf-8"))
    bank = []
    stat = []
    for meta in papers:
        segdir = os.path.join(args.segroot, meta["id"])
        if not os.path.exists(os.path.join(segdir, "segs.json")):
            stat.append((meta["id"], "缺 segs.json，先跑 math-docx.py"))
            continue
        qs = build_paper(meta, segdir)
        bank.extend(qs)
        n_sel = sum(1 for q in qs if q["kind"] == "选择")
        n_ans = sum(1 for q in qs if q["ans"] is not None)
        stat.append((meta["id"], "%d 题（选择 %d，有答案 %d）" % (len(qs), n_sel, n_ans)))
    with io.open(args.out, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(bank, fh, ensure_ascii=False, indent=1)
    for s in stat:
        print("  %-14s %s" % s)
    print("题库：%d 题 → %s" % (len(bank), args.out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
