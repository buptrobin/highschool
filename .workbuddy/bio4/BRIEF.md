# 生物选择性必修1 讲义页 · 施工简报（每页都必须照这个来）

> 目标：`pages/bio/xx2-*.html` 每一页 = 一张「看得懂、能复习、能答题」的讲义。
> 读者：基础一般的高一学生。文字要短句、要具体、要先给教材原话再解释。
> **样板页：`pages/bio/xx2-c1-s1.html`（已通过全部断言）。写新页时先把它读一遍，照抄骨架。**

---

## 0. 三条硬线

1. **只改自己那一页**：不要碰 `assets/*`、不要碰别的 `pages/*`、不要跑 `tools/build.py`。
2. **术语照课本**：该说「活化能」就不说「门槛」；「相对表面积」不写成「表面积比例」。
3. **数字要能追**：教材值写「教材」，模型值写「示意」，并在 `<footer class="gx-foot">` 里写清公式与端点。
   同一页里同一个数只能有一个值。

禁用语：简单来说 / 众所周知 / 其实很简单 / 只要记住。

---

## 1. 文件骨架

从 `pages/bio/xx2-c1-s1.html` 复制整个文件，然后只改这 8 处：

| 位置 | 改成 |
|---|---|
| `<title>` | `第N节 XXX · 生物 · 俯瞰太阳系` |
| `<h1 class="page-title">` | `第N节 XXX` |
| `.crumbs` 最后一项 | `第N章 XXX` |
| `.page-meta` | `生物 · 选择性必修1 分子与细胞 · 第N章 XXX` |
| `.pager` 前后链接 | 用 `content/bio.txt` 里的真实相邻页 |
| `window.PAGE` | 对应 slug / title / anchor |
| `#md` 里的全部内容 | 你的正文（六区块） |
| 页尾 `<script>` | 你的互动逻辑 |

`<head>` 里的 `app.css`、`gx.css`、那段 `<style>`（生物绿）**原样保留**；
页尾三行 `<script src="../../assets/page.js">`、`gx.js`、`autopilot.js` **原样保留，顺序不能变**。

---

## 2. 六区块（缺一不可，顺序固定）

```html
<section class="gx-sec" id="a"> 01 课本怎么说 </section>
<section class="gx-sec" id="b"> 02 拆开看     </section>
<section class="gx-sec" id="c"> 03 自己拖一下  </section>
<section class="gx-sec" id="d"> 04 一道题走一遍</section>
<section class="gx-sec" id="e"> 05 会怎么考    </section>
<section class="gx-sec" id="f"> 06 易错清单    </section>
```

### A. 课本怎么说
- 2–3 个 `.gx-quote`：`.q-t`（标题 + `.q-src` 出处）/ `.q-b`（**教材原话，照抄**）/ `.q-n`（一句话翻成人话）。
- 一个 `.gx-cmp` 对照表（外层必须套 `<div style="overflow-x:auto">`）。
- 一个 `.gx-note`：背法 / 口径提醒。
- 出处写 `人教版（2019）选择性必修1 · 第X章第Y节`，**不要编页码**。

### B. 拆开看
- **4 张** `figure.gx-fig`，每张：`.fig-cap`（`.fig-no`+`.fig-t`+考点徽章）+ `.fig-s`（2–3 行精确说明）+ `.gx-svgbox`（内含 svg + `<span class="gx-zoomchip">点击放大</span>`）+ `.gx-take`（一句结论）+ 可选 `.gx-note`。
- 一图只讲一件事。静态图 `viewBox="0 0 820 2xx"`，高度 200–300。
- SVG 内文字用 `<text font-size="9.2" fill="#3a3a35">`，**绝不能在 `<text>` 里写 `<b>`/`<br>`**。
- 考点徽章四色：`.bdg.bdg-must`（必考）/ `.bdg.bdg-warn`（易错）/ `.bdg.bdg-key`（辨析）/ `.bdg.bdg-ext`（延伸）。

### C. 自己拖一下
固定结构（见 §3），**必须有**：`#gxStage` 画布、`#gxSl` 滑块、`.gx-ap` 徽标、4 个 `.st` 数值卡（最后一个是 `.st.state`）。

### D. 一道题走一遍
```html
<div class="gx-ex">
<p class="ex-t">例题 · 名称<span class="bdg bdg-must">必考</span></p>
<p class="ex-q">题干（选择题 4 个选项，或 2 小问的简答）</p>
<ol class="steps" id="gxSteps">
  <li class="step"><p class="s-h">第 1 步 · 小标题</p><p class="s-b">推理</p><p class="s-k">用到：哪个概念</p></li>
  <li class="step" hidden>…（后面每个都带 hidden）</li>
</ol>
<div class="exbar"><button id="gxNext" type="button">下一步</button><span class="cnt" id="gxCnt">1 / 5</span></div>
<div class="ans" id="gxAns" hidden>
  <p class="ans-t">标准答案（可抄进答题卡）</p>
  <p class="ans-b">分点、术语到位</p>
</div>
</div>
```
- **4–5 步**，每步只推进一步；第一步一定是「审题/定性」。
- 答案必须能直接抄进答题卡（选择题也给依据句）。
- 分步揭示的 JS 由 `gx.js` 负责，你不用写。

