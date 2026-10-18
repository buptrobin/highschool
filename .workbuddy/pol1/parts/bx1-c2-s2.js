/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1949, G = null;

  /* 纯函数：年份 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var y = Math.round(v), sh = 20 + (y - 1949) / 7 * 50;
    return { share: sh, other: 100 - sh, done: y >= 1956 ? 1 : 0 };
  }

  /* 几何：按画布宽度算坐标，缓存进 G */
  function geom() {
    var l = L.left, r = L.right, big = l.h >= 400;
    stage.setAttribute("viewBox", L.vb);
    return { barH: big ? 64 : 50, gap: big ? 12 : 8, top: l.y + 52, fs: big ? 10 : 9.2,
      axis: { x0: r.x + 46, x1: r.x + r.w - 26, y0: r.y + r.h - 62, ytop: r.y + 66 } };
  }

  var ROWS = [
    ["1949—1952 · 恢复国民经济", "为社会主义改造创造条件", "新民主主义社会，过渡性质"],
    ["1953—1956 · 一化三改", "一体两翼，工业化是主体", "三大改造：农业、手工业、工商业"],
    ["1956 · 社会主义制度基本确立", "三大改造取得决定性胜利", "标志是 1956 年，不是 1949 年"]
  ];

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), l = L.left, r = L.right, ax = G.axis, i;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 18, l.y + 28, "三段时间轴：1949 → 1956", "#5a6472", "start", 10.5, 700);
    var on = A >= 1956 ? 2 : (A >= 1953 ? 1 : 0);
    for (i = 0; i < 3; i++) {
      var by = G.top + i * (G.barH + G.gap), k = i === on;
      el("rect", { x: l.x + 16, y: by, width: l.w - 32, height: G.barH, rx: 8, fill: k ? "#eef4fb" : "#ffffff", stroke: k ? "#3a6f96" : "#dfe5ec", "stroke-width": k ? 1.4 : 1 }, gA);
      tx(gA, l.x + 28, by + 20, ROWS[i][0], k ? "#2b5a7d" : "#3a3a35", "start", G.fs, 700);
      tx(gA, l.x + 28, by + 38, ROWS[i][1], "#5a6472", "start", G.fs - 0.8, 400);
      if (G.barH >= 60) tx(gA, l.x + 28, by + 55, ROWS[i][2], "#8a7a4a", "start", G.fs - 1.1, 400);
    }
    tx(gA, l.x + 18, l.y + l.h - 18, "翻转点只有一个：1956 年三大改造完成。", "#2f8a5b", "start", G.fs - 0.6, 700);

    /* 右：公有制经济比重曲线（示意值） */
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, r.x + 18, r.y + 28, "公有制经济比重（示意值）", "#5a6472", "start", 10.5, 700);
    function px(v) { return ax.x0 + (v - 1949) / 7 * (ax.x1 - ax.x0); }
    function py(s) { return ax.y0 - s / 80 * (ax.y0 - ax.ytop); }
    var tk = [20, 40, 60, 80];
    for (i = 0; i < 4; i++) {
      el("line", { x1: ax.x0, y1: py(tk[i]), x2: ax.x1, y2: py(tk[i]), stroke: "#eef2f5" }, gB);
      tx(gB, ax.x0 - 8, py(tk[i]) + 3, String(tk[i]), "#8b98a5", "end", 8.6, 400);
    }
    el("line", { x1: ax.x0, y1: ax.y0, x2: ax.x1 + 6, y2: ax.y0, stroke: "#b6c3cd", "stroke-width": 1.3 }, gB);
    el("line", { x1: ax.x0, y1: ax.y0, x2: ax.x0, y2: ax.ytop - 6, stroke: "#b6c3cd", "stroke-width": 1.3 }, gB);
    tx(gB, ax.x0 - 8, ax.ytop - 8, "%", "#8b98a5", "end", 8.6, 400);
    el("line", { x1: px(1949), y1: py(20), x2: px(1956), y2: py(70), stroke: "#3a6f96", "stroke-width": 2.2 }, gB);
    el("circle", { cx: px(1949), cy: py(20), r: 3.6, fill: "#3a6f96" }, gB);
    el("circle", { cx: px(1952), cy: py(41.4), r: 3.2, fill: "#8a6a1e" }, gB);
    el("circle", { cx: px(1956), cy: py(70), r: 4.4, fill: "#2f8a5b" }, gB);
    var s = calc(A), cx = px(A), cy = py(s.share);
    el("line", { x1: cx, y1: cy, x2: cx, y2: ax.y0, stroke: "#b8791f", "stroke-dasharray": "3 3" }, gB);
    el("circle", { cx: cx, cy: cy, r: 4.6, fill: "#b8791f", stroke: "#ffffff", "stroke-width": 1.4 }, gB);
    var lb = [1949, 1952, 1954, 1956];
    for (i = 0; i < 4; i++) tx(gB, px(lb[i]), ax.y0 + 16, String(lb[i]), "#8b98a5", "middle", 8.6, 400);
    tx(gB, px(1949) + 6, py(20) - 9, "20%（示意值）", "#3a6f96", "start", 9, 700);
    tx(gB, px(1956), py(70) - 10, "70%（示意值）", "#2f8a5b", "end", 9, 700);
    tx(gB, ax.x1, ax.y0 + 32, "y=" + A + " → " + s.share.toFixed(1) + "%", "#b8791f", "end", 9.4, 700);
    tx(gB, ax.x0, ax.y0 + 32, "done = " + s.done, "#5a6472", "start", 9.4, 400);
    tx(gB, ax.x0, ax.y0 + 48, A >= 1956 ? "三大改造完成，制度基本确立" : (A >= 1953 ? "一化三改进行中，尚未确立" : "恢复国民经济，新民主主义社会"), "#5a6472", "start", 8.8, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(A);
    $("gxVb").textContent = s.share.toFixed(1);
    $("gxVc").textContent = s.other.toFixed(1);
    if (A >= 1956) { st = "基本确立"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "三大改造完成（不是 1949）"; }
    else if (A >= 1953) { st = "进行中"; col = "#b8791f"; bg = "#fdf3e0"; sn = "一化三改中，过渡时期"; }
    else { st = "创造条件"; col = "#b8791f"; bg = "#fdf3e0"; sn = "恢复国民经济，过渡性质"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
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
    loop: [{ t: 0, v: 1949 }, { t: 1.2, v: 1949 }, { t: 4, v: 1956 }, { t: 6.5, v: 1956 }, { t: 9, v: 1952 }, { t: 11, v: 1954 }, { t: 13, v: 1949 }],
    keys: [1949, 1952, 1954, 1956],
    value: A, min: 1949, max: 1956, step: 1, idle: 5000,
    onChange: function (v) { A = Math.round(v); render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1949, eq: { share: 20 } },
    { v: 1952, eq: { share: 41.43 } },
    { v: 1956, eq: { share: 70, done: 1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
