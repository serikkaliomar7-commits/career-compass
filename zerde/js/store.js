/* Зерде — хранение прогресса в localStorage.
 * Одна запись с версией схемы: при изменении структуры добавляем миграцию. */
(function (root) {
  'use strict';
  var Z = root.Z;
  var KEY = 'zerde.v1';

  function blank() {
    return { v: 1, profile: null, topics: {}, plans: {}, exams: [], activeExam: null, activity: {}, videos: {} };
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

  Z.store = { load: load, save: save, reset: reset, blank: blank, KEY: KEY };
})(typeof window !== 'undefined' ? window : globalThis);
