/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 1, S = null;

  /* 纯函数：参数 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var n = Math.max(1, Math.min(4, Math.round(v)));
    return { n: n, gam: Math.pow(2, n), phe: Math.pow(2, n), geno: Math.pow(3, n), comb: Math.pow(4, n) };
  }

  /* 几何量：只在 layout() 时算一次，render() 直接用 */
  function geom() {
    var wide = (L === W);
    return wide
      ? { wide: true, rowTop: L.left.y + 64, rowH: 72, barW: 64, barH: 26,
          col1: L.left.x + 94, col2: L.left.x + 166, noteX: L.left.x + 242,
          bandY: L.left.y + 334, bandH: 88, pad: 20,
          rx: L.right.x + 20, ry: L.right.y + 60, rowW: L.right.w - 40, step: 56, rowH2: 46, fs: 9.4 }
      : { wide: false, rowTop: L.left.y + 44, rowH: 48, barW: 52, barH: 22,
          col1: L.left.x + 76, col2: L.left.x + 136, noteX: L.left.x + 198,
          bandY: L.left.y + 224, bandH: 68, pad: 12,
          rx: L.right.x + 12, ry: L.right.y + 40, rowW: L.right.w - 24, step: 52, rowH2: 42, fs: 8.8 };
  }

  var LET = "ABCD";

  function draw() {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";

    /* 左：染色体 → 配子 */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + G.pad, L.left.y + 30, "n 对等位基因：同源分离、非同源自由组合", "#5a6472", "start", 10.2, 700);
    for (var i = 0; i < S.n; i++) {
      var y = G.rowTop + i * G.rowH, ch = LET.charAt(i);
      tx(gA, L.left.x + G.pad, y + 17, "第 " + (i + 1) + " 对", "#8a93a0", "start", 9, 400);
      el("rect", { x: G.col1, y: y, width: G.barW, height: G.barH, rx: 6, fill: "#eaf1fb", stroke: "#b9cdea" }, gA);
      el("rect", { x: G.col2, y: y, width: G.barW, height: G.barH, rx: 6, fill: "#fff7e0", stroke: "#e6cf8f" }, gA);
      tx(gA, G.col1 + G.barW / 2, y + 18, ch, "#2f4f7a", "middle", 11.5, 700);
      tx(gA, G.col2 + G.barW / 2, y + 18, ch.toLowerCase(), "#7a5a12", "middle", 11.5, 700);
      tx(gA, G.noteX, y + 17, "→ 2 种去向", "#5a6472", "start", 8.6, 400);
    }

    /* 左：底部口径条 */
    el("rect", { x: L.left.x + G.pad, y: G.bandY, width: L.left.w - G.pad * 2, height: G.bandH, rx: 8, fill: "#eef7f2", stroke: "#b8e6d0" }, gA);
    var bx = L.left.x + G.pad + 12;
    tx(gA, bx, G.bandY + 24, "减Ⅰ后期：同源染色体分开 → 等位基因分离", "#2f6a4f", "start", G.fs, 400);
    tx(gA, bx, G.bandY + 44, "非同源染色体自由组合 → 非等位基因自由组合", "#2f6a4f", "start", G.fs, 400);
    tx(gA, bx, G.bandY + 66, "配子 " + S.gam + " 种（2ⁿ）；n＝2 时 4 种配子、16 格棋盘", "#5a6472", "start", G.fs, 400);

    /* 右：四个数 */
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + G.pad, L.right.y + 30, "数量关系（n 对独立基因）", "#5a6472", "start", 10.2, 700);
    var rows = [
      ["配子种类 2ⁿ", S.gam, "雌雄各 " + S.gam + " 种，比例相等"],
      ["F₂ 表现型 2ⁿ", S.phe, "完全显性时的种类数"],
      ["F₂ 基因型 3ⁿ", S.geno, "每种表现型含 1～4 种"],
      ["棋盘格数 4ⁿ", S.comb, "甲配子 × 乙配子"]
    ];
    for (i = 0; i < rows.length; i++) {
      var yy = G.ry + i * G.step, hot = (i === 3);
      el("rect", { x: G.rx, y: yy, width: G.rowW, height: G.rowH2, rx: 8,
        fill: hot ? "#fff7e0" : "#f8fbfd", stroke: hot ? "#e6cf8f" : "#e6e9ee" }, gB);
      tx(gB, G.rx + 14, yy + 20, rows[i][0], "#3a3a35", "start", 9.4, 600);
      tx(gB, G.rx + G.rowW - 14, yy + 23, String(rows[i][1]), "#151a21", "end", 15, 700);
      tx(gB, G.rx + 14, yy + 38, rows[i][2], "#8a93a0", "start", 8.4, 400);
    }

    /* 右：n＝2 时画 9∶3∶3∶1 比例条 */
    var capY = G.ry + 4 * G.step + 18;
    if (S.n === 2) {
      tx(gB, G.rx, capY, "F₂ 表现型比（n＝2 的停留帧）", "#2f6a4f", "start", 9, 700);
      var seg = [[9, "#e6cf8f", "9/16"], [3, "#b9cdea", "3/16"], [3, "#b3ddc4", "3/16"], [1, "#cbb8e6", "1/16"]];
      var acc = G.rx, y0 = capY + 10;
      for (i = 0; i < seg.length; i++) {
        var w = G.rowW * seg[i][0] / 16;
        el("rect", { x: acc, y: y0, width: w, height: 26, fill: seg[i][1], stroke: "#ffffff" }, gB);
        if (w > 30) tx(gB, acc + w / 2, y0 + 17, seg[i][2], "#3a3a35", "middle", 8.6, 700);
        acc += w;
      }
      tx(gB, G.rx, y0 + 48, "黄圆 9 ∶ 黄皱 3 ∶ 绿圆 3 ∶ 绿皱 1", "#5a6472", "start", 8.8, 400);
    } else {
      tx(gB, G.rx, capY, "n＝" + S.n + " 时，F₂ 不是 9∶3∶3∶1", "#b8791f", "start", 9, 700);
      tx(gB, G.rx, capY + 22, "9∶3∶3∶1 只在 n＝2（两对独立基因）时出现", "#8a93a0", "start", 8.6, 400);
    }
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    S = calc(A);
    var st, col, bg, sn;
    $("gxVa").textContent = String(S.n);
    $("gxVb").textContent = String(S.gam);
    $("gxVc").textContent = String(S.geno);
    if (S.n <= 2) { st = S.n === 1 ? "一对基因" : "两对独立"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = S.n === 1 ? "F₂ 表现型比 3∶1" : "16 格 = 9∶3∶3∶1"; }
    else if (S.n === 3) { st = "三对基因"; col = "#b8791f"; bg = "#fdf3e0"; sn = "8 种表现型 · 64 格"; }
    else { st = "四对基因"; col = "#b8791f"; bg = "#fdf3e0"; sn = "16 种表现型 · 256 格"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 3, v: 2 }, { t: 5.2, v: 2 }, { t: 7.4, v: 4 }, { t: 9.4, v: 3 }, { t: 11.4, v: 1 }],
    keys: [1, 2, 3, 4],
    value: A, min: 1, max: 4, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1, eq: { gam: 2, phe: 2, geno: 3 } },
    { v: 2, eq: { gam: 4, phe: 4, geno: 9 } },
    { v: 3, eq: { gam: 8, phe: 8, geno: 27 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
