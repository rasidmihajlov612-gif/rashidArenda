// Режим «с телефона»: экран блокировки → рабочий стол → приложения стопкой экранов.
(function () {
  var S = Core.S, h = Core.h, APPS = Core.APPS;
  var root, screen, app, lock, stack = [];

  var STATUS = '<span class="status-time" data-clock></span><span class="status-icons">' +
    '<svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.5" width="3" height="6.5" rx=".8"/><rect x="10" y="3" width="3" height="9" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8"/></svg>' +
    '<svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.3c2.4 0 4.6.9 6.2 2.5l1.2-1.2A10.4 10.4 0 0 0 8.5.6 10.4 10.4 0 0 0 1.1 3.6l1.2 1.2a8.7 8.7 0 0 1 6.2-2.5zm0 3.4c1.5 0 2.8.6 3.8 1.5l1.2-1.2a7 7 0 0 0-10 0l1.2 1.2c1-.9 2.3-1.5 3.8-1.5zm0 3.4c.6 0 1.1.2 1.5.6L8.5 11.2 7 9.7c.4-.4.9-.6 1.5-.6z"/></svg>' +
    '<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.4"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" opacity=".4"/></svg></span>';

  function mount(el, framed) {
    root = el;
    el.classList.toggle('framed', framed);
    var phone = h('div', 'phone');
    screen = h('div', 'screen');
    var status = h('div', 'status'); status.innerHTML = STATUS; status.setAttribute('aria-hidden', 'true');
    screen.appendChild(status);
    screen.appendChild(h('div', 'wallpaper'));
    screen.appendChild(buildHome());
    app = h('section', 'app'); screen.appendChild(app);
    screen.appendChild(buildLock());
    var bar = h('button', 'home-bar'); bar.setAttribute('aria-label', 'На рабочий стол');
    bar.addEventListener('click', function () {
      if (screen.classList.contains('in-app')) closeApp();
      else if (screen.classList.contains('unlocked')) relock();
      else unlock();
    });
    screen.appendChild(bar);
    phone.appendChild(screen);
    el.appendChild(phone);

    if (framed) {
      var sw = h('button', 'switch-device', 'Открыть как на компьютере');
      sw.addEventListener('click', function () { App.go('mac'); });
      el.appendChild(sw);
    }
    document.addEventListener('keydown', function (e) {
      if (root.hidden || e.key !== 'Escape') return;
      if (stack.length > 1) pop(); else if (stack.length) closeApp();
    });
  }

  // ---------- Блокировка ----------
  function buildLock() {
    lock = h('section', 'lock');
    var bg = h('div', 'lock-bg');
    if (S.photo) { bg.style.backgroundImage = 'url("' + S.photo + '")'; lock.classList.add('has-photo'); }
    lock.appendChild(bg);
    var top = h('div', 'lock-top');
    top.appendChild(h('span', 'lock-padlock'));
    top.appendChild(h('p', 'lock-date')); top.appendChild(h('p', 'lock-time'));
    top.lastChild.setAttribute('data-clock', '');
    lock.appendChild(top);
    var notes = h('div', 'lock-notes');
    notes.appendChild(note('messages', 'СООБЩЕНИЯ', S.name, S.hello, function () { openApp('reviews'); }));
    var firstText = S.reviews.filter(function (r) { return r.messages && r.messages.length; })[0];
    if (firstText) notes.appendChild(note('messages', 'СООБЩЕНИЯ', firstText.from, firstText.messages[0], function () { openApp('reviews'); }));
    else if (S.draft) notes.appendChild(Core.slot('Здесь всплывёт кусочек настоящего отзыва', 'slot-note'));
    lock.appendChild(notes);

    var bottom = h('div', 'lock-bottom');
    var torch = h('button', 'lock-round'); torch.setAttribute('aria-label', 'Фонарик');
    torch.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 2.5h8v3.2l-2 3V21a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V8.7l-2-3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12.5" r="1.2" fill="currentColor"/></svg>';
    var cam = h('button', 'lock-round'); cam.setAttribute('aria-label', 'Камера');
    cam.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 7.5h3.2l1.6-2.2h6.4l1.6 2.2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
    [torch, cam].forEach(function (b) {
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      b.addEventListener('click', function (e) { e.stopPropagation(); naughty(b === torch); });
    });
    bottom.appendChild(torch);
    var hint = h('button', 'lock-hint', 'Смахните вверх, чтобы открыть');
    hint.addEventListener('click', function () { unlock(); });
    bottom.appendChild(hint);
    bottom.appendChild(cam);
    lock.appendChild(bottom);

    var y0 = null, dy = 0;
    lock.addEventListener('pointerdown', function (e) { y0 = e.clientY; dy = 0; lock.style.transition = 'none'; });
    window.addEventListener('pointermove', function (e) {
      if (y0 === null) return;
      dy = Math.min(0, e.clientY - y0);
      lock.style.transform = 'translateY(' + dy + 'px)';
    });
    window.addEventListener('pointerup', function () {
      if (y0 === null) return;
      y0 = null; lock.style.transition = ''; lock.style.transform = '';
      if (dy < -60) unlock();
    });
    return lock;
  }
  // «Не балуйтесь»: фонарик мигает, камера трясёт телефон
  function naughty(isTorch) {
    if (isTorch) { screen.classList.add('flash'); setTimeout(function () { screen.classList.remove('flash'); }, 450); }
    else { screen.classList.remove('shake'); void screen.offsetWidth; screen.classList.add('shake'); }
    var old = lock.querySelector('.naughty'); if (old) old.remove();
    var n = note('messages', 'СООБЩЕНИЯ', S.name, isTorch ? 'Просил же не баловаться)' : 'Фото квартир лучше посмотрите в «Кейсах»)', null);
    n.classList.add('naughty');
    lock.querySelector('.lock-notes').insertBefore(n, lock.querySelector('.lock-notes').firstChild);
  }
  function note(appId, appName, title, text, onTap) {
    var n = h('button', 'note');
    n.appendChild(Core.tile(appId, 'note-tile'));
    var body = h('span', 'note-body');
    var head = h('span', 'note-head');
    head.appendChild(h('b', null, title));
    head.appendChild(h('small', null, 'сейчас'));
    body.appendChild(head);
    body.appendChild(h('span', 'note-text', Core.nb(text)));
    n.appendChild(body);
    n.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    n.addEventListener('click', function () { unlock(onTap); });
    return n;
  }
  function unlock(then) {
    screen.classList.add('unlocked');
    if (then) setTimeout(then, 120);
  }
  function relock() { closeApp(true); screen.classList.remove('unlocked'); }

  // ---------- Рабочий стол ----------
  function buildHome() {
    var home = h('section', 'home');
    var page = h('div', 'home-page');

    var widgets = h('div', 'widgets');
    var wc = h('button', 'widget w-contact');
    wc.appendChild(Core.avatar('w-ava'));
    var wt = h('span', 'w-text');
    wt.appendChild(h('b', null, S.name));
    wt.appendChild(h('span', 'w-sub', 'Агент по аренде'));
    wc.appendChild(wt);
    wc.addEventListener('click', function () { openApp('contact', wc); });
    var wz = h('button', 'widget w-zero');
    wz.appendChild(h('small', null, 'КОМИССИЯ'));
    wz.appendChild(h('b', null, '0 ₽'));
    wz.appendChild(h('span', null, 'для собственника'));
    wz.addEventListener('click', function () { openApp('steps', wz); });
    widgets.appendChild(wc); widgets.appendChild(wz);
    page.appendChild(widgets);
    var labels = h('div', 'widget-labels');
    labels.appendChild(h('span', null, 'Контакты')); labels.appendChild(h('span', null, 'Условия'));
    page.appendChild(labels);

    var grid = h('div', 'grid');
    ['about', 'cases', 'objects', 'reviews', 'steps', 'map', 'agency', 'settings'].forEach(function (id) { grid.appendChild(icon(id, true)); });
    grid.appendChild(folder());
    page.appendChild(grid);
    home.appendChild(page);

    var search = h('div', 'home-search');
    search.innerHTML = '<svg viewBox="0 0 16 16" width="13" height="13"><circle cx="6.8" cy="6.8" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m10.6 10.6 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Поиск</span>';
    home.appendChild(search);

    var dock = h('div', 'dock');
    ['contact', S.telegram ? 'telegram' : 'reviews', S.whatsapp ? 'whatsapp' : 'cases', 'tetris']
      .forEach(function (id) { dock.appendChild(icon(id, false)); });
    home.appendChild(dock);
    return home;
  }
  function icon(id, withLabel) {
    var a = APPS[id];
    var node = h(a.href ? 'a' : 'button', 'icon');
    if (a.href) Core.link(node, a.href);
    else node.addEventListener('click', function () { openApp(id, node); });
    node.appendChild(Core.tile(id));
    if (withLabel) node.appendChild(h('span', 'icon-label', a.label));
    else node.setAttribute('aria-label', a.label);
    return node;
  }
  // Папка «Игры»
  function folder() {
    var ids = ['tetris', 'snake', 'g2048'];
    var b = h('button', 'icon');
    var t = h('span', 'tile folder-tile');
    ids.forEach(function (id) { t.appendChild(Core.tile(id, 'mini')); });
    b.appendChild(t);
    b.appendChild(h('span', 'icon-label', 'Игры'));
    b.addEventListener('click', function () {
      var ov = h('div', 'folder-open');
      var box = h('div', 'folder-box');
      box.appendChild(h('p', 'folder-name', 'Игры'));
      var g = h('div', 'folder-grid');
      ids.forEach(function (id) {
        var ic = icon(id, true);
        ic.addEventListener('click', function () { ov.remove(); });
        g.appendChild(ic);
      });
      box.appendChild(g);
      ov.appendChild(box);
      ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
      screen.querySelector('.home').appendChild(ov);
    });
    return b;
  }

  // ---------- Приложения ----------
  var nav = { push: function (v) { push(v, false); } };

  function openApp(id, from) {
    closeApp(true);
    var fo = screen.querySelector('.folder-open'); if (fo) fo.remove();
    if (from) {
      var r = from.getBoundingClientRect(), s = screen.getBoundingClientRect();
      var k = s.width / screen.offsetWidth || 1;
      app.style.transformOrigin = ((r.left + r.width / 2 - s.left) / k) + 'px ' + ((r.top + r.height / 2 - s.top) / k) + 'px';
    } else app.style.transformOrigin = '50% 50%';
    push(APPS[id].view(nav), true);
    requestAnimationFrame(function () { screen.classList.add('in-app'); });
  }
  function destroyAll() { stack.forEach(function (s) { if (s.destroy) s.destroy(); }); stack = []; }
  function closeApp(instant) {
    screen.classList.remove('in-app', 'dark-app');
    var nodes = Array.prototype.slice.call(app.children);
    destroyAll();
    var clear = function () { nodes.forEach(function (n) { n.remove(); }); };
    if (instant) clear(); else setTimeout(clear, 350);
  }
  var CHEV = '<svg viewBox="0 0 12 20" width="12" height="20"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function push(view, root) {
    var prev = stack[stack.length - 1];
    var page = h('div', 'page' + (view.dark ? ' dark' : '') + (view.grouped ? ' grouped' : '') + (view.bare ? ' bare' : ''));
    if (view.tint) page.style.setProperty('--tint', view.tint);
    var bar = h('div', 'bar');
    var back = h('button', 'back');
    back.innerHTML = CHEV;
    back.appendChild(h('span', null, root ? (view.back || 'Домой') : (prev && prev.short || 'Назад')));
    back.addEventListener('click', root ? function () { closeApp(); } : pop);
    bar.appendChild(back);
    if (view.chat) {
      var ch = h('div', 'bar-chat');
      ch.appendChild(view.chat.me ? Core.avatar('ava') : h('span', 'ava', Core.initials(view.chat.name)));
      ch.appendChild(h('span', null, view.chat.name));
      bar.appendChild(ch);
      bar.classList.add('tall');
    } else if (view.small) {
      bar.appendChild(h('span', 'bar-title' + (view.title ? ' hide' : ''), view.small));
    }
    page.appendChild(bar);
    var body = h('div', 'page-body');
    if (view.title) body.appendChild(h('h2', 'big-title' + (view.titleTint ? ' tinted' : ''), view.title));
    body.appendChild(view.node);
    page.appendChild(body);
    if (view.title) body.addEventListener('scroll', function () {
      var on = body.scrollTop > 34;
      bar.classList.toggle('scrolled', on);
      var t = bar.querySelector('.bar-title'); if (t) t.classList.toggle('hide', !on);
    });
    if (view.footer) page.appendChild(view.footer);
    if (!root) page.classList.add('enter');
    app.appendChild(page);
    var short = view.title || view.small || 'Назад';
    stack.push({ page: page, short: short.length > 12 ? 'Назад' : short, destroy: view.destroy, dark: view.dark });
    screen.classList.toggle('dark-app', !!view.dark);
    if (!root) requestAnimationFrame(function () { requestAnimationFrame(function () { page.classList.remove('enter'); }); });
    if (prev) prev.page.classList.add('behind');
  }
  function pop() {
    if (stack.length < 2) return closeApp();
    var top = stack.pop();
    if (top.destroy) top.destroy();
    top.page.classList.add('enter');
    var cur = stack[stack.length - 1];
    cur.page.classList.remove('behind');
    screen.classList.toggle('dark-app', !!cur.dark);
    setTimeout(function () { top.page.remove(); }, 350);
  }

  window.IOS = { mount: mount };
})();
