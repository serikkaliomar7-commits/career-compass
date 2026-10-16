/* Зерде — проверка генераторов и движка.
 * Запуск: node zerde/tests/run.js
 * Для каждой темы, уровня и формата ответа строим сотни вариантов и проверяем,
 * что ключ корректен, варианты не повторяются, в тексте нет undefined/NaN. */
'use strict';
var path = require('path'), fs = require('fs'), vm = require('vm');
var ctx = { console: console, Math: Math, Date: Date };
ctx.globalThis = ctx;
vm.createContext(ctx);
['util.js', 'gen_math.js', 'gen_logic.js', 'banks.js', 'curriculum.js', 'engine.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f });
});
var Z = ctx.Z, E = Z.engine;
var fails = 0, checks = 0;
function fail(msg) { fails++; if (fails <= +(process.env.SHOW||40)) console.log('FAIL ' + msg); }
function bad(s) { return /undefined|NaN|Infinity|\[object/.test(String(s)); }

var SEEDS = +(process.env.SEEDS || 400);
Z.topics.forEach(function (t) {
  if (t.kind === 'reading') return;
  [1, 2, 3].forEach(function (lvl) {
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
          var minOpts = t.bank ? Math.min(4, mode.options) : mode.options;
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

// Адаптивность: серия верных ответов поднимает уровень до 3.
var ses = E.newSession('m_percent', 'BIL', 1);
while (!ses.done) { E.answer(ses, ses.current.ansKey); E.advance(ses); }
if (ses.maxLevel !== 3) fail('adaptive: level did not reach 3');
var rs = E.sessionResult(ses);
if (rs.stars !== 3) fail('adaptive: all-correct session must give 3 stars, got ' + rs.stars);

console.log((fails ? 'FAILED ' + fails : 'OK') + ' — ' + checks + ' checks');
process.exit(fails ? 1 : 0);
