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

  /* 纯函数：差异数 d → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var d = Math.round(v);
    return { diff: d, same: (104 - d) / 104, degree: d <= 5 ? 3 : d <= 20 ? 2 : 1 };
  }

  /* 由当前布局算出小格几何，一次算好缓存 */
  function geom() {
    var inner = L.left.w - 40, pitch = inner / 13;
    return {
      x0: L.left.x + 20, y0: L.left.y + 64,
      pitch: pitch, cell: pitch - 4,
      gb: L.left.y + 64 + 8 * pitch,
      rx: L.right.x + 20, rw: L.right.w - 40
    };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function colorOf(deg) { return deg === 3 ? "#2f8a5b" : deg === 2 ? "#b8791f" : "#b8402f"; }

  function draw() {
    var s = calc(A), c = colorOf(s.degree);
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";

    /* 左：104 个氨基酸的格子图，差异位标异色 */
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 28, "细胞色素c：104 个氨基酸", "#5a6472", "start", 10.5, 700);
    tx(gA, L.left.x + 20, L.left.y + 46, "红格＝该位氨基酸不同，共 d 个", "#8d9aa8", "start", 9, 400);
    for (var i = 0; i < 104; i++) {
      var diff = Math.floor(i * A / 104) !== Math.floor((i + 1) * A / 104);
      el("rect", {
        x: G.x0 + (i % 13) * G.pitch, y: G.y0 + Math.floor(i / 13) * G.pitch,
        width: G.cell, height: G.cell, rx: 3,
        fill: diff ? "#f7d6e0" : "#e6f6ee", stroke: diff ? "#b3567f" : "#9fd0b6"
      }, gA);
    }
    tx(gA, L.left.x + 20, G.gb + 20, "相同 " + (104 - A) + " 个 · 不同 " + A + " 个", "#22303c", "start", 10.5, 700);
    if (G.gb + 40 < L.left.y + L.left.h - 8) wrap(gA, L.left.x + 20, G.gb + 40, "格子位置只是示意排布，不代表真实的第几位氨基酸。", G.rw, 9, "#8d9aa8", 14);

    /* 右：相同比例条 + 差异刻度 */
    var ry = L.right.y, rx = G.rx, rw = G.rw;
    el("rect", { x: L.right.x, y: ry, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, rx, ry + 26, "亲缘关系判定", "#5a6472", "start", 10.5, 700);

    tx(gB, rx, ry + 60, "序列相同比例", "#8d9aa8", "start", 9, 400);
    tx(gB, rx, ry + 90, (s.same * 100).toFixed(1) + "%", c, "start", 24, 700);
    el("rect", { x: rx, y: ry + 102, width: rw, height: 20, rx: 10, fill: "#eef2f5" }, gB);
    el("rect", { x: rx, y: ry + 102, width: Math.max(2, s.same * rw), height: 20, rx: 10, fill: c, opacity: 0.85 }, gB);

    tx(gB, rx, ry + 150, "差异占比 d ÷ 104", "#8d9aa8", "start", 9, 400);
    el("rect", { x: rx, y: ry + 160, width: rw, height: 14, rx: 7, fill: "#eef2f5" }, gB);
    el("rect", { x: rx, y: ry + 160, width: Math.max(0, A / 104 * rw), height: 14, rx: 7, fill: "#b3567f", opacity: 0.8 }, gB);

    var axisY = ry + 218, x0 = rx;
    tx(gB, rx, ry + 196, "差异数刻度 (0–40)", "#8d9aa8", "start", 9, 400);
    el("rect", { x: x0, y: axisY - 5, width: rw * 5 / 40, height: 10, rx: 5, fill: "#cfe9dc" }, gB);
    el("rect", { x: x0 + rw * 5 / 40, y: axisY - 5, width: rw * 15 / 40, height: 10, fill: "#f3e0bb" }, gB);
    el("rect", { x: x0 + rw * 20 / 40, y: axisY - 5, width: rw * 20 / 40, height: 10, rx: 5, fill: "#f3cfc7" }, gB);
    var mx = x0 + A / 40 * rw;
    el("path", { d: "M" + (mx - 6) + " " + (axisY - 18) + " L" + (mx + 6) + " " + (axisY - 18) + " L" + mx + " " + (axisY - 6) + " Z", fill: c }, gB);
    tx(gB, x0 + rw * 5 / 40, axisY + 18, "5", "#8d9aa8", "middle", 8.5, 400);
    tx(gB, x0 + rw * 20 / 40, axisY + 18, "20", "#8d9aa8", "middle", 8.5, 400);
    tx(gB, x0, axisY + 18, "0", "#8d9aa8", "start", 8.5, 400);
    tx(gB, x0 + rw, axisY + 18, "40", "#8d9aa8", "end", 8.5, 400);

    var line = s.degree === 3 ? "d ≤ 5：亲缘关系很近，分化很晚"
      : s.degree === 2 ? "5 < d ≤ 20：亲缘关系中等" : "d > 20：亲缘关系较远，分化较早";
    tx(gB, rx, axisY + 46, line, c, "start", 10.5, 700);
    wrap(gB, rx, axisY + 66, "比的是同种蛋白质的氨基酸序列：差异越小，亲缘越近、分化越晚。", rw, 9, "#5a6472", 14);
    if (axisY + 110 < ry + L.right.h - 10) tx(gB, rx, axisY + 110, "相同比例 = (104 − d) ÷ 104", "#8d9aa8", "start", 9, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), c = colorOf(s.degree), st, sn;
    $("gxVa").textContent = String(s.diff);
    $("gxVb").textContent = (s.same * 100).toFixed(1) + "%";
    $("gxVc").textContent = String(104 - s.diff);
    if (s.degree === 3) { st = "很近"; sn = "d ≤ 5，分化很晚"; }
    else if (s.degree === 2) { st = "中等"; sn = "5 < d ≤ 20"; }
    else { st = "较远"; sn = "d > 20，分化较早"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = s.degree === 3 ? "#e6f6ee" : s.degree === 2 ? "#fdf3e0" : "#fbeae7";
    $("gxStBox").style.borderColor = c + "44";
    $("gxVs").style.color = c;
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
    loop: [{ t: 0, v: 0 }, { t: 1.5, v: 20 }, { t: 4, v: 40 }, { t: 6.5, v: 40 }, { t: 9, v: 20 }, { t: 11.5, v: 0 }, { t: 13.5, v: 0 }],
    keys: [0, 20, 30, 40],
    value: A, min: 0, max: 40, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { same: 1 } },
    { v: 20, eq: { same: 0.8077 } },
    { v: 40, eq: { same: 0.6154 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
