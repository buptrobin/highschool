/*! geo-autopilot.js — 旧版地理讲义页的通用「自走」
 *
 * 旧 geo 页没有接 assets/autopilot.js，只有一个滑块和几个预设按钮。
 * 这里不碰各页的 render()，而是按页面作者已经挑好的预设按钮轮播：
 *   - 按钮会改滑块时，滑块做一段平滑过渡；
 *   - 按钮控制的是另一个参数时（例如震级），就让按钮自己切换；
 *   - 用户一拖 / 一点 / 一按键就交给用户，空闲 5 秒后恢复；
 *   - 尊重 prefers-reduced-motion。
 *
 * 只给旧 geo 页手动引入；新版页面有 window.AutoPilot，会自动跳过。
 */
(function () {
  "use strict";

  var IDLE = 5000;   /* 用户停手多久后恢复自动 */
  var HOLD = 2600;   /* 每个预设停多久 */
  var MOVE = 700;    /* 滑块过渡时长 */
  var REDUCE = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function closest(el, sel) {
    while (el && el.nodeType === 1) {
      if (el.matches ? el.matches(sel) : (el.msMatchesSelector && el.msMatchesSelector(sel))) return el;
      el = el.parentNode;
    }
    return null;
  }

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function init() {
    if (window.__GEO_AUTOPILOT__) return;
    if (window.AutoPilot) return;   /* 新版页面自己处理 */

    var stage = document.getElementById("gxStage");
    var sl = document.getElementById("gxSl");
    if (!stage || !sl) return;

    var bar = closest(sl, ".bar");
    if (!bar) return;

    var buttons = Array.prototype.slice.call(bar.querySelectorAll('button[id^="gxP"]'))
      .filter(function (b) { return !b.disabled; });
    if (buttons.length < 2) return;

    window.__GEO_AUTOPILOT__ = true;

    /* ---------- 状态徽标 ---------- */
    var fig = closest(stage, ".gx-fig");
    var cap = fig ? fig.querySelector(".fig-cap") : null;
    var badge = cap ? cap.querySelector(".gx-ap") : null;
    var badgeTxt = null;

    if (cap && !badge) {
      badge = document.createElement("span");
      badge.className = "gx-ap";
      badge.appendChild(document.createElement("i"));
      badgeTxt = document.createElement("span");
      badge.appendChild(badgeTxt);
      cap.appendChild(badge);
    } else if (badge) {
      badgeTxt = badge.querySelector("span");
    }

    var mode = "manual";
    var clicking = false;
    var suppressInput = false;

    function setMode(m, text) {
      mode = m;
      if (!badge) return;
      badge.classList.toggle("is-auto", m === "auto");
      badge.classList.toggle("is-manual", m !== "auto");
      if (badgeTxt) {
        badgeTxt.textContent = text || (m === "auto" ? "自动演示中" : "你接管了");
      }
    }

    /* ---------- 滑块 ---------- */
    var min = parseFloat(sl.min) || 0;
    var max = parseFloat(sl.max);
    var stepSize = parseFloat(sl.step) || 1;
    if (!isFinite(max)) max = min + 100;
    var dec = stepSize >= 1 ? 0 : (stepSize >= 0.1 ? 1 : 2);

    function snap(v) {
      var x = min + Math.round((v - min) / stepSize) * stepSize;
      return Math.max(min, Math.min(max, x));
    }

    function setSlider(v) {
      suppressInput = true;
      sl.value = snap(v).toFixed(dec);
      sl.dispatchEvent(new Event("input", { bubbles: true }));
      suppressInput = false;
    }

    /* ---------- 计时与动画 ---------- */
    var idx = -1;
    var timer = null;
    var resumeTimer = null;
    var raf = 0;

    function clearTimer() {
      if (timer) { clearTimeout(timer); timer = null; }
    }

    function cancelAnim() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    function schedule(ms) {
      clearTimer();
      timer = setTimeout(tick, ms);
    }

    function animate(from, to, done) {
      var start = 0;

      function frame(now) {
        if (mode !== "auto") return;
        if (!start) start = now;
        var p = Math.min(1, (now - start) / MOVE);
        setSlider(from + (to - from) * ease(p));
        if (p < 1) {
          raf = requestAnimationFrame(frame);
        } else {
          raf = 0;
          setSlider(to);
          done();
        }
      }

      raf = requestAnimationFrame(frame);
    }

    function tick() {
      if (mode !== "auto") return;
      if (document.hidden) { schedule(800); return; }

      idx = (idx + 1) % buttons.length;
      var before = parseFloat(sl.value);
      clicking = true;
      try {
        buttons[idx].click();
      } catch (e) {
        clicking = false;
        schedule(HOLD);
        return;
      }
      clicking = false;
      var after = parseFloat(sl.value);

      if (isFinite(before) && isFinite(after) && Math.abs(after - before) > 0.0001) {
        /* 先把状态拉回起点，再平滑推到按钮给的目标值 */
        suppressInput = true;
        sl.value = snap(before).toFixed(dec);
        sl.dispatchEvent(new Event("input", { bubbles: true }));
        suppressInput = false;
        animate(parseFloat(sl.value), after, function () {
          schedule(HOLD);
        });
      } else {
        schedule(HOLD);
      }
    }

    function resume() {
      if (REDUCE) return;
      if (document.hidden) {
        resumeTimer = setTimeout(resume, 1000);
        return;
      }
      resumeTimer = null;
      setMode("auto");
      schedule(600);
    }

    function takeOver() {
      cancelAnim();
      clearTimer();
      setMode("manual");
      if (REDUCE) return;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(resume, IDLE);
    }

    /* ---------- 用户接管 ---------- */
    bar.addEventListener("pointerdown", takeOver, true);
    stage.addEventListener("pointerdown", takeOver, true);

    bar.addEventListener("input", function () {
      if (!suppressInput) takeOver();
    }, true);

    bar.addEventListener("click", function () {
      if (!clicking) takeOver();
    }, true);

    document.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" &&
          e.key !== "Home" && e.key !== "End") return;
      var t = e.target;
      if ((bar.contains && bar.contains(t)) || (stage.contains && stage.contains(t))) takeOver();
    }, true);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        clearTimer();
        cancelAnim();
      } else if (mode === "auto" && !REDUCE) {
        schedule(800);
      }
    });

    /* ---------- 启动 ---------- */
    if (REDUCE) {
      setMode("manual", "手动模式");
      return;
    }

    setMode("auto");
    schedule(1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      /* 等各页自己的 DOMContentLoaded 处理完，再接管按钮 */
      setTimeout(init, 0);
    });
  } else {
    setTimeout(init, 0);
  }
})();
