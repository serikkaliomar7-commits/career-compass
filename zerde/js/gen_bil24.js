/* Зерде — задачи по образцу официального экзамена БИЛ 2024 (онлайн сынақ, см. bil2024/report.txt).
 * Каждый тип — на ступень сложнее оригинала, в том же стиле; у каждого формата id 'b24.*',
 * пробный тест БИЛ 2024 (Z.blueprints.BIL_2024) просит их по id.
 *
 * Пары с общим условием (b24.bolts1/2, towers1/2, quarter_rows1/2, files1/promo): движок вызывает
 * обе задачи с ОДНИМ seed, поэтому данные условия строятся первыми вызовами r() и не зависят
 * от уровня; текст каждой задачи пары целиком повторяет общее условие.
 *
 * Рисунки — SVG кодом, подписи только числами и латинскими буквами (один рисунок для kk и ru).
 * Визуальные ответы (кубик, развёртки, сосуды) проверяются моделью: свёртка развёртки,
 * 3D-ориентация игральной кости, порядок заполнения сосудов, видимость кубиков на рисунке. */
(function (root) {
  'use strict';
  var Z = root.Z;
  var U = Z.util, fmt = U.fmt, fr = U.frac;
  var H = Z.genHelpers, Q = H.Q, expr = H.expr, unit = H.unit;
  var F = Z.formats;

  function add(topic, id, lv, f) { (F[topic] = F[topic] || []).push({ id: id, lv: lv, f: f }); }
  function fx(n, d) { return '<span class="frac"><span>' + n + '</span><span>' + d + '</span></span>'; }
  function gcd(a, b) { return U.gcd(a, b); }
  function lcm(a, b) { return U.lcm(a, b); }
  function r1(x) { return Math.round(x * 10) / 10; }
  function num(n) { return n < 0 ? '−' + fmt(-n) : fmt(n); }
  function pm(n) { return n < 0 ? ' − ' + fmt(-n) : ' + ' + fmt(n); }
  function fh(f) { return U.fracHtml(f, false); }
  function fs(f) { return f.d === 1 ? num(f.n) : num(f.n) + '/' + f.d; }   // для решений: mathFrac рисует дробь
  function mixedH(f) { return U.fracHtml(f, true); }
  function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  function range(n) { var o = []; for (var i = 0; i < n; i++) o.push(i); return o; }
  function rep(x, k) { var o = []; for (var i = 0; i < k; i++) o.push(x); return o; }
  function svgEl(w, h, inner, cls) { return '<svg class="svgfig' + (cls ? ' ' + cls : '') + '" viewBox="0 0 ' + r1(w) + ' ' + r1(h) + '" width="' + r1(w) + '" height="' + r1(h) + '" role="img" aria-label="сурет">' + inner + '</svg>'; }
  function figs(list) { return '<div class="figs">' + list.join('') + '</div>'; }
  function pic(w, h, inner) { return figs([svgEl(w, h, inner)]); }
  function osv(w, h, inner) { return svgEl(w, h, inner, 'osv'); }
  function txt(x, y, s, anchor, cls) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (anchor || 'middle') + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + s + '</text>'; }
  function line(x1, y1, x2, y2, cls, style) { return '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '"' + (cls ? ' class="' + cls + '"' : '') + (style ? ' style="' + style + '"' : '') + '/>'; }
  function rect(x, y, w, h, cls, style) { return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '"' + (cls ? ' class="' + cls + '"' : '') + (style ? ' style="' + style + '"' : '') + '/>'; }
  function poly(pts, cls, style) { return '<polygon points="' + pts.map(function (p) { return r1(p[0]) + ',' + r1(p[1]); }).join(' ') + '"' + (cls ? ' class="' + cls + '"' : '') + (style ? ' style="' + style + '"' : '') + '/>'; }
  function path(d, style) { return '<path d="' + d + '" style="' + (style || 'fill:none;stroke:currentColor;stroke-width:1.4') + '"/>'; }
  function circ(x, y, rr, style) { return '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r1(rr) + '" style="' + style + '"/>'; }
  var S_W = 'fill:var(--card);stroke:currentColor;stroke-width:1.3', S_G = 'fill:var(--muted);stroke:currentColor;stroke-width:1.3',
    S_K = 'fill:currentColor;stroke:currentColor;stroke-width:1.3', S_A = 'fill:var(--accent);stroke:currentColor;stroke-width:1.3',
    S_L = 'fill:none;stroke:currentColor;stroke-width:1.4', S_D = 'fill:none;stroke:var(--muted);stroke-width:1;stroke-dasharray:3 3';
  function P(kk, ru, picture, ans, wrong, sk, sr, extra) { return Q(kk + picture, ru + picture, ans, wrong, sk, sr, extra); }
  function uniq(ans, cands, k, n) {
    var seen = {}, out = [];
    seen[k(ans)] = 1;
    cands.forEach(function (c) { if (c !== null && c !== undefined && !seen[k(c)] && out.length < n) { seen[k(c)] = 1; out.push(c); } });
    return out;
  }
  function ints(list, ans, pos) { var seen = {}; return list.filter(function (x) { var ok = typeof x === 'number' && isFinite(x) && x % 1 === 0 && x !== ans && !seen[x] && (!pos || x > 0); seen[x] = 1; return ok; }); }
  function fracs(list, ans) { var seen = {}; seen[ans.n + '/' + ans.d] = 1; return list.filter(function (f) { if (!f || !isFinite(f.n) || !isFinite(f.d) || f.d === 0) return false; var k = f.n + '/' + f.d; if (seen[k]) return false; seen[k] = 1; return true; }); }
  function kg(g) { return fmt(g / 1000); }
  // русское согласование с числом: pl(3, 'болт', 'болта', 'болтов') → «3 болта»
  function pl(n, one, few, many) { var m = Math.abs(n) % 10, h = Math.abs(n) % 100; return n + ' ' + (h > 10 && h < 20 ? many : m === 1 ? one : m >= 2 && m <= 4 ? few : many); }
  // коэффициент перед буквой: 1 → «», −1 → «−»
  function cf(k) { return k === 1 ? '' : k === -1 ? '−' : num(k); }
  // казахский дательный падеж после числа: 2-ге, 3-ке, 6-ға, 40-қа
  function dat(n) { var a = Math.abs(n), u = a % 10, t = Math.floor(a / 10) % 10, s;
    if (a === 0) s = 'ге'; else if (u) s = { 1: 'ге', 2: 'ге', 3: 'ке', 4: 'ке', 5: 'ке', 6: 'ға', 7: 'ге', 8: 'ге', 9: 'ға' }[u];
    else if (t) s = { 1: 'ға', 2: 'ға', 3: 'ға', 4: 'қа', 5: 'ге', 6: 'қа', 7: 'ке', 8: 'ге', 9: 'ға' }[t]; else s = a % 1000 ? 'ге' : 'ға';
    return num(n) + '-' + s; }
  // Общее условие пары: заголовок, как в экзамене.
  function stemHead(L) { return L ? '<b>Используйте информацию ниже, чтобы ответить на оба вопроса.</b><br>' : '<b>Төмендегі ақпаратты пайдаланып, екі сұраққа жауап беріңіз.</b><br>'; }
  function ask(s) { return '<div class="note"><b>' + s + '</b></div>'; }
  var LT = '&lt;', GT = '&gt;';
  // Варианты-рисунки в условии под номерами, ответ — «№k» (текст условия тогда разный у разных задач).
  function numbered(r, good, bad) {
    var all = r.shuffle([good].concat(bad)), k = all.indexOf(good);
    var pics = all.map(function (sv, i) { return '<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:space-between;gap:4px">' + sv.replace('svgfig osv', 'svgfig') + '<span>№' + (i + 1) + '</span></span>'; });
    return { pic: figs(pics), ans: '№' + (k + 1), wrong: all.map(function (_, i) { return '№' + (i + 1); }).filter(function (_, i) { return i !== k; }) };
  }

  /* ================= 1. Линейное уравнение с дробями (m_eq) ================= */
  function lin(a, b) { return (a === 1 ? '' : a === -1 ? '−' : num(a)) + 'x' + pm(b); }
  add('m_eq', 'b24.frac_eq', [2, 3], function (r, lvl) {
    for (;;) {
      var x = r.int(-6, 9); if (x === 0) continue;
      var ds = r.shuffle([2, 3, 4, 5, 6]).slice(0, 3), a = [r.int(1, 9), r.int(2, 9), r.int(1, 7)], b = [], vals = [], i, bb;
      for (i = 0; i < 3; i++) {
        var cand = [];
        for (bb = -9; bb <= 9; bb++) if (bb && ((a[i] * x + bb) % ds[i] + ds[i]) % ds[i] === 0) cand.push(bb);
        b.push(r.pick(cand)); vals.push((a[i] * x + b[i]) / ds[i]);
      }
      var neg = lvl >= 3 || r.chance(0.4), s2 = neg ? -1 : 1, c = vals[0] + s2 * vals[1] - vals[2];
      var L = lcm(lcm(ds[0], ds[1]), ds[2]), k = ds.map(function (d) { return L / d; });
      var Ai = k[0] * a[0] + s2 * k[1] * a[1] - k[2] * a[2], Bi = c * L + k[2] * b[2] - k[0] * b[0] - s2 * k[1] * b[1];
      if (Ai === 0 || Bi / Ai !== x) continue;
      // ловушка: минус перед дробью меняет знак только у первого члена числителя
      var Bw = c * L + k[2] * b[2] - k[0] * b[0] + s2 * k[1] * b[1], xw = Bw / Ai;
      var e = fx(lin(a[0], b[0]), ds[0]) + (neg ? ' − ' : ' + ') + fx(lin(a[1], b[1]), ds[1]) + ' = ' + (c ? num(c) + ' + ' : '') + fx(lin(a[2], b[2]), ds[2]);
      var kc = function (kv) { return kv === 1 ? '' : kv; };
      var eInt = kc(k[0]) + '(' + lin(a[0], b[0]) + ')' + (neg ? ' − ' : ' + ') + kc(k[1]) + '(' + lin(a[1], b[1]) + ') = ' + (c ? num(c * L) + ' + ' : '') + kc(k[2]) + '(' + lin(a[2], b[2]) + ')';
      // раскрытые скобки: 15(9x − 7) − 10(6x − 3) → 135x − 105 − 60x + 30
      var eOpen = lin(k[0] * a[0], k[0] * b[0]) + (neg ? ' − ' + lin(k[1] * a[1], -k[1] * b[1]) : ' + ' + lin(k[1] * a[1], k[1] * b[1])) + ' = ' + (c ? num(c * L) + ' + ' : '') + lin(k[2] * a[2], k[2] * b[2]);
      return Q('Теңдеуді шешіңіз:' + expr(e), 'Решите уравнение:' + expr(e), x, ints([xw, -x, x + 2, x - 2, x + 1], x).slice(0, 4),
        'Бөлімдердің ортақ еселігі ' + L + '. Екі жағын ' + dat(L) + ' көбейтеміз: ' + eInt + '. Жақшаларды ашамыз' + (neg ? ' (минус алдындағы жақшада барлық таңбалар өзгереді)' : '') + ': ' + eOpen + '. x-ті сол жаққа, сандарды оң жаққа жинаймыз: ' + num(Ai) + 'x = ' + num(Bi) + ', x = ' + num(Bi) + ' : ' + (Ai < 0 ? '(' + num(Ai) + ')' : Ai) + ' = ' + num(x) + '.',
        'Общий знаменатель ' + L + '. Умножаем обе части на ' + L + ': ' + eInt + '. Раскрываем скобки' + (neg ? ' (перед минусом меняются все знаки в скобке)' : '') + ': ' + eOpen + '. Переносим x влево, числа вправо: ' + num(Ai) + 'x = ' + num(Bi) + ', x = ' + num(Bi) + ' : ' + (Ai < 0 ? '(' + num(Ai) + ')' : Ai) + ' = ' + num(x) + '.');
    }
  });

  /* ================= 2. Операции над цифрами двузначного числа (l_op) ================= */
  var DOPS = [
    { s: 'a · b', f: function (a, b) { return a * b; } },
    { s: '(a + b) · b', f: function (a, b) { return (a + b) * b; } },
    { s: '(a + b) · a', f: function (a, b) { return (a + b) * a; } },
    { s: 'a · b + a', f: function (a, b) { return a * b + a; } },
    { s: 'a · b − b', f: function (a, b) { return a * b - b; } },
    { s: 'a² + b', f: function (a, b) { return a * a + b; } },
    { s: 'a + b²', f: function (a, b) { return a + b * b; } }
  ];
  function dop(o, n) { return o.f(Math.floor(n / 10) % 10, n % 10); }
  add('l_op', 'b24.digit_ops', [2, 3], function (r, lvl) {
    var SY = ['⊕', '⊠'];
    for (;;) {
      var ops = r.shuffle(DOPS).slice(0, 2), N = r.int(12, 98), seq = lvl >= 3 ? [1, 0, 1, 0] : [0, 1, 0], v = N, vals = [], ok = true;
      if (N % 10 === 0) continue;
      for (var i = 0; i < seq.length; i++) { if (v < 10 || v > 99) { ok = false; break; } v = dop(ops[seq[i]], v); vals.push(v); }
      if (!ok || v < 2) continue;
      var alt = N, altOk = true; for (i = 0; i < seq.length; i++) alt = dop(ops[1 - seq[i]], alt);
      var names = ['x', 'y', 'z'], cond = SY[seq[0]] + N + ' = x', step = [];
      for (i = 1; i < seq.length - 1; i++) cond += ', ' + SY[seq[i]] + names[i - 1] + ' = ' + names[i];
      var last = SY[seq[seq.length - 1]] + names[seq.length - 2];
      var cur = N;
      for (i = 0; i < seq.length; i++) { step.push(SY[seq[i]] + cur + ' = ' + vals[i]); cur = vals[i]; }
      var defs = '⊕ab = ' + ops[0].s + ',&nbsp;&nbsp; ⊠ab = ' + ops[1].s;
      var wrong = ints([alt, vals[vals.length - 2], dop(ops[1 - seq[seq.length - 1]], vals[vals.length - 2]), v + 1, v * 2, v - 2], v, true);
      return Q('<i>ab</i> — екі таңбалы натурал сан (a — ондықтар, b — бірліктер цифры). Келесі амалдар анықталған:' + expr(defs) + 'Егер ' + cond + ' болса, ' + last + ' мәнін анықтаңыз.',
        '<i>ab</i> — двузначное натуральное число (a — цифра десятков, b — цифра единиц). Определены операции:' + expr(defs) + 'Если ' + cond + ', то определите ' + last + '.',
        v, wrong.slice(0, 4), 'Есептейміз ретімен, әр нәтижені қайтадан екі цифрға бөлеміз: ' + step.join('; ') + '.', 'Считаем по порядку, каждый результат снова разбиваем на две цифры: ' + step.join('; ') + '.');
    }
  });

  /* ================= 3. Какая часть квадрата закрашена (m_frac) ================= */
  add('m_frac', 'b24.shaded_part', [2, 3], function (r, lvl) {
    var S = 180, x0 = 10, y0 = 10, out = '', pieces = [], k3 = lvl >= 3;
    var cols = k3 ? 3 : 2, cw = S / cols;
    for (;;) {
      pieces = []; out = '';
      var p = r.pick(k3 ? [3, 4, 5, 6] : [3, 4, 5, 6, 8]), q = r.int(1, p - 1), sh = r.shuffle(range(p)).slice(0, q);
      for (var i = 0; i < p; i++) pieces.push({ pts: [[x0, y0 + i * S / p], [x0 + cw, y0 + i * S / p], [x0 + cw, y0 + (i + 1) * S / p], [x0, y0 + (i + 1) * S / p]], a: fr(1, cols * p), on: sh.indexOf(i) >= 0 });
      var cx = x0 + cw, mx = cx + cw / 2, my = y0 + S / 2, tri = [[[cx, y0], [cx + cw, y0], [mx, my]], [[cx + cw, y0], [cx + cw, y0 + S], [mx, my]], [[cx + cw, y0 + S], [cx, y0 + S], [mx, my]], [[cx, y0 + S], [cx, y0], [mx, my]]];
      var t = r.int(1, 3), tsh = r.shuffle(range(4)).slice(0, t);
      tri.forEach(function (pt, j) { pieces.push({ pts: pt, a: fr(1, cols * 4), on: tsh.indexOf(j) >= 0 }); });
      if (k3) {   // третья полоса: нижняя половина целиком, верхняя разрезана диагональю на 2 треугольника
        var c3 = x0 + 2 * cw, u = r.int(0, 3), on3 = [u & 1, u & 2, r.chance(0.5)];
        pieces.push({ pts: [[c3, y0], [c3 + cw, y0], [c3, y0 + S / 2]], a: fr(1, 12), on: !!on3[0] });
        pieces.push({ pts: [[c3 + cw, y0], [c3 + cw, y0 + S / 2], [c3, y0 + S / 2]], a: fr(1, 12), on: !!on3[1] });
        pieces.push({ pts: [[c3, y0 + S / 2], [c3 + cw, y0 + S / 2], [c3 + cw, y0 + S], [c3, y0 + S]], a: fr(1, 6), on: !!on3[2] });
      }
      var ans = fr(0, 1), nOn = 0;
      pieces.forEach(function (pc) { if (pc.on) { ans = fr.add(ans, pc.a); nOn++; } });
      if (ans.n === 0 || ans.n >= ans.d) continue;
      var naive = fr(nOn, pieces.length);
      if (naive.n === ans.n && naive.d === ans.d) continue;
      break;
    }
    pieces.forEach(function (pc) { out += poly(pc.pts, null, pc.on ? S_G : S_W); });
    out += rect(x0, y0, S, S, null, 'fill:none;stroke:currentColor;stroke-width:2');
    var part = function (L) {
      var o = [];
      if (L) o.push('левая полоса — ' + p + ' равных частей, закрашено ' + q + ': ' + q + '/' + cols * p, 'треугольник полосы с диагоналями — 1/' + cols * 4 + ' квадрата, закрашено ' + t + ': ' + t + '/' + cols * 4);
      else o.push('сол жақ бөлік ' + p + ' тең бөлікке бөлінген, ' + q + ' бөлігі боялған: ' + q + '/' + cols * p, 'диагональдары бар бөліктің әр үшбұрышы — шаршының 1/' + cols * 4 + ' бөлігі, ' + t + ' үшбұрыш: ' + t + '/' + cols * 4);
      if (k3) o.push(L ? 'в правой полосе малый треугольник — 1/12, нижний прямоугольник — 1/6' : 'оң жақ бөліктегі кіші үшбұрыш — 1/12, төменгі тіктөртбұрыш — 1/6');
      return o.join('; ');
    };
    var wrong = fracs([naive, fr.sub(fr(1, 1), ans), fr(ans.n, ans.d + 1), fr(nOn, pieces.length - nOn), fr.add(ans, fr(1, cols * 4)), fr(ans.n + 1, ans.d)], ans).filter(function (f) { return f.n > 0 && f.n < f.d; });
    var tk = k3 ? 'Шаршы үш тең тік жолаққа бөлінген: біріншісі ' + p + ' тең бөлікке, екіншісі диагональдарымен 4 үшбұрышқа, үшіншісінің жоғарғы жартысы диагональмен екі үшбұрышқа бөлінген. ' : 'Шаршы алдымен екі тең жартыға бөлінеді. Сол жақ жартысы ' + p + ' тең бөлікке, ал оң жақ жартысы диагональдарымен 4 бөлікке бөлінген. ';
    var tr = k3 ? 'Квадрат разделён на три равные вертикальные полосы: первая — на ' + p + ' равных частей, вторая — диагоналями на 4 треугольника, у третьей верхняя половина разрезана диагональю на два треугольника. ' : 'Квадрат сначала делится на две равные половины. Левая половина разделена на ' + p + ' равных частей, а правая — диагоналями на 4 части. ';
    return P(tk + 'Шаршының қандай бөлігі боялған?', tr + 'Какая часть квадрата закрашена?', pic(S + 20, S + 20, out), ans, wrong.slice(0, 4),
      'Әр бөліктің ауданын бүкіл шаршымен салыстырамыз (бөліктер тең емес!): ' + part(0) + '. Қосындысы ' + fs(ans) + '.',
      'Сравниваем каждую часть со всем квадратом (части не равны!): ' + part(1) + '. Сумма ' + fs(ans) + '.');
  });

  /* ================= 4. Поворот круга с секторами (l_visual) ================= */
  function sectorPic(arr, big) {
    var n = arr.length, R = big ? 44 : 30, c = R + 4, o = '', st = [S_W, S_G, S_K, S_A];
    for (var i = 0; i < n; i++) {
      var a1 = (i / n) * 2 * Math.PI, a2 = ((i + 1) / n) * 2 * Math.PI;
      o += path('M' + c + ',' + c + ' L' + r1(c + R * Math.sin(a1)) + ',' + r1(c - R * Math.cos(a1)) + ' A' + R + ',' + R + ' 0 0 1 ' + r1(c + R * Math.sin(a2)) + ',' + r1(c - R * Math.cos(a2)) + ' Z', st[arr[i]]);
    }
    return { s: o, w: 2 * c };
  }
  function rotArr(arr, steps) { var n = arr.length, o = []; for (var i = 0; i < n; i++) o[((i + steps) % n + n) % n] = arr[i]; return o; }
  function mirArr(arr) { var n = arr.length; return arr.map(function (_, i) { return arr[n - 1 - i]; }); }
  add('l_visual', 'b24.rotate_sectors', [2, 3, 4], function (r, lvl) {
    var n = lvl === 2 ? 8 : 12, q = n / 4, colors = lvl === 2 ? 2 : 3, arr, i, ok;
    do {
      arr = []; for (i = 0; i < n; i++) arr.push(r.int(0, colors - 1));
      if (colors === 3) arr = arr.map(function (v) { return v === 2 ? 2 : v; });
      var imgs = {}; ok = true;
      for (var k = 0; k < n; k++) { var a1 = rotArr(arr, k).join(''), a2 = mirArr(rotArr(arr, k)).join(''); if (imgs[a1] || imgs[a2] || a1 === a2) ok = false; imgs[a1] = imgs[a2] = 1; }
    } while (!ok);
    var deg = r.pick([90, 180, 270]), cw = r.chance(0.5), steps = (cw ? 1 : -1) * deg / 90 * q, mir = lvl === 4;
    var ans = rotArr(arr, steps);
    if (mir) ans = mirArr(ans);
    var cands = [rotArr(arr, -steps), mirArr(rotArr(arr, steps)), rotArr(arr, steps + q), rotArr(arr, steps - q), arr, mirArr(arr), rotArr(mirArr(arr), steps)];
    if (mir) cands.unshift(rotArr(arr, steps), mirArr(rotArr(arr, -steps)));
    var wrong = uniq(ans, cands, function (a) { return a.join(''); }, 3);
    var big = sectorPic(arr, true), W = big.w;
    var arc = path('M' + (W / 2 + 14) + ',' + 6 + ' A40,40 0 0 1 ' + (W - 4) + ',' + (W / 2 - 14), 'fill:none;stroke:currentColor;stroke-width:1.4') +
      (cw ? poly([[W - 4, W / 2 - 8], [W - 9, W / 2 - 17], [W + 1, W / 2 - 16]], null, S_K) : poly([[W / 2 + 8, 6], [W / 2 + 17, 1], [W / 2 + 17, 11]], null, S_K));
    var picQ = pic(W + 120, W + 8, '<g transform="translate(0 4)">' + big.s + arc + '</g>' + txt(W + 4, 14, deg + '°', 'start') +
      line(W + 30, W / 2 + 4, W + 62, W / 2 + 4) + poly([[W + 66, W / 2 + 4], [W + 58, W / 2], [W + 58, W / 2 + 8]], null, S_K) + txt(W + 92, W / 2 + 12, '?', 'middle', 'big'));
    var op = function (a) { var s = sectorPic(a, false); return osv(s.w, s.w, s.s); };
    var dk = cw ? 'сағат тілінің бағытымен' : 'сағат тіліне қарсы', dr = cw ? 'по часовой стрелке' : 'против часовой стрелки';
    var mk = mir ? ', содан кейін тік осьтен айналы бейнеледі (сол мен оң ауысады)' : '', mr = mir ? ', а затем отразили относительно вертикальной оси (лево и право меняются местами)' : '';
    return P('Дөңгелекті ' + dk + ' ' + deg + '°-қа бұрды' + mk + '. Сұрақ белгісінің орнына сәйкес келетін нұсқаны анықтаңыз.',
      'Круг повернули ' + dr + ' на ' + deg + '°' + mr + '. Определите фигуру, соответствующую вопросительному знаку.', picQ, op(ans), wrong.map(op),
      deg + '° — ' + (deg / 90) + ' ширек айналым, әр сектор ' + dk + ' ' + (deg / 90 * q) + ' секторға жылжиды' + (mir ? '; соңынан суретті айнадағыдай аударамыз' : '') + '. Бір боялған сектордың жаңа орнын тауып, қалғандарын тексереміз. ' + (deg === 270 ? 'Сағат тілімен 270° = сағат тіліне қарсы 90°.' : ''),
      deg + '° — это ' + (deg / 90) + ' четверти оборота, каждый сектор сдвигается ' + dr + ' на ' + pl(deg / 90 * q, 'сектор', 'сектора', 'секторов') + (mir ? '; затем отражаем картинку как в зеркале' : '') + '. Находим новое место одного закрашенного сектора и проверяем остальные. ' + (deg === 270 ? '270° по часовой = 90° против часовой.' : ''));
  });

  /* ================= 5. Верная цепочка неравенств (m_frac) ================= */
  add('m_frac', 'b24.frac_chain', [1, 2], function (r, lvl) {
    var k = lvl === 1 ? 3 : 4, items, i;
    for (;;) {
      items = [];
      for (i = 0; i < k; i++) {
        var mixed = i === 0 || (lvl >= 2 && i === 1), d = r.int(mixed ? 2 : 3, 9), n;
        if (mixed) { n = r.int(1, d - 1); if (gcd(n, d) > 1) { i--; continue; } items.push({ v: fr(d + n, d), h: '1' + fx(n, d), num: d + n }); }
        else { n = r.int(d + 1, 2 * d - 1); if (gcd(n, d) > 1) { i--; continue; } items.push({ v: fr(n, d), h: fx(n, d), num: n }); }
      }
      var keys = items.map(function (it) { return it.v.n / it.v.d; });
      if (keys.some(function (x, j) { return keys.indexOf(x) !== j; })) continue;
      var sorted = range(k).sort(function (a, b) { return keys[a] - keys[b]; }), byNum = range(k).sort(function (a, b) { return items[a].num - items[b].num || keys[b] - keys[a]; });
      if (sorted.join() === byNum.join()) continue;
      break;
    }
    var desc = lvl >= 2 && r.chance(0.5), sg = desc ? ' ' + GT + ' ' : ' ' + LT + ' ';
    function chain(ord) { if (desc) ord = ord.slice().reverse(); return ord.map(function (j) { return items[j].h; }).join(sg); }
    var ans = chain(sorted), cands = [chain(byNum), chain(sorted.slice().reverse())];
    for (i = 0; i < 30; i++) cands.push(chain(r.shuffle(range(k))));
    var wrong = uniq(ans, cands, String, 3);
    var dec = function (L) { return items.map(function (it) { return fs(it.v) + ' ≈ ' + fmt(Math.round(it.v.n / it.v.d * 1000) / 1000); }).join('; '); };
    var listH = r.shuffle(items).map(function (it) { return it.h; }).join(';&nbsp;&nbsp; ');
    return Q('Берілген сандар:' + expr(listH) + 'Дұрыс нұсқаны анықтаңыз.', 'Даны числа:' + expr(listH) + 'Определите правильный вариант.', ans, wrong,
      'Әр санды 1-ден асатын бөлігімен салыстырамыз (немесе ондық бөлшекке айналдырамыз): ' + dec(0) + '. Алымдармен салыстыру қате.',
      'Сравниваем, на сколько каждое число больше 1 (или переводим в десятичные): ' + dec(1) + '. Сравнивать по числителям нельзя.');
  });

  /* ================= 6. Болты и гайки — пара с общим условием (m_ratio) ================= */
  function boltsData(r) {
    for (;;) {
      var pq = r.pick([[5, 3], [7, 4], [4, 3], [5, 2], [7, 3], [8, 5], [7, 5]]), p = pq[0], q = pq[1], t = r.int(2, 6);
      var n1 = r.int(2, 9) * 5, n2 = r.int(3, 12) * 5, B = r.int(15, 50) * 10, kk = q * r.int(1, 3);
      if (n2 * q === n1 * p) continue;
      var m1 = B + n1 * p * t, m2 = B + n2 * q * t;
      if (m1 === m2 || m1 % 10 || m2 % 10) continue;
      return { p: p, q: q, t: t, n1: n1, n2: n2, B: B, m1: m1, m2: m2, k: kk };
    }
  }
  function boltsStem(d, L) {
    return stemHead(L) + (L ? 'Масса коробки с ' + d.n1 + ' болтами равна ' + kg(d.m1) + ' кг, а масса такой же коробки с ' + d.n2 + ' гайками — ' + kg(d.m2) + ' кг. Массы одного болта и одной гайки относятся как ' + d.p + ' : ' + d.q + '.'
      : 'Қорап пен ' + d.n1 + ' болттың массасы ' + kg(d.m1) + ' кг, ал дәл сондай қорап пен ' + d.n2 + ' гайканың массасы ' + kg(d.m2) + ' кг. Бір болт пен бір гайканың массаларының қатынасы ' + d.p + ' : ' + d.q + '.');
  }
  function boltsSol(d, L) {
    // из большей массы вычитаем меньшую — масса коробки сокращается
    var bb = d.n1 + ' · ' + d.p + 't', gg = d.n2 + ' · ' + d.q + 't', big = d.m1 > d.m2, dn = Math.abs(d.n1 * d.p - d.n2 * d.q), dm = Math.abs(d.m1 - d.m2);
    var eq = (big ? bb + ' − ' + gg : gg + ' − ' + bb) + ' = ' + (big ? d.m1 + ' − ' + d.m2 : d.m2 + ' − ' + d.m1) + ' = ' + dm + ' г';
    return L ? 'Пусть болт весит ' + d.p + 't г, гайка — ' + d.q + 't г (' + kg(d.m1) + ' кг = ' + d.m1 + ' г, ' + kg(d.m2) + ' кг = ' + d.m2 + ' г). Вычитаем одно равенство из другого, масса коробки сокращается: ' + eq + ', т.е. ' + dn + 't = ' + dm + ', t = ' + d.t + '. Болт ' + d.p * d.t + ' г, гайка ' + d.q * d.t + ' г, коробка ' + d.m1 + ' − ' + d.n1 + ' · ' + d.p * d.t + ' = ' + d.B + ' г.'
      : 'Болт ' + d.p + 't г, гайка ' + d.q + 't г болсын (' + kg(d.m1) + ' кг = ' + d.m1 + ' г, ' + kg(d.m2) + ' кг = ' + d.m2 + ' г). Бір теңдіктен екіншісін азайтамыз, қораптың массасы қысқарады: ' + eq + ', яғни ' + dn + 't = ' + dm + ', t = ' + d.t + '. Болт ' + d.p * d.t + ' г, гайка ' + d.q * d.t + ' г, қорап ' + d.m1 + ' − ' + d.n1 + ' · ' + d.p * d.t + ' = ' + d.B + ' г.';
  }
  add('m_ratio', 'b24.bolts1', [3, 4], function (r) {
    var d = boltsData(r), ans = d.k * d.p / d.q;
    return Q(boltsStem(d, 0) + ask(d.k + ' болттың массасы неше гайканың массасына тең?'), boltsStem(d, 1) + ask('Сколько гаек весят столько же, сколько ' + pl(d.k, 'болт', 'болта', 'болтов') + '?'),
      ans, ints([d.k * d.q / d.p, d.k * d.p, ans + 1, ans - 1, ans + d.q], ans, true).slice(0, 4), boltsSol(d, 0) + ' ' + d.k + ' болт = ' + d.k * d.p * d.t + ' г = ' + ans + ' гайка.', boltsSol(d, 1) + ' ' + pl(d.k, 'болт', 'болта', 'болтов') + ' = ' + d.k * d.p * d.t + ' г = ' + pl(ans, 'гайка', 'гайки', 'гаек') + '.');
  });
  add('m_ratio', 'b24.bolts2', [3, 4], function (r) {
    var d = boltsData(r), alt = d.m1 - d.n1 * d.q * d.t;
    return Q(boltsStem(d, 0) + ask('Қораптың массасын анықтаңыз.'), boltsStem(d, 1) + ask('Определите массу коробки.'),
      d.B, ints([alt, d.m2 - d.n2 * d.p * d.t, d.B + 10 * d.t, d.B - 20, Math.round((d.m1 + d.m2) / 20) * 10 - d.B], d.B, true).slice(0, 4), boltsSol(d, 0), boltsSol(d, 1), { unit: unit('г') });
  });

  /* ================= 7. Неравенство с дробями → ответ «x > −43/13» (m_eq) ================= */
  function ineqTxt(sign, v) { return 'x ' + sign + ' ' + fh(v); }
  var FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' }, HTMLS = { '<': LT, '>': GT, '≤': '≤', '≥': '≥' };
  add('m_eq', 'b24.ineq_frac', [2, 3], function (r, lvl) {
    for (;;) {
      var ds = r.shuffle([2, 3, 4, 5, 6]), d1 = ds[0], d2 = ds[1], d3 = ds[2], dm = r.pick([3, 4, 5, 7]);
      var a1 = r.int(1, 7), a2 = r.int(1, 7), b2 = r.int(-9, 9), a3 = r.int(1, 9), w = r.int(1, 4), mn = r.int(1, dm - 1);
      if (!b2 || gcd(mn, dm) > 1 || gcd(a1, d1) > 1 || gcd(a3, d3) > 1) continue;   // 3x/3, 4x/2 — несократимые дроби
      var M = fr(w * dm + mn, dm), A = fr.sub(fr.sub(fr(a1, d1), fr(a2, d2)), fr(a3, d3)), C = fr.sub(fr(-b2, d2), M);
      if (A.n === 0) continue;
      var V = fr.div(fr(-C.n, C.d), A);
      if (V.d === 1 || Math.abs(V.n) > 99 || V.d > 40 || Math.abs(V.n) === 1) continue;
      var s = lvl >= 3 ? r.pick(['≤', '≥']) : r.pick(['<', '>']), res = A.n < 0 ? FLIP[s] : s;
      var e = fx(lin(a1, 0).replace(' + 0', ''), d1) + ' − ' + fx(lin(a2, b2), d2) + ' ' + HTMLS[s] + ' ' + w + fx(mn, dm) + ' + ' + fx(lin(a3, 0).replace(' + 0', ''), d3);
      var ans = ineqTxt(HTMLS[res], V), Vm = fr(-V.n, V.d), Vr = fr(V.d * (V.n < 0 ? -1 : 1), Math.abs(V.n));
      var wrong = [ineqTxt(HTMLS[FLIP[res]], V), ineqTxt(HTMLS[res], Vm), ineqTxt(HTMLS[FLIP[res]], Vr)];
      // x — влево, числа — вправо: (a1/d1 − a2/d2 − a3/d3) · x  s  M + b2/d2
      var R = fr(-C.n, C.d), Ax = '(' + fs(A) + ') · x', mv = '(' + a1 + '/' + d1 + ' − ' + a2 + '/' + d2 + ' − ' + a3 + '/' + d3 + ') · x ' + HTMLS[s] + ' ' + fs(M) + (b2 > 0 ? ' + ' : ' − ') + Math.abs(b2) + '/' + d2;
      return Q('Теңсіздікті шешіңіз:' + expr(e), 'Решите неравенство:' + expr(e), ans, wrong,
        'x бар мүшелерді сол жаққа, сандарды оң жаққа жинаймыз: ' + mv + ', яғни ' + Ax + ' ' + HTMLS[s] + ' ' + fs(R) + '. ' + (A.n < 0 ? 'Теріс санға бөлгенде теңсіздік таңбасы ауысады: ' : 'Оң санға бөлеміз: ') + 'x ' + HTMLS[res] + ' ' + fs(R) + ' : (' + fs(A) + ') = ' + fs(V) + '.',
        'Члены с x переносим влево, числа — вправо: ' + mv + ', т.е. ' + Ax + ' ' + HTMLS[s] + ' ' + fs(R) + '. ' + (A.n < 0 ? 'При делении на отрицательное число знак неравенства меняется: ' : 'Делим на положительное число: ') + 'x ' + HTMLS[res] + ' ' + fs(R) + ' : (' + fs(A) + ') = ' + fs(V) + '.');
    }
  });

  /* ================= 8. Повтори ошибку ученика (l_op) ================= */
  function digs(n) { return String(n).split('').map(Number); }
  function colPair(A, B) { var a = digs(A), b = digs(B); while (b.length < a.length) b.unshift(0); while (a.length < b.length) a.unshift(0); return [a, b]; }
  var ERR = {
    cmul: { op: '×', bad: function (A, m) { return +digs(A).map(function (d) { return d * m; }).join(''); }, ok: function (A, m) { return A * m; },
      show: function (A, m) { return digs(A).some(function (d) { return d * m >= 10; }); },
      kk: 'әр цифрды жеке көбейтіп, көбейтінділерді (көшірмей) қатар жазады', ru: 'умножает каждую цифру отдельно и записывает произведения подряд, без переноса' },
    nocarry: { op: '+', bad: function (A, B) { var p = colPair(A, B); return +p[0].map(function (d, i) { return (d + p[1][i]) % 10; }).join(''); }, ok: function (A, B) { return A + B; },
      show: function (A, B) { var p = colPair(A, B); return p[0].some(function (d, i) { return d + p[1][i] >= 10; }); },
      kk: 'әр бағанда қосындының тек соңғы цифрын жазып, бір ондықты келесі разрядқа қоспайды', ru: 'в каждом столбце пишет только последнюю цифру суммы и не переносит десяток в следующий разряд' },
    cadd: { op: '+', bad: function (A, B) { var p = colPair(A, B); return +p[0].map(function (d, i) { return d + p[1][i]; }).join(''); }, ok: function (A, B) { return A + B; },
      show: function (A, B) { var p = colPair(A, B); return p[0].some(function (d, i) { return d + p[1][i] >= 10; }); },
      kk: 'әр бағанның қосындысын толық жазып, оларды қатар тіркеп қояды', ru: 'записывает сумму каждого столбца целиком и ставит их подряд' },
    absub: { op: '−', bad: function (A, B) { var p = colPair(A, B); return +p[0].map(function (d, i) { return Math.abs(d - p[1][i]); }).join(''); }, ok: function (A, B) { return A - B; },
      show: function (A, B) { var p = colPair(A, B); return A > B && p[0].some(function (d, i) { return p[1][i] > d; }); },
      kk: 'әр бағанда үлкен цифрдан кішісін азайтады (қай сан жоғарыда тұрғанына қарамайды)', ru: 'в каждом столбце вычитает из большей цифры меньшую (не важно, какая стоит сверху)' }
  };
  function colSvg(A, B, op, R, tag) {
    var w = 18 + 11 * Math.max(String(A).length, String(B).length + 1, String(R).length), x = w - 6, st = 'font-family:monospace;font-size:17px';
    function t(y, s) { return '<text x="' + x + '" y="' + y + '" text-anchor="end" style="' + st + '">' + s + '</text>'; }
    return svgEl(w + 4, 86, txt(10, 12, tag, 'start', 'ax') + t(30, A) + t(50, op + ' ' + B) + line(x - 11 * (String(B).length + 2), 57, x + 2, 57) + t(76, R));
  }
  add('l_op', 'b24.student_error', [2, 3], function (r, lvl) {
    var kind = r.pick(lvl >= 3 ? ['cmul', 'nocarry', 'cadd', 'absub'] : ['cmul', 'cmul', 'nocarry', 'absub']), E = ERR[kind], ex = [], i;
    function make() {
      for (;;) {
        var A, B;
        if (kind === 'cmul') { A = r.int(lvl >= 3 ? 1000 : 100, lvl >= 3 ? 9999 : 999); B = r.int(2, 9); }
        else { A = r.int(lvl >= 3 ? 1000 : 100, lvl >= 3 ? 9999 : 999); B = r.int(lvl >= 3 ? 1000 : 100, kind === 'absub' ? A - 1 : (lvl >= 3 ? 9999 : 999)); }
        if (B < 2 || !E.show(A, B) || E.bad(A, B) === E.ok(A, B)) continue;
        if (kind === 'absub' && String(E.bad(A, B)).length < String(A).length) continue;   // без «нуля впереди» (027)
        return [A, B];
      }
    }
    for (i = 0; i < 3; i++) ex.push(make());
    var nw = ex[2], ans = E.bad(nw[0], nw[1]), others = [];
    Object.keys(ERR).forEach(function (k) { if (k !== kind && ERR[k].op === E.op) others.push(ERR[k].bad(nw[0], nw[1])); });
    var wrong = ints([E.ok(nw[0], nw[1])].concat(others, [ans + 100, ans - 100, ans + 200, ans + 10]), ans, true);
    var picQ = figs([colSvg(ex[0][0], ex[0][1], E.op, E.bad(ex[0][0], ex[0][1]), '#1'), colSvg(ex[1][0], ex[1][1], E.op, E.bad(ex[1][0], ex[1][1]), '#2')]);
    var task = nw[0] + ' ' + E.op + ' ' + nw[1];
    return P('Алан үй тапсырмасындағы есептерді шығарып жатыр. Ол екі есепті төменде көрсетілгендей бірдей қатемен шығарды. Егер ол ' + task + ' есебін дәл сондай қатемен шығарса, қандай жауап алады?',
      'Алан решает задачи из домашнего задания. Две задачи он решил с одной и той же ошибкой, как показано ниже. Какой ответ он получит, если с той же ошибкой решит пример ' + task + '?', picQ,
      ans, wrong.slice(0, 4), 'Мысалдарды тексереміз: Алан ' + E.kk + '. ' + task + ' үшін де солай: ' + ans + ' (дұрыс жауабы ' + E.ok(nw[0], nw[1]) + ').',
      'Проверяем примеры: Алан ' + E.ru + '. Для ' + task + ' так же: ' + ans + ' (правильный ответ ' + E.ok(nw[0], nw[1]) + ').');
  });

  /* ================= 9. Сколько кратных между a и b (m_divis) ================= */
  function cntMul(k, lo, hi) { return Math.floor(hi / k) - Math.floor((lo - 1) / k); }   // кратные k на [lo; hi]
  add('m_divis', 'b24.multiples_between', [1, 2], function (r, lvl) {
    var k = r.int(3, 9), a = r.int(11, 70), b = a + r.int(50, 160);
    if (r.chance(0.5)) a = Math.ceil(a / k) * k;
    if (r.chance(0.5)) b = Math.floor(b / k) * k;
    if (lvl === 1) {
      var ans = cntMul(k, a + 1, b - 1), incl = cntMul(k, a, b), f1 = (Math.floor(a / k) + 1) * k, l1 = Math.floor((b - 1) / k) * k;
      return Q(a + ' және ' + b + ' сандарының арасында ' + dat(k) + ' қалдықсыз бөлінетін неше бүтін сан бар? (' + a + ' және ' + b + ' сандарының өздері есептелмейді.)',
        'Сколько целых чисел между ' + a + ' и ' + b + ' делятся на ' + k + ' без остатка? (Сами числа ' + a + ' и ' + b + ' не считаются.)',
        ans, ints([incl, ans + 1, ans - 1, Math.round((b - a) / k), incl + 1, ans + 2, ans - 2], ans, true).slice(0, 4),
        'Бірінші еселік — ' + f1 + ', соңғысы — ' + l1 + '. Саны: (' + l1 + ' − ' + f1 + ') : ' + k + ' + 1 = ' + ans + '. Шеткі сандарды тексеріңіз!',
        'Первое кратное — ' + f1 + ', последнее — ' + l1 + '. Их (' + l1 + ' − ' + f1 + ') : ' + k + ' + 1 = ' + ans + '. Проверяйте границы!');
    }
    var m = r.pick([2, 3, 4, 5].filter(function (x) { return x !== k && gcd(x, k) === 1; })) || 2, ck = cntMul(k, a, b), ckm = cntMul(k * m, a, b), ans2 = ck - ckm;
    return Q(a + ', ' + (a + 1) + ', …, ' + b + ' сандарының (' + a + ' және ' + b + ' сандарын қоса) ішінде ' + dat(k) + ' бөлінетін, бірақ ' + dat(m) + ' бөлінбейтін неше сан бар?',
      'Сколько чисел от ' + a + ' до ' + b + ' (включительно) делятся на ' + k + ', но не делятся на ' + m + '?',
      ans2, ints([ck, ck - cntMul(m, a, b), ans2 + 1, ans2 - 1, ckm], ans2, true).slice(0, 4),
      dat(k) + ' бөлінетіндер: ' + ck + '. Олардың ішінде ' + dat(m) + ' де бөлінетіндері — ' + dat(k * m) + ' бөлінетіндер: ' + ckm + '. ' + ck + ' − ' + ckm + ' = ' + ans2 + '.',
      'Делятся на ' + k + ': ' + ck + '. Из них на ' + m + ' делятся те, что кратны ' + k * m + ': ' + ckm + '. ' + ck + ' − ' + ckm + ' = ' + ans2 + '.');
  });

  /* ================= 10. Башни из брусков — пара (m_eq / m_volume) ================= */
  function towersData(r) {
    for (;;) {
      var s = r.int(6, 15), h = s + r.int(4, 12), nA = r.int(1, 3), mA = r.int(1, 2), nB = r.int(1, 4), mB = r.int(1, 3);
      if (nA * mB === nB * mA || nA + mA > 4 || nB + mB > 6 || nA + mA === nB + mB) continue;
      var sa = r.shuffle(rep('h', nA).concat(rep('s', mA))), sb = r.shuffle(rep('h', nB).concat(rep('s', mB)));
      return { s: s, h: h, A: sa, B: sb, HA: nA * h + mA * s, HB: nB * h + mB * s, nA: nA, mA: mA, nB: nB, mB: mB };
    }
  }
  function barSvg(x, y, w, ht, dd) {   // брусок: передняя грань, верх, правая грань (как кубики в gen_visual)
    return rect(x, y - ht, w, ht, 'vcf') + poly([[x, y - ht], [x + dd, y - ht - dd], [x + w + dd, y - ht - dd], [x + w, y - ht]], 'vct') + poly([[x + w, y], [x + w, y - ht], [x + w + dd, y - ht - dd], [x + w + dd, y - dd]], 'vcr');
  }
  function towersPic(d) {
    var k = 190 / Math.max(d.HA, d.HB), dd = d.s * k * 0.4, by = 225, out = '', fx0 = 18;
    // рисунок 1: брусок стоя и лёжа
    var sw = 16, shh = 16 * d.h / d.s; if (shh > 60) { sw = 60 * d.s / d.h; shh = 60; }
    out += barSvg(fx0 + 12, 90, sw, shh, sw * 0.4) + txt(fx0 + 4, 90 - shh / 2 + 4, 'h', 'end') + txt(fx0 + 12 + sw / 2, 104, 'a') +
      barSvg(fx0, 140, shh, sw, sw * 0.4) + txt(fx0 + shh / 2 + 6, 165, '1', 'middle', 'ax');
    [[d.A, d.HA, 'A', 150], [d.B, d.HB, 'B', 270]].forEach(function (tw) {
      var cy = by, cx = tw[3];
      tw[0].forEach(function (t) { var w = (t === 'h' ? d.s : d.h) * k, ht = (t === 'h' ? d.h : d.s) * k; out += barSvg(cx - w / 2, cy, w, ht, dd); cy -= ht; });
      var lx = cx + d.h * k / 2 + dd + 10;
      out += line(lx, by, lx, by - tw[1] * k, 'dim') + line(lx - 4, by, lx + 4, by) + line(lx - 4, by - tw[1] * k, lx + 4, by - tw[1] * k) +
        txt(lx + 5, by - tw[1] * k / 2 + 4, tw[1] + ' см', 'start') + txt(cx, by - tw[1] * k - dd - 8, tw[2], 'middle', 'big');
    });
    out += line(100, by, 370, by);
    return pic(380, 240, out);
  }
  function towersStem(d, L) {
    return stemHead(L) + (L ? 'Кирпич (брусок) имеет квадратное основание со стороной a см и высоту h см, h &gt; a (рисунок 1). Из таких кирпичей построили башни A и B, как показано на рисунке: стоящий кирпич добавляет к высоте h см, лежащий — a см. Высота башни A — ' + d.HA + ' см, башни B — ' + d.HB + ' см.'
      : 'Кірпіштің (брустың) табаны — қабырғасы a см шаршы, биіктігі h см, h &gt; a (1-сурет). Осындай кірпіштерден суреттегідей A және B мұнаралары тұрғызылды: тік тұрған кірпіш биіктікке h см, жатқан кірпіш a см қосады. A мұнарасының биіктігі ' + d.HA + ' см, B мұнарасының биіктігі ' + d.HB + ' см.');
  }
  function towersSol(d, L) {
    var eq = d.nA + 'h + ' + d.mA + 'a = ' + d.HA + ', ' + d.nB + 'h + ' + d.mB + 'a = ' + d.HB;
    // исключаем a: первое уравнение · mB, второе · mA, вычитаем
    var c1 = d.nA * d.mB - d.nB * d.mA, r1v = d.HA * d.mB - d.HB * d.mA, sg = c1 < 0 ? -1 : 1;
    var mulR = [d.mB > 1 ? 'первое на ' + d.mB : '', d.mA > 1 ? 'второе на ' + d.mA : ''].filter(Boolean).join(', '), mulK = [d.mB > 1 ? 'біріншісін ' + dat(d.mB) : '', d.mA > 1 ? 'екіншісін ' + dat(d.mA) : ''].filter(Boolean).join(', ');
    var el = (d.mA === d.mB ? '' : (L ? 'умножаем ' + mulR + ' и ' : mulK + ' көбейтіп, ')) +
      (L ? (sg > 0 ? 'из первого вычитаем второе: ' : 'из второго вычитаем первое: ') : (sg > 0 ? 'біріншісінен екіншісін азайтамыз: ' : 'екіншісінен біріншісін азайтамыз: ')) +
      cf(sg * c1) + 'h = ' + sg * r1v + (sg * c1 === 1 ? '' : ', h = ' + d.h) + '; ' + cf(d.mA) + 'a = ' + d.HA + ' − ' + (d.nA === 1 ? '' : d.nA + ' · ') + d.h + ' = ' + d.mA * d.s + (d.mA === 1 ? '' : ', a = ' + d.s) + '.';
    return (L ? 'По рисунку: ' : 'Суреттен: ') + eq.replace(/\b1([ha])/g, '$1') + '. ' + (L ? 'Исключаем a: ' : 'a-ны жоямыз: ') + el;
  }
  add('m_eq', 'b24.towers1', [3, 4], function (r) {
    var d = towersData(r), pq = towersPic(d);
    return Q(towersStem(d, 0) + pq + ask('Кірпіштің h биіктігін анықтаңыз.'), towersStem(d, 1) + pq + ask('Определите высоту h кирпича.'),
      d.h, ints([d.s, d.h + 1, d.h - 1, d.h + 2, Math.round(d.HA / (d.nA + d.mA))], d.h, true).slice(0, 4), towersSol(d, 0), towersSol(d, 1), { unit: unit('см') });
  });
  add('m_volume', 'b24.towers2', [3, 4], function (r) {
    var d = towersData(r), pq = towersPic(d), V = d.s * d.s * d.h;
    return Q(towersStem(d, 0) + pq + ask('Бір кірпіштің көлемін анықтаңыз.'), towersStem(d, 1) + pq + ask('Определите объём одного кирпича.'),
      V, ints([d.s * d.h * d.h, d.s * d.h * 4, (d.s + 1) * (d.s + 1) * d.h, d.s * d.s * (d.h + 1)], V, true).slice(0, 4),
      towersSol(d, 0) + ' V = a² · h = ' + d.s + '² · ' + d.h + ' = ' + V + ' см³.', towersSol(d, 1) + ' V = a² · h = ' + d.s + '² · ' + d.h + ' = ' + V + ' см³.', { unit: unit('см³') });
  });

  /* ================= 11. △x = x³, □x = x² (l_op) ================= */
  add('l_op', 'b24.symbol_ops', [2, 3], function (r, lvl) {
    var CU = function (x) { return x * x * x; }, SQ = function (x) { return x * x; };
    for (;;) {
      var p = r.int(2, 3), q = r.int(1, 2), a, b, defK, terms = [];
      if (lvl >= 3) { p = r.int(3, 5); q = r.int(1, 2); a = p * p - q * q * q; if (a < 1 || a > 12) continue; b = r.pick([1, 2]); }
      else { a = p * p; b = q * q * q; }
      var aDef = lvl >= 3 ? '□' + p + ' − △' + q + ' = <i>a</i>' : '□' + p + ' = <i>a</i>', bDef = '△' + b + ' … ', i;
      bDef = lvl >= 3 ? '□(△' + b + ') = <i>b</i>' : '△' + q + ' = <i>b</i>';
      if (lvl >= 3) b = SQ(CU(b));
      function T(sg, sym, txtS, val) { terms.push({ sg: sg, sym: sym, t: txtS, v: val }); }
      T(1, a <= 5 ? '△' : '□', '<i>a</i>', a);
      T(1, '□', String(r.int(2, 6)), null);
      T(-1, '△', String(r.int(2, 4)), null);
      if (b <= 10) T(1, b <= 4 ? '△' : '□', '<i>b</i>', b);
      else { var c = r.int(1, Math.min(9, b - 1)); T(1, '□', '(<i>b</i> − ' + c + ')', b - c); }
      if (lvl >= 3) { var c2 = r.int(2, 3); if (CU(c2) === a) continue; T(-1, '□', '(△' + c2 + ' − <i>a</i>)', CU(c2) - a); }
      terms.forEach(function (t) { if (t.v === null) t.v = +t.t; });
      function ev(sw) { return sum(terms.map(function (t) { var f = (t.sym === '△') !== sw ? CU : SQ; return t.sg * f(t.v); })); }
      var ans = ev(false);
      if (Math.abs(ans) > 999) continue;
      var e = terms.map(function (t, j) { return (j ? (t.sg < 0 ? ' − ' : ' + ') : '') + t.sym + t.t; }).join('');
      var noA = ans - (terms[0].sym === '△' ? CU(a) : SQ(a)) + (terms[0].sym === '△' ? CU(p) : SQ(p));
      var wrong = ints([ev(true), noA, ans + 2, ans - 2, ans + 10], ans);
      var steps = terms.map(function (t) { return t.sym + t.v + ' = ' + num(t.sym === '△' ? CU(t.v) : SQ(t.v)); }).join(', ');
      return Q('x саны үшін △x = x³ және □x = x² ретінде анықталады. Егер ' + aDef + ' және ' + bDef + ' болса, онда' + expr(e) + 'мәнін анықтаңыз.',
        'Для числа x определено: △x = x³ и □x = x². Если ' + aDef + ' и ' + bDef + ', то определите значение выражения' + expr(e),
        ans, wrong.slice(0, 4), 'Алдымен a = ' + a + ', b = ' + b + '. Сосын: ' + steps + '. Нәтиже: ' + num(ans) + '.', 'Сначала a = ' + a + ', b = ' + b + '. Затем: ' + steps + '. Итого ' + num(ans) + '.');
    }
  });

  /* ================= 12. Периодическая строка ABACA… (l_count) ================= */
  add('l_count', 'b24.pattern_string', [3, 4], function (r, lvl) {
    var per, X, i, j;
    for (;;) {
      var L = r.int(4, lvl >= 4 ? 7 : 6), letters = lvl >= 4 ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C'];
      per = ['A']; for (i = 1; i < L; i++) per.push(r.pick(letters));
      var str = per.join(''), prim = true;
      for (j = 1; j < L; j++) if (L % j === 0 && str === str.slice(0, j).repeat(L / j)) prim = false;
      var cnt = {}; per.forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; });
      var multi = Object.keys(cnt).filter(function (c) { return cnt[c] >= 2; });
      if (!prim || !multi.length || Object.keys(cnt).length < 3 || per[L - 1] === 'A' && per[0] === 'A' && cnt.A === L - 1) continue;
      X = r.pick(multi); if (per[L - 1] === X && per[0] === X) continue;
      break;
    }
    var N = r.int(40, 150), big = '', pos = [];
    while (pos.length < N + 1) { var ch = per[big.length % per.length]; big += ch; if (ch === X) pos.push(big.length); }
    var shown = per.join(' ') + ' ' + per.join(' ') + ' ' + per.join(' ').slice(0, 2 * Math.ceil(per.length / 2)) + '…';
    var mode = lvl >= 4 ? r.pick(['max', 'min', 'count']) : r.pick(['max', 'max', 'min']), ans, wrong, sk, sr, qk, qr;
    var mx = pos[N] - 1, mn = pos[N - 1];
    if (mode === 'count') {
      var Y = r.pick(Object.keys(cnt).filter(function (c) { return c !== X; })), Lt = mx, cy = big.slice(0, Lt).split('').filter(function (c) { return c === Y; }).length;
      ans = cy; wrong = ints([Math.round(Lt * cnt[Y] / per.length) + 1, cy + 1, cy - 1, Math.floor(N * cnt[Y] / cnt[X])], cy, true);
      qk = 'Тізбекте ' + X + ' әрпі ' + N + ' рет кездеседі және тізбектің ұзындығы мүмкін болатын ең үлкен мән. Тізбекте ' + Y + ' әрпі неше рет кездеседі?';
      qr = 'Буква ' + X + ' встречается в последовательности ' + pl(N, 'раз', 'раза', 'раз') + ', а длина последовательности — наибольшая возможная. Сколько раз в ней встречается буква ' + Y + '?';
      sk = 'Ең үлкен ұзындық ' + mx + ' (келесі ' + X + ' әрпінің алдына дейін). Алғашқы ' + mx + ' әріпте ' + Y + ' — ' + cy + ' рет.';
      sr = 'Наибольшая длина ' + mx + ' (до следующей буквы ' + X + '). В первых ' + mx + ' буквах ' + Y + ' встречается ' + pl(cy, 'раз', 'раза', 'раз') + '.';
    } else {
      ans = mode === 'max' ? mx : mn;
      wrong = ints([mode === 'max' ? mn : mx, ans + 1, ans - 1, Math.round(N * per.length / cnt[X]), ans + per.length], ans, true);
      qk = 'Егер тізбекте ' + X + ' әрпі ' + N + ' рет кездессе, онда тізбектегі әріптердің ' + (mode === 'max' ? 'максималды' : 'минималды') + ' саны қанша болуы мүмкін?';
      qr = 'Если буква ' + X + ' встречается ' + pl(N, 'раз', 'раза', 'раз') + ', то каково ' + (mode === 'max' ? 'максимально' : 'минимально') + ' возможное количество букв в этой последовательности?';
      var full = Math.floor((N - 1) / cnt[X]);
      sk = 'Период «' + per.join('') + '» (' + per.length + ' әріп), онда ' + X + ' — ' + cnt[X] + ' рет. ' + N + '-ші ' + X + ' әрпі ' + mn + '-орында тұр' + (mode === 'max' ? ', ал келесі ' + X + ' — ' + pos[N] + '-орында. Сондықтан ең көбі ' + mx + ' әріп.' : '. Сондықтан ең азы ' + mn + ' әріп.');
      sr = 'Период «' + per.join('') + '» (' + pl(per.length, 'буква', 'буквы', 'букв') + '), в нём ' + X + ' — ' + pl(cnt[X], 'раз', 'раза', 'раз') + '. ' + N + '-я буква ' + X + ' стоит на ' + mn + '-м месте' + (mode === 'max' ? ', а следующая ' + X + ' — на ' + pos[N] + '-м. Значит, наибольшая длина ' + mx + '.' : '. Значит, наименьшая длина ' + mn + '.');
      void full;
    }
    return Q('Тізбек ' + Object.keys(cnt).sort().join(', ') + ' әріптерінен құралған және бірдей бөлік қайталанып отырады. Тізбектің басы көрсетілген:' + expr('<b>' + shown + '</b>') + qk,
      'Последовательность составлена из букв ' + Object.keys(cnt).sort().join(', ') + ' и повторяется по одному и тому же правилу. Показано её начало:' + expr('<b>' + shown + '</b>') + qr,
      ans, wrong.slice(0, 4), sk, sr);
  });

  /* ================= 13. Две палки в земле (m_frac) ================= */
  add('m_frac', 'b24.sticks', [3, 4], function (r, lvl) {
    for (;;) {
      var q1 = r.int(3, 9), p1 = r.int(1, Math.floor((q1 - 1) / 2)), q2 = r.int(3, 9), p2 = r.int(1, Math.floor((q2 - 1) / 2));
      if (gcd(p1, q1) > 1 || gcd(p2, q2) > 1 || p1 * q2 <= p2 * q1) continue;
      var base = lcm(q1 - p1, q2 - p2), Hh = base * r.int(1, 6), A = Hh * q1 / (q1 - p1), B = Hh * q2 / (q2 - p2), D = A * p1 / q1 - B * p2 / q2;
      if (A + B > 500 || A + B < 60 || D < 4 || D < 0.08 * A) continue;
      break;
    }
    // (вопрос «на сколько A длиннее B» не годится: надземные части равны, ответ — данная разность D)
    var mode = lvl >= 4 ? r.pick(['lenA', 'above']) : r.pick(['sum', 'sum', 'lenA']), ans = mode === 'sum' ? A + B : mode === 'lenA' ? A : Hh;
    var k = 150 / A, gy = 30 + Hh * k, out = '';
    out += rect(20, gy, 200, A * p1 / q1 * k + 18, null, 'fill:var(--soft);stroke:none') + line(20, gy, 220, gy) + txt(18, gy + 4, '', 'end');
    out += rect(95, 30, 9, A * k, null, S_G) + rect(150, 30, 9, B * k, null, S_G) + txt(99.5, 22, 'A') + txt(154.5, 22, 'B') + line(104, 30, 150, 30, 'dim');
    var yb = 30 + B * k, ya = 30 + A * k;
    out += line(172, yb, 172, ya) + line(167, yb, 177, yb) + line(167, ya, 177, ya) + txt(180, (yb + ya) / 2 + 4, D + ' см', 'start');
    var qk = { sum: 'A және B таяқшаларының жалпы ұзындығы қанша?', lenA: 'A таяқшасының ұзындығы қанша?', above: 'Әр таяқшаның жер бетіндегі бөлігінің ұзындығы қанша?' }[mode];
    var qr = { sum: 'Какова общая длина палок A и B?', lenA: 'Какова длина палки A?', above: 'Какова длина надземной части каждой палки?' }[mode];
    var hf = function (pp, qq) { return (pp === 1 ? '' : pp) + 'H/' + qq; }, Df = fr.sub(fr(p1, q1 - p1), fr(p2, q2 - p2));
    var fin = { sum: ['A + B = ' + A + ' + ' + B + ' = ' + (A + B) + ' см.', 'A + B = ' + A + ' + ' + B + ' = ' + (A + B) + ' см.'], lenA: ['Жауабы: A = ' + A + ' см.', 'Ответ: A = ' + A + ' см.'], above: ['Жер бетіндегі бөлігі H = ' + Hh + ' см.', 'Надземная часть H = ' + Hh + ' см.'] }[mode];
    var sk = 'Жер бетіндегі бөліктері тең: ' + (q1 - p1) + '/' + q1 + ' · A = ' + (q2 - p2) + '/' + q2 + ' · B = H. Онда A = ' + q1 + 'H/' + (q1 - p1) + ', B = ' + q2 + 'H/' + (q2 - p2) + ', жер астындағы бөліктер ' + hf(p1, q1 - p1) + ' және ' + hf(p2, q2 - p2) + '. Айырмасы: (' + p1 + '/' + (q1 - p1) + ' − ' + p2 + '/' + (q2 - p2) + ') · H = ' + fs(Df) + ' · H = ' + D + ' см ⇒ H = ' + Hh + ' см, A = ' + A + ' см, B = ' + B + ' см. ' + fin[0];
    var sr = 'Надземные части равны: ' + (q1 - p1) + '/' + q1 + ' · A = ' + (q2 - p2) + '/' + q2 + ' · B = H. Тогда A = ' + q1 + 'H/' + (q1 - p1) + ', B = ' + q2 + 'H/' + (q2 - p2) + ', подземные части ' + hf(p1, q1 - p1) + ' и ' + hf(p2, q2 - p2) + '. Их разность: (' + p1 + '/' + (q1 - p1) + ' − ' + p2 + '/' + (q2 - p2) + ') · H = ' + fs(Df) + ' · H = ' + D + ' см ⇒ H = ' + Hh + ' см, A = ' + A + ' см, B = ' + B + ' см. ' + fin[1];
    return P('Руслан A және B таяқшаларын жер бетіндегі биіктіктері бірдей болатындай етіп жерге қақты. A-ның ' + p1 + '/' + q1 + ' бөлігі, ал B-ның ' + p2 + '/' + q2 + ' бөлігі жердің астында. A-ның жер астындағы бөлігі B-ның жер астындағы бөлігінен ' + D + ' см ұзын. ' + qk,
      'Руслан вбил две палки, A и B, в землю так, что над землёй они одинаковой высоты. ' + p1 + '/' + q1 + ' палки A и ' + p2 + '/' + q2 + ' палки B находятся под землёй. Подземная часть A на ' + D + ' см длиннее подземной части B. ' + qr,
      pic(240, gy + A * p1 / q1 * k + 22, out), ans, ints([mode === 'sum' ? A - B : A + B, A, B, ans + D, 2 * Hh + D, Hh, A * p1 / q1], ans, true).slice(0, 4), sk, sr, { unit: unit('см') });
  });

  /* ================= 14. Догонялка (m_motion) ================= */
  add('m_motion', 'b24.catch_up', [2, 3], function (r, lvl) {
    for (;;) {
      var v1 = r.int(4, 20), t0 = r.int(1, 3), dv = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15]), v2 = v1 + dv, gap = v1 * t0, t = gap / dv;
      if (t % 1 || t < 1 || t > 8) continue;
      var D = v2 * t + r.int(2, 9) * 5, meet = v2 * t;
      if (lvl === 2) return Q('Асылбек A нүктесінен B нүктесіне қарай ' + v1 + ' км/сағ жылдамдықпен шықты. ' + t0 + ' сағаттан кейін Марат A нүктесінен B нүктесіне қарай ' + v2 + ' км/сағ жылдамдықпен шықты. A мен B нүктелерінің арасы ' + D + ' км болса, Марат Асылбекті жолға шыққаннан кейін неше сағатта қуып жетеді?',
        'Асылбек выехал из точки A в точку B со скоростью ' + v1 + ' км/ч. Через ' + t0 + ' ч из A в B выехал Марат со скоростью ' + v2 + ' км/ч. Расстояние между A и B ' + D + ' км. Через сколько часов после своего выезда Марат догонит Асылбека?',
        t, ints([t + t0, D / v2, Math.round(D / dv), t - 1 || t + 2, gap], t, true).slice(0, 4),
        'Марат шыққанда Асылбек ' + v1 + ' · ' + t0 + ' = ' + gap + ' км алда. Жақындау жылдамдығы ' + v2 + ' − ' + v1 + ' = ' + dv + ' км/сағ. ' + gap + ' : ' + dv + ' = ' + t + ' сағ. ' + D + ' км — артық дерек.',
        'Когда Марат выехал, Асылбек был впереди на ' + v1 + ' · ' + t0 + ' = ' + gap + ' км. Скорость сближения ' + v2 + ' − ' + v1 + ' = ' + dv + ' км/ч. ' + gap + ' : ' + dv + ' = ' + t + ' ч. ' + D + ' км — лишнее данное.', { unit: unit('сағ', 'ч') });
      var start = r.int(14, 20) * 30, ans = U.clock(start + (t0 + t) * 60);
      return Q('Асылбек сағат ' + U.clock(start) + '-де A нүктесінен B нүктесіне қарай ' + v1 + ' км/сағ жылдамдықпен шықты. ' + t0 + ' сағаттан кейін Марат сол жолмен ' + v2 + ' км/сағ жылдамдықпен шықты. Марат Асылбекті сағат нешеде қуып жетеді? (A мен B арасы ' + D + ' км.)',
        'Асылбек выехал из A в B в ' + U.clock(start) + ' со скоростью ' + v1 + ' км/ч. Через ' + t0 + ' ч тем же путём выехал Марат со скоростью ' + v2 + ' км/ч. Во сколько Марат догонит Асылбека? (Расстояние AB ' + D + ' км.)',
        ans, [U.clock(start + t * 60), U.clock(start + (t0 + t + 1) * 60), U.clock(start + Math.round(D / v2 + t0) * 60 + 30)],
        'Марат шыққанда арақашықтық ' + gap + ' км, жақындау жылдамдығы ' + dv + ' км/сағ, қуып жету ' + t + ' сағ. Марат ' + U.clock(start + t0 * 60) + '-де шықты, ' + ans + '-де қуып жетеді (A-дан ' + meet + ' км).',
        'В момент выезда Марата расстояние ' + gap + ' км, скорость сближения ' + dv + ' км/ч, время ' + t + ' ч. Марат выехал в ' + U.clock(start + t0 * 60) + ', догонит в ' + ans + ' (в ' + meet + ' км от A).');
    }
  });

  /* ================= 15. Гистограмма → круговая диаграмма (m_percent) ================= */
  function pieSvg(sizes, labels, total, mark, big) {
    var R = big ? 60 : 48, c = R + 4, o = circ(c, c, R, S_W), acc = 0;
    sizes.forEach(function (sz, i) {
      var a1 = acc / total * 2 * Math.PI, a2 = (acc + sz) / total * 2 * Math.PI, am = (a1 + a2) / 2;
      o += line(c, c, c + R * Math.sin(a1), c - R * Math.cos(a1));
      o += txt(c + R * 0.66 * Math.sin(am), c - R * 0.66 * Math.cos(am) + 4, labels[i]);
      if (mark && sz * 4 === total) {   // прямой угол у центра
        var e1 = [Math.sin(a1), -Math.cos(a1)], e2 = [Math.sin(a2), -Math.cos(a2)], m = 7;
        o += path('M' + r1(c + m * e1[0]) + ',' + r1(c + m * e1[1]) + ' L' + r1(c + m * (e1[0] + e2[0])) + ',' + r1(c + m * (e1[1] + e2[1])) + ' L' + r1(c + m * e2[0]) + ',' + r1(c + m * e2[1]), 'fill:none;stroke:currentColor;stroke-width:1');
      }
      acc += sz;
    });
    return osv(2 * c, 2 * c, o);
  }
  add('m_percent', 'b24.hist_pie', [2, 3], function (r, lvl) {
    var total, vals, i, L = ['A', 'B', 'C', 'D', 'E'];
    for (;;) {
      total = lvl === 2 ? r.pick([40, 24, 32, 48]) : r.pick([36, 30, 45, 60]);
      vals = []; var rest = total;
      for (i = 0; i < 4; i++) vals.push(r.int(Math.ceil(total / 12), Math.max(2, Math.floor(total / 3))));
      vals.push(total - sum(vals));
      if (vals[4] < Math.ceil(total / 12)) continue;
      vals = r.shuffle(vals);
      if (vals.some(function (v, j) { return vals.indexOf(v) !== j; })) continue;
      var has90 = vals.some(function (v) { return v * 4 === total; });
      if (lvl === 2 && !has90) continue;
      if (lvl >= 3 && has90) continue;
      if (Math.max.apply(null, vals) > 16) continue;
      void rest; break;
    }
    var mx = Math.max.apply(null, vals), top = mx % 2 ? mx + 1 : mx + 2, gk = 130 / top, out = '';
    for (var y = 0; y <= top; y += 2) out += line(40, 150 - y * gk, 250, 150 - y * gk, y ? 'grid' : '') + txt(34, 154 - y * gk, y, 'end', 'ax');
    vals.forEach(function (v, j) { out += rect(56 + j * 40, 150 - v * gk, 16, v * gk, null, S_K) + txt(64 + j * 40, 166, L[j]); });
    // круг: секторы в случайном порядке по часовой от верха, во всех вариантах одинаковые
    var order = r.shuffle(range(5)), sizes = order.map(function (j) { return vals[j]; }), right = order.map(function (j) { return L[j]; });
    var cands = [];
    for (i = 0; i < 5; i++) for (var j = i + 1; j < 5; j++) { var w = right.slice(); w[i] = right[j]; w[j] = right[i]; cands.push({ w: w, d: Math.abs(sizes[i] - sizes[j]) }); }
    cands.sort(function (a, b) { return a.d - b.d; });
    var pool = cands.slice(0, 6).map(function (c) { return c.w; }), wrongL = uniq(right, r.shuffle(pool).concat(cands.map(function (c) { return c.w; })), function (a) { return a.join(''); }, 3);
    var deg = function (v) { return v * 360 / total; };
    var bigIdx = sizes.indexOf(mx), extra = lvl >= 3 ? '' : '';
    var mk = function (lab) { return pieSvg(sizes, lab, total, lvl === 2, false); };
    var ansSvg = mk(right), wrongSvg = wrongL.map(mk);
    if (lvl >= 3) {   // без прямого угла: подписываем градусы самого большого сектора на всех кругах
      var tag = '<text x="88" y="12" text-anchor="end" class="ax">' + deg(mx) + '°</text>';
      void tag; void bigIdx; void extra;
    }
    var list = vals.map(function (v, j) { return L[j] + ': ' + v + ' → ' + fmt(deg(v)) + '°'; }).join(', ');
    return P('Төмендегі гистограммада ' + total + ' оқушының A-дан E-ге дейінгі сүйікті тағам түріне дауыс беру нәтижесі көрсетілген. Төмендегі дөңгелек диаграммалардың қайсысы гистограммадағы ақпаратты дұрыс көрсетеді?',
      'На гистограмме показаны результаты голосования ' + total + ' учащихся за любимый тип еды от A до E. Какая круговая диаграмма правильно отображает информацию гистограммы?',
      pic(260, 172, out), ansSvg, wrongSvg,
      'Әр оқушыға 360° : ' + total + ' = ' + fmt(360 / total) + '° келеді: ' + list + '. ' + (lvl === 2 ? 'Тік бұрыш (90°) — ' + total / 4 + ' оқушы. ' : '') + 'Секторлардың өлшемдерін әріптермен салыстырамыз.',
      'На каждого ученика приходится 360° : ' + total + ' = ' + fmt(360 / total) + '°: ' + list + '. ' + (lvl === 2 ? 'Прямой угол (90°) — ' + total / 4 + ' учеников. ' : '') + 'Сверяем размеры секторов с буквами.');
  });

  /* ================= 16. Значение сложной дроби (m_frac) ================= */
  var DEN = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25];
  function rfr(r, maxD) { for (;;) { var d = r.pick(DEN.filter(function (x) { return x <= (maxD || 25); })), n = r.int(1, d - 1); if (gcd(n, d) === 1) return fr(n, d); } }
  add('m_frac', 'b24.complex_frac', [2, 3], function (r, lvl) {
    for (;;) {
      var a = rfr(r), b = rfr(r), c = rfr(r), d1 = rfr(r, 12), d2 = rfr(r, 12), d3 = rfr(r, 12), w = lvl >= 3 ? r.int(1, 2) : 0;
      var N = fr.sub(fr.add(a, b), c), D = fr.add(fr.add(d1, d2), fr.add(d3, fr(w, 1)));
      var same = function (u, v) { return u.n === v.n && u.d === v.d; };
      if (N.n <= 0 || same(a, b) || same(a, c) || same(b, c)) continue;   // без «1/2 + 1/2» и «+ 2/3 − 2/3»
      var V = fr.div(N, D);
      if (V.n > 12 || V.d > 40 || V.d === 1 || N.d > 100 || D.d > 60) continue;
      var fh2 = function (f) { return fx(f.n, f.d); };
      var top = fh2(a) + ' + ' + fh2(b) + ' − ' + fh2(c), bot = (w ? w + fh2(d1) : fh2(d1)) + ' + ' + fh2(d2) + ' + ' + fh2(d3);
      if (w) { D = fr.add(fr.add(fr.add(d1, fr(w, 1)), d2), d3); V = fr.div(N, D); if (V.n > 12 || V.d > 40 || V.d === 1) continue; }
      var botS = (w ? w + ' ' : '') + fs(d1) + ' + ' + fs(d2) + ' + ' + fs(d3);
      var wrong = fracs([fr.div(D, N), fr.mul(N, D), N, fr.div(fr.add(fr.add(a, b), c), D), fr(V.n, V.d + 1)], V).filter(function (f) { return f.n > 0; });
      return Q('Есептеңіз:' + expr(fx(top, bot) + ' = ?'), 'Вычислите:' + expr(fx(top, bot) + ' = ?'), V, wrong.slice(0, 4),
        'Алым: ' + fs(a) + ' + ' + fs(b) + ' − ' + fs(c) + ' = ' + fs(N) + '. Бөлім: ' + botS + ' = ' + fs(D) + '. ' + fs(N) + ' : ' + fs(D) + ' = ' + fs(N) + ' · ' + fs(fr.div(fr(1, 1), D)) + ' = ' + fs(V) + '.',
        'Числитель: ' + fs(a) + ' + ' + fs(b) + ' − ' + fs(c) + ' = ' + fs(N) + '. Знаменатель: ' + botS + ' = ' + fs(D) + '. ' + fs(N) + ' : ' + fs(D) + ' = ' + fs(N) + ' · ' + fs(fr.div(fr(1, 1), D)) + ' = ' + fs(V) + '.');
    }
  });

  /* ================= 17. Парк с косой дорожкой (m_geom) ================= */
  add('m_geom', 'b24.park_path', [2, 3], function (r, lvl) {
    var W = r.int(18, 40), Hh = r.int(9, Math.min(20, W - 4)), a = r.int(2, 3), b = lvl >= 3 ? r.int(1, 3) : 0;
    var k = Math.min(260 / W, 140 / Hh), X0 = 30, Y0 = 14, w = W * k, hh = Hh * k, out = rect(X0, Y0, w, hh, null, S_W);
    // косая дорожка с изломом: от левого верхнего угла к правому нижнему, ширина a по вертикали
    var p1 = 0.35 + r() * 0.1, p2 = p1 + 0.2 + r() * 0.1, yA = Y0, yB = Y0 + hh * 0.55, yE = Y0 + hh - a * k;
    var top = [[X0, yA], [X0 + w * p1, yB], [X0 + w * p2, yB], [X0 + w, yE]], bot = top.map(function (p) { return [p[0], p[1] + a * k]; });
    out += poly(top.concat(bot.slice().reverse()), null, S_G);
    if (b) { var xb = X0 + w * (0.72 + r() * 0.1); out += rect(xb, Y0, b * k, hh, null, S_G) + txt(xb + b * k / 2, Y0 - 3, b + ' м'); }
    out += rect(X0, Y0, w, hh, null, S_L);
    out += line(X0, Y0 + hh + 10, X0 + w, Y0 + hh + 10, 'dim') + txt(X0 + w / 2, Y0 + hh + 24, W + ' м') + line(X0 - 10, Y0, X0 - 10, Y0 + hh, 'dim') + txt(X0 - 13, Y0 + hh / 2 + 4, Hh + ' м', 'end');
    out += line(X0 + w + 8, yE, X0 + w + 8, yE + a * k) + txt(X0 + w + 12, yE + a * k / 2 + 4, a + ' м', 'start');
    var S = W * Hh, path1 = a * W, ans = S - path1 - b * Hh + a * b;
    var wrong = b ? ints([S - path1 - b * Hh, S - path1, ans + a * b, ans - 2 * a * b, S - a * Hh - b * W + a * b], ans, true) : ints([S - a * Hh, path1, S - path1 - a * a, S - path1 + a * 2, ans - Hh], ans, true);
    return P('Суретте өлшемдері ' + W + ' м және ' + Hh + ' м тіктөртбұрышты саябақ көрсетілген. Саябақ ішінде ' + (b ? 'екі жол салынған: ені ' + a + ' м (тік бағытта өлшенген) сынық жол және ені ' + b + ' м түзу жол' : 'ені ' + a + ' м (тік бағытта өлшенген) сынық жол төселген') + '. Саябақтың жолдардан бос бөлігінің ауданын анықтаңыз.',
      'На рисунке прямоугольный парк размером ' + W + ' м на ' + Hh + ' м. В парке ' + (b ? 'проложены две дорожки: ломаная шириной ' + a + ' м (по вертикали) и прямая шириной ' + b + ' м' : 'проложена ломаная дорожка шириной ' + a + ' м (по вертикали)') + '. Определите площадь части парка, свободной от дорожек.',
      pic(X0 + w + 50, Y0 + hh + 32, out), ans, wrong.slice(0, 4),
      'Сынық жолды тік жолақтарға бөлсек, әр жолақтағы биіктігі ' + a + ' м, сондықтан оның ауданы ' + a + ' · ' + W + ' = ' + path1 + ' м² (параллелограмм сияқты). ' + (b ? 'Түзу жол ' + b + ' · ' + Hh + ' = ' + b * Hh + ' м², қиылысу ' + a + ' · ' + b + ' = ' + a * b + ' м² екі рет алынбауы керек. ' : '') + 'Бос бөлік: ' + S + ' − ' + path1 + (b ? ' − ' + b * Hh + ' + ' + a * b : '') + ' = ' + ans + ' м².',
      'Если разрезать ломаную дорожку на вертикальные полоски, в каждой её высота ' + a + ' м, поэтому её площадь ' + a + ' · ' + W + ' = ' + path1 + ' м² (как у параллелограмма). ' + (b ? 'Прямая дорожка ' + b * Hh + ' м², пересечение ' + a * b + ' м² нельзя вычитать дважды. ' : '') + 'Свободная часть: ' + S + ' − ' + path1 + (b ? ' − ' + b * Hh + ' + ' + a * b : '') + ' = ' + ans + ' м².', { unit: unit('м²') });
  });

  /* ================= 18. Ряды четвертей круга — пара (m_geom) ================= */
  function quarterData(r) {
    var cfg = r.pick([[2, 1], [2, 1], [3, 1]]), a1 = cfg[0], b1 = cfg[1];   // верх: a1 малых + b1 больших; низ: b1 малых + a1 больших
    var rr, R;
    do { rr = r.int(6, 18); R = rr + r.int(5, 9); } while ((a1 + b1) * (rr + R) % 2);   // при π = 3 периметр — целое число
    var W = b1 * rr + a1 * R, d = W - a1 * rr - b1 * R;
    var top = r.shuffle(rep('s', a1).concat(rep('b', b1))), bot = r.shuffle(rep('s', b1).concat(rep('b', a1)));
    return { a1: a1, b1: b1, r: rr, R: R, W: W, d: d, top: top, bot: bot, n: a1 + b1 };
  }
  function quarterPic(d) {
    var k = 260 / d.W, X0 = 56, Y = 20 + d.R * k, out = '';
    function q(x, rad, up) {   // дуга слева, вертикальный радиус справа
      var R = rad * k, s = up ? -1 : 1;
      return path('M' + r1(x) + ',' + r1(Y) + ' A' + r1(R) + ',' + r1(R) + ' 0 0 ' + (up ? 1 : 0) + ' ' + r1(x + R) + ',' + r1(Y + s * R) + ' L' + r1(x + R) + ',' + r1(Y) + ' Z', S_W);
    }
    var x = X0 + d.d * k;
    d.top.forEach(function (t) { var rad = t === 's' ? d.r : d.R; out += q(x, rad, true); x += rad * k; });
    x = X0;
    d.bot.forEach(function (t) { var rad = t === 's' ? d.r : d.R; out += q(x, rad, false); x += rad * k; });
    out += line(X0, Y, X0 + d.W * k, Y);
    var yb = Y + d.R * k + 12;
    out += line(X0, yb, X0 + d.W * k, yb, 'dim') + line(X0, yb - 5, X0, yb + 5) + line(X0 + d.W * k, yb - 5, X0 + d.W * k, yb + 5) + txt(X0 + d.W * k / 2, yb + 15, d.W + ' см');
    out += line(X0, Y - 5, X0 + d.d * k, Y - 5) + line(X0, Y - 9, X0, Y - 1) + line(X0 + d.d * k, Y - 9, X0 + d.d * k, Y - 1) + txt(X0 - 5, Y - 2, d.d + ' см', 'end');
    return pic(X0 + d.W * k + 20, yb + 22, out);
  }
  function quarterStem(d, L) {
    return stemHead(L) + (L ? 'Фигура ниже образована ' + d.n + ' одинаковыми маленькими четвертями круга и ' + d.n + ' одинаковыми большими четвертями круга (размеры — на рисунке).'
      : 'Төмендегі фигура ' + d.n + ' бірдей кіші ширек шеңберден және ' + d.n + ' бірдей үлкен ширек шеңберден құралған (өлшемдері суретте).');
  }
  function quarterSol(d, L) {
    return (L ? 'Нижний ряд: ' : 'Төменгі қатар: ') + cf(d.b1) + 'r + ' + cf(d.a1) + 'R = ' + d.W + '; ' + (L ? 'верхний: ' : 'жоғарғы: ') + d.d + ' + ' + cf(d.a1) + 'r + ' + cf(d.b1) + 'R = ' + d.W + '. ' + (L ? 'Складываем: ' : 'Екі теңдікті қосамыз: ') + d.n + '(r + R) + ' + d.d + ' = ' + 2 * d.W + ', r + R = ' + (d.r + d.R) + '. ' + (L ? 'Подставляем R = ' : 'Төменгі қатарға R = ') + (d.r + d.R) + ' − r' + (L ? ' в нижний ряд: ' : ' қоямыз: ') + cf(d.b1) + 'r + ' + d.a1 + '(' + (d.r + d.R) + ' − r) = ' + d.W + ' ⇒ ' + (d.a1 - d.b1 === 1 ? '' : cf(d.a1 - d.b1) + 'r = ' + (d.a1 * (d.r + d.R) - d.W) + ', ') + 'r = ' + d.r + ' см, R = ' + d.R + ' см.';
  }
  add('m_geom', 'b24.quarter_rows1', [3, 4], function (r) {
    var d = quarterData(r), pq = quarterPic(d);
    return Q(quarterStem(d, 0) + pq + ask('Кіші ширек шеңбердің радиусын табыңыз.'), quarterStem(d, 1) + pq + ask('Найдите радиус маленькой четверти круга.'),
      d.r, ints([d.R, d.r + 1, d.r - 1, Math.round(d.W / (d.n + 1)), d.r + d.d], d.r, true).slice(0, 4), quarterSol(d, 0), quarterSol(d, 1), { unit: unit('см') });
  });
  add('m_geom', 'b24.quarter_rows2', [3, 4], function (r) {
    var d = quarterData(r), pq = quarterPic(d), Sg = d.n * (d.r + d.R), arcs = 3 * Sg / 2, P2 = arcs + Sg + d.d;
    return Q(quarterStem(d, 0) + pq + ask('Фигураның периметрін табыңыз (π = 3).'), quarterStem(d, 1) + pq + ask('Найдите периметр фигуры (π = 3).'),
      P2, ints([arcs + Sg, arcs + d.d, P2 + d.d, 3 * Sg + d.d, P2 + d.W - d.d, arcs * 2 + d.d], P2, true).slice(0, 4),
      quarterSol(d, 0) + ' Доғалар: ' + d.n + ' · (π/2) · (' + d.r + ' + ' + d.R + ') = ' + fmt(arcs) + '; тік радиустар: ' + d.n + ' · (' + d.r + ' + ' + d.R + ') = ' + Sg + '; шеткі ' + d.d + ' см кесінді. P = ' + fmt(arcs) + ' + ' + Sg + ' + ' + d.d + ' = ' + fmt(P2) + ' см.',
      quarterSol(d, 1) + ' Дуги: ' + d.n + ' · (π/2) · (' + d.r + ' + ' + d.R + ') = ' + fmt(arcs) + '; вертикальные радиусы: ' + d.n + ' · (' + d.r + ' + ' + d.R + ') = ' + Sg + '; крайний отрезок ' + d.d + ' см. P = ' + fmt(arcs) + ' + ' + Sg + ' + ' + d.d + ' = ' + fmt(P2) + ' см.', { unit: unit('см') });
  });

  /* ================= 19. Смешанные числа (m_frac) ================= */
  function nice(f) { return f.d >= 2 && f.d <= 12 && f.n <= 60 && f.n > f.d; }
  add('m_frac', 'b24.mixed_numbers', [2, 3], function (r, lvl) {
    for (var it = 0; ; it++) {
      var A = fr(r.int(5, 40), r.int(2, 6)), B = fr(r.int(5, 20), r.int(3, 8)), C = rfr(r, 10), D = fr(r.int(5, 30), r.int(2, 6)), E = fr(r.int(4, 15), r.int(2, 6)), k = r.int(2, 40);
      if (!nice(A) || !nice(B) || !nice(D) || !nice(E)) continue;
      var N = fr.mul(fr.mul(A, B), C);
      if (lvl >= 3) N = fr.mul(N, fr(3, 4));
      var Fv = fr.div(fr.div(D, E), fr.div(N, fr(k, 1)));   // D : E : F = N / k
      if (!nice(Fv)) continue;
      var M = fr.div(fr.div(D, E), Fv), wrongV = fr.div(N, fr.div(D, fr.div(E, Fv)));
      var top = mixedH(A) + ' · ' + mixedH(B) + ' · ' + fh(C) + (lvl >= 3 ? ' · 0,75' : ''), bot = mixedH(D) + ' : ' + mixedH(E) + ' : ' + mixedH(Fv);
      var ans = fr(k, 1), topS = fs(A) + ' · ' + fs(B) + ' · ' + fs(C) + (lvl >= 3 ? ' · 3/4' : '');
      return Q('Есептеңіз:' + expr(fx(top, bot) + ' = ?'), 'Вычислите:' + expr(fx(top, bot) + ' = ?'), k,
        ints([wrongV.d === 1 ? wrongV.n : null, fr.div(M, N).d === 1 ? fr.div(M, N).n : null, k + 5, k - 5, k * 2, k + 10], k, true).slice(0, 4),
        'Аралас сандарды бұрыс бөлшекке айналдырамыз. Алым: ' + topS + ' = ' + fs(N) + '. Бөлім солдан оңға: ' + fs(D) + ' : ' + fs(E) + ' : ' + fs(Fv) + ' = ' + fs(M) + '. ' + fs(N) + ' : ' + fs(M) + ' = ' + k + '.',
        'Переводим смешанные числа в неправильные дроби. Числитель: ' + topS + ' = ' + fs(N) + '. Знаменатель слева направо: ' + fs(D) + ' : ' + fs(E) + ' : ' + fs(Fv) + ' = ' + fs(M) + '. ' + fs(N) + ' : ' + fs(M) + ' = ' + k + '.');
      void ans;
    }
  });

  /* ================= 20. Квадраты на сторонах треугольника (m_geom) ================= */
  var TRIP = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15], [20, 21, 29], [12, 16, 20], [10, 24, 26], [15, 20, 25], [12, 35, 37], [9, 40, 41]];
  function triSquaresPic(a, b) {   // прямой угол в начале координат, катеты a (вверх) и b (вправо)
    var c = Math.sqrt(a * a + b * b), k = 70 / Math.max(a, b), A = [150, 120], Bp = [150, 120 - a * k], Cp = [150 + b * k, 120];
    function sq(P1, P2) {   // квадрат наружу от треугольника (третья вершина — A)
      var dx = P2[0] - P1[0], dy = P2[1] - P1[1], n1 = [-dy, dx], mx = (P1[0] + P2[0]) / 2, my = (P1[1] + P2[1]) / 2;
      var cx = (A[0] + Bp[0] + Cp[0]) / 3, cy = (A[1] + Bp[1] + Cp[1]) / 3;
      if ((cx - mx) * n1[0] + (cy - my) * n1[1] > 0) n1 = [dy, -dx];
      return poly([P1, P2, [P2[0] + n1[0], P2[1] + n1[1]], [P1[0] + n1[0], P1[1] + n1[1]]], null, S_G);
    }
    void c;
    return sq(A, Bp) + sq(A, Cp) + sq(Bp, Cp) + poly([A, Bp, Cp], null, S_W);
  }
  add('m_geom', 'b24.tri_squares', [2, 3], function (r, lvl) {
    var t = r.pick(TRIP), m = t[2] > 20 ? r.int(1, 2) : t[2] > 10 ? r.int(1, 3) : r.int(1, 5), a = t[0] * m, b = t[1] * m, c = t[2] * m, Pt = a + b + c, picQ;
    if (r.chance(0.5)) { var tmp = a; a = b; b = tmp; }
    picQ = pic(300, 250, '<g transform="translate(0 40)">' + triSquaresPic(a, b) + '</g>');
    if (lvl === 2 && r.chance(0.4)) return P('Төмендегі фигура үш түрлі шаршы мен үшбұрыштан жасалған (шаршылар үшбұрыштың қабырғаларына салынған). Фигураның периметрі ' + 3 * Pt + ' см. Үшбұрыштың периметрін анықтаңыз.',
      'Фигура ниже образована из трёх разных квадратов и треугольника (квадраты построены на сторонах треугольника). Периметр фигуры равен ' + 3 * Pt + ' см. Определите периметр треугольника.', picQ,
      Pt, ints([3 * Pt / 4, 3 * Pt / 2, Pt * 2, 3 * Pt / 5, Pt + 6], Pt, true).slice(0, 4), 'Әр шаршының 3 қабырғасы фигураның шекарасында, ал 4-шісі — үшбұрыштың қабырғасы (ішінде). Сондықтан фигураның периметрі үшбұрыштың периметрінен 3 есе көп: ' + 3 * Pt + ' : 3 = ' + Pt + ' см.',
      'У каждого квадрата 3 стороны на границе фигуры, четвёртая — сторона треугольника (внутри). Значит, периметр фигуры в 3 раза больше периметра треугольника: ' + 3 * Pt + ' : 3 = ' + Pt + ' см.', { unit: unit('см') });
    if (lvl === 2) {
      return P('Төмендегі фигура үш түрлі шаршы мен үшбұрыштан жасалған (шаршылар үшбұрыштың қабырғаларына салынған). Үшбұрыштың периметрі ' + Pt + ' см. Фигураның периметрін анықтаңыз.',
        'Фигура ниже образована из трёх разных квадратов и треугольника (квадраты построены на сторонах треугольника). Периметр треугольника равен ' + Pt + ' см. Определите периметр фигуры.', picQ,
        3 * Pt, ints([2 * Pt, 4 * Pt, 3 * Pt + Pt / 2, Pt], 3 * Pt, true).slice(0, 4), 'Әр шаршының 3 қабырғасы фигураның шекарасында, ал 4-шісі үшбұрыштың қабырғасы (ішінде). Сондықтан P = 3 · ' + Pt + ' = ' + 3 * Pt + ' см.',
        'У каждого квадрата 3 стороны на границе фигуры, четвёртая — сторона треугольника (внутри). P = 3 · ' + Pt + ' = ' + 3 * Pt + ' см.', { unit: unit('см') });
    }
    var big = Math.max(a, b), small = Math.min(a, b), S = c * c + big * big + small * small + a * b / 2;
    if (r.chance(0.5)) return P('Тікбұрышты үшбұрыштың қабырғаларына сыртынан шаршылар салынған. Ең үлкен шаршының ауданы ' + c * c + ' см², ортаңғы шаршының ауданы ' + big * big + ' см², ал ең кіші шаршының периметрі ' + 4 * small + ' см. Фигураның периметрін анықтаңыз.',
      'На сторонах прямоугольного треугольника снаружи построены квадраты. Площадь наибольшего квадрата ' + c * c + ' см², среднего — ' + big * big + ' см², а периметр наименьшего ' + 4 * small + ' см. Найдите периметр всей фигуры.', picQ,
      3 * Pt, ints([4 * Pt, 2 * Pt, 3 * (c + small) + big, 3 * Pt + 2 * small], 3 * Pt, true).slice(0, 4),
      'Шаршылардың қабырғалары: ' + c * c + ' = ' + c + '², ' + big * big + ' = ' + big + '², ' + 4 * small + ' : 4 = ' + small + '. Әр шаршының 3 қабырғасы шекарада: 3 · (' + a + ' + ' + b + ' + ' + c + ') = ' + 3 * Pt + ' см.',
      'Стороны квадратов: ' + c * c + ' = ' + c + '², ' + big * big + ' = ' + big + '², ' + 4 * small + ' : 4 = ' + small + '. У каждого квадрата 3 стороны на границе: 3 · (' + a + ' + ' + b + ' + ' + c + ') = ' + 3 * Pt + ' см.', { unit: unit('см') });
    return P('Тікбұрышты үшбұрыштың катеттері ' + a + ' см және ' + b + ' см, гипотенузасы ' + c + ' см. Оның қабырғаларына сыртынан шаршылар салынған. Бүкіл фигураның ауданын анықтаңыз.',
      'Катеты прямоугольного треугольника ' + a + ' см и ' + b + ' см, гипотенуза ' + c + ' см. На его сторонах снаружи построены квадраты. Найдите площадь всей фигуры.', picQ,
      S, ints([S - a * b / 2, 2 * c * c, S + a * b / 2, c * c + a * b / 2], S, true).slice(0, 4),
      'Фигура = үш шаршы + үшбұрыш (тікбұрышты үшбұрыштың ауданы — катеттер көбейтіндісінің жартысы): S = ' + a + '² + ' + b + '² + ' + c + '² + ' + a + ' · ' + b + ' : 2 = ' + S + ' см².', 'Фигура = три квадрата + треугольник (площадь прямоугольного треугольника — половина произведения катетов): S = ' + a + '² + ' + b + '² + ' + c + '² + ' + a + ' · ' + b + ' : 2 = ' + S + ' см².', { unit: unit('см²') });
  });

  /* ================= 21. Простые проценты (m_percent) ================= */
  add('m_percent', 'b24.percent_simple', [1, 2], function (r, lvl) {
    for (;;) {
      var p = r.pick([10, 20, 25, 5, 15, 30, 40]), N = r.int(4, 40) * 20, v = N * p / 100, kk = r.pick([2, 4, 5]), q = r.pick([5, 10, 20, 25, 50]), ans = N / kk * q / 100;
      if (v % 1 || ans % 1 || q === p || ans < 1) continue;
      var kkN = { 2: ['жартысының', 'половины'], 4: ['төрттен бірінің', 'четверти'], 5: ['бестен бірінің', 'пятой части'] }[kk];
      var extra = lvl >= 2 ? r.int(2, 3) : 1, ans2 = ans * extra;
      return Q('Егер белгілі бір санның ' + p + '%-ы ' + v + ' болса, сол санның ' + kkN[0] + ' ' + q + '%-ы' + (extra > 1 ? 'н ' + extra + ' есе арттырсақ, қандай сан шығады?' : ' неге тең?'),
        'Если ' + p + '% числа составляют ' + v + ', то чему равно ' + (extra > 1 ? 'увеличенное в ' + extra + ' раза значение ' : '') + q + '% ' + kkN[1] + ' этого числа?',
        ans2, ints([N * q / 100 * extra, ans2 * 2, ans2 + extra, v * q / p, N / kk], ans2, true).slice(0, 4),
        'Сан: ' + v + ' : ' + p + ' · 100 = ' + N + '. Оның 1/' + kk + ' бөлігі ' + N / kk + ', ' + q + '%-ы ' + fmt(ans) + (extra > 1 ? ', ' + extra + ' есе — ' + ans2 : '') + '.',
        'Число: ' + v + ' : ' + p + ' · 100 = ' + N + '. Его 1/' + kk + ' — ' + N / kk + ', ' + q + '% — ' + fmt(ans) + (extra > 1 ? ', в ' + extra + ' раза больше — ' + ans2 : '') + '.');
    }
  });

  /* ================= 22. ab = 12, bc = 18 → max/min a + b + c (m_divis) ================= */
  add('m_divis', 'b24.ab_bc_sum', [3, 4], function (r) {
    for (;;) {
      var g = r.pick([4, 6, 8, 12, 10]), P1 = g * r.int(1, 5), P2 = g * r.int(1, 6);
      if (P1 === P2 || P1 < 6 || gcd(P1, P2) !== g) continue;
      var sums = [];
      for (var b = 1; b <= g; b++) if (g % b === 0) sums.push({ b: b, s: P1 / b + b + P2 / b });
      var mxS = Math.max.apply(null, sums.map(function (x) { return x.s; })), mnS = Math.min.apply(null, sums.map(function (x) { return x.s; }));
      var askMax = r.chance(0.5), ans = askMax ? mxS : mnS;
      var all = sums.map(function (x) { return x.s; });
      var list = sums.map(function (x) { return 'b = ' + x.b + ': ' + P1 / x.b + ' + ' + x.b + ' + ' + P2 / x.b + ' = ' + x.s; }).join('; ');
      return Q('a, b, c — натурал сандар, a · b = ' + P1 + ', b · c = ' + P2 + '. a + b + c қосындысы қабылдай алатын ең ' + (askMax ? 'үлкен' : 'кіші') + ' мәнді анықтаңыз.',
        'a, b, c — натуральные числа, a · b = ' + P1 + ' и b · c = ' + P2 + '. Определите ' + (askMax ? 'наибольшее' : 'наименьшее') + ' значение, которое может принимать a + b + c.',
        ans, ints(all.concat([askMax ? mnS : mxS, P1 + P2, ans + 1, ans - 2]), ans, true).slice(0, 4),
        'b — ' + P1 + ' және ' + P2 + ' сандарының ортақ бөлгіші, яғни ' + g + ' санының бөлгіші. Тексереміз: ' + list + '. Жауабы ' + ans + '.',
        'b — общий делитель ' + P1 + ' и ' + P2 + ', т.е. делитель ' + g + '. Перебираем: ' + list + '. Ответ ' + ans + '.');
    }
  });

  /* ================= 23. Файлы и акция — пара (m_word) ================= */
  function filesData(r) {
    for (;;) {
      var p = r.pick([150, 200, 250, 300, 350, 400, 450, 500, 120, 180]), n = r.int(40, 95), k = r.pick([4, 5, 6]), m = r.int(2, k - 1);
      if (gcd(m, n) === n || n % k === 0 && r() < 0.5) continue;
      return { p: p, n: n, M: p * n, k: k, m: m };
    }
  }
  function filesStem(d, L) {
    return stemHead(L) + (L ? 'В магазине один файл стоит ' + d.p + ' тг. У Марата ' + d.M + ' тг. В магазине акция: на каждые ' + d.k + ' купленных ' + (d.k <= 4 ? 'файла' : 'файлов') + ' 1 файл дают бесплатно.'
      : 'Дүкенде бір файл ' + d.p + ' теңге тұрады. Маратта ' + d.M + ' теңге бар. Дүкенде акция: сатып алынған әрбір ' + d.k + ' файл үшін 1 файл тегін беріледі.');
  }
  add('m_word', 'b24.files1', [2, 3], function (r) {
    var d = filesData(r), ans = fr(d.m, d.n), tot = d.n + Math.floor(d.n / d.k);
    return Q(filesStem(d, 0) + ask('Марат ' + d.m + ' файл сатып алуға ақшасының қандай бөлігін жұмсайды?'), filesStem(d, 1) + ask('Какую часть своих денег Марат потратит на покупку ' + d.m + ' файлов?'),
      ans, fracs([fr(1, d.n), fr(d.m, tot), fr(d.m, d.n + d.m), fr(d.m + 1, d.n), fr(d.m * d.p, d.M + d.p)], ans).slice(0, 4),
      d.m + ' файл ' + d.m * d.p + ' теңге. ' + d.m * d.p + '/' + d.M + ' = ' + fs(ans) + ' (' + d.m + ' &lt; ' + d.k + ', сондықтан акция әсер етпейді).',
      pl(d.m, 'файл', 'файла', 'файлов') + ' стоят ' + d.m * d.p + ' тг. ' + d.m * d.p + '/' + d.M + ' = ' + fs(ans) + ' (' + d.m + ' &lt; ' + d.k + ', акция не действует).');
  });
  add('m_word', 'b24.promo', [2, 3], function (r) {
    var d = filesData(r), free = Math.floor(d.n / d.k), tot = d.n + free;
    return Q(filesStem(d, 0) + ask('Марат барлық ақшасын тек файл сатып алуға жұмсаса, барлығы неше файл алады?'), filesStem(d, 1) + ask('Сколько всего файлов получит Марат, если потратит все деньги только на файлы?'),
      tot, ints([d.n, d.n + Math.ceil(d.n / d.k), d.n + Math.floor(d.n / (d.k + 1)), tot + 1, d.n + Math.floor(tot / d.k)], tot, true).slice(0, 4),
      'Сатып алады: ' + d.M + ' : ' + d.p + ' = ' + d.n + ' файл. Тегін: ' + d.n + ' : ' + d.k + ' = ' + free + ' (толық топтар). Барлығы ' + tot + '.',
      'Купит ' + d.M + ' : ' + d.p + ' = ' + pl(d.n, 'файл', 'файла', 'файлов') + '. Бесплатно: ' + d.n + ' : ' + d.k + ' = ' + free + ' (полных групп по ' + d.k + '). Всего ' + tot + '.');
  });

  /* ================= 24. Площадь треугольника BCD (m_geom) ================= */
  add('m_geom', 'b24.tri_area_grid', [2, 3], function (r, lvl) {
    var m = r.int(3, 7), h = r.int(3, 15), iso = lvl === 2 && r.chance(0.35), c = iso ? h : r.int(2, 9), Sabc = c * h / 2, ans = (m - 1) * c * h / 2;
    if (ans % 1) { h++; if (iso) c = h; Sabc = c * h / 2; ans = (m - 1) * c * h / 2; }
    var k = 230 / (m * c), X0 = 40, Y0 = 130, Hp = Math.min(100, h * k), out = '';
    var A = [X0, Y0], B = [X0, Y0 - Hp], C = [X0 + c * k, Y0], D = [X0 + m * c * k, Y0];
    out += poly([B, C, D], null, S_G) + poly([A, B, D], null, S_L) + line(B[0], B[1], C[0], C[1]) + rect(X0, Y0 - 8, 8, 8, null, S_L);
    for (var i = 0; i < m; i++) { var tx = X0 + (i + 0.5) * c * k; out += line(tx, Y0 - 5, tx, Y0 + 5); }
    out += txt(A[0] - 6, A[1] + 14, 'A') + txt(B[0], B[1] - 6, 'B') + txt(C[0], C[1] + 16, 'C') + txt(D[0] + 6, D[1] + 14, 'D');
    if (iso) out += txt(X0 - 12, Y0 - Hp / 2 + 4, h + ' см', 'end') + line(X0 + 3, Y0 - Hp / 2 - 4, X0 - 3, Y0 - Hp / 2 + 4) + line(X0 + c * k / 2 + 3, Y0 - 4, X0 + c * k / 2 - 3, Y0 + 4);
    else out += txt(X0 - 8, Y0 - Hp / 2 + 4, h + ' см', 'end');
    if (lvl === 2 && !iso) out += txt(X0 + c * k / 2, Y0 + 16, c + ' см');
    var kk = iso ? 'Суретте ABD — тікбұрышты үшбұрыш, AC = AB (белгілермен көрсетілген), AB = ' + h + ' см, ал AD ұзындығы AC ұзындығынан ' + m + ' есе көп. BCD үшбұрышының ауданын анықтаңыз.'
      : lvl === 2 ? 'Суретте ABD — тікбұрышты үшбұрыш, AB = ' + h + ' см, AC = ' + c + ' см, ал AD ұзындығы AC ұзындығынан ' + m + ' есе көп. BCD үшбұрышының ауданын анықтаңыз.'
      : 'Суретте ABD — тікбұрышты үшбұрыш, AB = ' + h + ' см, ABC үшбұрышының ауданы ' + fmt(Sabc) + ' см², ал AD = ' + m + ' · AC. BCD үшбұрышының ауданын анықтаңыз.';
    var rr = iso ? 'На рисунке ABD — прямоугольный треугольник, AC = AB (отмечено штрихами), AB = ' + h + ' см, а длина AD в ' + m + ' раза больше AC. Определите площадь треугольника BCD.'
      : lvl === 2 ? 'На рисунке ABD — прямоугольный треугольник, AB = ' + h + ' см, AC = ' + c + ' см, а длина AD в ' + m + ' раза больше AC. Определите площадь треугольника BCD.'
      : 'На рисунке ABD — прямоугольный треугольник, AB = ' + h + ' см, площадь треугольника ABC равна ' + fmt(Sabc) + ' см², а AD = ' + m + ' · AC. Определите площадь треугольника BCD.';
    return P(kk, rr, pic(X0 + m * c * k + 30, Y0 + 24, out), ans, ints([m * c * h / 2, Sabc, ans + Sabc, (m - 1) * c * h], ans, true).slice(0, 4),
      (lvl >= 3 ? 'AC = 2 · S(ABC) : AB = 2 · ' + fmt(Sabc) + ' : ' + h + ' = ' : 'AC = ') + c + ' см, CD = AD − AC = ' + (m - 1) + ' · ' + c + ' = ' + (m - 1) * c + ' см. BCD үшбұрышының биіктігі — AB: S = ' + (m - 1) * c + ' · ' + h + ' : 2 = ' + fmt(ans) + ' см².',
      (lvl >= 3 ? 'AC = 2 · S(ABC) : AB = 2 · ' + fmt(Sabc) + ' : ' + h + ' = ' : 'AC = ') + c + ' см, CD = AD − AC = ' + (m - 1) + ' · ' + c + ' = ' + (m - 1) * c + ' см. Высота треугольника BCD — AB: S = ' + (m - 1) * c + ' · ' + h + ' : 2 = ' + fmt(ans) + ' см².', { unit: unit('см²') });
  });

  /* ================= 25. Какая фигура НЕ развёртка куба (l_visual) ================= */
  function isNet(cells) {
    var S = {}; cells.forEach(function (c) { S[c[0] + ',' + c[1]] = 1; });
    var start = cells[0], seen = {}, used = { B: 1 }, stack = [[start, { b: 'B', t: 'T', n: 'N', s: 'S', e: 'E', w: 'W' }]], ok = true;
    seen[start.join()] = 1;
    var mv = [[1, 0, function (o) { return { b: o.e, t: o.w, e: o.t, w: o.b, n: o.n, s: o.s }; }], [-1, 0, function (o) { return { b: o.w, t: o.e, w: o.t, e: o.b, n: o.n, s: o.s }; }],
      [0, 1, function (o) { return { b: o.s, t: o.n, s: o.t, n: o.b, e: o.e, w: o.w }; }], [0, -1, function (o) { return { b: o.n, t: o.s, n: o.t, s: o.b, e: o.e, w: o.w }; }]];
    while (stack.length) {
      var it = stack.pop(), c = it[0], o = it[1];
      mv.forEach(function (m) {
        var nc = [c[0] + m[0], c[1] + m[1]], k = nc.join();
        if (S[k] && !seen[k]) { var no = m[2](o); seen[k] = 1; if (used[no.b]) ok = false; used[no.b] = 1; stack.push([nc, no]); }
      });
    }
    return ok && Object.keys(used).length === 6;
  }
  function normC(cells) { var mx = Math.min.apply(null, cells.map(function (c) { return c[0]; })), my = Math.min.apply(null, cells.map(function (c) { return c[1]; })); return cells.map(function (c) { return [c[0] - mx, c[1] - my]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }); }
  function tform(cells, t) { return normC(cells.map(function (c) { var x = c[0], y = c[1]; for (var k = 0; k < t % 4; k++) { var tmp = x; x = -y; y = tmp; } if (t >= 4) x = -x; return [x, y]; })); }
  function canonC(cells) { var best = null; for (var t = 0; t < 8; t++) { var k = JSON.stringify(tform(cells, t)); if (best === null || k < best) best = k; } return best; }
  var HEXO = null;
  function hexominoes() {
    if (HEXO) return HEXO;
    var shapes = { '[[0,0]]': 1 };
    for (var n = 1; n < 6; n++) {
      var nx = {};
      Object.keys(shapes).forEach(function (k) {
        var cs = JSON.parse(k);
        cs.forEach(function (c) { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var p = [c[0] + d[0], c[1] + d[1]]; if (cs.some(function (q) { return q[0] === p[0] && q[1] === p[1]; })) return; nx[canonC(cs.concat([p]))] = 1; }); });
      });
      shapes = nx;
    }
    HEXO = Object.keys(shapes).sort().map(function (k) { var cs = JSON.parse(k); return { cells: cs, net: isNet(cs), block: has2x2(cs) }; });
    return HEXO;
  }
  function has2x2(cs) { var S = {}; cs.forEach(function (c) { S[c.join()] = 1; }); return cs.some(function (c) { return S[(c[0] + 1) + ',' + c[1]] && S[c[0] + ',' + (c[1] + 1)] && S[(c[0] + 1) + ',' + (c[1] + 1)]; }); }
  function gridPic(cells, u) {
    var w = Math.max.apply(null, cells.map(function (c) { return c[0]; })) + 1, h = Math.max.apply(null, cells.map(function (c) { return c[1]; })) + 1;
    return osv(w * u + 4, h * u + 4, cells.map(function (c) { return rect(2 + c[0] * u, 2 + c[1] * u, u, u, null, S_W); }).join(''));
  }
  add('l_visual', 'b24.not_net', [2, 3], function (r, lvl) {
    var all = hexominoes(), nets = all.filter(function (h) { return h.net; }), bad = all.filter(function (h) { return !h.net && !h.block && h.cells.length === 6; });
    var askNot = lvl === 2 || r.chance(0.5), u = 15;
    var pick = function (h) { return tform(h.cells, r.int(0, 7)); };
    if (askNot) {
      var odd = pick(r.pick(bad)), good = r.shuffle(nets).slice(0, 3).map(pick);
      var nb = numbered(r, gridPic(odd, u), good.map(function (g) { return gridPic(g, u); }));
      return P('Төмендегі фигуралардың қайсысы текшенің <b>жазбасы бола алмайды</b>?', 'Какая из фигур <b>не является</b> развёрткой куба?', nb.pic, nb.ans, nb.wrong,
        'Әр фигураны ойша бүктейміз: бір шаршыны табан етіп, қалғандарын көтереміз. Үш фигурада 6 жақ түгел шығады, ал біреуінде екі шаршы бір жаққа түсіп қалады — ол жазба емес.',
        'Мысленно складываем каждую фигуру: одну клетку берём за дно, остальные поднимаем. У трёх фигур получаются все 6 граней, а у одной две клетки попадают на одну грань — это не развёртка.');
    }
    var goodOne = pick(r.pick(nets)), bads = r.shuffle(bad).slice(0, 3).map(pick);
    var nb2 = numbered(r, gridPic(goodOne, u), bads.map(function (g) { return gridPic(g, u); }));
    return P('Төмендегі фигуралардың қайсысы текшенің жазбасы <b>бола алады</b>?', 'Какая из фигур <b>является</b> развёрткой куба?', nb2.pic, nb2.ans, nb2.wrong,
      'Ойша бүктегенде тек бір фигурада 6 шаршы текшенің 6 түрлі жағына түседі; қалғандарында екі шаршы бір жаққа түседі.',
      'При мысленном складывании только у одной фигуры 6 клеток попадают на 6 разных граней; у остальных две клетки накладываются.');
  });


  /* ================= 26. Сумма «двухэтажных» дробей (m_frac) ================= */
  add('m_frac', 'b24.two_storey_sum', [2, 3], function (r, lvl) {
    for (;;) {
      var w1 = r.int(1, 4), f1 = rfr(r, 12), g1 = rfr(r, 12), g2 = rfr(r, 12), h1 = rfr(r, 8), extra = lvl >= 3, n4 = r.int(2, 3), j4 = rfr(r, 6);
      var t1 = fr.add(fr(w1, 1), f1), t2 = fr.add(g1, g2), t3 = fr.add(fr(1, 1), h1), t4 = fr.sub(fr(n4, 1), j4);
      var inv = function (t) { return fr.div(fr(1, 1), t); };
      var V = fr.sub(fr.add(inv(t1), inv(t2)), inv(t3));
      if (extra) V = fr.add(V, inv(t4));
      if (V.n <= 0 || V.d > 6 || V.n > 12 || g1.d === g2.d && g1.n === g2.n) continue;
      var F1 = function (f) { return fx(f.n, f.d); };
      var e = fx(1, w1 + ' + ' + F1(f1)) + ' + ' + fx(1, F1(g1) + ' + ' + F1(g2)) + ' − ' + fx(1, '1 + ' + F1(h1)) + (extra ? ' + ' + fx(1, n4 + ' − ' + F1(j4)) : '');
      var noInv = fr.sub(fr.add(t1, t2), t3); if (extra) noInv = fr.add(noInv, t4);
      var plusLast = fr.add(fr.add(inv(t1), inv(t2)), inv(t3)); if (extra) plusLast = fr.add(plusLast, inv(t4));
      var wrong = fracs([noInv, plusLast, fr.add(V, fr(1, 1)), fr(V.n * 2, V.d), fr.div(fr(1, 1), V)], V).filter(function (f) { return f.n > 0; });
      var steps = '1 : ' + fs(t1) + ' = ' + fs(inv(t1)) + '; 1 : ' + fs(t2) + ' = ' + fs(inv(t2)) + '; 1 : ' + fs(t3) + ' = ' + fs(inv(t3)) + (extra ? '; 1 : ' + fs(t4) + ' = ' + fs(inv(t4)) : '');
      return Q('Есептеңіз:' + expr(e + ' = ?'), 'Вычислите:' + expr(e + ' = ?'), V, wrong.slice(0, 4),
        'Әр «екі қабатты» бөлшекте алдымен төменгі қосындыны табамыз, сосын 1-ді соған бөлеміз: ' + steps + '. Нәтиже ' + fs(V) + '.',
        'В каждой «двухэтажной» дроби сначала считаем нижнюю сумму, потом делим на неё 1: ' + steps + '. Итого ' + fs(V) + '.');
    }
  });

  /* ================= 27. Фигура из одинаковых квадратов: периметр (m_geom) ================= */
  function perimEdges(cells) { var S = {}; cells.forEach(function (c) { S[c.join()] = 1; }); var e = 0; cells.forEach(function (c) { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { if (!S[(c[0] + d[0]) + ',' + (c[1] + d[1])]) e++; }); }); return e; }
  function noHoles(cells) {
    var S = {}, mx = 0, my = 0; cells.forEach(function (c) { S[c.join()] = 1; mx = Math.max(mx, c[0]); my = Math.max(my, c[1]); });
    var seen = {}, st = [[-1, -1]], out = 0;
    while (st.length) { var p = st.pop(), k = p.join(); if (seen[k] || S[k] || p[0] < -1 || p[1] < -1 || p[0] > mx + 1 || p[1] > my + 1) continue; seen[k] = 1; out++; st.push([p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]); }
    return out + cells.length === (mx + 3) * (my + 3);
  }
  add('m_geom', 'b24.cross_perimeter', [1, 2], function (r, lvl) {
    var n = lvl === 1 ? 8 : r.int(10, 12), cells;
    for (;;) {
      if (lvl === 1 && r.chance(0.4)) cells = [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [2, 3]].map(function (c) { return c; });
      else { cells = [[0, 0]]; var S = { '0,0': 1 };
        while (cells.length < n) { var c = r.pick(cells), d = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]), p = [c[0] + d[0], c[1] + d[1]]; if (S[p.join()]) continue; S[p.join()] = 1; cells.push(p); } }
      cells = normC(cells);
      var w = Math.max.apply(null, cells.map(function (c) { return c[0]; })) + 1, h = Math.max.apply(null, cells.map(function (c) { return c[1]; })) + 1;
      if (w > 5 || h > 5 || !noHoles(cells)) continue;
      break;
    }
    var a = r.int(2, 12), area = n * a * a, E = perimEdges(cells), ans = E * a, u = 26;
    var out = cells.map(function (c) { return rect(6 + c[0] * u, 6 + c[1] * u, u, u, null, S_W); }).join('');
    return P('Төмендегі фигура ' + n + ' бірдей шаршыдан жасалған. Фигураның ауданы ' + area + ' см². Фигураның периметрін анықтаңыз.',
      'Фигура ниже образована из ' + n + ' одинаковых квадратов. Площадь фигуры ' + area + ' см². Определите периметр фигуры.', pic(w * u + 12, h * u + 12, out),
      ans, ints([4 * n * a, (E + 2) * a, (E - 2) * a, 2 * (n + 1) * a, E * a * a], ans, true).slice(0, 4),
      'Бір шаршының ауданы ' + area + ' : ' + n + ' = ' + a * a + ' см², қабырғасы ' + a + ' см. Шекарадағы қабырғаларды санаймыз: ' + E + '. P = ' + E + ' · ' + a + ' = ' + ans + ' см.',
      'Площадь одного квадрата ' + area + ' : ' + n + ' = ' + a * a + ' см², сторона ' + a + ' см. Считаем стороны на границе: ' + E + '. P = ' + E + ' · ' + a + ' = ' + ans + ' см.', { unit: unit('см') });
  });

  /* ================= 28. Уголок в квадрате (m_geom) ================= */
  add('m_geom', 'b24.corner_square', [3, 4], function (r, lvl) {
    var a = r.int(2, 12), b = a + r.int(2, 10), s = a + b, PL = 4 * s, SL = a * a + 2 * a * b, k = 140 / s, X = 20, Y = 26, out = '';
    out += rect(X, Y, s * k, s * k, null, S_G) + rect(X + a * k, Y + a * k, b * k, b * k, null, S_W) + line(X + a * k, Y, X + a * k, Y + a * k) + line(X, Y + a * k, X + a * k, Y + a * k);
    out += line(X, Y - 8, X + a * k, Y - 8, 'dim') + txt(X + a * k / 2, Y - 12, 'a') + line(X + a * k, Y - 8, X + s * k, Y - 8, 'dim') + txt(X + a * k + b * k / 2, Y - 12, 'b');
    var picQ = pic(s * k + 40, s * k + 36, out);
    var tk = 'Фигура екі түрлі шаршыдан және екі бірдей тіктөртбұрыштан тұрады. ', tr = 'Фигура состоит из двух разных квадратов и двух одинаковых прямоугольников. ';
    if (lvl === 3 && r.chance(0.4)) return P(tk + 'Боялған бөліктің периметрі ' + PL + ' см, ал боялмаған шаршының ауданы ' + b * b + ' см². Боялған бөліктің ауданын анықтаңыз.', tr + 'Периметр закрашенной части ' + PL + ' см, а площадь незакрашенного квадрата ' + b * b + ' см². Определите площадь закрашенной части.', picQ,
      SL, ints([s * s, s * s + b * b, SL + a * a, 2 * a * b, PL * PL / 16 - b], SL, true).slice(0, 4),
      'Боялған «бұрыштың» периметрі үлкен шаршының периметріне тең: 4(a + b) = ' + PL + ' ⇒ үлкен шаршының қабырғасы ' + s + ' см, ауданы ' + s * s + ' см². Боялған бөлік: ' + s * s + ' − ' + b * b + ' = ' + SL + ' см².',
      'Периметр закрашенного «уголка» равен периметру большого квадрата: 4(a + b) = ' + PL + ' ⇒ сторона большого квадрата ' + s + ' см, площадь ' + s * s + ' см². Закрашенная часть: ' + s * s + ' − ' + b * b + ' = ' + SL + ' см².', { unit: unit('см²') });
    if (lvl === 3) return P(tk + 'Боялған бөліктің периметрі ' + PL + ' см, ал ауданы ' + SL + ' см². Боялмаған шаршының ауданын анықтаңыз.', tr + 'Периметр закрашенной части ' + PL + ' см, а площадь ' + SL + ' см². Определите площадь незакрашенного квадрата.', picQ,
      b * b, ints([(b + 1) * (b + 1), (b - 1) * (b - 1), s * s, a * a, SL - b * b], b * b, true).slice(0, 4),
      'Боялған «бұрыштың» периметрі үлкен шаршының периметріне тең: 4(a + b) = ' + PL + ' ⇒ a + b = ' + s + '. Үлкен шаршы ' + s * s + ' см², ақ шаршы ' + s * s + ' − ' + SL + ' = ' + b * b + ' см².',
      'Периметр закрашенного «уголка» равен периметру большого квадрата: 4(a + b) = ' + PL + ' ⇒ a + b = ' + s + '. Большой квадрат ' + s * s + ' см², белый ' + s * s + ' − ' + SL + ' = ' + b * b + ' см².', { unit: unit('см²') });
    return P(tk + 'Боялмаған шаршының периметрі ' + 4 * b + ' см, ал боялған бөліктің ауданы ' + SL + ' см². Боялған кіші шаршының ауданын анықтаңыз.', tr + 'Периметр незакрашенного квадрата ' + 4 * b + ' см, а площадь закрашенной части ' + SL + ' см². Определите площадь закрашенного маленького квадрата.', picQ,
      a * a, ints([(a + 1) * (a + 1), b * b, SL - b * b, s * s - SL, a * b], a * a, true).slice(0, 4),
      'b = ' + 4 * b + ' : 4 = ' + b + '. Үлкен шаршы: ' + SL + ' + ' + b * b + ' = ' + s * s + ' ⇒ a + b = ' + s + ', a = ' + a + '. Кіші шаршы ' + a * a + ' см².',
      'b = ' + 4 * b + ' : 4 = ' + b + '. Большой квадрат: ' + SL + ' + ' + b * b + ' = ' + s * s + ' ⇒ a + b = ' + s + ', a = ' + a + '. Маленький квадрат ' + a * a + ' см².', { unit: unit('см²') });
  });

  /* ================= 29. Цепочка полукругов (m_geom) ================= */
  function splitSum(r, total, parts, minV) { for (;;) { var o = []; for (var i = 0; i < parts - 1; i++) o.push(r.int(minV, Math.max(minV, Math.floor(total / parts * 1.6)))); var last = total - sum(o); if (last >= minV) { o.push(last); return o; } } }
  add('m_geom', 'b24.semicircle_chain', [3, 4], function (r, lvl) {
    var n1 = lvl >= 4 ? 4 : 3, n2 = n1 - 1, d, tg, bg, L;
    for (;;) {
      d = r.int(10, 30) * 2; tg = []; for (var i = 0; i < n1 - 1; i++) tg.push(r.int(4, 15) * 2);
      L = n1 * d + sum(tg);
      bg = splitSum(r, L - n2 * d, n2 + 1, 6);
      if (bg.some(function (x) { return x % 2; }) || bg[0] > d * 1.4 || bg[bg.length - 1] > d * 1.4) continue;
      break;
    }
    var k = 330 / L, X0 = 10, Y = 60, out = line(X0, Y, X0 + L * k, Y, null, 'stroke:var(--muted);stroke-width:1'), x = X0;
    function semi(x0, up) { var R = d * k / 2; return path('M' + r1(x0) + ',' + Y + ' A' + r1(R) + ',' + r1(R) + ' 0 0 ' + (up ? 1 : 0) + ' ' + r1(x0 + 2 * R) + ',' + Y, S_L); }
    function gap(x1, x2, v, up) { var yy = Y + (up ? -6 : 6); return line(x1, yy, x2, yy, 'dim') + txt((x1 + x2) / 2, up ? yy - 4 : yy + 13, v); }
    for (i = 0; i < n1; i++) { out += semi(x, true); x += d * k; if (i < n1 - 1) { out += gap(x, x + tg[i] * k, tg[i], true); x += tg[i] * k; } }
    x = X0;
    for (i = 0; i <= n2; i++) { out += gap(x, x + bg[i] * k, bg[i], false); x += bg[i] * k; if (i < n2) { out += semi(x, false); x += d * k; } }
    var ans = d, eq = n1 + 'd + ' + sum(tg) + ' = ' + n2 + 'd + ' + sum(bg);
    return P(n1 + n2 + ' бірдей жарты шеңбер суретте көрсетілгендей бір түзудің бойына орналастырылған (жоғарғы және төменгі қатардың ұзындықтары бірдей). Жарты шеңбердің диаметрін анықтаңыз.',
      n1 + n2 + ' одинаковых полукругов расположены вдоль прямой, как показано на рисунке (длины верхнего и нижнего рядов равны). Определите диаметр полукруга.', pic(L * k + 20, Y + d * k / 2 + 24, out),
      ans, ints([ans + 4, ans - 4, Math.round(L / (n1 + n2)), sum(bg) - sum(tg) + 2, ans + 2], ans, true).slice(0, 4),
      'Жоғарғы қатар: ' + n1 + 'd + ' + tg.join(' + ') + '; төменгі: ' + n2 + 'd + ' + bg.join(' + ') + '. ' + eq + ' ⇒ d = ' + sum(bg) + ' − ' + sum(tg) + ' = ' + d + '.',
      'Верхний ряд: ' + n1 + 'd + ' + tg.join(' + ') + '; нижний: ' + n2 + 'd + ' + bg.join(' + ') + '. ' + eq + ' ⇒ d = ' + sum(bg) + ' − ' + sum(tg) + ' = ' + d + '.');
  });

  /* ================= 30. Сумма последовательных нечётных (m_divis) ================= */
  add('m_divis', 'b24.consec_odd', [2, 3], function (r, lvl) {
    var k = lvl === 2 ? r.pick([3, 3, 4]) : r.pick([4, 5]), even = lvl >= 3 && r.chance(0.5), x = r.int(5, 60) * 2 + (even ? 0 : 1), S = k * x + k * (k - 1), big = r.chance(0.5), ans = big ? x + 2 * (k - 1) : x;
    var wk = even ? 'жұп' : 'тақ', wr = even ? 'чётных' : 'нечётных';
    return Q('Қатар тұрған ' + k + ' ' + wk + ' санның қосындысы ' + S + '. Олардың ең ' + (big ? 'үлкенін' : 'кішісін') + ' табыңыз.',
      'Сумма ' + k + ' последовательных ' + wr + ' чисел равна ' + S + '. Найдите ' + (big ? 'наибольшее' : 'наименьшее') + ' из них.',
      ans, ints([big ? x : x + 2 * (k - 1), Math.round(S / k), ans + 2, ans - 2, big ? x + k - 1 : x + 1], ans, true).slice(0, 4),
      'Сандар: x, x + 2, …, x + ' + 2 * (k - 1) + '. ' + k + 'x + ' + k * (k - 1) + ' = ' + S + ' ⇒ x = ' + x + '. Сандар: ' + range(k).map(function (i) { return x + 2 * i; }).join(', ') + '.',
      'Числа x, x + 2, …, x + ' + 2 * (k - 1) + '. ' + k + 'x + ' + k * (k - 1) + ' = ' + S + ' ⇒ x = ' + x + '. Числа: ' + range(k).map(function (i) { return x + 2 * i; }).join(', ') + '.');
  });

  /* ================= 31. Линейное неравенство → «x ≤ −1» (m_eq) ================= */
  add('m_eq', 'b24.lin_ineq', [2, 3], function (r, lvl) {
    for (;;) {
      var ds = r.shuffle([2, 3, 4, 6, 5]), d1 = ds[0], d2 = ds[1], d3 = ds[2], d4 = ds[3];
      var a1 = r.int(1, 7), b1 = r.int(-9, 9), a2 = r.int(1, 12), kk = r.int(1, 3), m = r.int(1, 3), a4 = r.int(1, 5);
      if (!b1) continue;
      var A = fr.add(fr.sub(fr(a1, d1), fr(a2, d2)), fr.sub(fr(kk, d3), fr(a4, d4))), C = fr.sub(fr(b1, d1), fr(kk * m, d3));
      if (A.n === 0) continue;
      var V = fr.div(fr(-C.n, C.d), A);
      if (V.d !== 1 || V.n === 0 || Math.abs(V.n) > 9) continue;
      var s = lvl >= 3 ? r.pick(['≥', '≤', '<', '>']) : r.pick(['≥', '≤']), res = A.n < 0 ? FLIP[s] : s, v = V.n;
      var e = fx(lin(a1, b1), d1) + ' − ' + fx((a2 === 1 ? '' : a2) + 'x', d2) + ' ' + HTMLS[s] + ' ' + fx((kk === 1 ? '' : kk) + '(' + m + ' − x)', d3) + ' + ' + fx((a4 === 1 ? '' : a4) + 'x', d4);
      var one = function (sg, val) { return 'x ' + HTMLS[sg] + ' ' + num(val); };
      return Q('Теңсіздікті шешіңіз:' + expr(e), 'Решите неравенство:' + expr(e), one(res, v), [one(FLIP[res], v), one(res, -v), one(FLIP[res], -v)],
        'Барлығын сол жаққа жинаймыз: x-тің коэффициенті ' + fs(A) + ', бос мүше ' + fs(C) + '. ' + fs(A) + 'x ' + HTMLS[s] + ' ' + fs(fr(-C.n, C.d)) + '. ' + (A.n < 0 ? 'Теріс санға бөлеміз — таңба ауысады: ' : 'Бөлеміз: ') + one(res, v) + '.',
        'Переносим всё влево: коэффициент при x ' + fs(A) + ', свободный член ' + fs(C) + '. ' + fs(A) + 'x ' + HTMLS[s] + ' ' + fs(fr(-C.n, C.d)) + '. ' + (A.n < 0 ? 'Делим на отрицательное — знак меняется: ' : 'Делим: ') + one(res, v) + '.');
    }
  });

  /* ================= 32. |ax + b| ≤ c — целые решения (m_abs) ================= */
  add('m_abs', 'b24.abs_int_count', [3, 4], function (r, lvl) {
    for (;;) {
      var a = r.int(2, 4), b = r.int(-7, 7), c = r.int(3, 11), strict = lvl >= 4 && r.chance(0.5);
      if (b % a === 0) continue;
      var lo = (-c - b) / a, hi = (c - b) / a, xs = [];
      for (var x = Math.ceil(lo); x <= Math.floor(hi); x++) if (strict ? Math.abs(a * x + b) < c : Math.abs(a * x + b) <= c) xs.push(x);
      if (xs.length < 2 || xs.length > 7) continue;
      var e = '|' + a + 'x' + pm(b) + '| ' + (strict ? LT : '≤') + ' ' + c, setS = function (l) { return '{' + l.map(num).join('; ') + '}'; };
      var askSet = lvl === 3 || r.chance(0.3), loF = fs(fr(-c - b, a)), hiF = fs(fr(c - b, a));
      var sk = (strict ? '−' + c + ' &lt; ' : '−' + c + ' ≤ ') + a + 'x' + pm(b) + (strict ? ' &lt; ' : ' ≤ ') + c + ' ⇒ ' + loF + (strict ? ' &lt; x &lt; ' : ' ≤ x ≤ ') + hiF + '. Бүтін шешімдер: ' + setS(xs) + '.';
      var sr = sk.replace('Бүтін шешімдер', 'Целые решения');
      if (askSet) {
        var first = xs[0], lastX = xs[xs.length - 1];
        return Q('Теңсіздікті шешіңіз және оның шешімдері болатын барлық бүтін сандар жиынын анықтаңыз:' + expr(e), 'Решите неравенство и найдите множество всех целых чисел, которые являются его решениями:' + expr(e),
          setS(xs), [setS([first - 1].concat(xs)), setS(xs.concat([lastX + 1])), setS(xs.slice(1)), setS(xs.slice(0, -1))].slice(0, 3).concat([]).filter(function (s) { return s !== '{}'; }), sk, sr);
      }
      var sumX = sum(xs);
      var askSum = r.chance(0.5);
      return Q('Теңсіздіктің ' + (askSum ? 'барлық бүтін шешімдерінің қосындысын' : 'бүтін шешімдерінің санын') + ' табыңыз:' + expr(e), 'Найдите ' + (askSum ? 'сумму всех целых решений' : 'количество целых решений') + ' неравенства:' + expr(e),
        askSum ? sumX : xs.length, askSum ? ints([sumX + xs[0] - 1, sumX + xs[xs.length - 1] + 1, -sumX, sumX + 1, sumX - 1], sumX) : ints([xs.length + 1, xs.length - 1, xs.length + 2, 2 * c + 1], xs.length, true), sk + (askSum ? ' Қосынды ' + num(sumX) + '.' : ' Саны ' + xs.length + '.'), sr + (askSum ? ' Сумма ' + num(sumX) + '.' : ' Количество ' + xs.length + '.'));
    }
  });

  /* ================= 33. 27/4 + 5|x| = 56,75 (m_abs) ================= */
  add('m_abs', 'b24.abs_eq_dec', [2, 3], function (r, lvl) {
    for (;;) {
      var q = r.pick([2, 4, 5, 8, 20]), p = r.int(q + 1, 8 * q), k = r.int(2, 9), m = r.int(2, 15), h = lvl >= 3 ? r.pick([-4, -3, -2, -1, 1, 2, 3, 4, 5]) : 0;
      if (gcd(p, q) > 1) continue;
      var D = p / q + k * m;
      var inner = h ? '|x' + pm(-h) + '|' : '|x|', e = fx(p, q) + ' + ' + k + inner + ' = ' + fmt(D);
      var pair = function (a, b) { var s = [a, b].sort(function (u, v) { return u - v; }); return s[0] === s[1] ? num(s[0]) : num(s[0]) + '; ' + num(s[1]); };
      var ans = pair(h - m, h + m), mw = Math.round(D / k), cands = [pair(-h - m, -h + m), pair(h - m - 5, h + m + 5), pair(h - mw, h + mw), pair(h - 2 * m, h + 2 * m), pair(h, h + m), pair(h - m + 1, h + m - 1)];
      var wrong = uniq(ans, cands, String, 3);
      if (wrong.length < 3) continue;
      return Q('Теңдеуді шешіңіз:' + expr(e), 'Решите уравнение:' + expr(e), ans, wrong,
        fx(p, q).replace(/<[^>]+>/g, '') && (p + '/' + q + ' = ' + fmt(p / q) + '. ' + k + inner + ' = ' + fmt(D) + ' − ' + fmt(p / q) + ' = ' + k * m + ', ' + inner + ' = ' + m + '. ' + (h ? 'x' + pm(-h) + ' = ±' + m + ' ⇒ ' : 'x = ±' + m + ': ') + ans + '.'),
        p + '/' + q + ' = ' + fmt(p / q) + '. ' + k + inner + ' = ' + fmt(D) + ' − ' + fmt(p / q) + ' = ' + k * m + ', ' + inner + ' = ' + m + '. ' + (h ? 'x' + pm(-h) + ' = ±' + m + ' ⇒ ' : 'x = ±' + m + ': ') + ans + '.');
    }
  });

  /* ================= 34. Какая фигура закрашена на 1/4 (m_frac) ================= */
  function qfGrid(r, m, n, k) {
    var u = Math.min(64 / m, 64 / n), on = r.shuffle(range(m * n)).slice(0, k), o = '';
    for (var i = 0; i < m * n; i++) o += rect(4 + (i % m) * u, 4 + Math.floor(i / m) * u, u, u, null, on.indexOf(i) >= 0 ? S_G : S_W);
    return { s: osv(m * u + 8, n * u + 8, o), v: fr(k, m * n), id: 'g' + m + n + k };
  }
  function qfSectors(r, angles, shaded) {
    var R = 32, c = 36, o = '', acc = 0, tot = sum(angles);
    angles.forEach(function (a, i) {
      var a1 = acc / tot * 2 * Math.PI, a2 = (acc + a) / tot * 2 * Math.PI; acc += a;
      o += path('M' + c + ',' + c + ' L' + r1(c + R * Math.sin(a1)) + ',' + r1(c - R * Math.cos(a1)) + ' A' + R + ',' + R + ' 0 ' + (a2 - a1 > Math.PI ? 1 : 0) + ' 1 ' + r1(c + R * Math.sin(a2)) + ',' + r1(c - R * Math.cos(a2)) + ' Z', shaded.indexOf(i) >= 0 ? S_G : S_W);
    });
    var v = fr(sum(shaded.map(function (i) { return angles[i]; })), tot);
    return { s: osv(72, 72, o), v: v, id: 's' + angles.join('.') + '/' + shaded.join('.') };
  }
  function qfStrips(which) {   // круг, разрезанный 3 хордами на 4 полосы РАВНОЙ ширины — полосы не равны по площади
    var R = 32, c = 36, o = circ(c, c, R, S_W);
    var xs = [-R, -R / 2, 0, R / 2, R];
    var x1 = xs[which], x2 = xs[which + 1], seg = function (x) { return Math.sqrt(R * R - x * x); };
    var pts = []; for (var t = 0; t <= 16; t++) { var xx = x1 + (x2 - x1) * t / 16; pts.push([c + xx, c - seg(xx)]); }
    for (t = 16; t >= 0; t--) { xx = x1 + (x2 - x1) * t / 16; pts.push([c + xx, c + seg(xx)]); }
    o += poly(pts, null, S_G);
    [-R / 2, 0, R / 2].forEach(function (x) { o += line(c + x, c - seg(x), c + x, c + seg(x)); });
    o += circ(c, c, R, S_L);
    return { s: osv(72, 72, o), v: null, id: 'st' + which };
  }
  function qfTri8(r, k) {   // квадрат: диагонали + средние линии → 8 равных треугольников
    var S = 64, o = '', c = [36, 36], P = [[4, 4], [36, 4], [68, 4], [68, 36], [68, 68], [36, 68], [4, 68], [4, 36]], on = r.shuffle(range(8)).slice(0, k);
    for (var i = 0; i < 8; i++) o += poly([c, P[i], P[(i + 1) % 8]], null, on.indexOf(i) >= 0 ? S_G : S_W);
    void S;
    return { s: osv(72, 72, o), v: fr(k, 8), id: 't8' + on.sort().join('') };
  }
  add('m_frac', 'b24.quarter_shaded', [1, 2], function (r) {
    var good = r.pick([function () { return qfGrid(r, 4, 3, 3); }, function () { return qfGrid(r, 4, 4, 4); }, function () { return qfTri8(r, 2); }, function () { return qfSectors(r, rep(1, 12), r.shuffle(range(12)).slice(0, 3)); }, function () { return qfGrid(r, 4, 2, 2); }])();
    var traps = r.shuffle([
      function () { return qfStrips(r.pick([1, 2])); },
      function () { return qfSectors(r, r.shuffle([110, 70, 100, 80]), [r.int(0, 3)]); },
      function () { return qfGrid(r, 3, 3, 2); },
      function () { return qfTri8(r, 3); },
      function () { return qfSectors(r, rep(1, 5), [r.int(0, 4)]); },
      function () { return qfGrid(r, 5, 2, 3); },
      function () { return qfSectors(r, rep(1, 6), [0, 3]); }
    ]).slice(0, 3).map(function (f) { return f(); });
    var desc = function (L) { return traps.map(function (t) { return t.v ? fs(t.v) : (L ? 'полосы одинаковой ширины, но разной площади' : 'жолақтардың ені бірдей, бірақ аудандары әртүрлі'); }).join('; '); };
    var nb = numbered(r, good.s, traps.map(function (t) { return t.s; }));
    return P('Қай фигураның ' + fx(1, 4) + ' бөлігі боялған?', 'Какая из фигур закрашена на ' + fx(1, 4) + '?', nb.pic, nb.ans, nb.wrong,
      'Тек тең бөліктерді санауға болады. Дұрысы: ' + fs(good.v) + ' = 1/4. Қалғандары: ' + desc(0) + '.', 'Считать части можно, только если они равны. Верная: ' + fs(good.v) + ' = 1/4. Остальные: ' + desc(1) + '.');
  });

  /* ================= 35. Расставить 1…8 в примеры (l_op) ================= */
  var OPF = { '÷': function (a, b) { return a % b === 0 ? a / b : NaN; }, '×': function (a, b) { return a * b; }, '−': function (a, b) { return a - b; }, '+': function (a, b) { return a + b; } };
  add('l_op', 'b24.place_digits', [2, 3], function (r, lvl) {
    var n = lvl >= 3 ? 10 : 8, ops = lvl >= 3 ? ['÷', '×', '−', '+', '+'] : ['÷', '×', '−', '+'];
    for (var tries = 0; ; tries++) {
      var perm = r.shuffle(range(n).map(function (i) { return i + 1; })), eqs = [], ok = true;
      ops.forEach(function (o, i) { var a = perm[2 * i], b = perm[2 * i + 1]; if (o === '÷' || o === '−') { if (a < b) { var t = a; a = b; b = t; } } var v = OPF[o](a, b); if (!(v > 0) || v % 1) ok = false; eqs.push({ o: o, v: v }); });
      if (!ok) continue;
      var askI = ops.length - 1;   // спрашиваем «+» (последний)
      if (lvl >= 3 && r.chance(0.5)) askI = 1;   // или «×»
      // перебор: все способы удовлетворить известные равенства; значение спрашиваемого должно быть единственным
      var given = eqs.map(function (e, i) { return i; }).filter(function (i) { return i !== askI; }), answers = {}, cnt = 0;
      (function bt(j, used) {
        if (cnt > 2000) return;
        if (j === given.length) { var rest = []; for (var d = 1; d <= n; d++) if (!used[d]) rest.push(d); answers[OPF[ops[askI]](rest[0], rest[1])] = 1; cnt++; return; }
        var e = eqs[given[j]];
        for (var a = 1; a <= n; a++) for (var b = 1; b <= n; b++) if (a !== b && !used[a] && !used[b] && OPF[e.o](a, b) === e.v) { used[a] = used[b] = 1; bt(j + 1, used); used[a] = used[b] = 0; }
      })(0, {});
      var keys = Object.keys(answers);
      if (keys.length !== 1) continue;
      var ans = +keys[0], out = '';
      eqs.forEach(function (e, i) {
        var y = 8 + i * 30;
        out += rect(10, y, 22, 22, null, S_W) + txt(43, y + 16, e.o) + rect(54, y, 22, 22, null, S_W) + txt(88, y + 16, '=') + txt(100, y + 16, i === askI ? 'A' : e.v, 'start', i === askI ? 'big' : '');
      });
      var sol = eqs.map(function (e, i) { return perm[2 * i] + ' ' + e.o + ' ' + perm[2 * i + 1]; });
      void sol;
      return P('Төмендегі ұяшықтарға 1, 2, …, ' + n + ' сандарын (әрқайсысын бір реттен) барлық теңдіктер орындалатындай етіп орналастырыңыз. A санын анықтаңыз.',
        'Расставьте в клетки числа 1, 2, …, ' + n + ' (каждое по одному разу) так, чтобы все равенства выполнялись. Определите число A.', pic(130, ops.length * 30 + 10, out),
        ans, ints([ans + 1, ans - 1, ans + 2, ans - 3, ans * 2], ans, true).slice(0, 4),
        'Ең аз нұсқасы бар теңдіктен бастаймыз (' + ops.map(function (o, i) { return i === askI ? '' : o; }).filter(Boolean).join(', ') + '), қолданылған сандарды сызып отырамыз. Қалған екі сан A-ны береді: A = ' + ans + '.',
        'Начинаем с равенства, у которого меньше всего вариантов, и вычёркиваем использованные числа. Оставшиеся два числа дают A = ' + ans + '.');
    }
  });

  /* ================= 36. Числовой луч с делениями (m_dec) ================= */
  add('m_dec', 'b24.numray', [1, 2], function (r, lvl) {
    var n = r.int(1, 9), k = lvl === 1 ? r.pick([8, 4, 5]) : r.pick([8, 5, 4]), step = lvl === 1 ? r.pick([1, 1, 10]) : r.pick([0.2, 0.4]), a = lvl === 1 ? n * step : Math.round((n + step * r.int(0, 3)) * 10) / 10, b = Math.round((a + step) * 10) / 10;
    var j = r.int(1, k - 1), ans = Math.round((a + step * j / k) * 1e6) / 1e6, out = '', X1 = 110, X2 = 290;
    out += line(10, 40, 330, 40) + poly([[336, 40], [328, 36], [328, 44]], null, S_K);
    if (lvl === 1) { out += line(30, 34, 30, 46) + txt(30, 62, fmt(a - step)); }
    out += line(X1, 32, X1, 48) + txt(X1, 64, fmt(a)) + line(X2, 32, X2, 48) + txt(X2, 64, fmt(b));
    for (var i = 1; i < k; i++) { var x = X1 + (X2 - X1) * i / k; out += circ(x, 40, i === j ? 4.5 : 2.5, S_K); if (i === j) out += txt(x, 24, 'A', 'middle', 'big'); }
    var wrong = [Math.round((a + step * j / 10) * 1e6) / 1e6, Math.round(step * j / k * 1e6) / 1e6, Math.round((a + step * (j + 1) / k) * 1e6) / 1e6, Math.round((a + step * j / (k + 1)) * 1000) / 1000, Math.round((a + step * j / k / 10) * 1e6) / 1e6].filter(function (v, i2, arr) { return v !== ans && arr.indexOf(v) === i2; });
    return P('Сандық сәуледе ' + fmt(a) + ' және ' + fmt(b) + ' сандарының арасы ' + k + ' тең бөлікке бөлінген. A нүктесінің координатасын анықтаңыз.',
      'Числовой луч между ' + fmt(a) + ' и ' + fmt(b) + ' разделён на ' + k + ' равных частей. Определите координату точки A.', pic(345, 74, out), ans, wrong.slice(0, 4),
      'Бір бөлік: ' + fmt(step) + ' : ' + k + ' = ' + fmt(step / k) + '. A — ' + j + '-бөлік: ' + fmt(a) + ' + ' + j + ' · ' + fmt(step / k) + ' = ' + fmt(ans) + '.',
      'Одно деление: ' + fmt(step) + ' : ' + k + ' = ' + fmt(step / k) + '. A — ' + j + '-е деление: ' + fmt(a) + ' + ' + j + ' · ' + fmt(step / k) + ' = ' + fmt(ans) + '.');
  });

  /* ================= 37. Цены вишни и персиков (m_ratio) ================= */
  add('m_ratio', 'b24.fruit_prices', [2, 3], function (r, lvl) {
    for (;;) {
      if (lvl === 2) {
        var rho = r.pick([1.5, 2, 2.5, 1.2]), Pp = 100 * r.int(3, 12), x = r.pick([1.5, 2, 2.5, 3]), y = r.pick([1, 2, 3, 4]), T = x * rho * Pp + y * Pp, askP = r.chance(0.6), ans = askP ? Pp : rho * Pp;
        if (T % 10 || ans % 1) continue;
        return Q('1 кг шие мен ' + fmt(rho) + ' кг шабдалының бағасы бірдей. Әмина ' + fmt(x) + ' кг шие мен ' + y + ' кг шабдалыны ' + T + ' теңгеге сатып алды. 1 кг ' + (askP ? 'шабдалы' : 'шие') + ' қанша теңге тұрады?',
          '1 кг вишни стоит столько же, сколько ' + fmt(rho) + ' кг персиков. Амина потратила ' + T + ' тг на ' + fmt(x) + ' кг вишни и ' + y + ' кг персиков. Сколько стоит 1 кг ' + (askP ? 'персиков' : 'вишни') + '?',
          ans, ints([askP ? rho * Pp : Pp, Math.round(T / (x + y)), ans + 100, ans - 100], ans, true).slice(0, 4),
          'Шие бағасын шабдалымен өрнектейміз: ' + fmt(x) + ' кг шие = ' + fmt(x * rho) + ' кг шабдалы. Барлығы ' + fmt(x * rho + y) + ' кг шабдалы = ' + T + ' ⇒ 1 кг шабдалы ' + Pp + ' тг, шие ' + fmt(rho * Pp) + ' тг.',
          'Выражаем вишню через персики: ' + fmt(x) + ' кг вишни = ' + fmt(x * rho) + ' кг персиков. Всего ' + fmt(x * rho + y) + ' кг персиков = ' + T + ' ⇒ 1 кг персиков ' + Pp + ' тг, вишни ' + fmt(rho * Pp) + ' тг.', { unit: unit('тг') });
      }
      var r1v = r.pick([1.5, 2, 2.5]), r2 = r.pick([2, 3, 1.5]), Aa = 50 * r.int(2, 8), Pe = r2 * Aa, Ch = r1v * Pe, xa = r.int(1, 4), xp = r.int(1, 3), xc = r.pick([0.5, 1, 1.5, 2]), T2 = xa * Aa + xp * Pe + xc * Ch;
      if (T2 % 10 || Pe % 1 || Ch % 10) continue;
      var askW = r.pick(['a', 'c']), ans2 = askW === 'a' ? Aa : Ch;
      return Q('1 кг шие ' + fmt(r1v) + ' кг шабдалымен, ал 1 кг шабдалы ' + fmt(r2) + ' кг алмамен бағасы бірдей. ' + fmt(xc) + ' кг шие, ' + xp + ' кг шабдалы және ' + xa + ' кг алма барлығы ' + T2 + ' теңге тұрады. 1 кг ' + (askW === 'a' ? 'алма' : 'шие') + ' қанша тұрады?',
        '1 кг вишни стоит как ' + fmt(r1v) + ' кг персиков, а 1 кг персиков — как ' + fmt(r2) + ' кг яблок. ' + fmt(xc) + ' кг вишни, ' + xp + ' кг персиков и ' + xa + ' кг яблок стоят вместе ' + T2 + ' тг. Сколько стоит 1 кг ' + (askW === 'a' ? 'яблок' : 'вишни') + '?',
        ans2, ints([askW === 'a' ? Pe : Aa, Math.round(T2 / (xa + xp + xc)), ans2 + 50, ans2 - 50, ans2 * 2], ans2, true).slice(0, 4),
        'Бәрін алмаға келтіреміз: 1 кг шабдалы = ' + fmt(r2) + ' кг алма, 1 кг шие = ' + fmt(r1v * r2) + ' кг алма. Барлығы ' + fmt(xa + xp * r2 + xc * r1v * r2) + ' кг алма = ' + T2 + ' ⇒ алма ' + Aa + ' тг, шабдалы ' + fmt(Pe) + ' тг, шие ' + fmt(Ch) + ' тг.',
        'Всё переводим в яблоки: 1 кг персиков = ' + fmt(r2) + ' кг яблок, 1 кг вишни = ' + fmt(r1v * r2) + ' кг яблок. Всего ' + fmt(xa + xp * r2 + xc * r1v * r2) + ' кг яблок = ' + T2 + ' ⇒ яблоки ' + Aa + ' тг, персики ' + fmt(Pe) + ' тг, вишня ' + fmt(Ch) + ' тг.', { unit: unit('тг') });
    }
  });

  /* ================= 38. Коробка на боку (m_volume) ================= */
  function boxPic(w, h, dp, u, fillW, label) {   // косоугольная коробка: ширина w, высота h, глубина dp; слой кубиков на дне шириной fillW
    var X = 10, Y = 10 + h * u + dp * u * 0.5, kx = u * 0.5, out = '';
    for (var i = 0; i < fillW; i++) for (var j = dp - 1; j >= 0; j--) {
      var x = X + i * u + j * kx, y = Y - j * kx;
      out += rect(x, y - u, u, u, 'vcf') + poly([[x, y - u], [x + kx, y - u - kx], [x + u + kx, y - u - kx], [x + u, y - u]], 'vct') + (i === fillW - 1 ? poly([[x + u, y], [x + u, y - u], [x + u + kx, y - u - kx], [x + u + kx, y - kx]], 'vcr') : '');
    }
    var W = w * u, Hh = h * u, D = dp * kx;
    out += rect(X, Y - Hh, W, Hh, null, S_L) + path('M' + X + ',' + (Y - Hh) + ' l' + D + ',' + (-D) + ' h' + W + ' l' + (-D) + ',' + D + ' M' + (X + W) + ',' + Y + ' l' + D + ',' + (-D) + ' v' + (-Hh), S_L) +
      path('M' + X + ',' + Y + ' l' + D + ',' + (-D) + ' h' + W + ' M' + (X + D) + ',' + (Y - D) + ' v' + (-Hh), S_D);
    return svgEl(W + D + 20, Hh + D + 34, out + txt((W + D) / 2 + 10, Hh + D + 30, label, 'middle', 'ax'));
  }
  add('m_volume', 'b24.box_on_side', [3, 4], function (r, lvl) {
    for (;;) {
      var a = r.int(3, 6), b = r.int(a + 1, 8), p = r.pick([50, 40, 25, 75, 60, 20]), c = 100 * a / p;
      if (c % 1 || c <= b || c > 16) continue;
      var V = a * b * c, more = V - a * b, ans = lvl >= 4 ? more : V, u = Math.min(14, 150 / c);
      var picQ = figs([boxPic(b, c, a, u, b, 'дейін / до'), boxPic(c, a, b, u, Math.round(c * p / 100), 'кейін / после')]);
      return P('Қайрат тікбұрышты қораптың ' + a + ' × ' + b + ' табанын бірдей текшелермен (бір қабат) толық толтырды. Содан кейін суреттегідей қорапты бүйіріне жатқызды (ұзындығы ' + a + ' текшеге тең қыры енді тігінен тұр): енді сол текшелер жаңа табанның ' + p + '%-ын жапты. ' + (lvl >= 4 ? 'Қорапты толтыру үшін тағы неше текше қажет?' : 'Қорапты толығымен толтыру үшін барлығы неше текше қажет?'),
        'Кайрат полностью заполнил основание ' + a + ' × ' + b + ' прямоугольной коробки одинаковыми кубиками (один слой). Затем он положил коробку на бок, как на рисунке (ребро длиной ' + pl(a, 'кубик', 'кубика', 'кубиков') + ' теперь стоит вертикально): теперь те же кубики закрыли ' + p + '% нового основания. ' + (lvl >= 4 ? 'Сколько ещё кубиков нужно, чтобы заполнить коробку?' : 'Сколько всего кубиков нужно, чтобы полностью заполнить коробку?'),
        picQ, ans, ints([lvl >= 4 ? V : more, a * b * 100 / p, V / 2, ans + a * b, b * c * a / 2 + a], ans, true).slice(0, 4),
        'Текшелер саны ' + a + ' · ' + b + ' = ' + a * b + '. Жаңа табан ' + b + ' × c, оның ' + p + '%-ы = ' + a * b + ' ⇒ ' + b + 'c = ' + a * b * 100 / p + ', c = ' + c + '. Көлемі ' + a + ' · ' + b + ' · ' + c + ' = ' + V + (lvl >= 4 ? ', тағы ' + V + ' − ' + a * b + ' = ' + more : '') + '.',
        'Кубиков ' + a + ' · ' + b + ' = ' + a * b + '. Новое основание ' + b + ' × c, ' + p + '% от него = ' + a * b + ' ⇒ ' + b + 'c = ' + a * b * 100 / p + ', c = ' + c + '. Объём ' + a + ' · ' + b + ' · ' + c + ' = ' + V + (lvl >= 4 ? ', ещё ' + V + ' − ' + a * b + ' = ' + more : '') + '.');
    }
  });

  /* ================= 39. Ребус 1a2a + a31 = 2659 (l_digits) ================= */
  function tplVal(t, env) { return +t.map(function (c) { return typeof c === 'number' ? c : env[c]; }).join(''); }
  function tplTxt(t) { return t.map(function (c) { return typeof c === 'number' ? c : '<i>' + c + '</i>'; }).join(''); }
  add('l_digits', 'b24.rebus_add', [2, 3], function (r, lvl) {
    var two = lvl >= 3;
    for (;;) {
      var t1 = [r.int(1, 9), 'a', r.int(0, 9), two ? 'b' : 'a'], t2 = two ? ['b', r.int(0, 9), 'a'] : ['a', r.int(0, 9), r.int(0, 9)];
      if (r.chance(0.5)) t1 = [r.int(1, 9), r.int(0, 9), 'a', two ? 'b' : 'a'];
      var a = r.int(1, 9), b = two ? r.int(1, 9) : 0, S = tplVal(t1, { a: a, b: b }) + tplVal(t2, { a: a, b: b }), sols = [];
      for (var x = 1; x <= 9; x++) for (var y = two ? 1 : 0; y <= (two ? 9 : 0); y++) if (tplVal(t1, { a: x, b: y }) + tplVal(t2, { a: x, b: y }) === S) sols.push([x, y]);
      if (sols.length !== 1 || two && a === b) continue;
      var ans = two ? a + b : a, wrong = ints([ans + 1, ans - 1, ans + 2, ans - 2, 9 - ans + 1], ans, true).filter(function (v) { return two || v <= 9; });
      return Q((two ? 'a мен b — әртүрлі цифрлар. ' : '') + 'Төрт таңбалы ' + tplTxt(t1) + ' және үш таңбалы ' + tplTxt(t2) + ' сандарының қосындысы ' + S + '. ' + (two ? 'a + b мәнін' : 'a мәнін') + ' анықтаңыз.',
        (two ? 'a и b — различные цифры. ' : '') + 'Сумма четырёхзначного числа ' + tplTxt(t1) + ' и трёхзначного ' + tplTxt(t2) + ' равна ' + S + '. Определите ' + (two ? 'значение a + b' : 'значение a') + '.',
        ans, wrong.slice(0, 4), 'Разрядтармен жазамыз да, бірліктерден бастап тексереміз (көшіруді ұмытпай). Жалғыз мүмкіндік: a = ' + a + (two ? ', b = ' + b + ', a + b = ' + ans : '') + '. Тексеру: ' + tplVal(t1, { a: a, b: b }) + ' + ' + tplVal(t2, { a: a, b: b }) + ' = ' + S + '.',
        'Раскладываем по разрядам и проверяем, начиная с единиц (не забывая перенос). Единственный вариант: a = ' + a + (two ? ', b = ' + b + ', a + b = ' + ans : '') + '. Проверка: ' + tplVal(t1, { a: a, b: b }) + ' + ' + tplVal(t2, { a: a, b: b }) + ' = ' + S + '.');
    }
  });

  /* ================= 40. Окрашенная фигура из кубиков (l_visual) ================= */
  // Видимость проверяется растеризацией: каждый кубик должен иметь на рисунке видимый кусок.
  function inConvex(pt, poly4) {
    var s = 0;
    for (var i = 0; i < poly4.length; i++) {
      var a = poly4[i], b = poly4[(i + 1) % poly4.length], cr = (b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]);
      if (cr !== 0) { if (s === 0) s = cr > 0 ? 1 : -1; else if ((cr > 0 ? 1 : -1) !== s) return false; }
    }
    return true;
  }
  add('l_visual', 'b24.painted_shape', [3, 4], function (r, lvl) {
    var C = 3, D = lvl >= 4 ? 3 : 2 + r.int(0, 1), s = 34, k = 16, hmax = 3;
    for (var tries = 0; ; tries++) {
      var h = [], c, d, z, cubes = [], S = {};
      for (c = 0; c < C; c++) { h.push([]); for (d = 0; d < D; d++) h[c].push(r.int(0, Math.min(hmax, d + 1 + (D === 2 ? 1 : 0)))); }   // передние башни ниже — задние видны
      for (c = 0; c < C; c++) for (d = 0; d < D; d++) for (z = 0; z < h[c][d]; z++) { cubes.push([c, d, z]); S[c + ',' + d + ',' + z] = 1; }
      var n = cubes.length, lo = lvl >= 4 ? 11 : 9, hi = lvl >= 4 ? 13 : 11;
      if (n < lo || n > hi) continue;
      // связность
      var seen = {}, st = [cubes[0]], cnt = 0;
      while (st.length) { var p = st.pop(), kk = p.join(); if (seen[kk] || !S[kk]) continue; seen[kk] = 1; cnt++; [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(function (q) { st.push([p[0] + q[0], p[1] + q[1], p[2] + q[2]]); }); }
      if (cnt !== n) continue;
      if (cubes.some(function (q) { return S[q[0] + ',' + q[1] + ',' + (q[2] + 1)] && (q[1] === 0 ? false : S[q[0] + ',' + (q[1] - 1) + ',' + q[2]]) && S[(q[0] + 1) + ',' + q[1] + ',' + q[2]]; })) continue;   // явно закрытый кубик
      // рисунок и видимость
      var ox = 8, oy = hmax * s + D * k + 8, polys = [], out = '';
      for (d = D - 1; d >= 0; d--) for (c = 0; c < C; c++) { var fx0 = ox + c * s + d * k, fy0 = oy - d * k; out += poly([[fx0, fy0], [fx0 + k, fy0 - k], [fx0 + s + k, fy0 - k], [fx0 + s, fy0]], 'vfl'); }
      for (d = D - 1; d >= 0; d--) for (c = 0; c < C; c++) for (z = 0; z < h[c][d]; z++) {
        var X = ox + c * s + d * k, Y = oy - z * s - d * k, id = c + ',' + d + ',' + z;
        var fr0 = [[X, Y], [X + s, Y], [X + s, Y - s], [X, Y - s]], tp = [[X, Y - s], [X + k, Y - s - k], [X + s + k, Y - s - k], [X + s, Y - s]], rt = [[X + s, Y], [X + s, Y - s], [X + s + k, Y - s - k], [X + s + k, Y - k]];
        polys.push([fr0, id], [tp, id], [rt, id]);
        out += poly(fr0, 'vcf') + poly(tp, 'vct') + poly(rt, 'vcr');
      }
      var W = ox + C * s + D * k + 8, Hh = oy + 8, area = {}, buf = {}, x, y, i;
      for (i = 0; i < polys.length; i++) {   // рисуем по порядку в буфер (шаг 1,5 px): поздний полигон закрывает ранний
        var pp = polys[i][0], x1 = Math.min.apply(null, pp.map(function (t) { return t[0]; })), x2 = Math.max.apply(null, pp.map(function (t) { return t[0]; })), y1 = Math.min.apply(null, pp.map(function (t) { return t[1]; })), y2 = Math.max.apply(null, pp.map(function (t) { return t[1]; }));
        for (y = Math.ceil(y1 / 1.5) * 1.5; y <= y2; y += 1.5) for (x = Math.ceil(x1 / 1.5) * 1.5; x <= x2; x += 1.5) if (inConvex([x, y], pp)) buf[x + ',' + y] = polys[i][1];
      }
      for (var key in buf) area[buf[key]] = (area[buf[key]] || 0) + 1;
      if (cubes.some(function (q) { return (area[q.join()] || 0) < 40; })) continue;
      var painted = cubes.map(function (q) { var nb = 0; [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(function (e) { if (S[(q[0] + e[0]) + ',' + (q[1] + e[1]) + ',' + (q[2] + e[2])]) nb++; }); return 6 - nb; });
      var byK = {}; painted.forEach(function (v) { byK[v] = (byK[v] || 0) + 1; });
      var ks = Object.keys(byK).map(Number).filter(function (v) { return v >= 2; });
      if (ks.length < 2) continue;
      var K = r.pick(ks), ans = byK[K];
      var wrong = ints([byK[K - 1] || 0, byK[K + 1] || 0, ans + 1, ans - 1, ans + 2], ans).filter(function (v) { return v >= 0; });
      var dist = Object.keys(byK).sort().map(function (v) { return v + ' — ' + byK[v]; }).join(', ');
      return P('Суреттегі фигура ' + n + ' бірдей текшеден құрастырылған (әр текше үстелде немесе басқа текшенің үстінде тұр, жасырын текше жоқ). Фигураны тұтасымен бояуға батырды: сыртқы беттерінің бәрі (астыңғы беттері де) боялды, ал текшелердің бір-біріне тиіп тұрған беттері боялмайды. Дәл ' + K + ' беті боялған текше саны қанша?',
        'Фигура на рисунке сложена из ' + n + ' одинаковых кубиков (каждый стоит на столе или на другом кубике, скрытых кубиков нет). Фигуру целиком окунули в краску: все наружные грани (и нижние тоже) окрашены, а грани, которыми кубики касаются друг друга, — нет. Сколько кубиков окрашено ровно с ' + K + ' сторон?',
        pic(W, Hh, out), ans, wrong.slice(0, 4),
        'Әр текше үшін боялған беттер = 6 − (көрші текшелер саны). Санаймыз (боялған беттер — текше саны): ' + dist + '. Жауабы ' + ans + '.',
        'Для каждого кубика окрашено 6 − (число соседей) граней. Подсчёт (окрашенных граней — кубиков): ' + dist + '. Ответ ' + ans + '.');
    }
  });

  /* ================= 41. Поворот игральной кости (l_visual) ================= */
  var PIPS = { 1: [[0, 0]], 2: [[-1, 1], [1, -1]], 3: [[-1, 1], [0, 0], [1, -1]], 4: [[-1, -1], [-1, 1], [1, -1], [1, 1]], 5: [[-1, -1], [-1, 1], [1, -1], [1, 1], [0, 0]], 6: [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]] };
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function rotV(v, ax, q) {   // поворот на q·90° вокруг оси ax (0 = x, 1 = y, 2 = z), правая тройка
    var o = v.slice();
    for (var i = 0; i < ((q % 4) + 4) % 4; i++) {
      var x = o[0], y = o[1], z = o[2];
      if (ax === 0) o = [x, -z, y]; else if (ax === 1) o = [z, y, -x]; else o = [-y, x, z];
    }
    return o;
  }
  function dieRot(st, ax, q) { var o = {}; Object.keys(st).forEach(function (f) { o[f] = { n: rotV(st[f].n, ax, q), u: rotV(st[f].u, ax, q) }; }); return o; }
  function dieMir(st) { var o = {}; Object.keys(st).forEach(function (f) { o[f] = { n: [-st[f].n[0], st[f].n[1], st[f].n[2]], u: [-st[f].u[0], st[f].u[1], st[f].u[2]] }; }); return o; }
  function faceAt(st, axis) { for (var f in st) if (st[f].n[0] === axis[0] && st[f].n[1] === axis[1] && st[f].n[2] === axis[2]) return +f; return 0; }
  function dieKey(st) { return faceAt(st, [0, 0, 1]) + '' + faceAt(st, [0, 1, 0]) + faceAt(st, [1, 0, 0]); }
  function dieSvg(st, big) {
    var S = big ? 50 : 40, K = big ? 20 : 16, ox = 4, oy = 4 + K + S, o = '';
    function P3(x, y, z) { return [ox + S * x + K * (1 - z), oy - S * y - K * (1 - z)]; }
    o += poly([P3(0, 0, 1), P3(1, 0, 1), P3(1, 1, 1), P3(0, 1, 1)], null, S_W) + poly([P3(0, 1, 1), P3(1, 1, 1), P3(1, 1, 0), P3(0, 1, 0)], null, S_W) + poly([P3(1, 0, 1), P3(1, 0, 0), P3(1, 1, 0), P3(1, 1, 1)], null, S_W);
    [[0, 0, 1], [0, 1, 0], [1, 0, 0]].forEach(function (ax) {
      var f = faceAt(st, ax), u = st[f].u, v = cross(ax, u);
      PIPS[f].forEach(function (ab) {
        var p = [0.5 + 0.5 * ax[0] + 0.27 * (ab[0] * u[0] + ab[1] * v[0]), 0.5 + 0.5 * ax[1] + 0.27 * (ab[0] * u[1] + ab[1] * v[1]), 0.5 + 0.5 * ax[2] + 0.27 * (ab[0] * u[2] + ab[1] * v[2])], q = P3(p[0], p[1], p[2]);
        o += circ(q[0], q[1], big ? 3.6 : 3, S_K);
      });
    });
    return { s: o, w: ox + S + K + 4, h: oy + 4 };
  }
  var DOPS3 = [
    { ax: 2, q: -1, kk: 'оңға қарай аунатты (үстіңгі жағы оңға кетеді)', ru: 'перекатили вправо (верхняя грань уходит вправо)' },
    { ax: 2, q: 1, kk: 'солға қарай аунатты (үстіңгі жағы солға кетеді)', ru: 'перекатили влево (верхняя грань уходит влево)' },
    { ax: 0, q: 1, kk: 'өзімізге қарай аунатты (үстіңгі жағы алға, бізге қарай кетеді)', ru: 'перекатили на себя (верхняя грань уходит вперёд, к нам)' },
    { ax: 0, q: -1, kk: 'артқа қарай аунатты (үстіңгі жағы артқа кетеді)', ru: 'перекатили от себя (верхняя грань уходит назад)' },
    { ax: 1, q: 1, kk: 'тік осьті айнала бұрды: алдыңғы жағы оңға кетеді', ru: 'повернули вокруг вертикальной оси: передняя грань уходит вправо' },
    { ax: 1, q: -1, kk: 'тік осьті айнала бұрды: алдыңғы жағы солға кетеді', ru: 'повернули вокруг вертикальной оси: передняя грань уходит влево' }
  ];
  add('l_visual', 'b24.dice_rotate', [3, 4], function (r, lvl) {
    // стандартная кость: 1 спереди, 2 справа, 3 сверху (1-2-3 против часовой), противоположные дают 7
    var base = { 1: { n: [0, 0, 1] }, 2: { n: [1, 0, 0] }, 3: { n: [0, 1, 0] }, 6: { n: [0, 0, -1] }, 5: { n: [-1, 0, 0] }, 4: { n: [0, -1, 0] } };
    Object.keys(base).forEach(function (f) { var nn = base[f].n, cand = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]].filter(function (w) { return w[0] * nn[0] + w[1] * nn[1] + w[2] * nn[2] === 0; }); base[f].u = r.pick(cand); });
    var st = dieRot(dieRot(dieRot(base, 0, r.int(0, 3)), 1, r.int(0, 3)), 2, r.int(0, 3));
    var steps = lvl >= 4 ? [r.pick(DOPS3.slice(4)), r.pick(DOPS3.slice(0, 4))] : [r.pick(DOPS3)], degs = lvl >= 4 ? [90, r.pick([90, 180])] : [r.pick([180, 180, 90])];
    var ans = st;
    steps.forEach(function (op, i) { ans = dieRot(ans, op.ax, op.q * degs[i] / 90); });
    var cands = [dieMir(ans), st];
    steps.forEach(function (op, i) {
      cands.push(dieRot(st, op.ax, -op.q * degs[i] / 90));
      DOPS3.forEach(function (o2) { cands.push(dieRot(st, o2.ax, o2.q * degs[i] / 90)); });
      cands.push(dieRot(st, op.ax, op.q * (degs[i] === 90 ? 2 : 1)));
    });
    if (steps.length > 1) cands.unshift(dieRot(dieRot(st, steps[1].ax, steps[1].q * degs[1] / 90), steps[0].ax, steps[0].q));
    var wrong = uniq(ans, r.shuffle(cands.slice(0, 3)).concat(cands.slice(3)), dieKey, 3);
    var big = dieSvg(st, true), W = big.w;
    var picQ = pic(W + 110, big.h + 6, '<g transform="translate(0 4)">' + big.s + '</g>' + txt(W + 30, big.h / 2 - 6, degs.map(function (dg) { return dg + '°'; }).join(', ')) +
      line(W + 12, big.h / 2 + 6, W + 50, big.h / 2 + 6) + poly([[W + 56, big.h / 2 + 6], [W + 48, big.h / 2 + 2], [W + 48, big.h / 2 + 10]], null, S_K) + txt(W + 82, big.h / 2 + 14, '?', 'middle', 'big'));
    var op = function (x) { var d2 = dieSvg(x, false); return osv(d2.w, d2.h, d2.s); };
    var dk = steps.map(function (o, i) { return degs[i] + '°-қа ' + o.kk; }).join(', содан кейін '), dr = steps.map(function (o, i) { return o.ru.replace(/^(\S+)/, '$1 на ' + degs[i] + '°'); }).join(', затем ');
    var sk = 'Қарама-қарсы жақтардағы ұпайлардың қосындысы 7. Бастапқыда: алдында ' + faceAt(st, [0, 0, 1]) + ', үстінде ' + faceAt(st, [0, 1, 0]) + ', оң жақта ' + faceAt(st, [1, 0, 0]) + ' (демек артында ' + (7 - faceAt(st, [0, 0, 1])) + ', астында ' + (7 - faceAt(st, [0, 1, 0])) + ', сол жақта ' + (7 - faceAt(st, [1, 0, 0])) + '). Бұрғаннан кейін: алдында ' + faceAt(ans, [0, 0, 1]) + ', үстінде ' + faceAt(ans, [0, 1, 0]) + ', оң жақта ' + faceAt(ans, [1, 0, 0]) + '.';
    var sr = 'Сумма очков на противоположных гранях равна 7. Сначала: спереди ' + faceAt(st, [0, 0, 1]) + ', сверху ' + faceAt(st, [0, 1, 0]) + ', справа ' + faceAt(st, [1, 0, 0]) + ' (значит, сзади ' + (7 - faceAt(st, [0, 0, 1])) + ', снизу ' + (7 - faceAt(st, [0, 1, 0])) + ', слева ' + (7 - faceAt(st, [1, 0, 0])) + '). После поворота: спереди ' + faceAt(ans, [0, 0, 1]) + ', сверху ' + faceAt(ans, [0, 1, 0]) + ', справа ' + faceAt(ans, [1, 0, 0]) + '.';
    return P('Ойын текшесін (қарама-қарсы жақтардағы ұпайлардың қосындысы 7) ' + dk + '. Сұрақ белгісінің орнына сәйкес келетін нұсқаны анықтаңыз.',
      'Игральный кубик (сумма очков на противоположных гранях равна 7) ' + dr + '. Определите фигуру, соответствующую вопросительному знаку.', picQ, op(ans), wrong.map(op), sk, sr);
  });

  /* ================= 42. Сосуды с трубками (l_visual) ================= */
  // Модель: сосуд наполняется до самого низкого выхода, затем вода уходит в трубку, пока поддерево
  // ниже не заполнится целиком (закрытые сосуды), потом уровень растёт до следующего выхода и т.д.
  function fillOrder(v, out) {
    v.kids.slice().sort(function (a, b) { return a.at - b.at; }).forEach(function (k) { fillOrder(k.v, out); });
    out.push(v.name);
    return out;
  }
  add('l_visual', 'b24.vessels', [3, 4], function (r, lvl) {
    var VH = 5, U = 12;
    for (;;) {
      var names = r.shuffle(['B', 'C', 'D', 'E']);
      var A = { name: 'A', x: 160, y: 50, w: 56, kids: [] }, Lc = { name: names[0], x: 70, y: 126, w: 50, kids: [] }, Rc = { name: names[1], x: 262, y: 126, w: 50, kids: [] };
      var hA = r.shuffle([0, 1, 2, 3]).slice(0, 2);
      A.kids.push({ v: Lc, at: hA[0], side: -1 }, { v: Rc, at: hA[1], side: 1 });
      var g1 = { name: names[2], x: 8, y: 204, w: 46, kids: [] }, g2 = { name: names[3], x: 330, y: 204, w: 46, kids: [] }, vs = [A, Lc, Rc];
      var useL = lvl >= 4 || r.chance(0.5), useR = lvl >= 4 || !useL;
      if (useL) { Lc.kids.push({ v: g1, at: r.int(0, 3), side: -1 }); vs.push(g1); }
      if (useR) { Rc.kids.push({ v: g2, at: r.int(0, 3), side: 1 }); vs.push(g2); }
      var order = fillOrder(A, []), kth = lvl >= 4 ? r.pick([2, 3]) : 2, ans = order[kth - 1];
      var letters = vs.map(function (v) { return v.name; }), wrong = r.shuffle(letters.filter(function (l) { return l !== ans; })).slice(0, 3);
      if (wrong.length < 3) continue;
      var out = '';
      vs.forEach(function (v) {
        var top = v.y, bot = v.y + VH * U;
        out += v === A ? path('M' + v.x + ',' + top + ' V' + bot + ' H' + (v.x + v.w) + ' V' + top, 'fill:var(--card);stroke:currentColor;stroke-width:1.6') : rect(v.x, top, v.w, VH * U, null, 'fill:var(--card);stroke:currentColor;stroke-width:1.6');
        out += txt(v.x + v.w / 2, top + VH * U / 2 + 5, v.name, 'middle', 'big');
        v.kids.forEach(function (kd) {
          var y0 = bot - kd.at * U - 3, x0 = kd.side < 0 ? v.x : v.x + v.w, c = kd.v, xc = c.x + c.w / 2 + kd.side * (c.w / 4);
          out += path('M' + x0 + ',' + y0 + ' H' + xc + ' V' + c.y, 'fill:none;stroke:currentColor;stroke-width:4') + path('M' + x0 + ',' + y0 + ' H' + xc + ' V' + c.y, 'fill:none;stroke:var(--card);stroke-width:1.6');
        });
      });
      // кран и капля
      out += path('M' + (A.x + 20) + ',8 h18 v10 h-6 v6 h-6 v-6 h-6 z', 'fill:var(--muted);stroke:currentColor;stroke-width:1.2') + path('M' + (A.x + 29) + ',28 q-4,7 0,9 q4,-2 0,-9 z', 'fill:var(--accent);stroke:none');
      var ordTxt = order.join(' → '), nth = { 2: ['екінші', 'вторым'], 3: ['үшінші', 'третьим'] }[kth];
      return P('Краннан A ыдысына су құйылып жатыр. Ыдыстар суреттегідей түтіктермен жалғанған (A-дан басқа ыдыстардың қақпағы бар, су тек түтік арқылы кіреді). Қай ыдыс ' + nth[0] + ' болып толады?',
        'Из крана вода льётся в сосуд A. Сосуды соединены трубками, как на рисунке (все сосуды, кроме A, закрыты сверху, вода попадает в них только по трубкам). Какой сосуд заполнится ' + nth[1] + '?',
        pic(390, 270, out), ans, wrong,
        'Су ыдыста ең төменгі түтікке дейін көтеріледі де, сол түтік арқылы ағады; төмендегі ыдыстар толғанша деңгей көтерілмейді. Сосын келесі түтікке дейін көтеріледі. Толу реті: ' + ordTxt + '.',
        'Вода поднимается до самой нижней трубки и уходит по ней; пока нижние сосуды не заполнятся, уровень не растёт. Затем вода поднимается до следующей трубки. Порядок заполнения: ' + ordTxt + '.');
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
