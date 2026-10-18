/* bx2-c5-s1 基因突变与基因重组：插入碱基数 k → 是否移码 + 受影响的氨基酸数 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;
  function tx(g, x, y, s, c, a, f, w) { GX.tx(g, x, y, s, c, a || "start", f || 8.6, w || 400); }

  /* 宽屏 880×340 / 窄屏独立 360×640 */
  var W = { vb: "0 0 880 340", left: { x: 16, y: 16, w: 424, h: 308 }, right: { x: 456, y: 16, w: 408, h: 308 } };
  var N = { vb: "0 0 360 640", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 300 } };
  var L = W, G = null, A = 1, UP = "ATGCCT", DN = "AGGTACAGG";

  /* 纯函数：唯一真值 */
  function calc(v) {
    var k = Math.min(6, Math.max(0, Math.round(v)));
    var sh = k % 3 === 0 ? 0 : 1;
    return { k: k, shifted: sh, changed: k === 0 ? 0 : (sh ? 200 : k / 3) };
  }

  function geom() {
    var Lx = L.left, wide = L === W;
    return { bx: Lx.x + 20, bw: Lx.w - 40, sx: Lx.x + 70, cw: Math.floor((Lx.w - 90) / 15),
      by: Lx.y + (wide ? 68 : 64), bh: wide ? 26 : 22, sy: Lx.y + (wide ? 124 : 126),
      ch: wide ? 32 : 26, ly: Lx.y + (wide ? 214 : 202), lh: wide ? 22 : 18 };
  }

  function pick(i, k, sh) {
    if (i < 6) return ["#eaf4fb", "#b9d5e8"];
    if (i < 6 + k) return ["#f6c76a", "#d99a1f"];
    return sh ? ["#fdeee9", "#e0a996"] : ["#eafaf0", "#bfe0cd"];
  }

  function draw() {
    var s = calc(A), k = s.k, sh = s.shifted, g = G, i, x, c;
    var gA = $("gxA"), gB = $("gxB"), Lx = L.left, Rx = L.right;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: Lx.x, y: Lx.y, width: Lx.w, height: Lx.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: Rx.x, y: Rx.y, width: Rx.w, height: Rx.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, g.bx, Lx.y + 28, "基因：900 bp = 300 个密码子", "#5a6472", "start", 10.5, 700);

    /* 900 bp 长带子：上游 100 个密码子 / 插入点 / 下游 200 个密码子 */
    var cut = g.bx + g.bw / 3;
    el("rect", { x: g.bx, y: g.by, width: g.bw / 3, height: g.bh, rx: 4, fill: "#eaf4fb", stroke: "#b9d5e8" }, gA);
    el("rect", { x: cut, y: g.by, width: g.bw * 2 / 3, height: g.bh, rx: 4,
      fill: sh ? "#fdeee9" : "#eafaf0", stroke: sh ? "#e0a996" : "#bfe0cd" }, gA);
    tx(gA, g.bx, g.by + g.bh + 16, "上游 100 个密码子", "#3d6f9e");
    tx(gA, cut + 6, g.by + g.bh + 16, sh ? "下游 200 个：全变" : "下游 200 个", sh ? "#a8402c" : "#2f8a5b");
    if (k) {
      el("polygon", { points: (cut - 7) + "," + (g.by - 14) + " " + (cut + 7) + "," + (g.by - 14) + " " + cut + "," + (g.by - 2), fill: "#d99a1f" }, gA);
      tx(gA, cut, g.by - 20, "插入 " + k + " 个碱基", "#8a5a00", "middle", 9, 700);
    } else tx(gA, cut, g.by - 8, "未插入", "#2f8a5b", "middle", 9, 700);

    /* 插入点后的碱基带子：一排小格，三格一组（错位格） */
    for (i = 0; i < 15; i++) {
      c = pick(i, k, sh);
      x = g.sx + i * g.cw;
      el("rect", { x: x, y: g.sy, width: g.cw - 1, height: g.ch, rx: 3, fill: c[0], stroke: c[1] }, gA);
      tx(gA, x + (g.cw - 1) / 2, g.sy + g.ch * 0.68,
        (i < 6 ? UP.charAt(i) : (i < 6 + k ? "G" : DN.charAt(i - 6 - k))) || "·",
        i < 6 ? "#2c3540" : (i < 6 + k ? "#8a5a00" : (sh ? "#a8402c" : "#2c3540")), "middle", 11, 700);
    }
    for (i = 0; i < 5; i++) {
      x = g.sx + i * 3 * g.cw;
      el("line", { x1: x + 2, y1: g.sy + g.ch + 3, x2: x + 3 * g.cw - 3, y2: g.sy + g.ch + 3, stroke: "#8fa0b0", "stroke-width": 1.5 }, gA);
    }
    tx(gA, g.bx, g.ly, sh && k ? "插入点之后三格一组的字母整体右移 → 移码" : "三格一组＝1 个密码子，界线不动",
      sh && k ? "#a8402c" : "#2f8a5b");
    tx(gA, g.bx, g.ly + g.lh, "橙色异色格＝刚才插进来的碱基（k = " + k + "）", "#8a5a00");
    tx(gA, g.bx, g.ly + 2 * g.lh, "替换只影响 1 个密码子；增添/缺失不是 3 的倍数就移码", "#3a3a35");

    /* 右侧：受影响的氨基酸数 + 300 个密码子的分布 */
    var bw = Rx.w - 40, bx = Rx.x + 20, cx = Rx.x + Rx.w / 2, y = Rx.y;
    tx(gB, bx, y + 30, "受影响的氨基酸数", "#5a6472", "start", 10.5, 700);
    tx(gB, cx, y + 90, String(s.changed), !s.changed ? "#2f8a5b" : (sh ? "#b8402f" : "#b8791f"), "middle", 40, 700);
    tx(gB, cx + (s.changed > 99 ? 40 : 26), y + 90, "个", "#6b7580", "start", 12, 400);
    tx(gB, cx, y + 112, "全基因共编码 300 个氨基酸", "#6b7580", "middle", 8.8, 400);

    var by = y + 136, x100 = bx + bw / 3;
    el("rect", { x: bx, y: by, width: bw, height: 20, rx: 4, fill: "#eafaf0", stroke: "#bfe0cd" }, gB);
    if (sh) el("rect", { x: x100, y: by, width: bw * 2 / 3, height: 20, rx: 4, fill: "#f7d9d0", stroke: "#c9705a" }, gB);
    else if (k) el("rect", { x: x100, y: by, width: Math.max(8, (k / 3) * bw / 300), height: 20, rx: 3, fill: "#f6c76a", stroke: "#d99a1f" }, gB);
    tx(gB, bx, by + 34, "0", "#6b7580", "start", 8.4);
    tx(gB, x100, by + 34, "100", "#6b7580", "middle", 8.4);
    tx(gB, bx + bw, by + 34, "300", "#6b7580", "end", 8.4);
    tx(gB, x100 + 6, by + 16, "插入点", "#8a5a00", "start", 8.4, 700);
    tx(gB, bx, by + 56, "k = " + k + "，k mod 3 = " + (k % 3), "#3a3a35", "start", 9);
    tx(gB, bx, by + 76, sh ? "不是 3 的倍数 → 移码突变" : (k ? "是 3 的倍数 → 整码突变" : "没有插入 → 序列不变"),
      sh ? "#a8402c" : "#2f8a5b", "start", 9, 700);
    tx(gB, bx, by + 96, sh ? "下游 200 个密码子全部重新划分" : (k ? "只多编码 " + (k / 3) + " 个氨基酸" : "受影响 0 个氨基酸"));
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), col, bg, st, sn;
    $("gxVa").textContent = String(s.k);
    $("gxVb").textContent = s.k === 0 ? "否（未插入）" : (s.shifted ? "是 · 移码" : "否 · 整码");
    $("gxVc").textContent = String(s.changed);
    if (s.k === 0) { st = "没有突变"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "序列与读码框都不变"; }
    else if (!s.shifted) { st = "整码突变"; col = "#b8791f"; bg = "#fdf3e0"; sn = "读码框不动，多 " + (s.k / 3) + " 个氨基酸"; }
    else { st = "移码突变"; col = "#b8402f"; bg = "#fbeae7"; sn = "三格重新划分，后面 200 个全变"; }
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
    mount: stage, follow: $("gxSl"),
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 1 }, { t: 6.5, v: 1 }, { t: 9, v: 3 }, { t: 11, v: 2 }, { t: 13, v: 0 }],
    keys: [0, 1, 2, 3], value: A, min: 0, max: 6, step: 1, idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  var model = { calc: calc, cases: [
    { v: 0, eq: { changed: 0 } }, { v: 3, eq: { changed: 1 } }, { v: 1, eq: { changed: 200 } },
    { v: 2, eq: { changed: 200 } }, { v: 6, eq: { changed: 2 } }
  ] };
  window.__bio = model;
  window.__model = model;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
