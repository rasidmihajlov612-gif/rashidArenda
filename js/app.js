// Выбор устройства и переключение режимов. Режим живёт в адресе: #mac / #ios.
(function () {
  var chooser = document.getElementById('chooser');
  var macEl = document.getElementById('mac');
  var iosEl = document.getElementById('ios');
  var isPhone = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600;
  var mounted = {};

  chooser.querySelectorAll('.pick').forEach(function (b) {
    if (b.dataset.mode === (isPhone ? 'ios' : 'mac')) b.classList.add('suggested');
    b.addEventListener('click', function () { go(b.dataset.mode); });
  });

  function show(mode) {
    chooser.hidden = mode !== 'choose';
    macEl.hidden = mode !== 'mac';
    iosEl.hidden = mode !== 'ios';
    document.body.dataset.mode = mode;
    if (mode === 'mac' && !mounted.mac) { Mac.mount(macEl); mounted.mac = true; }
    if (mode === 'ios' && !mounted.ios) { IOS.mount(iosEl, !isPhone && window.innerWidth > 600); mounted.ios = true; }
    if (mode === 'mac') Mac.fit();
    tick();
  }
  function current() { return location.hash === '#mac' ? 'mac' : location.hash === '#ios' ? 'ios' : 'choose'; }
  function go(mode) {
    var hash = mode === 'choose' ? '' : '#' + mode;
    if (location.hash !== hash) history.pushState(null, '', hash || location.pathname);
    show(mode);
  }

  // Часы и даты для обоих режимов
  function tick() {
    var d = new Date();
    var t = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    document.querySelectorAll('[data-clock]').forEach(function (n) { n.textContent = t; });
    var long = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    long = long.charAt(0).toUpperCase() + long.slice(1);
    document.querySelectorAll('.lock-date, .login-date').forEach(function (n) { n.textContent = long; });
    var short = d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '');
    document.querySelectorAll('.mb-date').forEach(function (n) { n.textContent = short; });
  }
  setInterval(tick, 10000);

  window.App = { go: go };
  window.addEventListener('popstate', function () { show(current()); });
  show(current());
})();
