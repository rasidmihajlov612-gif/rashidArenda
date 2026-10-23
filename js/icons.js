// Свои иконки «под Apple»: формы узнаваемые, рисунок собственный.
// Каждая иконка: фон (CSS) + SVG-глиф поверх, вписанный в 100×100.

(() => {
  const I = {};

  I.finder = {
    bg: 'linear-gradient(180deg,#6fc3ff 0%,#1f86f0 100%)',
    svg: `<path d="M50 0H100V100H50Z" fill="#e8f2fb"/>
      <path d="M54 0c-6 20-8 34-7 52h9c-2 16 0 32 6 48" fill="none" stroke="#1d2a3a" stroke-width="3.2" stroke-linecap="round"/>
      <rect x="30" y="30" width="5" height="13" rx="2.5" fill="#1d2a3a"/>
      <rect x="68" y="30" width="5" height="13" rx="2.5" fill="#1d2a3a"/>
      <path d="M26 68c14 9 34 10 50 0" fill="none" stroke="#1d2a3a" stroke-width="3.2" stroke-linecap="round"/>`,
  };

  I.safari = {
    bg: '#fff',
    svg: `<defs><linearGradient id="sfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fc8ff"/><stop offset="1" stop-color="#1767e6"/></linearGradient></defs>
      <circle cx="50" cy="50" r="40" fill="url(#sfg)"/>
      <g stroke="#fff" stroke-opacity=".85" stroke-width="1.4">${Array.from({ length: 36 }, (_, i) => {
        const a = (i * 10 * Math.PI) / 180, r1 = i % 3 ? 35 : 32, r2 = 38;
        return `<line x1="${50 + r1 * Math.sin(a)}" y1="${50 - r1 * Math.cos(a)}" x2="${50 + r2 * Math.sin(a)}" y2="${50 - r2 * Math.cos(a)}"/>`;
      }).join('')}</g>
      <path d="M50 50L71 29L56 56Z" fill="#ff3b30"/><path d="M50 50L29 71L44 44Z" fill="#fff"/>
      <path d="M71 29L44 44L29 71L56 56Z" fill="none" stroke="#000" stroke-opacity=".08"/>`,
  };

  I.bots = {
    bg: 'linear-gradient(180deg,#5ad7ff 0%,#1a9bea 100%)',
    svg: `<path d="M24 30h52a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H46l-14 11v-11h-8a8 8 0 0 1-8-8V38a8 8 0 0 1 8-8z" fill="#fff"/>
      <circle cx="38" cy="50" r="4.5" fill="#1a9bea"/><circle cx="62" cy="50" r="4.5" fill="#1a9bea"/>
      <path d="M50 30v-8" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="19" r="4" fill="#fff"/>`,
  };

  I.notes = {
    bg: 'linear-gradient(180deg,#fff 0%,#f4f4f2 100%)',
    svg: `<path d="M0 0H100V27H0Z" fill="#ffd23f"/><path d="M0 27H100" stroke="#e6b923" stroke-width="1.5"/>
      ${[42, 56, 70, 84].map(y => `<path d="M12 ${y}H88" stroke="#d6d6d2" stroke-width="1.5"/>`).join('')}
      <g fill="#c79a12">${Array.from({ length: 9 }, (_, i) => `<circle cx="${14 + i * 9}" cy="34" r="1.2"/>`).join('')}</g>`,
  };

  I.photos = {
    bg: '#fff',
    svg: `<g style="mix-blend-mode:multiply">
      <circle cx="50" cy="34" r="17" fill="#ffb11b" opacity=".92"/>
      <circle cx="66" cy="50" r="17" fill="#ff5a5f" opacity=".85"/>
      <circle cx="50" cy="66" r="17" fill="#8b6cff" opacity=".85"/>
      <circle cx="34" cy="50" r="17" fill="#2fc5a5" opacity=".85"/></g>`,
  };

  I.decks = {
    bg: 'linear-gradient(180deg,#ffb347 0%,#f2731b 100%)',
    svg: `<rect x="18" y="22" width="64" height="42" rx="4" fill="#fff"/>
      <rect x="27" y="44" width="8" height="12" rx="1.5" fill="#f2731b"/><rect x="40" y="36" width="8" height="20" rx="1.5" fill="#f2a23b"/><rect x="53" y="30" width="8" height="26" rx="1.5" fill="#f2731b"/><rect x="66" y="40" width="8" height="16" rx="1.5" fill="#f2a23b"/>
      <path d="M50 64v12M40 82l10-6 10 6" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  };

  I.video = {
    bg: 'linear-gradient(180deg,#3a3a3c 0%,#111 100%)',
    svg: `<circle cx="50" cy="50" r="27" fill="none" stroke="#fff" stroke-width="4"/>
      <path d="M44 38L64 50L44 62Z" fill="#fff"/>`,
  };

  I.quiz = {
    bg: 'linear-gradient(180deg,#7fe07a 0%,#22b14c 100%)',
    svg: `<rect x="22" y="20" width="56" height="62" rx="9" fill="#fff"/>
      <path d="M41 42a9 9 0 1 1 13 8c-3 1.6-4 3-4 6v1" fill="none" stroke="#22b14c" stroke-width="6" stroke-linecap="round"/>
      <circle cx="50" cy="68" r="3.8" fill="#22b14c"/>`,
  };

  I.contacts = {
    bg: 'linear-gradient(180deg,#d9d4cc 0%,#b9b2a7 100%)',
    svg: `<rect x="14" y="16" width="72" height="68" rx="8" fill="#f5f2ec"/>
      <rect x="10" y="26" width="7" height="12" rx="2" fill="#8d867b"/><rect x="10" y="44" width="7" height="12" rx="2" fill="#8d867b"/><rect x="10" y="62" width="7" height="12" rx="2" fill="#8d867b"/>
      <circle cx="52" cy="42" r="11" fill="#9a9184"/><path d="M32 72c2-11 10-17 20-17s18 6 20 17z" fill="#9a9184"/>`,
  };

  I.mac = {
    bg: 'linear-gradient(180deg,#e9edf2 0%,#c9d0d8 100%)',
    svg: `<rect x="20" y="26" width="60" height="38" rx="4" fill="#1d2430"/><rect x="24" y="30" width="52" height="30" rx="1.5" fill="url(#macg)"/>
      <defs><linearGradient id="macg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6c9a5"/><stop offset="1" stop-color="#7d6b9b"/></linearGradient></defs>
      <path d="M12 66h76l-5 7H17z" fill="#8b929c"/>`,
  };

  I.iphone = {
    bg: 'linear-gradient(180deg,#e9edf2 0%,#c9d0d8 100%)',
    svg: `<rect x="34" y="16" width="32" height="68" rx="7" fill="#1d2430"/><rect x="37" y="19" width="26" height="62" rx="5" fill="url(#iphg)"/>
      <defs><linearGradient id="iphg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c9a5"/><stop offset="1" stop-color="#7d6b9b"/></linearGradient></defs>
      <rect x="45" y="22" width="10" height="3" rx="1.5" fill="#1d2430"/>`,
  };

  I.home = {
    bg: 'linear-gradient(180deg,#ffc24d 0%,#ff8a0d 100%)',
    svg: `<path d="M50 20L17 47c-1.6 1.3-.7 3.9 1.4 3.9H24v26a4 4 0 0 0 4 4h15V60h14v21h15a4 4 0 0 0 4-4V51h5.6c2.1 0 3-2.6 1.4-3.9z" fill="#fff"/>`,
  };

  I.messages = {
    bg: 'linear-gradient(180deg,#6ff07f 0%,#0cb92b 100%)',
    svg: `<path d="M50 20c-19 0-34 12.4-34 27.8 0 9 5.2 17 13.2 22-.5 4-2.5 7.6-6 10.3 0 0 9.1.7 16-5.1 3.4.8 7 1.3 10.8 1.3 19 0 34-12.4 34-27.8S69 20 50 20z" fill="#fff"/>`,
  };

  I.phone = {
    bg: 'linear-gradient(180deg,#6ff07f 0%,#0cb92b 100%)',
    svg: `<path d="M36.5 21.5c-1.6-1-3.8-.8-5.2.6l-5.5 5.5c-2.8 2.8-3.6 7-2.1 10.6 7.3 17.2 19.6 29.5 36.8 36.8 3.6 1.5 7.8.7 10.6-2.1l5.5-5.5c1.4-1.4 1.6-3.6.6-5.2l-6.2-9.3c-1.2-1.7-3.4-2.4-5.3-1.5l-7.1 3.1c-6.8-3.8-12.4-9.4-16.2-16.2l3.1-7.1c.9-1.9.2-4.1-1.5-5.3z" fill="#fff"/>`,
  };

  I.telegram = {
    bg: 'linear-gradient(180deg,#3cb8f2 0%,#1c92d2 100%)',
    svg: `<path d="M20 48.5 71.5 28.6c2.4-.9 4.5.6 3.7 4.2l-8.8 41.4c-.6 2.9-2.4 3.6-4.8 2.3l-13-9.6-6.3 6c-.7.7-1.3 1.3-2.6 1.3l.9-13.2 24.1-21.8c1-.9-.2-1.5-1.6-.6L33 57.4l-12.8-4c-2.8-.9-2.8-2.8.6-4.1z" fill="#fff"/>`,
  };

  I.whatsapp = {
    bg: 'linear-gradient(180deg,#61e17d 0%,#1fb246 100%)',
    svg: `<path d="M50 17a32 32 0 0 0-27.6 48.3L18 82l17.2-4.5A32 32 0 1 0 50 17z" fill="#fff"/>
      <path d="M38.8 34c1-.5 2-.1 2.4.8l3 6.8c.3.8.2 1.7-.4 2.3l-2.2 2.5c2.6 4.6 6.1 8.1 10.7 10.7l2.5-2.2c.6-.6 1.5-.7 2.3-.4l6.8 3c.9.4 1.3 1.4.8 2.4-1.4 3.9-5.1 6.1-9.2 5.1-10.4-2.4-18-10-20.4-20.4-1-4.1 1.3-7.8 3.7-10.6z" fill="#1fb246"/>`,
  };

  I.tetris = {
    bg: 'linear-gradient(180deg,#3d3b66 0%,#17162b 100%)',
    svg: `<rect x="20" y="50" width="18" height="18" rx="3" fill="#ffd60a"/><rect x="40" y="50" width="18" height="18" rx="3" fill="#ffd60a"/><rect x="40" y="30" width="18" height="18" rx="3" fill="#ffd60a"/>
      <rect x="60" y="50" width="18" height="18" rx="3" fill="#ff5a5f"/><rect x="60" y="70" width="18" height="12" rx="3" fill="#64d2ff"/><rect x="20" y="70" width="38" height="12" rx="3" fill="#64d2ff"/>`,
  };

  I.snake = {
    bg: 'linear-gradient(180deg,#3fd469 0%,#1d7f39 100%)',
    svg: `<path d="M24 70h32a11 11 0 0 0 0-22H44a9 9 0 0 1 0-18h28" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="73" cy="30" r="2.6" fill="#1d7f39"/><circle cx="24" cy="70" r="5" fill="#ff5a5f"/>`,
  };

  I.g2048 = {
    bg: 'linear-gradient(180deg,#ffc145 0%,#f2891c 100%)',
    svg: `<text x="50" y="61" text-anchor="middle" font-family="-apple-system,Inter,sans-serif" font-weight="800" font-size="30" fill="#fff" letter-spacing="-1">2048</text>`,
  };

  // Предметы без «плитки»: папка, документы, корзина
  const FOLDER = (c1 = '#6cb8f5', c2 = '#3a8fe3') => `<svg viewBox="0 0 100 82" class="glyph-free">
    <path d="M6 12a6 6 0 0 1 6-6h24l8 8h44a6 6 0 0 1 6 6v6H6z" fill="${c2}"/>
    <path d="M6 22h88v50a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" fill="${c1}"/>
    <path d="M6 22h88" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/></svg>`;

  const DOC = (label = 'TXT', color = '#8e8e93') => `<svg viewBox="0 0 80 100" class="glyph-free">
    <path d="M10 4h42l20 20v68a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" fill="#fff" stroke="#d1d1d6" stroke-width="1.5"/>
    <path d="M52 4v16a4 4 0 0 0 4 4h16" fill="#ececf0" stroke="#d1d1d6" stroke-width="1.5"/>
    ${[38, 46, 54, 62].map(y => `<path d="M18 ${y}H60" stroke="#d8d8de" stroke-width="2.4" stroke-linecap="round"/>`).join('')}
    <text x="40" y="84" text-anchor="middle" font-size="12" font-weight="700" fill="${color}" font-family="-apple-system,Inter,sans-serif">${label}</text></svg>`;

  const TRASH = (full = false) => `<svg viewBox="0 0 100 100" class="glyph-free">
    <defs><linearGradient id="trg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9dde2"/><stop offset=".5" stop-color="#f7f8fa"/><stop offset="1" stop-color="#cfd3d9"/></linearGradient></defs>
    ${full ? '<path d="M30 22c6-8 34-8 40 0l-4 6H34z" fill="#fff" stroke="#c9ccd2"/>' : ''}
    <ellipse cx="50" cy="22" rx="30" ry="6" fill="#bfc4cb"/>
    <path d="M20 22l6 66a6 6 0 0 0 6 5h36a6 6 0 0 0 6-5l6-66" fill="url(#trg)" stroke="#b9bec6" stroke-width="1.2"/>
    ${[34, 42, 50, 58, 66].map(x => `<path d="M${x} 32l${(x - 50) * .08} 52" stroke="#aeb3bb" stroke-width="2" stroke-linecap="round"/>`).join('')}
    <ellipse cx="50" cy="22" rx="30" ry="6" fill="none" stroke="#a9aeb6" stroke-width="1.4"/></svg>`;

  // id градиентов уникальны на каждый экземпляр: иначе скрытая копия ломает остальные
  let uid = 0;
  const uniq = svg => { const n = ++uid; return svg.replace(/id="(\w+)"/g, `id="$1_${n}"`).replace(/url\(#(\w+)\)/g, `url(#$1_${n})`); };

  window.ICONS = {
    list: I,
    // плитка приложения
    app(key, extra = '') {
      const i = I[key] || I.finder;
      return `<span class="appicon ${extra}" style="background:${i.bg}">${uniq(`<svg viewBox="0 0 100 100">${i.svg}</svg>`)}</span>`;
    },
    folder: FOLDER,
    doc: DOC,
    trash: full => uniq(TRASH(full)),
  };

  // Мелкие системные значки (SF Symbols-подобные), stroke = currentColor
  const S = (d, vb = '0 0 24 24') => `<svg viewBox="${vb}" class="sym" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  window.SYM = {
    wifi: S('<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.6 15.5a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none"/>'),
    search: S('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>'),
    control: S('<rect x="3" y="5" width="18" height="5.5" rx="2.75"/><rect x="3" y="13.5" width="18" height="5.5" rx="2.75"/><circle cx="16.5" cy="7.75" r="1.4" fill="currentColor"/><circle cx="7.5" cy="16.25" r="1.4" fill="currentColor"/>'),
    battery: `<svg viewBox="0 0 28 14" class="sym battery"><rect x=".75" y=".75" width="23.5" height="12.5" rx="3.6" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="1.2"/><rect x="2.5" y="2.5" width="16.5" height="9" rx="2.1" fill="currentColor"/><path d="M26 4.8v4.4a2.2 2.2 0 0 0 0-4.4z" fill="currentColor" fill-opacity=".45"/></svg>`,
    signal: `<svg viewBox="0 0 18 12" class="sym signal"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>`,
    chevL: S('<path d="M15 4l-8 8 8 8"/>'),
    chevR: S('<path d="M9 4l8 8-8 8"/>'),
    sidebar: S('<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M9 4.5v15"/>'),
    grid: S('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>'),
    list: S('<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".8" fill="currentColor"/><circle cx="4" cy="12" r=".8" fill="currentColor"/><circle cx="4" cy="18" r=".8" fill="currentColor"/>'),
    share: S('<path d="M12 3v12M8 7l4-4 4 4"/><path d="M7 11H5.5v9.5h13V11H17"/>'),
    plus: S('<path d="M12 5v14M5 12h14"/>'),
    tabs: S('<rect x="3.5" y="7" width="13" height="13" rx="2.5"/><path d="M8 4h10a2.5 2.5 0 0 1 2.5 2.5V16"/>'),
    lock: S('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
    reload: S('<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19 4v4h-4"/>'),
    folder: S('<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/>'),
    clock: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    doc: S('<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>'),
    person: S('<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.2-4 4-6 7.5-6s6.3 2 7.5 6"/>'),
    trash: S('<path d="M4 6.5h16M9.5 6.5V4h5v2.5M6.5 6.5l1 14h9l1-14"/>'),
    play: `<svg viewBox="0 0 24 24" class="sym"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" class="sym"><rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/></svg>`,
    send: `<svg viewBox="0 0 24 24" class="sym"><path d="M3 11.5L20.5 4l-4.2 16.5-5-5.3L17 7.5l-8.4 6z" fill="currentColor"/></svg>`,
    mic: S('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
    clip: S('<path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17a1.7 1.7 0 0 1-2.4-2.4l7.6-7.6"/>'),
    msg: S('<path d="M4 5.5h16v11H10l-5 4v-4H4z"/>'),
    phone: S('<path d="M5 3.5h3.5l2 5-2.5 1.5a11 11 0 0 0 6 6l1.5-2.5 5 2V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>'),
    mail: S('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>'),
    flashlight: S('<path d="M8 3h8v4l-2 3v11h-4V10L8 7z"/><circle cx="12" cy="14" r="1" fill="currentColor"/>'),
    camera: S('<path d="M4 8h3.5l1.5-2.5h6L16.5 8H20v11H4z"/><circle cx="12" cy="13.3" r="3.3"/>'),
    ellipsis: `<svg viewBox="0 0 24 24" class="sym"><circle cx="5.5" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="18.5" cy="12" r="1.7" fill="currentColor"/></svg>`,
    book: S('<path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5V20"/>'),
  };
})();
