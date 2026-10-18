/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1, G = null;

  /* 唯一真值：连续自交代数 n → 群体里三种基因型的比例 */
  function calc(v) {
    var n = Math.max(1, Math.min(5, Math.round(v)));
    var het = Math.pow(0.5, n);          /* 杂合子 Aa 的比例 */
    var dom = 0.5 + het / 2;             /* 显性表现型 = AA + Aa */
    var rec = (1 - het) / 2;             /* 隐性 aa 的比例 */
    return { n: n, het: het, dom: dom, rec: rec, ratio: dom / rec };
  }

  function geom() {
    var lf = L.left, rt = L.right;
    return {
      lb: { x: lf.x + 22, y: lf.y + 56, w: lf.w - 44, h: 24 },
      lgY: lf.y + 92,
      ladY: lf.y + 146,
      rowH: Math.min(38, (lf.h - 162) / 5),
      px: rt.x + 46, py: rt.y + 56,
      pw: rt.w - 74, ph: rt.h - 148
    };
  }

  function pct(x) { return (x * 100).toFixed(1) + "%"; }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB"), lf = L.left, rt = L.right;
    var i, k, y, w, x, cx, cy, b = G.lb;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: lf.x, y: lf.y, width: lf.w, height: lf.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: rt.x, y: rt.y, width: rt.w, height: rt.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, lf.x + 22, lf.y + 30, "这一群里三种基因型各占多少", "#5a6472", "start", 10.5, 700);
    tx(gB, rt.x + 22, rt.y + 30, "显性表现型比例：n 每加 1 就更靠近 1∶1", "#5a6472", "start", 10.5, 700);

    /* 左：100% 堆叠条 —— 绿 AA / 蓝 Aa / 红 aa */
    var segs = [{ f: s.rec, c: "#cfece0", e: "#7fc3a4", t: "AA" },
                { f: s.het, c: "#cfe3f2", e: "#7fb5d0", t: "Aa" },
                { f: s.rec, c: "#f6d9d3", e: "#d8a99e", t: "aa" }];
    x = b.x;
    for (i = 0; i < 3; i++) {
      w = b.w * segs[i].f;
      el("rect", { x: x, y: b.y, width: Math.max(1, w), height: b.h, rx: 4, fill: segs[i].c, stroke: segs[i].e }, gA);
      if (w > 46) tx(gA, x + w / 2, b.y + 16, segs[i].t, "#3a3a35", "middle", 9.6, 700);
      x += w;
    }

    /* 左：图例（带当前百分比） */
    var lg = [[s.rec, "#cfece0", "AA 纯合 · 高茎"], [s.het, "#cfe3f2", "Aa 杂合 · 高茎"], [s.rec, "#f6d9d3", "aa 纯合 · 矮茎"]];
    for (i = 0; i < 3; i++) {
      y = G.lgY + i * 18;
      el("rect", { x: lf.x + 26, y: y - 8, width: 10, height: 10, rx: 2, fill: lg[i][1], stroke: "#c3cfd8" }, gA);
      tx(gA, lf.x + 42, y, lg[i][2], "#3a3a35", "start", 9.4, 400);
      tx(gA, lf.x + lf.w - 24, y, pct(lg[i][0]), "#151a21", "end", 9.6, 700);
    }

    /* 左：n=1…5 的杂合子比例阶梯 */
    var maxW = lf.w - 152;
    for (k = 1; k <= 5; k++) {
      y = G.ladY + (k - 1) * G.rowH;
      var hk = Math.pow(0.5, k), bh = Math.min(13, G.rowH - 11);
      var on = (k === s.n);
      tx(gA, lf.x + 24, y + bh, "n=" + k, on ? "#151a21" : "#5a6472", "start", 9.2, on ? 700 : 400);
      el("rect", { x: lf.x + 62, y: y, width: Math.max(3, maxW * hk / 0.5), height: bh, rx: 3,
        fill: on ? "#1d5a80" : "#dbe9f4", stroke: on ? "#1d5a80" : "#b8d9ea" }, gA);
      tx(gA, lf.x + 62 + maxW * hk / 0.5 + 8, y + bh, pct(hk), on ? "#151a21" : "#7a8694", "start", 8.8, on ? 700 : 400);
    }
    if (G.rowH > 30) tx(gA, lf.x + 22, G.ladY + 5 * G.rowH + 18, "每自交一代，杂合子砍一半：(1/2)ⁿ", "#5a6472", "start", 9.2, 400);

    /* 右：曲线 —— 显性表现型比例 vs n */
    var yOf = function (d) { return G.py + G.ph - (d - 0.45) / 0.55 * G.ph; };
    var xOf = function (n) { return G.px + (n - 1) / 4 * G.pw; };
    var gl = [[0.5, "1∶1", "#b8402f"], [0.75, "3∶1", "#2f8a5b"], [1, "100%", "#9aa6b2"]];
    for (i = 0; i < 3; i++) {
      y = yOf(gl[i][0]);
      el("line", { x1: G.px, y1: y, x2: G.px + G.pw, y2: y, stroke: gl[i][2], "stroke-width": 1, "stroke-dasharray": "4 4", opacity: 0.5 }, gB);
      tx(gB, G.px - 8, y + 3, gl[i][1], gl[i][2], "end", 8.6, 400);
    }
    el("line", { x1: G.px, y1: G.py, x2: G.px, y2: G.py + G.ph, stroke: "#c3cfd8", "stroke-width": 1 }, gB);
    el("line", { x1: G.px, y1: G.py + G.ph, x2: G.px + G.pw, y2: G.py + G.ph, stroke: "#c3cfd8", "stroke-width": 1 }, gB);
    var pts = "";
    for (k = 1; k <= 5; k++) {
      pts += xOf(k).toFixed(1) + "," + yOf(calc(k).dom).toFixed(1) + " ";
      el("circle", { cx: xOf(k), cy: yOf(calc(k).dom), r: 3.4, fill: "#1d5a80" }, gB);
      tx(gB, xOf(k), G.py + G.ph + 15, "n=" + k, "#7a8694", "middle", 8.4, 400);
    }
    el("polyline", { points: pts, fill: "none", stroke: "#1d5a80", "stroke-width": 2 }, gB);
    cx = xOf(s.n); cy = yOf(s.dom);
    el("line", { x1: cx, y1: cy, x2: cx, y2: G.py + G.ph, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "3 3" }, gB);
    el("circle", { cx: cx, cy: cy, r: 5.5, fill: "#b8402f", stroke: "#ffffff", "stroke-width": 1.6 }, gB);
    tx(gB, cx, cy - 12, "n=" + s.n, "#b8402f", "middle", 9.4, 700);

    /* 右：面板下方数值 */
    y = G.py + G.ph + 40;
    tx(gB, rt.x + 24, y, "显性 " + pct(s.dom) + "　∶　隐性 " + pct(s.rec), "#151a21", "start", 10, 700);
    tx(gB, rt.x + 24, y + 20, "显性∶隐性 ≈ " + s.ratio.toFixed(2) + "∶1", "#b8402f", "start", 10, 700);
    tx(gB, rt.x + 24, y + 40, "3∶1 会一直向 1∶1 滑，但永远不等于 1∶1", "#5a6472", "start", 9, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; stage.setAttribute("viewBox", L.vb); G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.n);
    $("gxVb").textContent = pct(s.het);
    $("gxVc").textContent = s.ratio.toFixed(2) + "∶1";
    if (s.n === 1) { st = "F₂ 显隐 3∶1"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "起点就是孟德尔的 F₂"; }
    else { st = "自交提纯中"; col = "#b8791f"; bg = "#fdf3e0"; sn = "杂合子减半，纯合子变多"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    G = null;
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 4 }, { t: 6.5, v: 4 }, { t: 9, v: 2 }, { t: 11, v: 5 }, { t: 13, v: 1 }],
    keys: [1, 2, 4, 5],
    value: A, min: 1, max: 5, step: 1,
    idle: 5000,
    onChange: function (v) { A = Math.round(v); render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1, eq: { n: 1, het: 0.5, dom: 0.75, rec: 0.25 } },
    { v: 2, eq: { n: 2, het: 0.25, dom: 0.625, rec: 0.375 } },
    { v: 4, eq: { n: 4, het: 0.0625, dom: 0.53125, rec: 0.46875 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
