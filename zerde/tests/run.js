/* Зерде — проверка генераторов и движка.
 * Запуск: node zerde/tests/run.js
 * Для каждой темы, уровня и формата ответа строим сотни вариантов и проверяем,
 * что ключ корректен, варианты не повторяются, в тексте нет undefined/NaN. */
'use strict';
var path = require('path'), fs = require('fs'), vm = require('vm');
var ctx = { console: console, Math: Math, Date: Date };
ctx.globalThis = ctx;
vm.createContext(ctx);
['util.js', 'gen_math.js', 'gen_logic.js', 'gen_olymp.js', 'gen_formats.js', 'banks.js', 'curriculum.js', 'engine.js'].forEach(function (f) {
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

// Чтение: у каждого вопроса 4 разных варианта и ровно один верный.
Z.bank.reading.forEach(function (p) {
  E.buildReading(p.id, 5, 4).forEach(function (q, i) {
    checks++;
    var keys = q.options.map(function (o) { return o.key; });
    if (keys.length !== 4 || keys.indexOf(q.ansKey) < 0) fail('reading ' + p.id + ' q' + i);
  });
});

// Пробные тесты: число вопросов и подсчёт баллов.
var expectCount = { BIL_full: 60, BIL_mini: 15, BIL_read: 10, RFMSH_full: 30, RFMSH_mini: 9 };
Object.keys(Z.examFormats).forEach(function (fid) {
  for (var s = 1; s <= 60; s++) {
    var ex = E.buildExam(fid, s * 13);
    checks++;
    if (ex.questions.length !== expectCount[fid]) fail(fid + ' seed=' + s + ': ' + ex.questions.length + ' questions');
    var texts = ex.questions.map(function (q) { return q.kk; });
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
  ['BIL', 'RFMSH'].forEach(function (sc) {
    var ss = E.newSession(t.id, sc), kinds = {};
    for (var i = 0; i < ss.n; i++) kinds[ss.current ? ss.current.kk.replace(/<[^>]+>/g, '').replace(/[\d−,.\s]+/g, ' ').slice(0, 22) : ''] = 1, E.advance(ss);
    var nk = Object.keys(kinds).length;
    if (nk < 4) fail('variety: ' + t.id + ' ' + sc + ' has only ' + nk + ' problem types in a 50-problem homework');
  });
});

// Банковые темы и чтение: очередь из банка, без повторов.
var bq = E.newSession('l_puzzles', 'BIL');
if (bq.n !== Z.bank.logic.length) fail('logic bank homework must use every bank item');
var rq = E.newSession('r_read', 'BIL');
if (rq.n !== Z.bank.reading.length * 5) fail('reading homework must use all passages');
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

console.log((fails ? 'FAILED ' + fails : 'OK') + ' — ' + checks + ' checks');
process.exit(fails ? 1 : 0);
