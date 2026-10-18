/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0, G = null;

  /* 纯函数：减数分裂进程 p → 染色体数 / DNA 数。render() 与 __bio.cases 都用它 */
  function calc(v) {
    var chrom = v < 75 ? 4 : v < 88 ? 2 : v < 97 ? 4 : 2;
    var dna = v < 20 ? 4 + 4 * v / 20 : v < 75 ? 8 : v < 97 ? 4 : 2;
    return { chrom: chrom, dna: dna, hl: (v >= 88 && v < 97) ? 1 : 0 };
  }
  function phase(v) {
    if (v < 20) return { t: "间期", s: "DNA 正在复制 4→8" };
    if (v < 40) return { t: "减Ⅰ前期", s: "同源染色体联会成四分体" };
    if (v < 60) return { t: "减Ⅰ后期", s: "同源染色体分离 4→2" };
    if (v < 75) return { t: "减Ⅰ末期", s: "细胞一分为二，DNA 8→4" };
    if (v < 88) return { t: "减Ⅱ前/中期", s: "2 条，着丝粒未分裂" };
    if (v < 97) return { t: "减Ⅱ后期", s: "着丝粒分裂，染色体 2→4" };
    if (v < 100) return { t: "减Ⅱ末期", s: "染色体移向两极" };
    return { t: "配子", s: "染色体减半为 2 条" };
  }

  function geom() {
    var l = L.left, r = L.right;
    return {
      cx: l.x + l.w / 2, cy: l.y + l.h * 0.44, rx: l.w * 0.40, ry: l.h * 0.26,
      px0: r.x + 40, px1: r.x + r.w - 22, py0: r.y + 96, py1: r.y + r.h - 78
    };
  }

  function draw(s, ph) {
    var gA = $("gxA"), gB = $("gxB"), l = L.left, r = L.right, G2 = G;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 18, l.y + 26, "细胞内的染色体：一条线 + 中间着丝粒", "#5a6472", "start", 10, 700);
    el("ellipse", { cx: G2.cx, cy: G2.cy, rx: G2.rx, ry: G2.ry, fill: "#ffffff", stroke: "#cbd8e3", "stroke-width": 1.4 }, gA);

    var n = s.chrom, cols = n <= 4 ? 2 : 4, rows = n <= 4 ? 2 : 2, i, j, k = 0;
    var cg = n <= 4 ? 74 : 72, rg = G2.ry * 0.62;
    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        if (k >= n) break;
        var x = G2.cx + (j - (cols - 1) / 2) * cg;
        var y = G2.cy + (i - (rows - 1) / 2) * rg;
        var len = (k % 2 === 0) ? 40 : 28;
        var col = (k % 4 < 2) ? "#c0392b" : "#2f6fb0";
        el("line", { x1: x - len / 2, y1: y, x2: x + len / 2, y2: y, stroke: col, "stroke-width": 3.2, "stroke-linecap": "round" }, gA);
        el("circle", { cx: x, cy: y, r: 3.2, fill: "#2b2f36" }, gA);
        k++;
      }
    }
    tx(gA, l.x + 18, l.y + l.h - 52, "处于：" + ph.t, "#151a21", "start", 11, 700);
    tx(gA, l.x + 18, l.y + l.h - 34, ph.s, "#5a6472", "start", 9.2, 400);
    tx(gA, l.x + 18, l.y + l.h - 16, "染色体 " + s.chrom + " 条 · DNA " + s.dna + " 个", "#8a94a2", "start", 9, 400);

    /* 右侧：两个计数的阶梯曲线 + 当前位置 */
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 18, r.y + 26, "两个计数怎么变（纵轴 0–8）", "#5a6472", "start", 10, 700);
    var X = function (p) { return G2.px0 + p * (G2.px1 - G2.px0) / 100; };
    var Y = function (v) { return G2.py1 - v * (G2.py1 - G2.py0) / 8; };
    el("line", { x1: G2.px0, y1: G2.py0, x2: G2.px0, y2: G2.py1, stroke: "#c7d2dc" }, gB);
    el("line", { x1: G2.px0, y1: G2.py1, x2: G2.px1, y2: G2.py1, stroke: "#c7d2dc" }, gB);
    var gv = [2, 4, 8], gi;
    for (gi = 0; gi < 3; gi++) {
      el("line", { x1: G2.px0, y1: Y(gv[gi]), x2: G2.px1, y2: Y(gv[gi]), stroke: "#e8eef4", "stroke-dasharray": "4 4" }, gB);
      tx(gB, G2.px0 - 8, Y(gv[gi]) + 3.5, String(gv[gi]), "#8a94a2", "end", 9, 400);
    }
    var d = [];
    d.push(X(0) + "," + Y(4)); d.push(X(20) + "," + Y(8)); d.push(X(75) + "," + Y(8));
    d.push(X(75) + "," + Y(4)); d.push(X(97) + "," + Y(4)); d.push(X(97) + "," + Y(2)); d.push(X(100) + "," + Y(2));
    el("polyline", { points: d.join(" "), fill: "none", stroke: "#b8791f", "stroke-width": 2.4, "stroke-linejoin": "round" }, gB);
    var c = [];
    c.push(X(0) + "," + Y(4)); c.push(X(75) + "," + Y(4)); c.push(X(75) + "," + Y(2));
    c.push(X(88) + "," + Y(2)); c.push(X(88) + "," + Y(4)); c.push(X(97) + "," + Y(4));
    c.push(X(97) + "," + Y(2)); c.push(X(100) + "," + Y(2));
    el("polyline", { points: c.join(" "), fill: "none", stroke: "#2f6fb0", "stroke-width": 2.4, "stroke-linejoin": "round" }, gB);
    el("line", { x1: X(A), y1: G2.py0 - 4, x2: X(A), y2: G2.py1, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "3 4" }, gB);
    el("circle", { cx: X(A), cy: Y(s.chrom), r: 3.4, fill: "#2f6fb0" }, gB);
    el("circle", { cx: X(A), cy: Y(s.dna), r: 3.4, fill: "#b8791f" }, gB);
    tx(gB, G2.px0 + 4, G2.py1 + 18, "间期", "#8a94a2", "start", 8.6, 400);
    tx(gB, X(47), G2.py1 + 18, "减Ⅰ", "#8a94a2", "middle", 8.6, 400);
    tx(gB, X(87), G2.py1 + 18, "减Ⅱ", "#8a94a2", "middle", 8.6, 400);
    tx(gB, G2.px1, G2.py1 + 18, "配子", "#8a94a2", "end", 8.6, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var v = Math.round(A), s = calc(v), ph = phase(v), col, bg;
    if (s.hl) { col = "#b8791f"; bg = "#fdf3e0"; }
    else { col = "#2f8a5b"; bg = "#e6f6ee"; }
    $("gxVa").textContent = String(v);
    $("gxVb").textContent = String(s.chrom);
    $("gxVc").textContent = String(s.dna);
    $("gxVs").textContent = ph.t;
    $("gxVsn").textContent = ph.s;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    document.querySelectorAll("#gxVb, #gxVc").forEach(function (e) {
      e.style.color = (e.id === "gxVb" && s.hl) ? "#b8791f" : "";
    });
    draw(s, ph);
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    G = geom();
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 93 }, { t: 6.5, v: 93 }, { t: 9, v: 100 }, { t: 11, v: 55 }, { t: 13, v: 0 }],
    keys: [0, 55, 93, 100],
    value: A, min: 0, max: 100, step: 5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = window.__bio;
  window.__bio = { calc: calc, cases: [
    { v: 30, eq: { chrom: 4, dna: 8 } },
    { v: 93, eq: { chrom: 4, dna: 4 } },
    { v: 100, eq: { chrom: 2, dna: 2 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
