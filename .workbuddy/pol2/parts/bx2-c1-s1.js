/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = {
    vb: "0 0 880 470",
    left: { x: 16, y: 16, w: 424, h: 438 },
    right: { x: 456, y: 16, w: 408, h: 438 },
    cfg: { barX: 24, barY: 92, barW: 376, barH: 48, th: 0.5,
           cardY: 168, cardH: 56, ctrlY: 250, sumY: 336 }
  };
  var N = {
    vb: "0 0 360 700",
    left: { x: 8, y: 8, w: 344, h: 326 },
    right: { x: 8, y: 346, w: 344, h: 346 },
    cfg: { barX: 18, barY: 84, barW: 308, barH: 40, th: 0.5,
           cardY: 148, cardH: 48, ctrlY: 214, sumY: 244 }
  };
  var L = W, A = 70;

  var PUB = "#0891b2", PUB_FILL = "#b8e6f2", PUB_SOFT = "#ecfbff";
  var PRI = "#b8791f", PRI_FILL = "#f0dcb4", PRI_SOFT = "#fffaf2";

  /* 纯函数：公有资产占比 → 三个判据数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var x = Math.max(0, Math.min(100, +v));
    return { pub: x, non: 100 - x, adv: x >= 50 ? 1 : 0 };
  }

  function stateOf(x) {
    if (x >= 60) return { name: "主体地位稳固", sn: "公有资产占优势，控制力也强", col: "#2f8a5b", bg: "#e6f6ee" };
    if (x >= 50) return { name: "主体地位承压", sn: "刚过半，优势不牢", col: "#b8791f", bg: "#fdf3e0" };
    return { name: "主体地位受挑战", sn: "公有资产不占优势", col: "#b8402f", bg: "#fbeae7" };
  }

  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function panel(g, r, edge) {
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#f8fbfd", stroke: edge }, g);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var c = L.cfg, s = calc(A), st = stateOf(A);
    var l = L.left, r = L.right;

    /* ---------------- 左：社会总资产堆叠条 ---------------- */
    panel(gA, l, "#dbe7ef");
    tx(gA, l.x + 20, l.y + 30, "社会总资产：公有 vs 非公有", "#5a6472", "start", 11, 700);
    tx(gA, l.x + 20, l.y + 49, "一根条代表 100% 的社会总资产", "#9aa3ae", "start", 9.2, 400);

    var bx = l.x + c.barX, by = l.y + c.barY, bw = c.barW, bh = c.barH;
    var pubW = bw * s.pub / 100;
    el("rect", { x: bx, y: by, width: bw, height: bh, rx: 6, fill: "#eef2f6", stroke: "#c9d2da" }, gA);
    if (pubW > 2) el("rect", { x: bx, y: by, width: pubW, height: bh, rx: 6, fill: PUB_FILL, stroke: PUB }, gA);
    if (pubW < bw - 2) el("rect", { x: bx + pubW, y: by, width: bw - pubW, height: bh, rx: 6, fill: PRI_FILL, stroke: PRI }, gA);

    /* 50% 分界线 */
    var tx50 = bx + bw * c.th;
    el("line", { x1: tx50, y1: by - 10, x2: tx50, y2: by + bh + 10, stroke: "#b8402f", "stroke-width": 1.4, "stroke-dasharray": "4 4" }, gA);
    tx(gA, tx50, by - 16, "50% 分界线", "#b8402f", "middle", 8.6, 700);

    /* 条内标签：宽度够就放里面，太窄就放外面 */
    if (pubW > 78) tx(gA, bx + pubW / 2, by + bh / 2 + 4, "公有 " + Math.round(s.pub) + "%", "#0b6580", "middle", 10, 700);
    else tx(gA, bx + pubW / 2, by + bh + 20, "公有 " + Math.round(s.pub) + "%", PUB, "middle", 9, 700);
    if (bw - pubW > 78) tx(gA, bx + pubW + (bw - pubW) / 2, by + bh / 2 + 4, "非公有 " + Math.round(s.non) + "%", "#8a5c14", "middle", 10, 700);
    else tx(gA, bx + pubW + (bw - pubW) / 2, by + bh + 20, "非公有 " + Math.round(s.non) + "%", PRI, "middle", 9, 700);

    /* 两个数字卡 */
    var cy = l.y + c.cardY, ch = c.cardH, cw = (l.w - 48) / 2;
    el("rect", { x: l.x + 20, y: cy, width: cw, height: ch, rx: 8, fill: PUB_SOFT, stroke: "#b8e6f2" }, gA);
    tx(gA, l.x + 34, cy + 20, "公有资产", "#5a6472", "start", 8.8, 400);
    tx(gA, l.x + 34, cy + 42, Math.round(s.pub) + "%", "#0b6580", "start", 15, 700);
    el("rect", { x: l.x + 28 + cw, y: cy, width: cw, height: ch, rx: 8, fill: PRI_SOFT, stroke: "#f0dcb4" }, gA);
    tx(gA, l.x + 42 + cw, cy + 20, "非公有制资产", "#5a6472", "start", 8.8, 400);
    tx(gA, l.x + 42 + cw, cy + 42, Math.round(s.non) + "%", "#8a5c14", "start", 15, 700);

    /* 第二根柱子：控制力（固定强） */
    var ky = l.y + c.ctrlY;
    el("rect", { x: l.x + 20, y: ky, width: l.w - 40, height: 92, rx: 8, fill: "#e6f6ee", stroke: "#bfe0cd" }, gA);
    tx(gA, l.x + 34, ky + 21, "第二根柱子：国有经济控制力", "#1f6b47", "start", 9.6, 700);
    tx(gA, l.x + l.w - 34, ky + 21, "强 ✓", "#2f8a5b", "end", 11, 700);
    wrap(gA, l.x + 34, ky + 42, "能源、交通、通信、军工、金融等关键行业握得住，才叫控制国民经济命脉。", l.w - 68, 8.8, "#3a3a35", 14);
    tx(gA, l.x + 34, ky + 78, "这根柱子不由滑块决定——它是主体地位的第二个判据。", "#1f6b47", "start", 8.6, 400);

    /* 底部提示 */
    if (L === W) tx(gA, l.x + 20, l.y + l.h - 18, "读法：先看堆叠条过不过 50%，再看右侧两根柱子是否都立住。", "#6b7280", "start", 9.2);

    /* ---------------- 右：两根柱子 ---------------- */
    panel(gB, r, "#e6e9ee");
    tx(gB, r.x + 20, r.y + 30, "两根柱子，撑起主体地位", "#5a6472", "start", 11, 700);
    tx(gB, r.x + 20, r.y + 49, "两根都立住，才叫“公有制为主体”", "#9aa3ae", "start", 9.2, 400);

    var rowY = r.y + 70, rowH = 74, rowW = r.w - 40;
    var rows = [
      { t: "判据一：公有资产在社会总资产中占优势", ok: s.adv === 1, v: Math.round(s.pub) + "%", d: s.adv === 1 ? "已经过半" : "没有过半" },
      { t: "判据二：国有经济控制国民经济命脉", ok: true, v: "控制力强", d: "关键行业握得住" }
    ];
    for (var i = 0; i < rows.length; i++) {
      var ry = rowY + i * (rowH + 12);
      el("rect", { x: r.x + 20, y: ry, width: rowW, height: rowH, rx: 8, fill: "#ffffff", stroke: rows[i].ok ? "#bfe0cd" : "#f0cbc4" }, gB);
      el("circle", { cx: r.x + 40, cy: ry + 26, r: 11, fill: rows[i].ok ? "#2f8a5b" : "#b8402f" }, gB);
      tx(gB, r.x + 40, ry + 30, rows[i].ok ? "✓" : "✗", "#ffffff", "middle", 11, 700);
      tx(gB, r.x + 58, ry + 22, rows[i].t, "#151a21", "start", 9.4, 700);
      tx(gB, r.x + 58, ry + 44, rows[i].d, "#6b7280", "start", 8.8, 400);
      tx(gB, r.x + rowW, ry + 28, rows[i].v, rows[i].ok ? "#1f6b47" : "#b8402f", "end", 11, 700);
    }

    /* 结论卡 */
    var sy = r.y + c.sumY;
    el("rect", { x: r.x + 20, y: sy, width: rowW, height: 76, rx: 8, fill: st.bg, stroke: st.col + "44" }, gB);
    tx(gB, r.x + 34, sy + 21, "结论：主体地位", "#5a6472", "start", 8.8, 400);
    tx(gB, r.x + 34, sy + 45, st.name, st.col, "start", 14, 700);
    tx(gB, r.x + 34, sy + 65, st.sn, "#3a3a35", "start", 9, 400);

    if (L === W) {
      tx(gB, r.x + 20, r.y + r.h - 20, "注意：主体地位是就全国而言，不是拿某一个行业、某一家企业来比。", "#6b7280", "start", 8.8);
    }
  }

  function render() {
    var s = calc(A), st = stateOf(A);
    $("gxVa").textContent = Math.round(s.pub) + "%";
    $("gxVb").textContent = Math.round(s.non) + "%";
    $("gxVc").textContent = Math.round(s.pub) + " : " + Math.round(s.non);
    $("gxVcS").textContent = "比值 " + (s.pub / s.non).toFixed(1);
    $("gxVs").textContent = st.name;
    $("gxVsn").textContent = st.sn;
    $("gxStBox").style.background = st.bg;
    $("gxStBox").style.borderColor = st.col + "44";
    $("gxVs").style.color = st.col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    stage.setAttribute("viewBox", L.vb);
    render();
  }

  var apBadge = $("gxAp"), apTxt = $("gxApTxt");
  function setMode(m) {
    if (!apBadge) return;
    apBadge.classList.toggle("is-auto", m === "auto");
    apBadge.classList.toggle("is-manual", m !== "auto");
    if (apTxt) apTxt.textContent = m === "auto" ? "自动演示中" : "你接管了";
  }

  var ap = AutoPilot.create({
    mount: stage,
    follow: $("gxSl"),
    loop: [{ t: 0, v: 70 }, { t: 1.2, v: 70 }, { t: 4, v: 52 }, { t: 6.5, v: 52 }, { t: 9, v: 38 }, { t: 11, v: 38 }, { t: 13, v: 70 }],
    keys: [70, 52, 38, 60],
    value: A, min: 30, max: 90, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 70, eq: { pub: 70, non: 30, adv: 1 } },
    { v: 52, eq: { pub: 52, non: 48, adv: 1 } },
    { v: 40, eq: { pub: 40, non: 60, adv: 0 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
