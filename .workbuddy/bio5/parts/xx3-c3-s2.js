/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = null, A = 12, G = null;

  var SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  function sup(k) { var s = "", t = String(k); for (var i = 0; i < t.length; i++) s += SUP[t.charAt(i)] || t.charAt(i); return s; }

  /* 纯函数：参数 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var n = Math.max(0, Math.min(30, Math.round(v)));
    return { n: n, copies: Math.pow(2, n) };
  }

  function sci(x) {
    if (x < 1000) return String(x);
    var e = Math.floor(Math.log(x) / Math.LN10);
    return (x / Math.pow(10, e)).toFixed(2) + "×10" + sup(e);
  }
  function times(x) {
    if (x >= 1e8) return (x / 1e8).toFixed(2) + " 亿倍";
    if (x >= 1e4) return (x / 1e4).toFixed(1) + " 万倍";
    return x + " 倍";
  }

  function geom() {
    var lf = L.left, rt = L.right;
    return {
      sq: (lf.w - 36) / 30,
      px0: rt.x + 50, px1: rt.x + rt.w - 24,
      pyT: rt.y + 66, pyB: rt.y + 298
    };
  }
  function logY(g, lv) { return g.pyB - (lv / 9) * (g.pyB - g.pyT); }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), g = G;
    gA.textContent = ""; gB.textContent = "";
    var lf = L.left, rt = L.right, i;

    el("rect", { x: lf.x, y: lf.y, width: lf.w, height: lf.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lf.x + 18, lf.y + 28, "试管里：30 轮循环的进度", "#5a6472", "start", 10.5, 700);

    /* 30 个小格 = 30 轮循环 */
    for (i = 0; i < 30; i++) {
      var on = i < s.n;
      el("rect", {
        x: lf.x + 18 + i * g.sq, y: lf.y + 46, width: Math.max(4, g.sq - 2.4), height: 24, rx: 2.5,
        fill: on ? "#5fb98d" : "#eef1f5", stroke: on ? "#2f8a5b" : "#e6e9ee"
      }, gA);
    }
    tx(gA, lf.x + 18, lf.y + 88, "第 1 轮", "#8a919b", "start", 8.6, 400);
    tx(gA, lf.x + lf.w - 18, lf.y + 88, "第 30 轮", "#8a919b", "end", 8.6, 400);
    tx(gA, lf.x + 18, lf.y + 108, "已循环 " + s.n + " 轮，剩余 " + (30 - s.n) + " 轮", "#2f8a5b", "start", 9.4, 700);

    /* 主公式 */
    tx(gA, lf.x + 18, lf.y + 148, "拷贝数 = 2ⁿ", "#151a21", "start", 17, 700);
    tx(gA, lf.x + 18, lf.y + 174, "起始 1 个目的基因，每轮翻一倍", "#3a3a35", "start", 9.4, 400);
    tx(gA, lf.x + 18, lf.y + 192, "n = " + s.n + " → " + sci(s.copies) + " 个拷贝", "#b8791f", "start", 10.2, 700);

    el("line", { x1: lf.x + 18, y1: lf.y + 208, x2: lf.x + lf.w - 18, y2: lf.y + 208, stroke: "#e6e9ee", "stroke-width": 1 }, gA);
    tx(gA, lf.x + 18, lf.y + 230, "一轮循环走三步，箭头首尾相接", "#5a6472", "start", 9.4, 700);

    var pw = (lf.w - 36 - 20) / 3, py = lf.y + 242;
    var names = [["94 ℃", "变性", "#fbeae7", "#b8402f", "#e9bdb4"],
      ["55 ℃", "复性", "#eaf2fb", "#2b5c8a", "#7aa8d8"],
      ["72 ℃", "延伸", "#eef7f2", "#1f6b48", "#5fb98d"]];
    for (i = 0; i < 3; i++) {
      var px = lf.x + 18 + i * (pw + 10);
      el("rect", { x: px, y: py, width: pw, height: 32, rx: 6, fill: names[i][2], stroke: names[i][4] }, gA);
      tx(gA, px + pw / 2, py + 14, names[i][0], names[i][3], "middle", 8.8, 700);
      tx(gA, px + pw / 2, py + 27, names[i][1], names[i][3], "middle", 8.8, 400);
    }
    tx(gA, lf.x + 18, py + 50, "延伸结束 → 回到 94 ℃ 变性，进入下一轮", "#3a3a35", "start", 9.2, 400);
    wrap(gA, lf.x + 18, py + 70, "n 在指数上：轮数只加 10，拷贝数就差 1000 倍。", lf.w - 36, 9.2, "#5a6472", 14);

    /* 右侧：对数刻度曲线 + 当前位置 */
    el("rect", { x: rt.x, y: rt.y, width: rt.w, height: rt.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, rt.x + 18, rt.y + 28, "循环次数 → 拷贝数（纵轴取对数）", "#5a6472", "start", 10.5, 700);

    var logs = [0, 3, 6, 9], labs = ["1", "10³", "10⁶", "10⁹"];
    for (i = 0; i < 4; i++) {
      var gy = logY(g, logs[i]);
      el("line", { x1: g.px0, y1: gy, x2: g.px1, y2: gy, stroke: "#eef1f5", "stroke-width": 1 }, gB);
      tx(gB, g.px0 - 6, gy + 3, labs[i], "#8a919b", "end", 8.4, 400);
    }
    el("line", { x1: g.px0, y1: g.pyB, x2: g.px1, y2: g.pyB, stroke: "#c8d3dc", "stroke-width": 1.2 }, gB);
    el("line", { x1: g.px0, y1: g.pyB, x2: g.px0, y2: g.pyT - 4, stroke: "#c8d3dc", "stroke-width": 1.2 }, gB);
    for (i = 0; i <= 3; i++) {
      var nx = g.px0 + (i * 10 / 30) * (g.px1 - g.px0);
      tx(gB, nx, g.pyB + 14, String(i * 10), "#8a919b", "middle", 8.4, 400);
    }
    tx(gB, (g.px0 + g.px1) / 2, g.pyB + 28, "循环次数 n", "#5a6472", "middle", 8.6, 400);

    el("line", { x1: g.px0, y1: g.pyB, x2: g.px1, y2: logY(g, 9.03), stroke: "#2f8a5b", "stroke-width": 2 }, gB);
    var mx = g.px0 + (s.n / 30) * (g.px1 - g.px0);
    var my = logY(g, s.n === 0 ? 0 : s.n * 0.30103);
    el("line", { x1: mx, y1: g.pyB, x2: mx, y2: my, stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "3 3" }, gB);
    el("circle", { cx: mx, cy: my, r: 5, fill: "#b8402f" }, gB);
    var anchor = s.n > 22 ? "end" : "start", off = s.n > 22 ? -8 : 8;
    tx(gB, mx + off, my - 8, "n=" + s.n + " → " + sci(s.copies), "#b8402f", anchor, 9, 700);

    tx(gB, rt.x + 18, g.pyB + 56, "每轮 ×2，所以等距翻倍画成直线。", "#3a3a35", "start", 9.2, 400);
    tx(gB, rt.x + 18, g.pyB + 74, "n=10 → 1.02×10³；n=20 → 1.05×10⁶；", "#3a3a35", "start", 9.2, 400);
    tx(gB, rt.x + 18, g.pyB + 90, "n=30 → 1.07×10⁹ ≈ 10.7 亿倍。", "#b8402f", "start", 9.2, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.n);
    $("gxVb").textContent = sci(s.copies);
    $("gxVc").textContent = times(s.copies);
    if (s.n < 15) { st = "扩增量还不够"; col = "#b8402f"; bg = "#fbeae7"; sn = "拷贝数太小，检测不到"; }
    else if (s.n <= 25) { st = "可用于检测"; col = "#b8791f"; bg = "#fdf3e0"; sn = "够做电泳或分子杂交"; }
    else if (s.n <= 28) { st = "接近足够"; col = "#b8791f"; bg = "#fdf3e0"; sn = "再几轮就到十亿倍"; }
    else { st = "足够测序或电泳"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "指数放大，n=30 约十亿倍"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    stage.setAttribute("viewBox", L.vb);
    G = null;
    render();
  }

  var apBadge = $("gxAp"), apTxt = $("gxApTxt");
  function setMode(m) {
    if (!apBadge) return;
    apBadge.classList.toggle("is-auto", m === "auto");
    apBadge.classList.toggle("is-manual", m !== "auto");
    if (apTxt) apTxt.textContent = m === "auto" ? "自动演示中" : "你接管了";
  }

  var sl = $("gxSl");
  if (sl) sl.value = A;
  var ap = AutoPilot.create({
    mount: stage,
    follow: sl,
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 3.4, v: 10 }, { t: 5.4, v: 10 }, { t: 8, v: 30 }, { t: 10.5, v: 30 }, { t: 12, v: 20 }, { t: 13.5, v: 0 }],
    keys: [0, 10, 20, 30],
    value: A, min: 0, max: 30, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 10, eq: { copies: 1024 } },
    { v: 20, eq: { copies: 1048576 } },
    { v: 30, eq: { copies: 1073741824 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
