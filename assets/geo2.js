/* 地理讲义共用交互：手机图放大 + 例题分步揭示。
   依赖 page.js 先把 #md 渲染进 #content，所以本文件必须排在 page.js 之后。 */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }

  function setupZoom() {
    var zoom = $("gxZoom"), inner = $("gxZoomInner");
    if (!zoom || !inner) return;
    Array.prototype.forEach.call(document.querySelectorAll(".gx-svgbox"), function (box) {
      var probe = box.querySelector("svg");
      if (!probe) return;
      // 互动图不能点开放大浮层：放大后既看不到滑块，也会挡住点选。
      if (box.classList.contains("nozoom") ||
          box.querySelector("input,button,.pick") ||
          /stage$/i.test(probe.id)) return;
      box.style.cursor = "zoom-in";
      box.addEventListener("click", function () {
        if (window.innerWidth > 760) return;
        var svg = box.querySelector("svg");
        if (!svg) return;
        inner.textContent = "";
        inner.appendChild(svg.cloneNode(true));
        zoom.hidden = false;
        document.body.style.overflow = "hidden";
      });
    });
    function close() { zoom.hidden = true; document.body.style.overflow = ""; }
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
