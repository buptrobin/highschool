# 数学精练页：选题清单（_pick）怎么写

本目录**不是**成品 spec，而是「选题清单」。成品 spec 在 `content/quiz/math/<slug>.json`，
由 `tools/math-assemble.py` 从清单 + 题库自动组装。

## 为什么多这一层

数学题的题干里，公式在原卷 docx 中是 **OLE 对象**，转出来是一张张 PNG（见
`tools/math-docx.py`）。一段题干就有 5—10 张 base64 图，如果让模型直接写 spec，
贴图就会把上下文烧光。所以：

- **你只写清单**：选哪道题（`bank` 编号）、难度、解析、提示、页面文案、原创综合题
- **工具负责**：从题库取题干/选项/答案、把公式图内联成 data URI、校验结构

## 完整流程（每节照做）

```powershell
# 0. 目录（pwsh 里先设编码，否则中文乱码）
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING='utf-8'
$py = 'C:\Users\robin\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe'

# 1. 查题库（先本地，后网络；本机数学题库 693 题，286 道可用选择题）
& $py tools\math-find.py 双曲线 离心率 --kind 选择 --unused
& $py tools\math-find.py 数列 --bj --full          # 只看北京
& $py tools\math-find.py 导数 --year 2024 --n 30

# 2. 写清单 content/quiz/math/_pick/<slug>.json

# 3. 组装 + 生成 + 落位
& $py tools\math-assemble.py <slug>
& $py tools\quizgen.py content\quiz\math\<slug>.json out\<slug>.html
& $py tools\quiz-install.py out\<slug>.html math <slug> <题数> --force

# 4. 自检（必须 q=选择+综合、hud=选择、page=本页文件名、broken=0）
powershell -NoProfile -ExecutionPolicy Bypass -File tools\qa-quiz.ps1 -Subject math <slug>

# 5. 看一眼版式（可选）
node tools\shot.mjs math <slug> out\shots\<slug>.png 2600 1500
```

`<题数>` = 选择题数 + 综合题数。

## slug 命名（别猜，按 `pages/math/` 来）

章号是**册内序号**，不是全书连续序号：

| 册 | 章 → slug 前缀 |
|---|---|
| 必修第一册 | 第一~五章 → `bx1-c1` … `bx1-c5` |
| 必修第二册 | 第六~十章 → `bx2-c1` … `bx2-c5`（**不是 c6—c10**） |
| 选择性必修第一册 | 第一~三章 → `xx1-c1` … `xx1-c3` |
| 选择性必修第二册 | 第四~五章 → `xx2-c1` … `xx2-c2`（**不是 c4/c5**） |
| 选择性必修第三册 | 第六~八章 → `xx3-c1` … `xx3-c3`（**不是 c6/c7/c8**） |
| 专题 | `extra-1` … `extra-8` |

落位前先确认解析页存在：`Get-ChildItem pages\math\<slug>.html`。精练页 slug 必须与它同名，
否则页面右上角的「去刷题」接不上。

## 选题规则（用户定的，长期有效）

1. **北京 2022—2026 优先**，有就先用；`--bj` 可筛
2. 北京不够时用**外地近三年**：江浙沪（浙江、上海）→ 山东（新高考Ⅰ）→ 湖北湖南（新高考Ⅰ/Ⅱ）→ 全国甲/乙
3. 都不沾边才用**原创**，如实标 `orig`
4. **绝不用北京合格考（学业水平合格性考试）的题**
5. **选择题同一道真题全站只出现一次**（`--unused` 会排除已收录的）；综合题允许跨册复用
6. 宁可少放，也不要拿「形式沾边、实质不是本节」的题凑数

## 题库字段（`C:\wangxp\script\math-gk.json`）

```json
{"bank":"bj2025#3", "year":2025, "area":"北京", "kind":"选择", "no":3,
 "stem":"已知集合<img …>，则…", "opts":["…","…","…","…"], "ans":1, "ans_text":"B",
 "why":"原卷详解（含公式图）", "src":"2025·北京 第3题", "paper":"bj2025"}
```

- `bank` 是唯一编号，**清单里只写这个**，别手抄题干
- `ans` 是 0 基（A=0），`ans_text` 是字母
- `why` 是原卷详解，可能很简略（北京卷第 1、2 题常见只有「故选：D」）

## 清单字段

