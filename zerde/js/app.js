/* Зерде — интерфейс: маршрутизация по #hash, экраны, обработчики.
 * Экран = функция, возвращающая HTML. Клики обрабатываются делегированием
 * по атрибуту data-act, поэтому после перерисовки ничего не нужно перевешивать. */
(function () {
  'use strict';
  var Z = window.Z, U = Z.util, E = Z.engine, P = Z.planner, I = Z.i18n, t = I.t, esc = U.esc;
  var S = Z.store.load();
  var mem = { session: null, sel: null, fb: null, exam: null, timer: null, sheet: false, lastExam: S.lastExam || null };
  var LETTERS = ['A', 'B', 'C', 'D', 'E'];

  function save() { Z.store.save(S); }
  function today() { return U.todayKey(); }
  function go(h) { if (location.hash === h) render(); else location.hash = h; }
  function tn(tp) { return I.lang() === 'ru' ? tp.ru : tp.kk; }
  function fname(f) { return I.lang() === 'ru' ? f.ru : f.kk; }
  function school() { return Z.schools[S.profile.school]; }
  function stars(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '★' : '☆'; return '<span class="stars" aria-label="' + n + '/3">' + s + '</span>'; }
  function qCount(f) { return f.sections.reduce(function (a, s) { return a + (s.count || (s.mix[1] + s.mix[2] + s.mix[3])); }, 0); }
  function videoUrl(tp) { return S.videos[tp.id] || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(tp.video); }
  function pct(x) { return Math.round(x * 100) + '%'; }

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
  function solText(q) { return (S.profile && S.profile.qLang === 'ru') ? q.sol_ru : q.sol_kk; }
  function optText(o) { return (S.profile && S.profile.qLang === 'ru') ? o.ru : o.kk; }
  function unitText(q) { return q.unit ? (I.lang() === 'ru' || (S.profile && S.profile.qLang === 'ru') ? q.unit.ru : q.unit.kk) : ''; }

  /* =================== ОБОЛОЧКА =================== */
  function shell() {
    var nav = [['today', '◎'], ['topics', '▤'], ['tests', '✎'], ['progress', '↗'], ['settings', '⚙']];
    var cur = (location.hash.split('/')[1] || 'today');
    document.getElementById('nav').innerHTML = nav.map(function (n) {
      return '<a href="#/' + n[0] + '" class="' + (cur === n[0] ? 'on' : '') + '"><span class="ico" aria-hidden="true">' + n[1] + '</span>' + t('nav.' + n[0]) + '</a>';
    }).join('');
    var p = S.profile;
    document.getElementById('me').innerHTML = p ? '<span class="badge" style="--c:' + school().color + '">' + school().name + '</span> ' + esc(p.name) : '';
    document.getElementById('tag').textContent = t('app.tag');
    document.documentElement.lang = I.lang();
  }

  /* =================== МАРШРУТЫ =================== */
  function render() {
    if (mem.timer && !/^#\/exam/.test(location.hash)) { clearInterval(mem.timer); mem.timer = null; }
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var view = document.getElementById('view'), html;
    document.body.classList.remove('menu-open');
    if (!S.profile) { document.body.classList.add('bare'); view.innerHTML = vOnboarding(); return; }
    document.body.classList.remove('bare');
    shell();
    switch (parts[0]) {
      case 'topics': html = vTopics(); break;
      case 'topic': html = vTopic(parts[1]); break;
      case 'practice': html = vPractice(); break;
      case 'tests': html = vTests(); break;
      case 'exam': html = vExam(); break;
      case 'result': html = vResult(); break;
      case 'progress': html = vProgress(); break;
      case 'settings': html = vSettings(); break;
      default: html = vToday();
    }
    view.innerHTML = html;
    document.body.classList.toggle('focus', parts[0] === 'exam' || parts[0] === 'practice');
    if (parts[0] === 'exam') startTimer();
    var inp = view.querySelector('[data-autofocus]'); if (inp) inp.focus();
    window.scrollTo(0, 0);
  }

  /* =================== ОНБОРДИНГ =================== */
  function vOnboarding() {
    var def = U.addDays(today(), 120);
    var sch = Object.keys(Z.schools).map(function (k, i) {
      var s = Z.schools[k];
      return '<label class="pick' + (s.active ? '' : ' off') + '"><input type="radio" name="school" value="' + k + '"' + (i === 0 ? ' checked' : '') + (s.active ? '' : ' disabled') + '>' +
        '<b style="color:' + s.color + '">' + s.name + '</b><small>' + t('sch.' + k) + (s.active ? '' : ' — ' + t('ob.soon')) + '</small></label>';
    }).join('');
    var grades = [4, 5, 6, 7].map(function (g) { return '<option value="' + g + '"' + (g === 6 ? ' selected' : '') + '>' + t('ob.grade', { n: g }) + '</option>'; }).join('');
    return '<form class="onb card" data-form="onboard">' +
      '<div class="logo big">Зерде</div><h1>' + t('ob.title') + '</h1><p class="muted">' + t('ob.sub') + '</p>' +
      '<label class="field"><span>' + t('set.name') + '</span><input name="name" required maxlength="30" autocomplete="given-name"></label>' +
      '<div class="field"><span>' + t('set.school') + '</span><div class="picks">' + sch + '</div></div>' +
      '<div class="row2"><label class="field"><span>' + t('set.grade') + '</span><select name="grade">' + grades + '</select></label>' +
      '<label class="field"><span>' + t('set.date') + '</span><input type="date" name="examDate" value="' + def + '" min="' + today() + '"></label></div>' +
      intensityField('normal') +
      '<button class="btn primary wide" type="submit">' + t('ob.go') + ' →</button></form>';
  }
  function intensityField(cur) {
    return '<div class="field"><span>' + t('set.intensity') + '</span>' + ['light', 'normal', 'intense'].map(function (k) {
      return '<label class="radio"><input type="radio" name="intensity" value="' + k + '"' + (k === cur ? ' checked' : '') + '> ' + t('set.' + k) + '</label>';
    }).join('') + '</div>';
  }

  /* =================== БҮГІН / СЕГОДНЯ =================== */
  function vToday() {
    var p = S.profile, d = today(), plan = P.planFor(S, d);
    save();
    var left = p.examDate ? U.daysBetween(d, p.examDate) : null;
    var leftTxt = left === null ? t('today.noDate') : left > 0 ? t('today.left', { school: school().name, n: left }) : left === 0 ? t('today.leftToday') : t('today.passed');
    var fc = P.forecast(S), streak = P.streak(S, d), ready = P.readiness(S);
    var h = '<section class="hero card"><div><h1>' + t('today.hello', { name: esc(p.name) }) + '</h1><p class="count">' + leftTxt + '</p></div>' +
      '<div class="kpis"><div class="kpi"><b>' + streak + '</b><span>🔥 ' + t('today.streak') + '</span></div>' +
      '<div class="kpi"><b>' + pct(ready) + '</b><span>' + t('today.ready') + '</span></div>' +
      (fc ? '<div class="kpi"><b>' + fc.score + '<small>/' + fc.max + '</small></b><span>' + t('today.forecast') + '</span></div>' : '') + '</div></section>';
    if (S.activeExam) h += resumeBanner();
    if (plan.mock) h += '<div class="note mock">🏁 ' + t('today.mockBadge') + '</div>';
    var done = plan.tasks.filter(function (x) { return x.done; }).length;
    h += '<section><div class="sec-h"><h2>' + t('today.tasks') + '</h2><span class="muted">' + done + ' / ' + plan.tasks.length + '</span></div>';
    h += '<div class="bar"><i style="width:' + (plan.tasks.length ? done / plan.tasks.length * 100 : 0) + '%"></i></div>';
    if (done === plan.tasks.length && done > 0) h += '<div class="note ok">🎉 ' + t('today.allDone') + '</div>';
    h += '<ol class="tasks">' + plan.tasks.map(taskCard).join('') + '</ol></section>';
    h += weekStrip();
    var weak = P.weakTopics(S).slice(0, 3);
    if (weak.length) {
      h += '<section><h2>' + t('prog.weak') + '</h2><div class="chips">' + weak.map(function (w) {
        return '<a class="chip warn" href="#/topic/' + w.topic + '">' + tn(Z.topicById[w.topic]) + ' · ' + pct(w.acc) + '</a>';
      }).join('') + '</div></section>';
    }
    return h;
  }
  function taskCard(task) {
    if (task.type === 'test') {
      var f = Z.examFormats[task.format];
      return '<li class="task' + (task.done ? ' done' : '') + '"><span class="tk-ico test" aria-hidden="true">✎</span><div class="tk-body">' +
        '<b>' + fname(f) + '</b><small>' + t('task.testSteps', { n: qCount(f), m: f.minutes }) + '</small></div>' +
        '<div class="tk-act">' + (task.done ? '<span class="done-mark">✓ ' + t('c.done') + '</span>' : '<button class="btn primary" data-act="startExam" data-f="' + f.id + '">' + t('c.start') + '</button>') + '</div></li>';
    }
    var tp = Z.topicById[task.topic], pr = S.topics[tp.id];
    return '<li class="task' + (task.done ? ' done' : '') + '"><span class="tk-ico ' + tp.kind + '" aria-hidden="true">' + (tp.kind === 'logic' ? '◆' : tp.kind === 'reading' ? '¶' : '∑') + '</span>' +
      '<div class="tk-body"><small class="kind">' + t('kind.' + tp.kind) + '</small><b><a href="#/topic/' + tp.id + '">' + tn(tp) + '</a></b>' +
      '<small>' + t('task.steps', { n: E.SESSION_LEN }) + (pr ? ' · ' + stars(pr.stars) : '') + '</small></div>' +
      '<div class="tk-act"><a class="btn ghost' + (task.video ? ' seen' : '') + '" href="' + esc(videoUrl(tp)) + '" target="_blank" rel="noopener" data-act="video" data-topic="' + tp.id + '">▶ ' + (task.video ? t('task.watched') : t('c.video')) + '</a>' +
      (task.done ? '<span class="done-mark">✓ ' + t('c.done') + '</span>' : '<button class="btn primary" data-act="practice" data-topic="' + tp.id + '">' + t('task.practice') + '</button>') + '</div></li>';
  }
  function weekStrip() {
    var wk = P.weekPreview(S, today()), names = I.lang() === 'ru' ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] : ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жс'];
    return '<section><h2>' + t('today.week') + '</h2><div class="week">' + wk.map(function (d, i) {
      var dt = new Date(d.date + 'T00:00:00'), wd = (dt.getDay() + 6) % 7;
      var lbl = d.mock ? t('today.mock') : d.test ? t('today.short') : t('today.rest');
      return '<div class="day' + (i === 0 ? ' now' : '') + (d.mock ? ' mock' : '') + '"><span>' + names[wd] + '</span><b>' + dt.getDate() + '</b><small>' + lbl + '</small>' +
        (d.total ? '<i class="dots">' + d.done + '/' + d.total + '</i>' : '') + '</div>';
    }).join('') + '</div></section>';
  }
  function resumeBanner() {
    var f = Z.examFormats[S.activeExam.format];
    return '<div class="note resume">⏳ ' + t('ex.resume') + ': <b>' + fname(f) + '</b> <a class="btn primary sm" href="#/exam">' + t('ex.resumeBtn') + '</a>' +
      ' <button class="btn ghost sm" data-act="abandonExam">' + t('ex.abandon') + '</button></div>';
  }

  /* =================== ТАҚЫРЫПТАР / ТЕМЫ =================== */
  function vTopics() {
    var kinds = ['math', 'logic', 'reading'];
    return '<h1>' + t('nav.topics') + '</h1>' + kinds.map(function (k) {
      var list = Z.topicsFor(S.profile.school, k);
      if (!list.length) return '';
      return '<section><h2>' + t('kind.' + k) + '</h2><ul class="topic-list">' + list.map(function (tp) {
        var pr = S.topics[tp.id];
        return '<li><a href="#/topic/' + tp.id + '"><span>' + tn(tp) + '</span><span class="tl-meta">' + (pr ? pct(pr.best) + ' ' : '') + stars(pr ? pr.stars : 0) + '</span></a></li>';
      }).join('') + '</ul></section>';
    }).join('');
  }
  function vTopic(id) {
    var tp = Z.topicById[id];
    if (!tp) return vTopics();
    var pr = S.topics[id];
    var n = tp.kind === 'reading' ? 10 : E.SESSION_LEN;
    return '<a class="back" href="#/topics">← ' + t('nav.topics') + '</a><section class="card topic">' +
      '<small class="kind">' + t('kind.' + tp.kind) + '</small><h1>' + tn(tp) + '</h1>' +
      '<div class="steps"><a class="btn ghost big" href="' + esc(videoUrl(tp)) + '" target="_blank" rel="noopener" data-act="video" data-topic="' + id + '">▶ ' + t('c.video') + '</a>' +
      '<button class="btn primary big" data-act="practice" data-topic="' + id + '">' + t('topic.practice', { n: n }) + '</button></div>' +
      '<p class="muted small">' + t('topic.videoNote') + '</p>' +
      '<h3>' + t('topic.theory') + '</h3><ul class="theory">' + tp.theory.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      (pr ? '<div class="stats"><div><b>' + stars(pr.stars) + '</b><span>&nbsp;</span></div><div><b>' + pr.sessions + '</b><span>' + t('topic.sessions') + '</span></div>' +
        '<div><b>' + pct(pr.best) + '</b><span>' + t('topic.best') + '</span></div><div><b>' + pr.solved + '</b><span>' + t('topic.solved') + '</span></div>' +
        '<div><b>' + LETTERS[pr.level - 1] + '</b><span>' + t('topic.level') + '</span></div></div>' : '') + '</section>';
  }

  /* =================== ЖАТТЫҒУ / ТРЕНИРОВКА =================== */
  function vPractice() {
    var s = mem.session;
    if (!s) return vToday();
    var tp = Z.topicById[s.topic];
    if (s.done) return practiceDone(s, tp);
    var q = s.current, fb = mem.fb;
    var h = '<div class="ph"><a class="back" href="#/topic/' + tp.id + '">✕</a><div class="ph-mid"><b>' + tn(tp) + '</b>' +
      '<div class="bar"><i style="width:' + (s.idx / s.n * 100) + '%"></i></div></div><span class="pill lvl' + q.lvl + '">' + t('pr.level') + ' ' + LETTERS[q.lvl - 1] + '</span></div>';
    h += '<section class="card qcard"><div class="qnum">' + t('pr.of', { i: s.idx + 1, n: s.n }) + '</div>';
    if (q.passage) h += passageBox(q.passage);
    h += qText(q) + answerArea(q, fb ? fb.given : mem.sel, !!fb, fb);
    if (fb) {
      h += '<div class="fb ' + (fb.ok ? 'ok' : 'no') + '"><b>' + (fb.ok ? '✓ ' + t('pr.right') : '✗ ' + t('pr.wrong')) + '</b>' +
        (fb.up ? ' <span class="pill up">↑ ' + t('pr.up') + '</span>' : '') +
        (fb.ok ? '' : '<div>' + t('pr.answer') + ': <b>' + E.show(q.ansValue, q.unit, S.profile.qLang === 'ru' ? 'ru' : 'kk') + '</b></div>') +
        '<div class="sol"><span>' + t('pr.solution') + ':</span> ' + solText(q) + '</div></div>' +
        '<button class="btn primary wide" data-act="next" data-autofocus>' + t('c.next') + ' →</button>';
    } else {
      h += '<button class="btn primary wide" data-act="check"' + (q.type === 'mc' && !mem.sel ? ' disabled' : '') + '>' + t('c.check') + '</button>';
    }
    return h + '</section>';
  }
  function answerArea(q, chosen, locked, fb) {
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
  function practiceDone(s, tp) {
    var r = mem.practiceRes;
    return '<section class="card done-card"><h1>' + t('pr.finish') + '</h1><div class="big-stars">' + stars(r.stars) + '</div>' +
      '<p class="score">' + t('pr.result', { c: r.correct, n: r.total }) + ' · ' + pct(r.acc) + '</p>' +
      '<p class="muted">' + t('pr.hard', { n: r.hardOk }) + '</p><p>' + t('pr.stars' + r.stars) + '</p>' +
      '<div class="steps"><a class="btn ghost" href="' + esc(videoUrl(tp)) + '" target="_blank" rel="noopener" data-act="video" data-topic="' + tp.id + '">▶ ' + t('c.video') + '</a>' +
      '<button class="btn ghost" data-act="practice" data-topic="' + tp.id + '">↻ ' + t('c.again') + '</button>' +
      '<a class="btn primary" href="#/today">' + t('c.home') + '</a></div></section>';
  }

  /* =================== СЫНАҚТАР / ТЕСТЫ =================== */
  function vTests() {
    var sc = S.profile.school;
    var rules = sc === 'BIL' ? t('ex.rulesBIL') : t('ex.rulesRFMSH', { max: 150 });
    var h = '<h1>' + t('tests.title') + '</h1><p class="muted">' + t('tests.sub') + '</p><div class="note">' + rules + '</div>';
    if (S.activeExam) h += resumeBanner();
    h += '<div class="grid">' + Z.formatsFor(sc).map(function (f) {
      var n = S.exams.filter(function (e) { return e.format === f.id; }).length;
      return '<div class="card fmt' + (f.full ? ' full' : '') + '"><h3>' + fname(f) + '</h3><p>' + qCount(f) + ' ' + t('c.q') + ' · ' + f.minutes + ' ' + t('c.min') + '</p>' +
        '<small class="muted">' + t('tests.done', { n: n }) + '</small><button class="btn ' + (f.full ? 'primary' : 'ghost') + '" data-act="startExam" data-f="' + f.id + '">' + t('c.start') + '</button></div>';
    }).join('') + '</div>';
    var hist = S.exams.slice(-10).reverse();
    h += '<section><h2>' + t('tests.history') + '</h2>' + (hist.length ? '<table class="tbl"><tbody>' + hist.map(function (e) {
      var f = Z.examFormats[e.format];
      return '<tr><td>' + e.date + '</td><td>' + (f ? fname(f) : e.format) + '</td><td class="num"><b>' + e.score + '</b> / ' + e.max + '</td><td class="num">' + pct(e.pct) + '</td></tr>';
    }).join('') + '</tbody></table>' : '<p class="muted">' + t('tests.none') + '</p>') + '</section>';
    return h;
  }

  function vExam() {
    var ex = S.activeExam;
    if (!ex) return vTests();
    var f = Z.examFormats[ex.format], q = ex.questions[ex.cur], n = ex.questions.length;
    var answered = Object.keys(ex.answers).filter(function (k) { return ex.answers[k] !== '' && ex.answers[k] != null; }).length;
    var h = '<div class="exh"><b>' + fname(f) + '</b><span class="timer" id="timer">--:--</span><span class="muted">' + answered + ' / ' + n + '</span>' +
      '<button class="btn ghost sm" data-act="sheet">' + t('ex.sheet') + '</button><button class="btn primary sm" data-act="finishExam">' + t('c.finish') + '</button></div>';
    if (mem.sheet) {
      h += '<div class="sheet">' + ex.questions.map(function (qq, i) {
        var a = ex.answers[i], cls = (a !== undefined && a !== '' ? 'a' : '') + (ex.flags[i] ? ' f' : '') + (i === ex.cur ? ' c' : '');
        return '<button class="' + cls + '" data-act="goto" data-i="' + i + '">' + (i + 1) + '</button>';
      }).join('') + '</div>';
    }
    h += '<section class="card qcard"><div class="qnum">' + (ex.cur + 1) + ' / ' + n + (f.points ? ' · <span class="pill lvl' + q.lvl + '">' + LETTERS[q.lvl - 1] + ' · ' + f.points[q.lvl] + '</span>' : '') + '</div>';
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
    h += '<div class="exnav"><button class="btn ghost" data-act="exPrev"' + (ex.cur === 0 ? ' disabled' : '') + '>← ' + t('ex.prev') + '</button>' +
      '<button class="btn ghost' + (ex.flags[ex.cur] ? ' flagged' : '') + '" data-act="exFlag">⚑ ' + (ex.flags[ex.cur] ? t('ex.flagged') : t('ex.flag')) + '</button>' +
      '<button class="btn primary" data-act="exNext">' + (ex.cur === n - 1 ? t('c.finish') : t('c.next') + ' →') + '</button></div></section>';
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
    var h = (L.timeout ? '<div class="note warn">⏰ ' + t('ex.timeout') + '</div>' : '') +
      '<section class="card res-hero"><h1>' + t('res.title') + '</h1><p class="muted">' + fname(f) + '</p>' +
      '<div class="res-score"><b' + (r.score < 0 ? ' class="neg"' : '') + '>' + U.fmt(r.score) + '</b><span>/ ' + r.max + '</span></div>' +
      '<div class="kpis"><div class="kpi ok"><b>' + r.correct + '</b><span>' + t('res.right') + '</span></div><div class="kpi no"><b>' + r.wrong + '</b><span>' + t('res.wrong') + '</span></div>' +
      '<div class="kpi"><b>' + r.skipped + '</b><span>' + t('res.skip') + '</span></div></div></section>';
    if (r.lostBySkipping > 0) h += '<div class="note tip">💡 ' + t('res.guess', { n: r.skipped, ev: U.fmt(r.guessEV), lost: U.fmt(r.lostBySkipping) }) + '</div>';
    var rows = Object.keys(r.byTopic).map(function (k) { return { k: k, ok: r.byTopic[k].ok, n: r.byTopic[k].n }; })
      .sort(function (a, b) { return a.ok / a.n - b.ok / b.n; });
    h += '<section><h2>' + t('res.byTopic') + '</h2><table class="tbl"><tbody>' + rows.map(function (x) {
      var tp = Z.topicById[x.k], acc = x.ok / x.n;
      return '<tr><td>' + tn(tp) + '</td><td class="num">' + x.ok + ' / ' + x.n + '</td><td class="meter"><i style="width:' + acc * 100 + '%" class="' + (acc < 0.6 ? 'lo' : 'hi') + '"></i></td>' +
        '<td>' + (acc < 1 ? '<button class="btn ghost sm" data-act="practice" data-topic="' + x.k + '">' + t('res.train') + '</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></section>';
    var wrongs = ex.questions.map(function (q, i) { return { q: q, i: i, ok: E.check(q, ex.answers[i]) }; }).filter(function (x) { return x.ok !== true; });
    if (wrongs.length) {
      h += '<section><h2>' + t('res.review') + ' (' + wrongs.length + ')</h2>' + wrongs.map(function (x) {
        var q = x.q, given = ex.answers[x.i], givenTxt = given === undefined || given === '' ? t('res.none') : q.type === 'mc' ? optText(q.options.filter(function (o) { return o.key === given; })[0] || { kk: given, ru: given }) : esc(given);
        return '<details class="card rev"><summary><b>' + (x.i + 1) + '.</b> ' + tn(Z.topicById[q.topic]) + ' — <span class="' + (x.ok === false ? 'no' : 'muted') + '">' + t('res.your') + ': ' + givenTxt + '</span></summary>' +
          (q.passage ? passageBox(q.passage) : '') + qText(q) + '<div class="fb no"><div>' + t('pr.answer') + ': <b>' + E.show(q.ansValue, q.unit, S.profile.qLang === 'ru' ? 'ru' : 'kk') + '</b></div><div class="sol"><span>' + t('pr.solution') + ':</span> ' + solText(q) + '</div></div></details>';
      }).join('') + '</section>';
    }
    h += '<div class="steps"><a class="btn primary" href="#/today">' + t('c.home') + '</a><a class="btn ghost" href="#/tests">' + t('nav.tests') + '</a></div>';
    return h;
  }

  /* =================== НӘТИЖЕЛЕР / ПРОГРЕСС =================== */
  function vProgress() {
    var fc = P.forecast(S);
    var h = '<h1>' + t('nav.progress') + '</h1><section class="card"><h2>' + t('prog.forecast') + '</h2>' +
      (fc ? '<div class="res-score"><b>' + fc.score + '</b><span>/ ' + fc.max + '</span></div><p class="muted">' + t('prog.forecastNote', { n: Math.min(3, fc.n) }) + '</p>' : '<p class="muted">' + t('prog.noMocks') + '</p>') + '</section>';
    h += chart();
    var weak = P.weakTopics(S);
    if (weak.length) h += '<section><h2>' + t('prog.weak') + '</h2><div class="chips">' + weak.map(function (w) { return '<a class="chip warn" href="#/topic/' + w.topic + '">' + tn(Z.topicById[w.topic]) + ' · ' + pct(w.acc) + '</a>'; }).join('') + '</div></section>';
    h += '<section><h2>' + t('prog.topics') + ' · ' + pct(P.readiness(S)) + '</h2><table class="tbl"><tbody>' + Z.topicsFor(S.profile.school).map(function (tp) {
      var pr = S.topics[tp.id];
      return '<tr><td><a href="#/topic/' + tp.id + '">' + tn(tp) + '</a></td><td>' + stars(pr ? pr.stars : 0) + '</td><td class="num">' + (pr ? pct(pr.best) : '—') + '</td><td class="num muted">' + (pr ? pr.solved : 0) + '</td></tr>';
    }).join('') + '</tbody></table></section>';
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
    function sel(name, cur, opts) { return '<select name="' + name + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (cur === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }
    return '<h1>' + t('nav.settings') + '</h1><form class="card" data-form="settings"><h2>' + t('set.profile') + '</h2>' +
      '<label class="field"><span>' + t('set.name') + '</span><input name="name" value="' + esc(p.name) + '" maxlength="30"></label>' +
      '<label class="field"><span>' + t('set.school') + '</span><select name="school">' + sch + '</select></label>' +
      '<div class="row2"><label class="field"><span>' + t('set.grade') + '</span><select name="grade">' + grades + '</select></label>' +
      '<label class="field"><span>' + t('set.date') + '</span><input type="date" name="examDate" value="' + (p.examDate || '') + '"></label></div>' +
      intensityField(p.intensity || 'normal') +
      '<div class="row2"><label class="field"><span>' + t('set.qlang') + '</span>' + sel('qLang', p.qLang || 'both', [['both', t('set.both')], ['kk', t('set.kk')], ['ru', t('set.ru')]]) + '</label>' +
      '<label class="field"><span>' + t('set.ui') + '</span>' + sel('uiLang', p.uiLang || 'kk', [['kk', 'Қазақша'], ['ru', 'Русский']]) + '</label></div>' +
      '<button class="btn primary" type="submit">' + t('c.save') + '</button> <span class="muted" id="saved"></span></form>' +
      '<details class="card"><summary><h2>' + t('set.videos') + '</h2></summary><p class="muted">' + t('set.videosNote') + '</p>' +
      Z.topicsFor(p.school).map(function (tp) {
        return '<label class="field"><span>' + tn(tp) + '</span><input type="url" placeholder="https://www.youtube.com/watch?v=…" data-video="' + tp.id + '" value="' + esc(S.videos[tp.id] || '') + '"></label>';
      }).join('') + '</details>' +
      '<section class="card"><h2>' + t('set.data') + '</h2><div class="steps"><button class="btn ghost" data-act="export">⇩ ' + t('set.export') + '</button>' +
      '<label class="btn ghost">⇧ ' + t('set.import') + '<input type="file" accept="application/json" id="importFile" hidden></label>' +
      '<button class="btn danger" data-act="reset">' + t('set.reset') + '</button></div></section>';
  }

  /* =================== ДЕЙСТВИЯ =================== */
  var A = {
    video: function (el) { P.recordVideo(S, el.dataset.topic, today()); save(); setTimeout(render, 300); return true; },
    practice: function (el) {
      var id = el.dataset.topic, pr = S.topics[id];
      mem.session = E.newSession(id, S.profile.school, pr ? pr.level : 1);
      mem.sel = null; mem.fb = null;
      go('#/practice');
    },
    pick: function (el) { mem.sel = el.dataset.key; render(); },
    check: function () {
      var s = mem.session, q = s.current, given = q.type === 'int' ? (document.getElementById('ans') || {}).value : mem.sel;
      if (given === undefined || given === null || String(given).trim() === '') return;
      var before = s.level, ok = E.answer(s, String(given).trim());
      mem.fb = { ok: ok, given: q.type === 'int' ? String(given).trim() : given, up: s.level > before };
      render();
    },
    next: function () {
      var s = mem.session;
      E.advance(s); mem.sel = null; mem.fb = null;
      if (s.done) { mem.practiceRes = E.sessionResult(s); P.recordPractice(S, s.topic, mem.practiceRes, today()); save(); }
      render();
    },
    startExam: function (el) {
      if (S.activeExam && !window.confirm(t('ex.resume') + '. ' + t('ex.abandon') + '?')) { go('#/exam'); return; }
      var ex = E.buildExam(el.dataset.f, U.newSeed());
      ex.cur = 0; S.activeExam = ex; mem.sheet = false; save();
      go('#/exam');
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
      var empty = ex.questions.filter(function (q, i) { return ex.answers[i] === undefined || ex.answers[i] === ''; }).length;
      if (window.confirm(t('ex.confirm', { n: empty }))) finishExam(false);
    },
    export: function () {
      var blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'zerde-' + today() + '.json'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    },
    reset: function () { if (window.confirm(t('set.resetQ'))) { S = Z.store.reset(); mem = { lastExam: null }; go('#/today'); } }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (el && A[el.dataset.act]) {
      if (el.dataset.act !== 'video') e.preventDefault();   // видео открывается по обычной ссылке
      A[el.dataset.act](el, e);
      return;
    }
    if (e.target.closest('#burger')) document.body.classList.toggle('menu-open');
  });
  document.addEventListener('keydown', function (e) {
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
        catch (err) { window.alert(t('set.importBad')); }
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
      if (oldSchool !== p.school) S.activeExam = null;
      save(); render();
      var s2 = document.getElementById('saved'); if (s2) s2.textContent = '✓ ' + t('c.saved');
    }
  });

  window.addEventListener('hashchange', render);
  I.setLang((S.profile && S.profile.uiLang) || 'kk');
  render();
})();
