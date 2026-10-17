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

  function pickBank(bank, lvl, r, needInt) {
    var items = bank.filter(function (q) { return q.lvl === lvl && (!needInt || q.int); });
    if (!items.length) items = bank.filter(function (q) { return !needInt || q.int; });
    var it = r.pick(items);
    return { kk: it.kk, ru: it.ru, ans: it.ans, wrong: it.wrong.slice(), sol_kk: it.sol_kk, sol_ru: it.sol_ru, bankId: it.id };
  }

  /* Собрать вопрос.
   * mode: { answer: 'mc' | 'int', options: 4|5 }
   * reading-вопросы собираются отдельно (buildReading), т.к. идут блоком к тексту. */
  function buildQuestion(topicId, lvl, seed, mode) {
    var t = Z.topicById[topicId];
    if (!t) throw new Error('unknown topic ' + topicId);
    var needInt = mode.answer === 'int';
    var raw, s = seed, tries = 0, r;
    for (;;) {
      r = U.rng(s);
      raw = t.bank ? pickBank(Z.bank[t.bank], lvl, r, needInt)
        : lvl === 4 && Z.gen4[t.gen] ? Z.gen4[t.gen](r, lvl, { int: needInt }) : Z.gen[t.gen](r, Math.min(lvl, 3), { int: needInt });
      var a = norm(raw.ans);
      if (!needInt || (typeof a === 'number' && a % 1 === 0)) break;
      if (++tries > 60) throw new Error('topic ' + topicId + ' lvl ' + lvl + ' cannot produce integer answers');
      s = (s * 31 + 7) % 2147483646 + 1;
    }
    return finishQuestion(topicId, lvl, seed, mode, raw, r);
  }
  function finishQuestion(topicId, lvl, seed, mode, raw, r) {
    var q = {
      topic: topicId, lvl: lvl, seed: seed, kk: raw.kk, ru: raw.ru || raw.kk,
      sol_kk: raw.sol_kk, sol_ru: raw.sol_ru || raw.sol_kk, unit: raw.unit || null,
      type: mode.answer === 'int' ? 'int' : 'mc', ansKey: keyOf(raw.ans), ansValue: norm(raw.ans)
    };
    if (q.type === 'mc') q.options = makeOptions(raw.ans, raw.wrong, mode.options || 4, r, raw.unit);
    return q;
  }

  function makeOptions(ans, wrong, n, r, unit) {
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
    return list.map(function (v) {
      return { key: keyOf(v), kk: show(v, unit, 'kk'), ru: show(v, unit, 'ru') };
    });
  }

  // Блок чтения: текст + его вопросы (по порядку, варианты перемешаны).
  function buildReading(passageId, seed, nOpts) {
    var p = Z.bank.reading.filter(function (x) { return x.id === passageId; })[0];
    var r = U.rng(seed);
    return p.qs.map(function (it, i) {
      return {
        topic: 'r_read', lvl: 2, seed: seed + i, passage: p.id, kk: it.kk, ru: it.kk,
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
   *  hw    — домашнее задание на 50 задач: лесенка A → B → C → ★ (олимпиада).
   *          Ошибка → сразу «повторная» задача того же типа (до 10 штук на задание),
   *          чтобы ученик закрепил исправленный способ. Оценка — по первым попыткам.
   *  quick — короткое повторение на 10 задач с адаптивным уровнем
   *          (2 верных подряд → выше, ошибка → ниже). */
  var HW_PLAN = { 1: 12, 2: 16, 3: 14, 4: 8 };     // 50 задач
  var QUICK_LEN = 10, MAX_RETRY = 10;
  var SESSION_LEN = 50;

  function hwLevels() {
    var out = [];
    [1, 2, 3, 4].forEach(function (l) { for (var i = 0; i < HW_PLAN[l]; i++) out.push(l); });
    return out;
  }

  // Банковые темы (логика, чтение): берём все задачи банка по возрастанию уровня.
  function bankQueue(t, school, seed) {
    var r = U.rng(seed), mode = modeFor(school);
    if (t.kind === 'reading') {
      var out = [];
      r.shuffle(Z.bank.reading).forEach(function (p, k) { out = out.concat(buildReading(p.id, seed + k * 100, mode.options)); });
      return out;
    }
    var items = Z.bank[t.bank].filter(function (q) { return mode.answer !== 'int' || q.int; });
    items = r.shuffle(items).sort(function (a, b) { return a.lvl - b.lvl; });
    return items.map(function (it, k) {
      var q = { kk: it.kk, ru: it.ru, ans: it.ans, wrong: it.wrong.slice(), sol_kk: it.sol_kk, sol_ru: it.sol_ru };
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
      s.queue = bankQueue(t, school, seed);
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
    s.queue = list.map(function (m) { var q = buildQuestion(m.topic, m.lvl, m.seed, mode); q.mistakeId = m.id; return q; });
    s.n = s.queue.length; s.maxLevel = 1;
    s.current = s.queue[0] || null;
    if (!s.current) s.done = true;
    return s;
  }

  function levelFor(s) { return s.plan ? s.plan[s.idx] : s.level; }
  function nextQuestion(s) {
    if (s.queue) return s.queue[s.idx];
    return buildQuestion(s.topic, levelFor(s), s.seed + s.idx * 7919 + s.extra * 104729, modeFor(s.school));
  }

  function answer(s, given) {
    var q = s.current, ok = check(q, given) === true;
    s.hist.push({ topic: q.topic, lvl: q.lvl, seed: q.seed, ok: ok, given: given, retry: !!q.isRetry, passage: q.passage || null, mistakeId: q.mistakeId || null });
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
      var q = buildQuestion(s.current.topic, s.current.lvl, s.seed + 900000 + s.extra * 7907, modeFor(s.school));
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
  function buildExam(formatId, seed) {
    var f = Z.examFormats[formatId], r = U.rng(seed), qs = [], seen = {}, mode = { answer: f.answer, options: f.options || 4 };
    f.sections.forEach(function (sec, si) {
      if (sec.kinds[0] === 'reading') {
        var ids = r.shuffle(Z.bank.reading.map(function (p) { return p.id; })).slice(0, Math.ceil(sec.count / 5));
        ids.forEach(function (id, k) { buildReading(id, seed + 500 + k * 10, mode.options).forEach(function (q) { q.section = si; qs.push(q); }); });
        return;
      }
      // Темы раздаём по кругу из перемешанного списка — так в варианте нет перекоса в одну тему.
      var mPool = r.shuffle(Z.topicsFor(f.school, 'math')), lPool = r.shuffle(Z.topicsFor(f.school, 'logic')), mi = 0, li = 0;
      [1, 2, 3, 4].forEach(function (lvl) {
        var n = sec.mix[lvl] || 0, nLogic = Math.round(n * sec.logicShare), list = [];
        for (var i = 0; i < n; i++) list.push(i < nLogic ? lPool[li++ % lPool.length].id : mPool[mi++ % mPool.length].id);
        r.shuffle(list).forEach(function (tid, i) {
          // Одинаковые задачи в одном варианте пересоздаём с другим seed.
          var q, s2 = seed + lvl * 100000 + i * 977 + si, tries = 0;
          do { q = buildQuestion(tid, lvl, s2 + tries * 31337, mode); } while (seen[q.kk] && ++tries < 25);
          seen[q.kk] = 1;
          q.section = si; qs.push(q);
        });
      });
    });
    return { format: formatId, seed: seed, questions: qs, answers: {}, flags: {}, startedAt: Date.now(), minutes: f.minutes };
  }

  // Подсчёт по правилам школы: БИЛ +4/−1/0, РФМШ 3/5/7 за верный.
  function scoreExam(ex) {
    var f = Z.examFormats[ex.format], res = { score: 0, max: 0, correct: 0, wrong: 0, skipped: 0, byTopic: {}, byLevel: {} };
    ex.questions.forEach(function (q, i) {
      var r2 = check(q, ex.answers[i]);
      var pts = f.points ? f.points[q.lvl] : f.scoring.correct;
      res.max += pts;
      var bt = res.byTopic[q.topic] = res.byTopic[q.topic] || { ok: 0, n: 0 };
      var bl = res.byLevel[q.lvl] = res.byLevel[q.lvl] || { ok: 0, n: 0 };
      bt.n++; bl.n++;
      if (r2 === true) { res.correct++; res.score += pts; bt.ok++; bl.ok++; }
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
    keyOf: keyOf, show: show, buildQuestion: buildQuestion, buildReading: buildReading, check: check, modeFor: modeFor,
    newSession: newSession, mistakeSession: mistakeSession, answer: answer, advance: advance, sessionResult: sessionResult,
    buildExam: buildExam, scoreExam: scoreExam, SESSION_LEN: SESSION_LEN, QUICK_LEN: QUICK_LEN, HW_PLAN: HW_PLAN
  };
})(typeof window !== 'undefined' ? window : globalThis);
