/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1, G = null;

  /* 纯函数：参数 a → 集合 S={a,1,2} 的元素个数。render() 和 __model.cases 都用它 */
  function calc(v) {
    var a = Math.round(v);
    if (!(a >= 0 && a <= 4)) a = 0;
    var dup = (a === 1 || a === 2) ? 1 : 0;   /* 互异性：重复的元素只算一次 */
    return { a: a, size: 3 - dup, dup: dup };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function geom() {
    var l = L.left, r = L.right, nar = (L === N);
    var g = {};
    g.cw = nar ? 88 : 74;
    g.gap = nar ? 12 : 16;
    g.ch = nar ? 50 : 54;
    g.cx0 = l.x + (nar ? 16 : 42);
    g.row1 = l.y + (nar ? 76 : 92);
    g.row2 = l.y + (nar ? 186 : 210);
    g.noteY = l.y + (nar ? 252 : 288);
    g.ax0 = r.x + (nar ? 34 : 52);
    g.ax1 = r.x + r.w - (nar ? 34 : 46);
    g.axY = r.y + (nar ? 84 : 96);
    g.lbY = g.axY + 20;
    g.txtY = r.y + (nar ? 132 : 158);
    return g;
  }

  function chip(g, x, y, w, h, main, sub, col, bg, dash) {
    el("rect", { x: x, y: y, width: w, height: h, rx: 8, fill: bg, stroke: col, "stroke-width": dash ? 1.4 : 1, "stroke-dasharray": dash ? "5 4" : "" }, g);
    tx(g, x + w / 2, y + (sub ? h / 2 - 3 : h / 2 + 5), main, col, "middle", 15, 700);
    if (sub) tx(g, x + w / 2, y + h - 11, sub, col, "middle", 8.4, 400);
  }

  function draw() {
    var g = G, s = calc(A);
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, L.left.x + 18, L.left.y + 28, "把 a 代进去，再合并重复", "#5a6472", "start", 10.2, 700);
    tx(gB, L.right.x + 18, L.right.y + 28, "数轴上 a 落在哪，决定元素个数", "#5a6472", "start", 10.2, 700);

    /* 第一行：代入后写出来的样子（含重复） */
    tx(gA, g.cx0, g.row1 - 12, "代入 a = " + s.a + "：S = {" + s.a + ", 1, 2}", "#3a3a35", "start", 10, 400);
    var vals = [s.a, 1, 2];
    for (var i = 0; i < 3; i++) {
      var v = vals[i], dup = vals.indexOf(v) !== i;
      var x = g.cx0 + i * (g.cw + g.gap);
      chip(gA, x, g.row1, g.cw, g.ch, String(v), dup ? "重复" : "元素", dup ? "#b8402f" : "#2f8a5b", dup ? "#fbeae7" : "#ffffff", dup);
    }

    /* 第二行：合并重复后的集合 */
    var merged = [], k;
    for (k = 0; k < 3; k++) if (merged.indexOf(vals[k]) < 0) merged.push(vals[k]);
    tx(gA, g.cx0, g.row2 - 12, "合并重复后：S = {" + merged.join(", ") + "}", "#3a3a35", "start", 10, 400);
    for (k = 0; k < merged.length; k++) {
      chip(gA, g.cx0 + k * (g.cw + g.gap), g.row2, g.cw, g.ch, String(merged[k]), "元素", "#1f5288", "#eef5fc", false);
    }
    tx(gA, g.cx0, g.noteY, "元素个数 = 3 − 重复 1 个 = " + s.size, s.dup ? "#b8402f" : "#2f8a5b", "start", 10, 700);

    /* 右边：数轴（有箭头、有刻度） */
    var y = g.axY, step = (g.ax1 - g.ax0) / 4, j, px;
    el("line", { x1: g.ax0, y1: y, x2: g.ax1 + 8, y2: y, stroke: "#5a6472", "stroke-width": 1.3 }, gB);
    el("polygon", { points: (g.ax1 + 18) + "," + y + " " + (g.ax1 + 6) + "," + (y - 5) + " " + (g.ax1 + 6) + "," + (y + 5), fill: "#5a6472" }, gB);
    for (j = 0; j <= 4; j++) {
      px = g.ax0 + j * step;
      el("line", { x1: px, y1: y - 5, x2: px, y2: y + 5, stroke: "#5a6472", "stroke-width": 1.2 }, gB);
      tx(gB, px, y + 20, String(j), "#5a6472", "middle", 9, 400);
    }
    tx(gB, g.ax1 + 16, y - 12, "a", "#5a6472", "middle", 9.5, 700);
    /* 1 与 2：重复发生的两个位置 */
    el("circle", { cx: g.ax0 + step, cy: y, r: 3.6, fill: "#b8402f" }, gB);
    el("circle", { cx: g.ax0 + 2 * step, cy: y, r: 3.6, fill: "#b8402f" }, gB);
    /* 当前 a 的位置 */
    el("circle", { cx: g.ax0 + s.a * step, cy: y, r: 7.5, fill: "#2563eb", opacity: 0.18 }, gB);
    el("circle", { cx: g.ax0 + s.a * step, cy: y, r: 3, fill: "#2563eb" }, gB);

    var x0 = L.right.x + 24, wmax = L.right.w - 48;
    tx(gB, x0, g.txtY, "a = " + s.a + "，S 里写着 3 个位置", "#3a3a35", "start", 10, 400);
    tx(gB, x0, g.txtY + 22, "重复的元素 " + s.dup + " 个，只算一次", s.dup ? "#b8402f" : "#2f8a5b", "start", 10, 700);
    tx(gB, x0, g.txtY + 44, "所以元素个数是 " + s.size + " 个", "#1f5288", "start", 10.5, 700);
    wrap(gB, x0, g.txtY + 74, s.dup ? "a 与已有的元素撞了，互异性把多余的那个吃掉。" : "三个元素互不相同，数出来就是 3 个。", wmax, 9.4, "#6b7280", 15);
    tx(gB, x0, g.txtY + 122, "红点 = 1 与 2，这两个值必须检验", "#b8402f", "start", 9, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A);
    $("gxVa").textContent = String(s.a);
    $("gxVb").textContent = String(s.size) + " 个";
    $("gxVc").textContent = String(s.dup) + " 个";
    var st, col, bg, sn;
    if (s.dup) { st = "有重复"; col = "#b8402f"; bg = "#fbeae7"; sn = "只剩 2 个元素"; }
    else { st = "互不相同"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "共 3 个元素"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    var w = stage.parentElement.getBoundingClientRect().width;
    L = w >= 640 ? W : N; G = geom();
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 2.4, v: 1 }, { t: 5, v: 1 }, { t: 7.5, v: 2 }, { t: 10, v: 4 }, { t: 12.5, v: 0 }],
    keys: [0, 1, 2, 4],
    value: A, min: 0, max: 4, step: 1,
    idle: 5000,
    onChange: function (v) { A = Math.round(v); render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { size: 3, dup: 0 } },
    { v: 1, eq: { size: 2, dup: 1 } },
    { v: 2, eq: { size: 2, dup: 1 } },
    { v: 4, eq: { size: 3, dup: 0 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
