/* ════════════════════════════════════════════════════════════════════
   ALEX FERNANDES — PORTFOLIO  ·  script.js
   Minimal VANILLA JavaScript — no frameworks, no libraries.
   CSS handles the vast majority of the animation; this file only does
   what CSS genuinely cannot:
     1. Preloader dismissal
     2. Sticky-nav state + mobile menu
     3. Scroll-spy (active nav link)
     4. Scroll-reveal triggers (IntersectionObserver)
     5. Stat count-up numbers
     6. Hero role "scramble-decode" text
     7. Contact-form validation (front-end only)
     8. Cursor spotlight
     9. Footer year + image fallback
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── 1. PRELOADER ─────────────────────────────────────────────── */
  var hidePreloader = function () { document.body.classList.add('loaded'); };
  window.addEventListener('load', hidePreloader);
  setTimeout(hidePreloader, 2600); /* failsafe if an asset hangs */
  if (reduced) hidePreloader();

  /* ── 2. STICKY NAV + MOBILE MENU ──────────────────────────────── */
  var header = $('.site-header');
  var navToggle = $('.nav-toggle');

  var onScroll = function () {
    if (header) header.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  var closeMenu = function () {
    document.body.classList.remove('nav-open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    }
  };

  /* close menu when a link is clicked */
  $$('.nav-links a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* close on Escape or click outside the panel */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('nav-open')) return;
    var panel = $('.nav-links');
    if (panel && !panel.contains(e.target) && navToggle && !navToggle.contains(e.target)) closeMenu();
  });

  /* ── 3. SCROLL-SPY — highlight the section you're in ──────────── */
  var navAnchors = $$('.nav-links a[href^="#"]');
  if ('IntersectionObserver' in window && navAnchors.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (sec) { spy.observe(sec); });
  }

  /* ── 4. SCROLL REVEALS ────────────────────────────────────────── */
  var revealables = $$('.reveal, .timeline');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ── 5. COUNT-UP STATISTICS ───────────────────────────────────── */
  var counters = $$('[data-count]');
  var runCounter = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduced) { el.textContent = String(target).padStart(2, '0'); return; }
    var dur = 1400, t0 = null;
    var tick = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && counters.length) {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObs.observe(el); });
  }

  /* ── 6. HERO ROLE — scramble/decode cycler ────────────────────── */
  /* ✏️ Edit the rotating job titles here */
  var roles = [
    'DIT Student',
    'AI Enthusiast',
    'Cybersecurity Learner',
    'Network Tinkerer',
    'Database Builder'
  ];
  var roleEl = $('#role-scramble');
  if (roleEl && roles.length) {
    var chars = '!-_\\/[]{}=+*^?#';
    var roleIdx = 0, rafId = null, from = '';

    var scrambleTo = function (text) {
      if (rafId) cancelAnimationFrame(rafId);
      var len = Math.max(from.length, text.length);
      var queue = [];
      for (var i = 0; i < len; i++) {
        queue.push({
          to: text[i] || '',
          start: Math.floor(Math.random() * 22),
          end: Math.floor(Math.random() * 22) + 22,
          ch: ''
        });
      }
      var frame = 0;
      var update = function () {
        var out = '', done = 0;
        for (var j = 0; j < queue.length; j++) {
          var q = queue[j];
          if (frame >= q.end) { done++; out += q.to; }
          else if (frame >= q.start) {
            if (!q.ch || Math.random() < 0.28) q.ch = chars[Math.floor(Math.random() * chars.length)];
            out += '<span class="dud">' + q.ch + '</span>';
          } else {
            out += from[j] || '';
          }
        }
        roleEl.innerHTML = out;
        frame++;
        if (done < queue.length) rafId = requestAnimationFrame(update);
        else from = text;
      };
      update();
    };

    if (reduced) {
      roleEl.textContent = roles[0];          /* static for reduced motion */
    } else {
      from = roles[0];
      scrambleTo(roles[0]);                    /* decode the first title on load */
      setInterval(function () {
        roleIdx = (roleIdx + 1) % roles.length;
        scrambleTo(roles[roleIdx]);
      }, 3200);
    }
  }

  /* ── 7. CONTACT FORM — front-end validation only ──────────────── */
  /*
    ✏️ FORM BACKEND: this template ships WITHOUT a back end.
    To actually receive messages, either:
      • point the <form> to a service (Formspree / Web3Forms / EmailJS…), or
      • replace the fake-success block below with a fetch() to your own API.
  */
  var form = $('#contact-form');
  if (form) {
    var statusBox = $('#form-status');
    var submitBtn = $('#submit-btn');
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

    var rules = {
      name:    function (v) { return v.trim().length >= 2  || 'Please enter your name (min. 2 characters).'; },
      email:   function (v) { return emailOk(v)           || 'Please enter a valid email address.'; },
      subject: function (v) { return v.trim().length >= 3  || 'Please add a short subject (min. 3 characters).'; },
      message: function (v) { return v.trim().length >= 10 || 'Your message should be at least 10 characters.'; }
    };

    var setError = function (field, msg) {
      var wrap = field.closest('.form-field');
      if (!wrap) return;
      wrap.classList.add('error');
      var note = wrap.querySelector('.field-msg');
      if (note && typeof msg === 'string') note.textContent = '▸ ' + msg;
    };
    var clearError = function (field) {
      var wrap = field.closest('.form-field');
      if (wrap) wrap.classList.remove('error');
    };
    var validate = function (field) {
      var rule = rules[field.name];
      if (!rule) return true;
      var result = rule(field.value);
      if (result === true) { clearError(field); return true; }
      setError(field, result);
      return false;
    };

    $$('input, textarea', form).forEach(function (field) {
      field.addEventListener('input', function () { clearError(field); });
      field.addEventListener('blur', function () { if (field.value) validate(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault(); /* no backend yet — see comment above */
      var fields = $$('input, textarea', form);
      var firstBad = null;
      fields.forEach(function (f) { if (!validate(f) && !firstBad) firstBad = f; });

      if (firstBad) { firstBad.focus(); return; }

      /* ✓ valid — demo success state. Replace with a real submission. */
      if (submitBtn) {
        submitBtn.dataset.original = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Message Ready ✓';
        setTimeout(function () {
          if (submitBtn.dataset.original) submitBtn.innerHTML = submitBtn.dataset.original;
        }, 4000);
      }
      if (statusBox) {
        statusBox.innerHTML = '✓ Your message passed validation. This demo form is not connected to a server yet — hook it up to Formspree, Web3Forms, EmailJS or your own API to deliver messages (see the comment in <strong>index.html</strong>).';
        statusBox.classList.add('show');
      }
      form.reset();
    });
  }

  /* ── 8. CURSOR SPOTLIGHT ──────────────────────────────────────── */
  var glow = $('#cursor-glow');
  if (glow && !reduced && window.matchMedia('(pointer: fine)').matches) {
    var tx = window.innerWidth / 2, ty = window.innerHeight / 2, x = tx, y = ty;
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      glow.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      requestAnimationFrame(loop);
    })();
  } else if (glow) {
    glow.style.display = 'none';
  }

  /* ── 9. FOOTER YEAR + PROFILE IMAGE FALLBACK ──────────────────── */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* if images/profile.jpg is missing, hide the <img> so the
     initials placeholder inside the circle is shown instead */
  $$('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () { img.style.display = 'none'; });
  });
})();

