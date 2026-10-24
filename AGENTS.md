# 本仓库约定

纯静态站：`index.html` → `subject.html` → `pages/`（课本解析）或 `quiz/`（真题精练）。
双击就能用，不引入构建依赖、不引 CDN。

## 真题精练页

解析页和精练页用**同一个 slug** 对齐（如 `pages/geo/bx1-c1-s1.html` ↔ `quiz/geo/bx1-c1-s1.html`）。

要新增一节精练时（**必须调用 skill 生成，不要手写页面**）：

1. 调用 `exam-practice-page` skill 生成单文件页面（**不要写进 `pages/`**，那是解析页）；
   开工前先说明"用 exam-practice-page 做 <科目><章><节>"，方便人及时纠偏
2. `python tools/quiz-install.py <生成页> <科目> <slug> --build`
3. 完成。目录徽标、首页入口、解析页的「去刷题」按钮都会自动接上

页面质量由 skill 的规矩兜底（出处可溯源、编不出出处标 `orig`），跳过 skill 手写会导致
这几条失守，所以只有在 skill 不可用、且用户明确同意时才手写。

`assets/data.js`、`assets/quiz-map.js`、`quiz/<科目>/*.html` 里的 `window.QUIZ_META`
都是生成物，手改会被下次 `build.py` 覆盖。

### 选题目来源的优先级（用户定的，长期有效）

这些页面是**为高考刷题**服务的，不是学业水平考试（合格考）。选题一律按下面的顺序取：

1. **北京卷最近 5 年**（等级考/高考真题）——有就用，优先于一切其它来源
2. 北京没有、或只有一两道时，用**其它省份最近 3 年**的高考真题，按此顺序：
   江浙沪（浙江、江苏、上海）→ 山东 → 湖北、湖南 → 其余省份
3. 都不沾边时，才用模拟题/原创题补位，并如实标注 `mock` / `orig`

硬规则：

- **不要用北京合格考（学业水平合格性考试）的题**充数；已经收进去的要替换掉
- 同一考点宁可少放几道，也不要拿"形式沾边、实质不是本节"的题凑数
  （例：第二节课文考点是太阳辐射/太阳活动，不能拿"光热发电区位"这种工业区位题冒充）
- 每节页首的「高考考频」卡片必须写清：近 3 年/近 6 年北京卷命中几道、外地卷命中几道、
  这些题是否已收进页面；没有就直说没有
- 真题一律带原卷配图（从原卷 docx 里取图，不要自己重绘冒充原图）

### 本地题库（查题先查这里，别直接上网搜）

| 文件 | 内容 |
|---|---|
| `C:\wangxp\script\gk.json` | 2023—2025 高考地理真题 749 道选择题（`year/area/no/stem/options/answer/explain/material`），约 93% 带答案 |
| `C:\wangxp\script\bj-geo.json` | 2021—2026 北京等级考 112 题（含综合题与材料） |
| `C:\wangxp\script\gk2.py` | 解析卷抽取器（两遍：题目区取题干选项、答案区按「1. A 2. C」+「【N 题详解】」对齐） |
| `C:\wangxp\script\getfig.py` | 按题干关键词从原卷 docx 里取出该题配图 |

原始卷宗：`C:\baidunetdiskdownload\历年高考真题合集\地理历年高考真题`（2008—2025，按年份分目录，解析卷/空白卷成对）、
`C:\baidunetdiskdownload\【2】北京2026高考真题`（北京 2021—2026）。

新科目要复用时，先按 `gk2.py` 的路子批量抽题建库，再按上面的优先级选题。

## 精练页生成流水线（优先用这条，别让模型直接写整页）

一页成品 300–600 KB，绝大部分是模板的 CSS/判分引擎/base64 图。让模型逐字写整页，
每节要 10–15 分钟，还容易在写入途中耗尽上下文。正确做法是**只写数据**：

1. `content/quiz/<科目>/<slug>.json` —— 只写题目与文案（约 10–20 KB），字段见
   `tools/quizgen.py` 末尾的 `SPEC` 注释
2. `python tools/quizgen.py content/quiz/geo/bx1-c4-s1.json out/bx1-c4-s1.html`（约 150 ms）
3. `python tools/quiz-install.py <out.html> geo bx1-c4-s1 <题数> --build`
   —— **题数必须显式给**：生成页 hero 里的 facts 不叫「题目总数」，install 读不到

配图放 `content/quiz/figs/<slug>/`，spec 里用相对路径引用，quizgen 自动转 base64 内嵌
（保持单文件）。示意图直接把 SVG 字符串写进 `figures`。

模板 `tools/quiz-shell.html`（40 KB，含判分引擎与错题本）是从一份已验证成品页切出来的。
换模板：

    python tools/quizgen.py --make-shell quiz/geo/<任一成品页>.html tools/quiz-shell.html

切片锚点见 `quizgen.py` 的 `ANCHORS`。改模板后必须重新生成，并跑一遍自检页
（`content/quiz/geo/_selftest.json` 是回归样例，期望：2 题、3 关、点选项有反馈、零报错）。

## 其它约定

- 改目录结构改 `content/*.txt`，然后 `python tools/build.py`
- `build.py` **不会覆盖**已存在的内容页，所以 `pages/` 里的正文安全
- 优先复用 `assets/app.css` 的既有变量与类，不要为单个页面造一套样式
