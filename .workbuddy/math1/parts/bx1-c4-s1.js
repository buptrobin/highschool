/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = -3, G = null;

  /* 纯函数：指数 x → 2^x、2^(−x)、乘积。render() 和 __model.cases 都用它 */
  function calc(v) {
    var pw = Math.pow(2, v), inv = Math.pow(2, -v);
    return { pw: pw, inv: inv, prod: pw * inv };
  }

  function fmt(v) { return v === 0 ? "0" : String(Math.round(v * 10) / 10); }
  function fmt3(v) { return v.toFixed(3); }

  /* 坐标系：x ∈ [−3.5, 3.5]，y ∈ [0, 8.6]，坐标轴带箭头与刻度 */
  function geom() {
    var l = L.left;
    var px0 = l.x + 44, px1 = l.x + l.w - 20;
    var py0 = l.y + 52, py1 = l.y + l.h - 44;
    return {
      px0: px0, px1: px1, py0: py0, py1: py1,
      X: function (v) { return px0 + (v + 3.5) / 7 * (px1 - px0); },
      Y: function (v) { return py1 - v / 8.6 * (py1 - py0); }
    };
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var l = L.left, r = L.right;

    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 16, l.y + 24, "曲线 y=2^x（蓝）与 y=2^(−x)（绿）", "#5a6472", "start", 10.2, 700);

    /* 坐标轴 + 箭头 */
    el("line", { x1: G.px0, y1: G.py1, x2: G.px1 + 12, y2: G.py1, stroke: "#8a94a3", "stroke-width": 1.3 }, gA);
    el("polygon", { points: (G.px1 + 12) + "," + G.py1 + " " + (G.px1 + 3) + "," + (G.py1 - 4) + " " + (G.px1 + 3) + "," + (G.py1 + 4), fill: "#8a94a3" }, gA);
    el("line", { x1: G.px0, y1: G.py1, x2: G.px0, y2: G.py0 - 12, stroke: "#8a94a3", "stroke-width": 1.3 }, gA);
    el("polygon", { points: G.px0 + "," + (G.py0 - 12) + " " + (G.px0 - 4) + "," + (G.py0 - 3) + " " + (G.px0 + 4) + "," + (G.py0 - 3), fill: "#8a94a3" }, gA);
    tx(gA, G.px1 + 8, G.py1 + 16, "x", "#5a6472", "start", 10, 700);
    tx(gA, G.px0 + 8, G.py0 - 14, "y", "#5a6472", "start", 10, 700);

    /* x 轴刻度 −3…3，y 轴刻度 1,2,4,6,8 */
    var k, xp, yp;
    for (k = -3; k <= 3; k++) {
      xp = G.X(k);
      el("line", { x1: xp, y1: G.py1, x2: xp, y2: G.py1 + 4, stroke: "#8a94a3" }, gA);
      tx(gA, xp, G.py1 + 15, String(k), "#7b8494", "middle", 8.6, 400);
    }
    var yt = [1, 2, 4, 6, 8];
    for (k = 0; k < yt.length; k++) {
      yp = G.Y(yt[k]);
      el("line", { x1: G.px0 - 4, y1: yp, x2: G.px0, y2: yp, stroke: "#8a94a3" }, gA);
      tx(gA, G.px0 - 8, yp + 3, String(yt[k]), "#7b8494", "end", 8.6, 400);
    }

    /* y = 2^x 实线 */
    var d = "", first = true, xx, yy;
    for (xx = -3.4; xx <= 3.04; xx += 0.06) {
      yy = Math.pow(2, xx);
      if (yy > 8.5) break;
      d += (first ? "M" : "L") + G.X(xx).toFixed(1) + " " + G.Y(yy).toFixed(1) + " ";
      first = false;
    }
    el("path", { d: d, fill: "none", stroke: "#2563eb", "stroke-width": 1.8 }, gA);

    /* y = 2^(−x) 虚线 */
    var d2 = "", first2 = true, yy2;
    for (xx = -3.04; xx <= 3.4; xx += 0.06) {
      yy2 = Math.pow(2, -xx);
      if (yy2 > 8.5) break;
      d2 += (first2 ? "M" : "L") + G.X(xx).toFixed(1) + " " + G.Y(yy2).toFixed(1) + " ";
      first2 = false;
    }
    el("path", { d: d2, fill: "none", stroke: "#2f8a5b", "stroke-width": 1.5, "stroke-dasharray": "5 4" }, gA);

    /* 当前 x 上的两个点：2^x 与 2^(−x) 互为倒数 */
    var pxx = G.X(A), py1v = G.Y(Math.pow(2, A)), py2v = G.Y(Math.pow(2, -A));
    el("line", { x1: pxx, y1: G.py1, x2: pxx, y2: Math.min(py1v, py2v), stroke: "#dbe7ef", "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: pxx, cy: py1v, r: 4.5, fill: "#2563eb" }, gA);
    el("circle", { cx: pxx, cy: py2v, r: 4.5, fill: "#2f8a5b" }, gA);
    var anchor = A > 1.8 ? "end" : "start", dx = A > 1.8 ? -8 : 8;
    tx(gA, pxx + dx, py1v - 7, "2^x", "#2563eb", anchor, 9, 700);
    tx(gA, pxx + dx, py2v + 13, "2^(−x)", "#2f8a5b", anchor, 9, 700);
    tx(gA, pxx, G.py1 + 30, "x=" + fmt(A), "#b8791f", "middle", 9, 700);

    /* 右面板：两条对数刻度条 + 乘积恒为 1 */
    var s = calc(A);
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 18, r.y + 26, "同一个 x，两个互为倒数的幂", "#5a6472", "start", 10.5, 700);
    var bx = r.x + 20, bw = r.w - 40;
    var rows = [
      { t: "2^x", v: s.pw, c: "#2563eb", y: r.y + 64 },
      { t: "2^(−x)", v: s.inv, c: "#2f8a5b", y: r.y + 132 }
    ];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      tx(gB, bx, row.y, row.t, row.c, "start", 10.5, 700);
      tx(gB, r.x + r.w - 20, row.y, fmt3(row.v), "#151a21", "end", 11.5, 700);
      var t = (Math.log2(row.v) + 3.5) / 7;
      t = Math.max(0.015, Math.min(1, t));
      el("rect", { x: bx, y: row.y + 8, width: bw, height: 8, rx: 4, fill: "#eef2f6" }, gB);
      el("rect", { x: bx, y: row.y + 8, width: Math.max(4, bw * t), height: 8, rx: 4, fill: row.c }, gB);
    }
    el("rect", { x: bx, y: r.y + 176, width: bw, height: 52, rx: 8, fill: "#e6f6ee", stroke: "#b8e6d0" }, gB);
    tx(gB, bx + bw / 2, r.y + 198, "2^x · 2^(−x) = 1", "#2f8a5b", "middle", 13, 700);
    tx(gB, bx + bw / 2, r.y + 216, "同底数幂相乘，指数相加得 0", "#3a3a35", "middle", 8.8, 400);
    tx(gB, bx, r.y + 254, "x=0 时两者都等于 1，是分界线", "#5a6472", "start", 9, 400);
    tx(gB, bx, r.y + 274, "x>0：2^x>1；x<0：0<2^x<1", "#5a6472", "start", 9, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = fmt(A);
    $("gxVb").textContent = fmt3(s.pw);
    $("gxVc").textContent = fmt3(s.inv);
    if (A > 0) { st = "2^x>1"; col = "#2563eb"; bg = "#e8f0fd"; sn = "x>0，指数为正，幂大于 1"; }
    else if (A === 0) { st = "2^x=1"; col = "#b8791f"; bg = "#fdf3e0"; sn = "两侧互为倒数，乘积恒为 1"; }
    else { st = "0<2^x<1"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "x<0，负指数是倒数，幂小于 1"; }
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
    G = geom();
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
    loop: [{ t: 0, v: -3 }, { t: 1.2, v: -3 }, { t: 4, v: 0 }, { t: 6.5, v: 0 }, { t: 9, v: 1.5 }, { t: 11.5, v: 3 }, { t: 13.5, v: -3 }],
    keys: [-3, 0, 1.5, 3],
    value: A, min: -3, max: 3, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: -1, eq: { pw: 0.5, inv: 2 } },
    { v: 0, eq: { pw: 1, inv: 1 } },
    { v: 3, eq: { pw: 8, inv: 0.125 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
