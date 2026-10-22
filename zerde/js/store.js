/* Зерде — хранение прогресса в localStorage.
 * Одна запись с версией схемы: при изменении структуры добавляем миграцию. */
(function (root) {
  'use strict';
  var Z = root.Z;
  var BASE = 'zerde.v1', KEY = BASE;
  var MEM = {};   // если браузер не даёт localStorage (закрытая рамка, приватный режим) — держим данные в памяти страницы

  function blank() {
    return { v: 1, profile: null, topics: {}, plans: {}, exams: [], activeExam: null, activity: {}, videos: {}, mistakes: [], hw: {}, cls: {}, paper: [] };
  }
  function load() {
    try {
      var raw = null;
      try { raw = root.localStorage && root.localStorage.getItem(KEY); } catch (e) { raw = null; }
      if (!raw) raw = MEM[KEY] || null;
      if (!raw) return blank();
      var s = JSON.parse(raw), b = blank();
      for (var k in b) if (!(k in s)) s[k] = b[k];
      return migrate(s);
    } catch (e) { return blank(); }
  }
  /* Сайт готовит только к БИЛ. У тех, кто раньше выбрал другую школу, профиль переводим на БИЛ,
   * а планы, начатые задания и тест, собранные по старым форматам и темам, сбрасываем.
   * Записи о форматах и темах, которых больше нет, убираем, чтобы экраны их не встречали. */
  function migrate(s) {
    if (!s || typeof s !== 'object') return s;
    var F = Z.examFormats || {}, T = Z.topicById || {};
    if (s.profile && s.profile.school !== 'BIL') {
      s.profile.school = 'BIL';
      s.plans = {}; s.hw = {}; s.activeExam = null; s.lastExam = null; delete s.diag;
    }
    if (s.activeExam && !F[s.activeExam.format]) s.activeExam = null;
    if (s.lastExam && !(s.lastExam.ex && F[s.lastExam.ex.format])) s.lastExam = null;
    if (Array.isArray(s.exams)) s.exams = s.exams.filter(function (e) { return e && F[e.format]; });
    if (Array.isArray(s.paper)) s.paper = s.paper.filter(function (p) { return p && F[p.fid]; });
    if (Array.isArray(s.mistakes)) s.mistakes = s.mistakes.filter(function (m) { return m && T[m.topic]; });
    if (s.hw) Object.keys(s.hw).forEach(function (id) { if (!T[id] || (s.hw[id] && s.hw[id].school !== 'BIL')) delete s.hw[id]; });
    if (s.plans) Object.keys(s.plans).forEach(function (d) {
      var pl = s.plans[d];
      if (!pl || !pl.tasks || pl.tasks.some(function (x) { return x.format ? !F[x.format] : x.topic && !T[x.topic]; })) delete s.plans[d];
    });
    return s;
  }
  function save(s) {
    var j = JSON.stringify(s);
    MEM[KEY] = j;
    try { root.localStorage.setItem(KEY, j); return true; } catch (e) { return false; }
  }
  function reset() { delete MEM[KEY]; try { root.localStorage.removeItem(KEY); } catch (e) { /* приватный режим */ } return blank(); }

  /* У каждого аккаунта на устройстве — своя запись. Прогресс, сохранённый до появления аккаунтов,
   * достаётся первому вошедшему ученику. */
  function setUser(id) {
    KEY = id ? BASE + '.' + id : BASE;
    try {
      var ls = root.localStorage;
      if (id && !ls.getItem(KEY) && ls.getItem(BASE) && !ls.getItem(BASE + '.claimed')) { ls.setItem(KEY, ls.getItem(BASE)); ls.setItem(BASE + '.claimed', id); }
    } catch (e) { /* приватный режим */ }
  }

  Z.store = { load: load, migrate: migrate, save: save, reset: reset, blank: blank, setUser: setUser, key: function () { return KEY; } };
})(typeof window !== 'undefined' ? window : globalThis);
