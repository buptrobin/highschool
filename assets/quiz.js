/* 情境判断器：点一个材料情境，显示「对应知识点 + 判断依据」。
   不依赖任何库；由 page.js 先把 #md 渲染进正文，再初始化。 */
(function () {
  "use strict";

  function text(tag, cls, s) {
    var p = document.createElement(tag);
    p.className = cls;
    p.textContent = s;
    return p;
  }

  function initBox(box) {
    var out = box.querySelector(".qout");
    var btns = Array.prototype.slice.call(box.querySelectorAll(".qbtn"));
    if (!out || !btns.length) return;

    function idle() {
      out.textContent = "";
      out.appendChild(text("p", "qo-k", "怎么用"));
      out.appendChild(text("p", "qo-v", "先自己判断，再点上面任意一个情境"));
      out.appendChild(text("p", "qo-w", "判断顺序：先找材料里的主体和行为，再对应课本概念，最后写一句依据。"));
    }

    function show(btn) {
      btns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      out.textContent = "";
      out.appendChild(text("p", "qo-k", btn.getAttribute("data-k") || "判断结果"));
      out.appendChild(text("p", "qo-v", btn.getAttribute("data-a") || ""));
      out.appendChild(text("p", "qo-w", btn.getAttribute("data-w") || ""));
      window.__quiz = { count: btns.length, active: btns.indexOf(btn), text: out.textContent };
    }

    btns.forEach(function (b) {
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { show(b); });
    });
    idle();
    window.__quiz = { count: btns.length, active: -1, text: "" };
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll(".gx-quiz"), initBox);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
