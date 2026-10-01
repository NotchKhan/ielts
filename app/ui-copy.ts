import type { CourseLanguage } from './course-copy';

const ru = {
  loading: 'Загрузка курса…', partner: 'Твой помощник по IELTS',
  dashboard: 'Главная', progress: 'Прогресс', materials: 'Материалы', calendar: 'Календарь', notes: 'Заметки', settings: 'Настройки', practiceTests: 'Тесты',
  closeMenu: 'Закрыть меню', openMenu: 'Открыть меню', mainNav: 'Главное меню', courseProgress: 'Прогресс курса', localProfile: 'Профиль на этом устройстве', student: 'Ученик', overall: 'Общий балл', studyStreak: 'Дни подряд',
  lessonsCount: '{done} из {total} уроков', lessonsShort: '{count} уроков', completedPercent: 'Пройдено {value}% курса',
  searchPlaceholder: 'Найти урок или формат…', searchLabel: 'Поиск по курсу', clearSearch: 'Очистить поиск', notifications: 'Уведомления', changeTheme: 'Сменить тему',
  courseCentre: 'Помощник по курсу', nextLesson: 'Следующий урок', allLessonsDone: 'Все уроки пройдены.', localDataInfo: 'Прогресс и заметки хранятся только на этом устройстве.',
  dashboardHello: 'Выбери урок и сделай один понятный шаг.', continueLesson: 'Продолжить урок', yourProgress: 'Твой прогресс', more: 'Открыть график', bandScore: 'Балл IELTS', setUp: 'Настроить',
  howToLearn: 'Как учиться на сайте', howToLearnText: 'Каждый раз повторяй эти четыре шага.', learnStep1: 'Выбери один раздел и один урок.', learnStep2: 'Прочитай короткий план урока.', learnStep3: 'Открой назначенный тест и сделай его сам.', learnStep4: 'Разбери ошибки, запиши один вывод и нажми «Готово».',
  recentPractice: 'Недавние уроки', allSessions: 'Все занятия', recommended: 'Что делать дальше', allMaterials: 'Все материалы', quickActions: 'Быстрые кнопки',
  courseFooter: '{done} из {total} уроков', chartAria: 'График прогресса', week: 'Нед.', rangeWeek: 'Неделя', rangeMonth: 'Месяц', rangeAll: 'Всё время', chartEmpty: 'Заверши первый урок — здесь появится линия прогресса.',
  addFourScores: 'Добавь 4 результата', currentScore: 'Текущий результат', addTestScores: 'Добавь результаты тестов', bandHelp: 'Мы посчитаем средний балл после четырёх результатов.',
  day: 'день', days: 'дней', streakContinue: 'Сделай урок сегодня, чтобы продолжить серию.', streakDoneToday: 'Сегодняшний урок готов. Продолжи завтра.', streakStart: 'Сделай первый урок, чтобы начать серию.',
  emptyHistory: 'Здесь пока пусто', emptyHistoryText: 'Заверши первый урок — он появится здесь.', completedLesson: 'урок пройден', repeat: 'Повторить',
  courseComplete: 'Курс пройден', courseCompleteText: 'Теперь можно повторить любой урок.', stepsTips: '{count} шага · план и ошибки', minutes: '{count} мин', nextTest: 'Следующий тест', bookmarks: 'Закладки',
  progressPageText: 'Здесь видны пройденные уроки и твои результаты.', course: 'Курс', streakDays: 'дней подряд', needFourScores: 'нужны 4 результата', averageScore: 'средний балл', savedHere: 'сохранено здесь',
  progressByModule: 'Прогресс по модулям', sectionProgress: 'Прогресс по разделам', activityHistory: 'История занятий', noCompleted: 'Нет пройденных уроков', noCompletedText: 'История появится после первой кнопки «Готово».',
  materialsText: 'Твои закладки, все уроки и полезные ссылки.', bookmarkCount: 'Закладки · {count}', addBookmarkHelp: 'Открой урок и нажми «Сохранить».', allModules: 'Все разделы', practiceLessons: '{count} уроков с практикой', sources: 'Ссылки IELTS Liz', noBookmarks: 'Закладок пока нет', openLesson: 'Открыть урок',
  calendarText: 'В календаре видны дни, когда ты закончил урок.', studyCalendar: 'Календарь занятий', totalLessons: 'всего уроков', studyDays: 'дней подряд', sixWeekPlan: 'План на шесть недель', sixWeekText: 'Иди по шагам в удобном темпе.',
  notesText: 'Твои записи хранятся только в этом браузере.', openEdit: 'Открыть и изменить', noNotes: 'Заметок пока нет', noNotesText: 'Открой урок и запиши одну полезную мысль.',
  settingsText: 'Здесь можно изменить имя, язык, тему и результаты.', profile: 'Профиль', displayName: 'Имя на сайте', notSent: 'Имя никуда не отправляется.', saveName: 'Сохранить имя', language: 'Язык', languageHelp: 'Выбери язык сайта.',
  theme: 'Тема', light: 'Светлая', dark: 'Тёмная', scoreSettings: 'Результаты тестов', scoreHelp: 'Введи четыре настоящих результата. Мы посчитаем средний балл.', noScore: 'Нет результата',
  resetData: 'Удалить данные с этого устройства', resetWarning: 'Это действие нельзя отменить.', resetDetail: 'Будут удалены прогресс, заметки, закладки и оценки.', cancel: 'Отмена', yesDelete: 'Да, удалить всё', reset: 'Удалить данные',
  repeatModule: 'Повторить раздел', continue: 'Продолжить', passed: 'Пройдено', steps: '{count} шага', lessonOf: 'Урок {current} из {total}', saved: 'Сохранено', save: 'Сохранить',
  stepPlan: 'Что делать по шагам', mainTrap: 'Не ошибись здесь', check: 'Как проверить себя', myNotes: 'Мои заметки', autoSaved: 'Сохраняется само', notePlaceholder: 'Запиши одну ошибку, вывод или пример…',
  lessonDone: 'Урок завершён', practiceDone: 'Ты сделал задание и разобрал ошибки?', addedToProgress: 'Урок добавлен в прогресс и календарь.', finishHint: 'Отметь после самостоятельной попытки.', ready: 'Готово ✓', markReady: 'Отметить как готово',
  module: 'Раздел', format: 'Формат', size: 'Объём', assignedTest: 'Тест для этого урока', openEngnovate: 'Открыть тест на Engnovate', previous: 'Назад', next: 'Дальше',
  searchResults: 'Результаты поиска: «{query}»', lessonsFound: 'Найдено уроков: {count}', nothingFound: 'Ничего не найдено', searchHint: 'Попробуй: map, overview, headings или Part 3.',
  previousMonth: 'Предыдущий месяц', nextMonth: 'Следующий месяц',
} as const;

