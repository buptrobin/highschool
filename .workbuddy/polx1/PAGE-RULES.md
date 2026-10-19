# 单页施工规则（选择性必修1 当代国际政治与经济）

你要产出一页讲义。页面外壳由脚本拼，**你只写正文片段**：

`.workbuddy/polx1/parts/<slug>.html`

**不要写 .js，不要 build，不要 audit，不要改别的页面和 assets。**

## 0. 先读三个文件
1. 本文件。
2. `.workbuddy/polx1/parts/_CONTENT.html` —— 六区块骨架。
3. `.workbuddy/polx1/spec/<slug>.md` —— 本课规格：一句话、扣分点、四图、五个情境、例题。

## 1. 六区块（缺一不可，id 固定 a–f）
- **A 课本怎么说**：2–3 个 `.gx-quote`（`.q-t` + `.q-src` 出处 + `.q-b` 教材原话 + `.q-n` 翻成人话，点明几个条件）；1 个 `<div style="overflow-x:auto"><table class="gx-cmp">…</table></div>`（只高亮 1 行 `tr.key`）；1 个 `.gx-note`。
- **B 拆开看**：**4 张** `figure.gx-fig`。每张 = `.fig-cap`（`.fig-no` `.fig-t` + 1 个徽章）+ `.fig-s`（2–3 行）+ `.gx-svgbox`（`svg viewBox="0 0 820 2xx"` + `<span class="gx-zoomchip">点击放大</span>`）+ `.gx-take`（判断句）。
- **C 自己点一下**：1 张 `figure.gx-fig`，里面是 `.gx-quiz`：
  - `.qbtns` 里 **5 个** `<button class="qbtn" type="button" data-k="…" data-a="…" data-w="…">情境文字</button>`
  - `<div class="qout"></div>`
  - `data-k` 小标题；`data-a` 写「对应：哪个知识点」；`data-w` 写「判断依据：材料里的主体/行为/关键词 → 为什么是它，不是相近概念」。
  - **data 属性里不能写 HTML 标签**。
  - 5 个情境覆盖本课 5 个易混点。
  - 标题写「自己点一下」，徽章 `bdg-key`，正文标「A 级」；`.gx-note` 说明为什么用点击而不是滑块。
- **D 一道题走一遍**：`li.step` **5 步**（第一个不带 `hidden`，其余带）；每步 `.s-h`/`.s-b`/`.s-k`；`#gxSteps/#gxNext/#gxCnt`（1 / 5）`/#gxAns`；答案分点、可抄。
- **E 会怎么考**：**6 个** `.qac`，每个 `.q` + `.a` + `svg viewBox="0 0 240 132"`（≤12 个元素）；收尾 `.gx-note` 点明「六问其实是同一件事」。
- **F 易错清单**：**7 条** `.er`，每条 `.er-x`（✗ 学生真会写的错句）/ `.er-v`（✓ 教材语言）/ `.er-w`（错在哪）。

## 2. 写作对象与语气
- 基础一般的高一/高二学生。**先生活场景，再课本原话**；第二人称「你」；每段不超过 3 行。
- 术语照课本：国体、政体、单一制、联邦制、多极化、国家利益、时代主题、经济全球化、对外开放、国际组织、联合国安理会、人类命运共同体。
- 允许「你可能会问」「这里有个坑」「答题时写这句」，不要油滑。
- 禁用语：简单来说 / 众所周知 / 其实很简单 / 只要记住。
- 不要写「请拖动滑块」；本页是点击，不是拖动。

## 3. 篇幅
- 正文中文字符 **≥5500**（audit 按去空白计数，≥4000 才过，留余量）。

## 4. SVG
- `<text>` 里不能写 `<b>`/`<br>`；加粗用 `font-weight="700"`。
- 文字不要贴 viewBox 边（左右至少留 20px，上下至少留 10px），长句拆多行。
- 静态图统一 `viewBox="0 0 820 2xx"`（高度 200–300）。
- 徽章四色：`bdg-must` 必考 / `bdg-warn` 易错 / `bdg-key` 辨析 / `bdg-ext` 延伸；一图最多一个。

## 5. 分三次写，防止截断
1. `write`：kicker/claim/meta/lede/toc + A 区 + B 区前两张图，末尾留 `<!--P2-->`。
2. `edit` 把 `<!--P2-->` 换成 B 区后两张图 + C 区 + D 区，末尾留 `<!--P3-->`。
3. `edit` 把 `<!--P3-->` 换成 E 区 + F 区，结束。
文件以 `<div class="gx-kicker">` 开头、以最后一个 `</section>` 结尾；不要写 `<div class="gx">` 外壳、footer、`<script>`。

## 6. 交付
只回报：文件字数、六区块/四图/五情境/六问/七易错的自检数字、最担心的两处。不要运行 build/audit。
