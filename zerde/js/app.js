/* Зерде — интерфейс: маршрутизация по #hash, экраны, обработчики.
 * Экран = функция, возвращающая HTML. Клики обрабатываются делегированием
 * по атрибуту data-act, поэтому после перерисовки ничего не нужно перевешивать. */
(function () {
  'use strict';
  var Z = window.Z, U = Z.util, E = Z.engine, P = Z.planner, I = Z.i18n, t = I.t, esc = U.esc;
  var S = Z.store.load();
  var mem = { session: null, sel: null, fb: null, timer: null, sheet: false, lastExam: S.lastExam || null, res: null };
  var LETTERS = ['A', 'B', 'C', 'D', 'E'];
  var LV = { 1: 'A', 2: 'B', 3: 'C', 4: '★' };

  /* Линейные иконки (24×24, обводка). */
  var IC = {
    today: '<path d="M3 10.5 12 4l9 6.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/>',
    topics: '<path d="m12 3 9 4.5-9 4.5-9-4.5z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>',
    tests: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    mistakes: '<path d="M6 3h11a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2z"/><path d="m10 9 4 4M14 9l-4 4"/>',
    progress: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
    math: '<path d="M5 7h14M12 4v6M5 17h5M14.5 14.5l4 4M18.5 14.5l-4 4"/>',
    logic: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7.5 7.5 11 16M16.5 7.5 13 16M8 6h8"/>',
    reading: '<path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3z"/><path d="M21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>',
    test: '<circle cx="7" cy="7" r="2"/><circle cx="7" cy="13" r="2"/><circle cx="7" cy="19" r="2"/><path d="M12 7h8M12 13h8M12 19h5"/>',
    check: '<path d="m5 12 4 4 10-10"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>'
  };
  function ic(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>'; }

  function save() { Z.store.save(S); }
  function today() { return U.todayKey(); }
  function go(h) { if (location.hash === h) render(); else location.hash = h; }
  function tn(tp) { return I.lang() === 'ru' ? tp.ru : tp.kk; }
  function fname(f) { return I.lang() === 'ru' ? f.ru : f.kk; }
  function school() { return Z.schools[S.profile.school]; }
  function stars(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '★' : '☆'; return '<span class="stars" aria-label="' + n + '/3">' + s + '</span>'; }
  function qCount(f) { return f.sections.reduce(function (a, s) { return a + (s.count || [1, 2, 3, 4].reduce(function (x, l) { return x + (s.mix[l] || 0); }, 0)); }, 0); }
  function searchUrl(tp) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(tp.video); }
  function videoList(tp) {
    var own = S.videos[tp.id];
    return (own ? [{ url: own, title: t('c.video') }] : []).concat(tp.videos || []);
  }
  function firstVideo(tp) { var v = videoList(tp); return v.length ? v[0].url : searchUrl(tp); }
  function pct(x) { return Math.round(x * 100) + '%'; }
  function kindIcon(k) { return k === 'logic' ? 'logic' : k === 'reading' ? 'reading' : 'math'; }
  function lvPill(l) { return '<span class="pill l' + l + '">' + LV[l] + '</span>'; }
  function gradeHtml(g) { return '<span class="grade">' + g + '<small>/10</small></span>'; }

  // Текст задания: казахский, русский или оба (как в двуязычных тестах БИЛ).
  function qText(q) {
    var l = (S.profile && S.profile.qLang) || 'both';
    if (l === 'ru') return '<div class="q-main">' + q.ru + '</div>';
    if (l === 'kk' || q.ru === q.kk) return '<div class="q-main">' + q.kk + '</div>';
    // Формулу/рисунок, общие для обоих языков, во втором тексте не повторяем.
    var ru = q.ru, blocks = q.kk.match(/<div class="expr">[\s\S]*?<\/div>/g) || [];
    var fi = q.kk.indexOf('<div class="figs">');
    if (fi >= 0) blocks.push(q.kk.slice(fi));   // блок фигур всегда в конце текста
    blocks.forEach(function (b) { ru = ru.split(b).join(''); });
    return '<div class="q-main">' + q.kk + '</div><div class="q-alt">' + ru + '</div>';
  }
  function ql() { return (S.profile && S.profile.qLang === 'ru') ? 'ru' : 'kk'; }
  function solText(q) { return ql() === 'ru' ? q.sol_ru : q.sol_kk; }
  function optText(o) { return ql() === 'ru' ? o.ru : o.kk; }
  function unitText(q) { return q.unit ? (I.lang() === 'ru' || ql() === 'ru' ? q.unit.ru : q.unit.kk) : ''; }

  // Своё окно подтверждения: window.confirm/alert блокируются во встроенных браузерах.
  function ask(msg, yes, onYes, no) {
    var box = document.getElementById('modal');
    box.innerHTML = '<div class="modal-bg"><div class="modal card" role="dialog" aria-modal="true"><p>' + msg + '</p><div class="row">' +
      (no === false ? '' : '<button class="btn line" data-act="modalNo">' + (no || t('c.cancel')) + '</button>') +
      '<button class="btn primary" data-act="modalYes">' + yes + '</button></div></div></div>';
    mem.modalYes = onYes;
    var b = box.querySelector('[data-act=modalYes]'); if (b) b.focus();
  }
  function closeModal() { document.getElementById('modal').innerHTML = ''; mem.modalYes = null; }

  /* =================== ОБОЛОЧКА =================== */
  var TITLES = { today: 'nav.today', topics: 'nav.topics', topic: 'nav.topics', practice: 'hw.title', tests: 'nav.tests', exam: 'nav.tests', result: 'res.title', mistakes: 'nav.mistakes', progress: 'nav.progress', settings: 'nav.settings' };
  function shell(route) {
    var cur = route === 'topic' || route === 'practice' ? 'topics' : route === 'exam' || route === 'result' ? 'tests' : route;
    var mc = (S.mistakes || []).length;
    function link(id, cnt) {
      return '<a href="#/' + id + '" class="' + (cur === id ? 'on' : '') + '">' + ic(id) + t('nav.' + id) + (cnt ? '<span class="cnt">' + cnt + '</span>' : '') + '</a>';
    }
    document.getElementById('nav').innerHTML = '<div class="label">' + t('nav.secLearn') + '</div>' + link('today') + link('topics') + link('tests') +
      '<div class="label">' + t('nav.secCheck') + '</div>' + link('mistakes', mc) + link('progress') + link('settings');
    var p = S.profile;
    document.getElementById('me').innerHTML = '<span class="avatar">' + esc(p.name.charAt(0).toUpperCase()) + '</span><span><b>' + esc(p.name) + '</b><small>' + school().name + ' · ' + t('ob.grade', { n: p.grade }) + '</small></span>';
    document.getElementById('page-title').textContent = t(TITLES[route] || 'nav.today');
    var left = p.examDate ? U.daysBetween(today(), p.examDate) : null;
    document.getElementById('top-right').innerHTML = left !== null && left >= 0 ? '<span class="chip-exam">' + school().name + ' · <b>' + left + '</b> ' + t('c.days') + '</span>' : '';
    document.documentElement.lang = I.lang();
  }

  /* =================== МАРШРУТЫ =================== */
  function render() {
    if (mem.timer && !/^#\/exam/.test(location.hash)) { clearInterval(mem.timer); mem.timer = null; }
    closeModal();
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var view = document.getElementById('view'), html;
    document.body.classList.remove('menu-open');
    if (!S.profile) { document.body.classList.add('bare'); view.innerHTML = vOnboarding(); return; }
    document.body.classList.remove('bare');
    var route = parts[0] || 'today';
    switch (route) {
      case 'topics': html = vTopics(); break;
      case 'topic': html = vTopic(parts[1]); break;
      case 'practice': html = vPractice(); break;
      case 'tests': html = vTests(); break;
      case 'exam': html = vExam(); break;
      case 'result': html = vResult(); break;
      case 'mistakes': html = vMistakes(); break;
      case 'progress': html = vProgress(); break;
      case 'settings': html = vSettings(); break;
      default: route = 'today'; html = vToday();
    }
    shell(route);
    view.innerHTML = html;
    document.body.classList.toggle('focus', route === 'exam' || route === 'practice');
    if (route === 'exam') startTimer();
    var inp = view.querySelector('[data-autofocus]'); if (inp) inp.focus();
    window.scrollTo(0, 0);
  }

  /* =================== ОНБОРДИНГ =================== */
  function vOnboarding() {
    var def = U.addDays(today(), 120);
    var sch = Object.keys(Z.schools).map(function (k, i) {
      var s = Z.schools[k];
      return '<label class="pick' + (s.active ? '' : ' off') + '"><input type="radio" name="school" value="' + k + '"' + (i === 0 ? ' checked' : '') + (s.active ? '' : ' disabled') + '>' +
        '<b>' + s.name + '</b><small>' + t('sch.' + k) + (s.active ? '' : ' — ' + t('ob.soon')) + '</small></label>';
    }).join('');
    var grades = [4, 5, 6, 7].map(function (g) { return '<option value="' + g + '"' + (g === 6 ? ' selected' : '') + '>' + t('ob.grade', { n: g }) + '</option>'; }).join('');
    return '<form class="card form onb" data-form="onboard"><span class="brand"><span class="brand-mark">З</span><span class="brand-name">Зерде</span><span class="brand-tag">EDU</span></span>' +
      '<div><h1>' + t('ob.title') + '</h1><p class="muted">' + t('ob.sub') + '</p></div>' +
      '<label class="field"><span>' + t('set.name') + '</span><input id="ob-name" name="name" required maxlength="30" autocomplete="given-name"></label>' +
      '<div class="field"><span>' + t('set.school') + '</span><div class="picks">' + sch + '</div></div>' +
      '<div class="row2"><label class="field"><span>' + t('set.grade') + '</span><select id="ob-grade" name="grade">' + grades + '</select></label>' +
      '<label class="field"><span>' + t('set.date') + '</span><input id="ob-date" type="date" name="examDate" value="' + def + '" min="' + today() + '"></label></div>' +
      intensityField('normal') +
      '<button class="btn primary wide" type="submit">' + t('ob.go') + '</button></form>';
  }
  function intensityField(cur) {
    return '<div class="field"><span>' + t('set.intensity') + '</span>' + ['light', 'normal', 'intense'].map(function (k) {
      return '<label class="radio"><input type="radio" name="intensity" value="' + k + '"' + (k === cur ? ' checked' : '') + '><span>' + t('set.' + k) + '</span></label>';
    }).join('') + '</div>';
  }

  /* =================== БҮГІН / СЕГОДНЯ =================== */
  function hwOf(id) { return S.hw && S.hw[id]; }
  function taskState(task) {
    if (task.done) return 'on';
    if (task.type === 'topic' && hwOf(task.topic)) return 'mid';
    return '';
  }
  function vToday() {
    var p = S.profile, d = today(), plan = P.planFor(S, d);
    save();
    var left = p.examDate ? U.daysBetween(d, p.examDate) : null;
    var fc = P.forecast(S), streak = P.streak(S, d), ready = P.readiness(S);
    var stats = (left !== null && left >= 0 ? '<div><b>' + left + '</b><span>' + t('today.stLeft') + '</span></div>' : '') +
      '<div><b>' + streak + '</b><span>' + t('today.streak') + '</span></div><div><b>' + pct(ready) + '</b><span>' + t('today.ready') + '</span></div>' +
      (fc ? '<div><b>' + fc.score + '</b><span>' + t('today.forecast') + ' / ' + fc.max + '</span></div>' : '');
    var sheet = plan.tasks.map(function (task, i) {
      var name = task.type === 'test' ? fname(Z.examFormats[task.format]) : tn(Z.topicById[task.topic]);
      return '<div class="sheet-row"><span class="n">' + (i + 1) + '</span><span class="t">' + name + '</span><span class="bub ' + taskState(task) + '"></span></div>';
    }).join('');
    var done = plan.tasks.filter(function (x) { return x.done; }).length;
    var h = '<section class="hero"><div><h1>' + t('today.hello', { name: esc(p.name) }) + '</h1><p class="sub">' + t('today.sub', { school: school().name }) + '</p>' +
      '<div class="hero-stats">' + stats + '</div></div>' +
      '<div class="sheet-card" aria-label="' + t('today.sheet') + '"><div class="sh-h"><span>' + t('today.sheet').toUpperCase() + '</span><span>' + done + ' / ' + plan.tasks.length + '</span></div>' + sheet + '</div></section>';
    if (S.activeExam) h += resumeBanner();
    if (plan.mock) h += '<div class="note amber"><b>' + t('today.mockBadge') + '.</b> ' + (school().id === 'BIL' ? t('ex.rulesBIL') : t('ex.rulesRFMSH', { max: 150 })) + '</div>';
    if (done === plan.tasks.length && done > 0) h += '<div class="note ok">' + t('today.allDone') + '</div>';
    h += '<section class="sec"><div class="sec-h"><h2>' + t('today.tasks') + '</h2><span class="muted small">' + done + ' / ' + plan.tasks.length + '</span></div>' +
      '<ol class="tasks">' + plan.tasks.map(taskCard).join('') + '</ol></section>';
    var mc = (S.mistakes || []).length;
    if (mc) h += '<div class="note teal row"><span>' + t('today.mist', { n: mc }) + '</span><a class="btn line sm" href="#/mistakes">' + t('today.mistBtn') + '</a></div>';
    h += weekStrip();
    return h;
  }
  function taskCard(task) {
    if (task.type === 'test') {
      var f = Z.examFormats[task.format];
      return '<li class="task' + (task.done ? ' done' : '') + '"><span class="tk-ico test">' + ic('test') + '</span><div class="tk-body">' +
        '<span class="label">' + (f.full ? t('today.mock') : t('today.short')) + '</span><b>' + fname(f) + '</b><span class="meta">' + t('task.testSteps', { n: qCount(f), m: f.minutes }) + '</span></div>' +
        '<div class="tk-act">' + (task.done ? '<span class="done-mark">' + ic('check') + t('c.done') + '</span>' : '<button class="btn primary" data-act="startExam" data-f="' + f.id + '">' + t('c.start') + '</button>') + '</div></li>';
    }
    var tp = Z.topicById[task.topic], pr = S.topics[tp.id], hw = hwOf(tp.id);
    var meta = '<span>' + t('hw.title') + ' · ' + t('hw.n', { n: hw ? hw.n : sessionLen(tp) }) + '</span>' + (hw ? '<span class="pill l2">' + hw.idx + ' / ' + hw.n + '</span>' : '') +
      (pr && pr.grade ? '<span>' + gradeHtml(pr.grade) + '</span>' : '');
    var act = task.done ? '<span class="done-mark">' + ic('check') + t('c.done') + '</span>' :
      '<a class="btn line' + (task.video ? ' done' : '') + '" href="' + esc(firstVideo(tp)) + '" target="_blank" rel="noopener" data-act="video" data-topic="' + tp.id + '">' + ic('play') + (task.video ? t('task.watched') : t('c.video')) + '</a>' +
      '<button class="btn primary" data-act="hw" data-topic="' + tp.id + '">' + (hw ? t('hw.cont', { i: hw.idx, n: hw.n }) : t('hw.start')) + '</button>';
    return '<li class="task' + (task.done ? ' done' : '') + '"><span class="tk-ico ' + tp.kind + '">' + ic(kindIcon(tp.kind)) + '</span>' +
      '<div class="tk-body"><span class="label">' + t('kind.' + tp.kind) + '</span><b><a href="#/topic/' + tp.id + '">' + tn(tp) + '</a></b><span class="meta">' + meta + '</span></div>' +
      '<div class="tk-act">' + act + '</div></li>';
  }
  function sessionLen(tp) { return tp.kind === 'reading' ? 20 : tp.bank ? Z.bank[tp.bank].filter(function (q) { return school().answer !== 'int' || q.int; }).length : E.SESSION_LEN; }
  function weekStrip() {
    var wk = P.weekPreview(S, today()), names = I.lang() === 'ru' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] : ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жс'];
    return '<section class="sec"><h2>' + t('today.week') + '</h2><div class="week">' + wk.map(function (d, i) {
      var dt = new Date(d.date + 'T00:00:00'), wd = (dt.getDay() + 6) % 7;
      var lbl = d.mock ? t('today.mock') : d.test ? t('today.short') : t('today.rest');
      return '<div class="day' + (i === 0 ? ' now' : '') + (d.mock ? ' mock' : '') + '"><span class="wd">' + names[wd] + '</span><b>' + dt.getDate() + '</b><small>' + lbl + '</small>' +
        '<span class="bub' + (d.total && d.done === d.total ? ' on' : d.done ? ' mid' : '') + '"></span></div>';
    }).join('') + '</div></section>';
  }
  function resumeBanner() {
    var f = Z.examFormats[S.activeExam.format];
    return '<div class="note amber row"><span>' + t('ex.resume') + ': <b>' + fname(f) + '</b></span><a class="btn primary sm" href="#/exam">' + t('ex.resumeBtn') + '</a>' +
      '<button class="btn line sm" data-act="abandonExam">' + t('ex.abandon') + '</button></div>';
  }

  /* =================== ТАҚЫРЫПТАР / ТЕМЫ =================== */
  function vTopics() {
    return ['math', 'logic', 'reading'].map(function (k) {
      var list = Z.topicsFor(S.profile.school, k);
      if (!list.length) return '';
      return '<section class="sec"><h2>' + t('kind.' + k) + '</h2><div class="topics-grid">' + list.map(function (tp) {
        var pr = S.topics[tp.id], hw = hwOf(tp.id);
        return '<a class="tcard" href="#/topic/' + tp.id + '"><span class="tt">' + tn(tp) + '</span><span class="tm"><span>' +
          (pr && pr.grade ? gradeHtml(pr.grade) : hw ? hw.idx + ' / ' + hw.n : t('hw.n', { n: sessionLen(tp) })) + '</span>' + stars(pr ? pr.stars : 0) + '</span>' +
          (hw ? '<span class="bar"><i style="width:' + (hw.idx / hw.n * 100) + '%"></i></span>' : '') + '</a>';
      }).join('') + '</div></section>';
    }).join('');
  }
  function vTopic(id) {
    var tp = Z.topicById[id];
    if (!tp) return vTopics();
    var pr = S.topics[id], hw = hwOf(id), n = sessionLen(tp);
    var vids = videoList(tp);
    var watched = (S.plans[today()] || { tasks: [] }).tasks.some(function (x) { return x.topic === id && x.video; });
    var h = '<a class="back" href="#/topics">' + ic('back') + t('nav.topics') + '</a>' +
      '<div class="topic-head"><div><span class="label">' + t('kind.' + tp.kind) + '</span><h1>' + tn(tp) + '</h1></div>' +
      (pr ? '<div class="row">' + stars(pr.stars) + (pr.grade ? gradeHtml(pr.grade) : '') + '</div>' : '') + '</div>';
    h += '<div class="card"><div class="steps-v">';
    // 1. Видео
    h += '<div class="step' + (watched ? ' done' : '') + '"><div><h3>' + t('topic.s1') + '</h3>' +
      (vids.length ? '<div class="vids">' + vids.map(function (v) {
        return '<a class="vid" href="' + esc(v.url) + '" target="_blank" rel="noopener" data-act="video" data-topic="' + id + '"><span class="play">' + ic('play') + '</span><span class="vt">' + esc(v.title) + '<small>YouTube</small></span></a>';
      }).join('') + '</div>' : '<p class="muted">' + t('topic.noVideo') + '</p>') +
      '<a class="back" href="' + esc(searchUrl(tp)) + '" target="_blank" rel="noopener">' + ic('search') + t('topic.search') + '</a></div></div>';
    // 2. Теория
    h += '<div class="step"><div><h3>' + t('topic.s2') + '</h3><ul class="theory">' + tp.theory.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>';
    // 3. Решённый пример (генерируется, уровень B)
    if (tp.kind !== 'reading') {
      var ex = E.buildQuestion(id, 2, 777 + id.length, E.modeFor(S.profile.school));
      h += '<div class="step"><div><h3>' + t('topic.s3') + '</h3><div class="example">' + qText(ex) +
        '<details><summary>' + t('topic.showSol') + '</summary><div class="fb ok"><b>' + t('pr.answer') + ': ' + E.show(ex.ansValue, ex.unit, ql()) + '</b><div class="sol">' + solText(ex) + '</div></div></details></div></div></div>';
    }
    // 4. Домашка
    h += '<div class="step' + (pr && pr.hw ? ' done' : '') + '"><div><h3>' + t('topic.s4', { n: n }) + '</h3>' + (tp.bank ? '' : ladder(hw)) +
      '<div class="row"><button class="btn primary" data-act="hw" data-topic="' + id + '">' + (hw ? t('hw.cont', { i: hw.idx, n: hw.n }) : t('hw.start')) + '</button>' +
      '<button class="btn line" data-act="quick" data-topic="' + id + '">' + t('hw.quick') + '</button></div></div></div>';
    h += '</div></div>';
    if (pr) {
      h += '<div class="stats"><div class="stat"><b>' + (pr.grade || 0) + '/10</b><span>' + t('topic.bestGrade') + '</span></div><div class="stat"><b>' + (pr.hw || 0) + '</b><span>' + t('topic.hwCount') + '</span></div>' +
        '<div class="stat"><b>' + pr.solved + '</b><span>' + t('topic.solved') + '</span></div><div class="stat"><b>' + pct(pr.best) + '</b><span>' + t('topic.best') + '</span></div></div>';
    }
    return h;
  }
  // Лесенка домашки в виде строк бланка: кружок на каждую задачу.
  function ladder(hw) {
    var plan = E.HW_PLAN, start = 0;
    return '<div class="ladder">' + [1, 2, 3, 4].map(function (l) {
      var n = plan[l], bubs = '';
      for (var i = 0; i < n; i++) {
        var k = start + i, cls = '';
        if (hw && k < hw.idx) { var hh = hw.hist.filter(function (x) { return !x.retry; })[k]; cls = hh && hh.ok ? ' on' : ' bad'; }
        bubs += '<span class="bub' + cls + '"></span>';
      }
      start += n;
      return '<div class="rung"><div class="rh">' + lvPill(l) + '<span>' + n + '</span></div><div class="bubs">' + bubs + '</div></div>';
    }).join('') + '</div>';
  }

  /* =================== ЖАТТЫҒУ / ТРЕНИРОВКА =================== */
  function vPractice() {
    var s = mem.session;
    if (!s) return vToday();
    if (s.done) return practiceDone(s);
    var tp = s.topic ? Z.topicById[s.topic] : null, q = s.current, fb = mem.fb, qtp = Z.topicById[q.topic];
    var title = s.mode === 'mistakes' ? t('nav.mistakes') : tn(tp) + ' · ' + (s.mode === 'hw' ? t('hw.title') : t('hw.quick'));
    var bar;
    if (s.plan) {
      var done = s.idx, segs = [1, 2, 3, 4].map(function (l) {
        var before = 0; for (var k = 1; k < l; k++) before += E.HW_PLAN[k];
        var w = Math.max(0, Math.min(1, (done - before) / E.HW_PLAN[l])) * 100;
        return '<i style="--w:' + w + '%"></i>';
      }).join('');
      bar = '<div class="prog-l">' + segs + '</div>';
    } else bar = '<div class="bar"><i style="width:' + (s.idx / s.n * 100) + '%"></i></div>';
    var exit = s.topic ? '#/topic/' + s.topic : '#/mistakes';
    var h = '<div class="ph"><a class="back" href="' + exit + '" aria-label="' + t('c.back') + '">' + ic('close') + '</a><div class="ph-title"><b>' + title + '</b>' + bar + '</div>' +
      '<span class="qnum">' + Math.min(s.idx + 1, s.n) + ' / ' + s.n + '</span></div>';
    h += '<section class="card qcard"><div class="qtop"><span class="row">' + lvPill(q.lvl) + (q.isRetry ? '<span class="pill retry">' + t('hw.retry') + '</span>' : '') +
      (s.mode === 'mistakes' ? '<span class="pill">' + tn(qtp) + '</span>' : '') + '</span></div>';
    if (q.passage) h += passageBox(q.passage);
    h += qText(q) + answerArea(q, fb ? fb.given : mem.sel, !!fb);
    if (fb) {
      h += '<div class="fb ' + (fb.ok ? 'ok' : 'no') + '"><b>' + (fb.ok ? t('pr.right') : t('pr.wrong')) + '</b>' +
        (fb.ok ? '' : '<div>' + t('pr.answer') + ': <b>' + E.show(q.ansValue, q.unit, ql()) + '</b></div>') +
        '<div class="sol"><span>' + t('pr.solution') + ':</span> ' + solText(q) + '</div></div>' +
        '<button class="btn primary wide" data-act="next" data-autofocus>' + t('c.next') + '</button>';
    } else {
      h += '<button class="btn primary wide" data-act="check"' + (q.type === 'mc' && !mem.sel ? ' disabled' : '') + '>' + t('c.check') + '</button>';
    }
    return h + '</section>';
  }
  function answerArea(q, chosen, locked) {
    if (q.type === 'int') {
      return '<div class="int-in"><input id="ans" inputmode="numeric" autocomplete="off" placeholder="' + t('pr.input') + '"' +
        (locked ? ' disabled value="' + esc(chosen || '') + '"' : ' data-autofocus') + '>' + (q.unit ? '<span>' + unitText(q) + '</span>' : '') + '</div>';
    }
    return '<div class="opts">' + q.options.map(function (o, i) {
      var cls = 'opt';
      if (chosen === o.key) cls += ' sel';
      if (locked && o.key === q.ansKey) cls += ' right';
      if (locked && chosen === o.key && o.key !== q.ansKey) cls += ' wrong';
      return '<button class="' + cls + '" data-act="pick" data-key="' + esc(o.key) + '"' + (locked ? ' disabled' : '') + '><span class="L">' + LETTERS[i] + '</span><span class="ot">' + optText(o) + '</span></button>';
    }).join('') + '</div>';
  }
  function passageBox(id) {
    var p = Z.bank.reading.filter(function (x) { return x.id === id; })[0];
    return '<details class="passage" open><summary>' + t('ex.passage') + ': «' + esc(p.title) + '»</summary><div>' + esc(p.text).replace(/\n/g, '<br>') + '</div></details>';
  }
  function practiceDone(s) {
    var r = mem.res, tp = s.topic ? Z.topicById[s.topic] : null;
    var title = s.mode === 'hw' ? t('hw.done') : s.mode === 'mistakes' ? t('mist.done') : t('hw.quickDone');
    var msg = r.grade >= 10 ? t('hw.g10') : r.grade >= 8 ? t('hw.g8') : r.grade >= 6 ? t('hw.g6') : t('hw.g0');
    var h = '<section class="card"><span class="label">' + (tp ? tn(tp) : t('nav.mistakes')) + '</span><h1>' + title + '</h1>' +
      '<div class="row" style="justify-content:space-between;align-items:flex-end"><div><span class="label">' + t('hw.grade') + '</span><div class="result-big"><b>' + r.grade + '</b><span>/ 10</span></div></div>' +
      (s.mode === 'mistakes' ? '' : '<div style="font-size:2rem">' + stars(r.stars) + '</div>') + '</div>' +
      '<p>' + t('hw.solved', { c: r.correct, n: r.total }) + (r.retries ? ' · ' + t('hw.retries', { n: r.retries }) : '') + '</p><p>' + msg + '</p>';
    var lv = Object.keys(r.byLevel);
    if (lv.length > 1) {
      h += '<div><span class="label">' + t('hw.levels') + '</span>' + lv.map(function (l) {
        var b = r.byLevel[l];
        return '<div class="lv-row">' + lvPill(+l) + '<span class="bar"><i style="width:' + (b.ok / b.n * 100) + '%"></i></span><span class="num">' + b.ok + ' / ' + b.n + '</span></div>';
      }).join('') + '</div>';
    }
    var wrong = s.hist.filter(function (x) { return !x.ok && !x.passage && s.mode !== 'mistakes'; }).length;
    if (wrong) h += '<div class="note teal">' + t('hw.toBook', { n: wrong }) + '</div>';
    if (s.mode === 'mistakes') h += '<div class="note">' + t('mist.left', { n: (S.mistakes || []).length }) + '</div>';
    h += '<div class="row">' + (tp ? '<a class="btn line" href="#/topic/' + tp.id + '">' + t('c.back') + '</a>' : '<a class="btn line" href="#/mistakes">' + t('nav.mistakes') + '</a>') +
      '<a class="btn primary" href="#/today">' + t('c.home') + '</a></div></section>';
    return h;
  }

  /* =================== ҚАТЕ ДӘПТЕРІ / ТЕТРАДЬ ОШИБОК =================== */
  function vMistakes() {
    var list = (S.mistakes || []).filter(function (m) { return Z.topicById[m.topic] && Z.topicById[m.topic].schools.indexOf(S.profile.school) >= 0; });
    var h = '<div class="sec"><h1>' + t('mist.title') + '</h1><p class="muted">' + t('mist.sub') + '</p></div>';
    if (!list.length) return h + '<div class="note ok">' + t('mist.empty') + '</div>';
    h += '<div class="row"><button class="btn primary" data-act="mistakes">' + t('mist.start', { n: Math.min(15, list.length) }) + '</button></div>';
    var by = {};
    list.forEach(function (m) { var b = by[m.topic] = by[m.topic] || { n: 0, lv: {} }; b.n++; b.lv[m.lvl] = (b.lv[m.lvl] || 0) + 1; });
    h += '<section class="sec"><h2>' + t('mist.byTopic') + '</h2><div class="tbl-wrap"><table class="tbl"><tbody>' + Object.keys(by).sort(function (a, b) { return by[b].n - by[a].n; }).map(function (k) {
      var b = by[k];
      return '<tr><td><a href="#/topic/' + k + '">' + tn(Z.topicById[k]) + '</a></td><td>' + Object.keys(b.lv).map(function (l) { return lvPill(+l) + ' ' + b.lv[l]; }).join(' ') + '</td>' +
        '<td class="num"><b>' + b.n + '</b></td><td class="num"><button class="btn line sm" data-act="mistakes" data-topic="' + k + '">' + t('res.train') + '</button></td></tr>';
    }).join('') + '</tbody></table></div></section>';
    return h;
  }

  /* =================== СЫНАҚТАР / ТЕСТЫ =================== */
  function vTests() {
    var sc = S.profile.school;
    var h = '<div class="sec"><h1>' + t('tests.title') + '</h1><p class="muted">' + t('tests.sub') + '</p></div><div class="note">' + (sc === 'BIL' ? t('ex.rulesBIL') : t('ex.rulesRFMSH', { max: 150 })) + '</div>';
    if (S.activeExam) h += resumeBanner();
    h += '<div class="formats">' + Z.formatsFor(sc).map(function (f) {
      var n = S.exams.filter(function (e) { return e.format === f.id; }).length;
      return '<div class="card fmt' + (f.full ? ' full' : '') + '"><span class="label">' + (f.full ? t('today.mock') : t('today.short')) + '</span><h3>' + fname(f) + '</h3><p class="muted">' + qCount(f) + ' ' + t('c.q') + ' · ' + f.minutes + ' ' + t('c.min') + '</p>' +
        '<small class="muted">' + t('tests.done', { n: n }) + '</small><button class="btn ' + (f.full ? 'primary' : 'line') + '" data-act="startExam" data-f="' + f.id + '">' + t('c.start') + '</button></div>';
    }).join('') + '</div>';
    var hist = S.exams.slice(-10).reverse();
    h += '<section class="sec"><h2>' + t('tests.history') + '</h2>' + (hist.length ? '<div class="tbl-wrap"><table class="tbl"><tbody>' + hist.map(function (e) {
      var f = Z.examFormats[e.format];
      return '<tr><td>' + e.date + '</td><td>' + (f ? fname(f) : e.format) + '</td><td class="num"><b>' + e.score + '</b> / ' + e.max + '</td><td class="num">' + pct(e.pct) + '</td></tr>';
    }).join('') + '</tbody></table></div>' : '<p class="muted">' + t('tests.none') + '</p>') + '</section>';
    return h;
  }

  function answered(ex, i) { return ex.answers[i] !== undefined && ex.answers[i] !== ''; }
  function vExam() {
    var ex = S.activeExam;
    if (!ex) return vTests();
    var f = Z.examFormats[ex.format], q = ex.questions[ex.cur], n = ex.questions.length;
    var cnt = ex.questions.filter(function (qq, i) { return answered(ex, i); }).length;
    var h = '<div class="exh"><span class="title">' + fname(f) + '</span><span class="timer" id="timer">--:--</span><span class="muted small">' + cnt + ' / ' + n + '</span>' +
      '<button class="btn line sm" data-act="sheet">' + t('ex.sheet') + '</button><button class="btn primary sm" data-act="finishExam">' + t('c.finish') + '</button></div>';
    if (mem.sheet) {
      h += '<div class="sheet">' + ex.questions.map(function (qq, i) {
        return '<button class="' + (i === ex.cur ? 'c' : '') + (ex.flags[i] ? ' f' : '') + '" data-act="goto" data-i="' + i + '">' + (i + 1) + ' <span class="bub' + (answered(ex, i) ? ' on' : '') + '"></span></button>';
      }).join('') + '</div>';
    }
    h += '<section class="card qcard"><div class="qtop"><span class="qnum">' + (ex.cur + 1) + ' / ' + n + '</span>' + (f.points ? '<span class="row">' + lvPill(q.lvl) + '<span class="pill">' + f.points[q.lvl] + '</span></span>' : '') + '</div>';
    if (q.passage) h += passageBox(q.passage);
    h += qText(q);
    if (q.type === 'int') {
      h += '<div class="int-in"><input id="exans" inputmode="numeric" autocomplete="off" placeholder="' + t('pr.input') + '" value="' + esc(ex.answers[ex.cur] || '') + '" data-autofocus>' +
        (q.unit ? '<span>' + unitText(q) + '</span>' : '') + '</div>';
    } else {
      h += '<div class="opts">' + q.options.map(function (o, i) {
        return '<button class="opt' + (ex.answers[ex.cur] === o.key ? ' sel' : '') + '" data-act="exPick" data-key="' + esc(o.key) + '"><span class="L">' + LETTERS[i] + '</span><span class="ot">' + optText(o) + '</span></button>';
      }).join('') + '</div>';
    }
    h += '<div class="exnav"><button class="btn line" data-act="exPrev"' + (ex.cur === 0 ? ' disabled' : '') + '>' + t('ex.prev') + '</button>' +
      '<button class="btn line" data-act="exFlag">' + (ex.flags[ex.cur] ? t('ex.flagged') : t('ex.flag')) + '</button>' +
      '<button class="btn primary" data-act="exNext">' + (ex.cur === n - 1 ? t('c.finish') : t('c.next')) + '</button></div></section>';
    return h;
  }
  function startTimer() {
    if (mem.timer) clearInterval(mem.timer);
    function tick() {
      var ex = S.activeExam, el = document.getElementById('timer');
      if (!ex) { clearInterval(mem.timer); return; }
      var left = Math.round((ex.startedAt + ex.minutes * 60000 - Date.now()) / 1000);
      if (left <= 0) { clearInterval(mem.timer); mem.timer = null; finishExam(true); return; }
      if (el) { el.textContent = U.pad2(Math.floor(left / 60)) + ':' + U.pad2(left % 60); el.classList.toggle('low', left < 300); }
    }
    tick(); mem.timer = setInterval(tick, 1000);
  }
  function finishExam(timeout) {
    var ex = S.activeExam;
    if (!ex) return;
    readExamInput();
    var res = E.scoreExam(ex);
    P.recordExam(S, ex, res, today());
    mem.lastExam = S.lastExam = { ex: ex, res: res, timeout: !!timeout };
    S.activeExam = null; mem.sheet = false;
    save();
    go('#/result');
  }
  function readExamInput() {
    var el = document.getElementById('exans'), ex = S.activeExam;
    if (el && ex) { ex.answers[ex.cur] = el.value.trim(); save(); }
  }

  /* =================== НӘТИЖЕ / РЕЗУЛЬТАТ =================== */
  function vResult() {
    var L = mem.lastExam;
    if (!L) return vTests();
    var ex = L.ex, r = L.res, f = Z.examFormats[ex.format];
    var h = (L.timeout ? '<div class="note amber">' + t('ex.timeout') + '</div>' : '') +
      '<section class="card"><span class="label">' + fname(f) + '</span><h1>' + t('res.title') + '</h1>' +
      '<div class="result-big"><b' + (r.score < 0 ? ' class="neg"' : '') + '>' + U.fmt(r.score) + '</b><span>/ ' + r.max + '</span></div>' +
      '<div class="stats"><div class="stat"><b style="color:var(--ok)">' + r.correct + '</b><span>' + t('res.right') + '</span></div><div class="stat"><b style="color:var(--bad)">' + r.wrong + '</b><span>' + t('res.wrong') + '</span></div>' +
      '<div class="stat"><b>' + r.skipped + '</b><span>' + t('res.skip') + '</span></div></div></section>';
    if (r.lostBySkipping > 0) h += '<div class="note amber">' + t('res.guess', { n: r.skipped, ev: U.fmt(r.guessEV), lost: U.fmt(r.lostBySkipping) }) + '</div>';
    var rows = Object.keys(r.byTopic).map(function (k) { return { k: k, ok: r.byTopic[k].ok, n: r.byTopic[k].n }; })
      .sort(function (a, b) { return a.ok / a.n - b.ok / b.n; });
    h += '<section class="sec"><h2>' + t('res.byTopic') + '</h2><div class="tbl-wrap"><table class="tbl"><tbody>' + rows.map(function (x) {
      var tp = Z.topicById[x.k], acc = x.ok / x.n;
      return '<tr><td><a href="#/topic/' + x.k + '">' + tn(tp) + '</a></td><td class="num">' + x.ok + ' / ' + x.n + '</td><td class="meter"><i style="width:' + acc * 100 + '%" class="' + (acc < 0.6 ? 'lo' : '') + '"></i></td>' +
        '<td class="num">' + (acc < 1 ? '<button class="btn line sm" data-act="quick" data-topic="' + x.k + '">' + t('res.train') + '</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div></section>';
    var wrongs = ex.questions.map(function (q, i) { return { q: q, i: i, ok: E.check(q, ex.answers[i]) }; }).filter(function (x) { return x.ok !== true; });
    if (wrongs.length) {
      h += '<section class="sec"><h2>' + t('res.review') + ' (' + wrongs.length + ')</h2>' + wrongs.map(function (x) {
        var q = x.q, given = ex.answers[x.i], givenTxt = given === undefined || given === '' ? t('res.none') : q.type === 'mc' ? optText(q.options.filter(function (o) { return o.key === given; })[0] || { kk: given, ru: given }) : esc(given);
        return '<details class="card rev"><summary><b>' + (x.i + 1) + '.</b> ' + tn(Z.topicById[q.topic]) + ' ' + lvPill(q.lvl) + ' — <span class="' + (x.ok === false ? 'no' : 'muted') + '">' + t('res.your') + ': ' + givenTxt + '</span></summary>' +
          (q.passage ? passageBox(q.passage) : '') + qText(q) + '<div class="fb no"><div>' + t('pr.answer') + ': <b>' + E.show(q.ansValue, q.unit, ql()) + '</b></div><div class="sol"><span>' + t('pr.solution') + ':</span> ' + solText(q) + '</div></div></details>';
      }).join('') + '</section>';
    }
    h += '<div class="row"><a class="btn primary" href="#/today">' + t('c.home') + '</a><a class="btn line" href="#/mistakes">' + t('nav.mistakes') + '</a><a class="btn line" href="#/tests">' + t('nav.tests') + '</a></div>';
    return h;
  }

  /* =================== НӘТИЖЕЛЕР / ПРОГРЕСС =================== */
  function vProgress() {
    var fc = P.forecast(S);
    var h = '<section class="card"><span class="label">' + t('prog.forecast') + '</span>' +
      (fc ? '<div class="result-big"><b>' + fc.score + '</b><span>/ ' + fc.max + '</span></div><p class="muted">' + t('prog.forecastNote', { n: Math.min(3, fc.n) }) + '</p>' : '<p class="muted">' + t('prog.noMocks') + '</p>') + '</section>';
    h += chart();
    var weak = P.weakTopics(S);
    if (weak.length) h += '<section class="sec"><h2>' + t('prog.weak') + '</h2><div class="row">' + weak.map(function (w) { return '<a class="btn line sm" href="#/topic/' + w.topic + '">' + tn(Z.topicById[w.topic]) + ' · ' + pct(w.acc) + '</a>'; }).join('') + '</div></section>';
    h += '<section class="sec"><h2>' + t('prog.topics') + ' · ' + pct(P.readiness(S)) + '</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + t('nav.topics') + '</th><th>' + t('topic.bestGrade') + '</th><th></th><th class="num">' + t('topic.solved') + '</th></tr></thead><tbody>' +
      Z.topicsFor(S.profile.school).map(function (tp) {
        var pr = S.topics[tp.id];
        return '<tr><td><a href="#/topic/' + tp.id + '">' + tn(tp) + '</a></td><td>' + (pr && pr.grade ? gradeHtml(pr.grade) : '—') + '</td><td>' + stars(pr ? pr.stars : 0) + '</td><td class="num muted">' + (pr ? pr.solved : 0) + '</td></tr>';
      }).join('') + '</tbody></table></div></section>';
    return h;
  }
  // Один ряд — динамика баллов полных пробных (линия + точки с подсказками).
  function chart() {
    var full = S.exams.filter(function (e) { var f = Z.examFormats[e.format]; return f && f.full && f.school === S.profile.school; }).slice(-12);
    if (full.length < 2) return '';
    var W = 600, H = 220, pl = 40, pr = 16, pt = 16, pb = 30, max = full[full.length - 1].max;
    var x = function (i) { return pl + i * (W - pl - pr) / (full.length - 1); };
    var y = function (v) { return pt + (1 - Math.max(0, v) / max) * (H - pt - pb); };
    var grid = [0, 0.25, 0.5, 0.75, 1].map(function (g) {
      return '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(g * max) + '" y2="' + y(g * max) + '" class="gl"/><text x="' + (pl - 6) + '" y="' + (y(g * max) + 4) + '" class="ax" text-anchor="end">' + Math.round(g * max) + '</text>';
    }).join('');
    var pts = full.map(function (e, i) { return x(i) + ',' + y(e.score); }).join(' ');
    var dots = full.map(function (e, i) {
      return '<g class="pt"><circle cx="' + x(i) + '" cy="' + y(e.score) + '" r="12" class="hit"><title>' + e.date + ': ' + e.score + ' / ' + e.max + '</title></circle><circle cx="' + x(i) + '" cy="' + y(e.score) + '" r="4.5" class="dot"/></g>';
    }).join('');
    var last = full[full.length - 1];
    return '<section class="card"><h2>' + t('prog.chart') + '</h2><svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + t('prog.chart') + '">' + grid +
      '<polyline points="' + pts + '" class="ln"/>' + dots + '<text x="' + x(full.length - 1) + '" y="' + (y(last.score) - 12) + '" class="lbl" text-anchor="end">' + last.score + '</text>' +
      '<text x="' + pl + '" y="' + (H - 8) + '" class="ax">' + full[0].date + '</text><text x="' + (W - pr) + '" y="' + (H - 8) + '" class="ax" text-anchor="end">' + last.date + '</text></svg></section>';
  }

  /* =================== БАПТАУЛАР / НАСТРОЙКИ =================== */
  function vSettings() {
    var p = S.profile;
    var sch = Object.keys(Z.schools).filter(function (k) { return Z.schools[k].active; }).map(function (k) {
      return '<option value="' + k + '"' + (p.school === k ? ' selected' : '') + '>' + Z.schools[k].name + ' — ' + t('sch.' + k) + '</option>';
    }).join('');
    var grades = [4, 5, 6, 7].map(function (g) { return '<option value="' + g + '"' + (+p.grade === g ? ' selected' : '') + '>' + t('ob.grade', { n: g }) + '</option>'; }).join('');
    function sel(name, cur, opts) { return '<select id="set-' + name + '" name="' + name + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (cur === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }
    return '<form class="card form" data-form="settings"><h2>' + t('set.profile') + '</h2>' +
      '<label class="field"><span>' + t('set.name') + '</span><input id="set-name" name="name" value="' + esc(p.name) + '" maxlength="30"></label>' +
      '<label class="field"><span>' + t('set.school') + '</span><select id="set-school" name="school">' + sch + '</select></label>' +
      '<div class="row2"><label class="field"><span>' + t('set.grade') + '</span><select id="set-grade" name="grade">' + grades + '</select></label>' +
      '<label class="field"><span>' + t('set.date') + '</span><input id="set-date" type="date" name="examDate" value="' + (p.examDate || '') + '"></label></div>' +
      intensityField(p.intensity || 'normal') +
      '<div class="row2"><label class="field"><span>' + t('set.qlang') + '</span>' + sel('qLang', p.qLang || 'both', [['both', t('set.both')], ['kk', t('set.kk')], ['ru', t('set.ru')]]) + '</label>' +
      '<label class="field"><span>' + t('set.ui') + '</span>' + sel('uiLang', p.uiLang || 'kk', [['kk', 'Қазақша'], ['ru', 'Русский']]) + '</label></div>' +
      '<div class="row"><button class="btn primary" type="submit">' + t('c.save') + '</button><span class="muted" id="saved"></span></div></form>' +
      '<details class="card"><summary><h2>' + t('set.videos') + '</h2></summary><p class="muted">' + t('set.videosNote') + '</p>' +
      Z.topicsFor(p.school).map(function (tp) {
        return '<label class="field"><span>' + tn(tp) + '</span><input id="vid-' + tp.id + '" type="url" placeholder="' + esc(tp.videos && tp.videos[0] ? tp.videos[0].url : 'https://www.youtube.com/watch?v=…') + '" data-video="' + tp.id + '" value="' + esc(S.videos[tp.id] || '') + '"></label>';
      }).join('') + '</details>' +
      '<section class="card"><h2>' + t('set.data') + '</h2><div class="row"><button class="btn line" data-act="export">' + t('set.export') + '</button>' +
      '<label class="btn line">' + t('set.import') + '<input type="file" accept="application/json" id="importFile" hidden></label>' +
      '<button class="btn danger" data-act="reset">' + t('set.reset') + '</button></div></section>';
  }

  /* =================== ДЕЙСТВИЯ =================== */
  function startSession(s) { mem.session = s; mem.sel = null; mem.fb = null; mem.res = null; go('#/practice'); }
  var A = {
    video: function (el) { P.recordVideo(S, el.dataset.topic, today()); save(); setTimeout(render, 300); return true; },
    hw: function (el) {
      var id = el.dataset.topic;
      S.hw = S.hw || {};
      if (!S.hw[id]) { S.hw[id] = E.newSession(id, S.profile.school, { mode: 'hw', readStage: P.readLevel(S) - 1 }); save(); }
      startSession(S.hw[id]);
    },
    quick: function (el) {
      var id = el.dataset.topic, pr = S.topics[id];
      startSession(E.newSession(id, S.profile.school, { mode: 'quick', startLevel: pr ? Math.max(1, pr.level - 1) : 1, readStage: P.readLevel(S) - 1 }));
    },
    mistakes: function (el) {
      var list = (S.mistakes || []).filter(function (m) { return Z.topicById[m.topic] && Z.topicById[m.topic].schools.indexOf(S.profile.school) >= 0 && (!el.dataset.topic || m.topic === el.dataset.topic); });
      startSession(E.mistakeSession(list.slice(0, 15), S.profile.school));
    },
    pick: function (el) { mem.sel = el.dataset.key; render(); },
    check: function () {
      var s = mem.session, q = s.current, given = q.type === 'int' ? (document.getElementById('ans') || {}).value : mem.sel;
      if (given === undefined || given === null || String(given).trim() === '') return;
      var ok = E.answer(s, String(given).trim());
      mem.fb = { ok: ok, given: q.type === 'int' ? String(given).trim() : given };
      if (s.mode === 'hw') save();
      render();
    },
    next: function () {
      var s = mem.session;
      E.advance(s); mem.sel = null; mem.fb = null;
      if (s.done) {
        mem.res = E.sessionResult(s);
        if (s.topic) P.recordPractice(S, s.topic, mem.res, today());
        P.recordMistakes(S, s.hist, today());
        if (s.mode === 'hw' && S.hw) delete S.hw[s.topic];
      }
      if (s.mode === 'hw' || s.done) save();
      render();
    },
    startExam: function (el) {
      var fid = el.dataset.f;
      function start() { var ex = E.buildExam(fid, U.newSeed(), { readLevel: P.readLevel(S) }); ex.cur = 0; S.activeExam = ex; mem.sheet = false; save(); go('#/exam'); }
      if (S.activeExam) ask(t('ex.resume') + '. ' + t('ex.abandon') + '?', t('ex.abandon'), start, t('c.cancel'));
      else start();
    },
    abandonExam: function () { S.activeExam = null; save(); render(); },
    exPick: function (el) {
      var ex = S.activeExam, k = el.dataset.key;
      ex.answers[ex.cur] = ex.answers[ex.cur] === k ? '' : k;   // повторный клик снимает ответ
      save(); render();
    },
    exNext: function () {
      readExamInput();
      var ex = S.activeExam;
      if (ex.cur < ex.questions.length - 1) { ex.cur++; save(); render(); } else A.finishExam();
    },
    exPrev: function () { readExamInput(); var ex = S.activeExam; if (ex.cur > 0) { ex.cur--; save(); render(); } },
    exFlag: function () { var ex = S.activeExam; ex.flags[ex.cur] = !ex.flags[ex.cur]; save(); render(); },
    goto: function (el) { readExamInput(); S.activeExam.cur = +el.dataset.i; save(); render(); },
    sheet: function () { readExamInput(); mem.sheet = !mem.sheet; render(); },
    finishExam: function () {
      readExamInput();
      var ex = S.activeExam;
      var empty = ex.questions.filter(function (q, i) { return !answered(ex, i); }).length;
      ask(t('ex.confirm', { n: empty }), t('c.finish'), function () { finishExam(false); });
    },
    export: function () {
      var blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'zerde-' + today() + '.json'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    },
    reset: function () { ask(t('set.resetQ'), t('set.reset'), function () { S = Z.store.reset(); mem = { lastExam: null }; go('#/today'); }); },
    modalYes: function () { var f = mem.modalYes; closeModal(); if (f) f(); },
    modalNo: function () { closeModal(); }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (el && A[el.dataset.act]) {
      if (el.dataset.act !== 'video') e.preventDefault();   // видео открывается по обычной ссылке
      A[el.dataset.act](el, e);
      return;
    }
    if (e.target.closest('#burger')) document.body.classList.toggle('menu-open');
    else if (document.body.classList.contains('menu-open') && !e.target.closest('#side')) document.body.classList.remove('menu-open');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); document.body.classList.remove('menu-open'); return; }
    if (e.key !== 'Enter') return;
    if (e.target.id === 'ans') { e.preventDefault(); A.check(); }
    else if (e.target.id === 'exans') { e.preventDefault(); A.exNext(); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'exans' && S.activeExam) { S.activeExam.answers[S.activeExam.cur] = e.target.value.trim(); save(); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.dataset && el.dataset.video) {
      var v = el.value.trim();
      if (v && !/^https?:\/\//.test(v)) return;
      if (v) S.videos[el.dataset.video] = v; else delete S.videos[el.dataset.video];
      save();
    }
    if (el.id === 'importFile' && el.files[0]) {
      var rd = new FileReader();
      rd.onload = function () {
        try { var data = JSON.parse(rd.result); if (!data.profile) throw new Error('no profile'); S = data; save(); I.setLang(S.profile.uiLang || 'kk'); go('#/today'); }
        catch (err) { ask(t('set.importBad'), 'OK', null, false); }
      };
      rd.readAsText(el.files[0]);
    }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target, form = f.dataset.form;
    if (!form) return;
    e.preventDefault();
    var d = new FormData(f);
    if (form === 'onboard') {
      S.profile = { name: String(d.get('name')).trim() || 'Оқушы', school: d.get('school'), grade: +d.get('grade'), examDate: d.get('examDate') || null,
        intensity: d.get('intensity') || 'normal', qLang: 'both', uiLang: I.lang(), startDate: today() };
      save(); go('#/today');
    } else if (form === 'settings') {
      var p = S.profile, oldSchool = p.school, oldInt = p.intensity;
      p.name = String(d.get('name')).trim() || p.name; p.school = d.get('school'); p.grade = +d.get('grade');
      p.examDate = d.get('examDate') || null; p.intensity = d.get('intensity'); p.qLang = d.get('qLang'); p.uiLang = d.get('uiLang');
      I.setLang(p.uiLang);
      // Сменили школу или нагрузку — план на сегодня пересобираем.
      if (oldSchool !== p.school || oldInt !== p.intensity) delete S.plans[today()];
      if (oldSchool !== p.school) { S.activeExam = null; S.hw = {}; }
      save(); render();
      var s2 = document.getElementById('saved'); if (s2) s2.textContent = t('c.saved');
    }
  });

  window.addEventListener('hashchange', render);
  I.setLang((S.profile && S.profile.uiLang) || 'kk');
  render();
})();
