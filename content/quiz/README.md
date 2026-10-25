# 精练页数据（quizgen spec）编写说明

一页精练 = 一份 JSON。模型只写这份 JSON，模板（CSS + 判分引擎 + 错题本）由
`tools/quizgen.py` 从 `tools/quiz-shell.html` 注入。**不要手写整页 HTML。**

```
content/quiz/geo/<slug>.json          ← 你写这个
  ↓ python tools/quizgen.py content/quiz/geo/<slug>.json out/<slug>.html
  ↓ python tools/quiz-install.py out/<slug>.html geo <slug> <题数>
quiz/geo/<slug>.html                  ← 成品（单文件，离线可用）
```

安装时**必须显式给题数**（生成页 hero 的 facts 不叫「题目总数」，install 读不到）。

## 选题规则（放第一位，比写得多重要）

1. **北京卷近 5 年优先**，有就用
2. 北京没有 → **外地近 3 年**（江浙沪 → 山东 → 湖北湖南 → 其余）
3. 都没有才用原创，标 `orig`
4. **不许用合格考/学业水平合格性考试的题**
5. 不许拿「形式沾边、实质不是本节」的题凑数——宁可少两道
6. 每道真题必须能说清 **年份 + 卷别 + 题号**，且用 `tools/qx.py` 从原卷 docx 里
   核对过材料原文。核对不上就不许写 `real`

## 取真题材料与配图

```bash
python tools/qx.py "<原卷docx>" "<题干里的独特片段>" --fig "$TEMP/xx.png" --ctx 3
```

- 会打印该题前后的**原文段落**（材料、题干、选项都在里面，gk.json 的 `material`
  字段是抽取器的残留，不可信）
