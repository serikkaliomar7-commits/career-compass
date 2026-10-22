/* Зерде — экраны аккаунта и сообщества: лендинг, вход/регистрация, тарифы и оплата, аккаунт,
 * кабинет родителя, рейтинг месяца, админка, флеш-карточки, ойындар (игры).
 * Подключается после app.js и пользуется его общими функциями (Z.ui). */
(function (root) {
  'use strict';
  var Z = root.Z, U = Z.util, I = Z.i18n, B = Z.backend;
  var ui = function () { return Z.ui; };

  /* ---------- тексты экранов ---------- */
  var L = {
    kk: {
      'nav.pricing': 'Тарифтер', 'nav.account': 'Аккаунт', 'nav.leaders': 'Рейтинг', 'nav.cards': 'Карточкалар', 'nav.game': 'Ойындар', 'nav.admin': 'Әкімші',
      'nav.kids': 'Балаларым', 'nav.secParent': 'Ата-ана', 'nav.secAcc': 'Аккаунт', 'role.parent': 'Ата-ана', 'role.student': 'Оқушы', 'role.admin': 'Әкімші', 'pts.unit': 'ұпай',
      'l.login': 'Кіру', 'l.start': 'Дайындықты бастау', 'l.platform': 'Платформа', 'l.hero': 'Мақсатты мектепке бірінші талпыныстан түс',
      'l.heroSub': '5–7 сынып оқушыларына БИЛ, РФМШ және НЗМ емтихандарына дайындық: күнделікті жоспар, сабақтар, үй жұмыстары және нақты форматтағы сынақтар — бір платформада.',
      'l.max': 'БИЛ сынағының ең жоғары ұпайы', 'l.schools': 'Біз дайындайтын мектептер', 'l.inside': 'Платформаны іштен қара',
      'l.facts': 'Сандармен', 'l.f1': 'тақырып: математика, логика, оқу, НЗМ бөлімдері', 'l.f2': 'деңгей: A → B → C → ★ олимпиада', 'l.f3': 'есеп әр тақырыпта: әр жолы жаңа сандар мен формат', 'l.f4': 'флеш-карточка формулалар мен ережелерге',
      'l.pricing': 'Тарифтер', 'l.trial': 'Тіркелгеннен кейін {n} күн — тегін', 'l.month': 'ай', 'l.months': 'ай', 'l.per': '₸', 'l.save': 'үнем {p}%', 'l.choose': 'Таңдау',
      'l.faq': 'Жиі қойылатын сұрақтар',
      'l.q1': 'Қалай төлеймін?', 'l.a1': 'Тарифті таңдаңыз — сайт Kaspi аударымының сомасы мен нөмірін көрсетеді. Төлегеннен кейін әкімші бір күн ішінде растайды, қолжетімділік автоматты түрде ашылады.',
      'l.q2': 'Ата-ана не көреді?', 'l.a2': 'Ата-ана жеке аккаунтпен кіріп, баласының кодын енгізеді. Содан кейін баланың белсенділігін, үй жұмыстарын, сынақ нәтижелерін, әлсіз тақырыптарын және болжамды ұпайын көреді.',
      'l.q3': 'Жазылым өздігінен ұзара ма?', 'l.a3': 'Жоқ. Мерзім біткенде қолжетімділік тоқтайды, келесі айды өзіңіз таңдайсыз.',
      'l.q4': 'Қай тілде?', 'l.a4': 'Тапсырмалар қазақ және орыс тілдерінде (бірін немесе екеуін қатар көрсетуге болады), НЗМ-ге — ағылшын тілінің мәтіндері де бар.',
      'l.q5': 'Промокод деген не?', 'l.a5': 'Промокод жеңілдік немесе тегін қолжетімділік береді. Оны тіркелу кезінде немесе «Аккаунт» бетінде енгізуге болады.',
      'l.t.plan': 'Жоспар', 'l.t.lessons': 'Сабақтар', 'l.t.hw': 'Үй жұмысы', 'l.t.mock': 'Сынақтар', 'l.t.cards': 'Карточкалар', 'l.t.game': 'Ойындар', 'l.t.rank': 'Рейтинг', 'l.t.parent': 'Ата-ана',
      'l.d.plan': 'Күн сайын не істеу керек екенін сайт өзі айтады: 1–2 тақырып, қайталау және шағын тест. Аптасына 2–3 рет — толық сынақ. Бастапқы диагностика әлсіз тақырыптардан бастайды.',
      'l.d.lessons': 'Әр тақырыпта: видеосабақ, ереже, жиі кездесетін қателер, A → B → C үш шешілген мысал және «Өзіңді тексер».',
      'l.d.hw': 'Әр тақырыпқа 20 есеп: A → B → C → ★. Қате жауаптан кейін — ұқсас есеп. Есептер шаблонды емес: суреттер, кестелер, кері есептер, «қатені тап».',
      'l.d.mock': 'БИЛ (+4/−1), РФМШ (тек сан), НЗМ (бөлімдердің өз уақыты) форматтары. Қағазға басып шығарып, жауаптарды кейін енгізуге болады.',
      'l.d.cards': 'Формулалар мен ережелерге арналған флеш-карточкалар: «Білемін / Қайталау» — білмегендері жиірек шығады.',
      'l.d.game': 'Ойындар: жылдам есеп, бөлшек жекпе-жегі, тізбек, «шын ба, жалған ба?», формула викторинасы — әрқайсысы 60 секунд. Ұпай рейтингке қосылады.',
      'l.d.rank': 'Үй жұмысы, сынақ, карточка, ойын үшін ұпай беріледі. Ай сайын көшбасшыларға сыйлық.',
      'l.d.parent': 'Ата-ана баласының нәтижесін өз аккаунтынан көреді: белсенділік, үй жұмыстары, сынақтар, әлсіз тақырыптар.',
      'a.login': 'Кіру', 'a.signup': 'Тіркелу', 'a.who': 'Сіз кімсіз?', 'a.student': 'Оқушы', 'a.studentSub': 'Есеп шығарамын, курстан өтемін', 'a.parent': 'Ата-ана', 'a.parentSub': 'Баламның нәтижесін көремін',
      'a.name': 'Аты-жөні', 'a.email': 'Электрондық пошта', 'a.pass': 'Құпиясөз', 'a.passNew': 'Құпиясөз ойлап табыңыз', 'a.show': 'Көрсету', 'a.hide': 'Жасыру',
      'a.passHint': 'Кемінде 8 таңба: әріп пен сан болсын', 'a.pw0': 'Тым қысқа', 'a.pw1': 'Әлсіз — сан мен әріп қосыңыз', 'a.pw2': 'Жарайды', 'a.pw3': 'Мықты құпиясөз',
      'a.promoQ': 'Промокод бар ма?', 'a.forgot': 'Құпиясөзді ұмыттыңыз ба?', 'a.resetSent': 'Құпиясөзді жаңарту сілтемесі поштаңызға жіберілді.', 'a.resetEmail': 'Алдымен поштаңызды жазыңыз.',
      'a.terms': 'Тіркелу арқылы сіз деректеріңізді тек оқу үшін сақтауымызға келісесіз. 14 жасқа толмаған оқушыны ата-анасы тіркейді немесе ата-анасының рұқсатымен тіркеледі.', 'a.school': 'Мектеп', 'a.grade': 'Сынып', 'a.promo': 'Промокод (міндетті емес)',
      'a.go': 'Тіркелу', 'a.enter': 'Кіру', 'a.have': 'Аккаунт бар ма?', 'a.no': 'Аккаунт жоқ па?', 'a.demo': 'Демо-режим: аккаунттар тек осы браузерде сақталады. Нақты іске қосу үшін сервер қосылады (README).',
      'e.exists': 'Бұл пошта тіркелген. Кіріп көріңіз.', 'e.weak': 'Пошта мен құпиясөзді енгізіңіз.', 'e.pass_short': 'Құпиясөз кемінде 8 таңба болуы керек.', 'e.pass_mix': 'Құпиясөзде әріп те, сан да болсын.',
      'e.pass_common': 'Бұл құпиясөз тым оңай (12345678 сияқты). Басқасын ойлап табыңыз.', 'e.bad_email': 'Пошта дұрыс емес. Мысалы: aigerim@mail.kz',
      'e.locked': 'Құпиясөз бірнеше рет қате терілді. Қауіпсіздік үшін кіру 10 минутқа жабылды.', 'e.confirm_email': 'Поштаңызға хат жіберілді: сілтемені басып, сосын кіріңіз.',
      'e.demo_reset': 'Демо-режимде құпиясөзді қалпына келтіру жоқ. Админге жазыңыз.', 'e.bad_login': 'Пошта немесе құпиясөз қате.', 'e.network': 'Серверге қосылу мүмкін болмады.', 'e.error': 'Қате. Қайталап көріңіз.',
      'e.not_found': 'Мұндай промокод жоқ.', 'e.expired': 'Промокодтың мерзімі өткен.', 'e.used_up': 'Промокод таусылған.', 'e.already': 'Бұл промокод бұрын қолданылған.', 'e.role': 'Бұл әрекет тек ата-анаға.',
      'p.title': 'Тарифтер', 'p.sub': 'Барлық тақырыптар, сынақтар, карточкалар және рейтинг. Жазылым өздігінен ұзармайды.', 'p.active': 'Қолжетімділік тағы {n} күн', 'p.none': 'Қолжетімділік жоқ — тарифті таңдаңыз немесе промокод енгізіңіз.', 'p.forever': 'Қолжетімділік шексіз',
      'p.diag': 'Әзірге бастапқы диагностиканы тегін тапсыра аласыз.', 'p.diagGo': 'Диагностика', 'p.promo': 'Промокод', 'p.apply': 'Қолдану', 'p.pay': 'Төлеу',
      'p.kaspi': 'Kaspi арқылы төлеу', 'p.kaspiTo': '{amount} ₸ сомасын Kaspi-ге аударыңыз: {phone} ({name}). Аударма түсініктемесіне поштаңызды жазыңыз: {email}.', 'p.kaspiNo': 'Әкімші әзірге Kaspi нөмірін енгізбеген. Бізге хабарласыңыз.',
      'p.wait': 'Өтінім қабылданды (№{id}). Әкімші төлемді тексеріп, бір күн ішінде қолжетімділікті ашады.', 'p.mine': 'Менің өтінімдерім', 'p.st.pending': 'тексерілуде', 'p.st.approved': 'расталды', 'p.st.rejected': 'қабылданбады',
      'p.ok.free': 'Промокод қолданылды: тегін қолжетімділік ашылды.', 'p.ok.admin': 'Промокод қолданылды: сіз — әкімшісіз.', 'p.ok.discount': 'Жеңілдік {p}% — төлемде ескеріледі.',
      'acc.title': 'Аккаунт', 'acc.code': 'Ата-анаға арналған код', 'acc.codeNote': 'Ата-анаңыз өз аккаунтында осы кодты енгізсе, сіздің нәтижелеріңізді көре алады.', 'acc.outAll': 'Барлық құрылғыдан шығу', 'acc.outAllQ': 'Барлық телефон мен компьютердегі аккаунттан шығасыз ба? Қайта кіру керек болады.', 'acc.safe': 'Қауіпсіздік: құпиясөзді ешкімге айтпаңыз. Бөтен біреу кіргенін байқасаңыз — «Барлық құрылғыдан шығу» батырмасын басып, құпиясөзді «Құпиясөзді ұмыттыңыз ба?» арқылы ауыстырыңыз.', 'acc.out': 'Шығу', 'acc.status': 'Жазылым',
      'k.title': 'Балаларым', 'k.cards': 'Карточкалар: {k} / {n} «білемін» белгіленген', 'k.cardsNote': '— бала өзі белгілейді, тексеріп көріңіз (төмендегі кеңесті қараңыз).', 'k.add': 'Баланың кодын енгізіңіз', 'k.addNote': 'Код баланың «Аккаунт» бетінде тұр.', 'k.link': 'Қосу', 'k.none': 'Әзірге бала қосылмаған.', 'k.noData': 'Бала әлі ештеңе шығармады немесе прогресс әлі сақталмады.',
      'k.active': 'Белсенді күн (7 күн)', 'k.hw': 'Үй жұмысы (7 күн)', 'k.mocks': 'Сынақтар (7 күн)', 'k.ready': 'Дайындық', 'k.fc': 'Болжам', 'k.target': 'өту межесі {v}', 'k.weak': 'Назар аударыңыз', 'k.lastMocks': 'Соңғы сынақтар', 'k.topics': 'Тақырыптар бойынша бағалар', 'k.upd': 'Жаңартылды: {d}',
      'r.title': 'Ай рейтингі', 'r.sub': 'Ұпай: үй жұмысы, сынақтар, қайталау, карточкалар, ойын. Ай соңында көшбасшыларға сыйлық.', 'r.mine': 'Менің ұпайым осы айда', 'r.prizes': 'Сыйлықтар', 'r.noPrizes': 'Сыйлықтар жақында жарияланады.', 'r.all': 'Барлығы', 'r.empty': 'Бұл айда әзірге ұпай жоқ.', 'r.prev': 'Өткен ай', 'r.cur': 'Осы ай',
      'r.how': 'Ұпай қалай жиналады', 'r.h.hw': 'Үй жұмысы — баға × 10 (100-ге дейін)', 'r.h.mock': 'Толық сынақ — 150-ге дейін', 'r.h.test': 'Шағын тест — 50-ге дейін', 'r.h.review': 'Қайталау — 30', 'r.h.cards': 'Карточкалар — 20-ға дейін', 'r.h.game': 'Ойын — 30-ға дейін', 'r.h.day': 'Күндік жоспар толық — +30', 'r.h.cap': 'Күніне ең көбі 500 ұпай.',
      'ad.title': 'Әкімші', 'ad.pay': 'Төлемдер', 'ad.users': 'Оқушылар',
      'ad.k.all': 'барлығы', 'ad.k.students': 'оқушы', 'ad.k.today': 'бүгін кірді', 'ad.k.week': '7 күнде кірді', 'ad.k.new': 'жаңа (7 күн)',
      'ad.f.student': 'Оқушылар', 'ad.f.parent': 'Ата-аналар', 'ad.f.admin': 'Админдер', 'ad.f.active': '7 күнде белсенді', 'ad.f.all': 'Барлығы', 'ad.none': 'Ешкім табылмады.',
      'ad.c.name': 'Аты-жөні', 'ad.c.school': 'Мектеп · сынып', 'ad.c.seen': 'Соңғы рет', 'ad.c.topics': 'Тақырып меңгерді', 'ad.c.hw': 'Үй ж. (7 күн)', 'ad.c.mock': 'Соңғы сынақ', 'ad.c.ready': 'Дайындық', 'ad.c.access': 'Қолжетімділік',
      'ad.reg': 'тіркелді', 'ad.hint': 'Жолды басыңыз — оқушының толық беті ашылады: тақырыптар, сынақтар, әрекеттер журналы.', 'ad.forever': 'тегін, мерзімсіз', 'ad.paidTo': 'төленген: {d} дейін', 'ad.trialTo': 'сынақ: {d} дейін', 'ad.noAccess': 'қолжетімділік жоқ',
      'ad.grade': 'сынып', 'ad.code2': 'Бала коды', 'ad.synced': 'Прогресс сақталды', 'ad.streak': 'күн қатарынан', 'ad.mist': 'қате дәптерінде',
      'ad.topics': 'Тақырыптар', 'ad.t.done': 'Меңгерді', 'ad.t.go': 'Өтіп жатыр', 'ad.t.no': 'Басталмаған', 'ad.c.topic': 'Тақырып', 'ad.c.status': 'Күйі', 'ad.c.grade': 'Үздік баға', 'ad.c.solved': 'Шығарды', 'ad.c.hwN': 'Үй ж.',
      'ad.mocks': 'Сынақтар', 'ad.log': 'Әрекеттер журналы', 'ad.noSync': 'Оқушының прогресі серверге әлі сақталмаған (ол сайтқа кіріп, бір нәрсе шығаруы керек).',
      'act.signup': 'Тіркелді ({r})', 'act.login': 'Кірді (пошта + құпиясөз)', 'act.visit': 'Сайтқа кірді', 'act.hw': 'Үй жұмысы: {t} — {g}/10 ({ok}/{n})', 'act.quick': 'Қайталау: {t} — {g}/10', 'act.lesson': 'Сабақ ашты: {t}',
      'act.mock': 'Толық сынақ: {f} — {s}/{m}', 'act.test': 'Тест: {f} — {s}/{m}', 'act.diag': 'Диагностика — {s}/{m}', 'act.cards': 'Карточкалар: {d} — {k}/{n} «білемін»', 'act.game': 'Ойын — {s} ұпай',
      'act.promo': 'Промокод қолданды ({k})', 'act.pay': 'Төлем өтінімі — {a} ₸', 'act.admin': 'Әкімші әрекеті: {a}', 'ad.promo': 'Промокодтар', 'ad.set': 'Баптаулар', 'ad.approve': 'Растау', 'ad.reject': 'Бас тарту', 'ad.noPay': 'Тексерілетін төлем жоқ.',
      'ad.search': 'Іздеу (аты немесе пошта)', 'ad.grant': 'Күн қосу', 'ad.until': 'дейін', 'ad.code': 'Код', 'ad.kind': 'Түрі', 'ad.k.free': 'тегін қолжетімділік', 'ad.k.discount': 'жеңілдік', 'ad.k.admin': 'әкімші', 'ad.days': 'Күн (бос — шексіз)', 'ad.percent': 'Жеңілдік %', 'ad.max': 'Неше рет (бос — шексіз)', 'ad.note': 'Ескертпе', 'ad.create': 'Жасау', 'ad.used': 'қолданылды',
      'ad.kaspiPhone': 'Kaspi нөмірі', 'ad.kaspiName': 'Алушының аты', 'ad.prizesKk': 'Сыйлықтар (қазақша)', 'ad.prizesRu': 'Сыйлықтар (орысша)', 'ad.trial': 'Тегін күндер', 'ad.price': 'Баға, ₸', 'ad.save': 'Сақтау', 'ad.saved': 'Сақталды', 'ad.adminWarn': 'Әкімші промокодын тек сенімді адамдарға беріңіз және бір реттік етіп жасаңыз.',
      'c.title': 'Флеш-карточкалар', 'c.sub': 'Формулалар мен ережелер. Бастамас бұрын төмендегі ережені оқыңыз.',
      'c.h.title': 'Карточкалар қалай жұмыс істейді?', 'c.h.ok': 'Түсіндім, бастаймыз', 'c.h.again': 'Ереже',
      'c.h.1': '<b>Карточканы басыңыз</b> — артында жауабы ашылады. Алдымен жауапты өзіңіз есіңізге түсіріп көріңіз, сосын ғана ашыңыз.',
      'c.h.2': '<b>«Білемін»</b> — жауапты ашпай тұрып дұрыс айта алсаңыз ғана басыңыз. Карточка бір деңгейге көтеріледі (0-ден 4-ке дейін) және колоданың соңына қарай кетеді.',
      'c.h.3': '<b>«Қайталау»</b> — білмесеңіз немесе қателессеңіз басыңыз. Карточка 0 деңгейге түседі де, келесі жолы колоданың басында шығады. Бұл ұпайды азайтпайды.',
      'c.h.4': 'Карточка <b>2 рет «Білемін»</b> басылғаннан кейін «білемін» қатарына қосылады — колодалар бетінде мысалы «7/20 білемін» деп жазылады: 20 карточканың 7-еуін білесіз. Астындағы жолақ та соны көрсетеді.',
      'c.h.5': '<b>‹ және ›</b> — тек парақтау: ештеңе жазылмайды.',
      'c.h.6': 'Колоданы соңына дейін өткенде рейтингке ұпай қосылады: әр «Білемін» — 1 ұпай, бір колодадан күніне 20 ұпайдан аспайды.',
      'c.h.7': '<b>Адал болыңыз:</b> білмей «Білемін» бассаңыз, карточка сирек шығып, формула ұмытылып қалады — емтиханда дәл сол жерде қателесесіз.', 'c.cards': '{n} карточка', 'c.known': '{k}/{n} білемін', 'c.back': 'Карточкаларға', 'c.show': 'Жауапты көру үшін басыңыз', 'c.q': 'Сұрақ', 'c.a': 'Жауап',
      'c.know': 'Білемін', 'c.again': 'Қайталау', 'c.restart': 'Қайтадан', 'c.done': 'Колода аяқталды: {k} карточканы білесіз.', 'c.none': 'Карточкалар жақында қосылады.',
      'g.title': 'Ойындар', 'g.sub': 'Әр ойын — 60 секунд. Ойын таңдаңыз да, рекордыңызды жаңартыңыз. Күндегі бірінші ойын рейтингке ұпай береді.', 'g.start': 'Бастау', 'g.level': 'Деңгей', 'g.score': 'Нәтиже: {n}', 'g.best': 'Рекорд: {n}', 'g.prev': 'Алдыңғы', 'g.ok': 'Дұрыс: {n}', 'g.bad': 'Қате: {n}', 'g.again': 'Тағы ойнау', 'g.time': 'уақыт'
    },
    ru: {
      'nav.pricing': 'Тарифы', 'nav.account': 'Аккаунт', 'nav.leaders': 'Рейтинг', 'nav.cards': 'Карточки', 'nav.game': 'Игры', 'nav.admin': 'Админ',
      'nav.kids': 'Мои дети', 'nav.secParent': 'Родитель', 'nav.secAcc': 'Аккаунт', 'role.parent': 'Родитель', 'role.student': 'Ученик', 'role.admin': 'Админ', 'pts.unit': 'баллов',
      'l.login': 'Войти', 'l.start': 'Начать подготовку', 'l.platform': 'Платформа', 'l.hero': 'Поступи в школу мечты с первой попытки',
      'l.heroSub': 'Подготовка учеников 5–7 классов к экзаменам БИЛ, РФМШ и НИШ: план на каждый день, уроки, домашки и пробные тесты в настоящем формате — в одной платформе.',
      'l.max': 'максимальный балл пробного БИЛ', 'l.schools': 'Готовим в', 'l.inside': 'Взгляни на платформу изнутри',
      'l.facts': 'В цифрах', 'l.f1': 'тем: математика, логика, чтение, разделы НИШ', 'l.f2': 'уровня: A → B → C → ★ олимпиада', 'l.f3': 'задач на каждую тему: каждый раз новые числа и форматы', 'l.f4': 'флеш-карточек на формулы и правила',
      'l.pricing': 'Тарифы', 'l.trial': 'После регистрации {n} дня — бесплатно', 'l.month': 'месяц', 'l.months': 'мес.', 'l.per': '₸', 'l.save': 'выгода {p}%', 'l.choose': 'Выбрать',
      'l.faq': 'Частые вопросы',
      'l.q1': 'Как оплатить?', 'l.a1': 'Выберите тариф — сайт покажет сумму и номер для перевода на Kaspi. После оплаты админ подтвердит её в течение дня, и доступ откроется сам.',
      'l.q2': 'Что видит родитель?', 'l.a2': 'Родитель входит в свой аккаунт и вводит код ребёнка. Дальше он видит активность, домашки, результаты пробных, слабые темы и прогноз балла.',
      'l.q3': 'Подписка продлевается сама?', 'l.a3': 'Нет. Когда срок закончится, доступ остановится — следующий период вы выбираете сами.',
      'l.q4': 'На каком языке?', 'l.a4': 'Задания на казахском и русском (можно показывать один язык или оба), для НИШ — ещё тексты на английском.',
      'l.q5': 'Что такое промокод?', 'l.a5': 'Промокод даёт скидку или бесплатный доступ. Его можно ввести при регистрации или на странице «Аккаунт».',
      'l.t.plan': 'План', 'l.t.lessons': 'Уроки', 'l.t.hw': 'Домашка', 'l.t.mock': 'Пробники', 'l.t.cards': 'Карточки', 'l.t.game': 'Игры', 'l.t.rank': 'Рейтинг', 'l.t.parent': 'Родителям',
      'l.d.plan': 'Сайт сам говорит, что делать сегодня: 1–2 темы, повторение и короткий тест. 2–3 раза в неделю — полный пробник. Входная диагностика начинает со слабых тем.',
      'l.d.lessons': 'В каждой теме: видеоурок, правило, частые ошибки, три разобранных примера A → B → C и «Проверь себя».',
      'l.d.hw': '20 задач на тему: A → B → C → ★. После ошибки — похожая задача. Задачи не шаблонные: рисунки, таблицы, обратные задачи, «найди ошибку».',
      'l.d.mock': 'Форматы БИЛ (+4/−1), РФМШ (только число), НИШ (своё время у каждого раздела). Можно распечатать и потом внести ответы.',
      'l.d.cards': 'Флеш-карточки на формулы и правила: «Знаю / Повторить» — незнакомые показываются чаще.',
      'l.d.game': 'Игры: быстрый счёт, дуэль дробей, последовательность, «правда или ложь», викторина формул — каждая по 60 секунд. Баллы идут в рейтинг.',
      'l.d.rank': 'Баллы за домашки, пробники, карточки и игры. Каждый месяц лидеры получают призы.',
      'l.d.parent': 'Родитель видит результаты ребёнка в своём аккаунте: активность, домашки, пробники, слабые темы.',
      'a.login': 'Вход', 'a.signup': 'Регистрация', 'a.who': 'Кто вы?', 'a.student': 'Ученик', 'a.studentSub': 'Решаю задачи и прохожу курс', 'a.parent': 'Родитель', 'a.parentSub': 'Смотрю результаты ребёнка',
      'a.name': 'Имя и фамилия', 'a.email': 'Электронная почта', 'a.pass': 'Пароль', 'a.passNew': 'Придумайте пароль', 'a.show': 'Показать', 'a.hide': 'Скрыть',
      'a.passHint': 'Не меньше 8 символов: буквы и цифры', 'a.pw0': 'Слишком короткий', 'a.pw1': 'Слабый — добавьте цифры и буквы', 'a.pw2': 'Нормальный', 'a.pw3': 'Надёжный пароль',
      'a.promoQ': 'Есть промокод?', 'a.forgot': 'Забыли пароль?', 'a.resetSent': 'Ссылка для смены пароля отправлена на вашу почту.', 'a.resetEmail': 'Сначала введите почту.',
      'a.terms': 'Регистрируясь, вы соглашаетесь, что мы храним ваши данные только для обучения. Ученика младше 14 лет регистрирует родитель или ученик регистрируется с разрешения родителя.', 'a.school': 'Школа', 'a.grade': 'Класс', 'a.promo': 'Промокод (необязательно)',
      'a.go': 'Зарегистрироваться', 'a.enter': 'Войти', 'a.have': 'Уже есть аккаунт?', 'a.no': 'Нет аккаунта?', 'a.demo': 'Демо-режим: аккаунты хранятся только в этом браузере. Для настоящего запуска подключается сервер (README).',
      'e.exists': 'Эта почта уже зарегистрирована. Попробуйте войти.', 'e.weak': 'Введите почту и пароль.', 'e.pass_short': 'Пароль должен быть не короче 8 символов.', 'e.pass_mix': 'В пароле должны быть и буквы, и цифры.',
      'e.pass_common': 'Слишком простой пароль (как 12345678). Придумайте другой.', 'e.bad_email': 'Почта указана неверно. Пример: aigerim@mail.kz',
      'e.locked': 'Пароль несколько раз введён неверно. Для безопасности вход закрыт на 10 минут.', 'e.confirm_email': 'На почту отправлено письмо: перейдите по ссылке и войдите.',
      'e.demo_reset': 'В демо-режиме восстановления пароля нет. Напишите администратору.', 'e.bad_login': 'Неверная почта или пароль.', 'e.network': 'Не удалось подключиться к серверу.', 'e.error': 'Ошибка. Попробуйте ещё раз.',
      'e.not_found': 'Такого промокода нет.', 'e.expired': 'Срок промокода истёк.', 'e.used_up': 'Промокод закончился.', 'e.already': 'Этот промокод уже использован.', 'e.role': 'Это действие только для родителя.',
      'p.title': 'Тарифы', 'p.sub': 'Все темы, пробники, карточки и рейтинг. Подписка не продлевается автоматически.', 'p.active': 'Доступ ещё {n} дн.', 'p.none': 'Доступа нет — выберите тариф или введите промокод.', 'p.forever': 'Доступ бессрочный',
      'p.diag': 'Пока можно бесплатно пройти входную диагностику.', 'p.diagGo': 'Диагностика', 'p.promo': 'Промокод', 'p.apply': 'Применить', 'p.pay': 'Оплатить',
      'p.kaspi': 'Оплата через Kaspi', 'p.kaspiTo': 'Переведите {amount} ₸ на Kaspi: {phone} ({name}). В комментарии к переводу укажите почту: {email}.', 'p.kaspiNo': 'Админ пока не указал номер Kaspi. Свяжитесь с нами.',
      'p.wait': 'Заявка принята (№{id}). Админ проверит оплату и откроет доступ в течение дня.', 'p.mine': 'Мои заявки', 'p.st.pending': 'на проверке', 'p.st.approved': 'подтверждена', 'p.st.rejected': 'отклонена',
      'p.ok.free': 'Промокод применён: бесплатный доступ открыт.', 'p.ok.admin': 'Промокод применён: вы — админ.', 'p.ok.discount': 'Скидка {p}% — учтём при оплате.',
      'acc.title': 'Аккаунт', 'acc.code': 'Код для родителей', 'acc.codeNote': 'Если родитель введёт этот код в своём аккаунте, он увидит ваши результаты.', 'acc.outAll': 'Выйти на всех устройствах', 'acc.outAllQ': 'Выйти из аккаунта на всех телефонах и компьютерах? Понадобится войти заново.', 'acc.safe': 'Безопасность: никому не сообщайте пароль. Если заметили чужой вход — нажмите «Выйти на всех устройствах» и смените пароль через «Забыли пароль?».', 'acc.out': 'Выйти', 'acc.status': 'Подписка',
      'k.title': 'Мои дети', 'k.cards': 'Карточки: отмечено «знаю» {k} из {n}', 'k.cardsNote': '— отмечает сам ребёнок, проверьте (см. совет ниже).', 'k.add': 'Введите код ребёнка', 'k.addNote': 'Код есть у ребёнка на странице «Аккаунт».', 'k.link': 'Добавить', 'k.none': 'Пока нет привязанных детей.', 'k.noData': 'Ребёнок ещё ничего не решал или прогресс ещё не сохранился.',
      'k.active': 'Активных дней (7 дн.)', 'k.hw': 'Домашек (7 дн.)', 'k.mocks': 'Пробников (7 дн.)', 'k.ready': 'Готовность', 'k.fc': 'Прогноз', 'k.target': 'ориентир {v}', 'k.weak': 'Обратите внимание', 'k.lastMocks': 'Последние пробники', 'k.topics': 'Оценки по темам', 'k.upd': 'Обновлено: {d}',
      'r.title': 'Рейтинг месяца', 'r.sub': 'Баллы: домашки, пробники, повторение, карточки, игра. В конце месяца лидеры получают призы.', 'r.mine': 'Мои баллы в этом месяце', 'r.prizes': 'Призы', 'r.noPrizes': 'Призы скоро объявим.', 'r.all': 'Все', 'r.empty': 'В этом месяце баллов пока нет.', 'r.prev': 'Прошлый месяц', 'r.cur': 'Этот месяц',
      'r.how': 'Как заработать баллы', 'r.h.hw': 'Домашка — оценка × 10 (до 100)', 'r.h.mock': 'Полный пробник — до 150', 'r.h.test': 'Мини-тест — до 50', 'r.h.review': 'Повторение — 30', 'r.h.cards': 'Карточки — до 20', 'r.h.game': 'Игра — до 30', 'r.h.day': 'Весь план дня — +30', 'r.h.cap': 'Не больше 500 баллов в день.',
      'ad.title': 'Админ', 'ad.pay': 'Оплаты', 'ad.users': 'Ученики',
      'ad.k.all': 'всего', 'ad.k.students': 'учеников', 'ad.k.today': 'заходили сегодня', 'ad.k.week': 'заходили за 7 дней', 'ad.k.new': 'новых (7 дней)',
      'ad.f.student': 'Ученики', 'ad.f.parent': 'Родители', 'ad.f.admin': 'Админы', 'ad.f.active': 'Активны 7 дней', 'ad.f.all': 'Все', 'ad.none': 'Никого не найдено.',
      'ad.c.name': 'Имя', 'ad.c.school': 'Школа · класс', 'ad.c.seen': 'Последний раз', 'ad.c.topics': 'Тем освоено', 'ad.c.hw': 'Домашек (7 дн.)', 'ad.c.mock': 'Последний пробный', 'ad.c.ready': 'Готовность', 'ad.c.access': 'Доступ',
      'ad.reg': 'регистрация', 'ad.hint': 'Нажмите на строку — откроется страница ученика: темы, пробные, журнал действий.', 'ad.forever': 'бесплатно, бессрочно', 'ad.paidTo': 'оплачено до {d}', 'ad.trialTo': 'пробный до {d}', 'ad.noAccess': 'нет доступа',
      'ad.grade': 'класс', 'ad.code2': 'Код ребёнка', 'ad.synced': 'Прогресс сохранён', 'ad.streak': 'дней подряд', 'ad.mist': 'в тетради ошибок',
      'ad.topics': 'Темы', 'ad.t.done': 'Освоил', 'ad.t.go': 'В процессе', 'ad.t.no': 'Не начинал', 'ad.c.topic': 'Тема', 'ad.c.status': 'Статус', 'ad.c.grade': 'Лучшая оценка', 'ad.c.solved': 'Решено', 'ad.c.hwN': 'Домашек',
      'ad.mocks': 'Пробные', 'ad.log': 'Журнал действий', 'ad.noSync': 'Прогресс ученика ещё не сохранён на сервере (он должен зайти на сайт и что-то решить).',
      'act.signup': 'Зарегистрировался ({r})', 'act.login': 'Вошёл (почта + пароль)', 'act.visit': 'Зашёл на сайт', 'act.hw': 'Домашка: {t} — {g}/10 ({ok}/{n})', 'act.quick': 'Повторение: {t} — {g}/10', 'act.lesson': 'Открыл урок: {t}',
      'act.mock': 'Полный пробный: {f} — {s}/{m}', 'act.test': 'Тест: {f} — {s}/{m}', 'act.diag': 'Диагностика — {s}/{m}', 'act.cards': 'Карточки: {d} — «знаю» {k}/{n}', 'act.game': 'Игра — {s} очков',
      'act.promo': 'Применил промокод ({k})', 'act.pay': 'Заявка на оплату — {a} ₸', 'act.admin': 'Действие админа: {a}', 'ad.promo': 'Промокоды', 'ad.set': 'Настройки', 'ad.approve': 'Подтвердить', 'ad.reject': 'Отклонить', 'ad.noPay': 'Оплат на проверке нет.',
      'ad.search': 'Поиск (имя или почта)', 'ad.grant': 'Добавить дни', 'ad.until': 'до', 'ad.code': 'Код', 'ad.kind': 'Тип', 'ad.k.free': 'бесплатный доступ', 'ad.k.discount': 'скидка', 'ad.k.admin': 'админ', 'ad.days': 'Дней (пусто — бессрочно)', 'ad.percent': 'Скидка %', 'ad.max': 'Сколько раз (пусто — без лимита)', 'ad.note': 'Заметка', 'ad.create': 'Создать', 'ad.used': 'использован',
      'ad.kaspiPhone': 'Номер Kaspi', 'ad.kaspiName': 'Имя получателя', 'ad.prizesKk': 'Призы (казахский)', 'ad.prizesRu': 'Призы (русский)', 'ad.trial': 'Бесплатных дней', 'ad.price': 'Цена, ₸', 'ad.save': 'Сохранить', 'ad.saved': 'Сохранено', 'ad.adminWarn': 'Админ-промокод давайте только доверенным людям и делайте одноразовым.',
      'c.title': 'Флеш-карточки', 'c.sub': 'Формулы и правила. Перед началом прочитайте правила ниже.',
      'c.h.title': 'Как работают карточки?', 'c.h.ok': 'Понятно, начинаем', 'c.h.again': 'Правила',
      'c.h.1': '<b>Нажмите на карточку</b> — откроется ответ на обороте. Сначала попробуйте вспомнить ответ сами и только потом открывайте.',
      'c.h.2': '<b>«Знаю»</b> (на казахском — «Білемін») — нажимайте, только если назвали ответ правильно, не подглядывая. Карточка поднимается на уровень (от 0 до 4) и уходит ближе к концу колоды.',
      'c.h.3': '<b>«Повторить»</b> («Қайталау») — если не знали или ошиблись. Карточка падает на уровень 0 и в следующий раз будет в начале колоды. Баллы за это не снимаются.',
      'c.h.4': 'Карточка считается выученной после <b>двух нажатий «Знаю»</b> — на странице колод это видно, например, как «знаю 7/20»: из 20 карточек колоды выучено 7. Полоска под колодой показывает то же.',
      'c.h.5': '<b>‹ и ›</b> — просто листают карточки, ничего не записывают.',
      'c.h.6': 'Когда колода пройдена до конца, начисляются баллы в рейтинг: 1 балл за каждое «Знаю», не больше 20 в день за одну колоду.',
      'c.h.7': '<b>Будьте честны:</b> если нажать «Знаю», не зная, карточка будет попадаться реже и формула забудется — и ошибка случится на экзамене.', 'c.cards': '{n} карточек', 'c.known': 'знаю {k}/{n}', 'c.back': 'К карточкам', 'c.show': 'Нажмите, чтобы увидеть ответ', 'c.q': 'Вопрос', 'c.a': 'Ответ',
      'c.know': 'Знаю', 'c.again': 'Повторить', 'c.restart': 'Заново', 'c.done': 'Колода пройдена: вы знаете {k} карточек.', 'c.none': 'Карточки скоро появятся.',
      'g.title': 'Игры', 'g.sub': 'Каждая игра — 60 секунд. Выберите игру и побейте свой рекорд. Первая игра за день даёт баллы в рейтинг.', 'g.start': 'Начать', 'g.level': 'Уровень', 'g.score': 'Результат: {n}', 'g.prev': 'Предыдущий', 'g.ok': 'Верно: {n}', 'g.bad': 'Ошибок: {n}', 'g.best': 'Рекорд: {n}', 'g.again': 'Ещё раз', 'g.time': 'время'
    }
  };
  // Добавляем тексты в общий словарь, чтобы t() в app.js тоже их видел.
  ['kk', 'ru'].forEach(function (lg) { var d = I.dict && I.dict(lg); if (d) Object.keys(L[lg]).forEach(function (k) { if (!(k in d)) d[k] = L[lg][k]; }); });
  function tt(k, v) {
    var s = (L[I.lang()] || L.kk)[k] || L.kk[k] || k;
    if (v) Object.keys(v).forEach(function (x) { s = s.split('{' + x + '}').join(v[x]); });
    return s;
  }
  function esc(s) { return U.esc(String(s == null ? '' : s)); }
  function money(n) { return U.fmt(n); }
  function errText(e) { var c = (e && (e.code || e.error)) || 'error'; return L.kk['e.' + c] ? tt('e.' + c) : tt('e.error'); }
  var settingsCache = null;
  function settings() {
    if (settingsCache) return Promise.resolve(settingsCache);
    return B.settings().then(function (s) { settingsCache = s; return s; }, function () { return null; });
  }
  // Экран, данные которого приходят асинхронно: сначала заглушка, потом перерисовка с данными.
  var async = {};
  function later(key, load, draw) {
    if (async[key] && async[key].ready) return draw(async[key].data);
    if (!async[key]) {
      async[key] = { ready: false };
      load().then(function (d) { async[key] = { ready: true, data: d }; ui().render(); }, function () { async[key] = { ready: true, data: null }; ui().render(); });
    }
    return '<p class="muted">…</p>';
  }
  function refresh(key) { if (key) delete async[key]; else async = {}; }

  var LOGO = '<span class="logo"><span class="brand-mark">З</span><span class="logo-name">Зерде</span></span>';
  function laurel(flip) {
    return '<svg class="laurel' + (flip ? ' flip' : '') + '" viewBox="0 0 60 120" aria-hidden="true"><path d="M50 112C22 98 8 70 14 34" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
      [[12, 40, -30], [10, 56, -20], [12, 72, -10], [18, 87, 5], [27, 99, 20], [38, 107, 35]].map(function (l) {
        return '<ellipse cx="' + l[0] + '" cy="' + l[1] + '" rx="11" ry="5" transform="rotate(' + l[2] + ' ' + l[0] + ' ' + l[1] + ')" fill="currentColor"/>';
      }).join('') + '</svg>';
  }

  /* =================== ЛЕНДИНГ =================== */
  var TABS = ['plan', 'lessons', 'hw', 'mock', 'cards', 'game', 'rank', 'parent'];
  function landing() {
    var tab = ui().mem.ltab || 'plan';
    var nTopics = Z.topics.length, nCards = (Z.decks || []).reduce(function (a, d) { return a + d.cards.length; }, 0);
    var h = '<header class="lnd-top">' + LOGO + '<span class="grow"></span><a class="btn pill" href="#/auth/login">' + tt('l.login') + '</a></header>';
    h += '<section class="hero"><div class="score">' + laurel(false) + '<b>240</b>' + laurel(true) + '</div><p class="score-cap">' + tt('l.max') + '</p>' +
      '<h1>' + tt('l.hero') + '</h1><p class="lead">' + tt('l.heroSub') + '</p>' +
      '<div class="row center"><a class="btn pill dark" href="#/auth/signup">' + tt('l.start') + '</a><a class="btn pill" href="#tour" data-act="scrollTour">' + tt('l.platform') + '</a></div>' +
      '<p class="kicker">' + tt('l.schools') + '</p><div class="row center schools">' + ['BIL', 'RFMSH', 'NIS'].map(function (k) { return '<span class="school-chip"><b>' + Z.schools[k].name + '</b><small>' + esc(Z.schools[k].full) + '</small></span>'; }).join('') + '</div></section>';
    h += '<section class="lnd-sec" id="tour"><h2>' + tt('l.inside') + '</h2><div class="seg">' + TABS.map(function (k) {
      return '<button class="' + (k === tab ? 'on' : '') + '" data-act="ltab" data-k="' + k + '">' + tt('l.t.' + k) + '</button>';
    }).join('') + '</div><div class="tour"><div class="phone">' + phone(tab) + '</div><p class="lead">' + tt('l.d.' + tab) + '</p></div>' +
      '<div class="row center"><a class="btn pill dark" href="#/auth/signup">' + tt('l.start') + '</a></div></section>';
    h += '<section class="lnd-sec"><h2>' + tt('l.facts') + '</h2><div class="facts">' +
      [[nTopics, 'l.f1'], [4, 'l.f2'], [20, 'l.f3'], [nCards || '—', 'l.f4']].map(function (f) { return '<div class="fact"><b>' + f[0] + '</b><span>' + tt(f[1]) + '</span></div>'; }).join('') + '</div></section>';
    h += '<section class="lnd-sec" id="pricing"><h2>' + tt('l.pricing') + '</h2>' + later('settings', settings, function (s) { return plans(s, '#/auth/signup'); }) + '</section>';
    h += '<section class="lnd-sec"><h2>' + tt('l.faq') + '</h2><div class="faq">' + [1, 2, 3, 4, 5].map(function (i) {
      return '<details><summary>' + tt('l.q' + i) + '</summary><p>' + tt('l.a' + i) + '</p></details>';
    }).join('') + '</div></section>';
    h += '<footer class="lnd-foot">' + LOGO + '<p class="small muted">© ' + new Date().getFullYear() + ' Зерде · БИЛ · РФМШ · НЗМ</p></footer>';
    return h;
  }
  // Мини-иллюстрация экрана в «телефоне» — из настоящих элементов интерфейса.
  function phone(tab) {
    var lv = ['A', 'B', 'C', '★'];
    switch (tab) {
      case 'plan': return '<div class="ph-card"><span class="label">01 · ' + tt('l.t.hw') + '</span><b>' + I.t('kind.math') + '</b><div class="bar"><i style="width:46%"></i></div></div><div class="ph-card"><span class="label">02 · ' + I.t('kind.logic') + '</span><b>' + (Z.topicById.l_seq[I.lang()] || '') + '</b></div><div class="ph-card"><span class="label">03</span><b>' + Z.examFormats.BIL_mini[I.lang()] + '</b></div>';
      case 'lessons': return '<div class="ph-card"><b>' + Z.topicById.m_percent[I.lang()] + '</b><ul class="theory small"><li>1% = 1/100</li><li>+25% ⇒ · 1,25</li><li>−20% ⇒ · 0,8</li></ul></div><div class="ph-card"><span class="pill l2">B</span> 260 · 35% = ?</div>';
      case 'hw': return '<div class="ph-card">' + lv.map(function (l, i) { return '<span class="pill l' + (i + 1) + '">' + l + '</span>'; }).join(' ') + '<div class="bar"><i style="width:30%"></i></div></div><div class="ph-card"><div class="opts mini"><span class="opt">A) 24</span><span class="opt right">B) 30</span><span class="opt">C) 36</span><span class="opt">D) 18</span></div></div>';
      case 'mock': return '<div class="ph-card"><span class="timer">59:41</span> <span class="muted small">12 / 60</span></div><div class="ph-card ps-row"><span>1</span><i>A</i><i class="on">B</i><i>C</i><i>D</i></div><div class="ph-card ps-row"><span>2</span><i>A</i><i>B</i><i>C</i><i class="on">D</i></div>';
      case 'cards': return '<div class="ph-card flash"><span class="label">' + tt('c.q') + '</span><b>S дөңгелек = ?</b></div><div class="row center"><span class="btn pill sm">' + tt('c.again') + '</span><span class="btn pill sm dark">' + tt('c.know') + '</span></div>';
      case 'game': return '<div class="ph-card center"><span class="timer">0:42</span><b class="big">17 · 6 = ?</b></div>';
      case 'rank': return '<div class="ph-card lb"><span>1</span><b>Айгерім</b><em>1 240</em></div><div class="ph-card lb"><span>2</span><b>Ерлан</b><em>1 105</em></div><div class="ph-card lb"><span>3</span><b>Дана</b><em>980</em></div>';
      default: return '<div class="ph-card"><span class="label">' + tt('k.ready') + '</span><b class="big">72%</b></div><div class="ph-card"><span class="label">' + tt('k.weak') + '</span><b>' + Z.topicById.m_motion[I.lang()] + '</b></div>';
    }
  }
  function plans(s, href) {
    if (!s) return '';
    var base = s.prices.m1.amount;
    return '<p class="muted center">' + tt('l.trial', { n: s.trial_days }) + '</p><div class="plans">' + ['m1', 'm3', 'm6'].map(function (k) {
      var p = s.prices[k], save = Math.round((1 - p.amount / (base * p.months)) * 100);
      return '<div class="plan' + (k === 'm3' ? ' hot' : '') + '"><span class="label">' + p.months + ' ' + (p.months === 1 ? tt('l.month') : tt('l.months')) + '</span><b>' + money(p.amount) + ' ₸</b>' +
        '<small class="muted">' + (p.months > 1 ? money(Math.round(p.amount / p.months)) + ' ₸ / ' + tt('l.month') + ' · ' + tt('l.save', { p: save }) : '&nbsp;') + '</small>' +
        (href ? '<a class="btn pill' + (k === 'm3' ? ' dark' : '') + '" href="' + href + '">' + tt('l.choose') + '</a>' : '<button class="btn pill' + (k === 'm3' ? ' dark' : '') + '" data-act="pay" data-plan="' + k + '">' + tt('p.pay') + '</button>') + '</div>';
    }).join('') + '</div>';
  }

  /* =================== ВХОД / РЕГИСТРАЦИЯ =================== */
  function auth(mode) {
    var m = ui().mem, signup = mode !== 'login', role = m.arole || 'student';
    var h = '<header class="lnd-top"><a href="#/">' + LOGO + '</a></header><form class="card form auth" data-form="' + (signup ? 'signup' : 'login') + '">' +
      '<div class="seg">' + ['signup', 'login'].map(function (k) { return '<a class="' + ((k === 'signup') === signup ? 'on' : '') + '" href="#/auth/' + k + '">' + tt('a.' + k) + '</a>'; }).join('') + '</div>';
    if (m.aerr) h += '<div class="note">' + esc(m.aerr) + '</div>';
    if (signup) {
      h += '<div class="field"><span>' + tt('a.who') + '</span><div class="roles">' + ['student', 'parent'].map(function (r) {
        return '<label class="role' + (r === role ? ' on' : '') + '" data-act="arole" data-r="' + r + '"><input type="radio" name="role" value="' + r + '"' + (r === role ? ' checked' : '') + '><b>' + tt('a.' + r) + '</b><small>' + tt('a.' + r + 'Sub') + '</small></label>';
      }).join('') + '</div></div>' +
        '<label class="field"><span>' + tt('a.name') + '</span><input name="name" required maxlength="40" autocomplete="name"></label>';
      if (role === 'student') {
        h += '<div class="row2"><label class="field"><span>' + tt('a.school') + '</span><select name="school">' + ['BIL', 'RFMSH', 'NIS'].map(function (k) { return '<option value="' + k + '">' + Z.schools[k].name + '</option>'; }).join('') + '</select></label>' +
          '<label class="field"><span>' + tt('a.grade') + '</span><select name="grade">' + [4, 5, 6, 7].map(function (g) { return '<option' + (g === 6 ? ' selected' : '') + '>' + g + '</option>'; }).join('') + '</select></label></div>';
      }
    }
    h += '<label class="field"><span>' + tt('a.email') + '</span><input name="email" type="email" required autocomplete="email" inputmode="email" maxlength="120" value="' + esc(m.aEmail || '') + '"></label>' +
      '<label class="field"><span>' + tt(signup ? 'a.passNew' : 'a.pass') + '</span><span class="pw"><input name="password" type="password" required minlength="' + (signup ? 8 : 1) + '" maxlength="72" autocomplete="' + (signup ? 'new-password' : 'current-password') + '"' + (signup ? ' data-pw="1"' : '') + '>' +
      '<button type="button" class="pw-eye" data-act="pwEye" aria-label="' + tt('a.show') + '">' + tt('a.show') + '</button></span></label>';
    // Надёжность пароля — подсказка обновляется при вводе (слушатель input ниже).
    if (signup) h += '<div class="pw-meter" id="pwMeter"><i></i><i></i><i></i><i></i><span>' + tt('a.passHint') + '</span></div>' +
      '<details class="promo-d"><summary>' + tt('a.promoQ') + '</summary><label class="field"><span>' + tt('a.promo') + '</span><input name="promo" autocomplete="off" maxlength="32" style="text-transform:uppercase"></label></details>';
    else h += '<p class="small"><a href="#" data-act="forgotPw">' + tt('a.forgot') + '</a></p>';
    h += '<button class="btn pill dark wide" type="submit">' + (signup ? tt('a.go') : tt('a.enter')) + '</button>' +
      (signup ? '<p class="small muted center">' + tt('a.terms') + '</p>' : '') +
      '<p class="small muted center">' + (signup ? tt('a.have') + ' <a href="#/auth/login">' + tt('a.login') + '</a>' : tt('a.no') + ' <a href="#/auth/signup">' + tt('a.signup') + '</a>') + '</p>' +
      (B.mode === 'demo' ? '<p class="small muted">' + tt('a.demo') + '</p>' : '') + '</form>';
    return h;
  }

  /* =================== ТАРИФЫ И ОПЛАТА =================== */
  function statusLine(u) {
    if (u.role === 'admin') return '<div class="note ok">' + tt('role.admin') + '</div>';
    if (u.subUntil && new Date(u.subUntil).getFullYear() > 9000) return '<div class="note ok">' + tt('p.forever') + '</div>';
    var n = B.daysLeft(u);
    return n > 0 ? '<div class="note ok">' + tt('p.active', { n: n }) + '</div>' : '<div class="note amber">' + tt('p.none') + '</div>';
  }
  function pricing() {
    var u = ui().mem.user, m = ui().mem;
    var h = '<section class="sec"><h1>' + tt('p.title') + '</h1><p class="muted">' + tt('p.sub') + '</p></section>' + statusLine(u);
    if (!B.hasAccess(u)) h += '<div class="note teal row"><span>' + tt('p.diag') + '</span><button class="btn pill sm dark" data-act="startExam" data-f="' + ui().S().profile.school + '_diag">' + tt('p.diagGo') + '</button></div>';
    h += later('settings', settings, function (s) { return plans(s, null); });
    if (m.payInfo) h += m.payInfo;
    h += promoForm();
    h += '<section class="sec"><h2>' + tt('p.mine') + '</h2>' + later('mypay', B.myPayments, function (list) {
      list = list || [];
      if (!list.length) return '<p class="muted">—</p>';
      return '<div class="tbl-wrap"><table class="tbl"><tbody>' + list.map(function (p) {
        return '<tr><td>№' + p.id + '</td><td>' + (p.months) + ' ' + tt('l.months') + '</td><td class="num">' + money(p.amount) + ' ₸</td><td>' + tt('p.st.' + p.status) + '</td><td class="small muted">' + String(p.createdAt || p.created_at || '').slice(0, 10) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    }) + '</section>';
    return h;
  }
  function promoForm() {
    var m = ui().mem;
    return '<form class="card form row" data-form="promo"><label class="field grow"><span>' + tt('p.promo') + '</span><input name="code" autocomplete="off" style="text-transform:uppercase" value="' + esc(m.promoDraft || '') + '"></label>' +
      '<button class="btn pill" type="submit">' + tt('p.apply') + '</button></form>' + (m.promoMsg ? '<div class="note">' + esc(m.promoMsg) + '</div>' : '');
  }

  /* =================== АККАУНТ =================== */
  function account() {
    var u = ui().mem.user;
    var h = '<section class="sec"><h1>' + tt('acc.title') + '</h1></section><section class="card"><span class="label">' + tt('role.' + u.role) + '</span><h2>' + esc(u.name) + '</h2><p class="muted">' + esc(u.email) + '</p></section>';
    if (u.role !== 'parent') {
      h += '<section class="card"><span class="label">' + tt('acc.code') + '</span><div class="bigcode">' + esc(u.childCode || '—') + '</div><p class="muted small">' + tt('acc.codeNote') + '</p></section>';
      h += '<section class="card"><span class="label">' + tt('acc.status') + '</span>' + statusLine(u) + '<a class="btn pill" href="#/pricing">' + tt('p.title') + '</a></section>' + promoForm();
    }
    h += '<div class="row"><button class="btn pill" data-act="signOut">' + tt('acc.out') + '</button>' + (B.mode === 'supabase' ? '<button class="btn pill line" data-act="signOutAll">' + tt('acc.outAll') + '</button>' : '') + '</div>' +
      '<p class="small muted">' + tt('acc.safe') + '</p>';
    return h;
  }

  /* =================== КАБИНЕТ РОДИТЕЛЯ =================== */
  /* Совет родителям про формулы: что сделали мы и что теперь зависит от семьи. Сразу на двух языках. */
  var PT = {
    kk: { t: 'Ата-аналарға кеңес: формулалар', did: 'Біз не жасадық', dids: [
            'Барлық тақырыптың формулалары мен ережелерін ' + '{d}' + ' колодаға (флеш-карточка) жинадық.',
            'Әр формуланы тексеріп, қателерін түзеттік; бөлшектерді «p/100» емес, түсінікті қабатты бөлшек түрінде жаздық.',
            'Карточкаларды бастамас бұрын балаға ереже көрсетіледі: «Білемін» мен «Қайталау» нені білдіреді.',
            'Сайт карточкаларды деңгей бойынша қайталатады: әлсіздері алдымен шығады.'],
          now: 'Енді жауапкершілік — сізде', nowNote: '«Білемін» батырмасын бала өзі басады. Сайт баланың формуланы шынымен білетінін тексере алмайды — оны тек сіз тексере аласыз.', tips: [
            '<b>Аптасына 2–3 рет, 5 минут:</b> кез келген колоданы ашып, баладан формуланы дауыстап айтуды сұраңыз — жауапты көрсетпей.',
            '<b>Санға емес, түсіндіруге қараңыз:</b> «7/20 білемін» әдемі көрінеді, бірақ «Бұл формула қай есепте керек?» деп сұраңыз.',
            '<b>Қателессе — «Қайталау».</b> Бала білмей «Білемін» баспасын; «Қайталау» ұпайды азайтпайды.',
            '<b>Карточка мен сынақты салыстырыңыз:</b> карточкада «білемін», ал сынақта сол тақырыпта қате көп болса — колоданы қайта өтсін.',
            '<b>Адалдығы үшін мақтаңыз,</b> ұпай саны үшін емес.'] },
    ru: { t: 'Совет родителям: формулы', did: 'Что сделали мы', dids: [
            'Собрали формулы и правила всех тем в {d} колод флеш-карточек.',
            'Проверили каждую формулу и исправили ошибки; дроби записаны не «p/100», а понятной двухэтажной дробью.',
            'Перед карточками ребёнку показываются правила: что значат «Білемін» (Знаю) и «Қайталау» (Повторить).',
            'Сайт повторяет карточки по уровням: слабые идут первыми.'],
          now: 'Теперь ответственность — на вас', nowNote: 'Кнопку «Білемін» ребёнок нажимает сам. Сайт не может проверить, знает ли он формулу на самом деле, — это можете проверить только вы.', tips: [
            '<b>2–3 раза в неделю по 5 минут:</b> откройте любую колоду и попросите ребёнка назвать формулу вслух, не показывая ответ.',
            '<b>Смотрите не на число, а на объяснение:</b> «знаю 7/20» выглядит хорошо, но спросите: «В какой задаче нужна эта формула?»',
            '<b>Ошибся — «Қайталау».</b> Пусть не нажимает «Білемін», если не знает: «Қайталау» баллы не снимает.',
            '<b>Сравнивайте карточки и пробники:</b> если в карточках «знаю», а в пробниках по этой теме много ошибок — пусть пройдёт колоду заново.',
            '<b>Хвалите за честность,</b> а не за количество баллов.'] }
  };
  function parentTips() {
    var nd = (Z.decks || []).length, langs = I.lang() === 'ru' ? ['ru', 'kk'] : ['kk', 'ru'];
    return '<section class="card ptips"><h2>' + PT.kk.t + ' / ' + PT.ru.t + '</h2>' + langs.map(function (lg) {
      var p = PT[lg];
      return '<div class="c-rules-l"><span class="label">' + (lg === 'kk' ? 'Қазақша' : 'На русском') + '</span>' +
        '<h3>' + p.did + '</h3><ul>' + p.dids.map(function (x) { return '<li>' + x.replace('{d}', nd) + '</li>'; }).join('') + '</ul>' +
        '<h3>' + p.now + '</h3><p>' + p.nowNote + '</p><ol>' + p.tips.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol></div>';
    }).join('') + '</section>';
  }
  // Сколько карточек ребёнок отметил выученными (коробка ≥ 2) — для кабинета родителя.
  function cardsKnown(st) {
    var k = 0, n = 0;
    (Z.decks || []).forEach(function (d) { var bx = (st.cards || {})[d.id] || {}; n += d.cards.length; d.cards.forEach(function (c, i) { if ((bx[i] || 0) >= 2) k++; }); });
    return { k: k, n: n };
  }

  function kids() {
    var m = ui().mem;
    var h = '<section class="sec"><h1>' + tt('k.title') + '</h1></section><form class="card form row" data-form="linkChild"><label class="field grow"><span>' + tt('k.add') + '</span><input name="code" required autocomplete="off" style="text-transform:uppercase" placeholder="AB12CD"></label>' +
      '<button class="btn pill dark" type="submit">' + tt('k.link') + '</button></form><p class="small muted">' + tt('k.addNote') + '</p>' + (m.kidMsg ? '<div class="note">' + esc(m.kidMsg) + '</div>' : '');
    return h + later('kids', B.children, function (list) {
      list = list || [];
      if (!list.length) return '<p class="muted">' + tt('k.none') + '</p>' + parentTips();
      return list.map(kidCard).join('') + parentTips();
    });
  }
  function kidCard(c) {
    var x = c.summary, sc = Z.schools[c.school] || Z.schools.BIL, g = sc.target;
    var h = '<section class="card kid"><div class="row between"><div><span class="label">' + sc.name + (c.grade ? ' · ' + I.t('ob.grade', { n: c.grade }) : '') + '</span><h2>' + esc(c.name) + '</h2></div>' +
      (c.updatedAt ? '<small class="muted">' + tt('k.upd', { d: String(c.updatedAt).slice(0, 10) }) + '</small>' : '') + '</div>';
    if (!x) return h + '<p class="muted">' + tt('k.noData') + '</p></section>';
    var fc = x.fc ? (x.fc.pct ? x.fc.score + '%' : x.fc.score + ' / ' + x.fc.max) : '—';
    h += '<dl class="kpis">' + [[x.active7 + '/7', 'k.active'], [x.hw7, 'k.hw'], [x.mocks7 || 0, 'k.mocks'], [x.ready + '%', 'k.ready'], [fc, 'k.fc']].map(function (k) { return '<div><dd>' + k[0] + '</dd><dt>' + tt(k[1]) + '</dt></div>'; }).join('') + '</dl>';
    h += '<p class="small muted">' + tt('k.target', { v: g.pct ? g.pct + '%' : g.score + ' / ' + g.max }) + '</p>';
    if ((x.weak || []).length) h += '<div><span class="label">' + tt('k.weak') + '</span><div class="row">' + x.weak.map(function (id) { return Z.topicById[id] ? '<span class="pill">' + esc(ui().tn(Z.topicById[id])) + '</span>' : ''; }).join('') + '</div></div>';
    var st = c.state || {}, ck = cardsKnown(st);
    if (ck.n) h += '<p class="small"><b>' + tt('k.cards', { k: ck.k, n: ck.n }) + '</b> <span class="muted">' + tt('k.cardsNote') + '</span></p>';
    var mocks = (st.exams || []).slice(-5).reverse();
    if (mocks.length) h += '<div><span class="label">' + tt('k.lastMocks') + '</span><div class="tbl-wrap"><table class="tbl"><tbody>' + mocks.map(function (e) {
      var f = Z.examFormats[e.format];
      return '<tr><td>' + e.date + '</td><td>' + (f ? esc(ui().fname(f)) : e.format) + '</td><td class="num"><b>' + e.score + '</b> / ' + e.max + '</td></tr>';
    }).join('') + '</tbody></table></div></div>';
    var tps = Object.keys(st.topics || {}).filter(function (k) { return Z.topicById[k] && st.topics[k].grade; });
    if (tps.length) h += '<details><summary>' + tt('k.topics') + '</summary><div class="tbl-wrap"><table class="tbl"><tbody>' + tps.map(function (k) {
      return '<tr><td>' + esc(ui().tn(Z.topicById[k])) + '</td><td class="num">' + st.topics[k].grade + '/10</td></tr>';
    }).join('') + '</tbody></table></div></details>';
    return h + '</section>';
  }

  /* =================== РЕЙТИНГ =================== */
  function leaders() {
    var m = ui().mem, month = m.lbMonth || B.monthKey(), school = m.lbSchool || '';
    var prev = new Date(); prev.setDate(1); prev.setMonth(prev.getMonth() - 1);
    var h = '<section class="sec"><h1>' + tt('r.title') + '</h1><p class="muted">' + tt('r.sub') + '</p></section>';
    h += '<div class="row"><div class="seg">' + [[B.monthKey(), 'r.cur'], [B.monthKey(prev), 'r.prev']].map(function (x) { return '<button class="' + (x[0] === month ? 'on' : '') + '" data-act="lbMonth" data-m="' + x[0] + '">' + tt(x[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="seg">' + [['', tt('r.all')], ['BIL', 'БИЛ'], ['RFMSH', 'РФМШ'], ['NIS', 'НЗМ']].map(function (x) { return '<button class="' + (x[0] === school ? 'on' : '') + '" data-act="lbSchool" data-s="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>';
    h += later('prizes', settings, function (s) {
      var pz = s && s.prizes && (s.prizes[I.lang()] || s.prizes.kk);
      return '<section class="card prize"><span class="label">' + tt('r.prizes') + '</span><p>' + (pz ? esc(pz).replace(/\n/g, '<br>') : '<span class="muted">' + tt('r.noPrizes') + '</span>') + '</p></section>';
    });
    if (m.user.role !== 'parent') h += later('mypts:' + month, function () { return B.myPoints(month); }, function (n) { return '<div class="note teal">' + tt('r.mine') + ': <b>' + money(n || 0) + '</b></div>'; });
    h += later('lb:' + month + ':' + school, function () { return B.leaderboard(month, school); }, function (rows) {
      rows = rows || [];
      if (!rows.length) return '<p class="muted">' + tt('r.empty') + '</p>';
      return '<ol class="lboard">' + rows.map(function (r, i) {
        return '<li class="' + (r.isMe ? 'me' : '') + (i < 3 ? ' top top' + (i + 1) : '') + '"><span class="rk">' + (i + 1) + '</span><b>' + esc(r.name || '—') + '</b><small>' + (Z.schools[r.school] ? Z.schools[r.school].name : '') + '</small><em>' + money(r.points) + '</em></li>';
      }).join('') + '</ol>';
    });
    h += '<section class="card"><span class="label">' + tt('r.how') + '</span><ul class="theory">' + ['hw', 'mock', 'test', 'review', 'cards', 'game', 'day', 'cap'].map(function (k) { return '<li>' + tt('r.h.' + k) + '</li>'; }).join('') + '</ul></section>';
    return h;
  }

  /* =================== АДМИНКА =================== */
  /* ---------- Админ: оқушылар — кто зарегистрирован, когда был, что сделал, какие темы прошёл ---------- */
  function ago(iso) {
    if (!iso) return '—';
    var ms = Date.now() - +new Date(iso), ru = I.lang() === 'ru';
    if (ms < 60000) return ru ? 'сейчас' : 'қазір';
    if (ms < 3600000) return Math.floor(ms / 60000) + (ru ? ' мин назад' : ' мин бұрын');
    if (ms < 86400000) return Math.floor(ms / 3600000) + (ru ? ' ч назад' : ' сағ бұрын');
    var d = Math.floor(ms / 86400000); return d + (ru ? ' дн. назад' : ' күн бұрын');
  }
  function dt(iso) { return iso ? String(iso).slice(0, 16).replace('T', ' ') : '—'; }
  function accessText(u) {
    if (u.role !== 'student') return tt('role.' + u.role);
    if (u.subUntil && new Date(u.subUntil).getFullYear() > 9000) return tt('ad.forever');
    if (u.subUntil && +new Date(u.subUntil) > Date.now()) return tt('ad.paidTo', { d: String(u.subUntil).slice(0, 10) });
    if (u.trialUntil && +new Date(u.trialUntil) > Date.now()) return tt('ad.trialTo', { d: String(u.trialUntil).slice(0, 10) });
    return '<span class="no">' + tt('ad.noAccess') + '</span>';
  }
  function adStudents() {
    var m = ui().mem, f = m.adF || 'student', q = String(m.adQ || '').toLowerCase();
    return later('ad:overview', B.admin.overview, function (list) {
      list = list || [];
      var now = Date.now(), day = 86400000;
      var seen = function (u) { return u.lastSeen ? now - +new Date(u.lastSeen) : 1e15; };
      var st = { all: list.length, student: 0, parent: 0, admin: 0, today: 0, week: 0, fresh: 0 };
      list.forEach(function (u) { st[u.role]++; if (seen(u) < day) st.today++; if (seen(u) < 7 * day) st.week++; if (u.createdAt && now - +new Date(u.createdAt) < 7 * day) st.fresh++; });
      var h = '<dl class="kpis ad-kpis">' + [[st.all, 'ad.k.all'], [st.student, 'ad.k.students'], [st.today, 'ad.k.today'], [st.week, 'ad.k.week'], [st.fresh, 'ad.k.new']].map(function (k) {
        return '<div><dd>' + k[0] + '</dd><dt>' + tt(k[1]) + '</dt></div>'; }).join('') + '</dl>';
      h += '<form class="card form row" data-form="adSearch"><label class="field grow"><span>' + tt('ad.search') + '</span><input name="q" value="' + esc(m.adQ || '') + '"></label><button class="btn pill" type="submit">→</button></form>';
      h += '<div class="chips">' + ['student', 'parent', 'admin', 'active', 'all'].map(function (k) { return '<button class="chip' + (f === k ? ' on' : '') + '" data-act="adF" data-f="' + k + '">' + tt('ad.f.' + k) + '</button>'; }).join('') + '</div>';
      var rows = list.filter(function (u) {
        if (q && (String(u.name) + ' ' + String(u.email)).toLowerCase().indexOf(q) < 0) return false;
        if (f === 'active') return seen(u) < 7 * day;
        return f === 'all' || u.role === f;
      }).sort(function (a, b) { return seen(a) - seen(b); });
      if (!rows.length) return h + '<p class="muted">' + tt('ad.none') + '</p>';
      return h + '<div class="tbl-wrap"><table class="tbl ad-tbl"><thead><tr><th>' + tt('ad.c.name') + '</th><th>' + tt('ad.c.school') + '</th><th>' + tt('ad.c.seen') + '</th><th class="num">' + tt('ad.c.topics') + '</th><th class="num">' + tt('ad.c.hw') + '</th><th class="num">' + tt('ad.c.mock') + '</th><th class="num">' + tt('ad.c.ready') + '</th><th>' + tt('ad.c.access') + '</th></tr></thead><tbody>' +
        rows.map(function (u) {
          var x = u.summary || {}, sc = Z.schools[u.school];
          return '<tr class="click" data-act="adOpen" data-id="' + esc(u.id) + '"><td><b>' + esc(u.name || '—') + '</b><br><small class="muted">' + esc(u.email || '') + '</small></td>' +
            '<td class="small">' + (sc ? sc.name : '—') + (u.grade ? ' · ' + u.grade : '') + '<br><small class="muted">' + tt('ad.reg') + ' ' + String(u.createdAt || '').slice(0, 10) + '</small></td>' +
            '<td class="small">' + ago(u.lastSeen || u.updatedAt) + '</td>' +
            '<td class="num">' + (u.role === 'student' ? (x.mastered || 0) + ' / ' + (x.topicsTotal || Z.topicsFor(u.school || 'BIL').length) : '—') + '</td>' +
            '<td class="num">' + (x.hw7 != null ? x.hw7 : '—') + '</td>' +
            '<td class="num">' + (x.lastMock ? x.lastMock.score + '/' + x.lastMock.max : '—') + '</td>' +
            '<td class="num">' + (x.ready != null ? x.ready + '%' : '—') + '</td><td class="small">' + accessText(u) + '</td></tr>';
        }).join('') + '</tbody></table></div><p class="small muted">' + tt('ad.hint') + '</p>';
    });
  }
  function actText(a) {
    var i = a.info || {}, tp = i.topic && Z.topicById[i.topic] ? ui().tn(Z.topicById[i.topic]) : (i.topic || ''), f = i.format && Z.examFormats[i.format] ? ui().fname(Z.examFormats[i.format]) : (i.format || '');
    switch (a.kind) {
      case 'signup': return tt('act.signup', { r: tt('role.' + (i.role || 'student')) });
      case 'login': return tt('act.login');
      case 'visit': return tt('act.visit');
      case 'hw': return tt('act.hw', { t: tp, g: i.grade, ok: i.ok, n: i.n });
      case 'quick': case 'review': return tt('act.quick', { t: tp, g: i.grade });
      case 'lesson': return tt('act.lesson', { t: tp });
      case 'mock': case 'test': case 'diag': return tt('act.' + a.kind, { f: (i.practice ? I.t('mk.test', { n: U.pad2(i.practice) }) + ' · ' : '') + f, s: i.score, m: i.max });
      case 'cards': var dk = (Z.decks || []).filter(function (d) { return d.id === i.deck; })[0]; return tt('act.cards', { d: dk ? (I.lang() === 'ru' ? dk.ru : dk.kk) : i.deck, k: i.know, n: i.n });
      case 'game': return tt('act.game', { s: i.score });
      case 'promo': return tt('act.promo', { k: i.kind });
      case 'pay': return tt('act.pay', { a: money(i.amount || 0) });
      case 'admin': return tt('act.admin', { a: i.act || '' });
    }
    return a.kind;
  }
  function adUser(id) {
    return later('ad:user:' + id, function () { return B.admin.userDetail(id); }, function (d) {
      if (!d || !d.user) return '<p class="muted">' + tt('ad.none') + '</p>';
      var u = d.user, st = d.state || {}, x = d.summary || {}, sc = Z.schools[u.school];
      var h = '<a class="back" href="#/admin/users">' + ui().ic('back') + tt('ad.users') + '</a>' +
        '<section class="card"><span class="label">' + tt('role.' + u.role) + (sc ? ' · ' + sc.name : '') + (u.grade ? ' · ' + u.grade + '-' + tt('ad.grade') : '') + '</span><h1>' + esc(u.name || '—') + '</h1>' +
        '<p class="muted">' + esc(u.email || '') + '</p><dl class="kv">' +
        [['ad.reg', dt(u.createdAt)], ['ad.c.seen', ago(u.lastSeen) + ' · ' + dt(u.lastSeen)], ['ad.c.access', accessText(u)], ['ad.code2', esc(u.childCode || '—')], ['ad.synced', dt(d.updatedAt)]].map(function (k) {
          return '<div><dt>' + tt(k[0]) + '</dt><dd>' + k[1] + '</dd></div>'; }).join('') + '</dl>' +
        '<form class="row" data-form="adGrant" data-id="' + esc(u.id) + '"><input name="days" type="number" min="1" max="3650" value="30" style="width:80px"><button class="btn pill sm" type="submit">' + tt('ad.grant') + '</button></form></section>';
      if (u.role === 'student') {
        var fc = x.fc ? (x.fc.pct ? x.fc.score + '%' : x.fc.score + ' / ' + x.fc.max) : '—';
        h += '<dl class="kpis">' + [[(x.ready != null ? x.ready : 0) + '%', 'k.ready'], [fc, 'k.fc'], [x.streak || 0, 'ad.streak'], [(x.mastered || 0) + ' / ' + (x.topicsTotal || 0), 'ad.c.topics'], [x.mistakes || 0, 'ad.mist']].map(function (k) {
          return '<div><dd>' + k[0] + '</dd><dt>' + tt(k[1]) + '</dt></div>'; }).join('') + '</dl>';
        // Темы: прошёл / в процессе / не начинал
        var tps = Z.topicsFor(u.school || 'BIL'), T = st.topics || {}, cnt = { done: 0, go: 0, no: 0 };
        var rows = tps.map(function (t) {
          var p = T[t.id], s2 = !p || !(p.sessions || p.solved) ? 'no' : (p.grade || 0) >= 8 ? 'done' : 'go'; cnt[s2]++;
          return '<tr><td>' + ui().tn(t) + '</td><td><span class="st-' + s2 + '">' + tt('ad.t.' + s2) + '</span></td><td class="num">' + (p ? (p.grade || 0) + '/10' : '—') + '</td><td class="num">' + (p ? p.solved || 0 : 0) + '</td><td class="num">' + (p ? p.hw || 0 : 0) + '</td></tr>';
        }).join('');
        h += '<section class="sec"><h2>' + tt('ad.topics') + '</h2><p class="small"><span class="st-done">' + tt('ad.t.done') + ': ' + cnt.done + '</span> <span class="st-go">' + tt('ad.t.go') + ': ' + cnt.go + '</span> <span class="st-no">' + tt('ad.t.no') + ': ' + cnt.no + '</span></p>' +
          '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + tt('ad.c.topic') + '</th><th>' + tt('ad.c.status') + '</th><th class="num">' + tt('ad.c.grade') + '</th><th class="num">' + tt('ad.c.solved') + '</th><th class="num">' + tt('ad.c.hwN') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
        var ex = (st.exams || []).slice(-10).reverse();
        if (ex.length) h += '<section class="sec"><h2>' + tt('ad.mocks') + '</h2><div class="tbl-wrap"><table class="tbl"><tbody>' + ex.map(function (e) {
          var f2 = Z.examFormats[e.format]; return '<tr><td>' + e.date + '</td><td>' + (e.practice ? I.t('mk.test', { n: U.pad2(e.practice) }) + ' · ' : '') + (f2 ? ui().fname(f2) : e.format) + '</td><td class="num"><b>' + e.score + '</b> / ' + e.max + '</td><td class="num">' + ui().pct(e.pct) + '</td></tr>';
        }).join('') + '</tbody></table></div></section>';
        if (!d.state) h += '<div class="note">' + tt('ad.noSync') + '</div>';
      }
      var acts = d.activity || [];
      h += '<section class="sec"><h2>' + tt('ad.log') + '</h2>' + (acts.length ? '<ol class="actlog">' + acts.map(function (a) {
        return '<li><time>' + dt(a.at) + '</time><span class="ak ak-' + a.kind + '">' + esc(actText(a)) + '</span></li>'; }).join('') + '</ol>' : '<p class="muted">—</p>') + '</section>';
      if ((d.payments || []).length) h += '<section class="sec"><h2>' + tt('ad.pay') + '</h2><div class="tbl-wrap"><table class="tbl"><tbody>' + d.payments.map(function (p) {
        return '<tr><td>№' + p.id + '</td><td>' + p.months + ' ' + tt('l.months') + '</td><td class="num">' + money(p.amount) + ' ₸</td><td>' + p.status + '</td><td class="small muted">' + dt(p.createdAt) + '</td></tr>'; }).join('') + '</tbody></table></div></section>';
      return h;
    });
  }

  function admin(tab, id) {
    tab = tab || 'users';
    var m = ui().mem;
    if (tab === 'user' && id) return adUser(id);
    var h = '<section class="sec"><h1>' + tt('ad.title') + '</h1></section><div class="seg">' + ['users', 'pay', 'promo', 'set'].map(function (k) {
      return '<a class="' + (k === tab ? 'on' : '') + '" href="#/admin/' + k + '">' + tt('ad.' + k) + '</a>';
    }).join('') + '</div>';
    if (m.adMsg) h += '<div class="note ok">' + esc(m.adMsg) + '</div>';
    if (tab === 'pay') return h + later('ad:pay', function () { return B.admin.payments('pending'); }, function (list) {
      list = list || [];
      if (!list.length) return '<p class="muted">' + tt('ad.noPay') + '</p>';
      return '<div class="tbl-wrap"><table class="tbl"><tbody>' + list.map(function (p) {
        return '<tr><td>№' + p.id + '</td><td><b>' + esc(p.name || '') + '</b><br><small class="muted">' + esc(p.email || '') + '</small></td><td>' + p.months + ' ' + tt('l.months') + '</td><td class="num"><b>' + money(p.amount) + ' ₸</b></td><td class="small muted">' + String(p.createdAt).slice(0, 16).replace('T', ' ') + '</td>' +
          '<td class="num"><button class="btn pill sm dark" data-act="adPay" data-id="' + p.id + '" data-ok="1">' + tt('ad.approve') + '</button> <button class="btn pill sm" data-act="adPay" data-id="' + p.id + '" data-ok="0">' + tt('ad.reject') + '</button></td></tr>';
      }).join('') + '</tbody></table></div>';
    });
    if (tab === 'users') return h + adStudents();
    if (tab === 'promo') return h + '<form class="card form" data-form="adPromo"><div class="row2"><label class="field"><span>' + tt('ad.code') + '</span><input name="code" required pattern="[A-Za-z0-9\\-]{4,32}" style="text-transform:uppercase"></label>' +
      '<label class="field"><span>' + tt('ad.kind') + '</span><select name="kind"><option value="free">' + tt('ad.k.free') + '</option><option value="discount">' + tt('ad.k.discount') + '</option><option value="admin">' + tt('ad.k.admin') + '</option></select></label></div>' +
      '<div class="row2"><label class="field"><span>' + tt('ad.days') + '</span><input name="days" type="number" min="1"></label><label class="field"><span>' + tt('ad.percent') + '</span><input name="percent" type="number" min="1" max="100"></label></div>' +
      '<div class="row2"><label class="field"><span>' + tt('ad.max') + '</span><input name="max" type="number" min="1"></label><label class="field"><span>' + tt('ad.note') + '</span><input name="note"></label></div>' +
      '<p class="small muted">' + tt('ad.adminWarn') + '</p><button class="btn pill dark" type="submit">' + tt('ad.create') + '</button></form>' +
      later('ad:promo', B.admin.promos, function (list) {
        return '<div class="tbl-wrap"><table class="tbl"><tbody>' + (list || []).map(function (p) {
          return '<tr><td><b>' + esc(p.code) + '</b></td><td>' + tt('ad.k.' + p.kind) + (p.percent ? ' ' + p.percent + '%' : '') + (p.days ? ' · ' + p.days + ' ' + I.t('c.days') : '') + '</td><td class="num">' + p.used + (p.maxUses ? ' / ' + p.maxUses : '') + ' ' + tt('ad.used') + '</td><td class="small muted">' + esc(p.note || '') + '</td>' +
            '<td class="num"><button class="btn pill sm" data-act="adDelPromo" data-code="' + esc(p.code) + '">×</button></td></tr>';
        }).join('') + '</tbody></table></div>';
      });
    return h + later('settings', settings, function (s) {
      s = s || {};
      return '<form class="card form" data-form="adSet"><div class="row2"><label class="field"><span>' + tt('ad.kaspiPhone') + '</span><input name="phone" value="' + esc(s.kaspi && s.kaspi.phone) + '" placeholder="+7 7__ ___ __ __"></label>' +
        '<label class="field"><span>' + tt('ad.kaspiName') + '</span><input name="kname" value="' + esc(s.kaspi && s.kaspi.name) + '"></label></div>' +
        '<label class="field"><span>' + tt('ad.prizesKk') + '</span><textarea name="pkk" rows="3">' + esc(s.prizes && s.prizes.kk) + '</textarea></label>' +
        '<label class="field"><span>' + tt('ad.prizesRu') + '</span><textarea name="pru" rows="3">' + esc(s.prizes && s.prizes.ru) + '</textarea></label>' +
        '<div class="row2"><label class="field"><span>' + tt('ad.trial') + '</span><input name="trial" type="number" min="0" value="' + (s.trial_days || 0) + '"></label><span></span></div>' +
        '<div class="row2">' + ['m1', 'm3', 'm6'].map(function (k) { return '<label class="field"><span>' + s.prices[k].months + ' ' + tt('l.months') + ' — ' + tt('ad.price') + '</span><input name="' + k + '" type="number" min="0" value="' + s.prices[k].amount + '"></label>'; }).join('') + '</div>' +
        '<button class="btn pill dark" type="submit">' + tt('ad.save') + '</button></form>';
    });
  }

  /* =================== ФЛЕШ-КАРТОЧКИ =================== */
  // Лейтнер: коробка 0–4; «Знаю» — в следующую коробку, «Повторить» — в нулевую. В колоде сначала слабые карточки.
  function decksFor() { var sc = ui().S().profile.school; return (Z.decks || []).filter(function (d) { return d.schools.indexOf(sc) >= 0; }); }
  function boxes(id) { var S = ui().S(); S.cards = S.cards || {}; return (S.cards[id] = S.cards[id] || {}); }
  // Правила карточек: открыты, пока ученик их не прочитал; потом — свёрнуты, но всегда под рукой.
  function cardRules(open) {
    // Сразу на двух языках (как задания БИЛ): сначала язык сайта, затем второй.
    var langs = I.lang() === 'ru' ? ['ru', 'kk'] : ['kk', 'ru'];
    return '<details class="card c-rules"' + (open ? ' open' : '') + '><summary>' + L.kk['c.h.title'] + ' / ' + L.ru['c.h.title'] + '</summary>' + langs.map(function (lg) {
      return '<div class="c-rules-l"><span class="label">' + (lg === 'kk' ? 'Қазақша' : 'На русском') + '</span><ol>' +
        [1, 2, 3, 4, 5, 6, 7].map(function (k) { return '<li>' + L[lg]['c.h.' + k] + '</li>'; }).join('') + '</ol></div>';
    }).join('') + '</details>';
  }
  function cards() {
    var ds = decksFor(), lg = I.lang();
    var h = '<section class="sec"><h1>' + tt('c.title') + '</h1><p class="muted">' + tt('c.sub') + '</p></section>' + cardRules(!ui().S().cardsHelpSeen);
    if (!ds.length) return h + '<p class="muted">' + tt('c.none') + '</p>';
    return h + '<div class="decks">' + ds.map(function (d) {
      var bx = boxes(d.id), known = d.cards.filter(function (c, i) { return (bx[i] || 0) >= 2; }).length;
      return '<a class="deck" href="#/deck/' + d.id + '"><span class="dk-ico ' + d.kind + '">' + ui().ic(d.kind === 'logic' ? 'logic' : d.kind === 'reading' ? 'reading' : 'math') + '</span><b>' + esc(lg === 'ru' ? d.ru : d.kk) + '</b><small>' + esc(lg === 'ru' ? d.sub_ru : d.sub_kk) + '</small>' +
        '<span class="dk-foot"><span>' + tt('c.cards', { n: d.cards.length }) + '</span><span class="tag">' + tt('c.known', { k: known, n: d.cards.length }) + '</span></span><span class="bar"><i style="width:' + (known / d.cards.length * 100) + '%"></i></span></a>';
    }).join('') + '</div>';
  }
  function deckOrder(d) {
    var bx = boxes(d.id);
    return d.cards.map(function (c, i) { return i; }).sort(function (a, b) { return (bx[a] || 0) - (bx[b] || 0) || a - b; });
  }
  function deck(id) {
    var d = (Z.decks || []).filter(function (x) { return x.id === id; })[0], m = ui().mem, ru = I.lang() === 'ru';
    if (!d) return cards();
    if (!m.dk || m.dk.id !== id) m.dk = { id: id, order: deckOrder(d), i: 0, flip: false, know: 0 };
    var st = m.dk, n = st.order.length;
    var h = '<div class="dk-head"><a class="back" href="#/cards">' + ui().ic('back') + tt('c.back') + '</a><span class="row"><button class="btn line sm" data-act="dkHelp">? ' + tt('c.h.again') + '</button><span class="muted">' + Math.min(st.i + 1, n) + ' / ' + n + '</span></span></div>' +
      '<div class="center"><h2>' + esc(ru ? d.ru : d.kk) + '</h2><p class="muted">' + esc(ru ? d.sub_ru : d.sub_kk) + '</p></div><div class="bar"><i style="width:' + (st.i / n * 100) + '%"></i></div>';
    // Первый вход (или «? Правила»): сначала объясняем, что делают кнопки.
    if (!ui().S().cardsHelpSeen || m.dkHelp) {
      return h + cardRules(true) + '<div class="row center"><button class="btn pill dark" data-act="dkHelpOk">' + tt('c.h.ok') + '</button></div>';
    }
    if (st.i >= n) {
      return h + '<div class="flash done"><b>' + tt('c.done', { k: st.know }) + '</b></div><div class="row center"><button class="btn pill" data-act="dkRestart">' + tt('c.restart') + '</button><a class="btn pill dark" href="#/cards">' + tt('c.back') + '</a></div>';
    }
    var c = d.cards[st.order[st.i]], F = U.mathFrac;
    h += '<button class="flash' + (st.flip ? ' back' : '') + '" data-act="dkFlip"><span class="label">' + (st.flip ? tt('c.a') : tt('c.q')) + '</span>' +
      (st.flip ? '<b class="ans">' + F(ru ? c.b_ru : c.b_kk) + '</b>' + ((ru ? c.n_ru : c.n_kk) ? '<span class="note-t">' + F(ru ? c.n_ru : c.n_kk) + '</span>' : '') : '<b>' + F(ru ? c.f_ru : c.f_kk) + '</b><small>' + tt('c.show') + '</small>') + '</button>';
    h += '<div class="row center dk-nav"><button class="btn pill icon" data-act="dkPrev"' + (st.i === 0 ? ' disabled' : '') + '>‹</button>' +
      (st.flip ? '<button class="btn pill" data-act="dkMark" data-ok="0">' + tt('c.again') + '</button><button class="btn pill dark" data-act="dkMark" data-ok="1">' + tt('c.know') + '</button>' : '<button class="btn pill" data-act="dkRestart">↻ ' + tt('c.restart') + '</button>') +
      '<button class="btn pill icon" data-act="dkNext">›</button></div>';
    return h;
  }

  /* =================== ОЙЫНДАР / ИГРЫ =================== */
  // Каждая игра — 60 секунд. Ввод числа (calc) или выбор варианта (остальные): верно +1, неверно −1 (не ниже 0),
  // чтобы не жали наугад. Рекорд — свой у каждой игры; первая игра дня даёт баллы в рейтинг.
  function frStr(n, d) { return '<span class="frac"><span>' + n + '</span><span>' + d + '</span></span>'; }
  function gcdG(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
  var GAMES = {
    calc: { kk: 'Жылдам есеп', ru: 'Быстрый счёт', ic: '±', typed: true,
      skk: '60 секундта мүмкіндігінше көп мысал. Жауапты теріп, Enter басыңыз.', sru: 'Как можно больше примеров за 60 секунд. Введите ответ и нажмите Enter.',
      gen: function (r, lvl) {
        var a, b, op = r.pick(lvl === 1 ? ['+', '−'] : lvl === 2 ? ['+', '−', '·'] : ['+', '−', '·', ':']);
        if (op === '+') { a = r.int(lvl * 8, lvl * 60); b = r.int(lvl * 5, lvl * 45); return { q: a + ' + ' + b + ' = ?', a: a + b }; }
        if (op === '−') { a = r.int(lvl * 20, lvl * 90); b = r.int(lvl * 5, a); return { q: a + ' − ' + b + ' = ?', a: a - b }; }
        if (op === '·') { a = r.int(3, lvl === 2 ? 12 : 19); b = r.int(3, lvl === 2 ? 9 : 15); return { q: a + ' · ' + b + ' = ?', a: a * b }; }
        b = r.int(3, 15); a = b * r.int(3, 15); return { q: a + ' : ' + b + ' = ?', a: a / b };
      } },
    frac: { kk: 'Бөлшек жекпе-жегі', ru: 'Дуэль дробей', ic: '½',
      skk: 'Қай бөлшек үлкен? Тең болса — «=». Қате жауап −1.', sru: 'Какая дробь больше? Если равны — «=». Ошибка −1.',
      gen: function (r, lvl) {
        var a, b, c, d, g;
        if (r.chance(0.15)) { a = r.int(1, 6); b = a + r.int(1, 6); var k = r.int(2, 4); c = a * k; d = b * k; }
        else if (lvl === 1) { if (r.chance(0.5)) { b = d = r.int(5, 12); a = r.int(1, b - 1); do { c = r.int(1, d - 1); } while (c === a); } else { a = c = r.int(1, 5); b = r.int(a + 1, 12); do { d = r.int(a + 1, 12); } while (d === b); } }
        else { var mx = lvl === 2 ? 12 : 20; do { b = r.int(3, mx); d = r.int(3, mx); a = r.int(1, b - 1); c = r.int(1, d - 1); } while (a * d === b * c || (lvl === 3 && Math.abs(a / b - c / d) > 0.08)); }
        g = gcdG(a, b); var x = a * d, y = c * b, k2 = x > y ? 0 : x < y ? 1 : 2;
        return { q: '<span class="g-vs">' + frStr(a, b) + '<i>?</i>' + frStr(c, d) + '</span>', opts: [frStr(a, b), frStr(c, d), '='], k: k2 };
      } },
    seq: { kk: 'Тізбек', ru: 'Последовательность', ic: '…',
      skk: 'Тізбектің келесі санын табыңыз. Қате жауап −1.', sru: 'Найдите следующее число последовательности. Ошибка −1.',
      gen: function (r, lvl) {
        var t = r.pick(lvl === 1 ? ['ar', 'ar', 'geo'] : lvl === 2 ? ['ar', 'geo', 'sq', 'dif'] : ['geo', 'sq', 'dif', 'alt', 'fib']), s = [], i, n = 5;
        if (t === 'ar') { var a0 = r.int(1, 40), d = r.pick([-7, -5, -3, 3, 4, 6, 7, 9, 11, 12]); if (d < 0) a0 += 60; for (i = 0; i <= n; i++) s.push(a0 + i * d); }
        if (t === 'geo') { var g0 = r.int(1, 5), q = r.pick([2, 3]); for (i = 0; i <= n; i++) s.push(g0 * Math.pow(q, i)); }
        if (t === 'sq') { var o = r.int(1, 5), add = r.pick([0, 1, -1]); for (i = 0; i <= n; i++) s.push((o + i) * (o + i) + add); }
        if (t === 'dif') { var v = r.int(1, 10), st = r.int(1, 4); for (i = 0; i <= n; i++) { s.push(v); v += st + i; } }   // разности растут на 1
        if (t === 'alt') { var u = r.int(10, 30), p = r.int(2, 6), m2 = r.int(1, 4); for (i = 0; i <= n; i++) { s.push(u); u = i % 2 ? u - m2 : u + p; } }
        if (t === 'fib') { var f1 = r.int(1, 4), f2 = r.int(2, 6); s = [f1, f2]; while (s.length <= n) s.push(s[s.length - 1] + s[s.length - 2]); }
        var ans = s[n], shown = s.slice(0, n), last = shown[n - 1], dd = ans - last;
        var cand = [ans + 1, ans - 1, last + (shown[n - 1] - shown[n - 2]), ans + dd, ans * 2, ans - 2, ans + 2].filter(function (x, j, A) { return x !== ans && A.indexOf(x) === j; });
        var opts = r.shuffle([ans].concat(cand.slice(0, 3)));
        return { q: shown.join(', ') + ', ?', opts: opts.map(String), k: opts.indexOf(ans) };
      } },
    tf: { kk: 'Шын ба, жалған ба?', ru: 'Правда или ложь?', ic: '✓',
      skk: 'Тұжырым дұрыс па? Тез шешіңіз. Қате жауап −1.', sru: 'Верно ли утверждение? Решайте быстро. Ошибка −1.',
      gen: function (r, lvl) {
        var ru = I.lang() === 'ru', t = r.pick(['prime', 'div', 'frac', 'dec', 'pct', 'sq', 'ord']), ok = r.chance(0.5), s, x, y, v;
        if (t === 'prime') { do { x = r.int(11, lvl === 1 ? 50 : 99); } while ((function (n) { for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; })(x) !== ok); s = x + (ru ? ' — простое число' : ' — жай сан'); }
        else if (t === 'div') { y = r.pick([3, 4, 6, 8, 9, 11, 12]); x = y * r.int(5, 40) + (ok ? 0 : r.int(1, y - 1)); s = x + (ru ? ' делится на ' + y : ' саны ' + y + { 3: '-ке', 4: '-ке', 6: '-ға', 8: '-ге', 9: '-ға', 11: '-ге', 12: '-ге' }[y] + ' бөлінеді'); }
        else if (t === 'frac') { var b = r.int(3, 12), d = r.int(3, 12), a = r.int(1, b - 1), c = r.int(1, d - 1); if (a * d === b * c) c = c === 1 ? 2 : c - 1; var big = a * d > b * c; ok = big; s = frStr(a, b) + ' > ' + frStr(c, d); }
        else if (t === 'dec') { var P = [['0,25', 1, 4], ['0,5', 1, 2], ['0,2', 1, 5], ['0,75', 3, 4], ['0,4', 2, 5], ['0,125', 1, 8], ['0,6', 3, 5], ['0,05', 1, 20]], e = r.pick(P), f = ok ? e : r.pick(P.filter(function (z) { return z !== e; })); s = e[0] + ' = ' + frStr(f[1], f[2]); }
        else if (t === 'pct') { var p = r.pick([10, 20, 25, 50, 75, 5, 30]), n2 = r.pick([40, 60, 80, 120, 200, 360, 400]), val = p * n2 / 100; if (val % 1) { p = 10; val = n2 / 10; } v = ok ? val : val + r.pick([-10, -5, 5, 10, 2]); s = (ru ? p + '% от ' + n2 + ' = ' : n2 + { 40: '-тың', 60: '-тың', 80: '-нің', 120: '-ның', 200: '-дің', 360: '-тың', 400: '-дің' }[n2] + ' ' + p + '%-ы = ') + v; }
        else if (t === 'sq') { x = r.int(11, lvl === 1 ? 15 : 25); v = ok ? x * x : x * x + r.pick([-10, 10, -1, 1, 20]); s = x + '² = ' + v; }
        else { var A1 = r.int(2, 9), B1 = r.int(2, 9), C1 = r.int(2, 9), right = A1 + B1 * C1; v = ok ? right : (A1 + B1) * C1; if (v === right) { v++; ok = false; } s = A1 + ' + ' + B1 + ' · ' + C1 + ' = ' + v; }
        return { q: s, opts: ru ? ['Верно', 'Неверно'] : ['Шын', 'Жалған'], k: ok ? 0 : 1 };
      } },
    formula: { kk: 'Формула викторинасы', ru: 'Викторина формул', ic: 'π',
      skk: 'Карточкалардағы формулалар: дұрыс жауапты таңдаңыз. Карточкаларды шынымен білетініңізді тексереді. Қате жауап −1.', sru: 'Формулы из карточек: выберите правильный ответ. Проверяет, действительно ли вы знаете карточки. Ошибка −1.',
      gen: function (r) {
        // Берём карточки с коротким ответом (формула, число), а неверные варианты — того же вида, чтобы не угадывалось по форме.
        var ru = I.lang() === 'ru', F = U.mathFrac, back = function (x) { return String(ru ? x.b_ru : x.b_kk); };
        var plain = function (x) { return back(x).replace(/<[^>]+>/g, ''); }, isNum = function (x) { return /^[\d\s,.−+·:=()\/%°²³-]+$/.test(plain(x)); };
        var pool = [];
        (decksFor().length ? decksFor() : (Z.decks || [])).forEach(function (d) { d.cards.forEach(function (c) { if (plain(c).length <= 42) pool.push({ d: d, c: c }); }); });
        var pick = r.pick(pool), c = pick.c, num = isNum(c);
        var same = function (list) { return list.filter(function (x) { return back(x.c) !== back(c) && isNum(x.c) === num; }); };
        var cand = r.shuffle(same(pool.filter(function (x) { return x.d === pick.d; })));
        if (cand.length < 3) cand = cand.concat(r.shuffle(same(pool.filter(function (x) { return x.d !== pick.d; }))));
        var opts = [c], seen = {}; seen[back(c)] = 1;
        cand.forEach(function (x) { if (opts.length < 4 && !seen[back(x.c)]) { seen[back(x.c)] = 1; opts.push(x.c); } });
        opts = r.shuffle(opts);
        return { q: '<small class="muted">' + esc(ru ? pick.d.ru : pick.d.kk) + '</small><br>' + F(ru ? c.f_ru : c.f_kk), opts: opts.map(function (x) { return F(back(x)); }), k: opts.indexOf(c), long: true };
      } }
  };
  /* «24»: из четырёх чисел получить 24 с помощью + − × : (каждое число — ровно один раз).
   * Ход: выбрать число → знак → второе число; два числа заменяются результатом. Решатель работает
   * с обыкновенными дробями (n/d), поэтому знает и ответы вида 8 : (3 − 8 : 3). */
  function q24(n, d) { var g = gcdG(Math.abs(n), Math.abs(d)) || 1; if (d < 0) { n = -n; d = -d; } return { n: n / g, d: d / g }; }
  function op24(a, b, o) {
    if (o === '+') return q24(a.n * b.d + b.n * a.d, a.d * b.d);
    if (o === '−') return q24(a.n * b.d - b.n * a.d, a.d * b.d);
    if (o === '×') return q24(a.n * b.n, a.d * b.d);
    if (!b.n) return null; return q24(a.n * b.d, a.d * b.n);
  }
  function solve24(list, ops) {   // list: [{n, d, e}] → строка решения или null
    if (list.length === 1) return list[0].n === 24 * list[0].d ? list[0].e : null;
    for (var i = 0; i < list.length; i++) for (var j = 0; j < list.length; j++) {
      if (i === j) continue;
      var rest = list.filter(function (x, k) { return k !== i && k !== j; });
      for (var o = 0; o < ops.length; o++) {
        if ((ops[o] === '+' || ops[o] === '×') && j < i) continue;   // коммутативные — один порядок
        var v = op24(list[i], list[j], ops[o]); if (!v) continue;
        var e = '(' + list[i].e + ' ' + (ops[o] === ':' ? ':' : ops[o]) + ' ' + list[j].e + ')';
        var s = solve24(rest.concat([{ n: v.n, d: v.d, e: e }]), ops); if (s) return s;
      }
    }
    return null;
  }
  function trim24(e) { return e.length > 2 && e[0] === '(' && e[e.length - 1] === ')' ? e.slice(1, -1) : e; }
  function make24(r, lvl) {
    for (var t = 0; t < 2000; t++) {
      var mx = lvl === 3 ? 13 : 9, nums = [r.int(1, mx), r.int(1, mx), r.int(1, mx), r.int(1, mx)];
      var L = nums.map(function (x) { return { n: x, d: 1, e: String(x) }; });
      var easy = solve24(L, ['+', '−', '×']), any = easy || solve24(L, ['+', '−', '×', ':']);
      if (!any) continue;
      if (lvl === 1 && !easy) continue;               // A: хватает + − ×
      if (lvl === 3 && easy) continue;                // C: без деления не получится
      if (lvl >= 2 && t < 1500 && solve24(L, ['+'])) continue;                        // B, C: не просто сумма
      if (lvl === 2 && t < 1500 && nums.indexOf(1) >= 0 && r.chance(0.5)) continue;   // B: поменьше единиц
      return { nums: nums, sol: trim24(easy || any) };
    }
    return { nums: [3, 3, 8, 8], sol: '8 : (3 − 8 : 3)' };
  }
  function show24(x) { return x.d === 1 ? String(x.n).replace('-', '−') : '<span class="frac"><span>' + String(x.n).replace('-', '−') + '</span><span>' + x.d + '</span></span>'; }
  function new24(g) { var p = make24(g.r, g.lvl); g.task = { nums: p.nums, sol: p.sol }; g.cur = p.nums.map(function (x) { return { n: x, d: 1, e: String(x) }; }); g.hist = []; g.sel = -1; g.op = null; }
  function g24html(g) {
    var ru = I.lang() === 'ru';
    var h = '<div class="g24-cards">' + g.cur.map(function (x, i) {
      return '<button class="g24-card' + (g.sel === i ? ' sel' : '') + '" data-act="g24Num" data-i="' + i + '">' + show24(x) + '</button>';
    }).join('') + '</div><div class="g24-ops">' + ['+', '−', '×', ':'].map(function (o) {
      return '<button class="btn pill g24-op' + (g.op === o ? ' dark' : '') + '" data-act="g24Op" data-o="' + o + '">' + o + '</button>';
    }).join('') + '</div><div class="row center"><button class="btn line sm" data-act="g24Undo"' + (g.hist.length ? '' : ' disabled') + '>↶ ' + (ru ? 'Назад' : 'Артқа') + '</button>' +
      '<button class="btn line sm" data-act="g24Reset">↺ ' + (ru ? 'Сначала' : 'Басынан') + '</button><button class="btn line sm" data-act="g24Skip">' + (ru ? 'Пропустить' : 'Өткізу') + ' →</button></div>';
    if (g.prev24) h += '<div class="g-prev ' + (g.prev24.ok ? 'ok' : 'no') + '"><span class="label">' + tt('g.prev') + '</span> ' + g.prev24.nums.join(', ') + ' → <b>' + g.prev24.sol + ' = 24</b> ' + (g.prev24.ok ? '✓' : '') + '</div>';
    return h;
  }
  GAMES.g24 = { kk: '24 ойыны', ru: 'Игра «24»', ic: '24', secs: 180, custom: true,
    skk: 'Төрт санның әрқайсысын бір реттен қолданып, + − × : арқылы 24 шығарыңыз. Санды, белгіні, сосын екінші санды басыңыз. 3 минут.',
    sru: 'Получите 24 из четырёх чисел, используя каждое ровно один раз и знаки + − × :. Нажмите число, знак, затем второе число. 3 минуты.' };
  var GAME_ORDER = ['calc', 'frac', 'seq', 'tf', 'formula', 'g24'];
  function gName(G) { return I.lang() === 'ru' ? G.ru : G.kk; }
  function gBest(S, id) { S.game = S.game || {}; if (typeof S.game.best === 'number') { S.game.bests = { calc: S.game.best }; delete S.game.best; } S.game.bests = S.game.bests || {}; return S.game.bests[id] || 0; }
  function game(id) {
    var m = ui().mem, g = m.game, S = ui().S(), ru = I.lang() === 'ru';
    if (!id || !GAMES[id]) {   // витрина игр
      return '<section class="sec"><h1>' + tt('g.title') + '</h1><p class="muted">' + tt('g.sub') + '</p></section><div class="decks games">' + GAME_ORDER.map(function (k) {
        var G = GAMES[k];
        return '<a class="deck" href="#/game/' + k + '"><span class="dk-ico g-ico">' + G.ic + '</span><b>' + gName(G) + '</b><small>' + (ru ? G.sru : G.skk) + '</small>' +
          '<span class="dk-foot"><span>' + ((G.secs || 60) >= 120 ? (G.secs / 60) + ' мин' : (G.secs || 60) + ' сек') + '</span><span class="tag">' + tt('g.best', { n: gBest(S, k) }) + '</span></span></a>';
      }).join('') + '</div>';
    }
    var G = GAMES[id];
    var h = '<a class="back" href="#/game">' + ui().ic('back') + tt('g.title') + '</a><section class="sec"><h1>' + gName(G) + '</h1><p class="muted">' + (ru ? G.sru : G.skk) + '</p></section>';
    if (!g || g.id !== id || g.over) {
      var fin = g && g.id === id && g.over;
      h += (fin ? '<div class="card center"><b class="big">' + tt('g.score', { n: g.score }) + '</b><p class="muted">' + tt('g.best', { n: gBest(S, id) }) + '</p>' + (g.ok + g.bad ? '<div class="g-res"><span class="ok">✓ ' + tt('g.ok', { n: g.ok }) + '</span><span class="no">✗ ' + tt('g.bad', { n: g.bad }) + '</span></div>' : '') + '</div>' : '<p class="muted">' + tt('g.best', { n: gBest(S, id) }) + '</p>') +
        (id === 'formula' ? '' : '<div class="row center"><span class="muted">' + tt('g.level') + ':</span>' + [1, 2, 3].map(function (l) { return '<button class="btn pill' + ((m.gLvl || 2) === l ? ' dark' : '') + '" data-act="gLvl" data-l="' + l + '">' + ['A', 'B', 'C'][l - 1] + '</button>'; }).join('') + '</div>') +
        '<div class="row center"><button class="btn pill dark" data-act="gStart" data-g="' + id + '">' + (fin ? tt('g.again') : tt('g.start')) + '</button></div>';
      return h;
    }
    var t = g.task;
    if (G.custom) return h + '<div class="card center game' + (g.fb ? ' fb-' + g.fb : '') + '"><span class="timer" id="gTime">' + Math.max(0, Math.ceil((g.end - Date.now()) / 1000)) + '</span>' + g24html(g) + '<p class="muted">' + tt('g.score', { n: g.score }) + '</p></div>';
    h += '<div class="card center game' + (g.fb ? ' fb-' + g.fb : '') + '"><span class="timer" id="gTime">' + Math.max(0, Math.ceil((g.end - Date.now()) / 1000)) + '</span><b class="big g-q">' + t.q + '</b>';
    if (G.typed) h += '<form data-form="gAnswer" class="row center"><input name="a" id="gIn" inputmode="numeric" autocomplete="off" data-autofocus class="g-in"><button class="btn pill dark" type="submit">↵</button></form>';
    else h += '<div class="g-opts' + (t.long ? ' long' : '') + (t.opts.length === 2 ? ' two' : '') + '">' + t.opts.map(function (o, i) { return '<button class="btn pill g-opt" data-act="gPick" data-i="' + i + '">' + o + '</button>'; }).join('') + '</div>';
    return h + '<p class="muted">' + tt('g.score', { n: g.score }) + '</p></div>';
  }
  function gameTick() {
    var g = ui().mem.game; if (!g || g.over) return;
    var left = Math.ceil((g.end - Date.now()) / 1000), el = document.getElementById('gTime');
    if (left <= 0) {
      g.over = true; clearInterval(g.timer);
      var S = ui().S(); gBest(S, g.id); S.game.bests[g.id] = Math.max(S.game.bests[g.id] || 0, g.score); ui().save();
      ui().award('game', ui().today(), Math.min(30, g.score));
      ui().track('game', { game: g.id, score: g.score, ok: g.ok, bad: g.bad, lvl: g.lvl });
      ui().render(); return;
    }
    if (el) el.textContent = left;
  }
  function gNext(g, ok) {
    if (ok) { g.score++; g.ok++; } else { g.score = Math.max(0, g.score - (GAMES[g.id].typed ? 0 : 1)); g.bad++; }
    g.fb = ok ? 'ok' : 'no'; g.task = GAMES[g.id].gen(g.r, g.lvl);
    ui().render();
  }

  /* =================== ДЕЙСТВИЯ =================== */
  function after(p, okMsg, key) {
    return p.then(function (r) { if (r && r.ok === false) throw r; ui().mem.adMsg = okMsg || ''; refresh(key); ui().render(); }).catch(function (e) { ui().ask(errText(e), 'OK', null, false); });
  }
  Z.viewActs = {
    ltab: function (el) { ui().mem.ltab = el.dataset.k; var y = window.scrollY; ui().render(); window.scrollTo(0, y); },
    scrollTour: function () { var t = document.getElementById('tour'); if (t) t.scrollIntoView({ behavior: 'smooth' }); },
    arole: function (el) { ui().mem.arole = el.dataset.r; ui().render(); },
    pwEye: function (el) { var i = el.parentNode.querySelector('input'); var show = i.type === 'password'; i.type = show ? 'text' : 'password'; el.textContent = tt(show ? 'a.hide' : 'a.show'); },
    forgotPw: function () {
      var m = ui().mem, inp = document.querySelector('form.auth input[name=email]'), email = inp ? inp.value.trim() : '';
      if (!email) { m.aerr = tt('a.resetEmail'); ui().render(); return; }
      m.aEmail = email;
      B.resetPassword(email).then(function () { m.aerr = null; ui().toast(tt('a.resetSent')); }).catch(function (e) { m.aerr = errText(e); ui().render(); });
    },
    signOutAll: function () { ui().ask(tt('acc.outAllQ'), tt('acc.outAll'), function () { ui().flush().then(function () { return B.signOutAll(); }).then(function () { refresh(); ui().setUser(null); ui().go('#/'); }); }); },
    signOut: function () { ui().flush().then(function () { return B.signOut(); }).then(function () { refresh(); ui().setUser(null); ui().go('#/'); }); },
    pay: function (el) {
      var m = ui().mem, u = m.user;
      B.requestPayment(el.dataset.plan, m.discount || null).then(function (r) {
        if (!r || !r.ok) throw r;
        return settings().then(function (s) {
          var k = (s && s.kaspi) || {};
          m.payInfo = '<section class="card pay-info"><span class="label">' + tt('p.kaspi') + '</span><p>' + (k.phone ? tt('p.kaspiTo', { amount: money(r.amount), phone: esc(k.phone), name: esc(k.name || ''), email: esc(u.email) }) : tt('p.kaspiNo')) + '</p><p class="muted">' + tt('p.wait', { id: r.id }) + '</p></section>';
          refresh('mypay'); ui().render();
        });
      }).catch(function (e) { ui().ask(errText(e), 'OK', null, false); });
    },
    adF: function (el) { ui().mem.adF = el.dataset.f; ui().render(); },
    adOpen: function (el) { ui().go('#/admin/user/' + el.dataset.id); },
    adRefresh: function () { refresh(); ui().render(); },
    lbMonth: function (el) { ui().mem.lbMonth = el.dataset.m; ui().render(); },
    lbSchool: function (el) { ui().mem.lbSchool = el.dataset.s; ui().render(); },
    adPay: function (el) { after(B.admin.decidePayment(+el.dataset.id, el.dataset.ok === '1'), '✓', 'ad:pay'); },
    adDelPromo: function (el) { ui().ask(el.dataset.code + ' ?', '×', function () { after(B.admin.deletePromo(el.dataset.code), '', 'ad:promo'); }); },
    dkFlip: function () { var st = ui().mem.dk; st.flip = !st.flip; ui().render(); },
    dkNext: function () { var st = ui().mem.dk; st.i++; st.flip = false; ui().render(); },
    dkPrev: function () { var st = ui().mem.dk; if (st.i > 0) st.i--; st.flip = false; ui().render(); },
    dkRestart: function () { ui().mem.dk = null; ui().render(); },
    dkHelp: function () { ui().mem.dkHelp = true; ui().render(); },
    dkHelpOk: function () { ui().S().cardsHelpSeen = true; ui().mem.dkHelp = false; ui().save(); ui().render(); },
    dkMark: function (el) {
      var st = ui().mem.dk, bx = boxes(st.id), k = st.order[st.i];
      if (el.dataset.ok === '1') { bx[k] = Math.min(4, (bx[k] || 0) + 1); st.know++; } else bx[k] = 0;
      st.i++; st.flip = false; ui().save();
      if (st.i >= st.order.length) { ui().award('cards', st.id + ':' + ui().today(), Math.min(20, st.know)); ui().track('cards', { deck: st.id, know: st.know, n: st.order.length }); }
      ui().render();
    },
    gLvl: function (el) { ui().mem.gLvl = +el.dataset.l; ui().render(); },
    gStart: function (el) {
      var m = ui().mem, r = U.rng(U.newSeed()), id = el.dataset.g || 'calc';
      if (m.game && m.game.timer) clearInterval(m.game.timer);
      m.game = { id: id, r: r, lvl: m.gLvl || 2, score: 0, ok: 0, bad: 0, end: Date.now() + (GAMES[id].secs || 60) * 1000, task: null, over: false };
      if (GAMES[id].custom) new24(m.game); else m.game.task = GAMES[id].gen(r, m.game.lvl);
      m.game.timer = setInterval(gameTick, 250);
      ui().render();
    },
    // «24»: число → знак → число; результат заменяет два числа. Осталось одно число 24 — решено.
    g24Num: function (el) {
      var g = ui().mem.game, i = +el.dataset.i; if (!g || g.over) return;
      if (g.sel < 0 || !g.op || g.sel === i) { g.sel = g.sel === i ? -1 : i; g.op = null; ui().render(); return; }
      var a = g.cur[g.sel], b = g.cur[i], v = op24(a, b, g.op === ':' ? ':' : g.op);
      if (!v) { g.op = null; ui().render(); return; }   // на 0 делить нельзя
      g.hist.push(g.cur.slice());
      var next = g.cur.filter(function (x, k) { return k !== g.sel && k !== i; });
      next.splice(Math.min(g.sel, i), 0, { n: v.n, d: v.d, e: '(' + a.e + ' ' + g.op + ' ' + b.e + ')' });
      g.cur = next; g.sel = Math.min(g.sel, i) >= next.length ? next.length - 1 : Math.min(g.sel, i); g.op = null;
      if (g.cur.length === 1) {
        var ok = g.cur[0].n === 24 * g.cur[0].d;
        if (ok) { g.score++; g.ok++; g.fb = 'ok'; g.prev24 = { nums: g.task.nums, sol: trim24(g.cur[0].e), ok: true }; new24(g); }
        else { g.fb = 'no'; g.bad++; g.hist.pop(); g.cur = g.hist.length ? g.hist[g.hist.length - 1] : g.cur; g.cur = g.task.nums.map(function (x) { return { n: x, d: 1, e: String(x) }; }); g.hist = []; g.sel = -1; }
      }
      ui().render();
    },
    g24Op: function (el) { var g = ui().mem.game; if (!g || g.over || g.sel < 0) return; g.op = el.dataset.o; ui().render(); },
    g24Undo: function () { var g = ui().mem.game; if (!g || !g.hist.length) return; g.cur = g.hist.pop(); g.sel = -1; g.op = null; ui().render(); },
    g24Reset: function () { var g = ui().mem.game; if (!g) return; g.cur = g.task.nums.map(function (x) { return { n: x, d: 1, e: String(x) }; }); g.hist = []; g.sel = -1; g.op = null; ui().render(); },
    g24Skip: function () { var g = ui().mem.game; if (!g || g.over) return; g.prev24 = { nums: g.task.nums, sol: g.task.sol, ok: false }; g.fb = ''; new24(g); ui().render(); },
    gPick: function (el) { var g = ui().mem.game; if (!g || g.over) return; gNext(g, +el.dataset.i === g.task.k); }
  };
  Z.viewForms = {
    signup: function (d) {
      var m = ui().mem; m.aEmail = String(d.get('email') || '').trim();
      var f = { role: d.get('role') || m.arole || 'student', name: String(d.get('name') || '').trim(), email: d.get('email'), password: d.get('password'), school: d.get('school'), grade: d.get('grade') ? +d.get('grade') : null };
      B.signUp(f).then(function (u) {
        var promo = String(d.get('promo') || '').trim();
        return (promo ? B.redeemPromo(promo).then(function () { return B.session(); }) : Promise.resolve(u));
      }).then(function (u) {
        m.aerr = null; refresh();
        // Ученику сразу заполняем профиль сайта из регистрации.
        return ui().setUser(u).then(function () {
          var S = ui().S();
          if (u.role !== 'parent' && !S.profile) {
            S.profile = { name: u.name || 'Оқушы', school: u.school || 'BIL', grade: u.grade || 6, examDate: U.addDays(ui().today(), 120), intensity: 'normal', qLang: 'both', uiLang: I.lang(), startDate: ui().today(), rid: 'r' + U.newSeed() };
            ui().save();
          }
          ui().go(u.role === 'parent' ? '#/kids' : '#/today');
        });
      }).catch(function (e) { m.aerr = errText(e); ui().render(); });
    },
    login: function (d) {
      var m = ui().mem; m.aEmail = String(d.get('email') || '').trim();
      B.signIn({ email: d.get('email'), password: d.get('password') }).then(function (u) { m.aerr = null; refresh(); return ui().setUser(u).then(function () { ui().go(u.role === 'parent' ? '#/kids' : '#/today'); }); })
        .catch(function (e) { m.aerr = errText(e); ui().render(); });
    },
    promo: function (d) {
      var m = ui().mem, code = String(d.get('code') || '').trim().toUpperCase();
      m.promoDraft = code;
      // Скидочный код запоминаем: сервер применит его к сумме при заявке на оплату.
      B.redeemPromo(code).then(function (r) {
        if (!r || !r.ok) throw r;
        if (r.kind === 'discount') { m.discount = code; m.promoMsg = tt('p.ok.discount', { p: r.percent }); }
        else m.promoMsg = tt(r.kind === 'admin' ? 'p.ok.admin' : 'p.ok.free');
        return B.session().then(function (u) { m.user = u; refresh(); ui().render(); });
      }).catch(function (e) { m.promoMsg = errText(e); ui().render(); });
    },
    linkChild: function (d) {
      var m = ui().mem;
      B.linkChild(d.get('code')).then(function (r) { if (!r || !r.ok) throw r; m.kidMsg = null; refresh('kids'); ui().render(); })
        .catch(function (e) { m.kidMsg = errText(e); ui().render(); });
    },
    adSearch: function (d) { ui().mem.adQ = String(d.get('q') || ''); ui().render(); },
    adGrant: function (d, f) { after(B.admin.grant(f.dataset.id, +d.get('days') || 30), '✓', null); },
    adPromo: function (d) {
      after(B.admin.createPromo({ code: d.get('code'), kind: d.get('kind'), days: +d.get('days') || null, percent: +d.get('percent') || null, maxUses: +d.get('max') || null, note: d.get('note') }), '✓', 'ad:promo');
    },
    adSet: function (d) {
      settings().then(function (s) {
        var prices = JSON.parse(JSON.stringify(s.prices));
        ['m1', 'm3', 'm6'].forEach(function (k) { prices[k].amount = +d.get(k) || prices[k].amount; });
        var upd = { kaspi: { phone: d.get('phone'), name: d.get('kname') }, prizes: { kk: d.get('pkk'), ru: d.get('pru') }, trial_days: +d.get('trial') || 0, prices: prices };
        settingsCache = null;
        after(B.admin.saveSettings(upd), tt('ad.saved'), 'settings');
      });
    },
    gAnswer: function (d) {
      var g = ui().mem.game; if (!g || g.over) return;
      gNext(g, +String(d.get('a')).replace(',', '.').replace('−', '-') === g.task.a);
    }
  };
  // Индикатор надёжности пароля на форме регистрации.
  function pwScore(p) { var s = 0; if (p.length >= 8) s++; if (/[A-Za-zА-Яа-яӘәІіҢңҒғҮүҰұҚқӨөҺһЁё]/.test(p) && /\d/.test(p)) s++; if (p.length >= 12 || /[^A-Za-z0-9А-Яа-яЁё]/.test(p)) s++; return p.length < 8 ? 0 : B.passIssue(p) ? 1 : s; }
  if (root.document) root.document.addEventListener('input', function (ev) {
    var t = ev.target; if (!t || !t.dataset || !t.dataset.pw) return;
    var box = root.document.getElementById('pwMeter'); if (!box) return;
    var sc = t.value ? pwScore(t.value) : -1;
    box.className = 'pw-meter s' + sc;
    box.querySelector('span').textContent = sc < 0 ? tt('a.passHint') : tt('a.pw' + Math.max(0, sc));
  });
  Z.parentTips = parentTips;
  Z.views = { refresh: refresh, landing: landing, auth: auth, pricing: pricing, account: account, kids: kids, leaders: leaders, admin: admin, cards: cards, deck: deck, game: game };
})(typeof window !== 'undefined' ? window : globalThis);
