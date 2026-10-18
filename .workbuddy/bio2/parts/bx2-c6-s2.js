/* 互动脚本本体（build-page.mjs 会包进 <script>，这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0, G = null;

  /* 纯函数：选择系数 s → 10 代后的有利基因频率。render 与 __bio.cases 共用 */
  function calc(v) {
    var s = +v || 0, p = 0.1, i;
    for (i = 0; i < 10; i++) p = p * (1 + s) / (1 + s * p);
    return { p: p, d: p - 0.1 };
  }

  function geom() {
    var wide = L.left.w > 400, tw = wide ? 178 : 148, gap = wide ? 18 : 14;
    return {
      wide: wide, tw: tw, gap: gap,
      tx0: L.left.x + (L.left.w - (tw * 2 + gap)) / 2,
      ty: L.left.y + (wide ? 54 : 44),
      th: wide ? 176 : 92,
      rx0: L.right.x + (wide ? 58 : 50),
      rx1: L.right.x + L.right.w - 30,
      ry0: L.right.y + (wide ? 76 : 66),
      ry1: L.right.y + (wide ? 300 : 240)
    };
  }

  function moth(g, x, y, dark, ring) {
    el("path", {
      d: "M0,-4 L-11,-12 L-9,-2 L0,5 L9,-2 L11,-12 Z",
      transform: "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")",
      fill: dark ? "#38383a" : "#f3eee1",
      stroke: dark ? "#1f1f22" : "#a89c84", "stroke-width": 1
    }, g);
    if (ring) el("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: 16, fill: "none", stroke: "#b8402f", "stroke-width": 1.6, "stroke-dasharray": "4 3" }, g);
  }

  function bird(g, x, y) {
    el("path", { d: "M" + x.toFixed(1) + "," + (y - 34).toFixed(1) + " l 11,26 l -22,0 z", fill: "#6b7280" }, g);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var r = calc(A), s = A, wide = G.wide;
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);

    /* ---------- 左：两种树干，谁更容易被发现 ---------- */
    var tw = G.tw, th = G.th, ty = G.ty, tx0 = G.tx0, tx1 = tx0 + tw + G.gap;
    tx(gA, L.left.x + 18, L.left.y + 26, "同一群蛾子，只换树干颜色", "#5a6472", "start", 10.5, 700);
    el("rect", { x: tx0, y: ty, width: tw, height: th, rx: 6, fill: "#cfc4ad", stroke: "#b3a68c" }, gA);
    el("rect", { x: tx1, y: ty, width: tw, height: th, rx: 6, fill: "#4b4a47", stroke: "#33322f" }, gA);
    var jx = [0.24, 0.74], jy = [0.28, 0.72], i, k;
    for (i = 0; i < 2; i++) {
      for (k = 0; k < 2; k++) {
        /* 浅色树干：深色蛾被圈出；深色树干：浅色蛾被圈出 */
        moth(gA, tx0 + tw * jx[k], ty + th * jy[i], k === 1, false);
        moth(gA, tx1 + tw * jx[k], ty + th * jy[i], k === 1, false);
      }
      moth(gA, tx0 + tw * jx[1], ty + th * jy[i], true, true);
      moth(gA, tx1 + tw * jx[0], ty + th * jy[i], false, true);
      bird(gA, tx0 + tw * jx[1], ty + th * jy[i]);
      bird(gA, tx1 + tw * jx[0], ty + th * jy[i]);
    }
    tx(gA, tx0 + tw / 2, ty + th + 18, "污染前 · 浅色树干", "#3a3a35", "middle", 9.4, 700);
    tx(gA, tx1 + tw / 2, ty + th + 18, "污染后 · 深色树干", "#3a3a35", "middle", 9.4, 700);
    tx(gA, tx0 + tw / 2, ty + th + 36, "红圈深色蛾显眼 → 先被吃", "#b8402f", "middle", 8.8, 400);
    tx(gA, tx1 + tw / 2, ty + th + 36, "红圈浅色蛾显眼 → 先被吃", "#b8402f", "middle", 8.8, 400);

    var base = ty + th;
    tx(gA, tx0, base + 58, "s = " + s.toFixed(2) + "：深色个体留下后代的机会是浅色的 " + (1 + s).toFixed(2) + " 倍", "#3a3a35", "start", 9, 700);
    var maxW = tw * 2 + G.gap, w1 = maxW * (1 + s) / 2, w2 = maxW * 0.5;
    tx(gA, tx0, base + 80, "深色个体（相对适合度 1+s）", "#38383a", "start", 8.8, 400);
    el("rect", { x: tx0, y: base + 84, width: maxW, height: 9, rx: 4, fill: "#eef2f6" }, gA);
    el("rect", { x: tx0, y: base + 84, width: Math.max(2, w1), height: 9, rx: 4, fill: "#38383a" }, gA);
    tx(gA, tx0, base + 102, "浅色个体（相对适合度 1）", "#6b7280", "start", 8.8, 400);
    el("rect", { x: tx0, y: base + 106, width: maxW, height: 9, rx: 4, fill: "#eef2f6" }, gA);
    el("rect", { x: tx0, y: base + 106, width: Math.max(2, w2), height: 9, rx: 4, fill: "#8a97a4" }, gA);
    tx(gA, tx0, base + 132, s < 0.001 ? "没有选择压力：两种蛾子留下后代的量一样" : "深色留下更多后代 → 深色基因频率逐代上升", "#2f8a5b", "start", 8.8, 700);
    tx(gA, tx0, base + 150, "表现型被选择，基因频率跟着变", "#6b7280", "start", 8.8, 400);

    /* ---------- 右：基因频率随世代上升 ---------- */
    var rx0 = G.rx0, rx1 = G.rx1, ry0 = G.ry0, ry1 = G.ry1;
    tx(gB, L.right.x + 20, L.right.y + 28, "有利基因频率 p 随世代上升", "#5a6472", "start", 10.5, 700);
    el("line", { x1: rx0, y1: ry0, x2: rx0, y2: ry1, stroke: "#c8d3dc", "stroke-width": 1.2 }, gB);
    el("line", { x1: rx0, y1: ry1, x2: rx1, y2: ry1, stroke: "#c8d3dc", "stroke-width": 1.2 }, gB);
    el("line", { x1: rx0, y1: (ry0 + ry1) / 2, x2: rx1, y2: (ry0 + ry1) / 2, stroke: "#e4ebf0", "stroke-width": 1, "stroke-dasharray": "4 4" }, gB);
    tx(gB, rx0 - 6, ry0 + 4, "100%", "#8a97a4", "end", 8.4, 400);
    tx(gB, rx0 - 6, (ry0 + ry1) / 2 + 4, "50%", "#8a97a4", "end", 8.4, 400);
    tx(gB, rx0 - 6, ry1 + 4, "0", "#8a97a4", "end", 8.4, 400);
    tx(gB, rx0, ry1 + 16, "第0代", "#8a97a4", "start", 8.6, 400);
    tx(gB, rx1, ry1 + 16, "第10代", "#8a97a4", "end", 8.6, 400);
    var pts = [], pp, n;
    for (n = 0; n <= 10; n++) {
      pp = 0.1;
      for (i = 0; i < n; i++) pp = pp * (1 + s) / (1 + s * pp);
      pts.push((rx0 + (rx1 - rx0) * n / 10).toFixed(1) + "," + (ry1 - (ry1 - ry0) * pp).toFixed(1));
    }
    el("polyline", { points: pts.join(" "), fill: "none", stroke: "#b8791f", "stroke-width": 2.4 }, gB);
    el("circle", { cx: rx1, cy: (ry1 - (ry1 - ry0) * r.p).toFixed(1), r: 3.4, fill: "#ffffff", stroke: "#b8791f", "stroke-width": 1.8 }, gB);

    var by0 = ry1 + (wide ? 42 : 34), by1 = by0 + 26, bw = rx1 - rx0;
    tx(gB, rx0, by0 - 6, "第 0 代：有利基因 10.0%", "#5a6472", "start", 8.8, 400);
    el("rect", { x: rx0, y: by0, width: bw, height: 9, rx: 4, fill: "#eef2f6" }, gB);
    el("rect", { x: rx0, y: by0, width: bw * 0.1, height: 9, rx: 4, fill: "#8a97a4" }, gB);
    tx(gB, rx0, by1 - 6, "第 10 代：有利基因 " + (r.p * 100).toFixed(1) + "%", "#5a6472", "start", 8.8, 400);
    el("rect", { x: rx0, y: by1, width: bw, height: 9, rx: 4, fill: "#eef2f6" }, gB);
    el("rect", { x: rx0, y: by1, width: Math.max(2, bw * r.p), height: 9, rx: 4, fill: "#b8791f" }, gB);
    tx(gB, rx0, by1 + 30, "选择让有利基因逐代积累", "#2f8a5b", "start", 8.8, 700);
    tx(gB, rx0, by1 + 46, "个体的基因没变，是种群的基因频率变了", "#6b7280", "start", 8.6, 400);

    /* ---------- 数值卡 ---------- */
    var st, col, bg, sn;
    $("gxVa").textContent = s.toFixed(2);
    $("gxVb").textContent = (r.p * 100).toFixed(1) + "%";
    $("gxVc").textContent = "+" + (r.d * 100).toFixed(1);
    if (s < 0.001) { st = "没有选择"; col = "#b8402f"; bg = "#fbeae7"; sn = "频率保持 10.0%"; }
    else if (s < 0.3) { st = "上升缓慢"; col = "#b8791f"; bg = "#fdf3e0"; sn = "选择压力较小"; }
    else if (s < 0.75) { st = "上升明显"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "10 代翻了数倍"; }
    else { st = "迅速上升"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "趋近固定"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
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
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4.4, v: 0.5 }, { t: 6.5, v: 0.5 }, { t: 9, v: 1 }, { t: 11, v: 0.75 }, { t: 13, v: 0 }],
    keys: [0, 0.5, 0.75, 1],
    value: A, min: 0, max: 1, step: 0.05,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { p: 0.1 } },
    { v: 0.5, eq: { p: 0.865 } },
    { v: 1, eq: { p: 0.9913 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
