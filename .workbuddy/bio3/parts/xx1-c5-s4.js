/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 14;

  /* 纯函数：每日日照时数 h → 开花指数。render() 和 __bio.cases 都用它 */
  function fld(h) { return Math.max(0, Math.min(100, (h - 11) / 6 * 100)); }
  function calc(v) { var ld = fld(v); return { ld: ld, sd: 100 - ld }; }

  /* 由 L 推出来的绘图坐标，缓存进 G */
  function geom() {
    var l = L.left, r = L.right;
    return {
      bx: l.x + 18, by: l.y + 88, bw: l.w - 36, bh: 40,
      px: r.x + 40, py: r.y + 52, pw: r.w - 68, ph: r.h - 104
    };
  }
  function xh(h) { return G.px + (h - 8) / 8 * G.pw; }
  function yv(v) { return G.py + G.ph - v / 100 * G.ph; }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), u = calc(A), l = L.left, r = L.right, i, h, ld, p1 = "", p2 = "";
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);

    /* 左：24 小时日照条，深色为黑夜 */
    tx(gA, l.x + 18, l.y + 28, "24 小时日照条（深色为黑夜）", "#5a6472", "start", 10.5, 700);
    tx(gA, l.x + 18, l.y + 52, "日照 " + A.toFixed(1) + " h ＋ 黑夜 " + (24 - A).toFixed(1) + " h", "#2b4a72", "start", 10, 700);
    var dw = G.bw * A / 24;
    el("rect", { x: G.bx, y: G.by, width: G.bw, height: G.bh, rx: 4, fill: "#ffe89a", stroke: "#e8d18a" }, gA);
    el("rect", { x: G.bx + dw, y: G.by, width: Math.max(0, G.bw - dw), height: G.bh, fill: "#2b3a4a" }, gA);
    if (dw > 44) tx(gA, G.bx + dw / 2, G.by + 25, "昼", "#7a5c0c", "middle", 11, 700);
    if (G.bw - dw > 44) tx(gA, G.bx + dw + (G.bw - dw) / 2, G.by + 25, "夜", "#e8eef5", "middle", 11, 700);
    for (i = 0; i <= 4; i++) {
      var tv = i * 6, txx = G.bx + G.bw * tv / 24;
      el("line", { x1: txx, y1: G.by + G.bh, x2: txx, y2: G.by + G.bh + 5, stroke: "#c9d2da" }, gA);
      tx(gA, txx, G.by + G.bh + 17, tv + " h", "#8a939f", tv === 0 ? "start" : (tv === 24 ? "end" : "middle"), 8.6, 400);
    }
    var cx = G.bx + G.bw * 14 / 24;
    el("line", { x1: cx, y1: G.by - 6, x2: cx, y2: G.by + G.bh + 6, stroke: "#b8402f", "stroke-dasharray": "4 3", "stroke-width": 1.2 }, gA);
    tx(gA, cx, G.by + G.bh + 33, "临界附近 14 h", "#b8402f", "middle", 8.6, 700);
    tx(gA, l.x + 18, l.y + 196, "光的两层作用（本节主线）", "#5a6472", "start", 10, 700);
    tx(gA, l.x + 18, l.y + 216, "① 能量：光合作用把光能变成化学能", "#3a3a35", "start", 9.4, 400);
    tx(gA, l.x + 18, l.y + 234, "② 信号：光敏色素量日照 → 开花", "#3a3a35", "start", 9.4, 400);
    tx(gA, l.x + 18, l.y + 262, "短日照植物要在短于临界日长时开花", "#7a3f6b", "start", 9.2, 400);

    /* 右：两条开花指数曲线，交点在 14 h */
    tx(gB, r.x + 20, r.y + 30, "开花指数（0–100）", "#5a6472", "start", 10.5, 700);
    el("line", { x1: G.px, y1: G.py, x2: G.px, y2: G.py + G.ph, stroke: "#c9d2da" }, gB);
    el("line", { x1: G.px, y1: G.py + G.ph, x2: G.px + G.pw, y2: G.py + G.ph, stroke: "#c9d2da" }, gB);
    el("line", { x1: G.px, y1: yv(50), x2: G.px + G.pw, y2: yv(50), stroke: "#eef1f4", "stroke-dasharray": "4 4" }, gB);
    tx(gB, G.px - 6, yv(100) + 4, "100", "#8a939f", "end", 8.2, 400);
    tx(gB, G.px - 6, yv(50) + 4, "50", "#8a939f", "end", 8.2, 400);
    tx(gB, G.px - 6, yv(0) + 8, "0", "#8a939f", "end", 8.2, 400);
    for (i = 0; i <= 4; i++) {
      var lv = 8 + i * 2;
      tx(gB, xh(lv), G.py + G.ph + 16, lv + " h", lv === 14 ? "#b8402f" : "#8a939f", "middle", 8.2, lv === 14 ? 700 : 400);
    }
    for (h = 8; h <= 16.001; h += 0.5) {
      ld = calc(h).ld;
      p1 += xh(h).toFixed(1) + "," + yv(ld).toFixed(1) + " ";
      p2 += xh(h).toFixed(1) + "," + yv(100 - ld).toFixed(1) + " ";
    }
    el("polyline", { points: p1, fill: "none", stroke: "#2f8a5b", "stroke-width": 2.2 }, gB);
    el("polyline", { points: p2, fill: "none", stroke: "#b8791f", "stroke-width": 2.2 }, gB);
    el("line", { x1: xh(14), y1: G.py, x2: xh(14), y2: G.py + G.ph, stroke: "#e8b4a8", "stroke-dasharray": "4 3", "stroke-width": 1.2 }, gB);
    el("circle", { cx: xh(14), cy: yv(50), r: 3.6, fill: "#b8402f" }, gB);
    el("line", { x1: xh(A), y1: G.py, x2: xh(A), y2: G.py + G.ph, stroke: "#5a6472", "stroke-width": 1 }, gB);
    el("circle", { cx: xh(A), cy: yv(u.ld), r: 4, fill: "#2f8a5b", stroke: "#ffffff", "stroke-width": 1.2 }, gB);
    el("circle", { cx: xh(A), cy: yv(u.sd), r: 4, fill: "#b8791f", stroke: "#ffffff", "stroke-width": 1.2 }, gB);
    tx(gB, xh(A), G.py - 8, "h = " + A.toFixed(1), "#2b4a72", "middle", 9.2, 700);
    el("line", { x1: G.px, y1: G.py + G.ph + 30, x2: G.px + 14, y2: G.py + G.ph + 30, stroke: "#2f8a5b", "stroke-width": 2.2 }, gB);
    tx(gB, G.px + 18, G.py + G.ph + 34, "ld 长日照植物", "#2f6b4a", "start", 8.4, 400);
    el("line", { x1: G.px + G.pw * 0.52, y1: G.py + G.ph + 30, x2: G.px + G.pw * 0.52 + 14, y2: G.py + G.ph + 30, stroke: "#b8791f", "stroke-width": 2.2 }, gB);
    tx(gB, G.px + G.pw * 0.52 + 18, G.py + G.ph + 34, "sd 短日照植物", "#8a6a12", "start", 8.4, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = A.toFixed(1);
    $("gxVb").textContent = String(Math.round(s.ld));
    $("gxVc").textContent = String(Math.round(s.sd));
    if (A < 12) { st = "短日照植物占优"; col = "#b8791f"; bg = "#fdf3e0"; sn = "日照短于临界值，sd 高"; }
    else if (A <= 15) { st = "临界附近"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "两类都可能开花（≈14 h）"; }
    else { st = "长日照植物占优"; col = "#b8791f"; bg = "#fdf3e0"; sn = "日照长于临界值，ld 高"; }
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
    loop: [{ t: 0, v: 8 }, { t: 1.2, v: 8 }, { t: 4, v: 14 }, { t: 6.5, v: 14 }, { t: 9, v: 16 }, { t: 11, v: 12 }, { t: 13, v: 8 }],
    keys: [8, 12, 14, 16],
    value: A, min: 8, max: 16, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = Math.round(v * 2) / 2; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 10, eq: { ld: 0, sd: 100 } },
    { v: 14, eq: { ld: 50, sd: 50 } },
    { v: 16, eq: { ld: 83.3, sd: 16.7 } }
  ] };
  window.__model = window.__bio;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