export type UiKey = keyof typeof ru;

const kk: Record<UiKey, string> = {
  loading: 'Курс жүктелуде…', partner: 'IELTS бойынша көмекшің',
  dashboard: 'Басты бет', progress: 'Үлгерім', materials: 'Материалдар', calendar: 'Күнтізбе', notes: 'Жазбалар', settings: 'Баптаулар', practiceTests: 'Тесттер',
  closeMenu: 'Мәзірді жабу', openMenu: 'Мәзірді ашу', mainNav: 'Негізгі мәзір', courseProgress: 'Курс үлгерімі', localProfile: 'Осы құрылғыдағы профиль', student: 'Оқушы', overall: 'Жалпы балл', studyStreak: 'Күндер қатары',
  lessonsCount: '{done} / {total} сабақ', lessonsShort: '{count} сабақ', completedPercent: 'Курстың {value}% аяқталды',
  searchPlaceholder: 'Сабақ немесе формат іздеу…', searchLabel: 'Курстан іздеу', clearSearch: 'Іздеуді тазарту', notifications: 'Хабарламалар', changeTheme: 'Түсті ауыстыру',
  courseCentre: 'Курс көмекшісі', nextLesson: 'Келесі сабақ', allLessonsDone: 'Барлық сабақ аяқталды.', localDataInfo: 'Үлгерім мен жазбалар осы құрылғыда ғана сақталады.',
  dashboardHello: 'Бір сабақты таңдап, бір түсінікті қадам жаса.', continueLesson: 'Сабақты жалғастыру', yourProgress: 'Сенің үлгерімің', more: 'Графикті ашу', bandScore: 'IELTS балы', setUp: 'Баптау',
  howToLearn: 'Сайтта қалай оқу керек', howToLearnText: 'Әр сабақта осы төрт қадамды қайтала.', learnStep1: 'Бір бөлім мен бір сабақты таңда.', learnStep2: 'Сабақтың қысқа жоспарын оқы.', learnStep3: 'Берілген тестті ашып, өзің орында.', learnStep4: 'Қатені талдап, бір қорытынды жаз да, «Дайын» батырмасын бас.',
  recentPractice: 'Соңғы сабақтар', allSessions: 'Барлық сабақ', recommended: 'Келесі қадам', allMaterials: 'Барлық материал', quickActions: 'Жылдам батырмалар',
  courseFooter: '{done} / {total} сабақ', chartAria: 'Үлгерім графигі', week: 'Апта', rangeWeek: 'Апта', rangeMonth: 'Ай', rangeAll: 'Барлық уақыт', chartEmpty: 'Алғашқы сабақты аяқта — үлгерім сызығы осында шығады.',
  addFourScores: '4 нәтиже қос', currentScore: 'Қазіргі нәтиже', addTestScores: 'Тест нәтижелерін қос', bandHelp: 'Төрт нәтижеден кейін орташа балды есептейміз.',
  day: 'күн', days: 'күн', streakContinue: 'Күндер қатарын жалғастыру үшін бүгін сабақ жаса.', streakDoneToday: 'Бүгінгі сабақ дайын. Ертең жалғастыр.', streakStart: 'Күндер қатарын бастау үшін алғашқы сабақты жаса.',
  emptyHistory: 'Әзірге бос', emptyHistoryText: 'Бірінші сабақты аяқта — ол осында шығады.', completedLesson: 'сабақ аяқталды', repeat: 'Қайталау',
  courseComplete: 'Курс аяқталды', courseCompleteText: 'Енді кез келген сабақты қайталай аласың.', stepsTips: '{count} қадам · жоспар мен қате', minutes: '{count} мин', nextTest: 'Келесі тест', bookmarks: 'Белгілер',
  progressPageText: 'Мұнда аяқталған сабақтар мен нәтижелерің көрінеді.', course: 'Курс', streakDays: 'күн қатарынан', needFourScores: '4 нәтиже керек', averageScore: 'орташа балл', savedHere: 'осында сақталды',
  progressByModule: 'Бөлімдер бойынша үлгерім', sectionProgress: 'Әр бөлімнің үлгерімі', activityHistory: 'Сабақ тарихы', noCompleted: 'Аяқталған сабақ жоқ', noCompletedText: 'Тарих бірінші «Дайын» белгісінен кейін шығады.',
  materialsText: 'Белгілерің, барлық сабақ және пайдалы сілтеме.', bookmarkCount: 'Белгілер · {count}', addBookmarkHelp: 'Сабақты ашып, «Сақтау» батырмасын бас.', allModules: 'Барлық бөлім', practiceLessons: '{count} жаттығу сабағы', sources: 'IELTS Liz сілтемелері', noBookmarks: 'Белгі жоқ', openLesson: 'Сабақты ашу',
  calendarText: 'Күнтізбе аяқталған сабақ күндерін көрсетеді.', studyCalendar: 'Сабақ күнтізбесі', totalLessons: 'барлық сабақ', studyDays: 'күн қатарынан', sixWeekPlan: 'Алты апталық жоспар', sixWeekText: 'Қадамдарды өз ырғағыңмен орында.',
  notesText: 'Жазбаларың осы браузерде ғана сақталады.', openEdit: 'Ашу және өзгерту', noNotes: 'Жазба жоқ', noNotesText: 'Сабақты ашып, бір пайдалы ой жаз.',
  settingsText: 'Мұнда есім, тіл, түс және нәтижелерді өзгерте аласың.', profile: 'Профиль', displayName: 'Сайттағы есім', notSent: 'Есім ешқайда жіберілмейді.', saveName: 'Есімді сақтау', language: 'Тіл', languageHelp: 'Сайт тілін таңда.',
  theme: 'Түс', light: 'Ашық', dark: 'Қараңғы', scoreSettings: 'Тест нәтижелері', scoreHelp: 'Төрт шын нәтижеңді енгіз. Орташа балды есептейміз.', noScore: 'Нәтиже жоқ',
  resetData: 'Осы құрылғыдағы деректі өшіру', resetWarning: 'Бұл әрекетті қайтару мүмкін емес.', resetDetail: 'Үлгерім, жазба, белгілер және бағалар өшеді.', cancel: 'Бас тарту', yesDelete: 'Иә, бәрін өшіру', reset: 'Деректі өшіру',
  repeatModule: 'Бөлімді қайталау', continue: 'Жалғастыру', passed: 'Аяқталды', steps: '{count} қадам', lessonOf: '{current} / {total} сабақ', saved: 'Сақталды', save: 'Сақтау',
  stepPlan: 'Қадамдар', mainTrap: 'Мұнда қателеспе', check: 'Өзіңді тексер', myNotes: 'Менің жазбам', autoSaved: 'Өзі сақталады', notePlaceholder: 'Бір қате, қорытынды немесе мысал жаз…',
  lessonDone: 'Сабақ аяқталды', practiceDone: 'Тапсырманы өзің орындап, қатені талдадың ба?', addedToProgress: 'Сабақ үлгерім мен күнтізбеге қосылды.', finishHint: 'Өз бетіңше орындағаннан кейін белгіле.', ready: 'Дайын ✓', markReady: 'Дайын деп белгіле',
  module: 'Бөлім', format: 'Формат', size: 'Көлем', assignedTest: 'Осы сабақтың тесті', openEngnovate: 'Engnovate тестін ашу', previous: 'Артқа', next: 'Алға',
  searchResults: 'Іздеу нәтижесі: «{query}»', lessonsFound: 'Табылған сабақ: {count}', nothingFound: 'Ештеңе табылмады', searchHint: 'Мынаны байқап көр: map, overview, headings немесе Part 3.',
  previousMonth: 'Алдыңғы ай', nextMonth: 'Келесі ай',
};

