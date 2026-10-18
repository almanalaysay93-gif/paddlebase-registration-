/*
 * Paddlebase court loop (12s, 30fps), after the "Welcome to Paddlebase" poster.
 * Pure function of time: every tween is closed over DUR, so frame 360 == frame 0.
 * Parallax: one shared camera sway, applied to each [data-depth] layer scaled by depth.
 */
(function () {
  var DUR = 12;

  function q(sel) {
    return document.querySelector(sel);
  }

  function all(sel) {
    return Array.prototype.slice.call(document.querySelectorAll(sel));
  }

  window.buildCourt = function (tl) {
    // 1. Camera sway: closed figure-eight. Deeper layers move more, so planes separate.
    all('.layer').forEach(function (layer) {
      var d = parseFloat(layer.getAttribute('data-depth')) || 0;
      var ax = 14 * d;
      var ay = 5 * d;
      tl.fromTo(layer, { x: -ax }, { x: ax, duration: DUR / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
      tl.fromTo(layer, { y: 0 }, { y: ay, duration: DUR / 4, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0);
    });

    // 2. Lime stripes breathe and glide along their angle.
    tl.fromTo('.stripe--a', { xPercent: -3 }, { xPercent: 3, duration: DUR / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
    tl.fromTo('.stripe--c', { opacity: 0.5 }, { opacity: 1, duration: DUR / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);

    // 3. Paddle floats and rocks, like it is leaning and settling.
    tl.fromTo('#paddle', { y: 0, rotation: -2 }, { y: -26, rotation: 2, duration: DUR / 4, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0);
    tl.fromTo('#paddleShadow', { scaleX: 1, opacity: 0.9 }, { scaleX: 0.92, opacity: 0.6, duration: DUR / 4, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0);

    // 4. Ball: two soft bounces per loop, holes spin a full turn.
    tl.fromTo('#ball', { y: 0 }, { y: -120, duration: DUR / 6, ease: 'power2.out', yoyo: true, repeat: 5 }, 0);
    tl.fromTo('#ballShadow', { scale: 1, opacity: 0.9 }, { scale: 0.6, opacity: 0.35, duration: DUR / 6, ease: 'power2.out', yoyo: true, repeat: 5 }, 0);
    tl.fromTo('#holes', { rotation: 0, svgOrigin: '130 130' }, { rotation: 360, svgOrigin: '130 130', duration: DUR, ease: 'none' }, 0);

    // 5. Foreground flares drift.
    all('.flare').forEach(function (f, i) {
      var s = i ? -1 : 1;
      tl.fromTo(f, { x: -30 * s, opacity: 0.6 }, { x: 30 * s, opacity: 1, duration: DUR / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
    });
  };
})();