### E. 会怎么考
- `.gx-qa` 里 **6 个** `.qac`，每卡：`.q`（学生会问的原话）+ `.a`（一句话答案，带 `<b>`）+ 一张 `svg viewBox="0 0 240 132"` 迷你图。
- 六问覆盖：定义辨析 / 反直觉 / 易错表述 / 边界极端 / 实例判断 / 科学方法或实验。
- 收尾 `.gx-note` 点明「这几问其实是同一件事」。

### F. 易错清单
- `.gx-errs` 里 **6–7 个** `.er`：`.er-x`（✗ 学生真会写的错句）+ `.er-v`（✓ 教材语言）+ `.er-w`（错在哪，一句话）。
- 左边必须是真的错句，不是把正确句子换个说法。

---

## 3. 互动板块（这一页最值钱的部分）

### 3.1 HTML 结构

```html
<figure class="gx-fig">
<div class="fig-cap">
<span class="fig-no">互动 1</span><span class="fig-t">参数 → 被影响的量</span>
<span class="bdg bdg-key">B 级</span>
<span class="gx-ap" id="gxAp"><i></i><span id="gxApTxt">自动演示中</span></span>
</div>
<p class="fig-s">先告诉读者盯住哪几个数（2–3 行）。</p>
<div class="gx-board">
<svg id="gxStage" viewBox="0 0 880 470" tabindex="0" role="application" aria-label="…">
<g id="gxA"></g><g id="gxB"></g>
</svg>
<div class="bar">
<span class="lb">参数名</span>
<input type="range" id="gxSl" min="…" max="…" step="…" value="…" aria-label="…">
<p class="hint">键盘 ← → 也能调；点画布跳到关键值。</p>
</div>
</div>
<div class="stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:8px">
<div class="st"><div class="k">① 参数</div><div class="v" id="gxVa">…</div><div class="s">单位</div></div>
<div class="st"><div class="k">② 被影响的量</div><div class="v" id="gxVb">…</div><div class="s">口径</div></div>
<div class="st"><div class="k">③ 另一个量</div><div class="v" id="gxVc">…</div><div class="s">口径</div></div>
<div class="st state" id="gxStBox"><div class="k">④ 状态判断</div><div class="v" id="gxVs">…</div><div class="s" id="gxVsn">…</div></div>
</div>
<p class="gx-take">一句话结论。</p>
<p class="gx-note">模型口径：公式、端点值、哪些是示意值。</p>
</figure>
```

**不要写「请拖动滑块」。** 让滑块自己动是唯一的提示。`.hint` 只写键盘和点按。

### 3.2 JS 规范（照样板页的写法改）

```js
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", /* 宽屏布局参数 */ };
  var N = { vb: "0 0 360 700", /* 窄屏布局参数：独立 viewBox，不要靠缩放宽图 */ };
  var L = W, A = 0;

  function calc(v) { /* 纯函数：参数 → 数值，不画图 */ return { a: …, b: …, c: … }; }
  function draw() { /* 用 L 里的坐标画；先 gA.textContent="" 再重画 */ }
  function render() { /* 写 4 个数值卡 + 改 state 卡配色 + draw() */ }
  function layout() {
    var wide = stage.parentElement.getBoundingClientRect().width >= 640;
    L = wide ? W : N;
    stage.setAttribute("viewBox", L.vb);
    render();
  }

  var apBadge = $("gxAp"), apTxt = $("gxApTxt");
  function setMode(m) {
    apBadge.classList.toggle("is-auto", m === "auto");
    apBadge.classList.toggle("is-manual", m !== "auto");
    apTxt.textContent = m === "auto" ? "自动演示中" : "你接管了";
  }

  var ap = AutoPilot.create({
    mount: stage, follow: $("gxSl"),
    loop: [{ t: 0, v: … }, …],     // 10–15 秒一圈，中间有一段「两个相邻关键帧 v 相同」= 停留 2–3 秒
    keys: [ … 3–5 个关键值，按叙事顺序 … ],
    value: …, min: …, max: …, step: …,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [ { v: …, eq: { a: …, b: … } }, … ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
```

规矩：
- **`calc(v)` 是唯一真值**：`render()` 必须调用 `calc(A)`，`__bio.cases` 断言的也是它，三者不许各写一套。
- `case` 的 `eq` 里只放 `calc` 返回的数字键（不要文字）。
- `onChange` 里**不要回写滑块**（引擎会管）。
- 数值卡用 `toFixed(0/1)` 格式化；状态卡按阈值换 `background/borderColor/color`（照样板页）。
- 窄屏布局：`N` 用**独立的 viewBox 和坐标**（不要在窄屏硬缩 880 宽的图）。
  文字换行可用样板页里的 `wrap()`。
