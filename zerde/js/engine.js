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
      raw = t.bank ? pickBank(Z.bank[t.bank], lvl, r, needInt) : Z.gen[t.gen](r, lvl, { int: needInt });
      var a = norm(raw.ans);
      if (!needInt || (typeof a === 'number' && a % 1 === 0)) break;
      if (++tries > 60) throw new Error('topic ' + topicId + ' lvl ' + lvl + ' cannot produce integer answers');
      s = (s * 31 + 7) % 2147483646 + 1;
    }
    var q = {
      topic: topicId, lvl: lvl, seed: seed, kk: raw.kk, ru: raw.ru || raw.kk,
      sol_kk: raw.sol_kk, sol_ru: raw.sol_ru || raw.sol_kk, unit: raw.unit || null,
      type: needInt ? 'int' : 'mc', ansKey: keyOf(raw.ans), ansValue: norm(raw.ans)
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

  /* ---------- адаптивная практика по теме ----------
   * 2 верных подряд → уровень выше; ошибка → уровень ниже.
   * Так ученик быстро доходит до своего потолка и тренируется на нём. */
  var SESSION_LEN = 12;
  function newSession(topicId, school, startLevel) {
    var t = Z.topicById[topicId];
    var s = {
      topic: topicId, school: school, n: t.kind === 'reading' ? 10 : SESSION_LEN, idx: 0,
      level: Math.min(3, Math.max(1, startLevel || 1)), streak: 0, maxLevel: 1, hist: [], seed: U.newSeed(), done: false
    };
    s.maxLevel = s.level;
    if (t.kind === 'reading') {
      var ids = U.rng(s.seed).shuffle(Z.bank.reading.map(function (p) { return p.id; })).slice(0, 2);
      s.queue = buildReading(ids[0], s.seed, 4).concat(buildReading(ids[1], s.seed + 100, 4));
    }
    s.current = nextQuestion(s);
    return s;
  }
  function nextQuestion(s) {
    if (s.queue) return s.queue[s.idx];
    return buildQuestion(s.topic, s.level, s.seed + s.idx * 7919, modeFor(s.school));
  }
  function answer(s, given) {
    var ok = check(s.current, given) === true;
    s.hist.push({ lvl: s.current.lvl, ok: ok, given: given });
    if (!s.queue) {
      if (ok) { s.streak++; if (s.streak >= 2 && s.level < 3) { s.level++; s.streak = 0; } }
      else { s.streak = 0; if (s.level > 1) s.level--; }
      s.maxLevel = Math.max(s.maxLevel, s.level);
    }
    return ok;
  }
  function advance(s) {
    s.idx++;
    if (s.idx >= s.n) { s.done = true; s.current = null; return; }
    s.current = nextQuestion(s);
  }
  // Итог: звёзды 0–3. 3★ — ≥75% и решены задачи 3-го уровня.
  function sessionResult(s) {
    var correct = s.hist.filter(function (h) { return h.ok; }).length;
    var hardOk = s.hist.filter(function (h) { return h.ok && h.lvl === 3; }).length;
    var acc = correct / s.hist.length;
    var stars = acc >= 0.75 && (hardOk >= 2 || s.queue) ? 3 : acc >= 0.6 ? 2 : acc >= 0.4 ? 1 : 0;
    return { correct: correct, total: s.hist.length, acc: acc, stars: stars, nextLevel: Math.max(1, Math.min(3, s.level)), hardOk: hardOk };
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
      var math = Z.topicsFor(f.school, 'math'), logic = Z.topicsFor(f.school, 'logic');
      [1, 2, 3].forEach(function (lvl) {
        var n = sec.mix[lvl] || 0, nLogic = Math.round(n * sec.logicShare), list = [];
        var mPool = r.shuffle(math), lPool = r.shuffle(logic);
        for (var i = 0; i < n; i++) {
          var isLogic = i < nLogic, pool = isLogic ? lPool : mPool;
          list.push(pool[i % pool.length].id);
        }
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
    newSession: newSession, answer: answer, advance: advance, sessionResult: sessionResult,
    buildExam: buildExam, scoreExam: scoreExam, SESSION_LEN: SESSION_LEN
  };
})(typeof window !== 'undefined' ? window : globalThis);
