/* Зерде — хранение прогресса в localStorage.
 * Одна запись с версией схемы: при изменении структуры добавляем миграцию. */
(function (root) {
  'use strict';
  var Z = root.Z;
  var BASE = 'zerde.v1', KEY = BASE;

  function blank() {
    return { v: 1, profile: null, topics: {}, plans: {}, exams: [], activeExam: null, activity: {}, videos: {}, mistakes: [], hw: {}, cls: {}, paper: [] };
  }
  function load() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(KEY);
      if (!raw) return blank();
      var s = JSON.parse(raw), b = blank();
      for (var k in b) if (!(k in s)) s[k] = b[k];
      return s;
    } catch (e) { return blank(); }
  }
  function save(s) {
    try { root.localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
  }
  function reset() { try { root.localStorage.removeItem(KEY); } catch (e) { /* приватный режим */ } return blank(); }

  /* У каждого аккаунта на устройстве — своя запись. Прогресс, сохранённый до появления аккаунтов,
   * достаётся первому вошедшему ученику. */
  function setUser(id) {
    KEY = id ? BASE + '.' + id : BASE;
    try {
      var ls = root.localStorage;
      if (id && !ls.getItem(KEY) && ls.getItem(BASE) && !ls.getItem(BASE + '.claimed')) { ls.setItem(KEY, ls.getItem(BASE)); ls.setItem(BASE + '.claimed', id); }
    } catch (e) { /* приватный режим */ }
  }

  Z.store = { load: load, save: save, reset: reset, blank: blank, setUser: setUser, key: function () { return KEY; } };
})(typeof window !== 'undefined' ? window : globalThis);
