// Общее для айфона и Мака: данные, иконки, экраны приложений.
// Экран = функция (nav) → { title, small, node, footer?, destroy?, tint?, dark?, chat? }.
// nav.push(экран) открывает следующий экран внутри того же приложения.
(function () {
  var S = window.SITE;
  var uid = 0;

  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  // Неразрывный пробел после коротких слов, чтобы предлоги не висели в конце строки
  function nb(s) {
    var re = /(^|[\s ])([а-яёА-ЯЁa-zA-Z0-9—]{1,2})\s/g;
    return String(s).replace(re, '$1$2 ').replace(re, '$1$2 ');
  }
  function initials(s) { return String(s).trim().charAt(0).toUpperCase(); }
  function slot(text, cls) { return h('div', 'slot ' + (cls || ''), text); }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem('rm-' + key));
      localStorage.setItem('rm-' + key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function art(name) { uid++; return window.ICONS[name].replace(/§/g, 'i' + uid); }

  // ---------- Контакты ----------
  var C = {
    tel: S.phone ? 'tel:' + S.phone.replace(/[^\d+]/g, '') : '',
    tg: S.telegram ? 'https://t.me/' + S.telegram : '',
    wa: S.whatsapp ? 'https://wa.me/' + S.whatsapp : ''
  };
  function link(a, href) {
    a.href = href;
    if (href.indexOf('http') === 0) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }
  function contactButtons(box, big) {
    if (C.tg) box.appendChild(link(h('a', 'btn btn-main', 'Написать в Telegram'), C.tg));
    if (C.wa) box.appendChild(link(h('a', 'btn' + (C.tg ? '' : ' btn-main'), 'WhatsApp'), C.wa));
    if (C.tel) box.appendChild(link(h('a', 'btn' + (C.tg || C.wa ? '' : ' btn-main'), big ? 'Позвонить ' + S.phone : 'Позвонить'), C.tel));
    return box;
  }
  function avatar(cls) {
    var a = h('span', cls);
    var src = S.avatar || S.photo;
    if (src) { a.style.backgroundImage = 'url("' + src + '")'; a.classList.add('has-img'); }
    else a.textContent = initials(S.name);
    return a;
  }

  // Сгруппированный список, как в «Настройках»
  // row: { label, value?, href?, click?, icon?, sub?, tint? }
  function group(header, rows, footer) {
    var w = h('div', 'group');
    if (header) w.appendChild(h('p', 'group-head', header));
    var list = h('div', 'group-list');
    rows.forEach(function (r) {
      var row = r.href ? link(h('a', 'cell'), r.href) : h(r.click ? 'button' : 'div', 'cell');
      if (r.click) row.addEventListener('click', r.click);
      if (r.icon) row.appendChild(tile(r.icon, 'cell-icon'));
      var t = h('span', 'cell-text');
      t.appendChild(h('span', 'cell-label' + (r.tint ? ' tint' : ''), r.label));
      if (r.sub) t.appendChild(h('span', 'cell-sub', r.sub));
      row.appendChild(t);
      if (r.value) row.appendChild(h('span', 'cell-value', r.value));
      if (r.href || r.click) row.appendChild(h('span', 'chev'));
      list.appendChild(row);
    });
    w.appendChild(list);
    if (footer) w.appendChild(h('p', 'group-foot', footer));
    return w;
  }

  // ---------- Приложения ----------
  var APPS = {
    about:    { label: 'Обо мне',     icon: 'notes',     view: viewAbout,    w: 460, h: 580 },
    cases:    { label: 'Кейсы',       icon: 'photos',    view: viewCases,    w: 660, h: 560 },
    objects:  { label: 'Объекты',     icon: 'home',      view: viewObjects,  w: 600, h: 580 },
    reviews:  { label: 'Отзывы',      icon: 'messages',  view: viewReviews,  w: 440, h: 600 },
    steps:    { label: 'Как сдаём',   icon: 'reminders', view: viewSteps,    w: 440, h: 580 },
    map:      { label: 'Где работаю', icon: 'maps',      view: viewMap,      w: 460, h: 560 },
    contact:  { label: 'Телефон',     icon: 'phone',     view: viewContact,  w: 400, h: 600 },
    settings: { label: 'Настройки',   icon: 'settings',  view: viewSettings, w: 460, h: 600 },
    tetris:   { label: 'Тетрис',      icon: 'tetris',    view: function () { return gameView('tetris'); }, w: 400, h: 640 },
    snake:    { label: 'Змейка',      icon: 'snake',     view: function () { return gameView('snake'); },  w: 420, h: 620 },
    g2048:    { label: '2048',        icon: 'g2048',     view: function () { return gameView('g2048'); },  w: 420, h: 600 },
    telegram: { label: 'Telegram',    icon: 'telegram',  href: C.tg },
    whatsapp: { label: 'WhatsApp',    icon: 'whatsapp',  href: C.wa }
  };

  function tile(id, cls) {
    var t = h('span', cls || 'tile');
    t.innerHTML = art(APPS[id] ? APPS[id].icon : id);
    return t;
  }

  // ---------- Заметки: обо мне ----------
  function viewAbout() {
    var n = h('article', 'notepad');
    var d = new Date();
    n.appendChild(h('p', 'notepad-date', d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })));
    n.appendChild(h('h3', null, 'Обо мне'));
    var top = h('div', 'notepad-me');
    top.appendChild(avatar('notepad-ava'));
    var who = h('div');
    who.appendChild(h('b', null, S.name));
    who.appendChild(h('span', null, S.role));
    top.appendChild(who);
    n.appendChild(top);
    S.about.concat(S.intro).forEach(function (p) { n.appendChild(h('p', null, nb(p))); });
    if (!S.about.length && S.draft) n.appendChild(slot('Сюда пара абзацев о себе твоими словами: сколько в аренде, почему пошёл, что-то из жизни'));
    n.appendChild(contactButtons(h('div', 'btn-col')));
    return { node: n, small: '', back: 'Заметки', tint: '#d9a400' };
  }

  // ---------- Фото: кейсы ----------
  function viewCases(nav) {
    var w = h('div');
    var head = h('div', 'section-row');
    head.appendChild(h('b', null, 'Квартиры, которые я сдал'));
    head.appendChild(h('span', null, S.cases.length ? String(S.cases.length) : ''));
    w.appendChild(head);
    var g = h('div', 'albums');
    if (S.cases.length) {
      S.cases.forEach(function (c) {
        var b = h('button', 'album');
        var cover = h('span', 'album-cover');
        if (c.photos && c.photos[0]) cover.style.backgroundImage = 'url("' + c.photos[0] + '")';
        b.appendChild(cover);
        b.appendChild(h('b', null, c.title));
        b.appendChild(h('span', null, (c.facts && c.facts[0]) || String((c.photos || []).length)));
        b.addEventListener('click', function () { nav.push(viewCase(c, nav)); });
        g.appendChild(b);
      });
    } else if (S.draft) {
      ['Кейс: какая квартира, что было не так, как сдали', 'Ещё кейс', 'И ещё один', 'Можно и пятый'].forEach(function (t) {
        var b = h('div', 'album'); b.appendChild(slot(t, 'slot-album')); g.appendChild(b);
      });
    }
    w.appendChild(g);
    if (S.personal && S.personal.length) {
      var head2 = h('div', 'section-row');
      head2.appendChild(h('b', null, 'Личное'));
      head2.appendChild(h('span', null, String(S.personal.length)));
      w.appendChild(head2);
      var g2 = h('div', 'albums');
      var b2 = h('button', 'album');
      var cv = h('span', 'album-cover'); cv.style.backgroundImage = 'url("' + S.personal[0] + '")';
      b2.appendChild(cv); b2.appendChild(h('b', null, 'Это я')); b2.appendChild(h('span', null, String(S.personal.length)));
      b2.addEventListener('click', function () { nav.push({ node: shots(S.personal, 'Это я', nav), title: 'Это я', small: 'Это я' }); });
      g2.appendChild(b2);
      w.appendChild(g2);
    }
    return { node: w, title: 'Альбомы', small: 'Альбомы' };
  }
  function shots(photos, title, nav) {
    var grid = h('div', 'shots' + (photos.length === 1 ? ' one' : ''));
    photos.forEach(function (src, i) {
      var b = h('button', 'shot');
      var im = h('img'); im.src = src; im.alt = title + ', фото ' + (i + 1); im.loading = 'lazy';
      b.appendChild(im);
      b.addEventListener('click', function () { nav.push(viewPhoto(src, title)); });
      grid.appendChild(b);
    });
    return grid;
  }
  function chips(list) {
    var f = h('p', 'chips');
    list.forEach(function (t) { f.appendChild(h('span', null, t)); });
    return f;
  }
  function viewCase(c, nav) {
    var w = h('div', 'detail');
    if (c.photos && c.photos.length) w.appendChild(shots(c.photos, c.title, nav));
    if (c.facts && c.facts.length) w.appendChild(chips(c.facts));
    if (c.story) String(c.story).split(/\n+/).forEach(function (p) { w.appendChild(h('p', 'story', nb(p))); });
    return { node: w, title: c.title, small: c.title };
  }
  function viewPhoto(src, title) {
    var w = h('div', 'viewer');
    var im = h('img'); im.src = src; im.alt = title; w.appendChild(im);
    return { node: w, small: title, dark: true };
  }

  // ---------- Дом: объекты ----------
  function viewObjects(nav) {
    var list = h('div', 'objects');
    if (S.objects.length) {
      S.objects.forEach(function (o) {
        var b = h('button', 'object');
        var ph = h('span', 'object-photo');
        if (o.photos && o.photos[0]) ph.style.backgroundImage = 'url("' + o.photos[0] + '")';
        b.appendChild(ph);
        var t = h('span', 'object-text');
        if (o.price) t.appendChild(h('b', 'object-price', o.price));
        t.appendChild(h('span', 'object-title', o.title));
        if (o.where) t.appendChild(h('span', 'object-where', o.where));
        b.appendChild(t);
        b.addEventListener('click', function () { nav.push(viewObject(o, nav)); });
        list.appendChild(b);
      });
    } else if (S.draft) {
      ['Объект, который сдаётся сейчас: фото, цена, метро', 'Ещё объект'].forEach(function (t) { list.appendChild(slot(t, 'slot-object')); });
    } else {
      list.appendChild(h('p', 'empty', 'Сейчас всё сдано. Спросите меня, что появится на этой неделе.'));
    }
    return { node: list, title: 'Объекты', small: 'Объекты', tint: '#ff9500' };
  }
  function viewObject(o, nav) {
    var w = h('div', 'detail');
    if (o.photos && o.photos.length) w.appendChild(shots(o.photos, o.title, nav));
    if (o.price) w.appendChild(h('p', 'object-price big', o.price));
    if (o.where) w.appendChild(h('p', 'object-where', o.where));
    if (o.text) String(o.text).split(/\n+/).forEach(function (p) { w.appendChild(h('p', 'story', nb(p))); });
    var box = h('div', 'btn-col');
    if (o.link) box.appendChild(link(h('a', 'btn', 'Объявление целиком'), o.link));
    contactButtons(box);
    w.appendChild(box);
    return { node: w, title: o.title, small: o.title, tint: '#ff9500' };
  }

  // ---------- Сообщения: отзывы ----------
  function viewReviews(nav) {
    var list = h('div', 'chats');
    var me = chatRow(S.name, 'Напишите про квартиру — отвечу сам', true);
    me.addEventListener('click', function () { nav.push(viewMe()); });
    list.appendChild(me);
    if (S.reviews.length) {
      S.reviews.forEach(function (r) {
        var prev = r.messages && r.messages.length ? r.messages[r.messages.length - 1] : 'Вложение: 1 изображение';
        var row = chatRow(r.from || 'Собственник', prev, false, r.stars ? '★★★★★'.slice(0, r.stars) : r.where);
        row.addEventListener('click', function () { nav.push(viewChat(r)); });
        list.appendChild(row);
      });
    } else if (S.draft) {
      ['Скриншот переписки с собственником', 'Отзыв с Авито или Циана', 'Голосовое, переведённое в текст'].forEach(function (t) {
        list.appendChild(slot(t, 'slot-chat'));
      });
    }
    return { node: list, title: 'Сообщения', small: 'Сообщения', back: 'Отзывы' };
  }
  function chatRow(name, text, pinned, where) {
    var b = h('button', 'chat-row' + (pinned ? ' pinned' : ''));
    b.appendChild(pinned ? avatar('ava') : h('span', 'ava', initials(name)));
    var t = h('span', 'chat-text');
    var top = h('span', 'chat-top');
    top.appendChild(h('b', null, name));
    var right = h('small', null, where || (pinned ? 'сейчас' : ''));
    right.appendChild(h('span', 'chev'));
    top.appendChild(right);
    t.appendChild(top);
    t.appendChild(h('span', 'chat-prev', text));
    b.appendChild(t);
    return b;
  }
  function composer(extra) {
    var f = h('div', 'composer');
    if (extra) f.appendChild(extra);
    var bar = h('div', 'composer-bar');
    bar.appendChild(h('span', 'composer-plus', '+'));
    bar.appendChild(h('span', 'composer-input', 'iMessage'));
    f.appendChild(bar);
    return f;
  }
  function viewChat(r) {
    var w = h('div', 'thread');
    if (r.where) w.appendChild(h('p', 'thread-where', (r.stars ? '★★★★★'.slice(0, r.stars) + '  ' : '') + 'Отзыв · ' + r.where));
    if (r.img) {
      var b = h('div', 'bubble in pic');
      var im = h('img'); im.src = r.img; im.alt = 'Переписка: ' + (r.from || ''); im.loading = 'lazy';
      b.appendChild(im); w.appendChild(b);
    }
    (r.messages || []).forEach(function (m) { w.appendChild(h('div', 'bubble in', nb(m))); });
    return { node: w, chat: { name: r.from || 'Собственник' }, footer: composer() };
  }
  function viewMe() {
    var w = h('div', 'thread');
    w.appendChild(h('p', 'thread-where', 'Сегодня'));
    w.appendChild(h('div', 'bubble in', 'Расскажите про квартиру: адрес, сколько комнат и когда освобождается.'));
    w.appendChild(h('div', 'bubble in', 'Дальше я сам. Вам это ничего не стоит.'));
    return { node: w, chat: { name: S.name, me: true }, footer: composer(contactButtons(h('div', 'composer-actions'))) };
  }

  // ---------- Напоминания: как сдаём ----------
  function viewSteps() {
    var w = h('div', 'reminders');
    S.steps.forEach(function (s) {
      var row = h('label', 'rem');
      var box = h('input'); box.type = 'checkbox';
      row.appendChild(box);
      row.appendChild(h('span', 'rem-dot'));
      var t = h('span', 'rem-text');
      t.appendChild(h('b', null, s[0]));
      t.appendChild(h('span', null, nb(s[1])));
      row.appendChild(t);
      w.appendChild(row);
    });
    var z = h('div', 'zero-card');
    z.appendChild(h('b', null, '0 ₽'));
    z.appendChild(h('span', null, nb('платите вы. Комиссию агентству платит наниматель, это прописано в договоре.')));
    w.appendChild(z);
    return { node: w, title: 'Сдать квартиру', small: 'Сдать квартиру', back: 'Списки', tint: '#0a84ff', titleTint: true };
  }

  // ---------- Карты ----------
  function viewMap() {
    var w = h('div', 'mapview');
    var a = h('div', 'map-art');
    a.innerHTML = '<svg viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<rect width="400" height="420" fill="#f2efe6"/>' +
      '<path d="M0 0h140l-30 120L0 160z" fill="#cfe8bf"/><path d="M260 300l140-60v180H230z" fill="#cfe8bf"/>' +
      '<path d="M-10 250C80 230 120 280 200 250S330 170 410 190" stroke="#a9d3f5" stroke-width="22" fill="none"/>' +
      '<g stroke="#fff" stroke-width="7" fill="none"><path d="M0 90h400M0 330h400M90 0v420M310 0v420M-20 420 420 0"/></g>' +
      '<g fill="none" stroke="#ffcf3f" stroke-width="9"><circle cx="200" cy="210" r="150"/><circle cx="200" cy="210" r="70"/></g>' +
      '<circle cx="200" cy="210" r="22" fill="#0a84ff" opacity=".2"/><circle cx="200" cy="210" r="10" fill="#0a84ff" stroke="#fff" stroke-width="4"/></svg>';
    w.appendChild(a);
    var sheet = h('div', 'map-sheet');
    sheet.appendChild(h('span', 'grabber'));
    sheet.appendChild(h('h3', null, 'Москва и область'));
    sheet.appendChild(h('p', null, nb('Сдаём квартиры в Москве и Подмосковье. Пришлите адрес, и я скажу, за сколько может сдаться квартира.')));
    sheet.appendChild(contactButtons(h('div', 'btn-col')));
    w.appendChild(sheet);
    return { node: w, small: '', bare: true };
  }

  // ---------- Телефон: карточка контакта ----------
  var GL = {
    msg: '<svg viewBox="0 0 24 24"><path d="M12 3.5c-5 0-9 3.3-9 7.4 0 2.4 1.3 4.5 3.4 5.9-.1 1-.6 2-1.6 2.7 0 0 2.4.2 4.2-1.3.9.2 1.9.3 3 .3 5 0 9-3.3 9-7.4S17 3.5 12 3.5z" fill="currentColor"/></svg>',
    call: '<svg viewBox="0 0 24 24"><path d="M8 3.6c-.4-.3-1-.2-1.3.1L5.3 5.2c-.7.7-.9 1.8-.5 2.7 1.9 4.4 5 7.5 9.4 9.4.9.4 2 .2 2.7-.5l1.4-1.4c.4-.4.4-.9.1-1.3l-1.6-2.4c-.3-.4-.9-.6-1.3-.4l-1.8.8c-1.7-1-3.1-2.4-4.1-4.1l.8-1.8c.2-.5 0-1-.4-1.3z" fill="currentColor"/></svg>',
    tg: '<svg viewBox="0 0 24 24"><path d="M3.5 11.4 19.4 5.3c.7-.3 1.4.2 1.1 1.3l-2.7 12.7c-.2.9-.7 1.1-1.5.7l-4-3-1.9 1.9c-.2.2-.4.4-.8.4l.3-4.1 7.5-6.8c.3-.3-.1-.5-.5-.2l-9.3 5.9-4-1.3c-.9-.3-.9-.9.2-1.3z" fill="currentColor"/></svg>',
    web: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 12h17M12 3.5c2.5 2.4 3.6 5.3 3.6 8.5s-1.1 6.1-3.6 8.5c-2.5-2.4-3.6-5.3-3.6-8.5s1.1-6.1 3.6-8.5z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
  };
  function viewContact() {
    var w = h('div', 'contact');
    w.appendChild(avatar('contact-ava'));
    w.appendChild(h('h3', null, S.name));
    w.appendChild(h('p', 'contact-role', S.agency));
    var quick = h('div', 'quick');
    function q(href, label, glyph) {
      var l = href ? link(h('a', 'q'), href) : h('span', 'q off');
      l.innerHTML = glyph;
      l.appendChild(h('small', null, label));
      quick.appendChild(l);
    }
    q(C.tg || C.wa, 'написать', GL.msg);
    q(C.tel, 'позвонить', GL.call);
    q(C.tg, 'telegram', GL.tg);
    q(S.agencyUrl, 'сайт', GL.web);
    w.appendChild(quick);
    var rows = [];
    if (S.phone) rows.push({ label: S.phone, sub: 'мобильный', href: C.tel, tint: true });
    if (S.telegram) rows.push({ label: '@' + S.telegram, sub: 'telegram', href: C.tg, tint: true });
    rows.push({ label: S.agency, sub: 'работа', href: S.agencyUrl, tint: true });
    w.appendChild(group('', rows));
    w.appendChild(group('', [{ label: 'Собственник агентству не платит. Комиссию платит наниматель.', sub: 'заметки' }]));
    return { node: w, small: '', back: 'Контакты', grouped: true };
  }

  // ---------- Настройки: об этом владельце ----------
  function viewSettings(nav) {
    var w = h('div', 'settings');
    var me = h('button', 'cell me-cell');
    me.appendChild(avatar('me-ava'));
    var t = h('span', 'cell-text');
    t.appendChild(h('span', 'me-name', S.name));
    t.appendChild(h('span', 'cell-sub', 'Агент по аренде, контакты и связь'));
    me.appendChild(t); me.appendChild(h('span', 'chev'));
    me.addEventListener('click', function () { nav.push(viewContact()); });
    var g0 = h('div', 'group'); var l0 = h('div', 'group-list'); l0.appendChild(me); g0.appendChild(l0);
    w.appendChild(g0);
    w.appendChild(group('Об этом владельце', [
      { label: 'Имя', value: S.name },
      { label: 'Возраст', value: '22 года' },
      { label: 'Работа', value: 'аренда квартир' },
      { label: 'Агентство', value: 'А. Медведева' },
      { label: 'Где', value: 'Москва и область' },
      { label: 'Комиссия для собственника', value: '0 ₽' }
    ]));
    w.appendChild(group('Агентство', [
      { label: 'Сайт агентства', icon: 'safari', href: S.agencyUrl },
      { label: 'Профиль на Циане', icon: 'home', href: 'https://mytishchi.cian.ru/company/121217343' }
    ], 'Агентство работает с 2018 года, документы проверены Циан.'));
    var rows = [];
    if (C.tel) rows.push({ label: 'Позвонить', icon: 'phone', href: C.tel });
    if (C.tg) rows.push({ label: 'Telegram', icon: 'telegram', href: C.tg });
    if (C.wa) rows.push({ label: 'WhatsApp', icon: 'whatsapp', href: C.wa });
    w.appendChild(group('Связь', rows));
    return { node: w, title: 'Настройки', small: 'Настройки', grouped: true };
  }

  // ---------- Игры ----------
  function gameView(id) {
    var g = window.Games[id]();
    return { node: g.el, small: APPS[id].label, dark: true, destroy: g.destroy };
  }

  window.Core = {
    S: S, C: C, APPS: APPS, h: h, nb: nb, slot: slot, tile: tile, art: art, avatar: avatar,
    initials: initials, contactButtons: contactButtons, link: link, store: store, group: group
  };
})();
