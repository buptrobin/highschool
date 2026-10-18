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

  function geom() {
    return stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
  }

  /* 纯函数：剂量 → 症状强度。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var d = Math.max(1, Math.min(20, Math.round(v)));
    var symptom = 100 * d / (d + 3);          // 规格公式，端点 d=1→25、d=3→50、d=10→76.9
    var speed = 300 / ((d + 3) * (d + 3));    // 症状增速：再 +1 单位剂量的增量
    return { symptom: symptom, speed: speed, d: d };
  }

  function stateOf(d) {
    if (d <= 2) return { t: "轻度", c: "#2f8a5b", bg: "#e6f6ee", sn: "皮疹、局部不适" };
    if (d <= 8) return { t: "中度", c: "#b8791f", bg: "#fdf3e0", sn: "皮疹 + 水肿 / 哮喘" };
    return { t: "重度", c: "#b8402f", bg: "#fbeae7", sn: "可能出现全身反应" };
  }

  function tag(g, x, y, s, col, anc, fs, fw) { tx(g, x, y, s, col, anc || "start", fs || 9.4, fw || 400); }

  function curvePath(x0, y0, x1, y1) {
    var p = "";
    for (var i = 0; i <= 48; i++) {
      var d = 1 + i * (19 / 48), sy = 100 * d / (d + 3);
      var x = x0 + (d - 1) / 19 * (x1 - x0), y = y1 - sy / 100 * (y1 - y0);
      p += (i ? " L" : "M") + x.toFixed(1) + "," + y.toFixed(1);
    }
    return p;
  }

  function dots(g, n, x, y, step, rowStep, perRow, r, col) {
    for (var i = 0; i < n; i++) {
      var rr = Math.floor(i / perRow), cc = i % perRow;
      el("circle", { cx: x + cc * step, cy: y + rr * rowStep, r: r, fill: col, opacity: 0.85 }, g);
    }
  }

  function drawW(gA, gB, s) {
    el("rect", { x: 16, y: 16, width: 424, height: 438, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tag(gA, 36, 44, "组织细胞表面的抗体与组胺释放", "#5a6472", "start", 10.5, 700);

    el("rect", { x: 32, y: 58, width: 376, height: 66, rx: 8, fill: "#ffffff", stroke: "#b9d3e6", "stroke-dasharray": "4 3" }, gA);
    tag(gA, 44, 76, "过敏原（dose = " + s.d + " 相对单位）", "#2c4a63", "start", 9.2, 700);
    dots(gA, s.d, 52, 96, 25, 16, 14, 4.2, "#d98a2b");
    if (s.d > 14) tag(gA, 396, 76, "…", "#7a8794", "end", 9);

    el("ellipse", { cx: 220, cy: 216, rx: 106, ry: 56, fill: "#ffffff", stroke: "#2f8a5b", "stroke-width": 1.8 }, gA);
    for (var k = -3; k <= 3; k++) {
      var ax = 220 + k * 26, ay = 216 - 56 * Math.sqrt(1 - Math.pow((ax - 220) / 106, 2));
      tag(gA, ax, ay + 4, "Y", "#2c4a63", "middle", 8.4, 700);
    }
    tag(gA, 220, 218, "组织细胞", "#3a3a35", "middle", 9.6, 700);
    tag(gA, 220, 234, "（皮肤、呼吸道黏膜）", "#6b6b62", "middle", 8.6);

    tag(gA, 36, 306, "组胺释放（示意）", "#5a6472", "start", 9.2, 700);
    dots(gA, Math.round(s.symptom / 100 * 26), 52, 322, 28, 17, 13, 3.6, "#b8402f");

    tag(gA, 36, 382, "症状强度", "#5a6472", "start", 9.2, 700);
    tag(gA, 420, 382, s.symptom.toFixed(1) + " %", stateOf(s.d).c, "end", 9.6, 700);
    el("rect", { x: 36, y: 390, width: 388, height: 16, rx: 8, fill: "#eef2f6" }, gA);
    el("rect", { x: 36, y: 390, width: Math.max(6, 388 * s.symptom / 100), height: 16, rx: 8, fill: stateOf(s.d).c, opacity: 0.85 }, gA);
    tag(gA, 36, 432, "状态：" + stateOf(s.d).t + " · " + stateOf(s.d).sn, stateOf(s.d).c, "start", 9.4, 700);

    el("rect", { x: 456, y: 16, width: 408, height: 438, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tag(gB, 476, 44, "症状强度随剂量变化", "#5a6472", "start", 10.5, 700);
    var x0 = 500, y0 = 76, x1 = 844, y1 = 386;
    el("line", { x1: x0, y1: y1, x2: x1, y2: y1, stroke: "#c3ccd6", "stroke-width": 1.4 }, gB);
    el("line", { x1: x0, y1: y0, x2: x0, y2: y1, stroke: "#c3ccd6", "stroke-width": 1.4 }, gB);
    tag(gB, 500, 70, "症状强度（%）", "#7a8794", "start", 8.8);
    el("line", { x1: x0, y1: y1 - 0.5 * (y1 - y0), x2: x1, y2: y1 - 0.5 * (y1 - y0), stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "5 4", opacity: 0.6 }, gB);
    tag(gB, 838, y1 - 0.5 * (y1 - y0) - 5, "50%", "#b8791f", "end", 8.8);
    el("path", { d: curvePath(x0, y0, x1, y1), fill: "none", stroke: "#2c4a63", "stroke-width": 2.4 }, gB);
    var px = x0 + (s.d - 1) / 19 * (x1 - x0), py = y1 - s.symptom / 100 * (y1 - y0);
    el("line", { x1: px, y1: py, x2: px, y2: y1, stroke: "#b8402f", "stroke-width": 1, "stroke-dasharray": "3 3" }, gB);
    el("circle", { cx: px, cy: py, r: 5, fill: "#ffffff", stroke: "#b8402f", "stroke-width": 2 }, gB);
    var la = px > 690 ? "end" : "start";
    tag(gB, px + (px > 690 ? -10 : 10), py - 10, "dose=" + s.d + " → " + s.symptom.toFixed(1) + "%", "#b8402f", la, 9, 700);
    var ticks = [1, 3, 6, 10, 20];
    for (var i = 0; i < ticks.length; i++) {
      var txp = x0 + (ticks[i] - 1) / 19 * (x1 - x0);
      el("line", { x1: txp, y1: y1, x2: txp, y2: y1 + 4, stroke: "#c3ccd6", "stroke-width": 1 }, gB);
      tag(gB, txp, 402, String(ticks[i]), "#6b6b62", "middle", 8.6);
    }
    tag(gB, 844, 420, "dose（相对单位）", "#6b6b62", "end", 8.8);
  }

  function drawN(gA, gB, s) {
    el("rect", { x: 8, y: 8, width: 344, height: 300, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tag(gA, 24, 30, "组胺释放与症状强度", "#5a6472", "start", 10, 700);
    el("rect", { x: 20, y: 40, width: 312, height: 56, rx: 8, fill: "#ffffff", stroke: "#b9d3e6", "stroke-dasharray": "4 3" }, gA);
    tag(gA, 30, 56, "过敏原 dose = " + s.d, "#2c4a63", "start", 9, 700);
    dots(gA, s.d, 32, 74, 23, 16, 12, 3.6, "#d98a2b");
    el("ellipse", { cx: 180, cy: 152, rx: 96, ry: 38, fill: "#ffffff", stroke: "#2f8a5b", "stroke-width": 1.6 }, gA);
    for (var k = -3; k <= 3; k++) {
      var ax = 180 + k * 24, ay = 152 - 38 * Math.sqrt(1 - Math.pow((ax - 180) / 96, 2));
      tag(gA, ax, ay + 4, "Y", "#2c4a63", "middle", 8, 700);
    }
    tag(gA, 180, 156, "组织细胞", "#3a3a35", "middle", 9.2, 700);
    tag(gA, 24, 210, "组胺释放（示意）", "#5a6472", "start", 9, 700);
    dots(gA, Math.round(s.symptom / 100 * 20), 30, 224, 26, 15, 12, 3, "#b8402f");
    tag(gA, 24, 276, "症状强度 " + s.symptom.toFixed(1) + "%", stateOf(s.d).c, "start", 9.2, 700);
    el("rect", { x: 24, y: 282, width: 312, height: 14, rx: 7, fill: "#eef2f6" }, gA);
    el("rect", { x: 24, y: 282, width: Math.max(5, 312 * s.symptom / 100), height: 14, rx: 7, fill: stateOf(s.d).c, opacity: 0.85 }, gA);

    el("rect", { x: 8, y: 320, width: 344, height: 372, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tag(gB, 24, 344, "症状强度随剂量变化", "#5a6472", "start", 10, 700);
    var x0 = 48, y0 = 372, x1 = 336, y1 = 600;
    el("line", { x1: x0, y1: y1, x2: x1, y2: y1, stroke: "#c3ccd6", "stroke-width": 1.2 }, gB);
    el("line", { x1: x0, y1: y0, x2: x0, y2: y1, stroke: "#c3ccd6", "stroke-width": 1.2 }, gB);
    tag(gB, 48, 366, "症状强度（%）", "#7a8794", "start", 8.6);
    el("line", { x1: x0, y1: y1 - 0.5 * (y1 - y0), x2: x1, y2: y1 - 0.5 * (y1 - y0), stroke: "#b8791f", "stroke-width": 1, "stroke-dasharray": "5 4", opacity: 0.6 }, gB);
    tag(gB, 330, y1 - 0.5 * (y1 - y0) - 5, "50%", "#b8791f", "end", 8.4);
    el("path", { d: curvePath(x0, y0, x1, y1), fill: "none", stroke: "#2c4a63", "stroke-width": 2.2 }, gB);
    var px = x0 + (s.d - 1) / 19 * (x1 - x0), py = y1 - s.symptom / 100 * (y1 - y0);
    el("circle", { cx: px, cy: py, r: 5, fill: "#ffffff", stroke: "#b8402f", "stroke-width": 2 }, gB);
    tag(gB, px > 250 ? px - 8 : px + 8, py - 10, s.symptom.toFixed(1) + "%", "#b8402f", px > 250 ? "end" : "start", 9, 700);
    var ticks = [1, 3, 6, 10, 20];
    for (var i = 0; i < ticks.length; i++) {
      var txp = x0 + (ticks[i] - 1) / 19 * (x1 - x0);
      tag(gB, txp, 616, String(ticks[i]), "#6b6b62", "middle", 8.4);
    }
    tag(gB, 336, 640, "dose →", "#6b6b62", "end", 8.6);
  }

  function render() {
    if (!G) { L = geom(); G = geom(); }
    var s = calc(A), st = stateOf(s.d);
    $("gxVa").textContent = String(s.d);
    $("gxVb").textContent = s.symptom.toFixed(1);
    $("gxVc").textContent = s.speed.toFixed(1);
    $("gxVs").textContent = st.t;
    $("gxVsn").textContent = st.sn;
    $("gxStBox").style.background = st.bg;
    $("gxStBox").style.borderColor = st.c + "44";
    $("gxVs").style.color = st.c;
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    if (L === W) drawW(gA, gB, s); else drawN(gA, gB, s);
  }

  function layout() {
    L = geom();
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
    loop: [{ t: 0, v: 20 }, { t: 1.2, v: 20 }, { t: 4, v: 3 }, { t: 6.5, v: 3 }, { t: 9, v: 1 }, { t: 11, v: 6 }, { t: 13, v: 20 }],
    keys: [1, 3, 6, 20],
    value: A, min: 1, max: 20, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1, eq: { symptom: 25 } },
    { v: 3, eq: { symptom: 50 } },
    { v: 10, eq: { symptom: 76.9 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});
