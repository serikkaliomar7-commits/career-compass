/* Зерде — аккаунты, доступ, оплата, промокоды, баллы.
 *
 * Два режима с одинаковым интерфейсом (все методы возвращают Promise):
 *   supabase — боевой: если в js/config.js заданы supabaseUrl и supabaseKey. Деньги, доступ, промокоды
 *              и баллы решает сервер (supabase/schema.sql), страница только просит.
 *   demo     — всё хранится в этом браузере, чтобы сайт работал без сервера и его можно было показать.
 *              Подходит для проверки и для близких; продавать в демо-режиме нельзя: код страницы открыт.
 *
 * Пользователь: { id, email, role: student|parent|admin, name, school, grade, childCode, subUntil, trialUntil } */
(function (root) {
  'use strict';
  var Z = root.Z;
  var CFG = Z.config || {};
  var DAY = 86400000;
  var POINT_CAPS = { hw: 100, quick: 20, review: 30, mock: 150, test: 50, diag: 50, day: 30, cards: 20, game: 30 };
  var DEFAULTS = {
    prices: { m1: { months: 1, amount: 30000 }, m3: { months: 3, amount: 75000 }, m6: { months: 6, amount: 120000 } },
    trial_days: 3, kaspi: { phone: '', name: '' }, prizes: { kk: '', ru: '' }
  };

  function hasAccess(u) {
    if (!u) return false;
    if (u.role === 'admin' || u.role === 'parent') return true;
    var now = Date.now();
    return (u.subUntil && +new Date(u.subUntil) > now) || (u.trialUntil && +new Date(u.trialUntil) > now);
  }
  function daysLeft(u) {
    var t = Math.max(u.subUntil ? +new Date(u.subUntil) : 0, u.trialUntil ? +new Date(u.trialUntil) : 0);
    return t > Date.now() ? Math.ceil((t - Date.now()) / DAY) : 0;
  }
  function monthKey(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2); }
  // Пароль: не меньше 8 символов, есть буква и цифра, не из списка самых частых.
  var COMMON = ['12345678', '123456789', '1234567890', 'qwerty123', 'password1', 'qwertyui', '11111111', '00000000', 'zerde123', 'asdfgh12', 'qazwsx12', 'password'];
  function passIssue(p) {
    p = String(p || '');
    if (p.length < 8) return 'pass_short';
    if (!/[A-Za-zА-Яа-яӘәІіҢңҒғҮүҰұҚқӨөҺһЁё]/.test(p) || !/\d/.test(p)) return 'pass_mix';
    if (COMMON.indexOf(p.toLowerCase()) >= 0) return 'pass_common';
    return null;
  }
  // Что пишем в журнал активности (админ видит, кто что делал). Остальное отбрасываем.
  var LOG_KINDS = ['signup', 'login', 'visit', 'hw', 'quick', 'review', 'mock', 'test', 'diag', 'cards', 'game', 'lesson', 'promo', 'pay', 'admin'];

  /* =================== ДЕМО (localStorage) =================== */
  function demo() {
    var KEY = 'zerde.accounts', memDb = null;   // memDb — запасная копия, если браузер не даёт localStorage
    function db() {
      var d = null;
      try { d = JSON.parse(root.localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
      if (!d && memDb) d = JSON.parse(JSON.stringify(memDb));
      if (!d) {
        d = { users: {}, session: null, promos: {}, redemptions: {}, payments: [], points: [], links: [], progress: {}, settings: JSON.parse(JSON.stringify(DEFAULTS)) };
        // Демо-промокоды, чтобы можно было сразу всё попробовать. В боевом режиме их нет — коды создаёт админ.
        d.promos['ZERDE-ADMIN'] = { code: 'ZERDE-ADMIN', kind: 'admin', used: 0, note: 'демо' };
        d.promos['ZERDE-FREE'] = { code: 'ZERDE-FREE', kind: 'free', days: null, used: 0, note: 'демо: доступ навсегда' };
      }
      return d;
    }
    function put(d) { memDb = d; try { root.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* приватный режим — живём на memDb */ } }
    function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return 'h' + (h >>> 0).toString(36); }   // старый формат — только для миграции
    // PBKDF2-SHA256, 120 000 итераций, своя соль у каждого пользователя. Без WebCrypto — запасной хеш.
    function rnd(n) { var a = new Uint8Array(n); try { root.crypto.getRandomValues(a); } catch (e) { for (var i = 0; i < n; i++) a[i] = Math.random() * 256 | 0; } return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
    function pbkdf2(pass, salt) {
      var c = root.crypto && root.crypto.subtle;
      if (!c || !root.TextEncoder) return Promise.resolve('h1$' + salt + '$' + hash(salt + pass));
      var enc = new root.TextEncoder();
      return c.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']).then(function (k) {
        return c.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 120000 }, k, 256);
      }).then(function (bits) { return 'p2$' + salt + '$' + Array.prototype.map.call(new Uint8Array(bits), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); });
    }
    function checkPass(u, pass) {
      var st = String(u.pass || '');
      if (st.indexOf('$') < 0) return Promise.resolve(st === hash(pass));   // старый аккаунт
      return pbkdf2(pass, st.split('$')[1]).then(function (h) { return h === st; });
    }
    // Защита от подбора: 5 неверных паролей подряд — вход для этой почты закрыт на 10 минут.
    var LOCK_N = 5, LOCK_MS = 10 * 60000;
    function logAct(d, uid, kind, info) {
      if (LOG_KINDS.indexOf(kind) < 0) return;
      d.activity = d.activity || [];
      d.activity.push({ user: uid, kind: kind, info: info || {}, at: new Date().toISOString() });
      if (d.activity.length > 5000) d.activity.splice(0, d.activity.length - 5000);
      if (d.users[uid]) d.users[uid].lastSeen = new Date().toISOString();
    }
    function pub(u) { if (!u) return null; var o = {}; for (var k in u) if (k !== 'pass') o[k] = u[k]; return o; }
    function me(d) { return d.session && d.users[d.session]; }
    function ok(x) { return Promise.resolve(x); }
    function err(code) { return Promise.reject({ code: code }); }
    function code6() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

    return {
      mode: 'demo',
      session: function () { return ok(pub(me(db()))); },
      signUp: function (f) {
        var d = db(), email = String(f.email || '').trim().toLowerCase(), pi = passIssue(f.password);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('bad_email');
        if (pi) return err(pi);
        if (Object.keys(d.users).some(function (k) { return d.users[k].email === email; })) return err('exists');
        var id = 'u' + Date.now().toString(36) + code6(), role = f.role === 'parent' ? 'parent' : 'student';
        return pbkdf2(String(f.password), rnd(16)).then(function (h) {
          d = db();
          d.users[id] = { id: id, email: email, pass: h, role: role, name: String(f.name || '').slice(0, 40), school: f.school || null, grade: f.grade || null,
            childCode: code6(), subUntil: null, trialUntil: role === 'student' ? new Date(Date.now() + d.settings.trial_days * DAY).toISOString() : null,
            createdAt: new Date().toISOString(), lastSeen: new Date().toISOString() };
          d.session = id; logAct(d, id, 'signup', { role: role }); put(d);
          return pub(d.users[id]);
        });
      },
      signIn: function (f) {
        var d = db(), email = String(f.email || '').trim().toLowerCase();
        d.fails = d.fails || {};
        var fl = d.fails[email];
        if (fl && fl.until && fl.until > Date.now()) return err('locked');
        var u = Object.keys(d.users).map(function (k) { return d.users[k]; }).filter(function (x) { return x.email === email; })[0];
        return (u ? checkPass(u, String(f.password || '')) : Promise.resolve(false)).then(function (good) {
          d = db(); d.fails = d.fails || {};
          if (!good) {
            var c = d.fails[email] = d.fails[email] || { n: 0 };
            c.n++; if (c.n >= LOCK_N) { c.until = Date.now() + LOCK_MS; c.n = 0; }
            put(d); return err(c.until && c.until > Date.now() ? 'locked' : 'bad_login');
          }
          delete d.fails[email];
          var me2 = d.users[u.id];
          if (String(me2.pass).indexOf('$') < 0) return pbkdf2(String(f.password), rnd(16)).then(function (h) { me2.pass = h; return fin(); });   // перевод на новый хеш
          return fin();
          function fin() { d.session = u.id; logAct(d, u.id, 'login', {}); put(d); return pub(me2); }
        });
      },
      log: function (kind, info) { var d = db(), u = me(d); if (!u) return ok(false); logAct(d, u.id, kind, info); put(d); return ok(true); },
      touch: function () {
        var d = db(), u = me(d); if (!u) return ok(false);
        var day = new Date().toISOString().slice(0, 10);
        if (String(u.lastSeen || '').slice(0, 10) !== day) logAct(d, u.id, 'visit', {}); else u.lastSeen = new Date().toISOString();
        put(d); return ok(true);
      },
      resetPassword: function () { return err('demo_reset'); },
      signOut: function () { var d = db(); d.session = null; put(d); return ok(true); },
      updateProfile: function (p) { var d = db(), u = me(d); if (!u) return err('auth'); ['name', 'school', 'grade'].forEach(function (k) { if (k in p) u[k] = p[k]; }); put(d); return ok(pub(u)); },
      settings: function () { return ok(db().settings); },
      redeemPromo: function (c) {
        var d = db(), u = me(d), code = String(c || '').trim().toUpperCase(), p = d.promos[code];
        if (!u) return ok({ ok: false, error: 'auth' });
        if (!p) return ok({ ok: false, error: 'not_found' });
        if (p.expiresAt && +new Date(p.expiresAt) < Date.now()) return ok({ ok: false, error: 'expired' });
        if (p.maxUses && p.used >= p.maxUses) return ok({ ok: false, error: 'used_up' });
        var rk = code + ':' + u.id;
        if (d.redemptions[rk]) return ok({ ok: false, error: 'already' });
        if (p.kind === 'admin') u.role = 'admin';
        else if (p.kind === 'free') { var base = Math.max(Date.now(), u.subUntil ? +new Date(u.subUntil) : 0); u.subUntil = p.days ? new Date(base + p.days * DAY).toISOString() : '9999-12-31T00:00:00Z'; }
        d.redemptions[rk] = Date.now(); p.used++; logAct(d, u.id, 'promo', { kind: p.kind }); put(d);
        return ok({ ok: true, kind: p.kind, days: p.days || null, percent: p.percent || null });
      },
      requestPayment: function (plan, promo) {
        var d = db(), u = me(d), pr = d.settings.prices[plan];
        if (!u || !pr) return ok({ ok: false, error: 'plan' });
        var pct = 0, pc = promo && d.promos[String(promo).trim().toUpperCase()];
        if (pc && pc.kind === 'discount') pct = pc.percent || 0;
        var pay = { id: d.payments.length + 1, userId: u.id, email: u.email, name: u.name, plan: plan, months: pr.months, amount: Math.round(pr.amount * (100 - pct) / 100), status: 'pending', createdAt: new Date().toISOString() };
        d.payments.push(pay); logAct(d, u.id, 'pay', { plan: plan, amount: pay.amount }); put(d);
        return ok({ ok: true, id: pay.id, amount: pay.amount, months: pay.months });
      },
      myPayments: function () { var d = db(), u = me(d); return ok(u ? d.payments.filter(function (p) { return p.userId === u.id; }) : []); },
      saveProgress: function (state, summary) { var d = db(), u = me(d); if (!u) return ok(false); d.progress[u.id] = { state: state, summary: summary, updatedAt: new Date().toISOString() }; put(d); return ok(true); },
      loadProgress: function () { var d = db(), u = me(d); return ok(u && d.progress[u.id] ? d.progress[u.id].state : null); },
      linkChild: function (c) {
        var d = db(), u = me(d), code = String(c || '').trim().toUpperCase();
        if (!u || (u.role !== 'parent' && u.role !== 'admin')) return ok({ ok: false, error: 'role' });
        var ch = Object.keys(d.users).map(function (k) { return d.users[k]; }).filter(function (x) { return x.childCode === code && x.role === 'student'; })[0];
        if (!ch) return ok({ ok: false, error: 'not_found' });
        if (!d.links.some(function (l) { return l.parent === u.id && l.child === ch.id; })) d.links.push({ parent: u.id, child: ch.id });
        put(d); return ok({ ok: true, child: ch.id });
      },
      children: function () {
        var d = db(), u = me(d);
        if (!u) return ok([]);
        return ok(d.links.filter(function (l) { return l.parent === u.id; }).map(function (l) {
          var c = d.users[l.child], pg = d.progress[l.child] || {};
          return { id: c.id, name: c.name, school: c.school, grade: c.grade, summary: pg.summary || null, state: pg.state || null, updatedAt: pg.updatedAt || null };
        }));
      },
      addPoints: function (kind, ref, amount) {
        var d = db(), u = me(d);
        if (!u) return ok({ ok: false });
        var amt = Math.max(0, Math.min(POINT_CAPS[kind] || 0, Math.round(amount)));
        if (d.points.some(function (p) { return p.user === u.id && p.kind === kind && p.ref === ref; })) return ok({ ok: true, amount: 0 });
        var today = new Date().toISOString().slice(0, 10), sum = d.points.filter(function (p) { return p.user === u.id && p.at.slice(0, 10) === today; }).reduce(function (a, p) { return a + p.amount; }, 0);
        amt = Math.min(amt, Math.max(0, 500 - sum));
        if (amt > 0) { d.points.push({ user: u.id, kind: kind, ref: ref, amount: amt, at: new Date().toISOString() }); put(d); }
        return ok({ ok: true, amount: amt });
      },
      leaderboard: function (month, school) {
        var d = db(), u = me(d), m = month || monthKey(), agg = {};
        d.points.forEach(function (p) { if (p.at.slice(0, 7) === m) agg[p.user] = (agg[p.user] || 0) + p.amount; });
        return ok(Object.keys(agg).map(function (id) { var x = d.users[id] || {}; return { userId: id, name: x.name || '—', school: x.school, points: agg[id], isMe: !!u && u.id === id }; })
          .filter(function (r) { return (!school || r.school === school) && (d.users[r.userId] || {}).role === 'student'; })
          .sort(function (a, b) { return b.points - a.points; }).slice(0, 100));
      },
      myPoints: function (month) { var d = db(), u = me(d), m = month || monthKey(); return ok(u ? d.points.filter(function (p) { return p.user === u.id && p.at.slice(0, 7) === m; }).reduce(function (a, p) { return a + p.amount; }, 0) : 0); },
      // ---- админ ----
      admin: {
        // Обзор всех: профиль + сводка прогресса + последняя активность.
        overview: function () {
          var d = db(), u = me(d); if (!u || u.role !== 'admin') return ok([]);
          return ok(Object.keys(d.users).map(function (k) { var x = pub(d.users[k]), pg = d.progress[k] || {}; x.summary = pg.summary || null; x.updatedAt = pg.updatedAt || null; return x; }));
        },
        userDetail: function (id) {
          var d = db(), u = me(d), x = d.users[id]; if (!u || u.role !== 'admin' || !x) return ok(null);
          var pg = d.progress[id] || {};
          return ok({ user: pub(x), state: pg.state || null, summary: pg.summary || null, updatedAt: pg.updatedAt || null,
            activity: (d.activity || []).filter(function (a) { return a.user === id; }).slice(-200).reverse(),
            payments: d.payments.filter(function (p) { return p.userId === id; }) });
        },
        users: function (q) {
          var d = db(); q = String(q || '').toLowerCase();
          return ok(Object.keys(d.users).map(function (k) { return pub(d.users[k]); }).filter(function (u) { return !q || (u.email + ' ' + u.name).toLowerCase().indexOf(q) >= 0; }));
        },
        payments: function (status) { var d = db(); return ok(d.payments.filter(function (p) { return !status || p.status === status; }).slice().reverse()); },
        decidePayment: function (id, okv) {
          var d = db(), u = me(d), p = d.payments.filter(function (x) { return x.id === id; })[0];
          if (!u || u.role !== 'admin' || !p || p.status !== 'pending') return ok({ ok: false });
          p.status = okv ? 'approved' : 'rejected'; p.decidedAt = new Date().toISOString(); logAct(d, u.id, 'admin', { act: okv ? 'approve' : 'reject', payment: id, user: p.userId });
          if (okv) { var su = d.users[p.userId], base = Math.max(Date.now(), su.subUntil ? +new Date(su.subUntil) : 0), dt = new Date(base); dt.setMonth(dt.getMonth() + p.months); su.subUntil = dt.toISOString(); }
          put(d); return ok({ ok: true });
        },
        grant: function (userId, days) { var d = db(), u = me(d), su = d.users[userId]; if (!u || u.role !== 'admin' || !su) return ok({ ok: false }); su.subUntil = new Date(Math.max(Date.now(), su.subUntil ? +new Date(su.subUntil) : 0) + days * DAY).toISOString(); logAct(d, u.id, 'admin', { act: 'grant', user: userId, days: days }); put(d); return ok({ ok: true }); },
        promos: function () { var d = db(); return ok(Object.keys(d.promos).map(function (k) { return d.promos[k]; })); },
        createPromo: function (p) {
          var d = db(), u = me(d), code = String(p.code || '').trim().toUpperCase();
          if (!u || u.role !== 'admin' || !/^[A-Z0-9-]{4,32}$/.test(code)) return ok({ ok: false, error: 'bad' });
          // Админ-промокод — одноразовый и на 7 дней, если не указано иное (как и на сервере).
          var adm = p.kind === 'admin';
          d.promos[code] = { code: code, kind: p.kind, days: p.days || null, percent: p.percent || null, maxUses: p.maxUses || (adm ? 1 : null), used: 0, note: p.note || '',
            expiresAt: adm ? new Date(Date.now() + 7 * DAY).toISOString() : null };
          logAct(d, u.id, 'admin', { act: 'promo', code: code, kind: p.kind }); put(d); return ok({ ok: true });
        },
        deletePromo: function (code) { var d = db(); delete d.promos[code]; put(d); return ok({ ok: true }); },
        saveSettings: function (s) { var d = db(), u = me(d); if (!u || u.role !== 'admin') return ok({ ok: false }); for (var k in s) d.settings[k] = s[k]; put(d); return ok({ ok: true }); }
      }
    };
  }

  /* =================== SUPABASE =================== */
  function supa() {
    var sb = null, cache = { user: null };
    function client() {
      if (sb) return Promise.resolve(sb);
      return new Promise(function (res, rej) {
        if (root.supabase && root.supabase.createClient) { sb = root.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey); res(sb); return; }
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
        s.onload = function () { sb = root.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey); res(sb); };
        s.onerror = function () { rej({ code: 'network' }); };
        document.head.appendChild(s);
      });
    }
    function fail(e) { return Promise.reject({ code: (e && (e.code || e.message)) || 'error' }); }
    function prof(p, email) {
      return p ? { id: p.id, email: email || p.email || '', role: p.role, name: p.name, school: p.school, grade: p.grade, childCode: p.child_code, subUntil: p.sub_until, trialUntil: p.trial_until,
        createdAt: p.created_at, lastSeen: p.last_seen } : null;
    }
    function loadMe(c) {
      return c.auth.getUser().then(function (r) {
        var u = r.data && r.data.user;
        if (!u) return null;
        return c.from('profiles').select('*').eq('id', u.id).single().then(function (q) { cache.user = prof(q.data, u.email); return cache.user; });
      });
    }
    function rpc(name, args) { return client().then(function (c) { return c.rpc(name, args || {}); }).then(function (r) { if (r.error) return fail(r.error); return r.data; }); }
    return {
      mode: 'supabase',
      session: function () { return client().then(loadMe); },
      signUp: function (f) {
        var pi = passIssue(f.password); if (pi) return fail({ code: pi });
        return client().then(function (c) {
          return c.auth.signUp({ email: f.email, password: f.password, options: { data: { role: f.role, name: f.name, school: f.school || '', grade: f.grade || '' } } });
        }).then(function (r) {
          if (r.error) return fail({ code: /already|registered|exists/i.test(r.error.message || '') ? 'exists' : /password/i.test(r.error.message || '') ? 'pass_short' : /email/i.test(r.error.message || '') ? 'bad_email' : (r.error.code || 'error') });
          if (!r.data.session) return fail({ code: 'confirm_email' });   // включено подтверждение почты
          return client().then(loadMe);
        });
      },
      // Подбор пароля сервер Supabase ограничивает сам (rate limit на /token); сообщение — одно на любую ошибку.
      signIn: function (f) {
        return client().then(function (c) { return c.auth.signInWithPassword({ email: f.email, password: f.password }); }).then(function (r) {
          if (r.error) return fail({ code: /rate|many/i.test(r.error.message || '') ? 'locked' : 'bad_login' });
          rpc('log_activity', { p_kind: 'login', p_info: {} }).catch(function () {});
          return client().then(loadMe);
        });
      },
      signOut: function () { return client().then(function (c) { return c.auth.signOut(); }); },
      signOutAll: function () { return client().then(function (c) { return c.auth.signOut({ scope: 'global' }); }); },
      resetPassword: function (email) {
        return client().then(function (c) { return c.auth.resetPasswordForEmail(String(email || '').trim(), { redirectTo: root.location.origin + root.location.pathname + '#/auth/login' }); })
          .then(function (r) { if (r.error) return fail(r.error); return { ok: true }; });
      },
      log: function (kind, info) { if (LOG_KINDS.indexOf(kind) < 0) return Promise.resolve(false); return rpc('log_activity', { p_kind: kind, p_info: info || {} }); },
      touch: function () { return rpc('touch_seen', {}); },
      updateProfile: function (p) {
        return client().then(function (c) { return c.from('profiles').update({ name: p.name, school: p.school, grade: p.grade }).eq('id', cache.user.id); }).then(function () { return client().then(loadMe); });
      },
      settings: function () {
        return client().then(function (c) { return c.from('settings').select('*'); }).then(function (r) {
          var s = JSON.parse(JSON.stringify(DEFAULTS));
          (r.data || []).forEach(function (row) { s[row.key] = row.value; });
          return s;
        });
      },
      redeemPromo: function (code) { return rpc('redeem_promo', { p_code: code }); },
      requestPayment: function (plan, promo) { return rpc('request_payment', { p_plan: plan, p_promo: promo || null }); },
      myPayments: function () { return client().then(function (c) { return c.from('payments').select('*').order('created_at', { ascending: false }); }).then(function (r) { return r.data || []; }); },
      saveProgress: function (state, summary) {
        return client().then(function (c) { return c.from('progress').upsert({ user_id: cache.user.id, state: state, summary: summary, updated_at: new Date().toISOString() }); });
      },
      loadProgress: function () { return client().then(function (c) { return c.from('progress').select('state').eq('user_id', cache.user.id).maybeSingle(); }).then(function (r) { return r.data ? r.data.state : null; }); },
      linkChild: function (code) { return rpc('link_child', { p_code: code }); },
      children: function () {
        return client().then(function (c) {
          return c.from('parent_links').select('child_id').eq('parent_id', cache.user.id).then(function (l) {
            var ids = (l.data || []).map(function (x) { return x.child_id; });
            if (!ids.length) return [];
            return Promise.all([c.from('profiles').select('*').in('id', ids), c.from('progress').select('*').in('user_id', ids)]).then(function (r) {
              var pg = {}; (r[1].data || []).forEach(function (x) { pg[x.user_id] = x; });
              return (r[0].data || []).map(function (p) { var g = pg[p.id] || {}; return { id: p.id, name: p.name, school: p.school, grade: p.grade, summary: g.summary || null, state: g.state || null, updatedAt: g.updated_at || null }; });
            });
          });
        });
      },
      addPoints: function (kind, ref, amount) { return rpc('add_points', { p_kind: kind, p_ref: ref, p_amount: Math.round(amount) }); },
      leaderboard: function (month, school) {
        return rpc('leaderboard', { p_month: (month || monthKey()) + '-01', p_school: school || null }).then(function (rows) {
          return (rows || []).map(function (r) { return { userId: r.user_id, name: r.name, school: r.school, points: +r.points, isMe: r.is_me }; });
        });
      },
      myPoints: function (month) {
        var m = month || monthKey();
        return client().then(function (c) { return c.from('points').select('amount').gte('at', m + '-01'); }).then(function (r) { return (r.data || []).reduce(function (a, x) { return a + x.amount; }, 0); });
      },
      admin: {
        overview: function () {
          return client().then(function (c) {
            return Promise.all([c.from('profiles').select('*').order('created_at', { ascending: false }).limit(1000), c.from('progress').select('user_id, summary, updated_at').limit(1000)]);
          }).then(function (r) {
            var pg = {}; (r[1].data || []).forEach(function (x) { pg[x.user_id] = x; });
            return (r[0].data || []).map(function (p) { var x = prof(p), g = pg[p.id] || {}; x.summary = g.summary || null; x.updatedAt = g.updated_at || null; return x; });
          });
        },
        userDetail: function (id) {
          return client().then(function (c) {
            return Promise.all([c.from('profiles').select('*').eq('id', id).single(), c.from('progress').select('*').eq('user_id', id).maybeSingle(),
              c.from('activity').select('*').eq('user_id', id).order('at', { ascending: false }).limit(200), c.from('payments').select('*').eq('user_id', id).order('created_at', { ascending: false })]);
          }).then(function (r) {
            var g = r[1].data || {};
            return { user: prof(r[0].data), state: g.state || null, summary: g.summary || null, updatedAt: g.updated_at || null,
              activity: (r[2].data || []).map(function (a) { return { kind: a.kind, info: a.info, at: a.at }; }),
              payments: (r[3].data || []).map(function (p) { return { id: p.id, plan: p.plan, months: p.months, amount: p.amount, status: p.status, createdAt: p.created_at }; }) };
          });
        },
        users: function (q) {
          return client().then(function (c) { var x = c.from('profiles').select('*').order('created_at', { ascending: false }).limit(200); if (q) x = x.ilike('name', '%' + q + '%'); return x; })
            .then(function (r) { return (r.data || []).map(function (p) { return prof(p); }); });
        },
        payments: function (status) {
          return client().then(function (c) { var x = c.from('payments').select('*, profiles(name)').order('created_at', { ascending: false }).limit(200); if (status) x = x.eq('status', status); return x; })
            .then(function (r) { return (r.data || []).map(function (p) { return { id: p.id, userId: p.user_id, name: p.profiles && p.profiles.name, plan: p.plan, months: p.months, amount: p.amount, status: p.status, createdAt: p.created_at }; }); });
        },
        decidePayment: function (id, ok) { return rpc('decide_payment', { p_id: id, p_ok: ok }); },
        grant: function (userId, days) { return rpc('grant_access', { p_user: userId, p_days: days }); },
        promos: function () { return client().then(function (c) { return c.from('promo_codes').select('*').order('created_at', { ascending: false }); }).then(function (r) { return (r.data || []).map(function (p) { return { code: p.code, kind: p.kind, days: p.days, percent: p.percent, maxUses: p.max_uses, used: p.used, note: p.note }; }); }); },
        createPromo: function (p) {
          return client().then(function (c) { return c.from('promo_codes').insert({ code: String(p.code).trim().toUpperCase(), kind: p.kind, days: p.days || null, percent: p.percent || null, max_uses: p.maxUses || null, note: p.note || null }); })
            .then(function (r) { return r.error ? { ok: false, error: r.error.message } : { ok: true }; });
        },
        deletePromo: function (code) { return client().then(function (c) { return c.from('promo_codes').delete().eq('code', code); }).then(function () { return { ok: true }; }); },
        saveSettings: function (s) {
          return client().then(function (c) { return c.from('settings').upsert(Object.keys(s).map(function (k) { return { key: k, value: s[k] }; })); }).then(function (r) { return r.error ? { ok: false } : { ok: true }; });
        }
      }
    };
  }

  var impl = CFG.supabaseUrl && CFG.supabaseKey ? supa() : demo();
  impl.hasAccess = hasAccess;
  impl.daysLeft = daysLeft;
  impl.monthKey = monthKey;
  impl.CAPS = POINT_CAPS;
  impl.passIssue = passIssue;
  if (!impl.signOutAll) impl.signOutAll = impl.signOut;
  Z.backend = impl;
})(typeof window !== 'undefined' ? window : globalThis);
