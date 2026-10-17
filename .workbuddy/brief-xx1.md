# 人教版·选择性必修1《自然地理基础》单页讲义 · 作业规范

> 读者：高二学生，基础一般，要考试。目标不是"看懂"，是"不被扣分"。
> 每一节一个 HTML 页面，页面已存在，只需把内容写进 `#md` 区块。

---

## 0. 先读骨架（不要通读样板页）

**动手前读 `.workbuddy/skeleton-xx1.html`**（约 300 行）：它包含页面外壳、六区块的完整 HTML 结构、
一个可运行的互动脚本骨架（WIDE/NARROW 双布局 + slider + 三张数值卡）。

样板页 `pages/geo/xx1-c1-s1.html` 只在你需要看"复杂 SVG 怎么画"时**按需**打开，
**不要通读**（它有 1200 行，会吃掉你的上下文）。

共享样式与脚本已经挂好，**不要在页面里再写 `<style>`，也不要在 `#md` 里写 `<script>`**：

- `assets/gx.css`：`.gx` / `.gx-claim` / `.gx-quote` / `.gx-fig` / `.gx-take` / `.gx-note` /
  `.gx-ex` / `.steps` / `.step` / `.ans` / `.gx-qa` / `.qac` / `.gx-errs` / `.er` /
  `.gx-cmp` / `.bdg` / `.gx-toc` / `.bar` / `.stats` / `.gx-board` / `.halo` / `.ms` `.mm` `.mh`
- `assets/gx.js`：`window.GX`（`$ / el / tx / poly / n1 / n2 / clamp`）、手机点图放大、`#gxSteps` 分步揭示

页面自己的互动逻辑写在 `</body>` 前的**最后一个 `<script>`** 里，用
`document.addEventListener("DOMContentLoaded", function () { ... })` 包住（page.js 先渲染，gx.js 后挂载，顺序没问题）。

---

## 1. 只改这两处

```
pages/geo/xx1-cX-sY.html
  ├─ <script type="text/markdown" id="md">  ← 写内容（必须是 <div class="gx"> 开头）
  └─ </body> 前的 <script>                  ← 写互动逻辑
```

- 页面头部、面包屑、`window.PAGE`、上下页导航**一个字都不要动**。
- `#md` 里**不能出现 `</script>`**。
- 内容必须以 `<div class="gx">` 开头、以 `</div>` 结尾，否则 page.js 会把它当 Markdown 解析。
- 不要引用任何外部图片、字体、CDN；所有图都是内联 SVG。

### 分块写，不要一次输出整页

整页约 45–55 KB，**一次写完会被输出长度截断**。固定分 4 次：

1. `write`：页面外壳 + A 区块 + B 区块（结尾先放 `</div>` 和收尾标签）；
2. `edit`：在 `</div>` 前插入 C 区块；
3. `edit`：插入 D + E + F + footer + 放大浮层；
4. `edit`：在 `</body>` 前插入互动 `<script>`。

每次输出控制在 8k tokens 以内。写之前先把大纲列成 6 行，写完逐块对照，缺一块就补。

---

## 2. 六区块结构（缺一不可）

```html
<div class="gx">
<div class="gx-kicker">ELI5-HIGH · 讲给要考试的人</div>
<p class="gx-claim">一句"要考的判断"，不是标题。用 <b>加粗</b> 点出关键词。</p>
<div class="gx-meta">
  <span><i></i>人教版选择性必修1 第X章第X节</span>
  <span><i></i>高二 · XXXX</span>
  <span><i></i>阅读 1X 分钟</span>
  <span><i></i>含 1 个互动模型</span>
</div>
<p class="gx-lede">3–4 行：这一节在整章里的位置 + 最容易错的那件事。</p>

<nav class="gx-toc">
  <a href="#a">① 课本怎么说</a><a href="#b">② 拆开看</a><a href="#c">③ 自己拖一下</a>
  <a href="#d">④ 一道题走一遍</a><a href="#e">⑤ 会怎么考</a><a href="#f">⑥ 易错清单</a>
</nav>

<section class="gx-sec" id="a">  <!-- 课本怎么说 -->
<section class="gx-sec" id="b">  <!-- 拆开看：3–4 张图 -->
<section class="gx-sec" id="c">  <!-- 自己拖一下：唯一一个互动 -->
<section class="gx-sec" id="d">  <!-- 一道题走一遍：5 步 -->
<section class="gx-sec" id="e">  <!-- 会怎么考：6 问，每问一张 240×132 迷你图 -->
<section class="gx-sec" id="f">  <!-- 易错清单：1 张表 + 6 张对错卡 -->

<footer class="gx-foot">…数据口径…</footer>
<div class="gx-zoom" id="gxZoom" hidden>
  <span class="gx-zoom-tip">双指放大 · 左右滑动看全图</span>
  <button class="gx-zoom-x" type="button" aria-label="关闭">✕</button>
  <div id="gxZoomInner"></div>
</div>
</div>
```

