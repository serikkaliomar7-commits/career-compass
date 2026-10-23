/* Зерде — проверка аккаунтов в демо-режиме: регистрация, промокоды, оплата, баллы, родитель.
 * Запуск: node zerde/tests/backend.js */
'use strict';
var path = require('path'), fs = require('fs'), vm = require('vm');
var store = {};
var ctx = { console: console, Math: Math, Date: Date, JSON: JSON, Promise: Promise,
  localStorage: { getItem: function (k) { return k in store ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); }, removeItem: function (k) { delete store[k]; } } };
ctx.globalThis = ctx; ctx.window = ctx; ctx.crypto = require('crypto').webcrypto; ctx.TextEncoder = TextEncoder;
vm.createContext(ctx);
['config.js', 'util.js', 'backend.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f }); });
var B = ctx.Z.backend, fails = 0;
function ok(c, m) { if (!c) { fails++; console.log('FAIL ' + m); } }

(async function () {
  ok(B.mode === 'demo', 'demo mode without config');
  var a = await B.signUp({ consent: true, role: 'student', name: 'Әлия', email: 'a@x.kz', password: 'kokzhiyek1', school: 'BIL', grade: 6 });
  ok(a.role === 'student' && B.hasAccess(a) && B.daysLeft(a) === 3, 'student gets 3 trial days');
  ok(!('pass' in a), 'password not exposed');
  ok(a.consentAt && Math.abs(Date.now() - +new Date(a.consentAt)) < 60000 && a.consentVersion === B.CONSENT_VERSION, 'consent time and version stored');
  try { await B.signUp({ role: 'student', name: 'NoConsent', email: 'nc@x.kz', password: 'kokzhiyek1' }); ok(false, 'signup without consent must fail'); } catch (e) { ok(e.code === 'consent', 'no consent → consent error, got ' + (e && e.code)); }
  ok(B.payCode(42) === 'ZRD-1042' && B.payCode('7') === 'ZRD-1007', 'payment code from id');
  try { await B.signUp({ consent: true, role: 'admin', email: 'a@x.kz', password: 'kokzhiyek1' }); ok(false, 'duplicate email'); } catch (e) { ok(e.code === 'exists', 'duplicate email code'); }
  var adm = await B.signUp({ consent: true, role: 'admin', name: 'X', email: 'adm@x.kz', password: 'kokzhiyek1' });
  ok(adm.role === 'student', 'role admin cannot be chosen at signup');
  ok((await B.redeemPromo('zerde-admin')).ok, 'admin promo');
  ok((await B.session()).role === 'admin', 'became admin');
  ok((await B.redeemPromo('ZERDE-ADMIN')).error === 'already', 'promo once per user');
  ok((await B.admin.createPromo({ code: 'FAMILY', kind: 'free', days: 30, maxUses: 1 })).ok, 'create promo');
  ok((await B.admin.createPromo({ code: 'SALE20', kind: 'discount', percent: 20 })).ok, 'create discount');
  await B.admin.saveSettings({ kaspi: { phone: '+7 700', name: 'Z' } });
  await B.signOut();
  // ученик: оплата со скидкой → подтверждение админом
  var b = await B.signUp({ consent: true, role: 'student', name: 'Ерлан', email: 'b@x.kz', password: 'kokzhiyek2', school: 'BIL', grade: 6 });
  var pr = await B.requestPayment('m3', 'SALE20');
  ok(pr.ok && pr.amount === 60000 && pr.months === 3, 'discounted payment 75000 → 60000');
  ok(pr.code === B.payCode(pr.id), 'payment has code ' + pr.code);
  var pr2 = await B.requestPayment('m3', 'SALE20');
  ok(pr2.ok && pr2.id === pr.id, 'same unpaid request is reused, not duplicated');
  ok((await B.markPaid(pr.id, 'Ерлан Б.', '12a4')).error === 'payer_phone4', 'mark_paid: 4 digits required');
  ok((await B.markPaid(pr.id, '  ', '1234')).error === 'payer_name', 'mark_paid: name required');
  ok((await B.markPaid(pr.id, '  Ерлан   Б. ', '1234')).ok, 'mark_paid own pending');
  var mp = (await B.myPayments())[0];
  ok(mp.payerName === 'Ерлан Б.' && mp.payerPhone4 === '1234' && mp.paidAt && mp.code === pr.code && mp.status === 'pending', 'payer info saved on payment');
  var prOther = await B.requestPayment('m1');
  ok(prOther.ok && prOther.id !== pr.id, 'new plan → new request');
  ok((await B.admin.decidePayment(pr.id, true)).ok === false, 'student cannot approve payments');
  // баллы: лимит за действие, повтор не засчитывается, лимит в день
  ok((await B.addPoints('hw', 'm_eq:1', 999)).amount === 100, 'hw cap 100');
  ok((await B.addPoints('hw', 'm_eq:1', 50)).amount === 0, 'same action not twice');
  ok((await B.addPoints('hacker', 'x', 1000)).amount === 0, 'unknown kind gives nothing');
  for (var i = 0; i < 10; i++) await B.addPoints('mock', 'm' + i, 150);
  ok((await B.myPoints()) === 500, 'daily cap 500');
  var code = b.childCode;
  await B.signOut();
  // родитель
  var p = await B.signUp({ consent: true, role: 'parent', name: 'Серік', email: 'p@x.kz', password: 'kokzhiyek3' });
  ok(p.role === 'parent' && B.hasAccess(p), 'parent has access');
  ok((await B.markPaid(pr.id, 'Hacker', '0000')).error === 'not_found', 'mark_paid: not for someone else\'s payment');
  ok((await B.linkChild('nope')).error === 'not_found', 'bad child code');
  ok((await B.linkChild(code.toLowerCase())).ok, 'link child by code');
  var kids = await B.children();
  ok(kids.length === 1 && kids[0].name === 'Ерлан', 'parent sees child');
  var lb = await B.leaderboard();
  ok(lb.length === 1 && lb[0].points === 500 && lb[0].name === 'Ерлан', 'leaderboard: only students, month sum');
  await B.signOut();
  // админ подтверждает оплату → доступ на 3 месяца
  await B.signIn({ email: 'adm@x.kz', password: 'kokzhiyek1' });
  var pend = await B.admin.payments('pending');
  ok(pend.length === 2, 'pending payments visible to admin: ' + pend.length);
  var pp = pend.filter(function (x) { return x.id === pr.id; })[0];
  ok(pp && pp.code === pr.code && pp.payerName === 'Ерлан Б.' && pp.payerPhone4 === '1234' && pp.email === 'b@x.kz' && pp.paidAt, 'admin sees code, payer name/phone4, email');
  ok((await B.admin.decidePayment(pr.id, true)).ok, 'approve');
  ok((await B.admin.decidePayment(prOther.id, false, 'Аударма табылмады')).ok, 'reject with reason');
  ok((await B.admin.decidePayment(pr.id, false)).ok === false, 'decided payment cannot be decided again');
  ok((await B.admin.payments('pending')).length === 0, 'no pending left');
  var sc = await B.admin.selfCheck();
  ok(sc.filter(function (x) { return x.k === 'mode'; })[0].ok === false, 'self-check flags demo mode');
  var users = await B.admin.users('ерлан');
  ok(users.length === 1 && B.daysLeft(users[0]) >= 89, 'subscription extended ~3 months');
  await B.signOut(); await B.signIn({ email: 'b@x.kz', password: 'kokzhiyek2' });
  var myp = await B.myPayments(), rej = myp.filter(function (x) { return x.id === prOther.id; })[0];
  ok(rej && rej.status === 'rejected' && rej.note === 'Аударма табылмады', 'student sees rejection reason');
  ok((await B.markPaid(pr.id, 'Ерлан', '1234')).error === 'state', 'mark_paid only while pending');
  ok((await B.admin.payments()).length === 0, 'student cannot list all payments');
  await B.signOut(); await B.signIn({ email: 'adm@x.kz', password: 'kokzhiyek1' });
  try { await B.signIn({ email: 'adm@x.kz', password: 'wrong' }); ok(false, 'bad password'); } catch (e) { ok(e.code === 'bad_login', 'bad password code'); }
  // Безопасность: пароли, хеш, блокировка подбора
  for (var w of [['short', 'ab1'], ['mix', 'onlyletters'], ['mix', '1234567890123'], ['common', 'password1']]) {
    try { await B.signUp({ consent: true, role: 'student', email: 'w' + w[0] + Math.random() + '@x.kz', password: w[1] }); ok(false, 'weak password accepted: ' + w[1]); } catch (e) { ok(e.code === 'pass_' + w[0], 'weak password code ' + w[0] + ' got ' + e.code); }
  }
  try { await B.signUp({ consent: true, role: 'student', email: 'not-an-email', password: 'kokzhiyek9' }); ok(false, 'bad email'); } catch (e) { ok(e.code === 'bad_email', 'bad email code'); }
  var raw = JSON.parse(store['zerde.accounts']), adU = Object.values(raw.users).filter(function (x) { return x.email === 'adm@x.kz'; })[0];
  ok(/^p2\$[0-9a-f]{32}\$[0-9a-f]{64}$/.test(adU.pass), 'password stored as PBKDF2 with salt');
  await B.signOut();
  for (var k = 0; k < 4; k++) { try { await B.signIn({ email: 'b@x.kz', password: 'nope' + k }); } catch (e) { ok(e.code === 'bad_login', 'wrong pass ' + k); } }
  try { await B.signIn({ email: 'b@x.kz', password: 'nope5' }); } catch (e) { ok(e.code === 'locked', '5th wrong password locks'); }
  try { await B.signIn({ email: 'b@x.kz', password: 'kokzhiyek2' }); ok(false, 'locked account must not log in'); } catch (e) { ok(e.code === 'locked', 'locked even with right password'); }
  // старый хеш переводится на PBKDF2 при входе
  raw = JSON.parse(store['zerde.accounts']); var pu = Object.values(raw.users).filter(function (x) { return x.email === 'p@x.kz'; })[0];
  var h = 5381, pw = 'kokzhiyek3'; for (var c = 0; c < pw.length; c++) h = ((h << 5) + h + pw.charCodeAt(c)) | 0; pu.pass = 'h' + (h >>> 0).toString(36); store['zerde.accounts'] = JSON.stringify(raw);
  ok((await B.signIn({ email: 'p@x.kz', password: 'kokzhiyek3' })).role === 'parent', 'legacy hash login');
  raw = JSON.parse(store['zerde.accounts']); ok(/^p2\$/.test(Object.values(raw.users).filter(function (x) { return x.email === 'p@x.kz'; })[0].pass), 'legacy hash upgraded');
  await B.signOut();
  // Журнал и админ-обзор
  await B.signIn({ email: 'a@x.kz', password: 'kokzhiyek1' });
  await B.log('hw', { topic: 'm_eq', grade: 9, ok: 18, n: 20 }); await B.log('hacker', { x: 1 }); await B.touch();
  await B.saveProgress({ topics: { m_eq: { sessions: 1, grade: 9, solved: 20, hw: 1 } } }, { mastered: 1, topicsTotal: 27, hw7: 1, ready: 12 });
  await B.signOut();
  ok((await B.admin.overview()).length === 0, 'overview hidden when signed out');
  await B.signIn({ email: 'adm@x.kz', password: 'kokzhiyek1' });
  var ov = await B.admin.overview(), al = ov.filter(function (x) { return x.email === 'a@x.kz'; })[0];
  ok(ov.length >= 4 && al && al.summary && al.summary.mastered === 1 && al.lastSeen && al.createdAt, 'admin overview with summary, last seen, created');
  ok(!ov.some(function (x) { return 'pass' in x; }), 'overview hides password hashes');
  var det = await B.admin.userDetail(al.id), kinds = det.activity.map(function (x) { return x.kind; });
  ok(kinds.indexOf('signup') >= 0 && kinds.indexOf('login') >= 0 && kinds.indexOf('hw') >= 0 && kinds.indexOf('hacker') < 0, 'activity log: signup, login, hw; unknown kinds dropped');
  ok(det.state && det.state.topics.m_eq.grade === 9, 'admin sees topic progress');
  ok((await B.admin.createPromo({ code: 'BOSS-2026', kind: 'admin' })).ok, 'create admin promo');
  var bp = (await B.admin.promos()).filter(function (x) { return x.code === 'BOSS-2026'; })[0];
  ok(bp.maxUses === 1, 'admin promo is single-use by default');
  console.log(fails ? 'FAILED ' + fails : 'OK — backend demo');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log('CRASH', e); process.exit(1); });
