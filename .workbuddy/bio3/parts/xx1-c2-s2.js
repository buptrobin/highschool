/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 0;

  /* 纯函数：强化次数 → 条件反射强度。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var n = Math.round(v), s = 100 * (1 - Math.exp(-n / 5));
    s = Math.round(s * 10) / 10;
    return { n: n, strength: s, gap: Math.round((100 - s) * 10) / 10 };
  }

  function geom() {
    if (L === W) return {
      left: L.left, right: L.right, px: 64, py: 64, pw: 344, ph: 300,
      ring: { x: 470, y: 60, w: 160, h: 62 }, food: { x: 470, y: 146, w: 160, h: 62 },
      ctr: { x: 650, y: 66, w: 196, h: 136 },
      bar: { x: 470, y: 256, w: 376, h: 22 }, barLbl: { x: 470, y: 244 },
      foot: [{ x: 470, y: 302 }, { x: 470, y: 322 }, { x: 470, y: 342 }]
    };
    return {
      left: L.left, right: L.right, px: 44, py: 52, pw: 286, ph: 206,
      ring: { x: 16, y: 344, w: 150, h: 56 }, food: { x: 16, y: 412, w: 150, h: 56 },
      ctr: { x: 188, y: 344, w: 158, h: 124 },
      bar: { x: 16, y: 502, w: 328, h: 20 }, barLbl: { x: 16, y: 492 },
      foot: [{ x: 16, y: 552 }, { x: 16, y: 572 }, { x: 16, y: 592 }]
    };
  }

  function arrow(g, x1, y1, x2, y2, col, dash) {
    el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: col, "stroke-width": 1.6, "stroke-dasharray": dash }, g);
    var a = Math.atan2(y2 - y1, x2 - x1), h = 7;
    var p = [[x2, y2], [x2 - h * Math.cos(a - 0.42), y2 - h * Math.sin(a - 0.42)], [x2 - h * Math.cos(a + 0.42), y2 - h * Math.sin(a + 0.42)]];
    el("polygon", { points: p[0][0].toFixed(1) + "," + p[0][1].toFixed(1) + " " + p[1][0].toFixed(1) + "," + p[1][1].toFixed(1) + " " + p[2][0].toFixed(1) + "," + p[2][1].toFixed(1), fill: col }, g);
  }

  function panel(g, r, title) {
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, g);
    tx(g, r.x + 16, r.y + 30, title, "#5a6472", "start", 10.5, 700);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), px = G.px, py = G.py, pw = G.pw, ph = G.ph;
    panel(gA, G.left, "S（%）随强化次数 n 的变化");
    panel(gB, G.right, "暂时联系：两条刺激汇到同一个中枢");

    for (var k = 1; k <= 4; k++) {
      var gy = py + ph - (k * 25 / 100) * ph;
      el("line", { x1: px, y1: gy, x2: px + pw, y2: gy, stroke: "#e9eef3", "stroke-width": 1 }, gA);
      tx(gA, px - 6, gy + 3, String(k * 25), "#8d99a6", "end", 8.5, 400);
    }
    el("line", { x1: px, y1: py - 8, x2: px, y2: py + ph, stroke: "#8d99a6", "stroke-width": 1.2 }, gA);
    el("line", { x1: px, y1: py + ph, x2: px + pw, y2: py + ph, stroke: "#8d99a6", "stroke-width": 1.2 }, gA);
    tx(gA, px + pw, py + ph - 8, "n / 次", "#5a6472", "end", 9, 700);
    for (var m = 0; m <= 20; m += 5) tx(gA, px + (m / 20) * pw, py + ph + 16, String(m), "#8d99a6", "middle", 8.5, 400);

    var pts = [], i, nn, yy;
    for (i = 0; i <= 40; i++) {
      nn = i / 2; yy = py + ph - (1 - Math.exp(-nn / 5)) * ph;
      pts.push((px + (nn / 20) * pw).toFixed(1) + "," + yy.toFixed(1));
    }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#2f8a5b", "stroke-width": 2.2 }, gA);
    var x5 = px + pw * 0.25, y5 = py + ph - (1 - Math.exp(-1)) * ph;
    el("line", { x1: x5, y1: y5, x2: x5, y2: py + ph, stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "3 3" }, gA);
    el("circle", { cx: x5, cy: y5, r: 3.4, fill: "#b8791f" }, gA);
    tx(gA, x5 + 6, y5 - 6, "n=5 · 63.2%", "#b8791f", "start", 9, 700);
    tx(gA, px + pw - 2, py + 12, "S = " + s.strength.toFixed(1) + "%", "#20536f", "end", 9.6, 700);

    var cx = px + (s.n / 20) * pw, cy = py + ph - (s.strength / 100) * ph;
    el("line", { x1: cx, y1: cy, x2: cx, y2: py + ph, stroke: "#20536f", "stroke-width": 1, "stroke-dasharray": "4 3" }, gA);
    el("circle", { cx: cx, cy: cy, r: 5, fill: "#ffffff", stroke: "#20536f", "stroke-width": 2 }, gA);

    var b = G.ring, f = G.food, c = G.ctr;
    el("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 8, fill: "#fffdf2", stroke: "#d9c37a" }, gB);
    tx(gB, b.x + 12, b.y + 20, "铃声（无关刺激）", "#8a6b12", "start", 9, 700);
    tx(gB, b.x + 12, b.y + 36, "单独响：不分泌唾液", "#3a3a35", "start", 8.8, 400);
    tx(gB, b.x + 12, b.y + 51, "经听觉通路 → 皮层", "#3a3a35", "start", 8.8, 400);
    el("rect", { x: f.x, y: f.y, width: f.w, height: f.h, rx: 8, fill: "#f4fbf7", stroke: "#9ad3b4" }, gB);
    tx(gB, f.x + 12, f.y + 20, "食物（非条件刺激）", "#2f8a5b", "start", 9, 700);
    tx(gB, f.x + 12, f.y + 36, "天生引起唾液分泌", "#3a3a35", "start", 8.8, 400);
    tx(gB, f.x + 12, f.y + 51, "经味觉通路 → 皮层", "#3a3a35", "start", 8.8, 400);
    el("rect", { x: c.x, y: c.y, width: c.w, height: c.h, rx: 8, fill: "#ffffff", stroke: "#8fb6cf" }, gB);
    tx(gB, c.x + 12, c.y + 22, "大脑皮层（暂时联系）", "#20536f", "start", 9.4, 700);
    tx(gB, c.x + 12, c.y + 40, "听觉中枢＋味觉中枢", "#3a3a35", "start", 8.8, 400);
    tx(gB, c.x + 12, c.y + 56, "反复结合 → 接通", "#3a3a35", "start", 8.8, 400);
    var on = s.strength >= 5;
    tx(gB, c.x + 12, c.y + 80, on ? "现在：已接通" : "现在：还接不上", on ? "#2f8a5b" : "#b8402f", "start", 9, 700);
    tx(gB, c.x + 12, c.y + 98, "S = " + s.strength.toFixed(1) + "%", "#20536f", "start", 9, 700);

    var lc = on ? "#2f8a5b" : "#b8402f", dsh = on ? "none" : "4 3";
    arrow(gB, b.x + b.w, b.y + b.h / 2, c.x - 2, c.y + 34, lc, dsh);
    arrow(gB, f.x + f.w, f.y + f.h / 2, c.x - 2, c.y + 62, lc, dsh);
    arrow(gB, c.x + c.w / 2, c.y + c.h, c.x + c.w / 2, c.y + c.h + 14, "#5a6472", "none");
    tx(gB, c.x + c.w / 2 + 10, c.y + c.h + 18, "唾液腺 → 分泌唾液", "#5a6472", "start", 8.8, 700);

    tx(gB, G.barLbl.x, G.barLbl.y, "条件反射强度 S = " + s.strength.toFixed(1) + "%", "#20536f", "start", 9.2, 700);
    el("rect", { x: G.bar.x, y: G.bar.y, width: G.bar.w, height: G.bar.h, rx: 6, fill: "#eef3f7", stroke: "#dbe7ef" }, gB);
    el("rect", { x: G.bar.x, y: G.bar.y, width: Math.max(1, G.bar.w * s.strength / 100), height: G.bar.h, rx: 6, fill: "#2f8a5b" }, gB);
    tx(gB, G.foot[0].x, G.foot[0].y, s.n === 0 ? "n=0：两条通路没接上，单独响铃不分泌" : "已强化 " + s.n + " 次，铃声能单独引起分泌", "#3a3a35", "start", 8.8, 400);
    tx(gB, G.foot[1].x, G.foot[1].y, "以非条件反射为基础，需要大脑皮层参与", "#8a4b9c", "start", 8.8, 700);
    tx(gB, G.foot[2].x, G.foot[2].y, on ? "此后再不强化 → 会逐渐消退" : "长期不强化 → 会逐渐消退", "#b8402f", "start", 8.8, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.n);
    $("gxVb").textContent = s.strength.toFixed(1);
    $("gxVc").textContent = s.gap.toFixed(1);
    if (s.n === 0) { st = "没有反应"; col = "#b8402f"; bg = "#fbeae7"; sn = "还没建立，缺强化"; }
    else if (s.n <= 10) { st = "正在建立"; col = "#b8791f"; bg = "#fdf3e0"; sn = "逐次加强"; }
    else { st = "趋于稳定"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "再练提升很小"; }
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 5 }, { t: 6.5, v: 5 }, { t: 9, v: 20 }, { t: 11, v: 12 }, { t: 13, v: 0 }],
    keys: [0, 5, 12, 20],
    value: A, min: 0, max: 20, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { strength: 0 } },
    { v: 5, eq: { strength: 63.2 } },
    { v: 20, eq: { strength: 98.2 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