### A · 课本怎么说（2–4 张引用卡 + 1 张表）

```html
<div class="gx-quote">
  <p class="q-t">课本原话 · 小标题<span class="q-src">人教版（2019）选择性必修1 · 第X章第X节</span></p>
  <p class="q-b">教材原话（照抄，可节选，用省略号标出删减）</p>
  <p class="q-n">→ 翻成人话：点出"几个条件 / 几条规律 / 谁决定谁"。</p>
</div>
```

- **不要编页码**。出处统一写「人教版（2019）选择性必修1 · 第X章第X节」。
- 教材原话要准确；记不清原句时，写规范的地理表述，不要伪造引号里的句子。
- 每张卡的 `.q-n` 必须点出**条件的个数**或**因果链**。

### B · 拆开看（3–4 张图）

```html
<figure class="gx-fig">
  <div class="fig-cap">
    <span class="fig-no">图 1</span><span class="fig-t">一句判断式标题</span>
    <span class="bdg bdg-must">必考</span>   <!-- 一张图最多一个徽章 -->
  </div>
  <p class="fig-s">2–3 行，必须出现课本术语与具体数字。</p>
  <div class="gx-svgbox">
    <svg viewBox="0 0 820 300" role="img" aria-label="一句话描述这张图">
      …内联 SVG…
    </svg>
    <span class="gx-zoomchip">点击放大</span>
  </div>
  <p class="gx-take">结论：判断句，可以直接背。</p>
  <p class="gx-note">口径 / 易错补充（可选）。</p>
</figure>
```

- 一图只讲一件事；同一个坐标轴里不要塞第二层信息。
- 图内文字字号：标题 11、正文 9.5–10、注释 8.5–9；数值用 `font-family="ui-monospace,Consolas,monospace"`。
- 配色只用语义色：蓝 `#0891b2`（主）、绿 `#2f8a5b`（正确）、琥珀 `#b8791f`（重点/警示）、红 `#b8402f`（错误）。
- SVG 里**不能写 `<b>`**，强调用 `font-weight`。
- 所有文字必须落在 viewBox 内（后面有自动检查脚本）。

### C · 自己拖一下（唯一互动，B 级）

必须是"**连续参数 → 图形实时重算**"，并且同时给出**三个可读数值**：

| 卡片 | 内容 | 例 |
|---|---|---|
| 1 | 你正在拖的那个量 | 抬升速率 2.0 mm/年 |
| 2 | 被它决定的量 | 山地高度 1 850 m |
| 3 | **状态判断（文字 + 颜色）** | 侵蚀与抬升平衡 · 高度稳定 |

结构照样板页：

```html
<div class="gx-board">
  <svg id="gxStage" viewBox="0 0 880 440" tabindex="0" role="application" aria-label="…">
    <g id="gxA"></g><g id="gxB"></g>
  </svg>
  <div class="bar">
    <span class="lb">参数名</span>
    <input type="range" id="gxSl" min="…" max="…" step="…" value="…">
    <button id="gxP1" type="button">预设1</button>
    <button id="gxP2" type="button">预设2</button>
    <p class="hint">也可以用键盘 ← → 微调。</p>
  </div>
</div>
<div class="stats">…三张 .st，第三张加 class="st state"…</div>
```

JS 要点（照抄样板页的骨架）：

- 两套布局 `WIDE`（`viewBox 0 0 880 440`）与 `NARROW`（`viewBox 0 0 360 520`），
  `applyLayout()` 用 `stage.parentElement.getBoundingClientRect().width >= 640` 切换；
  `resize` 事件 180ms 防抖后重算。
- `build()` 建节点并存引用，`render()` 只更新属性与文字；`sl` 的 `input` 事件 → `render()`。
- 键盘 `ArrowLeft/ArrowRight` 调整参数；`ev.preventDefault()`。
- 参数范围的两端都要"有话说"（例如抬升速率 0 时山地被削平、过大时坡度过陡），不能拖到边界就没反应。

### D · 一道题走一遍（5 步）

```html
<div class="gx-ex">
  <p class="ex-t">例题<span class="bdg bdg-must">必考</span></p>
  <p class="ex-q">题干（课后题 / 高考题原型，含一个小陷阱，但不要点破）</p>
  <ol class="steps" id="gxSteps">
    <li class="step">…第 1 步…<p class="s-k">用到：…</p></li>
    <li class="step" hidden>…</li>
  </ol>
  <div class="exbar">
    <button id="gxNext" type="button">下一步</button>
    <span class="cnt" id="gxCnt">1 / 5</span>
  </div>
  <div class="ans" id="gxAns" hidden>
    <p class="ans-t">标准答案（可抄进答题卡）</p>
    <p class="ans-b">分点编号，术语到位。</p>
  </div>
</div>
```

