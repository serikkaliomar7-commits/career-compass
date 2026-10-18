/* Зерде — планировщик: что ученик делает сегодня.
 *
 * Каждый день: темы (видеоурок → домашка на 50 задач A → B → C → ★) и тест.
 * Незаконченная домашка переходит на следующий день и продолжается с того же места.
 * Полные пробные тесты 2 раза в неделю, а за 60 дней до экзамена — 3 раза.
 * В остальные дни — короткий тест (мини-тест или чтение для БИЛ).
 * План дня фиксируется при первом открытии, чтобы задания не «прыгали». */
(function (root) {
  'use strict';
  var Z = root.Z, U = Z.util;

  // Нагрузка в темах (каждая — 50 задач). light: одна тема, по очереди логика/математика.
  var INTENSITY = {
    light: { logic: 1, math: 1, alternate: true, short: 'none' },
    normal: { logic: 1, math: 1, short: 'alt' },
    intense: { logic: 1, math: 2, short: 'all' }
  };

  function mockDays(daysLeft) { return daysLeft <= 60 ? [1, 3, 5] : [2, 5]; }

  function dayInfo(state, date) {
    var p = state.profile;
    var idx = Math.max(0, U.daysBetween(p.startDate, date));
    var left = p.examDate ? U.daysBetween(date, p.examDate) : 999;
    return { idx: idx, left: left, mock: mockDays(left).indexOf(idx % 7) >= 0 };
  }

  /* Порядок выбора темы:
   * 1) начатые, но не освоенные (★ < 3) — доводим до конца;
   * 2) новые — по порядку программы;
   * 3) все освоены — повторение: самая давно пройденная тема. */
  function pickTopics(state, kind, n, exclude) {
    var list = Z.topicsFor(state.profile.school, kind).filter(function (t) { return exclude.indexOf(t.id) < 0; });
    var prog = state.topics;
    function st(t) { return prog[t.id] || null; }
    var started = list.filter(function (t) { return st(t) && st(t).stars < 3; });
    // Диагностика: сначала темы с ошибкой, потом непроверенные, а верно решённые — в конце новых.
    var dg = state.diag || {};
    function dgRank(t) { var d = dg[t.id]; return d === undefined ? 1 : d < 1 ? 0 : 2; }
    var fresh = list.filter(function (t) { return !st(t); }).map(function (t, i) { return { t: t, i: i }; })
      .sort(function (a, b) { return dgRank(a.t) - dgRank(b.t) || a.i - b.i; }).map(function (x) { return x.t; });
    var review = list.filter(function (t) { return st(t) && st(t).stars >= 3; })
      .sort(function (a, b) { return (st(a).lastDate || '') < (st(b).lastDate || '') ? -1 : 1; });
    return started.concat(fresh, review).slice(0, n).map(function (t) { return t.id; });
  }

  function testFor(state, info) {
    var sc = state.profile.school, mode = INTENSITY[state.profile.intensity || 'normal'];
    // НИШ: пробные чередуют 1-й день (математика, сандық сипаттама, естествознание) и 2-й (языки).
    if (!state.diag && info.idx === 0) return sc + '_diag';   // первый день — входная диагностика
    if (info.mock) return sc === 'NIS' ? (mockDays(info.left).indexOf(info.idx % 7) % 2 ? 'NIS_full2' : 'NIS_full') : sc + '_full';
    if (mode.short === 'none' || (mode.short === 'alt' && info.idx % 2 === 1)) return null;
    if (sc === 'BIL') return info.idx % 4 < 2 ? 'BIL_read' : 'BIL_mini';
    if (sc === 'NIS') return ['NIS_quant', 'NIS_mini', 'NIS_lang', 'NIS_sci'][info.idx % 4];
    return sc + '_mini';
  }

  function planFor(state, date) {
    if (state.plans[date]) return state.plans[date];
    var info = dayInfo(state, date), mode = INTENSITY[state.profile.intensity || 'normal'];
    var tasks = [];
    var nl = mode.logic, nm = mode.math;
    if (mode.alternate) { if (info.idx % 2) nl = 0; else nm = 0; }
    // У НИШ нет логики: второй слот по очереди — сандық сипаттама, естествознание, языки.
    var second = state.profile.school === 'NIS' ? ['quant', 'science', 'reading'][info.idx % 3] : 'logic';
    var logic = pickTopics(state, second, nl, []);
    var math = pickTopics(state, 'math', nm, []);
    logic.forEach(function (id) { tasks.push({ type: 'topic', topic: id, done: false, video: false }); });
    math.forEach(function (id) { tasks.push({ type: 'topic', topic: id, done: false, video: false }); });
    // Повторение: освоенная тема (≥ 8/10) возвращается через 3, 7 и 21 день — 10 задач.
    var rev = dueReviews(state, date, tasks.map(function (t) { return t.topic; }))[0];
    if (rev) tasks.push({ type: 'review', topic: rev, done: false });
    var test = testFor(state, info);
    if (test) tasks.push({ type: 'test', format: test, done: false });
    var plan = { date: date, tasks: tasks, mock: info.mock };
    state.plans[date] = plan;
    pruneOldPlans(state, date);
    return plan;
  }

  var REVIEW_GAPS = [3, 7, 21];
  function dueReviews(state, date, exclude) {
    return Object.keys(state.topics).filter(function (id) {
      var p = state.topics[id];
      if (!p.masteredAt || exclude.indexOf(id) >= 0 || !Z.topicById[id]) return false;
      var k = p.reviews || 0;
      return k < REVIEW_GAPS.length && U.daysBetween(p.masteredAt, date) >= REVIEW_GAPS[k];
    }).sort(function (a, b) { return state.topics[a].masteredAt < state.topics[b].masteredAt ? -1 : 1; });
  }

  // Храним планы только за последние 60 дней — localStorage не резиновый.
  function pruneOldPlans(state, today) {
    Object.keys(state.plans).forEach(function (d) { if (U.daysBetween(d, today) > 60) delete state.plans[d]; });
  }

  // Неделя вперёд: какие дни — полные пробные (для календаря на главной).
  function weekPreview(state, from) {
    var out = [];
    for (var i = 0; i < 7; i++) {
      var d = U.addDays(from, i), info = dayInfo(state, d), plan = state.plans[d];
      var done = plan ? plan.tasks.filter(function (t) { return t.done; }).length : 0;
      out.push({ date: d, mock: info.mock, test: testFor(state, info), done: done, total: plan ? plan.tasks.length : 0, act: state.activity[d] || 0 });
    }
    return out;
  }

  function touch(state, date) { state.activity[date] = (state.activity[date] || 0) + 1; }

  // Итог практики по теме → прогресс темы и отметка в плане дня.
  // Итог домашки или повторения → прогресс темы; домашка закрывает задание дня.
  function recordPractice(state, topicId, res, date) {
    var p = state.topics[topicId] || { sessions: 0, stars: 0, best: 0, level: 1, solved: 0, correct: 0, hw: 0, grade: 0 };
    p.sessions++;
    p.solved += res.total; p.correct += res.correct;
    p.lastAcc = res.acc; p.best = Math.max(p.best, res.acc);
    p.stars = Math.max(p.stars, res.stars);
    if (res.mode === 'hw') { p.hw = (p.hw || 0) + 1; p.grade = Math.max(p.grade || 0, res.grade); p.lastGrade = res.grade; }
    if (res.mode === 'hw' && res.grade >= 8 && !p.masteredAt) { p.masteredAt = date; p.reviews = 0; }
    var plan0 = state.plans[date];
    if (res.mode === 'quick' && plan0) plan0.tasks.forEach(function (t) {
      if (t.type === 'review' && t.topic === topicId && !t.done) {
        t.done = true;
        // Повторение прошло плохо (< 7/10) — начинаем интервалы заново.
        if (res.grade >= 7) p.reviews = (p.reviews || 0) + 1; else { p.masteredAt = date; p.reviews = 0; }
      }
    });
    p.level = res.nextLevel; p.lastDate = date;
    state.topics[topicId] = p;
    var plan = state.plans[date];
    if (plan && res.mode === 'hw') plan.tasks.forEach(function (t) { if (t.type === 'topic' && t.topic === topicId) t.done = true; });
    touch(state, date);
  }

  /* Тетрадь ошибок: каждая неверно решённая задача (кроме чтения) сохраняется по seed,
   * чтобы её можно было решить ещё раз. Верное решение в «работе над ошибками» удаляет её. */
  function recordMistakes(state, hist, date) {
    state.mistakes = state.mistakes || [];
    hist.forEach(function (h) {
      if (h.ok || h.passage || !h.topic || h.mistakeId) return;
      var id = h.topic + ':' + h.lvl + ':' + h.seed;
      if (state.mistakes.some(function (m) { return m.id === id; })) return;
      state.mistakes.push({ id: id, topic: h.topic, lvl: h.lvl, seed: h.seed, vary: h.vary !== false, date: date });
    });
    hist.forEach(function (h) {
      if (h.mistakeId && h.ok) state.mistakes = state.mistakes.filter(function (m) { return m.id !== h.mistakeId; });
    });
    if (state.mistakes.length > 300) state.mistakes = state.mistakes.slice(-300);
  }

  function recordVideo(state, topicId, date) {
    var plan = state.plans[date];
    if (plan) plan.tasks.forEach(function (t) { if (t.topic === topicId) t.video = true; });
  }

  /* Насколько трудные тексты давать (2–4; уровень A — только разминка в домашке): каждые две работы
   * с текстами (домашка или тест с чтением) поднимают уровень. Последняя домашка ниже 6/10 — ступень назад. */
  function readLevel(state) {
    var p = state.topics.r_read || {}, n = p.hw || 0;
    state.exams.forEach(function (e) { if (/^(BIL_full|BIL_read|NIS_full2|NIS_lang)$/.test(e.format)) n++; });
    var lvl = 2 + Math.floor(n / 2);
    if (p.lastGrade && p.lastGrade < 6) lvl--;
    return Math.max(2, Math.min(4, lvl));
  }

  function recordExam(state, ex, res, date) {
    if (Z.examFormats[ex.format].diag) {
      state.diag = {};
      Object.keys(res.byTopic).forEach(function (t) { state.diag[t] = res.byTopic[t].ok / res.byTopic[t].n; });
    }
    state.exams.push({
      id: 'ex' + Date.now(), format: ex.format, date: date, score: res.score, max: res.max, pct: res.pct,
      correct: res.correct, wrong: res.wrong, skipped: res.skipped, byTopic: res.byTopic, secs: Math.round((Date.now() - ex.startedAt) / 1000)
    });
    if (state.exams.length > 200) state.exams.shift();
    recordMistakes(state, ex.questions.map(function (q, i) {
      return { topic: q.topic, lvl: q.lvl, seed: q.seed, vary: false, passage: q.passage || null, ok: Z.engine.check(q, ex.answers[i]) === true };
    }), date);
    var plan = state.plans[date];
    // Полный пробный засчитывает и короткий тест дня — он заведомо больше.
    var full = Z.examFormats[ex.format].full;
    if (plan) plan.tasks.forEach(function (t) { if (t.type === 'test' && (t.format === ex.format || full)) t.done = true; });
    touch(state, date);
  }

  // Серия: сколько дней подряд ученик занимался (сегодня ещё может не быть).
  function streak(state, today) {
    var n = 0, d = state.activity[today] ? today : U.addDays(today, -1);
    while (state.activity[d]) { n++; d = U.addDays(d, -1); }
    return n;
  }

  // Готовность: доля собранных звёзд по всем темам школы.
  function readiness(state) {
    var ts = Z.topicsFor(state.profile.school), got = 0;
    ts.forEach(function (t) { got += (state.topics[t.id] && state.topics[t.id].stars) || 0; });
    return ts.length ? got / (ts.length * 3) : 0;
  }

  // Прогноз: среднее по трём последним полным пробным.
  function forecast(state) {
    var full = state.exams.filter(function (e) { return Z.examFormats[e.format] && Z.examFormats[e.format].full && Z.examFormats[e.format].school === state.profile.school; });
    if (!full.length) return null;
    var last = full.slice(-3);
    // НИШ: два разных дня с разными максимумами — прогноз в процентах.
    if (state.profile.school === 'NIS') {
      var pc = last.reduce(function (a, e) { return a + Math.max(0, e.score) / e.max; }, 0) / last.length;
      return { score: Math.round(pc * 100), max: 100, pct: true, n: full.length };
    }
    var s = last.reduce(function (a, e) { return a + e.score; }, 0) / last.length;
    return { score: Math.round(s), max: last[last.length - 1].max, n: full.length };
  }

  // Слабые темы по всем пробным тестам: доля верных < 60% (минимум 3 вопроса).
  function weakTopics(state) {
    var agg = {};
    state.exams.forEach(function (e) {
      Object.keys(e.byTopic || {}).forEach(function (t) {
        var a = agg[t] = agg[t] || { ok: 0, n: 0 };
        a.ok += e.byTopic[t].ok; a.n += e.byTopic[t].n;
      });
    });
    return Object.keys(agg).filter(function (t) { return agg[t].n >= 3 && agg[t].ok / agg[t].n < 0.6 && Z.topicById[t]; })
      .sort(function (a, b) { return agg[a].ok / agg[a].n - agg[b].ok / agg[b].n; })
      .map(function (t) { return { topic: t, acc: agg[t].ok / agg[t].n, n: agg[t].n }; });
  }

  Z.planner = {
    INTENSITY: INTENSITY, planFor: planFor, weekPreview: weekPreview, dayInfo: dayInfo, recordPractice: recordPractice,
    recordVideo: recordVideo, recordExam: recordExam, dueReviews: dueReviews, readLevel: readLevel, recordMistakes: recordMistakes, streak: streak, readiness: readiness, forecast: forecast, weakTopics: weakTopics
  };
})(typeof window !== 'undefined' ? window : globalThis);
