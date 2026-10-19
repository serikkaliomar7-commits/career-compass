/* Зерде — визуальная логика (задачи по рисунку, как в КТЛ/БИЛ: ~40% логики там — фигуры).
 * 8 типов: матрица Равена, «лишняя» фигура (зеркальная среди повёрнутых), кубики (вид спереди,
 * подсчёт по рисунку), слово в зеркале/в воде, подсчёт квадратов, пути по сетке, фигурки,
 * бегающие по углам многоугольника, наложение прозрачных листов.
 * Варианты-картинки — строки SVG (ключ ответа 's:…'), поэтому разные варианты обязаны
 * различаться и текстом, и на вид; рисунок вопроса — в конце текста, общий для kk и ru.
 * Цвета только через currentColor и CSS-переменные (.vz0/.vz1/.vz2, .vc* в style.css) — тёмная тема. */
(function (root) {
  'use strict';
  var Z = root.Z;
  var H = Z.genHelpers, Q = H.Q;

  function svgEl(w, h, inner, cls) { return '<svg class="svgfig' + (cls ? ' ' + cls : '') + '" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="сурет">' + inner + '</svg>'; }
  function figs(list) { return '<div class="figs">' + list.join('') + '</div>'; }
  function osv(w, h, inner) { return svgEl(w, h, inner, 'osv'); }     // картинка-вариант ответа
  function txt(x, y, s, cls) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle"' + (cls ? ' class="' + cls + '"' : '') + '>' + s + '</text>'; }
  function rect(x, y, w, h, cls) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="' + cls + '"/>'; }
  function poly(pts, cls) { return '<polygon points="' + pts.map(function (p) { return r1(p[0]) + ',' + r1(p[1]); }).join(' ') + '" class="' + cls + '"/>'; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function P(kk, ru, pic, ans, wrong, sk, sr) { return Q(kk + pic, ru + pic, ans, wrong, sk, sr); }
  // Неверные варианты: без повторов и без верного (по ключу k), не больше n.
  function uniq(ans, cands, k, n) {
    var seen = {}, out = [];
    seen[k(ans)] = 1;
    cands.forEach(function (c) { if (c !== null && !seen[k(c)] && out.length < n) { seen[k(c)] = 1; out.push(c); } });
    return out;
  }

  /* ---------- 1. Матрица Равена 3×3 ---------- */
  var KIND = { c: ['шеңбер', 'круг'], s: ['шаршы', 'квадрат'], t: ['үшбұрыш', 'треугольник'], d: ['ромб', 'ромб'] };
  var FILL = [['іші бос', 'пустая'], ['түсті', 'цветная'], ['толық боялған', 'залитая']];
  var FEAT = { k: ['пішіні', 'форма'], n: ['саны', 'количество'], f: ['бояуы', 'заливка'] };
  function shape(k, x, y, R, f) {
    var c = 'vz' + f;
    if (k === 'c') return '<circle cx="' + x + '" cy="' + y + '" r="' + r1(R * 0.9) + '" class="' + c + '"/>';
    if (k === 's') return rect(r1(x - R * 0.8), r1(y - R * 0.8), r1(R * 1.6), r1(R * 1.6), c);
    if (k === 't') return poly([[x, y - R], [x + R, y + R * 0.8], [x - R, y + R * 0.8]], c);
    return poly([[x, y - R], [x + R, y], [x, y + R], [x - R, y]], c);
  }
  var SPOTS = { 1: [[0, 0]], 2: [[-10, 0], [10, 0]], 3: [[0, -9], [-10, 8], [10, 8]] };
  function cell(st, cx, cy) { return SPOTS[st.n].map(function (o) { return shape(st.k, cx + o[0], cy + o[1], 7.5, st.f); }).join(''); }
  function stKey(st) { return st.k + st.n + st.f; }
  function raven(r, lvl) {
    var vals = { k: r.shuffle(['c', 's', 't', 'd']).slice(0, 3), n: r.shuffle([1, 2, 3]), f: r.shuffle([0, 1, 2]) };
    var ord = r.shuffle(['k', 'n', 'f']), rule = {}, dir = r.pick([1, 2]);   // латинский квадрат: (i + j) или (i − j) mod 3
    if (lvl <= 2) { rule[ord[0]] = 'row'; rule[ord[1]] = 'col'; rule[ord[2]] = 'const'; }
    else if (lvl === 3) { rule[ord[0]] = r.pick(['row', 'col']); rule[ord[1]] = 'lat'; rule[ord[2]] = 'const'; }
    else { rule[ord[0]] = 'row'; rule[ord[1]] = 'col'; rule[ord[2]] = 'lat'; }
    function at(i, j) {
      var st = {};
      ord.forEach(function (f) { var R = rule[f], ix = R === 'row' ? i : R === 'col' ? j : R === 'lat' ? (i + dir * j) % 3 : 0; st[f] = vals[f][ix]; });
      return st;
    }
    var out = '', C = 56;
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
      out += rect(4 + j * C, 4 + i * C, C, C, 'vcell');
      out += i === 2 && j === 2 ? txt(4 + j * C + C / 2, 4 + i * C + C / 2 + 8, '?', 'qm') : cell(at(i, j), 4 + j * C + C / 2, 4 + i * C + C / 2);
    }
    var ans = at(2, 2), cands = [];
    // неверные: отличаются от ответа ровно одним признаком (сначала меняющимися)
    ord.filter(function (f) { return rule[f] !== 'const'; }).concat(ord.filter(function (f) { return rule[f] === 'const'; })).forEach(function (f) {
      r.shuffle(vals[f].filter(function (v) { return v !== ans[f]; })).forEach(function (v) { var w = { k: ans.k, n: ans.n, f: ans.f }; w[f] = v; cands.push(w); });
    });
    var wrong = r.shuffle(cands.slice(0, 4));
    function pic(st) { return osv(56, 50, cell(st, 28, 25)); }
    var RK = { row: ['әр жолда бірдей, жолдан жолға өзгереді', 'одинаков в строке, меняется от строки к строке'], col: ['әр бағанда бірдей, бағаннан бағанға өзгереді', 'одинаков в столбце, меняется от столбца к столбцу'],
      lat: ['әр жолда және әр бағанда үш мәннің әрқайсысы бір рет кездеседі', 'в каждой строке и каждом столбце каждое значение встречается ровно один раз'], const: ['өзгермейді', 'не меняется'] };
    function why(L) { return ord.map(function (f) { return FEAT[f][L] + ' ' + RK[rule[f]][L]; }).join('; '); }
    function desc(L) { return (L ? 'нужен рисунок: ' : 'керек сурет: ') + ans.n + ' × ' + KIND[ans.k][L] + ', ' + FILL[ans.f][L]; }
    return P('Заңдылықты анықтап, «?» орнына келетін суретті табыңыз.', 'Найдите закономерность и выберите рисунок, который должен стоять вместо «?».', figs([svgEl(176, 176, out)]),
      pic(ans), wrong.map(pic),
      'Белгілерді жеке қараймыз: ' + why(0) + '. Сондықтан ' + desc(0) + '.', 'Смотрим на признаки по отдельности: ' + why(1) + '. Поэтому ' + desc(1) + '.');
  }

  /* ---------- 2. Лишняя фигура: все повёрнуты, одна — зеркальная ---------- */
  var CHIRAL = [
    [[0, 0], [0, 1], [0, 2], [1, 2]],              // L
    [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]],      // P
    [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]],      // F
    [[1, 0], [2, 0], [0, 1], [1, 1]],              // S
    [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]],      // N
    [[1, 0], [0, 1], [1, 1], [1, 2], [1, 3]],      // Y
    [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [1, 2]]   // гексамино без симметрии
  ];
  function oddOne(r, lvl) {
    var cells = r.pick(lvl === 1 ? CHIRAL.slice(0, 4) : lvl === 4 ? CHIRAL.slice(2) : CHIRAL.slice(0, 6));
    var n = lvl === 1 ? 4 : lvl === 4 ? 6 : 5, odd = r.int(0, n - 1), u = 12;
    var mx = Math.max.apply(null, cells.map(function (c) { return c[0]; })) + 1, my = Math.max.apply(null, cells.map(function (c) { return c[1]; })) + 1;
    var body = cells.map(function (c) { return rect(r1((c[0] - mx / 2) * u), r1((c[1] - my / 2) * u), u, u, 'vz1'); }).join('');
    var rots = r.shuffle([0, 90, 180, 270]).concat(r.shuffle([0, 90, 180, 270])), list = [], k = 0;
    for (var i = 0; i < n; i++) {
      var rot = i === odd ? r.pick([0, 90, 180, 270]) : rots[k++];
      list.push(svgEl(64, 80, '<g transform="translate(32 32) rotate(' + rot + ')' + (i === odd ? ' scale(-1 1)' : '') + '">' + body + '</g>' + txt(32, 76, i + 1)));
    }
    var labs = []; for (i = 0; i < n; i++) labs.push('№' + (i + 1));
    return P('Суреттегі фигуралардың біреуінен басқасы — бір фигураның бұрылған көшірмелері. Қай фигура артық (оны бұру арқылы алуға болмайды)?', 'Все фигуры, кроме одной, — повёрнутые копии одной и той же фигуры. Какая фигура лишняя (её нельзя получить поворотом)?',
      figs(list), labs[odd], r.shuffle(labs.filter(function (x, j) { return j !== odd; })),
      'Фигураларды ойша бұрып, бір-бірінің үстіне қоямыз. №' + (odd + 1) + ' фигура — айнадағы бейне: оны тек аудару (айналы бейнелеу) арқылы алуға болады, бұру жеткіліксіз.',
      'Мысленно поворачиваем фигуры и накладываем друг на друга. Фигура №' + (odd + 1) + ' — зеркальное отражение: её можно получить только переворотом, поворота недостаточно.');
  }

  /* ---------- 3. Кубики: план с числами → вид спереди; рисунок → сколько кубиков ---------- */
  function front(h) { return h[0].map(function (_, c) { return Math.max.apply(null, h.map(function (row) { return row[c]; })); }); }
  function viewPic(cols, top) {
    var u = 13, out = '';
    cols.forEach(function (v, c) { for (var z = 0; z < v; z++) out += rect(4 + c * u, 4 + (top - z - 1) * u, u, u, 'vz0'); });
    return osv(cols.length * u + 8, top * u + 8, out + '<line x1="0" y1="' + (top * u + 4) + '" x2="' + (cols.length * u + 8) + '" y2="' + (top * u + 4) + '"/>');
  }
  function cubesView(r, lvl) {
    var R = lvl === 1 ? 2 : 3, C = lvl === 4 ? 4 : 3, hmax = lvl === 4 ? 4 : 3, h = [], i, c;
    for (i = 0; i < R; i++) { h.push([]); for (c = 0; c < C; c++) h[i].push(r.int(lvl === 1 ? 1 : 0, hmax)); }
    h[R - 1][r.int(0, C - 1)] = r.int(1, hmax);
    var ans = front(h), u = 30, out = '';
    for (i = 0; i < R; i++) for (c = 0; c < C; c++) out += rect(4 + c * u, 4 + i * u, u, u, 'vz0') + txt(4 + c * u + u / 2, 4 + i * u + u / 2 + 6, h[i][c], 'big');
    var W = C * u + 8, Y = R * u + 4;
    out += '<line x1="' + W / 2 + '" y1="' + (Y + 30) + '" x2="' + W / 2 + '" y2="' + (Y + 8) + '" class="vpath"/><path d="M' + W / 2 + ',' + (Y + 4) + ' l-5,9 h10 z" class="arrow"/>';
    var side = h.map(function (row) { return Math.max.apply(null, row); }), bump = ans.slice(), j = r.int(0, C - 1);
    bump[j] = ans[j] < hmax ? ans[j] + 1 : ans[j] - 1;
    var cands = [ans.slice().reverse(), h[R - 1].slice(), h[0].slice(), side.length === C ? side : null, bump];
    for (var t = 0; t < 20; t++) { var x = ans.slice(); x[r.int(0, C - 1)] = r.int(0, hmax); cands.push(x); }
    var wrong = uniq(ans, cands.filter(function (x) { return x && x.some(function (v) { return v > 0; }); }), String, 4);
    var top = Math.max.apply(null, [ans].concat(wrong).map(function (x) { return Math.max.apply(null, x); }));
    return P('Суретте кубиктерден тұрғызылған құрылыстың жоспары: әр шаршыда сол орындағы мұнарадағы кубиктер саны жазылған. Көрсеткі жағынан (алдынан) қарағанда құрылыс қалай көрінеді?',
      'На рисунке план постройки из кубиков: в каждой клетке записано, сколько кубиков в башне на этом месте. Как выглядит постройка, если смотреть со стороны стрелки (спереди)?',
      figs([svgEl(W, Y + 34, out)]), viewPic(ans, top), wrong.map(function (x) { return viewPic(x, top); }),
      'Алдынан қарағанда әр бағанда ең биік мұнара ғана көрінеді: ' + ans.map(function (v, k) { return 'max(' + h.map(function (row) { return row[k]; }).join(', ') + ') = ' + v; }).join('; ') + '.',
      'Спереди в каждом столбце видна только самая высокая башня: ' + ans.map(function (v, k) { return 'max(' + h.map(function (row) { return row[k]; }).join(', ') + ') = ' + v; }).join('; ') + '.');
  }
  // Кубики в косоугольной проекции. Ближе к зрителю — правее и ниже (передний ряд), поэтому высоты
  // не убывают к заднему ряду и к левому краю: каждый кубик видно или он стоит под видимым.
  function cubesCount(r, lvl) {
    var C = lvl <= 2 ? 3 : 4, D = lvl === 1 ? 2 : 3, hmax = lvl === 1 ? 2 : 3, h = [], c, d, z;
    for (c = 0; c < C; c++) h.push([]);
    for (d = D - 1; d >= 0; d--) for (c = 0; c < C; c++) {
      var lim = Math.min(d < D - 1 ? h[c][d + 1] : hmax, c > 0 ? h[c - 1][d] : hmax);
      h[c][d] = c === 0 && d === D - 1 ? hmax : r.int(Math.max(lvl >= 3 ? 0 : 1, lim - 2), lim);   // спад не круче 2 — постройка не «пустеет»
    }
    var s = 24, k = 12, ox = 6, oy = hmax * s + D * k + 6, out = '', total = 0, tops = 0;
    for (d = D - 1; d >= 0; d--) for (c = 0; c < C; c++) {   // пол-сетка: видно, где стоит каждая башня
      var fx = ox + c * s + d * k, fy = oy - d * k;
      out += poly([[fx, fy], [fx + k, fy - k], [fx + s + k, fy - k], [fx + s, fy]], 'vfl');
    }
    for (d = D - 1; d >= 0; d--) for (c = 0; c < C; c++) for (z = 0; z < h[c][d]; z++) {
      var X = ox + c * s + d * k, Y = oy - z * s - d * k;
      out += rect(X, Y - s, s, s, 'vcf') + poly([[X, Y - s], [X + k, Y - s - k], [X + s + k, Y - s - k], [X + s, Y - s]], 'vct') + poly([[X + s, Y], [X + s, Y - s], [X + s + k, Y - s - k], [X + s + k, Y - k]], 'vcr');
    }
    for (c = 0; c < C; c++) for (d = 0; d < D; d++) { total += h[c][d]; if (h[c][d]) tops++; }
    var pic = figs([svgEl(ox + C * s + D * k + 6, oy + 6, out)]), hs = [], rowsTxt = function (L) { var o = []; for (var dd = D - 1; dd >= 0; dd--) o.push(h.map(function (col) { return col[dd]; }).join(', ')); return (L ? 'ряды сзади вперёд (слева направо): ' : 'қатарлар артынан алдына қарай (солдан оңға): ') + o.join(' | '); };
    for (d = D - 1; d >= 0; d--) for (c = 0; c < C; c++) if (h[c][d]) hs.push(h[c][d]); hs = hs.join(' + ');
    if (lvl === 4 || (lvl === 3 && r.chance(0.5))) {   // сколько добавить до прямоугольного блока
      var full = C * D * hmax, need = full - total;
      return P('Құрылыс бірдей кубиктерден жасалған (көрінбейтін бос орын жоқ, әр кубик астындағысына тұр). Оны ' + C + ' × ' + D + ' × ' + hmax + ' тікбұрышты блокқа айналдыру үшін тағы кемінде неше кубик қажет?',
        'Постройка сложена из одинаковых кубиков (пустот нет, каждый кубик стоит на нижнем). Какое наименьшее число кубиков нужно добавить, чтобы получился прямоугольный блок ' + C + ' × ' + D + ' × ' + hmax + '?', pic,
        need, [total, need + 1, need - 1, full - tops], 'Мұнаралар — ' + rowsTxt(0) + '. Құрылыста ' + hs + ' = ' + total + ' кубик. Блокта ' + C + ' · ' + D + ' · ' + hmax + ' = ' + full + '. ' + full + ' − ' + total + ' = ' + need + '.',
        'Башни — ' + rowsTxt(1) + '. В постройке ' + hs + ' = ' + total + ' кубиков. В блоке ' + C + ' · ' + D + ' · ' + hmax + ' = ' + full + '. ' + full + ' − ' + total + ' = ' + need + '.');
    }
    return P('Құрылыс бірдей кубиктерден жасалған (әр кубик астындағысына немесе үстелге тұр). Құрылыста неше кубик бар?', 'Постройка сложена из одинаковых кубиков (каждый стоит на нижнем или на столе). Сколько всего кубиков?', pic,
      total, [tops, total - 1, total + 1, total + 2], 'Әр мұнарадағы кубиктерді санаймыз — ' + rowsTxt(0) + '. Қосамыз: ' + hs + ' = ' + total + '. Көрінбейтін төменгі кубиктерді ұмытпаңыз.',
      'Считаем кубики в каждой башне — ' + rowsTxt(1) + '. Складываем: ' + hs + ' = ' + total + '. Не забываем нижние кубики, которых не видно.');
  }

  /* ---------- 4. Слово в зеркале / в воде ---------- */
  // В каждом слове есть буква, несимметричная слева-направо, и буква, несимметричная сверху-вниз; палиндромов нет.
  var WORDS = ['МЕКТЕП', 'КІТАП', 'ҚАЛАМ', 'ДӘПТЕР', 'САБАҚ', 'ЗЕРДЕ', 'ТЕРЕЗЕ', 'ДОСТЫҚ', 'BANK', 'PARK', 'CAFE', 'PIZZA', 'ZERDE'];
  function wordSvg(w, mx, rev, my) { return osv(w.length * 19 + 12, 32, wordIn(w, mx, rev, my)); }
  function wordIn(w, mx, rev, my) {   // mx — каждую букву отразить слева-направо, rev — обратный порядок, my — отразить сверху-вниз
    var L = w.split(''), sw = 19, out = '';
    if (rev) L.reverse();
    L.forEach(function (ch, i) {
      var cx = 6 + sw * i + sw / 2, tr = [];
      if (mx) tr.push('translate(' + 2 * cx + ' 0) scale(-1 1)');
      if (my) tr.push('translate(0 32) scale(1 -1)');
      out += '<text x="' + cx + '" y="23" text-anchor="middle" class="mw"' + (tr.length ? ' transform="' + tr.join(' ') + '"' : '') + '>' + ch + '</text>';
    });
    return out;
  }
  function mirror(r, lvl) {
    var w = r.pick(WORDS), water = lvl === 4 || (lvl === 3 && r.chance(0.5)), frame = w.length * 19 + 12;
    var pic = figs([svgEl(frame + 8, 40, rect(1, 1, frame + 6, 38, 'vcell') + '<g transform="translate(4 4)">' + wordIn(w, false, false, false) + '</g>')]);
    var M = wordSvg(w, true, true, false), N0 = wordSvg(w, false, false, false), E = wordSvg(w, true, false, false), RV = wordSvg(w, false, true, false), V = wordSvg(w, false, false, true), R180 = wordSvg(w, true, true, true);
    if (water) return P('«' + w + '» сөзі көлдің жағасындағы тақтаға жазылған. Сөздің судағы шағылысы қалай көрінеді?', 'Слово «' + w + '» написано на щите у берега озера. Как выглядит его отражение в воде?', pic,
      V, r.shuffle([M, R180, N0, RV]), 'Су — көлденең айна: жоғары мен төмен ауысады, ал оң мен сол орнында қалады. Әріптердің реті өзгермейді, әр әріп төңкеріледі.',
      'Вода — горизонтальное зеркало: меняются верх и низ, а лево и право остаются. Порядок букв тот же, каждая буква перевёрнута вверх ногами.');
    var glass = r.chance(0.5);
    return P(glass ? 'Дүкеннің әйнегіне көшеден оқылатындай етіп «' + w + '» деп жазылған. Бұл жазу дүкеннің ішінен қалай көрінеді?' : '«' + w + '» сөзі айнаның алдына қойылды. Айнада ол қалай көрінеді?',
      glass ? 'На стекле витрины написано «' + w + '» так, чтобы читалось с улицы. Как эта надпись выглядит изнутри магазина?' : 'Слово «' + w + '» поставили перед зеркалом. Как оно выглядит в зеркале?', pic,
      M, r.shuffle([N0, E, RV, R180]), (glass ? 'Әйнектің арғы жағынан қарау — айнадағыдай: ' : 'Айнада ') + 'оң мен сол ауысады. Сондықтан әріптердің реті керісінше болады және әр әріптің өзі де айналы бейнеленеді; жоғары мен төмен өзгермейді.',
      (glass ? 'Смотреть сквозь стекло с обратной стороны — как в зеркале: ' : 'В зеркале ') + 'меняются лево и право. Поэтому порядок букв обратный и каждая буква тоже отражена; верх и низ не меняются.');
  }

  /* ---------- 5. Сколько квадратов (всех размеров) / прямоугольников ---------- */
  function countIn(set, W, Hh, wantRect) {   // перебор: все квадраты (или прямоугольники) из клеток фигуры
    var n = 0, x, y, a, b, i, j, ok;
    for (y = 0; y < Hh; y++) for (x = 0; x < W; x++) for (a = 1; x + a <= W; a++) for (b = 1; y + b <= Hh; b++) {
      if (!wantRect && a !== b) continue;
      ok = true;
      for (i = 0; i < a && ok; i++) for (j = 0; j < b && ok; j++) if (!set[(y + j) * W + x + i]) ok = false;
      if (ok) n++;
    }
    return n;
  }
  function squares(r, lvl) {
    var W, Hh, rows, set = [], x, y;
    if (lvl === 1) { W = r.int(2, 3); Hh = 3; rows = null; }
    else if (lvl === 2) { W = r.int(3, 4); Hh = r.int(3, 4); rows = null; }
    else {   // «лесенка» (диаграмма Юнга): длины строк сверху вниз не убывают
      Hh = 4; W = lvl === 4 ? 5 : 4; rows = [];
      for (y = 0; y < Hh; y++) rows.push(y === Hh - 1 ? W : r.int(y === 0 ? 1 : rows[y - 1], W));
      if (rows[0] === W) rows[0] = W - 1;
    }
    for (y = 0; y < Hh; y++) for (x = 0; x < W; x++) set.push(!rows || x < rows[y]);
    var cells = set.filter(Boolean).length, wantRect = lvl === 4 && r.chance(0.5);
    var ans = countIn(set, W, Hh, wantRect), sq = countIn(set, W, Hh, false), u = 28, out = '';
    for (y = 0; y < Hh; y++) for (x = 0; x < W; x++) if (set[y * W + x]) out += rect(4 + x * u, 4 + y * u, u, u, 'vz0');
    var big = [], m = 1;
    for (; m <= Math.min(W, Hh); m++) { var cnt = 0; for (y = 0; y + m <= Hh; y++) for (x = 0; x + m <= W; x++) { var ok = true; for (var i = 0; i < m; i++) for (var j = 0; j < m; j++) if (!set[(y + j) * W + x + i]) ok = false; if (ok) cnt++; } if (cnt) big.push(m + '×' + m + ': ' + cnt); }
    var pic = figs([svgEl(W * u + 8, Hh * u + 8, out)]);
    if (wantRect) return P('Суретте неше тіктөртбұрыш бар (шаршыларды да қосып санағанда)?', 'Сколько всего прямоугольников на рисунке (квадраты тоже считаются)?', pic,
      ans, [sq, cells, ans - 1, ans + W], 'Тіктөртбұрышты оның сол жақ жоғарғы және оң жақ төменгі торкөздерімен анықтаймыз да, барлық жағдайды жүйелі санаймыз: ' + ans + '. Оның ішінде шаршылар ' + sq + '.',
      'Прямоугольник задаётся левой верхней и правой нижней клетками; перебираем все варианты систематически: ' + ans + '. Из них квадратов ' + sq + '.');
    return P('Суретте барлығы неше шаршы бар (барлық өлшемдегі)?', 'Сколько всего квадратов на рисунке (всех размеров)?', pic,
      ans, [cells, ans - 1, ans + 1, cells + 1], 'Өлшемі бойынша санаймыз — ' + big.join(', ') + '. Барлығы ' + ans + '.', 'Считаем по размерам — ' + big.join(', ') + '. Всего ' + ans + '.');
  }

  /* ---------- 6. Кратчайшие пути по сетке с перекрытыми участками ---------- */
  function paths(r, lvl) {
    var W = [0, r.int(2, 3), 3, 4, 5][lvl], Hh = [0, 2, 3, 3, 4][lvl], k = [0, r.int(0, 1), 2, 3, 4][lvl];
    var x, y, edges, f, ans, tries = 0;
    function dp(cut) {
      var g = [];
      for (y = 0; y <= Hh; y++) { g.push([]); for (x = 0; x <= W; x++) g[y].push(x + y === 0 ? 1 : (x > 0 && !cut['h' + (x - 1) + ',' + y] ? g[y][x - 1] : 0) + (y > 0 && !cut['v' + x + ',' + (y - 1)] ? g[y - 1][x] : 0)); }
      return g;
    }
    var all = [];
    for (y = 0; y <= Hh; y++) for (x = 0; x < W; x++) all.push('h' + x + ',' + y);
    for (y = 0; y < Hh; y++) for (x = 0; x <= W; x++) all.push('v' + x + ',' + y);
    var free = dp({})[Hh][W];
    do {
      edges = {}; r.shuffle(all).slice(0, k).forEach(function (e) { edges[e] = 1; });
      f = dp(edges); ans = f[Hh][W];
    } while ((ans === 0 || (k && ans === free) || ans < 2) && ++tries < 50);
    var u = 40, out = '', X = function (i) { return 14 + i * u; }, Y = function (j) { return 22 + (Hh - j) * u; };
    all.forEach(function (e) {
      if (edges[e]) return;
      var p = e.slice(1).split(',').map(Number);
      out += e[0] === 'h' ? '<line x1="' + X(p[0]) + '" y1="' + Y(p[1]) + '" x2="' + X(p[0] + 1) + '" y2="' + Y(p[1]) + '" class="vpath"/>' : '<line x1="' + X(p[0]) + '" y1="' + Y(p[1]) + '" x2="' + X(p[0]) + '" y2="' + Y(p[1] + 1) + '" class="vpath"/>';
    });
    out += '<circle cx="' + X(0) + '" cy="' + Y(0) + '" r="5" class="dot"/><circle cx="' + X(W) + '" cy="' + Y(Hh) + '" r="5" class="dot"/>' + txt(X(0) - 4, Y(0) + 4 + 14, 'A', 'big') + txt(X(W) + 4, Y(Hh) - 10, 'B', 'big');
    var row = f[Hh].join(', ');
    return P('Суретте көшелер сызбасы берілген (үзілген жерден өтуге болмайды). Көшелер бойымен тек оңға немесе жоғары жүріп, A нүктесінен B нүктесіне неше түрлі жолмен жетуге болады?',
      'На рисунке схема улиц (где линия прервана — прохода нет). Сколькими способами можно попасть из A в B, двигаясь по улицам только вправо или вверх?', figs([svgEl(W * u + 36, Hh * u + 48, out)]),
      ans, [free, ans + 1, ans - 1, ans * 2], 'Әр қиылысқа жету тәсілдерінің саны = сол жақтағы және төмендегі көршілердегі сандардың қосындысы (жол үзілсе, ол қосылмайды). A-дан бастап толтырамыз; ең жоғарғы қатар: ' + row + '. B-ге ' + ans + ' жол.',
      'Число способов попасть в перекрёсток = сумма чисел у соседей слева и снизу (если участок перекрыт, его не прибавляем). Заполняем от A; верхний ряд: ' + row + '. В B ведут ' + ans + ' путей.');
  }

  /* ---------- 7. Фигурки бегают по многоугольнику ---------- */
  function walk(r, lvl) {
    var n = lvl === 1 ? r.pick([4, 5]) : lvl === 4 ? r.pick([5, 6]) : lvl === 3 ? r.pick([4, 5]) : 4, two = lvl >= 2;
    var a = lvl === 4 ? r.pick([1, 2]) : 1, b = lvl >= 3 ? (lvl === 4 ? (a === 1 ? 2 : 1) : r.pick([1, 2])) : 1;
    var c0 = r.int(0, n - 1), t0 = r.int(0, n - 1), N = lvl === 1 ? r.int(9, 30) : lvl === 4 ? r.int(40, 120) : r.int(15, 60);
    function md(x) { return ((x % n) + n) % n; }
    function st(t) { return [md(c0 + a * (t - 1)), two ? md(t0 - b * (t - 1)) : 0]; }
    var R = 24, cx = 32, cy = 32, start = n === 4 ? -135 : -90, V = [];
    for (var i = 0; i < n; i++) { var an = (start + 360 * i / n) * Math.PI / 180; V.push([cx + R * Math.cos(an), cy + R * Math.sin(an)]); }
    function frame(s) {
      var out = poly(V, 'vz0') + '<circle cx="' + r1(V[s[0]][0]) + '" cy="' + r1(V[s[0]][1]) + '" r="5.5" class="vz2"/>';
      if (two) {   // треугольник — на середине стороны s[1] (между вершинами s[1] и s[1]+1), чуть внутри
        var p = V[s[1]], q = V[(s[1] + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = cx - mx, dy = cy - my, L = Math.sqrt(dx * dx + dy * dy);
        mx += dx / L * 8; my += dy / L * 8;
        out += poly([[mx, my - 6], [mx + 5.5, my + 4], [mx - 5.5, my + 4]], 'vz1');
      }
      return out;
    }
    var shown = [];
    for (i = 1; i <= 3; i++) shown.push(svgEl(64, 82, frame(st(i)) + txt(32, 78, i)));
    var ans = st(N), key = function (s) { return s.join(','); }, cands = [st(N + 1), st(N - 1), [ans[0], st(N + 1)[1]], [st(N + 1)[0], ans[1]], [ans[0], md(t0 + b * (N - 1))], [md(c0 - a * (N - 1)), ans[1]], st(N + 2)];
    for (i = 0; i < n * n; i++) cands.push([i % n, two ? Math.floor(i / n) : 0]);
    var wrong = uniq(ans, cands, key, 4), pic = function (s) { return osv(64, 64, frame(s)); };
    var ka = a === 1 ? 'бір' : 'екі', ra = a === 1 ? 'одну' : 'две', kb = b === 1 ? 'бір' : 'екі', rb = b === 1 ? 'одну' : 'две';
    var sk = 'Шеңбер әр қадамда сағат тілімен ' + ka + ' төбеге жылжиды' + (two ? ', үшбұрыш сағат тіліне қарсы ' + kb + ' қабырғаға' : '') + '. 1-суреттен ' + N + '-суретке дейін ' + (N - 1) + ' қадам. ' + n + ' қадам сайын фигура орнына қайтады, сондықтан ' + (N - 1) + '-ді ' + n + '-ге бөлгендегі қалдықты қараймыз: шеңбер ' + md(a * (N - 1)) + (two ? ', үшбұрыш ' + md(b * (N - 1)) : '') + ' орынға жылжыған.';
    var sr = 'Круг за шаг сдвигается на ' + ra + ' вершин' + (a === 1 ? 'у' : 'ы') + ' по часовой стрелке' + (two ? ', треугольник — на ' + rb + ' сторон' + (b === 1 ? 'у' : 'ы') + ' против часовой' : '') + '. От 1-го рисунка до ' + N + '-го — ' + (N - 1) + ' шагов. Через каждые ' + n + ' шагов фигура возвращается, поэтому смотрим остаток от деления: сдвиг круга — ' + md(a * (N - 1)) + (two ? ', сдвиг треугольника — ' + md(b * (N - 1)) : '') + '.';
    return P('Суретте алғашқы үш қадам көрсетілген: фигуралар әр қадамда бірдей ережемен жылжиды. ' + N + '-қадамдағы сурет қандай болады?', 'На рисунке первые три шага: на каждом шаге фигурки сдвигаются по одному и тому же правилу. Каким будет рисунок на ' + N + '-м шаге?',
      figs(shown), pic(ans), wrong.map(pic), sk, sr);
  }

  /* ---------- 8. Наложение прозрачных листов ---------- */
  function overlay(r, lvl) {
    var s = lvl === 4 ? 4 : 3, nn = s * s, xor = lvl === 4 || (lvl === 3 && r.chance(0.5)), A, B, i, both;
    do {
      A = []; B = [];
      var pa = r.shuffle(range(nn)).slice(0, r.int(3, s + 1)), pb = r.shuffle(range(nn)).slice(0, r.int(3, s + 1));
      for (i = 0; i < nn; i++) { A.push(pa.indexOf(i) >= 0 ? 1 : 0); B.push(pb.indexOf(i) >= 0 ? 1 : 0); }
      both = A.filter(function (v, j) { return v && B[j]; }).length;
    } while (both === 0 || both === Math.min(pa.length, pb.length));
    function range(m) { var o = []; for (var q = 0; q < m; q++) o.push(q); return o; }
    function grid(g, x0, y0, u) { var o = ''; g.forEach(function (v, j) { o += rect(x0 + (j % s) * u, y0 + Math.floor(j / s) * u, u, u, v ? 'vz2' : 'vz0'); }); return o; }
    var OR = A.map(function (v, j) { return v | B[j]; }), XOR = A.map(function (v, j) { return v ^ B[j]; }), AND = A.map(function (v, j) { return v & B[j]; });
    var flipB = B.map(function (_, j) { return B[Math.floor(j / s) * s + (s - 1 - j % s)]; }), ans = xor ? XOR : OR, tog = ans.slice(), t = r.int(0, nn - 1);
    tog[t] = 1 - tog[t];
    var cands = [xor ? OR : XOR, AND, A.map(function (v, j) { return xor ? v ^ flipB[j] : v | flipB[j]; }), tog];
    for (i = 0; i < 20; i++) { var x = ans.slice(), p = r.int(0, nn - 1); x[p] = 1 - x[p]; cands.push(x); }
    var wrong = uniq(ans, cands, function (g) { return g.join(''); }, 4), u = s === 3 ? 18 : 15, gw = s * u;
    var pic = figs([svgEl(2 * gw + 70, gw + 8, grid(A, 4, 4, u) + txt(gw + 18, gw / 2 + 10, '+', 'big') + grid(B, gw + 32, 4, u) + txt(2 * gw + 52, gw / 2 + 10, '= ?', 'big'))]);
    var opic = function (g) { return osv(gw + 8, gw + 8, grid(g, 4, 4, u)); };
    return P('Екі мөлдір парақта торкөздер боялған. Парақтарды бұрмай, дәл үстіне-үстін қойды.' + (xor ? ' Екі парақта да боялған торкөз ақ болып көрінеді (бояулар бірін-бірі «жояды»).' : '') + ' Не көрінеді?',
      'На двух прозрачных листах закрашены клетки. Листы, не поворачивая, наложили друг на друга.' + (xor ? ' Клетка, закрашенная на обоих листах, становится белой (закраски «гасят» друг друга).' : '') + ' Что получится?', pic,
      opic(ans), wrong.map(opic), xor ? 'Тек бір парақта боялған торкөздер боялып қалады, екеуінде де боялған ' + both + ' торкөз ақ болады.' : 'Кемінде бір парақта боялған торкөздің бәрі боялған көрінеді (ортақ ' + both + ' торкөз бір рет саналады).',
      xor ? 'Закрашенными остаются клетки, закрашенные только на одном листе; ' + both + ' общие клетки становятся белыми.' : 'Закрашена каждая клетка, закрашенная хотя бы на одном листе (' + both + ' общие клетки — один раз).');
  }

  var TYPES = [raven, oddOne, cubesView, cubesCount, mirror, squares, paths, walk, overlay];
  Z.gen.l_visual = function (r, lvl) { return r.pick(TYPES)(r, Math.min(lvl || 1, 3)); };
  Z.gen4.l_visual = function (r) { return r.pick(TYPES)(r, 4); };   // три признака в матрице, 6 фигур, 4×4 и выше, два бегуна с разной скоростью, отражение в воде
})(typeof window !== 'undefined' ? window : globalThis);
