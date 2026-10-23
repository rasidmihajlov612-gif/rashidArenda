// Рабочий стол «Мака»: строка меню, иконки на столе, окна, док. Дизайн — из портфолио, наполнение — content.js.
window.Mac = (() => {
  const { S, C, esc, nb, stars, initials, TINTS, ext, avatarStyle, contactButtons, notes, reviewByName } = Core;

  let vp, stage, winLayer, dock, menubar, appNameEl, pop;
  let scale = 1, z = 10, cascade = 0;
  const wins = new Map(); // key -> {key, app, el, minimized, title, onClose}

  const APPS = {
    finder:   { name: 'Finder',    icon: 'finder',   open: () => openFinder('objects') },
    notes:    { name: 'Заметки',   icon: 'notes',    open: () => openNotes('about') },
    messages: { name: 'Отзывы',    icon: 'messages', open: () => openChat(-1) },
    viewer:   { name: 'Фото',      icon: 'photos',   open: () => openGallery('me', 0) },
    contacts: { name: 'Контакты',  icon: 'contacts', open: () => openAbout() },
    tetris:   { name: 'Тетрис',    icon: 'tetris',   open: () => openGame('tetris') },
    snake:    { name: 'Змейка',    icon: 'snake',    open: () => openGame('snake') },
    g2048:    { name: '2048',      icon: 'g2048',    open: () => openGame('g2048') },
    iphone:   { name: 'iPhone',    icon: 'iphone',   open: () => App.go('ios') },
  };
  const DOCK = ['finder', 'notes', 'messages', 'viewer', 'contacts', '|', 'tetris', 'snake', 'g2048', '|', 'iphone'];

  const FOLDERS = [
    { id: 'objects', title: 'Объекты', sec: 'Аренда' },
    { id: 'cases', title: 'Кейсы', sec: 'Аренда' },
    { id: 'reviews', title: 'Отзывы', sec: 'Аренда' },
    { id: 'games', title: 'Игры', sec: 'Ещё' },
    { id: 'me', title: 'Фото', sec: 'Ещё' },
  ];
  const folderTitle = id => (FOLDERS.find(f => f.id === id) || {}).title || (id === 'trash' ? 'Корзина' : '');

  // Корзина: то, что собственнику больше не нужно
  const TRASH = [
    { name: 'Комиссия для собственника.pdf', meta: '0 ₽ — платит наниматель', kind: 'doc' },
    { name: 'Простой квартиры.txt', meta: 'был 5 месяцев, стало 2 недели', kind: 'doc' },
    { name: 'Звонки от риелторов.m4a', meta: 'больше не беспокоят', kind: 'doc' },
  ];

  /* ---------------- монтирование ---------------- */
  function mount(el) {
    vp = el;
    vp.innerHTML = `
      <div class="mac-stage">
        <div class="mac-wall"></div>
        <header class="menubar">
          <button class="mb-logo" data-menu="logo" aria-label="Меню">${LOGO}</button>
          <button class="mb-app" data-menu="app"></button>
          ${['Файл', 'Вид', 'Окно', 'Связаться'].map(m => `<button class="mb-item" data-menu="${m}">${m}</button>`).join('')}
          <button class="mb-item mb-switch" data-act="switch">Сменить устройство</button>
          <span class="mb-spacer"></span>
          <span class="mb-status">${SYM.battery}</span>
          <span class="mb-status">${SYM.wifi}</span>
          <button class="mb-status" data-act="spotlight" aria-label="Поиск">${SYM.search}</button>
          <span class="mb-status">${SYM.control}</span>
          <span class="mb-clock"></span>
        </header>
        <div class="desk-icons"></div>
        <div class="win-layer"></div>
        <nav class="dock"><div class="dock-plate"></div><div class="dock-row"></div></nav>
        <div class="menu-pop" hidden></div>
      </div>`;
    stage = vp.querySelector('.mac-stage');
    winLayer = vp.querySelector('.win-layer');
    dock = vp.querySelector('.dock');
    menubar = vp.querySelector('.menubar');
    appNameEl = vp.querySelector('.mb-app');
    pop = vp.querySelector('.menu-pop');

    buildDesktopIcons();
    buildDock();
    bindMenus();
    tickClock(); setInterval(tickClock, 15000);
    fit(); addEventListener('resize', fit);

    stage.addEventListener('pointerdown', e => {
      if (!e.target.closest('.desk-icon')) stage.querySelectorAll('.desk-icon.is-sel').forEach(i => i.classList.remove('is-sel'));
      if (!e.target.closest('.win')) setActive(null);
    });
    addEventListener('keydown', e => {
      if (vp.hidden) return;
      if (e.key === 'Escape') closeMenu();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'w') { e.preventDefault(); const a = activeWin(); if (a) closeWin(a.key); }
    });

    openNotes('about', { x: 70, y: 60, silent: true });
    openFinder('objects');
    setTimeout(toast, 1400);
  }

  function onShow() { fit(); }

  // Мак рисуется в «виртуальном» экране не меньше 1100×680 и ужимается под окно
  function fit() {
    if (!stage || vp.hidden) return;
    const W = innerWidth, H = innerHeight;
    const vw = Math.max(W, 1100), vh = Math.max(H, 680);
    scale = Math.min(W / vw, H / vh);
    stage.style.width = W / scale + 'px';
    stage.style.height = H / scale + 'px';
    stage.style.transform = scale < 1 ? `scale(${scale})` : '';
  }
  const stageW = () => stage.clientWidth;
  const stageH = () => stage.clientHeight;

  function tickClock() {
    const d = new Date();
    const wd = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    const dm = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
    const t = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    vp.querySelector('.mb-clock').textContent = `${wd[0].toUpperCase() + wd.slice(1)} ${dm} ${t}`;
  }

  // Уведомление-приветствие в правом верхнем углу
  function toast() {
    const t = document.createElement('button');
    t.className = 'mac-toast';
    t.innerHTML = `${ICONS.app('messages', 'mini')}<span class="mt-body"><span class="mt-head"><b>${esc(S.name)}</b><em>сейчас</em></span><span>${esc(nb(S.helloMac))}</span></span>`;
    t.addEventListener('click', () => { t.remove(); openChat(-1); });
    stage.appendChild(t);
    setTimeout(() => { t.classList.add('is-gone'); setTimeout(() => t.remove(), 500); }, 12000);
  }

  /* ---------------- иконки на столе ---------------- */
  function buildDesktopIcons() {
    const box = vp.querySelector('.desk-icons');
    const items = [
      ...FOLDERS.map(f => ({ label: f.title, art: ICONS.folder(), open: () => openFinder(f.id) })),
      { label: 'Обо мне.txt', art: ICONS.doc('TXT'), open: () => openNotes('about') },
      { label: 'Контакты.vcf', art: ICONS.doc('VCF', '#0a84ff'), open: openAbout },
    ];
    items.forEach(it => {
      const b = document.createElement('button');
      b.className = 'desk-icon';
      b.innerHTML = `<span class="di-art">${it.art}</span><span class="di-label">${esc(it.label)}</span>`;
      b.addEventListener('click', e => {
        box.querySelectorAll('.is-sel').forEach(i => i.classList.remove('is-sel'));
        b.classList.add('is-sel');
        if (e.pointerType === 'touch') it.open();
      });
      b.addEventListener('dblclick', it.open);
      box.appendChild(b);
    });
  }

  /* ---------------- док ---------------- */
  function buildDock() {
    const row = dock.querySelector('.dock-row');
    const html = [];
    DOCK.forEach(k => {
      if (k === '|') return html.push('<span class="dock-sep"></span>');
      html.push(`<button class="dock-item" data-app="${k}"><span class="dock-tip">${APPS[k].name}</span>${ICONS.app(APPS[k].icon)}<span class="dock-dot"></span></button>`);
    });
    html.push(`<button class="dock-item dock-trash" data-app="trash"><span class="dock-tip">Корзина</span><span class="trash-art">${ICONS.trash(true)}</span><span class="dock-dot"></span></button>`);
    row.innerHTML = html.join('');

    row.querySelectorAll('.dock-item').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.app;
      if (k === 'trash') return openFinder('trash');
      const mine = [...wins.values()].filter(w => w.app === k);
      if (!mine.length) { bounce(b); return APPS[k].open(); }
      const mini = mine.filter(w => w.minimized);
      if (mini.length) mini.forEach(w => restore(w.key));
      else focus(mine[mine.length - 1].key);
    }));

    // увеличение иконок под курсором
    const items = [...row.querySelectorAll('.dock-item')];
    let centers = null;
    row.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      centers = items.map(it => { const r = it.getBoundingClientRect(); return (r.left + r.width / 2) / scale; });
    });
    row.addEventListener('pointermove', e => {
      if (!centers) return;
      const x = e.clientX / scale;
      items.forEach((it, i) => {
        const d = Math.abs(x - centers[i]);
        it.style.setProperty('--mag', (1 + 0.55 * Math.max(0, 1 - d / 150) ** 1.6).toFixed(3));
      });
    });
    row.addEventListener('pointerleave', () => { centers = null; items.forEach(it => it.style.setProperty('--mag', 1)); });
  }

  function bounce(b) {
    b.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-18px)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }

  function refreshDock() {
    dock.querySelectorAll('.dock-item').forEach(b => {
      b.classList.toggle('is-running', [...wins.values()].some(w => w.app === b.dataset.app));
    });
  }

  /* ---------------- меню ---------------- */
  function bindMenus() {
    menubar.addEventListener('click', e => {
      const b = e.target.closest('[data-menu]');
      if (b) { pop.hidden || pop.dataset.for !== b.dataset.menu ? openMenu(b) : closeMenu(); return; }
      if (e.target.closest('[data-act="spotlight"]')) openFinder('objects');
      if (e.target.closest('[data-act="switch"]')) App.go('choose');
    });
    menubar.addEventListener('pointerover', e => {
      const b = e.target.closest('[data-menu]');
      if (b && !pop.hidden && pop.dataset.for !== b.dataset.menu) openMenu(b);
    });
    stage.addEventListener('pointerdown', e => { if (!e.target.closest('.menu-pop, .menubar')) closeMenu(); });
  }

  const openUrl = u => window.open(u, '_blank', 'noopener');

  function menuItems(name) {
    const a = activeWin();
    switch (name) {
      case 'logo': return [
        ['Об этом владельце', openAbout], '-',
        ['Открыть на iPhone', () => App.go('ios')],
        ['Выбрать другое устройство', () => App.go('choose')], '-',
        ['Закрыть все окна', () => [...wins.keys()].forEach(closeWin)],
      ];
      case 'app': return [[`О программе ${appName()}`, openAbout], '-', [`Скрыть ${appName()}`, () => a && minimize(a.key), !a]];
      case 'Файл': return [['Новое окно Finder', () => openFinder('objects', { fresh: true })], ['Обо мне', () => openNotes('about')], '-', ['Закрыть окно', () => a && closeWin(a.key), !a]];
      case 'Вид': return FOLDERS.map(f => [f.title, () => openFinder(f.id)]);
      case 'Окно': {
        const list = [...wins.values()].map(w => [w.title, () => w.minimized ? restore(w.key) : focus(w.key)]);
        return [['Свернуть', () => a && minimize(a.key), !a], ['Изменить масштаб', () => a && zoom(a.key), !a], '-', ...(list.length ? list : [['Нет открытых окон', null, true]])];
      }
      case 'Связаться': return [
        ...(C.tel ? [['Позвонить ' + S.phone, () => { location.href = C.tel; }]] : []),
        ...(C.tg ? [['Написать в Telegram', () => openUrl(C.tg)]] : []),
        ...(C.wa ? [['Написать в WhatsApp', () => openUrl(C.wa)]] : []),
        '-',
        ...(S.mapsUrl ? [['Офис на Яндекс Картах', () => openUrl(S.mapsUrl)]] : []),
        ['Карточка контакта', openAbout],
      ];
    }
    return [];
  }

  function openMenu(btn) {
    const items = menuItems(btn.dataset.menu);
    pop.dataset.for = btn.dataset.menu;
    pop.innerHTML = items.map((it, i) => it === '-' ? '<hr>' :
      `<button data-i="${i}" ${it[2] || !it[1] ? 'disabled' : ''}>${esc(it[0])}</button>`).join('');
    pop.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { closeMenu(); items[+b.dataset.i][1](); }));
    menubar.querySelectorAll('.is-open').forEach(x => x.classList.remove('is-open'));
    btn.classList.add('is-open');
    pop.style.left = btn.offsetLeft + 'px';
    pop.hidden = false;
  }
  function closeMenu() { pop.hidden = true; menubar.querySelectorAll('.is-open').forEach(x => x.classList.remove('is-open')); }

  /* ---------------- окна ---------------- */
  function activeWin() { return [...wins.values()].find(w => w.el.classList.contains('is-active') && !w.minimized); }
  function appName() { const a = activeWin(); return APPS[a ? a.app : 'finder'].name; }

  function setActive(key) {
    wins.forEach(w => w.el.classList.toggle('is-active', w.key === key));
    appNameEl.textContent = appName();
  }

  function focus(key) {
    const w = wins.get(key); if (!w) return;
    w.el.style.zIndex = ++z;
    setActive(key);
  }

  // opts: key, app, title, cls, w, h, html, onMount(el, win), onReuse, onClose
  function openWindow(o) {
    if (wins.has(o.key)) {
      const w = wins.get(o.key);
      if (w.minimized) restore(o.key); else focus(o.key);
      if (o.onReuse) o.onReuse(w.el, w);
      return w;
    }
    const W = Math.min(o.w, stageW() - 40), H = Math.min(o.h, stageH() - 24 - 110);
    let x = o.x ?? Math.round((stageW() - W) / 2 + (cascade % 6) * 26 - 60);
    let y = o.y ?? Math.round(40 + (cascade % 6) * 24);
    if (o.x == null) cascade++;
    x = Math.max(8, Math.min(x, stageW() - W - 8));
    y = Math.max(32, Math.min(y, stageH() - H - 90));

    const el = document.createElement('section');
    el.className = `win win-${o.cls}`;
    el.style.cssText = `left:${x}px;top:${y}px;width:${W}px;height:${H}px;z-index:${++z}`;
    el.innerHTML = `<div class="traffic">
        <button class="tl tl-close" aria-label="Закрыть"><svg viewBox="0 0 12 12"><path d="M3.5 3.5l5 5M8.5 3.5l-5 5"/></svg></button>
        <button class="tl tl-min" aria-label="Свернуть"><svg viewBox="0 0 12 12"><path d="M3 6h6"/></svg></button>
        <button class="tl tl-zoom" aria-label="Развернуть"><svg viewBox="0 0 12 12"><path d="M3.6 8.4V4.2l4.2 4.2zM8.4 3.6v4.2L4.2 3.6z" fill="currentColor" stroke="none"/></svg></button>
      </div>${o.html}`;
    winLayer.appendChild(el);

    const w = { key: o.key, app: o.app, title: o.title, el, minimized: false, onClose: o.onClose };
    wins.set(o.key, w);
    el.querySelector('.tl-close').addEventListener('click', e => { e.stopPropagation(); closeWin(o.key); });
    el.querySelector('.tl-min').addEventListener('click', e => { e.stopPropagation(); minimize(o.key); });
    el.querySelector('.tl-zoom').addEventListener('click', e => { e.stopPropagation(); zoom(o.key); });
    el.addEventListener('pointerdown', () => focus(o.key), true);
    makeDraggable(w);
    if (o.onMount) o.onMount(el, w);

    if (!o.silent) el.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.8,.3,1)' });
    focus(o.key);
    refreshDock();
    return w;
  }

  function makeDraggable(w) {
    const el = w.el;
    el.addEventListener('pointerdown', e => {
      const handle = e.target.closest('[data-drag]');
      if (!handle || e.target.closest('button, input, a, [data-nodrag]') || e.button !== 0) return;
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
      if (el.classList.contains('is-zoomed')) return;
      const move = ev => {
        el.style.left = ox + (ev.clientX - sx) / scale + 'px';
        el.style.top = Math.max(25, oy + (ev.clientY - sy) / scale) + 'px';
      };
      const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); el.classList.remove('is-dragging'); };
      el.classList.add('is-dragging');
      addEventListener('pointermove', move); addEventListener('pointerup', up);
    });
    el.addEventListener('dblclick', e => {
      if (e.target.closest('[data-drag]') && !e.target.closest('button, input, [data-nodrag]')) zoom(w.key);
    });
  }

  function closeWin(key) {
    const w = wins.get(key); if (!w) return;
    wins.delete(key);
    if (w.onClose) w.onClose();
    const a = w.el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 150, easing: 'ease-in' });
    a.onfinish = () => w.el.remove();
    const top = [...wins.values()].filter(x => !x.minimized).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
    setActive(top ? top.key : null);
    refreshDock();
  }

  function dockTarget(app) {
    const node = dock.querySelector(`[data-app="${app}"]`) || dock.querySelector('[data-app="finder"]');
    const b = node.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    return { x: (b.left - s.left) / scale + b.width / scale / 2, y: (b.top - s.top) / scale + b.height / scale / 2 };
  }

  function minimize(key) {
    const w = wins.get(key); if (!w || w.minimized) return;
    const el = w.el, t = dockTarget(w.app);
    const cx = el.offsetLeft + el.offsetWidth / 2, cy = el.offsetTop + el.offsetHeight / 2;
    w.minimized = true;
    const a = el.animate([
      { transform: 'none', opacity: 1 },
      { transform: `translate(${t.x - cx}px, ${t.y - cy}px) scale(.06)`, opacity: .2 },
    ], { duration: 380, easing: 'cubic-bezier(.5,0,.7,.4)' });
    a.onfinish = () => { el.hidden = true; };
    const top = [...wins.values()].filter(x => !x.minimized).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
    setActive(top ? top.key : null);
  }

  function restore(key) {
    const w = wins.get(key); if (!w) return;
    const el = w.el, t = dockTarget(w.app);
    el.hidden = false; w.minimized = false;
    const cx = el.offsetLeft + el.offsetWidth / 2, cy = el.offsetTop + el.offsetHeight / 2;
    el.animate([
      { transform: `translate(${t.x - cx}px, ${t.y - cy}px) scale(.06)`, opacity: .2 },
      { transform: 'none', opacity: 1 },
    ], { duration: 340, easing: 'cubic-bezier(.2,.7,.3,1)' });
    focus(key);
  }

  function zoom(key) {
    const w = wins.get(key); if (!w) return;
    const el = w.el;
    if (el.classList.contains('is-zoomed')) {
      Object.assign(el.style, JSON.parse(el.dataset.prev));
      el.classList.remove('is-zoomed');
    } else {
      el.dataset.prev = JSON.stringify({ left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height });
      Object.assign(el.style, { left: '6px', top: '31px', width: stageW() - 12 + 'px', height: stageH() - 31 - 92 + 'px' });
      el.classList.add('is-zoomed');
    }
  }

  /* ---------------- превью ---------------- */
  const photoThumb = (src, cls = '') => `<span class="thumb thumb-photo ${cls}"><img src="${esc(src)}" alt="" loading="lazy"></span>`;
  const caseThumb = c => `<span class="thumb thumb-case" style="--c:${c.color || '#0a84ff'}"><b>${esc(c.big || '')}</b></span>`;
  const reviewAva = (r, i, cls = '') => `<span class="c-ava ${cls}" style="--tint:${TINTS[i % TINTS.length]}">${esc(initials(r.from || '?'))}</span>`;
  const meAva = (cls = '') => `<span class="c-ava me-ava ${cls}" style="${avatarStyle()}">${S.avatar ? '' : esc(initials(S.name))}</span>`;

  /* ---------------- Finder ---------------- */
  function openFinder(folder, opts = {}) {
    const key = opts.fresh ? 'finder:' + Date.now() : 'finder';
    const secs = [...new Set(FOLDERS.map(f => f.sec))];
    return openWindow({
      key, app: 'finder', title: 'Finder', cls: 'finder', w: 860, h: 520,
      html: `<aside class="side" data-drag>
          <div class="side-head"></div>
          ${secs.map(sec => `<div class="side-sec">${esc(sec)}</div>
            ${FOLDERS.filter(f => f.sec === sec).map(f => `<button class="side-item" data-f="${f.id}">${SYM.folder}${esc(f.title)}</button>`).join('')}`).join('')}
          <div class="side-sec">Места</div>
          <button class="side-item" data-f="about">${SYM.person}Обо мне</button>
          <button class="side-item" data-f="contact">${SYM.phone}Контакты</button>
          <button class="side-item" data-f="trash">${SYM.trash}Корзина</button>
        </aside>
        <div class="f-main">
          <div class="toolbar" data-drag>
            <span class="tb-nav"><button class="tb-btn" data-back>${SYM.chevL}</button><button class="tb-btn" data-fwd disabled>${SYM.chevR}</button></span>
            <span class="tb-title"></span>
            <span class="tb-spacer"></span>
            <span class="tb-seg"><button class="tb-btn is-on">${SYM.grid}</button><button class="tb-btn">${SYM.list}</button></span>
            <span class="tb-search">${SYM.search}<span>Поиск</span></span>
          </div>
          <div class="f-note" hidden></div>
          <div class="f-grid"></div>
          <div class="f-status"></div>
        </div>`,
      onMount: el => {
        el._hist = [];
        el.querySelectorAll('.side-item').forEach(b => b.addEventListener('click', () => {
          if (b.dataset.f === 'about') return openNotes('about');
          if (b.dataset.f === 'contact') return openAbout();
          showFolder(el, b.dataset.f, true);
        }));
        el.querySelector('[data-back]').addEventListener('click', () => { if (el._hist.length > 1) { el._hist.pop(); showFolder(el, el._hist.pop(), true); } });
        el.querySelector('.tb-seg').addEventListener('click', e => {
          const b = e.target.closest('.tb-btn'); if (!b) return;
          el.querySelectorAll('.tb-seg .tb-btn').forEach(x => x.classList.toggle('is-on', x === b));
          el.querySelector('.f-grid').classList.toggle('as-list', b === el.querySelectorAll('.tb-seg .tb-btn')[1]);
        });
        showFolder(el, folder, true);
      },
      onReuse: el => showFolder(el, folder, true),
    });
  }

  function showFolder(el, folder, push) {
    if (push) el._hist.push(folder);
    el.querySelector('[data-back]').disabled = el._hist.length < 2;
    el.querySelectorAll('.side-item').forEach(b => b.classList.toggle('is-on', b.dataset.f === folder));
    const grid = el.querySelector('.f-grid');
    const note = el.querySelector('.f-note');
    let items = [], hint = '';
    if (folder === 'objects') {
      hint = 'Сдаются сейчас. Двойной клик — фото и подробности.';
      items = S.objects.map((o, i) => ({ name: o.title, art: photoThumb(o.photos[0]), meta: `${o.price.replace(' в месяц', '')} · ${o.metro}`, open: () => openObject(i) }));
    } else if (folder === 'cases') {
      items = S.cases.map((c, i) => ({ name: c.title, art: caseThumb(c), meta: c.sub, open: () => openNotes('case' + i) }));
    } else if (folder === 'reviews') {
      hint = 'Отзывы с Яндекс Карт, слово в слово.';
      items = S.reviews.map((r, i) => ({ name: r.from, art: `<span class="f-ava">${reviewAva(r, i)}</span>`, meta: stars(r.stars), open: () => openChat(i) }));
    } else if (folder === 'games') {
      items = ['tetris', 'snake', 'g2048'].map(k => ({ name: APPS[k].name, art: `<span class="f-app">${ICONS.app(APPS[k].icon)}</span>`, meta: 'игра', open: () => openGame(k) }));
    } else if (folder === 'me') {
      items = (S.personal || []).map((src, i) => ({ name: `IMG_${String(i + 1).padStart(4, '0')}.jpg`, art: photoThumb(src, 'is-portrait'), meta: '', open: () => openGallery('me', i) }));
    } else if (folder === 'trash') {
      hint = 'Это собственнику больше не понадобится.';
      items = TRASH.map(t => ({ name: t.name, art: `<span class="f-doc">${ICONS.doc(t.name.split('.').pop().toUpperCase())}</span>`, meta: t.meta, open: () => {} }));
    }
    const title = folderTitle(folder);
    el.querySelector('.tb-title').textContent = title;
    note.hidden = !hint; note.textContent = hint;
    el.querySelector('.f-status').textContent = items.length ? `${items.length} ${plural(items.length, 'объект', 'объекта', 'объектов')}` : 'Пусто';
    grid.innerHTML = '';
    items.forEach(it => {
      const b = document.createElement('button');
      b.className = 'f-item';
      b.innerHTML = `<span class="f-art">${it.art}</span><span class="f-name">${esc(it.name)}</span><span class="f-meta">${esc(it.meta || '')}</span>`;
      b.addEventListener('click', e => {
        grid.querySelectorAll('.is-sel').forEach(x => x.classList.remove('is-sel'));
        b.classList.add('is-sel');
        if (e.pointerType === 'touch') it.open();
      });
      b.addEventListener('dblclick', it.open);
      grid.appendChild(b);
    });
    const fw = [...wins.values()].find(w => w.el === el);
    if (fw) fw.title = title;
  }

  function plural(n, a, b, c) { const m = n % 10, k = n % 100; return m === 1 && k !== 11 ? a : m >= 2 && m <= 4 && (k < 12 || k > 14) ? b : c; }

  /* ---------------- Просмотр: объект с фото ---------------- */
  function openObject(i) {
    const o = S.objects[i];
    return openWindow({
      key: 'obj:' + i, app: 'viewer', title: o.title, cls: 'viewer', w: 1040, h: 640,
      html: `<div class="toolbar v-bar" data-drag>
          <span class="tb-gap"></span><button class="tb-btn">${SYM.sidebar}</button>
          <span class="v-title"><b>${esc(o.title)} · ${esc(o.price)}</b><span class="v-page"></span></span>
          <span class="tb-spacer"></span><a class="tb-btn" href="${esc(o.link)}"${ext(o.link)} title="Открыть на Циане">${SYM.share}</a>
        </div>
        <div class="v-wrap">
          <aside class="v-thumbs">${o.photos.map((p, k) => `<button class="v-th v-img" data-i="${k}"><img src="${esc(p)}" alt="" loading="lazy"><span>${k + 1}</span></button>`).join('')}</aside>
          <div class="v-stage"><img class="v-big" alt="${esc(o.title)}"></div>
          <aside class="v-info">
            <p class="vi-price">${esc(o.price)}</p>
            <p class="vi-title">${esc(o.title)}</p>
            <p class="vi-metro">${esc(o.metro || '')}</p>
            <p class="vi-addr">${esc(o.where || '')}</p>
            <div class="chips">${(o.facts || []).map(f => `<span>${esc(f)}</span>`).join('')}</div>
            <p class="vi-text">${esc(nb(o.text || ''))}</p>
            <a class="cta-btn" href="${esc(o.link)}"${ext(o.link)}>Объявление на Циане</a>
            ${contactButtons('is-col')}
          </aside>
        </div>`,
      onMount: el => galleryNav(el, o.photos, 0),
    });
  }

  /* ---------------- Фото: личные снимки ---------------- */
  function openGallery(set, start) {
    const list = S.personal || [];
    return openWindow({
      key: 'gallery', app: 'viewer', title: 'Фото', cls: 'viewer', w: 900, h: 640,
      html: `<div class="toolbar v-bar" data-drag>
          <span class="tb-gap"></span><button class="tb-btn">${SYM.sidebar}</button>
          <span class="v-title"><b>Это я</b><span class="v-page"></span></span>
          <span class="tb-spacer"></span>
        </div>
        <div class="v-wrap">
          <aside class="v-thumbs">${list.map((p, k) => `<button class="v-th v-img" data-i="${k}"><img src="${esc(p)}" alt="" loading="lazy"><span>${k + 1}</span></button>`).join('')}</aside>
          <div class="v-stage"><img class="v-big" alt="${esc(S.name)}"></div>
        </div>`,
      onMount: el => galleryNav(el, list, start),
      onReuse: el => el._go(start),
    });
  }

  function galleryNav(el, list, start) {
    const go = i => {
      el.querySelectorAll('.v-th').forEach(t => t.classList.toggle('is-on', +t.dataset.i === i));
      el.querySelector('.v-big').src = list[i];
      el.querySelector('.v-page').textContent = `Фото ${i + 1} из ${list.length}`;
      el._i = i;
    };
    el._go = go;
    el.querySelectorAll('.v-th').forEach(t => t.addEventListener('click', () => go(+t.dataset.i)));
    el.querySelector('.v-stage').addEventListener('click', () => go((el._i + 1) % list.length));
    go(start || 0);
  }

  /* ---------------- Сообщения: отзывы ---------------- */
  function openChat(i) {
    return openWindow({
      key: 'messages', app: 'messages', title: 'Отзывы', cls: 'chat', w: 900, h: 600,
      html: `<aside class="c-list" data-drag>
          <div class="side-head"></div>
          <div class="c-search" data-nodrag>${SYM.search}<span>Поиск</span></div>
          <div class="c-rows">
            <button class="c-row" data-i="-1">${meAva()}<span class="c-txt"><b>${esc(S.name)}</b><span>Напишите про квартиру — отвечу сам</span></span></button>
            ${S.reviews.map((r, k) => `<button class="c-row" data-i="${k}">${reviewAva(r, k)}
              <span class="c-txt"><b>${esc(r.from)}</b><span>${esc(r.messages[r.messages.length - 1])}</span></span></button>`).join('')}
          </div>
          ${S.mapsUrl ? `<a class="c-all" href="${esc(S.mapsUrl)}"${ext(S.mapsUrl)}>Все отзывы на Яндекс Картах ›</a>` : ''}
        </aside>
        <div class="c-main">
          <div class="toolbar c-head" data-drag><span class="c-head-ava"></span><span class="c-who"><b></b><span></span></span><span class="tb-spacer"></span><button class="tb-btn">${SYM.search}</button><button class="tb-btn">${SYM.ellipsis}</button></div>
          <div class="c-msgs"></div>
          <div class="c-compose"><button class="tb-btn">${SYM.clip}</button><span class="c-input">Сообщение</span><button class="tb-btn">${SYM.mic}</button></div>
        </div>`,
      onMount: el => {
        el.querySelectorAll('.c-row').forEach(r => r.addEventListener('click', () => chatShow(el, +r.dataset.i)));
        chatShow(el, i);
      },
      onReuse: el => chatShow(el, i),
    });
  }

  function chatShow(el, i) {
    el.querySelectorAll('.c-row').forEach(r => r.classList.toggle('is-on', +r.dataset.i === i));
    const box = el.querySelector('.c-msgs');
    const ava = el.querySelector('.c-head-ava');
    if (i < 0) {
      ava.innerHTML = meAva('sm');
      el.querySelector('.c-who b').textContent = S.name;
      el.querySelector('.c-who span').textContent = 'на связи ' + (S.hours || '');
      box.innerHTML = `<div class="msg msg-bot"><span class="bubble">${esc(nb(S.helloMac))}</span></div>
        <div class="msg msg-bot"><span class="bubble">Расскажите про квартиру: адрес, сколько комнат и когда освобождается. Дальше я сам, вам это ничего не стоит.</span></div>
        <div class="msg msg-bot msg-cta">${contactButtons()}</div>`;
    } else {
      const r = S.reviews[i];
      ava.innerHTML = reviewAva(r, i, 'sm');
      el.querySelector('.c-who b').textContent = r.from;
      el.querySelector('.c-who span').textContent = `${stars(r.stars)} · отзыв, ${r.where || 'Яндекс Карты'}`;
      box.innerHTML = r.messages.map(m => `<div class="msg msg-bot"><span class="bubble">${esc(nb(m))}</span></div>`).join('');
    }
    box.scrollTop = 0;
  }

  /* ---------------- Заметки ---------------- */
  function openNotes(id, extra = {}) {
    return openWindow({
      key: 'notes', app: 'notes', title: 'Заметки', cls: 'notes', w: 760, h: 520, ...extra,
      html: `<aside class="n-list" data-drag>
          <div class="side-head"></div>
          <div class="n-rows">${notes.map(n => `<button class="n-row" data-id="${n.id}"><b>${esc(n.title)}</b><span><em>${esc(n.date)}</em> ${esc(n.paras[0])}</span></button>`).join('')}</div>
        </aside>
        <div class="n-main">
          <div class="toolbar" data-drag><span class="tb-spacer"></span><button class="tb-btn">${SYM.list}</button><button class="tb-btn">${SYM.share}</button><button class="tb-btn">${SYM.search}</button></div>
          <article class="n-body"></article>
        </div>`,
      onMount: el => {
        el.querySelectorAll('.n-row').forEach(r => r.addEventListener('click', () => noteShow(el, r.dataset.id)));
        noteShow(el, id);
      },
      onReuse: el => noteShow(el, id),
    });
  }
  function noteShow(el, id) {
    const n = notes.find(x => x.id === id) || notes[0];
    el.querySelectorAll('.n-row').forEach(r => r.classList.toggle('is-on', r.dataset.id === n.id));
    const c = n.caseIdx != null ? S.cases[n.caseIdx] : null;
    const ri = c && c.review ? reviewByName(c.review) : -1;
    const body = el.querySelector('.n-body');
    body.innerHTML = `<p class="n-date">${esc(n.date)}</p>
      ${n.id === 'about' ? `<div class="n-me">${meAva()}<span><b>${esc(S.name)}</b><span>${esc(S.role)}</span></span></div>` : ''}
      <h1>${esc(n.title)}</h1>
      ${c ? `<div class="case-cover" style="--c:${c.color}"><b>${esc(c.big)}</b><span>${esc(c.sub || '')}</span></div>
        <div class="chips">${(c.facts || []).map(f => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
      ${n.paras.map(t => `<p>${esc(nb(t))}</p>`).join('')}
      ${ri >= 0 ? `<button class="n-review" data-i="${ri}">${reviewAva(S.reviews[ri], ri, 'sm')}<span><b>Отзыв об этом: ${esc(S.reviews[ri].from)}</b><span>${esc(S.reviews[ri].messages[0])}</span></span>${SYM.chevR}</button>` : ''}
      ${n.id === 'about' || c ? contactButtons() : ''}`;
    const rv = body.querySelector('.n-review');
    if (rv) rv.addEventListener('click', () => openChat(+rv.dataset.i));
    body.scrollTop = 0;
  }

  /* ---------------- Игры ---------------- */
  function openGame(k) {
    let g = null;
    return openWindow({
      key: 'game:' + k, app: k, title: APPS[k].name, cls: 'game', w: k === 'tetris' ? 400 : 420, h: k === 'tetris' ? 640 : 600,
      html: `<div class="pl-bar" data-drag><span class="pl-title">${esc(APPS[k].name)}</span></div><div class="g-body"></div>`,
      onMount: el => { g = Games[k](); el.querySelector('.g-body').appendChild(g.el); },
      onClose: () => g && g.destroy(),
    });
  }

  /* ---------------- Контакт ---------------- */
  function openAbout() {
    const rows = [
      S.phone && ['Телефон', S.phone, C.tel],
      S.telegram && ['Telegram', '@' + S.telegram, C.tg],
      S.whatsapp && ['WhatsApp', S.phone, C.wa],
      S.hours && ['На связи', S.hours],
      ['Агентство', S.agency, S.agencyUrl],
      S.office && ['Офис', S.office, S.mapsUrl],
      S.cianUrl && ['Циан', 'профиль агентства', S.cianUrl],
    ].filter(Boolean);
    return openWindow({
      key: 'about', app: 'contacts', title: 'Контакт', cls: 'about', w: 340, h: 560,
      html: `<div class="ab" data-drag>
          <div class="ab-ava" style="${avatarStyle()}"></div>
          <h2>${esc(S.name)}</h2>
          <p class="ab-sub">Ваш персональный менеджер · ${esc(S.role)}</p>
          <dl>${rows.map(r => `<dt>${esc(r[0])}</dt><dd>${r[2] ? `<a href="${esc(r[2])}"${ext(r[2])} data-nodrag>${esc(r[1])}</a>` : esc(r[1])}</dd>`).join('')}</dl>
          <div data-nodrag style="width:100%">${contactButtons('is-col')}</div>
        </div>`,
    });
  }

  // Знак в строке меню вместо яблока: дюна в круге, как на обоях
  const LOGO = `<svg viewBox="0 0 16 16" class="sym"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2.4 10c2-1.6 3.6-1.6 5.6-.4s3.6 1.2 5.6-.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

  return { mount, onShow };
})();
