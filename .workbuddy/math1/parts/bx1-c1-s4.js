/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = -3;

  /* 纯函数：端点 a → 两个方向的真假 + 条件编号 */
  function calc(v) {
    var a = Math.round(v);
    return { a: a, pq: a >= 0, qp: a <= 0, kind: a < 0 ? 2 : a === 0 ? 3 : 1 };
  }
  function geom() {
    var p = 40, x0 = L.left.x + p, x1 = L.left.x + L.left.w - p;
    return { x0: x0, x1: x1, u: (x1 - x0) / 8, cy: L.left.y + L.left.h * 0.58 };
  }
  function X(v) { return G.x0 + (v + 4) * G.u; }
  function fmt(a) { return a < 0 ? "−" + Math.abs(a) : String(a); }
  function yes(b) { return b ? "成立" : "不成立"; }

  function drawLeft(s) {
    var g = $("gxA"), x0 = G.x0, x1 = G.x1, c = G.cy, i, x, rel, names = { 1: "p ⊂ q：p 的范围被 q 套住", 2: "q ⊂ p：q 的范围被 p 套住", 3: "p 与 q 两个范围完全重合" };
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, g);
    tx(g, L.left.x + 18, L.left.y + 28, "数轴：p：x≥a　q：x≥0", "#5a6472", "start", 10.5, 700);
    el("rect", { x: X(s.a), y: c - 36, width: Math.max(4, x1 - X(s.a)), height: 8, rx: 4, fill: "#2563eb", opacity: 0.85 }, g);
    el("rect", { x: X(0), y: c - 18, width: Math.max(4, x1 - X(0)), height: 8, rx: 4, fill: "#2f8a5b", opacity: 0.85 }, g);
    tx(g, x0 - 10, c - 29, "p", "#2563eb", "end", 9.4, 700);
    tx(g, x0 - 10, c - 11, "q", "#2f8a5b", "end", 9.4, 700);
    el("line", { x1: x0 - 22, y1: c, x2: x1 + 20, y2: c, stroke: "#9aa6b2", "stroke-width": 1.2 }, g);
    el("polygon", { points: (x1 + 28) + "," + c + " " + (x1 + 16) + "," + (c - 5) + " " + (x1 + 16) + "," + (c + 5), fill: "#9aa6b2" }, g);
    for (i = -4; i <= 4; i++) {
      x = X(i);
      el("line", { x1: x, y1: c - 3, x2: x, y2: c + 3, stroke: "#b6c0cb", "stroke-width": 1 }, g);
      tx(g, x, c + 17, fmt(i), "#8d97a3", "middle", 8.4, 400);
    }
    el("line", { x1: X(s.a), y1: c - 40, x2: X(s.a), y2: c + 8, stroke: "#b8791f", "stroke-width": 1.2, "stroke-dasharray": "4 3" }, g);
    el("circle", { cx: X(s.a), cy: c, r: 4, fill: "#2563eb" }, g);
    el("circle", { cx: X(0), cy: c, r: 4, fill: "#2f8a5b" }, g);
    tx(g, X(s.a), c + 34, "a", "#b8791f", "middle", 9.4, 700);
    tx(g, X(0), c + 34, "0", "#2f8a5b", "middle", 9.4, 700);
    rel = names[s.kind];
    tx(g, L.left.x + 18, c + 62, "包含关系：" + rel, "#151a21", "start", 9.6, 700);
    tx(g, L.left.x + 18, c + 82, "p⇒q " + yes(s.pq) + "　　q⇒p " + yes(s.qp), "#3a3a35", "start", 9.6, 400);
  }

  function drawRight(s) {
    var g = $("gxB"), rx = L.right.x, rw = L.right.w, ry = L.right.y + 48, rh = 66, gap = 14, wb = rw - 32, bx = rx + 16;
    var name = s.kind === 1 ? "充分不必要" : s.kind === 2 ? "必要不充分" : "充要";
    var col = s.kind === 1 ? "#2f8a5b" : s.kind === 2 ? "#b8791f" : "#2563eb";
    var sub = s.kind === 1 ? "p 的范围小，小范围推大范围" : s.kind === 2 ? "p 的范围大，只能被 q 推出" : "两范围重合，两个方向都成立";
    var cy2 = ry + 2 * (rh + gap) + 4, ch = 96;
    var row = function (y, lab, val, ok, reason) {
      el("rect", { x: bx, y: y, width: wb, height: rh, rx: 8, fill: ok ? "#f2fbf6" : "#fdf5f3", stroke: ok ? "#c8e9d8" : "#eed3cd" }, g);
      tx(g, bx + 14, y + 25, lab, "#3a3a35", "start", 9.8, 700);
      tx(g, bx + wb - 14, y + 25, val, ok ? "#2f8a5b" : "#b8402f", "end", 11.5, 700);
      tx(g, bx + 14, y + 47, reason, "#5a6472", "start", 8.8, 400);
    };
    el("rect", { x: rx, y: L.right.y, width: rw, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, g);
    tx(g, rx + 18, L.right.y + 28, "成绩单：两个方向各验一次", "#5a6472", "start", 10.5, 700);
    row(ry, "① p⇒q　p 真时 q 必真？", yes(s.pq), s.pq, s.pq ? "p 的范围落在 q 里，任取都成立" : "取 x=a/2：满足 p 却不满足 q");
    row(ry + rh + gap, "② q⇒p　q 真时 p 必真？", yes(s.qp), s.qp, s.qp ? "q 的范围落在 p 里，任取都成立" : "取 x=0：满足 q 却不满足 p");
    el("rect", { x: bx, y: cy2, width: wb, height: ch, rx: 8, fill: col + "12", stroke: col + "55" }, g);
    tx(g, bx + wb / 2, cy2 + 32, "p 是 q 的" + name + "条件", col, "middle", 13, 700);
    tx(g, bx + 16, cy2 + 58, sub, "#5a6472", "start", 9, 400);
    tx(g, bx, cy2 + ch + 30, "一格定充分、一格定必要，两格都通才叫充要。", "#5a6472", "start", 9.4, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = fmt(s.a);
    $("gxVb").textContent = yes(s.pq);
    $("gxVb").style.color = s.pq ? "#2f8a5b" : "#b8402f";
    $("gxVc").textContent = yes(s.qp);
    $("gxVc").style.color = s.qp ? "#2f8a5b" : "#b8402f";
    if (s.kind === 1) { st = "充分不必要"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "a>0：p 的范围更小"; }
    else if (s.kind === 2) { st = "必要不充分"; col = "#b8791f"; bg = "#fdf3e0"; sn = "a<0：p 的范围更大"; }
    else { st = "充要"; col = "#2563eb"; bg = "#eaf1ff"; sn = "a=0：两个范围重合"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    $("gxA").textContent = ""; $("gxB").textContent = "";
    drawLeft(s); drawRight(s);
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

  /* 停留帧：0→1.2s 与 6.5→9s 各停一拍，充要那一格在 a=0 停两拍 */
  var ap = AutoPilot.create({
    mount: stage,
    follow: $("gxSl"),
    loop: [{ t: 0, v: -3 }, { t: 1.2, v: -3 }, { t: 4, v: 0 }, { t: 6.5, v: 0 }, { t: 9, v: 3 }, { t: 11.5, v: 0 }, { t: 13.5, v: -3 }],
    keys: [-3, 0, 3],
    value: A, min: -3, max: 3, step: 1,
    idle: 5000,
    onChange: function (v) { A = Math.round(v); render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: -2, eq: { kind: 2 } },
    { v: 0, eq: { kind: 3 } },
    { v: 2, eq: { kind: 1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
