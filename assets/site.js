/* fotelier.app: The Developing Room. No libraries, no storage, no scroll listeners.
   CSS does the scroll-driven motion; this file adds drag, keys, hold-to-compare, the loupe,
   and a small --p fallback for browsers without animation-timeline. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, W = window;
  var s3 = d.querySelector('.s3');
  if (!s3) return;
  root.classList.add('js');

  var SDA = !!(W.CSS && CSS.supports('animation-timeline: view()'));
  var mqPin = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 520px)');
  var mqMo = matchMedia('(prefers-reduced-motion: no-preference)');
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var raf = W.requestAnimationFrame.bind(W);
  var listen = function (mq, f) { mq.addEventListener ? mq.addEventListener('change', f) : mq.addListener(f); };

  var s4 = d.querySelector('.s4');
  var strip = s3.querySelector('.strip'), lis = $$('li', strip);
  var trio = s3.querySelector('.trio');
  var status = d.getElementById('status');
  var LOOKS = ['00', 'a1', 'b3', 'c2', 'd4', 'e1'];
  var LOOK_AT = [0.15, 0.33, 0.51, 0.69, 0.87]; // mid-transition points of @keyframes looks
  var CROP_AT = [0.18, 0.38, 0.58, 0.78];       // mid-transition points of @keyframes easel
  var stepIdx = function (p, at) { var i = 0; while (i < at.length && p >= at[i]) i++; return i; };
  var setAttr = function (el, k, v) { if (el && el.getAttribute(k) !== String(v)) el.setAttribute(k, v); };
  // Scene progress over `contain 0%` to `contain 100%`, i.e. while the stage is pinned.
  var geo = function (el) {
    var r = el.getBoundingClientRect(), range = el.offsetHeight - el.firstElementChild.offsetHeight;
    return { top: r.top + W.pageYOffset, range: range, p: range > 0 ? clamp(-r.top / range, 0, 1) : 0 };
  };

  /* ---------- Fallback: one rAF loop sets --p on live scenes (all reads, then all writes) ---------- */
  var scenes = $$('.scn'), live = [], loop = 0, lastY = -1, lastH = 0, io = null;
  function write(el, p) {
    el.style.setProperty('--p', p.toFixed(4));
    if (el === s3) setAttr(s3, 'data-look', LOOKS[stepIdx(p, LOOK_AT)]);
    else if (el === s4) setAttr(s4, 'data-crop', stepIdx(p, CROP_AT));
  }
  function tick() {
    loop = 0;
    if (!live.length) return;
    var y = W.pageYOffset, h = W.innerHeight;
    if (y !== lastY || h !== lastH) {
      lastY = y; lastH = h;
      var ps = live.map(function (el) { return geo(el).p; });
      live.forEach(function (el, i) { write(el, ps[i]); });
    }
    loop = raf(tick);
  }
  function startFb() {
    if (io) return;
    root.classList.add('fb');
    var ps = scenes.map(function (el) { return geo(el).p; });
    scenes.forEach(function (el, i) { write(el, ps[i]); });
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var i = live.indexOf(e.target);
        if (e.isIntersecting) { if (i < 0) live.push(e.target); }
        else {
          if (i > -1) live.splice(i, 1);
          write(e.target, e.boundingClientRect.top > 0 ? 0 : 1);
        }
      });
      if (live.length && !loop) { lastY = -1; loop = raf(tick); }
    });
    scenes.forEach(function (el) { io.observe(el); });
  }
  function stopFb() {
    if (!io) return;
    io.disconnect(); io = null; live = [];
    if (loop) cancelAnimationFrame(loop);
    loop = 0;
    root.classList.remove('fb');
    scenes.forEach(function (el) { el.style.removeProperty('--p'); });
    if (s4) s4.removeAttribute('data-crop');
  }

  /* Entry fallback: .rv, .typed and .fl get .in once they come into view */
  var io2 = null;
  function entries(on) {
    root.classList.toggle('io', on);
    if (!on || io2) return;
    io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.rv,.typed,.fl').forEach(function (el) { io2.observe(el); });
  }

  /* ---------- Film strip ---------- */
  var current = 'a1';
  function centre(li) { // scroll the strip only, never the page
    strip.scrollLeft = li.offsetLeft - strip.offsetLeft - (strip.clientWidth - li.offsetWidth) / 2;
  }
  function selectLook(code) {
    current = code;
    s3.setAttribute('data-look', code);
    lis.forEach(function (li) {
      if (li.getAttribute('data-look') === code) li.setAttribute('aria-current', 'true');
      else li.removeAttribute('aria-current');
    });
  }

  function mode() {
    if (!SDA) { if (mqPin.matches) startFb(); else stopFb(); }
    strip.setAttribute('data-cur', mqPin.matches ? 'Drag' : 'Choose');
    var bd = d.querySelector('.bc-drag b'); if (bd) bd.textContent = mqPin.matches ? 'Drag the strip' : 'Tap a look';
    if (mqPin.matches) {
      lis.forEach(function (li) { li.removeAttribute('aria-current'); });
      if (SDA) s3.removeAttribute('data-look');
    } else {
      selectLook(current);
      centre(lis[LOOKS.indexOf(current)]);
    }
    entries(!SDA && mqMo.matches);
  }

  // Pinned: a horizontal drag on the strip moves the window scroll inside the scene,
  // so dragging and scrolling stay in step. Geometry is read once, on pointerdown.
  var drag = null, dragTo = 0, dragRaf = 0;
  strip.addEventListener('pointerdown', function (e) {
    if (!mqPin.matches || e.button) return;
    var g = geo(s3);
    var pitch = lis[1].getBoundingClientRect().left - lis[0].getBoundingClientRect().left;
    if (!(g.range > 0 && pitch > 0)) return;
    drag = { id: e.pointerId, x: e.clientX, y: W.pageYOffset, k: g.range / (5.512 * pitch), min: g.top, max: g.top + g.range };
    try { strip.setPointerCapture(e.pointerId); } catch (err) {}
    strip.classList.add('drag');
  });
  strip.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    dragTo = clamp(drag.y - (e.clientX - drag.x) * drag.k, drag.min, drag.max);
    if (Math.abs(e.clientX - drag.x) > 8) did('drag');
    if (!dragRaf) dragRaf = raf(function () { dragRaf = 0; W.scrollTo(0, dragTo); });
  });
  function endDrag(e) { if (drag && e.pointerId === drag.id) { drag = null; strip.classList.remove('drag'); } }
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { strip.addEventListener(t, endDrag); });

  // Static (reduced motion or short screens): tap a frame to crossfade the prints.
  strip.addEventListener('click', function (e) {
    if (mqPin.matches) return;
    var li = e.target.closest && e.target.closest('li');
    if (li) { selectLook(li.getAttribute('data-look')); did('drag'); }
  });

  strip.addEventListener('keydown', function (e) {
    var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    did('drag');
    if (mqPin.matches) {
      var g = geo(s3);
      var next = clamp(Math.round((g.p - 0.0548) / 0.1814) + dir, 0, 5);
      W.scrollTo({ top: g.top + (0.0548 + 0.1814 * next) * g.range, behavior: 'smooth' });
    } else {
      var i = clamp(LOOKS.indexOf(current) + dir, 0, 5);
      selectLook(LOOKS[i]);
      centre(lis[i]);
    }
  });

  /* ---------- Hold to compare ---------- */
  trio.tabIndex = 0;
  trio.setAttribute('role', 'group');
  trio.setAttribute('aria-label', 'Prints');
  trio.setAttribute('aria-describedby', 's3d');
  trio.setAttribute('aria-keyshortcuts', 'Space');
  var holdT = 0, hx = 0, hy = 0, cmp = false, clearT = 0;
  function cmpOn() {
    holdT = 0;
    if (cmp) return;
    cmp = true;
    did('hold');
    s3.classList.add('cmp');
    clearTimeout(clearT);
    status.textContent = 'Showing originals'; // unchanged text is not re-announced
  }
  function cmpOff() {
    clearTimeout(holdT); holdT = 0;
    if (!cmp) return;
    cmp = false;
    s3.classList.add('ntr'); // back to the look without a crossfade
    s3.classList.remove('cmp');
    raf(function () { raf(function () { s3.classList.remove('ntr'); }); });
    clearTimeout(clearT);
    clearT = setTimeout(function () { status.textContent = ''; }, 1000);
  }
  trio.addEventListener('pointerdown', function (e) {
    if (e.button) return;
    hx = e.clientX; hy = e.clientY;
    clearTimeout(holdT);
    holdT = setTimeout(cmpOn, 180);
  });
  trio.addEventListener('pointermove', function (e) {
    if (holdT && Math.abs(e.clientX - hx) + Math.abs(e.clientY - hy) > 8) { clearTimeout(holdT); holdT = 0; }
  });
  ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(function (t) { trio.addEventListener(t, cmpOff); });
  trio.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  trio.addEventListener('keydown', function (e) {
    if (e.key !== ' ' && e.code !== 'Space') return;
    e.preventDefault();
    if (!e.repeat) cmpOn();
  });
  trio.addEventListener('keyup', function (e) { if (e.key === ' ' || e.code === 'Space') cmpOff(); });
  W.addEventListener('blur', cmpOff);
  d.addEventListener('visibilitychange', function () { if (d.hidden) cmpOff(); });

  /* ---------- Loupe and eyedropper ---------- */
  var pick = d.querySelector('.pick');
  if (pick) (function () {
    var frame = pick.parentElement, loupe = frame.querySelector('.loupe');
    var Z = 2.5, C = 58; // 120px loupe minus a 2px border each side: centre at 58
    var g = null, lz = null, u = 0, v = 0, drawQ = 0, inspect = false, down = null;
    var cv = d.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
    var keyFocus = function () { try { return pick.matches(':focus-visible'); } catch (err) { return true; } }; // Safari < 15.4
    pick.tabIndex = 0;
    pick.setAttribute('role', 'group');
    pick.setAttribute('aria-label', 'Eyedropper. Arrow keys move the loupe; Enter picks the mat colour.');

    function setup() { // one read per hover, tap or focus; nothing is read while the pointer moves
      var pr = pick.getBoundingClientRect(), fr = frame.getBoundingClientRect();
      g = { ox: pr.left - fr.left, oy: pr.top - fr.top, w: pr.width, h: pr.height,
            px: pr.left + W.pageXOffset, py: pr.top + W.pageYOffset, f: getComputedStyle(pick).filter };
      if (!lz) {
        lz = pick.cloneNode(true);
        lz.removeAttribute('tabindex'); lz.removeAttribute('role'); lz.removeAttribute('aria-label');
        lz.classList.remove('pick'); lz.classList.add('lz');
        loupe.appendChild(lz);
      }
      lz.style.width = g.w + 'px'; lz.style.height = g.h + 'px';
    }
    function draw() {
      drawQ = 0;
      loupe.style.transform = 'translate(' + (g.ox + u - 60) + 'px,' + (g.oy + v - 60) + 'px)';
      lz.style.transform = 'translate(' + (C - Z * u) + 'px,' + (C - Z * v) + 'px) scale(' + Z + ')';
    }
    function show(x, y) {
      u = clamp(x, 0, g.w); v = clamp(y, 0, g.h);
      loupe.classList.add('on');
      if (!drawQ) drawQ = raf(draw);
    }
    function at(e) { show(e.pageX - g.px, e.pageY - g.py); }
    function hide() { loupe.classList.remove('on'); }

    function hex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; }
    function mix(a, b, t) { return a.map(function (x, i) { return Math.round(x + (b[i] - x) * t); }); }
    // Placeholder prints: hit-test sun, land and sky from the data-* attributes.
    function drawn(x, y) {
      var sky = (pick.getAttribute('data-sky') || '#888888 #888888').split(' ');
      var sun = (pick.getAttribute('data-sun') || '').split(' ');
      var land = (pick.getAttribute('data-land') || '').split(' ');
      var ar = g.w / g.h;
      if (sun.length === 4) {
        var r = sun[2] / 200, sx = sun[0] / 100 + r, sy = sun[1] / 100 + r * ar;
        if (Math.sqrt((x - sx) * (x - sx) + ((y - sy) / ar) * ((y - sy) / ar)) <= r) return hex(sun[3]);
      }
      if (land.length === 3) {
        var lh = land[0] / 100;
        if (y >= 1 - lh) return mix(hex(land[1]), hex(land[2]), (y - 1 + lh) / lh);
      }
      return mix(hex(sky[0]), hex(sky[1]), y);
    }
    // Sample through a 1px canvas with the print's own filter, so the mat matches what you see.
    // Real photos: a same-origin <img> inside .pick is sampled the same way (object-fit: cover).
    function sample(x, y) {
      var img = pick.querySelector('img'), rgb = null;
      cv.width = cv.height = 1;
      if (g.f && g.f !== 'none') cx.filter = g.f;
      try {
        if (img && img.naturalWidth) {
          var s = Math.max(g.w / img.naturalWidth, g.h / img.naturalHeight);
          var sx = (x * g.w + (img.naturalWidth * s - g.w) / 2) / s, sy = (y * g.h + (img.naturalHeight * s - g.h) / 2) / s;
          cx.drawImage(img, Math.floor(sx), Math.floor(sy), 1, 1, 0, 0, 1, 1);
        } else {
          rgb = drawn(x, y);
          cx.fillStyle = 'rgb(' + rgb + ')';
          cx.fillRect(0, 0, 1, 1);
        }
        var p = cx.getImageData(0, 0, 1, 1).data;
        return 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')';
      } catch (err) { return rgb ? 'rgb(' + rgb + ')' : null; }
    }
    function apply() { var c = sample(u / g.w, v / g.h); if (c) { frame.style.backgroundColor = c; did('pick'); } }

    pick.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') { setup(); at(e); } });
    pick.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch' && !keyFocus()) hide(); });
    pick.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      if (e.pointerType === 'touch') {
        down = { x: e.clientX, y: e.clientY, m: false };
        if (inspect) { setup(); at(e); }
      }
    });
    pick.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'touch') { if (g) at(e); return; }
      if (inspect && down) {
        if (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 8) down.m = true;
        at(e);
      }
    });
    pick.addEventListener('pointerup', function (e) {
      if (e.pointerType !== 'touch') { if (g) { at(e); apply(); } return; }
      if (!down) return;
      var moved = down.m || Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 8;
      down = null;
      if (!inspect) {
        if (moved) return;
        inspect = true; pick.classList.add('inspect'); // touch-action: none until tapped again
        setup(); at(e);
      } else if (moved) apply();
      else { inspect = false; pick.classList.remove('inspect'); hide(); }
    });
    pick.addEventListener('pointercancel', function () { down = null; });
    pick.addEventListener('focus', function () {
      if (!keyFocus()) return;
      setup(); show(g.w / 2, g.h / 2);
    });
    pick.addEventListener('blur', function () { hide(); });
    pick.addEventListener('keydown', function (e) {
      if (!g) setup();
      var k = e.key, s = e.shiftKey ? 0.1 : 0.03;
      var dx = k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0, dy = k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : 0;
      if (dx || dy) { e.preventDefault(); show(u + dx * s * g.w, v + dy * s * g.h); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); show(u, v); apply(); }
      else if (k === 'Escape') hide();
    });
  })();

  /* ---------- Where you are: header room, rail, hint ---------- */
  var room = d.querySelector('.room'), rail = d.querySelector('.rail'), hint = d.querySelector('.hint span');
  var rooms = $$('[data-room]'), railLinks = rail ? $$('a', rail) : [];
  if (W.IntersectionObserver) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target.getAttribute('data-room');
        if (room && room.textContent !== t) room.textContent = t;
        if (hint) hint.textContent = e.target.getAttribute('data-hint') || '';
        railLinks.forEach(function (a) { a.classList.toggle('now', a.getAttribute('data-to') === t); });
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    rooms.forEach(function (el) { rio.observe(el); });
  }
  // Rail nodes sit where each room starts in the page's scroll, so the playhead meets them on arrival.
  var placeQ = 0;
  function placeRail() {
    placeQ = 0;
    var H = root.scrollHeight - W.innerHeight;
    var tops = rooms.map(function (el) { return el.getBoundingClientRect().top + W.pageYOffset; });
    railLinks.forEach(function (a, i) { a.style.top = (H > 0 ? clamp(tops[i] / H, 0, 1) * 100 : 0).toFixed(2) + '%'; });
  }
  if (rail) {
    placeRail();
    if (W.ResizeObserver) new ResizeObserver(function () { if (!placeQ) placeQ = raf(placeRail); }).observe(d.body);
  }
  var did = function (k) { root.classList.add('did-' + k); };

  /* ---------- Hover: peek at a look, tilt a framed print ---------- */
  strip.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch' || e.pointerType === 'pen' || drag) return;
    var li = e.target.closest && e.target.closest('li');
    if (li) setAttr(s3, 'data-peek', li.getAttribute('data-look'));
  });
  strip.addEventListener('pointerleave', function () { s3.removeAttribute('data-peek'); });
  strip.addEventListener('pointerdown', function () { s3.removeAttribute('data-peek'); });

  var mqHover = matchMedia('(hover: hover) and (pointer: fine)'); // reduced motion keeps the cursor, without lag
  $$('.mats .frame:not(.f-pick)').forEach(function (fr) {
    var r = null, tx = 0, ty = 0, q = 0;
    function paint() { q = 0; fr.style.transform = 'perspective(700px) rotateX(' + (-ty * 7).toFixed(2) + 'deg) rotateY(' + (tx * 7).toFixed(2) + 'deg)'; }
    fr.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch' && e.pointerType !== 'pen' && mqHover.matches && mqMo.matches) r = fr.getBoundingClientRect(); });
    fr.addEventListener('pointermove', function (e) {
      if (!r) return;
      tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
      if (!q) q = raf(paint);
    });
    fr.addEventListener('pointerleave', function () { r = null; fr.style.transform = ''; });
  });

  /* ---------- Cursor: four viewfinder corners and a red dot. Over a link the corners lock onto it;
     over anything you can use they open up and name the action. The safelight follows behind. ---------- */
  var cur = null, cns = [], dot, lbl, glow, cx = -200, cy = -200, gx = -200, gy = -200, cq = 0;
  var P = [[-200, -200], [-200, -200], [-200, -200], [-200, -200]], L = [-200, -200];
  var word = '', want = '', shown = false, lockEl = null, wantLock = null, press = false;
  function curTick() {
    cq = 0;
    if (want !== word) { word = want; lbl.textContent = word; cur.classList.toggle('on', !!word); } // writes stay in the frame
    if (wantLock !== lockEl) { lockEl = wantLock; cur.classList.toggle('lock', !!lockEl); }
    var k = mqMo.matches ? 0.3 : 1, kg = mqMo.matches ? 0.09 : 1, T, lt, i, moving = false;
    if (lockEl) {
      var r = lockEl.getBoundingClientRect(), m = press ? 2 : 6;
      T = [[r.left - m, r.top - m], [r.right + m, r.top - m], [r.left - m, r.bottom + m], [r.right + m, r.bottom + m]];
      lt = [r.left - m, r.bottom + m + 8];
    } else {
      var sz = press ? 8 : word ? 22 : 14;
      T = [[cx - sz, cy - sz], [cx + sz, cy - sz], [cx - sz, cy + sz], [cx + sz, cy + sz]];
      lt = [cx + sz + 10, cy + sz + 4];
    }
    for (i = 0; i < 4; i++) {
      P[i][0] += (T[i][0] - P[i][0]) * k; P[i][1] += (T[i][1] - P[i][1]) * k;
      if (Math.abs(T[i][0] - P[i][0]) + Math.abs(T[i][1] - P[i][1]) > 0.3) moving = true;
      cns[i].style.transform = 'translate(' + P[i][0].toFixed(1) + 'px,' + P[i][1].toFixed(1) + 'px)';
    }
    L[0] += (lt[0] - L[0]) * k; L[1] += (lt[1] - L[1]) * k;
    lbl.style.transform = 'translate(' + L[0].toFixed(1) + 'px,' + L[1].toFixed(1) + 'px)';
    dot.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    gx += (cx - gx) * kg; gy += (cy - gy) * kg;
    glow.style.transform = 'translate(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px)';
    if (moving || lockEl || Math.abs(cx - gx) + Math.abs(cy - gy) > 0.5 || want !== word) cq = raf(curTick);
  }
  function curMove(e) {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
    cx = e.clientX; cy = e.clientY;
    if (!shown) {
      shown = true; gx = cx; gy = cy; L = [cx, cy];
      P = [[cx, cy], [cx, cy], [cx, cy], [cx, cy]];
      raf(function () { cur.classList.add('vis'); glow.classList.add('vis'); });
    }
    if (!cq) cq = raf(curTick);
  }
  function curOver(e) {
    var t = e.target, el = t.closest && t.closest('[data-cur],a');
    want = !el ? '' : el.getAttribute('data-cur') || (/^mailto:/.test(el.getAttribute('href') || '') ? 'Write' : 'Open');
    wantLock = el && el.tagName === 'A' ? el : null;
    if (!cq) cq = raf(curTick);
  }
  function curHide(e) { if (!e.relatedTarget) { shown = false; wantLock = null; cur.classList.remove('vis'); glow.classList.remove('vis'); } }
  function curDown() { press = true; if (!cq) cq = raf(curTick); }
  function curUp() { press = false; if (!cq) cq = raf(curTick); }
  function cursor() {
    var on = mqHover.matches;
    if (on && !cur) {
      cur = d.createElement('div'); cur.className = 'cur'; cur.setAttribute('aria-hidden', 'true');
      for (var i = 1; i <= 4; i++) { var c = d.createElement('span'); c.className = 'cn c' + i; cns.push(c); cur.appendChild(c); }
      dot = d.createElement('span'); dot.className = 'dot';
      lbl = d.createElement('span'); lbl.className = 'lbl';
      cur.appendChild(dot); cur.appendChild(lbl);
      glow = d.createElement('div'); glow.className = 'glow'; glow.setAttribute('aria-hidden', 'true');
      d.body.appendChild(glow); d.body.appendChild(cur);
    }
    if (!cur) return;
    root.classList.toggle('cc', on);
    var f = on ? 'addEventListener' : 'removeEventListener';
    d[f]('pointermove', curMove, { passive: true });
    d[f]('pointerover', curOver);
    d[f]('pointerout', curHide);
    d[f]('pointerdown', curDown);
    d[f]('pointerup', curUp);
    if (!on) { shown = false; cur.classList.remove('vis'); glow.classList.remove('vis'); }
  }
  cursor();
  listen(mqHover, cursor);

  mode();
  listen(mqPin, mode);
  listen(mqMo, mode);
})();