- 中文标签的 x 坐标别贴边：`<text>` 会被 viewBox 裁掉，样板页的 `audit` 会报 `clip:`。

### 3.3 Autopilot 循环怎么设计

`loop` 是**一次微型叙事**，不是均匀采样：

```
{t:0,  v:起点}        ← 平常状态出场
{t:3,  v:起点}        ← 停留 3 秒（让读者看清起点）
{t:5.5,v:中间态}
{t:8,  v:关键值}
{t:10.5,v:关键值}     ← 停留 2.5 秒：全篇最值钱的那一帧
{t:13, v:起点}        ← 快速回到起点，闭环
```

总长 10–15 秒。停留帧放在「结论出现的地方」，不是放在结尾。
`keys` 按叙事顺序给 3–5 个值（例如 细胞 → 器官 → 个体 → 群落 → 生物圈）。

---

## 4. 数值断言（必须写）

页面里 `__bio.cases` 每一项都要来自**公式或教材真值**，例如：

```js
window.__bio = { calc: calc, cases: [
  { v: 0,   eq: { act: 0 } },
  { v: 37,  eq: { act: 100 } },
  { v: 50,  eq: { act: 11.8 } }
] };
```

断言值必须和 `calc` 用同一套公式手算出来（写完自己按公式算一遍再填）。
容差 6%，所以 11.8 写成 11.9 也能过，但**不要拿「看起来差不多」的数糊过去**。

---

## 5. 校验链（写完必须跑，直到 PASS）

```powershell
cd C:\wangxp\mygit\highschool
node .workbuddy\bio4\audit.mjs pages/bio/xx2-cX-sY.html
```

它会跑：5 个宽度（1440/1024/768/390/360）的结构 + SVG 裁剪/重叠 + 横向溢出；
Autopilot 三条（初始 auto、2.6s 后数值变、点击→manual、5.7s→auto）；
`__bio.cases` 数值断言；`prefers-reduced-motion` 下初始必须 manual。

**PASS 的标准行**：`PASS  bio/xx2-cX-sY.html  (29s)  溢出 360:0 390:0 768:0 1024:0 1440:0`

常见报错怎么修：
- `clip:xxx:12` → 那个 `<text>` 超出 viewBox，挪进来或缩短文字。
- `overlap:A|B` → 两个标签压在一起，改 y 或改 anchor。
- `区块数 5 ≠ 6` / `插图 3 张` → 缺 section 或 figure，补。
- `2.6s 后数值没变` → `loop` 的起点段太短或 `mount/onChange` 没接上。
- `点击后 mode=auto` → `mount` 不是 `stage`，或画布上盖了别的元素。
- `横向溢出 360:6` → 某个固定宽度元素超了（表格要套 `overflow-x:auto`；SVG 不要写死 width）。
- `数值断言 v=…` → 公式或 `eq` 对不上，改公式或改断言，**不许删断言**。

---

## 6. 七个坑（别人已经踩过）

1. `<text>` 里写 `<b>` 会把整块文字炸出图外 → 用 `font-weight="700"`。
2. `hidden` 会被类里的 `display` 顶掉 → `.step[hidden]{display:none}` 已在 gx.css 里，别自己改。
3. `.content table` 的 `display:block` 特异性高过 `.gx-cmp` → 所以表格类写 `.gx table.gx-cmp`（HTML 里照抄 `class="gx-cmp"` 即可，外层套 `overflow-x:auto`）。
4. 窄屏不要复用宽屏 viewBox 硬缩，字号会缩到 7px 以下。
5. 追加 `<section>` / `<figure>` 时先确认上一段是否已经闭合并写 `</section>`，**重复闭合是最常见的错**。
6. 二次贝塞尔的峰值在 `t=0.5` 处，不在端点：`M a Q b c` 的峰横坐标是 `(a+2b+c)/4`。
7. y 轴映射和刻度标签必须用同一个 `y(v)` 函数算，否则曲线和刻度差几个像素。

---

## 7. 交付前自检

- [ ] `node .workbuddy/bio4/audit.mjs pages/bio/xxx.html` → PASS，五个宽度溢出全 0
- [ ] 六区块齐全，`<section>` 开闭数量相等
- [ ] 4 张静态图，每张有 `.fig-s`（2–3 行）和 `.gx-take`
- [ ] 互动有 `.gx-ap` 徽标，初始文案是「自动演示中」
- [ ] 例题 4–5 步，答案卡有「可抄进答题卡」的表述
- [ ] 6 个问答，每个带 240×132 迷你图
- [ ] 6–7 条易错，左边是真错句
- [ ] 页脚写了模型公式与端点
- [ ] 全文搜一遍「简单来说 / 众所周知 / 其实很简单 / 只要记住」→ 0 条
