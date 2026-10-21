/* Зерде — задачи с рисунками (SVG рисуется кодом, числа каждый раз новые).
 *
 * На настоящих экзаменах много задач «по рисунку»: закрашенная фигура, углы на чертеже,
 * круговая диаграмма, столбчатая диаграмма, мензурка, координатная прямая, развёртка куба.
 * Здесь они добавляются как ещё один формат к существующим темам (Z.formats), поэтому
 * попадают и в домашку, и в пробные тесты.
 *
 * Подписи на рисунке — только числа и буквы, поэтому один и тот же рисунок подходит
 * для казахского и русского текста (в двуязычном режиме он показывается один раз). */
(function (root) {
  'use strict';
  var Z = root.Z;
  var U = Z.util, fmt = U.fmt, fr = U.fr;
  var H = Z.genHelpers, Q = H.Q, unit = H.unit;
  var F = Z.formats;

  function svg(w, h, inner) {
    return '<div class="figs"><svg class="svgfig" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="сызба">' + inner + '</svg></div>';
  }
  function txt(x, y, s, anchor, cls) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + s + '</text>';
  }
  function line(x1, y1, x2, y2, cls) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (cls ? ' class="' + cls + '"' : '') + '/>'; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function rad(d) { return d * Math.PI / 180; }
  // Одинаковый рисунок в конце обоих текстов: kk + pic, ru + pic.
  function P(kk, ru, pic, ans, wrong, sk, sr, extra) { return Q(kk + pic, ru + pic, ans, wrong, sk, sr, extra); }

  /* ---------- Закрашенные фигуры (периметр и аудан) ---------- */
  F.m_geom.push(
    { lv: [2, 3], f: function (r, lvl, opt) {   // квадрат и вписанный круг / кольцо (как №6 образца НИШ)
      var pi = opt.int ? 3 : 3.14, piTxt = opt.int ? 'π ≈ 3' : 'π ≈ 3,14';
      if (lvl === 2 || r.chance(0.5)) {
        var a = r.pick([4, 6, 8, 10, 12, 20]), S = r1(a * a - pi * a * a / 4), s = 160 / a;
        var pic = svg(220, 200, '<rect x="30" y="20" width="160" height="160" class="sh"/><circle cx="110" cy="100" r="80" class="bg"/>' +
          line(30, 188, 190, 188, 'dim') + txt(110, 198, a + ' см'));
        return P('Суретте қабырғасы ' + a + ' см шаршы және оған іштей сызылған дөңгелек берілген. Боялған бөліктің ауданын табыңыз (' + piTxt + ').',
          'На рисунке квадрат со стороной ' + a + ' см и вписанный в него круг. Найдите площадь закрашенной части (' + piTxt + ').', pic,
          S, [r1(pi * a * a / 4), a * a, r1(a * a / 2)], 'Шаршы ' + a + '² = ' + a * a + ' см², дөңгелектің радиусы ' + a / 2 + ': ' + fmt(pi) + ' · ' + fmt(a / 2) + '² = ' + fmt(r1(pi * a * a / 4)) + '. Айырма: ' + fmt(S) + ' см².',
          'Квадрат ' + a * a + ' см², радиус круга ' + a / 2 + ', круг ' + fmt(r1(pi * a * a / 4)) + ' см². Разность: ' + fmt(S) + ' см².', { unit: unit('см²') });
      }
      var D = r.pick([10, 12, 14, 20]), d = D - 2 * r.int(1, D / 2 - 2), R = D / 2, rr = d / 2, S2 = r1(pi * (R * R - rr * rr));
      var k = 80 / R;
      var pic2 = svg(220, 210, '<circle cx="110" cy="95" r="80" class="sh"/><circle cx="110" cy="95" r="' + r1(rr * k) + '" class="bg"/>' +
        line(30, 190, 190, 190, 'dim') + txt(110, 205, 'D = ' + D + ' см') + line(110 - rr * k, 95, 110 + rr * k, 95, 'dim') + txt(110, 90, 'd = ' + d + ' см'));
      return P('Үлкен дөңгелектің диаметрі ' + D + ' см, кіші дөңгелектің диаметрі ' + d + ' см. Боялған сақинаның ауданын табыңыз (' + piTxt + ').',
        'Диаметр большого круга ' + D + ' см, малого — ' + d + ' см. Найдите площадь закрашенного кольца (' + piTxt + ').', pic2,
        S2, [r1(pi * (D * D - d * d)), r1(pi * (R - rr) * (R - rr)), r1(pi * R * R)], 'Радиустар: ' + R + ' және ' + rr + '. S = π(R² − r²) = ' + fmt(pi) + ' · (' + R * R + ' − ' + rr * rr + ') = ' + fmt(S2) + ' см². Диаметрді радиуспен шатастырмаңыз.',
        'Радиусы ' + R + ' и ' + rr + '. S = π(R² − r²) = ' + fmt(S2) + ' см². Не путайте диаметр с радиусом.', { unit: unit('см²') });
    } },
    { lv: [1, 2, 3], f: function (r, lvl) {   // L-фигура: периметр — ловушка (равен периметру прямоугольника)
      var W = r.int(8, 16), Hh = r.int(6, 12), w = r.int(2, W - 4), h = r.int(2, Hh - 3), askP = lvl !== 2;
      var k = Math.min(180 / W, 140 / Hh), x0 = 20, y0 = 20, X = W * k, Y = Hh * k, cw = w * k, ch = h * k;
      var pts = [[x0, y0], [x0 + X - cw, y0], [x0 + X - cw, y0 + ch], [x0 + X, y0 + ch], [x0 + X, y0 + Y], [x0, y0 + Y]];
      var pic = svg(240, 200, '<polygon points="' + pts.map(function (p) { return r1(p[0]) + ',' + r1(p[1]); }).join(' ') + '" class="sh2"/>' +
        txt(x0 + X / 2, y0 + Y + 18, W + ' см') + txt(x0 - 6, y0 + Y / 2 + 4, Hh + ' см', 'end') +
        txt(r1(x0 + X - cw / 2), y0 + ch + 16, w + ' см') + txt(r1(x0 + X - cw + 6), r1(y0 + ch / 2 + 4), h + ' см', 'start'));
      var P1 = 2 * (W + Hh), S = W * Hh - w * h;
      if (askP) return P('Фигураның периметрін табыңыз (барлық бұрыштары тік).', 'Найдите периметр фигуры (все углы прямые).', pic,
        P1, [P1 - 2 * w, P1 - w - h, S], 'Ойығы бар жақтарды «жылжытсақ», фигура ' + W + ' × ' + Hh + ' тіктөртбұрышқа айналады — периметр өзгермейді: 2 · (' + W + ' + ' + Hh + ') = ' + P1 + ' см.',
        'Если «выпрямить» вырез, получится прямоугольник ' + W + ' × ' + Hh + ' с тем же периметром: ' + P1 + ' см.', { unit: unit('см') });
      return P('Фигураның ауданын табыңыз (барлық бұрыштары тік).', 'Найдите площадь фигуры (все углы прямые).', pic,
        S, [W * Hh, S - w * h, P1], 'Үлкен тіктөртбұрыштан кесілген бөлікті алып тастаймыз: ' + W + ' · ' + Hh + ' − ' + w + ' · ' + h + ' = ' + S + ' см².',
        'Из большого прямоугольника вычитаем вырез: ' + W * Hh + ' − ' + w * h + ' = ' + S + ' см².', { unit: unit('см²') });
    } }
  );

  /* ---------- Бұрыштар сызбада ---------- */
  function ray(cx, cy, deg, len) { return [r1(cx + len * Math.cos(rad(deg))), r1(cy - len * Math.sin(rad(deg)))]; }
  F.m_angles.push(
    { lv: [1, 2], f: function (r) {   // жазыңқы бұрыш, сәулелер
      var a = r.int(25, 70), b = r.int(25, 70), x = 180 - a - b, cx = 120, cy = 120;
      var p1 = ray(cx, cy, a, 95), p2 = ray(cx, cy, a + x, 95);
      var m1 = ray(cx, cy, a / 2, 48), mx = ray(cx, cy, a + x / 2, 48), m2 = ray(cx, cy, a + x + b / 2, 48);
      var pic = svg(240, 140, line(15, cy, 225, cy) + line(cx, cy, p1[0], p1[1]) + line(cx, cy, p2[0], p2[1]) +
        txt(m1[0], m1[1], a + '°') + txt(mx[0], mx[1], 'x') + txt(m2[0], m2[1], b + '°') + txt(cx, cy + 16, 'O'));
      return P('Суреттегі x бұрышын табыңыз.', 'Найдите угол x на рисунке.', pic, x, [180 - a, a + b, 90],
        'Үш бұрыш бірге жазыңқы бұрыш құрайды: x = 180° − ' + a + '° − ' + b + '° = ' + x + '°.', 'Три угла вместе дают развёрнутый: x = 180° − ' + a + '° − ' + b + '° = ' + x + '°.', { unit: unit('°') });
    } },
    { lv: [2, 3], f: function (r) {   // сыртқы бұрыш при вершине B
      var A = r.int(35, 70), Cg = r.int(35, 70), Bi = 180 - A - Cg, ext = A + Cg;
      var ax = 30, ay = 140, bx = 170, AC = (bx - ax) * Math.sin(rad(Bi)) / Math.sin(rad(Cg));
      var cx = ax + AC * Math.cos(rad(A)), cy = ay - AC * Math.sin(rad(A));
      if (ay - cy > 120) { var k = 120 / (ay - cy); cx = ax + (cx - ax) * k; cy = ay - 120; bx = ax + (bx - ax) * k; }
      cx = r1(cx); cy = r1(cy); bx = r1(bx);
      var pic = svg(250, 162, '<polygon points="' + ax + ',' + ay + ' ' + bx + ',' + ay + ' ' + cx + ',' + cy + '" class="tri"/>' + line(bx, ay, bx + 60, ay) +
        txt(ax - 8, ay + 14, 'A') + txt(bx, ay + 16, 'B') + txt(cx, cy - 6, 'C') +
        txt(ax + 30, ay - 7, A + '°') + txt(r1(cx + (bx - cx) * 0.12 - (cx - ax) * 0.1 + 4), r1(cy + 30), Cg + '°') + txt(bx + 30, ay - 8, 'x'));
      return P('Суреттегі ABC үшбұрышында ∠A = ' + A + '°, ∠C = ' + Cg + '°. B төбесіндегі сыртқы x бұрышын табыңыз.', 'В треугольнике ABC на рисунке ∠A = ' + A + '°, ∠C = ' + Cg + '°. Найдите внешний угол x при вершине B.', pic,
        ext, [Bi, 180 - A, 180 - Cg], 'Сыртқы бұрыш өзіне сыбайлас емес екі ішкі бұрыштың қосындысына тең: x = ' + A + '° + ' + Cg + '° = ' + ext + '°. (∠B = ' + Bi + '° — ішкі бұрыш, оны сұрамайды.)',
        'Внешний угол равен сумме двух внутренних, не смежных с ним: x = ' + A + '° + ' + Cg + '° = ' + ext + '°.', { unit: unit('°') });
    } },
    { lv: [2, 3], f: function (r, lvl) {   // екі түзудің қиылысуы: x = вертикаль немесе сыбайлас
      var a = r.int(35, 80), cx = 120, cy = 80, vert = lvl === 2 ? r.chance(0.5) : false;
      var p = ray(cx, cy, 0, 100), q = ray(cx, cy, 180, 100), s = ray(cx, cy, a, 90), t = ray(cx, cy, a + 180, 90);
      var lblA = ray(cx, cy, a / 2, 40), lblX = vert ? ray(cx, cy, 180 + a / 2, 40) : ray(cx, cy, (a + 180) / 2, 40);
      var y = lvl === 3 ? r.int(10, 30) : 0;
      var pic = svg(240, 160, line(p[0], p[1], q[0], q[1]) + line(s[0], s[1], t[0], t[1]) + txt(lblA[0], lblA[1], a + '°') + txt(lblX[0], lblX[1], y ? 'x + ' + y + '°' : 'x'));
      var ans = (vert ? a : 180 - a) - y;
      return P('Екі түзу қиылысқан. Суреттегі x-ті табыңыз.', 'Две прямые пересекаются. Найдите x по рисунку.', pic, ans, [vert ? 180 - a - y : a - y, ans + 2 * y || ans + 10, 90 - a > 0 ? 90 - a : a + 10],
        (vert ? 'Вертикаль бұрыштар тең' : 'Сыбайлас бұрыштардың қосындысы 180°') + ': ' + (y ? 'x + ' + y + '° = ' : 'x = ') + (vert ? a : 180 - a) + '°' + (y ? ', x = ' + ans + '°' : '') + '.',
        (vert ? 'Вертикальные углы равны' : 'Смежные углы в сумме 180°') + ': x = ' + ans + '°.', { unit: unit('°') });
    } }
  );

  /* ---------- Дөңгелек диаграмма (құрамы) — как №22 образца НИШ ---------- */
  var SETS = [
    { kk: 'Құрғақ сүттің құрамы', ru: 'Состав сухого молока', parts: [['май', 'жир'], ['ақуыз', 'белок'], ['қант', 'сахар'], ['су', 'вода']] },
    { kk: 'Топырақ құрамы', ru: 'Состав почвы', parts: [['құм', 'песок'], ['саз', 'глина'], ['қарашірік', 'перегной'], ['тас', 'камни']] },
    { kk: 'Қоспаның құрамы', ru: 'Состав смеси', parts: [['жаңғақ', 'орехи'], ['мейіз', 'изюм'], ['өрік', 'курага'], ['құрма', 'финики']] }
  ];
  function pie(parts, pcts) {
    var cx = 80, cy = 80, R = 70, a0 = -90, out = '', leg = '';
    var shades = ['p1', 'p2', 'p3', 'p4'];
    pcts.forEach(function (p, i) {
      var a1 = a0 + p * 3.6, large = p > 50 ? 1 : 0;
      var x0 = r1(cx + R * Math.cos(rad(a0))), y0 = r1(cy + R * Math.sin(rad(a0))), x1 = r1(cx + R * Math.cos(rad(a1))), y1 = r1(cy + R * Math.sin(rad(a1)));
      out += '<path d="M' + cx + ',' + cy + ' L' + x0 + ',' + y0 + ' A' + R + ',' + R + ' 0 ' + large + ' 1 ' + x1 + ',' + y1 + ' Z" class="' + shades[i] + '"/>';
      var m = a0 + p * 1.8, lx = r1(cx + R * 0.62 * Math.cos(rad(m))), ly = r1(cy + R * 0.62 * Math.sin(rad(m)) + 4);
      out += txt(lx, ly, p + '%', 'middle', 'onp');
      leg += '<rect x="176" y="' + (22 + i * 24) + '" width="12" height="12" class="' + shades[i] + '"/>' + txt(196, 33 + i * 24, parts[i], 'start');
      a0 = a1;
    });
    return { out: out, leg: leg };
  }
  F.m_percent.push({ lv: [2, 3], f: function (r, lvl) {
    var set = r.pick(SETS), p = [];
    for (;;) { p = [r.int(2, 6) * 5, r.int(2, 6) * 5, r.int(1, 4) * 5]; var last = 100 - p[0] - p[1] - p[2]; if (last >= 5) { p.push(last); break; } }
    var i = r.int(0, 3), j = (i + 1 + r.int(0, 2)) % 4, M = r.pick([1, 2, 5]), Mg = M * 1000;
    var pp = pie(set.parts.map(function (x) { return x[0] + ' (' + x[1] + ')'; }), p), picK = svg(350, 166, pp.out + pp.leg), picR = picK;
    if (lvl === 2) {
      var g = Mg * p[i] / 100;
      return Q(set.kk + ' диаграммада көрсетілген. ' + M + ' кг қоспада неше грамм ' + set.parts[i][0] + ' бар?' + picK,
        set.ru + ' показан на диаграмме. Сколько граммов составляет «' + set.parts[i][1] + '» в ' + M + ' кг?' + picR,
        g, [p[i], g / 10, Mg * p[j] / 100], M + ' кг = ' + Mg + ' г. ' + Mg + ' · ' + p[i] + '% = ' + g + ' г.', M + ' кг = ' + Mg + ' г, ' + p[i] + '% от них — ' + g + ' г.', { unit: unit('г') });
    }
    while (p[i] === p[j]) j = (j + 1) % 4;
    var g2 = Mg * Math.abs(p[i] - p[j]) / 100;
    return Q(set.kk + ' диаграммада көрсетілген. ' + M + ' кг қоспада ' + set.parts[i][0] + ' мен ' + set.parts[j][0] + ' массаларының айырмасы неше грамм?' + picK,
      set.ru + ' показан на диаграмме. На сколько граммов в ' + M + ' кг различаются массы компонентов «' + set.parts[i][1] + '» и «' + set.parts[j][1] + '»?' + picR,
      g2, [Math.abs(p[i] - p[j]), g2 * 2, Mg * (p[i] + p[j]) / 100], 'Айырма ' + Math.abs(p[i] - p[j]) + '%. ' + Mg + ' г · ' + Math.abs(p[i] - p[j]) + '% = ' + g2 + ' г.',
      'Разница ' + Math.abs(p[i] - p[j]) + '% от ' + Mg + ' г = ' + g2 + ' г.', { unit: unit('г') });
  } });

  /* ---------- Бағаналы диаграмма → арифметикалық орта ---------- */
  var DAYS = ['1', '2', '3', '4', '5'];
  function bars(vals, names, step) {
    var max = Math.max.apply(null, vals), top = Math.ceil(max / step) * step, h = 120, x0 = 40, y0 = 140, out = '';
    for (var v = 0; v <= top; v += step) { var y = r1(y0 - v / top * h); out += line(x0, y, 250, y, 'grid') + txt(x0 - 6, y + 4, v, 'end', 'ax'); }
    vals.forEach(function (v, i) { var bh = r1(v / top * h), x = x0 + 14 + i * 42; out += '<rect x="' + x + '" y="' + r1(y0 - bh) + '" width="26" height="' + bh + '" class="col"/>' + txt(x + 13, y0 + 16, names[i], 'middle', 'ax'); });
    return out;
  }
  F.m_avg = F.m_avg || [];
  F.m_avg.push({ lv: [1, 2, 3], f: function (r, lvl) {
    var step = r.pick([2, 5, 10]), vals = [], mean;
    for (;;) { vals = [0, 0, 0, 0, 0].map(function () { return r.int(1, 8) * step; }); var s = vals.reduce(function (a, b) { return a + b; }, 0); if (s % 5 === 0) { mean = s / 5; break; } }
    var picK = svg(260, 162, bars(vals, DAYS, step)), picR = picK, sum = mean * 5;
    if (lvl < 3) return Q('Диаграммада оқушының 5 күнде (1–5-күндер) шығарған есептерінің саны көрсетілген. Күніне орта есеппен неше есеп шығарды?' + picK,
      'На диаграмме — сколько задач ученик решал в каждый из 5 дней (дни 1–5). Сколько задач в среднем он решал в день?' + picR,
      mean, [Math.max.apply(null, vals) - Math.min.apply(null, vals), sum, (Math.max.apply(null, vals) + Math.min.apply(null, vals)) / 2],
      'Қосынды: ' + vals.join(' + ') + ' = ' + sum + '. Орта: ' + sum + ' : 5 = ' + mean + '.', 'Сумма ' + sum + ', среднее ' + sum + ' : 5 = ' + mean + '.');
    var target = mean + r.pick([1, 2, 3, 4]) * (step === 2 ? 1 : step / 5) , need = target * 6 - sum;
    if (need <= 0 || need % 1) { target = mean + step; need = target * 6 - sum; }
    return Q('Диаграммада оқушының 5 күнде шығарған есептерінің саны көрсетілген. Алты күндегі орташа мән ' + fmt(target) + ' болуы үшін 6-күні неше есеп шығаруы керек?' + picK,
      'На диаграмме — число задач за 5 дней. Сколько задач нужно решить в 6-й день, чтобы среднее за 6 дней стало ' + fmt(target) + '?' + picR,
      need, [target, need - (target - mean), target * 5 - sum + mean], '6 күннің қосындысы ' + fmt(target) + ' · 6 = ' + fmt(target * 6) + ' болуы керек. Қазір ' + sum + '. 6-күні: ' + fmt(need) + '.',
      'Сумма за 6 дней должна быть ' + fmt(target * 6) + ', сейчас ' + sum + ', значит в 6-й день ' + fmt(need) + '.');
  } });

  /* ---------- Өлшеуіш ыдыс — бөлшек (как №20 образца НИШ) ---------- */
  F.m_frac.push({ lv: [1, 2], f: function (r, lvl) {
    var step = r.pick([10, 20, 25, 50]), n = r.pick([6, 8, 10, 12]), cap = step * n, lvlN = r.int(2, n - 1), vol = step * lvlN;
    var x = 70, top = 14, h = 150, w = 70, out = '<rect x="' + x + '" y="' + r1(top + h - lvlN / n * h) + '" width="' + w + '" height="' + r1(lvlN / n * h) + '" class="water"/>' +
      '<path d="M' + x + ',' + top + ' L' + x + ',' + (top + h) + ' L' + (x + w) + ',' + (top + h) + ' L' + (x + w) + ',' + top + '" class="glass"/>';
    for (var i = 1; i <= n; i++) {
      var y = r1(top + h - i / n * h), lab = (i % 2 === 0 || n <= 6) ? i * step : '';
      out += line(x + w - 12, y, x + w, y) + (lab ? txt(x + w + 6, y + 4, lab, 'start', 'ax') : '');
    }
    out += txt(x + w + 6, top + h + 4, '0', 'start', 'ax') + txt(x - 6, top + 10, 'мл', 'end', 'ax');
    var pic = svg(220, 174, out);
    var ans = lvl === 1 ? U.frac(vol, cap) : U.frac(cap - vol, cap);
    return P(lvl === 1 ? 'Ыдыс суретте көрсетілгендей толтырылған. Ыдыс ең жоғарғы белгіге дейін толады. Ыдыстың қандай бөлігі толған?' : 'Ыдыс ең жоғарғы белгіге дейін толады. Ыдыстың қандай бөлігі әлі бос?',
      lvl === 1 ? 'Сосуд заполнен, как на рисунке; заполнить его можно до верхней отметки. Какая часть сосуда заполнена?' : 'Сосуд заполняется до верхней отметки. Какая часть сосуда ещё пустая?', pic,
      ans, [U.frac(vol, cap + step), lvl === 1 ? U.frac(cap - vol, cap) : U.frac(vol, cap), U.frac(lvlN, n + 1), U.frac(lvl === 1 ? vol + step : cap - vol + step, cap), U.frac(lvl === 1 ? vol - step : cap - vol - step, cap)].filter(function (f) { return f.n > 0 && f.n < f.d && !U.frac.eq(f, ans); }),
      'Ыдыста ' + vol + ' мл, сыйымдылығы ' + cap + ' мл. ' + (lvl === 1 ? vol : cap - vol) + '/' + cap + ' — қысқартамыз.', 'В сосуде ' + vol + ' мл из ' + cap + ' мл. Дробь ' + (lvl === 1 ? vol : cap - vol) + '/' + cap + ' сокращаем.');
  } });

  /* ---------- Координаталық түзу ---------- */
  F.m_neg.push({ lv: [1, 2, 3], f: function (r, lvl) {
    var step = lvl === 1 ? r.pick([1, 2, 5]) : r.pick([2, 3, 4, 5, 10]), N = 11, i0 = r.int(1, 4), i1 = i0 + r.int(3, 5), ix;
    do { ix = r.int(0, N - 1); } while (ix === i0 || ix === i1);
    var v0 = (r.int(-6, 2)) * step, v1 = v0 + (i1 - i0) * step, vx = v0 + (ix - i0) * step;
    var lab0 = v0, out = line(10, 50, 290, 50, 'axis') + '<path d="M290,50 l-8,-4 v8 z" class="arrow"/>';
    for (var i = 0; i < N; i++) { var x = 20 + i * 25; out += line(x, 44, x, 56); }
    function pt(i, s, below) { var x = 20 + i * 25; return '<circle cx="' + x + '" cy="50" r="4" class="dot"/>' + txt(x, below ? 74 : 34, s); }
    out += pt(i0, lab0 < 0 ? '−' + -lab0 : lab0, true) + pt(i1, v1 < 0 ? '−' + -v1 : v1, true) + pt(ix, 'X', false);
    var pic = svg(300, 84, out);
    return P('Координаталық түзуде X нүктесінің координатасын табыңыз.', 'Найдите координату точки X на координатной прямой.', pic,
      vx, [vx + step, -vx || vx - step, vx - step], 'Бір бөлік: (' + v1 + ' − (' + v0 + ')) : ' + (i1 - i0) + ' = ' + step + '. X нүктесі ' + v0 + ' санынан ' + (ix - i0) + ' бөлік ' + (ix > i0 ? 'оңға' : 'солға') + ': ' + vx + '.',
      'Цена деления: (' + v1 + ' − (' + v0 + ')) : ' + (i1 - i0) + ' = ' + step + '. От ' + v0 + ' на ' + Math.abs(ix - i0) + ' делений ' + (ix > i0 ? 'вправо' : 'влево') + ': ' + vx + '.');
  } });

  /* ---------- Кубтың жазбасы (развёртка) ---------- */
  var NETS = [   // [столбец, строка] для 6 граней; пары противоположных граней — индексы
    { cells: [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [1, 2]], opp: [[0, 2], [1, 3], [4, 5]] },
    { cells: [[0, 1], [1, 1], [2, 1], [3, 1], [0, 0], [3, 2]], opp: [[0, 2], [1, 3], [4, 5]] },
    { cells: [[0, 1], [1, 1], [2, 1], [3, 1], [2, 0], [1, 2]], opp: [[0, 2], [1, 3], [4, 5]] },
    { cells: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], opp: [[0, 3], [1, 4], [2, 5]] }   // «баспалдақ»; пары проверены сворачиванием
  ];
  F.l_fig.push({ lv: [2, 3, 4], f: function (r, lvl) {
    var net = r.pick(NETS), nums = r.shuffle([1, 2, 3, 4, 5, 6]), c = 40, out = '';
    net.cells.forEach(function (cell, i) { out += '<rect x="' + (10 + cell[0] * c) + '" y="' + (10 + cell[1] * c) + '" width="' + c + '" height="' + c + '" class="face"/>' + txt(10 + cell[0] * c + c / 2, 10 + cell[1] * c + c / 2 + 6, nums[i], 'middle', 'big'); });
    var pic = svg(180, 140, out), f = r.int(0, 5), opp = -1;
    net.opp.forEach(function (p) { if (p[0] === f) opp = p[1]; if (p[1] === f) opp = p[0]; });
    if (lvl === 2) return P('Жазбадан куб құрастырылды. ' + nums[f] + ' санының қарсы жағында қай сан тұр?', 'Из развёртки склеили куб. Какое число на грани, противоположной грани с числом ' + nums[f] + '?', pic,
      nums[opp], nums.filter(function (x, k) { return k !== f && k !== opp; }).slice(0, 3), 'Жазбада бір қатарда тұрған үш шаршының шеткілері қарама-қарсы жақтар болады; қатардан тыс екі шаршы да өзара қарама-қарсы. ' + nums[f] + ' ↔ ' + nums[opp] + '.',
      'В ряду из трёх квадратов крайние — противоположные грани; два квадрата вне ряда тоже противоположны. ' + nums[f] + ' ↔ ' + nums[opp] + '.');
    var adj = 21 - nums[f] - nums[opp];
    return P('Жазбадан куб құрастырылды. ' + nums[f] + ' саны жазылған жаққа көрші (ортақ қыры бар) төрт жақтағы сандардың қосындысын табыңыз.', 'Из развёртки склеили куб. Найдите сумму чисел на четырёх гранях, соседних с гранью ' + nums[f] + ' (имеющих с ней общее ребро).', pic,
      adj, [21 - nums[f], adj + nums[opp] - nums[(opp + 1) % 6] || adj + 1, 21], 'Барлық сандардың қосындысы 21. Көрші емес жалғыз жақ — қарама-қарсы жақ (' + nums[opp] + '). 21 − ' + nums[f] + ' − ' + nums[opp] + ' = ' + adj + '.',
      'Сумма всех чисел 21. Не соседняя только противоположная грань (' + nums[opp] + '): 21 − ' + nums[f] + ' − ' + nums[opp] + ' = ' + adj + '.');
  } });
})(typeof window !== 'undefined' ? window : globalThis);
