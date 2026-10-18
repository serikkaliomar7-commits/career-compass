/* Зерде — проверка генераторов и движка.
 * Запуск: node zerde/tests/run.js
 * Для каждой темы, уровня и формата ответа строим сотни вариантов и проверяем,
 * что ключ корректен, варианты не повторяются, в тексте нет undefined/NaN. */
'use strict';
var path = require('path'), fs = require('fs'), vm = require('vm');
var ctx = { console: console, Math: Math, Date: Date };
ctx.globalThis = ctx;
vm.createContext(ctx);
['util.js', 'gen_math.js', 'gen_logic.js', 'gen_olymp.js', 'gen_formats.js', 'gen_nis.js', 'gen_figs.js', 'banks.js', 'reading.js', 'reading_ru.js', 'reading_en.js', 'science.js', 'curriculum.js', 'lessons_m1.js', 'lessons_m2.js', 'lessons_other.js', 'engine.js'].forEach(function (f) {
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
    [{ answer: 'mc', options: 4 }, { answer: 'mc', options: 5 }, { answer: 'int' }].forEach(function (mode) {
      if (mode.answer === 'int' && t.schools.indexOf('RFMSH') < 0) return;
      for (var s = 1; s <= SEEDS; s++) {
        var tag = t.id + ' L' + lvl + ' ' + mode.answer + (mode.options || '') + ' seed=' + s;
        var q;
        try { q = E.buildQuestion(t.id, lvl, s * 7 + lvl, mode); } catch (e) { fail(tag + ': ' + e.message); continue; }
        checks++;
        if (bad(q.kk) || bad(q.ru)) fail(tag + ': bad text ' + q.kk.slice(0, 120));
        if (bad(q.sol_kk) || bad(q.sol_ru)) fail(tag + ': bad solution ' + q.sol_kk.slice(0, 120));
        if (mode.answer === 'int') {
          if (typeof q.ansValue !== 'number' || q.ansValue % 1 !== 0) fail(tag + ': non-integer answer ' + q.ansValue);
          if (E.check(q, String(q.ansValue)) !== true) fail(tag + ': own answer rejected');
        } else {
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

// Чтение: у каждого вопроса 4 разных варианта и ровно один верный (казахский, русский, английский).
var PASSAGES = Z.bank.reading.concat(Z.bank.reading_ru, Z.bank.reading_en);
PASSAGES.forEach(function (p) {
  E.buildReading(p.id, 5, 4).forEach(function (q, i) {
    checks++;
    var keys = q.options.map(function (o) { return o.key; });
    if (keys.length !== 4 || keys.indexOf(q.ansKey) < 0) fail('reading ' + p.id + ' q' + i);
  });
});

// Пробные тесты: число вопросов и подсчёт баллов.
var expectCount = { BIL_diag: 25, RFMSH_diag: 25, NIS_diag: 28, BIL_full: 60, BIL_mini: 15, BIL_read: 10, RFMSH_full: 30, RFMSH_mini: 9, NIS_full: 120, NIS_full2: 60, NIS_mini: 20, NIS_quant: 30, NIS_sci: 10, NIS_lang: 15 };
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
if (E.buildExam('BIL_full', 1).questions.length && E.scoreExam(E.buildExam('RFMSH_full', 3)).max !== 150) fail('RFMSH max must be 150');
if (E.scoreExam(E.buildExam('BIL_full', 3)).max !== 240) fail('BIL max must be 240');

// Домашка: 50 задач лесенкой A→B→C→★, всё верно — 10/10 и ★★★.
var hw = E.newSession('m_percent', 'BIL');
if (hw.n !== 50) fail('homework must have 50 problems, got ' + hw.n);
while (!hw.done) { E.answer(hw, hw.current.ansKey); E.advance(hw); }
var hr = E.sessionResult(hw);
if (hr.grade !== 10 || hr.stars !== 3 || hr.total !== 50) fail('homework all-correct: grade ' + hr.grade + ', stars ' + hr.stars);
if (hr.byLevel[4].n !== 8) fail('homework must end with 8 olympiad problems');

// Ошибка в домашке → следующая задача «повторная» того же уровня и темы, в оценку не идёт.
var hw2 = E.newSession('m_frac', 'RFMSH'), lvl0 = hw2.current.lvl;
E.answer(hw2, '-99999'); E.advance(hw2);
if (!hw2.current.isRetry || hw2.current.lvl !== lvl0 || hw2.idx !== 0) fail('wrong answer must give a retry problem');
E.answer(hw2, String(hw2.current.ansValue)); E.advance(hw2);
if (hw2.idx !== 1 || hw2.current.isRetry) fail('after retry the homework must continue');
var hr2 = E.sessionResult(hw2);
if (hr2.total !== 1 || hr2.correct !== 0) fail('retries must not count in the grade');

// Разнообразие: в домашке по каждой генерируемой теме — не меньше 4 разных типов задач
// (по началу формулировки), а не одна задача с разными числами.
Z.topics.forEach(function (t) {
  if (!t.gen) return;
  t.schools.forEach(function (sc) {
    var ss = E.newSession(t.id, sc), kinds = {};
    // У «Сандық сипаттама» общая первая фраза — смотрим на содержимое колонок.
    for (var i = 0; i < ss.n; i++) kinds[ss.current ? ss.current.kk.replace('А және В бағандарын салыстырыңыз.', '').replace(/<[^>]+>/g, '').replace(/[\d−,.\s]+/g, ' ').slice(0, 22) : ''] = 1, E.advance(ss);
    var nk = Object.keys(kinds).length;
    if (nk < 4) fail('variety: ' + t.id + ' ' + sc + ' has only ' + nk + ' problem types in a 50-problem homework');
  });
});

// Банковые темы и чтение: очередь из банка, без повторов.
var bq = E.newSession('l_puzzles', 'BIL');
if (bq.n !== Z.bank.logic.length) fail('logic bank homework must use every bank item');
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
// НИШ.
// «Сандық сипаттама»: варианты всегда в порядке A, B, C (равны), D (нет информации), встречаются все четыре.
var qcSeen = {};
for (var s3 = 1; s3 <= 600; s3++) {
  var qc = E.buildQuestion('q_compare', 1 + s3 % 4, s3, E.modeFor('NIS'));
  if (!qc.fixed || qc.options[2].kk !== 'Екі шама тең' || qc.options[3].ru !== 'Недостаточно информации') fail('q_compare options must be fixed A/B/C/D');
  qcSeen[qc.options.map(function (o) { return o.key; }).indexOf(qc.ansKey)] = 1;
}
if (Object.keys(qcSeen).length !== 4) fail('q_compare must use all four answers');
// Естествознание: русские варианты на месте.
var sq = E.buildQuestion('s_science', 2, 11, E.modeFor('NIS'));
if (sq.options.some(function (o) { return !o.ru || o.ru === o.kk && /[әіңғүұқөһ]/i.test(o.kk); })) fail('science options must have Russian text');
if (E.newSession('s_science', 'NIS').n !== 50) fail('science homework must be 50 problems');
// 1-й день: три раздела со своим временем, вопросы раздела идут подряд.
var d1 = E.buildExam('NIS_full', 5);
if (!d1.secs || d1.secs.length !== 3 || d1.secs[0].to !== 40 || d1.secs[1].to !== 100 || d1.secs[2].to !== 120 || d1.secs[1].minutes !== 30) fail('NIS day 1 sections: ' + JSON.stringify(d1.secs));
if (d1.questions.slice(40, 100).some(function (q) { return q.topic !== 'q_compare'; })) fail('NIS day 1 section 2 must be q_compare');
if (d1.questions.slice(100).some(function (q) { return q.topic !== 's_science'; })) fail('NIS day 1 section 3 must be science');
var d1s = E.scoreExam(d1);
if (Object.keys(d1s.bySection).length !== 3 || d1s.bySection[1].n !== 60) fail('NIS bySection');
// 2-й день: казахский, русский, английский по 20.
var d2 = E.buildExam('NIS_full2', 9, { readLevel: 3 });
['r_read', 'r_ru', 'r_en'].forEach(function (tp, k) {
  if (d2.questions.slice(k * 20, k * 20 + 20).some(function (q) { return q.topic !== tp; })) fail('NIS day 2 section ' + k + ' must be ' + tp);
});
// Планировщик НИШ: без логики, второй слот — сандық сипаттама / естествознание / языки.
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'planner.js'), 'utf8'), ctx, { filename: 'planner.js' });
var st = { profile: { school: 'NIS', intensity: 'normal', startDate: '2026-01-05', examDate: '2026-12-01' }, topics: {}, plans: {}, exams: [], activity: {}, mistakes: [] };
var kindsSeen = {}, testsSeen = {};
for (var dd = 0; dd < 14; dd++) {
  var pl = Z.planner.planFor(st, Z.util.addDays('2026-01-05', dd));
  pl.tasks.forEach(function (tk) {
    if (tk.type === 'topic') kindsSeen[Z.topicById[tk.topic].kind] = 1;
    else { testsSeen[tk.format] = 1; if (Z.examFormats[tk.format].school !== 'NIS') fail('NIS plan has foreign test ' + tk.format); }
  });
}
if (kindsSeen.logic || !kindsSeen.quant || !kindsSeen.science || !kindsSeen.reading || !kindsSeen.math) fail('NIS plan kinds: ' + Object.keys(kindsSeen));
if (!testsSeen.NIS_diag) fail('first day must be the diagnostic');
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
if (!testsSeen.NIS_full || !testsSeen.NIS_full2) fail('NIS plan must have both mock days: ' + Object.keys(testsSeen));

var rfq = E.newSession('l_puzzles', 'RFMSH');
rfq.queue.forEach(function (q) { if (q.type !== 'int') fail('RFMSH bank queue must be integer-answer'); });

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

console.log((fails ? 'FAILED ' + fails : 'OK') + ' — ' + checks + ' checks');
process.exit(fails ? 1 : 0);
