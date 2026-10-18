/* 生态足迹互动 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 3.4, CAP = 1.7;
  function calc(v) { return { earth: v / CAP, deficit: v > CAP ? 1 : 0, gap: v - CAP }; }
  function geom() {
    var n = L === N;
    return {
      r: n ? 24 : 40, step: n ? 64 : 100, cy: L.left.y + (n ? 150 : 230),
      bh: n ? 20 : 28, bx: L.right.x + 22, bw: L.right.w - 44,
      lab1: L.right.y + (n ? 58 : 70), bar1: L.right.y + (n ? 66 : 80),
      lab2: L.right.y + (n ? 110 : 160), bar2: L.right.y + (n ? 118 : 170),
      axis: L.right.y + (n ? 158 : 224)
    };
  }
  function draw(col) {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), i, fr, cx;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 18, L.left.y + 28, "需要几个地球 = f ÷ 1.7", "#5a6472", "start", 10.5, 700);
    tx(gA, L.left.x + 18, L.left.y + 70, s.earth.toFixed(1), col, "start", 30, 700);
    tx(gA, L.left.x + 108, L.left.y + 70, "个地球", "#5a6472", "start", 11, 400);
    var x0 = L.left.x + (L.left.w - (3 * G.step + 2 * G.r)) / 2 + G.r;
    for (i = 0; i < 4; i++) {
      cx = x0 + i * G.step; fr = s.earth - i;
      if (fr < 0) fr = 0;
      if (fr > 1) fr = 1;
      el("circle", {
        cx: cx, cy: G.cy, r: G.r,
        fill: fr >= 1 ? col : fr > 0 ? "#f6f8fa" : "#eef3f7",
        "fill-opacity": fr >= 1 ? 0.42 : 1,
        stroke: fr > 0 ? col : "#c9d4de", "stroke-width": fr > 0 ? 1.6 : 1
      }, gA);
      el("ellipse", { cx: cx, cy: G.cy, rx: G.r * 0.34, ry: G.r * 0.54, fill: fr >= 1 ? "#fff" : "#dde4ea" }, gA);
      tx(gA, cx, G.cy + G.r + 20, fr >= 1 ? "已用满" : fr > 0 ? "用了一部分" : "未用到", fr > 0 ? col : "#8a93a0", "middle", 8.8, fr > 0 ? 700 : 400);
    }
    tx(gA, L.left.x + 18, G.cy + G.r + 52, s.deficit ? "第 1 个地球是全球供给，超出即生态赤字。" : "f ≤ 1.7：用到 1 个地球的一部分，属盈余。", "#3a3a35", "start", 9.4, 400);
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#fff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 18, L.right.y + 28, "足迹与承载力", "#5a6472", "start", 10.5, 700);
    tx(gB, G.bx, G.lab1, "f = " + A.toFixed(1), "#b8402f", "start", 9.6, 700);
    el("rect", { x: G.bx, y: G.bar1, width: G.bw, height: G.bh, rx: 4, fill: "#f6ece9" }, gB);
    el("rect", { x: G.bx, y: G.bar1, width: (A / 6) * G.bw, height: G.bh, rx: 4, fill: "#e8a99c", stroke: "#c9786a" }, gB);
    tx(gB, G.bx, G.lab2, "承载力 1.7", "#2f8a5b", "start", 9.6, 700);
    el("rect", { x: G.bx, y: G.bar2, width: (CAP / 6) * G.bw, height: G.bh, rx: 4, fill: "#a9d9c1", stroke: "#7cbfa1" }, gB);
    var eX = G.bx + (CAP / 6) * G.bw;
    el("line", { x1: eX, y1: G.bar1 - 12, x2: eX, y2: G.axis, stroke: "#2f8a5b", "stroke-dasharray": "4 3" }, gB);
    el("line", { x1: G.bx, y1: G.axis, x2: G.bx + G.bw, y2: G.axis, stroke: "#c9d4de" }, gB);
    tx(gB, G.bx, G.axis + 16, "0", "#8a93a0", "start", 8.6, 400);
    tx(gB, eX, G.axis + 16, "1.7", "#2f8a5b", "middle", 8.6, 700);
    tx(gB, G.bx + G.bw, G.axis + 16, "6.0", "#8a93a0", "end", 8.6, 400);
    tx(gB, G.bx, G.axis + 46, "赤字差额 f − 1.7 = " + Math.max(0, s.gap).toFixed(1), "#151a21", "start", 9.4, 700);
    var cy2 = G.axis + 92;
    el("rect", { x: G.bx, y: cy2, width: G.bw, height: 88, rx: 8, fill: "#f8fbfd", stroke: "#dbe7ef" }, gB);
    tx(gB, G.bx + 12, cy2 + 22, "判据：f ≤ 1.7 → 无赤字", "#2f8a5b", "start", 9.2, 700);
    tx(gB, G.bx + 12, cy2 + 44, "f > 1.7 → 生态赤字", "#b8791f", "start", 9.2, 700);
    tx(gB, G.bx + 12, cy2 + 66, "足迹超过承载力即生态赤字，不是排放量", "#5a6472", "start", 8.8, 400);
  }
  function render() {
    if (!G) {
      L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
      stage.setAttribute("viewBox", L.vb);
      G = geom();
    }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A.toFixed(1);
    $("gxVb").textContent = s.earth.toFixed(1);
    $("gxVc").textContent = Math.max(0, s.gap).toFixed(1);
    if (A <= CAP + 0.001) { st = "在承载力之内"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "f ≤ 1.7，无赤字"; }
    else if (A <= 3.4 + 0.001) { st = "已生态赤字"; col = "#b8791f"; bg = "#fdf3e0"; sn = "1–2 个地球"; }
    else { st = "超过 2 个地球"; col = "#b8402f"; bg = "#fbeae7"; sn = "赤字在扩大"; }
    $("gxVs").textContent = st; $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw(col);
  }
  function layout() { G = null; render(); }
  var apBadge = $("gxAp"), apTxt = $("gxApTxt");
  function setMode(m) {
    if (!apBadge) return;
    apBadge.classList.toggle("is-auto", m === "auto");
    apBadge.classList.toggle("is-manual", m !== "auto");
    if (apTxt) apTxt.textContent = m === "auto" ? "自动演示中" : "你接管了";
  }
  var ap = AutoPilot.create({
    mount: stage, follow: $("gxSl"),
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 3.4 }, { t: 6.5, v: 3.4 }, { t: 9, v: 6 }, { t: 11, v: 5.1 }, { t: 13, v: 1 }],
    keys: [1, 1.7, 3.4, 6], value: A, min: 1, max: 6, step: 0.1, idle: 5000,
    onChange: function (v) { A = v; render(); }, onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1.7, eq: { earth: 1 } },
    { v: 3.4, eq: { earth: 2 } },
    { v: 5.1, eq: { earth: 3 } }
  ] };
  window.__model = window.__bio;
  var tmr;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
