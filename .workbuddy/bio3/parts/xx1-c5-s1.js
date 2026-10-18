/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1, G = null, gP = null;

  /* 纯函数：相对浓度 r → 促进率（%）。>0 促进，<0 抑制 */
  function calc(v) {
    var pure = 100 * (2 * v / (1 + v * v)), pen = 15 * Math.max(0, v - 4);
    return { promo: pure - pen, pure: pure, pen: pen };
  }
  function geom() { var l = L.left; return { px: l.x + 46, py: l.y + 74, pw: l.w - 76, ph: l.h - 150 }; }
  function xOf(r) { return G.px + (r - 0.1) / 7.9 * G.pw; }
  function yOf(p) { return G.py + (110 - p) / 155 * G.ph; }
  function T(x, y, s, c, a, f, w) { tx(gP, x, y, s, c, a === "m" ? "middle" : a === "e" ? "end" : "start", f || 9, w || 400); }
  function kOf(v) { return v > 4 ? "#b8402f" : v < 0.9 ? "#b8791f" : "#2f8a5b"; }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), l = L.left, rp = L.right;
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), zy = yOf(0), i, pts = "", st, col, bgc, sn;
    gP = gA;

    /* 左：两重性曲线 */
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    T(l.x + 20, l.y + 28, "两重性曲线：促进率随 r 先升后降", "#5a6472", "s", 10.5, 700);
    el("rect", { x: G.px, y: zy, width: G.pw, height: G.py + G.ph - zy, fill: "#fdf1ee" }, gA);
    for (i = 0; i <= 79; i++) {
      var rr = 0.1 + i * 0.1;
      pts += (i ? " " : "") + xOf(rr).toFixed(1) + "," + yOf(calc(rr).promo).toFixed(1);
    }
    el("polyline", { points: pts, fill: "none", stroke: "#2f8a5b", "stroke-width": 2.4, "stroke-linejoin": "round" }, gA);
    el("line", { x1: G.px, y1: zy, x2: G.px + G.pw, y2: zy, stroke: "#9aa4ae", "stroke-width": 1.2 }, gA);
    el("line", { x1: G.px, y1: G.py - 6, x2: G.px, y2: G.py + G.ph, stroke: "#9aa4ae", "stroke-width": 1.2 }, gA);
    T(l.x + 20, zy - 24, "促进", "#2f8a5b", "s", 9.6, 700);
    T(l.x + 20, zy + 40, "抑制", "#b8402f", "s", 9.6, 700);
    T(G.px - 9, zy + 4, "0", "#5a6472", "e", 9);
    T(G.px + 4, G.py - 12, "促进率（%）", "#5a6472", "s", 9);
    el("line", { x1: xOf(1), y1: zy, x2: xOf(1), y2: yOf(100), stroke: "#b8791f", "stroke-width": 1.2, "stroke-dasharray": "4 3" }, gA);
    T(xOf(1) + 6, yOf(100) - 8, "最适浓度 r=1（峰顶 100%）", "#b8791f", "s", 8.8, 700);
    T(xOf(0.1), zy + 17, "0.1", "#5a6472", "m", 8.8);
    T(xOf(4), zy + 17, "4", "#5a6472", "m", 8.8);
    T(xOf(8), zy + 17, "8", "#5a6472", "e", 8.8);
    T(l.x + 20, G.py + G.ph + 30, "横轴：相对浓度 r（实际浓度 ÷ 最适浓度，0.1–8）", "#5a6472", "s", 9);
    col = kOf(A);
    el("line", { x1: xOf(A), y1: zy, x2: xOf(A), y2: yOf(s.promo), stroke: col, "stroke-width": 1.2, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: xOf(A), cy: yOf(s.promo), r: 5.4, fill: col, stroke: "#ffffff", "stroke-width": 1.6 }, gA);

    /* 右：促进率标尺 */
    gP = gB;
    el("rect", { x: rp.x, y: rp.y, width: rp.w, height: rp.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    T(rp.x + 20, rp.y + 28, "促进率标尺（%）：正促进、负抑制", "#5a6472", "s", 10.5, 700);
    var bx0 = rp.x + 30, bw = rp.w - 60, by = rp.y + 96, bh = 22;
    var xP = function (p) { return bx0 + (p + 40) / 150 * bw; };
    el("line", { x1: bx0, y1: by + bh / 2, x2: bx0 + bw, y2: by + bh / 2, stroke: "#cfd6dd", "stroke-width": 1.4 }, gB);
    el("line", { x1: xP(0), y1: by - 4, x2: xP(0), y2: by + bh + 4, stroke: "#8a929c", "stroke-width": 1.2 }, gB);
    el("rect", { x: Math.min(xP(s.promo), xP(0)), y: by, width: Math.max(1.2, Math.abs(xP(s.promo) - xP(0))), height: bh, rx: 4, fill: s.promo >= 0 ? "#2f8a5b" : "#b8402f" }, gB);
    T(xP(0), by + bh + 18, "0", "#5a6472", "m", 8.8);
    T(xP(100), by + bh + 18, "100", "#5a6472", "e", 8.8);
    T(rp.x + 20, rp.y + 166, "促进项 100·2r/(1+r²)", "#5a6472", "s", 9.2);
    T(rp.x + rp.w - 20, rp.y + 166, s.pure.toFixed(1), "#2f8a5b", "e", 9.2, 700);
    T(rp.x + 20, rp.y + 188, "抑制项 15·max(0, r−4)", "#5a6472", "s", 9.2);
    T(rp.x + rp.w - 20, rp.y + 188, s.pen > 0 ? "−" + s.pen.toFixed(1) : "0.0", "#b8402f", "e", 9.2, 700);
    T(rp.x + 20, rp.y + 212, "净促进率 = 促进项 − 抑制项", "#3a3a35", "s", 9.4, 700);
    T(rp.x + rp.w - 20, rp.y + 212, s.promo.toFixed(1), s.promo >= 0 ? "#2f8a5b" : "#b8402f", "e", 9.4, 700);

    if (A > 4) { st = "浓度过高·抑制"; col = "#b8402f"; bgc = "#fbeae7"; sn = "促进率为负，作用已翻转"; }
    else if (A >= 0.9 && A <= 1.15) { st = "最适浓度"; col = "#2f8a5b"; bgc = "#e6f6ee"; sn = "峰顶：促进作用最大 100%"; }
    else if (A < 0.9) { st = "浓度偏低"; col = "#b8791f"; bgc = "#fdf3e0"; sn = "促进作用不足，还没到峰顶"; }
    else { st = "促进减弱"; col = "#b8791f"; bgc = "#fdf3e0"; sn = "已过峰顶，仍在促进"; }
    var sy = rp.y + 240;
    el("rect", { x: rp.x + 20, y: sy, width: rp.w - 40, height: 96, rx: 8, fill: bgc, stroke: col + "44" }, gB);
    T(rp.x + 36, sy + 32, st, col, "s", 13, 700);
    T(rp.x + 36, sy + 56, sn, "#5a6472", "s", 9);
    T(rp.x + 36, sy + 78, A > 4 ? "越过高浓度区，表现为抑制" : "仍在促进区间内", "#6b7480", "s", 8.8);

    $("gxVa").textContent = A.toFixed(1);
    $("gxVb").textContent = s.promo.toFixed(1);
    $("gxVc").textContent = s.pen > 0 ? "−" + s.pen.toFixed(1) : "0.0";
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bgc;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
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
    loop: [{ t: 0, v: 0.1 }, { t: 1.2, v: 0.1 }, { t: 4, v: 1 }, { t: 6.5, v: 1 }, { t: 9, v: 8 }, { t: 11, v: 5 }, { t: 13, v: 0.1 }],
    keys: [0.1, 1, 5, 8],
    value: A, min: 0.1, max: 8, step: 0.1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = window.__bio = { calc: calc, cases: [
    { v: 0.1, eq: { promo: 19.8 } },
    { v: 1, eq: { promo: 100 } },
    { v: 8, eq: { promo: -35.4 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
