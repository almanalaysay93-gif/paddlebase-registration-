(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var config = window.PADDLEBASE_CONFIG || {};

  // ---------- Validation (mirrors apps-script/Code.gs) ----------

  var RULES = {
    name: { test: function (v) { return v.length >= 2 && v.length <= 80; }, msg: 'Enter your full name.' },
    venue_name: { test: function (v) { return v.length >= 2 && v.length <= 120; }, msg: "Enter your venue's name." },
    courts_count: { test: function (v) { return /^\d+$/.test(v) && +v >= 1 && +v <= 200; }, msg: 'Use a whole number, 1 or more.' },
    rates: { test: function (v) { return /^\d+(\.\d{1,2})?$/.test(v) && +v <= 100000; }, msg: 'Enter a number, like 350 or 350.50.' },
    email: { test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 254; }, msg: 'Enter a valid email, like name@venue.ph.' },
    phone: { test: function (v) { return /^(\+63|0)9\d{9}$/.test(v.replace(/[\s-]/g, '')); }, msg: 'Use a PH mobile number, like 0917 123 4567.' }
  };

  var form = document.getElementById('regForm');
  var submitBtn = document.getElementById('submitBtn');
  var banner = document.getElementById('banner');
  var success = document.getElementById('success');

  function fieldValue(name) {
    return form.elements[name].value.trim();
  }

  function setError(name, message) {
    var input = form.elements[name];
    var err = document.getElementById(name + '-err');
    err.textContent = message || '';
    if (message) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  function validateField(name) {
    var ok = RULES[name].test(fieldValue(name));
    setError(name, ok ? '' : RULES[name].msg);
    return ok;
  }

  Object.keys(RULES).forEach(function (name) {
    var input = form.elements[name];
    var touched = false;
    input.addEventListener('blur', function () {
      touched = true;
      validateField(name);
    });
    input.addEventListener('input', function () {
      if (touched) validateField(name);
    });
  });

  function setSending(on) {
    submitBtn.disabled = on;
    submitBtn.setAttribute('aria-busy', on ? 'true' : 'false');
    submitBtn.querySelector('.btn__label').textContent = on ? 'Sending…' : 'Register';
  }

  function showBanner(message) {
    banner.textContent = message;
    banner.hidden = false;
  }

  function hideBanner() {
    banner.hidden = true;
    banner.textContent = '';
  }

  // ---------- Submit ----------

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideBanner();

    var names = Object.keys(RULES);
    var firstBad = null;
    names.forEach(function (name) {
      var ok = validateField(name);
      if (!ok && !firstBad) firstBad = name;
    });
    if (firstBad) {
      form.elements[firstBad].focus();
      return;
    }

    if (!config.APPS_SCRIPT_URL || config.APPS_SCRIPT_URL.indexOf('REPLACE_') === 0) {
      showBanner('Registration is not connected yet. Please check back soon.');
      return;
    }

    var payload = {};
    names.forEach(function (name) { payload[name] = fieldValue(name); });
    payload.website = form.elements.website.value;

    setSending(true);

    // text/plain avoids a CORS preflight with Apps Script
    fetch(config.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.ok) {
          showSuccess();
          return;
        }
        if (data.errors) {
          Object.keys(data.errors).forEach(function (name) {
            if (RULES[name]) {
              setError(name, data.errors[name]);
            } else {
              showBanner(data.errors[name]);
            }
          });
          var first = Object.keys(data.errors).find(function (n) { return form.elements[n]; });
          if (first) form.elements[first].focus();
        } else {
          showBanner(data.error || "Couldn't send. Check your connection and try again.");
        }
      })
      .catch(function () {
        showBanner("Couldn't send. Check your connection and try again.");
      })
      .then(function () {
        setSending(false);
      });
  });

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    if (hasGsap && !reduceMotion) {
      window.gsap.fromTo(success, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
    }
  }

  // ---------- Header shows after the hero ----------

  var header = document.getElementById('siteHeader');
  var heroCta = document.querySelector('.hero__actions .btn');
  if ('IntersectionObserver' in window && heroCta) {
    new IntersectionObserver(function (entries) {
      var heroCtaVisible = entries[0].isIntersecting;
      header.classList.toggle('is-visible', !heroCtaVisible);
    }).observe(heroCta);
  }

  // ---------- Pointer parallax on the scene layers ----------

  var layers = Array.prototype.slice.call(document.querySelectorAll('[data-depth]'));
  var pointer = { x: 0, y: 0 };
  var current = { x: 0, y: 0 };
  var scrollY = 0;

  function render() {
    current.x += (pointer.x - current.x) * 0.08;
    current.y += (pointer.y - current.y) * 0.08;
    layers.forEach(function (el) {
      var d = parseFloat(el.getAttribute('data-depth')) || 0;
      var tx = current.x * 26 * d;
      var ty = current.y * 26 * d - scrollY * 0.12 * d;
      var tz = (d - 0.5) * 160;
      el.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,' + tz.toFixed(2) + 'px)';
    });
    if (Math.abs(pointer.x - current.x) > 0.001 || Math.abs(pointer.y - current.y) > 0.001) {
      requestAnimationFrame(render);
    } else {
      raf = 0;
    }
  }

  var raf = 0;
  function kick() {
    if (!raf) raf = requestAnimationFrame(render);
  }

  if (!reduceMotion) {
    window.addEventListener('pointermove', function (e) {
      if (!finePointer) return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      kick();
    }, { passive: true });

    window.addEventListener('scroll', function () {
      scrollY = window.scrollY;
      kick();
    }, { passive: true });
  }

  // ---------- Card tilt (fine pointer only) ----------

  if (finePointer) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tilt]'), function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = 'transform 120ms linear';
        card.style.transform =
          'perspective(900px) translateZ(24px) rotateX(' + (-py * 8).toFixed(2) + 'deg) rotateY(' + (px * 8).toFixed(2) + 'deg)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transition = '';
        card.style.transform = '';
      });
    });
  }

  // ---------- Scroll reveals and transitions (GSAP) ----------

  if (hasGsap && window.ScrollTrigger && !reduceMotion) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    // Overhead Smash: cards rise from depth and flatten, staggered
    window.gsap.utils.toArray('.card.reveal').forEach(function (card, i) {
      window.gsap.fromTo(card,
        { y: 60, z: -120, rotateX: 12, opacity: 0 },
        {
          y: 0, z: 0, rotateX: 0, opacity: 1,
          duration: 0.9, ease: 'expo.out', delay: i * 0.07,
          scrollTrigger: { trigger: card, start: 'top 88%' }
        });
    });

    // Kitchen Line Wipe: section titles and the form panel
    window.gsap.utils.toArray('.display-l.reveal, .panel.reveal').forEach(function (el) {
      window.gsap.fromTo(el,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0.4 },
        {
          clipPath: 'inset(0 0% 0 0)', opacity: 1,
          duration: 0.9, ease: 'expo.inOut',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    // Hero intro: headline and chip snap in
    var heroTl = window.gsap.timeline({ defaults: { ease: 'expo.out' } });
    heroTl
      .fromTo('.kicker', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.display-xl', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.1 }, '-=0.35')
      .fromTo('.lead', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.7')
      .fromTo('.scoreboard', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.7 }, '-=0.6')
      .fromTo('.hero__actions', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.5');
  } else {
    // Reduced motion or no GSAP: show everything without animation
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
      el.style.opacity = '1';
      el.style.clipPath = 'none';
    });
  }
})();
