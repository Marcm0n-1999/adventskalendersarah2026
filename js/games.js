/* Mini-Games: memory, quiz, puzzle, scratch (Rubbellos), catch (Schneefang)
   Jedes Spiel: function (door, box, done) – done() zeigt die Belohnung.
   Rückgabe optional: eine Aufräum-Funktion. */
(function () {
  'use strict';
  const { el, esc, shuffle, paras } = AU;
  const G = (window.ADVENT_GAMES = {});
  const STAR = '<svg viewBox="0 0 24 24"><use href="#i-star"/></svg>';

  /* ---------------- Memory ---------------- */
  G.memory = function (door, box, done) {
    const pairs = (door.pairs || []).slice(0, 8);
    if (pairs.length < 2) { box.append(el('p', 'hint', 'Für das Memory fehlen noch Bilder (mindestens 2).')); return; }
    const info = el('div', 'game-info', '<span>Züge: <b id="mm">0</b></span><span>Paare: <b id="mf">0</b> / ' + pairs.length + '</span>');
    const grid = el('div', 'mem-grid');
    const deck = shuffle(pairs.concat(pairs).map((src, i) => ({ src, id: i % pairs.length })));
    let first = null, busy = false, moves = 0, found = 0;
    deck.forEach((card) => {
      const b = el('button', 'mem-card');
      b.type = 'button';
      b.setAttribute('aria-label', 'Karte umdrehen');
      b.innerHTML = '<span class="mem-in"><span class="mem-face mem-back">' + STAR + '</span><span class="mem-face mem-front"><img alt="" loading="lazy" src="' + esc(card.src) + '"></span></span>';
      b.addEventListener('click', () => {
        if (busy || b.classList.contains('flip') || b.classList.contains('done')) return;
        b.classList.add('flip');
        if (!first) { first = { b, card }; return; }
        moves++;
        info.querySelector('#mm').textContent = moves;
        const a = first; first = null;
        if (a.card.id === card.id) {
          a.b.classList.add('done'); b.classList.add('done');
          found++;
          info.querySelector('#mf').textContent = found;
          if (found === pairs.length) setTimeout(done, 700);
        } else {
          busy = true;
          setTimeout(() => { a.b.classList.remove('flip'); b.classList.remove('flip'); busy = false; }, 850);
        }
      });
      grid.append(b);
    });
    box.append(info, grid);
  };

  /* ---------------- Quiz ---------------- */
  G.quiz = function (door, box, done) {
    const qs = door.questions || [];
    if (!qs.length) { box.append(el('p', 'hint', 'Für das Quiz fehlen noch Fragen.')); return; }
    const wrap = el('div', 'quiz');
    box.append(wrap);
    let i = 0, score = 0, graded = 0;

    function dots() {
      return '<div class="quiz-dots">' + qs.map((_, k) => '<i class="' + (k < i ? 'on' : k === i ? 'cur' : '') + '"></i>').join('') + '</div>';
    }
    function show() {
      wrap.innerHTML = '';
      if (i >= qs.length) return finish();
      const q = qs[i];
      wrap.insertAdjacentHTML('beforeend', dots());
      wrap.append(el('p', 'quiz-q', esc(q.q)));
      const opts = el('div', 'quiz-opts');
      const hasAns = Number.isInteger(q.answer);
      q.options.forEach((o, k) => {
        const b = el('button', 'quiz-opt', esc(o));
        b.type = 'button';
        b.addEventListener('click', () => {
          opts.classList.add('locked');
          if (hasAns) {
            graded++;
            if (k === q.answer) { score++; b.classList.add('ok'); }
            else { b.classList.add('bad'); opts.children[q.answer].classList.add('ok'); }
          } else b.classList.add('chosen');
          if (q.explain) wrap.append(el('div', 'quiz-note', esc(q.explain)));
          const nx = el('div', 'quiz-next');
          const btn = el('button', 'btn', i + 1 < qs.length ? 'Weiter' : 'Fertig');
          btn.type = 'button';
          btn.addEventListener('click', () => { i++; show(); });
          nx.append(btn);
          wrap.append(nx);
          setTimeout(() => nx.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
        });
        opts.append(b);
      });
      wrap.append(opts);
    }
    function finish() {
      wrap.innerHTML = dots();
      if (graded) wrap.append(el('div', 'quiz-score', score + ' von ' + graded + ' richtig'));
      done();
    }
    show();
  };

  /* ---------------- Schiebepuzzle ---------------- */
  G.puzzle = function (door, box, done) {
    const n = Math.max(3, Math.min(4, door.size || 3));
    const src = door.image;
    if (!src) { box.append(el('p', 'hint', 'Für das Puzzle fehlt noch ein Bild.')); return; }
    const board = el('div', 'pz-board');
    board.style.setProperty('--n', n);
    const total = n * n;
    const tiles = [];
    for (let id = 0; id < total; id++) {
      const t = el('div', 'pz-tile' + (id === total - 1 ? ' pz-last' : ''));
      const cx = id % n, cy = Math.floor(id / n);
      t.style.backgroundImage = 'url("' + src.replace(/"/g, '%22') + '")';
      t.style.backgroundPosition = (cx * 100) / (n - 1) + '% ' + (cy * 100) / (n - 1) + '%';
      t.dataset.id = id;
      tiles.push(t);
      board.append(t);
    }
    const prev = el('div', 'pz-prev');
    prev.style.backgroundImage = 'url("' + src.replace(/"/g, '%22') + '")';
    board.append(prev);

    let order, moves = 0, solved = false;
    const info = el('div', 'game-info', '<span>Züge: <b id="pm">0</b></span><span>Tippe ein Teil neben der Lücke</span>');

    function place() {
      order.forEach((id, pos) => {
        const r = Math.floor(pos / n), c = pos % n;
        tiles[id].style.transform = 'translate(' + c * 100 + '%,' + r * 100 + '%)';
      });
    }
    const adj = (a, b) => Math.abs(Math.floor(a / n) - Math.floor(b / n)) + Math.abs((a % n) - (b % n)) === 1;
    function isSolved() { return order.every((id, pos) => id === pos); }
    function shuffleBoard() {
      order = [...Array(total).keys()];
      let empty = total - 1, prevE = -1;
      for (let k = 0; k < 140 || isSolved(); k++) {
        const nb = [];
        for (let p = 0; p < total; p++) if (adj(p, empty) && p !== prevE) nb.push(p);
        const pick = nb[Math.floor(Math.random() * nb.length)];
        [order[empty], order[pick]] = [order[pick], order[empty]];
        prevE = empty; empty = pick;
      }
      moves = 0; solved = false;
      board.classList.remove('solved');
      info.querySelector('#pm').textContent = 0;
      place();
    }
    board.addEventListener('click', (e) => {
      if (solved) return;
      const t = e.target.closest('.pz-tile');
      if (!t || t.classList.contains('pz-last')) return;
      const pos = order.indexOf(+t.dataset.id), empty = order.indexOf(total - 1);
      if (!adj(pos, empty)) return;
      [order[pos], order[empty]] = [order[empty], order[pos]];
      moves++;
      info.querySelector('#pm').textContent = moves;
      place();
      if (isSolved()) {
        solved = true;
        board.classList.add('solved');
        setTimeout(done, 700);
      }
    });
    const peekBtn = el('button', 'btn ghost', 'Vorschau');
    peekBtn.type = 'button';
    const show = () => board.classList.add('peek'), hide = () => board.classList.remove('peek');
    peekBtn.addEventListener('pointerdown', show);
    peekBtn.addEventListener('pointerup', hide);
    peekBtn.addEventListener('pointerleave', hide);
    peekBtn.addEventListener('pointercancel', hide);
    const mixBtn = el('button', 'btn ghost', 'Neu mischen');
    mixBtn.type = 'button';
    mixBtn.addEventListener('click', shuffleBoard);
    const act = el('div', 'pz-actions');
    act.append(peekBtn, mixBtn);
    box.append(info, board, act);
    shuffleBoard();
  };

  /* ---------------- Rubbellos ---------------- */
  G.scratch = function (door, box, done) {
    const r = door.reveal || door.reward || {};
    const wrap = el('div', 'scr');
    const under = el('div', 'scr-under');
    under.innerHTML = (r.title ? '<h3>' + esc(r.title) + '</h3>' : '') + (r.text ? paras(r.text) : '');
    if (r.image) { const im = new Image(); im.src = r.image; im.alt = ''; under.append(im); }
    const cv = el('canvas');
    wrap.append(under, cv);
    box.append(wrap, el('p', 'hint', 'Rubble mit dem Finger über die goldene Fläche'));

    let ctx, W, H, last = null, drawn = 0, finished = false, lastCheck = 0;
    function init() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth; H = wrap.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#f0d894'); g.addColorStop(0.35, '#c99a4a'); g.addColorStop(0.6, '#f3dfa0'); g.addColorStop(1, '#b88b3f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 70; i++) {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.1 + Math.random() * 0.3) + ')';
        ctx.beginPath(); ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2.2, 0, 6.2832); ctx.fill();
      }
      ctx.fillStyle = 'rgba(90,60,10,.75)';
      ctx.font = 'italic 600 30px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Rubbel mich', W / 2, H / 2 - 4);
      ctx.font = '600 13px Nunito, sans-serif';
      ctx.fillText('✦  ✦  ✦', W / 2, H / 2 + 26);
    }
    function pt(e) { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; }
    function line(a, b) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 40;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    function check() {
      if (finished) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, tot = 0;
      for (let i = 3; i < d.length; i += 4 * 24) { tot++; if (d[i] < 20) clear++; }
      if (clear / tot > 0.5) {
        finished = true;
        cv.classList.add('gone');
        setTimeout(done, 600);
      }
    }
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); last = pt(e); line(last, last); e.preventDefault(); });
    cv.addEventListener('pointermove', (e) => {
      if (!last) return;
      const p = pt(e); line(last, p); last = p;
      const now = performance.now();
      if (now - lastCheck > 260) { lastCheck = now; check(); }
      e.preventDefault();
    });
    const end = () => { last = null; if (ctx) check(); };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    requestAnimationFrame(() => requestAnimationFrame(init));
  };

  /* ---------------- Schneefang ---------------- */
  G.catch = function (door, box, done) {
    const goal = door.goal || 12, secs = door.seconds || 30;
    const wrap = el('div', 'catch');
    const info = el('div', 'game-info', '<span>Gefangen: <b id="cc">0</b> / ' + goal + '</span><span>Zeit: <b id="ct">' + secs + '</b></span>');
    const cv = el('canvas');
    const over = el('div', 'catch-over');
    wrap.append(cv, over);
    box.append(info, wrap, el('p', 'hint', 'Ziehe den Korb mit dem Finger nach links und rechts'));

    let ctx, W, H, items, caught, timeLeft, px, tx, running = false, raf = null, lastTs = 0, spawn = 0, t = 0, bgStars = [];
    const BW = 64, BH = 34;

    function setup() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth || 340;
      H = Math.round(Math.min(430, Math.max(300, window.innerHeight * 0.46)));
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.height = H + 'px';
      ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bgStars = Array.from({ length: 26 }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.8, r: Math.random() * 1.4 + 0.3, a: Math.random() * 0.6 + 0.2 }));
      px = tx = W / 2;
      drawFrame();
    }
    function showStart(titleTxt, text, label) {
      over.innerHTML = '<b>' + titleTxt + '</b><span>' + text + '</span>';
      const b = el('button', 'btn', label);
      b.type = 'button';
      b.addEventListener('click', start);
      over.append(b);
      over.style.display = 'flex';
    }
    function start() {
      over.style.display = 'none';
      items = []; caught = 0; timeLeft = secs; spawn = 0.3; t = 0; running = true;
      box.querySelector('#cc').textContent = 0;
      box.querySelector('#ct').textContent = secs;
      lastTs = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function addItem() {
      const heart = Math.random() < 0.28;
      items.push({ x: 24 + Math.random() * (W - 48), y: -20, vy: (110 + Math.random() * 50 + t * 3.2) * (H / 380), r: heart ? 11 : 12, heart, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 3 });
    }
    function loop(ts) {
      if (!running) return;
      const dt = Math.min(0.04, (ts - lastTs) / 1000);
      lastTs = ts; t += dt; timeLeft -= dt;
      px += (tx - px) * Math.min(1, dt * 18);
      spawn -= dt;
      if (spawn <= 0) { addItem(); spawn = Math.max(0.38, 0.85 - t * 0.012); }
      const by = H - 18 - BH;
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.vy * dt; it.rot += it.vr * dt;
        if (it.y + it.r > by && it.y - it.r < by + BH * 0.7 && Math.abs(it.x - px) < BW / 2 + 2) {
          items.splice(i, 1); caught++;
          box.querySelector('#cc').textContent = caught;
          if (caught >= goal) return win();
        } else if (it.y > H + 30) items.splice(i, 1);
      }
      box.querySelector('#ct').textContent = Math.max(0, Math.ceil(timeLeft));
      drawFrame();
      if (timeLeft <= 0) return lose();
      raf = requestAnimationFrame(loop);
    }
    function star(x, y, r, rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.46 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fillStyle = '#f0d894'; ctx.shadowColor = '#f0d894'; ctx.shadowBlur = 12; ctx.fill(); ctx.restore();
    }
    function heart(x, y, r) {
      ctx.save(); ctx.translate(x, y); ctx.beginPath();
      ctx.moveTo(0, r * 0.9);
      ctx.bezierCurveTo(-r * 1.6, -r * 0.2, -r * 0.6, -r * 1.3, 0, -r * 0.4);
      ctx.bezierCurveTo(r * 0.6, -r * 1.3, r * 1.6, -r * 0.2, 0, r * 0.9);
      ctx.fillStyle = '#e8a5a5'; ctx.shadowColor = '#e8a5a5'; ctx.shadowBlur = 10; ctx.fill(); ctx.restore();
    }
    function drawFrame() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0b2a21'); g.addColorStop(1, '#1d5a45');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      bgStars.forEach((s) => { ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill(); });
      // Schneeboden
      ctx.fillStyle = 'rgba(247,239,221,.9)';
      ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H - 10);
      for (let x = 0; x <= W; x += 20) ctx.quadraticCurveTo(x + 10, H - 18, x + 20, H - 10);
      ctx.lineTo(W, H); ctx.fill();
      (items || []).forEach((it) => (it.heart ? heart(it.x, it.y, it.r) : star(it.x, it.y, it.r, it.rot)));
      // Korb
      const bx = px - BW / 2, by = H - 18 - BH;
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#d9b46a';
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + BW, by); ctx.lineTo(bx + BW - 8, by + BH); ctx.lineTo(bx + 8, by + BH); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(122,90,28,.55)'; ctx.lineWidth = 1.5;
      for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(bx + (BW / 4) * k, by + 3); ctx.lineTo(bx + 8 + ((BW - 16) / 4) * k, by + BH - 2); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(bx + 3, by + BH * 0.5); ctx.lineTo(bx + BW - 3, by + BH * 0.5); ctx.stroke();
      ctx.fillStyle = '#f0d894'; ctx.fillRect(bx - 3, by - 4, BW + 6, 6);
      ctx.restore();
    }
    function win() {
      running = false; cancelAnimationFrame(raf);
      drawFrame();
      showStart('Geschafft!', 'Alle ' + goal + ' gefangen.', 'Nochmal spielen');
      setTimeout(done, 400);
    }
    function lose() {
      running = false; cancelAnimationFrame(raf);
      showStart('Fast!', caught + ' von ' + goal + ' gefangen. Versuch es nochmal.', 'Nochmal versuchen');
    }
    function move(e) { const b = cv.getBoundingClientRect(); tx = Math.max(BW / 2, Math.min(W - BW / 2, e.clientX - b.left)); }
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); move(e); e.preventDefault(); });
    cv.addEventListener('pointermove', (e) => { move(e); e.preventDefault(); });

    requestAnimationFrame(() => {
      setup();
      showStart('Schneefang', 'Fange ' + goal + ' Sterne und Herzen in ' + secs + ' Sekunden.', 'Los geht’s');
    });
    return function cleanup() { running = false; if (raf) cancelAnimationFrame(raf); };
  };
})();
