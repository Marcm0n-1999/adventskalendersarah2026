/* Adventskalender – Hauptlogik */
(function () {
  'use strict';
  const C = window.ADVENT_CONFIG, DOORS = window.ADVENT_DOORS, G = window.ADVENT_GAMES;
  const { el, esc, paras, photo, reward, fx } = AU;
  const $ = (s, r) => (r || document).querySelector(s);

  const OPKEY = 'advent' + C.year + '_opened';
  const TESTKEY = 'advent' + C.year + '_test';
  const ICONS = ['star', 'heart', 'tree', 'flake', 'bell'];

  /* ----- sicherer Speicher (Safari Privatmodus etc.) ----- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const getOpened = () => { try { return JSON.parse(store.get(OPKEY) || '[]'); } catch (e) { return []; } };
  const isTest = () => store.get(TESTKEY) === '1';

  /* ----- Datum (Uhr des Geräts) ----- */
  const doorDate = (n) => new Date(C.year, C.month - 1, n, 0, 0, 0, 0);
  const realUnlocked = (n) => Date.now() >= doorDate(n).getTime();
  const unlocked = (n) => isTest() || realUnlocked(n);
  function todayDoor() {
    const d = new Date();
    if (d.getFullYear() === C.year && d.getMonth() === C.month - 1 && d.getDate() >= 1 && d.getDate() <= C.days) return d.getDate();
    return null;
  }

  /* ----- Kopfbereich ----- */
  function renderHero() {
    document.title = C.title;
    $('#eyebrow').textContent = C.eyebrow;
    $('#title').textContent = C.title;
    $('#greeting').innerHTML = esc(C.greeting).replace(/\n/g, '<br>');
    $('#footText').textContent = C.footer;
  }
  function renderStatus() {
    const now = new Date(), first = doorDate(1), openedCount = getOpened().length;
    let s = '';
    if (now < first) {
      const days = Math.ceil((first - now) / 864e5);
      s = days <= 1 ? 'Morgen geht es los' : 'Noch ' + days + ' Tage bis zum ersten Türchen';
    } else if (todayDoor()) {
      const t = todayDoor();
      s = getOpened().includes(t) ? (t === C.days ? 'Frohe Weihnachten' : 'Für heute geschafft – bis morgen') : 'Heute wartet Türchen ' + t + ' auf dich';
    } else {
      s = 'Alle Türchen sind jetzt offen';
    }
    if (isTest()) s = 'Testmodus aktiv';
    $('#status').textContent = s;
    $('#testBanner').hidden = !isTest();
  }

  /* ----- Raster ----- */
  function renderGrid() {
    const grid = $('#grid');
    grid.innerHTML = '';
    const opened = getOpened(), today = todayDoor();
    C.layout.forEach((n, i) => {
      const locked = !unlocked(n);
      const isOpen = !locked && opened.includes(n);
      const gold = n === C.days;
      const b = el('button', 'tile c' + ((i + Math.floor(i / 4)) % 3) + (locked ? ' locked' : '') + (isOpen ? ' open' : '') + (n === today && !isTest() ? ' today' : '') + (gold ? ' gold' : ''));
      b.type = 'button';
      b.dataset.n = n;
      b.setAttribute('aria-label', 'Türchen ' + n + (locked ? ' (noch verschlossen)' : isOpen ? ' (bereits geöffnet)' : ''));
      const icon = locked ? 'lock' : gold ? 'star' : ICONS[n % ICONS.length];
      b.innerHTML =
        '<span class="inside"><svg viewBox="0 0 24 24"><use href="#i-' + (gold ? 'star' : ICONS[n % ICONS.length]) + '"/></svg></span>' +
        '<span class="door"><span class="num">' + n + '</span><svg class="orn" viewBox="0 0 24 24"><use href="#i-' + icon + '"/></svg><i class="knob"></i></span>';
      grid.append(b);
    });
  }
  const gridKey = () => (isTest() ? 't' : '') + C.layout.filter(realUnlocked).length + '|' + getOpened().join(',');

  /* ----- Toast ----- */
  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }
  const WAIT = ['Noch ein kleines bisschen Geduld.', 'Nicht schummeln.', 'Dieses Türchen schläft noch.', 'Vorfreude ist die schönste Freude.'];
  const lockedMsg = (n) => WAIT[n % WAIT.length] + ' Türchen ' + n + ' öffnet sich am ' + n + '. Dezember.';

  /* ----- Tippen auf Türchen ----- */
  let busy = false;
  $('#grid').addEventListener('click', (e) => {
    const b = e.target.closest('.tile');
    if (!b || busy) return;
    const n = +b.dataset.n;
    if (!unlocked(n)) {
      b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      toast(lockedMsg(n));
      return;
    }
    busy = true;
    b.classList.add('open');
    setTimeout(() => openDoor(n), AU.reduceMotion ? 0 : 620);
  });

  /* ----- YouTube ----- */
  function ytId(v) {
    if (!v) return '';
    v = String(v).trim();
    const m = v.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(v) ? v : '';
  }
  function videoBlock(door) {
    const wrap = el('div', 'video');
    const id = ytId(door.youtube);
    if (!id) { wrap.innerHTML = '<div class="missing">Hier erscheint dein Video.<br>(YouTube-Link in content.js eintragen)</div>'; return wrap; }
    const start = door.start ? '&start=' + parseInt(door.start, 10) : '';
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?playsinline=1&rel=0&modestbranding=1' + start;
    f.title = door.title || 'Video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.loading = 'lazy';
    wrap.append(f);
    return wrap;
  }

  /* ----- Türchen-Ansicht ----- */
  let cleanup = null, current = null;
  function openDoor(n) {
    const door = DOORS[n] || { title: 'Bald', text: 'Dieses Türchen wird noch befüllt.' };
    current = n;
    const sheet = $('#sheet'), body = $('#sheetBody');
    const isFinale = !!door.finale || n === C.days;
    sheet.classList.toggle('finale', isFinale);
    $('#sheetEyebrow').textContent = 'Türchen ' + n + ' · ' + n + '. Dezember';
    $('#sheetTitle').textContent = door.title || '';
    body.innerHTML = '';
    body.scrollTop = 0;

    if (door.text) body.insertAdjacentHTML('beforeend', paras(door.text));
    const isGame = !!(door.type && G[door.type]);
    const imgs = door.images || (door.image && !isGame ? [{ src: door.image, caption: door.caption }] : []);
    imgs.forEach((im) => body.append(photo(typeof im === 'string' ? im : im.src, typeof im === 'string' ? '' : im.caption)));
    if (door.youtube !== undefined) body.append(videoBlock(door));

    if (isGame) {
      const box = el('div', 'game-box');
      body.append(box);
      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        if (door.reward || door.type !== 'scratch') reward(body, door.reward);
        fx.confetti({ count: 80, x: 0.5, y: 0.45 });
      };
      cleanup = G[door.type](door, box, done) || null;
    }
    if (door.signature) body.insertAdjacentHTML('beforeend', '<p class="sign">' + esc(door.signature) + '</p>');

    // einblenden
    $('#modal').classList.add('show');
    $('#modal').setAttribute('aria-hidden', 'false');
    document.body.classList.add('noscroll');
    if (isFinale) setTimeout(() => fx.finale(), 450);

    // Merken, dass geöffnet wurde (nicht im Testmodus und nicht vor dem echten Datum)
    if (!isTest() && realUnlocked(n)) {
      const o = getOpened();
      if (!o.includes(n)) { o.push(n); store.set(OPKEY, JSON.stringify(o)); }
    }
  }
  function closeDoor() {
    $('#modal').classList.remove('show');
    $('#modal').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('noscroll');
    fx.stopFinale();
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    setTimeout(() => { $('#sheetBody').innerHTML = ''; }, 380); // stoppt Videos
    const n = current; current = null;
    if (n) {
      renderGrid(); lastKey = gridKey(); renderStatus();
      // das gerade geöffnete Türchen bleibt sichtbar geöffnet (auch im Testmodus)
      const t = $('.tile[data-n="' + n + '"]');
      if (t && isTest()) t.classList.add('open');
    }
    busy = false;
  }
  $('#closeBtn').addEventListener('click', closeDoor);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if ($('#pwModal').classList.contains('show')) closePw(); else if (current) closeDoor(); } });

  /* ----- Testmodus (geheim: 5x auf den Stern tippen) ----- */
  let taps = 0, tapT;
  $('#secretStar').addEventListener('click', () => {
    taps++;
    clearTimeout(tapT);
    tapT = setTimeout(() => (taps = 0), 2500);
    if (taps >= 5) { taps = 0; openPw(); }
  });
  function openPw() {
    if (isTest()) { toast('Testmodus ist bereits aktiv.'); return; }
    $('#pwErr').textContent = '';
    $('#pwInput').value = '';
    $('#pwModal').classList.add('show');
    $('#pwModal').setAttribute('aria-hidden', 'false');
    setTimeout(() => $('#pwInput').focus(), 200);
  }
  function closePw() {
    $('#pwModal').classList.remove('show');
    $('#pwModal').setAttribute('aria-hidden', 'true');
    $('#pwInput').blur();
  }
  $('#pwCancel').addEventListener('click', closePw);
  $('#pwForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (AU.hash($('#pwInput').value) === C.testPasswordHash) {
      store.set(TESTKEY, '1');
      closePw();
      renderGrid(); lastKey = gridKey(); renderStatus();
      toast('Testmodus aktiv – alle Türchen sind offen.');
    } else {
      const card = $('.pw-card');
      $('#pwErr').textContent = 'Das stimmt leider nicht.';
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    }
  });
  $('#exitTest').addEventListener('click', () => {
    store.del(TESTKEY);
    renderGrid(); lastKey = gridKey(); renderStatus();
    toast('Testmodus beendet.');
  });

  /* ----- Start & Aktualisierung ----- */
  let lastKey = '';
  function refresh() { const k = gridKey(); if (k !== lastKey && !current) { lastKey = k; renderGrid(); } renderStatus(); }

  renderHero();
  renderGrid();
  lastKey = gridKey();
  renderStatus();
  AU.lights($('#lights'));
  AU.snow();
  window.addEventListener('resize', () => AU.lights($('#lights')));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  setInterval(refresh, 30000);
})();
