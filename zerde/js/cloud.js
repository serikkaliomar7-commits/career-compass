/* Зерде — синхронизация и обмен прогрессом.
 *
 * 1) Облако (когда сайт открыт как Artifact на claude.ai и платформа даёт хранилище `db`):
 *    личная копия прогресса — data/users/<id>/zerde (видит только сам ученик, на любом устройстве);
 *    короткая сводка — students/<id> (читают только редакторы, т.е. учитель).
 *    Писать в хранилище платформа разрешает уровню «Contributor» и выше — у остальных
 *    всё продолжает работать локально.
 * 2) Без сервера (работает везде): код переноса прогресса на другое устройство
 *    и короткий «код отчёта», который ученик отправляет учителю или родителю. */
(function (root) {
  'use strict';
  var Z = root.Z;
  var KEYS = ['profile', 'topics', 'plans', 'exams', 'activity', 'videos', 'mistakes', 'diag', 'paper', 'savedAt'];
  var st = { on: false, uid: null, teacher: false, db: null, timer: null, last: '', err: null };

  // То, что переносим: без незаконченных сессий и полного текста вопросов.
  function compact(S, maxExams) {
    var o = {};
    KEYS.forEach(function (k) { if (S[k] !== undefined) o[k] = S[k]; });
    o.exams = (o.exams || []).slice(-(maxExams || 80));
    var days = Object.keys(o.plans || {}).sort().slice(-21), pl = {};
    days.forEach(function (d) { pl[d] = o.plans[d]; });
    o.plans = pl;
    return o;
  }
  function adopt(S, remote) {
    KEYS.forEach(function (k) { if (k in remote) S[k] = remote[k]; });
  }

  /* ---------- облако ---------- */
  function path() { return 'data/users/' + st.uid + '/zerde'; }
  function init(S, onChange) {
    if (!root.claude || typeof root.claude.use !== 'function') return;
    Promise.all([root.claude.use('db'), root.claude.use('user')]).then(function (r) {
      var db = r[0], user = r[1];
      if (!db || !user) return null;
      st.db = db;
      return Promise.all([user.id(), user.canEdit().catch(function () { return false; })]).then(function (x) {
        if (!x[0]) return null;
        st.uid = x[0]; st.teacher = !!x[1]; st.on = true;
        return db.doc(path()).get();
      });
    }).then(function (snap) {
      if (!snap) return;
      if (snap.exists) {
        var remote = JSON.parse(snap.data().state || '{}');
        if ((remote.savedAt || 0) > (S.savedAt || 0) && remote.profile) { adopt(S, remote); onChange('pulled'); }
        else if ((S.savedAt || 0) > (remote.savedAt || 0)) push(S);
      } else if (S.profile) push(S);
      onChange('ready');
    }).catch(function (e) { st.err = e && e.code; onChange('error'); });
  }
  function push(S) {
    if (!st.on) return;
    clearTimeout(st.timer);
    st.timer = setTimeout(function () { doPush(S); }, 3000);
  }
  function doPush(S) {
    var c = compact(S), j = JSON.stringify(c);
    if (j.length > 230000) { c = compact(S, 25); j = JSON.stringify(c); }
    if (j === st.last) return;
    st.db.doc(path()).set({ v: 1, savedAt: c.savedAt || Date.now(), state: j }).then(function () { st.last = j; st.err = null; }, function (e) { st.err = e && e.code; });
    if (S.profile) st.db.doc('students/' + st.uid).set(summary(S)).catch(function () { /* нет прав — сводка не нужна */ });
  }
  function students() {
    if (!st.on || !st.teacher) return Promise.resolve([]);
    return st.db.collection('students').get().then(function (q) {
      return q.docs.map(function (d) { var x = d.data(); x.id = d.id; x.src = 'cloud'; return x; });
    }, function () { return []; });
  }

  /* ---------- сводка ученика (для учителя и родителей) ---------- */
  function summary(S) {
    var P = Z.planner, U = Z.util, today = U.todayKey(), p = S.profile || {};
    var fc = P.forecast(S), weak = P.weakTopics(S).slice(0, 4).map(function (w) { return w.id || w.topic || w; });
    var active7 = 0, hw7 = 0;
    for (var i = 0; i < 7; i++) {
      var d = U.addDays(today, -i);
      if (S.activity[d]) active7++;
      var pl = S.plans[d];
      if (pl) hw7 += pl.tasks.filter(function (t) { return t.type === 'topic' && t.done; }).length;
    }
    var mocks = S.exams.filter(function (e) { var f = Z.examFormats[e.format]; return f && f.full; });
    var lm = mocks[mocks.length - 1];
    var mastered = Object.keys(S.topics).filter(function (k) { return (S.topics[k].grade || 0) >= 8; }).length;
    return {
      v: 1, name: p.name || '', school: p.school || '', grade: p.grade || null, examDate: p.examDate || null, updatedAt: Date.now(),
      streak: P.streak(S, today), ready: Math.round(P.readiness(S) * 100), fc: fc ? { score: fc.score, max: fc.max, pct: !!fc.pct } : null,
      lastMock: lm ? { format: lm.format, date: lm.date, score: lm.score, max: lm.max } : null, mocks7: mocks.filter(function (e) { return U.daysBetween(e.date, today) < 7; }).length,
      weak: weak, mistakes: (S.mistakes || []).length, active7: active7, hw7: hw7, mastered: mastered, topicsTotal: Z.topicsFor(p.school || 'BIL').length
    };
  }

  /* ---------- коды без сервера ---------- */
  function enc(prefix, obj) { return prefix + root.btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); }
  function dec(prefix, code) {
    code = String(code || '').replace(/\s+/g, '');
    if (code.indexOf(prefix) !== 0) return null;
    try { return JSON.parse(decodeURIComponent(escape(root.atob(code.slice(prefix.length))))); } catch (e) { return null; }
  }
  function transferCode(S) { return enc('ZT1:', compact(S, 60)); }
  function applyTransfer(S, code) {
    var o = dec('ZT1:', code);
    if (!o || !o.profile) return false;
    adopt(S, o); S.savedAt = Date.now();
    return true;
  }
  function reportCode(S) { var s = summary(S); s.rid = (S.profile && S.profile.rid) || ''; return enc('ZR1:', s); }
  function readReport(code) { return dec('ZR1:', code); }

  Z.cloud = { init: init, push: push, students: students, summary: summary, transferCode: transferCode, applyTransfer: applyTransfer, reportCode: reportCode, readReport: readReport, state: st, compact: compact };
})(typeof window !== 'undefined' ? window : globalThis);
