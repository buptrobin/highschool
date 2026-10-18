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

  /* 组合数 C(n,k)，连乘实现 */
  function C(n, k) {
    if (k < 0 || k > n) return 0;
    var r = 1, i;
    for (i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }

  /* 纯函数：n → 数值。render() 和 __model.cases 都用它 */
  function calc(v) {
    var n = Math.max(0, Math.min(6, Math.round(v)));
    var row = [], k;
    for (k = 0; k <= n; k++) row.push(C(n, k));
    var sum = 0;
    for (k = 0; k < row.length; k++) sum += row[k];
    var mid = C(n, Math.floor(n / 2));
    return { n: n, row: row, sum: sum, mid: mid, terms: n + 1, exp: Math.pow(2, n) };
  }

  function geom() {
    if (L === N) {
      return {
        tri: { cx: 180, y0: 58, dy: 30, sp: 44, bw: 36, bh: 22 },
        bar: { x0: 46, base: 628, k: 250 / 64, step: 43, bw: 28 }
      };
    }
    return {
      tri: { cx: 228, y0: 78, dy: 40, sp: 46, bw: 38, bh: 24 },
      bar: { x0: 500, base: 372, k: 276 / 64, step: 44, bw: 32 }
    };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw(s) {
    var gA = $("gxA"), gB = $("gxB"), p = L.left, q = L.right, T = G.tri, B = G.bar;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: q.x, y: q.y, width: q.w, height: q.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, p.x + 18, p.y + 26, "杨辉三角 · 第 " + s.n + " 行（n+1 = " + s.terms + " 个数）", "#5a6472", "start", 10.5, 700);
    tx(gB, q.x + 18, q.y + 26, "系数和 2ⁿ：n 每加 1 就翻一倍", "#5a6472", "start", 10.5, 700);

    /* 左：杨辉三角长到第 n 行，最大系数标绿 */
    var r, k, cx, cy, val, isMid;
    for (r = 0; r <= s.n; r++) {
      for (k = 0; k <= r; k++) {
        cx = T.cx - (r * T.sp) / 2 + k * T.sp;
        cy = T.y0 + r * T.dy;
        val = C(r, k);
        isMid = (r === s.n) && (val === s.mid);
        el("rect", {
          x: cx - T.bw / 2, y: cy - T.bh / 2, width: T.bw, height: T.bh, rx: 5,
          fill: r === s.n ? (isMid ? "#e6f6ee" : "#eaf0fb") : "#ffffff",
          stroke: r === s.n ? (isMid ? "#8fd0ae" : "#b6c9ea") : "#e2e8ef"
        }, gA);
        tx(gA, cx, cy + 4, String(val),
          r === s.n ? (isMid ? "#1c6b45" : "#2563eb") : "#7b8694",
          "middle", isMid ? 11 : 9.6, isMid ? 700 : 400);
      }
    }
    tx(gA, p.x + 18, p.y + p.h - 46, "首尾为 1、左右对称；中间项看 n 的奇偶", "#7b8694", "start", 9.2, 400);
    tx(gA, p.x + 18, p.y + p.h - 28, "最大系数 C(n,⌊n/2⌋) = " + s.mid, "#1c6b45", "start", 9.2, 700);

    /* 右：2ⁿ 的柱状图，坐标轴带箭头与刻度 */
    var xEnd = B.x0 + 6 * B.step + B.bw / 2 + 10;
    el("line", { x1: B.x0 - 26, y1: B.base, x2: xEnd, y2: B.base, stroke: "#9aa5b1", "stroke-width": 1.2 }, gB);
    el("polygon", { points: xEnd + "," + (B.base - 4) + " " + (xEnd + 8) + "," + B.base + " " + xEnd + "," + (B.base + 4), fill: "#9aa5b1" }, gB);
    el("line", { x1: B.x0 - 26, y1: B.base, x2: B.x0 - 26, y2: B.base - 64 * B.k - 30, stroke: "#9aa5b1", "stroke-width": 1.2 }, gB);
    for (r = 0; r <= 6; r++) {
      var h = Math.pow(2, r) * B.k, bx = B.x0 + r * B.step, on = r <= s.n;
      el("rect", {
        x: bx - B.bw / 2, y: B.base - h, width: B.bw, height: h, rx: 3,
        fill: r === s.n ? "#2563eb" : (on ? "#9dc0f0" : "#e8edf4"),
        stroke: r === s.n ? "#2563eb" : (on ? "#9dc0f0" : "#e8edf4")
      }, gB);
      tx(gB, bx, B.base - h - 6, String(Math.pow(2, r)), r === s.n ? "#2563eb" : "#8b95a3", "middle", 8.6, r === s.n ? 700 : 400);
      tx(gB, bx, B.base + 14, String(r), r === s.n ? "#2563eb" : "#8b95a3", "middle", 8.6, r === s.n ? 700 : 400);
    }
    tx(gB, B.x0 - 36, B.base - 64 * B.k - 40, "和", "#8b95a3", "start", 9, 400);
    tx(gB, xEnd - 6, B.base + 14, "n", "#8b95a3", "middle", 9, 400);
    tx(gB, q.x + 18, q.y + q.h - 42, "n=4：1+4+6+4+1 = 16 = 2⁴", "#1c6b45", "start", 9.4, 700);
    tx(gB, q.x + 18, q.y + q.h - 24, "系数和是 2ⁿ 不是 2n：2n 只有 8", "#b8402f", "start", 9.4, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    A = Math.max(0, Math.min(6, Math.round(A)));
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.n);
    $("gxVb").textContent = String(s.sum);
    $("gxVc").textContent = String(s.mid);
    if (s.n === 0) {
      st = "只有一项"; col = "#2563eb"; bg = "#eaf0fb"; sn = "(a+b)⁰=1，系数和 1";
    } else if (s.n % 2 === 0) {
      st = "系数成对对称"; col = "#2f8a5b"; bg = "#e6f6ee";
      sn = "中间的 " + s.mid + " 最大（第 " + (s.n / 2 + 1) + " 项）";
    } else {
      st = "中间两项并列"; col = "#b8791f"; bg = "#fdf3e0";
      sn = "第 " + (s.n + 1) / 2 + "、第 " + (s.n + 3) / 2 + " 项并列，最大 " + s.mid;
    }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
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

  var ap = AutoPilot.create({
    mount: stage,
    follow: $("gxSl"),
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 4 }, { t: 6.5, v: 4 }, { t: 9, v: 6 }, { t: 11.5, v: 3 }, { t: 13.5, v: 0 }],
    keys: [0, 4, 6],
    value: A, min: 0, max: 6, step: 1,
    idle: 5000,
    onChange: function (v) { A = Math.round(v); render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 2, eq: { sum: 4, mid: 2 } },
    { v: 4, eq: { sum: 16, mid: 6 } },
    { v: 6, eq: { sum: 64, mid: 20 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
