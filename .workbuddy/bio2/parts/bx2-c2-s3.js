/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0.1, G = null;

  /* 纯函数：参数 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var q = Math.max(0.01, Math.min(0.5, v));
    return {
      q: q,
      male: q,                 /* 男性只有一条 X：X 上带 b 就发病 */
      female: q * q,           /* 女性两条 X 都带 b 才发病 */
      carrier: 2 * q * (1 - q),/* 女性携带者 XBXb */
      ratio: q > 0 ? 1 / q : 0 /* 男女患病率之比 = q / q² = 1/q */
    };
  }

  function pct(v) { return (v * 100).toFixed(1) + "%"; }

  /* 版面几何：柱底、柱顶、柱宽，宽窄屏共用一套算法 */
  function geom() {
    var l = L.left;
    return { base: l.y + l.h * 0.72, top: l.y + 66, slot: l.w / 3, bw: Math.min(58, (l.w / 3) * 0.52) };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB"), l = L.left, r = L.right;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, l.x + 20, l.y + 30, "q 决定三种频率（同一人群）", "#5a6472", "start", 10.5, 700);
    tx(gB, r.x + 30, r.y + 30, "男女患病率之比 = 1/q", "#5a6472", "start", 10.5, 700);

    /* 左：三根柱子 = 男性 q、女性 q²、女性携带者 2q(1−q) */
    var H = G.base - G.top;
    el("line", { x1: l.x + 14, y1: G.base, x2: l.x + l.w - 14, y2: G.base, stroke: "#c3ccd6", "stroke-width": 1.2 }, gA);
    tx(gA, l.x + 16, G.top - 14, "50%", "#8b95a3", "start", 9, 400);

    var bars = [
      { v: s.male, c: "#b8402f", t: "男性", f: "= q" },
      { v: s.female, c: "#3f7fbf", t: "女性", f: "= q²" },
      { v: s.carrier, c: "#b8791f", t: "女携带者", f: "= 2q(1−q)" }
    ];
    for (var i = 0; i < bars.length; i++) {
      var b = bars[i];
      var h = Math.max(1, (b.v / 0.5) * H);
      var x = l.x + G.slot * (i + 0.5) - G.bw / 2;
      el("rect", { x: x, y: G.base - h, width: G.bw, height: h, fill: b.c, rx: 2 }, gA);
      tx(gA, x + G.bw / 2, Math.max(G.top - 8, G.base - h - 8), pct(b.v), b.c, "middle", 10, 700);
      tx(gA, x + G.bw / 2, G.base + 20, b.t, "#3a3a35", "middle", 9.2, 700);
      tx(gA, x + G.bw / 2, G.base + 34, b.f, "#8b95a3", "middle", 9, 400);
    }

    /* 右：比值 + 两条染色体示意（X 大、Y 小，b 只标在 X 上） */
    tx(gB, r.x + 30, r.y + 86, s.ratio.toFixed(1) + " 倍", "#b8402f", "start", 30, 700);
    tx(gB, r.x + 30, r.y + 118, "男性患病率 = q = " + pct(s.male), "#3a3a35", "start", 9.6, 400);
    tx(gB, r.x + 30, r.y + 140, "女性患病率 = q² = " + pct(s.female), "#3a3a35", "start", 9.6, 400);
    tx(gB, r.x + 30, r.y + 162, "女性携带者 = 2q(1−q) = " + pct(s.carrier), "#3a3a35", "start", 9.6, 400);

    var mt = r.y + r.h * 0.50, mh = r.h * 0.26;
    var xw = r.w * 0.09, yw = r.w * 0.065;
    el("rect", { x: r.x + r.w * 0.10, y: mt, width: xw, height: mh, rx: xw / 2, fill: "#e8eef8", stroke: "#8fa8c8", "stroke-width": 1.3 }, gB);
    el("rect", { x: r.x + r.w * 0.34, y: mt + mh * 0.16, width: yw, height: mh * 0.84, rx: yw / 2, fill: "#f0ece6", stroke: "#b9a98f", "stroke-width": 1.3 }, gB);
    el("rect", { x: r.x + r.w * 0.10 + xw / 2 - 7, y: mt + mh * 0.30, width: 14, height: 14, rx: 2, fill: "#b8402f" }, gB);
    tx(gB, r.x + r.w * 0.10 + xw / 2, mt + mh + 18, "X", "#2b4a6b", "middle", 11, 700);
    tx(gB, r.x + r.w * 0.34 + yw / 2, mt + mh + 18, "Y", "#8a7455", "middle", 11, 700);
    tx(gB, r.x + r.w * 0.52, mt + 22, "b 只在 X 上", "#b8402f", "start", 9.4, 700);
    tx(gB, r.x + r.w * 0.52, mt + 40, "Y 上没有等位基因", "#5a6472", "start", 9, 400);
    wrap(gB, r.x + 30, r.y + r.h - 26, "男性只有一条 X，带 b 就发病 → 男多于女", r.w - 50, 9.4, "#3a3a35", 14);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = s.q.toFixed(2);
    $("gxVb").textContent = pct(s.male);
    $("gxVc").textContent = pct(s.female);
    if (s.ratio >= 6) { st = "差距悬殊"; col = "#b8402f"; bg = "#fbeae7"; sn = "男是女的 " + s.ratio.toFixed(1) + " 倍，q 越小差越大"; }
    else if (s.ratio >= 2.5) { st = "差距明显"; col = "#b8791f"; bg = "#fdf3e0"; sn = "男是女的 " + s.ratio.toFixed(1) + " 倍"; }
    else { st = "差距很小"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "q→0.5 时男女接近，比值 " + s.ratio.toFixed(1); }
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
    loop: [{ t: 0, v: 0.03 }, { t: 1.0, v: 0.03 }, { t: 2.2, v: 0.01 }, { t: 3.4, v: 0.5 }, { t: 6.2, v: 0.5 }, { t: 7.4, v: 0.1 }, { t: 10.0, v: 0.1 }, { t: 11.5, v: 0.3 }, { t: 13.0, v: 0.02 }, { t: 14.5, v: 0.02 }],
    keys: [0.01, 0.5, 0.1, 0.3],
    value: A, min: 0.01, max: 0.5, step: 0.01,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  var model = { calc: calc, cases: [
    { v: 0.1, eq: { male: 0.1, female: 0.01 } },
    { v: 0.2, eq: { male: 0.2, female: 0.04 } },
    { v: 0.5, eq: { male: 0.5, female: 0.25 } }
  ] };
  window.__bio = model;
  window.__model = model;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
