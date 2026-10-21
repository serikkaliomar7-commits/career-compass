/* Зерде — движок: сборка вопросов, адаптивная практика, пробные тесты.
 * Без DOM, поэтому покрывается тестами в node (tests/run.js). */
(function (root) {
  'use strict';
  var Z = root.Z, U = Z.util;

  /* ---------- значения ответов ---------- */
  function isFrac(v) { return v && typeof v === 'object' && 'n' in v && 'd' in v; }
  function norm(v) { return isFrac(v) && v.d === 1 ? v.n : v; }
  function keyOf(v) {
    v = norm(v);
    if (typeof v === 'number') return 'n:' + Math.round(v * 1e6) / 1e6;
    if (isFrac(v)) return 'f:' + v.n + '/' + v.d;
    return 's:' + String(v);
  }
  function show(v, unit, lang) {
    v = norm(v);
    var u = unit ? (unit[lang] || unit.kk) : '';
    if (u && !/^[%°]/.test(u)) u = '\u00a0' + u;   // «25%», «30°», но «12 см»
    if (typeof v === 'number') return U.fmt(v) + u;
    if (isFrac(v)) return U.fracHtml(v, false) + u;
    return String(v);
  }

  // Достраиваем варианты, если генератор дал мало правдоподобных ошибок.
  function autoWrong(ans, r) {
    ans = norm(ans);
    var out = [];
    if (typeof ans === 'number') {
      var isInt = ans % 1 === 0, base = Math.abs(ans) || 1;
      var deltas = isInt ? [1, -1, 2, -2, 10, -10, 3, 5] : [0.1, -0.1, 0.5, -0.5, 1, -1, 0.01];
      deltas = r.shuffle(deltas).concat([Math.round(base * 0.1) || 4, Math.round(base * 0.2) || 6]);
      deltas.forEach(function (d) { var v = Math.round((ans + d) * 1000) / 1000; if (!(ans > 0 && v <= 0)) out.push(v); });
      out.push(ans * 2);
    } else if (isFrac(ans)) {
      out.push(U.frac(ans.n + 1, ans.d), U.frac(ans.n, ans.d + 1), U.frac(ans.d, ans.n), U.frac(ans.n * 2, ans.d), U.frac(Math.max(1, ans.n - 1), ans.d));
    } else if (typeof ans === 'string') {
      var m = /^(\d\d):(\d\d)$/.exec(ans), m2 = /^(\d+) сағ (\d\d) мин$/.exec(ans);
      var shifts = r.shuffle([5, -5, 15, -15, 30, -30, 60, -60]);
      if (m) shifts.forEach(function (d) { out.push(U.clock(+m[1] * 60 + +m[2] + d)); });
      else if (m2) shifts.forEach(function (d) { var v = +m2[1] * 60 + +m2[2] + d; if (v > 0) out.push(U.hm(v)); });
    }
    return out;
  }

  // Текстовые варианты с переводом (банк естествознания): ans_ru / wrong_ru → словарь kk → ru.
  function ruMapOf(it) {
    if (!it.ans_ru) return null;
    var m = {}; m[it.ans] = it.ans_ru;
    it.wrong.forEach(function (w, i) { m[w] = it.wrong_ru[i]; });
    return m;
  }

  function pickBank(bank, lvl, r, needInt) {
    var items = bank.filter(function (q) { return q.lvl === lvl && (!needInt || q.int); });
    if (!items.length) items = bank.filter(function (q) { return !needInt || q.int; });
    var it = r.pick(items);
    return { kk: it.kk, ru: it.ru, ans: it.ans, wrong: it.wrong.slice(), sol_kk: it.sol_kk, sol_ru: it.sol_ru, bankId: it.id, ruMap: ruMapOf(it) };
  }

  /* Собрать вопрос.
   * mode: { answer: 'mc' | 'int', options: 4|5 }
   * reading-вопросы собираются отдельно (buildReading), т.к. идут блоком к тексту. */
  /* Выбор формата: базовая задача темы или один из дополнительных форматов (gen_formats.js).
   * opts.vary = false — только базовый генератор и форматы без общих преобразований (для пробных). */
  function generate(t, lvl, r, needInt, vary, slot, fmt) {
    var opt = { int: needInt };
    if (t.bank) return pickBank(Z.bank[t.bank], lvl, r, needInt);
    if (fmt) {   // пробный по образцу экзамена просит конкретный формат (id из gen_bil.js и др.) — раньше уровня ★
      var want = (Z.formats[t.gen] || []).filter(function (fm) { return fm.id === fmt && fm.lv.indexOf(lvl) >= 0; })[0];
      if (want) return want.f(r, lvl, opt);
    }
    if (lvl === 4 && Z.gen4[t.gen]) return Z.gen4[t.gen](r, lvl, opt);
    var pool = [function () { return Z.gen[t.gen](r, Math.min(lvl, 3), opt); }];
    (Z.formats[t.gen] || []).forEach(function (fm) { if (fm.lv.indexOf(lvl) >= 0) pool.push(function () { return fm.f(r, lvl, opt); }); });
    // slot — номер задачи в домашке: форматы идут по кругу, чтобы в 20 задачах не было повторов типа
    var raw = (slot >= 0 ? pool[slot % pool.length] : r.pick(pool))();
    if (vary && r() < 0.2) raw = transform(t, lvl, r, needInt, raw) || raw;
    return raw;
  }

  /* Общие преобразования — меняют то, ЧТО спрашивают, а не только числа:
   *  ошибка ученика — «на сколько ошибся Асан?» (нужно решить и сравнить);
   *  сравнение — две задачи темы, какая величина больше (как «Сандық сипаттама» НИШ);
   *  свойство — какое утверждение об ответе верно (чётность, делимость, границы). */
  function transform(t, lvl, r, needInt, raw) {
    var a = norm(raw.ans);
    if (typeof a !== 'number' || a % 1 !== 0) return null;
    var kinds = needInt ? ['error'] : ['error', 'compare', 'property'];
    var k = r.pick(kinds), unitKk = raw.unit ? ' ' + raw.unit.kk : '', unitRu = raw.unit ? ' ' + (raw.unit.ru || raw.unit.kk) : '';
    if (k === 'error') {
      var w = (raw.wrong || []).map(norm).filter(function (x) { return typeof x === 'number' && x % 1 === 0 && x !== a; })[0];
      if (w === undefined) return null;
      var d = a - w;
      return { kk: raw.kk + '<div class="note">Асан бұл есепке <b>' + U.fmt(w) + unitKk + '</b> деп жауап берді. Дұрыс жауаптан Асанның жауабын азайтыңыз: айырма неге тең?</div>',
        ru: raw.ru + '<div class="note">Асан ответил: <b>' + U.fmt(w) + unitRu + '</b>. Вычтите ответ Асана из правильного ответа: чему равна разность?</div>',
        ans: d, wrong: [-d, a, w], sol_kk: 'Дұрыс жауап: ' + U.fmt(a) + '. ' + raw.sol_kk + ' Айырма: ' + U.fmt(a) + ' − (' + U.fmt(w) + ') = ' + U.fmt(d) + '.',
        sol_ru: 'Правильный ответ: ' + U.fmt(a) + '. ' + (raw.sol_ru || raw.sol_kk) + ' Разность: ' + U.fmt(d) + '.' };
    }
    if (k === 'compare') {
      var raw2 = Z.gen[t.gen] ? Z.gen[t.gen](r, Math.min(lvl, 3), { int: true }) : null, b2 = raw2 && norm(raw2.ans);
      if (!raw2 || typeof b2 !== 'number' || b2 % 1 !== 0) return null;
      var rel = a > b2 ? 'A > B' : a < b2 ? 'A < B' : 'A = B';
      return { kk: '<div class="cmp"><div><b>A</b>' + raw.kk + '</div><div><b>B</b>' + raw2.kk + '</div></div>A және B жауаптарын салыстырыңыз.',
        ru: '<div class="cmp"><div><b>A</b>' + raw.ru + '</div><div><b>B</b>' + raw2.ru + '</div></div>Сравните ответы A и B.',
        ans: rel, wrong: ['A > B', 'A < B', 'A = B', 'Анықтау мүмкін емес / Нельзя определить'].filter(function (x) { return x !== rel; }),
        sol_kk: 'A = ' + U.fmt(a) + ' (' + raw.sol_kk + ') B = ' + U.fmt(b2) + ' (' + raw2.sol_kk + ') Сондықтан ' + rel + '.',
        sol_ru: 'A = ' + U.fmt(a) + ', B = ' + U.fmt(b2) + '. Значит, ' + rel + '.' };
    }
    // property
    var lim = Math.round(a / 10) * 10 + (r.chance(0.5) ? 5 : -5);
    var props = [
      [a % 2 === 0, 'жұп сан', 'чётное число', 'тақ сан', 'нечётное число'],
      [a % 3 === 0, '3-ке қалдықсыз бөлінеді', 'делится на 3', '3-ке бөлінбейді', 'не делится на 3'],
      [a > lim, U.fmt(lim) + '-тен үлкен', 'больше ' + U.fmt(lim), U.fmt(lim) + '-тен кіші', 'меньше ' + U.fmt(lim)],
      [a % 5 === 0, '5-ке қалдықсыз бөлінеді', 'делится на 5', '5-ке бөлінбейді', 'не делится на 5']
    ];
    var stm = [];
    props.forEach(function (p) { stm.push({ ok: p[0], kk: p[1], ru: p[2] }, { ok: !p[0], kk: p[3], ru: p[4] }); });
    var trues = r.shuffle(stm.filter(function (x) { return x.ok; })), falses = r.shuffle(stm.filter(function (x) { return !x.ok; }));
    var right = trues[0];
    return { kk: raw.kk + '<div class="note">Есептің жауабы туралы қай тұжырым <b>дұрыс</b>?</div>', ru: raw.ru + '<div class="note">Какое утверждение об ответе <b>верно</b>?</div>',
      ans: 'Жауабы — ' + right.kk + ' / ' + right.ru, wrong: falses.slice(0, 3).map(function (x) { return 'Жауабы — ' + x.kk + ' / ' + x.ru; }),
      sol_kk: 'Жауабы ' + U.fmt(a) + '. ' + raw.sol_kk, sol_ru: 'Ответ ' + U.fmt(a) + '. ' + (raw.sol_ru || raw.sol_kk) };
  }

  function buildQuestion(topicId, lvl, seed, mode, opts) {
    var t = Z.topicById[topicId];
    if (!t) throw new Error('unknown topic ' + topicId);
    var needInt = mode.answer === 'int', vary = !opts || opts.vary !== false, slot = opts && opts.slot >= 0 ? opts.slot : -1, fmt = opts && opts.fmt;
    var raw, s = seed, tries = 0, r;
    for (;;) {
      r = U.rng(s);
      raw = generate(t, lvl, r, needInt, vary, slot, fmt);
      var a = norm(raw.ans);
      if (!needInt || (typeof a === 'number' && a % 1 === 0)) break;
      if (slot >= 0 && tries % 10 === 9) slot++;   // этот формат не даёт целого ответа (РФМШ) — следующий
      if (++tries > 60) throw new Error('topic ' + topicId + ' lvl ' + lvl + ' cannot produce integer answers');
      s = (s * 31 + 7) % 2147483646 + 1;
    }
    var q = finishQuestion(topicId, lvl, seed, mode, raw, r);
    if (slot >= 0) q.slot = slot;
    if (fmt) q.fmt = fmt;
    return q;
  }
  function finishQuestion(topicId, lvl, seed, mode, raw, r) {
    var q = {
      topic: topicId, lvl: lvl, seed: seed, kk: raw.kk, ru: raw.ru || raw.kk,
      sol_kk: raw.sol_kk, sol_ru: raw.sol_ru || raw.sol_kk, unit: raw.unit || null,
      type: mode.answer === 'int' ? 'int' : 'mc', ansKey: keyOf(raw.ans), ansValue: norm(raw.ans)
    };
    if (q.type === 'mc') q.options = raw.fixed ? raw.fixed.map(function (v) { return optOf(v, null, raw.ruMap); }) : makeOptions(raw.ans, raw.wrong, mode.options || 4, r, raw.unit, raw.ruMap);
    if (raw.fixed) q.fixed = true;
    return q;
  }

  function optOf(v, unit, ruMap) {
    return { key: keyOf(v), kk: show(v, unit, 'kk'), ru: ruMap && ruMap[v] ? ruMap[v] : show(v, unit, 'ru') };
  }
  function makeOptions(ans, wrong, n, r, unit, ruMap) {
    var seen = {}, list = [];
    var ak = keyOf(ans);
    seen[ak] = 1;
    function add(v) {
      var k = keyOf(v);
      if (seen[k] || v === undefined || v === null || (typeof v === 'number' && !isFinite(v))) return;
      seen[k] = 1; list.push(v);
    }
    (wrong || []).forEach(add);
    if (list.length < n - 1) autoWrong(ans, r).forEach(add);
    list = list.slice(0, n - 1);
    list.push(ans);
    list = r.shuffle(list);
    return list.map(function (v) { return optOf(v, unit, ruMap); });
  }

  // Блок чтения: текст + его вопросы (по порядку, варианты перемешаны).
  var PASSAGE_BANKS = ['reading', 'reading_ru', 'reading_en'];
  function findPassage(id) {
    for (var i = 0; i < PASSAGE_BANKS.length; i++) {
      var b = Z.bank[PASSAGE_BANKS[i]] || [];
      for (var j = 0; j < b.length; j++) if (b[j].id === id) return b[j];
    }
    return null;
  }
  function buildReading(passageId, seed, nOpts) {
    var p = findPassage(passageId);
    var r = U.rng(seed);
    return p.qs.map(function (it, i) {
      return {
        topic: p.topic || 'r_read', lvl: p.lvl || 2, seed: seed + i, passage: p.id, kk: it.kk, ru: it.kk,
        sol_kk: it.sol_kk, sol_ru: it.sol_kk, type: 'mc', ansKey: keyOf(it.ans), ansValue: it.ans,
        options: makeOptions(it.ans, it.wrong, nOpts || 4, r, null)
      };
    });
  }

  // Проверка ответа. Для ввода числа принимаем «12», «12,0», « 12 ».
  function check(q, given) {
    if (given === null || given === undefined || given === '') return null;   // пропуск
    if (q.type === 'mc') return given === q.ansKey;
    var s = String(given).replace(/\s| /g, '').replace(',', '.').replace('−', '-');
    if (!/^-?\d+(\.0+)?$/.test(s)) return false;
    return keyOf(parseFloat(s)) === q.ansKey;
  }

  function modeFor(school) {
    var sc = Z.schools[school];
    return { answer: sc.answer, options: sc.options || 4 };
  }

  /* ---------- тренировки по теме ----------
   * Два режима:
   *  hw    — домашнее задание на 20 задач: лесенка A → B → C → ★ (олимпиада);
   *          внутри уровня форматы идут по кругу — меньше задач, но без повторов типа.
   *          Ошибка → сразу «повторная» задача того же типа (до 10 штук на задание),
   *          чтобы ученик закрепил исправленный способ. Оценка — по первым попыткам.
   *  quick — короткое повторение на 10 задач с адаптивным уровнем
   *          (2 верных подряд → выше, ошибка → ниже). */
  var HW_PLAN = { 1: 4, 2: 6, 3: 6, 4: 4 };     // 20 задач
  var QUICK_LEN = 10, MAX_RETRY = 10;
  var SESSION_LEN = 20;

  function hwLevels() {
    var out = [];
    [1, 2, 3, 4].forEach(function (l) { for (var i = 0; i < HW_PLAN[l]; i++) out.push(l); });
    return out;
  }

  /* Чтение растёт вместе с учеником: стадия = сколько раз он уже работал с текстами.
   * 0 → разминка на коротком тексте (A), затем B и C; 1 → B, C и ★; дальше → C и ★ (длинные,
   * с таблицами, двумя точками зрения, притчами). Внутри набора тексты идут от лёгкого к трудному. */
  var READ_STAGES = [[1, 2, 2, 3], [2, 3, 3, 4], [3, 4, 4, 4]];
  function pickPassages(r, levels, bank) {
    var used = {}, out = [];
    levels.forEach(function (lvl) {
      var best = null;
      r.shuffle(Z.bank[bank || 'reading']).forEach(function (p) {
        if (used[p.id]) return;
        if (!best || Math.abs(p.lvl - lvl) < Math.abs(best.lvl - lvl)) best = p;
      });
      if (best) { used[best.id] = 1; out.push(best); }
    });
    return out.sort(function (a, b) { return a.lvl - b.lvl; });
  }

  // Банковые темы (логика, чтение): берём все задачи банка по возрастанию уровня.
  function bankQueue(t, school, seed, opts) {
    var r = U.rng(seed), mode = modeFor(school);
    if (t.kind === 'reading') {
      var st = READ_STAGES[Math.min(READ_STAGES.length - 1, (opts && opts.readStage) || 0)], out = [];
      pickPassages(r, st, t.bank).forEach(function (p, k) { out = out.concat(buildReading(p.id, seed + k * 100, mode.options)); });
      return out;
    }
    var items = Z.bank[t.bank].filter(function (q) { return mode.answer !== 'int' || q.int; });
    items = r.shuffle(items).slice(0, SESSION_LEN).sort(function (a, b) { return a.lvl - b.lvl; });   // большой банк — 20 случайных
    return items.map(function (it, k) {
      var q = { kk: it.kk, ru: it.ru, ans: it.ans, wrong: it.wrong.slice(), sol_kk: it.sol_kk, sol_ru: it.sol_ru, ruMap: ruMapOf(it) };
      return finishQuestion(t.id, it.lvl, seed + k, mode, q, r);
    });
  }

  function newSession(topicId, school, opts) {
    opts = opts || {};
    var t = Z.topicById[topicId], seed = U.newSeed();
    var s = {
      topic: topicId, school: school, mode: opts.mode || 'hw', idx: 0, seed: seed, hist: [], extra: 0, retry: false,
      level: Math.min(4, Math.max(1, opts.startLevel || 1)), streak: 0, done: false, startedAt: Date.now()
    };
    if (t.bank) {
      s.queue = bankQueue(t, school, seed, opts);
      s.n = s.mode === 'quick' ? Math.min(QUICK_LEN, s.queue.length) : s.queue.length;
      if (s.mode === 'quick') s.queue = s.queue.slice(0, s.n);
    } else if (s.mode === 'hw') {
      s.plan = hwLevels(); s.n = s.plan.length;
    } else {
      s.n = QUICK_LEN;
    }
    s.maxLevel = s.level;
    s.current = nextQuestion(s);
    return s;
  }

  // Сессия по сохранённым ошибкам (тетрадь ошибок): те же задачи, тот же seed.
  function mistakeSession(list, school) {
    var mode = modeFor(school);
    var s = { topic: null, school: school, mode: 'mistakes', idx: 0, seed: U.newSeed(), hist: [], extra: 0, retry: false, level: 1, streak: 0, done: false, startedAt: Date.now() };
    s.queue = list.map(function (m) { var q = buildQuestion(m.topic, m.lvl, m.seed, mode, { vary: m.vary !== false, slot: m.slot, fmt: m.fmt }); q.mistakeId = m.id; return q; });
    s.n = s.queue.length; s.maxLevel = 1;
    s.current = s.queue[0] || null;
    if (!s.current) s.done = true;
    return s;
  }

  function levelFor(s) { return s.plan ? s.plan[s.idx] : s.level; }
  function nextQuestion(s) {
    if (s.queue) return s.queue[s.idx];
    var lvl = levelFor(s), opts;
    if (s.plan) { var k = 0; for (var i = 0; i < s.idx; i++) if (s.plan[i] === lvl) k++; opts = { slot: k + s.seed % 7 }; }
    return buildQuestion(s.topic, lvl, s.seed + s.idx * 7919 + s.extra * 104729, modeFor(s.school), opts);
  }

  function answer(s, given) {
    var q = s.current, ok = check(q, given) === true;
    s.hist.push({ topic: q.topic, lvl: q.lvl, seed: q.seed, slot: q.slot, fmt: q.fmt, vary: q.vary !== false, ok: ok, given: given, retry: !!q.isRetry, passage: q.passage || null, mistakeId: q.mistakeId || null });
    if (s.mode === 'quick' && !s.queue) {
      if (ok) { s.streak++; if (s.streak >= 2 && s.level < 4) { s.level++; s.streak = 0; } }
      else { s.streak = 0; if (s.level > 1) s.level--; }
    }
    s.maxLevel = Math.max(s.maxLevel, q.lvl);
    // Домашка: неверно → следующая задача — такая же по типу и уровню (кроме банковых тем).
    s.retry = s.mode === 'hw' && !ok && !q.isRetry && !q.passage && s.extra < MAX_RETRY;
    return ok;
  }

  function advance(s) {
    if (s.retry) {
      s.extra++; s.retry = false;
      var q = buildQuestion(s.current.topic, s.current.lvl, s.seed + 900000 + s.extra * 7907, modeFor(s.school), { slot: s.current.slot });   // тот же формат
      q.isRetry = true; s.current = q;
      return;
    }
    s.idx++;
    if (s.idx >= s.n) { s.done = true; s.current = null; return; }
    s.current = nextQuestion(s);
  }

  // Итог: оценка из 10 и звёзды — только по первым попыткам.
  function sessionResult(s) {
    var first = s.hist.filter(function (h) { return !h.retry; });
    var correct = first.filter(function (h) { return h.ok; }).length;
    var acc = first.length ? correct / first.length : 0;
    var star = first.filter(function (h) { return h.lvl === 4; }), starOk = star.filter(function (h) { return h.ok; }).length;
    var hard = first.filter(function (h) { return h.lvl >= 3 && h.ok; }).length;
    var stars;
    if (s.mode === 'hw') stars = acc >= 0.85 && (!star.length || starOk / star.length >= 0.5) ? 3 : acc >= 0.7 ? 2 : acc >= 0.5 ? 1 : 0;
    else stars = acc >= 0.8 ? 2 : acc >= 0.5 ? 1 : 0;   // короткое повторение не даёт ★★★
    var byLevel = {};
    first.forEach(function (h) { var b = byLevel[h.lvl] = byLevel[h.lvl] || { ok: 0, n: 0 }; b.n++; if (h.ok) b.ok++; });
    return {
      mode: s.mode, correct: correct, total: first.length, acc: acc, grade: Math.round(acc * 10), stars: stars, hardOk: hard,
      starOk: starOk, starN: star.length, retries: s.extra, byLevel: byLevel,
      nextLevel: s.mode === 'quick' ? s.level : Math.max(1, Math.min(4, s.maxLevel))
    };
  }

  /* ---------- пробные тесты ---------- */
  // opts.readLevel (1–4) — уровень текстов: второй текст на ступень труднее первого.
  function buildExam(formatId, seed, opts) {
    var rl = Math.max(1, Math.min(4, (opts && opts.readLevel) || 2));
    var f = Z.examFormats[formatId], r = U.rng(seed), qs = [], seen = {}, mode = { answer: f.answer, options: f.options || 4 };
    f.sections.forEach(function (sec, si) {
      if (sec.kinds[0] === 'reading') {
        if (f.full) rl = Math.max(2, rl);
        var lv = [], np = Math.ceil(sec.count / 5);
        for (var j = 0; j < np; j++) lv.push(Math.min(4, rl + (j >= np / 2 ? 1 : 0)));   // вторая половина текстов — на ступень труднее
        var ids = pickPassages(r, lv, sec.bank).map(function (p) { return p.id; });
        ids.forEach(function (id, k) { buildReading(id, seed + 500 + si * 1000 + k * 10, mode.options).slice(0, sec.count - k * 5).forEach(function (q) { q.section = si; qs.push(q); }); });
        return;
      }
      if (sec.blueprint) { blueprintSection(sec, si, f, r, seed, mode, qs, seen); return; }
      // Темы раздаём по кругу из перемешанного списка — так в варианте нет перекоса в одну тему.
      // kinds[0] — основная часть раздела, kinds[1] — доля logicShare (логика у БИЛ и РФМШ).
      var mPool = r.shuffle(Z.topicsFor(f.school, sec.kinds[0])), lPool = r.shuffle(Z.topicsFor(f.school, sec.kinds[1] || sec.kinds[0])), mi = 0, li = 0;
      [1, 2, 3, 4].forEach(function (lvl) {
        var n = sec.mix[lvl] || 0, nLogic = Math.round(n * (sec.logicShare || 0)), list = [];
        for (var i = 0; i < n; i++) list.push(i < nLogic ? lPool[li++ % lPool.length].id : mPool[mi++ % mPool.length].id);
        r.shuffle(list).forEach(function (tid, i) {
          // Одинаковые задачи в одном варианте пересоздаём с другим seed.
          var q, s2 = seed + lvl * 100000 + i * 977 + si, tries = 0;
          do { q = buildQuestion(tid, lvl, s2 + tries * 31337, mode, { vary: false }); } while (seen[q.kk] && ++tries < 25);
          q.vary = false;
          seen[q.kk] = 1;
          q.section = si; qs.push(q);
        });
      });
    });
    var ex = { format: formatId, seed: seed, questions: qs, answers: {}, flags: {}, startedAt: Date.now(), minutes: f.minutes };
    // НИШ: у каждого раздела своё время; вернуться в закончившийся раздел нельзя.
    if (f.sectionTimes) {
      ex.secs = f.sections.map(function (sec, si) {
        var idx = []; qs.forEach(function (q, i) { if (q.section === si) idx.push(i); });
        return { from: idx[0], to: idx[idx.length - 1] + 1, minutes: sec.minutes };
      });
      ex.sec = 0; ex.secStartedAt = ex.startedAt;
    }
    return ex;
  }

  /* Раздел «по образцу экзамена»: задача № k варианта повторяет слот № k оригинала (тема, уровень,
   * формат), но с другими числами. Каждый вариант немного труднее: часть слотов поднимается на уровень
   * (sec.harder — доля), часть получает соседний тип той же темы (slot.alt). */
  function hasFormat(tid, fmt, lvl) {
    var t = Z.topicById[tid];
    return !!(fmt && t && (Z.formats[t.gen] || []).some(function (fm) { return fm.id === fmt && fm.lv.indexOf(lvl) >= 0; }));
  }
  function blueprintSection(sec, si, f, r, seed, mode, qs, seen) {
    var bp = Z.blueprints[sec.blueprint], prevSeed = 0;
    bp.slots.forEach(function (sl, k) {
      var lvl = sl.l, fmt = sl.f, tid = sl.t, bump = r(), alt = r(), next = bp.slots[k + 1];
      if (next && next.same) bump = alt = 1;   // первая задача пары тоже не меняется
      // same — вторая задача общего условия: тот же seed, без усложнения (иначе условие разойдётся)
      if (!sl.same && bump < (sec.harder || 0) && lvl < 4) { lvl++; fmt = null; }
      if (!sl.same && sl.alt && alt < 0.3) { tid = sl.alt[Math.floor(alt / 0.3 * sl.alt.length)]; fmt = null; }
      var same = sl.same && hasFormat(tid, fmt, lvl);   // нет формата — обычная задача со своим seed
      var q, s2 = same ? prevSeed : seed + k * 7919 + si, tries = 0;
      do { q = buildQuestion(tid, lvl, s2 + tries * 31337, mode, { vary: false, fmt: fmt }); } while (seen[q.kk] && !same && ++tries < 25);
      prevSeed = q.seed;
      q.vary = false; seen[q.kk] = 1; q.section = si; q.slotN = k + 1;
      qs.push(q);
    });
  }

  // Подсчёт по правилам школы: БИЛ +4/−1/0, РФМШ 3/5/7 за верный.
  function scoreExam(ex) {
    var f = Z.examFormats[ex.format], res = { score: 0, max: 0, correct: 0, wrong: 0, skipped: 0, byTopic: {}, byLevel: {}, bySection: {} };
    ex.questions.forEach(function (q, i) {
      var r2 = check(q, ex.answers[i]);
      var pts = f.points ? f.points[q.lvl] : f.scoring.correct;
      res.max += pts;
      var bt = res.byTopic[q.topic] = res.byTopic[q.topic] || { ok: 0, n: 0 };
      var bl = res.byLevel[q.lvl] = res.byLevel[q.lvl] || { ok: 0, n: 0 };
      var bs = res.bySection[q.section || 0] = res.bySection[q.section || 0] || { ok: 0, n: 0, score: 0, max: 0 };
      bt.n++; bl.n++; bs.n++; bs.max += pts;
      if (r2 === true) { res.correct++; res.score += pts; bt.ok++; bl.ok++; bs.ok++; bs.score += pts; }
      else if (r2 === false) { res.wrong++; if (f.scoring) res.score += f.scoring.wrong; }
      else { res.skipped++; if (f.scoring) res.score += f.scoring.skip; }
    });
    res.pct = res.max ? Math.max(0, res.score) / res.max : 0;
    // Сколько баллов в среднем потерял ученик, пропуская вопросы (только при штрафе).
    if (f.scoring && f.options) {
      var p = 1 / f.options;
      res.guessEV = p * f.scoring.correct + (1 - p) * f.scoring.wrong;
      res.lostBySkipping = Math.round(res.skipped * res.guessEV * 10) / 10;
    }
    return res;
  }

  Z.engine = {
    keyOf: keyOf, show: show, findPassage: findPassage, buildQuestion: buildQuestion, buildReading: buildReading, READ_STAGES: READ_STAGES, check: check, modeFor: modeFor,
    newSession: newSession, mistakeSession: mistakeSession, answer: answer, advance: advance, sessionResult: sessionResult,
    buildExam: buildExam, hasFormat: hasFormat, scoreExam: scoreExam, SESSION_LEN: SESSION_LEN, QUICK_LEN: QUICK_LEN, HW_PLAN: HW_PLAN
  };
})(typeof window !== 'undefined' ? window : globalThis);
