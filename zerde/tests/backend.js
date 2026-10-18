/* Зерде — проверка аккаунтов в демо-режиме: регистрация, промокоды, оплата, баллы, родитель.
 * Запуск: node zerde/tests/backend.js */
'use strict';
var path = require('path'), fs = require('fs'), vm = require('vm');
var store = {};
var ctx = { console: console, Math: Math, Date: Date, JSON: JSON, Promise: Promise,
  localStorage: { getItem: function (k) { return k in store ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); }, removeItem: function (k) { delete store[k]; } } };
ctx.globalThis = ctx; ctx.window = ctx;
vm.createContext(ctx);
['config.js', 'util.js', 'backend.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'), ctx, { filename: f }); });
var B = ctx.Z.backend, fails = 0;
function ok(c, m) { if (!c) { fails++; console.log('FAIL ' + m); } }

(async function () {
  ok(B.mode === 'demo', 'demo mode without config');
  var a = await B.signUp({ role: 'student', name: 'Әлия', email: 'a@x.kz', password: 'secret1', school: 'BIL', grade: 6 });
  ok(a.role === 'student' && B.hasAccess(a) && B.daysLeft(a) === 3, 'student gets 3 trial days');
  ok(!('pass' in a), 'password not exposed');
  try { await B.signUp({ role: 'admin', email: 'a@x.kz', password: 'secret1' }); ok(false, 'duplicate email'); } catch (e) { ok(e.code === 'exists', 'duplicate email code'); }
  var adm = await B.signUp({ role: 'admin', name: 'X', email: 'adm@x.kz', password: 'secret1' });
  ok(adm.role === 'student', 'role admin cannot be chosen at signup');
  ok((await B.redeemPromo('zerde-admin')).ok, 'admin promo');
  ok((await B.session()).role === 'admin', 'became admin');
  ok((await B.redeemPromo('ZERDE-ADMIN')).error === 'already', 'promo once per user');
  ok((await B.admin.createPromo({ code: 'FAMILY', kind: 'free', days: 30, maxUses: 1 })).ok, 'create promo');
  ok((await B.admin.createPromo({ code: 'SALE20', kind: 'discount', percent: 20 })).ok, 'create discount');
  await B.admin.saveSettings({ kaspi: { phone: '+7 700', name: 'Z' } });
  await B.signOut();
  // ученик: оплата со скидкой → подтверждение админом
  var b = await B.signUp({ role: 'student', name: 'Ерлан', email: 'b@x.kz', password: 'secret2', school: 'NIS', grade: 6 });
  var pr = await B.requestPayment('m3', 'SALE20');
  ok(pr.ok && pr.amount === 60000 && pr.months === 3, 'discounted payment 75000 → 60000');
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
  var p = await B.signUp({ role: 'parent', name: 'Серік', email: 'p@x.kz', password: 'secret3' });
  ok(p.role === 'parent' && B.hasAccess(p), 'parent has access');
  ok((await B.linkChild('nope')).error === 'not_found', 'bad child code');
  ok((await B.linkChild(code.toLowerCase())).ok, 'link child by code');
  var kids = await B.children();
  ok(kids.length === 1 && kids[0].name === 'Ерлан', 'parent sees child');
  var lb = await B.leaderboard();
  ok(lb.length === 1 && lb[0].points === 500 && lb[0].name === 'Ерлан', 'leaderboard: only students, month sum');
  await B.signOut();
  // админ подтверждает оплату → доступ на 3 месяца
  await B.signIn({ email: 'adm@x.kz', password: 'secret1' });
  var pend = await B.admin.payments('pending');
  ok(pend.length === 1, 'pending payment visible to admin');
  ok((await B.admin.decidePayment(pend[0].id, true)).ok, 'approve');
  var users = await B.admin.users('ерлан');
  ok(users.length === 1 && B.daysLeft(users[0]) >= 89, 'subscription extended ~3 months');
  try { await B.signIn({ email: 'adm@x.kz', password: 'wrong' }); ok(false, 'bad password'); } catch (e) { ok(e.code === 'bad_login', 'bad password code'); }
  console.log(fails ? 'FAILED ' + fails : 'OK — backend demo');
  process.exit(fails ? 1 : 0);
})().catch(function (e) { console.log('CRASH', e); process.exit(1); });
