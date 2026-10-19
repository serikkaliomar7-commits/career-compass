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
      return s;
    } catch (e) { return blank(); }
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

  Z.store = { load: load, save: save, reset: reset, blank: blank, setUser: setUser, key: function () { return KEY; } };
})(typeof window !== 'undefined' ? window : globalThis);
