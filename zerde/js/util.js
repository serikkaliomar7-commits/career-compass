/* Зерде — жалпы көмекші функциялар (общие утилиты).
 * Подключается первым. Все модули живут в глобальном объекте Z,
 * чтобы сайт открывался и с диска (file://), без сборщика и ES-модулей. */
(function (root) {
  'use strict';
  var Z = root.Z = root.Z || {};

  // Детерминированный ГПСЧ (mulberry32): один seed — одна и та же задача.
  function rng(seed) {
    var a = (seed >>> 0) || 1;
    var r = function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.int = function (min, max) { return min + Math.floor(r() * (max - min + 1)); };
    r.pick = function (arr) { return arr[Math.floor(r() * arr.length)]; };
    r.shuffle = function (arr) {
      var a2 = arr.slice();
      for (var i = a2.length - 1; i > 0; i--) {
        var j = Math.floor(r() * (i + 1));
        var t2 = a2[i]; a2[i] = a2[j]; a2[j] = t2;
      }
      return a2;
    };
    r.chance = function (p) { return r() < p; };
    return r;
  }

  function newSeed() { return Math.floor(Math.random() * 2147483646) + 1; }

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }

  // Рациональные числа {n, d} — чтобы ответы с дробями считались точно.
  function frac(n, d) {
    if (d === undefined) d = 1;
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d) || 1;
    return { n: n / g, d: d / g };
  }
  frac.add = function (a, b) { return frac(a.n * b.d + b.n * a.d, a.d * b.d); };
  frac.sub = function (a, b) { return frac(a.n * b.d - b.n * a.d, a.d * b.d); };
  frac.mul = function (a, b) { return frac(a.n * b.n, a.d * b.d); };
  frac.div = function (a, b) { return frac(a.n * b.d, a.d * b.n); };
  frac.eq = function (a, b) { return a.n === b.n && a.d === b.d; };
  frac.key = function (a) { return a.n + '/' + a.d; };

  // Казахстанская запись чисел: десятичная запятая, пробел между разрядами.
  function fmt(x, maxDec) {
    if (typeof x !== 'number') return String(x);
    if (maxDec === undefined) maxDec = 4;
    var neg = x < 0;
    var s = Math.abs(x).toFixed(maxDec).replace(/\.?0+$/, '');
    var parts = s.split('.');
    if (parts[0].length > 4) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (neg ? '−' : '') + parts.join(',');
  }

  // HTML дроби: «3/8» в две строки; смешанное число — с целой частью.
  function fracHtml(f, mixed) {
    if (f.d === 1) return fmt(f.n);
    var neg = f.n < 0, n = Math.abs(f.n), whole = '';
    if (mixed && n > f.d) { whole = String(Math.floor(n / f.d)); n = n % f.d; }
    return (neg ? '−' : '') + whole +
      '<span class="frac"><span>' + n + '</span><span>' + f.d + '</span></span>';
  }
  function fr(n, d) { return fracHtml(frac(n, d), false); }

  // Время: минуты → «2 сағ 05 мин» и «14:05».
  function hm(mins) { return Math.floor(mins / 60) + ' сағ ' + pad2(mins % 60) + ' мин'; }
  function hmRu(mins) { return Math.floor(mins / 60) + ' ч ' + pad2(mins % 60) + ' мин'; }
  function clock(mins) { mins = ((mins % 1440) + 1440) % 1440; return pad2(Math.floor(mins / 60)) + ':' + pad2(mins % 60); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function todayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function daysBetween(aKey, bKey) {
    var a = new Date(aKey + 'T00:00:00'), b = new Date(bKey + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }
  function addDays(key, n) {
    var d = new Date(key + 'T00:00:00'); d.setDate(d.getDate() + n); return todayKey(d);
  }

  Z.util = {
    rng: rng, newSeed: newSeed, gcd: gcd, lcm: lcm, frac: frac, fmt: fmt,
    fracHtml: fracHtml, fr: fr, hm: hm, hmRu: hmRu, clock: clock, pad2: pad2,
    esc: esc, todayKey: todayKey, daysBetween: daysBetween, addDays: addDays
  };
})(typeof window !== 'undefined' ? window : globalThis);
