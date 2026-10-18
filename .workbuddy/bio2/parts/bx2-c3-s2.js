/* bx2-c3-s2：GC 含量 → 碱基个数、氢键总数、稳定性 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 330 }, right: { x: 8, y: 350, w: 344, h: 342 } };
  var L = W, G = null, A = 50;
  var BLUE = "#2c7fb0", REDB = "#a8394a", GREEN = "#2f8a5b", AMBER = "#b8791f", RED = "#b8402f";

  /* 唯一真值：gc 为 GC 含量 %，按 100 个碱基（50 个碱基对）计 */
  function calc(gc) {
    var a = (100 - gc) / 2, g = gc / 2;
    return { gc: gc, A: a, T: a, G: g, C: g, hb: 2 * a + 3 * g, ratio: gc === 0 ? 0 : a / g };
  }
  function fmt(n) { return n % 1 === 0 ? String(n) : n.toFixed(1); }
  function pts(a) {
    for (var i = 0, o = []; i < a.length; i++) o.push(a[i][0].toFixed(1) + "," + a[i][1].toFixed(1));
    return o.join(" ");
  }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB"), wide = L === W;
    gA.textContent = ""; gB.textContent = "";
    var lx = L.left.x, ly = L.left.y;
    el("rect", { x: lx, y: ly, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, lx + 16, ly + 26, "100 个碱基的双螺旋示意", "#5a6472", "start", 10.5, 700);

    var n = wide ? 16 : 9, k, xl = [], xr = [], fs = wide ? 8 : 7.4;
    var y0 = ly + 58, y1 = ly + L.left.h - 92;
    var cx = lx + L.left.w / 2, dx = wide ? 66 : 58;
    for (k = 0; k <= n; k++) {
      var y = y0 + (y1 - y0) * k / n, wv = 13 * Math.sin(k * 0.85);
      xl.push([cx - dx + wv, y]); xr.push([cx + dx + wv, y]);
    }
    el("polyline", { points: pts(xl), fill: "none", stroke: "#9aa7b4", "stroke-width": 2.2 }, gA);
    el("polyline", { points: pts(xr), fill: "none", stroke: "#9aa7b4", "stroke-width": 2.2 }, gA);

    var acc = 0;
    for (k = 0; k < n; k++) {
      var m = k + 0.5, ym = y0 + (y1 - y0) * m / n, wm = 13 * Math.sin(m * 0.85);
      var isGC = (acc += A / 100) >= 1;
      if (isGC) acc -= 1;
      var col = isGC ? GREEN : BLUE, nd = isGC ? 3 : 2, q;
      for (q = 0; q < nd; q++) {
        var oy = (q - (nd - 1) / 2) * (isGC ? 6.2 : 7.4);
        el("line", { x1: cx - dx + wm, y1: ym + oy, x2: cx + dx + wm, y2: ym + oy, stroke: col, "stroke-width": 1.6, "stroke-dasharray": "3 2.5" }, gA);
      }
      tx(gA, cx - dx + wm - 7, ym + 3, isGC ? "G" : (k % 2 ? "T" : "A"), col, "end", fs, 700);
      tx(gA, cx + dx + wm + 7, ym + 3, isGC ? "C" : (k % 2 ? "A" : "T"), col, "start", fs, 700);
    }
    tx(gA, cx, y1 + 26, "两条链反向平行：一条 5′→3′，另一条 3′→5′", "#5a6472", "middle", 9.2, 400);
    tx(gA, cx, y1 + 45, "虚线 2 条＝A—T，3 条＝G—C（氢键）", "#5a6472", "middle", 9.2, 400);
    tx(gA, cx, y1 + 64, "外侧：磷酸—脱氧核糖交替连接 ＝ 基本骨架", "#5a6472", "middle", 9.2, 400);
    tx(gA, cx, y1 + 83, "G-C 对越多 → 氢键越多 → DNA 越稳定", "#5a6472", "middle", 9.2, 400);

    var rx = L.right.x, ry = L.right.y;
    el("rect", { x: rx, y: ry, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, rx + 16, ry + 26, "碱基个数（总数 100 个）", "#5a6472", "start", 10.5, 700);
    var rows = [["A", s.A, BLUE], ["T", s.T, REDB], ["G", s.G, GREEN], ["C", s.C, AMBER]];
    var x0 = rx + 16, sc = (L.right.w - 96) / 50, rh = wide ? 26 : 30, by = ry + 50, i;
    for (i = 0; i < 4; i++) {
      var yy = by + i * rh, bw = Math.max(2, rows[i][1] * sc);
      el("rect", { x: x0 + 34, y: yy, width: bw, height: 14, rx: 3, fill: rows[i][2], opacity: 0.86 }, gB);
      tx(gB, x0, yy + 12, rows[i][0], "#3a3a35", "start", 10.5, 700);
      tx(gB, x0 + 40 + bw, yy + 12, fmt(rows[i][1]), "#5a6472", "start", 10, 400);
    }
    var ty = by + 4 * rh + 16;
    tx(gB, x0, ty, "氢键总数 = 2A + 3G = " + fmt(s.hb) + " 个", "#151a21", "start", 11, 700);
    tx(gB, x0, ty + 24, "A/G = " + (A === 0 ? "—（没有 G）" : s.ratio.toFixed(2)), "#5a6472", "start", 10.5, 400);
    tx(gB, x0, ty + 52, "G-C 对越多 → 氢键越多", GREEN, "start", 10.5, 700);
    tx(gB, x0, ty + 72, "→ 两条链结合越牢", "#3a3a35", "start", 10.5, 400);
    tx(gB, x0, ty + 92, "→ DNA 越稳定、越耐热", "#3a3a35", "start", 10.5, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(A);
    $("gxVb").textContent = fmt(s.A);
    $("gxVbs").textContent = "G = C = " + fmt(s.G) + " 个";
    $("gxVc").textContent = fmt(s.hb);
    if (A === 0) { st = "全 A-T"; col = RED; bg = "#fbeae7"; sn = "氢键最少，稳定性最低"; }
    else if (A < 50) { st = "A、T 偏多"; col = AMBER; bg = "#fdf3e0"; sn = "氢键 " + fmt(s.hb) + " 个，还在变多"; }
    else if (A === 50) { st = "最对称"; col = GREEN; bg = "#e6f6ee"; sn = "A=T=G=C=25，氢键 125 个"; }
    else if (A === 100) { st = "全 G-C"; col = GREEN; bg = "#e6f6ee"; sn = "氢键最多，稳定性最高"; }
    else { st = "G、C 偏多"; col = GREEN; bg = "#e6f6ee"; sn = "G-C 对多 → 氢键多 → 更稳定"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function geom() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    stage.setAttribute("viewBox", L.vb);
    return L;
  }
  function layout() { G = geom(); render(); }

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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 50 }, { t: 6.5, v: 50 }, { t: 9, v: 100 }, { t: 11, v: 70 }, { t: 13, v: 0 }],
    keys: [0, 50, 70, 100],
    value: A, min: 0, max: 100, step: 5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 40, eq: { A: 30, G: 20 } },
    { v: 60, eq: { A: 20, G: 30 } },
    { v: 50, eq: { hb: 125 } }
  ] };
  window.__model = window.__bio;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
