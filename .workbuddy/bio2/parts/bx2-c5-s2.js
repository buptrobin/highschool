/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 3, G = null;

  /* 纯函数：参数 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var n = Math.round(v);
    if (n < 1) n = 1;
    if (n > 6) n = 6;
    var kind = n === 1 ? 1 : n === 2 ? 2 : 3;   /* 1 单倍体 2 二倍体 3 多倍体 */
    var fert = n > 1 && n % 2 === 0 ? 1 : 0;    /* 偶数组可育，奇数组联会紊乱 */
    return { sets: n, kind: kind, fert: fert };
  }

  function nm(n) {
    return n === 1 ? "单倍体" : n === 2 ? "二倍体" : n === 3 ? "三倍体"
      : n === 4 ? "四倍体" : n === 5 ? "五倍体" : "六倍体";
  }

  /* 版面几何：只跟 L 有关，与 n 无关 */
  function geom() {
    return {
      lx: L.left.x + 24, ly: L.left.y + 46, lw: L.left.w - 48, lh: L.left.h - 70,
      rx: L.right.x + 24, ry: L.right.y + 46, rw: L.right.w - 48, rh: L.right.h - 70
    };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var n = A, i, j;

    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, L.left.x + 20, L.left.y + 28, "体细胞：3 种染色体 × " + n + " 组", "#5a6472", "start", 10.5, 700);
    tx(gB, L.right.x + 20, L.right.y + 28, "联会：同源染色体能不能两两配对", "#5a6472", "start", 10.5, 700);

    /* 左：n 套染色体，每套「长中短各一条」；同长同色 = 同源 */
    var gap = 10, bw = Math.min(120, (G.lw - (n - 1) * gap) / n);
    var step = bw + gap, total = n * bw + (n - 1) * gap;
    var sx = G.lx + Math.max(0, (G.lw - total) / 2), y0 = G.ly + 30;
    var cols = ["#4a7fb5", "#5aa06f", "#c98a2e"], lens = [1, 0.72, 0.5];
    el("rect", { x: sx - 7, y: y0 - 9, width: bw + 14, height: 78, rx: 8, fill: "none", stroke: "#9db4c6" }, gA);
    tx(gA, sx - 7, y0 - 14, "1 个染色体组", "#7a848f", "start", 8.4, 400);
    for (i = 0; i < n; i++) {
      for (j = 0; j < 3; j++) {
        el("rect", { x: sx + i * step, y: y0 + j * 22, width: Math.max(9, bw * lens[j]), height: 9, rx: 4, fill: cols[j] }, gA);
      }
    }
    wrap(gA, L.left.x + 20, L.left.y + L.left.h - 46, "同长同色 = 同源染色体；长短各一条 = 1 个染色体组，共 " + n + " 组、" + (3 * n) + " 条。", G.lw + 8, 8.8, "#3a3a35", 14);

    /* 右：n 条同一种染色体，看能不能两两联会 */
    var barW = Math.max(60, Math.min(200, G.rw * 0.62));
    var bx = G.rx + 6, by = G.ry + 26, bs = 22;
    for (i = 0; i < n; i++) {
      el("rect", { x: bx, y: by + i * bs, width: barW, height: 10, rx: 5, fill: "#4a7fb5" }, gB);
    }
    var annX = bx + barW + 14, yV = by + (n - 1) * bs + 34, p, y1, y2;
    if (n === 1) {
      tx(gB, bx, yV, "✗ 没有同源染色体，不能联会", "#b8402f", "start", 9.6, 700);
      wrap(gB, bx, yV + 18, "减数分裂不能正常进行，无法形成正常配子 → 高度不育。", G.rw, 8.8, "#3a3a35", 14);
    } else if (n % 2 === 0) {
      for (p = 0; p < n / 2; p++) {
        y1 = by + p * 2 * bs + 5; y2 = y1 + bs;
        el("path", { d: "M" + annX + " " + y1 + " H" + (annX + 9) + " V" + y2 + " H" + annX, fill: "none", stroke: "#2f8a5b", "stroke-width": 1.4 }, gB);
      }
      tx(gB, bx, yV, "✓ 两两配对：分成 " + (n / 2) + " 对 → 可育", "#2f8a5b", "start", 9.6, 700);
      wrap(gB, bx, yV + 18, "同源染色体两两联会，能形成正常配子。", G.rw, 8.8, "#3a3a35", 14);
    } else {
      for (p = 0; p < n - 1; p++) {
        y1 = by + p * bs + 5; y2 = y1 + bs;
        el("path", { d: "M" + annX + " " + y1 + " V" + y2, fill: "none", stroke: "#d9a79e", "stroke-width": 1.2 }, gB);
      }
      tx(gB, bx, yV, "✗ " + n + " 条同源染色体无法两两配对", "#b8402f", "start", 9.6, 700);
      wrap(gB, bx, yV + 18, "联会紊乱 → 不能形成正常配子，高度不育。", G.rw, 8.8, "#3a3a35", 14);
    }
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    var n = s.sets;
    $("gxVa").textContent = String(n);
    $("gxVb").textContent = String(n * 3);
    $("gxVc").textContent = s.fert ? String(n / 2) : "0";
    if (n === 1) { st = "单倍体"; col = "#b8402f"; bg = "#fbeae7"; sn = "无同源染色体，高度不育"; }
    else if (n % 2 === 0) { st = nm(n); col = "#2f8a5b"; bg = "#e6f6ee"; sn = "偶数组，两两配对，可育"; }
    else { st = nm(n); col = "#b8402f"; bg = "#fbeae7"; sn = "联会紊乱，高度不育"; }
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 2.6, v: 2 }, { t: 4.4, v: 5 },
           { t: 6.4, v: 3 }, { t: 8.8, v: 3 }, { t: 10.6, v: 4 }, { t: 12.8, v: 1 }],
    keys: [1, 2, 3, 4],
    value: A, min: 1, max: 6, step: 1,
    idle: 5000,
    onChange: function (v) { A = calc(v).sets; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1, eq: { sets: 1, kind: 1, fert: 0 } },
    { v: 2, eq: { sets: 2, kind: 2, fert: 1 } },
    { v: 3, eq: { sets: 3, kind: 3, fert: 0 } },
    { v: 4, eq: { sets: 4, kind: 3, fert: 1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
