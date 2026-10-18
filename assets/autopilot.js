/*!
 * autopilot.js — 互动图「自走」控制器
 *
 * 只管一件事：什么时候该自己动、什么时候该听人的。
 * 不负责画图 —— 通过 onChange(v) 把当前值交给你自己的 render()。
 *
 * 用法：
 *   var ap = AutoPilot.create({
 *     mount:  document.getElementById('screen'),   // 点这里换关键帧
 *     follow: document.getElementById('slider'),    // 拖动 = 接管
 *     loop:   [{t:0,v:0.4},{t:3,v:0.9},{t:4.5,v:1},{t:7,v:1},{t:10,v:1.5},{t:13,v:0.4}],
 *     keys:   [0.35, 0.8, 1.0, 1.6, 2.35],
 *     value:  0.4, min: 0.1, max: 2.6, step: 0.01,
 *     idle:   5000,
 *     onChange: function(v){ render(v); },
 *     onMode:   function(m){ badge.textContent = m === 'auto' ? '自动演示中' : '你接管了'; }
 *   });
 *
 * 工程约定（不要改）：
 *   - 自动态每帧回写 follow.value 仅在 !manual 时进行，否则会和拖动打架
 *   - 交还时用 nearestPhase() 找循环里最接近的相位，避免跳帧
 *   - prefers-reduced-motion 下不自动播放
 */
(function (root) {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function ramp(a, b, t) { return clamp((t - a) / (b - a), 0, 1); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  var DEFAULTS = {
    value: 0,
    min: 0,
    max: 1,
    step: 0.01,
    loop: null,
    keys: null,
    idle: 5000,
    rate: 14,
    prefer: null,
    mount: null,
    follow: null,
    keyboard: true,
    reducedMotion: null,
    onChange: null,
    onMode: null,
    onKey: null
  };

  function create(o) {
    var opt = {}, k;
    for (k in DEFAULTS) {
      opt[k] = (o && o[k] !== undefined && o[k] !== null) ? o[k] : DEFAULTS[k];
    }

    var decimals = opt.step >= 1 ? 0 : (opt.step >= 0.1 ? 1 : 2);
    var loop = opt.loop;
    var LOOP_LEN = 0;
    if (loop && loop.length > 1) LOOP_LEN = loop[loop.length - 1].t || 1;

    var reduce = opt.reducedMotion !== null
      ? !!opt.reducedMotion
      : !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);

    function loopV(t) {
      if (!loop || !LOOP_LEN) return opt.value;
      var u = ((t % LOOP_LEN) + LOOP_LEN) % LOOP_LEN;
      for (var i = 0; i < loop.length - 1; i++) {
        var a = loop[i], b = loop[i + 1];
        if (u <= b.t) return a.v + (b.v - a.v) * ease(ramp(a.t, b.t, u));
      }
      return loop[loop.length - 1].v;
    }

    function nearestPhase(target) {
      if (!loop || !LOOP_LEN) return 0;
      var best = 0, bd = Infinity, N = 240, i, t, d;
      for (i = 0; i < N; i++) {
        t = i / N * LOOP_LEN;
        d = Math.abs(loopV(t) - target);
        if (opt.prefer && (t < opt.prefer[0] || t > opt.prefer[1])) d += 0.35;
        if (d < bd) { bd = d; best = t; }
      }
      return best;
    }

    var st = {
      v: opt.value,
      target: opt.value,
      phase: 0,
      mode: 'manual',
      idleMs: 0,
      keysIdx: -1,
      raf: 0,
      last: 0,
      dead: false
    };
    var listeners = [];

    function on(el, ev, fn, opts) {
      if (!el) return;
      el.addEventListener(ev, fn, opts);
      listeners.push([el, ev, fn, opts]);
    }

    function emit() { if (opt.onChange) opt.onChange(st.v); }

    function setMode(m) {
      if (st.mode === m) return;
      st.mode = m;
      if (opt.onMode) opt.onMode(m);
    }

    function take() {
      setMode('manual');
      st.idleMs = 0;
    }

    function release() {
      setMode('auto');
      st.phase = nearestPhase(st.v);
    }

    function syncFollow() {
      if (opt.follow && st.mode !== 'manual') {
        opt.follow.value = st.v.toFixed(decimals);
      }
    }

    function setValue(v, fromUser) {
      st.target = clamp(+v, opt.min, opt.max);
      if (fromUser) {
        take();
        if (opt.follow) opt.follow.value = st.target.toFixed(decimals);
      } else if (!st.raf) {
        st.v = st.target;
        emit();
      }
    }

    function tick(dt) {
      if (st.dead) return;
      if (st.mode === 'manual') {
        st.idleMs += dt * 1000;
        if (st.idleMs >= opt.idle) release();
      } else if (loop) {
        st.phase += dt;
        st.target = loopV(st.phase);
      }
      st.v += (st.target - st.v) * (1 - Math.exp(-dt * opt.rate));
      if (Math.abs(st.target - st.v) < 0.0004) st.v = st.target;
      syncFollow();
      emit();
    }

    /* ---- 输入接线 ---- */
    if (opt.follow) {
      on(opt.follow, 'pointerdown', function () { take(); });
      on(opt.follow, 'input', function () {
        take();
        st.target = clamp(parseFloat(opt.follow.value), opt.min, opt.max);
      });
    }

    if (opt.mount && opt.keys && opt.keys.length) {
      on(opt.mount, 'click', function () {
        take();
        st.keysIdx = (st.keysIdx + 1) % opt.keys.length;
        var v = opt.keys[st.keysIdx];
        st.target = v;
        if (opt.follow) opt.follow.value = v.toFixed(decimals);
        if (opt.onKey) opt.onKey(v);
      });
    }

    if (opt.keyboard) {
      on(document, 'keydown', function (ev) {
        var t = ev.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
        ev.preventDefault();
        take();
        st.target = clamp(
          +(st.target + (ev.key === 'ArrowRight' ? opt.step : -opt.step)).toFixed(4),
          opt.min, opt.max
        );
        if (opt.follow) opt.follow.value = st.target.toFixed(decimals);
      });
    }

    /* ---- 主循环 ---- */
    function frame(now) {
      if (st.dead) return;
      if (!st.last) st.last = now;
      var dt = Math.min((now - st.last) / 1000, 0.05);
      st.last = now;
      tick(dt);
      st.raf = root.requestAnimationFrame(frame);
    }

    if (loop && !reduce) {
      st.mode = 'auto';
      if (opt.onMode) opt.onMode('auto');
      st.raf = root.requestAnimationFrame(frame);
    } else {
      st.mode = 'manual';
      if (opt.onMode) opt.onMode('manual');
      emit();
    }

    return {
      tick: tick,
      take: take,
      release: release,
      setValue: setValue,
      pulse: function (dtSeconds) { tick(dtSeconds || 0.016); },
      destroy: function () {
        st.dead = true;
        if (st.raf) root.cancelAnimationFrame(st.raf);
        for (var i = 0; i < listeners.length; i++) {
          listeners[i][0].removeEventListener(listeners[i][1], listeners[i][2], listeners[i][3]);
        }
        listeners = [];
      },
      get value() { return st.v; },
      get mode() { return st.mode; },
      get decimals() { return decimals; }
    };
  }

  root.AutoPilot = { create: create, version: '1.0.0' };
})(window);
