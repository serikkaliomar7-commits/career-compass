/* Зерде — экраны аккаунта и сообщества: лендинг, вход/регистрация, тарифы и оплата, аккаунт,
 * кабинет родителя, рейтинг месяца, админка, флеш-карточки, игра «Жылдам есеп».
 * Подключается после app.js и пользуется его общими функциями (Z.ui). */
(function (root) {
  'use strict';
  var Z = root.Z, U = Z.util, I = Z.i18n, B = Z.backend;
  var ui = function () { return Z.ui; };

  /* ---------- тексты экранов ---------- */
  var L = {
    kk: {
      'nav.pricing': 'Тарифтер', 'nav.account': 'Аккаунт', 'nav.leaders': 'Рейтинг', 'nav.cards': 'Карточкалар', 'nav.game': 'Жылдам есеп', 'nav.admin': 'Әкімші',
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
      'l.d.hw': 'Әр тақырыпқа 50 есеп: A → B → C → ★. Қате жауаптан кейін — ұқсас есеп. Есептер шаблонды емес: суреттер, кестелер, кері есептер, «қатені тап».',
      'l.d.mock': 'БИЛ (+4/−1), РФМШ (тек сан), НЗМ (бөлімдердің өз уақыты) форматтары. Қағазға басып шығарып, жауаптарды кейін енгізуге болады.',
      'l.d.cards': 'Формулалар мен ережелерге арналған флеш-карточкалар: «Білемін / Қайталау» — білмегендері жиірек шығады.',
      'l.d.game': '«Жылдам есеп»: 60 секундта ойша есептеу. Ұпай рейтингке қосылады.',
      'l.d.rank': 'Үй жұмысы, сынақ, карточка, ойын үшін ұпай беріледі. Ай сайын көшбасшыларға сыйлық.',
      'l.d.parent': 'Ата-ана баласының нәтижесін өз аккаунтынан көреді: белсенділік, үй жұмыстары, сынақтар, әлсіз тақырыптар.',
      'a.login': 'Кіру', 'a.signup': 'Тіркелу', 'a.who': 'Сіз кімсіз?', 'a.student': 'Оқушы', 'a.studentSub': 'Есеп шығарамын, курстан өтемін', 'a.parent': 'Ата-ана', 'a.parentSub': 'Баламның нәтижесін көремін',
      'a.name': 'Аты-жөні', 'a.email': 'Электрондық пошта', 'a.pass': 'Құпиясөз (кемінде 6 таңба)', 'a.school': 'Мектеп', 'a.grade': 'Сынып', 'a.promo': 'Промокод (міндетті емес)',
      'a.go': 'Тіркелу', 'a.enter': 'Кіру', 'a.have': 'Аккаунт бар ма?', 'a.no': 'Аккаунт жоқ па?', 'a.demo': 'Демо-режим: аккаунттар тек осы браузерде сақталады. Нақты іске қосу үшін сервер қосылады (README).',
      'e.exists': 'Бұл пошта тіркелген. Кіріп көріңіз.', 'e.weak': 'Пошта мен кемінде 6 таңбалы құпиясөзді енгізіңіз.', 'e.bad_login': 'Пошта немесе құпиясөз қате.', 'e.network': 'Серверге қосылу мүмкін болмады.', 'e.error': 'Қате. Қайталап көріңіз.',
      'e.not_found': 'Мұндай промокод жоқ.', 'e.expired': 'Промокодтың мерзімі өткен.', 'e.used_up': 'Промокод таусылған.', 'e.already': 'Бұл промокод бұрын қолданылған.', 'e.role': 'Бұл әрекет тек ата-анаға.',
      'p.title': 'Тарифтер', 'p.sub': 'Барлық тақырыптар, сынақтар, карточкалар және рейтинг. Жазылым өздігінен ұзармайды.', 'p.active': 'Қолжетімділік тағы {n} күн', 'p.none': 'Қолжетімділік жоқ — тарифті таңдаңыз немесе промокод енгізіңіз.', 'p.forever': 'Қолжетімділік шексіз',
      'p.diag': 'Әзірге бастапқы диагностиканы тегін тапсыра аласыз.', 'p.diagGo': 'Диагностика', 'p.promo': 'Промокод', 'p.apply': 'Қолдану', 'p.pay': 'Төлеу',
      'p.kaspi': 'Kaspi арқылы төлеу', 'p.kaspiTo': '{amount} ₸ сомасын Kaspi-ге аударыңыз: {phone} ({name}). Аударма түсініктемесіне поштаңызды жазыңыз: {email}.', 'p.kaspiNo': 'Әкімші әзірге Kaspi нөмірін енгізбеген. Бізге хабарласыңыз.',
      'p.wait': 'Өтінім қабылданды (№{id}). Әкімші төлемді тексеріп, бір күн ішінде қолжетімділікті ашады.', 'p.mine': 'Менің өтінімдерім', 'p.st.pending': 'тексерілуде', 'p.st.approved': 'расталды', 'p.st.rejected': 'қабылданбады',
      'p.ok.free': 'Промокод қолданылды: тегін қолжетімділік ашылды.', 'p.ok.admin': 'Промокод қолданылды: сіз — әкімшісіз.', 'p.ok.discount': 'Жеңілдік {p}% — төлемде ескеріледі.',
      'acc.title': 'Аккаунт', 'acc.code': 'Ата-анаға арналған код', 'acc.codeNote': 'Ата-анаңыз өз аккаунтында осы кодты енгізсе, сіздің нәтижелеріңізді көре алады.', 'acc.out': 'Шығу', 'acc.status': 'Жазылым',
      'k.title': 'Балаларым', 'k.add': 'Баланың кодын енгізіңіз', 'k.addNote': 'Код баланың «Аккаунт» бетінде тұр.', 'k.link': 'Қосу', 'k.none': 'Әзірге бала қосылмаған.', 'k.noData': 'Бала әлі ештеңе шығармады немесе прогресс әлі сақталмады.',
      'k.active': 'Белсенді күн (7 күн)', 'k.hw': 'Үй жұмысы (7 күн)', 'k.mocks': 'Сынақтар (7 күн)', 'k.ready': 'Дайындық', 'k.fc': 'Болжам', 'k.target': 'өту межесі {v}', 'k.weak': 'Назар аударыңыз', 'k.lastMocks': 'Соңғы сынақтар', 'k.topics': 'Тақырыптар бойынша бағалар', 'k.upd': 'Жаңартылды: {d}',
      'r.title': 'Ай рейтингі', 'r.sub': 'Ұпай: үй жұмысы, сынақтар, қайталау, карточкалар, ойын. Ай соңында көшбасшыларға сыйлық.', 'r.mine': 'Менің ұпайым осы айда', 'r.prizes': 'Сыйлықтар', 'r.noPrizes': 'Сыйлықтар жақында жарияланады.', 'r.all': 'Барлығы', 'r.empty': 'Бұл айда әзірге ұпай жоқ.', 'r.prev': 'Өткен ай', 'r.cur': 'Осы ай',
      'r.how': 'Ұпай қалай жиналады', 'r.h.hw': 'Үй жұмысы — баға × 10 (100-ге дейін)', 'r.h.mock': 'Толық сынақ — 150-ге дейін', 'r.h.test': 'Шағын тест — 50-ге дейін', 'r.h.review': 'Қайталау — 30', 'r.h.cards': 'Карточкалар — 20-ға дейін', 'r.h.game': 'Ойын — 30-ға дейін', 'r.h.day': 'Күндік жоспар толық — +30', 'r.h.cap': 'Күніне ең көбі 500 ұпай.',
      'ad.title': 'Әкімші', 'ad.pay': 'Төлемдер', 'ad.users': 'Пайдаланушылар', 'ad.promo': 'Промокодтар', 'ad.set': 'Баптаулар', 'ad.approve': 'Растау', 'ad.reject': 'Бас тарту', 'ad.noPay': 'Тексерілетін төлем жоқ.',
      'ad.search': 'Іздеу (аты немесе пошта)', 'ad.grant': 'Күн қосу', 'ad.until': 'дейін', 'ad.code': 'Код', 'ad.kind': 'Түрі', 'ad.k.free': 'тегін қолжетімділік', 'ad.k.discount': 'жеңілдік', 'ad.k.admin': 'әкімші', 'ad.days': 'Күн (бос — шексіз)', 'ad.percent': 'Жеңілдік %', 'ad.max': 'Неше рет (бос — шексіз)', 'ad.note': 'Ескертпе', 'ad.create': 'Жасау', 'ad.used': 'қолданылды',
      'ad.kaspiPhone': 'Kaspi нөмірі', 'ad.kaspiName': 'Алушының аты', 'ad.prizesKk': 'Сыйлықтар (қазақша)', 'ad.prizesRu': 'Сыйлықтар (орысша)', 'ad.trial': 'Тегін күндер', 'ad.price': 'Баға, ₸', 'ad.save': 'Сақтау', 'ad.saved': 'Сақталды', 'ad.adminWarn': 'Әкімші промокодын тек сенімді адамдарға беріңіз және бір реттік етіп жасаңыз.',
      'c.title': 'Флеш-карточкалар', 'c.sub': 'Формулалар мен ережелер. «Білемін» — карточка сирек шығады, «Қайталау» — жиі.', 'c.cards': '{n} карточка', 'c.known': '{k}/{n} білемін', 'c.back': 'Карточкаларға', 'c.show': 'Жауапты көру үшін басыңыз', 'c.q': 'Сұрақ', 'c.a': 'Жауап',
      'c.know': 'Білемін', 'c.again': 'Қайталау', 'c.restart': 'Қайтадан', 'c.done': 'Колода аяқталды: {k} карточканы білесіз.', 'c.none': 'Карточкалар жақында қосылады.',
      'g.title': 'Жылдам есеп', 'g.sub': '60 секундта мүмкіндігінше көп мысал шығарыңыз. Enter — жауап беру. Күндегі бірінші ойын рейтингке ұпай береді.', 'g.start': 'Бастау', 'g.level': 'Деңгей', 'g.score': 'Нәтиже: {n}', 'g.best': 'Рекорд: {n}', 'g.again': 'Тағы ойнау', 'g.time': 'уақыт'
    },
    ru: {
      'nav.pricing': 'Тарифы', 'nav.account': 'Аккаунт', 'nav.leaders': 'Рейтинг', 'nav.cards': 'Карточки', 'nav.game': 'Быстрый счёт', 'nav.admin': 'Админ',
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
      'l.d.hw': '50 задач на тему: A → B → C → ★. После ошибки — похожая задача. Задачи не шаблонные: рисунки, таблицы, обратные задачи, «найди ошибку».',
      'l.d.mock': 'Форматы БИЛ (+4/−1), РФМШ (только число), НИШ (своё время у каждого раздела). Можно распечатать и потом внести ответы.',
      'l.d.cards': 'Флеш-карточки на формулы и правила: «Знаю / Повторить» — незнакомые показываются чаще.',
      'l.d.game': '«Быстрый счёт»: устный счёт на скорость за 60 секунд. Баллы идут в рейтинг.',
      'l.d.rank': 'Баллы за домашки, пробники, карточки и игры. Каждый месяц лидеры получают призы.',
      'l.d.parent': 'Родитель видит результаты ребёнка в своём аккаунте: активность, домашки, пробники, слабые темы.',
      'a.login': 'Вход', 'a.signup': 'Регистрация', 'a.who': 'Кто вы?', 'a.student': 'Ученик', 'a.studentSub': 'Решаю задачи и прохожу курс', 'a.parent': 'Родитель', 'a.parentSub': 'Смотрю результаты ребёнка',
      'a.name': 'Имя и фамилия', 'a.email': 'Электронная почта', 'a.pass': 'Пароль (не меньше 6 символов)', 'a.school': 'Школа', 'a.grade': 'Класс', 'a.promo': 'Промокод (необязательно)',
      'a.go': 'Зарегистрироваться', 'a.enter': 'Войти', 'a.have': 'Уже есть аккаунт?', 'a.no': 'Нет аккаунта?', 'a.demo': 'Демо-режим: аккаунты хранятся только в этом браузере. Для настоящего запуска подключается сервер (README).',
      'e.exists': 'Эта почта уже зарегистрирована. Попробуйте войти.', 'e.weak': 'Введите почту и пароль не короче 6 символов.', 'e.bad_login': 'Неверная почта или пароль.', 'e.network': 'Не удалось подключиться к серверу.', 'e.error': 'Ошибка. Попробуйте ещё раз.',
      'e.not_found': 'Такого промокода нет.', 'e.expired': 'Срок промокода истёк.', 'e.used_up': 'Промокод закончился.', 'e.already': 'Этот промокод уже использован.', 'e.role': 'Это действие только для родителя.',
      'p.title': 'Тарифы', 'p.sub': 'Все темы, пробники, карточки и рейтинг. Подписка не продлевается автоматически.', 'p.active': 'Доступ ещё {n} дн.', 'p.none': 'Доступа нет — выберите тариф или введите промокод.', 'p.forever': 'Доступ бессрочный',
      'p.diag': 'Пока можно бесплатно пройти входную диагностику.', 'p.diagGo': 'Диагностика', 'p.promo': 'Промокод', 'p.apply': 'Применить', 'p.pay': 'Оплатить',
      'p.kaspi': 'Оплата через Kaspi', 'p.kaspiTo': 'Переведите {amount} ₸ на Kaspi: {phone} ({name}). В комментарии к переводу укажите почту: {email}.', 'p.kaspiNo': 'Админ пока не указал номер Kaspi. Свяжитесь с нами.',
      'p.wait': 'Заявка принята (№{id}). Админ проверит оплату и откроет доступ в течение дня.', 'p.mine': 'Мои заявки', 'p.st.pending': 'на проверке', 'p.st.approved': 'подтверждена', 'p.st.rejected': 'отклонена',
      'p.ok.free': 'Промокод применён: бесплатный доступ открыт.', 'p.ok.admin': 'Промокод применён: вы — админ.', 'p.ok.discount': 'Скидка {p}% — учтём при оплате.',
      'acc.title': 'Аккаунт', 'acc.code': 'Код для родителей', 'acc.codeNote': 'Если родитель введёт этот код в своём аккаунте, он увидит ваши результаты.', 'acc.out': 'Выйти', 'acc.status': 'Подписка',
      'k.title': 'Мои дети', 'k.add': 'Введите код ребёнка', 'k.addNote': 'Код есть у ребёнка на странице «Аккаунт».', 'k.link': 'Добавить', 'k.none': 'Пока нет привязанных детей.', 'k.noData': 'Ребёнок ещё ничего не решал или прогресс ещё не сохранился.',
      'k.active': 'Активных дней (7 дн.)', 'k.hw': 'Домашек (7 дн.)', 'k.mocks': 'Пробников (7 дн.)', 'k.ready': 'Готовность', 'k.fc': 'Прогноз', 'k.target': 'ориентир {v}', 'k.weak': 'Обратите внимание', 'k.lastMocks': 'Последние пробники', 'k.topics': 'Оценки по темам', 'k.upd': 'Обновлено: {d}',
      'r.title': 'Рейтинг месяца', 'r.sub': 'Баллы: домашки, пробники, повторение, карточки, игра. В конце месяца лидеры получают призы.', 'r.mine': 'Мои баллы в этом месяце', 'r.prizes': 'Призы', 'r.noPrizes': 'Призы скоро объявим.', 'r.all': 'Все', 'r.empty': 'В этом месяце баллов пока нет.', 'r.prev': 'Прошлый месяц', 'r.cur': 'Этот месяц',
      'r.how': 'Как заработать баллы', 'r.h.hw': 'Домашка — оценка × 10 (до 100)', 'r.h.mock': 'Полный пробник — до 150', 'r.h.test': 'Мини-тест — до 50', 'r.h.review': 'Повторение — 30', 'r.h.cards': 'Карточки — до 20', 'r.h.game': 'Игра — до 30', 'r.h.day': 'Весь план дня — +30', 'r.h.cap': 'Не больше 500 баллов в день.',
      'ad.title': 'Админ', 'ad.pay': 'Оплаты', 'ad.users': 'Пользователи', 'ad.promo': 'Промокоды', 'ad.set': 'Настройки', 'ad.approve': 'Подтвердить', 'ad.reject': 'Отклонить', 'ad.noPay': 'Оплат на проверке нет.',
      'ad.search': 'Поиск (имя или почта)', 'ad.grant': 'Добавить дни', 'ad.until': 'до', 'ad.code': 'Код', 'ad.kind': 'Тип', 'ad.k.free': 'бесплатный доступ', 'ad.k.discount': 'скидка', 'ad.k.admin': 'админ', 'ad.days': 'Дней (пусто — бессрочно)', 'ad.percent': 'Скидка %', 'ad.max': 'Сколько раз (пусто — без лимита)', 'ad.note': 'Заметка', 'ad.create': 'Создать', 'ad.used': 'использован',
      'ad.kaspiPhone': 'Номер Kaspi', 'ad.kaspiName': 'Имя получателя', 'ad.prizesKk': 'Призы (казахский)', 'ad.prizesRu': 'Призы (русский)', 'ad.trial': 'Бесплатных дней', 'ad.price': 'Цена, ₸', 'ad.save': 'Сохранить', 'ad.saved': 'Сохранено', 'ad.adminWarn': 'Админ-промокод давайте только доверенным людям и делайте одноразовым.',
      'c.title': 'Флеш-карточки', 'c.sub': 'Формулы и правила. «Знаю» — карточка будет реже, «Повторить» — чаще.', 'c.cards': '{n} карточек', 'c.known': 'знаю {k}/{n}', 'c.back': 'К карточкам', 'c.show': 'Нажмите, чтобы увидеть ответ', 'c.q': 'Вопрос', 'c.a': 'Ответ',
      'c.know': 'Знаю', 'c.again': 'Повторить', 'c.restart': 'Заново', 'c.done': 'Колода пройдена: вы знаете {k} карточек.', 'c.none': 'Карточки скоро появятся.',
      'g.title': 'Быстрый счёт', 'g.sub': 'Решите как можно больше примеров за 60 секунд. Enter — ответить. Первая игра за день даёт баллы в рейтинг.', 'g.start': 'Начать', 'g.level': 'Уровень', 'g.score': 'Результат: {n}', 'g.best': 'Рекорд: {n}', 'g.again': 'Ещё раз', 'g.time': 'время'
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
      [[nTopics, 'l.f1'], [4, 'l.f2'], [50, 'l.f3'], [nCards || '—', 'l.f4']].map(function (f) { return '<div class="fact"><b>' + f[0] + '</b><span>' + tt(f[1]) + '</span></div>'; }).join('') + '</div></section>';
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
    h += '<label class="field"><span>' + tt('a.email') + '</span><input name="email" type="email" required autocomplete="email"></label>' +
      '<label class="field"><span>' + tt('a.pass') + '</span><input name="password" type="password" required minlength="6" autocomplete="' + (signup ? 'new-password' : 'current-password') + '"></label>';
    if (signup) h += '<label class="field"><span>' + tt('a.promo') + '</span><input name="promo" autocomplete="off" style="text-transform:uppercase"></label>';
    h += '<button class="btn pill dark wide" type="submit">' + (signup ? tt('a.go') : tt('a.enter')) + '</button>' +
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
    h += '<div class="row"><button class="btn pill" data-act="signOut">' + tt('acc.out') + '</button></div>';
    return h;
  }

  /* =================== КАБИНЕТ РОДИТЕЛЯ =================== */
  function kids() {
    var m = ui().mem;
    var h = '<section class="sec"><h1>' + tt('k.title') + '</h1></section><form class="card form row" data-form="linkChild"><label class="field grow"><span>' + tt('k.add') + '</span><input name="code" required autocomplete="off" style="text-transform:uppercase" placeholder="AB12CD"></label>' +
      '<button class="btn pill dark" type="submit">' + tt('k.link') + '</button></form><p class="small muted">' + tt('k.addNote') + '</p>' + (m.kidMsg ? '<div class="note">' + esc(m.kidMsg) + '</div>' : '');
    return h + later('kids', B.children, function (list) {
      list = list || [];
      if (!list.length) return '<p class="muted">' + tt('k.none') + '</p>';
      return list.map(kidCard).join('');
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
    var st = c.state || {};
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
  function admin(tab) {
    tab = tab || 'pay';
    var m = ui().mem;
    var h = '<section class="sec"><h1>' + tt('ad.title') + '</h1></section><div class="seg">' + ['pay', 'users', 'promo', 'set'].map(function (k) {
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
    if (tab === 'users') return h + '<form class="card form row" data-form="adSearch"><label class="field grow"><span>' + tt('ad.search') + '</span><input name="q" value="' + esc(m.adQ || '') + '"></label><button class="btn pill" type="submit">→</button></form>' +
      later('ad:users:' + (m.adQ || ''), function () { return B.admin.users(m.adQ || ''); }, function (list) {
        return '<div class="tbl-wrap"><table class="tbl"><tbody>' + (list || []).map(function (u) {
          var until = u.subUntil ? String(u.subUntil).slice(0, 10) : u.trialUntil ? 'trial ' + String(u.trialUntil).slice(0, 10) : '—';
          return '<tr><td><b>' + esc(u.name) + '</b><br><small class="muted">' + esc(u.email || '') + '</small></td><td>' + tt('role.' + u.role) + '</td><td>' + (Z.schools[u.school] ? Z.schools[u.school].name : '') + '</td><td class="small">' + until + '</td>' +
            '<td class="num"><form class="row" data-form="adGrant" data-id="' + esc(u.id) + '"><input name="days" type="number" min="1" value="30" style="width:70px"><button class="btn pill sm" type="submit">' + tt('ad.grant') + '</button></form></td></tr>';
        }).join('') + '</tbody></table></div>';
      });
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
  function cards() {
    var ds = decksFor(), lg = I.lang();
    var h = '<section class="sec"><h1>' + tt('c.title') + '</h1><p class="muted">' + tt('c.sub') + '</p></section>';
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
    var h = '<div class="dk-head"><a class="back" href="#/cards">' + ui().ic('back') + tt('c.back') + '</a><span class="muted">' + Math.min(st.i + 1, n) + ' / ' + n + '</span></div>' +
      '<div class="center"><h2>' + esc(ru ? d.ru : d.kk) + '</h2><p class="muted">' + esc(ru ? d.sub_ru : d.sub_kk) + '</p></div><div class="bar"><i style="width:' + (st.i / n * 100) + '%"></i></div>';
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

  /* =================== ИГРА «ЖЫЛДАМ ЕСЕП» =================== */
  function gameTask(r, lvl) {
    var a, b, op = r.pick(lvl === 1 ? ['+', '−'] : lvl === 2 ? ['+', '−', '·'] : ['+', '−', '·', ':']);
    if (op === '+') { a = r.int(lvl * 8, lvl * 60); b = r.int(lvl * 5, lvl * 45); return [a + ' + ' + b, a + b]; }
    if (op === '−') { a = r.int(lvl * 20, lvl * 90); b = r.int(lvl * 5, a); return [a + ' − ' + b, a - b]; }
    if (op === '·') { a = r.int(3, lvl === 2 ? 12 : 19); b = r.int(3, lvl === 2 ? 9 : 15); return [a + ' · ' + b, a * b]; }
    b = r.int(3, 15); a = b * r.int(3, 15); return [a + ' : ' + b, a / b];
  }
  function game() {
    var m = ui().mem, g = m.game, S = ui().S(); S.game = S.game || { best: 0 };
    var h = '<section class="sec"><h1>' + tt('g.title') + '</h1><p class="muted">' + tt('g.sub') + '</p></section>';
    if (!g || g.over) {
      h += (g && g.over ? '<div class="card center"><b class="big">' + tt('g.score', { n: g.score }) + '</b><p class="muted">' + tt('g.best', { n: S.game.best }) + '</p></div>' : '<p class="muted">' + tt('g.best', { n: S.game.best }) + '</p>') +
        '<div class="row center"><span class="muted">' + tt('g.level') + ':</span>' + [1, 2, 3].map(function (l) { return '<button class="btn pill' + ((m.gLvl || 2) === l ? ' dark' : '') + '" data-act="gLvl" data-l="' + l + '">' + ['A', 'B', 'C'][l - 1] + '</button>'; }).join('') + '</div>' +
        '<div class="row center"><button class="btn pill dark" data-act="gStart">' + (g ? tt('g.again') : tt('g.start')) + '</button></div>';
      return h;
    }
    return h + '<div class="card center game"><span class="timer" id="gTime">' + Math.max(0, Math.ceil((g.end - Date.now()) / 1000)) + '</span><b class="big">' + g.task[0] + ' = ?</b>' +
      '<form data-form="gAnswer" class="row center"><input name="a" id="gIn" inputmode="numeric" autocomplete="off" data-autofocus class="g-in"><button class="btn pill dark" type="submit">↵</button></form><p class="muted">' + tt('g.score', { n: g.score }) + '</p></div>';
  }
  function gameTick() {
    var g = ui().mem.game; if (!g || g.over) return;
    var left = Math.ceil((g.end - Date.now()) / 1000), el = document.getElementById('gTime');
    if (left <= 0) {
      g.over = true; clearInterval(g.timer);
      var S = ui().S(); S.game = S.game || { best: 0 }; S.game.best = Math.max(S.game.best, g.score); ui().save();
      ui().award('game', ui().today(), Math.min(30, g.score));
      ui().render(); return;
    }
    if (el) el.textContent = left;
  }

  /* =================== ДЕЙСТВИЯ =================== */
  function after(p, okMsg, key) {
    return p.then(function (r) { if (r && r.ok === false) throw r; ui().mem.adMsg = okMsg || ''; refresh(key); ui().render(); }).catch(function (e) { ui().ask(errText(e), 'OK', null, false); });
  }
  Z.viewActs = {
    ltab: function (el) { ui().mem.ltab = el.dataset.k; var y = window.scrollY; ui().render(); window.scrollTo(0, y); },
    scrollTour: function () { var t = document.getElementById('tour'); if (t) t.scrollIntoView({ behavior: 'smooth' }); },
    arole: function (el) { ui().mem.arole = el.dataset.r; ui().render(); },
    signOut: function () { B.signOut().then(function () { refresh(); ui().setUser(null); ui().go('#/'); }); },
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
    lbMonth: function (el) { ui().mem.lbMonth = el.dataset.m; ui().render(); },
    lbSchool: function (el) { ui().mem.lbSchool = el.dataset.s; ui().render(); },
    adPay: function (el) { after(B.admin.decidePayment(+el.dataset.id, el.dataset.ok === '1'), '✓', 'ad:pay'); },
    adDelPromo: function (el) { ui().ask(el.dataset.code + ' ?', '×', function () { after(B.admin.deletePromo(el.dataset.code), '', 'ad:promo'); }); },
    dkFlip: function () { var st = ui().mem.dk; st.flip = !st.flip; ui().render(); },
    dkNext: function () { var st = ui().mem.dk; st.i++; st.flip = false; ui().render(); },
    dkPrev: function () { var st = ui().mem.dk; if (st.i > 0) st.i--; st.flip = false; ui().render(); },
    dkRestart: function () { ui().mem.dk = null; ui().render(); },
    dkMark: function (el) {
      var st = ui().mem.dk, bx = boxes(st.id), k = st.order[st.i];
      if (el.dataset.ok === '1') { bx[k] = Math.min(4, (bx[k] || 0) + 1); st.know++; } else bx[k] = 0;
      st.i++; st.flip = false; ui().save();
      if (st.i >= st.order.length) ui().award('cards', st.id + ':' + ui().today(), Math.min(20, st.know));
      ui().render();
    },
    gLvl: function (el) { ui().mem.gLvl = +el.dataset.l; ui().render(); },
    gStart: function () {
      var m = ui().mem, r = U.rng(U.newSeed());
      if (m.game && m.game.timer) clearInterval(m.game.timer);
      m.game = { r: r, lvl: m.gLvl || 2, score: 0, end: Date.now() + 60000, task: null, over: false };
      m.game.task = gameTask(r, m.game.lvl);
      m.game.timer = setInterval(gameTick, 250);
      ui().render();
    }
  };
  Z.viewForms = {
    signup: function (d) {
      var m = ui().mem, f = { role: d.get('role') || m.arole || 'student', name: String(d.get('name') || '').trim(), email: d.get('email'), password: d.get('password'), school: d.get('school'), grade: d.get('grade') ? +d.get('grade') : null };
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
      var m = ui().mem;
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
    adGrant: function (d, f) { after(B.admin.grant(f.dataset.id, +d.get('days') || 30), '✓', 'ad:users:' + (ui().mem.adQ || '')); },
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
      if (+String(d.get('a')).replace(',', '.').replace('−', '-') === g.task[1]) g.score++;
      g.task = gameTask(g.r, g.lvl);
      ui().render();
    }
  };
  Z.views = { refresh: refresh, landing: landing, auth: auth, pricing: pricing, account: account, kids: kids, leaders: leaders, admin: admin, cards: cards, deck: deck, game: game };
})(typeof window !== 'undefined' ? window : globalThis);
