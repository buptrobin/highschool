/* 互动脚本：数学归纳法 k → k+1 的增量（由 build-page.mjs 包进 <script> 里，不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 1;

  /* 纯函数：k → 数值。render() 和 __model.cases 都用它 */
  function calc(v) {
    var k = Math.round(v);
    var inc = 2 * k + 1;                    /* 从 k 到 k+1，左边多出来的那一项 */
    var dl = inc;                           /* 左边增量 */
    var dr = (k + 1) * (k + 1) - k * k;     /* 右边增量，也等于 2k+1 */
    var same = dl === dr ? 1 : 0;
    return { k: k, inc: inc, dl: dl, dr: dr, same: same };
  }

  /* 面板几何（与 k 无关，只在宽度变化时重建） */
  function geom() {
    return { left: L.left, right: L.right };
  }

  /* 方格阵：n×n；kIn 给出时，最上一行与最右一列是「新增的 L 形」 */
  function cells(parent, ox, oy, n, cell, kIn) {
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) {
        var isNew = kIn !== undefined && (i === 0 || j === n - 1);
        el("rect", {
          x: ox + j * cell, y: oy + i * cell, width: cell, height: cell, rx: 2,
          fill: isNew ? "#fbe9d8" : "#eef4fd",
          stroke: isNew ? "#b8791f" : "#9aa7b3", "stroke-width": 1
        }, parent);
      }
    }
  }

  function draw(s) {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var PA = G.left, PB = G.right;
    var k = s.k;

    /* 左面板：n=k，左边垒成的 k² 正方形 */
    el("rect", { x: PA.x, y: PA.y, width: PA.w, height: PA.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, PA.x + 20, PA.y + 30, "n=k：前 k 个奇数垒成正方形", "#5a6472", "start", 10.5, 700);
    var availA = Math.min(PA.w - 100, PA.h - 150);
    var cA = Math.max(18, Math.min(46, Math.floor(availA / k)));
    var oxA = PA.x + (PA.w - k * cA) / 2, oyA = PA.y + 78;
    cells(gA, oxA, oyA, k, cA);
    tx(gA, PA.x + 20, PA.y + PA.h - 44, "1+3+…+(2k−1) = k²", "#2563eb", "start", 12, 700);
    tx(gA, PA.x + 20, PA.y + PA.h - 24, "k=" + k + " 时，左边 = " + (k * k) + "（共 " + k + " 项）", "#5a6472", "start", 9.6, 400);

    /* 右面板：n=k+1，(k+1)² 里比 k² 多出的 L 形 = 2k+1 */
    el("rect", { x: PB.x, y: PB.y, width: PB.w, height: PB.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, PB.x + 20, PB.y + 30, "n=k+1：多出的 L 形 = 2k+1", "#5a6472", "start", 10.5, 700);
    var availB = Math.min(PB.w - 100, PB.h - 170);
    var cB = Math.max(16, Math.min(40, Math.floor(availB / (k + 1))));
    var n2 = k + 1;
    var oxB = PB.x + (PB.w - n2 * cB) / 2, oyB = PB.y + 78;
    cells(gB, oxB, oyB, n2, cB, k);
    tx(gB, PB.x + 20, PB.y + PB.h - 62, "(k+1)²−k² = " + s.dr, "#b8791f", "start", 11.5, 700);
    tx(gB, PB.x + 20, PB.y + PB.h - 44, "左边增加项 2(k+1)−1 = " + s.inc, "#b8402f", "start", 10, 700);
    tx(gB, PB.x + 20, PB.y + PB.h - 24, "k² + (2k+1) = (k+1)²，" + (s.same ? "两边增量恒等" : "不相等"), "#2f8a5b", "start", 9.6, 700);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); stage.setAttribute("viewBox", L.vb); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.k);
    $("gxVb").textContent = String(s.inc);
    $("gxVc").textContent = String(s.dr);
    if (s.k === 1) { st = "奠基"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "n=1：左边 1 = 右边 1²，起点成立"; }
    else { st = "递推"; col = "#2563eb"; bg = "#eef4fd"; sn = "用假设 k²，加上 2k+1 得 (k+1)²"; }
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 3 }, { t: 6.5, v: 3 }, { t: 9, v: 6 }, { t: 11.5, v: 4 }, { t: 13.5, v: 1 }],
    keys: [1, 3, 6],
    value: A, min: 1, max: 6, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1, eq: { inc: 3, same: 1 } },
    { v: 3, eq: { inc: 7, same: 1 } },
    { v: 6, eq: { inc: 13, same: 1 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