const en: Record<UiKey, string> = {
  loading: 'Loading the course…', partner: 'Your IELTS helper',
  dashboard: 'Home', progress: 'Progress', materials: 'Materials', calendar: 'Calendar', notes: 'Notes', settings: 'Settings', practiceTests: 'Tests',
  closeMenu: 'Close menu', openMenu: 'Open menu', mainNav: 'Main menu', courseProgress: 'Course progress', localProfile: 'Profile on this device', student: 'Student', overall: 'Overall', studyStreak: 'Study streak',
  lessonsCount: '{done} of {total} lessons', lessonsShort: '{count} lessons', completedPercent: '{value}% of the course done',
  searchPlaceholder: 'Find a lesson or task…', searchLabel: 'Search the course', clearSearch: 'Clear search', notifications: 'Notifications', changeTheme: 'Change theme',
  courseCentre: 'Course helper', nextLesson: 'Next lesson', allLessonsDone: 'All lessons are done.', localDataInfo: 'Progress and notes stay only on this device.',
  dashboardHello: 'Choose one lesson and take one clear step.', continueLesson: 'Continue lesson', yourProgress: 'Your progress', more: 'Open chart', bandScore: 'IELTS band', setUp: 'Set up',
  howToLearn: 'How to study here', howToLearnText: 'Use these four steps every time.', learnStep1: 'Choose one section and one lesson.', learnStep2: 'Read the short lesson plan.', learnStep3: 'Open the assigned test and do it by yourself.', learnStep4: 'Check mistakes, write one lesson, and press “Done”.',
  recentPractice: 'Recent lessons', allSessions: 'All activity', recommended: 'What to do next', allMaterials: 'All materials', quickActions: 'Quick actions',
  courseFooter: '{done} of {total} lessons', chartAria: 'Progress chart', week: 'Week', rangeWeek: 'Week', rangeMonth: 'Month', rangeAll: 'All time', chartEmpty: 'Finish your first lesson and the progress line will appear here.',
  addFourScores: 'Add 4 scores', currentScore: 'Current score', addTestScores: 'Add test scores', bandHelp: 'We will find the average after all four scores are added.',
  day: 'day', days: 'days', streakContinue: 'Finish a lesson today to keep your streak.', streakDoneToday: 'Today is done. Come back tomorrow.', streakStart: 'Finish your first lesson to start a streak.',
  emptyHistory: 'Nothing here yet', emptyHistoryText: 'Finish your first lesson and it will appear here.', completedLesson: 'lesson done', repeat: 'Repeat',
  courseComplete: 'Course complete', courseCompleteText: 'You can now repeat any lesson.', stepsTips: '{count} steps · plan and mistakes', minutes: '{count} min', nextTest: 'Next test', bookmarks: 'Bookmarks',
  progressPageText: 'See your finished lessons and scores here.', course: 'Course', streakDays: 'days in a row', needFourScores: '4 scores needed', averageScore: 'average score', savedHere: 'saved here',
  progressByModule: 'Progress by module', sectionProgress: 'Progress by section', activityHistory: 'Study history', noCompleted: 'No finished lessons', noCompletedText: 'Your history starts after the first “Done” mark.',
  materialsText: 'Your bookmarks, every lesson, and useful links.', bookmarkCount: 'Bookmarks · {count}', addBookmarkHelp: 'Open a lesson and press “Save”.', allModules: 'All sections', practiceLessons: '{count} practice lessons', sources: 'IELTS Liz links', noBookmarks: 'No bookmarks yet', openLesson: 'Open lesson',
  calendarText: 'The calendar shows days when you finished a lesson.', studyCalendar: 'Study calendar', totalLessons: 'total lessons', studyDays: 'days in a row', sixWeekPlan: 'Six-week plan', sixWeekText: 'Follow the steps at your own pace.',
  notesText: 'Your notes stay only in this browser.', openEdit: 'Open and edit', noNotes: 'No notes yet', noNotesText: 'Open a lesson and write one useful idea.',
  settingsText: 'Change your name, language, theme, and scores here.', profile: 'Profile', displayName: 'Name on the site', notSent: 'Your name is not sent anywhere.', saveName: 'Save name', language: 'Language', languageHelp: 'Choose the site language.',
  theme: 'Theme', light: 'Light', dark: 'Dark', scoreSettings: 'Test scores', scoreHelp: 'Add four real scores. We will find the average.', noScore: 'No score',
  resetData: 'Delete data on this device', resetWarning: 'You cannot undo this.', resetDetail: 'Progress, notes, bookmarks, and scores will be deleted.', cancel: 'Cancel', yesDelete: 'Yes, delete all', reset: 'Delete data',
  repeatModule: 'Repeat section', continue: 'Continue', passed: 'Done', steps: '{count} steps', lessonOf: 'Lesson {current} of {total}', saved: 'Saved', save: 'Save',
  stepPlan: 'Steps to follow', mainTrap: 'Do not make this mistake', check: 'Check your work', myNotes: 'My notes', autoSaved: 'Saved by itself', notePlaceholder: 'Write one mistake, lesson, or example…',
  lessonDone: 'Lesson complete', practiceDone: 'Did you do the task and check your mistakes?', addedToProgress: 'The lesson was added to progress and the calendar.', finishHint: 'Mark it after your own attempt.', ready: 'Done ✓', markReady: 'Mark as done',
  module: 'Section', format: 'Task type', size: 'Size', assignedTest: 'Test for this lesson', openEngnovate: 'Open test on Engnovate', previous: 'Back', next: 'Next',
  searchResults: 'Search results: “{query}”', lessonsFound: 'Lessons found: {count}', nothingFound: 'Nothing found', searchHint: 'Try: map, overview, headings, or Part 3.',
  previousMonth: 'Previous month', nextMonth: 'Next month',
};

