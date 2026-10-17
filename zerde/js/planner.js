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
    var fresh = list.filter(function (t) { return !st(t); });
    var review = list.filter(function (t) { return st(t) && st(t).stars >= 3; })
      .sort(function (a, b) { return (st(a).lastDate || '') < (st(b).lastDate || '') ? -1 : 1; });
    return started.concat(fresh, review).slice(0, n).map(function (t) { return t.id; });
  }

  function testFor(state, info) {
    var sc = state.profile.school, mode = INTENSITY[state.profile.intensity || 'normal'];
    if (info.mock) return sc + '_full';
    if (mode.short === 'none' || (mode.short === 'alt' && info.idx % 2 === 1)) return null;
    if (sc === 'BIL') return info.idx % 4 < 2 ? 'BIL_read' : 'BIL_mini';
    return sc + '_mini';
  }

  function planFor(state, date) {
    if (state.plans[date]) return state.plans[date];
    var info = dayInfo(state, date), mode = INTENSITY[state.profile.intensity || 'normal'];
    var tasks = [];
    var nl = mode.logic, nm = mode.math;
    if (mode.alternate) { if (info.idx % 2) nl = 0; else nm = 0; }
    var logic = pickTopics(state, 'logic', nl, []);
    var math = pickTopics(state, 'math', nm, []);
    logic.forEach(function (id) { tasks.push({ type: 'topic', topic: id, done: false, video: false }); });
    math.forEach(function (id) { tasks.push({ type: 'topic', topic: id, done: false, video: false }); });
    var test = testFor(state, info);
    if (test) tasks.push({ type: 'test', format: test, done: false });
    var plan = { date: date, tasks: tasks, mock: info.mock };
    state.plans[date] = plan;
    pruneOldPlans(state, date);
    return plan;
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
      state.mistakes.push({ id: id, topic: h.topic, lvl: h.lvl, seed: h.seed, date: date });
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

  function recordExam(state, ex, res, date) {
    state.exams.push({
      id: 'ex' + Date.now(), format: ex.format, date: date, score: res.score, max: res.max, pct: res.pct,
      correct: res.correct, wrong: res.wrong, skipped: res.skipped, byTopic: res.byTopic, secs: Math.round((Date.now() - ex.startedAt) / 1000)
    });
    if (state.exams.length > 200) state.exams.shift();
    recordMistakes(state, ex.questions.map(function (q, i) {
      return { topic: q.topic, lvl: q.lvl, seed: q.seed, passage: q.passage || null, ok: Z.engine.check(q, ex.answers[i]) === true };
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
    recordVideo: recordVideo, recordExam: recordExam, recordMistakes: recordMistakes, streak: streak, readiness: readiness, forecast: forecast, weakTopics: weakTopics
  };
})(typeof window !== 'undefined' ? window : globalThis);
