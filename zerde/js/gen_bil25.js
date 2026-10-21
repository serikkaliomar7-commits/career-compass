/* Зерде — типы задач официального варианта БИЛ 2025 (онлайн сынақ, нұсқа 20251001).
 * Каждый тип — параметрический и чуть труднее оригинала (больше шагов, ловушки из оригинала
 * сохранены в неверных вариантах). У каждого формата есть id (b25.*): «Практика» по образцу
 * экзамена (practice.js, Z.blueprints.BIL_2025) запрашивает формат по id.
 * Рисунки — SVG в конце текста (общие для kk и ru), цвета через классы .svgfig из style.css.
 * Текстовые варианты со словами переводятся через ruMap (kk → ru). */
(function (root) {
  'use strict';
  var Z = root.Z;
  var U = Z.util, fmt = U.fmt, FR = U.frac;
  var H = Z.genHelpers, Q = H.Q, expr = H.expr, unit = H.unit;
  var F = Z.formats;
  F.l_visual = F.l_visual || [];

  /* ---------- общие помощники ---------- */
  function fx(n, d) { return '<span class="frac"><span>' + n + '</span><span>' + d + '</span></span>'; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function num(n) { return n < 0 ? '−' + fmt(-n) : fmt(n); }
  function par(n) { return n < 0 ? '(' + num(n) + ')' : num(n); }
  function sgnT(n) { return n < 0 ? ' − ' + fmt(-n) : ' + ' + fmt(n); }
  function r1(x) { return Math.round(x * 10) / 10; }
  function r2(x) { return Math.round(x * 100) / 100; }
  function fh(f) { return U.fracHtml(f, false); }
  function sf(f) { return (f.n < 0 ? '−' : '') + Math.abs(f.n) + (f.d === 1 ? '' : '/' + f.d); }   // для решений (mathFrac)
  function fact(k) { return k <= 1 ? 1 : k * fact(k - 1); }
  function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  function svgEl(w, h, inner, cls) { return '<svg class="svgfig' + (cls ? ' ' + cls : '') + '" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="сурет">' + inner + '</svg>'; }
  function figs(list) { return '<div class="figs">' + list.join('') + '</div>'; }
  function pic(w, h, inner) { return figs([svgEl(w, h, inner)]); }
  function osv(w, h, inner) { return svgEl(w, h, inner, 'osv'); }
  function txt(x, y, s, cls, anchor) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (anchor || 'middle') + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + s + '</text>'; }
  function rect(x, y, w, h, cls, extra) { return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '" class="' + cls + '"' + (extra || '') + '/>'; }
  function line(x1, y1, x2, y2, cls) { return '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '"' + (cls ? ' class="' + cls + '"' : '') + '/>'; }
  function poly(pts, cls) { return '<polygon points="' + pts.map(function (p) { return r1(p[0]) + ',' + r1(p[1]); }).join(' ') + '" class="' + cls + '"/>'; }
  function P(kk, ru, pc, ans, wrong, sk, sr, extra) { return Q(kk + pc, ru + pc, ans, wrong, sk, sr, extra); }
  // неверные варианты: без повторов и без верного (по ключу), не больше n
  function uniq(ans, cands, key, n) {
    var seen = {}, out = [];
    key = key || String;
    seen[key(ans)] = 1;
    cands.forEach(function (c) { if (c !== null && c !== undefined && !seen[key(c)] && out.length < n) { seen[key(c)] = 1; out.push(c); } });
    return out;
  }
  function posInts(ans, list) { return list.filter(function (x) { return typeof x === 'number' && isFinite(x) && x > 0 && x !== ans; }); }
  // казахский порядковый суффикс: 5-ші, 6-шы
  function ordKk(n) {
    var u = n % 10, t = Math.floor(n / 10) % 10;
    if (u) return n + '-' + ([0, 'ші', 'ші', 'ші', 'ші', 'ші', 'шы', 'ші', 'ші', 'шы'][u]);
    return n + '-' + ([0, 'шы', 'шы', 'шы', 'шы', 'ші', 'шы', 'ші', 'ші', 'шы'][t]);
  }
  // русское согласование с числительным: pl(5, 'ученик', 'ученика', 'учеников')
  function pl(n, one, few, many) { var m = Math.abs(n) % 10, h = Math.abs(n) % 100; return n + ' ' + (h > 10 && h < 20 ? many : m === 1 ? one : m >= 2 && m <= 4 ? few : many); }
  function razRu(k) { var m = k % 10, h = k % 100; return m >= 2 && m <= 4 && (h < 12 || h > 14) ? 'раза' : 'раз'; }
  // косоугольная проекция кубика (как в gen_visual.js): X, Y — левый нижний угол передней грани
  function cubeAt(X, Y, s, k) {
    return rect(X, Y - s, s, s, 'vcf') + poly([[X, Y - s], [X + k, Y - s - k], [X + s + k, Y - s - k], [X + s, Y - s]], 'vct') +
      poly([[X + s, Y], [X + s, Y - s], [X + s + k, Y - s - k], [X + s + k, Y - k]], 'vcr');
  }
  // набор кубиков [x, y(глубина, 0 — передний ряд), z] → SVG (рисуем от дальних к ближним)
  function drawCubes(cells, s, k, pad, dims) {
    pad = pad || 6;
    var mx = 0, my = 0, mz = 0;
    cells.forEach(function (c) { mx = Math.max(mx, c[0]); my = Math.max(my, c[1]); mz = Math.max(mz, c[2]); });
    if (dims) { mx = dims[0]; my = dims[1]; mz = dims[2]; }   // рамка по полному блоку
    var oy = pad + (mz + 1) * s + (my + 1) * k, out = '';
    cells.slice().sort(function (a, b) { return b[1] - a[1] || a[2] - b[2] || a[0] - b[0]; }).forEach(function (c) {
      out += cubeAt(pad + c[0] * s + c[1] * k, oy - c[2] * s - c[1] * k, s, k);
    });
    return { w: 2 * pad + (mx + 1) * s + (my + 1) * k, h: oy + pad, svg: out };
  }

  /* ================= Теңдеулер (m_eq) ================= */
  F.m_eq.push(
    { id: 'b25.ratio_expr', lv: [2, 3], f: function (r, lvl, opt) {   // (a − b)/b = k → (a + b)/b, (2a + b)/b …
      var k;
      if (opt.int || r.chance(0.5)) k = FR(r.int(2, 9));
      else { var q = r.pick([2, 3, 4, 5]), p; do { p = r.int(1, 2 * q + 1); } while (gcd(p, q) !== 1 || p % q === 0); k = FR(p, q); }
      var one = FR(1), t = FR.add(k, one), two = FR(2), three = FR(3);
      var kind = r.pick(lvl === 2 ? ['sum', 'dbl'] : opt.int ? ['tri'] : ['tri', 'rat']), ask, ans, wrong, step;
      if (kind === 'sum') { ask = fx('a + b', 'b'); ans = FR.add(t, one); wrong = [t, FR.add(k, three), FR.mul(two, k)]; step = '(a + b)/b = a/b + 1 = ' + sf(t) + ' + 1 = ' + sf(ans); }
      else if (kind === 'dbl') { ask = fx('2a + b', 'b'); ans = FR.add(FR.mul(two, t), one); wrong = [FR.add(FR.mul(two, k), one), FR.mul(two, t), FR.add(t, one)]; step = '(2a + b)/b = 2 · a/b + 1 = 2 · ' + sf(t) + ' + 1 = ' + sf(ans); }
      else if (kind === 'tri') { ask = fx('3a − 2b', 'b'); ans = FR.sub(FR.mul(three, t), two); wrong = [FR.sub(FR.mul(three, k), two), FR.add(FR.mul(three, t), two), FR.mul(three, t)]; step = '(3a − 2b)/b = 3 · a/b − 2 = 3 · ' + sf(t) + ' − 2 = ' + sf(ans); }
      else { ask = fx('a + b', 'a − b'); ans = FR.div(FR.add(t, one), k); wrong = [FR.add(t, one), FR.div(k, FR.add(t, one)), FR.div(t, k)]; step = '(a + b)/(a − b) = (a/b + 1)/(a/b − 1) = ' + sf(FR.add(t, one)) + ' : ' + sf(k) + ' = ' + sf(ans); }
      var e = expr(fx('a − b', 'b') + ' = ' + fh(k) + '&emsp;⇒&emsp;' + ask + ' = ?');
      return Q('Берілген теңдікті пайдаланып, өрнектің мәнін табыңыз:' + e, 'Используя данное равенство, найдите значение выражения:' + e, ans, wrong,
        '(a − b)/b = a/b − 1 = ' + sf(k) + ', сондықтан a/b = ' + sf(t) + '. ' + step + '.',
        '(a − b)/b = a/b − 1 = ' + sf(k) + ', значит a/b = ' + sf(t) + '. ' + step + '.');
    } },
    { id: 'b25.x_frac_self', lv: [2, 3], f: function (r, lvl) {   // x = A + 2x/5 → x/7 (ловушка: ответить x)
      var k, x, A, rhs, sk, sr;
      for (;;) {
        k = r.pick([3, 4, 5, 6, 7, 8, 9]);
        if (lvl === 2) {
          var q = r.int(3, 9), p; do { p = r.int(1, q - 1); } while (gcd(p, q) !== 1);
          var L = lcm(q, k); if (L > 90) continue;
          x = L * r.int(1, Math.max(1, Math.floor(180 / L))); A = x - x * p / q;
          rhs = A + ' + ' + fx((p === 1 ? '' : p) + 'x', q);
          sk = 'x − ' + p + 'x/' + q + ' = ' + A + ' ⇒ ' + (q - p) + 'x/' + q + ' = ' + A + ' ⇒ x = ' + A + ' · ' + q + ' : ' + (q - p) + ' = ' + x + '.';
        } else {
          var a = r.int(2, 6), b = r.int(a + 1, 9);
          var L2 = lcm(lcm(a, b), k); if (L2 > 200) continue;
          x = L2 * r.int(1, Math.max(1, Math.floor(300 / L2))); A = x - x / a - x / b; if (A <= 0) continue;
          rhs = A + ' + ' + fx('x', a) + ' + ' + fx('x', b);
          var D = lcm(a, b), cf = D - D / a - D / b;
          sk = 'x − x/' + a + ' − x/' + b + ' = ' + cf + 'x/' + D + ' = ' + A + ' ⇒ x = ' + A + ' · ' + D + ' : ' + cf + ' = ' + x + '.';
        }
        if (x / k === A || x === A) continue;
        break;
      }
      sr = sk;
      var e = expr('x = ' + rhs + '&emsp;&emsp;' + fx('x', k) + ' = ?');
      return Q('Теңдеуден x-ті тауып, ' + fx('x', k) + ' мәнін есептеңіз:' + e, 'Найдите x из уравнения и вычислите ' + fx('x', k) + ':' + e, x / k,
        [x, A % k === 0 ? A / k : null, x / k + k, 2 * x / k].filter(function (v) { return v !== null; }),
        sk + ' Сұрақ — x емес, x : ' + k + ' = ' + x / k + '.', sr + ' Спрашивают не x, а x : ' + k + ' = ' + x / k + '.');
    } },
    { id: 'b25.ineq_system', lv: [2, 3], f: function (r, lvl) {   // система с дробями → «L ≤ x < R»
      var p = r.pick([2, 3, 4]), b = r.int(-2, 5), L = r.int(-6, 4), a = p * b - L;
      var q = r.pick([2, 3, 5]), R = L + r.int(3, 9), d = r.int(-2, 4), c = R + q * d;
      var s1 = r.chance(0.5), s2 = r.chance(0.5);   // true → нестрогое
      var t1 = fx('x' + (a ? sgnT(a) : ''), p) + ' ' + (s1 ? '≥' : '>') + ' ' + num(b), t2 = fx(num(c) + ' − x', q) + ' ' + (s2 ? '≥' : '>') + ' ' + num(d);
      var sys = expr('<span style="display:inline-block;border-left:2px solid currentColor;padding-left:10px;text-align:left">' + t1 + '<br>' + t2 + '</span>');
      function show(l, n1, n2, h) { return num(l) + (n1 ? ' ≤ ' : ' < ') + 'x' + (n2 ? ' ≤ ' : ' < ') + num(h); }
      var ans = show(L, s1, s2, R);
      var sk = '1) x' + (a ? sgnT(a) : '') + ' ' + (s1 ? '≥' : '>') + ' ' + num(p * b) + ' ⇒ x ' + (s1 ? '≥' : '>') + ' ' + num(L) + '. 2) ' + num(c) + ' − x ' + (s2 ? '≥' : '>') + ' ' + num(q * d) + ' ⇒ x ' + (s2 ? '≤' : '<') + ' ' + num(R) + '. ';
      if (lvl === 3) {
        var cnt = 0; for (var x = L; x <= R; x++) if ((s1 ? x >= L : x > L) && (s2 ? x <= R : x < R)) cnt++;
        return Q('Теңсіздіктер жүйесінің неше бүтін шешімі бар?' + sys, 'Сколько целых решений имеет система неравенств?' + sys, cnt, [cnt + 1, cnt - 1, R - L + 1, R - L],
          sk + 'Шешімі: ' + ans + ', бүтін шешімдері — ' + cnt + '.', sk.replace(/ ⇒ /g, ' ⇒ ') + 'Решение: ' + ans + ', целых решений — ' + cnt + '.');
      }
      var Lw = p * b + a;   // ловушка: перенесли a с неверным знаком
      var wrong = uniq(ans, r.shuffle([show(L, !s1, s2, R), show(L, s1, !s2, R), show(L, !s1, !s2, R)]).slice(0, 2).concat(
        Lw !== L && Lw < R ? [show(Lw, s1, s2, R)] : [], ['x ' + (s1 ? '≥' : '>') + ' ' + num(L), 'x ' + (s2 ? '≤' : '<') + ' ' + num(R), show(L, !s1, !s2, R)]), String, 4);
      return Q('Теңсіздіктер жүйесін шешіңіз:' + sys, 'Решите систему неравенств:' + sys, ans, wrong,
        sk + 'Екеуі бірге: ' + ans + '.', sk + 'Вместе: ' + ans + '.');
    } },
    { id: 'b25.lin_frac_eq', lv: [1, 2], f: function (r, lvl) {   // (2x − 3)/4 + (x + 1)/2 = 3
      for (;;) {
        var x = r.int(-5, 12), p = r.pick([2, 3, 4, 6]), q = r.pick([2, 3, 4, 5, 6]);
        if (p === q) continue;
        var a = r.int(1, 4), b = r.int(-9, 9), c = r.int(1, 3), d = r.int(-9, 9), minus = lvl === 2 && r.chance(0.7), sg = minus ? -1 : 1;
        if (!b || !d) continue;
        var R = FR.add(FR(a * x + b, p), FR(sg * (c * x + d), q));
        if (R.d !== 1) continue;
        var M = lcm(p, q), X = M / p * a + sg * M / q * c, K = M / p * b + sg * M / q * d;
        if (!X) continue;
        var w1 = FR(R.n - K, X), w2 = FR(M * R.n - (M / p * b - sg * M / q * d), X), w3 = FR(M * R.n + K, X);
        function lin(u, v) { return (u === 1 ? '' : u) + 'x' + sgnT(v); }
        var e = expr(fx(lin(a, b), p) + (minus ? ' − ' : ' + ') + fx(lin(c, d), q) + ' = ' + num(R.n));
        var s = 'Екі жағын да ' + M + '-ге көбейтеміз: ' + (M / p) + '(' + lin(a, b) + ') ' + (minus ? '−' : '+') + ' ' + (M / q) + '(' + lin(c, d) + ') = ' + num(M * R.n) + ' ⇒ ' + X + 'x ' + (K < 0 ? '− ' + (-K) : '+ ' + K) + ' = ' + num(M * R.n) + ' ⇒ x = ' + num(x) + '.';
        var sr = 'Умножаем обе части на ' + M + ': ' + (M / p) + '(' + lin(a, b) + ') ' + (minus ? '−' : '+') + ' ' + (M / q) + '(' + lin(c, d) + ') = ' + num(M * R.n) + ' ⇒ ' + X + 'x ' + (K < 0 ? '− ' + (-K) : '+ ' + K) + ' = ' + num(M * R.n) + ' ⇒ x = ' + num(x) + '.' + (minus ? ' Минус перед дробью меняет знаки обоих членов числителя.' : ' Не забудьте умножить и правую часть.');
        return Q('Теңдеуді шешіңіз:' + e, 'Решите уравнение:' + e, x, [w1, w2, w3, -x],
          s + (minus ? ' Бөлшектің алдындағы минус алымның екі мүшесінің де таңбасын өзгертеді.' : ' Оң жағын да көбейтуді ұмытпаңыз.'), sr);
      }
    } },
    { id: 'b25.word_ineq', lv: [1, 2], f: function (r, lvl) {   // 4 бауырсақ 500 теңгеден арзан → x < 125
      var it = r.pick([['бауырсақ', 'баурсаки'], ['қалам', 'ручки'], ['дәптер', 'тетради'], ['алма', 'яблоки'], ['балмұздақ', 'мороженое']]);
      var n = r.int(3, 8), per = 5 * r.int(4, 60), lt = r.chance(0.5), c = lvl === 2 ? 10 * r.int(5, 40) : 0, S = n * per + c;
      var o = lt ? '<' : '≤', no = lt ? '≥' : '>', ans = 'x ' + o + ' ' + per;
      var kk = n + ' дана ' + it[0] + (c ? ' және ' + c + ' теңгелік пакет' : '') + ' үшін ' + S + ' теңгеден ' + (lt ? 'аз' : 'артық емес') + ' төленді. Бір ' + it[0] + ' x теңге тұрады. x үшін қай теңсіздік дұрыс?';
      var ru = 'За ' + n + ' шт. (' + it[1] + ')' + (c ? ' и пакет за ' + c + ' тенге' : '') + ' заплатили ' + (lt ? 'меньше ' : 'не больше ') + S + ' тенге. Одна штука стоит x тенге. Какое неравенство верно для x?';
      var cands = ['x ' + no + ' ' + per, 'x ' + (lt ? '≤' : '<') + ' ' + per, 'x ' + o + ' ' + S * n];
      if (c) cands.push((S + c) % n === 0 ? 'x ' + o + ' ' + (S + c) / n : 'x ' + o + ' ' + (S - c));
      cands.push('x ' + o + ' ' + (S - n));
      var sk = (c ? n + 'x + ' + c + ' ' + o + ' ' + S + ' ⇒ ' + n + 'x ' + o + ' ' + (S - c) + ' ⇒ ' : n + 'x ' + o + ' ' + S + ' ⇒ ') + ans + '.';
      return Q(kk, ru, ans, uniq(ans, cands, String, 4), sk + (lt ? ' «Арзан» — қатаң теңсіздік.' : ' «Артық емес» — ≤.'), sk + (lt ? ' «Меньше» — строгое неравенство.' : ' «Не больше» — ≤.'));
    } }
  );

  /* ================= Бөлшектер (m_frac) ================= */
  F.m_frac.push(
    { id: 'b25.express_var', lv: [1, 2], f: function (r, lvl) {   // F = 150 → 250 = 5F/3
      var L = r.pick(['F', 'M', 'P', 'K', 'N']), p, q;
      do { q = r.int(2, lvl === 1 ? 6 : 9); p = r.int(lvl === 1 ? 2 : 3, lvl === 1 ? 9 : 16); } while (gcd(p, q) !== 1 || p % q === 0);
      var base = lvl === 1 ? r.pick([10, 15, 20, 25, 30, 50]) : r.int(7, 40), A = base * q, B = base * p;
      function e(n, d) { var g = gcd(n, d); n /= g; d /= g; var top = (n === 1 ? '' : n) + L; return d === 1 ? top : fx(top, d); }
      var seen = {}, wrong = [];
      seen[(p / q).toFixed(6)] = 1;
      [[q, p], [p + q, q], [Math.abs(p - q), q], [p, 2 * q], [2 * p, q], [p + 1, q], [p, p + q]].forEach(function (c) {
        if (c[0] <= 0) return;
        var v = (c[0] / c[1]).toFixed(6);
        if (!seen[v] && wrong.length < 4) { seen[v] = 1; wrong.push(e(c[0], c[1])); }
      });
      return Q(L + ' = ' + A + ' болса, ' + B + ' санын ' + L + ' арқылы өрнектеңіз.', 'Пусть ' + L + ' = ' + A + '. Выразите число ' + B + ' через ' + L + '.', e(p, q), wrong,
        B + ' : ' + A + ' = ' + p + '/' + q + ', сондықтан ' + B + ' = ' + p + '/' + q + ' · ' + A + ' = ' + p + L + '/' + q + '.',
        B + ' : ' + A + ' = ' + p + '/' + q + ', значит ' + B + ' = ' + p + '/' + q + ' · ' + A + ' = ' + p + L + '/' + q + '.');
    } },
    { id: 'b25.numline_ticks', lv: [2, 3], f: function (r, lvl) {   // между 1/5 и 1/3 — 16 делений: где 1/4?
      var c = r.pick(nlCands()[lvl]), L = c[0], R = c[1], T = c[2], N = c[3], idx = c[4];
      var pos = [idx];
      if (N % 2 === 0 && N / 2 !== idx) pos.push(N / 2);   // ловушка: середина отрезка
      while (pos.length < 4) { var p = r.int(1, N - 1); if (pos.indexOf(p) < 0 && Math.abs(p - idx) > 0) pos.push(p); }
      pos.sort(function (a, b) { return a - b; });
      var LET = ['a', 'b', 'c', 'd'], ans = LET[pos.indexOf(idx)];
      var x0 = 30, x1 = 350, y = 50, out = line(x0 - 12, y, x1 + 12, y);
      for (var i = 0; i <= N; i++) { var xx = x0 + (x1 - x0) * i / N; out += line(xx, y - (i % N ? 6 : 10), xx, y + (i % N ? 6 : 10)); }
      function frLab(xx, f) { return txt(xx, y + 28, f[0]) + line(xx - 7, y + 33, xx + 7, y + 33) + txt(xx, y + 47, f[1]); }
      out += frLab(x0, L) + frLab(x1, R);
      pos.forEach(function (p, j) { var xx = x0 + (x1 - x0) * p / N; out += '<circle cx="' + r1(xx) + '" cy="' + y + '" r="4.5" class="dot"/>' + txt(xx, y - 14, LET[j], 'big'); });
      var st = FR.div(FR(R[0] * L[1] - L[0] * R[1], R[1] * L[1]), FR(N)), dif = FR(T[0] * L[1] - L[0] * T[1], T[1] * L[1]);
      return P('Сан түзуінде ' + fx(L[0], L[1]) + ' мен ' + fx(R[0], R[1]) + ' арасындағы кесінді ' + N + ' тең бөлікке бөлінген. Қай нүкте ' + fx(T[0], T[1]) + ' санына сәйкес келеді?',
        'На числовой прямой отрезок между ' + fx(L[0], L[1]) + ' и ' + fx(R[0], R[1]) + ' разделён на ' + N + ' равных частей. Какая точка соответствует числу ' + fx(T[0], T[1]) + '?', pic(380, 110, out),
        ans, LET.filter(function (l) { return l !== ans; }),
        'Бір бөлік: (' + R[0] + '/' + R[1] + ' − ' + L[0] + '/' + L[1] + ') : ' + N + ' = ' + sf(st) + '. ' + T[0] + '/' + T[1] + ' − ' + L[0] + '/' + L[1] + ' = ' + sf(dif) + ' = ' + idx + ' бөлік. Сол жақ ұштан ' + idx + '-белгі — ' + ans + ' нүктесі.',
        'Одно деление: (' + R[0] + '/' + R[1] + ' − ' + L[0] + '/' + L[1] + ') : ' + N + ' = ' + sf(st) + '. ' + T[0] + '/' + T[1] + ' − ' + L[0] + '/' + L[1] + ' = ' + sf(dif) + ' = ' + idx + ' делений. Это точка ' + ans + '.');
    } }
  );
  var NL = null;
  function nlCands() {   // [L, R, t, N, idx]: t = L + idx·(R − L)/N, t — не середина
    if (NL) return NL;
    NL = { 2: [], 3: [] };
    var fr = [], d, n;
    for (d = 2; d <= 9; d++) for (n = 1; n < d; n++) if (gcd(n, d) === 1) fr.push([n, d]);
    fr.forEach(function (L) {
      fr.forEach(function (R) {
        if (L[0] * R[1] >= R[0] * L[1] || L[1] === R[1]) return;
        for (var td = 2; td <= 12; td++) for (var tn = 1; tn < td; tn++) {
          if (gcd(tn, td) !== 1 || !(tn * L[1] > L[0] * td && tn * R[1] < R[0] * td)) continue;
          for (var N = 6; N <= 20; N++) {
            var a = (tn * L[1] - L[0] * td) * R[1] * N, b = (R[0] * L[1] - L[0] * R[1]) * td;
            if (a % b) continue;
            var idx = a / b;
            if (idx < 1 || idx >= N || idx * 2 === N) continue;
            NL[N <= 12 ? 2 : 3].push([L, R, [tn, td], N, idx]);
          }
        }
      });
    });
    return NL;
  }

  /* ================= Цифрлар (l_digits) ================= */
  function rep(d, m) { var s = ''; for (var i = 0; i < m; i++) s += d; return +s; }
  function box(m) { var s = ''; for (var i = 0; i < m; i++) s += '□'; return s; }
  function ov(s) { return '<span style="text-decoration:overline">' + s + '</span>'; }
  F.l_digits.push(
    { id: 'b25.same_digit_rebus', lv: [2, 3], f: function (r, lvl) {   // □□ × □ = 39□
      var shapes = lvl === 2 ? [[2, 1], [3, 1]] : [[3, 1], [2, 2], [4, 1], [3, 2]], sh, d, pat, prod, t;
      function sols(sh, pat) {
        var out = [];
        for (var e = 1; e <= 9; e++) {
          var pr = String(rep(e, sh[0]) * rep(e, sh[1])), ok = pr.length === pat.length;
          for (var i = 0; ok && i < pr.length; i++) if (pat[i] === '□' ? +pr[i] !== e : pr[i] !== pat[i]) ok = false;
          if (ok) out.push(e);
        }
        return out;
      }
      for (t = 0; t < 300; t++) {
        sh = r.pick(shapes); d = r.int(2, 9); prod = rep(d, sh[0]) * rep(d, sh[1]);
        pat = String(prod).split('').map(function (ch) { return +ch === d ? '□' : ch; }).join('');
        if (pat.indexOf('□') < 0 || !/\d/.test(pat)) continue;
        if (sols(sh, pat).length === 1) break;
      }
      if (t >= 300) { sh = [2, 1]; d = 6; prod = 396; pat = '39□'; }
      var e = expr(box(sh[0]) + ' × ' + box(sh[1]) + ' = ' + pat), askD = lvl === 2;
      var hint = pat[pat.length - 1] === '□' ? 'Соңғы цифр: □ · □ саны □ цифрымен аяқталуы керек — бұл тек 1, 5, 6 үшін орындалады. ' : '';
      var hintR = hint ? 'Последняя цифра: □ · □ должно оканчиваться на □ — это верно только для 1, 5, 6. ' : '';
      var others = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (x) { return x !== d; }));
      var wrong = askD ? others.slice(0, 4) : uniq(prod, others.map(function (x) { return +pat.replace(/□/g, x); }), String, 4);
      return Q('Барлық □ ұяшықтарына бір ғана цифр жазылған (бәрі бірдей). ' + (askD ? 'Ол қандай цифр?' : 'Көбейтіндіні табыңыз.') + e,
        'Во все клетки □ вписана одна и та же цифра. ' + (askD ? 'Какая это цифра?' : 'Найдите произведение.') + e, askD ? d : prod, wrong,
        hint + 'Цифрларды тексереміз: тек ' + d + ' сәйкес келеді: ' + rep(d, sh[0]) + ' × ' + rep(d, sh[1]) + ' = ' + prod + '.',
        hintR + 'Перебираем цифры: подходит только ' + d + ': ' + rep(d, sh[0]) + ' × ' + rep(d, sh[1]) + ' = ' + prod + '.');
    } },
    { id: 'b25.rebus_mult', lv: [3, 4], f: function (r) {   // ABC · 5 = KAK
      var NEW = ['K', 'M', 'N', 'P', 'T'];
      function patOf(abc, prod) {
        var map = {}, ds = String(abc).split(''), ni = 0;
        ['A', 'B', 'C'].forEach(function (Lt, i) { map[ds[i]] = Lt; });
        return String(prod).split('').map(function (ch) { return map[ch] || (map[ch] = NEW[ni++]); }).join('');
      }
      function solve(m, pat, strict) {
        var out = [];
        for (var n = 100; n <= 999; n++) {
          var ds = String(n);
          if (strict && (ds[0] === ds[1] || ds[1] === ds[2] || ds[0] === ds[2])) continue;
          var ps = String(n * m);
          if (ps.length !== pat.length) continue;
          var mp = { A: ds[0], B: ds[1], C: ds[2] }, ok = true;
          for (var i = 0; i < ps.length && ok; i++) { var Lt = pat[i]; if (mp[Lt] === undefined) mp[Lt] = ps[i]; else if (mp[Lt] !== ps[i]) ok = false; }
          if (!ok) continue;
          if (strict) { var vals = Object.keys(mp).map(function (k) { return mp[k]; }); if (vals.some(function (v, j) { return vals.indexOf(v) !== j; })) continue; }
          out.push(n);
        }
        return out;
      }
      var abc, m, pat, t;
      for (t = 0; t < 300; t++) {
        m = r.int(2, 9); abc = r.int(102, 987);
        var ds = String(abc);
        if (ds[0] === ds[1] || ds[1] === ds[2] || ds[0] === ds[2]) continue;
        pat = patOf(abc, abc * m);
        if (!/[ABC]/.test(pat) || /^[ABC]+$/.test(pat)) continue;
        if (solve(m, pat, true).length === 1) break;
      }
      if (t >= 300) { abc = 103; m = 5; pat = 'KAK'; }
      var near = solve(m, pat, false).filter(function (x) { return x !== abc; });
      var e = expr(ov('ABC') + ' · ' + m + ' = ' + ov(pat));
      return Q('Ребусты шешіңіз: бірдей әріптер — бірдей цифрлар, әртүрлі әріптер — әртүрлі цифрлар. ' + ov('ABC') + ' санын табыңыз.' + e,
        'Решите ребус: одинаковые буквы — одинаковые цифры, разные буквы — разные цифры. Найдите число ' + ov('ABC') + '.' + e,
        abc, r.shuffle(near).slice(0, 3).concat([abc + m * 10 > 999 ? abc - 10 * m : abc + 10 * m]),
        'Көбейтінді ' + pat.length + ' таңбалы, сондықтан ABC шамасы шектеулі; соңғы цифрдан бастап тексереміз. Жалғыз шешім: ' + abc + ' · ' + m + ' = ' + abc * m + '.',
        'Произведение ' + pat.length + '-значное, это ограничивает ABC; проверяем, начиная с последней цифры. Единственное решение: ' + abc + ' · ' + m + ' = ' + abc * m + '.');
    } }
  );

  /* ================= Уақыт (m_time) ================= */
  F.m_time.push({ id: 'b25.pill_schedule', lv: [2, 3], f: function (r, lvl) {   // каждые 75 мин с 11:05 → n-й приём
    var I = r.pick([75, 80, 85, 95, 105, 110, 125, 135]), n, start;
    if (lvl === 2) { n = r.int(4, 7); var hi = Math.min(11 * 60 + 55, 1435 - (n - 1) * I); start = 5 * r.int(84, Math.floor(hi / 5)); }
    else { n = r.int(5, 9); var lo = Math.max(14 * 60, 1440 - (n - 1) * I + 5); start = 5 * r.int(Math.ceil(lo / 5), 287); }
    var gap = (n - 1) * I, ans = U.clock(start + gap);
    return Q('Дәрігер дәріні әр ' + I + ' минут сайын ішуді тағайындады. Бірінші рет дәрі сағат ' + U.clock(start) + ' кезінде ішілді.' + (lvl === 3 ? ' Дәрі түнде де ішіледі.' : '') + ' ' + ordKk(n) + ' рет дәрі сағат нешеде ішіледі?',
      'Врач назначил принимать лекарство каждые ' + I + ' минут. Первый раз его приняли в ' + U.clock(start) + '.' + (lvl === 3 ? ' Приём продолжается и ночью.' : '') + ' В какое время будет ' + n + '-й приём?',
      ans, [U.clock(start + n * I), U.clock(start + (n - 2) * I), U.clock(start + gap + 60)],
      'Бірінші мен ' + ordKk(n) + ' қабылдаудың арасында ' + (n - 1) + ' аралық бар (' + n + ' емес!): ' + (n - 1) + ' · ' + I + ' = ' + gap + ' мин = ' + U.hm(gap) + '. ' + U.clock(start) + ' + ' + U.hm(gap) + ' = ' + ans + '.',
      'Между 1-м и ' + n + '-м приёмом ' + pl(n - 1, 'промежуток', 'промежутка', 'промежутков') + ' (не ' + n + '!): ' + (n - 1) + ' · ' + I + ' = ' + gap + ' мин = ' + U.hmRu(gap) + '. ' + U.clock(start) + ' + ' + U.hmRu(gap) + ' = ' + ans + '.');
  } });

  /* ================= Ондық бөлшектер (m_dec) ================= */
  F.m_dec.push(
    { id: 'b25.frac_sum_dec', lv: [1, 2], f: function (r, lvl) {   // 20 + 2/1 + 2/10 + 2/100
      var N = r.int(2, 9) * 10 + (lvl === 2 ? r.int(1, 9) : 0), terms;
      if (lvl === 1) { var d = r.int(2, 9); terms = [[d, 1], [d, 10], [d, 100]]; if (r.chance(0.5)) terms.push([d, 1000]); }
      else { terms = [[r.int(11, 19), 10], [r.int(11, 39), 100], [r.int(1, 9), 1000]]; if (r.chance(0.5)) terms.push([r.int(2, 9), 1]); }
      terms = r.shuffle(terms);
      function val(ts) { var th = N * 1000; ts.forEach(function (t) { th += t[0] * 1000 / t[1]; }); return Math.round(th * 10) / 10000; }
      var ans = val(terms), wrong = [];
      terms.forEach(function (t, i) {
        [10, 0.1].forEach(function (k) { if (t[1] * k >= 1 && t[1] * k <= 10000) { var ts = terms.slice(); ts[i] = [t[0], t[1] * k]; wrong.push(val(ts)); } });
      });
      wrong = r.shuffle(wrong);
      var e = expr(N + ' + ' + terms.map(function (t) { return fx(t[0], t[1]); }).join(' + '));
      var parts = terms.map(function (t) { return fmt(t[0] / t[1]); }).join(' + ');
      return Q('Қосындыны ондық бөлшек түрінде жазыңыз:' + e, 'Запишите сумму в виде десятичной дроби:' + e, ans, wrong,
        'Әр бөлшекті ондық түрде жазамыз: ' + N + ' + ' + parts + ' = ' + fmt(ans) + '.', 'Записываем каждую дробь десятичной: ' + N + ' + ' + parts + ' = ' + fmt(ans) + '.');
    } },
    { id: 'b25.dec_brackets', lv: [1, 2], f: function (r, lvl) {   // 88,8 − (5,7 + 13·(−0,3))
      var sc = lvl === 1 ? 10 : 100, A = lvl === 1 ? r.int(200, 999) : r.int(2000, 9999), B = lvl === 1 ? r.int(11, 99) : r.int(101, 999), c = r.int(3, lvl === 1 ? 15 : 12), D = lvl === 1 ? r.int(1, 9) : r.int(11, 99);
      if (D % 10 === 0) D++;
      function v(x) { return Math.round(x * 10000) / 10000; }
      var ans = v((A - B + c * D) / sc), mul = v(c * D / sc), inner = v((B - c * D) / sc);
      var wrong = [v((A - B - c * D) / sc), v(A / sc + (B / sc + c) * D / sc), v((A + B - c * D) / sc), v((A - B) / sc - c * D / sc + 1)];
      var e = expr(fmt(A / sc) + ' − (' + fmt(B / sc) + ' + ' + c + ' · (' + num(-D / sc) + '))');
      return Q('Өрнектің мәнін табыңыз:' + e, 'Найдите значение выражения:' + e, ans, wrong,
        c + ' · (' + num(-D / sc) + ') = ' + num(-mul) + '; ' + fmt(B / sc) + ' + (' + num(-mul) + ') = ' + num(inner) + '; ' + fmt(A / sc) + ' − ' + par(inner) + ' = ' + fmt(ans) + '.',
        c + ' · (' + num(-D / sc) + ') = ' + num(-mul) + '; ' + fmt(B / sc) + ' + (' + num(-mul) + ') = ' + num(inner) + '; ' + fmt(A / sc) + ' − ' + par(inner) + ' = ' + fmt(ans) + '.');
    } }
  );

  /* ================= Геометрия (m_geom) ================= */
  F.m_geom.push(
    { id: 'b25.perimeter_cutouts', lv: [2, 3], f: function (r, lvl) {   // какие фигуры с вырезом имеют периметр квадрата
      var n = lvl === 2 ? 6 : 8, S = 6, u = 10, side = S * u, same = r.int(2, n - 2), kinds = [], i;
      for (i = 0; i < n; i++) kinds.push(i < same ? r.pick(['corner', 'corner', 'two']) : r.pick(['side', 'side', 'hole']));
      kinds = r.shuffle(kinds);
      var out = '', holes = 0, sameIdx = [];
      kinds.forEach(function (kd, j) {
        var w = r.int(1, 3), h = r.int(1, 3), rot = 90 * r.int(0, 3), d;
        if (kd === 'corner') d = 'M0,0 H' + (side - w * u) + ' V' + h * u + ' H' + side + ' V' + side + ' H0 Z';
        else if (kd === 'two') { var w2 = r.int(1, 2), h2 = r.int(1, 2); d = 'M0,0 H' + (side - w * u) + ' V' + h * u + ' H' + side + ' V' + side + ' H' + w2 * u + ' V' + (side - h2 * u) + ' H0 Z'; }
        else if (kd === 'side') { var x0 = r.int(1, S - w - 1); d = 'M0,0 H' + x0 * u + ' V' + h * u + ' H' + (x0 + w) * u + ' V0 H' + side + ' V' + side + ' H0 Z'; }
        else { var hx = r.int(1, S - w - 1), hy = r.int(1, S - h - 1); d = 'M0,0 H' + side + ' V' + side + ' H0 Z M' + hx * u + ',' + hy * u + ' h' + w * u + ' v' + h * u + ' h' + (-w * u) + ' Z'; holes++; }
        if (kd === 'corner' || kd === 'two') sameIdx.push(j + 1);
        var ox = 12 + (j % 4) * (side + 26), oy = 8 + Math.floor(j / 4) * (side + 34);
        out += '<g transform="translate(' + ox + ' ' + oy + ')"><g transform="rotate(' + rot + ' ' + side / 2 + ' ' + side / 2 + ')"><path d="' + d + '" class="sh" fill-rule="evenodd"/></g>' + txt(side / 2, side + 20, j + 1) + '</g>';
      });
      return P('Әр сұр фигура — шаршыдан тіктөртбұрыш пішінді бөлік кесіп алғанда қалған бөлігі (бұрыштан, қабырғаның ортасынан немесе ішінен). Неше фигураның периметрі бастапқы шаршының периметріне тең? (Тесіктің шекарасы да периметрге кіреді.)',
        'Каждая серая фигура — квадрат, из которого вырезали прямоугольник (у угла, в середине стороны или внутри). У скольких фигур периметр равен периметру исходного квадрата? (Граница дырки тоже входит в периметр.)',
        pic(12 + 4 * (side + 26), 8 + 2 * (side + 34), out), same, [same + holes, n - same, same + 1, same - 1 || same + 2],
        'Бұрыштан кесілсе, жоғалған екі кесіндінің орнына дәл сондай екі кесінді пайда болады — периметр өзгермейді. Қабырғаның ортасынан кесілсе, ойықтың екі терең жағы қосылады; ішінен кесілсе, тесіктің периметрі қосылады. Бұрыштан кесілгендер: № ' + sameIdx.join(', ') + ' — барлығы ' + same + '.',
        'При вырезе у угла два пропавших отрезка заменяются двумя такими же — периметр не меняется. Вырез в середине стороны добавляет две «глубины», дырка добавляет свой периметр. У угла вырезаны: № ' + sameIdx.join(', ') + ' — всего ' + same + '.');
    } },
    { id: 'b25.arcs_perimeter', lv: [3, 4], f: function (r, lvl) {   // прямоугольник + две четверти круга, π = 3
      var R = r.int(2, 6), W = 2 * R + r.int(2, 8), Hh = R + r.int(0, 4);
      var P1 = 2 * W + 2 * Hh + 3 * R, P2 = 2 * W + 2 * Hh + R, ask = lvl === 4 ? 'diff' : r.pick(['diff', 'p1', 'p2']);
      var u = Math.min(190 / (W + 2 * R), 16), Ru = R * u, Wu = W * u, Hu = Hh * u;
      var x0 = 8 + Ru, y0 = 20, yb = 20 + Hu;
      var f1 = '<path d="M' + r1(x0 - Ru) + ',' + r1(yb) + ' L' + r1(x0 + Wu + Ru) + ',' + r1(yb) + ' A' + r1(Ru) + ',' + r1(Ru) + ' 0 0 0 ' + r1(x0 + Wu) + ',' + r1(yb - Ru) + ' L' + r1(x0 + Wu) + ',' + y0 + ' L' + r1(x0) + ',' + y0 + ' L' + r1(x0) + ',' + r1(yb - Ru) + ' A' + r1(Ru) + ',' + r1(Ru) + ' 0 0 0 ' + r1(x0 - Ru) + ',' + r1(yb) + ' Z" class="sh2"/>' +
        line(x0, yb - Ru, x0, yb, 'dim') + line(x0 + Wu, yb - Ru, x0 + Wu, yb, 'dim') + txt(x0 + Wu / 2, y0 - 4, W) + txt(x0 + 5, y0 + Hu / 2 + 4, Hh, '', 'start') + txt(x0 - Ru / 2, yb + 15, R) + txt(x0 + Wu / 2, yb + 34, '1', 'big');
      var w1 = 2 * 8 + Wu + 2 * Ru, h1 = yb + 40;
      var y2 = 8 + Ru, yb2 = y2 + Hu, cx = 8 + Wu / 2;
      var f2 = '<path d="M8,' + r1(yb2) + ' L' + r1(8 + Wu) + ',' + r1(yb2) + ' L' + r1(8 + Wu) + ',' + r1(y2) + ' L' + r1(cx + Ru) + ',' + r1(y2) + ' A' + r1(Ru) + ',' + r1(Ru) + ' 0 0 0 ' + r1(cx - Ru) + ',' + r1(y2) + ' L8,' + r1(y2) + ' Z" class="sh2"/>' +
        line(cx - Ru, y2, cx + Ru, y2, 'dim') + line(cx, y2, cx, y2 - Ru, 'dim') + txt(cx + Ru / 2, y2 + 14, R) + txt(8 + Wu / 2, yb2 + 15, W) + txt(8 + Wu + 4, y2 + Hu / 2 + 4, Hh, '', 'start') + txt(8 + Wu / 2, yb2 + 34, '2', 'big');
      var w2 = 30 + Wu, h2 = yb2 + 40;
      var pc = figs([svgEl(r1(w1), r1(h1), f1), svgEl(r1(w2), r1(h2), f2)]);
      var ans, wrong, qk, qr;
      if (ask === 'diff') { ans = 2 * R; wrong = [0, R, 4 * R, 3 * R]; qk = '1-фигураның периметрі 2-фигураның периметрінен неше сантиметрге артық?'; qr = 'На сколько сантиметров периметр фигуры 1 больше периметра фигуры 2?'; }
      else if (ask === 'p1') { ans = P1; wrong = [P1 + 2 * R, 2 * W + 2 * Hh + 6 * R, 2 * W + 2 * Hh, P1 - R]; qk = '1-фигураның периметрін табыңыз.'; qr = 'Найдите периметр фигуры 1.'; }
      else { ans = P2; wrong = [P1, P2 + 2 * R, 2 * W + 2 * Hh + 4 * R, 2 * W + 2 * Hh]; qk = '2-фигураның периметрін табыңыз.'; qr = 'Найдите периметр фигуры 2.'; }
      return P('Ұзындығы ' + W + ' см, ені ' + Hh + ' см тіктөртбұрыштан және радиусы ' + R + ' см екі ширек дөңгелектен екі фигура құралды (суретте). ' + qk + ' (π = 3)',
        'Из прямоугольника ' + W + ' см × ' + Hh + ' см и двух четвертей круга радиусом ' + R + ' см сложили две фигуры (см. рисунок). ' + qr + ' (π = 3)', pc, ans, wrong,
        'Ширек доға: 2 · 3 · ' + R + ' : 4 = ' + fmt(1.5 * R) + ' см. 1-фигура: астыңғы жағы ' + (W + 2 * R) + ', үсті ' + W + ', бүйірлері 2 · ' + (Hh - R) + ', екі доға ' + 3 * R + ' ⇒ ' + P1 + ' см. 2-фигура: екі ширек жарты дөңгелек құрайды (доғасы ' + 3 * R + '), ол тіктөртбұрыштың ' + 2 * R + ' см бөлігін жабады ⇒ ' + (2 * W + 2 * Hh) + ' − ' + 2 * R + ' + ' + 3 * R + ' = ' + P2 + ' см. Айырма ' + 2 * R + ' см.',
        'Дуга четверти: 2 · 3 · ' + R + ' : 4 = ' + fmt(1.5 * R) + ' см. Фигура 1: низ ' + (W + 2 * R) + ', верх ' + W + ', боковые 2 · ' + (Hh - R) + ', две дуги ' + 3 * R + ' ⇒ ' + P1 + ' см. Фигура 2: две четверти дают полукруг (дуга ' + 3 * R + '), он закрывает ' + 2 * R + ' см стороны ⇒ ' + P2 + ' см. Разность ' + 2 * R + ' см.', { unit: unit('см') });
    } },
    { id: 'b25.cut_square_perims', lv: [2, 3], f: function (r, lvl) {   // квадрат разрезан на прямоугольники, сумма периметров
      var a = r.int(3, 15), Rr = lvl === 2 ? 1 : r.int(2, 4), C = lvl === 2 ? r.int(3, 6) : r.int(2, 4), S = 2 * a * (Rr + C), cnt = Rr * C;
      function cuts(k) { var w = []; for (var i = 0; i < k; i++) w.push(r.int(2, 5)); var t = sum(w), acc = 0, out = []; for (i = 0; i < k - 1; i++) { acc += w[i]; out.push(150 * acc / t); } return out; }
      var xs = cuts(C), ys = cuts(Rr), out = rect(10, 10, 150, 150, 'sh2');
      xs.forEach(function (x) { out += line(10 + x, 10, 10 + x, 160); });
      ys.forEach(function (y) { out += line(10, 10 + y, 160, 10 + y); });
      return P('Шаршы түзу кесінділер бойымен ' + cnt + ' тіктөртбұрышқа бөлінді (суретте). Барлық тіктөртбұрыштардың периметрлерінің қосындысы ' + S + ' см. Шаршының ауданын табыңыз.',
        'Квадрат разрезали прямыми на ' + cnt + ' прямоугольников (см. рисунок). Сумма периметров всех прямоугольников равна ' + S + ' см. Найдите площадь квадрата.', pic(170, 170, out),
        a * a, [a, Math.pow(Math.round(S / 4), 2), 2 * a * a, a * (Rr + C)],
        'Шаршының қабырғасы a болсын. Әр қатардағы тіктөртбұрыштардың енін қоссақ — a, сондықтан жоғарғы және төменгі жақтар: 2a · ' + Rr + '; бүйір жақтар: 2a · ' + C + '. Барлығы 2a(' + Rr + ' + ' + C + ') = ' + 2 * (Rr + C) + 'a = ' + S + ' ⇒ a = ' + a + ', ауданы ' + a * a + ' см².',
        'Пусть сторона квадрата a. Ширины прямоугольников в ряду дают a, поэтому верхние и нижние стороны: 2a · ' + Rr + ', боковые: 2a · ' + C + '. Итого ' + 2 * (Rr + C) + 'a = ' + S + ' ⇒ a = ' + a + ', площадь ' + a * a + ' см².', { unit: unit('см²') });
    } },
    { id: 'b25.chain_squares', lv: [2, 3], f: function (r, lvl) {   // квадраты 2, 4, 6: угол следующего — в центре предыдущего
      var n = lvl === 2 ? 3 : 4, s = [], i;
      if (lvl === 2) { var a0 = r.pick([2, 4]), st = r.pick([2, 4]); for (i = 0; i < n; i++) s.push(a0 + i * st); }
      else { var cur = 2 * r.int(1, 2); for (i = 0; i < n; i++) { s.push(cur); cur += 2 * r.int(1, 3); } }
      var sq = sum(s.map(function (x) { return x * x; })), ov2 = s.slice(0, n - 1).map(function (x) { return x * x / 4; }), area = sq - sum(ov2);
      var per = 4 * sum(s) - 2 * sum(s.slice(0, n - 1)), ask = lvl === 2 ? 'area' : r.pick(['area', 'per']);
      var pos = [0]; for (i = 1; i < n; i++) pos.push(pos[i - 1] + s[i - 1] / 2);
      var ext = pos[n - 1] + s[n - 1], u = 190 / ext, out = '';
      for (i = 0; i < n; i++) out += rect(34 + pos[i] * u, 8 + pos[i] * u, s[i] * u, s[i] * u, 'sh2', ' fill-opacity="0.75"');
      for (i = 0; i < n; i++) { out += txt(30 + pos[i] * u, 8 + (pos[i] + s[i] / 2) * u + 4, s[i], '', 'end'); if (i < n - 1) out += '<circle cx="' + r1(34 + (pos[i] + s[i] / 2) * u) + '" cy="' + r1(8 + (pos[i] + s[i] / 2) * u) + '" r="3" class="dot"/>'; }
      var area_ = ask === 'area';
      return P('Қабырғалары ' + s.join(', ') + ' см шаршылар суреттегідей орналасқан: әр келесі шаршының бір төбесі алдыңғы шаршының центрінде жатыр, қабырғалары параллель. Шыққан фигураның ' + (area_ ? 'ауданын' : 'периметрін') + ' табыңыз.',
        'Квадраты со сторонами ' + s.join(', ') + ' см расположены как на рисунке: вершина каждого следующего квадрата — в центре предыдущего, стороны параллельны. Найдите ' + (area_ ? 'площадь' : 'периметр') + ' получившейся фигуры.',
        pic(240, 206, out), area_ ? area : per, area_ ? [sq, sq - 2 * sum(ov2), sq - sum(ov2.slice(1))] : [4 * sum(s), 4 * sum(s) - 4 * sum(s.slice(0, n - 1)), per + 2 * s[0]],
        area_ ? 'Көршілес шаршылар кішісінің ширегі бойынша қабаттасады: ' + ov2.join(' + ') + ' = ' + sum(ov2) + ' см². S = ' + sq + ' − ' + sum(ov2) + ' = ' + area + ' см².'
          : 'Әр қабаттасу (қабырғасы s/2 шаршы) периметрден 4 · s/2 = 2s алып тастайды: ' + 4 * sum(s) + ' − 2 · (' + s.slice(0, n - 1).join(' + ') + ') = ' + per + ' см.',
        area_ ? 'Соседние квадраты перекрываются четвертью меньшего: ' + ov2.join(' + ') + ' = ' + sum(ov2) + ' см². S = ' + sq + ' − ' + sum(ov2) + ' = ' + area + ' см².'
          : 'Каждое перекрытие (квадрат со стороной s/2) убирает из периметра 4 · s/2 = 2s: ' + 4 * sum(s) + ' − 2 · (' + s.slice(0, n - 1).join(' + ') + ') = ' + per + ' см.', { unit: unit(area_ ? 'см²' : 'см') });
    } },
    { id: 'b25.point_shift', lv: [1, 2], f: function (r, lvl) {   // B(3; −2): 5 влево, 3 вверх → (−2; 1)
      var x = r.int(-6, 6) || 4, y = r.int(-6, 6) || -3, Lt = r.pick(['A', 'B', 'C', 'M', 'K']);
      var dx = r.int(2, 7) * (r.chance(0.5) ? 1 : -1), dy = r.int(1, 6) * (r.chance(0.5) ? 1 : -1);
      function pt(a, b) { return '(' + num(a) + '; ' + num(b) + ')'; }
      var mk = Math.abs(dx) + ' бірлік ' + (dx < 0 ? 'солға' : 'оңға') + ' және ' + Math.abs(dy) + ' бірлік ' + (dy > 0 ? 'жоғары' : 'төмен'), mr = 'на ' + Math.abs(dx) + ' ед. ' + (dx < 0 ? 'влево' : 'вправо') + ' и на ' + Math.abs(dy) + ' ед. ' + (dy > 0 ? 'вверх' : 'вниз');
      if (lvl === 1) {
        var ans = pt(x + dx, y + dy);
        return Q(Lt + pt(x, y) + ' нүктесін ' + mk + ' жылжытты. Жаңа нүктенің координаталары қандай?', 'Точку ' + Lt + pt(x, y) + ' сдвинули ' + mr + '. Каковы координаты новой точки?', ans,
          uniq(ans, [pt(x - dx, y + dy), pt(x + dy, y + dx), pt(x + dx, y - dy), pt(x - dx, y - dy)], String, 4),
          'Солға/оңға — x өзгереді: ' + num(x) + sgnT(dx) + ' = ' + num(x + dx) + '; жоғары/төмен — y өзгереді: ' + num(y) + sgnT(dy) + ' = ' + num(y + dy) + '. Жауабы ' + ans + '.',
          'Влево/вправо меняется x: ' + num(x) + sgnT(dx) + ' = ' + num(x + dx) + '; вверх/вниз — y: ' + num(y) + sgnT(dy) + ' = ' + num(y + dy) + '. Ответ ' + ans + '.');
      }
      var ax = r.pick(['Ox', 'Oy']), rx = ax === 'Oy' ? -x : x, ry = ax === 'Ox' ? -y : y, ans2 = pt(rx + dx, ry + dy);
      var swapAx = ax === 'Ox' ? [-x, y] : [x, -y];
      return Q(Lt + pt(x, y) + ' нүктесін алдымен ' + ax + ' осіне қатысты симметриялы бейнеледі, содан кейін ' + mk + ' жылжытты. Шыққан нүктенің координаталары қандай?',
        'Точку ' + Lt + pt(x, y) + ' сначала отразили симметрично относительно оси ' + ax + ', затем сдвинули ' + mr + '. Каковы координаты полученной точки?', ans2,
        uniq(ans2, [pt(swapAx[0] + dx, swapAx[1] + dy), pt(x + dx, y + dy), pt(ax === 'Oy' ? -(x + dx) : x + dx, ax === 'Ox' ? -(y + dy) : y + dy), pt(rx - dx, ry + dy), pt(-x + dx, -y + dy), pt(rx + dx, ry - dy), pt(rx - dx, ry - dy), pt(rx + dy, ry + dx), pt(rx + dx + 1, ry + dy)], String, 4),
        ax + ' осіне қатысты симметрия: ' + pt(rx, ry) + '. Жылжыту: ' + pt(rx + dx, ry + dy) + '.', 'Симметрия относительно ' + ax + ': ' + pt(rx, ry) + '. Сдвиг: ' + ans2 + '.');
    } }
  );

  /* ================= Санау (l_count) ================= */
  F.l_count.push(
    { id: 'b25.graph_roads', lv: [2, 3], f: function (r, lvl) {   // каждые два города соединены — сколько дорог не нарисовано
      var n = lvl === 2 ? r.int(5, 6) : r.int(7, 8), total = n * (n - 1) / 2, edges = [], i, j;
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) edges.push([i, j]);
      var m = r.int(Math.ceil(total / 3), Math.floor(total * 2 / 3)), shown = r.shuffle(edges).slice(0, m), ans = total - m;
      var cx = 110, cy = 105, R = 88, pts = [], LET = 'ABCDEFGH', out = '';
      for (i = 0; i < n; i++) { var a = -Math.PI / 2 + 2 * Math.PI * i / n; pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
      shown.forEach(function (e) { out += line(pts[e[0]][0], pts[e[0]][1], pts[e[1]][0], pts[e[1]][1]); });
      pts.forEach(function (p, k) { out += '<circle cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="11" class="bg"/>' + txt(p[0], p[1] + 4.5, LET[k]); });
      return P('Аймақта ' + n + ' қала бар. Әр екі қала бір-бірімен тура жолмен қосылуы тиіс. Суретте қазір салынған жолдар көрсетілген. Тағы неше жол салу керек?',
        'В области ' + n + ' городов. Каждые два города должны быть соединены прямой дорогой. На рисунке показаны уже построенные дороги. Сколько дорог ещё нужно построить?', pic(220, 210, out),
        ans, [n * (n - 1) - m, total, m, ans + 1],
        'Әр екі қалаға бір жол: ' + n + ' · ' + (n - 1) + ' : 2 = ' + total + '. Суретте ' + m + ' жол. ' + total + ' − ' + m + ' = ' + ans + '.',
        'На каждую пару городов одна дорога: ' + n + ' · ' + (n - 1) + ' : 2 = ' + total + '. На рисунке ' + m + '. ' + total + ' − ' + m + ' = ' + ans + '.');
    } },
    { id: 'b25.sets3', lv: [3, 4], f: function (r, lvl) {   // три кружка, формула включений-исключений
      var a = r.int(2, 12), b = r.int(2, 12), c = r.int(2, 12), ab = r.int(1, 6), ac = r.int(1, 6), bc = r.int(1, 6), abc = r.int(1, 5), none = r.int(1, 8);
      var A = a + ab + ac + abc, B = b + ab + bc + abc, C = c + ac + bc + abc, AB = ab + abc, AC = ac + abc, BC = bc + abc, N = a + b + c + ab + ac + bc + abc + none;
      var ask = lvl === 4 ? 'one' : r.pick(['all', 'none']), S1 = A + B + C, S2 = AB + AC + BC;
      var kk = 'Сыныпта ' + N + ' оқушы бар. Математика үйірмесіне — ' + A + ' оқушы, шахматқа — ' + B + ', биге — ' + C + '. Математика мен шахматқа ' + AB + ' оқушы, математика мен биге ' + AC + ' оқушы, шахмат пен биге ' + BC + ' оқушы қатысады (бұл сандарға үш үйірмеге де баратындар да кіреді). ';
      var ru = 'В классе ' + pl(N, 'ученик', 'ученика', 'учеников') + '. В кружок математики ходят ' + A + ', в шахматный — ' + B + ', на танцы — ' + C + '. На математику и шахматы ходят ' + AB + ', на математику и танцы — ' + AC + ', на шахматы и танцы — ' + BC + ' (в эти числа входят и те, кто ходит во все три кружка). ';
      var ans, wrong, sk, sr;
      if (ask === 'all') {
        ans = abc; wrong = [abc + none, abc + 1, S2 - abc, abc + 2];
        kk += none + ' оқушы ешбір үйірмеге бармайды. Үш үйірменің үшеуіне де неше оқушы барады?';
        ru += pl(none, 'ученик', 'ученика', 'учеников') + ' не ходят ни в один кружок. Сколько учеников ходят во все три кружка?';
        sk = 'Үйірмеге баратындар: ' + N + ' − ' + none + ' = ' + (N - none) + '. Формула: ' + (N - none) + ' = ' + S1 + ' − ' + S2 + ' + x ⇒ x = ' + abc + '.';
        sr = 'Ходят в кружки: ' + N + ' − ' + none + ' = ' + (N - none) + '. Формула: ' + (N - none) + ' = ' + S1 + ' − ' + S2 + ' + x ⇒ x = ' + abc + '.';
      } else if (ask === 'none') {
        ans = none; wrong = [none + abc, Math.abs(none - abc) || none + 2, none + 1, N - S1 + S2];
        kk += 'Үш үйірмеге де ' + abc + ' оқушы барады. Ешбір үйірмеге бармайтын неше оқушы бар?';
        ru += 'Во все три кружка ходят ' + pl(abc, 'ученик', 'ученика', 'учеников') + '. Сколько учеников не ходят ни в один кружок?';
        sk = 'Кемінде бір үйірмеге: ' + S1 + ' − ' + S2 + ' + ' + abc + ' = ' + (N - none) + '. Ешбірінде жоқ: ' + N + ' − ' + (N - none) + ' = ' + none + '.';
        sr = 'Хотя бы в одном кружке: ' + S1 + ' − ' + S2 + ' + ' + abc + ' = ' + (N - none) + '. Ни в одном: ' + N + ' − ' + (N - none) + ' = ' + none + '.';
      } else {
        ans = a + b + c; wrong = [S1 - S2, S1 - 2 * S2 > 0 ? S1 - 2 * S2 : ans + abc + 1, ans + abc, N - none - ab - ac - bc];
        kk += 'Үш үйірмеге де ' + abc + ' оқушы барады. Тек бір ғана үйірмеге неше оқушы барады?';
        ru += 'Во все три кружка ходят ' + pl(abc, 'ученик', 'ученика', 'учеников') + '. Сколько учеников ходят ровно в один кружок?';
        sk = 'Тек екеуіне: ' + (AB - abc) + ', ' + (AC - abc) + ', ' + (BC - abc) + '. Тек математика: ' + A + ' − ' + (AB - abc) + ' − ' + (AC - abc) + ' − ' + abc + ' = ' + a + '; тек шахмат: ' + b + '; тек би: ' + c + '. Барлығы ' + ans + '.';
        sr = 'Ровно в два: ' + (AB - abc) + ', ' + (AC - abc) + ', ' + (BC - abc) + '. Только математика: ' + a + ', только шахматы: ' + b + ', только танцы: ' + c + '. Всего ' + ans + '.';
      }
      return Q(kk, ru, ans, wrong, sk, sr);
    } },
    { id: 'b25.books_adjacent', lv: [2, 3], f: function (r, lvl) {   // n книг, две рядом
      var n = lvl === 2 ? r.int(4, 6) : r.int(5, 7), kind = lvl === 2 ? 'adj' : r.pick(['not', 'three']), ans, wrong, ck, cr, sk, sr;
      if (kind === 'adj') {
        ans = 2 * fact(n - 1); wrong = [fact(n - 1), fact(n), 2 * fact(n - 2), fact(n) - 2 * fact(n - 1)];
        ck = 'Математика мен физика кітаптары қатар (жанында) тұруы тиіс.'; cr = 'Книги по математике и физике должны стоять рядом.';
        sk = 'Екі кітапты бір «блок» деп санаймыз: ' + (n - 1) + ' зат, ' + (n - 1) + '! = ' + fact(n - 1) + '; блок ішінде 2 рет. 2 · ' + fact(n - 1) + ' = ' + ans + '.';
        sr = 'Склеиваем две книги в «блок»: ' + (n - 1) + ' предметов, ' + (n - 1) + '! = ' + fact(n - 1) + '; внутри блока 2 порядка. Итого ' + ans + '.';
      } else if (kind === 'not') {
        ans = fact(n) - 2 * fact(n - 1); wrong = [2 * fact(n - 1), fact(n) - fact(n - 1), fact(n), fact(n - 1)];
        ck = 'Математика мен физика кітаптары қатар тұрмауы тиіс.'; cr = 'Книги по математике и физике не должны стоять рядом.';
        sk = 'Барлық тәсіл: ' + n + '! = ' + fact(n) + '. Қатар тұратындары: 2 · ' + (n - 1) + '! = ' + 2 * fact(n - 1) + '. ' + fact(n) + ' − ' + 2 * fact(n - 1) + ' = ' + ans + '.';
        sr = 'Всего: ' + n + '! = ' + fact(n) + '. Рядом: 2 · ' + (n - 1) + '! = ' + 2 * fact(n - 1) + '. Не рядом: ' + ans + '.';
      } else {
        ans = 6 * fact(n - 2); wrong = [fact(n - 2), 2 * fact(n - 2), 6 * fact(n - 3), 3 * fact(n - 2)];
        ck = 'Математика, физика және химия кітаптары қатар (кез келген ретпен) тұруы тиіс.'; cr = 'Книги по математике, физике и химии должны стоять рядом (в любом порядке).';
        sk = 'Үш кітап — бір «блок»: ' + (n - 2) + '! = ' + fact(n - 2) + ' тәсіл; блок ішінде 3! = 6. 6 · ' + fact(n - 2) + ' = ' + ans + '.';
        sr = 'Три книги — один «блок»: ' + (n - 2) + '! = ' + fact(n - 2) + '; внутри блока 3! = 6. Итого ' + ans + '.';
      }
      return Q('Сөреге ' + n + ' түрлі кітапты бір қатарға қою керек. ' + ck + ' Неше тәсілмен қоюға болады?', 'На полку нужно поставить в ряд ' + n + ' разных книг. ' + cr + ' Сколькими способами это можно сделать?', ans, wrong, sk, sr);
    } }
  );

  /* ================= Бөлінгіштік (m_divis) ================= */
  F.m_divis.push({ id: 'b25.prod_max_sum', lv: [2, 3], f: function (r, lvl) {   // три разных натуральных, произведение P
    var Pp = r.pick(lvl === 2 ? [24, 30, 36, 40, 42, 48, 54, 56, 60, 66, 70, 72] : [72, 84, 90, 96, 120, 126, 144, 150, 168, 180, 210, 240]);
    var trip = [], a, b, rep2 = [];
    for (a = 1; a * a * a < Pp; a++) if (Pp % a === 0) for (b = a + 1; a * b * b < Pp; b++) if ((Pp / a) % b === 0) trip.push([a, b, Pp / a / b]);
    for (a = 1; a * a * a <= Pp; a++) if (Pp % a === 0) for (b = a; a * b * b <= Pp; b++) if ((Pp / a) % b === 0) rep2.push(a + b + Pp / a / b);
    var sums = trip.map(function (t) { return t[0] + t[1] + t[2]; }).sort(function (x, y) { return x - y; });
    var askMax = lvl === 2 || r.chance(0.5), ans = askMax ? sums[sums.length - 1] : sums[0];
    var best = trip.filter(function (t) { return t[0] + t[1] + t[2] === ans; })[0];
    var wrong = askMax ? [Pp + 2, sums[sums.length - 2], sums[sums.length - 3], ans - 1] : [Math.min.apply(null, rep2), sums[1], sums[2], ans + 1];
    return Q('Үш түрлі натурал санның көбейтіндісі ' + Pp + '-ге тең. Олардың қосындысының ең ' + (askMax ? 'үлкен' : 'кіші') + ' мүмкін мәнін табыңыз.',
      'Произведение трёх различных натуральных чисел равно ' + Pp + '. Найдите ' + (askMax ? 'наибольшее' : 'наименьшее') + ' возможное значение их суммы.', ans, wrong,
      (askMax ? 'Қосынды үлкен болуы үшін сандардың бірі 1, екіншісі — мүмкін болатын ең кіші бөлгіш (сандар әртүрлі!): ' : 'Қосынды кіші болуы үшін сандар бір-біріне жақын болуы керек: ') + best.join(' · ') + ' = ' + Pp + ', ' + best.join(' + ') + ' = ' + ans + '.',
      (askMax ? 'Чтобы сумма была наибольшей, одно число 1, другое — наименьший подходящий делитель (числа разные!): ' : 'Чтобы сумма была наименьшей, числа должны быть близки: ') + best.join(' · ') + ' = ' + Pp + ', сумма ' + ans + '.');
  } });

  /* ================= Амалдар реті (m_order) ================= */
  F.m_order.push({ id: 'b25.fix_by_one', lv: [2, 3], f: function (r, lvl) {   // какое число увеличить на 1
    for (;;) {
      var v, V, deltas, s;
      if (lvl === 2) { v = [r.int(10, 40), r.int(3, 12), r.int(3, 12), r.int(2, 15)]; V = v[0] + v[1] * v[2] - v[3]; deltas = [1, v[2], v[1], -1]; s = v[0] + ' + ' + v[1] + ' · ' + v[2] + ' − ' + v[3]; }
      else { v = [r.int(3, 12), r.int(3, 12), r.int(2, 20), r.int(3, 12), r.int(3, 12)]; V = v[0] * v[1] - v[2] + v[3] * v[4]; deltas = [v[1], v[0], -1, v[4], v[3]]; s = v[0] + ' · ' + v[1] + ' − ' + v[2] + ' + ' + v[3] + ' · ' + v[4]; }
      if (v.some(function (x, j) { return v.indexOf(x) !== j; })) continue;
      var cand = [];
      deltas.forEach(function (d, j) { if (Math.abs(d) > 1 && deltas.filter(function (e) { return e === d; }).length === 1) cand.push(j); });
      if (!cand.length) continue;
      var k = r.pick(cand), T = V + deltas[k], ans = String(v[k]);
      var lst = v.map(function (x, j) { return x + ' → ' + (deltas[j] > 0 ? '+' : '−') + Math.abs(deltas[j]); }).join('; ');
      var e = expr(s + ' = ' + T);
      return Q('Теңдік қате. Сандардың біреуін 1-ге арттырса, теңдік дұрыс болады. Қай санды арттыру керек?' + e, 'Равенство неверно. Если одно из чисел увеличить на 1, оно станет верным. Какое число нужно увеличить?' + e,
        ans, r.shuffle(v.filter(function (x, j) { return j !== k; }).map(String)),
        'Қазір сол жағы ' + V + ', керегі ' + T + ': ' + deltas[k] + '-ке артуы керек. Әр санды 1-ге арттырғанда: ' + lst + '. Тек ' + ans + ' сәйкес.',
        'Сейчас левая часть равна ' + V + ', нужно ' + T + ': увеличить на ' + deltas[k] + '. При увеличении каждого числа на 1: ' + lst + '. Подходит только ' + ans + '.');
    }
  } });

  /* ================= Пайыз (m_percent) ================= */
  F.m_percent.push(
    { id: 'b25.pie_diff', lv: [2, 3], f: function (r, lvl) {   // круговая диаграмма, разность двух секторов
      var k = lvl === 2 ? 3 : 4, ps, i;
      for (;;) {
        var cut = r.shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]).slice(0, k - 1).sort(function (a, b) { return a - b; });
        ps = []; var prev = 0; cut.concat([20]).forEach(function (c) { ps.push((c - prev) * 5); prev = c; });
        if (ps.every(function (p, j) { return p >= 10 && ps.indexOf(p) === j; })) break;
      }
      var LET = ['A', 'B', 'C', 'D'], idx = r.shuffle(ps.map(function (_, j) { return j; })), X = idx[0], Y = idx[1], Zi = idx[2];
      if (ps[X] < ps[Y]) { var t = X; X = Y; Y = t; }
      var total = 20 * r.int(2, 12), cnt = ps.map(function (p) { return total * p / 100; }), D = cnt[X] - cnt[Y], ans = cnt[Zi];
      var cx = 140, cy = 108, R = 76, out = '', ang = -90;
      ps.forEach(function (p, j) {
        var a1 = ang * Math.PI / 180, a2 = (ang + p * 3.6) * Math.PI / 180, mid = (ang + p * 1.8) * Math.PI / 180;
        out += '<path d="M' + cx + ',' + cy + ' L' + r1(cx + R * Math.cos(a1)) + ',' + r1(cy + R * Math.sin(a1)) + ' A' + R + ',' + R + ' 0 ' + (p > 50 ? 1 : 0) + ' 1 ' + r1(cx + R * Math.cos(a2)) + ',' + r1(cy + R * Math.sin(a2)) + ' Z" class="p' + (j + 1) + '"/>';
        out += txt(cx + (R + 26) * Math.cos(mid), cy + (R + 22) * Math.sin(mid) + 5, '<tspan font-weight="700">' + LET[j] + '</tspan> ' + p + '%');
        ang += p * 3.6;
      });
      return P('Оқушылар сауалнамаға жауап берді, нәтижесі диаграммада көрсетілген. ' + LET[X] + ' тобындағы оқушылар ' + LET[Y] + ' тобындағыдан ' + D + '-ге көп. ' + LET[Zi] + ' тобында неше оқушы бар?',
        'Результаты опроса учеников показаны на диаграмме. В группе ' + LET[X] + ' на ' + pl(D, 'ученика', 'ученика', 'учеников') + ' больше, чем в группе ' + LET[Y] + '. Сколько учеников в группе ' + LET[Zi] + '?', pic(280, 220, out),
        ans, [total, D * ps[Zi] / 100 % 1 === 0 ? D * ps[Zi] / 100 : ans + 2, cnt[X], Math.round(D * ps[Zi] / ps[X])],
        ps[X] + '% − ' + ps[Y] + '% = ' + (ps[X] - ps[Y]) + '% — бұл ' + D + ' оқушы. Барлығы: ' + D + ' : ' + (ps[X] - ps[Y]) + ' · 100 = ' + total + '. ' + LET[Zi] + ': ' + total + ' · ' + ps[Zi] + '/100 = ' + ans + '.',
        ps[X] + '% − ' + ps[Y] + '% = ' + (ps[X] - ps[Y]) + '% — это ' + pl(D, 'ученик', 'ученика', 'учеников') + '. Всего: ' + total + '. ' + LET[Zi] + ': ' + total + ' · ' + ps[Zi] + '/100 = ' + ans + '.');
    } },
    { id: 'b25.price_drop_count', lv: [2, 3], f: function (r, lvl) {   // купил 9 штук, цена упала на 25 % → сколько теперь
      var opts = [];
      [10, 20, 25, 40, 50, 60, 75, 80].forEach(function (p) { for (var n = 3; n <= 30; n++) if ((n * 100) % (100 - p) === 0) opts.push([p, n]); });
      var c = r.pick(opts), p = c[0], n = c[1], m = n * 100 / (100 - p);
      if (lvl === 2) return Q('Асан ' + n + ' дәптер сатып алды. Кейін дәптердің бағасы ' + p + '%-ға арзандады. Сол ақшаға енді неше дәптер сатып алуға болады?',
        'Асан купил ' + pl(n, 'тетрадь', 'тетради', 'тетрадей') + '. Потом цена тетради снизилась на ' + p + '%. Сколько тетрадей теперь можно купить на те же деньги?', m,
        [Math.round(n * (1 + p / 100)), m - 1, m + 1, n + Math.round(p / 10)],
        'Жаңа баға — бұрынғының ' + (100 - p) + '%-ы. Ақша өзгермейді, сондықтан саны 100/' + (100 - p) + ' есе артады: ' + n + ' · 100/' + (100 - p) + ' = ' + m + '. (Санды ' + p + '%-ға арттыру — қате.)',
        'Новая цена — ' + (100 - p) + '% старой. Денег столько же, значит количество растёт в 100/' + (100 - p) + ' раза: ' + n + ' · 100/' + (100 - p) + ' = ' + m + '. (Увеличить количество на ' + p + '% — ошибка.)');
      return Q('Асан ' + n + ' дәптер сатып алды. Баға төмендегеннен кейін сол ақшаға ' + m + ' дәптер сатып алуға болады. Баға неше пайызға төмендеді?',
        'Асан купил ' + pl(n, 'тетрадь', 'тетради', 'тетрадей') + '. После снижения цены на те же деньги можно купить ' + pl(m, 'тетрадь', 'тетради', 'тетрадей') + '. На сколько процентов снизилась цена?', p,
        [Math.round(100 * (m - n) / n), m - n, 100 - p, p + 5],
        'Баға ' + m + '/' + n + ' есе емес, ' + n + '/' + m + ' бөлігіне дейін азайды: жаңа баға = ' + fmt(100 * n / m) + '%. Төмендеу: 100 − ' + fmt(100 * n / m) + ' = ' + p + '%.',
        'Цена стала составлять ' + n + '/' + m + ' прежней = ' + fmt(100 * n / m) + '%. Снижение: 100 − ' + fmt(100 * n / m) + ' = ' + p + '%.', { unit: unit('%') });
    } }
  );

  /* ================= Күнтізбе, сағат (l_cal) ================= */
  F.l_cal.push({ id: 'b25.clock_digits_perm', lv: [3, 4], f: function (r) {   // 20:11 → когда снова те же цифры
    function key(t) { return U.clock(t).replace(':', '').split('').sort().join(''); }
    for (;;) {
      var t0 = r.int(0, 1439), k0 = key(t0), diffs = [];
      for (var d = 1; d < 1440; d++) if (key(t0 + d) === k0) diffs.push(d);
      if (diffs.length < 2 || diffs[0] < 15) continue;
      var ans = diffs[0], shown = diffs.slice(0, 3).map(function (x) { return U.clock(t0 + x); }).join(', ');
      var out = rect(4, 4, 160, 58, 'bg', ' rx="8"') + txt(84, 44, U.clock(t0), 'mw', 'middle').replace('class="mw"', 'class="mw" style="font-size:30px;letter-spacing:3px"');
      return P('Электронды сағат ' + U.clock(t0) + ' көрсетіп тұр. Ең азы неше минуттан кейін сағатта дәл осы төрт цифр (басқа ретпен болуы мүмкін) қайта көрінеді?',
        'Электронные часы показывают ' + U.clock(t0) + '. Через какое наименьшее число минут на часах снова будут те же четыре цифры (возможно, в другом порядке)?', pic(168, 66, out),
        ans, [diffs[1], diffs[2] || ans + 60, ans + 60, ans > 60 ? ans - 60 : ans + 120],
        'Осы цифрлардан құралатын уақыттарды өсу ретімен қарастырамыз: ' + shown + '. Ең жақыны — ' + U.clock(t0 + ans) + ', яғни ' + U.hm(ans) + ' = ' + ans + ' мин кейін.',
        'Перебираем по возрастанию времена из этих цифр: ' + shown + '. Ближайшее — ' + U.clock(t0 + ans) + ', через ' + U.hmRu(ans) + ' = ' + ans + ' мин.', { unit: unit('мин') });
    }
  } });

  /* ================= Мәтінді есептер (m_word) ================= */
  F.m_word.push(
    { id: 'b25.bottle', lv: [2, 3], f: function (r, lvl) {   // бутылка с водой и с мёдом
      var b = 10 * r.int(15, 45), J = 50 * r.int(4, 16), k = lvl === 2 ? 2 : r.pick([1.5, 3]), m1 = b + J, m2 = b + k * J;
      return Q('Бөтелкеге су толтырғанда оның массасы ' + m1 + ' г, ал сол бөтелкеге бал толтырғанда — ' + m2 + ' г болды. Бірдей көлемдегі бал судан ' + fmt(k) + ' есе ауыр. Бос бөтелкенің массасы қанша?',
        'Бутылка с водой весит ' + m1 + ' г, а та же бутылка с мёдом — ' + m2 + ' г. Мёд в ' + fmt(k) + ' раза тяжелее воды того же объёма. Сколько весит пустая бутылка?',
        b, posInts(b, [J, m2 - m1, Math.round(m1 / 2), b + 50, m1 - Math.round((m2 - m1) / k)]),
        'Судың массасы x болсын, онда бал — ' + fmt(k) + 'x. Айырма: ' + fmt(k - 1) + 'x = ' + m2 + ' − ' + m1 + ' = ' + (m2 - m1) + ' ⇒ x = ' + J + ' г. Бөтелке: ' + m1 + ' − ' + J + ' = ' + b + ' г.',
        'Пусть вода весит x, мёд — ' + fmt(k) + 'x. Разность: ' + fmt(k - 1) + 'x = ' + (m2 - m1) + ' ⇒ x = ' + J + ' г. Бутылка: ' + m1 + ' − ' + J + ' = ' + b + ' г.', { unit: unit('г') });
    } },
    { id: 'b25.nested_carts', lv: [2, 3], f: function (r, lvl) {   // тележки вставлены одна в другую
      var c = 5 * r.int(16, 24), d = 5 * r.int(3, 6), k = r.int(2, 5), m = k + r.int(3, 8), L1 = c + (k - 1) * d, L2 = c + (m - 1) * d;
      var N = m + r.int(2, 10), ansN = c + (N - 1) * d, two = lvl === 2;
      return Q('Дүкенде арбалар бірінің ішіне бірі кіргізіліп, бір қатарға тізіледі. ' + k + ' арбадан тұратын қатардың ұзындығы ' + L1 + ' см, ал ' + m + ' арбадан тұратын қатардың ұзындығы ' + L2 + ' см. ' + (two ? 'Бір арбаның ұзындығы қанша?' : N + ' арбадан тұратын қатардың ұзындығы қанша?'),
        'В магазине тележки вставляют одну в другую и ставят в ряд. Ряд из ' + k + ' тележек имеет длину ' + L1 + ' см, а ряд из ' + m + ' тележек — ' + L2 + ' см. ' + (two ? 'Какова длина одной тележки?' : 'Какова длина ряда из ' + N + ' тележек?'),
        two ? c : ansN, two ? posInts(c, [Math.round(L1 / k), d, L2 - L1, c + d]) : posInts(ansN, [N * c, Math.round(L2 / m * N), c + N * d, ansN - d]),
        'Әр қосымша арба қатарды бірдей шамаға ұзартады: (' + L2 + ' − ' + L1 + ') : (' + m + ' − ' + k + ') = ' + d + ' см. Бір арба: ' + L1 + ' − ' + (k - 1) + ' · ' + d + ' = ' + c + ' см.' + (two ? '' : ' ' + N + ' арба: ' + c + ' + ' + (N - 1) + ' · ' + d + ' = ' + ansN + ' см.'),
        'Каждая следующая тележка удлиняет ряд на одно и то же: (' + L2 + ' − ' + L1 + ') : (' + m + ' − ' + k + ') = ' + d + ' см. Одна тележка: ' + L1 + ' − ' + (k - 1) + ' · ' + d + ' = ' + c + ' см.' + (two ? '' : ' ' + N + ' тележек: ' + c + ' + ' + (N - 1) + ' · ' + d + ' = ' + ansN + ' см.'), { unit: unit('см') });
    } },
    { id: 'b25.periodic_days', lv: [2, 3], f: function (r, lvl) {   // утки: каждый день / раз в 2 дня / раз в 3 дня
      var per = lvl === 2 ? [1, 2, 3] : r.pick([[1, 2, 3, 4], [1, 2, 5], [2, 3, 4]]), cnt = per.map(function () { return r.int(2, 9); }), D = lvl === 2 ? r.int(10, 16) : r.int(15, 30);
      var times = per.map(function (p) { return Math.ceil(D / p); }), total = sum(cnt.map(function (c, i) { return c * times[i]; }));
      var fl = sum(cnt.map(function (c, i) { return c * Math.floor(D / per[i]); }));
      function grp(L) { return per.map(function (p, i) { return (L ? pl(cnt[i], 'утка', 'утки', 'уток') + ' — ' : cnt[i] + ' үйрек — ') + (p === 1 ? (L ? 'каждый день' : 'күн сайын') : (L ? 'раз в ' + p + ' дня' : p + ' күнде бір рет')); }).join(', '); }
      return Q('Хайуанаттар бағында үйректер тамақтандырылады: ' + grp(0) + '. Бір тамақтандыруда әр үйрекке бір порция беріледі. Бірінші күні барлық үйрек тамақтандырылды. ' + D + ' күнде (бірінші күнді қоса) барлығы неше порция берілді?',
        'В зоопарке кормят уток: ' + grp(1) + '. За одно кормление каждая утка получает одну порцию. В первый день покормили всех уток. Сколько всего порций выдали за ' + D + ' дней (включая первый)?',
        total, [fl, sum(cnt) * D, total + cnt[cnt.length - 1], Math.round(sum(cnt.map(function (c, i) { return c * D / per[i]; })))],
        per.map(function (p, i) { return cnt[i] + ' · ' + times[i]; }).join(' + ') + ' = ' + total + '. (' + D + ' күнде «' + per[per.length - 1] + ' күнде бір рет» — 1-күннен бастап ' + times[times.length - 1] + ' рет: жоғары қарай дөңгелектейміз.)',
        per.map(function (p, i) { return cnt[i] + ' · ' + times[i]; }).join(' + ') + ' = ' + total + '. («Раз в ' + per[per.length - 1] + ' дня» за ' + D + ' дней начиная с 1-го — ' + times[times.length - 1] + ' раз: округляем вверх.)');
    } }
  );

  /* ================= Көлем (m_volume) ================= */
  F.m_volume.push(
    { id: 'b25.cube_area_vol', lv: [2, 3], f: function (r, lvl) {   // площадь поверхности = k · объём
      var v = r.pick(lvl === 2 ? ['AkV', 'AkV', 'VkA'] : ['AkE', 'VkE', 'AkV']), k, a, kk, ru, sk;
      if (v === 'AkV') { k = r.pick([1, 2, 3]); a = 6 / k; kk = 'Кубтың толық бетінің ауданы сан жағынан оның көлемі' + (k === 1 ? 'не тең' : 'нен ' + k + ' есе үлкен') + '.'; ru = 'Площадь полной поверхности куба численно ' + (k === 1 ? 'равна его объёму' : 'в ' + k + ' ' + razRu(k) + ' больше его объёма') + '.'; sk = '6a² = ' + (k === 1 ? '' : k) + 'a³ ⇒ a = ' + a; }
      else if (v === 'VkA') { k = r.pick([2, 3]); a = 6 * k; kk = 'Кубтың көлемі сан жағынан оның толық бетінің ауданынан ' + k + ' есе үлкен.'; ru = 'Объём куба численно в ' + k + ' ' + razRu(k) + ' больше площади его полной поверхности.'; sk = 'a³ = ' + k + ' · 6a² ⇒ a = ' + a; }
      else if (v === 'AkE') { k = r.pick([1, 2, 3]); a = 2 * k; kk = 'Кубтың толық бетінің ауданы сан жағынан барлық қырларының ұзындықтарының қосындысы' + (k === 1 ? 'на тең' : 'нан ' + k + ' есе үлкен') + '.'; ru = 'Площадь полной поверхности куба численно ' + (k === 1 ? 'равна сумме длин всех его рёбер' : 'в ' + k + ' ' + razRu(k) + ' больше суммы длин всех его рёбер') + '.'; sk = '6a² = ' + (k === 1 ? '' : k + ' · ') + '12a ⇒ a = ' + a; }
      else { k = r.pick([3, 12]); a = Math.sqrt(12 * k); kk = 'Кубтың көлемі сан жағынан барлық қырларының ұзындықтарының қосындысынан ' + k + ' есе үлкен.'; ru = 'Объём куба численно в ' + k + ' ' + razRu(k) + ' больше суммы длин всех его рёбер.'; sk = 'a³ = ' + k + ' · 12a ⇒ a² = ' + 12 * k + ' ⇒ a = ' + a; }
      var V = a * a * a;
      return Q(kk + ' Кубтың көлемін табыңыз.', ru + ' Найдите объём куба.', V, [a, 6 * a * a, a * a, 12 * a],
        sk + '. Көлемі ' + a + '³ = ' + V + '. (Сұрақ — қыр емес, көлем.)', sk + '. Объём ' + a + '³ = ' + V + '. (Спрашивают объём, а не ребро.)');
    } },
    { id: 'b25.stair_paint', lv: [3, 4], f: function (r, lvl) {   // ступенчатая пирамида, банки краски
      var k = lvl === 3 ? r.int(3, 4) : r.int(4, 5), e, C, faces = k * k + 2 * k * (k + 1), area, tries = 0;
      do { e = r.pick([0.5, 0.5, 1]); C = r.pick(e === 1 ? [5, 6, 8, 9] : [2, 3, 4, 5]); area = faces * e * e; } while (Math.abs(area / C - Math.round(area / C)) < 1e-9 && ++tries < 20);
      var cans = Math.ceil(area / C - 1e-9), cells = [], z, x, y;
      for (z = 0; z < k; z++) { var sz = k - z; for (x = 0; x < sz; x++) for (y = k - sz; y < k; y++) cells.push([x, y, z]); }
      var s = k <= 4 ? 24 : 20, dc = drawCubes(cells, s, s / 2);
      var cubesAll = sum(cells.map(function () { return 6; }));
      return P('Қыры ' + fmt(e) + ' м кубтардан сатылы пирамида құрастырылды: ең төменгі қабатта ' + k + ' × ' + k + ' куб, одан жоғарыда ' + (k - 1) + ' × ' + (k - 1) + ', …, ең үстінде 1 куб (суретте). Пирамиданың еденге тиіп тұрған табанынан басқа бүкіл сыртқы беті боялады. Бір банка бояу ' + C + ' м² бетке жетеді. Ең кемі неше банка бояу керек?',
        'Из кубов с ребром ' + fmt(e) + ' м сложили ступенчатую пирамиду: внизу ' + k + ' × ' + k + ' кубов, выше ' + (k - 1) + ' × ' + (k - 1) + ', …, наверху 1 куб (см. рисунок). Красят всю наружную поверхность, кроме основания на полу. Одной банки хватает на ' + C + ' м². Какое наименьшее число банок нужно?',
        pic(dc.w, dc.h, dc.svg), cans, posInts(cans, [Math.floor(area / C), Math.ceil((faces + k * k) * e * e / C - 1e-9), Math.ceil(cubesAll * e * e / C), cans + 1]),
        'Жоғарыдан қарағанда: ' + k + '² = ' + k * k + ' жақ. Әр қабаттың бүйірі: 4 · (қабат жағы), барлығы 4 · (1 + … + ' + k + ') = ' + 2 * k * (k + 1) + '. Барлығы ' + faces + ' жақ, әрқайсысы ' + fmt(e * e) + ' м²: ' + fmt(area) + ' м². ' + fmt(area) + ' : ' + C + ' = ' + fmt(r2(area / C)) + ' ⇒ ' + cans + ' банка (жоғары қарай дөңгелектейміз).',
        'Сверху видно ' + k * k + ' граней, боковые: 4 · (1 + … + ' + k + ') = ' + 2 * k * (k + 1) + '. Всего ' + faces + ' граней по ' + fmt(e * e) + ' м² = ' + fmt(area) + ' м². ' + fmt(area) + ' : ' + C + ' ≈ ' + fmt(r2(area / C)) + ' ⇒ ' + pl(cans, 'банка', 'банки', 'банок') + ' (округляем вверх).');
    } }
  );

  /* ================= Логикалық амал (l_op) ================= */
  F.l_op.push(
    { id: 'b25.op_statements', lv: [2, 3], f: function (r, lvl) {   // [a#b] = (a − 3b)/2; какие утверждения верны
      var p = r.pick([2, 3, 4]), q = lvl === 2 ? 2 : r.pick([2, 3]), sg = r.chance(0.6) ? -1 : 1;
      function op(a, b) { var t = a + sg * p * b; return t % q === 0 ? t / q : null; }
      function mk(type) {
        for (;;) {
          var a = r.int(-6, 18), b = r.int(-6, 12), c = r.int(-6, 12), v, s, t;
          if (type === 1) { v = op(a, b); s = '[' + par(a) + ' # ' + par(b) + ']'; }
          else if (type === 2) { t = op(a, b); v = t === null ? null : op(t, c); s = '[[' + par(a) + ' # ' + par(b) + '] # ' + par(c) + ']'; }
          else { t = op(b, c); v = t === null ? null : op(a, t); s = '[' + par(a) + ' # [' + par(b) + ' # ' + par(c) + ']]'; }
          if (v !== null && Math.abs(v) < 100) return { s: s, v: v, sw: type === 1 ? op(b, a) : null };
        }
      }
      var types = lvl === 2 ? [1, 1, 2, 1] : r.shuffle([1, 2, 3, 2]), nTrue = r.int(1, 3), flags = r.shuffle([0, 1, 2, 3].map(function (i) { return i < nTrue; }));
      var st = types.map(function (tp, i) {
        var m = mk(tp), shown = m.v;
        if (!flags[i]) shown = m.sw !== null && m.sw !== m.v && r.chance(0.5) ? m.sw : m.v + r.pick([1, -1, 2, -2, q]);
        return { s: m.s + ' = ' + num(shown), ok: flags[i], v: m.v, tex: m.s };
      });
      var ansArr = [], i; for (i = 0; i < 4; i++) if (st[i].ok) ansArr.push(i + 1);
      var ans = ansArr.join(', '), subsets = [];
      for (var mask = 1; mask < 16; mask++) { var arr = []; for (i = 0; i < 4; i++) if (mask & (1 << i)) arr.push(i + 1); subsets.push(arr.join(', ')); }
      var close = r.shuffle(subsets.filter(function (s2) { return s2 !== ans && Math.abs(s2.split(',').length - ansArr.length) <= 1; }));
      var def = expr('[a # b] = ' + fx('a ' + (sg < 0 ? '−' : '+') + ' ' + p + 'b', q)), list = expr(st.map(function (x, j) { return (j + 1) + ') ' + x.s; }).join('<br>'));
      var why = function (L) { return st.map(function (x, j) { return (j + 1) + ') ' + x.tex + ' = ' + num(x.v) + ' — ' + (x.ok ? (L ? 'верно' : 'дұрыс') : (L ? 'неверно' : 'қате')); }).join('; '); };
      return Q('Амал төмендегідей анықталған. Қай тұжырымдар дұрыс?' + def + list, 'Операция определена ниже. Какие утверждения верны?' + def + list, ans, close.slice(0, 4),
        'Ішкі жақшадан бастап есептейміз: ' + why(0) + '. Жауабы: ' + ans + '.', 'Считаем с внутренних скобок: ' + why(1) + '. Ответ: ' + ans + '.');
    } },
    { id: 'b25.op_eval', lv: [1, 2], f: function (r, lvl) {   // x■y = 4(13x − 9y) → 5■6
      var k = r.int(2, 5), a = r.int(2, 13), b = r.int(2, 9);
      function op(x, y) { return k * (a * x - b * y); }
      var X, Y; do { X = r.int(2, 9); Y = r.int(2, 9); } while (X === Y || a * X === b * Y || a * Y === b * X);
      var def = expr('x ■ y = ' + k + '(' + a + 'x − ' + b + 'y)');
      if (lvl === 1) {
        var ans = op(X, Y);
        return Q('Амал былай анықталған. ' + X + ' ■ ' + Y + ' мәнін табыңыз.' + def, 'Операция определена так. Найдите ' + X + ' ■ ' + Y + '.' + def, ans,
          [op(Y, X), a * X - b * Y, k * a * X - b * Y, k * (a * X + b * Y)],
          'x = ' + X + ', y = ' + Y + ': ' + k + ' · (' + a + ' · ' + X + ' − ' + b + ' · ' + Y + ') = ' + k + ' · ' + par(a * X - b * Y) + ' = ' + num(ans) + '.',
          'x = ' + X + ', y = ' + Y + ': ' + k + ' · (' + a * X + ' − ' + b * Y + ') = ' + num(ans) + '.');
      }
      var plus = r.chance(0.5), ans2 = plus ? op(X, Y) + op(Y, X) : op(X, Y) - op(Y, X), qq = X + ' ■ ' + Y + (plus ? ' + ' : ' − ') + Y + ' ■ ' + X;
      return Q('Амал былай анықталған. ' + qq + ' мәнін табыңыз.' + def, 'Операция определена так. Найдите ' + qq + '.' + def, ans2,
        [plus ? 2 * op(X, Y) : 0, plus ? op(X, Y) - op(Y, X) : op(X, Y) + op(Y, X), -ans2, ans2 + k],
        X + ' ■ ' + Y + ' = ' + num(op(X, Y)) + ', ' + Y + ' ■ ' + X + ' = ' + num(op(Y, X)) + ' (амал орын ауыстырмалы емес!). Нәтиже: ' + num(ans2) + '.',
        X + ' ■ ' + Y + ' = ' + num(op(X, Y)) + ', ' + Y + ' ■ ' + X + ' = ' + num(op(Y, X)) + ' (операция не перестановочна!). Итог: ' + num(ans2) + '.');
    } }
  );

  /* ================= Логикалық фигуралар (l_fig): полоска ================= */
  F.l_fig.push({ id: 'b25.strip_sums', lv: [2, 3], f: function (r, lvl) {   // «10 _ _ _ 130», суммы трёх подряд
    var L = lvl === 2 ? r.int(5, 7) : r.int(8, 10), p, S, i;
    do { p = [5 * r.int(1, 30), 5 * r.int(1, 30), 5 * r.int(1, 30)]; } while (p[0] === p[1] || p[1] === p[2] || p[0] === p[2]);
    S = sum(p);
    var q = r.int(0, L - 1), rq = q % 3, show = {};
    [0, 1, 2].filter(function (x) { return x !== rq; }).forEach(function (res) { var pos = []; for (var j = res; j < L; j += 3) if (j !== q) pos.push(j); show[r.pick(pos)] = p[res]; });
    var T = 0; for (i = 0; i < L; i++) T += p[i % 3];
    var w = 48, out = '';
    for (i = 0; i < L; i++) out += rect(4 + i * w, 4, w, w, 'vz0') + (i === q ? txt(4 + i * w + w / 2, 4 + w / 2 + 8, '?', 'qm') : show[i] !== undefined ? txt(4 + i * w + w / 2, 4 + w / 2 + 6, show[i], 'big') : '');
    var known = Object.keys(show).map(function (k) { return show[k]; }), ans = p[rq];
    var cntR = [0, 0, 0]; for (i = 0; i < L; i++) cntR[i % 3]++;
    var kk = lvl === 2 ? 'Жолақтың кез келген қатар тұрған үш ұяшығындағы сандардың қосындысы ' + S + '-ге тең. «?» орнына қандай сан тұруы керек?' : 'Жолақтың кез келген қатар тұрған үш ұяшығындағы сандардың қосындысы бірдей, ал жолақтағы барлық сандардың қосындысы ' + T + '. «?» орнына қандай сан тұруы керек?';
    var ru = lvl === 2 ? 'В полоске сумма чисел в любых трёх подряд идущих клетках равна ' + S + '. Какое число должно стоять вместо «?»?' : 'В полоске сумма чисел в любых трёх подряд идущих клетках одинакова, а сумма всех чисел полоски равна ' + T + '. Какое число стоит вместо «?»?';
    var how = lvl === 2 ? S + ' − ' + known.join(' − ') + ' = ' + ans : '(' + T + ' − ' + [0, 1, 2].filter(function (x) { return x !== rq; }).map(function (x) { return cntR[x] + ' · ' + p[x]; }).join(' − ') + ') : ' + cntR[rq] + ' = ' + ans;
    return P(kk, ru, pic(8 + L * w, 56, out), ans, posInts(ans, [S - known[0], Math.round(S / 3 / 5) * 5, known[0], known[1], lvl === 3 ? Math.round((T - sum(known)) / (L - 2)) : S - ans + 5]),
      '(1, 2, 3) және (2, 3, 4) ұяшықтарының қосындылары тең ⇒ 1-ші мен 4-ші ұяшық тең. Сонымен сандар 3 қадам сайын қайталанады. ' + how + '.',
      'Суммы клеток (1, 2, 3) и (2, 3, 4) равны ⇒ 1-я и 4-я клетки равны: числа повторяются через 3. ' + how + '.');
  } });

  /* ================= Тепе-теңдік (l_balance): подвеска ================= */
  F.l_balance.push({ id: 'b25.mobile', lv: [2, 3], f: function (r, lvl) {
    var types = lvl === 2 ? ['s', 'c'] : ['s', 'c', 'q'], nt = types.length, fct = r.pick([5, 10, 20]);
    var SYM = { s: '★', c: '●', q: '■' }, NAME = { s: ['жұлдыз', 'звезда'], c: ['шар', 'шар'], q: ['текше', 'кубик'] };
    function vec(objs) { var v = types.map(function () { return 0; }); objs.forEach(function (o) { v[types.indexOf(o)]++; }); return v; }
    function rank(rows) {
      var m = rows.map(function (x) { return x.slice(); }), rk = 0;
      for (var col = 0; col < nt && rk < m.length; col++) {
        var piv = -1; for (var i = rk; i < m.length; i++) if (Math.abs(m[i][col]) > 1e-9) { piv = i; break; }
        if (piv < 0) continue;
        var t = m[piv]; m[piv] = m[rk]; m[rk] = t;
        for (i = 0; i < m.length; i++) if (i !== rk) { var f = m[i][col] / m[rk][col]; for (var j = 0; j < nt; j++) m[i][j] -= f * m[rk][j]; }
        rk++;
      }
      return rk;
    }
    var mass, top = null, tries;
    for (tries = 0; tries < 400 && !top; tries++) {
      mass = {}; types.forEach(function (t) { mass[t] = r.int(1, 8); });
      if (types.some(function (t, i) { return types.indexOf(t) !== i || types.some(function (u) { return u !== t && mass[u] === mass[t]; }); })) continue;
      var M = function (objs) { return sum(objs.map(function (o) { return mass[o]; })); };
      var leaves = [];
      types.forEach(function (t, i) { leaves.push([t]); types.forEach(function (u, j) { if (j >= i) leaves.push([t, u]); }); });
      var subs = leaves.map(function (l) { return { leaf: l, objs: l }; });
      leaves.forEach(function (l1) { leaves.forEach(function (l2) { if (M(l1) === M(l2)) subs.push({ L: l1, R: l2, objs: l1.concat(l2) }); }); });
      for (var k2 = 0; k2 < 300; k2++) {
        var x = r.pick(subs), y = r.pick(subs);
        if (M(x.objs) !== M(y.objs)) continue;
        var nObj = x.objs.length + y.objs.length;
        if (nObj < 3 || nObj > 7 || (x.objs.concat(y.objs)).indexOf('s') < 0) continue;
        var rows = [vec(x.objs).map(function (v, i) { return v - vec(y.objs)[i]; })];
        [x, y].forEach(function (z) { if (z.L) rows.push(vec(z.L).map(function (v, i) { return v - vec(z.R)[i]; })); });
        rows.push(vec(x.objs.concat(y.objs)));
        if (rank(rows) !== nt) continue;
        top = [x, y]; break;
      }
    }
    if (!top) { types = ['s', 'c']; nt = 2; mass = { s: 2, c: 4 }; top = [{ L: ['s'], R: ['s'], objs: ['s', 's'] }, { leaf: ['c'], objs: ['c'] }]; Z.b25fallback = (Z.b25fallback || 0) + 1; }
    var all = top[0].objs.concat(top[1].objs), Mtot = fct * sum(all.map(function (o) { return mass[o]; })), ans = fct * mass.s;
    function shape(o, x, y) {
      if (o === 's') { var pts = []; for (var i = 0; i < 10; i++) { var rr = i % 2 ? 5 : 12, a = -Math.PI / 2 + i * Math.PI / 5; pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]); } return poly(pts, 'vz1'); }
      if (o === 'c') return '<circle cx="' + x + '" cy="' + y + '" r="10" class="vz0"/>';
      return rect(x - 9, y - 9, 18, 18, 'vz2');
    }
    function leafSvg(objs, x, y) {   // нить и фигуры столбиком
      var out = line(x, y, x, y + 14), yy = y + 14;
      objs.forEach(function (o, i) { out += shape(o, x, yy + 11); yy += 22; if (i < objs.length - 1) { out += line(x, yy, x, yy + 6); yy += 6; } });
      return out;
    }
    function subSvg(node, x, y) {
      if (node.leaf) return leafSvg(node.leaf, x, y);
      return line(x, y, x, y + 20) + line(x - 42, y + 20, x + 42, y + 20) + '<circle cx="' + x + '" cy="' + (y + 20) + '" r="2.5" class="dot"/>' + leafSvg(node.L, x - 42, y + 20) + leafSvg(node.R, x + 42, y + 20);
    }
    var cx = 170, out = line(cx, 2, cx, 18) + line(cx - 115, 18, cx + 115, 18) + '<circle cx="' + cx + '" cy="18" r="3" class="dot"/>' + subSvg(top[0], cx - 115, 18) + subSvg(top[1], cx + 115, 18);
    function side(objs) { var v = vec(objs); return types.map(function (t, i) { return v[i] ? (v[i] > 1 ? v[i] : '') + SYM[t] : ''; }).filter(Boolean).join(' + '); }
    var eqs = [side(top[0].objs) + ' = ' + side(top[1].objs)];
    top.forEach(function (z) { if (z.L && side(z.L) !== side(z.R)) eqs.push(side(z.L) + ' = ' + side(z.R)); });
    var vals = types.map(function (t) { return SYM[t] + ' = ' + fct * mass[t] + ' г'; }).join(', ');
    var legK = types.map(function (t) { return SYM[t] + ' — ' + NAME[t][0]; }).join(', '), legR = types.map(function (t) { return SYM[t] + ' — ' + NAME[t][1]; }).join(', ');
    var others = types.filter(function (t) { return t !== 's'; }).map(function (t) { return fct * mass[t]; });
    return P('Суреттегі ілмек тепе-теңдікте тұр: әр таяқша дәл ортасынан ілінген, жіптер мен таяқшалардың массасы ескерілмейді, бірдей фигуралардың массасы бірдей (' + legK + '). Барлық фигуралардың жалпы массасы ' + Mtot + ' г. Бір жұлдыздың массасы қанша?',
      'Подвеска на рисунке в равновесии: каждая палочка подвешена ровно за середину, нити и палочки невесомы, одинаковые фигуры весят одинаково (' + legR + '). Общая масса всех фигур ' + Mtot + ' г. Сколько весит одна звезда?',
      pic(340, 124, out), ans, posInts(ans, others.concat([Math.round(Mtot / all.length), Math.round(Mtot / Math.max(1, all.filter(function (o) { return o === 's'; }).length)), ans + fct])),
      'Әр таяқшада екі жағы тең: ' + eqs.join('; ') + '. Осыдан және жалпы массадан: ' + vals + '.', 'На каждой палочке стороны равны: ' + eqs.join('; ') + '. Отсюда и из общей массы: ' + vals + '.', { unit: unit('г') });
  } });

  /* ================= Қозғалыс (m_motion) ================= */
  F.m_motion.push({ id: 'b25.walkers_meet', lv: [2, 3], f: function (r, lvl) {   // путь за 3 ч и 4½ ч → встреча
    var hs = [120, 150, 180, 210, 240, 270, 300, 360, 420], t1, t2, meet, D = 0, tau, S0;
    for (;;) {
      t1 = r.pick(hs); t2 = r.pick(hs); if (t1 >= t2) continue;
      meet = t1 * t2 / (t1 + t2); if (meet % 1) continue;
      if (lvl === 3) { D = r.pick([15, 20, 30, 40, 45, 60]); tau = (t1 - D) * t2 / (t1 + t2); if (tau % 1) continue; }
      break;
    }
    function h(t) { return fmt(t / 60); }
    if (lvl === 2) {
      var ans = U.hm(meet), ruMap = {}, ws = uniq(meet, [(t1 + t2) / 2, t2 - t1, meet + 12, meet - 12, (t1 + t2) / 4].filter(function (x) { return x > 0 && x % 1 === 0; }), String, 4);
      ruMap[ans] = U.hmRu(meet); ws.forEach(function (x) { ruMap[U.hm(x)] = U.hmRu(x); });
      return Q('Екі жаяу адам бір жолдың екі ұшынан бір мезгілде бір-біріне қарсы шықты. Біріншісі бүкіл жолды ' + h(t1) + ' сағатта, екіншісі ' + h(t2) + ' сағатта жүріп өтеді. Олар шыққаннан кейін қанша уақыттан соң кездеседі?',
        'Два пешехода одновременно вышли навстречу друг другу из концов одной дороги. Первый проходит всю дорогу за ' + h(t1) + ' ч, второй — за ' + h(t2) + ' ч. Через сколько времени после выхода они встретятся?',
        ans, ws.map(U.hm),
        'Минутпен: ' + t1 + ' және ' + t2 + ' мин. Бір минутта бірге жолдың 1/' + t1 + ' + 1/' + t2 + ' бөлігін жүреді. Кездесу уақыты: ' + t1 + ' · ' + t2 + ' : (' + t1 + ' + ' + t2 + ') = ' + meet + ' мин = ' + ans + '.',
        'В минутах: ' + t1 + ' и ' + t2 + '. За минуту вместе проходят 1/' + t1 + ' + 1/' + t2 + ' пути. Время до встречи: ' + t1 + ' · ' + t2 + ' : (' + t1 + ' + ' + t2 + ') = ' + meet + ' мин = ' + U.hmRu(meet) + '.', { ruMap: ruMap });
    }
    S0 = 5 * r.int(84, 132);
    var ans3 = U.clock(S0 + D + tau);
    return Q('Екі жаяу адам бір жолдың екі ұшынан бір-біріне қарсы шықты. Біріншісі бүкіл жолды ' + h(t1) + ' сағатта, екіншісі ' + h(t2) + ' сағатта жүріп өтеді. Біріншісі сағат ' + U.clock(S0) + ' кезінде, ал екіншісі одан ' + D + ' минут кейін шықты. Олар сағат нешеде кездеседі?',
      'Два пешехода вышли навстречу друг другу из концов одной дороги. Первый проходит всю дорогу за ' + h(t1) + ' ч, второй — за ' + h(t2) + ' ч. Первый вышел в ' + U.clock(S0) + ', а второй — на ' + D + ' минут позже. Во сколько они встретятся?',
      ans3, [U.clock(S0 + meet), U.clock(S0 + D + meet), U.clock(S0 + tau)],
      'Біріншісі ' + D + ' минутта жолдың ' + D + '/' + t1 + ' бөлігін жүрді. Қалғанын бірге: (' + t1 + ' − ' + D + ') · ' + t2 + ' : (' + t1 + ' + ' + t2 + ') = ' + tau + ' мин. ' + U.clock(S0) + ' + ' + D + ' мин + ' + tau + ' мин = ' + ans3 + '.',
      'За ' + D + ' минут первый прошёл ' + D + '/' + t1 + ' пути. Остаток вместе: (' + t1 + ' − ' + D + ') · ' + t2 + ' : (' + t1 + ' + ' + t2 + ') = ' + tau + ' мин. ' + U.clock(S0) + ' + ' + D + ' + ' + tau + ' мин = ' + ans3 + '.');
  } });

  /* ================= Жұмыс (m_work) ================= */
  function niceNum(f) { var d = f.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1 && f.d <= 100 ? f.n / f.d : f; }
  F.m_work.push(
    { id: 'b25.pipes_one', lv: [2, 3], f: function (r, lvl, opt) {   // вместе 3⅓ ч, первая 6 ч → вторая
      var t1, t2n, T;
      for (;;) {
        t1 = r.int(3, 12); t2n = lvl === 2 || opt.int ? 2 * r.int(2, 15) : r.int(5, 30);
        if (t2n === 2 * t1) continue;
        T = FR.div(FR(t1 * t2n, 2), FR.add(FR(t1), FR(t2n, 2)));
        if (T.d === 1 || T.d > 12) continue;
        break;
      }
      var ans = t2n / 2, inv = FR.sub(FR(T.d, T.n), FR(1, t1));
      return Q('Екі құбыр бірге бассейнді ' + U.fracHtml(T, true) + ' сағатта толтырады. Бірінші құбыр жалғыз өзі ' + t1 + ' сағатта толтырады. Екінші құбыр жалғыз өзі бассейнді неше сағатта толтырады?',
        'Две трубы вместе наполняют бассейн за ' + U.fracHtml(T, true) + ' ч. Первая труба одна наполняет его за ' + t1 + ' ч. За сколько часов наполнит бассейн одна вторая труба?', ans,
        [niceNum(FR.sub(FR(t1), T)), niceNum(FR.mul(FR(2), T)), niceNum(FR.add(FR(t1), T)), ans + 1].filter(function (w) { return typeof w !== 'number' || w > 0; }),
        'Бірге сағатына ' + T.d + '/' + T.n + ' бөлік, біріншісі 1/' + t1 + '. Екіншісі: ' + T.d + '/' + T.n + ' − 1/' + t1 + ' = ' + sf(inv) + ' ⇒ ' + fmt(ans) + ' сағ.',
        'Вместе за час ' + T.d + '/' + T.n + ' бассейна, первая 1/' + t1 + '. Вторая: ' + T.d + '/' + T.n + ' − 1/' + t1 + ' = ' + sf(inv) + ' ⇒ ' + fmt(ans) + ' ч.', { unit: unit('сағ', 'ч') });
    } },
    { id: 'b25.work_hm', lv: [2, 3], f: function (r, lvl) {   // вместе 2 ч 40 мин, первый 4 ч → второй
      var t1, t2, T;
      for (;;) {
        t1 = lvl === 2 ? 60 * r.int(2, 8) : 30 * r.int(5, 17); t2 = 60 * r.int(2, 12);
        if (t1 === t2 || (lvl === 3 && t1 % 60 === 0)) continue;
        T = t1 * t2 / (t1 + t2); if (T % 1 || T % 60 === 0) continue;
        break;
      }
      var ans = t2 / 60;
      return Q('Екі шебер бірге жұмысты ' + U.hm(T) + ' уақытта бітіреді. Біріншісі жалғыз өзі ' + (lvl === 2 ? t1 / 60 + ' сағатта' : U.hm(t1) + ' уақытта') + ' бітіреді. Екіншісі жалғыз өзі неше сағатта бітіреді?',
        'Два мастера вместе выполняют работу за ' + U.hmRu(T) + '. Первый один выполняет её за ' + (lvl === 2 ? t1 / 60 + ' ч' : U.hmRu(t1)) + '. За сколько часов выполнит работу один второй мастер?', ans,
        posInts(ans, [t1 / 60 % 1 === 0 ? t1 / 60 : ans + 2, r1((t1 - T) / 60), r1(2 * T / 60), ans + 1]),
        'Минутпен: бірге ' + T + ' мин, біріншісі ' + t1 + ' мин. Екіншісі: ' + T + ' · ' + t1 + ' : (' + t1 + ' − ' + T + ') = ' + t2 + ' мин = ' + ans + ' сағ.',
        'В минутах: вместе ' + T + ', первый ' + t1 + '. Второй: ' + T + ' · ' + t1 + ' : (' + t1 + ' − ' + T + ') = ' + t2 + ' мин = ' + ans + ' ч.', { unit: unit('сағ', 'ч') });
    } }
  );

  /* ================= Қатынас (m_ratio) ================= */
  F.m_ratio.push({ id: 'b25.stairs', lv: [1, 2], f: function (r, lvl) {   // ступенька 15 см, высота 3,6 м
    var h = r.pick([12, 15, 16, 18, 20, 25]);
    if (lvl === 1) {
      var n = r.int(12, 30), Hc = n * h;
      return Q('Баспалдақтың бір сатысының биіктігі ' + h + ' см. Баспалдақ ' + fmt(Hc / 100) + ' м биіктікке көтеріледі. Баспалдақта неше саты бар?',
        'Высота одной ступеньки ' + h + ' см. Лестница поднимается на высоту ' + fmt(Hc / 100) + ' м. Сколько в ней ступенек?', n, [n * 10, n + 1, n - 1, Math.round(Hc / 10)],
        fmt(Hc / 100) + ' м = ' + Hc + ' см. ' + Hc + ' : ' + h + ' = ' + n + '.', fmt(Hc / 100) + ' м = ' + Hc + ' см. ' + Hc + ' : ' + h + ' = ' + n + '.');
    }
    var Hf = r.pick([270, 300, 320, 330, 360, 400].filter(function (x) { return x % h === 0; }).concat([h * 20])), Fl = r.int(3, 9), per = Hf / h, ans = (Fl - 1) * per;
    return Q('Үйдің әр қабатының биіктігі ' + fmt(Hf / 100) + ' м, баспалдақтың бір сатысы ' + h + ' см. 1-қабаттан ' + Fl + '-қабатқа көтерілу үшін неше саты басу керек?',
      'Высота каждого этажа ' + fmt(Hf / 100) + ' м, высота ступеньки ' + h + ' см. Сколько ступенек нужно пройти, чтобы подняться с 1-го на ' + Fl + '-й этаж?', ans,
      [Fl * per, (Fl - 2) * per, ans + Fl - 1, per],
      'Бір қабатқа ' + Hf + ' : ' + h + ' = ' + per + ' саты. 1-ден ' + Fl + '-қабатқа ' + (Fl - 1) + ' қабат көтерілеміз (' + Fl + ' емес!): ' + (Fl - 1) + ' · ' + per + ' = ' + ans + '.',
      'На один этаж ' + Hf + ' : ' + h + ' = ' + per + ' ступенек. С 1-го на ' + Fl + '-й — ' + (Fl - 1) + ' этажей (не ' + Fl + '!): ' + ans + '.');
  } });

  /* ================= Модуль (m_abs) ================= */
  F.m_abs.push({ id: 'b25.abs_ineq', lv: [2, 3], f: function (r, lvl) {   // |x + a| ≥ b → промежутки
    var k = lvl === 2 ? 1 : r.pick([2, 3]), c0; do { c0 = r.int(-8, 8); } while (!c0);
    var w = r.int(2, 9), a = -k * c0, b = k * w, rel = r.pick(['≥', '>', '≤', '<']), x1 = c0 - w, x2 = c0 + w;
    function out(l, h, st) { return '(−∞; ' + num(l) + (st ? ')' : ']') + ' ∪ ' + (st ? '(' : '[') + num(h) + '; +∞)'; }
    function inn(l, h, st) { return (st ? '(' : '[') + num(l) + '; ' + num(h) + (st ? ')' : ']'); }
    var strict = rel === '>' || rel === '<', isOut = rel === '≥' || rel === '>';
    var f = isOut ? out : inn, g = isOut ? inn : out, ans = f(x1, x2, strict);
    var e = expr('|' + (k === 1 ? '' : k) + 'x' + sgnT(a) + '| ' + rel + ' ' + b);
    var tk = (k === 1 ? '' : k) + 'x' + sgnT(a);
    return Q('Теңсіздікті шешіңіз:' + e, 'Решите неравенство:' + e, ans,
      uniq(ans, [g(x1, x2, strict), f(x1, x2, !strict), f(-c0 - w, -c0 + w, strict), isOut ? (strict ? '(' : '[') + num(x2) + '; +∞)' : out(x1, x2, !strict)], String, 4),
      isOut ? tk + ' ' + (strict ? '<' : '≤') + ' ' + num(-b) + ' немесе ' + tk + ' ' + (strict ? '>' : '≥') + ' ' + b + ' ⇒ x ' + (strict ? '<' : '≤') + ' ' + num(x1) + ' немесе x ' + (strict ? '>' : '≥') + ' ' + num(x2) + '. Жауабы: ' + ans + '.'
        : num(-b) + ' ' + rel + ' ' + tk + ' ' + rel + ' ' + b + ' ⇒ ' + num(x1) + ' ' + rel + ' x ' + rel + ' ' + num(x2) + '. Жауабы: ' + ans + '.',
      isOut ? tk + ' ' + (strict ? '<' : '≤') + ' ' + num(-b) + ' или ' + tk + ' ' + (strict ? '>' : '≥') + ' ' + b + ' ⇒ x ' + (strict ? '<' : '≤') + ' ' + num(x1) + ' или x ' + (strict ? '>' : '≥') + ' ' + num(x2) + '. Ответ: ' + ans + '.'
        : num(-b) + ' ' + rel + ' ' + tk + ' ' + rel + ' ' + b + ' ⇒ ' + num(x1) + ' ' + rel + ' x ' + rel + ' ' + num(x2) + '. Ответ: ' + ans + '.');
  } });

  /* ================= ЕҮОБ / ЕКОЕ (m_gcdlcm) ================= */
  var MON_KK = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];
  var MON_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function addD(m, d, k, ml) { d += k; for (;;) { var len = ml || MDAYS[m]; if (d <= len) break; d -= len; m = (m + 1) % 12; } return [m, d]; }
  F.m_gcdlcm.push(
    { id: 'b25.gcd_lcm_interval', lv: [2, 3], f: function (r, lvl) {   // какой промежуток содержит и НОД, и НОК
      var g, x, y, u, v, l;
      for (;;) {
        g = r.int(4, lvl === 2 ? 12 : 18); var p = r.int(2, 7), q = r.int(2, 7);
        if (p === q || gcd(p, q) !== 1) continue;
        x = g * p; y = g * q; u = r.int(4, 20); v = r.int(4, 20);
        if (u === v || u % v === 0 || v % u === 0) continue;
        l = lcm(u, v); if (l < g + 12 || l > 150) continue;
        break;
      }
      function iv(a, b) { return '[' + a + '; ' + b + ']'; }
      function has(a, b, z) { return a <= z && z <= b; }
      var A = Math.max(1, g - r.int(0, 4)), B = l + r.int(0, 8), ans = iv(A, B), cands = [];
      cands.push([Math.max(1, g - r.int(0, 6)), l - r.int(1, Math.min(8, l - g - 1))]);
      cands.push([g + r.int(1, Math.min(6, l - g - 1)), l + r.int(0, 12)]);
      cands.push([g + 1, l - 1]);
      cands.push([l + r.int(1, 6), l + r.int(8, 30)]);
      cands.push([Math.max(1, g - 10), g - 1 > 0 ? g - 1 : 1]);
      var wrong = uniq(ans, cands.filter(function (c) { return c[0] <= c[1] && !(has(c[0], c[1], g) && has(c[0], c[1], l)); }).map(function (c) { return iv(c[0], c[1]); }), String, 4);
      return Q('ЕҮОБ(' + x + '; ' + y + ') және ЕКОЕ(' + u + '; ' + v + ') сандарының екеуі де қай аралықта жатыр?', 'В каком промежутке лежат оба числа НОД(' + x + '; ' + y + ') и НОК(' + u + '; ' + v + ')?', ans, wrong,
        'ЕҮОБ(' + x + '; ' + y + ') = ' + g + ', ЕКОЕ(' + u + '; ' + v + ') = ' + l + '. Екеуі де ' + ans + ' аралығында; қалғандарында біреуі ғана немесе ешқайсысы жоқ.',
        'НОД(' + x + '; ' + y + ') = ' + g + ', НОК(' + u + '; ' + v + ') = ' + l + '. Оба лежат в ' + ans + '; в остальных — только одно или ни одного.');
    } },
    { id: 'b25.pool_dates', lv: [2, 3], f: function (r, lvl) {   // бассейн раз в 4 и 6 дней, встретились 21 апреля
      var ps, L, prod;
      for (;;) {
        ps = r.shuffle(lvl === 2 ? [3, 4, 5, 6, 8, 9, 10, 12] : [2, 3, 4, 5, 6, 8, 10]).slice(0, lvl === 2 ? 2 : 3);
        L = ps.reduce(lcm); prod = ps.reduce(function (a, b) { return a * b; });
        if (L > 60 || L < 8 || L === Math.max.apply(null, ps) || (lvl === 2 && L === prod && r.chance(0.7))) continue;
        break;
      }
      var m = r.int(0, 10), d = r.int(Math.max(1, MDAYS[m] - L + 1), MDAYS[m]);
      function dk(md) { return md[1] + ' ' + MON_KK[md[0]]; }
      function dr(md) { return md[1] + ' ' + MON_RU[md[0]]; }
      var ansD = addD(m, d, L), ans = dk(ansD), ruMap = {};
      var cands = [addD(m, d, L - 1), addD(m, d, L + 1), addD(m, d, L, 30), addD(m, d, L, 31), prod !== L ? addD(m, d, prod) : addD(m, d, L + 2)];
      if (lvl === 3) cands.unshift(addD(m, d, lcm(ps[0], ps[1])));
      var ws = uniq(ansD, cands, dk, 4);
      ruMap[ans] = dr(ansD); ws.forEach(function (w) { ruMap[dk(w)] = dr(w); });
      var NK = ['Айгүл', 'Дана', 'Нұрлан'], NR = ['Айгуль', 'Дана', 'Нурлан'];
      var who = ps.map(function (p, i) { return NK[i] + ' — ' + p + ' күнде бір рет'; }).join(', '), whoR = ps.map(function (p, i) { return NR[i] + ' — раз в ' + p + ' ' + (p < 5 ? 'дня' : 'дней'); }).join(', ');
      return Q('Бассейнге ' + who + ' барады. Олардың ' + (lvl === 2 ? 'екеуі' : 'үшеуі') + ' бассейнде ' + d + ' ' + MON_KK[m] + ' күні кездесті. Олар келесі рет қай күні бәрі бірге кездеседі?',
        'В бассейн ходят: ' + whoR + '. ' + (lvl === 2 ? 'Оба' : 'Все трое') + ' встретились в бассейне ' + d + ' ' + MON_RU[m] + '. Когда они в следующий раз встретятся все вместе?',
        ans, ws.map(dk),
        'Келесі кездесу ЕКОЕ(' + ps.join('; ') + ') = ' + L + ' күннен кейін. ' + MON_KK[m] + ' айында ' + MDAYS[m] + ' күн: ' + d + ' + ' + L + ' = ' + (d + L) + ' ⇒ ' + ans + '.',
        'Следующая встреча через НОК(' + ps.join('; ') + ') = ' + L + ' дней. В этом месяце ' + MDAYS[m] + ' дней: ' + d + ' + ' + L + ' = ' + (d + L) + ' ⇒ ' + dr(ansD) + '.', { ruMap: ruMap });
    } }
  );

  /* ================= Статистика (m_avg) ================= */
  F.m_avg.push(
    { id: 'b25.mode_mean', lv: [2, 3], f: function (r, lvl) {   // возраст гостей: диапазон + мода → среднее
      for (;;) {
        var L = r.int(9, 13), m = lvl === 2 ? r.int(3, 4) : r.int(4, 6), Hh = L + m - 1, M = r.int(L, Hh), n = m + r.int(lvl === 2 ? 1 : 2, lvl === 2 ? 3 : 5), c = n - m + 1;
        var base = 0; for (var a = L; a <= Hh; a++) base += a;
        var s = base + (c - 1) * M;
        if ((s * 10) % n !== 0) continue;
        var mean = s / n;
        if (mean === M) continue;
        return Q('Туған күнге ' + n + ' қонақ келді. Олардың жасы — ' + L + '-ден ' + Hh + '-ге дейінгі бүтін сандар, осы аралықтың әр жасында кемінде бір қонақ бар. Жастардың модасы — ' + M + ', ал басқа жастардың әрқайсысы бір-ақ рет кездеседі. Қонақтардың орташа жасы қанша?',
          'На день рождения пришли ' + n + ' гостей. Их возрасты — целые числа от ' + L + ' до ' + Hh + ', и каждый возраст из этого промежутка встречается хотя бы раз. Мода возрастов — ' + M + ', а каждый другой возраст встречается ровно один раз. Найдите средний возраст гостей.',
          mean, [(L + Hh) / 2, M, r1(s / (n - 1)), r1((base + c * M) / n)],
          'Әр жастан бір қонақ: ' + L + ', …, ' + Hh + ' — ' + m + ' адам. Қалған ' + (n - m) + ' қонақ — ' + M + ' жаста (басқа жас қайталанбайды), сонда ' + M + ' жасы ' + c + ' рет. Қосынды: ' + base + ' + ' + (c - 1) + ' · ' + M + ' = ' + s + '. Орташа: ' + s + ' : ' + n + ' = ' + fmt(mean) + '.',
          'По одному гостю каждого возраста: ' + m + ' человек. Остальные ' + (n - m) + ' — возраста ' + M + ', всего ' + M + ' встречается ' + c + ' раз. Сумма: ' + base + ' + ' + (c - 1) + ' · ' + M + ' = ' + s + '. Среднее: ' + s + ' : ' + n + ' = ' + fmt(mean) + '.');
      }
    } },
    { id: 'b25.stats_table', lv: [2, 3], f: function (r, lvl) {   // оценки → среднее / мода / медиана, варианты-таблицы
      for (;;) {
        var n = lvl === 2 ? r.pick([7, 9]) : r.pick([8, 10]), g = [], i;
        for (i = 0; i < n; i++) g.push(r.int(5, 10));
        var cnt = {}; g.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
        var mx = Math.max.apply(null, Object.keys(cnt).map(function (k) { return cnt[k]; }));
        var modes = Object.keys(cnt).filter(function (k) { return cnt[k] === mx; });
        if (mx < 2 || modes.length !== 1) continue;
        var s = sum(g); if ((s * 10) % n) continue;
        var srt = g.slice().sort(function (a, b) { return a - b; }), mean = s / n, mode = +modes[0];
        var med = n % 2 ? srt[(n - 1) / 2] : (srt[n / 2 - 1] + srt[n / 2]) / 2, rawMed = n % 2 ? g[(n - 1) / 2] : (g[n / 2 - 1] + g[n / 2]) / 2;
        if (mean === mode || mean === med || mode === med) continue;
        function tb(t) { return H.table(['i', 'ii', 'iii'], [t.map(function (z) { return fmt(z); })]); }
        var ans = tb([mean, mode, med]);
        var cands = [[mean, med, mode], [med, mode, mean], [mean, mode, rawMed], [r1(s / (n - 1)), mode, med], [mean, Math.max.apply(null, g), med]];
        var wrong = uniq(ans, cands.map(tb), String, 4);
        if (wrong.length < 3) continue;
        var data;
        if (lvl === 2) data = expr(g.join('; '));
        else {
          var ks = Object.keys(cnt).map(Number).sort(function (a, b) { return a - b; });
          data = '<div class="figs">' + H.table(['Баға / Оценка'].concat(ks.map(String)), [['Саны / Кол-во'].concat(ks.map(function (k) { return String(cnt[k]); }))]) + '</div>';
        }
        return Q('Оқушының бағалары берілген. i — арифметикалық орта, ii — мода, iii — медиана. Қай кесте дұрыс толтырылған?' + data,
          'Даны оценки ученика. i — среднее арифметическое, ii — мода, iii — медиана. Какая таблица заполнена верно?' + data, ans, wrong,
          'Реттейміз: ' + srt.join(', ') + '. Орта: ' + s + ' : ' + n + ' = ' + fmt(mean) + '; мода (ең жиі) — ' + mode + '; медиана (ортадағы' + (n % 2 ? '' : ' екеуінің ортасы') + ') — ' + fmt(med) + '.',
          'Упорядочим: ' + srt.join(', ') + '. Среднее: ' + s + ' : ' + n + ' = ' + fmt(mean) + '; мода — ' + mode + '; медиана — ' + fmt(med) + '.');
      }
    } },
    { id: 'b25.weather_mean', lv: [2, 3], f: function (r, lvl) {   // почасовая температура с минусами → среднее
      for (;;) {
        var n = lvl === 2 ? r.int(5, 6) : r.int(7, 8), st = lvl === 2 ? 1 : 2, h0 = r.int(0, 23), t = [], i;
        for (i = 0; i < n - 1; i++) t.push(r.int(-9, 6));
        var s0 = sum(t), last = null;
        for (var v = -9; v <= 6; v++) if ((s0 + v) % n === 0 && (last === null || r.chance(0.5))) last = v;
        if (last === null) continue;
        t.push(last);
        var neg = t.filter(function (x) { return x < 0; }).length;
        if (neg < 2 || neg === n) continue;
        var s = sum(t), ans = s / n, ab = sum(t.map(Math.abs));
        var w = 50, out = '';
        for (i = 0; i < n; i++) out += rect(4 + i * w, 4, w, 62, 'vz0') + txt(4 + i * w + w / 2, 22, U.pad2((h0 + i * st) % 24) + ':00', 'ax') + txt(4 + i * w + w / 2, 52, num(t[i]) + '°', 'big');
        return P('Суретте бір күндегі ауа температурасы (°C) берілген. Осы өлшемдердің орташа температурасын табыңыз.', 'На рисунке показана температура воздуха (°C) в течение дня. Найдите среднюю температуру по этим измерениям.',
          pic(8 + n * w, 70, out), ans, [r1(s / (n - 1)), r1(ab / n), -ans || 1, (Math.max.apply(null, t) + Math.min.apply(null, t)) / 2],
          'Қосынды: ' + t.map(par).join(' + ') + ' = ' + num(s) + '. Өлшем саны — ' + n + '. Орташа: ' + num(s) + ' : ' + n + ' = ' + num(ans) + '°C.',
          'Сумма: ' + t.map(par).join(' + ') + ' = ' + num(s) + '. Измерений ' + n + '. Среднее: ' + num(s) + ' : ' + n + ' = ' + num(ans) + '°C.', { unit: unit('°C') });
      }
    } }
  );

  /* ================= Визуал логика (l_visual) ================= */
  // 3D-повороты (24) для проверки, что деталь не совпадает с другой поворотом
  var ROTS = (function () {
    var out = [], perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    perms.forEach(function (pm) {
      [1, -1].forEach(function (sx) { [1, -1].forEach(function (sy) { [1, -1].forEach(function (sz) {
        var Mx = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], sg = [sx, sy, sz];
        for (var i = 0; i < 3; i++) Mx[i][pm[i]] = sg[i];
        var det = Mx[0][0] * (Mx[1][1] * Mx[2][2] - Mx[1][2] * Mx[2][1]) - Mx[0][1] * (Mx[1][0] * Mx[2][2] - Mx[1][2] * Mx[2][0]) + Mx[0][2] * (Mx[1][0] * Mx[2][1] - Mx[1][1] * Mx[2][0]);
        if (det === 1) out.push(Mx);
      }); }); });
    });
    return out;
  })();
  function normCells(cells) {
    var mn = [0, 1, 2].map(function (i) { return Math.min.apply(null, cells.map(function (c) { return c[i]; })); });
    return cells.map(function (c) { return [c[0] - mn[0], c[1] - mn[1], c[2] - mn[2]]; });
  }
  function cellKey(cells) { return normCells(cells).map(function (c) { return c.join(','); }).sort().join('|'); }
  function congruent(A, B) {
    if (A.length !== B.length) return false;
    var kb = cellKey(B);
    return ROTS.some(function (M) { return cellKey(A.map(function (c) { return [0, 1, 2].map(function (i) { return M[i][0] * c[0] + M[i][1] * c[1] + M[i][2] * c[2]; }); })) === kb; });
  }
  F.l_visual.push(
    { id: 'b25.cube_color', lv: [2, 3], f: function (r, lvl) {   // 2×2×2, соседние кубики разных букв, буква спрятанного
      var LT = ['A', 'B', 'C', 'D'], HID = 2, NB = [3, 0, 6];   // вершина v = x + 2y + 4z; спрятан (0, 1, 0)
      function need(col) {
        var nb = NB.map(function (v) { return col[v]; }), dn = nb.filter(function (x, i) { return nb.indexOf(x) === i; }).length;
        if (lvl === 2) return dn === 3;
        return dn === 2 && LT.every(function (L) { return col.filter(function (x) { return x === L; }).length === 2; });
      }
      var col = null;
      for (var t = 0; t < 2000 && !col; t++) {
        var c = [], ok = true;
        for (var v = 0; v < 8 && ok; v++) {
          var opts = r.shuffle(LT).filter(function (L) { return [1, 2, 4].every(function (b) { var u = v ^ b; return u > v || c[u] !== L; }); });
          if (!opts.length) ok = false; else c[v] = opts[0];
        }
        if (ok && need(c)) col = c;
      }
      if (!col) { var pm = r.shuffle(LT); col = lvl === 2 ? [pm[0], pm[1], pm[3], pm[2], pm[2], pm[0], pm[1], pm[3]] : [pm[0], pm[3], pm[2], pm[0], pm[3], pm[1], pm[1], pm[2]]; }
      var s = 46, k = 23, ox = 8, oy = 8 + 2 * s + 2 * k, out = '';
      [1, 0].forEach(function (y) { [0, 1].forEach(function (z) { [0, 1].forEach(function (x) {
        var X = ox + x * s + y * k, Y = oy - z * s - y * k, L = col[x + 2 * y + 4 * z];
        out += cubeAt(X, Y, s, k);
        if (y === 0) out += txt(X + s / 2, Y - s / 2 + 7, L, 'big');
        if (z === 1) out += txt(X + s / 2 + k / 2, Y - s - k / 2 + 6, L);
        if (x === 1) out += txt(X + s + k / 2, Y - s / 2 - k / 2 + 5, L);
      }); }); });
      var ans = col[HID], nbL = NB.map(function (v) { return col[v]; });
      var cnt = LT.map(function (L) { return L + ' — ' + col.filter(function (x, i) { return x === L && i !== HID; }).length; }).join(', ');
      return P('2 × 2 × 2 үлкен куб 8 кішкентай кубтан құралған. Әр кішкентай кубтың барлық жағына бір әріп жазылған (A, B, C немесе D). Жақтасып тұрған кез келген екі кубтың әріптері әртүрлі.' + (lvl === 3 ? ' Әр әріп дәл екі кубта жазылған.' : '') + ' Суретте көрінбейтін (артқы, төменгі, сол жақтағы) кубта қай әріп?',
        'Большой куб 2 × 2 × 2 сложен из 8 кубиков. На всех гранях каждого кубика написана одна буква (A, B, C или D). У любых двух кубиков, соприкасающихся гранями, буквы разные.' + (lvl === 3 ? ' Каждая буква написана ровно на двух кубиках.' : '') + ' Какая буква на невидимом кубике (заднем нижнем левом)?',
        pic(16 + 2 * s + 2 * k, oy + 8, out), ans, LT.filter(function (L) { return L !== ans; }),
        lvl === 2 ? 'Көрінбейтін кубтың үш көршісі бар: алдыңғы-төменгі-сол, артқы-төменгі-оң, артқы-жоғарғы-сол. Олардың әріптері: ' + nbL.join(', ') + '. Көрінбейтін куб бұлардан өзгеше, сондықтан ' + ans + '.'
          : 'Көрінетін 7 кубтағы әріптерді санаймыз: ' + cnt + '. Бір рет қана кездесетін әріп — ' + ans + ' (көршілері ' + nbL.join(', ') + ' — қайшылық жоқ).',
        lvl === 2 ? 'У невидимого кубика три соседа: передний нижний левый, задний нижний правый, задний верхний левый. Их буквы: ' + nbL.join(', ') + '. Невидимый отличается от них всех: ' + ans + '.'
          : 'Считаем буквы на 7 видимых кубиках: ' + cnt + '. Один раз встречается только ' + ans + ' (соседи ' + nbL.join(', ') + ' — противоречия нет).');
    } },
    { id: 'b25.solid_complete', lv: [2, 3], f: function (r, lvl) {   // какая деталь дополняет параллелепипед
      var W = lvl === 2 ? 3 : 4, Hh = lvl === 2 ? 2 : 3, size = lvl === 2 ? 3 : 4, piece, wrong = [], front, b, tries;
      var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      function has(list, c) { return list.some(function (x) { return x[0] === c[0] && x[1] === c[1]; }); }
      for (tries = 0; tries < 500; tries++) {
        front = [[r.int(0, W - 1), r.int(0, Hh - 1)]];
        while (front.length < size) {
          var c = r.pick(front), d = r.pick(DIRS), nc = [c[0] + d[0], c[1] + d[1]];
          if (nc[0] >= 0 && nc[0] < W && nc[1] >= 0 && nc[1] < Hh && !has(front, nc)) front.push(nc);
        }
        var tops = front.filter(function (cc) { return !has(front, [cc[0], cc[1] + 1]); });
        b = r.pick(tops);
        piece = front.map(function (cc) { return [cc[0], 0, cc[1]]; }).concat([[b[0], 1, b[1]]]);
        var mir = piece.map(function (cc) { return [-cc[0], cc[1], cc[2]]; });
        if (congruent(mir, piece)) continue;
        var cands = [mir];
        r.shuffle(front).forEach(function (cc) { if (cc !== b) cands.push(front.map(function (q) { return [q[0], 0, q[1]]; }).concat([[cc[0], 1, cc[1]]])); });
        cands.push(front.map(function (q) { return [q[0], 0, q[1]]; }).concat(front.map(function (q) { return [q[0], 1, q[1]]; })));
        cands.push(front.map(function (q) { return [q[0], 0, q[1]]; }));
        wrong = [];
        cands.forEach(function (w) {
          if (wrong.length >= 3 || congruent(w, piece)) return;
          if (wrong.some(function (w2) { return congruent(w, w2); })) return;
          wrong.push(w);
        });
        if (wrong.length === 3) break;
      }
      var box = [];
      for (var x = 0; x < W; x++) for (var y = 0; y < 2; y++) for (var z = 0; z < Hh; z++) if (!piece.some(function (p) { return p[0] === x && p[1] === y && p[2] === z; })) box.push([x, y, z]);
      var bd = drawCubes(box, 30, 15, 6, [W - 1, 1, Hh - 1]);
      // пунктир — контур целого блока: виден только там, где кубиков нет
      var X0 = 6, Yb = bd.h - 6 - 0, XW = X0 + W * 30, YT = Yb - Hh * 30, K = 2 * 15;
      var edges = [[X0, Yb, XW, Yb], [X0, YT, XW, YT], [X0, Yb, X0, YT], [XW, Yb, XW, YT], [X0, YT, X0 + K, YT - K], [XW, YT, XW + K, YT - K], [XW, Yb, XW + K, Yb - K], [X0 + K, YT - K, XW + K, YT - K], [XW + K, YT - K, XW + K, Yb - K]];
      var qsvg = svgEl(bd.w, bd.h, bd.svg + edges.map(function (e) { return line(e[0], e[1], e[2], e[3], 'dim'); }).join(''));
      function opt(cells) { var dd = drawCubes(normCells(cells), 20, 10); return osv(dd.w, dd.h, dd.svg); }
      return P('Тікбұрышты параллелепипедтен (' + W + ' × 2 × ' + Hh + ' кубтан) бір бөлік алынып тасталды (суретте). Қай бөлікті орнына қойса, параллелепипед қайта толық болады? (Бөлікті бұруға болады.)',
        'Из прямоугольного параллелепипеда (' + W + ' × 2 × ' + Hh + ' кубиков) вынули одну деталь (см. рисунок). Какую деталь нужно вставить, чтобы параллелепипед снова стал целым? (Деталь можно поворачивать.)',
        figs([qsvg]), opt(piece), wrong.map(opt),
        'Алдыңғы қабатта ' + size + ' куб жетпейді, ал артқы қабатта — 1 куб (сол жерде тесік арқылы фон көрінеді). Бөлік ' + (size + 1) + ' кубтан тұрады. Айналы бейнедегі бөлікті бұрып орнына келтіру мүмкін емес.',
        'В переднем слое не хватает ' + size + ' кубиков, в заднем — 1 (там видна сквозная дыра). Деталь из ' + (size + 1) + ' кубиков. Зеркальную деталь поворотом в эту форму не превратить.');
    } },
    { id: 'b25.card_flip', lv: [2, 3], f: function (r, lvl) {   // прозрачная карточка: перевернули вниз, повернули вправо
      var n = 3, g;
      function key(a) { return a.join(''); }
      function V(a) { var o = []; for (var i = 0; i < 9; i++) { var rr = Math.floor(i / 3), cc = i % 3; o[i] = a[(n - 1 - rr) * 3 + cc]; } return o; }
      function Hf(a) { var o = []; for (var i = 0; i < 9; i++) { var rr = Math.floor(i / 3), cc = i % 3; o[i] = a[rr * 3 + (n - 1 - cc)]; } return o; }
      function CW(a) { var o = []; for (var i = 0; i < 9; i++) { var rr = Math.floor(i / 3), cc = i % 3; o[i] = a[(n - 1 - cc) * 3 + rr]; } return o; }
      function CCW(a) { return CW(CW(CW(a))); }
      for (;;) {
        g = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        var cells = r.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 4);
        g[cells[0]] = 1; g[cells[1]] = 1; g[cells[2]] = 2; g[cells[3]] = 2;
        var imgs = [g, CW(g), CW(CW(g)), CCW(g), V(g), Hf(g), CW(V(g)), CCW(V(g))].map(key);
        if (imgs.every(function (x, i) { return imgs.indexOf(x) === i; })) break;
      }
      function card(a, big) {
        var u = big ? 24 : 16, out = rect(2, 2, 3 * u + 8, 3 * u + 8, 'bg', ' rx="5"');
        a.forEach(function (v, i) { var x = 6 + (i % 3) * u, y = 6 + Math.floor(i / 3) * u; out += rect(x, y, u, u, 'vcell') + (v ? rect(x + 2, y + 2, u - 4, u - 4, v === 1 ? 'vz1' : 'vz2') : ''); });
        return big ? svgEl(3 * u + 12, 3 * u + 12, out) : osv(3 * u + 12, 3 * u + 12, out);
      }
      var ans = lvl === 2 ? V(g) : CW(V(g));
      var cands = lvl === 2 ? [Hf(g), CW(CW(g)), CW(g), CCW(g)] : [CW(g), CCW(V(g)), V(g), CW(CW(g)), Hf(g)];
      var wrong = uniq(ans, cands, key, 4);
      var opK = lvl === 2 ? 'Карточканы төмен қарай аударды (жоғарғы жиегі төменге түсті).' : 'Карточканы алдымен төмен қарай аударды (жоғарғы жиегі төменге түсті), содан кейін оңға қарай (сағат тілімен) 90°-қа бұрды.';
      var opR = lvl === 2 ? 'Карточку перевернули вниз (верхний край стал нижним).' : 'Карточку сначала перевернули вниз (верхний край стал нижним), затем повернули вправо (по часовой стрелке) на 90°.';
      return P('Мөлдір карточкадағы сурет берілген. ' + opK + ' Карточка енді қалай көрінеді?', 'Дан рисунок на прозрачной карточке. ' + opR + ' Как теперь выглядит карточка?', figs([card(g, true)]),
        card(ans, false), wrong.map(function (w) { return card(w, false); }),
        'Төмен аудару — жоғарғы жол төменге түседі, сол мен оң өзгермейді (бұл — бұру емес, айналы бейне).' + (lvl === 3 ? ' Сағат тілімен 90° бұрғанда жоғарғы жол оң жақ бағанға, сол жақ баған жоғарғы жолға айналады.' : ''),
        'Переворот вниз: верхняя строка становится нижней, лево и право не меняются (это отражение, а не поворот).' + (lvl === 3 ? ' При повороте на 90° по часовой стрелке верхняя строка становится правым столбцом, левый столбец — верхней строкой.' : ''));
    } }
  );
})(typeof window !== 'undefined' ? window : globalThis);
