/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0.5, G = null;

  function num(x) {
    if (!isFinite(x)) return "—";
    if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
    if (Math.abs(x) >= 10) return x.toFixed(1);
    return String(Math.round(x * 1000) / 1000);
  }

  /* 纯函数：公比 q → 第 6 项、前 6 项和、能否用求和公式。render() 和 __model.cases 都用它 */
  function calc(q) {
    var a1 = 1, eq1 = Math.abs(q - 1) < 1e-9;
    var a6 = Math.pow(q, 5);
    var s6 = eq1 ? 6 * a1 : a1 * (1 - Math.pow(q, 6)) / (1 - q);
    var terms = [], i;
    for (i = 0; i < 6; i++) terms.push(a1 * Math.pow(q, i));
    return { q: q, a1: a1, a6: a6, s6: s6, ok: eq1 ? 0 : 1, terms: terms };
  }

  function geom() {
    var wide = L === W;
    return {
      wide: wide,
      plot: wide
        ? { x: L.left.x + 56, y: L.left.y + 52, w: L.left.w - 84, h: L.left.h - 118 }
        : { x: L.left.x + 50, y: L.left.y + 46, w: L.left.w - 72, h: L.left.h - 98 },
      rc: { x: L.right.x + (wide ? 22 : 16), y0: L.right.y + 32, w: L.right.w - (wide ? 44 : 32) }
    };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw() {
    var s = calc(A), i;
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, L.left.x + 20, L.left.y + 30, "点列 aₙ：n=1…6，首项 a₁=1", "#5a6472", "start", 10.5, 700);
    tx(gB, L.right.x + 20, L.right.y + 30, "S₆ 的构成与公式状态", "#5a6472", "start", 10.5, 700);

    var P = G.plot, yMax = Math.max(s.a6, 1) * 1.1;
    function Y(v) { return P.y + P.h - (v / yMax) * P.h; }

    el("line", { x1: P.x, y1: P.y, x2: P.x, y2: P.y + P.h, stroke: "#94a3b8", "stroke-width": 1.2 }, gA);
    el("polygon", { points: P.x + "," + (P.y - 9) + " " + (P.x - 4) + "," + (P.y + 1) + " " + (P.x + 4) + "," + (P.y + 1), fill: "#94a3b8" }, gA);
    el("line", { x1: P.x, y1: P.y + P.h, x2: P.x + P.w, y2: P.y + P.h, stroke: "#94a3b8", "stroke-width": 1.2 }, gA);
    el("polygon", { points: (P.x + P.w + 9) + "," + (P.y + P.h) + " " + (P.x + P.w) + "," + (P.y + P.h - 4) + " " + (P.x + P.w) + "," + (P.y + P.h + 4), fill: "#94a3b8" }, gA);
    tx(gA, P.x - 6, P.y - 12, "aₙ", "#5a6472", "start", 9.4, 400);

    var ticks = [0, yMax / 2, yMax];
    for (i = 0; i < 3; i++) {
      var ty = Y(ticks[i]);
      el("line", { x1: P.x - 4, y1: ty, x2: P.x, y2: ty, stroke: "#c3cdd8" }, gA);
      tx(gA, P.x - 8, ty + 3, num(ticks[i]), "#8a94a3", "end", 8.4, 400);
    }

    var xs = [];
    for (i = 0; i < 6; i++) {
      var xN = P.x + 16 + i * (P.w - 32) / 5;
      xs.push(xN);
      el("line", { x1: xN, y1: P.y + P.h, x2: xN, y2: P.y + P.h + 4, stroke: "#c3cdd8" }, gA);
      tx(gA, xN, P.y + P.h + 15, String(i + 1), "#8a94a3", "middle", 8.4, 400);
    }
    tx(gA, P.x + P.w, P.y + P.h + 30, "n", "#5a6472", "end", 9.4, 400);

    el("line", { x1: P.x, y1: Y(1), x2: P.x + P.w, y2: Y(1), stroke: "#8a94a3", "stroke-width": 1, "stroke-dasharray": "4 4" }, gA);
    tx(gA, P.x + P.w - 2, Y(1) - 6, "a₁=1", "#8a94a3", "end", 8.8, 400);

    var pts = [];
    for (i = 0; i < 6; i++) pts.push(xs[i] + "," + Y(s.terms[i]).toFixed(1));
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#2563eb", "stroke-width": 2 }, gA);
    for (i = 0; i < 6; i++) el("circle", { cx: xs[i], cy: Y(s.terms[i]), r: 3.2, fill: "#2563eb" }, gA);

    tx(gA, xs[5], Y(s.terms[5]) - 10, "a₆=" + num(s.a6), "#b8402f", "middle", 9, 700);

    /* 右半：6 项拼成 S₆ 的堆叠条 + 公式状态 */
    var R = G.rc, sx = R.x, sy = R.y0 + 30, sw = R.w, sh = 26, acc = 0;
    var cols = ["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"];
    var total = Math.max(s.s6, 1e-9);
    for (i = 0; i < 6; i++) {
      var wSeg = sw * s.terms[i] / total;
      el("rect", { x: sx + acc, y: sy, width: Math.max(wSeg, 0.6), height: sh, fill: cols[i], stroke: "#ffffff", "stroke-width": 0.8 }, gB);
      acc += wSeg;
    }
    tx(gB, R.x, sy + sh + 16, "S₆ = a₁+a₂+…+a₆ = " + num(s.s6), "#151a21", "start", 10, 700);

    var fy = sy + sh + 34;
    if (s.ok) {
      el("rect", { x: R.x - 4, y: fy, width: R.w + 8, height: 46, rx: 6, fill: "#eef6f1", stroke: "#b8e6d0" }, gB);
      tx(gB, R.x, fy + 18, "q≠1：S₆=(1−q⁶)/(1−q)", "#2f6b4c", "start", 9.6, 700);
      tx(gB, R.x, fy + 34, "分母 1−q≠0，公式可以用", "#2f6b4c", "start", 9.2, 400);
    } else {
      el("rect", { x: R.x - 4, y: fy, width: R.w + 8, height: 46, rx: 6, fill: "#fbeae7", stroke: "#e0b3ab" }, gB);
      tx(gB, R.x, fy + 18, "q=1：1−q=0 ⇒ 公式失效", "#b8402f", "start", 9.6, 700);
      tx(gB, R.x, fy + 34, "常数列：S₆=6a₁=6", "#b8402f", "start", 9.2, 400);
    }
    var msg = s.ok
      ? (A > 1 ? "q>1：点列越往后越陡，第 6 项已明显大于首项。" : "0<q<1：点列逐项衰减，贴着 x 轴趋近 0。")
      : "q=1：每项都等于 a₁，点列是水平直线；求和必须改用 S₆=6a₁。";
    wrap(gB, R.x, fy + 66, msg, R.w, 9.4, "#3a3a35", 15);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A.toFixed(1);
    $("gxVb").textContent = num(s.a6);
    $("gxVc").textContent = num(s.s6);
    if (s.ok === 0) { st = "不能用"; col = "#b8402f"; bg = "#fbeae7"; sn = "q=1 常数列，S₆=6a₁"; }
    else if (A > 1) { st = "能用"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "q>1，递增"; }
    else { st = "能用"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "0<q<1，递减"; }
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
    loop: [{ t: 0, v: 0.5 }, { t: 1.2, v: 0.5 }, { t: 4, v: 1 }, { t: 6.5, v: 1 }, { t: 9, v: 2 }, { t: 11.5, v: 1.5 }, { t: 13.5, v: 0.5 }],
    keys: [0.5, 1, 1.5, 2],
    value: A, min: 0.5, max: 2, step: 0.1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { a6: 1, s6: 6, ok: 0 } },
    { v: 2, eq: { a6: 32, s6: 63 } },
    { v: 0.5, eq: { a6: 0.03125, s6: 1.96875 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
