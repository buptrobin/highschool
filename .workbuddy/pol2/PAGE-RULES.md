# 单页施工规则（政治必修2 经济与社会 讲义）

你要产出一页讲义。页面外壳（head / 面包屑 / 上一节下一节 / 页脚 / 三个 script）由脚本自动拼，
**你只写两块东西**：

| 文件 | 内容 |
|---|---|
| `.workbuddy/pol2/parts/<slug>.html` | `<div class="gx">` 里的正文：kicker / claim / meta / lede / toc + 六个 section |
| `.workbuddy/pol2/parts/<slug>.js` | 互动脚本本体（不带 `<script>` 标签，照 `parts/_SCRIPT.js` 改） |

然后跑 `node .workbuddy/pol2/build-page.mjs <slug>` 生成 `pages/pol/<slug>.html`。

## 0. 先读这四个小文件（别读别的，44KB 的样板页会把上下文吃满）
1. 本文件
2. `.workbuddy/pol2/parts/_CONTENT.html` —— 正文骨架（六个 section 的 class 写法）
3. `.workbuddy/pol2/parts/_SCRIPT.js` —— 互动脚本骨架
4. `.workbuddy/pol2/spec/<slug>.md` —— 本节规格：课本原话、公式、断言值、四图、例题、六问、易错

## 1. 分两次写正文（关键，防止一次写太长被截断）
1. `write` `.workbuddy/pol2/parts/<slug>.html`：写 kicker/meta/lede/toc + `section#a` + `section#b` 的**前两张图**，
   文件末尾留一行 `<!--P2-->`。
2. `edit` 把 `<!--P2-->` 换成：`section#b` 的后两张图 + `section#c` + `section#d`，末尾留 `<!--P3-->`。
3. `edit` 把 `<!--P3-->` 换成：`section#e` + `section#f`（结束）。
4. `write` `.workbuddy/pol2/parts/<slug>.js`（约 4–6KB）。

## 2. 六区块（缺一不可）
- **A** 2–3 个 `.gx-quote`（`.q-t`+`.q-src` 出处 + `.q-b` 教材原话 + `.q-n` 翻成人话并点明「几个条件」）；
  1 个 `<div style="overflow-x:auto"><table class="gx-cmp">…</table></div>`（**只高亮 1 行** `tr.key`）；1 个 `.gx-note`。
- **B** **4 张** `figure.gx-fig`：`.fig-cap`（`.fig-no` `.fig-t` + 1 个徽章）+ `.fig-s`（2–3 行，出现术语）
  + `.gx-svgbox`（`svg viewBox="0 0 820 2xx"` + `<span class="gx-zoomchip">点击放大</span>`）+ `.gx-take`（判断句）。
- **C** 互动：结构照 `_CONTENT.html`，4 个 `.st` 数值卡（最后一个是状态判断）。
- **D** 例题：**4–5 个** `li.step`（第一个不带 hidden，其余带 `hidden`），每步 `.s-h`/`.s-b`/`.s-k`；
  `.ans` 里是「可抄进答题卡」的分点答案。
- **E** **6 个** `.qac`：每个 `.q` + `.a` + `svg viewBox="0 0 240 132"`（≤12 个元素）；收尾 `.gx-note`。
- **F** **6–7 个** `.er`：`.er-x` ✗ 真错句 / `.er-v` ✓ 教材语言 / `.er-w` 错在哪。

徽章：`bdg-must` 必考 / `bdg-warn` 易错 / `bdg-key` 辨析 / `bdg-ext` 延伸，一图最多一个。

## 3. 互动脚本
- `calc(v)` 是唯一真值：`render()` 调它，`__bio.cases` 断言它。
- `layout()` 按容器宽度 ≥640 选 `W`（880×470）/ `N`（360×700，独立坐标，别硬缩）。
- `AutoPilot.create({mount: stage, follow: $("gxSl"), loop, keys, value, min, max, step, idle: 5000, onChange, onMode: setMode})`，
  然后 `window.__ap = ap;`。`loop` 10–15 秒，**必须有一段相邻关键帧同值 = 停留 2–3 秒**，放在结论那一格；
  `keys` 3–5 个按叙事顺序。**不要写「请拖动滑块」。**
  ⚠️ 体检在 **2.6 秒**就检查「数值必须变过」，所以开场静止不能超过 1.5 秒：起点帧后 1 秒内就要开始走。
- `window.__bio = { calc: calc, cases: [{v:…, eq:{…}}] }`，数字用规格里给的（容差 6%），不许删。

## 4. 自检（必须 PASS）
```
cd C:\wangxp\mygit\highschool
node .workbuddy\pol2\build-page.mjs <slug>
node .workbuddy\pol2\audit.mjs pages/pol/<slug>.html
```
PASS 行长这样：`PASS  bio/xxx.html  (29s)  溢出 360:0 390:0 768:0 1024:0 1440:0`

失败时**改片段文件再 rebuild**，不要整页重写：
- `正文太短` → 内容不够，补 `.fig-s` / `.q` / `.er`
- `区块数/插图/问答/易错 数量不对` → 补对应的 section / figure / .qac / .er
- `clip:文字:12` → 该 `<text>` 的 x/y 挪进来或缩短
- `overlap:A|B` → 改 y 或 `text-anchor`
- `2.6s 后数值没变` → loop 起点段太短，或 onChange 没接 render
- `没有 window.__ap` → 脚本没挂或提前 return
- `横向溢出` → 表格没套 `overflow-x:auto`
- `数值断言 v=…` → 公式/断言对不上，改公式或改断言

## 5. SVG
`<text>` 里不能写 `<b>`（加粗用 `font-weight="700"`）；文字别贴 viewBox 边；下标用 Unicode（O₂ CO₂ H₂O）。

## 6. 回报
① 最后一次 audit 的 PASS 行；② 互动模型一句话（参数 → 哪个量，停留帧在哪）；③ 最担心被扣分的两处。
