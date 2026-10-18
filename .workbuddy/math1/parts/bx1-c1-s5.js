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
  var XMIN = -3, XMAX = 3, YMIN = -2, YMAX = 4;

  /* 纯函数：参数 a → 判别式与真假。render() 和 __model.cases 都用它 */
  function calc(v) {
    var a = Math.round(v * 2) / 2;
    var disc = a * a - 4;
    return { a: a, disc: disc, truth: disc < 0 ? 1 : 0, vert: 1 - a * a / 4 };
  }

  function fmt(a) { return (a % 1 === 0) ? String(a) : a.toFixed(1); }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh, wt) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, wt || 400);
  }

  function geom() {
    var p = L.left, wide = L === W;
    var pl = wide ? 46 : 34, pr = wide ? 24 : 18, pt = wide ? 56 : 44, pb = wide ? 58 : 48;
    var plot = { x: p.x + pl, y: p.y + pt, w: p.w - pl - pr, h: p.h - pt - pb };
    return {
      wide: wide, plot: plot,
      X: function (m) { return plot.x + (m - XMIN) / (XMAX - XMIN) * plot.w; },
      Y: function (m) { return plot.y + (YMAX - m) / (YMAX - YMIN) * plot.h; }
    };
  }

  function seg(parent, x1, y1, x2, y2, col, w, dash) {
    var o = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": w || 1.2 };
    if (dash) o["stroke-dasharray"] = dash;
    el("line", o, parent);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), wide = G.wide, p = L.left, r = L.right, pl = G.plot;
    el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, p.x + 20, p.y + 30, "抛物线 y = x² + ax + 1 与 x 轴", "#5a6472", "start", wide ? 10.5 : 9.4, 700);

    var oy = G.Y(0), ox = G.X(0);
    seg(gA, pl.x - 12, oy, pl.x + pl.w, oy, "#9aa4b2", 1.2);
    el("path", { d: "M" + (pl.x + pl.w) + " " + oy + " l-9 -4 v8 z", fill: "#9aa4b2" }, gA);
    seg(gA, ox, pl.y + pl.h, ox, pl.y, "#9aa4b2", 1.2);
    el("path", { d: "M" + ox + " " + pl.y + " l-4 9 h8 z", fill: "#9aa4b2" }, gA);
    tx(gA, ox - 8, oy + 14, "O", "#8a94a6", "end", 8.6, 400);
    tx(gA, pl.x + pl.w - 4, oy - 8, "x", "#8a94a6", "end", 9, 400);
    tx(gA, ox + 8, pl.y + 10, "y", "#8a94a6", "start", 9, 400);

    var i;
    for (i = XMIN; i <= XMAX; i++) {
      if (i === 0) continue;
      seg(gA, G.X(i), oy - 3, G.X(i), oy + 3, "#9aa4b2", 1);
      tx(gA, G.X(i), oy + 15, String(i).replace("-", "−"), "#8a94a6", "middle", 8.4, 400);
    }
    [2, 4].forEach(function (v) {
      seg(gA, ox - 3, G.Y(v), ox + 3, G.Y(v), "#9aa4b2", 1);
      tx(gA, ox - 8, G.Y(v) + 3.2, String(v), "#8a94a6", "end", 8.4, 400);
    });

    /* 只画 y ≤ 4 的那一段，避免曲线冲出面板 */
    var aa = s.a, sq = Math.sqrt(aa * aa + 12);
    var x1 = Math.max(XMIN, (-aa - sq) / 2), x2 = Math.min(XMAX, (-aa + sq) / 2);
    var pts = [], k, xx, yy;
    for (k = 0; k <= 60; k++) {
      xx = x1 + (x2 - x1) * k / 60;
      yy = xx * xx + aa * xx + 1;
      if (yy <= YMAX + 0.02) pts.push(G.X(xx).toFixed(2) + " " + G.Y(yy).toFixed(2));
    }
    if (pts.length > 1) {
      el("path", { d: "M" + pts.join(" L"), fill: "none", stroke: "#2563eb", "stroke-width": 2.2, "stroke-linecap": "round" }, gA);
    }

    /* 顶点：命题翻转就看它有没有落到 x 轴上 */
    var vx = -aa / 2, vy = 1 - aa * aa / 4;
    seg(gA, G.X(vx), G.Y(vy), G.X(vx), oy, "#b8791f", 1, "4 4");
    el("circle", { cx: G.X(vx), cy: G.Y(vy), r: 4, fill: "#b8791f" }, gA);
    tx(gA, G.X(vx) + 7, G.Y(vy) - 6, "顶点", "#b8791f", "start", 8.4, 700);

    if (s.disc >= 0) {
      var q = Math.sqrt(s.disc);
      [-1, 1].forEach(function (t) {
        var rx = (-aa + t * q) / 2;
        if (rx < XMIN - 0.02 || rx > XMAX + 0.02) return;
        el("circle", { cx: G.X(rx), cy: oy, r: 3.4, fill: "#b8402f" }, gA);
      });
    }
    tx(gA, p.x + 20, p.y + p.h - 14, "开口向上：整条在水面上方才恒成立", "#5a6472", "start", wide ? 9.2 : 8.6, 400);

    /* 右栏：把「符号 → 真假」一步步写出来 */
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 20, r.y + 30, "命题真假怎么读", "#5a6472", "start", wide ? 10.5 : 9.4, 700);
    var fs = wide ? 11 : 9.6, lh = wide ? 26 : 24, ry = r.y + (wide ? 64 : 56);
    tx(gB, r.x + 20, ry, "P：∀x∈R，x² + ax + 1 > 0", "#2563eb", "start", fs, 700);
    ry += lh;
    tx(gB, r.x + 20, ry, "a = " + fmt(s.a), "#3a3a35", "start", fs, 400);
    ry += lh;
    tx(gB, r.x + 20, ry, "Δ = a² − 4 = " + s.disc.toFixed(2), "#3a3a35", "start", fs, 400);
    ry += lh;
    tx(gB, r.x + 20, ry, "顶点纵坐标 1 − a²/4 = " + s.vert.toFixed(2), "#3a3a35", "start", fs, 400);

    var bx = r.x + 20, bw = r.w - 40, bh = wide ? 132 : 120;
    var by = r.y + r.h - bh - 22, big, col, bg, why;
    if (Math.abs(s.a) < 2) {
      big = "命题 P 为真"; col = "#2f8a5b"; bg = "#e6f6ee";
      why = "Δ < 0：抛物线与 x 轴无交点，整条在 x 轴上方，∀x∈R 都成立。";
    } else if (Math.abs(s.a) === 2) {
      big = "命题 P 为假"; col = "#b8791f"; bg = "#fdf3e0";
      why = "|a| = 2 时 Δ = 0：顶点正好落在 x 轴上，那一点等于 0，不满足 >0。";
    } else {
      big = "命题 P 为假"; col = "#b8402f"; bg = "#fbeae7";
      why = "Δ > 0：与 x 轴有两个交点，交点之间有 x 使式子 ≤0，反例现成。";
    }
    el("rect", { x: bx, y: by, width: bw, height: bh, rx: 8, fill: bg, stroke: col + "44" }, gB);
    tx(gB, bx + 14, by + 30, big, col, "start", wide ? 13 : 12, 700);
    wrap(gB, bx + 14, by + 54, why, bw - 28, wide ? 9.8 : 9.2, "#3a3a35", 15, 400);
    tx(gB, bx + 14, by + bh - 12, "判据：恒成立 ⇔ Δ < 0 ⇔ 无交点", col, "start", 8.8, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = fmt(s.a);
    $("gxVb").textContent = s.disc.toFixed(1);
    $("gxVc").textContent = s.vert.toFixed(1);
    if (Math.abs(s.a) < 2) { st = "真"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "Δ<0，恒成立"; }
    else if (Math.abs(s.a) === 2) { st = "假"; col = "#b8791f"; bg = "#fdf3e0"; sn = "Δ=0，|a|=2 不满足 >0"; }
    else { st = "假"; col = "#b8402f"; bg = "#fbeae7"; sn = "Δ>0，能揪出反例"; }
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
    loop: [{ t: 0, v: -3 }, { t: 1.2, v: -3 }, { t: 4, v: 0 }, { t: 6.5, v: 0 }, { t: 9, v: 2 }, { t: 11.5, v: 3 }, { t: 13.5, v: -3 }],
    keys: [-3, 0, 2, 3],
    value: A, min: -3, max: 3, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 0, eq: { disc: -4, truth: 1 } },
    { v: 2, eq: { disc: 0, truth: 0 } },
    { v: 3, eq: { disc: 5, truth: 0 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
