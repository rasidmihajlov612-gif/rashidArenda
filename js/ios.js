// «Айфон»: экран блокировки, рабочий стол, приложения со стеком экранов. Дизайн — из портфолио, наполнение — content.js.
window.IOS = (() => {
  const { S, C, esc, nb, stars, initials, TINTS, ext, avatarStyle, contactButtons, notes, reviewByName } = Core;
  const time = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  let root, holder, phone, screenEl, lock, home, appLayer, homebar;
  let framed = false, scale = 1, current = null;

  // dark: тёмный интерфейс (белая строка состояния)
  const APPS = {
    objects:  { name: 'Объекты',   icon: 'home',     root: objectsRoot },
    cases:    { name: 'Кейсы',     icon: 'decks',    root: casesRoot },
    reviews:  { name: 'Отзывы',    icon: 'messages', root: reviewsRoot },
    photos:   { name: 'Фото',      icon: 'photos',   root: photosRoot },
    notes:    { name: 'Заметки',   icon: 'notes',    root: notesRoot },
    contacts: { name: 'Контакты',  icon: 'contacts', root: contactsRoot },
    tetris:   { name: 'Тетрис',    icon: 'tetris',   root: () => gameRoot('tetris'), dark: true },
    snake:    { name: 'Змейка',    icon: 'snake',    root: () => gameRoot('snake'), dark: true },
    g2048:    { name: '2048',      icon: 'g2048',    root: () => gameRoot('g2048'), dark: true },
    phone:    { name: 'Телефон',   icon: 'phone',    href: C.tel },
    telegram: { name: 'Telegram',  icon: 'telegram', href: C.tg },
    whatsapp: { name: 'WhatsApp',  icon: 'whatsapp', href: C.wa },
    mac:      { name: 'Мак',       icon: 'mac' },
  };
  const GRID = ['objects', 'cases', 'reviews', 'photos', 'tetris', 'snake', 'g2048', 'mac'];
  const DOCK = ['phone', 'telegram', 'whatsapp', 'contacts'].filter(k => !APPS[k].hasOwnProperty('href') || APPS[k].href);

  function mount(el, opts) {
    root = el; framed = opts.framed;
    root.classList.toggle('is-framed', framed);
    const about = notes[0];
    root.innerHTML = `
      ${framed ? `<div class="ios-aside">
        <button data-go="choose">${SYM.chevL} Другое устройство</button>
        <button data-go="mac">Открыть как Мак</button></div>` : ''}
      <div class="iphone-holder"><div class="iphone">
        <div class="ios-screen">
          <div class="ios-wall"></div>
          <div class="ios-home">
            <div class="ios-grid">
              <button class="widget w-notes" data-open="notes">
                <span class="w-head">${ICONS.app('notes', 'mini')}<b>Заметки</b></span>
                <span class="w-title">${esc(about.title)}</span>
                <span class="w-text">${esc(about.paras.slice(0, 3).join(' '))}</span>
              </button>
              ${GRID.map(k => appBtn(k)).join('')}
            </div>
            <div class="ios-search">${SYM.search} Поиск</div>
            <div class="ios-dock">${DOCK.map(k => appBtn(k, true)).join('')}</div>
          </div>
          <div class="ios-apps"></div>
          <div class="ios-lock"${S.photo ? ` style="background-image:linear-gradient(180deg,rgba(0,0,0,.25),transparent 30%,transparent 50%,rgba(0,0,0,.45)),url('${S.photo}')"` : ''}>
            <div class="lk-top">
              <div class="lk-date"></div>
              <div class="lk-time"></div>
            </div>
            <div class="lk-notes">
              ${notif('contacts', S.name, S.hello)}
              ${S.reviews[0] ? notif('reviews', S.reviews[0].from, S.reviews[0].messages[0]) : ''}
            </div>
            <div class="lk-bottom">
              <button class="lk-round" data-naughty="torch">${SYM.flashlight}</button>
              <span class="lk-hint">Смахните вверх, чтобы открыть</span>
              <button class="lk-round" data-naughty="cam">${SYM.camera}</button>
            </div>
          </div>
          <div class="ios-status">
            <span class="st-time"></span>
            ${framed ? '<span class="st-island"></span>' : '<span></span>'}
            <span class="st-icons">${SYM.signal}${SYM.wifi}${SYM.battery}</span>
          </div>
          <button class="ios-homebar" aria-label="Домой"></button>
        </div>
      </div></div>`;

    holder = root.querySelector('.iphone-holder');
    phone = root.querySelector('.iphone');
    screenEl = root.querySelector('.ios-screen');
    lock = root.querySelector('.ios-lock');
    home = root.querySelector('.ios-home');
    appLayer = root.querySelector('.ios-apps');
    homebar = root.querySelector('.ios-homebar');

    root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => App.go(b.dataset.go)));
    root.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openApp(b.dataset.open, b)));
    bindLock();
    bindHomebar();
    tick(); setInterval(tick, 15000);
    fit(); addEventListener('resize', fit);
  }

  function onShow() { fit(); }

  function appBtn(k, inDock) {
    const a = APPS[k];
    const inner = `${ICONS.app(a.icon)}${inDock ? '' : `<span>${esc(a.name)}</span>`}`;
    if (a.href) return `<a class="ios-app" href="${esc(a.href)}"${ext(a.href)} aria-label="${esc(a.name)}">${inner}</a>`;
    return `<button class="ios-app" data-open="${k}" aria-label="${esc(a.name)}">${inner}</button>`;
  }
  function notif(app, title, text) {
    return `<button class="lk-note" data-note="${app}">
      ${ICONS.app(app === 'contacts' ? 'messages' : APPS[app].icon, 'mini')}
      <span class="lk-note-body"><span class="lk-note-head"><b>${esc(title)}</b><em>сейчас</em></span><span>${esc(nb(text))}</span></span></button>`;
  }

  function fit() {
    if (!framed || !holder || root.hidden) return;
    const W = 393 + 28, H = 852 + 28;
    scale = Math.min(1, (innerHeight - 40) / H, (innerWidth - 32) / W);
    holder.style.width = W * scale + 'px';
    holder.style.height = H * scale + 'px';
    phone.style.transform = `scale(${scale})`;
  }

  function tick() {
    const d = new Date();
    root.querySelector('.st-time').textContent = time();
    root.querySelector('.lk-time').textContent = time();
    root.querySelector('.lk-date').textContent = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  /* ---------- блокировка ---------- */
  function bindLock() {
    let sy = null, dy = 0;
    lock.addEventListener('pointerdown', e => {
      if (e.target.closest('.lk-note, .lk-round')) return;
      sy = e.clientY; dy = 0; lock.style.transition = 'none';
      lock.setPointerCapture(e.pointerId);
    });
    lock.addEventListener('pointermove', e => {
      if (sy == null) return;
      dy = Math.min(0, (e.clientY - sy) / scale);
      lock.style.transform = `translateY(${dy}px)`;
      lock.style.opacity = 1 + dy / 900;
    });
    lock.addEventListener('pointerup', () => {
      if (sy == null) return;
      sy = null; lock.style.transition = '';
      // короткий тап тоже открывает: не все знают про свайп
      if (dy < -70 || Math.abs(dy) < 6) unlock(); else { lock.style.transform = ''; lock.style.opacity = ''; }
    });
    lock.querySelectorAll('.lk-note').forEach(n => n.addEventListener('click', () => {
      unlock(() => openApp(n.dataset.note, home.querySelector(`[data-open="${n.dataset.note}"]`)));
    }));
    // «Не балуйтесь»: фонарик мигает, камера трясёт телефон
    lock.querySelectorAll('[data-naughty]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const torch = b.dataset.naughty === 'torch';
      screenEl.animate(torch
        ? [{ boxShadow: 'inset 0 0 0 999px rgba(255,255,255,.9)' }, { boxShadow: 'inset 0 0 0 999px rgba(255,255,255,0)' }]
        : [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(7px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }],
        { duration: torch ? 500 : 380 });
      const box = lock.querySelector('.lk-notes');
      const old = box.querySelector('.is-naughty'); if (old) old.remove();
      box.insertAdjacentHTML('afterbegin', notif('contacts', S.name, torch ? 'Просил же не баловаться)' : 'Фото квартир лучше посмотрите в «Объектах»)'));
      const n = box.firstElementChild;
      n.classList.add('is-naughty');
      n.animate([{ transform: 'translateY(-14px) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
      n.addEventListener('click', () => unlock(() => openApp('objects')));
    }));
  }

  function unlock(then) {
    lock.style.transition = '';
    lock.classList.add('is-gone');
    lock.style.transform = ''; lock.style.opacity = '';
    screenEl.classList.add('is-unlocked');
    home.animate([{ transform: 'scale(1.08)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    if (then) setTimeout(then, 280);
  }

  /* ---------- жест «домой» ---------- */
  function bindHomebar() {
    homebar.addEventListener('click', () => {
      if (!screenEl.classList.contains('is-unlocked')) return unlock();
      if (current) closeApp();
    });
    let sy = null;
    screenEl.addEventListener('pointerdown', e => {
      const r = screenEl.getBoundingClientRect();
      if (current && r.bottom - e.clientY < 34 * scale) sy = e.clientY;
    });
    addEventListener('pointerup', e => { if (sy != null && sy - e.clientY > 30) closeApp(); sy = null; });
    addEventListener('keydown', e => { if (!root.hidden && e.key === 'Escape' && current) closeApp(); });
  }

  /* ---------- открытие и закрытие приложений ---------- */
  function rectIn(el) {
    const s = screenEl.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: (r.left - s.left) / scale, y: (r.top - s.top) / scale, w: r.width / scale, h: r.height / scale };
  }

  function openApp(k, fromEl) {
    if (k === 'mac') return App.go('mac');
    if (current) return;
    const a = APPS[k];
    const el = document.createElement('div');
    el.className = 'app' + (a.dark ? ' is-dark' : '');
    el.innerHTML = '<div class="stack"></div>';
    appLayer.appendChild(el);
    const icon = fromEl && (fromEl.querySelector('.appicon') || fromEl);
    current = { k, el, from: icon ? rectIn(icon) : null, destroys: [] };
    push(a.root(), false);
    screenEl.classList.add('in-app');

    const W = screenEl.clientWidth, H = screenEl.clientHeight, f = current.from;
    const start = f ? `translate(${f.x}px, ${f.y}px) scale(${f.w / W}, ${f.h / H})` : 'scale(.9)';
    el.animate([{ transform: start, borderRadius: '60px', opacity: f ? 1 : 0 }, { transform: 'none', borderRadius: '46px', opacity: 1 }],
      { duration: 420, easing: 'cubic-bezier(.2,.9,.25,1)' });
    home.animate([{ transform: 'none' }, { transform: 'scale(.9)', opacity: .6 }], { duration: 420, easing: 'cubic-bezier(.2,.9,.25,1)', fill: 'forwards' });
  }

  function closeApp() {
    if (!current) return;
    const { el, from, destroys } = current;
    destroys.forEach(fn => fn());
    current = null;
    screenEl.classList.remove('in-app', 'dark-app');
    const W = screenEl.clientWidth, H = screenEl.clientHeight;
    const end = from ? `translate(${from.x}px, ${from.y}px) scale(${from.w / W}, ${from.h / H})` : 'scale(.9)';
    const a = el.animate([{ transform: 'none', borderRadius: '46px', opacity: 1 }, { transform: end, borderRadius: '90px', opacity: from ? .4 : 0 }],
      { duration: 340, easing: 'cubic-bezier(.4,0,.2,1)' });
    a.onfinish = () => el.remove();
    home.getAnimations().forEach(x => x.cancel());
    home.animate([{ transform: 'scale(.9)', opacity: .6 }, { transform: 'none', opacity: 1 }], { duration: 340, easing: 'cubic-bezier(.2,.8,.3,1)' });
  }

  /* ---------- стек экранов внутри приложения ---------- */
  // view = { html, title?, back?, cls?, mount?(el), large?, bare?, dark?, destroy? }
  function push(view, animate = true) {
    const stack = current.el.querySelector('.stack');
    const prev = stack.lastElementChild;
    const v = document.createElement('section');
    v.className = 'view ' + (view.cls || '');
    v.innerHTML = view.bare ? view.html : `
      <header class="nav">
        ${prev ? `<button class="nav-back">${SYM.chevL}<span>${esc(prev.dataset.title || 'Назад')}</span></button>` : '<span></span>'}
        <b class="nav-title">${esc(view.title || '')}</b>
        <span class="nav-right">${view.right || ''}</span>
      </header>
      <div class="view-body">${view.large === false ? '' : `<h1 class="large-title">${esc(view.title || '')}</h1>`}${view.html}</div>`;
    v.dataset.title = view.backTitle || view.title || '';
    if (view.dark || APPS[current.k].dark) v.dataset.dark = '1';
    stack.appendChild(v);
    syncTone(v);
    v.querySelectorAll('.nav-back, [data-pop]').forEach(b => b.addEventListener('click', pop));
    const body = v.querySelector('.view-body');
    if (body && view.large !== false) body.addEventListener('scroll', () => v.classList.toggle('is-scrolled', body.scrollTop > 30));
    if (view.mount) view.mount(v);
    if (view.destroy) { v._destroy = view.destroy; current.destroys.push(view.destroy); }
    if (animate && prev) {
      const e = { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' };
      v.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], e);
      prev.animate([{ transform: 'none' }, { transform: 'translateX(-30%)', filter: 'brightness(.9)' }], { ...e, fill: 'forwards' });
    }
  }

  function pop() {
    const stack = current.el.querySelector('.stack');
    const v = stack.lastElementChild, prev = v.previousElementSibling;
    if (!prev) return;
    if (v._destroy) { v._destroy(); current.destroys = current.destroys.filter(f => f !== v._destroy); }
    const e = { duration: 320, easing: 'cubic-bezier(.3,.7,.3,1)' };
    v.animate([{ transform: 'none' }, { transform: 'translateX(100%)' }], e).onfinish = () => v.remove();
    prev.getAnimations().forEach(x => x.cancel());
    syncTone(prev);
    prev.animate([{ transform: 'translateX(-30%)', filter: 'brightness(.9)' }, { transform: 'none' }], e);
  }

  // строка состояния и полоска «домой» светлеют на тёмных экранах
  function syncTone(v) { screenEl.classList.toggle('dark-app', !!v.dataset.dark); }

  const tap = (el, sel, fn) => el.querySelectorAll(sel).forEach(b => b.addEventListener('click', () => fn(b)));
  const chips = list => `<div class="chips">${(list || []).map(f => `<span>${esc(f)}</span>`).join('')}</div>`;
  const reviewAva = (r, i, cls = '') => `<span class="c-ava ${cls}" style="--tint:${TINTS[i % TINTS.length]}">${esc(initials(r.from || '?'))}</span>`;
  const meAva = (cls = '') => `<span class="c-ava me-ava ${cls}" style="${avatarStyle()}">${S.avatar ? '' : esc(initials(S.name))}</span>`;

  // Листалка фото с счётчиком
  const pager = (photos, alt) => `<div class="pager"><div class="pages">${photos.map(p => `<div class="page"><img src="${esc(p)}" alt="${esc(alt)}" loading="lazy"></div>`).join('')}</div><span class="pager-count">1 / ${photos.length}</span></div>`;
  const bindPager = v => v.querySelectorAll('.pager').forEach(pg => {
    const s = pg.querySelector('.pages'), c = pg.querySelector('.pager-count'), n = s.children.length;
    s.addEventListener('scroll', () => { c.textContent = `${Math.round(s.scrollLeft / s.clientWidth) + 1} / ${n}`; });
  });

  /* ---------- Объекты ---------- */
  function objectsRoot() {
    return {
      title: 'Объекты', cls: 'v-objects',
      html: `<p class="v-lead">Сдаются сейчас. Напишите, если какая-то понравилась, или расскажите, что ищете.</p>
        <div class="deck-list">${S.objects.map((o, i) => `<button class="deck-row obj-row" data-i="${i}">
          <span class="thumb thumb-photo"><img src="${esc(o.photos[0])}" alt="" loading="lazy"></span>
          <span class="deck-txt"><b>${esc(o.price)}</b><span class="dt-main">${esc(o.title)}</span><span>${esc(o.metro || '')}</span></span></button>`).join('')}</div>`,
      mount: v => tap(v, '.obj-row', b => push(objectView(+b.dataset.i))),
    };
  }
  function objectView(i) {
    const o = S.objects[i];
    return {
      title: o.title, large: false, cls: 'v-object', backTitle: 'Объект',
      html: `${pager(o.photos, o.title)}
        <div class="obj-info">
          <p class="vi-price">${esc(o.price)}</p>
          <p class="vi-title">${esc(o.title)}</p>
          <p class="vi-metro">${esc(o.metro || '')}</p>
          <p class="vi-addr">${esc(o.where || '')}</p>
          ${chips(o.facts)}
          <p class="vi-text">${esc(nb(o.text || ''))}</p>
          <a class="cta-btn" href="${esc(o.link)}"${ext(o.link)}>Объявление на Циане</a>
          ${contactButtons('is-col')}
        </div>`,
      mount: bindPager,
    };
  }

  /* ---------- Кейсы ---------- */
  function casesRoot() {
    return {
      title: 'Кейсы', cls: 'v-cases',
      html: `<div class="deck-list">${S.cases.map((c, i) => `<button class="deck-row case-row" data-i="${i}">
          <span class="thumb thumb-case" style="--c:${c.color}"><b>${esc(c.big)}</b></span>
          <span class="deck-txt"><b>${esc(c.title)}</b><span>${esc(c.sub || '')}</span></span></button>`).join('')}</div>`,
      mount: v => tap(v, '.case-row', b => push(caseView(+b.dataset.i))),
    };
  }
  function caseView(i) {
    const c = S.cases[i];
    const ri = c.review ? reviewByName(c.review) : -1;
    const r = ri >= 0 ? S.reviews[ri] : null;
    return {
      title: '', large: false, cls: 'v-note', backTitle: 'Кейс',
      html: `<article class="note">
          <p class="note-date">Кейс</p>
          <h1>${esc(c.title)}</h1>
          <div class="case-cover" style="--c:${c.color}"><b>${esc(c.big)}</b><span>${esc(c.sub || '')}</span></div>
          ${chips(c.facts)}
          ${String(c.story).split(/\n+/).map(t => `<p>${esc(nb(t))}</p>`).join('')}
          ${r ? `<button class="n-review" data-i="${ri}">${reviewAva(r, ri, 'sm')}<span><b>Отзыв об этом: ${esc(r.from)}</b><span>${esc(r.messages[0])}</span></span>${SYM.chevR}</button>` : ''}
          ${contactButtons('is-col')}
        </article>`,
      mount: v => tap(v, '.n-review', b => push(chatView(+b.dataset.i))),
    };
  }

  /* ---------- Отзывы ---------- */
  function reviewsRoot() {
    return {
      title: 'Отзывы', cls: 'v-chats',
      html: `<div class="search-field">${SYM.search} Поиск</div>
        <div class="chat-rows">
          <button class="chat-row" data-i="-1">${meAva()}
            <span class="chat-txt"><span class="chat-top"><b>${esc(S.name)}</b><em>${time()}</em></span><span>Напишите про квартиру — отвечу сам</span></span></button>
          ${S.reviews.map((r, i) => `<button class="chat-row" data-i="${i}">${reviewAva(r, i)}
            <span class="chat-txt"><span class="chat-top"><b>${esc(r.from)}</b><em class="stars">${stars(r.stars)}</em></span><span>${esc(r.messages[r.messages.length - 1])}</span></span></button>`).join('')}
        </div>
        ${S.mapsUrl ? `<a class="all-reviews" href="${esc(S.mapsUrl)}"${ext(S.mapsUrl)}>Все отзывы на Яндекс Картах ›</a>` : ''}`,
      mount: v => tap(v, '.chat-row', b => push(chatView(+b.dataset.i))),
    };
  }
  function chatView(i) {
    const me = i < 0, r = me ? null : S.reviews[i];
    const msgs = me
      ? [nb(S.hello), 'Расскажите про квартиру: адрес, сколько комнат и когда освобождается. Дальше я сам, вам это ничего не стоит.']
      : r.messages.map(nb);
    return {
      bare: true, cls: 'v-chat', title: me ? S.name : r.from,
      html: `<header class="chat-head">
          <button class="nav-back" data-pop>${SYM.chevL}<span>Отзывы</span></button>
          <span class="chat-who"><b>${esc(me ? S.name : r.from)}</b><span>${me ? 'на связи ' + esc(S.hours || '') : `${stars(r.stars)} · ${esc(r.where || 'Яндекс Карты')}`}</span></span>
          ${me ? meAva('sm') : reviewAva(r, i, 'sm')}
        </header>
        <div class="chat-msgs">${msgs.map(m => `<div class="msg msg-bot"><span class="bubble">${esc(m)}</span></div>`).join('')}
          ${me ? `<div class="msg msg-bot msg-cta">${contactButtons('is-col')}</div>` : ''}</div>
        <div class="chat-compose">${SYM.clip}<span class="chat-input">Сообщение</span>${SYM.mic}</div>`,
    };
  }

  /* ---------- Фото ---------- */
  function photosRoot() {
    const list = S.personal || [];
    return {
      title: 'Фото', cls: 'v-photos',
      html: `<h2 class="sec-title">Это я</h2>
        <div class="photo-grid">${list.map((p, i) => `<button class="ph" data-i="${i}"><img src="${esc(p)}" alt="" loading="lazy"></button>`).join('')}</div>`,
      mount: v => tap(v, '.ph', b => push({
        title: 'Это я', large: false, cls: 'v-pages', dark: true, backTitle: 'Фото',
        html: pager(list, S.name),
        mount: pv => {
          bindPager(pv);
          const s = pv.querySelector('.pages');
          requestAnimationFrame(() => { s.scrollLeft = +b.dataset.i * s.clientWidth; });
        },
      })),
    };
  }

  /* ---------- Заметки ---------- */
  function notesRoot() {
    return {
      title: 'Заметки', cls: 'v-notes',
      html: `<div class="group">${notes.map(n => `<button class="row note-row" data-id="${n.id}"><b>${esc(n.title)}</b><span><em>${esc(n.date)}</em> ${esc(n.paras[0])}</span></button>`).join('')}</div>
        <p class="foot-count">${notes.length} заметок</p>`,
      mount: v => tap(v, '.note-row', b => {
        const n = notes.find(x => x.id === b.dataset.id);
        push(n.caseIdx != null ? caseView(n.caseIdx) : noteView(n));
      }),
    };
  }
  function noteView(n) {
    return {
      title: '', large: false, cls: 'v-note', right: SYM.share, backTitle: 'Заметка',
      html: `<article class="note"><p class="note-date">${esc(n.date)}</p>
        ${n.id === 'about' ? `<div class="n-me">${meAva()}<span><b>${esc(S.name)}</b><span>${esc(S.role)}</span></span></div>` : ''}
        <h1>${esc(n.title)}</h1>${n.paras.map(t => `<p>${esc(nb(t))}</p>`).join('')}
        ${contactButtons('is-col')}</article>`,
    };
  }

  /* ---------- Контакты ---------- */
  function contactsRoot() {
    const rows = [
      S.phone && ['мобильный', S.phone, C.tel],
      S.telegram && ['telegram', '@' + S.telegram, C.tg],
      S.whatsapp && ['whatsapp', S.phone, C.wa],
      S.hours && ['на связи', S.hours],
      ['агентство', S.agency, S.agencyUrl],
      S.office && ['офис', S.office, S.mapsUrl],
      S.cianUrl && ['циан', 'профиль агентства', S.cianUrl],
      S.mapsUrl && ['отзывы', 'Яндекс Карты', S.mapsUrl],
    ].filter(Boolean);
    return {
      title: '', large: false, cls: 'v-contact',
      html: `<div class="contact">
          <div class="ct-ava" style="${avatarStyle()}">${S.avatar ? '' : esc(initials(S.name))}</div>
          <h1>${esc(S.name)}</h1>
          <p>Ваш персональный менеджер</p>
          <div class="ct-actions">
            ${C.tg ? `<a class="ct-act" href="${esc(C.tg)}"${ext(C.tg)}>${SYM.msg}<span>написать</span></a>` : ''}
            ${C.tel ? `<a class="ct-act" href="${esc(C.tel)}">${SYM.phone}<span>позвонить</span></a>` : ''}
            ${C.wa ? `<a class="ct-act" href="${esc(C.wa)}"${ext(C.wa)}>${SYM.msg}<span>whatsapp</span></a>` : ''}
          </div>
          <div class="group">${rows.map(r => r[2]
            ? `<a class="row ct-row" href="${esc(r[2])}"${ext(r[2])}><span>${esc(r[0])}</span><b>${esc(r[1])}</b></a>`
            : `<div class="row ct-row"><span>${esc(r[0])}</span><b class="plain">${esc(r[1])}</b></div>`).join('')}</div>
          <div class="group ct-note"><div class="row ct-row"><span>заметки</span><b class="plain">Собственник агентству не платит, комиссию платит наниматель.</b></div></div>
        </div>`,
    };
  }

  /* ---------- Игры ---------- */
  function gameRoot(k) {
    const g = Games[k]();
    return {
      title: APPS[k].name, large: false, cls: 'v-game', dark: true,
      html: '<div class="g-body"></div>',
      mount: v => v.querySelector('.g-body').appendChild(g.el),
      destroy: g.destroy,
    };
  }

  return { mount, onShow };
})();
