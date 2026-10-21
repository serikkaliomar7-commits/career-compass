/* Зерде — задачи по образцу официального экзамена БИЛ 2023 (вариант 2001, см. bil2023/blueprint.json):
 * типы, которых раньше не было, каждый — на ступень сложнее оригинала, в том же стиле.
 * У каждого формата есть id ('bil.*'): пробные тесты могут запросить конкретный формат по id
 * (Z.findFormat(id) → { topic, format }).
 *
 * Рисунки — SVG кодом, подписи только числами и латинскими буквами, поэтому один рисунок
 * подходит и для казахского, и для русского текста (в конце текста, внутри <div class="figs">).
 * Текстовые варианты ответа переводятся через ruMap (kk → ru). */
(function (root) {
  'use strict';
  var Z = root.Z;
  var U = Z.util, fmt = U.fmt, frac = U.frac;
  var H = Z.genHelpers, Q = H.Q, expr = H.expr, unit = H.unit;
  var F = Z.formats;

  function add(topic, id, lv, f) { (F[topic] = F[topic] || []).push({ id: id, lv: lv, f: f }); }
  function fx(n, d) { return '<span class="frac"><span>' + n + '</span><span>' + d + '</span></span>'; }
  function gcd(a, b) { return U.gcd(a, b); }
  function r1(x) { return Math.round(x * 10) / 10; }
  function rad(d) { return d * Math.PI / 180; }
  function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  function svgEl(w, h, inner, cls) { return '<svg class="svgfig' + (cls ? ' ' + cls : '') + '" viewBox="0 0 ' + r1(w) + ' ' + r1(h) + '" width="' + r1(w) + '" height="' + r1(h) + '" role="img" aria-label="сурет">' + inner + '</svg>'; }
  function figs(list) { return '<div class="figs">' + list.join('') + '</div>'; }
  function pic(w, h, inner) { return figs([svgEl(w, h, inner)]); }
  function osv(w, h, inner) { return svgEl(w, h, inner, 'osv'); }
  function txt(x, y, s, anchor, cls) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (anchor || 'middle') + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + s + '</text>'; }
  function line(x1, y1, x2, y2, cls, style) { return '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '"' + (cls ? ' class="' + cls + '"' : '') + (style ? ' style="' + style + '"' : '') + '/>'; }
  function rect(x, y, w, h, cls, style) { return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '" class="' + cls + '"' + (style ? ' style="' + style + '"' : '') + '/>'; }
  function poly(pts, cls, style) { return '<polygon points="' + pts.map(function (p) { return r1(p[0]) + ',' + r1(p[1]); }).join(' ') + '" class="' + cls + '"' + (style ? ' style="' + style + '"' : '') + '/>'; }
  function path(d, style) { return '<path d="' + d + '" style="' + (style || 'fill:none;stroke:currentColor;stroke-width:1.3') + '"/>'; }
  function P(kk, ru, picture, ans, wrong, sk, sr, extra) { return Q(kk + picture, ru + picture, ans, wrong, sk, sr, extra); }
  // Неверные варианты без повторов и без верного (по ключу k), не больше n.
  function uniq(ans, cands, k, n) {
    var seen = {}, out = [];
    seen[k(ans)] = 1;
    cands.forEach(function (c) { if (c !== null && c !== undefined && !seen[k(c)] && out.length < n) { seen[k(c)] = 1; out.push(c); } });
    return out;
  }
  function ints(list, ans) { return list.filter(function (x) { return typeof x === 'number' && isFinite(x) && x % 1 === 0 && x !== ans; }); }
  function signed(v) { return v < 0 ? '−' + (-v) : String(v); }
  // Русское согласование с числом: pl(5, 'кубик', 'кубика', 'кубиков') → 'кубиков'
  function pl(n, one, few, many) { n = Math.abs(n) % 100; var d = n % 10; return n > 10 && n < 20 ? many : d === 1 ? one : d >= 2 && d <= 4 ? few : many; }
  // Казахский дательный падеж после числа: 16 → «16-ға», 3 → «3-ке»
  function dat(n) {
    var a = Math.abs(n), u = a % 10, t = Math.floor(a / 10) % 10, w;
    if (u) w = ['', 'ге', 'ге', 'ке', 'ке', 'ке', 'ға', 'ге', 'ге', 'ға'][u];
    else if (t) w = ['', 'ға', 'ға', 'ға', 'қа', 'ге', 'қа', 'ке', 'ге', 'ға'][t];
    else w = a % 1000 === 0 && a ? 'ға' : 'ге';
    return fmt(n) + '-' + w;
  }
  function npl(n, one, few, many) { return fmt(n) + ' ' + pl(n, one, few, many); }
  // Линейное выражение k·x + c без «+ (−11)» и «1x»
  function linStr(k, c, x) { var kx = k === 1 ? x : k === -1 ? '−' + x : signed(k) + x; return c === 0 ? kx : kx + (c < 0 ? ' − ' + (-c) : ' + ' + c); }
  function linSub(k, c, vs) { var t = k === 1 ? vs : k === -1 ? '−' + vs : signed(k) + ' · ' + vs; return c === 0 ? t : t + (c < 0 ? ' − ' + (-c) : ' + ' + c); }

  /* ================= 1. Вероятность буквы (l_count) ================= */
  // Слова пишутся одинаково по-казахски и по-русски. Для вопроса о гласных — только слова,
  // где гласные А, Е, О, Ы, Э (без И, У, Я, Ю: их статус в казахском спорный).
  var LET_W = ['МАТЕМАТИКА', 'ГРАММАТИКА', 'АРИФМЕТИКА', 'ИНФОРМАТИКА', 'ПАРАЛЛЕЛЕПИПЕД', 'КООРДИНАТА', 'КИЛОГРАММ', 'МИЛЛИМЕТР', 'ЭНЦИКЛОПЕДИЯ'];
  var VOW_W = ['ПАРАЛЛЕЛОГРАММ', 'ПРОГРАММА', 'БАРАБАН', 'АНАНАС', 'АСТАНА', 'АЛМАТЫ', 'ТЕЛЕФОН', 'БАСКЕТБОЛ', 'ВОЛЕЙБОЛ', 'ПАРАГРАФ', 'ОРКЕСТР',
    'ФОТОГРАФ', 'ТРАКТОР', 'ГЕКТАР', 'ОРНАМЕНТ', 'АСТРОНОМ', 'МЕТЕОР', 'ТЕОРЕМА', 'КАРАНДАШ', 'ТЕАТР', 'ЛАБОРАНТ'];
  var VOWELS = 'АЕОЫЭ';
  add('l_count', 'bil.prob_letter', [2, 3], function (r, lvl) {
    for (;;) {
      var mode = lvl === 2 ? r.pick(['one', 'one', 'vowel']) : r.pick(['two', 'not', 'vowel']);
      var w = r.pick(mode === 'vowel' ? VOW_W : LET_W.concat(VOW_W)), L = w.split(''), n = L.length, cnt = {};
      L.forEach(function (c) { cnt[c] = (cnt[c] || 0) + 1; });
      var keys = Object.keys(cnt), distinct = keys.length, multi = keys.filter(function (c) { return cnt[c] >= 2; });
      if (!multi.length) continue;
      var c1 = r.pick(multi), c2 = r.pick(keys.filter(function (c) { return c !== c1; })), k, askK, askR, favK, favR;
      if (mode === 'one') { k = cnt[c1]; askK = '«' + c1 + '» әрпі болу'; askR = 'на ней буква «' + c1 + '»'; favK = favR = '«' + c1 + '» — ' + k; }
      else if (mode === 'two') { k = cnt[c1] + cnt[c2]; askK = '«' + c1 + '» немесе «' + c2 + '» әрпі болу'; askR = 'на ней буква «' + c1 + '» или «' + c2 + '»'; favK = favR = '«' + c1 + '» — ' + cnt[c1] + ', «' + c2 + '» — ' + cnt[c2] + ', ' + k; }
      else if (mode === 'not') { k = n - cnt[c1]; askK = '«' + c1 + '» әрпі болмау'; askR = 'на ней НЕ буква «' + c1 + '»'; favK = favR = n + ' − ' + cnt[c1] + ' = ' + k; }
      else {
        var vs = L.filter(function (c) { return VOWELS.indexOf(c) >= 0; }); k = vs.length;
        askK = 'дауысты әріп болу'; askR = 'на ней гласная буква'; favK = favR = vs.join(', ') + ' — ' + k;
      }
      if (k <= 0 || k >= n) continue;
      var ans = frac(k, n), single = mode === 'one' || mode === 'not' ? cnt[c1] : k;
      var wrong = [frac(k, distinct), frac(1, mode === 'one' ? distinct : n), frac(n - k, n), frac(single, distinct), frac(k, n - k), frac(k - 1, n), frac(k + 1, n), frac(k, n + 1)].filter(function (f) { return f.n > 0 && f.n < f.d && !frac.eq(f, ans); });
      return Q('«' + w + '» сөзінің әріптері бірдей карточкаларға жазылды (әр карточкада бір әріп) және қорапқа салынды. Қораптан қарамай бір карточка алынды. Карточкада ' + askK + ' ықтималдығы қандай?',
        'Буквы слова «' + w + '» написали на одинаковых карточках (на каждой карточке одна буква) и положили в коробку. Не глядя вынули одну карточку. Какова вероятность, что ' + askR + '?',
        ans, wrong, 'Карточка саны — ' + n + ' (қайталанатын әріптер де бөлек саналады). Қолайлы карточкалар: ' + favK + '. P = ' + k + '/' + n + (ans.d !== n ? ' = ' + ans.n + '/' + ans.d : '') + '. Әртүрлі әріптер санына (' + distinct + ') бөлуге болмайды.',
        'Карточек ' + n + ' (повторяющиеся буквы считаются отдельно). Благоприятных: ' + favR + '. P = ' + k + '/' + n + (ans.d !== n ? ' = ' + ans.n + '/' + ans.d : '') + '. Делить на число разных букв (' + distinct + ') нельзя.');
    }
  });

  /* ================= 2. Подстановка (m_order) ================= */
  add('m_order', 'bil.subst', [1, 2, 3], function (r, lvl) {
    function val() {
      if (lvl === 1) return frac(r.int(2, 9));
      if (lvl === 2) return frac(-r.int(2, 9));
      var d = r.pick([2, 3]); return frac(r.pick(d === 3 ? [1, -1, 2, -2] : [1, -1, 3, -3]), d);
    }
    var t, v, vs;
    if (r.chance(0.5)) {   // (p·b − q + s·b)/d + e
      var p, s, d, q, e, lin, part;
      for (t = 0; t < 2000; t++) {
        p = r.int(2, 7); s = r.int(2, 6); d = r.pick([2, 3, 4, 5]); q = r.int(2, 15); e = r.int(2, 12); v = val();
        lin = frac.mul(frac(p + s), v); part = frac.div(frac.sub(lin, frac(q)), frac(d));
        if (lin.d === 1 && part.d === 1 && part.n !== 0) break;
      }
      vs = U.fracHtml(v);
      var ans = part.n + e, num = lin.n - q;
      var ex = fx(p + 'b − ' + q + ' + ' + s + 'b', d) + ' + ' + e;
      var flip = frac.add(frac.div(frac(-lin.n - q), frac(d)), frac(e));
      return Q('b = ' + vs + ' болғанда өрнектің мәнін табыңыз:' + expr(ex), 'Найдите значение выражения при b = ' + vs + ':' + expr(ex),
        ans, [part.n, num + e, flip, part.n - e, ans + 1].filter(function (w) { return typeof w === 'number' || w.d === 1; }),
        'Алдымен алымын ықшамдаймыз: ' + p + 'b + ' + s + 'b − ' + q + ' = ' + (p + s) + 'b − ' + q + '. b = ' + vs + ': ' + (p + s) + ' · (' + vs + ') − ' + q + ' = ' + signed(num) + '. ' + signed(num) + ' : ' + d + ' = ' + signed(part.n) + '. Соңындағы + ' + e + ' туралы ұмытпаңыз: ' + signed(part.n) + ' + ' + e + ' = ' + signed(ans) + '.',
        'Упрощаем числитель: ' + (p + s) + 'b − ' + q + '. При b = ' + vs + ': ' + (p + s) + ' · (' + vs + ') − ' + q + ' = ' + signed(num) + '; ' + signed(num) + ' : ' + d + ' = ' + signed(part.n) + '. Не забываем + ' + e + ': ' + signed(ans) + '.');
    }
    var k, m, a, c, res;   // k(x + a) − m·x − c
    for (t = 0; t < 2000; t++) {
      k = r.int(3, 14); m = r.int(2, 16); a = r.int(1, 9); c = r.int(5, 40); v = val();
      if (k === m) continue;
      res = frac.add(frac.mul(frac(k - m), v), frac(k * a - c));
      if (res.d === 1 && frac.mul(frac(k), v).d === 1) break;
    }
    vs = U.fracHtml(v);
    var ex2 = k + '(x + ' + a + ') − ' + m + 'x − ' + c, mx = frac.mul(frac(m), v);
    var noDist = frac.sub(frac.add(frac.mul(frac(k), v), frac(a)), frac.add(mx, frac(c)));
    var vsP = v.n < 0 || v.d > 1 ? '(' + vs + ')' : vs, lin = linStr(k - m, k * a - c, 'x');
    var wr2 = [res.n + c, noDist, frac.add(frac.mul(frac(k + m), v), frac(k * a - c)), res.n - k * a + a].filter(function (w) { return typeof w === 'number' || w.d === 1; });
    return Q('x = ' + vs + ' болғанда өрнектің мәнін табыңыз:' + expr(ex2), 'Найдите значение выражения при x = ' + vs + ':' + expr(ex2),
      res.n, wr2,
      'Жақшаны ашамыз: ' + k + 'x + ' + k * a + ' − ' + m + 'x − ' + c + ' = ' + lin + '. x = ' + vs + ' қойсақ: ' + linSub(k - m, k * a - c, vsP) + ' = ' + signed(res.n) + '. Жақшаны ашқанда ' + dat(k) + ' жақшадағы екі мүше де көбейтіледі; соңғы − ' + c + ' мүшесін ұмытпаңыз.',
      'Раскрываем скобки: ' + k + 'x + ' + k * a + ' − ' + m + 'x − ' + c + ' = ' + lin + '. При x = ' + vs + ': ' + linSub(k - m, k * a - c, vsP) + ' = ' + signed(res.n) + '. При раскрытии скобок на ' + k + ' умножаются оба слагаемых; не забываем последнее − ' + c + '.');
  });

  /* ================= 3. Какое выражение больше (m_order) ================= */
  var CMP = [
    { s: 'D0D × D', v: function (d) { return 101 * d * d; }, g: 2 },
    { s: 'D0 × DD', v: function (d) { return 110 * d * d; }, g: 2 },
    { s: 'D × DDD', v: function (d) { return 111 * d * d; }, g: 2 },
    { s: 'DD × DD', v: function (d) { return 121 * d * d; }, g: 2 },
    { s: 'D0 × D0', v: function (d) { return 100 * d * d; }, g: 2 },
    { s: 'DD × D', v: function (d) { return 11 * d * d; }, g: 1 },
    { s: 'D0D + D0', v: function (d) { return 111 * d; }, g: 1 },
    { s: 'DDD + D', v: function (d) { return 112 * d; }, g: 1 },
    { s: 'DD0 + DD', v: function (d) { return 121 * d; }, g: 1 },
    { s: 'D0D + DDD', v: function (d) { return 212 * d; }, g: 1 },
    { s: 'D + D0D', v: function (d) { return 102 * d; }, g: 1 },
    { s: 'DD + DD + DD', v: function (d) { return 33 * d; }, g: 1 },
    { s: 'DD0 − DD', v: function (d) { return 99 * d; }, g: 1 },
    { s: 'DDD − D0', v: function (d) { return 101 * d; }, g: 1 },
    { s: 'D0D − DD', v: function (d) { return 90 * d; }, g: 1 },
    { s: 'DD0 + D', v: function (d) { return 111 * d; }, g: 1 },
    { s: 'DD × D + D', v: function (d) { return 11 * d * d + d; }, g: 2 },
    { s: 'D0D × D − D', v: function (d) { return 101 * d * d - d; }, g: 2 },
    { s: 'DD × DD − D', v: function (d) { return 121 * d * d - d; }, g: 3 },
    { s: 'DD × D × D', v: function (d) { return 11 * d * d * d; }, g: 3 },
    { s: 'DDD × D + D', v: function (d) { return 111 * d * d + d; }, g: 3 },
    { s: 'D0D × D + DD', v: function (d) { return 101 * d * d + 11 * d; }, g: 3 }
  ];
  add('m_order', 'bil.compare_expr', [1, 2, 3], function (r, lvl, opt) {
    var pool = CMP.filter(function (c) { return lvl === 1 ? c.g === 1 || c.s === 'D0D × D' : lvl === 2 ? c.g <= 2 : c.g >= 2; });
    for (;;) {
      var d = lvl === 1 ? r.int(2, 9) : r.int(lvl === 3 ? 3 : 2, 9), seen = {}, pick = [];
      r.shuffle(pool).forEach(function (c) { var v = c.v(d); if (!seen[v] && pick.length < 4) { seen[v] = 1; pick.push({ s: c.s.replace(/D/g, d), v: v }); } });
      if (pick.length < 4) continue;
      var big = r.chance(0.6), best = pick.slice().sort(function (a, b) { return big ? b.v - a.v : a.v - b.v; })[0];
      var listS = pick.map(function (p) { return p.s + ' = ' + fmt(p.v); }).join('; ');
      if (opt && opt.int) return Q('Өрнектердің ішіндегі ең ' + (big ? 'үлкен' : 'кіші') + ' мәнді табыңыз:' + expr(pick.map(function (p) { return p.s; }).join(';&nbsp;&nbsp; ')),
        'Найдите ' + (big ? 'наибольшее' : 'наименьшее') + ' из значений выражений:' + expr(pick.map(function (p) { return p.s; }).join(';&nbsp;&nbsp; ')),
        best.v, pick.filter(function (p) { return p !== best; }).map(function (p) { return p.v; }), 'Есептейміз: ' + listS + '.', 'Считаем: ' + listS + '.');
      return Q('Қай өрнектің мәні ең ' + (big ? 'үлкен' : 'кіші') + '?', 'Значение какого выражения ' + (big ? 'наибольшее' : 'наименьшее') + '?',
        best.s, pick.filter(function (p) { return p !== best; }).map(function (p) { return p.s; }),
        'Әрқайсысын есептейміз: ' + listS + '. Ең ' + (big ? 'үлкені' : 'кішісі') + ' — ' + best.s + '. Цифрлары ұқсас болғанымен, мәндері әртүрлі.',
        'Вычисляем: ' + listS + '. ' + (big ? 'Наибольшее' : 'Наименьшее') + ' — ' + best.s + '. Цифры похожи, а значения разные.');
    }
  });

  /* ================= 4. Знакочередующиеся суммы (m_order) ================= */
  function chain(N, term, sign, head) {   // первые члены … 4 последних
    var out = String(term(0)), i;
    head = head || 4;
    for (i = 1; i < head; i++) out += ' ' + sign(i) + ' ' + term(i);
    out += ' ' + sign(head) + ' … ';
    for (i = N - 4; i < N; i++) out += (i === N - 4 ? '' : ' ') + sign(i) + ' ' + term(i);
    return out;
  }
  add('m_order', 'bil.alt_sum', [2, 3], function (r, lvl) {
    var kind = lvl === 2 ? r.pick(['step', 'step', 'nat']) : r.pick(['step', 'three']), N, S = 0, i, term, sign, wrong, sk, sr;
    if (kind === 'step') {
      var s = r.pick(lvl === 2 ? [2, 3, 4] : [3, 4, 5, 6]), last = lvl === 2 ? s : r.int(1, s + 4);
      N = lvl === 2 ? 2 * r.int(10, 30) : r.int(21, 45);
      var first = last + (N - 1) * s;
      term = function (j) { return first - j * s; }; sign = function (j) { return j % 2 ? '−' : '+'; };
      for (i = 0; i < N; i++) S += (i % 2 ? -1 : 1) * term(i);
      var pairs = Math.floor(N / 2);
      wrong = [N * s, (pairs + 1) * s, (pairs - 1) * s + (N % 2 ? last : 0), N % 2 ? pairs * s : pairs * s + last, N % 2 ? pairs * s - last : S + s];
      sk = 'Мүшелер саны: (' + first + ' − ' + last + ') : ' + s + ' + 1 = ' + N + '. Екі-екіден топтаймыз: (' + first + ' − ' + (first - s) + ') + (' + (first - 2 * s) + ' − ' + (first - 3 * s) + ') + … — әр жұп ' + dat(s) + ' тең, жұп саны ' + pairs + '. ' + (N % 2 ? 'Соңғы ' + last + ' жұпсыз қалады: ' + pairs + ' · ' + s + ' + ' + last : pairs + ' · ' + s) + ' = ' + S + '.';
      sr = 'Членов: (' + first + ' − ' + last + ') : ' + s + ' + 1 = ' + N + '. Группируем по два: каждая пара равна ' + s + ', пар ' + pairs + '. ' + (N % 2 ? 'Последнее ' + last + ' остаётся без пары: ' + pairs + ' · ' + s + ' + ' + last : pairs + ' · ' + s) + ' = ' + S + '.';
    } else if (kind === 'nat') {
      N = r.int(40, 130);
      term = function (j) { return j + 1; }; sign = function (j) { return j % 2 ? '−' : '+'; };
      S = N % 2 ? (N + 1) / 2 : -N / 2;
      wrong = [-S, N % 2 ? (N - 1) / 2 : N / 2 + 1, N, S + (S > 0 ? 1 : -1)];
      sk = N % 2 ? '(1 − 2) + (3 − 4) + … + (' + (N - 2) + ' − ' + (N - 1) + ') + ' + N + ': ' + (N - 1) / 2 + ' жұп, әрқайсысы −1. ' + signed(-(N - 1) / 2) + ' + ' + N + ' = ' + S + '.' : '(1 − 2) + (3 − 4) + … + (' + (N - 1) + ' − ' + N + '): ' + N / 2 + ' жұп, әрқайсысы −1. Жауабы ' + signed(S) + '.';
      sr = N % 2 ? 'Пары (1 − 2), (3 − 4), …: их ' + (N - 1) / 2 + ', каждая −1; плюс последнее ' + N + ': ' + signed(-(N - 1) / 2) + ' + ' + N + ' = ' + S + '.' : 'Пары (1 − 2), (3 − 4), …: их ' + N / 2 + ', каждая −1. Ответ ' + signed(S) + '.';
    } else {
      var m = r.int(12, 30); N = 3 * m;
      term = function (j) { return j + 1; }; sign = function (j) { return j % 3 === 2 ? '−' : '+'; };
      S = 3 * m * (m - 1) / 2;
      wrong = [3 * m * (m + 1) / 2, m * (m - 1) / 2, 3 * m * m / 2 % 1 ? 3 * m * (m - 1) / 2 + 3 * m : 3 * m * m / 2, S - 3];
      sk = 'Үш-үштен топтаймыз: (1 + 2 − 3) + (4 + 5 − 6) + … Топтар: 0, 3, 6, …, ' + 3 * (m - 1) + ' (' + m + ' топ, әр келесісі 3-ке артық). Қосындысы: (0 + ' + 3 * (m - 1) + ') · ' + m + ' : 2 = ' + S + '.';
      sr = 'Группируем по три: (1 + 2 − 3) + (4 + 5 − 6) + … Группы: 0, 3, 6, …, ' + 3 * (m - 1) + ' (' + m + ' групп). Сумма: (0 + ' + 3 * (m - 1) + ') · ' + m + ' : 2 = ' + S + '.';
    }
    var ex = chain(N, term, sign, kind === 'three' ? 6 : 4);
    return Q('Есептеңіз:' + expr(ex), 'Вычислите:' + expr(ex), S, ints(wrong, S), sk, sr);
  });

  /* ================= 5. Сколько дробей между (m_frac) ================= */
  add('m_frac', 'bil.frac_between', [2, 3], function (r, lvl) {
    var n, a, b, c, d, xs;
    for (;;) {
      n = r.pick(lvl === 2 ? [12, 16, 18, 20, 24, 30, 36] : [24, 36, 40, 42, 45, 48, 60]);
      b = r.int(2, 12); d = r.int(2, 12); a = r.int(1, b - 1); c = r.int(1, d - 1);
      if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || a * d >= c * b) continue;
      var both = n % b === 0 && n % d === 0;
      if (lvl === 2 ? !both : both) continue;
      xs = [];
      for (var x = 1; x < n; x++) if (x * b > a * n && x * d < c * n) xs.push(x);
      if (xs.length >= 2 && xs.length <= 8) break;
    }
    var incl = 0; for (x = 1; x <= n; x++) if (x * b >= a * n && x * d <= c * n) incl++;
    var ask = lvl === 2 ? r.pick(['count', 'max', 'min']) : r.pick(['count', 'sum']), cnt = xs.length, mx = xs[cnt - 1], mn = xs[0], sm = sum(xs), ans, wrong;
    var ex = fx(a, b) + ' < ' + fx('X', n) + ' < ' + fx(c, d);
    var Kq = { count: 'Теңсіздікті қанағаттандыратын натурал X сандары нешеу?', max: 'Теңсіздікті қанағаттандыратын ең үлкен натурал X санын табыңыз.', min: 'Теңсіздікті қанағаттандыратын ең кіші натурал X санын табыңыз.', sum: 'Теңсіздікті қанағаттандыратын барлық натурал X сандарының қосындысын табыңыз.' };
    var Rq = { count: 'Сколько натуральных чисел X удовлетворяют неравенству?', max: 'Найдите наибольшее натуральное X, удовлетворяющее неравенству.', min: 'Найдите наименьшее натуральное X, удовлетворяющее неравенству.', sum: 'Найдите сумму всех натуральных X, удовлетворяющих неравенству.' };
    if (ask === 'count') { ans = cnt; wrong = [incl, cnt + 1, cnt - 1, cnt + 2]; }
    else if (ask === 'max') { ans = mx; wrong = [mx + 1, mn, mx - 1, Math.floor(c * n / d) + 1]; }
    else if (ask === 'min') { ans = mn; wrong = [mn - 1, mx, mn + 1, Math.ceil(a * n / b) - 1]; }
    else { ans = sm; wrong = [sm + mx + 1, sm - mx, sm - mn, sm + mn - 1]; }
    var sol = a * n + '/' + b + ' < X < ' + c * n + '/' + d;
    return Q(Kq[ask] + expr(ex), Rq[ask] + expr(ex), ans, ints(wrong, ans).filter(function (v) { return v > 0; }),
      'Теңсіздіктің барлық бөлігін ' + dat(n) + ' көбейтеміз: ' + sol + '. Бұл аралықтағы натурал сандар: ' + xs.join(', ') + ' (шеттері кірмейді, теңсіздік қатаң).',
      'Умножаем все части на ' + n + ': ' + sol + '. Натуральные числа в промежутке: ' + xs.join(', ') + ' (концы не входят — неравенство строгое).');
  });

  /* ================= 6. Сократить дробь-произведение (m_frac) ================= */
  function factor(n) { var out = [], p = 2; while (n > 1) { while (n % p === 0) { out.push(p); n /= p; } p++; } return out; }
  function prod(a) { return a.reduce(function (s, x) { return s * x; }, 1); }
  add('m_frac', 'bil.cancel_product', [2, 3], function (r, lvl) {
    function split(pr) {
      for (var k = 0; k < 40; k++) {
        var g = [[], [], []];
        r.shuffle(pr).forEach(function (p, i) { g[i < 3 ? i : r.int(0, 2)].push(p); });
        var v = g.map(prod);
        if (g.every(function (x) { return x.length >= 2; }) && v.every(function (x) { return x >= 10 && x <= 400; })) return v;
      }
      return null;
    }
    for (;;) {
      var C = r.shuffle(lvl === 2 ? [2, 3, 5, 7, 11, 13] : [3, 7, 11, 13, 17, 19]).slice(0, lvl === 2 ? 4 : 5);
      var n = r.pick([2, 3, 4, 5, 6, 8, 10]), d = r.pick([7, 9, 11, 13, 17, 19, 23, 25]);
      if (gcd(n, d) !== 1) continue;
      var A = split(factor(n).concat(C)), B = split(factor(d).concat(C));
      if (!A || !B || A.some(function (x) { return B.indexOf(x) >= 0; })) continue;
      break;
    }
    var ans = frac(n, d), ex = fx(A.join(' · '), B.join(' · ')), notInt = function (f) { return f.d !== 1; };
    var fa = A.map(function (x) { return x + ' = ' + factor(x).join(' · '); }).concat(B.map(function (x) { return x + ' = ' + factor(x).join(' · '); })).join('; ');
    return Q('Бөлшекті қысқартыңыз:' + expr(ex), 'Сократите дробь:' + expr(ex), ans,
      [frac(n * C[0], d), frac(n, d * C[1]), frac(d, n), frac(n * C[2], d * C[3] === d * C[0] ? d + 1 : d * C[3]), frac(n * C[1], d * C[0]), frac(n, d * C[0]), frac(n + 1, d)].filter(notInt),
      'Әр санды жай көбейткіштерге жіктейміз: ' + fa + '. Алымы мен бөліміндегі ортақ көбейткіштер (' + C.slice().sort(function (x, y) { return x - y; }).join(', ') + ') қысқарады; қалады ' + n + '/' + d + '.',
      'Раскладываем на простые множители: ' + fa + '. Общие множители (' + C.slice().sort(function (x, y) { return x - y; }).join(', ') + ') сокращаются; остаётся ' + n + '/' + d + '.');
  });

  /* ================= 7. Линейка (m_geom) ================= */
  function rulerPic(strips, cmMax) {   // strips: [[s, e, label]] в мм
    var k = 3.4, x0 = 16, top = 14 + strips.length * 22, out = '';
    out += rect(x0 - 10, top, cmMax * 10 * k + 20, 40, 'bg');
    for (var m = 0; m <= cmMax * 10; m++) {
      var x = x0 + m * k, len = m % 10 === 0 ? 14 : m % 5 === 0 ? 10 : 6;
      out += line(x, top, x, top + len, '', 'stroke-width:' + (m % 10 === 0 ? 1.3 : 0.8));
      if (m % 10 === 0) out += txt(x, top + 30, m / 10, 'middle', 'ax');
    }
    out += txt(x0 + cmMax * 10 * k + 14, top + 30, 'см', 'start', 'ax');
    strips.forEach(function (st, i) {
      var y = top - 18 - (strips.length - 1 - i) * 22;
      out += rect(x0 + st[0] * k, y, (st[1] - st[0]) * k, 16, 'sh2');
      if (st[2]) out += txt(x0 + (st[0] + st[1]) / 2 * k, y + 12.5, st[2], 'middle');
      if (i < strips.length - 1) out += line(x0 + st[0] * k, y + 16, x0 + st[0] * k, top, 'dim') + line(x0 + st[1] * k, y + 16, x0 + st[1] * k, top, 'dim');
    });
    return pic(cmMax * 10 * k + 2 * x0 + 28, top + 44, out);
  }
  add('m_geom', 'bil.ruler', [1, 2, 3], function (r, lvl, opt) {
    var s, e, L;
    if (lvl === 1) { s = 10 * r.int(1, 3) + r.pick([0, 5]); e = s + 10 * r.int(3, 6) + r.pick([0, 5]); }
    else { do { s = r.int(11, 35); } while (s % 10 === 0); e = s + r.int(30, 60); }
    if (lvl === 3) {
      var parts = r.pick([2, 3, 4]);
      L = e - s; L -= L % parts; e = s + L;
      var each = L / parts, picture = rulerPic([[s, e]], 10);
      return P('Қағаз жолақ сызғышқа суреттегідей қойылды. Жолақты ' + parts + ' тең бөлікке кесті. Әр бөліктің ұзындығы неше миллиметр?',
        'Бумажную полоску положили на линейку, как на рисунке. Полоску разрезали на ' + parts + ' равные части. Какова длина каждой части в миллиметрах?', picture,
        each, ints([e / parts, (e + s) / parts, L, each + 1, each - 1, Math.round(e / parts)], each),
        'Жолақ ' + fmt(s / 10) + ' см белгісінен басталып, ' + fmt(e / 10) + ' см белгісінде бітеді: ұзындығы ' + e + ' − ' + s + ' = ' + L + ' мм. Әр бөлік: ' + L + ' : ' + parts + ' = ' + each + ' мм.',
        'Полоска начинается на отметке ' + fmt(s / 10) + ' см и заканчивается на ' + fmt(e / 10) + ' см: длина ' + e + ' − ' + s + ' = ' + L + ' мм. Каждая часть: ' + L + ' : ' + parts + ' = ' + each + ' мм.', { unit: unit('мм') });
    }
    L = e - s;
    var mm = opt && opt.int, pc = rulerPic([[s, e]], 10), cv = function (v) { return mm ? v : v / 10; };
    return P('Қағаз жолақ сызғышқа суреттегідей қойылды. Жолақтың ұзындығы неше ' + (mm ? 'миллиметр' : 'сантиметр') + '?',
      'Бумажную полоску положили на линейку, как на рисунке. Какова длина полоски в ' + (mm ? 'миллиметрах' : 'сантиметрах') + '?', pc,
      cv(L), [e, e + s, L + 1, L - 1, L + 10, L - 10].filter(function (v) { return v > 0 && v !== L; }).map(cv),
      'Жолақ нөлден емес, ' + fmt(s / 10) + ' см белгісінен басталады. Ұзындығы = соңы − басы: ' + fmt(e / 10) + ' − ' + fmt(s / 10) + ' = ' + fmt(L / 10) + ' см (' + L + ' мм).',
      'Полоска начинается не с нуля, а с отметки ' + fmt(s / 10) + ' см. Длина = конец − начало: ' + fmt(e / 10) + ' − ' + fmt(s / 10) + ' = ' + fmt(L / 10) + ' см (' + L + ' мм).', { unit: unit(mm ? 'мм' : 'см') });
  });

  /* ================= 8. Буква L из двух прямоугольников (m_geom) ================= */
  add('m_geom', 'bil.l_shape', [1, 2, 3], function (r, lvl) {
    var b = r.int(3, 9), a = b + r.int(5, 16), askS = lvl >= 2 && r.chance(0.35);
    var k = Math.min(150 / a, 230 / (a + b)), x0 = 46, y0 = 24, out = '';
    var bw = b * k, ah = a * k, gap = (a - b) * k;
    out += rect(x0, y0, bw, ah, 'sh2') + rect(x0 + bw, y0 + gap, a * k, bw, 'sh2');
    function vdim(x, ya, yb, label, left) {
      return line(x, ya, x, yb, 'dim') + line(x - 4, ya, x + 4, ya) + line(x - 4, yb, x + 4, yb) + txt(left ? x - 6 : x + 6, (ya + yb) / 2 + 4, label, left ? 'end' : 'start');
    }
    function hdim(y, xa, xb, label, above) {
      return line(xa, y, xb, y, 'dim') + line(xa, y - 4, xa, y + 4) + line(xb, y - 4, xb, y + 4) + txt((xa + xb) / 2, above ? y - 6 : y + 16, label);
    }
    var sk, sr;
    if (lvl === 1) {
      out += vdim(x0 - 10, y0, y0 + ah, a + ' см', true) + hdim(y0 - 8, x0, x0 + bw, b + ' см', true);
    } else {
      out += vdim(x0 + bw + 8, y0, y0 + gap, (a - b) + ' см', false);
      if (lvl === 2) out += vdim(x0 + bw + a * k + 8, y0 + gap, y0 + ah, b + ' см', false);
      else out += hdim(y0 + ah + 10, x0, x0 + bw + a * k, (a + b) + ' см', false);
    }
    var Pm = 4 * a + 2 * b, S = 2 * a * b, picture = pic(x0 + (a + b) * k + 70, y0 + ah + 32, out);
    if (lvl === 1) { sk = 'Тіктөртбұрыштың қабырғалары ' + a + ' және ' + b + '. '; sr = 'Стороны прямоугольника ' + a + ' и ' + b + '. '; }
    else if (lvl === 2) { sk = 'Қысқа қабырға ' + b + ', ұзыны ' + (a - b) + ' + ' + b + ' = ' + a + '. '; sr = 'Короткая сторона ' + b + ', длинная ' + (a - b) + ' + ' + b + ' = ' + a + '. '; }
    else { sk = 'Ұзын + қысқа = ' + (a + b) + ', ұзын − қысқа = ' + (a - b) + ' ⇒ ұзыны (' + (a + b) + ' + ' + (a - b) + ') : 2 = ' + a + ', қысқасы ' + b + '. '; sr = 'Длинная + короткая = ' + (a + b) + ', длинная − короткая = ' + (a - b) + ' ⇒ длинная ' + a + ', короткая ' + b + '. '; }
    if (askS) return P('Дархан екі бірдей тіктөртбұрышты суреттегідей орналастырып, фигура құрады. Фигураның ауданын табыңыз.', 'Дархан приложил два одинаковых прямоугольника, как на рисунке. Найдите площадь фигуры.', picture,
      S, [a * b, (a + b) * a, 2 * (a - b) * b, S + b * b], sk + 'Аудан: 2 · ' + a + ' · ' + b + ' = ' + S + ' см².', sr + 'Площадь: 2 · ' + a + ' · ' + b + ' = ' + S + ' см².', { unit: unit('см²') });
    var route = b + ' + ' + (a - b) + ' + ' + a + ' + ' + b + ' + ' + (a + b) + ' + ' + a;
    return P('Дархан екі бірдей тіктөртбұрышты суреттегідей орналастырып, фигура құрады. Фигураның периметрін табыңыз.', 'Дархан приложил два одинаковых прямоугольника, как на рисунке. Найдите периметр фигуры.', picture,
      Pm, [4 * (a + b), 4 * a, 2 * (a + b) + 2 * a, lvl >= 2 ? 4 * (a - b) + 2 * b : 3 * a + 2 * b, 2 * Pm - 2 * b],
      sk + 'Фигураны айналып шығамыз: ' + route + ' = ' + Pm + ' см (екі тіктөртбұрыштың периметрлерінің қосындысы емес — ортақ бөлік кірмейді).',
      sr + 'Обходим фигуру по контуру: ' + route + ' = ' + Pm + ' см (не сумма периметров: общая часть границы не входит).', { unit: unit('см') });
  });

  /* ================= 9. Равные площади на клетчатой бумаге (m_geom) ================= */
  function area(p) { var s = 0; for (var i = 0; i < p.length; i++) { var q = p[(i + 1) % p.length]; s += p[i][0] * q[1] - q[0] * p[i][1]; } return Math.abs(s) / 2; }
  var SHP = {
    rect: function (r) { var w = r.int(2, 5), h = r.int(1, 4); return [[0, 0], [w, 0], [w, h], [0, h]]; },
    tee: function (r) { var w = r.pick([3, 5]), sw = 1, sh = r.int(1, 3), bh = r.int(1, 2), o = (w - sw) / 2; return [[o, 0], [o + sw, 0], [o + sw, sh], [w, sh], [w, sh + bh], [0, sh + bh], [0, sh], [o, sh]]; },
    ell: function (r) { var w = r.int(2, 5), h = r.int(2, 5), p = r.int(1, w - 1), q = r.int(1, h - 1); return [[0, 0], [p, 0], [p, h - q], [w, h - q], [w, h], [0, h]]; },
    tri: function (r) { var p = r.int(2, 5), q = r.int(2, 5); return [[0, 0], [0, q], [p, q]]; },
    par: function (r) { var b = r.int(2, 4), h = r.int(2, 4), s = r.int(1, 2); return [[s, 0], [s + b, 0], [b, h], [0, h]]; },
    trap: function (r) { var a = r.int(3, 5), c = r.int(1, a - 1), h = r.int(2, 4), o = r.int(0, a - c); return [[o, 0], [o + c, 0], [a, h], [0, h]]; },
    tri2: function (r) { var a = r.int(2, 5), h = r.int(2, 4), t = r.int(0, a); return [[t, 0], [a, h], [0, h]]; }
  };
  var SHP_K = { rect: 'тіктөртбұрыш', tee: 'бір-бірлеп санаймыз', ell: 'екі тіктөртбұрышқа бөлеміз', tri: 'тіктөртбұрыштың жартысы', par: 'табаны × биіктігі', trap: '(табандарының қосындысы) × биіктігі : 2', tri2: 'табаны × биіктігі : 2' };
  var SHP_R = { rect: 'прямоугольник', tee: 'считаем клетки', ell: 'делим на два прямоугольника', tri: 'половина прямоугольника', par: 'основание × высота', trap: '(сумма оснований) × высота : 2', tri2: 'основание × высота : 2' };
  add('m_geom', 'bil.grid_areas', [2, 3], function (r, lvl, opt) {
    var fams = lvl === 2 ? ['rect', 'tee', 'ell', 'tri'] : ['rect', 'tee', 'ell', 'tri', 'par', 'trap', 'tri2'];
    var pat = r.pick(['AB', 'AC', 'BC', 'none']), sh, ar, fm, t;
    for (t = 0; t < 3000; t++) {
      fm = r.shuffle(fams).slice(0, 3);
      sh = fm.map(function (f) { return SHP[f](r); }); ar = sh.map(area);
      if (ar.some(function (x) { return x < 2; })) continue;
      var eq = { AB: ar[0] === ar[1], AC: ar[0] === ar[2], BC: ar[1] === ar[2] }, ne = Object.keys(eq).filter(function (k) { return eq[k]; });
      if (opt && opt.int && !ar.some(function (x) { return x % 1 === 0; })) continue;
      if (pat === 'none' ? ne.length === 0 && Math.max.apply(null, ar) - Math.min.apply(null, ar) <= 3 : ne.length === 1 && ne[0] === pat) break;
    }
    var u = 16, cols = 19, rows = 8, out = '', i;
    for (i = 0; i <= cols; i++) out += line(i * u, 0, i * u, rows * u, 'grid');
    for (i = 0; i <= rows; i++) out += line(0, i * u, cols * u, i * u, 'grid');
    var L = ['A', 'B', 'C'];
    sh.forEach(function (p, k) {
      var w = Math.max.apply(null, p.map(function (q) { return q[0]; })), h = Math.max.apply(null, p.map(function (q) { return q[1]; }));
      var gx = 1 + 6 * k + Math.floor((5 - w) / 2), gy = 1 + Math.floor((5 - h) / 2);
      out += poly(p.map(function (q) { return [(gx + q[0]) * u, (gy + q[1]) * u]; }), 'sh', 'fill-opacity:0.75');
      out += txt((1 + 6 * k + 2.5) * u, 7.75 * u, L[k], 'middle', 'big');
    });
    var picture = pic(cols * u + 2, rows * u + 2, out);
    var arTxt = L.map(function (l, k) { return l + ' = ' + fmt(ar[k]) + ' (' + SHP_K[fm[k]] + ')'; }).join(', '), arTxtR = L.map(function (l, k) { return l + ' = ' + fmt(ar[k]) + ' (' + SHP_R[fm[k]] + ')'; }).join(', ');
    if (opt && opt.int) {
      var ix = r.pick([0, 1, 2].filter(function (k) { return ar[k] % 1 === 0; }));
      return P('Суреттегі ' + L[ix] + ' фигурасының ауданы неше торкөзге тең?', 'Сколько клеток составляет площадь фигуры ' + L[ix] + ' на рисунке?', picture,
        ar[ix], ar.filter(function (x, k) { return k !== ix; }).concat([ar[ix] + 1, ar[ix] - 1]), 'Торкөз бойынша санаймыз: ' + arTxt + '.', 'Считаем по клеткам: ' + arTxtR + '.', { unit: unit('торкөз', 'кл.') });
    }
    var OPT = ['A мен B', 'A мен C', 'B мен C', 'Барлығы әртүрлі'], ruMap = { 'A мен B': 'A и B', 'A мен C': 'A и C', 'B мен C': 'B и C', 'Барлығы әртүрлі': 'Все разные' };
    var ans = pat === 'none' ? OPT[3] : OPT[['AB', 'AC', 'BC'].indexOf(pat)];
    return P('Торкөзді қағазда A, B және C фигуралары салынған. Қай фигуралардың аудандары бірдей?', 'На клетчатой бумаге нарисованы фигуры A, B и C. У каких фигур площади равны?', picture,
      ans, OPT.filter(function (o) { return o !== ans; }), 'Бір торкөздің ауданы — 1. ' + arTxt + '. Жауабы: ' + ans + '.', 'Площадь клетки — 1. ' + arTxtR + '. Ответ: ' + ruMap[ans] + '.', { fixed: OPT, ruMap: ruMap });
  });

  /* ================= 10. Круговая диаграмма → таблица (m_percent) ================= */
  function tableOpt(v) {
    return '<table class="tbl" style="width:auto;font-size:13px;margin:0"><tr>' + ['A', 'B', 'C', 'D'].map(function (l) { return '<th style="padding:2px 9px">' + l + '</th>'; }).join('') + '</tr><tr>' +
      v.map(function (x) { return '<td style="padding:2px 9px;text-align:center">' + x + '</td>'; }).join('') + '</tr></table>';
  }
  function piePic(k) {   // k[i] — число шагов по 15°
    var cx = 110, cy = 100, R = 82, a0 = -90, out = '';
    function pt(a, rr) { return [cx + rr * Math.cos(rad(a)), cy + rr * Math.sin(rad(a))]; }
    k.forEach(function (n, i) {
      var a1 = a0 + n * 15, p0 = pt(a0, R), p1 = pt(a1, R);
      out += '<path d="M' + cx + ',' + cy + ' L' + r1(p0[0]) + ',' + r1(p0[1]) + ' A' + R + ',' + R + ' 0 ' + (n * 15 > 180 ? 1 : 0) + ' 1 ' + r1(p1[0]) + ',' + r1(p1[1]) + ' Z" class="bg"/>';
      var m = a0 + n * 7.5, lp = pt(m, R * 0.5);
      out += txt(lp[0], lp[1] + 6, 'ABCD'[i], 'middle', 'big');
      if (n === 6) {
        var s = 11, u1 = [Math.cos(rad(a0)), Math.sin(rad(a0))], u2 = [Math.cos(rad(a1)), Math.sin(rad(a1))];
        out += path('M' + r1(cx + s * u1[0]) + ',' + r1(cy + s * u1[1]) + ' L' + r1(cx + s * (u1[0] + u2[0])) + ',' + r1(cy + s * (u1[1] + u2[1])) + ' L' + r1(cx + s * u2[0]) + ',' + r1(cy + s * u2[1]));
      } else { var dp = pt(m, R * 0.8); out += txt(dp[0], dp[1] + 4, n * 15 + '°', 'middle', 'ax'); }
      a0 = a1;
    });
    return pic(220, 200, out);
  }
  add('m_percent', 'bil.pie_table', [2, 3], function (r, lvl, opt) {
    var k;
    for (;;) { k = [6, r.int(2, 8), r.int(2, 8), 0]; k[3] = 24 - k[0] - k[1] - k[2]; if (k[3] >= 2 && k[3] <= 12 && k.filter(function (x, i) { return k.indexOf(x) === i; }).length >= 3) break; }
    k = r.shuffle(k);
    var u = r.pick([2, 3, 4, 5, 10]), cnt = k.map(function (x) { return x * u; }), N = 24 * u, j = r.int(0, 3), Lj = 'ABCD'[j], picture = piePic(k);
    var why = '15° ↔ ' + N + ' : 24 = ' + u + ' оқушы. ', whyR = '15° ↔ ' + N + ' : 24 = ' + npl(u, 'ученик', 'ученика', 'учеников') + '. ';
    var list = 'ABCD'.split('').map(function (l, i) { return l + ': ' + k[i] * 15 + '° → ' + k[i] + ' · ' + u + ' = ' + cnt[i]; }).join('; ');
    if (lvl === 3) { why = Lj + ' секторы ' + k[j] * 15 + '° және ' + cnt[j] + ' оқушы, сондықтан 15° ↔ ' + u + ' оқушы. '; whyR = 'Сектор ' + Lj + ' — ' + k[j] * 15 + '° и ' + npl(cnt[j], 'ученик', 'ученика', 'учеников') + ', значит 15° ↔ ' + npl(u, 'ученик', 'ученика', 'учеников') + '. '; }
    var introK = lvl === 2 ? 'Дөңгелек диаграммада ' + N + ' оқушының сүйікті спорт түрін таңдауы көрсетілген (A, B, C, D — спорт түрлері). ' : 'Дөңгелек диаграммада оқушылардың сүйікті спорт түрін таңдауы көрсетілген (A, B, C, D — спорт түрлері). ' + Lj + ' түрін ' + cnt[j] + ' оқушы таңдады. ';
    var introR = lvl === 2 ? 'Круговая диаграмма показывает, какой вид спорта выбрали ' + npl(N, 'ученик', 'ученика', 'учеников') + ' (A, B, C, D — виды спорта). ' : 'Круговая диаграмма показывает, какой вид спорта выбрали ученики (A, B, C, D — виды спорта). Вид ' + Lj + ' выбрали ' + npl(cnt[j], 'ученик', 'ученика', 'учеников') + '. ';
    if (opt && opt.int) {
      var q = (j + 1 + r.int(0, 2)) % 4, Lq = 'ABCD'[q];
      if (lvl === 2) q = j, Lq = Lj;
      return P(introK + Lq + ' түрін неше оқушы таңдады?', introR + 'Сколько учеников выбрали вид ' + Lq + '?', picture,
        cnt[q], [k[q] * 15, cnt[q] + u, cnt[q] - u, Math.round(N / 4)], why + list + '.', whyR + list + '.');
    }
    var swaps = [], moves = [], other = [], a, b2, c;
    for (a = 0; a < 4; a++) for (b2 = 0; b2 < 4; b2++) {
      if (a === b2) continue;
      if (a < b2 && cnt[a] !== cnt[b2] && (lvl === 2 || (a !== j && b2 !== j))) { c = cnt.slice(); c[a] = cnt[b2]; c[b2] = cnt[a]; swaps.push(c); }
      if (cnt[b2] > u && (lvl === 2 || (a !== j && b2 !== j))) { c = cnt.slice(); c[a] += u; c[b2] -= u; moves.push(c); }
    }
    var u2 = u === 10 ? 5 : u + 1;
    other.push(k.map(function (x) { return x * u2; }));
    if (u !== 15) other.push(k.map(function (x) { return x * 15; }));
    moves.forEach(function (m) { var c2 = m.slice(); other.push(c2); });
    var wrongV = uniq(cnt, r.shuffle(swaps).slice(0, 1).concat(r.shuffle(moves).slice(0, 1), r.shuffle(other), swaps, moves), function (v) { return v.join(','); }, 3);
    return P(introK + 'Қай кесте диаграммаға сәйкес келеді?', introR + 'Какая таблица соответствует диаграмме?', picture,
      tableOpt(cnt), wrongV.map(tableOpt), 'Тік бұрыш белгісі — 90°. ' + why + list + '.', 'Значок прямого угла — 90°. ' + whyR + list + '.');
  });

  /* ================= 11. Сгибание прямоугольника (m_angles) ================= */
  add('m_angles', 'bil.fold', [2, 3], function (r, lvl) {
    var x = lvl === 2 ? r.int(20, 34) : 0, beta = lvl === 3 ? r.int(18, 36) : 0;
    var alpha = lvl === 2 ? 90 - x : 90 - beta, theta = 2 * alpha - 90;   // ∠ACB, ∠D′CB
    var W = 190, Hh = W / Math.tan(rad(alpha));
    var A = [0, 0], B = [W, 0], C = [W, Hh], D = [0, Hh], Lc = Math.sqrt(W * W + Hh * Hh), ux = W / Lc, uy = Hh / Lc, dt = D[0] * ux + D[1] * uy;
    var Dp = [2 * dt * ux - D[0], 2 * dt * uy - D[1]], tE = C[1] / (C[1] - Dp[1]), E = [C[0] + (Dp[0] - C[0]) * tE, 0];
    // «до»: маленький прямоугольник с пунктирной диагональю
    var s0 = 0.42, bx = 10, by = 16, out = '';
    out += rect(bx, by, W * s0, Hh * s0, 'bg') + poly([[bx, by], [bx + W * s0, by], [bx, by + Hh * s0]], 'sh2', 'stroke:none') + line(bx, by + Hh * s0, bx + W * s0, by, 'dim', 'stroke:currentColor;stroke-width:1.3');
    var ax0 = bx + W * s0 + 12, ay0 = by + Hh * s0 / 2;
    out += line(ax0, ay0, ax0 + 22, ay0, '', 'stroke-width:2.5') + '<path d="M' + r1(ax0 + 30) + ',' + r1(ay0) + ' l-9,-5 v10 z" class="arrow"/>';
    // «после»
    var minX = Math.min(0, Dp[0]), ox = ax0 + 44 - minX, oy = 14 + Hh;
    function S(p) { return [ox + p[0], oy - p[1]]; }
    out += poly([S(A), S(B), S(C)], 'bg') + poly([S(A), S(C), S(Dp)], 'sh2');
    function unitv(p, q) { var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.sqrt(dx * dx + dy * dy); return [dx / l, dy / l]; }
    function mark(Pm, Q1, Q2, rr, lab, lr) {   // дуга угла Q1-P-Q2 (в координатах SVG) и подпись
      var v1 = unitv(Pm, Q1), v2 = unitv(Pm, Q2), cr = v1[0] * v2[1] - v1[1] * v2[0];
      var p1 = [Pm[0] + rr * v1[0], Pm[1] + rr * v1[1]], p2 = [Pm[0] + rr * v2[0], Pm[1] + rr * v2[1]], bis = unitv([0, 0], [v1[0] + v2[0], v1[1] + v2[1]]);
      return path('M' + r1(p1[0]) + ',' + r1(p1[1]) + ' A' + rr + ',' + rr + ' 0 0 ' + (cr > 0 ? 1 : 0) + ' ' + r1(p2[0]) + ',' + r1(p2[1])) + txt(Pm[0] + lr * bis[0], Pm[1] + lr * bis[1] + 4, lab, 'middle');
    }
    var sA = S(A), sB = S(B), sC = S(C), sD = S(Dp), sE = S(E);
    out += txt(sA[0] - 8, sA[1] + 4, 'A', 'end') + txt(sB[0] + 6, sB[1] + 14, 'B', 'start') + txt(sC[0] + 6, sC[1] - 2, 'C', 'start') + txt(sD[0] - 4, sD[1] + 14, 'D′', 'end');
    var ans, wrong, sk, sr;
    if (lvl === 2) {
      out += mark(sC, sB, sD, 26, theta + '°', 40) + mark(sC, sA, sD, 18, 'x', 32);
      ans = x; wrong = [theta, 90 - theta, 90 - x, x + theta, 2 * x];
      sk = 'Бүктегенде бұрыш өзгермейді: ∠ACD′ = ∠ACD = x. C төбесіндегі бұрыш тік: ∠ACD + ∠ACB = 90°, ал ∠ACB = x + ' + theta + '°. Сонда 2x + ' + theta + '° = 90°, x = (90° − ' + theta + '°) : 2 = ' + x + '°.';
      sr = 'При сгибании угол не меняется: ∠ACD′ = ∠ACD = x. Угол C прямой: ∠ACD + ∠ACB = 90°, а ∠ACB = x + ' + theta + '°. Значит, 2x + ' + theta + '° = 90°, x = (90° − ' + theta + '°) : 2 = ' + x + '°.';
    } else if (r.chance(0.5)) {   // x = ∠BCE = 90° − 2β
      out += '<circle cx="' + r1(sE[0]) + '" cy="' + r1(sE[1]) + '" r="2.5" class="dot"/>' + txt(sE[0] + 2, sE[1] + 16, 'E') + mark(sA, sB, sC, 30, beta + '°', 46) + mark(sC, sB, sE, 22, 'x', 34);
      ans = 90 - 2 * beta; wrong = [2 * beta, beta, 90 - beta, 180 - 2 * beta, 45 - beta];
      sk = 'ABC үшбұрышында B бұрышы тік, сондықтан ∠ACB = 90° − ' + beta + '° = ' + (90 - beta) + '°. AB ∥ CD болғандықтан ∠ACD = ∠CAB = ' + beta + '°, ал бүктегенде ∠ACE = ∠ACD = ' + beta + '°. Сонда x = ∠ACB − ∠ACE = ' + (90 - beta) + '° − ' + beta + '° = ' + ans + '°.';
      sr = 'В треугольнике ABC угол B прямой, поэтому ∠ACB = 90° − ' + beta + '° = ' + (90 - beta) + '°. AB ∥ CD, значит ∠ACD = ∠CAB = ' + beta + '°, а при сгибании ∠ACE = ∠ACD = ' + beta + '°. Тогда x = ∠ACB − ∠ACE = ' + (90 - beta) + '° − ' + beta + '° = ' + ans + '°.';
    } else {
      out += '<circle cx="' + r1(sE[0]) + '" cy="' + r1(sE[1]) + '" r="2.5" class="dot"/>' + txt(sE[0] + 2, sE[1] + 16, 'E') + mark(sA, sB, sC, 30, beta + '°', 46) + mark(sE, sB, sC, 14, 'x', 26);
      ans = 2 * beta; wrong = [beta, 90 - beta, 180 - 2 * beta, 90 - 2 * beta, 3 * beta];
      sk = 'AB ∥ CD, сондықтан ∠ACD = ∠CAB = ' + beta + '° (айқыш бұрыштар). Бүктегенде ∠ACE = ∠ACD = ' + beta + '°. AEC үшбұрышында A мен C бұрыштары ' + beta + '°-тан, ал x — E төбесіндегі сыртқы бұрыш: x = ' + beta + '° + ' + beta + '° = ' + ans + '°.';
      sr = 'AB ∥ CD, поэтому ∠ACD = ∠CAB = ' + beta + '° (накрест лежащие). При сгибании ∠ACE = ∠ACD = ' + beta + '°. В треугольнике AEC углы A и C по ' + beta + '°, x — внешний угол при E: x = ' + beta + '° + ' + beta + '° = ' + ans + '°.';
    }
    var w = ox + Math.max(W, Dp[0]) + 24, h = Math.max(oy - Dp[1], by + Hh * s0) + 22;
    return P('Арманда тіктөртбұрышты қағаз бар. Ол қағазды диагоналы бойымен суреттегідей бүктеді. x-тің мәнін анықтаңыз.', 'У Армана прямоугольный лист бумаги. Он сложил его по диагонали, как на рисунке. Определите значение x.',
      pic(w, h, out), ans, ints(wrong, ans).filter(function (v) { return v > 0; }), sk, sr, { unit: unit('°') });
  });

  /* ================= 12. Окрашенный параллелепипед (m_volume) ================= */
  function paintCounts(a, b, c, noBottom) {
    var cnt = [0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < a; i++) for (var j = 0; j < b; j++) for (var k = 0; k < c; k++) {
      var f = (i === 0) + (i === a - 1) + (j === 0) + (j === b - 1) + (k === c - 1) + (!noBottom && k === 0);
      cnt[f]++;
    }
    return cnt;
  }
  var PK = ['бірде-бір жағы боялмаған', 'дәл бір жағы боялған', 'дәл екі жағы боялған', 'дәл үш жағы боялған'];
  var PR = ['не покрашено ни одной грани', 'покрашена ровно одна грань', 'покрашены ровно две грани', 'покрашены ровно три грани'];
  add('m_volume', 'bil.box_paint', [2, 3, 4], function (r, lvl) {
    var a, b, c;
    if (lvl === 2) { a = b = c = r.int(4, 7); }
    else { do { a = r.int(3, 8); b = r.int(3, 7); c = r.int(2, 6); } while (a === b && b === c); }
    var nb = lvl === 4, ks = lvl === 2 ? [1, 2] : lvl === 3 ? [0, 1, 2] : [0, 1, 2, 3], kk = r.pick(ks);
    if (kk === 0 && c < 3) c = r.int(3, 6);   // «ни одной грани» при толщине 2 дало бы 0 — неинтересно
    if (a === b && b === c && lvl > 2) a++;
    var cnt = paintCounts(a, b, c, nb), all = paintCounts(a, b, c, false), ans = cnt[kk];
    var dims = a + ' × ' + b + ' × ' + c, cube = lvl === 2;
    var head = cube ? 'Өлшемі ' + dims + ' текшенің барлық жағы боялды' : nb ? 'Өлшемдері ' + dims + ' тікбұрышты параллелепипед үстелде тұр; оның астыңғы жағынан басқа барлық жағы боялды' : 'Өлшемдері ' + dims + ' тікбұрышты параллелепипедтің барлық жағы боялды';
    var headR = cube ? 'Все грани куба ' + dims + ' покрасили' : nb ? 'Прямоугольный параллелепипед ' + dims + ' стоит на столе; покрасили все его грани, кроме нижней' : 'Все грани прямоугольного параллелепипеда ' + dims + ' покрасили';
    var wrong = [0, 1, 2, 3].filter(function (x) { return x !== kk; }).map(function (x) { return cnt[x]; }).concat([all[kk], cnt[kk] + 4, a * b * c - cnt[kk]]);
    var listK = [3, 2, 1, 0].map(function (x) { return x + ' жақ — ' + cnt[x]; }).join(', '), listR = [3, 2, 1, 0].map(function (x) { return x + ' гр. — ' + cnt[x]; }).join(', ');
    var fk, fr2;
    if (!nb) {
      fk = 'Үш жағы боялғандар — 8 төбеде. Екі жағы — қырлардың бойында (төбелерсіз): 4 · (' + (a - 2) + ' + ' + (b - 2) + ' + ' + (c - 2) + ') = ' + all[2] + '. Бір жағы — әр жақтың ортасында: 2 · (' + (a - 2) + '·' + (b - 2) + ' + ' + (b - 2) + '·' + (c - 2) + ' + ' + (a - 2) + '·' + (c - 2) + ') = ' + all[1] + '. Боялмағандар — ішінде: ' + (a - 2) + '·' + (b - 2) + '·' + (c - 2) + ' = ' + all[0] + '.';
      fr2 = 'Три грани — 8 угловых. Две — вдоль рёбер без углов: 4 · (' + (a - 2) + ' + ' + (b - 2) + ' + ' + (c - 2) + ') = ' + all[2] + '. Одна — середины граней: 2 · (' + (a - 2) + '·' + (b - 2) + ' + ' + (b - 2) + '·' + (c - 2) + ' + ' + (a - 2) + '·' + (c - 2) + ') = ' + all[1] + '. Ни одной — внутренние: ' + (a - 2) + '·' + (b - 2) + '·' + (c - 2) + ' = ' + all[0] + '.';
    } else {
      fk = 'Астыңғы жағы боялмағандықтан, төменгі қабаттағы кубиктердің боялған жағы бір кем. Қабат-қабатпен санаймыз: ' + listK + '.';
      fr2 = 'Нижняя грань не покрашена, поэтому у кубиков нижнего слоя на одну окрашенную грань меньше. Считаем по слоям: ' + listR + '.';
    }
    return Q(head + ', содан кейін ол 1 × 1 × 1 кубиктерге кесілді. Неше кубиктің ' + PK[kk] + '?', headR + ', затем разрезали на кубики 1 × 1 × 1. У скольких кубиков ' + PR[kk] + '?',
      ans, ints(wrong, ans).filter(function (v) { return v >= 0; }), fk + ' Жауабы ' + ans + '.', fr2 + ' Ответ ' + ans + '.');
  });

  /* ================= 13. Плита с окнами (m_volume) ================= */
  add('m_volume', 'bil.slab_holes', [2, 3, 4], function (r, lvl) {
    var p, q, t = lvl === 4 ? 2 : 1, hole, i, j, win, notches = [];
    for (;;) {
      p = r.int(5, 8); q = r.int(7, 11);
      hole = []; for (j = 0; j < q; j++) { hole.push([]); for (i = 0; i < p; i++) hole[j].push(0); }
      var ww = r.int(2, Math.min(3, p - 2)), wh = r.int(2, 4), wx = r.int(1, p - 1 - ww), wy = r.int(1, Math.max(1, q - wh - (lvl === 2 ? 1 : 4)));
      win = [wx, wy, ww, wh];
      for (j = wy; j < wy + wh; j++) for (i = wx; i < wx + ww; i++) hole[j][i] = 1;
      notches = [];
      if (lvl >= 3) {
        var nh = r.int(1, 2), nw = r.pick([1, 1, 2]), xs = [], ok = true;
        for (i = 1; i + nw <= p - 1; i++) xs.push(i);
        var picks = r.shuffle(xs).slice(0, 2).sort(function (x, y) { return x - y; });
        if (picks.length < 2 || picks[1] - picks[0] <= nw) ok = false;
        if (wy + wh >= q - nh) ok = false;   // окно и вырезы не касаются
        if (!ok) continue;
        picks.forEach(function (x0) { notches.push([x0, q - nh, nw, nh]); for (j = q - nh; j < q; j++) for (i = x0; i < x0 + nw; i++) hole[j][i] = 1; });
      }
      break;
    }
    var removed = sum(hole.map(sum)), full = p * q, ans = (full - removed) * t, winA = win[2] * win[3], notA = removed - winA;
    var u = 20, k = 9, ox = 8, oy = 8 + t * k, out = '';
    function X(ii, l) { return ox + ii * u + l * k; }
    function Y(jj, l) { return oy + jj * u - l * k; }
    // внутренние стенки отверстий (левая и нижняя), затем передние грани кубиков
    function walls(hx, hy, hw, hh, bottom) {
      var o = '', l, jj, ii;
      for (l = 0; l < t; l++) {
        if (bottom) for (ii = hx; ii < hx + hw; ii++) o += poly([[X(ii, l), Y(hy + hh, l)], [X(ii + 1, l), Y(hy + hh, l)], [X(ii + 1, l + 1), Y(hy + hh, l + 1)], [X(ii, l + 1), Y(hy + hh, l + 1)]], 'vct');
        for (jj = hy; jj < hy + hh; jj++) o += poly([[X(hx, l), Y(jj, l)], [X(hx, l + 1), Y(jj, l + 1)], [X(hx, l + 1), Y(jj + 1, l + 1)], [X(hx, l), Y(jj + 1, l)]], 'vcr');
      }
      return o;
    }
    out += walls(win[0], win[1], win[2], win[3], true);
    notches.forEach(function (n) { out += walls(n[0], n[1], n[2], n[3], false); });
    for (j = 0; j < q; j++) for (i = 0; i < p; i++) if (!hole[j][i]) out += rect(X(i, 0), Y(j, 0), u, u, 'vcf');
    for (var l = 0; l < t; l++) {
      for (i = 0; i < p; i++) out += poly([[X(i, l), Y(0, l)], [X(i + 1, l), Y(0, l)], [X(i + 1, l + 1), Y(0, l + 1)], [X(i, l + 1), Y(0, l + 1)]], 'vct');
      for (j = 0; j < q; j++) out += poly([[X(p, l), Y(j, l)], [X(p, l + 1), Y(j, l + 1)], [X(p, l + 1), Y(j + 1, l + 1)], [X(p, l), Y(j + 1, l)]], 'vcr');
    }
    var picture = pic(ox + p * u + t * k + 10, oy + q * u + 10, out);
    var dimK = p + ' × ' + q + (t > 1 ? ' × ' + t : '');
    var sk = 'Тесіксіз пластина ' + dimK + ': ' + full * t + ' кубик. Терезе ' + win[2] + ' × ' + win[3] + ' = ' + winA + (notA ? ', төменгі екі ойық барлығы ' + notA : '') + ' — бір қабатта ' + removed + ' кубик жоқ' + (t > 1 ? ', ал қабат екеу: ' + removed + ' · 2 = ' + removed * 2 : '') + '. ' + full * t + ' − ' + removed * t + ' = ' + ans + '.';
    var sr = 'Сплошная плита ' + dimK + ': ' + npl(full * t, 'кубик', 'кубика', 'кубиков') + '. Окно ' + win[2] + ' × ' + win[3] + ' = ' + winA + (notA ? ', два нижних выреза вместе ' + notA : '') + ' — в одном слое нет ' + npl(removed, 'кубика', 'кубиков', 'кубиков') + (t > 1 ? ', а слоёв два: ' + removed * 2 : '') + '. ' + full * t + ' − ' + removed * t + ' = ' + ans + '.';
    return P('Фигура бірдей кішкентай кубиктерден желімделген (тесіктер фигураны тесіп өтеді). Фигураны жасау үшін неше кубик пайдаланылды?', 'Фигуру склеили из одинаковых маленьких кубиков (отверстия сквозные). Сколько кубиков использовали?', picture,
      ans, ints([full * t, (full - winA) * t, full - removed, ans - t, ans + t, (full - removed + 2 * (win[2] + win[3])) * t], ans), sk, sr);
  });

  /* ================= 14. Цепочка единиц длины (m_time) ================= */
  add('m_time', 'bil.units_chain', [2, 3], function (r, lvl) {
    var who = r.pick(['Самат', 'Арман', 'Дана', 'Ерлан']), K, a, b, c, d = 0, restMM, t;
    for (t = 0; t < 1000; t++) {
      K = lvl === 2 ? 10 : r.int(5, 15);
      b = r.int(1500, 4500); c = 10 * r.int(500, 1600); d = lvl === 3 ? r.int(200, 900) : 0;
      a = Math.floor((K * 1e6 - c - 100 * b - 10 * d) / 1000) - r.int(0, 1);
      restMM = K * 1e6 - 1000 * a - 100 * b - 10 * d - c;
      if (restMM >= 300 && restMM <= 1990 && restMM % 10 === 0) break;
    }
    var inMM = lvl === 3 && r.chance(0.5), ans = inMM ? restMM : restMM / 10;
    var errDm = K * 1e6 - 1000 * a - 10 * b - 10 * d - c, errMm = K * 1e6 - 1000 * a - 100 * b - 10 * d - 10 * c;
    var cv = function (v) { return inMM ? v : v / 10; };
    var wrong = [restMM / (inMM ? 10 : 1), cv(restMM + 50), cv(restMM - 40), cv(restMM + 100), errDm > 0 && errDm < 1e5 ? cv(errDm) : null, errMm > 0 ? cv(errMm) : null].filter(function (v) { return v !== null && v > 0 && v % 1 === 0; });
    var kk = who + ' ' + K + ' км жарыс қашықтығының алдымен ' + fmt(a) + ' м жүгірді, содан кейін ' + fmt(b) + ' дм жүріп өтті' + (d ? ', тағы ' + fmt(d) + ' см секірді' : '') + ', соңында ' + fmt(c) + ' мм еңбектеп барып тоқтады. Мәреге жету үшін оған неше ' + (inMM ? 'миллиметр' : 'сантиметр') + ' қалды?';
    var fe = who === 'Дана';   // женское имя — женский род глаголов
    var ru = 'На соревновании по бегу на дистанцию ' + K + ' км ' + who + (fe ? ' пробежала ' : ' пробежал ') + fmt(a) + ' м, потом ' + (fe ? 'прошла ' : 'прошёл ') + fmt(b) + ' дм' + (d ? ', ещё ' + (fe ? 'пропрыгала ' : 'пропрыгал ') + fmt(d) + ' см' : '') + ', наконец, ' + (fe ? 'проползла ' : 'прополз ') + fmt(c) + ' мм и ' + (fe ? 'остановилась' : 'остановился') + '. Сколько ' + (inMM ? 'миллиметров' : 'сантиметров') + (fe ? ' ей' : ' ему') + ' осталось до финиша?';
    var chainS = fmt(K * 1e6) + ' − ' + fmt(1000 * a) + ' − ' + fmt(100 * b) + (d ? ' − ' + fmt(10 * d) : '') + ' − ' + fmt(c) + ' = ' + fmt(restMM) + ' мм';
    return Q(kk, ru, ans, ints(wrong, ans), 'Бәрін миллиметрге айналдырамыз (1 км = 1 000 000 мм, 1 м = 1000 мм, 1 дм = 100 мм, 1 см = 10 мм): ' + chainS + (inMM ? '.' : ' = ' + fmt(restMM / 10) + ' см.'),
      'Переводим всё в миллиметры (1 км = 1 000 000 мм, 1 м = 1000 мм, 1 дм = 100 мм, 1 см = 10 мм): ' + chainS + (inMM ? '.' : ' = ' + fmt(restMM / 10) + ' см.'), { unit: unit(inMM ? 'мм' : 'см') });
  });

  /* ================= 15. Стрелки часов (l_cal) ================= */
  // Минутная стрелка обгоняет часовую на 330° в час. События в момент t = num/11 ч:
  // совпадение num = 12k, противоположно num = 12k + 6, прямой угол num = 6k + 3.
  var CL = {
    over: { k: 'минут тілі сағат тілін неше рет басып озады', r: 'минутная стрелка обгонит часовую', per: 1, test: function (n) { return n % 12 === 0; }, ek: 'тілдер беттесетін', er: 'стрелки совпадают', f: '12k/11' },
    right: { k: 'сағат тілдері неше рет тік бұрыш жасайды', r: 'стрелки образуют прямой угол', per: 2, test: function (n) { return n % 6 === 3; }, ek: 'тілдердің арасы 90° немесе 270° болатын', er: 'угол между стрелками 90° или 270°', f: '3(2k + 1)/11' },
    opp: { k: 'сағат тілдері неше рет қарама-қарсы бағытталады (жазыңқы бұрыш жасайды)', r: 'стрелки будут направлены в противоположные стороны', per: 1, test: function (n) { return n % 12 === 6; }, ek: 'тілдердің арасы 180° болатын', er: 'угол между стрелками 180°', f: '6(2k + 1)/11' }
  };
  add('l_cal', 'bil.clock_hands', [2, 3, 4], function (r, lvl) {
    var type = r.pick(['over', 'right', 'opp']), T = CL[type], h1, h2, n, ans, spanK, spanR;
    if (lvl === 2) {
      var day = r.chance(0.6); h1 = 0; h2 = day ? 24 : 12;
      ans = h2 / 12 * 11 * T.per;
      spanK = day ? 'Бір тәулікте' : '12 сағатта'; spanR = day ? 'за сутки' : 'за 12 часов';
    } else {
      // внутри 12 часов без полудня число событий равно числу часов — промежуток проходит через 12:00.
      // Перебираем все подходящие промежутки (концы — не события, ответ ≠ «число часов × частота») и берём случайный.
      var cand = [], a1, a2, cnt;
      for (a1 = 0; a1 < 24; a1++) for (a2 = a1 + 3; a2 <= 24; a2++) {
        if (lvl === 3 ? !(a1 >= 5 && a1 <= 11 && a2 >= 13 && a2 <= 19 && a2 - a1 <= 10) : a2 - a1 < 5 || a2 - a1 > 16) continue;
        if (T.test(11 * a1) || T.test(11 * a2)) continue;
        cnt = 0; for (n = 11 * a1 + 1; n < 11 * a2; n++) if (T.test(n)) cnt++;
        if (cnt !== (a2 - a1) * T.per) cand.push([a1, a2, cnt]);
      }
      var pick = r.pick(cand); h1 = pick[0]; h2 = pick[1]; ans = pick[2];
      spanK = 'Сағат ' + U.pad2(h1) + ':00 мен ' + U.pad2(h2) + ':00 аралығында'; spanR = 'с ' + U.pad2(h1) + ':00 до ' + U.pad2(h2) + ':00';
    }
    var hours = h2 - h1, naive = hours * T.per;
    return Q(spanK + ' ' + T.k + '?', 'Сколько раз ' + spanR + ' ' + T.r + '?', ans, ints([naive, naive + T.per, ans + 1, ans - 1, naive - T.per * 2], ans).filter(function (v) { return v > 0; }),
      'Минут тілі сағатына 360°, сағат тілі 30° бұрылады, яғни минут тілі сағат тілінен сағатына 330° озады. Сондықтан ' + T.ek + ' сәттері сағат басында емес, 12/11 сағатта ' + T.per + ' рет қайталанады: t = ' + T.f + ' сағ (k = 0, 1, 2, …). Аралыққа осындай ' + ans + ' сәт кіреді (' + hours + ' сағатта ' + naive + ' емес).',
      'Минутная стрелка поворачивается на 360° в час, часовая — на 30°, то есть минутная обгоняет часовую на 330° в час. Поэтому моменты, когда ' + T.er + ', повторяются ' + (T.per === 1 ? 'один раз' : 'два раза') + ' за каждые 12/11 часа: t = ' + T.f + ' ч (k = 0, 1, 2, …). В промежуток попадает ' + ans + ' таких моментов (а не ' + naive + ').');
  });

  /* ================= 16. Бусы (l_count) ================= */
  var BEAD = [{ c: 'vz0', k: 'ақ', r: 'белых' }, { c: 'vct', k: 'сұр', r: 'серых' }, { c: 'vz2', k: 'қара', r: 'чёрных' }];
  add('l_count', 'bil.beads', [2, 3, 4], function (r, lvl) {
    var per, pre = [], plen = lvl === 2 ? r.int(3, 4) : lvl === 3 ? r.int(5, 6) : r.int(6, 7), i;
    for (;;) {
      per = []; for (i = 0; i < plen; i++) per.push(r.int(0, 2));
      if ([0, 1, 2].some(function (c) { return per.indexOf(c) < 0; })) continue;
      var prim = true;   // период не составлен из меньшего
      for (var dd = 1; dd < plen; dd++) if (plen % dd === 0 && per.every(function (c, j) { return c === per[j % dd]; })) prim = false;
      if (!prim) continue;
      if (lvl === 4) { pre = []; var pl = r.int(2, 3); for (i = 0; i < pl; i++) pre.push(r.int(0, 2)); if (pre.every(function (c, j) { return c === per[j]; })) continue; }
      break;
    }
    var col = r.pick([0, 1, 2].filter(function (c) { return per.indexOf(c) >= 0; })), N, rr, Ltxt, LtxtR, rTxt, rTxtR, dTxt;
    for (;;) {
      N = pre.length + r.int(lvl === 2 ? 15 : 25, lvl === 2 ? 45 : 70);
      if ((N - pre.length) % plen === 0) continue;
      if (lvl === 2) { rr = r.int(1, 5); Ltxt = LtxtR = N * 2 * rr + ' см'; rTxt = rTxtR = rr + ' см'; dTxt = 2 * rr + ' см'; break; }
      rr = r.pick([2, 3, 4, 5, 6, 8]);   // мм
      if ((N * 2 * rr) % 10) continue;
      Ltxt = LtxtR = fmt(N * 2 * rr / 10) + ' см'; rTxt = rTxtR = rr + ' мм'; dTxt = 2 * rr + ' мм'; break;
    }
    function countIn(n) { var c = 0; for (var j = 0; j < n; j++) { var v = j < pre.length ? pre[j] : per[(j - pre.length) % plen]; if (v === col) c++; } return c; }
    var ans = countIn(N), inPer = per.filter(function (c) { return c === col; }).length, full = Math.floor((N - pre.length) / plen), tail = (N - pre.length) % plen;
    var wrongR = countIn(2 * N), fullOnly = countIn(pre.length) + full * inPer;
    var show = pre.concat(per, per), bR = 9, out = '';
    show.forEach(function (c, j) { out += '<circle cx="' + (12 + j * 2 * bR + bR) + '" cy="20" r="' + bR + '" class="' + BEAD[c].c + '"/>'; });
    var endX = 12 + show.length * 2 * bR;
    out += txt(endX + 16, 25, '… …', 'middle');
    out += line(12, 46, endX + 30, 46) + '<path d="M12,46 l9,-4 v8 z" class="arrow"/><path d="M' + (endX + 30) + ',46 l-9,-4 v8 z" class="arrow"/>' + txt((endX + 42) / 2, 66, Ltxt, 'middle', 'big');
    var picture = pic(endX + 44, 74, out);
    var preK = pre.length ? 'Тізбектің басында ' + pre.length + ' моншақ бөлек тұр, одан кейін бір топ қайталанады (суретте басы көрсетілген). ' : '';
    var preR = pre.length ? 'В начале цепочки ' + pre.length + ' отдельные бусины, дальше повторяется одна и та же группа (на рисунке показано начало). ' : '';
    var who = r.pick(['Алтынгүл', 'Айжан', 'Дана']), whoR = who === 'Алтынгүл' ? 'Алтынгуль' : who;
    return P(who + ' ақ, сұр және қара моншақтарды суреттегідей қайталанатын тізбекпен байлады. ' + preK + 'Әр моншақтың радиусы ' + rTxt + '. ' + who + ' ұзындығы ' + Ltxt + ' моншақ тізбегін жасады. Ол неше ' + BEAD[col].k + ' моншақ қолданды?',
      whoR + ' соединила белые, серые и чёрные бусины в повторяющемся узоре, как показано ниже. ' + preR + 'Радиус каждой бусины ' + rTxtR + '. ' + whoR + ' сделала цепочку длиной ' + LtxtR + '. Сколько ' + BEAD[col].r + ' бусин она использовала?', picture,
      ans, ints([wrongR, fullOnly, ans + 1, ans - 1, N - ans, inPer * Math.ceil((N - pre.length) / plen)], ans).filter(function (v) { return v > 0; }),
      'Бір моншақтың ұзындығы — диаметрі: ' + dTxt + ' (радиус емес!). Моншақ саны: ' + Ltxt + ' : ' + dTxt + ' = ' + N + '. ' + (pre.length ? 'Алғашқы ' + pre.length + ' моншақта ' + BEAD[col].k + ' моншақ — ' + countIn(pre.length) + '. ' : '') + 'Қайталанатын топта ' + plen + ' моншақ, оның ' + inPer + ' — ' + BEAD[col].k + '. ' + (N - pre.length) + ' = ' + plen + ' · ' + full + ' + ' + tail + ': ' + full + ' толық топ және ' + tail + ' артық моншақ. Барлығы ' + ans + '.',
      'Длина одной бусины — её диаметр: ' + dTxt + ' (а не радиус!). Бусин: ' + LtxtR + ' : ' + dTxt + ' = ' + N + '. ' + (pre.length ? 'Среди первых ' + pre.length + ' бусин ' + BEAD[col].r + ' — ' + countIn(pre.length) + '. ' : '') + 'В повторяющейся группе ' + plen + ' бусин, из них ' + BEAD[col].r + ' — ' + inPer + '. ' + (N - pre.length) + ' = ' + plen + ' · ' + full + ' + ' + tail + ': ' + npl(full, 'полная группа', 'полные группы', 'полных групп') + ' и ' + npl(tail, 'лишняя бусина', 'лишние бусины', 'лишних бусин') + '. Всего ' + ans + '.');
  });

  /* ================= 17. Фигурные числа (l_seq) ================= */
  var FIGS = {
    bridge: { lin: true, pts: function (n, h, th) { var o = [], i, j; for (j = 0; j < h; j++) { o.push([0, j]); o.push([n + 1, j]); } for (j = 0; j < th; j++) for (i = 1; i <= n; i++) o.push([i, j]); return o; },
      f: function (n, h, th) { return 2 * h + th * n; }, sk: function (h, th) { return (th > 1 ? th + 'n' : 'n') + ' + ' + 2 * h; } },
    corner: { lin: true, pts: function (n) { var o = [], i; for (i = 0; i <= n; i++) o.push([i, n]); for (i = 0; i < n; i++) o.push([0, i]); return o; }, f: function (n) { return 2 * n + 1; }, sk: function () { return '2n + 1'; } },
    frame: { lin: true, pts: function (n) { var o = [], i, j; for (j = 0; j <= n; j++) for (i = 0; i <= n; i++) if (i === 0 || j === 0 || i === n || j === n) o.push([i, j]); return o; }, f: function (n) { return 4 * n; }, sk: function () { return '4n'; } },
    plus: { lin: true, pts: function (n) { var o = [[n, n]], i; for (i = 1; i <= n; i++) o.push([n - i, n], [n + i, n], [n, n - i], [n, n + i]); return o; }, f: function (n) { return 4 * n + 1; }, sk: function () { return '4n + 1'; } },
    rectQ: { lin: false, pts: function (n) { var o = [], i, j; for (j = 0; j < n; j++) for (i = 0; i <= n; i++) o.push([i, j]); return o; }, f: function (n) { return n * (n + 1); }, sk: function () { return 'n · (n + 1)'; } },
    stair: { lin: false, pts: function (n) { var o = [], i, j; for (j = 0; j < n; j++) for (i = 0; i <= j; i++) o.push([i, j]); return o; }, f: function (n) { return n * (n + 1) / 2; }, sk: function () { return 'n · (n + 1) : 2'; } },
    sqTail: { lin: false, pts: function (n) { var o = [], i, j; for (j = 0; j <= n; j++) for (i = 0; i <= n; i++) if (!(i === n && j === 0)) o.push([i, j]); return o; }, f: function (n) { return (n + 1) * (n + 1) - 1; }, sk: function () { return '(n + 1)² − 1'; } }
  };
  add('l_seq', 'bil.figurate', [2, 3, 4], function (r, lvl) {
    var name = r.pick(lvl === 2 ? ['bridge', 'corner', 'frame', 'plus'] : lvl === 3 ? ['bridge', 'plus', 'frame', 'rectQ', 'stair'] : ['rectQ', 'stair', 'sqTail', 'bridge']);
    var Fg = FIGS[name], h = r.int(2, 4), th = lvl === 2 ? 1 : r.pick([1, 2]);
    var N = Fg.lin ? r.pick([50, 100, 25, 40, 60, 75]) : r.int(10, 25), sq = r.chance(0.35), g = 12, out = '', x = 6;
    var tall = Math.max.apply(null, Fg.pts(3, h, th).map(function (p) { return p[1]; })) + 1;
    for (var n = 1; n <= 3; n++) {
      var pts = Fg.pts(n, h, th), mx = Math.max.apply(null, pts.map(function (p) { return p[0]; })), my = Math.max.apply(null, pts.map(function (p) { return p[1]; }));
      if (pts.length !== Fg.f(n, h, th)) throw new Error('figurate ' + name);
      pts.forEach(function (p) { out += sq ? rect(x + p[0] * g + 1, 6 + p[1] * g + 1, g - 2, g - 2, 'vz1') : '<circle cx="' + r1(x + p[0] * g + g / 2) + '" cy="' + r1(6 + p[1] * g + g / 2) + '" r="4.6" class="vz0"/>'; });
      out += txt(x + (mx + 1) * g / 2, 6 + tall * g + 14, n, 'middle', 'ax');
      x += (mx + 1) * g + 26;
    }
    out += txt(x - 4, 6 + tall * g / 2 + 4, '…', 'middle');
    var ans = Fg.f(N, h, th), seq = [1, 2, 3, 4].map(function (k) { return Fg.f(k, h, th); }).join(', ');
    var formula = Fg.sk(h, th), wK = sq ? 'шаршы' : 'дөңгелек', wR = sq ? 'квадратов' : 'кружков';
    var wrong = [Fg.f(N - 1, h, th), Fg.f(N + 1, h, th), Fg.lin ? ans - Fg.f(0, h, th) || ans + 2 : N * N, Fg.lin ? Fg.f(1, h, th) * N : N * (N - 1), Fg.lin ? ans + Fg.f(1, h, th) : (N + 1) * (N + 1)];
    return P('Суретте фигуралар тізбегінің алғашқы үшеуі көрсетілген. ' + N + '-фигурада неше ' + wK + ' болады?', 'На рисунке показаны первые три фигуры последовательности. Сколько ' + wR + ' будет в ' + N + '-й фигуре?',
      pic(x + 6, 6 + tall * g + 22, out), ans, ints(wrong, ans).filter(function (v) { return v > 0; }),
      'Фигуралардағы саны: ' + seq + ', … Суреттен заңдылық: n-фигурада ' + formula + '. n = ' + N + ' болғанда: ' + ans + '.', 'Количество: ' + seq + ', … По рисунку: в n-й фигуре ' + formula + '. При n = ' + N + ': ' + ans + '.');
  });

  /* ================= 18. Сумма нечётных = квадрат (l_seq) ================= */
  add('l_seq', 'bil.odd_squares', [1, 2, 3], function (r, lvl) {
    var g = 26, out = '', K = 4, i, j;
    for (j = 1; j < K; j++) out += path('M' + 14 + ',' + (14 + (K - 1 - j) * g) + ' H' + (14 + j * g) + ' V' + (14 + (K - 1) * g));
    for (j = 0; j < K; j++) for (i = 0; i < K; i++) out += '<circle cx="' + (14 + i * g) + '" cy="' + (14 + (K - 1 - j) * g) + '" r="3.6" class="dot"/>';
    out += txt(14 + K * g - 4, 18 + (K - 1) * g, '…', 'start');
    var picture = pic(14 + K * g + 20, 28 + (K - 1) * g, out), introK = 'Суретті пайдаланып, 1 + 3 + 5 + 7 = 4 × 4 екенін байқаймыз. ', introR = 'По рисунку видно, что 1 + 3 + 5 + 7 = 4 × 4. ';
    var k = r.int(9, 25), last = 2 * k - 1, ans, ex, wrong, sk, sr;
    if (lvl === 1) {
      ans = k * k; ex = '1 + 3 + 5 + … + ' + (last - 2) + ' + ' + last;
      wrong = [last * last, k * (k + 1), (k - 1) * (k - 1), (k + 1) * (k + 1), last * k];
      sk = 'Қосылғыштар саны: (' + last + ' + 1) : 2 = ' + k + '. Бірінші ' + k + ' тақ санның қосындысы ' + k + ' × ' + k + ' = ' + ans + '.';
      sr = 'Слагаемых: (' + last + ' + 1) : 2 = ' + k + '. Сумма первых ' + k + ' нечётных равна ' + k + ' × ' + k + ' = ' + ans + '.';
      return P(introK + 'Өрнектің мәнін анықтаңыз:' + expr(ex), introR + 'Найдите значение выражения:' + expr(ex), picture, ans, ints(wrong, ans), sk, sr);
    }
    if (lvl === 2) {
      var m = r.int(3, k - 6), from = 2 * m + 1;
      ans = k * k - m * m; ex = from + ' + ' + (from + 2) + ' + ' + (from + 4) + ' + … + ' + last;
      wrong = [k * k, (k - m) * (k - m), k * k - (m + 1) * (m + 1), k * k - (m - 1) * (m - 1), (from + last) * (k - m)];
      sk = '1-ден ' + dat(last) + ' дейінгі тақ сандар: ' + k + ' дана, қосындысы ' + k * k + '. Басындағы 1-ден ' + dat(from - 2) + ' дейінгілер: ' + m + ' дана, қосындысы ' + m * m + '. ' + k * k + ' − ' + m * m + ' = ' + ans + '.';
      sr = 'Нечётные от 1 до ' + last + ': ' + npl(k, 'число', 'числа', 'чисел') + ', сумма ' + k * k + '. От 1 до ' + (from - 2) + ': ' + npl(m, 'число', 'числа', 'чисел') + ', сумма ' + m * m + '. ' + k * k + ' − ' + m * m + ' = ' + ans + '.';
      return P(introK + 'Өрнектің мәнін анықтаңыз:' + expr(ex), introR + 'Найдите значение выражения:' + expr(ex), picture, ans, ints(wrong, ans), sk, sr);
    }
    ans = last; ex = '1 + 3 + 5 + … + n = ' + k * k;
    wrong = [k, 2 * k + 1, 2 * k - 3, k * k - 1, 2 * k];
    sk = 'Бірінші k тақ санның қосындысы k², сондықтан k² = ' + k * k + ', k = ' + k + '. ' + k + '-ші тақ сан: 2 · ' + k + ' − 1 = ' + last + '.';
    sr = 'Сумма первых k нечётных равна k², значит k² = ' + k * k + ', k = ' + k + '. ' + k + '-е нечётное число: 2 · ' + k + ' − 1 = ' + last + '.';
    return P(introK + 'Тақ сан n-ді табыңыз:' + expr(ex), introR + 'Найдите нечётное число n:' + expr(ex), picture, ans, ints(wrong, ans), sk, sr);
  });

  /* ================= 19. Лишнее слово (l_seq) ================= */
  var WG = [
    { k: 'ұзындық бірліктері', r: 'единицы длины', it: [['метр', 'метр'], ['сантиметр', 'сантиметр'], ['километр', 'километр'], ['миллиметр', 'миллиметр'], ['дециметр', 'дециметр']], odd: [['литр', 'литр'], ['гектар', 'гектар'], ['миллилитр', 'миллилитр']] },
    { k: 'масса бірліктері', r: 'единицы массы', it: [['грамм', 'грамм'], ['килограмм', 'килограмм'], ['тонна', 'тонна'], ['центнер', 'центнер'], ['миллиграмм', 'миллиграмм']], odd: [['литр', 'литр'], ['миллиметр', 'миллиметр'], ['гектар', 'гектар']] },
    { k: 'уақыт бірліктері', r: 'единицы времени', it: [['секунд', 'секунда'], ['минут', 'минута'], ['сағат', 'час'], ['тәулік', 'сутки'], ['апта', 'неделя'], ['ғасыр', 'век']], odd: [['градус', 'градус'], ['километр', 'километр']] },
    { k: 'аудан бірліктері', r: 'единицы площади', it: [['шаршы метр', 'квадратный метр'], ['гектар', 'гектар'], ['шаршы километр', 'квадратный километр'], ['шаршы сантиметр', 'квадратный сантиметр'], ['ар (сотық)', 'ар (сотка)']], odd: [['текше метр', 'кубический метр'], ['литр', 'литр']] },
    { k: 'көлем бірліктері', r: 'единицы объёма', it: [['литр', 'литр'], ['миллилитр', 'миллилитр'], ['текше метр', 'кубический метр'], ['текше сантиметр', 'кубический сантиметр'], ['текше дециметр', 'кубический дециметр']], odd: [['шаршы метр', 'квадратный метр'], ['килограмм', 'килограмм']] },
    { k: 'сүтқоректілер', r: 'млекопитающие', it: [['жылқы', 'лошадь'], ['түйе', 'верблюд'], ['қасқыр', 'волк'], ['кит', 'кит'], ['жарқанат', 'летучая мышь'], ['дельфин', 'дельфин']], odd: [['пингвин', 'пингвин'], ['бүркіт', 'беркут'], ['түйеқұс', 'страус']] },
    { k: 'құстар', r: 'птицы', it: [['бүркіт', 'беркут'], ['қарлығаш', 'ласточка'], ['үкі', 'сова'], ['түйеқұс', 'страус'], ['пингвин', 'пингвин'], ['тауық', 'курица']], odd: [['жарқанат', 'летучая мышь'], ['көбелек', 'бабочка']] },
    { k: 'жемістер', r: 'фрукты', it: [['алма', 'яблоко'], ['алмұрт', 'груша'], ['өрік', 'абрикос'], ['шие', 'вишня'], ['шабдалы', 'персик']], odd: [['сәбіз', 'морковь'], ['қырыққабат', 'капуста'], ['картоп', 'картофель']] },
    { k: 'көкөністер', r: 'овощи', it: [['сәбіз', 'морковь'], ['қырыққабат', 'капуста'], ['картоп', 'картофель'], ['қызылша', 'свёкла'], ['пияз', 'лук']], odd: [['алма', 'яблоко'], ['жүзім', 'виноград']] },
    { k: 'жазық фигуралар', r: 'плоские фигуры', it: [['шаршы', 'квадрат'], ['үшбұрыш', 'треугольник'], ['шеңбер', 'окружность'], ['ромб', 'ромб'], ['тіктөртбұрыш', 'прямоугольник'], ['трапеция', 'трапеция']], odd: [['куб', 'куб'], ['шар', 'шар'], ['пирамида', 'пирамида'], ['цилиндр', 'цилиндр']] },
    { k: 'кеңістік фигуралары', r: 'объёмные фигуры', it: [['куб', 'куб'], ['шар', 'шар'], ['пирамида', 'пирамида'], ['цилиндр', 'цилиндр'], ['конус', 'конус']], odd: [['шаршы', 'квадрат'], ['шеңбер', 'окружность'], ['трапеция', 'трапеция']] },
    { k: 'планеталар', r: 'планеты', it: [['Марс', 'Марс'], ['Юпитер', 'Юпитер'], ['Венера', 'Венера'], ['Сатурн', 'Сатурн'], ['Меркурий', 'Меркурий'], ['Жер', 'Земля']], odd: [['Күн', 'Солнце'], ['Ай', 'Луна']] },
    { k: 'Қазақстан өзендері', r: 'реки Казахстана', it: [['Ертіс', 'Иртыш'], ['Іле', 'Или'], ['Есіл', 'Ишим'], ['Жайық', 'Урал'], ['Сырдария', 'Сырдарья'], ['Тобыл', 'Тобол']], odd: [['Балқаш', 'Балхаш'], ['Алакөл', 'Алаколь'], ['Зайсан', 'Зайсан']] },
    { k: 'ішекті аспаптар', r: 'струнные инструменты', it: [['домбыра', 'домбра'], ['скрипка', 'скрипка'], ['гитара', 'гитара'], ['қобыз', 'кобыз'], ['арфа', 'арфа']], odd: [['сыбызғы', 'сыбызгы'], ['барабан', 'барабан'], ['флейта', 'флейта']] },
    { k: 'ай атаулары', r: 'названия месяцев', it: [['қаңтар', 'январь'], ['наурыз', 'март'], ['мамыр', 'май'], ['қазан', 'октябрь'], ['шілде', 'июль']], odd: [['дүйсенбі', 'понедельник'], ['жұма', 'пятница']] },
    { k: 'апта күндері', r: 'дни недели', it: [['дүйсенбі', 'понедельник'], ['сейсенбі', 'вторник'], ['сәрсенбі', 'среда'], ['бейсенбі', 'четверг'], ['жұма', 'пятница']], odd: [['наурыз', 'март'], ['мамыр', 'май']] },
    { k: 'жәндіктер', r: 'насекомые', it: [['көбелек', 'бабочка'], ['құмырсқа', 'муравей'], ['ара', 'пчела'], ['шыбын', 'муха'], ['инелік', 'стрекоза']], odd: [['өрмекші', 'паук'], ['шаян', 'рак']] }
  ];
  add('l_seq', 'bil.odd_word', [1, 2], function (r, lvl) {
    var g = r.pick(WG), main = r.shuffle(g.it).slice(0, lvl === 1 ? 3 : 4), odd = r.pick(g.odd), words = r.shuffle(main.concat([odd])), ruMap = {};
    words.forEach(function (w) { ruMap[w[0]] = w[1]; });
    return Q('Қай сөз артық?' + expr(words.map(function (w) { return w[0]; }).join(',&nbsp; ')), 'Какое слово лишнее?' + expr(words.map(function (w) { return w[1]; }).join(',&nbsp; ')),
      odd[0], main.map(function (w) { return w[0]; }), '«' + odd[0] + '» — артық: қалғандарының бәрі — ' + g.k + '.', '«' + odd[1] + '» — лишнее: все остальные — ' + g.r + '.', { ruMap: ruMap });
  });

  /* ================= 20. «Задумай число» (l_op) ================= */
  function opApply(op, v, x) { return op.t === '+' ? v + op.a : op.t === '−' ? v - op.a : op.t === '×' ? v * op.a : op.t === ':' ? v / op.a : v - x; }
  function opInv(op, v) { return op.t === '+' ? v - op.a : op.t === '−' ? v + op.a : op.t === '×' ? v / op.a : v * op.a; }
  function opStr(op) { return op.t === 'x' ? '− x' : op.t + op.a; }
  add('l_op', 'bil.think_number', [2, 3, 4], function (r, lvl) {
    var ops, x, res, i, v;
    if (lvl === 4) {
      var k = r.int(2, 5), a = r.int(3, 12), c = r.int(2, 15), m = r.int(2, 4), b = r.int(1, a - 1);
      ops = r.chance(0.5) ? [{ t: '×', a: k }, { t: '+', a: k * a }, { t: ':', a: k }, { t: 'x' }, { t: '+', a: c }] : [{ t: '+', a: a }, { t: '×', a: k }, { t: '−', a: k * b }, { t: ':', a: k }, { t: 'x' }, { t: '×', a: m }];
      x = r.int(5, 40); v = x; ops.forEach(function (op) { v = opApply(op, v, x); }); res = v;
      var chain4 = 'x → ' + ops.map(opStr).join(' → ') + ' → ?';
      var noX = res + x, steps = ops.map(function (op) { return opStr(op); }).join(', ');
      return Q('Асан бір сан ойлады (оны x деп белгілейік) және оған мына амалдарды кезекпен орындады. Қандай сан ойласа да, нәтиже бірдей шығады. Нәтиже неге тең?' + expr(chain4),
        'Асан задумал число (обозначим его x) и выполнил с ним по порядку такие действия. Какое бы число он ни задумал, результат одинаков. Чему он равен?' + expr(chain4),
        res, ints([noX, res + 1, res * 2, res - 1, ops[1].a], res).filter(function (q) { return q > 0; }),
        'Кез келген санмен тексеруге болады, мысалы x = ' + x + ': ' + x + ' → ' + (function () { var vv = x, o = []; ops.forEach(function (op) { vv = opApply(op, vv, x); o.push(vv); }); return o.join(' → '); })() + '. Жалпы түрде: x-ке тәуелді бөлік «− x» қадамында жойылады, нәтижесі ' + res + '.',
        'Можно проверить на любом числе, например x = ' + x + ': ' + x + ' → ' + (function () { var vv = x, o = []; ops.forEach(function (op) { vv = opApply(op, vv, x); o.push(vv); }); return o.join(' → '); })() + '. В общем виде часть с x исчезает на шаге «− x», результат ' + res + '.');
    }
    var nOps = lvl === 2 ? 5 : r.int(6, 7), vals;
    for (;;) {
      x = r.int(3, 30); v = x; ops = []; vals = [x];
      for (i = 0; i < nOps; i++) {
        var choices = ['+', '−', '×'];
        if (v % 2 === 0 || v % 3 === 0 || v % 5 === 0) choices.push(':', ':');
        var t = r.pick(choices), op;
        if (t === '+') op = { t: t, a: r.int(2, 25) };
        else if (t === '−') op = { t: t, a: r.int(2, Math.max(2, Math.min(25, v - 1))) };
        else if (t === '×') op = { t: t, a: r.int(2, v > 60 ? 2 : 5) };
        else { var ds = [2, 3, 4, 5, 6].filter(function (d) { return v % d === 0; }); op = { t: t, a: r.pick(ds) }; }
        var INV = { '+': '−', '−': '+', '×': ':', ':': '×' };
        if (i > 0 && (ops[i - 1].t === op.t || (INV[ops[i - 1].t] === op.t && ops[i - 1].a === op.a))) { i--; continue; }
        v = opApply(op, v); if (v <= 0) break;
        ops.push(op); vals.push(v);
      }
      if (ops.length === nOps && v > 0 && v < 1000 && ops.some(function (o) { return o.t === ':'; }) && ops.some(function (o) { return o.t === '×'; })) break;
    }
    res = v;
    var trace = vals.join(' → ');
    if (lvl === 2) {
      var chain2 = x + ' → ' + ops.map(opStr).join(' → ') + ' → ?';
      var skip = []; ops.forEach(function (_, s) { var w = x; ops.forEach(function (op, j) { if (j !== s) w = opApply(op, w); }); skip.push(w); });
      return Q('Дана бір сан ойлап, онымен мына амалдарды кезекпен орындады. Қандай нәтиже шықты?' + expr(chain2), 'Дана задумала число и выполнила с ним по порядку эти действия. Какой получился результат?' + expr(chain2),
        res, ints(skip.concat([res + ops[nOps - 1].a]), res).filter(function (q) { return q > 0; }), 'Кезекпен орындаймыз: ' + trace + '.', 'Выполняем по порядку: ' + trace + '.');
    }
    var chain3 = 'x → ' + ops.map(opStr).join(' → ') + ' → ' + res;
    var wr = [];   // «забыл шаг»: обратный ход без одного действия
    ops.forEach(function (_, s) { var w = res; for (var j = nOps - 1; j >= 0; j--) if (j !== s) w = opInv(ops[j], w); wr.push(w); });
    var fwd = res; ops.forEach(function (op) { fwd = opApply(op, fwd); });   // применил действия, а не обратные
    wr.push(fwd);
    var back = [res]; for (i = nOps - 1; i >= 0; i--) back.push(opInv(ops[i], back[back.length - 1]));
    return Q('Дана бір сан ойлап (x), онымен мына амалдарды кезекпен орындады да, ' + res + ' санын алды. Ол қандай сан ойлады?' + expr(chain3), 'Дана задумала число (x), выполнила с ним по порядку эти действия и получила ' + res + '. Какое число она задумала?' + expr(chain3),
      x, ints(wr, x).filter(function (q) { return q > 0; }), 'Соңынан бастап кері амалдарды орындаймыз (+ орнына −, × орнына :): ' + back.join(' → ') + '. Тексеру: ' + trace + '.',
      'Идём с конца, выполняя обратные действия (вместо + вычитаем, вместо × делим): ' + back.join(' → ') + '. Проверка: ' + trace + '.');
  });

  /* ================= 21. Треугольники с правилом (l_op) ================= */
  var TRI = [   // a — верхняя вершина, b — левая, c — правая
    { f: function (a, b, c) { return a * b * c - (a + b + c); }, s: 'a · b · c − (a + b + c)', l: 3 },
    { f: function (a, b, c) { return (b + c) * a; }, s: '(b + c) · a', l: 2 },
    { f: function (a, b, c) { return b * c - a; }, s: 'b · c − a', l: 2 },
    { f: function (a, b, c) { return a * b + c; }, s: 'a · b + c', l: 2 },
    { f: function (a, b, c) { return (a + b + c) * a; }, s: '(a + b + c) · a', l: 3 },
    { f: function (a, b, c) { return a * a - b - c; }, s: 'a · a − b − c', l: 3 },
    { f: function (a, b, c) { return (a - b) * c; }, s: '(a − b) · c', l: 3 },
    { f: function (a, b, c) { return a * b * c; }, s: 'a · b · c', l: 1 },
    { f: function (a, b, c) { return a + b + c; }, s: 'a + b + c', l: 1 },
    { f: function (a, b, c) { return (a + b) * c; }, s: '(a + b) · c', l: 2 },
    { f: function (a, b, c) { return a * c - b; }, s: 'a · c − b', l: 2 }
  ];
  add('l_op', 'bil.triangle_op', [2, 3], function (r, lvl) {
    var R, ex, ok;
    for (;;) {
      R = r.pick(TRI.filter(function (t) { return lvl === 2 ? t.l === 2 : t.l === 3; }));
      ex = [0, 1, 2].map(function () { return [r.int(2, 9), r.int(1, 8), r.int(1, 8)]; });
      ok = ex.every(function (e) { var v = R.f(e[0], e[1], e[2]); return v > 0 && v < 1000 && new Set(e).size === 3; }) &&
        new Set(ex.map(function (e) { return e[0]; })).size === 3 && R.f.apply(null, ex[0]) !== R.f.apply(null, ex[1]);
      if (!ok) continue;
      // правило должно однозначно восстанавливаться по двум примерам
      var rivals = TRI.filter(function (t) { return t !== R && t.f.apply(null, ex[0]) === R.f.apply(null, ex[0]) && t.f.apply(null, ex[1]) === R.f.apply(null, ex[1]); });
      if (!rivals.length) break;
    }
    var ans = R.f.apply(null, ex[2]);
    function tri(x0, e, center) {
      return poly([[x0 + 60, 8], [x0 + 6, 104], [x0 + 114, 104]], 'bg') + txt(x0 + 60, 36, e[0], 'middle', 'big') + txt(x0 + 28, 96, e[1], 'middle', 'big') + txt(x0 + 92, 96, e[2], 'middle', 'big') +
        '<circle cx="' + (x0 + 60) + '" cy="70" r="15" class="vz0"/>' + txt(x0 + 60, 76, center, 'middle', 'big');
    }
    var picture = pic(392, 112, tri(4, ex[0], R.f.apply(null, ex[0])) + tri(136, ex[1], R.f.apply(null, ex[1])) + tri(268, ex[2], '?'));
    var others = TRI.filter(function (t) { return t !== R; }).map(function (t) { return t.f.apply(null, ex[2]); });
    var chk = function (e) { return R.s.replace(/[abc]/g, function (ch) { return e['abc'.indexOf(ch)]; }) + ' = ' + R.f.apply(null, e); };
    return P('Үшбұрыштардағы сандар бір ережеге бағынады: ортадағы сан төбелердегі үш саннан бірдей тәсілмен шығады. «?» орнына қандай сан тұруы керек?', 'Числа в треугольниках подчиняются одному правилу: число в центре получается из трёх чисел в вершинах одним и тем же способом. Какое число должно стоять вместо «?»?', picture,
      ans, ints(others.concat([ans + 1, ans - 1]), ans).filter(function (v) { return v > 0; }),
      'Жоғарғы санды a, сол жақтағыны b, оң жақтағыны c деп белгілейік. Ереже: ' + R.s + '. Тексеру: ' + chk(ex[0]) + '; ' + chk(ex[1]) + '. Үшінші үшбұрыш: ' + chk(ex[2]) + '.',
      'Обозначим верхнее число a, левое b, правое c. Правило: ' + R.s + '. Проверка: ' + chk(ex[0]) + '; ' + chk(ex[1]) + '. Третий треугольник: ' + chk(ex[2]) + '.');
  });

  /* ================= 22. Таблица с правилом (l_fig) ================= */
  var TOPS = [
    { s: '× 2', f: function (v) { return v * 2; } }, { s: '× 3', f: function (v) { return v * 3; } }, { s: '× 4', f: function (v) { return v * 4; } }, { s: '× 5', f: function (v) { return v * 5; } },
    { s: ': 2', f: function (v) { return v % 2 ? NaN : v / 2; } }, { s: ': 3', f: function (v) { return v % 3 ? NaN : v / 3; } }, { s: ': 5', f: function (v) { return v % 5 ? NaN : v / 5; } },
    { s: '× 2 + 1', f: function (v) { return v * 2 + 1; } }, { s: '+ 7', f: function (v) { return v + 7; } }, { s: '− 4', f: function (v) { return v - 4; } }
  ];
  add('l_fig', 'bil.table_rule', [2, 3], function (r, lvl) {
    var ops, T, i, j;
    for (;;) {
      ops = [0, 1, 2].map(function () { return r.pick(lvl === 2 ? TOPS.slice(0, 7) : TOPS); });
      if (!ops.some(function (o) { return o.s.charAt(0) === ':'; })) continue;
      var base = r.shuffle([2, 3, 4, 5, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24, 30]).slice(0, 4);
      T = base.map(function (b) { var row = [b]; ops.forEach(function (o) { row.push(o.f(row[row.length - 1])); }); return row; });
      if (T.every(function (row) { return row.every(function (v) { return v > 0 && v % 1 === 0 && v < 1000; }); })) break;
    }
    var ra = r.int(0, 3), rb, ca = r.int(lvl === 3 ? 0 : 1, 3), cb;
    do { rb = r.int(0, 3); } while (rb === ra);
    do { cb = r.int(1, 3); } while (cb === ca);
    var A = T[ra][ca], B = T[rb][cb], ans = B - A, trans = lvl === 3 && r.chance(0.5);
    function cell(i2, j2) { return i2 === ra && j2 === ca ? '<b>A</b>' : i2 === rb && j2 === cb ? '<b>B</b>' : T[i2][j2]; }
    var html = '<table class="tbl" style="width:auto;font:600 17px var(--sans)">';
    for (i = 0; i < 4; i++) { html += '<tr>'; for (j = 0; j < 4; j++) html += '<td style="padding:6px 12px;text-align:center;border:1.5px solid currentColor">' + (trans ? cell(j, i) : cell(i, j)) + '</td>'; html += '</tr>'; }
    html += '</table>';
    var dirK = trans ? 'жолдан жолға (жоғарыдан төмен)' : 'бағаннан бағанға (солдан оңға)', dirR = trans ? 'от строки к строке (сверху вниз)' : 'от столбца к столбцу (слева направо)';
    var rule = ops.map(function (o) { return o.s; }).join(', ');
    return Q('Кестедегі сандар бір ережемен құрылған. B − A мәнін анықтаңыз.' + figs([html]), 'Числа в таблице подчиняются одному правилу. Определите значение B − A.' + figs([html]),
      ans, ints([A - B, A + B, ans + 2, ans - 2, B, -A], ans),
      'Әр ' + (trans ? 'бағанда' : 'жолда') + ' ' + dirK + ' амалдар: ' + rule + '. Сонда A = ' + A + ', B = ' + B + '. B − A = ' + B + ' − ' + A + ' = ' + signed(ans) + '.',
      'В каждой ' + (trans ? 'колонке' : 'строке') + ' ' + dirR + ' действия: ' + rule + '. Значит, A = ' + A + ', B = ' + B + '. B − A = ' + signed(ans) + '.');
  });

  /* ================= 23. Лишний квадрат в развёртке (l_visual) ================= */
  // Сворачивание «перекатыванием»: каждая клетка получает грань куба; развёртка верна, если 6 клеток связны и грани разные.
  function foldOk(cells) {
    var key = function (c) { return c[0] + ',' + c[1]; }, at = {}, seen = {}, used = {}, q, o, n = 0;
    cells.forEach(function (c) { at[key(c)] = 1; });
    q = [[cells[0], { b: 'b', t: 't', n: 'n', s: 's', e: 'e', w: 'w' }]]; seen[key(cells[0])] = 1;
    while (q.length) {
      var it = q.shift(), c = it[0]; o = it[1]; n++;
      if (used[o.b]) return false;
      used[o.b] = 1;
      [[1, 0, 'e'], [-1, 0, 'w'], [0, -1, 'n'], [0, 1, 's']].forEach(function (m) {
        var nc = [c[0] + m[0], c[1] + m[1]], k = key(nc);
        if (!at[k] || seen[k]) return;
        seen[k] = 1;
        var d = m[2], no;
        if (d === 'e') no = { b: o.e, e: o.t, t: o.w, w: o.b, n: o.n, s: o.s };
        else if (d === 'w') no = { b: o.w, w: o.t, t: o.e, e: o.b, n: o.n, s: o.s };
        else if (d === 'n') no = { b: o.n, n: o.t, t: o.s, s: o.b, e: o.e, w: o.w };
        else no = { b: o.s, s: o.t, t: o.n, n: o.b, e: o.e, w: o.w };
        q.push([nc, no]);
      });
    }
    return n === cells.length && cells.length === 6;
  }
  function connected(cells) {
    var at = {}, seen = {}, st = [cells[0]], n = 0;
    cells.forEach(function (c) { at[c[0] + ',' + c[1]] = 1; });
    seen[cells[0][0] + ',' + cells[0][1]] = 1;
    while (st.length) { var c = st.pop(); n++; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (m) { var k = (c[0] + m[0]) + ',' + (c[1] + m[1]); if (at[k] && !seen[k]) { seen[k] = 1; st.push([c[0] + m[0], c[1] + m[1]]); } }); }
    return n === cells.length;
  }
  function normCells(cells) {
    var mx = Math.min.apply(null, cells.map(function (c) { return c[0]; })), my = Math.min.apply(null, cells.map(function (c) { return c[1]; }));
    return cells.map(function (c) { return [c[0] - mx, c[1] - my]; }).sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; });
  }
  var CUBE_NETS = (function () {   // все 11 развёрток: перебор гексамино
    var shapes = { '0,0': [[0, 0]] }, lvl = [[[0, 0]]], n;
    for (n = 1; n < 6; n++) {
      var next = {};
      lvl.forEach(function (s) {
        s.forEach(function (c) {
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (m) {
            var nc = [c[0] + m[0], c[1] + m[1]];
            if (s.some(function (x) { return x[0] === nc[0] && x[1] === nc[1]; })) return;
            var ns = normCells(s.concat([nc])), k = JSON.stringify(ns);
            if (!next[k]) next[k] = ns;
          });
        });
      });
      lvl = Object.keys(next).map(function (k) { return next[k]; });
    }
    var free = {}, out = [];
    lvl.forEach(function (s) {
      var forms = [], cur = s;
      for (var i = 0; i < 4; i++) { cur = normCells(cur.map(function (c) { return [-c[1], c[0]]; })); forms.push(JSON.stringify(cur)); forms.push(JSON.stringify(normCells(cur.map(function (c) { return [-c[0], c[1]]; })))); }
      forms.sort();
      if (free[forms[0]]) return;
      free[forms[0]] = 1;
      if (foldOk(s)) out.push(s);
    });
    return out;
  })();
  if (CUBE_NETS.length !== 11) throw new Error('cube nets: ' + CUBE_NETS.length);
  add('l_visual', 'bil.net_remove', [2, 3, 4], function (r, lvl) {
    var cells, valid, invalid, t;
    for (t = 0; t < 500; t++) {
      var net = r.pick(CUBE_NETS), rot = r.int(0, 3), flip = r.chance(0.5);
      cells = net.map(function (c) { var x = c[0], y = c[1], k; for (k = 0; k < rot; k++) { var tx = x; x = -y; y = tx; } return [flip ? -x : x, y]; });
      var adj = [];
      cells.forEach(function (c) { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (m) { var nc = [c[0] + m[0], c[1] + m[1]]; if (!cells.some(function (x) { return x[0] === nc[0] && x[1] === nc[1]; }) && !adj.some(function (x) { return x[0] === nc[0] && x[1] === nc[1]; })) adj.push(nc); }); });
      cells = normCells(cells.concat([r.pick(adj)]));
      var mxX = Math.max.apply(null, cells.map(function (c) { return c[0]; })), mxY = Math.max.apply(null, cells.map(function (c) { return c[1]; }));
      if (mxX > 4 || mxY > 4) continue;
      valid = []; invalid = []; var overlap = [];
      cells.forEach(function (c, i) { var rest = cells.filter(function (_, j) { return j !== i; }), cn = connected(rest); (cn && foldOk(rest) ? valid : invalid).push(i); if (cn && !foldOk(rest)) overlap.push(i); });
      // L3–L4: среди неверных есть «коварные» — фигура цела, но две грани совпадают (не только «распадается»)
      var needOv = lvl === 2 ? 0 : lvl === 3 ? 1 : 2;
      if (invalid.length >= 3 && valid.length >= 1 && (lvl === 2 || valid.length <= 2) && overlap.length >= needOv) break;
    }
    var ovPick = r.shuffle(overlap).slice(0, lvl === 2 ? 0 : lvl === 3 ? 1 : 2);
    var right = r.pick(valid), wrongs = ovPick.concat(r.shuffle(invalid.filter(function (i) { return ovPick.indexOf(i) < 0; }))).slice(0, 3), labs = r.shuffle([right].concat(wrongs)), L = 'ABCD', lab = {};
    labs.forEach(function (ci, k) { lab[ci] = L[k]; });
    var u = 38, out = '', W = 0, Hh = 0;
    cells.forEach(function (c, i) { out += rect(6 + c[0] * u, 6 + c[1] * u, u, u, 'face') + (lab[i] ? txt(6 + c[0] * u + u / 2, 6 + c[1] * u + u / 2 + 6, lab[i], 'middle', 'big') : ''); W = Math.max(W, c[0] + 1); Hh = Math.max(Hh, c[1] + 1); });
    var ans = lab[right], whyK = [], whyR = [];
    wrongs.forEach(function (ci) {
      var rest = cells.filter(function (_, j) { return j !== ci; }), conn = connected(rest);
      whyK.push(lab[ci] + ' — ' + (conn ? 'екі шаршы кубтың бір жағына түседі' : 'фигура екіге бөлініп қалады'));
      whyR.push(lab[ci] + ' — ' + (conn ? 'два квадрата попадают на одну грань куба' : 'фигура распадается на части'));
    });
    return P('Текше (куб) жасау үшін әріптер жазылған шаршылардың қайсысын алып тастау керек?', 'Квадрат с какой буквой нужно убрать, чтобы из оставшихся сложить куб?', pic(W * u + 12, Hh * u + 12, out),
      ans, labs.filter(function (ci) { return ci !== right; }).map(function (ci) { return lab[ci]; }),
      'Шаршы 7, ал кубтың жағы 6 — біреуін алып тастаймыз. ' + ans + ' алынса, қалған 6 шаршы кубқа бүктеледі (жақтар қайталанбайды). Басқалары жарамайды: ' + whyK.join('; ') + '.',
      'Квадратов 7, а граней у куба 6 — один лишний. Без ' + ans + ' оставшиеся 6 квадратов складываются в куб (грани не повторяются). Остальные не подходят: ' + whyR.join('; ') + '.');
  });

  /* ================= 24. Вид сверху (l_visual) ================= */
  add('l_visual', 'bil.top_view', [2, 3, 4], function (r, lvl) {
    var C = lvl === 4 ? 4 : 3, D = lvl === 2 ? 2 : 3, hmax = lvl === 2 ? 2 : 3, h, c, d, z, t;
    for (t = 0; t < 500; t++) {
      h = []; for (c = 0; c < C; c++) h.push([]);
      for (d = D - 1; d >= 0; d--) for (c = 0; c < C; c++) {
        // ближний ряд не выше дальнего в том же столбце — тогда видна верхняя грань каждой башни
        var lim = d < D - 1 ? h[c][d + 1] : hmax;
        h[c][d] = r.int(0, lim);
      }
      var rowLen = [], cells0 = 0, cols0 = 0, rowsS = {};
      for (d = 0; d < D; d++) { var L0 = 0, key0 = ''; for (c = 0; c < C; c++) { if (h[c][d]) L0++; key0 += h[c][d] ? 1 : 0; } rowLen.push(L0); cells0 += L0; rowsS[key0] = 1; }
      for (c = 0; c < C; c++) if (h[c].some(function (v) { return v > 0; })) cols0++;
      // вид сверху не должен быть тривиальным: передний ряд не пуст, занято ≥ 2 столбцов и ≥ 4 клеток (L2: ≥ 3), ряды разные
      if (rowLen[0] > 0 && cols0 >= 2 && cells0 >= (lvl === 2 ? 3 : 4) && cells0 < C * D && Object.keys(rowsS).length === D) break;
    }
    // косоугольная проекция (как в gen_visual.js): ближе — левее и ниже
    var s = 24, k = 12, ox = 6, oy = hmax * s + D * k + 6, out = '';
    for (d = D - 1; d >= 0; d--) for (c = 0; c < C; c++) { var fx0 = ox + c * s + d * k, fy0 = oy - d * k; out += poly([[fx0, fy0], [fx0 + k, fy0 - k], [fx0 + s + k, fy0 - k], [fx0 + s, fy0]], 'vfl'); }
    for (d = D - 1; d >= 0; d--) for (c = 0; c < C; c++) for (z = 0; z < h[c][d]; z++) {
      var X = ox + c * s + d * k, Y = oy - z * s - d * k;
      out += rect(X, Y - s, s, s, 'vcf') + poly([[X, Y - s], [X + k, Y - s - k], [X + s + k, Y - s - k], [X + s, Y - s]], 'vct') + poly([[X + s, Y], [X + s, Y - s], [X + s + k, Y - s - k], [X + s + k, Y - k]], 'vcr');
    }
    var picture = pic(ox + C * s + D * k + 6, oy + 6, out);
    // силуэты: массив строк сверху вниз
    var top = []; for (d = D - 1; d >= 0; d--) { var row = []; for (c = 0; c < C; c++) row.push(h[c][d] ? 1 : 0); top.push(row); }
    var front = []; for (z = hmax - 1; z >= 0; z--) { var fr = []; for (c = 0; c < C; c++) fr.push(Math.max.apply(null, h[c]) > z ? 1 : 0); front.push(fr); }
    var side = []; for (z = hmax - 1; z >= 0; z--) { var sr = []; for (d = 0; d < D; d++) sr.push(Math.max.apply(null, h.map(function (col) { return col[d]; })) > z ? 1 : 0); side.push(sr); }
    var mirror = top.map(function (row) { return row.slice().reverse(); }), flipUD = top.slice().reverse();
    var tog = top.map(function (row) { return row.slice(); }), ti = r.int(0, D - 1), tj = r.int(0, C - 1); tog[ti][tj] = 1 - tog[ti][tj];
    var maxW = Math.max(C, D), maxH = Math.max(D, hmax), u = 15;
    function gp(g) {
      var o = '', gh = g.length, gw = g[0].length, x0 = 4 + (maxW - gw) * u / 2, y0 = 4 + (maxH - gh) * u / 2;
      g.forEach(function (row, i) { row.forEach(function (v, j) { o += rect(x0 + j * u, y0 + i * u, u, u, v ? 'vz1' : 'vcell'); }); });
      return osv(maxW * u + 8, maxH * u + 8, o);
    }
    var key = function (g) { return g.length + 'x' + g[0].length + ':' + g.map(function (row) { return row.join(''); }).join('/'); };
    var wrong = uniq(top, r.shuffle([front, mirror]).concat([side, flipUD, tog]), key, 3);
    return P('Суретте бірдей кубиктерден құрастырылған құрылыс көрсетілген. Оған жоғарыдан (үстінен) қарағанда қалай көрінеді? Жауаптарда құрылыстың бізге жақын (алдыңғы) жағы — төменде.', 'На рисунке постройка из одинаковых кубиков. Как она выглядит сверху? В ответах ближняя к нам (передняя) сторона постройки — внизу.', picture,
      gp(top), wrong.map(gp), 'Үстінен қарағанда кубиктер тұрған әр орын бір шаршы болып көрінеді, биіктігі маңызды емес. Алдыңғы қатардан артқы қатарға қарай: ' + top.slice().reverse().map(function (row) { return row.map(function (v) { return v ? '■' : '□'; }).join(''); }).join(' | ') + ' (■ — кубик бар, □ — бос). Алдынан көрініс пен айнадағы бейнені шатастырмаңыз.',
      'Сверху каждое место, где стоят кубики, видно как один квадрат; высота не важна. От переднего ряда к заднему: ' + top.slice().reverse().map(function (row) { return row.map(function (v) { return v ? '■' : '□'; }).join(''); }).join(' | ') + ' (■ — есть кубик, □ — пусто). Не путайте с видом спереди и зеркальным отражением.');
  });

  // Поиск формата по id (для пробных тестов): { topic, format } или null.
  Z.findFormat = function (id) {
    for (var t in F) for (var i = 0; i < F[t].length; i++) if (F[t][i].id === id) return { topic: t, format: F[t][i] };
    return null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
