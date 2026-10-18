/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 },
            ox: 200, oy: 330, u: 34, ax1: 42, ax2: 418, ay1: 418, ay2: 70 };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 },
            ox: 150, oy: 225, u: 22, ax1: 20, ax2: 340, ay1: 296, ay2: 48 };
  var L = W, G = null, A = 3;

  /* 纯函数：半径 r → 交点数 n、判别量 disc。render() 和 __model.cases 都用它 */
  function calc(v) {
    var r = Math.round(v * 2) / 2;
    var disc = Math.round((r * r - 4) * 100) / 100;
    var n = r < 2 ? 0 : (r > 2 ? 2 : 1);
    return { r: r, disc: disc, n: n };
  }
  function fmt(x) { return String(Math.round(x * 100) / 100); }

  function geom() {
    return { ox: L.ox, oy: L.oy, u: L.u, ax1: L.ax1, ax2: L.ax2, ay1: L.ay1, ay2: L.ay2 };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    var s = calc(A), r = s.r, n = s.n, disc = s.disc;
    var ox = G.ox, oy = G.oy, u = G.u;
    gA.textContent = ""; gB.textContent = "";

    /* ---------- 左：坐标系 + 圆 + x 轴交点 ---------- */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 18, L.left.y + 26, "圆 (x−1)²+(y−2)²=r² 与 x 轴", "#5a6472", "start", L === W ? 10.5 : 9.6, 700);

    el("line", { x1: G.ax1, y1: oy, x2: G.ax2, y2: oy, stroke: "#8a939e", "stroke-width": 1.3 }, gA);
    el("polygon", { points: G.ax2 + "," + oy + " " + (G.ax2 - 13) + "," + (oy - 5.5) + " " + (G.ax2 - 13) + "," + (oy + 5.5), fill: "#8a939e" }, gA);
    el("line", { x1: ox, y1: G.ay1, x2: ox, y2: G.ay2, stroke: "#8a939e", "stroke-width": 1.3 }, gA);
    el("polygon", { points: ox + "," + G.ay2 + " " + (ox - 5.5) + "," + (G.ay2 + 13) + " " + (ox + 5.5) + "," + (G.ay2 + 13), fill: "#8a939e" }, gA);
    tx(gA, G.ax2 - 6, oy + 20, "x", "#5a6472", "end", 9.6, 400);
    tx(gA, ox + 10, G.ay2 + 13, "y", "#5a6472", "start", 9.6, 400);
    tx(gA, ox - 12, oy + 19, "O", "#5a6472", "end", 9.4, 400);

    /* 单位刻度 */
    for (var i = -3; i <= 6; i++) {
      var px = ox + i * u;
      if (px > G.ax1 + 6 && px < G.ax2 - 14) {
        el("line", { x1: px, y1: oy - 4, x2: px, y2: oy + 4, stroke: "#9aa4ae", "stroke-width": 1 }, gA);
        if (i > 0 && i <= 5 && i % 2 === 1) tx(gA, px, oy + 17, String(i), "#5a6472", "middle", 8.5, 400);
      }
    }
    for (var j = 1; j <= 5; j++) {
      var py = oy - j * u;
      if (py > G.ay2 + 12) {
        el("line", { x1: ox - 4, y1: py, x2: ox + 4, y2: py, stroke: "#9aa4ae", "stroke-width": 1 }, gA);
        if (j % 2 === 1) tx(gA, ox - 9, py + 3, String(j), "#5a6472", "end", 8.5, 400);
      }
    }

    var cx = ox + u, cy = oy - 2 * u, rp = r * u;

    /* 圆心到 x 轴的距离 d=2 */
    el("line", { x1: cx, y1: cy, x2: cx, y2: oy, stroke: "#9aa4ae", "stroke-width": 1, "stroke-dasharray": "4 3" }, gA);
    tx(gA, cx + 6, (cy + oy) / 2 + 3, "d=2", "#8a939e", "start", 8.6, 400);

    /* 圆 */
    el("circle", { cx: cx, cy: cy, r: rp, fill: "#2563eb", "fill-opacity": 0.07, stroke: "#2563eb", "stroke-width": 1.8 }, gA);

    /* 半径 r */
    var ang = -0.9, rx = cx + rp * Math.cos(ang), ry = cy + rp * Math.sin(ang);
    el("line", { x1: cx, y1: cy, x2: rx, y2: ry, stroke: "#b8791f", "stroke-width": 1.5 }, gA);
    tx(gA, rx + 5, ry - 5, "r", "#b8402f", "start", 9.6, 700);

    /* 圆心 */
    el("circle", { cx: cx, cy: cy, r: 3.2, fill: "#b8402f" }, gA);
    tx(gA, cx + 7, cy - 7, "C(1,2)", "#b8402f", "start", 9.4, 700);

    /* 与 x 轴的交点 */
    if (n === 2) {
      var sq = Math.sqrt(disc);
      var xa = ox + (1 - sq) * u, xb = ox + (1 + sq) * u;
      el("circle", { cx: xa, cy: oy, r: 3.6, fill: "#b8402f" }, gA);
      el("circle", { cx: xb, cy: oy, r: 3.6, fill: "#b8402f" }, gA);
      tx(gA, xa, oy - 9, "A", "#b8402f", "middle", 9.4, 700);
      tx(gA, xb, oy - 9, "B", "#b8402f", "middle", 9.4, 700);
      el("line", { x1: ox + u, y1: oy, x2: ox + u, y2: oy - 18, stroke: "#2f8a5b", "stroke-width": 1.2 }, gA);
    } else if (n === 1) {
      el("circle", { cx: ox + u, cy: oy, r: 4, fill: "#b8791f" }, gA);
      tx(gA, ox + u + 8, oy - 10, "切点 (1,0)", "#b8791f", "start", 9.4, 700);
    }

    /* ---------- 右：读数 ---------- */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 18, L.right.y + 28, "读数（半径一变，判别量就变）", "#5a6472", "start", 10.5, 700);
    var x0 = L.right.x + 18, y0 = L.right.y + 60, dy = L === W ? 24 : 22, fs = L === W ? 10.4 : 9.8;
    tx(gB, x0, y0, "(x−1)² + (y−2)² = r²", "#151a21", "start", 12.5, 700);
    tx(gB, x0, y0 + dy, "圆心 C(1, 2)，半径 r = " + fmt(r), "#3a3a35", "start", fs, 400);
    tx(gB, x0, y0 + dy * 2, "令 y = 0：(x−1)² = r² − 4", "#3a3a35", "start", fs, 400);
    tx(gB, x0, y0 + dy * 3, "判别量 Δ = r² − 4 = " + fmt(disc), n === 1 ? "#b8791f" : (n === 0 ? "#b8402f" : "#2f8a5b"), "start", fs, 700);
    var pts = n === 0 ? "与 x 轴没有交点"
      : n === 1 ? "只有 1 个交点 (1, 0)"
      : "2 个交点 (1−√Δ, 0)、(1+√Δ, 0)";
    tx(gB, x0, y0 + dy * 4, pts, "#3a3a35", "start", fs, 400);
    var col2 = n === 1 ? "#b8791f" : (n === 0 ? "#b8402f" : "#2f8a5b");
    wrap(gB, x0, y0 + dy * 5 + 8, n === 0 ? "Δ<0：圆整体在 x 轴上方，相离。" : (n === 1 ? "Δ=0：圆与 x 轴相切，只有一个公共点。" : "Δ>0：圆穿过 x 轴，两个公共点。"),
      L.right.w - 36, fs, col2, 18);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = fmt(s.r);
    $("gxVb").textContent = fmt(s.disc);
    $("gxVc").textContent = String(s.n);
    if (s.r < 2) { st = "与 x 轴相离"; col = "#b8402f"; bg = "#fbeae7"; sn = "r<2，够不到 x 轴"; }
    else if (s.r === 2) { st = "与 x 轴相切"; col = "#b8791f"; bg = "#fdf3e0"; sn = "r=2，半径等于 d=2"; }
    else { st = "相交于两点"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "r>2，穿过 x 轴"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
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
    loop: [{ t: 0, v: 3 }, { t: 1.2, v: 3 }, { t: 4, v: 2 }, { t: 6.5, v: 2 }, { t: 9, v: 1 }, { t: 11.5, v: 4 }, { t: 13.5, v: 3 }],
    keys: [1, 2, 3, 4],
    value: A, min: 0.5, max: 5, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { n: 0, disc: -3 } },
    { v: 2, eq: { n: 1, disc: 0 } },
    { v: 3, eq: { n: 2, disc: 5 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
