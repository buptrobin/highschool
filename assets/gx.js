/* 讲义版共用交互 · 选择性必修1 各页复用
 * 提供三样东西：
 *   1. window.GX  —— 画图小工具（$ / el / tx / n1 / clamp / fmt）
 *   2. 点图放大（.gx-svgbox → #gxZoom，桌面和手机通用）
 *   3. 例题分步揭示（#gxSteps / #gxNext / #gxAns / #gxCnt）
 * 页面自己的互动逻辑写在 gx.js 之后的 <script> 里，同样监听 DOMContentLoaded。
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function $(id) { return document.getElementById(id); }

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function n1(v) { return (Math.round(v * 10) / 10).toString(); }
  function n2(v) { return (Math.round(v * 100) / 100).toString(); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 文本：默认 10.5 号；halo=true 时加白色描边，压在线上也看得清 */
  function tx(parent, x, y, s, col, anchor, size, weight, halo) {
    var o = {
      x: n1(x), y: n1(y), "font-size": size || 10.5, fill: col || "#3a3a35",
      "text-anchor": anchor || "start", "font-weight": weight || 400
    };
    if (halo) o["class"] = "halo";
    var t = el("text", o, parent);
    t.textContent = s;
    return t;
  }

  /* 折线/曲线的 d 属性 */
  function poly(pts) {
    if (!pts.length) return "";
    var d = "M " + n1(pts[0][0]) + " " + n1(pts[0][1]);
    for (var i = 1; i < pts.length; i++) d += " L " + n1(pts[i][0]) + " " + n1(pts[i][1]);
    return d;
  }

  window.GX = { NS: NS, $: $, el: el, tx: tx, poly: poly,
                n1: n1, n2: n2, clamp: clamp };
  window.__GX_ZOOM_READY = true;

  document.addEventListener("DOMContentLoaded", function () {
    /* ---------- 点图放大（桌面 / 手机通用） ---------- */
    (function () {
      var zoom = $("gxZoom"), inner = $("gxZoomInner");
      if (!zoom || !inner) return;
      var tip = zoom.querySelector(".gx-zoom-tip");
      var lastBox = null;

      function open(box) {
        var svg = box.querySelector("svg");
        if (!svg) return;
        inner.textContent = "";
        inner.appendChild(svg.cloneNode(true));
        zoom.hidden = false;
        document.body.style.overflow = "hidden";
        if (tip) {
          tip.textContent = window.innerWidth <= 760
            ? "双指放大 · 左右滑动看全图"
            : "点击空白处或按 Esc 关闭";
        }
        lastBox = box;
        var btn = zoom.querySelector(".gx-zoom-x");
        if (btn) btn.focus({ preventScroll: true });
      }

      function close() {
        zoom.hidden = true;
        document.body.style.overflow = "";
        if (lastBox) lastBox.focus({ preventScroll: true });
      }

      Array.prototype.forEach.call(document.querySelectorAll(".gx-svgbox"), function (box) {
        var svg = box.querySelector("svg");
        if (!svg) return;
        /* 互动图不放进放大浮层：里面还有滑块/按钮，放大后不能操作 */
        if (box.classList.contains("nozoom") || /stage$/i.test(svg.id)) return;
        if (box.querySelector("input,button,.pick,.bar")) return;
        box.style.cursor = "zoom-in";
        box.setAttribute("role", "button");
        box.setAttribute("tabindex", "0");
        box.setAttribute("title", "点击放大");
        box.addEventListener("click", function (e) {
          if (e.target.closest && e.target.closest("button, input, .bar")) return;
          open(box);
        });
        box.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(box); }
        });
      });

      zoom.addEventListener("click", function (e) {
        if (e.target === zoom || e.target.classList.contains("gx-zoom-x")) close();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !zoom.hidden) close();
      });
    })();

    /* ---------- 例题分步揭示 ---------- */
    (function () {
      var steps = document.querySelectorAll("#gxSteps .step");
      var ans = $("gxAns"), btn = $("gxNext"), cnt = $("gxCnt");
      if (!steps.length || !btn) return;
      var i = 1;
      function paint() { if (cnt) cnt.textContent = Math.min(i, steps.length) + " / " + steps.length; }
      steps[0].hidden = false;
      paint();
      btn.addEventListener("click", function () {
        if (i < steps.length) { steps[i].hidden = false; i++; }
        if (i >= steps.length) {
          if (ans) ans.hidden = false;
          btn.textContent = "已全部展开";
          btn.disabled = true;
        }
        paint();
      });
    })();
  });
})();
