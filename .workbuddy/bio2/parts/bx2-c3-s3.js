/* 互动：滑块 = 复制次数 n；2ⁿ 个分子里恒有 2 个含 15N */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 520, h: 438 }, right: { x: 552, y: 16, w: 312, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1, G = null, MAX = 32;
  var OLD = "#b8402f", NEW = "#2f6fb0", TICK = "#9fb3c4", MUT = "#5a6472";

  /* 唯一真值：复制次数 → 分子构成 */
  function calc(v) {
    var n = Math.max(1, Math.min(5, Math.round(v))), t = Math.pow(2, n);
    return { n: n, total: t, hybrid: 2, pure: t - 2 };
  }

  /* 网格几何：按总数选列数，n=5 的 32 个分子才不会挤成一团 */
  function geom(v) {
    var s = calc(v), c = s.total;
    var cols = c <= 4 ? 2 : c <= 16 ? 4 : 8, rows = Math.ceil(c / cols);
    return { s: s, cols: cols, cw: (L.left.w - 44) / cols, ch: (L.left.h - 84) / rows,
      ox: L.left.x + 22, oy: L.left.y + 50 };
  }

  function wrap(parent, x, y, s, maxW, lh) {
    var per = Math.max(6, Math.floor(maxW / 9)), cur = "", lines = [], i;
    for (i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (i = 0; i < lines.length; i++) tx(parent, x, y + i * lh, lines[i], MUT, "start", 9, 400);
  }

  /* 一个 DNA 分子：两条平行线 + 碱基对小横线；旧链红、新链蓝 */
  function mol(parent, cx, cy, w, hybrid) {
    var g = 5, x1 = cx - w / 2, x2 = cx + w / 2, i, x;
    el("line", { x1: x1, y1: cy - g, x2: x2, y2: cy - g, stroke: hybrid ? OLD : NEW, "stroke-width": 2.2 }, parent);
    el("line", { x1: x1, y1: cy + g, x2: x2, y2: cy + g, stroke: NEW, "stroke-width": 2.2 }, parent);
    for (i = 0; i < 4; i++) {
      x = x1 + 6 + i * (w - 12) / 3;
      el("line", { x1: x, y1: cy - g + 1.5, x2: x, y2: cy + g - 1.5, stroke: TICK, "stroke-width": 1.3 }, parent);
    }
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), c, r, i, ry, rx, bw, s, w, LX = L.left.x, LY = L.left.y, LH = L.left.h, RX = L.right.x, RY = L.right.y;
    gA.textContent = ""; gB.textContent = "";
    G = geom(A); s = G.s; w = Math.min(G.cw - 12, 74);

    el("rect", { x: LX, y: LY, width: L.left.w, height: LH, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, LX + 20, LY + 28, "n = " + s.n + " 时的子代 DNA（共 " + s.total + " 个）", "#151a21", "start", 10.5, 700);
    tx(gA, LX + 20, LY + 44, "每条双链：一条旧链（红）+ 一条新链（蓝）；纯新的全是蓝", MUT, "start", 8.6, 400);
    for (c = 0; c < s.total; c++) {
      r = Math.floor(c / G.cols);
      mol(gA, G.ox + G.cw * ((c % G.cols) + 0.5), G.oy + G.ch * (r + 0.5), w, c < s.hybrid);
    }
    el("line", { x1: LX + 20, y1: LY + LH - 22, x2: LX + 40, y2: LY + LH - 22, stroke: OLD, "stroke-width": 2.4 }, gA);
    tx(gA, LX + 46, LY + LH - 14, "含 15N：2 个", OLD, "start", 8.8, 700);
    el("line", { x1: LX + 170, y1: LY + LH - 22, x2: LX + 190, y2: LY + LH - 22, stroke: NEW, "stroke-width": 2.4 }, gA);
    tx(gA, LX + 196, LY + LH - 14, "纯 14N：2ⁿ − 2 = " + s.pure + " 个", NEW, "start", 8.8, 700);

    el("rect", { x: RX, y: RY, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, RX + 18, RY + 28, "三个数怎么跟着 n 变", "#151a21", "start", 10.5, 700);
    rx = RX + 18; bw = L.right.w - 46;
    var rows = [["① 总数 = 2ⁿ = " + s.total, s.total, "#8fa3b5"],
      ["② 含 15N = 2（恒定，不随 n 变）", s.hybrid, OLD],
      ["③ 纯 14N = 2ⁿ − 2 = " + s.pure, s.pure, NEW]];
    for (i = 0; i < 3; i++) {
      ry = RY + 60 + i * 76;
      tx(gB, rx, ry, rows[i][0], "#3a3a35", "start", 8.8, 400);
      el("rect", { x: rx, y: ry + 8, width: Math.max(5, rows[i][1] / MAX * bw), height: 12, rx: 3, fill: rows[i][2] }, gB);
    }
    tx(gB, rx, RY + 300, "红条永远一样长——", MUT, "start", 9, 400);
    tx(gB, rx, RY + 316, "这就是「含 15N 恒为 2 个」。", MUT, "start", 9, 400);
    wrap(gB, rx, RY + 344, "n 每加 1，总数与纯 14N 都翻倍，只有红条不动：半保留复制把 2 条旧链永久保存下来。", bw, 15);
  }

  function render() {
    if (!G) { L = (stage.parentElement && stage.parentElement.getBoundingClientRect().width >= 640) ? W : N; G = geom(A); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.n);
    $("gxVb").textContent = String(s.total);
    $("gxVc").textContent = String(s.pure);
    if (s.n === 3) { st = "半保留成立"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "8 个里 2 个带 15N"; }
    else if (s.n < 3) { st = "刚开始"; col = "#b8791f"; bg = "#fdf3e0"; sn = "含 15N 仍为 2 个"; }
    else { st = "已稀释"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "个数不变，比例变小"; }
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
    G = null;
    render();
  }

  var apBadge = $("gxAp"), apTxt = $("gxApTxt");
  function setMode(m) {
    if (!apBadge) return;
    apBadge.classList.toggle("is-auto", m === "auto");
    apBadge.classList.toggle("is-manual", m !== "auto");
    if (apTxt) apTxt.textContent = m === "auto" ? "自动演示中" : "你接管了";
  }

  /* 停留帧压在 n=3（8 个分子里 2 个带 15N），停 2.4 秒 */
  var ap = AutoPilot.create({
    mount: stage,
    follow: $("gxSl"),
    loop: [{ t: 0, v: 1 }, { t: 1.4, v: 1 }, { t: 4.4, v: 3 }, { t: 6.8, v: 3 }, { t: 9.2, v: 5 }, { t: 11, v: 4 }, { t: 13, v: 1 }],
    keys: [1, 3, 4, 5],
    value: A, min: 1, max: 5, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1, eq: { total: 2, hybrid: 2, pure: 0 } },
    { v: 3, eq: { total: 8, hybrid: 2, pure: 6 } },
    { v: 5, eq: { total: 32, pure: 30 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
