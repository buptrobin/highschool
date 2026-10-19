/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = {
    vb: "0 0 880 470",
    left: { x: 16, y: 16, w: 424, h: 438 },
    right: { x: 456, y: 16, w: 408, h: 438 },
    cfg: { x0: 46, base: 348, maxH: 216, bw: 54, gap: 12, axisTop: 112 }
  };
  var N = {
    vb: "0 0 360 700",
    left: { x: 8, y: 8, w: 344, h: 316 },
    right: { x: 8, y: 336, w: 344, h: 356 },
    cfg: { x0: 26, base: 244, maxH: 138, bw: 42, gap: 8, axisTop: 70 }
  };
  var L = W, A = 20;

  var BLUE = "#0891b2", BLUE_SOFT = "#ecfbff";
  var AMBER = "#b8791f", AMBER_SOFT = "#fdf3e0";
  var RED = "#b8402f", GREEN = "#2f8a5b";

  var NAMES = ["创新", "协调", "绿色", "开放", "共享"];

  /* 纯函数：创新得分 → 综合水平（木桶=最短的板） */
  function calc(v) {
    var x = Math.max(20, Math.min(100, +v));
    return { innov: x, others: 60, total: Math.min(x, 60) };
  }

  function stateOf(x) {
    if (x < 60) return { name: "短板在创新", sn: "创新得分低于其他四项，综合水平被它拖住", col: RED, bg: "#fbeae7" };
    return { name: "短板转移", sn: "创新上来了，但其他四项只有 60 分，水位仍卡在 60", col: AMBER, bg: AMBER_SOFT };
  }

  function panel(g, r, edge) {
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#f8fbfd", stroke: edge }, g);
  }

  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var s = calc(A), st = stateOf(A), c = L.cfg, l = L.left, r = L.right;

    var vals = [s.innov, 60, 60, 60, 60];
    var minV = Math.min.apply(null, vals);

    /* ---------------- 左：五块板 ---------------- */
    panel(gA, l, "#dbe7ef");
    tx(gA, l.x + 20, l.y + 30, "五块板：谁最短，水位就停在哪", "#5a6472", "start", 11, 700);
    tx(gA, l.x + 20, l.y + 49, "横轴是五个理念，纵轴是得分（0–100）", "#9aa3ae", "start", 9.2, 400);

    var x0 = l.x + c.x0, base = l.y + c.base, maxH = c.maxH, bw = c.bw, gap = c.gap;
    /* 60 分参考线 */
    var y60 = base - 60 / 100 * maxH;
    el("line", { x1: x0 - 8, y1: y60, x2: x0 + 5 * (bw + gap), y2: y60, stroke: "#c9d2da", "stroke-width": 1, "stroke-dasharray": "4 4" }, gA);
    tx(gA, x0 + 5 * (bw + gap), y60 - 6, "60 分", "#8a949e", "end", 8.4);

    for (var i = 0; i < 5; i++) {
      var bx = x0 + i * (bw + gap);
      var bh = Math.max(2, vals[i] / 100 * maxH);
      var isMin = vals[i] === minV;
      el("rect", { x: bx, y: base - maxH, width: bw, height: maxH, rx: 5, fill: "#ffffff", stroke: "#e2e8ee" }, gA);
      el("rect", { x: bx, y: base - bh, width: bw, height: bh, rx: 5,
                   fill: isMin ? AMBER_SOFT : BLUE_SOFT, stroke: isMin ? AMBER : BLUE, "stroke-width": isMin ? 1.8 : 1.2 }, gA);
      tx(gA, bx + bw / 2, base - bh - 7, String(Math.round(vals[i])), isMin ? AMBER : BLUE, "middle", 9.6, 700);
      tx(gA, bx + bw / 2, base + 18, NAMES[i], "#3a3a35", "middle", 9.2, 600);
    }

    /* 水位线：综合水平 */
    var yW = base - s.total / 100 * maxH;
    el("line", { x1: x0 - 8, y1: yW, x2: x0 + 5 * (bw + gap), y2: yW + 0, stroke: GREEN, "stroke-width": 1.6, "stroke-dasharray": "6 3" }, gA);
    tx(gA, x0 - 6, yW - 6, "水位 " + Math.round(s.total), GREEN, "end", 8.8, 700);

    tx(gA, l.x + 20, l.y + l.h - 22, "四块板固定在 60 分，只动“创新”这一块。", "#6b7280", "start", 8.8);

    /* ---------------- 右：水位读数 + 五块板清单 ---------------- */
    panel(gB, r, "#e6e9ee");
    tx(gB, r.x + 20, r.y + 30, "综合水平：由最短的板决定", "#5a6472", "start", 11, 700);
    tx(gB, r.x + 20, r.y + 52, "五块板一样高，水位才上得去", "#9aa3ae", "start", 9.2, 400);

    el("rect", { x: r.x + 20, y: r.y + 70, width: r.w - 40, height: 84, rx: 8, fill: st.bg, stroke: st.col + "44" }, gB);
    tx(gB, r.x + 34, r.y + 94, "综合水平", "#5a6472", "start", 8.8);
    tx(gB, r.x + 34, r.y + 128, String(Math.round(s.total)), st.col, "start", 28, 700);
    tx(gB, r.x + 120, r.y + 119, st.name, st.col, "start", 12.5, 700);
    tx(gB, r.x + 120, r.y + 139, "满分 100", "#6b7280", "start", 8.8);

    var rowY = r.y + 176;
    var step = L === W ? 34 : 30;
    for (var j = 0; j < 5; j++) {
      var yy = rowY + j * step;
      var v = j === 0 ? s.innov : 60;
      var short = v === minV;
      tx(gB, r.x + 24, yy + 14, NAMES[j], "#3a3a35", "start", 9.6, 600);
      el("rect", { x: r.x + 78, y: yy + 3, width: r.w - 150, height: 16, rx: 4, fill: "#eef2f6" }, gB);
      el("rect", { x: r.x + 78, y: yy + 3, width: (r.w - 150) * v / 100, height: 16, rx: 4,
                   fill: short ? AMBER_SOFT : BLUE_SOFT, stroke: short ? AMBER : BLUE }, gB);
      tx(gB, r.x + r.w - 28, yy + 15, String(Math.round(v)), short ? AMBER : BLUE, "end", 9.4, 700);
    }

    wrap(gB, r.x + 20, r.y + r.h - (L === W ? 52 : 20), "只补一块板，水还是从最短的那块漏出去——新发展理念要一体坚持、一体贯彻。", r.w - 40, 9, "#6b7280", 14);
  }

  function render() {
    var s = calc(A), st = stateOf(A);
    $("gxVa").textContent = Math.round(s.innov);
    $("gxVb").textContent = String(s.others);
    $("gxVc").textContent = String(Math.round(s.total));
    $("gxVs").textContent = st.name;
    $("gxVsn").textContent = st.sn;
    $("gxStBox").style.background = st.bg;
    $("gxStBox").style.borderColor = st.col + "44";
    $("gxVs").style.color = st.col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
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
    loop: [{ t: 0, v: 20 }, { t: 1.2, v: 20 }, { t: 4, v: 80 }, { t: 6.5, v: 80 }, { t: 9, v: 95 }, { t: 11, v: 95 }, { t: 13, v: 20 }],
    keys: [20, 60, 80, 95],
    value: A, min: 20, max: 100, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 30, eq: { innov: 30, others: 60, total: 30 } },
    { v: 60, eq: { innov: 60, others: 60, total: 60 } },
    { v: 90, eq: { innov: 90, others: 60, total: 60 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
