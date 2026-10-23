// Лёгкие игры: тетрис, змейка, 2048. Каждая → { el, destroy }.
// Клавиатура уходит последней игре, по которой кликнули или которую открыли.
(function () {
  var h = function (t, c, x) { return Core.h(t, c, x); };
  var active = null;

  document.addEventListener('keydown', function (e) {
    if (!active || !active.el.isConnected || active.el.offsetParent === null) return;
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (active.key(e.key)) e.preventDefault();
  });

  // Каркас: счёт, поле, кнопки, экран «игра окончена»
  function shell(id, title, controls) {
    var el = h('div', 'game game-' + id);
    var head = h('div', 'game-head');
    var sc = h('div', 'game-score'); sc.appendChild(h('small', null, 'счёт')); var scv = h('b', null, '0'); sc.appendChild(scv);
    var bs = h('div', 'game-score'); bs.appendChild(h('small', null, 'рекорд')); var bsv = h('b', null, String(Core.store('best-' + id) || 0)); bs.appendChild(bsv);
    head.appendChild(sc); head.appendChild(bs);
    el.appendChild(head);
    var field = h('div', 'game-field');
    el.appendChild(field);
    var over = h('div', 'game-over');
    over.hidden = true;
    field.appendChild(over);
    var pad = h('div', 'game-pad');
    controls.forEach(function (c) {
      var b = h('button', 'pad-btn' + (c[2] ? ' ' + c[2] : ''), c[0]);
      b.setAttribute('aria-label', c[3] || c[0]);
      var rep = null;
      function fire(e) { e.preventDefault(); g.key(c[1]); }
      b.addEventListener('pointerdown', function (e) {
        fire(e);
        if (c[4]) rep = setTimeout(function loop() { g.key(c[1]); rep = setTimeout(loop, 70); }, 220);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { clearTimeout(rep); }); });
      pad.appendChild(b);
    });
    el.appendChild(pad);
    el.appendChild(h('p', 'game-hint', title));

    var g = {
      el: el, field: field, key: function () { return false; },
      score: function (n) {
        scv.textContent = n;
        if (n > (Core.store('best-' + id) || 0)) { Core.store('best-' + id, n); bsv.textContent = n; }
      },
      gameOver: function (text, again) {
        over.innerHTML = '';
        over.appendChild(h('b', null, text));
        var b = h('button', 'btn btn-main', 'Ещё раз');
        b.addEventListener('click', function () { over.hidden = true; again(); });
        over.appendChild(b);
        over.hidden = false;
      },
      hideOver: function () { over.hidden = true; }
    };
    el.addEventListener('pointerdown', function () { active = g; });
    active = g;
    return g;
  }

  // Свайпы по полю
  function swipes(node, cb) {
    var x0, y0;
    node.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
    node.addEventListener('pointerup', function (e) {
      if (x0 == null) return;
      var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return cb('tap');
      cb(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    });
    node.style.touchAction = 'none';
  }

  function canvas(w, h2, cell) {
    var c = document.createElement('canvas');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = w * cell * dpr; c.height = h2 * cell * dpr;
    c.style.aspectRatio = w + ' / ' + h2;
    var ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    return { c: c, ctx: ctx };
  }
  function rr(ctx, x, y, w, h2, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h2, r); ctx.arcTo(x + w, y + h2, x, y + h2, r);
    ctx.arcTo(x, y + h2, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill();
  }

  // ---------- Тетрис ----------
  function tetris() {
    var W = 10, H = 20, CELL = 24;
    var g = shell('tetris', 'Стрелки — двигать, ↑ — повернуть, пробел — уронить', [
      ['←', 'ArrowLeft', '', 'Влево', true], ['↻', 'ArrowUp', '', 'Повернуть'], ['→', 'ArrowRight', '', 'Вправо', true],
      ['↓', 'ArrowDown', '', 'Вниз', true], ['⤓', ' ', 'wide', 'Уронить']
    ]);
    var cv = canvas(W, H, CELL); g.field.insertBefore(cv.c, g.field.firstChild);
    var ctx = cv.ctx;
    var SH = {
      I: [[1, 1, 1, 1]], O: [[1, 1], [1, 1]], T: [[0, 1, 0], [1, 1, 1]], S: [[0, 1, 1], [1, 1, 0]],
      Z: [[1, 1, 0], [0, 1, 1]], J: [[1, 0, 0], [1, 1, 1]], L: [[0, 0, 1], [1, 1, 1]]
    };
    var COL = { I: '#7fb8d8', O: '#f2c14e', T: '#b48ad6', S: '#8fcf7a', Z: '#e7774b', J: '#5b7fd1', L: '#f09a4a' };
    var board, cur, next, score, lines, timer, acc, last, dead, raf;

    function bag() { var k = Object.keys(SH); return k[Math.floor(Math.random() * k.length)]; }
    function spawn() {
      var t = next || bag(); next = bag();
      var m = SH[t].map(function (r) { return r.slice(); });
      cur = { t: t, m: m, x: Math.floor((W - m[0].length) / 2), y: 0 };
      if (hit(cur.m, cur.x, cur.y)) { dead = true; g.gameOver('Игра окончена · ' + score, reset); }
    }
    function hit(m, x, y) {
      for (var r = 0; r < m.length; r++) for (var c = 0; c < m[r].length; c++) {
        if (!m[r][c]) continue;
        var X = x + c, Y = y + r;
        if (X < 0 || X >= W || Y >= H || (Y >= 0 && board[Y][X])) return true;
      }
      return false;
    }
    function rot(m) { return m[0].map(function (_, c) { return m.map(function (r) { return r[c]; }).reverse(); }); }
    function lock() {
      cur.m.forEach(function (row, r) { row.forEach(function (v, c) { if (v && cur.y + r >= 0) board[cur.y + r][cur.x + c] = cur.t; }); });
      var n = 0;
      for (var y = H - 1; y >= 0; y--) {
        if (board[y].every(Boolean)) { board.splice(y, 1); board.unshift(new Array(W).fill(0)); n++; y++; }
      }
      if (n) { lines += n; score += [0, 100, 300, 500, 800][n]; g.score(score); }
      spawn();
    }
    function drop() { if (!hit(cur.m, cur.x, cur.y + 1)) cur.y++; else lock(); }
    function speed() { return Math.max(90, 650 - Math.floor(lines / 8) * 60); }
    function draw() {
      ctx.fillStyle = '#1f1d2b'; ctx.fillRect(0, 0, W * CELL, H * CELL);
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) rr(ctx, x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 4);
      board.forEach(function (row, y) { row.forEach(function (t, x) { if (t) { ctx.fillStyle = COL[t]; rr(ctx, x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 4); } }); });
      if (!cur || dead) return;
      var gy = cur.y; while (!hit(cur.m, cur.x, gy + 1)) gy++;
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      cur.m.forEach(function (row, r) { row.forEach(function (v, c) { if (v) rr(ctx, (cur.x + c) * CELL + 1, (gy + r) * CELL + 1, CELL - 2, CELL - 2, 4); }); });
      ctx.fillStyle = COL[cur.t];
      cur.m.forEach(function (row, r) { row.forEach(function (v, c) { if (v) rr(ctx, (cur.x + c) * CELL + 1, (cur.y + r) * CELL + 1, CELL - 2, CELL - 2, 4); }); });
    }
    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (!last) last = t;
      acc += t - last; last = t;
      if (!dead && acc > speed()) { acc = 0; drop(); }
      draw();
    }
    function reset() {
      board = []; for (var i = 0; i < H; i++) board.push(new Array(W).fill(0));
      score = 0; lines = 0; acc = 0; dead = false; next = null; g.score(0); g.hideOver(); spawn();
    }
    g.key = function (k) {
      if (dead) return false;
      if (k === 'ArrowLeft' && !hit(cur.m, cur.x - 1, cur.y)) cur.x--;
      else if (k === 'ArrowRight' && !hit(cur.m, cur.x + 1, cur.y)) cur.x++;
      else if (k === 'ArrowDown') { drop(); acc = 0; }
      else if (k === 'ArrowUp') {
        var m = rot(cur.m);
        for (var i = 0, kicks = [0, -1, 1, -2, 2]; i < kicks.length; i++) {
          if (!hit(m, cur.x + kicks[i], cur.y)) { cur.m = m; cur.x += kicks[i]; break; }
        }
      } else if (k === ' ') { while (!hit(cur.m, cur.x, cur.y + 1)) cur.y++; lock(); acc = 0; }
      else return ['ArrowLeft', 'ArrowRight'].indexOf(k) >= 0;
      return true;
    };
    swipes(cv.c, function (d) { g.key({ left: 'ArrowLeft', right: 'ArrowRight', down: ' ', up: 'ArrowUp', tap: 'ArrowUp' }[d]); });
    reset(); raf = requestAnimationFrame(frame);
    return { el: g.el, destroy: function () { cancelAnimationFrame(raf); } };
  }

  // ---------- Змейка ----------
  function snake() {
    var N = 16, CELL = 22;
    var g = shell('snake', 'Стрелки или свайпы по полю', [
      ['←', 'ArrowLeft'], ['↑', 'ArrowUp'], ['↓', 'ArrowDown'], ['→', 'ArrowRight']
    ]);
    var cv = canvas(N, N, CELL); g.field.insertBefore(cv.c, g.field.firstChild);
    var ctx = cv.ctx, body, dir, queue, food, score, dead, timer, started;
    var D = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

    function place() {
      do { food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; }
      while (body.some(function (p) { return p[0] === food[0] && p[1] === food[1]; }));
    }
    function reset() {
      body = [[7, 8], [6, 8], [5, 8]]; dir = [1, 0]; queue = []; score = 0; dead = false; started = false;
      g.score(0); g.hideOver(); place(); draw();
    }
    function step() {
      if (dead || !started) return;
      if (queue.length) dir = queue.shift();
      var hd = [body[0][0] + dir[0], body[0][1] + dir[1]];
      if (hd[0] < 0 || hd[1] < 0 || hd[0] >= N || hd[1] >= N || body.some(function (p) { return p[0] === hd[0] && p[1] === hd[1]; })) {
        dead = true; draw(); g.gameOver('Врезались · ' + score, reset); return;
      }
      body.unshift(hd);
      if (hd[0] === food[0] && hd[1] === food[1]) { score += 10; g.score(score); place(); }
      else body.pop();
      draw();
    }
    function draw() {
      ctx.fillStyle = '#2c4d2a'; ctx.fillRect(0, 0, N * CELL, N * CELL);
      ctx.fillStyle = 'rgba(255,255,255,.035)';
      for (var y = 0; y < N; y++) for (var x = (y % 2); x < N; x += 2) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      ctx.fillStyle = '#f07c5a';
      ctx.beginPath(); ctx.arc(food[0] * CELL + CELL / 2, food[1] * CELL + CELL / 2, CELL / 2 - 3, 0, 7); ctx.fill();
      body.forEach(function (p, i) {
        ctx.fillStyle = i ? '#bfe39a' : '#e3f5c9';
        rr(ctx, p[0] * CELL + 2, p[1] * CELL + 2, CELL - 4, CELL - 4, 6);
      });
      if (!started && !dead) {
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, N * CELL, N * CELL);
        ctx.fillStyle = '#fff'; ctx.font = '500 16px Golos Text, system-ui'; ctx.textAlign = 'center';
        ctx.fillText('Нажмите стрелку, чтобы начать', N * CELL / 2, N * CELL / 2);
      }
    }
    g.key = function (k) {
      var d = D[k]; if (!d || dead) return !!d;
      var lastDir = queue.length ? queue[queue.length - 1] : dir;
      if (d[0] === -lastDir[0] && d[1] === -lastDir[1]) return true;
      if (queue.length < 3) queue.push(d);
      started = true;
      return true;
    };
    swipes(cv.c, function (d) { if (d !== 'tap') g.key({ left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }[d]); });
    reset(); timer = setInterval(step, 120);
    return { el: g.el, destroy: function () { clearInterval(timer); } };
  }

  // ---------- 2048 ----------
  function g2048() {
    var g = shell('g2048', 'Стрелки или свайпы. Соединяйте одинаковые числа', [
      ['←', 'ArrowLeft'], ['↑', 'ArrowUp'], ['↓', 'ArrowDown'], ['→', 'ArrowRight']
    ]);
    var box = h('div', 'board2048'); g.field.insertBefore(box, g.field.firstChild);
    var cells = [], grid, score, won;
    for (var i = 0; i < 16; i++) { var c = h('div', 'c2048'); box.appendChild(c); cells.push(c); }

    function add() {
      var free = []; grid.forEach(function (v, i) { if (!v) free.push(i); });
      if (!free.length) return;
      grid[free[Math.floor(Math.random() * free.length)]] = Math.random() < .9 ? 2 : 4;
    }
    function draw(fresh) {
      grid.forEach(function (v, i) {
        cells[i].textContent = v || '';
        cells[i].dataset.v = v > 2048 ? 'big' : v;
        cells[i].classList.toggle('pop', fresh && fresh.indexOf(i) >= 0);
      });
    }
    function reset() { grid = new Array(16).fill(0); score = 0; won = false; g.score(0); g.hideOver(); add(); add(); draw(); }
    function line(idx) {
      var vals = idx.map(function (i) { return grid[i]; }).filter(Boolean), out = [], merged = [];
      for (var k = 0; k < vals.length; k++) {
        if (vals[k] === vals[k + 1]) { out.push(vals[k] * 2); score += vals[k] * 2; merged.push(out.length - 1); k++; }
        else out.push(vals[k]);
      }
      while (out.length < 4) out.push(0);
      var moved = false, hits = [];
      idx.forEach(function (i, n) { if (grid[i] !== out[n]) moved = true; grid[i] = out[n]; if (merged.indexOf(n) >= 0) hits.push(i); });
      return { moved: moved, hits: hits };
    }
    function canMove() {
      for (var i = 0; i < 16; i++) {
        if (!grid[i]) return true;
        if (i % 4 < 3 && grid[i] === grid[i + 1]) return true;
        if (i < 12 && grid[i] === grid[i + 4]) return true;
      }
      return false;
    }
    g.key = function (k) {
      var lines = [];
      for (var r = 0; r < 4; r++) {
        var row = [0, 1, 2, 3].map(function (c) {
          return k === 'ArrowLeft' ? r * 4 + c : k === 'ArrowRight' ? r * 4 + 3 - c : k === 'ArrowUp' ? c * 4 + r : k === 'ArrowDown' ? (3 - c) * 4 + r : -1;
        });
        if (row[0] < 0) return false;
        lines.push(row);
      }
      var moved = false, hits = [];
      lines.forEach(function (l) { var res = line(l); moved = moved || res.moved; hits = hits.concat(res.hits); });
      if (!moved) return true;
      add(); g.score(score); draw(hits);
      if (!won && grid.indexOf(2048) >= 0) { won = true; g.gameOver('2048! Вы сильнее меня', function () {}); }
      else if (!canMove()) g.gameOver('Ходов больше нет · ' + score, reset);
      return true;
    };
    swipes(box, function (d) { if (d !== 'tap') g.key({ left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' }[d]); });
    reset();
    return { el: g.el, destroy: function () {} };
  }

  window.Games = { tetris: tetris, snake: snake, g2048: g2048 };
})();