const dictionaries: Record<CourseLanguage, Record<UiKey, string>> = { ru, kk, en };

export function uiText(language: CourseLanguage, key: UiKey, values: Record<string, string | number> = {}) {
  return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), dictionaries[language][key]);
}

export const languageOptions: { id: CourseLanguage; short: string; label: string }[] = [
  { id: 'ru', short: 'RU', label: 'Русский' },
  { id: 'kk', short: 'ҚАЗ', label: 'Қазақша' },
  { id: 'en', short: 'EN', label: 'English' },
];

const plans = {
  ru: [
    { phase: 'Недели 1–2', title: 'Пойми свои ошибки', tasks: ['Writing: два коротких абзаца в неделю.', 'Listening: три задания по слабым форматам.', 'Reading: один полный тест в неделю.', 'Speaking: две записи с повторным ответом.'] },
    { phase: 'Недели 3–4', title: 'Работай с таймером', tasks: ['Один Task 1 и один Task 2 в неделю.', 'Два полных Listening и разбор ошибок.', 'Один Reading за 60 минут.', 'Два занятия Speaking Part 2 + Part 3.'] },
    { phase: 'Недели 5–6', title: 'Повтори режим экзамена', tasks: ['Один полный пробный день в неделю.', 'Исправляй две главные ошибки.', 'Переписывай только слабый абзац.', 'В последние дни повторяй свои списки проверки.'] },
  ],
  kk: [
    { phase: '1–2 апта', title: 'Қатеңді түсін', tasks: ['Writing: аптасына екі қысқа абзац.', 'Listening: әлсіз форматтан үш тапсырма.', 'Reading: аптасына бір толық тест.', 'Speaking: екі жауапты жазып, қайта айт.'] },
    { phase: '3–4 апта', title: 'Уақытпен жұмыс істе', tasks: ['Аптасына бір Task 1 және бір Task 2.', 'Екі толық Listening және қатені талдау.', 'Бір Reading тестін 60 минутта орында.', 'Екі рет Speaking Part 2 + Part 3 жаса.'] },
    { phase: '5–6 апта', title: 'Емтихан тәртібін қайтала', tasks: ['Аптасына бір толық сынақ күні.', 'Екі басты қатені түзет.', 'Тек әлсіз абзацты қайта жаз.', 'Соңғы күндері тексеру тізіміңді қайтала.'] },
  ],
  en: [
    { phase: 'Weeks 1–2', title: 'Understand your mistakes', tasks: ['Writing: two short paragraphs each week.', 'Listening: three tasks for weak question types.', 'Reading: one full test each week.', 'Speaking: record and repeat two answers.'] },
    { phase: 'Weeks 3–4', title: 'Work with a timer', tasks: ['One Task 1 and one Task 2 each week.', 'Two full Listening tests with error review.', 'One Reading test in 60 minutes.', 'Two Speaking Part 2 + Part 3 sessions.'] },
    { phase: 'Weeks 5–6', title: 'Practise exam mode', tasks: ['One full practice day each week.', 'Fix your two biggest problems.', 'Rewrite only the weak paragraph.', 'Review your checklists in the final days.'] },
  ],
} satisfies Record<CourseLanguage, { phase: string; title: string; tasks: string[] }[]>;

