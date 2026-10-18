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

  /* 纯函数：脱落酸浓度 a → 种子萌发率。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var a = Math.max(0, Math.min(10, Number(v) || 0));
    return { germ: 100 / (1 + Math.exp((a - 5) / 1.2)) };
  }

  /* 几何：只算一次，宽窄两套各自独立 */
  function geom() {
    if (L === W) {
      return {
        t1: [36, 54], t2: [476, 54],
        seed: [228, 202, 74, 46], emb: [228, 202, 26, 32],
        gaX: 158, gaBot: 188, gaMax: 70, gaMin: 12,
        abX: 298, abTop: 200, abMax: 68, abMin: 12,
        bar: [36, 336, 344, 15], barT: [36, 326],
        s1: [36, 386], s2: [36, 406],
        px: [508, 828], py: [96, 344], yt: [496, 384], xt: [508, 362],
        crit: [672, 112]
      };
    }
    return {
      t1: [28, 40], t2: [28, 350],
      seed: [180, 140, 58, 38], emb: [180, 140, 21, 28],
      gaX: 130, gaBot: 138, gaMax: 60, gaMin: 10,
      abX: 232, abTop: 148, abMax: 58, abMin: 10,
      bar: [24, 252, 304, 14], barT: [24, 242],
      s1: [24, 284], s2: [24, 300],
      px: [52, 332], py: [384, 600], yt: [44, 616], xt: [52, 616],
      crit: [196, 400]
    };
  }

  function drawSeed(gA, s) {
    var f = s.germ / 100, g = G;
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, g.t1[0], g.t1[1], "一粒种子：两条相反的指令", "#5a6472", "start", 10.5, 700);
    el("ellipse", { cx: g.seed[0], cy: g.seed[1], rx: g.seed[2], ry: g.seed[3], fill: "#fdf6e8", stroke: "#d9c9a3", "stroke-width": 1.3 }, gA);
    el("ellipse", { cx: g.emb[0], cy: g.emb[1], rx: g.emb[2], ry: g.emb[3], fill: "#ffffff", stroke: "#9fc7ae", "stroke-width": 1.2 }, gA);
    tx(gA, g.emb[0], g.emb[1] + 4, "胚", "#1f6f4a", "middle", 9.4, 700);
    /* 赤霉素：向上，长度随萌发率变长 */
    var gt = g.gaBot - (g.gaMin + (g.gaMax - g.gaMin) * f);
    el("line", { x1: g.gaX, y1: g.gaBot, x2: g.gaX, y2: gt + 12, stroke: "#2f8a5b", "stroke-width": 2.4 }, gA);
    el("polygon", { points: g.gaX + ", " + (gt - 2) + " " + (g.gaX - 6) + ", " + (gt + 13) + " " + (g.gaX + 6) + ", " + (gt + 13), fill: "#2f8a5b" }, gA);
    tx(gA, g.gaX - 12, gt + 4, "赤霉素", "#2f8a5b", "end", 10, 700);
    tx(gA, g.gaX - 12, gt + 19, "促萌发", "#2f8a5b", "end", 9, 400);
    /* 脱落酸：向下，长度随休眠程度变长 */
    var ab = g.abTop + (g.abMin + (g.abMax - g.abMin) * (1 - f));
    el("line", { x1: g.abX, y1: g.abTop, x2: g.abX, y2: ab - 12, stroke: "#b8791f", "stroke-width": 2.4 }, gA);
    el("polygon", { points: g.abX + ", " + (ab + 2) + " " + (g.abX - 6) + ", " + (ab - 13) + " " + (g.abX + 6) + ", " + (ab - 13), fill: "#b8791f" }, gA);
    tx(gA, g.abX + 12, ab - 8, "脱落酸", "#b8791f", "start", 10, 700);
    tx(gA, g.abX + 12, ab + 7, "促休眠", "#b8791f", "start", 9, 400);
    /* 萌发率进度条 */
    tx(gA, g.barT[0], g.barT[1], "萌发率 germ（%）", "#5a6472", "start", 9.4, 700);
    el("rect", { x: g.bar[0], y: g.bar[1], width: g.bar[2], height: g.bar[3], rx: 7, fill: "#eceff3" }, gA);
    el("rect", { x: g.bar[0], y: g.bar[1], width: Math.max(2, g.bar[2] * f), height: g.bar[3], rx: 7, fill: f > 0.5 ? "#2f8a5b" : "#b8791f" }, gA);
    tx(gA, g.bar[0] + g.bar[2] + 2, g.bar[1] + 12, s.germ.toFixed(1) + "%", "#43505e", "end", 9.4, 700);
    tx(gA, g.s1[0], g.s1[1], "箭头越长＝这种激素越占上风", "#5a6472", "start", 9, 400);
    tx(gA, g.s2[0], g.s2[1], "a 越大，脱落酸箭头越长、萌发率越低", "#5a6472", "start", 9, 400);
  }

  function drawCurve(gB, s) {
    var g = G, pw = g.px[1] - g.px[0], ph = g.py[1] - g.py[0], i, a, gg, d = "";
    function X(v) { return g.px[0] + v / 10 * pw; }
    function Y(v) { return g.py[1] - v / 100 * ph; }
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, g.t2[0], g.t2[1], "萌发率随脱落酸浓度变化", "#5a6472", "start", 10.5, 700);
    el("line", { x1: g.px[0] - 4, y1: g.py[1], x2: g.px[1] + 6, y2: g.py[1], stroke: "#9fb0bf", "stroke-width": 1.2 }, gB);
    el("line", { x1: g.px[0], y1: g.py[1] + 4, x2: g.px[0], y2: g.py[0] - 8, stroke: "#9fb0bf", "stroke-width": 1.2 }, gB);
    el("line", { x1: X(5), y1: g.py[0] - 4, x2: X(5), y2: g.py[1], stroke: "#c9b073", "stroke-width": 1, "stroke-dasharray": "4 4" }, gB);
    el("line", { x1: g.px[0], y1: Y(50), x2: g.px[1], y2: Y(50), stroke: "#c9b073", "stroke-width": 1, "stroke-dasharray": "4 4" }, gB);
    for (i = 0; i <= 40; i++) {
      a = i / 4; gg = calc(a).germ;
      d += (i ? "L" : "M") + X(a).toFixed(1) + "," + Y(gg).toFixed(1);
    }
    el("path", { d: d, fill: "none", stroke: "#2f8a5b", "stroke-width": 2.2 }, gB);
    el("circle", { cx: X(A), cy: Y(s.germ), r: 5, fill: "#b8402f", stroke: "#ffffff", "stroke-width": 1.4 }, gB);
    tx(gB, g.crit[0], g.crit[1], "a=5 临界点", "#b8791f", "start", 9, 700);
    tx(gB, g.yt[0], g.py[0] + 4, "100", "#5a6472", "end", 9, 400);
    tx(gB, g.yt[0], Y(50) + 4, "50", "#5a6472", "end", 9, 400);
    tx(gB, g.yt[0], g.py[1] + 4, "0", "#5a6472", "end", 9, 400);
    tx(gB, g.xt[0], g.xt[1], "0", "#5a6472", "middle", 9, 400);
    tx(gB, X(5), g.xt[1], "5", "#5a6472", "middle", 9, 400);
    tx(gB, X(10), g.xt[1], "10", "#5a6472", "middle", 9, 400);
    tx(gB, g.px[1] + 4, g.xt[1] + 18, "脱落酸浓度 a", "#5a6472", "end", 9, 400);
    tx(gB, g.px[0] - 10, g.py[0] - 14, "萌发率 %", "#5a6472", "start", 9, 400);
    tx(gB, g.crit[0], g.crit[1] + 16, "a=5 时萌发率 50%", "#5a6472", "start", 9, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn, f = s.germ;
    $("gxVa").textContent = Number(A).toFixed(1);
    $("gxVb").textContent = f.toFixed(1);
    $("gxVc").textContent = (100 - f).toFixed(1);
    if (A < 3) { st = "萌发率高"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "脱落酸少，胚能萌发"; }
    else if (A < 4.7) { st = "萌发受抑"; col = "#b8791f"; bg = "#fdf3e0"; sn = "脱落酸在追上来"; }
    else if (A <= 5.3) { st = "临界点"; col = "#b8791f"; bg = "#fdf3e0"; sn = "赤霉素与脱落酸势均力敌"; }
    else if (A <= 7) { st = "萌发受阻"; col = "#b8402f"; bg = "#fbeae7"; sn = "脱落酸占上风"; }
    else { st = "维持休眠"; col = "#b8402f"; bg = "#fbeae7"; sn = "基本不萌发，脱落酸主导"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    drawSeed(gA, s);
    drawCurve(gB, s);
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 5 }, { t: 6.5, v: 5 }, { t: 9, v: 10 }, { t: 11, v: 7 }, { t: 13, v: 0 }],
    keys: [0, 5, 7, 10],
    value: A, min: 0, max: 10, step: 0.5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { germ: 98.5 } },
    { v: 5, eq: { germ: 50 } },
    { v: 10, eq: { germ: 1.5 } }
  ] };
  window.__model = window.__bio;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
