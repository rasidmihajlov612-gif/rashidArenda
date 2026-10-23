// Иконки приложений в духе iOS/macOS. Нарисованы с нуля, рамка — квадрат 60×60,
// скругление даёт CSS. «§» заменяется уникальным номером, чтобы градиенты не путались.
window.ICONS = {
  notes: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe476"/><stop offset="1" stop-color="#fcc626"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="#fdfdfb"/><rect width="60" height="18" fill="url(#a§)"/><rect y="18" width="60" height="1" fill="#e2b11e" opacity=".6"/>' +
    '<g fill="#bdbdc2"><circle cx="6" cy="24.5" r="1"/><circle cx="11" cy="24.5" r="1"/><circle cx="16" cy="24.5" r="1"/><circle cx="21" cy="24.5" r="1"/><circle cx="26" cy="24.5" r="1"/><circle cx="31" cy="24.5" r="1"/><circle cx="36" cy="24.5" r="1"/><circle cx="41" cy="24.5" r="1"/><circle cx="46" cy="24.5" r="1"/><circle cx="51" cy="24.5" r="1"/><circle cx="56" cy="24.5" r="1"/></g>' +
    '<g stroke="#dadadf" stroke-width="1.2"><path d="M0 34h60M0 44h60M0 54h60"/></g></svg>',

  photos: '<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#fff"/><g transform="translate(30 30)" style="mix-blend-mode:multiply">' +
    ['#f8a51b', '#fbd304', '#a2cd48', '#38bfa7', '#3a9ff0', '#8b6bd9', '#e2468d', '#f1583a'].map(function (c, i) {
      return '<ellipse cx="0" cy="-10.5" rx="6.3" ry="10.5" fill="' + c + '" opacity=".88" transform="rotate(' + (i * 45) + ')"/>';
    }).join('') + '</g></svg>',

  home: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcb52"/><stop offset="1" stop-color="#ff8e0f"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="url(#a§)"/><path d="M30 13.5 11 29.2c-1 .8-.4 2.3.8 2.3H15v14.3c0 1.2 1 2.2 2.2 2.2h9.3V36.6h7V48h9.3c1.2 0 2.2-1 2.2-2.2V31.5h3.2c1.2 0 1.8-1.5.8-2.3z" fill="#fff"/></svg>',

  messages: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#67f37f"/><stop offset="1" stop-color="#0ab529"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="url(#a§)"/><path d="M30 12.5c-11.3 0-20.5 7.5-20.5 16.8 0 5.4 3.1 10.2 7.9 13.3-.3 2.4-1.5 4.6-3.6 6.2 0 0 5.5.4 9.6-3.1 2.1.5 4.3.8 6.6.8 11.3 0 20.5-7.5 20.5-16.8S41.3 12.5 30 12.5z" fill="#fff"/></svg>',

  reminders: '<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#fff"/>' +
    '<circle cx="15" cy="17" r="4.6" fill="#0a84ff"/><circle cx="15" cy="17" r="5.8" fill="none" stroke="#0a84ff" stroke-width="1" opacity=".5"/>' +
    '<circle cx="15" cy="30" r="4.6" fill="#ff3b30"/><circle cx="15" cy="30" r="5.8" fill="none" stroke="#ff3b30" stroke-width="1" opacity=".5"/>' +
    '<circle cx="15" cy="43" r="4.6" fill="#ff9500"/><circle cx="15" cy="43" r="5.8" fill="none" stroke="#ff9500" stroke-width="1" opacity=".5"/>' +
    '<g stroke="#d1d1d6" stroke-width="1.4"><path d="M25 17h28M25 30h28M25 43h28"/></g></svg>',

  maps: '<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#f2efe4"/>' +
    '<path d="M0 0h24l-6 22L0 30z" fill="#bfe2a3"/><path d="M60 34 38 60h22z" fill="#9fd4f8"/>' +
    '<path d="M-2 44 62 18" stroke="#fff" stroke-width="5"/><path d="M28 -2 40 62" stroke="#fff" stroke-width="4"/>' +
    '<path d="M-2 52C20 44 30 38 62 40" stroke="#ffcf3f" stroke-width="5" fill="none"/><path d="M-2 52C20 44 30 38 62 40" stroke="#f3b22a" stroke-width="1" fill="none"/>' +
    '<circle cx="33" cy="27" r="9" fill="#fff"/><circle cx="33" cy="27" r="7.2" fill="#0a84ff"/><path d="m33 21.8 3.6 9-3.6-1.8-3.6 1.8z" fill="#fff"/></svg>',

  phone: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#67f37f"/><stop offset="1" stop-color="#0ab529"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="url(#a§)"/><path d="M22.2 13.4c-1-.6-2.3-.5-3.1.3l-3.3 3.3c-1.7 1.7-2.2 4.2-1.3 6.4 4.4 10.3 11.8 17.7 22.1 22.1 2.2.9 4.7.4 6.4-1.3l3.3-3.3c.8-.8.9-2.1.3-3.1l-3.7-5.6c-.7-1-2-1.4-3.1-.9l-4.3 1.9c-4.1-2.3-7.4-5.6-9.7-9.7l1.9-4.3c.5-1.1.1-2.4-.9-3.1z" fill="#fff"/></svg>',

  settings: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8d8dc"/><stop offset="1" stop-color="#8e8e93"/></linearGradient><linearGradient id="b§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d5d62"/><stop offset="1" stop-color="#2c2c2e"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="url(#a§)"/><g transform="translate(30 30)" fill="url(#b§)">' +
    Array.apply(null, Array(12)).map(function (_, i) { return '<rect x="-2.6" y="-23" width="5.2" height="8" rx="1.4" transform="rotate(' + (i * 30) + ')"/>'; }).join('') +
    '<circle r="17"/></g><circle cx="30" cy="30" r="12.5" fill="#d1d1d6"/><circle cx="30" cy="30" r="6" fill="url(#b§)"/>' +
    '<g stroke="#8e8e93" stroke-width="2.2" stroke-linecap="round"><path d="M30 18.5v6M30 35.5v6M18.5 30h6M35.5 30h6"/></g></svg>',

  safari: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e3e3e6"/></linearGradient><linearGradient id="b§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1ed0ff"/><stop offset="1" stop-color="#1665f0"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="url(#a§)"/><circle cx="30" cy="30" r="22" fill="url(#b§)"/>' +
    '<g stroke="#fff" stroke-width=".9" opacity=".85">' +
    Array.apply(null, Array(36)).map(function (_, i) { return '<path d="M30 9.5v' + (i % 9 ? 2.4 : 4) + '" transform="rotate(' + (i * 10) + ' 30 30)"/>'; }).join('') +
    '</g><g transform="rotate(45 30 30)"><path d="M30 12.5 33.4 30h-6.8z" fill="#ff3b30"/><path d="M30 47.5 26.6 30h6.8z" fill="#fff"/></g></svg>',

  contacts: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6abb6"/><stop offset="1" stop-color="#858a95"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="url(#a§)"/><circle cx="30" cy="24" r="9" fill="#fff"/><path d="M13.5 47c1.6-8.3 8.4-13 16.5-13s14.9 4.7 16.5 13z" fill="#fff"/></svg>',

  telegram: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3cb7f0"/><stop offset="1" stop-color="#1e94d4"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="url(#a§)"/><path d="M12.6 29.1 43 17.3c1.4-.5 2.6.3 2.2 2.5L40 44c-.4 1.7-1.4 2.1-2.8 1.3l-7.7-5.7-3.7 3.6c-.4.4-.8.8-1.6.8l.6-7.9 14.3-12.9c.6-.6-.1-.9-1-.3L20.4 34l-7.6-2.4c-1.6-.5-1.7-1.6.2-2.4z" fill="#fff"/></svg>',

  whatsapp: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ee07a"/><stop offset="1" stop-color="#1fb245"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="url(#a§)"/><path d="M30 11a19 19 0 0 0-16.3 28.7L11 49l9.6-2.6A19 19 0 1 0 30 11z" fill="#fff"/><path d="M23.6 21.2c.6-.3 1.2 0 1.4.5l1.8 4c.2.5.1 1-.2 1.3l-1.3 1.5c1.5 2.7 3.6 4.8 6.3 6.3l1.5-1.3c.4-.3.9-.4 1.3-.2l4 1.8c.5.2.8.8.5 1.4-.8 2.3-3 3.6-5.4 3-6.1-1.4-10.6-5.9-12-12-.6-2.4.9-4.6 2.1-6.3z" fill="#1fb245"/></svg>',

  tetris: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3a63"/><stop offset="1" stop-color="#16152b"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="url(#a§)"/><g rx="2">' +
    '<rect x="12" y="30" width="11" height="11" rx="2" fill="#ffd60a"/><rect x="24" y="30" width="11" height="11" rx="2" fill="#ffd60a"/><rect x="24" y="18" width="11" height="11" rx="2" fill="#ffd60a"/>' +
    '<rect x="36" y="30" width="11" height="11" rx="2" fill="#ff453a"/><rect x="36" y="42" width="11" height="8" rx="2" fill="#64d2ff"/><rect x="12" y="42" width="23" height="8" rx="2" fill="#64d2ff"/></g></svg>',

  snake: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#30d158"/><stop offset="1" stop-color="#1a7f37"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="url(#a§)"/><path d="M14 42h19a7 7 0 0 0 0-14h-7a5.5 5.5 0 0 1 0-11h16" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="44" cy="17" r="2" fill="#1a7f37"/><circle cx="14" cy="42" r="3.4" fill="#ff453a"/></svg>',

  g2048: '<svg viewBox="0 0 60 60"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc145"/><stop offset="1" stop-color="#f28b1e"/></linearGradient></defs>' +
    '<rect width="60" height="60" fill="url(#a§)"/><text x="30" y="37" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Inter,sans-serif" font-weight="800" font-size="19" fill="#fff" letter-spacing="-.5">2048</text></svg>',

  folder: '<svg viewBox="0 0 64 52"><defs><linearGradient id="a§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f8"/><stop offset="1" stop-color="#4aa6ee"/></linearGradient><linearGradient id="b§" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8dbfd"/><stop offset="1" stop-color="#6cbcf7"/></linearGradient></defs>' +
    '<path d="M4 6a3 3 0 0 1 3-3h15.5a3 3 0 0 1 2.3 1.1L28 8h29a3 3 0 0 1 3 3v6H4z" fill="url(#a§)"/><rect x="2" y="12" width="60" height="38" rx="4" fill="url(#b§)"/><rect x="2" y="12" width="60" height="1.5" fill="#fff" opacity=".5"/></svg>',

  doc: '<svg viewBox="0 0 52 64"><path d="M6 2h28l14 14v44a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#fff" stroke="#d1d1d6"/><path d="M34 2v12a2 2 0 0 0 2 2h12" fill="#ececf0" stroke="#d1d1d6"/>' +
    '<g stroke="#b9b9be" stroke-width="1.6"><path d="M11 26h30M11 32h30M11 38h30M11 44h22"/></g></svg>'
};
