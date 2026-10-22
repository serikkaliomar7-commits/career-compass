/* Зерде — проверка генераторов и движка.
 * Запуск: node zerde/tests/run.js
 * Для каждой темы, уровня и формата ответа строим сотни вариантов и проверяем,
 * что ключ корректен, варианты не повторяются, в тексте нет undefined/NaN. */
'use strict';
var path = require('path'), fs = require('fs'), vm = require('vm');
var ctx = { console: console, Math: Math, Date: Date };
ctx.globalThis = ctx;
vm.createContext(ctx);
['util.js', 'gen_math.js', 'gen_logic.js', 'gen_olymp.js', 'gen_formats.js', 'gen_abs.js', 'gen_figs.js', 'gen_ktl.js', 'gen_visual.js', 'gen_bil.js', 'gen_bil24.js', 'gen_bil25.js', 'banks.js', 'reading.js', 'curriculum.js', 'practice.js', 'lessons_m1.js', 'lessons_m2.js', 'lessons_other.js', 'engine.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f });
});
var Z = ctx.Z, E = Z.engine;
var fails = 0, checks = 0;
function fail(msg) { fails++; if (fails <= +(process.env.SHOW||40)) console.log('FAIL ' + msg); }
function bad(s) { return /undefined|NaN|Infinity|\[object/.test(String(s)); }

var SEEDS = +(process.env.SEEDS || 400);
Z.topics.forEach(function (t) {
  if (t.kind === 'reading') return;
  if (t.gen && !Z.gen4[t.gen]) fail(t.id + ': no level-4 generator');
  [1, 2, 3, 4].forEach(function (lvl) {
    [{ answer: 'mc', options: 4 }, { answer: 'mc', options: 5 }].forEach(function (mode) {
      for (var s = 1; s <= SEEDS; s++) {
        var tag = t.id + ' L' + lvl + ' ' + mode.answer + (mode.options || '') + ' seed=' + s;
        var q;
        try { q = E.buildQuestion(t.id, lvl, s * 7 + lvl, mode); } catch (e) { fail(tag + ': ' + e.message); continue; }
        checks++;
        if (bad(q.kk) || bad(q.ru)) fail(tag + ': bad text ' + q.kk.slice(0, 120));
        if (bad(q.sol_kk) || bad(q.sol_ru)) fail(tag + ': bad solution ' + q.sol_kk.slice(0, 120));
        {
          var keys = q.options.map(function (o) { return o.key; });
          // Банк логики хранит 3 неверных ответа, поэтому в режиме 5 вариантов допускаем 4.
          var minOpts = (t.bank || q.ansKey.indexOf('s:') === 0) ? Math.min(4, mode.options) : mode.options;   // у текстовых ответов (сравнение, утверждения) по смыслу 4 варианта
          if (keys.length < minOpts || keys.length > mode.options) fail(tag + ': ' + keys.length + ' options');
          var uniq = keys.filter(function (k, i) { return keys.indexOf(k) === i; });
          if (uniq.length !== keys.length) fail(tag + ': duplicate options ' + keys.join(' | '));
          if (keys.filter(function (k) { return k === q.ansKey; }).length !== 1) fail(tag + ': answer not exactly once');
          q.options.forEach(function (o) { if (bad(o.kk)) fail(tag + ': bad option ' + o.kk); });
          var shown = q.options.map(function (o) { return o.kk; });
          if (shown.filter(function (x, i) { return shown.indexOf(x) === i; }).length !== shown.length) fail(tag + ': options look identical ' + shown.join(' | '));
          if (E.check(q, q.ansKey) !== true) fail(tag + ': own key rejected');
        }
      }
    });
  });
});

// Чтение: у каждого вопроса 4 разных варианта и ровно один верный.
var PASSAGES = Z.bank.reading;
PASSAGES.forEach(function (p) {
  E.buildReading(p.id, 5, 4).forEach(function (q, i) {
    checks++;
    var keys = q.options.map(function (o) { return o.key; });
    if (keys.length !== 4 || keys.indexOf(q.ansKey) < 0) fail('reading ' + p.id + ' q' + i);
  });
});

// Пробные тесты: число вопросов и подсчёт баллов.
var expectCount = { BIL_P2023: 60, BIL_P2024: 60, BIL_P2025: 60, BIL_diag: 27, BIL_full: 60, BIL_mini: 15, BIL_read: 10 };
if (Object.keys(Z.schools).join() !== 'BIL') fail('only BIL must remain: ' + Object.keys(Z.schools));
Object.keys(Z.examFormats).forEach(function (fid) { if (!(fid in expectCount)) fail('unexpected format ' + fid); if (Z.examFormats[fid].school !== 'BIL') fail(fid + ' is not BIL'); });
Z.topics.forEach(function (t) { if (t.schools.join() !== 'BIL') fail('topic ' + t.id + ' schools ' + t.schools); });
Object.keys(Z.examFormats).forEach(function (fid) {
  for (var s = 1; s <= 60; s++) {
    var ex = E.buildExam(fid, s * 13);
    checks++;
    if (ex.questions.length !== expectCount[fid]) fail(fid + ' seed=' + s + ': ' + ex.questions.length + ' questions');
    var texts = ex.questions.map(function (q) { return (q.passage || '') + q.kk; });   // «Какой заголовок подходит?» может быть у разных текстов
    if (texts.filter(function (x, i) { return texts.indexOf(x) === i; }).length !== texts.length) fail(fid + ' seed=' + s + ': duplicate questions');
    ex.questions.forEach(function (q, i) { ex.answers[i] = q.type === 'mc' ? q.ansKey : String(q.ansValue); });
    var res = E.scoreExam(ex);
    if (res.score !== res.max || res.correct !== ex.questions.length) fail(fid + ': perfect answers scored ' + res.score + '/' + res.max);
  }
});
var bil = E.buildExam('BIL_full', 99);
var r0 = E.scoreExam(bil);
if (r0.score !== 0 || r0.skipped !== 60) fail('BIL empty sheet must score 0');
bil.questions.forEach(function (q, i) { ex2(q, i); });
function ex2(q, i) { bil.answers[i] = q.options.filter(function (o) { return o.key !== q.ansKey; })[0].key; }
if (E.scoreExam(bil).score !== -60) fail('BIL all wrong must score −60');
if (E.scoreExam(E.buildExam('BIL_full', 3)).max !== 240) fail('BIL max must be 240');

// Домашка: 20 задач лесенкой A→B→C→★, всё верно — 10/10 и ★★★.
var hw = E.newSession('m_percent', 'BIL');
if (hw.n !== 20) fail('homework must have 20 problems, got ' + hw.n);
while (!hw.done) { E.answer(hw, hw.current.ansKey); E.advance(hw); }
var hr = E.sessionResult(hw);
if (hr.grade !== 10 || hr.stars !== 3 || hr.total !== 20) fail('homework all-correct: grade ' + hr.grade + ', stars ' + hr.stars);
if (hr.byLevel[4].n !== 4) fail('homework must end with 4 olympiad problems');

// Ошибка в домашке → следующая задача «повторная» того же уровня и темы, в оценку не идёт.
var hw2 = E.newSession('m_frac', 'BIL'), lvl0 = hw2.current.lvl;
E.answer(hw2, hw2.current.options.filter(function (o) { return o.key !== hw2.current.ansKey; })[0].key); E.advance(hw2);
if (!hw2.current.isRetry || hw2.current.lvl !== lvl0 || hw2.idx !== 0) fail('wrong answer must give a retry problem');
E.answer(hw2, hw2.current.ansKey); E.advance(hw2);
if (hw2.idx !== 1 || hw2.current.isRetry) fail('after retry the homework must continue');
var hr2 = E.sessionResult(hw2);
if (hr2.total !== 1 || hr2.correct !== 0) fail('retries must not count in the grade');

// Разнообразие: в домашке по каждой генерируемой теме — не меньше 4 разных типов задач
// (по началу формулировки), а не одна задача с разными числами.
Z.topics.forEach(function (t) {
  if (!t.gen) return;
  t.schools.forEach(function (sc) {
    var ss = E.newSession(t.id, sc), kinds = {};
    for (var i = 0; i < ss.n; i++) kinds[ss.current ? ss.current.kk.replace(/<[^>]+>/g, '').replace(/[\d−,.\s]+/g, ' ').slice(0, 22) : ''] = 1, E.advance(ss);
    var nk = Object.keys(kinds).length;
    if (nk < 4) fail('variety: ' + t.id + ' ' + sc + ' has only ' + nk + ' problem types in a 20-problem homework');
  });
});

// Банковые темы и чтение: очередь из банка, без повторов.
var bq = E.newSession('l_puzzles', 'BIL');
if (bq.n !== Math.min(E.SESSION_LEN, Z.bank.logic.length)) fail('logic bank homework must take ' + E.SESSION_LEN + ' bank items');
var rq = E.newSession('r_read', 'BIL');
if (rq.n !== 20) fail('reading homework must be 4 passages × 5 = 20, got ' + rq.n);
// Тексты: у каждого 5 вопросов, верный ответ отличается от неверных, 4 варианта.
PASSAGES.forEach(function (p) {
  if (!p.lvl || p.qs.length !== 5) fail('passage ' + p.id + ': lvl/5 questions');
  p.qs.forEach(function (q, i) {
    if (q.wrong.length !== 3 || q.wrong.indexOf(q.ans) >= 0 || new Set(q.wrong).size !== 3) fail('passage ' + p.id + ' q' + i + ' bad options');
  });
  E.buildReading(p.id, 5, 4).forEach(function (q) {
    if (q.options.length !== 4 || q.options.filter(function (o) { return o.key === q.ansKey; }).length !== 1) fail('passage ' + p.id + ' built options');
  });
});
[0, 1, 2].forEach(function (st) {
  var s = E.newSession('r_read', 'BIL', { readStage: st }), lv = s.queue.map(function (q) { return q.lvl; });
  var want = E.READ_STAGES[st];
  for (var k = 0; k < 4; k++) if (lv[k * 5] !== want[k]) fail('reading stage ' + st + ': got ' + lv.join(','));
  if (new Set(s.queue.map(function (q) { return q.passage; })).size !== 4) fail('reading stage ' + st + ' repeats a passage');
});
[1, 2, 3, 4].forEach(function (rl) {
  var ex = E.buildExam('BIL_read', 7 + rl, { readLevel: rl }), lv = ex.questions.map(function (q) { return q.lvl; });
  if (lv[0] !== rl || lv[5] !== Math.min(4, rl + 1)) fail('exam reading level ' + rl + ': ' + lv.join(','));
  var full = E.buildExam('BIL_full', 7 + rl, { readLevel: rl }).questions.filter(function (q) { return q.passage; });
  if (full.length !== 10 || full[0].lvl < 2) fail('full mock reading must be ≥ B');
});
// Планировщик: темы логики и математики, первый день — диагностика, тесты только БИЛ.
['planner.js', 'cloud.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f }); });
var st = { profile: { school: 'BIL', intensity: 'normal', startDate: '2026-01-05', examDate: '2026-12-01' }, topics: {}, plans: {}, exams: [], activity: {}, mistakes: [] };
var kindsSeen = {}, testsSeen = {};
for (var dd = 0; dd < 14; dd++) {
  var pl = Z.planner.planFor(st, Z.util.addDays('2026-01-05', dd));
  pl.tasks.forEach(function (tk) {
    if (tk.type === 'topic') kindsSeen[Z.topicById[tk.topic].kind] = 1;
    else { testsSeen[tk.format] = 1; if (!Z.examFormats[tk.format]) fail('plan has unknown test ' + tk.format); }
  });
}
if (!kindsSeen.logic || !kindsSeen.math) fail('BIL plan kinds: ' + Object.keys(kindsSeen));
if (!testsSeen.BIL_diag) fail('first day must be the diagnostic');
if (!testsSeen.BIL_full || !testsSeen.BIL_mini || !testsSeen.BIL_read) fail('BIL plan tests: ' + Object.keys(testsSeen));
// Диагностика: темы с ошибкой идут первыми.
var st2 = { profile: { school: 'BIL', intensity: 'normal', startDate: '2026-01-05', examDate: '2026-12-01' }, topics: {}, plans: {}, exams: [], activity: {}, mistakes: [] };
var dex = E.buildExam('BIL_diag', 3);
dex.questions.forEach(function (q, i) { dex.answers[i] = q.topic === 'm_volume' || q.topic === 'l_cal' ? q.options.filter(function (o) { return o.key !== q.ansKey; })[0].key : q.ansKey; });
Z.planner.recordExam(st2, dex, E.scoreExam(dex), '2026-01-05');
var p2 = Z.planner.planFor(st2, '2026-01-06').tasks.filter(function (x) { return x.type === 'topic'; }).map(function (x) { return x.topic; });
if (p2.indexOf('m_volume') < 0 || p2.indexOf('l_cal') < 0) fail('after diagnostic weak topics must come first: ' + p2);
// Повторение: освоенная тема возвращается через 3 дня.
st2.topics.m_eq = { stars: 3, hw: 1, grade: 9, masteredAt: '2026-01-06', reviews: 0, level: 3 };
if (Z.planner.dueReviews(st2, '2026-01-08', []).length) fail('review too early');
var p3 = Z.planner.planFor(st2, '2026-01-09');
if (!p3.tasks.some(function (x) { return x.type === 'review' && x.topic === 'm_eq'; })) fail('review must appear after 3 days');
Z.planner.recordPractice(st2, 'm_eq', { mode: 'quick', grade: 9, stars: 3, acc: 0.9, correct: 9, total: 10, nextLevel: 3 }, '2026-01-09');
if (st2.topics.m_eq.reviews !== 1) fail('review must advance');

// Короткое повторение: 10 задач, адаптивный уровень доходит до 4.
var qs = E.newSession('m_eq', 'BIL', { mode: 'quick' });
while (!qs.done) { E.answer(qs, qs.current.ansKey); E.advance(qs); }
if (qs.n !== 10 || qs.maxLevel !== 4) fail('quick session: n=' + qs.n + ' maxLevel=' + qs.maxLevel);

// Тетрадь ошибок: задача восстанавливается по seed в точности.
var q1 = E.buildQuestion('m_work', 3, 4242, E.modeFor('BIL'));
var ms = E.mistakeSession([{ id: 'x', topic: 'm_work', lvl: 3, seed: 4242 }], 'BIL');
if (ms.current.kk !== q1.kk || ms.current.ansKey !== q1.ansKey) fail('mistake replay must rebuild the same problem');

// Уроки: у каждой темы есть урок; 3 примера, 3 вопроса проверки с одним верным ответом.
Z.topics.forEach(function (t) {
  var L = Z.lessons[t.id];
  checks++;
  if (!L) { fail('no lesson for ' + t.id); return; }
  if (L.rule_kk.length !== L.rule_ru.length || L.examples.length !== 3 || L.check.length !== 3) fail('lesson shape ' + t.id);
  L.check.forEach(function (c) { if (new Set([c.ans].concat(c.wrong)).size !== 4 || !c.why_kk || !c.why_ru) fail('lesson check ' + t.id); });
  if (bad(JSON.stringify(L))) fail('lesson text ' + t.id);
});

// Обмен без сервера: код переноса и код отчёта читаются обратно.
ctx.btoa = function (x) { return Buffer.from(x, 'binary').toString('base64'); };
ctx.atob = function (x) { return Buffer.from(x, 'base64').toString('binary'); };
ctx.escape = escape; ctx.unescape = unescape;
st2.profile.name = 'Әлия'; st2.profile.rid = 'r1';
var code = Z.cloud.transferCode(st2), st3 = { profile: null, topics: {}, plans: {}, exams: [], activity: {}, mistakes: [] };
if (!Z.cloud.applyTransfer(st3, code) || st3.profile.name !== 'Әлия' || st3.exams.length !== st2.exams.length) fail('transfer code roundtrip');
var rep = Z.cloud.readReport(Z.cloud.reportCode(st2));
if (!rep || rep.name !== 'Әлия' || rep.rid !== 'r1' || typeof rep.ready !== 'number') fail('report code roundtrip');
if (Z.cloud.readReport('garbage') !== null) fail('bad report code must be rejected');

// Практика: вариант по образцу экзамена — 50 задач по слотам + 10 чтения, воспроизводится по seed.
(function () {
  var pt = Z.practice.test(1), ex = E.buildExam(pt.format, pt.seed), ex2 = E.buildExam(pt.format, pt.seed);
  if (ex.questions.length !== 60) fail('practice test must have 60 questions, got ' + ex.questions.length);
  if (ex.questions.map(function (q) { return q.kk; }).join() !== ex2.questions.map(function (q) { return q.kk; }).join()) fail('practice test must be reproducible');
  if (E.scoreExam(ex).max !== 240) fail('practice max must be 240');
  for (var n = 1; n <= Z.practice.count; n++) {
    var p = Z.practice.test(n), e = E.buildExam(p.format, p.seed);
    e.questions.forEach(function (q, i) { checks++; if (bad(q.kk) || bad(q.ru) || (q.options && q.options.length !== 4)) fail('practice ' + n + ' q' + (i + 1) + ' bad'); });
  }
  if (Z.formatsFor('BIL').some(function (f) { return f.practice; })) fail('practice formats must be hidden from the tests list');
  // Каждая позиция схемы с id формата должна получать именно этот формат на своём уровне.
  Object.keys(Z.blueprints).forEach(function (k) {
    Z.blueprints[k].slots.forEach(function (sl, i) { checks++; if (sl.f && !E.hasFormat(sl.t, sl.f, sl.l)) fail(k + ' slot ' + (i + 1) + ': no format ' + sl.f + ' at level ' + sl.l); });
  });
})();

// Профиль с другой (больше не поддерживаемой) школой переводится на БИЛ; записи об удалённых форматах и темах убираются.
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'store.js'), 'utf8'), ctx, { filename: 'store.js' });
(function () {
  var old = { profile: { school: 'OLD', name: 'X' }, topics: { old_topic: { stars: 1 } }, plans: { '2026-01-05': { tasks: [{ type: 'test', format: 'OLD_full' }] } },
    exams: [{ format: 'OLD_full', score: 10, max: 20 }, { format: 'BIL_full', score: 100, max: 240 }], activeExam: { format: 'OLD_full' }, hw: { m_eq: { school: 'OLD' } },
    mistakes: [{ topic: 'old_topic' }, { topic: 'm_eq' }], paper: [{ fid: 'OLD_full' }], diag: { old_topic: 0 }, activity: {} };
  var m = Z.store.migrate(old);
  if (m.profile.school !== 'BIL' || m.activeExam || Object.keys(m.plans).length || Object.keys(m.hw).length || m.diag) fail('migration must reset a profile of another school');
  if (m.exams.length !== 1 || m.mistakes.length !== 1 || m.paper.length) fail('migration must drop removed formats and topics');
  var ok = { profile: { school: 'BIL' }, plans: { d: { tasks: [{ type: 'test', format: 'BIL_mini' }] } }, exams: [], hw: {}, diag: {} };
  Z.store.migrate(ok);
  if (!ok.plans.d || !ok.diag) fail('migration must keep a BIL profile as is');
  var pf = Z.planner.forecast(m);
  if (!pf || pf.score !== 100 || pf.max !== 240) fail('forecast after migration');
})();

console.log((fails ? 'FAILED ' + fails : 'OK') + ' — ' + checks + ' checks');
process.exit(fails ? 1 : 0);
