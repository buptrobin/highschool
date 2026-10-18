/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", L: { x: 16, y: 16, w: 424, h: 438 }, R: { x: 456, y: 16, w: 408, h: 438 },
    cap: 40, chipY: 74, chipX0: 62, chipDx: 40, chipR: 12, base: 300, colX: 58, colDx: 46, cw: 30, ch: 28,
    f1: 348, f2: 374, f3: 400, rA: 96, rC: 136, rEq: 176, dotY: 222, dotDx: 34, dotR: 8,
    rn1: 322, rn2: 352, rn3: 382, rn4: 412 };
  var N = { vb: "0 0 360 700", L: { x: 8, y: 8, w: 344, h: 300 }, R: { x: 8, y: 320, w: 344, h: 372 },
    cap: 24, chipY: 50, chipX0: 36, chipDx: 34, chipR: 10, base: 186, colX: 38, colDx: 36, cw: 24, ch: 22,
    f1: 214, f2: 236, f3: 258, rA: 374, rC: 404, rEq: 432, dotY: 468, dotDx: 30, dotR: 7,
    rn1: 556, rn2: 590, rn3: 622, rn4: 654 };
  var L = W, G = null, M = 3;
  var NAMES = ["甲", "乙", "丙", "丁", "戊"];

  /* 纯函数：参数 → 数值。render() 和 __model.cases 都用它 */
  function calc(v) {
    var m = Math.round(v);
    if (m < 1) m = 1;
    if (m > 5) m = 5;
    var A = 1, i, f = 1;
    for (i = 0; i < m; i++) A *= 5 - i;      /* A(5,m) = 5·4·…·(5−m+1) */
    for (i = 2; i <= m; i++) f *= i;         /* m! */
    return { m: m, A: A, C: A / f, f: f };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function geom() {
    var chips = [], cols = [], i;
    for (i = 0; i < 5; i++) chips.push({ x: L.chipX0 + i * L.chipDx, y: L.chipY });
    for (i = 0; i < 5; i++) cols.push({ x: L.colX + i * L.colDx, n: 5 - i });
    return { chips: chips, cols: cols };
  }

  /* 左：排列 A —— 每个位置一列候选，放回一个就少一个 */
  function drawA(m) {
    var g = $("gxA"); g.textContent = "";
    el("rect", { x: L.L.x, y: L.L.y, width: L.L.w, height: L.L.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, g);
    tx(g, L.L.x + 20, L.L.y + L.cap, "A(5,m)：m 个位置，越往后候选越少", "#5a6472", "start", 10.5, 700);
    var i, j;
    for (i = 0; i < 5; i++) {
      var on = i < m;
      el("circle", { cx: G.chips[i].x, cy: G.chips[i].y, r: L.chipR, fill: on ? "#eaf1fd" : "#f2f4f7",
        stroke: on ? "#2563eb" : "#c3ccd7" }, g);
      tx(g, G.chips[i].x, G.chips[i].y + 3.5, NAMES[i], on ? "#151a21" : "#8a939f", "middle", 9.5, 400);
    }
    for (i = 0; i < m; i++) {
      var c = G.cols[i], n = c.n, k;
      for (j = 0; j < n; j++) {
        el("rect", { x: c.x, y: L.base - (j + 1) * L.ch, width: L.cw, height: L.ch - 4, rx: 4,
          fill: "#dbe8fd", stroke: "#2563eb" }, g);
      }
      tx(g, c.x + L.cw / 2, L.base - n * L.ch - 8, String(n), "#2563eb", "middle", 11, 700);
      tx(g, c.x + L.cw / 2, L.base + 16, "第" + (i + 1) + "位", "#5a6472", "middle", 9, 400);
    }
    tx(g, L.L.x + 20, L.L.y + L.f1 - 10, m >= 5 ? "" : "还空着 " + (5 - m) + " 列：m 只取了 " + m + " 个", "#b8791f", "start", 9.2, 400);
    tx(g, L.L.x + 20, L.L.y + L.f1 + 4, "A(5," + m + ") = " + chain(m) + " = " + calc(m).A, "#2563eb", "start", 12.5, 700);
    tx(g, L.L.x + 20, L.L.y + L.f2, "位置个数 = m = " + m + "，所以连乘 m 个因子", "#3a3a35", "start", 9.6, 400);
    tx(g, L.L.x + 20, L.L.y + L.f3, "有序：换个位置就是另一种安排", "#b8402f", "start", 9.6, 400);
  }

  function chain(m) {
    var a = [], i;
    for (i = 0; i < m; i++) a.push(String(5 - i));
    return a.join("×");
  }

  /* 右：组合 C —— 同一团并成一个点，A 除以 m! */
  function drawC(m) {
    var s = calc(m), g = $("gxB"); g.textContent = "";
    el("rect", { x: L.R.x, y: L.R.y, width: L.R.w, height: L.R.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, g);
    tx(g, L.R.x + 20, L.R.y + L.cap, "C(5,m)：同一团不排序，除以 m!", "#5a6472", "start", 10.5, 700);
    tx(g, L.R.x + 20, L.R.y + L.rA, "A(5," + m + ") = " + s.A, "#2563eb", "start", 13, 700);
    tx(g, L.R.x + 20, L.R.y + L.rC, "C(5," + m + ") = " + s.C, "#2f8a5b", "start", 13, 700);
    tx(g, L.R.x + 20, L.R.y + L.rEq, s.A + " ÷ " + m + "! = " + s.A + " ÷ " + s.f + " = " + s.C,
      "#b8791f", "start", 10.5, 700);
    /* 一个点 = 一个组合 */
    var per = 5, i, r, c;
    for (i = 0; i < s.C; i++) {
      r = Math.floor(i / per); c = i % per;
      el("circle", { cx: L.R.x + 26 + c * L.dotDx, cy: L.R.y + L.dotY + r * L.dotDx, r: L.dotR,
        fill: "#e6f6ee", stroke: "#2f8a5b" }, g);
    }
    tx(g, L.R.x + 20, L.R.y + L.rn1, "每个圆点 = 1 个组合，共 " + s.C + " 个", "#3a3a35", "start", 9.6, 400);
    tx(g, L.R.x + 20, L.R.y + L.rn2, "对称：C(5," + m + ") = C(5," + (5 - m) + ")", "#2f8a5b", "start", 9.6, 700);
    tx(g, L.R.x + 20, L.R.y + L.rn3, m === 1 ? "m=1 时 m!=1，A 与 C 碰巧相等" : "同一团被数了 m! 遍，除以它才是团",
      "#5a6472", "start", 9.2, 400);
    wrap(g, L.R.x + 20, L.R.y + L.rn4, "组合数 = 排列数 ÷ m!，这是 A 与 C 唯一的换算关系。", L.R.w - 40, 9.2, "#8a939f", 13);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(M), st, col, bg, sn;
    $("gxVa").textContent = String(s.m);
    $("gxVb").textContent = String(s.A);
    $("gxVc").textContent = String(s.C);
    if (s.m === 1) { st = "A 与 C 相等"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "1! = 1，这里没有区别"; }
    else if (s.m < 5) { st = "有序 A / 无序 C"; col = "#2563eb"; bg = "#eaf1fd"; sn = "A 是 C 的 " + s.m + "! 倍"; }
    else { st = "全排列 n!"; col = "#b8791f"; bg = "#fdf3e0"; sn = "C(5,5)=1，只剩一种取法"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    drawA(s.m); drawC(s.m);
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 2.6, v: 2 }, { t: 4, v: 3 }, { t: 6.5, v: 3 },
      { t: 9, v: 5 }, { t: 11.5, v: 4 }, { t: 13.5, v: 1 }],
    keys: [1, 3, 5],
    value: M, min: 1, max: 5, step: 1,
    idle: 5000,
    onChange: function (v) { M = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 2, eq: { A: 20, C: 10 } },
    { v: 3, eq: { A: 60, C: 10 } },
    { v: 5, eq: { A: 120, C: 1 } }
  ] };

  /* 点画布 → 跳到下一个关键值 */
  var KEYS = [1, 3, 5];
  function jump() {
    var nv = KEYS[0], i;
    for (i = 0; i < KEYS.length; i++) { if (KEYS[i] > M) { nv = KEYS[i]; break; } }
    var sl = $("gxSl");
    if (sl) { sl.value = String(nv); }
    M = nv; render();
  }
  stage.addEventListener("click", jump);
  stage.addEventListener("keydown", function (e) {
    var sl = $("gxSl");
    if (!sl) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      var d = e.key === "ArrowRight" ? 1 : -1, nv = Math.min(5, Math.max(1, Math.round(M) + d));
      sl.value = String(nv); M = nv; render(); e.preventDefault();
    }
  });

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
