// Переключение между экраном выбора, Маком и айфоном. Режим живёт в адресе: #mac / #ios.
(() => {
  const chooser = document.getElementById('chooser');
  const macEl = document.getElementById('mac');
  const iosEl = document.getElementById('ios');

  const isPhone = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600;
  const suggested = isPhone ? 'ios' : 'mac';

  chooser.querySelectorAll('.device-pick').forEach(btn => {
    if (btn.dataset.mode === suggested) {
      btn.classList.add('is-suggested');
      btn.querySelector('.pick-hint').hidden = false;
    }
    btn.addEventListener('click', () => go(btn.dataset.mode));
  });

  let mounted = { mac: false, ios: false };

  function show(mode) {
    chooser.hidden = mode !== 'choose';
    macEl.hidden = mode !== 'mac';
    iosEl.hidden = mode !== 'ios';
    if (mode === 'mac' && !mounted.mac) { Mac.mount(macEl); mounted.mac = true; }
    if (mode === 'ios' && !mounted.ios) { IOS.mount(iosEl, { framed: !isPhone }); mounted.ios = true; }
    if (mode === 'mac') Mac.onShow();
    if (mode === 'ios') IOS.onShow();
  }

  function go(mode) {
    const hash = mode === 'choose' ? '' : '#' + mode;
    if (location.hash !== hash) history.pushState(null, '', hash || location.pathname);
    show(mode);
  }

  window.App = { go };
  addEventListener('popstate', () => show(current()));
  function current() { return location.hash === '#mac' ? 'mac' : location.hash === '#ios' ? 'ios' : 'choose'; }
  show(current());
})();
