/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 40, G = null;
  var VMIN = 80, VMAX = 190;

  /* 纯函数：环境温度 → 产热、散热。render() 和 __bio.cases 都用它 */
  function calc(v) {
    return {
      heat: 100 + Math.max(0, 20 - v) * 2.5,
      loss: 100 + Math.max(0, v - 28) * 4
    };
  }

  function geom() {
    var l = L.left;
    return { p: { x: l.x + 40, y: l.y + 62, w: l.w - 60, h: l.h - 118 } };
  }
  function xT(t) { return G.p.x + G.p.w * (t + 10) / 50; }
  function yV(v) { return G.p.y + G.p.h * (1 - (v - VMIN) / (VMAX - VMIN)); }

  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
    return lines.length;
  }

  function note(T) {
    if (T < 20) return "寒冷：皮肤血管收缩、汗腺分泌减少→散热↓；骨骼肌战栗、甲状腺激素与肾上腺素增多→产热↑。神经—体液调节共同作用。";
    if (T <= 28) return "两条线重合：产热 = 散热 = 100，体温相对稳定。不是「没有调节」，而是调节把差额补到了零。";
    return "炎热：皮肤血管舒张、汗腺分泌增加→散热↑（主要途径）；代谢略降→产热↓（次要）。以增加散热为主。";
  }
  function stateOf(T) {
    if (T < 20) return { st: "靠产热", col: "#b8402f", bg: "#fbeae7", sn: "产热↑ + 散热↓" };
    if (T <= 28) return { st: "平衡", col: "#2f8a5b", bg: "#e6f6ee", sn: "产热 = 散热" };
    if (T < 36) return { st: "靠散热", col: "#b8791f", bg: "#fdf3e0", sn: "以增加散热为主" };
    return { st: "接近极限", col: "#b8402f", bg: "#fbeae7", sn: "散热接近调节上限" };
  }

  function draw(T, s, d, col) {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var p = G.p;

    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 28, "两条曲线：产热量 / 散热量", "#5a6472", "start", 10.5, 700);
    tx(gA, L.left.x + 20, L.left.y + 44, "横轴＝环境温度 T（℃）　纵轴＝相对值", "#8b95a1", "start", 8.4, 400);

    el("line", { x1: p.x, y1: p.y - 6, x2: p.x, y2: p.y + p.h, stroke: "#9aa6b2", "stroke-width": 1.2 }, gA);
    el("line", { x1: p.x, y1: p.y + p.h, x2: p.x + p.w + 6, y2: p.y + p.h, stroke: "#9aa6b2", "stroke-width": 1.2 }, gA);
    el("line", { x1: p.x, y1: yV(100), x2: p.x + p.w, y2: yV(100), stroke: "#cfd8e0", "stroke-width": 1, "stroke-dasharray": "4 4" }, gA);
    tx(gA, p.x - 6, yV(100) + 3, "100", "#6b7684", "end", 8.4, 400);
    tx(gA, p.x - 6, yV(150) + 3, "150", "#6b7684", "end", 8.4, 400);

    var hp = [], lp = [], t;
    for (t = -10; t <= 40; t++) { var c = calc(t); hp.push(xT(t).toFixed(1) + "," + yV(c.heat).toFixed(1)); lp.push(xT(t).toFixed(1) + "," + yV(c.loss).toFixed(1)); }
    el("polyline", { points: hp.join(" "), fill: "none", stroke: "#b8402f", "stroke-width": 2.4, "stroke-linejoin": "round" }, gA);
    el("polyline", { points: lp.join(" "), fill: "none", stroke: "#2f6fb8", "stroke-width": 2.4, "stroke-linejoin": "round" }, gA);

    tx(gA, xT(-2) + 6, yV(175) - 8, "产热量", "#b8402f", "start", 9, 700);
    tx(gA, xT(31) + 6, yV(140) - 8, "散热量", "#2f6fb8", "start", 9, 700);

    el("circle", { cx: xT(25), cy: yV(100), r: 5, fill: "#ffffff", stroke: "#2f8a5b", "stroke-width": 1.8 }, gA);
    tx(gA, xT(25), yV(100) - 14, "25 ℃ 附近两线重合", "#2f8a5b", "middle", 8.6, 700);

    tx(gA, xT(-10), p.y + p.h + 16, "−10", "#6b7684", "start", 8.4, 400);
    tx(gA, xT(20), p.y + p.h + 16, "20", "#6b7684", "middle", 8.4, 400);
    tx(gA, xT(40), p.y + p.h + 16, "40 ℃", "#6b7684", "end", 8.4, 400);

    el("line", { x1: xT(T), y1: p.y - 6, x2: xT(T), y2: p.y + p.h, stroke: "#151a21", "stroke-width": 1, "stroke-dasharray": "3 3", opacity: 0.55 }, gA);
    tx(gA, xT(T), p.y + 10, "T = " + T + " ℃", "#151a21", "middle", 9, 700);
    el("circle", { cx: xT(T), cy: yV(s.heat), r: 3.6, fill: "#b8402f" }, gA);
    el("circle", { cx: xT(T), cy: yV(s.loss), r: 3.6, fill: "#2f6fb8" }, gA);

    /* 右侧：数值与差额 */
    var x0 = L.right.x + 20, bw = L.right.w - 40, y0 = L.right.y;
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, x0, y0 + 28, "此刻的产热与散热", "#5a6472", "start", 10.5, 700);

    var rows = [{ n: "产热量", v: s.heat, c: "#b8402f", y: y0 + 66 }, { n: "散热量", v: s.loss, c: "#2f6fb8", y: y0 + 134 }];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      tx(gB, x0, r.y, r.n, "#3a3a35", "start", 9.6, 700);
      tx(gB, x0 + bw, r.y, r.v.toFixed(1), r.c, "end", 12.5, 700);
      el("rect", { x: x0, y: r.y + 8, width: bw, height: 12, rx: 6, fill: "#eef2f6" }, gB);
      el("rect", { x: x0, y: r.y + 8, width: Math.max(3, bw * Math.min(1, r.v / 180)), height: 12, rx: 6, fill: r.c, opacity: 0.85 }, gB);
    }

    tx(gB, x0, y0 + 186, "产热 − 散热 = " + (d > 0 ? "+" : "") + d.toFixed(1), "#151a21", "start", 10, 700);
    wrap(gB, x0, y0 + 210, note(T), bw, 9.2, "#3a3a35", 18);

    var bx = x0, by = y0 + L.right.h - 74;
    el("rect", { x: bx, y: by, width: bw, height: 56, rx: 8, fill: statusBg(T), stroke: col + "44" }, gB);
    tx(gB, bx + 12, by + 22, T < 20 ? "产热增加 + 散热减少" : (T <= 28 ? "产热 = 散热，体温稳定" : "以增加散热为主"), col, "start", 10, 700);
    tx(gB, bx + 12, by + 42, "T = " + T + " ℃　产热 " + s.heat.toFixed(0) + " / 散热 " + s.loss.toFixed(0), "#3a3a35", "start", 9, 400);
  }

  function statusBg(T) {
    if (T <= 28) return T < 20 ? "#fbeae7" : "#e6f6ee";
    return T < 36 ? "#fdf3e0" : "#fbeae7";
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), d = s.heat - s.loss, q = stateOf(A);
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.heat.toFixed(1);
    $("gxVc").textContent = s.loss.toFixed(1);
    $("gxVs").textContent = q.st;
    $("gxVsn").textContent = q.sn;
    $("gxStBox").style.background = q.bg;
    $("gxStBox").style.borderColor = q.col + "44";
    $("gxVs").style.color = q.col;
    draw(A, s, d, q.col);
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
    loop: [{ t: 0, v: 40 }, { t: 1.2, v: 40 }, { t: 4.6, v: -10 }, { t: 6.8, v: -10 }, { t: 9, v: 25 }, { t: 12, v: 25 }, { t: 13.5, v: 40 }],
    keys: [-10, 5, 25, 40],
    value: A, min: -10, max: 40, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: -10, eq: { heat: 175, loss: 100 } },
    { v: 25, eq: { heat: 100, loss: 100 } },
    { v: 40, eq: { heat: 100, loss: 148 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
