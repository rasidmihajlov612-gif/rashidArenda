// Общее для Мака и айфона: помощники и данные, собранные из content.js.
window.Core = (() => {
  const S = window.SITE;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Неразрывный пробел после коротких слов, чтобы предлоги не висели в конце строки
  const nb = s => {
    const re = /(^|[\s ])([а-яёА-ЯЁa-zA-Z0-9—]{1,2})\s/g;
    return String(s).replace(re, '$1$2 ').replace(re, '$1$2 ');
  };
  const h = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const store = (key, val) => {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem('rm-' + key));
      localStorage.setItem('rm-' + key, JSON.stringify(val));
    } catch (e) { return null; }
  };
  const stars = n => '★★★★★'.slice(0, n || 5);
  const initials = s => String(s).trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  // Мягкие цвета для аватаров отзывов
  const TINTS = ['#f6c9a5', '#c9dcf5', '#d6ecc9', '#f3d7a8', '#e6d2ea', '#cfe6d4', '#f1c9b4', '#d9dde8'];

  const C = {
    tel: S.phone ? 'tel:' + S.phone.replace(/[^\d+]/g, '') : '',
    tg: S.telegram ? 'https://t.me/' + S.telegram : '',
    wa: S.whatsapp ? 'https://wa.me/' + S.whatsapp : '',
  };
  const ext = href => /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
  const avatarStyle = () => S.avatar ? `background-image:url('${S.avatar}');background-size:cover;background-position:center` : '';

  // Кнопки связи: первая — главная
  function contactButtons(cls = '') {
    const b = [];
    if (C.tg) b.push([C.tg, 'Написать в Telegram']);
    if (C.wa) b.push([C.wa, 'WhatsApp']);
    if (C.tel) b.push([C.tel, 'Позвонить']);
    return `<div class="cta ${cls}">${b.map((x, i) => `<a class="cta-btn${i ? '' : ' is-main'}" href="${esc(x[0])}"${ext(x[0])}>${esc(x[1])}</a>`).join('')}</div>`;
  }

  // Заметки: «Обо мне», «Как сдаём» и все кейсы
  const notes = [
    { id: 'about', title: 'Обо мне', date: 'Закреплено', paras: [...S.about, ...S.intro] },
    { id: 'steps', title: 'Как сдаём', date: 'Закреплено',
      paras: [...S.steps.map((s, i) => `${i + 1}. ${s[0]}. ${s[1]}`), '0 ₽ платите вы. Комиссию агентству платит наниматель, это прописано в договоре.'] },
    ...S.cases.map((c, i) => ({ id: 'case' + i, title: c.title, date: 'Кейс', paras: String(c.story).split(/\n+/), caseIdx: i })),
  ];

  const reviewByName = name => S.reviews.findIndex(r => r.from === name);

  return { S, C, esc, nb, h, store, stars, initials, TINTS, ext, avatarStyle, contactButtons, notes, reviewByName };
})();