const modes = {
  ru: [
    { time: '30 минут', name: 'Коротко', plan: '10 мин ошибки · 15 мин задание · 5 мин проверка' },
    { time: '60 минут', name: 'Обычно', plan: '10 мин повтор · 30 мин работа · 15 мин разбор · 5 мин запись вывода' },
    { time: '90 минут', name: 'Глубоко', plan: '40 мин работа · 10 мин отдых · 30 мин разбор · 10 мин исправление' },
  ],
  kk: [
    { time: '30 минут', name: 'Қысқа', plan: '10 мин қате · 15 мин тапсырма · 5 мин тексеру' },
    { time: '60 минут', name: 'Қалыпты', plan: '10 мин қайталау · 30 мин жұмыс · 15 мин талдау · 5 мин қорытынды' },
    { time: '90 минут', name: 'Терең', plan: '40 мин жұмыс · 10 мин демалыс · 30 мин талдау · 10 мин түзету' },
  ],
  en: [
    { time: '30 minutes', name: 'Short', plan: '10 min errors · 15 min task · 5 min check' },
    { time: '60 minutes', name: 'Normal', plan: '10 min review · 30 min work · 15 min check · 5 min note' },
    { time: '90 minutes', name: 'Deep', plan: '40 min work · 10 min break · 30 min check · 10 min fix' },
  ],
} satisfies Record<CourseLanguage, { time: string; name: string; plan: string }[]>;

export const getStudyPlan = (language: CourseLanguage) => plans[language];
export const getSessionModes = (language: CourseLanguage) => modes[language];
