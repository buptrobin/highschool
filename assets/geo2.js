/* 地理讲义共用交互：点图放大（桌面 / 手机）+ 例题分步揭示。
   依赖 page.js 先把 #md 渲染进 #content，所以本文件必须排在 page.js 之后。 */
(function () {
  "use strict";
  window.__GX_ZOOM_READY = true;
  function $(id) { return document.getElementById(id); }

  function setupZoom() {
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
      var probe = box.querySelector("svg");
      if (!probe) return;
      // 互动图不能点开放大浮层：放大后既看不到滑块，也会挡住点选。
      if (box.classList.contains("nozoom") ||
          box.querySelector("input,button,.pick") ||
          /stage$/i.test(probe.id)) return;
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
  }

  function setupSteps() {
    var box = $("gxSteps");
    if (!box) return;
    var steps = box.querySelectorAll(".step");
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
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupZoom();
    setupSteps();
  });
})();
