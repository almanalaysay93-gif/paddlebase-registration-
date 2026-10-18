/*
 * Dusk Court background loop (12s, 30fps).
 * Pure function of time: every tween is closed over DUR, so frame 360 == frame 0.
 * No Math.random, no clocks. Grain is a seeded table.
 */
(function () {
  var DUR = 12;
  var SEED = 0x0a18;

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function q(sel) {
    return document.querySelector(sel);
  }

  function all(sel) {
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  window.buildDusk = function (tl) {
    var rand = rng(SEED);
    var cam = q('#cam');
    var ball = q('#ball');
    var shadow = q('#shadow');
    var pulse = q('#pulse');
    var grain = q('#grain');
    var haze = q('#haze');

    // 1. Camera dolly: closed ellipse (x +-40px, y +-12px), back at 0,0 at 12s.
    tl.to(cam, { x: 40, y: 12, duration: 3, ease: 'sine.inOut' }, 0)
      .to(cam, { x: -40, y: -12, duration: 6, ease: 'sine.inOut' }, 3)
      .to(cam, { x: 0, y: 0, duration: 3, ease: 'sine.inOut' }, 9);

    // 2. Lime light pulse runs the kitchen line once per loop. Off-screen at both seam points.
    tl.fromTo(pulse, { x: -520 }, { x: 1940, duration: DUR, ease: 'none' }, 0);

    // 3. Dink arc over the net, 4s to 7s. Ball and shadow are hidden at the seam.
    tl.set(ball, { x: 560, y: 640, opacity: 0 }, 0);
    tl.set(shadow, { x: 560, opacity: 0 }, 0);
    tl.to(ball, { opacity: 1, duration: 0.25 }, 4)
      .to(ball, { x: 1360, duration: 3, ease: 'none' }, 4)
      .to(ball, { y: 380, duration: 1.5, ease: 'sine.out' }, 4)
      .to(ball, { y: 640, duration: 1.5, ease: 'sine.in' }, 5.5)
      .to(ball, { opacity: 0, duration: 0.3 }, 6.7);
    tl.to(shadow, { opacity: 0.5, duration: 0.25 }, 4)
      .to(shadow, { x: 1360, duration: 3, ease: 'none' }, 4)
      .to(shadow, { opacity: 0, duration: 0.3 }, 6.7);

    // 4. Floodlight bokeh: slow closed drift. Yoyo repeats fill exactly 12s.
    all('.bokeh').forEach(function (b, i) {
      var amp = 24 + (i % 3) * 10;
      var sign = i % 2 ? 1 : -1;
      tl.to(b, { x: sign * amp, duration: DUR / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
      tl.to(b, { y: -sign * amp * 0.6, duration: DUR / 4, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0);
    });

    // 5. Court haze breathes once per loop.
    tl.fromTo(haze, { opacity: 0.6 }, { opacity: 1, duration: DUR / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);

    // 6. Grain: 10 Hz seeded offsets across 12s. Index 0 repeats at the seam, so the loop is seamless.
    for (var n = 0; n < 120; n++) {
      tl.set(grain, { x: Math.round(rand() * 12 - 6), y: Math.round(rand() * 12 - 6) }, n / 10);
    }
  };
})();
