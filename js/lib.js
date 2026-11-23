/* Hilfsfunktionen: DOM, Passwort-Hash, Schnee, Konfetti, Lichterkette */
(function () {
  'use strict';
  const AU = (window.AU = {});
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  AU.reduceMotion = reduce;

  AU.el = function (tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  AU.esc = function (s) {
    return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  };
  AU.paras = function (text) {
    return String(text || '')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => '<p>' + AU.esc(p).replace(/\n/g, '<br>') + '</p>')
      .join('');
  };
  AU.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Einfacher Hash fürs Test-Passwort (nur Verschleierung, kein Tresor)
  AU.hash = function (str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  };

  // Foto im Polaroid-Stil
  AU.photo = function (src, caption) {
    const fig = AU.el('figure', 'photo');
    fig.style.margin = '8px auto 22px';
    const img = new Image();
    img.alt = caption || '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.onerror = function () {
      const m = AU.el('div', 'missing', 'Bild nicht gefunden:<br>' + AU.esc(src));
      img.replaceWith(m);
    };
    img.src = src;
    fig.append(img);
    if (caption) fig.append(AU.el('figcaption', '', AU.esc(caption)));
    return fig;
  };

  // Belohnungs-Karte nach einem Spiel
  AU.reward = function (container, r) {
    r = r || {};
    const box = AU.el('div', 'reward');
    box.innerHTML =
      '<div class="tag"><svg viewBox="0 0 24 24"><use href="#i-star"/></svg>Geschafft<svg viewBox="0 0 24 24"><use href="#i-star"/></svg></div>' +
      (r.title ? '<h3>' + AU.esc(r.title) + '</h3>' : '') +
      (r.text ? AU.paras(r.text) : '');
    if (r.image) box.append(AU.photo(r.image, r.caption));
    container.append(box);
    setTimeout(() => box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }), 250);
    return box;
  };

  /* ---------------- Schnee ---------------- */
  AU.snow = function () {
    const c = document.getElementById('snow');
    if (!c || reduce) return;
    const ctx = c.getContext('2d');
    let w, h, dpr, flakes = [], raf = null, last = 0;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, (w * h) / 9000));
      flakes = [];
      for (let i = 0; i < n; i++) flakes.push(make(true));
    }
    function make(anywhere) {
      const r = 0.8 + Math.random() * 2.4;
      return { x: Math.random() * w, y: anywhere ? Math.random() * h : -10, r, vy: 14 + r * 9 + Math.random() * 10, ph: Math.random() * 6.28, sw: 8 + Math.random() * 14, a: 0.25 + Math.random() * 0.55 };
    }
    function frame(ts) {
      const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
      last = ts;
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.vy * dt;
        f.ph += dt * 0.9;
        const x = f.x + Math.sin(f.ph) * f.sw;
        if (f.y > h + 10) Object.assign(f, make(false), { x: Math.random() * w });
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,' + f.a + ')';
        ctx.arc(x, f.y, f.r, 0, 6.2832);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    size();
    start();
    window.addEventListener('resize', size);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  };

  /* ---------------- Konfetti & Glitzer ---------------- */
  const fxCanvas = () => document.getElementById('fx');
  const FX = (AU.fx = {});
  let parts = [], fraf = null, fctx, fw, fh, fdpr, flast = 0, finaleTimer = null;
  const COLORS = ['#d9b46a', '#f0d894', '#f7efdd', '#d99a9a', '#f3d4d0', '#2a6350', '#fff1c4'];

  function fsize() {
    const c = fxCanvas();
    fdpr = Math.min(window.devicePixelRatio || 1, 2);
    fw = window.innerWidth; fh = window.innerHeight;
    c.width = fw * fdpr; c.height = fh * fdpr;
    fctx = c.getContext('2d');
    fctx.setTransform(fdpr, 0, 0, fdpr, 0, 0);
  }
  function starPath(ctx, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
  }
  function ftick(ts) {
    const dt = Math.min(0.05, (ts - flast) / 1000 || 0.016);
    flast = ts;
    fctx.clearRect(0, 0, fw, fh);
    parts = parts.filter((p) => p.life > 0 && p.y < fh + 30);
    for (const p of parts) {
      p.vy += p.g * dt;
      p.vx *= 1 - 0.6 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= dt;
      p.tilt += dt * 6;
      fctx.save();
      fctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5));
      fctx.translate(p.x, p.y);
      fctx.rotate(p.rot);
      fctx.fillStyle = p.color;
      if (p.shape === 'star') { starPath(fctx, p.size); fctx.shadowColor = p.color; fctx.shadowBlur = 8; fctx.fill(); }
      else if (p.shape === 'dot') { fctx.beginPath(); fctx.arc(0, 0, p.size * 0.5, 0, 6.2832); fctx.fill(); }
      else { fctx.scale(1, Math.cos(p.tilt)); fctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
      fctx.restore();
    }
    if (parts.length) fraf = requestAnimationFrame(ftick);
    else { fraf = null; fctx.clearRect(0, 0, fw, fh); }
  }
  function ensure() {
    if (!fctx || fw !== window.innerWidth || fh !== window.innerHeight) fsize();
    if (!fraf) { flast = performance.now(); fraf = requestAnimationFrame(ftick); }
  }
  FX.confetti = function (o) {
    if (reduce) return;
    o = o || {};
    ensure();
    const n = o.count || 90, x = (o.x != null ? o.x : 0.5) * fw, y = (o.y != null ? o.y : 0.4) * fh;
    for (let i = 0; i < n; i++) {
      const ang = o.rain ? Math.PI / 2 + (Math.random() - 0.5) * 0.9 : Math.random() * Math.PI * 2;
      const sp = o.rain ? 60 + Math.random() * 160 : 140 + Math.random() * 380;
      const r = Math.random();
      parts.push({
        x: o.rain ? Math.random() * fw : x, y: o.rain ? -10 : y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - (o.rain ? 0 : 120),
        g: o.rain ? 120 : 420, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 9, tilt: Math.random() * 6,
        size: r < 0.22 ? 7 + Math.random() * 6 : 6 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: r < 0.22 ? 'star' : r < 0.4 ? 'dot' : 'rect',
        life: (o.rain ? 4 : 2.2) + Math.random() * 1.8
      });
    }
  };
  // Großes Finale für Türchen 24
  FX.finale = function () {
    if (reduce) return;
    FX.stopFinale();
    let k = 0;
    FX.confetti({ count: 140, x: 0.5, y: 0.3 });
    finaleTimer = setInterval(() => {
      k++;
      FX.confetti({ count: 46, x: 0.12 + Math.random() * 0.76, y: 0.18 + Math.random() * 0.3 });
      if (k % 2 === 0) FX.confetti({ count: 40, rain: true });
      if (k >= 9) FX.stopFinale();
    }, 700);
  };
  FX.stopFinale = function () { if (finaleTimer) { clearInterval(finaleTimer); finaleTimer = null; } };
  window.addEventListener('resize', () => { if (fctx) fsize(); });

  /* ---------------- Lichterkette ---------------- */
  AU.lights = function (svg) {
    if (!svg) return;
    const w = Math.min(window.innerWidth, 560), H = 62, segs = Math.max(3, Math.round(w / 98));
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + H);
    const cols = ['#f0d894', '#f7efdd', '#f3d4d0', '#d9b46a'];
    const sw = w / segs;
    let d = 'M0,4', bulbs = '';
    for (let i = 0; i < segs; i++) {
      const x0 = i * sw, x1 = (i + 1) * sw, cx = (x0 + x1) / 2;
      d += ' Q' + cx + ',32 ' + x1 + ',4';
      [0.22, 0.5, 0.78].forEach((t, k) => {
        const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
        const by = (1 - t) * (1 - t) * 4 + 2 * (1 - t) * t * 32 + t * t * 4;
        const col = cols[(i * 3 + k) % cols.length];
        const delay = ((i * 3 + k) * 0.37) % 3;
        bulbs += '<g class="bulb" style="animation-delay:-' + delay.toFixed(2) + 's"><rect x="' + (bx - 1.5) + '" y="' + (by + 1) + '" width="3" height="4" rx="1" fill="#a8803a"/><circle cx="' + bx + '" cy="' + (by + 9) + '" r="5" fill="' + col + '" style="filter:drop-shadow(0 0 5px ' + col + ')"/></g>';
      });
    }
    svg.innerHTML = '<path class="wire" d="' + d + '"/>' + bulbs;
  };
})();
