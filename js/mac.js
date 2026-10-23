// Режим «с компьютера»: экран входа → рабочий стол с окнами, строкой меню и доком.
(function () {
  var S = Core.S, h = Core.h, APPS = Core.APPS;
  var root, stage, desk, menuApp, pop, wins = [], z = 10, cascade = 0;

  function mount(el) {
    root = el;
    stage = h('div', 'mac');
    stage.appendChild(h('div', 'mac-wall'));
    stage.appendChild(buildMenubar());
    desk = h('div', 'mac-desk');
    stage.appendChild(desk);
    desk.appendChild(buildIcons());
    stage.appendChild(buildDock());
    stage.appendChild(buildLogin());
    el.appendChild(stage);
    fit(); window.addEventListener('resize', fit);
    document.addEventListener('pointerdown', function (e) { if (pop && !pop.contains(e.target) && !e.target.closest('.mb-item')) closeMenu(); });
    document.addEventListener('keydown', function (e) {
      if (root.hidden) return;
      if (e.key === 'Escape') { if (pop) closeMenu(); }
    });
  }

  // Маленький экран: рисуем «большой» рабочий стол и уменьшаем
  function fit() {
    var s = Math.min(1, window.innerWidth / 1024);
    stage.style.width = (window.innerWidth / s) + 'px';
    stage.style.height = (window.innerHeight / s) + 'px';
    stage.style.transform = s < 1 ? 'scale(' + s + ')' : '';
  }

  // ---------- Вход ----------
  function buildLogin() {
    var l = h('section', 'mac-login');
    var top = h('div', 'login-top');
    top.appendChild(h('p', 'login-date'));
    top.appendChild(h('p', 'login-time'));
    top.lastChild.setAttribute('data-clock', '');
    l.appendChild(top);
    var me = h('div', 'login-me');
    me.appendChild(h('p', 'login-hello', Core.nb(S.helloMac)));
    me.appendChild(Core.avatar('login-ava'));
    me.appendChild(h('b', null, S.name));
    var go = h('button', 'login-go');
    go.innerHTML = '<span>Нажмите, чтобы войти</span><i><svg viewBox="0 0 20 20" width="14" height="14"><path d="M4 10h11M10.5 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></i>';
    go.addEventListener('click', login);
    me.appendChild(go);
    l.appendChild(me);
    var sw = h('button', 'login-switch', 'Открыть как на телефоне');
    sw.addEventListener('click', function () { App.go('ios'); });
    l.appendChild(sw);
    l.addEventListener('keydown', function (e) { if (e.key === 'Enter') login(); });
    return l;
  }
  var logged = false;
  function login() {
    stage.classList.add('logged');
    if (logged) return;
    logged = true;
    setTimeout(function () {
      var a = APPS.about, W = stage.offsetWidth, H = stage.offsetHeight - 26 - 80;
      var ww = Math.min(a.w, W - 40), hh = Math.min(a.h, H - 20);
      open('about', { x: Math.round((W - ww) / 2), y: Math.max(10, Math.round((H - hh) / 2)) });
    }, 450);
    setTimeout(toast, 1600);
  }
  function lockScreen() { closeMenu(); stage.classList.remove('logged'); }

  function toast() {
    var t = h('button', 'mac-toast');
    t.appendChild(Core.tile('contact', 'toast-tile'));
    var tx = h('span', 'toast-text');
    var hd = h('span', 'toast-head'); hd.appendChild(h('b', null, S.name)); hd.appendChild(h('small', null, 'сейчас'));
    tx.appendChild(hd);
    tx.appendChild(h('span', null, 'Расскажите про квартиру — отвечу сам'));
    t.appendChild(tx);
    t.addEventListener('click', function () { t.remove(); open('contact'); });
    stage.appendChild(t);
    setTimeout(function () { t.classList.add('gone'); setTimeout(function () { t.remove(); }, 400); }, 9000);
  }

  // ---------- Строка меню ----------
  function buildMenubar() {
    var mb = h('div', 'menubar');
    var logo = h('button', 'mb-item mb-logo');
    var li = h('img'); li.src = 'img/agency.png'; li.alt = 'Меню'; logo.appendChild(li);
    logo.addEventListener('click', function () { menu(logo, [
      ['Об этом владельце', function () { open('contact'); }],
      ['Сайт агентства', function () { window.open(S.agencyUrl, '_blank', 'noopener'); }],
      '-',
      ['Открыть как на телефоне', function () { App.go('ios'); }],
      ['Сменить устройство', function () { App.go('choose'); }],
      '-',
      ['Заблокировать экран', lockScreen]
    ]); });
    mb.appendChild(logo);
    menuApp = h('button', 'mb-item mb-app', 'Рабочий стол');
    menuApp.addEventListener('click', function () {
      var w = top(); menu(menuApp, w ? [['Закрыть окно', function () { close(w); }], ['Свернуть', function () { minimize(w); }]] : [['Окон нет', null]]);
    });
    mb.appendChild(menuApp);
    var mOpen = h('button', 'mb-item', 'Открыть');
    mOpen.addEventListener('click', function () {
      menu(mOpen, ['about', 'cases', 'objects', 'reviews', 'steps', 'map', 'contact', 'settings'].map(function (id) { return [APPS[id].label, function () { open(id); }]; }));
    });
    mb.appendChild(mOpen);
    var mGames = h('button', 'mb-item', 'Игры');
    mGames.addEventListener('click', function () {
      menu(mGames, ['tetris', 'snake', 'g2048'].map(function (id) { return [APPS[id].label, function () { open(id); }]; }));
    });
    mb.appendChild(mGames);
    var mWin = h('button', 'mb-item', 'Окно');
    mWin.addEventListener('click', function () {
      var items = wins.map(function (w) { return [APPS[w.id].label + (w.min ? ' (свёрнуто)' : ''), function () { restore(w); }]; });
      if (wins.length) items.push('-', ['Закрыть все', function () { wins.slice().forEach(close); }]);
      menu(mWin, items.length ? items : [['Окон нет', null]]);
    });
    mb.appendChild(mWin);
    var mHelp = h('button', 'mb-item', 'Связаться');
    mHelp.addEventListener('click', function () {
      var items = [];
      if (Core.C.tel) items.push(['Позвонить ' + S.phone, function () { location.href = Core.C.tel; }]);
      if (Core.C.tg) items.push(['Написать в Telegram', function () { window.open(Core.C.tg, '_blank', 'noopener'); }]);
      if (Core.C.wa) items.push(['Написать в WhatsApp', function () { window.open(Core.C.wa, '_blank', 'noopener'); }]);
      if (S.mapsUrl) items.push(['Офис на Яндекс Картах', function () { window.open(S.mapsUrl, '_blank', 'noopener'); }]);
      items.push('-', ['Карточка контакта', function () { open('contact'); }]);
      menu(mHelp, items);
    });
    mb.appendChild(mHelp);
    mb.appendChild(h('span', 'mb-space'));
    var right = h('span', 'mb-right');
    var ic = h('span', 'mb-icons');
    ic.innerHTML = '<svg width="25" height="12" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="17" height="9" rx="2.4"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" opacity=".5"/></svg>' +
      '<svg width="16" height="12" viewBox="0 0 17 12"><path d="M8.5 2.3c2.4 0 4.6.9 6.2 2.5l1.2-1.2A10.4 10.4 0 0 0 8.5.6 10.4 10.4 0 0 0 1.1 3.6l1.2 1.2a8.7 8.7 0 0 1 6.2-2.5zm0 3.4c1.5 0 2.8.6 3.8 1.5l1.2-1.2a7 7 0 0 0-10 0l1.2 1.2c1-.9 2.3-1.5 3.8-1.5zm0 3.4c.6 0 1.1.2 1.5.6L8.5 11.2 7 9.7c.4-.4.9-.6 1.5-.6z"/></svg>' +
      '<svg width="14" height="14" viewBox="0 0 16 16"><circle cx="6.8" cy="6.8" r="5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m10.6 10.6 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
      '<svg width="15" height="13" viewBox="0 0 16 14"><rect x=".8" y=".8" width="14.4" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12.6" cy="3.3" r="1.5"/><rect x=".8" y="8.2" width="14.4" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="3.4" cy="10.7" r="1.5"/></svg>';
    right.appendChild(ic);
    right.appendChild(h('span', 'mb-date'));
    right.appendChild(h('span', null)); right.lastChild.setAttribute('data-clock', '');
    mb.appendChild(right);
    return mb;
  }
  function menu(btn, items) {
    var was = btn.classList.contains('open');
    closeMenu();
    if (was) return;
    btn.classList.add('open');
    pop = h('div', 'mb-pop');
    items.forEach(function (it) {
      if (it === '-') return pop.appendChild(h('hr'));
      var b = h('button', null, it[0]);
      if (!it[1]) b.disabled = true;
      else b.addEventListener('click', function () { closeMenu(); it[1](); });
      pop.appendChild(b);
    });
    var r = btn.getBoundingClientRect(), s = stage.getBoundingClientRect(), k = s.width / stage.offsetWidth;
    pop.style.left = ((r.left - s.left) / k) + 'px';
    stage.appendChild(pop);
  }
  function closeMenu() {
    if (pop) { pop.remove(); pop = null; }
    stage.querySelectorAll('.mb-item.open').forEach(function (b) { b.classList.remove('open'); });
  }

  // ---------- Иконки на столе ----------
  function buildIcons() {
    var box = h('div', 'desk-icons');
    [['about', 'Обо мне.txt'], ['cases', 'Кейсы'], ['objects', 'Объекты'], ['reviews', 'Отзывы'], ['games', 'Игры']].forEach(function (d) {
      var b = h('button', 'desk-icon');
      b.appendChild(Core.tile(d[0] === 'about' ? 'doc' : 'folder', 'desk-art'));
      b.appendChild(h('span', 'desk-label', d[1]));
      b.addEventListener('click', function () {
        box.querySelectorAll('.sel').forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
      });
      b.addEventListener('dblclick', function () { d[0] === 'games' ? openGames() : open(d[0]); });
      // одинарный тап на сенсорном экране тоже открывает
      b.addEventListener('pointerup', function (e) { if (e.pointerType === 'touch') (d[0] === 'games' ? openGames() : open(d[0])); });
      box.appendChild(b);
    });
    box.appendChild(h('p', 'desk-tip', 'Двойной клик открывает'));
    return box;
  }

  // ---------- Док ----------
  var dockEl;
  function buildDock() {
    dockEl = h('div', 'mac-dock');
    var groups = [
      ['about', 'cases', 'objects', 'reviews', 'steps', 'map', 'contact', 'settings'],
      ['tetris', 'snake', 'g2048'],
      [S.telegram ? 'telegram' : null, S.whatsapp ? 'whatsapp' : null].filter(Boolean)
    ];
    groups.forEach(function (g, gi) {
      if (gi) dockEl.appendChild(h('span', 'dock-sep'));
      g.forEach(function (id) {
        var a = APPS[id];
        var b = h(a.href ? 'a' : 'button', 'dock-item');
        b.dataset.id = id;
        if (a.href) Core.link(b, a.href);
        else b.addEventListener('click', function () { open(id); bounce(b); });
        b.appendChild(Core.tile(id));
        b.appendChild(h('span', 'dock-tip', a.label));
        b.appendChild(h('span', 'dock-dot'));
        dockEl.appendChild(b);
      });
    });
    // Увеличение соседей под курсором
    var items = function () { return dockEl.querySelectorAll('.dock-item'); };
    dockEl.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      items().forEach(function (it) {
        var r = it.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2));
        var k = Math.max(0, 1 - d / 150);
        it.style.setProperty('--m', (1 + .45 * k * k).toFixed(3));
      });
    });
    dockEl.addEventListener('pointerleave', function () { items().forEach(function (it) { it.style.setProperty('--m', 1); }); });
    return dockEl;
  }
  function bounce(b) { b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce'); }
  function syncDock() {
    dockEl.querySelectorAll('.dock-item').forEach(function (b) {
      b.classList.toggle('running', wins.some(function (w) { return w.id === b.dataset.id; }));
    });
  }

  // ---------- Окна ----------
  function top() {
    var v = wins.filter(function (w) { return !w.min; });
    v.sort(function (a, b) { return b.z - a.z; });
    return v[0];
  }
  function focus(w) {
    w.z = ++z; w.el.style.zIndex = w.z;
    wins.forEach(function (x) { x.el.classList.toggle('active', x === w); });
    menuApp.textContent = APPS[w.id].label;
  }
  function open(id, pos) {
    var ex = wins.filter(function (w) { return w.id === id; })[0];
    if (ex) { restore(ex); return ex; }
    var a = APPS[id];
    var W = stage.offsetWidth, H = stage.offsetHeight - 28 - 90;
    var ww = Math.min(a.w || 480, W - 40), hh = Math.min(a.h || 560, H - 20);
    var x = pos ? pos.x : Math.max(20, Math.min(W - ww - 20, 180 + (cascade % 6) * 34));
    var y = pos ? pos.y : Math.max(10, Math.min(H - hh, 40 + (cascade % 6) * 28));
    cascade++;
    var el = h('section', 'win');
    el.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + ww + 'px;height:' + hh + 'px';
    var tb = h('div', 'win-bar');
    var lights = h('span', 'lights');
    var bc = h('button', 'l-close'), bm = h('button', 'l-min'), bz = h('button', 'l-zoom');
    bc.setAttribute('aria-label', 'Закрыть'); bm.setAttribute('aria-label', 'Свернуть'); bz.setAttribute('aria-label', 'Развернуть');
    lights.appendChild(bc); lights.appendChild(bm); lights.appendChild(bz);
    tb.appendChild(lights);
    var back = h('button', 'win-back', '‹'); back.hidden = true; back.setAttribute('aria-label', 'Назад');
    tb.appendChild(back);
    var title = h('span', 'win-title');
    tb.appendChild(title);
    el.appendChild(tb);
    var body = h('div', 'win-body');
    el.appendChild(body);
    desk.appendChild(el);

    var w = { id: id, el: el, body: body, title: title, back: back, stack: [], z: 0 };
    w.nav = { push: function (v) { show(w, v); } };
    wins.push(w);
    show(w, a.view(w.nav));
    focus(w); syncDock();

    el.addEventListener('pointerdown', function () { focus(w); });
    bc.addEventListener('click', function (e) { e.stopPropagation(); close(w); });
    bm.addEventListener('click', function (e) { e.stopPropagation(); minimize(w); });
    bz.addEventListener('click', function (e) { e.stopPropagation(); zoom(w); });
    tb.addEventListener('dblclick', function (e) { if (e.target === tb || e.target === title) zoom(w); });
    back.addEventListener('click', function () { goBack(w); });
    drag(w, tb);
    el.classList.add('opening');
    setTimeout(function () { el.classList.remove('opening'); }, 260);
    return w;
  }
  function show(w, v) {
    w.stack.push(v); render(w);
  }
  function goBack(w) {
    var v = w.stack.pop();
    if (v.destroy) v.destroy();
    v.wrap.remove();
    render(w);
  }
  function render(w) {
    var v = w.stack[w.stack.length - 1];
    w.body.innerHTML = '';
    if (!v.wrap) {
      v.wrap = h('div', 'win-page' + (v.dark ? ' dark' : '') + (v.grouped ? ' grouped' : '') + (v.bare ? ' bare' : ''));
      if (v.tint) v.wrap.style.setProperty('--tint', v.tint);
      var inner = h('div', 'win-scroll');
      if (v.title) inner.appendChild(h('h2', 'big-title' + (v.titleTint ? ' tinted' : ''), v.title));
      inner.appendChild(v.node);
      v.wrap.appendChild(inner);
      if (v.footer) v.wrap.appendChild(v.footer);
    }
    w.body.appendChild(v.wrap);
    w.el.classList.toggle('dark', !!v.dark);
    w.title.textContent = (v.chat && v.chat.name) || v.small || v.title || APPS[w.id].label;
    w.back.hidden = w.stack.length < 2;
  }
  function close(w) {
    w.stack.forEach(function (v) { if (v.destroy) v.destroy(); });
    w.el.classList.add('closing');
    wins = wins.filter(function (x) { return x !== w; });
    setTimeout(function () { w.el.remove(); }, 180);
    syncDock();
    var t = top(); if (t) focus(t); else menuApp.textContent = 'Рабочий стол';
  }
  function minimize(w) {
    w.min = true;
    var d = dockEl.querySelector('[data-id="' + w.id + '"]');
    if (d) {
      var r = d.getBoundingClientRect(), er = w.el.getBoundingClientRect();
      w.el.style.transformOrigin = (r.left + r.width / 2 - er.left) + 'px ' + (r.top - er.top) + 'px';
    }
    w.el.classList.add('minimized');
    var t = top(); if (t) focus(t); else menuApp.textContent = 'Рабочий стол';
  }
  function restore(w) { w.min = false; w.el.classList.remove('minimized'); focus(w); }
  function zoom(w) {
    if (w.saved) { w.el.style.cssText = w.saved; w.saved = null; w.el.style.zIndex = w.z; return; }
    w.saved = w.el.style.cssText;
    w.el.style.left = '8px'; w.el.style.top = '8px';
    w.el.style.width = (stage.offsetWidth - 16) + 'px';
    w.el.style.height = (stage.offsetHeight - 28 - 96) + 'px';
  }
  function drag(w, handle) {
    var sx, sy, ox, oy, k;
    handle.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      var s = stage.getBoundingClientRect(); k = s.width / stage.offsetWidth;
      sx = e.clientX; sy = e.clientY; ox = w.el.offsetLeft; oy = w.el.offsetTop;
      handle.setPointerCapture(e.pointerId);
      w.el.classList.add('dragging');
    });
    handle.addEventListener('pointermove', function (e) {
      if (sx == null) return;
      var x = ox + (e.clientX - sx) / k, y = oy + (e.clientY - sy) / k;
      w.el.style.left = Math.max(-w.el.offsetWidth + 80, Math.min(stage.offsetWidth - 80, x)) + 'px';
      w.el.style.top = Math.max(0, Math.min(stage.offsetHeight - 140, y)) + 'px';
    });
    var end = function () { sx = null; w.el.classList.remove('dragging'); };
    handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
  }

  // Папка «Игры» как окно Finder
  function openGames() {
    var ex = wins.filter(function (w) { return w.id === 'gamesFolder'; })[0];
    if (ex) return restore(ex);
    APPS.gamesFolder = APPS.gamesFolder || {
      label: 'Игры', w: 420, h: 260,
      view: function () {
        var g = h('div', 'finder-grid');
        ['tetris', 'snake', 'g2048'].forEach(function (id) {
          var b = h('button', 'desk-icon');
          b.appendChild(Core.tile(id)); b.appendChild(h('span', 'desk-label', APPS[id].label));
          b.addEventListener('click', function () { open(id); });
          g.appendChild(b);
        });
        return { node: g, small: 'Игры' };
      }
    };
    open('gamesFolder');
  }

  window.Mac = { mount: mount, fit: fit };
})();