- 每步只推进**一个**判断；每步末尾必须有 `.s-k`。
- 标准答案要分行、带序号，能直接抄。
- 分步揭示由 `gx.js` 自动接管，**不要重复写这段 JS**。

### E · 会怎么考（6 问）

```html
<div class="gx-qa">
  <div class="qac">
    <p class="q">「…问法…」</p>
    <p class="a">一句话答案 + 为什么。</p>
    <svg viewBox="0 0 240 132" role="img" aria-label="…">…</svg>
  </div>
  …
</div>
<p class="gx-note">这六问其实是同一件事：…</p>
```

六个角度尽量覆盖：定义辨析、**反直觉**、**易错**、边界/极端、实例对应、因果链。

### F · 易错清单（1 表 + 6 卡）

- 表：`<table class="gx-cmp">`，3–6 行，`<tr class="key">` **只高亮 1 行**。
- 卡片：左边必须是**学生真的会写的错句**，右边是课本语言，第三条写"错在哪"。

```html
<div class="gx-er">
  <p class="er-x">✗ …</p>
  <p class="er-v">✓ …</p>
  <p class="er-w">错在哪：…</p>
</div>
```

---

## 3. 内容硬线

1. **术语照课本**：该叫"冷锋"就不叫"冷空气前锋"，该叫"侵蚀基准面"就不叫"最低处"。
2. **每个概念落成能看见的量**：图、表、可拖参数。连续文字不超过 3 行。
3. **数字要能追**：教材值 / 实测值 / 明确标注"示意值"。同一数字全文只出现一个值。
4. **禁用语**：「简单来说」「众所周知」「其实很简单」「只要记住」。
5. 比喻只能当附注，且要放在定义之后。
6. 语气面向高中生：可以活泼（"这一步最容易翻车"），但**不要哄小孩**，不要用 emoji。

---

## 4. 验证链（必做，不许跳过）

在本仓库根目录 `C:\wangxp\mygit\highschool` 下执行：

```powershell
node "C:\Users\robin\.workbuddy\skills\anatomy\scripts\drive.mjs" "pages/geo/<slug>.html" --actions ".workbuddy/verify/audit.json" --width 1440 --height 900
node "C:\Users\robin\.workbuddy\skills\anatomy\scripts\drive.mjs" "pages/geo/<slug>.html" --actions ".workbuddy/verify/audit.json" --width 390 --height 900
```

必须看到：

- `eval: "N svg; geometry ok"`（文字没跑出画布）
- `eval: "no x-overflow"`
- `console: clean`

再写一个自己的断言文件 `.workbuddy/verify/<slug>.json`，至少包含：

```json
[
  ["wait", 800],
  ["eval", "document.querySelectorAll('.gx-fig').length + 'fig/' + document.querySelectorAll('.qac').length + 'qa'"],
  ["eval", "var s=document.getElementById('gxSl'); s.value='<参数极值1>'; s.dispatchEvent(new Event('input')); [读取三个数值卡].join(' | ')"],
  ["eval", "var s=document.getElementById('gxSl'); s.value='<参数极值2>'; s.dispatchEvent(new Event('input')); [读取三个数值卡].join(' | ')"],
  ["eval", "document.getElementById('gxNext').click(); document.querySelectorAll('#gxSteps .step:not([hidden])').length + ' steps'"]
]
```

数值必须和你在正文里写的数字对得上（例如 30°N 线速度 1446 km/h 这种），对不上就改代码或改正文，**两边必须一致**。

---

## 5. 交付时报告（四句话，不要长）

1. 这页做成哪一档（B / A），为什么；
2. 模型口径：用了什么公式、怎么校准的；
3. 验证结果：几条断言、哪两个宽度、console 是否干净；
4. 对应教材哪一章哪一节。

---

## 6. 常见坑（都踩过）

1. `hidden` 会被 `.step` 的 display 顶掉 —— 共享 CSS 已补 `.step[hidden]{display:none}`，**直接用 `hidden` 属性即可**。
2. SVG 弧线：y 轴朝下，数学逆时针 = `sweep-flag 0`。
3. 浮在曲线上的文字要加 `class="halo"`（白描边）。
4. 百分比当比例传参（`39%` 写成 `39`）——所有比例在 0–1 之间。
5. 宽窄屏共用一个卷数/坐标 —— 必须两套布局。
6. 数字凑课本表格时，要把模型参数**反解**出来并在页脚声明口径，不要硬编码一个"看起来像"的数。
7. 同一页出现两套口径（例如"陆地面积占比"与"全球面积占比"）必须显式说明。