```json
{
  "kicker": "人教A版 · 必修第一册 · 第一章 集合与常用逻辑用语 · 第三节",
  "title": "集合的基本运算",
  "thin": "北京真题 5 道 · 外地真题 7 道 · 原创 3 道 · 5 关 15 题",
  "lede": "……（两三句，说清这节考什么、坑在哪）",
  "hero_art": "<svg viewBox='0 0 300 300'>…</svg>",
  "book": {"book":"必修第一册","chapter":"第一章 …","section":"1.3 …"},
  "topics": {"1":"交集：取公共元素", "2":"…"},
  "levels": [ {"id":1,"name":"…","sub":"…","badge":"基础","color":"#4f46e5","lcl":"#eef2ff"},
              … 必须正好 5 个，第 5 关是综合题 … ],
  "freq": {"title":"高考考频 · 北京 2022—2026 + 外地近三年",
           "badges":[{"text":"北京近 5 年 5 题"},{"text":"外地真题 7 题","bg":"#eef7f6","fg":"#0f7f7c"},
                     {"text":"已收进本页 12 题","bg":"#fdf3e3","fg":"#a06412"}],
           "conclusion":"<b>一句话结论：</b>…",
           "body":"北京卷：…；外地卷：…"},
  "map": {"num":"00 / 先看地图","title":"…","sub":"…",
          "cards":[{"title":"① …（示意图，非原卷图）","fig":"numline"}]},
  "figures": {"numline": {"svg":"<svg viewBox='0 0 760 300'>…</svg>"}},
  "questions": [{"bank":"bj2023#1","lv":1,"star":1,"tip":"…"}, …],
  "essays":    [{"orig":true,"src":"原创·综合题","star":3,"title":"…","material":"…",
                 "asks":[{"q":"…","pt":4}],"points":[["…","…"]],"tip":"…"}, …],
  "traps": {"title":"六个最容易丢分的点","sub":"…","items":[{"ps":["<b>…</b>…"]}]},
  "footer": [{"h":"怎么用这份材料","items":["<li>…</li>"]},
             {"h":"题目来源说明","items":["<li>…</li>"]}]
}
```

### 关键约束（违反了页会炸或会误人）

- `levels` **必须正好 5 个**；`essays[].lv` 固定 5（模板只在第 5 关渲染综合题）
- `star` 只能 1—3（写 4 会 `RangeError`，表现是 QA 数字全乱）
- `questions[].bank` **必须保留**，跨页查重用
- 题目 `why` 不写时自动用题库原卷详解；**原卷详解不足 60 字时你必须在清单里自己写 `why`**
- `essays` 一律**原创**（`orig: true`），3 道；真题解答题的公式图你看不到，别硬编

### 原创题的公式写法

不要贴图，用纯文本 + 少量 HTML：

- 上标 `<sup>`、下标 `<sub>`，如 `x<sup>2</sup>`、`a<sub>n</sub>`
- 分式写 `(a+b)/2` 或 `a/b`，根式用 `√3`、`√(x+1)`
- 符号直接 Unicode：`≤ ≥ ≠ ∈ ∉ ⊆ ⊂ ∩ ∪ ∅ ± π α β θ ω φ Δ ∠ ⊥ ∥ ∞`
- 选择项里不要出现 `A.` 前缀（模板自己加 A/B/C/D）

## 页面文案风格

对齐生物/地理页：口播感、短句、先给结论再给方法；`<b>` 只强调关键判断（端点开闭、
符号方向、适用范围），不要整段加粗。`freq` 卡片必须**说真话**：北京命中几道、
外地几道、收了哪几道、没收录的为什么。

## 禁止

- 不要跑 `tools/build.py`（主控最后统一跑一次）
- 不要改 `tools/` 下任何文件、不要改别人的页
- 不要用 git
- 不要手写 `content/quiz/math/<slug>.json` 或 `quiz/math/<slug>.html`——一律由工具生成

## 一道题像两节时怎么判（2026-10 全册做完定的）

「……是……的（　）条件」这类题最容易被两页同时看上。判两条，按顺序：

1. **归「学生当时学过的工具能解开」的那一节**：要解 f′ 判单调/极值的题不能放必修一
   3.2 / 4.5（那时还没学导数）；要排列组合算的古典概型题，优先给已经会列举法的必修二
   第十章，而不是选必三的计数原理页
2. 两节都成立时，**归真题更少的那一页**：1.4 充要条件页有 11 道真题，就把其中 6 道让给
   4.1 数列、6.1 向量、3.1 函数、5.2 三角（它们各只有 1—2 道）

专题页（`extra-*`）另有规矩：**教材节页优先，专题页让位**。专题页优先用外地真题＋原创，
被节页占了的题不要重复收，在页脚写「该题已收入 XX 页」，让读者去那一页做原题；
专题页卖的是方法主线（判断链、四看、三步），不是原题本身。
