/* xx3-c1-s1 传统发酵技术的应用：温度 T → 酵母菌 / 乳酸菌相对活性 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;
  var W = { vb: "0 0 880 470" }, N = { vb: "0 0 360 700" };
  var L = W, A = 28, G = null, GR = "#2f8a5b", AM = "#b8791f";

  /* 纯函数：T（℃）→ 两种菌的相对活性（%） */
  function calc(T) {
    var y = 100 * Math.exp(-Math.pow(T - 28, 2) / 50);
    var l = 100 * Math.exp(-Math.pow(T - 37, 2) / 60);
    return { T: T, yeast: Math.round(y * 10) / 10, lacto: Math.round(l * 10) / 10 };
  }

  function geom() {
    if (L === W) return {
      lp: { x: 16, y: 16, w: 424, h: 438 }, rp: { x: 456, y: 16, w: 408, h: 438 },
      plot: { x0: 66, x1: 408, y0: 76, y1: 396 },
      bar: { x: 476, w: 252, y1: 104, y2: 194, h: 24 },
      note: { x: 476, y: 250, lh: 24 }, tl: 422, fs: 9.6
    };
    return {
      lp: { x: 8, y: 8, w: 344, h: 300 }, rp: { x: 8, y: 320, w: 344, h: 372 },
      plot: { x0: 54, x1: 332, y0: 62, y1: 246 },
      bar: { x: 28, w: 210, y1: 404, y2: 494, h: 22 },
      note: { x: 28, y: 552, lh: 22 }, tl: 268, fs: 8.8
    };
  }

  function px(T) { var p = G.plot; return p.x0 + (T - 15) / 25 * (p.x1 - p.x0); }
  function py(v) { var p = G.plot; return p.y1 - v / 100 * (p.y1 - p.y0); }

  function state(T) {
    if (T >= 39) return { k: "菌种危险", s: "高温使蛋白质变性", c: "#b8402f", bg: "#fbeae7" };
    if (T < 20) return { k: "两种都慢", s: "低于最适，发酵缓慢", c: AM, bg: "#fdf3e0" };
    if (T < 25) return { k: "酵母偏优", s: "酵母活跃，乳酸受抑", c: AM, bg: "#fdf3e0" };
    if (T <= 30) return { k: "酵母最适", s: "适合果酒 18–30 ℃", c: GR, bg: "#e6f6ee" };
    if (T < 35) return { k: "交替区间", s: "酵母降、乳酸升", c: AM, bg: "#fdf3e0" };
    if (T <= 38) return { k: "乳酸最适", s: "适合泡菜、酸奶", c: GR, bg: "#e6f6ee" };
    return { k: "交替区间", s: "酵母降、乳酸升", c: AM, bg: "#fdf3e0" };
  }

  function draw(s) {
    var gA = $("gxA"), gB = $("gxB"), p = G.plot, b = G.bar, i, t, d, pts, rows;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: G.lp.x, y: G.lp.y, width: G.lp.w, height: G.lp.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: G.rp.x, y: G.rp.y, width: G.rp.w, height: G.rp.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, G.lp.x + 20, G.lp.y + 28, "温度 → 相对活性（%）：两条最适温度不同的曲线", "#5a6472", "start", 10.5, 700);
    tx(gB, G.rp.x + 20, G.rp.y + 28, "此刻两种菌的活性", "#5a6472", "start", 10.5, 700);

    /* 坐标轴与刻度 */
    [0, 50, 100].forEach(function (v) {
      el("line", { x1: p.x0, y1: py(v), x2: p.x1, y2: py(v), stroke: "#e8eef4" }, gA);
      tx(gA, p.x0 - 8, py(v) + 3.4, String(v), "#8a939d", "end", 8.6, 400);
    });
    el("path", { d: "M" + p.x0 + " " + p.y0 + " L" + p.x0 + " " + p.y1 + " L" + p.x1 + " " + p.y1, fill: "none", stroke: "#8a939d" }, gA);
    for (t = 15; t <= 40; t += 5) {
      el("line", { x1: px(t), y1: p.y1, x2: px(t), y2: p.y1 + 4, stroke: "#8a939d" }, gA);
      tx(gA, px(t), G.tl, String(t), "#8a939d", "middle", 8.6, 400);
    }
    tx(gA, p.x1, G.tl + 18, "温度 / ℃", "#8a939d", "end", 8.6, 400);

    /* 两条曲线与最适点 */
    [[function (x) { return calc(x).yeast; }, GR], [function (x) { return calc(x).lacto; }, AM]].forEach(function (q) {
      pts = [];
      for (i = 15; i <= 40.001; i += 0.5) pts.push(px(i).toFixed(1) + " " + py(q[0](i)).toFixed(1));
      el("path", { d: "M" + pts.join(" L"), fill: "none", stroke: q[1], "stroke-width": 2, "stroke-linejoin": "round" }, gA);
    });
    el("circle", { cx: px(28), cy: py(100), r: 3.4, fill: GR }, gA);
    el("circle", { cx: px(37), cy: py(100), r: 3.4, fill: AM }, gA);
    tx(gA, px(28) - 8, py(100) - 10, "酵母菌 28 ℃", GR, "end", 9.4, 700);
    tx(gA, px(37) + 6, py(100) + 16, "乳酸菌 37 ℃", AM, "start", 9.4, 700);

    /* 当前温度：竖线 + 两个交点 */
    d = { x1: px(A), y1: p.y0, x2: px(A), y2: p.y1, stroke: "#151a21", "stroke-dasharray": "3 3" };
    el("line", d, gA);
    el("circle", { cx: px(A), cy: py(s.yeast), r: 4, fill: "#fff", stroke: GR, "stroke-width": 2 }, gA);
    el("circle", { cx: px(A), cy: py(s.lacto), r: 4, fill: "#fff", stroke: AM, "stroke-width": 2 }, gA);
    tx(gA, px(A) + (A > 33 ? -6 : 6), p.y0 - 6, "T = " + Math.round(A) + " ℃", "#151a21", A > 33 ? "end" : "start", 9.4, 700);

    /* 两根活性条 */
    rows = [{ k: "酵母菌", v: s.yeast, c: GR, y: b.y1, d: "最适 28 ℃" }, { k: "乳酸菌", v: s.lacto, c: AM, y: b.y2, d: "最适 37 ℃" }];
    rows.forEach(function (r) {
      tx(gB, b.x, r.y - 12, r.k + "（" + r.d + "）", "#3a3a35", "start", 9.6, 700);
      el("rect", { x: b.x, y: r.y, width: b.w, height: b.h, rx: 4, fill: "#f2f5f8", stroke: "#e2e8ee" }, gB);
      el("rect", { x: b.x, y: r.y, width: Math.max(1, b.w * r.v / 100), height: b.h, rx: 4, fill: r.c, opacity: 0.82 }, gB);
      tx(gB, b.x + b.w + 8, r.y + b.h * 0.68, r.v.toFixed(0) + "%", r.c, "start", 9.6, 700);
    });

    /* 结论区 */
    ["T=28 ℃：酵母菌 100%，乳酸菌 26%", "T=37 ℃：乳酸菌 100%，酵母菌 20%", "峰位不同 → 控温决定谁占优势"].forEach(function (s2, k) {
      tx(gB, G.note.x, G.note.y + k * G.note.lh, s2, k === 2 ? "#6b7683" : "#3a3a35", "start", G.fs, 400);
    });
    tx(gB, G.note.x, G.note.y + 3 * G.note.lh, "超过 39 ℃ 两条都低：菌被杀死，不是更快", "#b8402f", "start", G.fs, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st = state(A);
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.yeast.toFixed(0) + "%";
    $("gxVc").textContent = s.lacto.toFixed(0) + "%";
    $("gxVs").textContent = st.k;
    $("gxVsn").textContent = st.s;
    $("gxStBox").style.background = st.bg;
    $("gxStBox").style.borderColor = st.c + "44";
    $("gxVs").style.color = st.c;
    draw(s);
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

  var sl = $("gxSl");
  sl.addEventListener("input", function () { A = +sl.value; render(); });
  stage.addEventListener("click", function () {
    var keys = [15, 25, 28, 37, 40], i;
    for (i = 0; i < keys.length; i++) if (keys[i] > A) { A = keys[i]; sl.value = A; render(); return; }
    A = keys[0]; sl.value = A; render();
  });

  /* 停留帧 T=28（4–6.5 s）：酵母 100%，乳酸菌 26% */
  var ap = AutoPilot.create({
    mount: stage, follow: sl,
    loop: [{ t: 0, v: 15 }, { t: 1.2, v: 15 }, { t: 4, v: 28 }, { t: 6.5, v: 28 }, { t: 9, v: 40 }, { t: 11, v: 35 }, { t: 13, v: 15 }],
    keys: [15, 25, 28, 37, 40], value: A, min: 15, max: 40, step: 1, idle: 5000,
    onChange: function (v) { A = v; render(); }, onMode: setMode
  });
  window.__ap = ap;

  /* 断言：数值全部来自 calc */
  window.__model = window.__bio = { calc: calc, cases: [
    { v: 28, eq: { yeast: 100 } },
    { v: 37, eq: { lacto: 100 } },
    { v: 25, eq: { yeast: 83.5 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
