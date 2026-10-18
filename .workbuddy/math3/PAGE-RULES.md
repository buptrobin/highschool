# 单页施工规则（数学选择性必修第一册 讲义）

你要产出一页讲义。页面外壳（head / 面包屑 / 上一节下一节 / 页脚 / 三个 script）由脚本自动拼，
**你只写两块东西**：

| 文件 | 内容 |
|---|---|
| `.workbuddy/math3/parts/<slug>.html` | `<div class="gx">` 里的正文：kicker / claim / meta / lede / toc + 六个 section |
| `.workbuddy/math3/parts/<slug>.js` | 互动脚本本体（不带 `<script>` 标签，照 `parts/_SCRIPT.js` 改） |

然后跑 `node .workbuddy/math3/build-page.mjs <slug>` 生成 `pages/math/<slug>.html`。

## 0. 先读这四个小文件（别读别的，40KB 的成品页会把上下文吃满）
1. 本文件
2. `.workbuddy/math3/parts/_CONTENT.html` —— 正文骨架（六个 section 的 class 写法）
3. `.workbuddy/math3/parts/_SCRIPT.js` —— 互动脚本骨架
4. `.workbuddy/math3/spec/<slug>.md` —— 本节规格：课本原话、公式、断言值、四图、例题、六问、易错

## 1. 分三次写正文（关键，防止一次写太长被截断）
1. `write` `.workbuddy/math3/parts/<slug>.html`：kicker/meta/lede/toc + `section#a` + `section#b` 的**前两张图**，
   文件末尾留一行 `<!--P2-->`。
2. `edit` 把 `<!--P2-->` 换成：`section#b` 的后两张图 + `section#c` + `section#d`，末尾留 `<!--P3-->`。
3. `edit` 把 `<!--P3-->` 换成：`section#e` + `section#f`（结束）。
4. `write` `.workbuddy/math3/parts/<slug>.js`（约 4–6KB）。

## 2. 六区块（缺一不可）
- **A** 2–3 个 `.gx-quote`（`.q-t`+`.q-src` 出处 + `.q-b` 教材原话 + `.q-n` 翻成人话并点明「几个条件」）；
  1 个 `<div style="overflow-x:auto"><table class="gx-cmp">…</table></div>`（**只高亮 1 行** `tr.key`）；1 个 `.gx-note`。
  数学页的「表」优先做成**定理的条件清单**（左列条件、右列缺了会怎样），比抄定义有用。
- **B** **4 张** `figure.gx-fig`：`.fig-cap`（`.fig-no` `.fig-t` + 1 个徽章）+ `.fig-s`（2–3 行，出现术语）
  + `.gx-svgbox`（`svg viewBox="0 0 820 2xx"` + `<span class="gx-zoomchip">点击放大</span>`）+ `.gx-take`（判断句）。
- **C** 互动：结构照 `_CONTENT.html`，4 个 `.st` 数值卡（最后一个是状态判断）。
- **D** 例题：**4–5 个** `li.step`（第一个不带 hidden，其余带 `hidden`），每步 `.s-h`/`.s-b`/`.s-k`；
  `.ans` 里是「可抄进答题卡」的分点答案（数学答案必须写出关键步骤，不能只写结果）。
- **E** **6 个** `.qac`：每个 `.q` + `.a` + `svg viewBox="0 0 240 132"`（≤12 个元素）；收尾 `.gx-note`。
- **F** **6–7 个** `.er`：`.er-x` ✗ 真错句 / `.er-v` ✓ 教材语言 / `.er-w` 错在哪。

徽章：`bdg-must` 必考 / `bdg-warn` 易错 / `bdg-key` 辨析 / `bdg-ext` 延伸，一图最多一个。

## 3. 互动脚本
- `calc(v)` 是唯一真值：`render()` 调它，`__model.cases` 断言它。
- `layout()` 按容器宽度 ≥640 选 `W`（880×470）/ `N`（360×700，独立坐标，别硬缩）。
- `AutoPilot.create({mount: stage, follow: $("gxSl"), loop, keys, value, min, max, step, idle: 5000, onChange, onMode: setMode})`，
  然后 `window.__ap = ap;`。`loop` 10–15 秒，**必须有一段相邻关键帧同值 = 停留 2–3 秒**，放在结论那一格；
  `keys` 3–5 个按叙事顺序。**不要写「请拖动滑块」。**
  ⚠️ 体检在 **2.6 秒**就检查「数值必须变过」，所以开场静止不能超过 1.5 秒：起点帧后 1 秒内就要开始走。
- `window.__model = { calc: calc, cases: [{v:…, eq:{…}}] }`，数字用规格里给的（容差 6%），不许删。
- **数学页的图要画对**：坐标轴要有箭头和单位刻度；角度弧线用 `<path>` 的 `A` 命令时注意
  y 轴朝下 ⇒ 数学上的逆时针 = `sweep-flag 0`。画向量要画箭头（`<marker>` 或手写三角形）。
- ⚠️ **必写的一行兜底**：`function render()` 的第一行加
  `if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute('viewBox', L.vb); }`
  （`G` 换成你自己的几何变量名）。原因：系统开「减少动态效果」时，`AutoPilot.create` 会在 `layout()` 之前
  同步广播一次数值，此时几何还是 `null`，首帧一抛错 `window.__ap` 就再也不会挂上——体检只会报
  `prefers-reduced-motion 下 mode=none`，看代码很难找到。

## 4. 自检（必须 PASS）
```
cd C:\wangxp\mygit\highschool
node .workbuddy/math3/build-page.mjs <slug>
node .workbuddy/bio1/audit.mjs pages/math/<slug>.html
```
PASS 行长这样：`PASS  math/xxx.html  (29s)  溢出 360:0 390:0 768:0 1024:0 1440:0`

失败时**改片段文件再 rebuild**，不要整页重写：
- `正文太短` → 内容不够，补 `.fig-s` / `.q` / `.er`
- `区块数/插图/问答/易错 数量不对` → 补对应的 section / figure / .qac / .er
- `clip:文字:12` → 该 `<text>` 的 x/y 挪进来或缩短
- `overlap:A|B` → 改 y 或 `text-anchor`
- `2.6s 后数值没变` → loop 起点段太短，或 onChange 没接 render
- `没有 window.__ap` → 脚本没挂或提前 return
- `横向溢出` → 表格没套 `overflow-x:auto`
- `数值断言 v=…` → 公式/断言对不上，改公式或改断言
- `768px: 页面没有返回体检数据` → 已知偶发（并发抢内存），重跑一次

## 5. SVG
`<text>` 里不能写 `<b>`（加粗用 `font-weight="700"`）；文字别贴 viewBox 边；
数学符号用 Unicode：√ ² ³ · × ÷ ∠ ∥ ⊥ π θ λ μ α β ≠ ≤ ≥ ⇒ ⇔ ∈ ∉ ∪ ∩ ∅ Σ Δ。
**不要用 `<sub>`/`<sup>` 画下标**（SVG 里不生效且撑高行距），需要下标就写 Unicode（a₁ b₂ e₁ e₂）。

## 6. 回报
① 最后一次 audit 的 PASS 行；② 互动模型一句话（参数 → 哪个量，停留帧在哪）；③ 最担心被扣分的两处。