- `--fig` 把图存出来。**图在题干之前**，脚本已按「先往前找」定位
- 原卷目录：`C:\wangxp\script\gk-recent\`（2023—2025 各省解析卷）、
  `C:\wangxp\script\bj-geo-docx\`（北京 2015—2026）
- 图要处理后放进 `content/quiz/figs/<slug>/`：白底合成 → 灰度 → 宽度 ≤840 →
  PNG（扫描件可 `convert("1")` 压成 1 位）。单张目标 < 150 KB

## spec 字段

必填：`slug` `kicker` `title` `thin` `lede` `store_key` `book` `topics` `levels`
`freq` `map` `questions` `traps` `footer` `figures`

```jsonc
{
  "slug": "bx1-c4-s2", "subject_name": "地理",
  "kicker": "人教版 · 必修第一册 · 第四章第二节",
  "title": "地貌的观察",
  "thin": "北京卷 1 道 · 外地真题 5 道 · 5 关 15 题",   // hero 副标题，数字必须与内容一致
  "lede": "一句话主线，可用 <b>标签</b>",
  "hero_art": "<svg viewBox='0 0 300 300'>…</svg>",
  "store_key": "geo-landform2-v1",        // 每页唯一，错题本按它隔离
  "book": {"book": "必修第一册", "chapter": "第四章 地貌", "section": "第二节 地貌的观察"},
  "topics": {"1": "海拔与相对高度", "2": "坡度判读"},     // 题号 → 考点，键是字符串
  "levels": [{"id":1,"name":"…","sub":"…","badge":"基础","color":"#4858d4","lcl":"#eef0ff"}],
  "freq": {
    "title": "高考考频 · 北京等级考 2021—2026（越近权重越高）",
    "badges": [{"text":"近 3 年北京 1 题"},
               {"text":"外地近 3 年 5 题","bg":"#eef7f6","fg":"#0f7f7c"},
               {"text":"已收进本页 6 题","bg":"#fdf3e3","fg":"#a06412"}],
    "conclusion": "<b>一句话结论：</b>…",
    "body": "北京卷：…。外地卷：…。原创：…"          // 必须交代每道真题的去向（收入/未收入及原因）
  },
  "map": {"num":"00 / 先看地图","title":"…","sub":"…",
          "cards":[{"title":"① 四类外力速查","fig":"four"},      // fig 引用 figures 里的 SVG
                   {"title":"② 文字卡","html":"<p>…</p>"}]},
  "questions": [
    {"id":1,"lv":1,"kind":"orig","src":"原创·教材改编","star":1,
     "stem":"题干，允许 <b>内联标签</b>",
     "opts":["A 选项","B","C","D"],"ans":0,       // ans 是下标：0=A
     "why":"解析，写清每个选项对错","tip":"一句口诀"},
    {"id":4,"lv":2,"kind":"real","src":"2026·北京卷 第8题","star":2,"svg":"bj26",
     "material":"原卷材料原文（会渲染成灰底材料框）",
     "stem":"…","opts":[…],"ans":2,"why":"…"},
    {"id":5,"lv":2,"kind":"real","src":"2024·江苏卷 第2题","star":2,"samefig":4,
     "stem":"…"}                                   // 同组第二题：不写 svg，写 samefig=组内首题题号
  ],
  "essays": [
    {"id":13,"lv":5,"src":"原创·综合题","star":3,"title":"…","material":"…",
     "asks":[{"q":"说明…","pt":6},{"q":"分析…","pt":4}],
     "points":[["第一条要点","第二条要点"],["第二问的要点"]],  // 数组套数组，与 asks 一一对应
     "tip":"…"}
  ],
  "traps": {"title":"六个最容易丢分的点","sub":"考前五分钟扫一遍。",
            "items":[{"ps":["<b>小标题。</b>正文","补充句"]}]},   // 每个 item 的 ps 逐条渲染成 <p>
  "footer": [{"h":"怎么用这份材料","items":["<li>…</li>"]},
             {"h":"题目来源说明","items":["<li><b>北京真题（N 道）：</b>…</li>"]}],
  "figures": {
    "four": {"svg": "<svg viewBox='0 0 760 260'>…</svg>"},              // 自绘示意图
    "bj26": {"img":"content/quiz/figs/bx1-c4-s2/bj26.png","maxw":720,   // 真题原卷图
             "alt":"2026 北京卷第 8 题原卷图"}                            // maxw 用于低分辨率扫描件
  }
}
```

要点：

- `facts`（hero 的 12/6/3/5 四个数字）由 quizgen 自动统计，不用写
- 数据层里 `material` 会被折进题干（引擎没有 material 的渲染位置），放心写
- 配图**一张一组**：同组题只在首题挂 `svg`，后面的题写 `samefig`
- 示意图用 SVG 字符串；坐标别越界，`viewBox` 宽度建议 760

## 写完之后自检

1. `python tools/quizgen.py …` 不报错
2. 抽取生成页的大 `<script>` 跑 `node --check`，必须通过
3. 数一遍：`<div class="q"` 出现次数 == 题数（选择）+ 0；`class="essay"` == 综合题数
4. 生成页里 `QUIZ_META` 恰好 1 处，`var STORE_KEY` 唯一
5. 页脚「题目来源说明」逐条对得上：写了几道真题，页里就有几道 `kind:"real"`

## 跨页查重

一个考点放两页是难免的（海水性质/海水运动、整体性/差异性、区域发展/资源调配），
但同一道真题不能白白重复。规则（用户 2026-10 定）：

- **选择题：同一道真题全站只能出现一次**，跨册也不行
- **综合题：允许多册复用**——综合题知识点多，同一道大题在必修、选必不同册里
  各出现一次是合理的；但**同一本书内部**（如必修二的两节之间）仍然不许重复
- 跨册复用的综合题，页脚「题目来源说明」里要注明「此题在 XX 页也出现过」

做法：

1. 开工先读 `content/quiz/_used-srcs.txt`——全站已用真题题位清单（`来源<TAB>所在页`），
   照着这份表避开
2. 装完跑 `python tools/qa-dupcheck.py`。它扫 `quiz/geo/*.html` 的 `src`，按
   「年份+卷别+题号」归并；选择题重复或**同册**综合题重复都会 exit 1，
   跨册复用的综合题只列在"允许"区不判失败
3. 撞车了按**正解落在哪个考点**判归属，不按谁先做：让出的一方换一道真正属于本节考点的题，
   不许拿相邻章节的题填坑，换完同步 hero facts / 考频卡 / 页脚

`_used-srcs.txt` 是快照，批量建页时主控在开工前生成一次；收尾时重新生成一遍。

## 不要做

- 不要跑 `tools/build.py`（并发写 `assets/data.js` 会打架，统一由主控收尾跑）
- 不要 `git add/commit`
- 不要改 `tools/` 下的脚本、`AGENTS.md`、别人的 spec
