'use client';

import { createContext, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Bell, BookOpen, Bookmark,
  CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Circle,
  ClipboardList, Clock3, ExternalLink, FileText, Flame, FolderOpen, Grid2X2,
  Headphones, Menu, Mic2, Moon, NotebookText, PenLine, Search, Settings,
  Sun, Target, X,
} from 'lucide-react';
import { guideSections, sourceLinks, type GuideCard, type GuideSection, type GuideSectionId } from './guide-data';
import { getCalendarWeekdays, getCardText, getDateLocale, getMonthLabel, getSectionText, type CourseLanguage } from './course-copy';
import { getSessionModes, getStudyPlan, languageOptions, uiText, type UiKey } from './ui-copy';
import styles from './platform.module.css';

type AppView = 'dashboard' | GuideSectionId | 'progress' | 'materials' | 'calendar' | 'notes' | 'settings';
type ProgressRange = 'dashboard' | 'week' | 'month' | 'all';
type Scores = Partial<Record<GuideSectionId, number>>;
type AppState = {
  completed: Record<string, string>;
  lastLessonId?: string;
  notes: Record<string, string>;
  bookmarks: string[];
  scores: Scores;
  theme: 'light' | 'dark';
  profileName: string;
  language: CourseLanguage;
};

const STORAGE_KEY = 'ielts-course-platform-v1';
const COOKIE_KEY = 'ielts_course_platform_v1';
const DEFAULT_STATE: AppState = { completed: {}, notes: {}, bookmarks: [], scores: {}, theme: 'light', profileName: 'Student', language: 'ru' };
const sectionIcons = { listening: Headphones, reading: BookOpen, writing: PenLine, speaking: Mic2 };
const sectionColors: Record<GuideSectionId, string> = { listening: '#174b78', reading: '#a65f45', writing: '#c77e61', speaking: '#daaa91' };
const lessons = guideSections.flatMap((section) => section.cards.map((card) => ({ section, card })));
const LanguageContext = createContext<CourseLanguage>('ru');

function useCourseText() {
  const language = useContext(LanguageContext);
  return {
    language,
    t: (key: UiKey, values?: Record<string, string | number>) => uiText(language, key, values),
  };
}
const testNumbers = [1, 2, 3, 4];
const practiceOrder = {
  listening: [21, 20].flatMap((book) => testNumbers.map((test) => ({ book, test }))),
  reading: [21, 20, 19].flatMap((book) => testNumbers.map((test) => ({ book, test }))),
  writing: [21, 20, 19, 18].flatMap((book) => testNumbers.map((test) => ({ book, test }))),
  speaking: [20, 19, 18].flatMap((book) => testNumbers.map((test) => ({ book, test }))),
} satisfies Record<GuideSectionId, { book: number; test: number }[]>;

function getPracticeAssignment(lesson: { section: GuideSection; card: GuideCard }) {
  const lessonIndex = Math.max(0, lesson.section.cards.findIndex((card) => card.id === lesson.card.id));
  const order = practiceOrder[lesson.section.id];
  const assigned = order[lessonIndex % order.length];
  const title = `Cambridge IELTS ${assigned.book} Academic ${lesson.section.title} Test ${assigned.test}`;
  return {
    title,
    shortTitle: `Cambridge ${assigned.book} · Test ${assigned.test}`,
    url: `https://engnovate.com/ielts-${lesson.section.id}-tests/cambridge-ielts-${assigned.book}-academic-${lesson.section.id}-test-${assigned.test}/`,
  };
}

const getPercent = (done: number, total: number) => total ? Math.round((done / total) * 100) : 0;
const findLesson = (id?: string) => id ? lessons.find((lesson) => lesson.card.id === id) : undefined;

function normalizeState(value?: Partial<AppState>): AppState {
  return {
    ...DEFAULT_STATE,
    ...value,
    completed: value?.completed && typeof value.completed === 'object' ? value.completed : {},
    notes: value?.notes && typeof value.notes === 'object' ? value.notes : {},
    bookmarks: Array.isArray(value?.bookmarks) ? value.bookmarks : [],
    scores: value?.scores && typeof value.scores === 'object' ? value.scores : {},
    language: value?.language === 'kk' || value?.language === 'en' ? value.language : 'ru',
  };
}

function saveState(state: AppState) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Cookie fallback below. */ }
  try {
    const compact = { completed: state.completed, lastLessonId: state.lastLessonId, scores: state.scores, theme: state.theme, profileName: state.profileName, language: state.language };
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(compact))}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch { /* The platform remains usable in memory. */ }
}

function readState(): AppState {
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(STORAGE_KEY); } catch { /* Cookie fallback below. */ }
  if (!raw) {
    try {
      const cookie = document.cookie.split('; ').find((item) => item.startsWith(`${COOKIE_KEY}=`));
      if (cookie) raw = decodeURIComponent(cookie.slice(COOKIE_KEY.length + 1));
    } catch { /* Start with defaults. */ }
  }
  if (!raw) return DEFAULT_STATE;
  try { return normalizeState(JSON.parse(raw) as Partial<AppState>); } catch { return DEFAULT_STATE; }
}

function localDateKey(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function startOfLocalDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getActiveStudyDays(completed: Record<string, string>) {
  return new Set(Object.values(completed).map(localDateKey).filter(Boolean));
}

function getStreakDetails(completed: Record<string, string>, reference = new Date()) {
  const active = getActiveStudyDays(completed);
  const today = startOfLocalDay(reference);
  const completedToday = active.has(localDateKey(today));
  const cursor = new Date(today);
  if (!completedToday) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (active.has(localDateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return { streak, completedToday, active, today };
}

function getStreak(completed: Record<string, string>) { return getStreakDetails(completed).streak; }

function startOfWeek(value: Date) {
  const date = startOfLocalDay(value);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

function shortDate(value: Date) {
  return `${String(value.getDate()).padStart(2, '0')}.${String(value.getMonth() + 1).padStart(2, '0')}`;
}

function endOfLocalDay(value: Date) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function addDays(value: Date, days: number) {
  const date = startOfLocalDay(value);
  date.setDate(date.getDate() + days);
  return date;
}

function getChartDates(range: ProgressRange, completed: Record<string, string>, now = new Date()) {
  const today = startOfLocalDay(now);
  let dates: Date[];
  if (range === 'dashboard') {
    dates = [-14, -10, -7, -3, 0].map((offset) => addDays(today, offset));
  } else if (range === 'week') {
    dates = Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
  } else if (range === 'month') {
    dates = [-30, -25, -20, -15, -10, -5, 0].map((offset) => addDays(today, offset));
  } else {
    const storedDates = Object.values(completed).map(stateDate).filter((date): date is Date => Boolean(date && !Number.isNaN(date.getTime()) && date <= now)).sort((a,b)=>a.getTime()-b.getTime());
    if (!storedDates.length) {
      dates = [-30, -25, -20, -15, -10, -5, 0].map((offset) => addDays(today, offset));
    } else {
      const start = addDays(storedDates[0], -1);
      const span = Math.max(1, Math.round((today.getTime() - start.getTime()) / 86400000));
      const pointCount = Math.min(7, span + 1);
      dates = Array.from({ length: pointCount }, (_, index) => addDays(start, Math.round((span * index) / Math.max(1, pointCount - 1))));
    }
  }
  return dates.map((date, index) => ({ date, end: index === dates.length - 1 ? now : endOfLocalDay(date), label: shortDate(date) }));
}

function formatStreakCount(value: number, language: CourseLanguage) {
  if (language === 'kk') return `${value} күн`;
  if (language === 'en') return `${value} ${value === 1 ? 'day' : 'days'}`;
  const lastTwo = value % 100;
  const last = value % 10;
  const word = last === 1 && lastTwo !== 11 ? 'день' : last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? 'дня' : 'дней';
  return `${value} ${word}`;
}

function overallBand(scores: Scores) {
  const values = guideSections.map((section) => scores[section.id]).filter((value): value is number => typeof value === 'number');
  return values.length === 4 ? Math.round((values.reduce((sum, value) => sum + value, 0) / 4) * 2) / 2 : null;
}

export default function PlatformApp() {
  const [view, setView] = useState<AppView>('dashboard');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => { setState(readState()); setReady(true); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('[data-course-search]')?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const completedCount = Object.keys(state.completed).length;
  const overallPercent = getPercent(completedCount, lessons.length);
  const nextLesson = lessons.find(({ card }) => !state.completed[card.id]);
  const lastLesson = findLesson(state.lastLessonId);
  const resumeLesson = lastLesson && !state.completed[lastLesson.card.id] ? lastLesson : nextLesson;
  const activeSection = guideSections.find((section) => section.id === view);
  const activeLesson = activeLessonId ? findLesson(activeLessonId) : undefined;

  const searchResults = useMemo(() => {
    const clean = query.trim().toLocaleLowerCase('ru');
    if (clean.length < 2) return [];
    return lessons.filter(({ card }) => { const copy = getCardText(card, state.language); return [copy.title, copy.label, copy.signal, copy.trap, copy.check, ...copy.steps].join(' ').toLocaleLowerCase().includes(clean); });
  }, [query, state.language]);

  function commit(recipe: (current: AppState) => AppState) {
    setState((current) => { const next = recipe(current); saveState(next); return next; });
  }

  function navigate(next: AppView) {
    setView(next); setActiveLessonId(null); setQuery(''); setMobileNav(false); setNotificationsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openLesson(sectionId: GuideSectionId, lessonId: string) {
    setView(sectionId); setActiveLessonId(lessonId); setQuery(''); setMobileNav(false);
    commit((current) => ({ ...current, lastLessonId: lessonId }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleComplete(lessonId: string) {
    commit((current) => {
      const completed = { ...current.completed };
      if (completed[lessonId]) delete completed[lessonId]; else completed[lessonId] = new Date().toISOString();
      return { ...current, completed, lastLessonId: lessonId };
    });
  }

  function toggleBookmark(lessonId: string) {
    commit((current) => ({ ...current, bookmarks: current.bookmarks.includes(lessonId) ? current.bookmarks.filter((id) => id !== lessonId) : [...current.bookmarks, lessonId] }));
  }

  function updateNote(lessonId: string, note: string) {
    commit((current) => ({ ...current, notes: { ...current.notes, [lessonId]: note } }));
  }

  if (!ready) return <main className={styles.loading}><span aria-hidden="true" /><p>Загрузка · Жүктеу · Loading</p></main>;

  return (
    <LanguageContext.Provider value={state.language}><main className={`${styles.shell} ${state.theme === 'dark' ? styles.dark : ''}`} lang={state.language === 'kk' ? 'kk' : state.language}>
      <Sidebar view={view} activeLessonId={activeLessonId} state={state} overallPercent={overallPercent} completedCount={completedCount} mobileNav={mobileNav} onNavigate={navigate} onClose={() => setMobileNav(false)} />
      <section className={styles.workspace}>
        <Topbar query={query} setQuery={setQuery} theme={state.theme} notificationsOpen={notificationsOpen} onMenu={() => setMobileNav(true)} onTheme={() => commit((current) => ({ ...current, theme: current.theme === 'light' ? 'dark' : 'light' }))} onLanguage={(language) => commit((current) => ({ ...current, language }))} onNotifications={() => setNotificationsOpen((open) => !open)} nextLesson={nextLesson} onOpenLesson={openLesson} />
        {query.trim().length >= 2 ? <SearchPage query={query} results={searchResults} completed={state.completed} onOpen={openLesson} />
          : activeLesson ? <LessonPage lesson={activeLesson} state={state} onToggle={toggleComplete} onBookmark={toggleBookmark} onNote={updateNote} onOpen={openLesson} onModule={() => navigate(activeLesson.section.id)} />
          : view === 'dashboard' ? <Dashboard state={state} completedCount={completedCount} overallPercent={overallPercent} resumeLesson={resumeLesson} onNavigate={navigate} onOpen={openLesson} />
          : view === 'progress' ? <ProgressPage state={state} onNavigate={navigate} />
          : view === 'materials' ? <MaterialsPage state={state} onOpen={openLesson} />
          : view === 'calendar' ? <CalendarPage completed={state.completed} />
          : view === 'notes' ? <NotesPage state={state} onOpen={openLesson} />
          : view === 'settings' ? <SettingsPage state={state} onState={(next) => { setState(next); saveState(next); }} />
          : activeSection ? <ModulePage section={activeSection} completed={state.completed} bookmarks={state.bookmarks} onOpen={openLesson} /> : null}
      </section>
    </main></LanguageContext.Provider>
  );
}

function Sidebar({ view, activeLessonId, state, overallPercent, completedCount, mobileNav, onNavigate, onClose }: {
  view: AppView; activeLessonId: string | null; state: AppState; overallPercent: number; completedCount: number; mobileNav: boolean;
  onNavigate: (view: AppView) => void; onClose: () => void;
}) {
  const { language, t } = useCourseText();
  const navItems: { id: AppView; label: string; icon: typeof Grid2X2 }[] = [
    { id: 'progress', label: t('progress'), icon: BarChart3 }, { id: 'materials', label: t('materials'), icon: FolderOpen },
    { id: 'calendar', label: t('calendar'), icon: CalendarDays }, { id: 'notes', label: t('notes'), icon: NotebookText },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];
  return <aside className={`${styles.sidebar} ${mobileNav ? styles.sidebarOpen : ''}`}>
    <div className={styles.brand}><span className={styles.brandMark} aria-hidden="true" /><div><strong>IELTS Course</strong><small>{t('partner')}</small></div><button onClick={onClose} aria-label={t('closeMenu')}><X size={20} /></button></div>
    <nav className={styles.sidebarNav} aria-label={t('mainNav')}>
      <NavButton active={view === 'dashboard' && !activeLessonId} icon={<Grid2X2 size={18} />} label={t('dashboard')} onClick={() => onNavigate('dashboard')} />
      {guideSections.map((section) => { const Icon = sectionIcons[section.id]; const copy = getSectionText(section, language); return <NavButton key={section.id} active={view === section.id} icon={<Icon size={18} />} label={copy.title} onClick={() => onNavigate(section.id)} />; })}
      <span className={styles.navDivider} />
      <a className={styles.navLink} href="https://engnovate.com/ielts-tests/" target="_blank" rel="noreferrer" title="Engnovate IELTS Tests"><ClipboardList size={18} /><span>{t('practiceTests')}</span><ExternalLink size={14} /></a>
      {navItems.map((item) => { const Icon = item.icon; return <NavButton key={item.id} active={view === item.id} icon={<Icon size={18} />} label={item.label} onClick={() => onNavigate(item.id)} />; })}
    </nav>
    <div className={styles.sideBottom}>
      <div className={styles.courseProgress}><div className={styles.miniRing} style={{ '--progress': `${overallPercent * 3.6}deg` } as CSSProperties}><span>{overallPercent}%</span></div><div><strong>{t('courseProgress')}</strong><small>{t('lessonsCount',{done:completedCount,total:lessons.length})}</small></div><span className={styles.sideMeter}><i style={{ width: `${overallPercent}%` }} /></span></div>
      <button className={styles.profile} onClick={() => onNavigate('settings')}><span>{(state.profileName==='Student'?t('student'):state.profileName).trim().charAt(0).toUpperCase() || 'S'}</span><div><strong>{state.profileName==='Student'?t('student'):state.profileName}</strong><small>{t('localProfile')}</small></div><ChevronRight size={16} /></button>
    </div>
  </aside>;
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button className={active ? styles.navActive : ''} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function Topbar({ query, setQuery, theme, notificationsOpen, onMenu, onTheme, onLanguage, onNotifications, nextLesson, onOpenLesson }: {
  query: string; setQuery: (query: string) => void; theme: 'light' | 'dark'; notificationsOpen: boolean;
  onMenu: () => void; onTheme: () => void; onLanguage: (language: CourseLanguage) => void; onNotifications: () => void;
  nextLesson?: { section: GuideSection; card: GuideCard }; onOpenLesson: (section: GuideSectionId, id: string) => void;
}) {
  const { language, t } = useCourseText();
  const nextSection = nextLesson ? getSectionText(nextLesson.section, language) : undefined;
  const nextCard = nextLesson ? getCardText(nextLesson.card, language) : undefined;
  return <header className={styles.topbar}>
    <button className={styles.menuButton} onClick={onMenu} aria-label={t('openMenu')}><Menu size={20} /></button>
    <div className={styles.searchBox}><Search size={18} /><input data-course-search value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('searchLabel')} /><kbd>Ctrl K</kbd>{query && <button onClick={() => setQuery('')} aria-label={t('clearSearch')}><X size={15} /></button>}</div>
    <div className={styles.languageSwitch} aria-label={t('language')}>{languageOptions.map((option)=><button key={option.id} className={language===option.id?styles.languageActive:''} onClick={()=>onLanguage(option.id)} title={option.label}>{option.short}</button>)}</div>
    <div className={styles.topActions}>
      <button className={styles.roundButton} onClick={onNotifications} aria-label={t('notifications')}><Bell size={20} /><i /></button>
      <button className={styles.roundButton} onClick={onTheme} aria-label={t('changeTheme')}>{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
      {notificationsOpen && <div className={styles.notificationPanel}><div><strong>{t('courseCentre')}</strong><button onClick={onNotifications}><X size={15} /></button></div>{nextLesson && nextSection && nextCard ? <button onClick={() => onOpenLesson(nextLesson.section.id, nextLesson.card.id)}><span className={styles.noticeIcon}><Target size={17} /></span><span><strong>{t('nextLesson')}</strong><small>{nextSection.title} · {nextCard.title}</small></span><ChevronRight size={15} /></button> : <p>{t('allLessonsDone')}</p>}<p>{t('localDataInfo')}</p></div>}
    </div>
  </header>;
}

function Dashboard({ state, completedCount, overallPercent, resumeLesson, onNavigate, onOpen }: {
  state: AppState; completedCount: number; overallPercent: number; resumeLesson?: { section: GuideSection; card: GuideCard };
  onNavigate: (view: AppView) => void; onOpen: (section: GuideSectionId, id: string) => void;
}) {
  const { language, t } = useCourseText();
  const recent = lessons.filter(({ card }) => state.completed[card.id]).sort((a, b) => new Date(state.completed[b.card.id]).getTime() - new Date(state.completed[a.card.id]).getTime()).slice(0, 3);
  const recommended = guideSections.map((section) => ({ section, card: section.cards.find((card) => !state.completed[card.id]) })).filter((item): item is { section: GuideSection; card: GuideCard } => Boolean(item.card)).slice(0, 3);
  const band = overallBand(state.scores);
  return <div className={styles.dashboardPage}>
    <div className={styles.pageHeader}><div><h1>{t('dashboard')}</h1><p>{t('dashboardHello')}</p></div>{resumeLesson && <button onClick={() => onOpen(resumeLesson.section.id, resumeLesson.card.id)}>{t('continueLesson')}<ArrowRight size={16} /></button>}</div>
    <section className={styles.howToStudy}><header><span><Target size={19}/></span><div><strong>{t('howToLearn')}</strong><p>{t('howToLearnText')}</p></div></header><ol>{[t('learnStep1'),t('learnStep2'),t('learnStep3'),t('learnStep4')].map((step,index)=><li key={step}><span>{index+1}</span><p>{step}</p></li>)}</ol></section>
    <section className={styles.skillStats}>{guideSections.map((section) => { const Icon = sectionIcons[section.id]; const done = section.cards.filter((card) => state.completed[card.id]).length; const copy=getSectionText(section,language); return <button key={section.id} style={{ '--section': sectionColors[section.id] } as CSSProperties} onClick={() => onNavigate(section.id)}><span><Icon size={25} /></span><div><strong>{done}/{section.cards.length}</strong><small>{copy.title} · {t('lessonsShort',{count:section.cards.length})}</small></div><ChevronRight size={17} /></button>; })}</section>
    <section className={styles.dashboardMain}>
      <Panel className={`${styles.progressPanel} ${styles.chartPanel}`} title={t('yourProgress')} action={<button onClick={() => onNavigate('progress')}>{t('more')}<ChevronRight size={16} /></button>}><ProgressChart completed={state.completed} range="dashboard" /></Panel>
      <Panel className={styles.bandPanel} title={t('bandScore')} action={<button onClick={() => onNavigate('settings')}>{t('setUp')}<ChevronRight size={14} /></button>}><BandCard scores={state.scores} overall={band} onSettings={() => onNavigate('settings')} /></Panel>
      <div className={styles.rightStack}><StreakCard completed={state.completed} /><Panel title={t('calendar')} className={styles.dashboardCalendar}><ProgressCalendar completed={state.completed} compact /></Panel></div>
    </section>
    <section className={styles.dashboardBottom}>
      <Panel title={t('recentPractice')} action={<button onClick={() => onNavigate('progress')}>{t('allSessions')}<ArrowRight size={14} /></button>}><RecentList items={recent} onOpen={onOpen} /></Panel>
      <Panel title={t('recommended')} action={<button onClick={() => onNavigate('materials')}>{t('allMaterials')}<ArrowRight size={14} /></button>}><RecommendedList items={recommended} onOpen={onOpen} /></Panel>
      <Panel title={t('quickActions')}><QuickActions onNavigate={onNavigate} practice={getPracticeAssignment(resumeLesson ?? lessons[0])} /></Panel>
    </section>
    <footer className={styles.dashboardFooter}><span>{t('completedPercent',{value:overallPercent})}</span><span>{t('courseFooter',{done:completedCount,total:lessons.length})}</span></footer>
  </div>;
}

function Panel({ title, action, className = '', children }: { title: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return <section className={`${styles.panel} ${className}`}><header><h2>{title}</h2>{action}</header>{children}</section>;
}

function ProgressChart({ completed, range }: { completed: Record<string, string>; range: ProgressRange }) {
  const { language, t } = useCourseText();
  const width = 560; const height = 250; const left = 48; const top = 18; const chartW = 486; const chartH = 174;
  const now = new Date();
  const chartDates = getChartDates(range, completed, now);
  const series = guideSections.map((section) => {
    const points = chartDates.map(({ end }) => {
      const count = section.cards.filter((card) => {
        const date = stateDate(completed[card.id]);
        return Boolean(date && date <= end && date <= now);
      }).length;
      return getPercent(count, section.cards.length);
    });
    const done = section.cards.filter((card) => { const date = stateDate(completed[card.id]); return Boolean(date && date <= now); }).length;
    return { section, points, done };
  });
  const hasProgress = series.some(({done})=>done>0);
  const stepX = chartDates.length > 1 ? chartW / (chartDates.length - 1) : 0;
  return <div className={styles.chartWrap}><div className={styles.chartStage}><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={t('chartAria')}>
    {[0,25,50,75,100].map((value) => { const y = top + chartH - (value / 100) * chartH; return <g key={value}><line x1={left} y1={y} x2={left + chartW} y2={y} className={styles.gridLine} /><text x="1" y={y + 4}>{value}%</text></g>; })}
    {chartDates.map((point,index) => <text key={`${point.label}-${index}`} textAnchor="middle" x={left + stepX * index} y={height - 17}>{point.label}</text>)}
    {series.filter(({done})=>done>0).map(({ section, points }) => { const color = sectionColors[section.id]; const coords = points.map((value, index) => `${left + stepX * index},${top + chartH - (value / 100) * chartH}`).join(' '); return <g key={section.id}><polyline points={coords} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />{points.map((value, index) => <circle key={index} cx={left + stepX * index} cy={top + chartH - (value / 100) * chartH} r="5" fill={color}><title>{getSectionText(section,language).title}: {value}% · {chartDates[index].label}</title></circle>)}</g>; })}
  </svg>{!hasProgress&&<div className={styles.chartEmpty}><BarChart3 size={22}/><span>{t('chartEmpty')}</span></div>}</div><div className={styles.chartLegend}>{series.map(({section,done}) => <span key={section.id}><i style={{ background: sectionColors[section.id] }} />{getSectionText(section,language).title}<b>{done}/{section.cards.length}</b></span>)}</div></div>;
}

function stateDate(value?: string) { return value ? new Date(value) : undefined; }

function BandCard({ scores, overall, onSettings }: { scores: Scores; overall: number | null; onSettings: () => void }) {
  const { language, t } = useCourseText();
  return <div className={styles.bandCard}><div className={styles.overallBand}><span>{t('overall')}</span><strong>{overall ?? '—'}</strong><small>{overall === null ? t('addFourScores') : t('currentScore')}</small></div><div className={styles.bandGrid}>{guideSections.map((section) => { const Icon = sectionIcons[section.id]; return <div key={section.id} style={{ '--section': sectionColors[section.id] } as CSSProperties}><span><Icon size={17} /></span><strong>{scores[section.id] ?? '—'}</strong><small>{getSectionText(section,language).title}</small></div>; })}</div><button className={styles.bandPrompt} onClick={onSettings}><Target size={18} /><span><strong>{t('addTestScores')}</strong><small>{t('bandHelp')}</small></span><ChevronRight size={16} /></button></div>;
}

function StreakCard({ completed }: { completed: Record<string, string> }) {
  const { language, t } = useCourseText();
  const { streak, completedToday, active, today } = getStreakDetails(completed);
  const monday = startOfWeek(today);
  const weekdayLabels = getCalendarWeekdays(language);
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(date.getDate() + index); return { date, active: active.has(localDateKey(date)), today: localDateKey(date) === localDateKey(today), future: date > today }; });
  const message = completedToday ? t('streakDoneToday') : streak ? t('streakContinue') : t('streakStart');
  return <section className={styles.streakCard}><header><span><Flame size={19} />{t('studyStreak')}</span></header><div><strong>{formatStreakCount(streak,language)}</strong><span className={styles.weekDots}>{days.map(({ date, active: isActive, today: isToday, future },index) => <i key={localDateKey(date)} className={`${isActive ? styles.activeDot : ''} ${isToday ? styles.todayDot : ''} ${future ? styles.futureDot : ''}`} title={new Intl.DateTimeFormat(getDateLocale(language),{weekday:'long',day:'numeric',month:'long'}).format(date)}>{isActive ? <Check size={10} strokeWidth={3} /> : null}<small>{weekdayLabels[index]}</small></i>)}</span></div><p>{message}</p></section>;
}

function RecentList({ items, onOpen }: { items: { section: GuideSection; card: GuideCard }[]; onOpen: (section: GuideSectionId, id: string) => void }) {
  const { language, t } = useCourseText();
  if (!items.length) return <EmptyState icon={<Clock3 size={22} />} title={t('emptyHistory')} text={t('emptyHistoryText')} />;
  return <div className={styles.compactList}>{items.map(({ section, card }) => { const Icon = sectionIcons[section.id]; const s=getSectionText(section,language); const c=getCardText(card,language); return <button key={card.id} onClick={() => onOpen(section.id, card.id)}><span style={{ '--section': sectionColors[section.id] } as CSSProperties}><Icon size={18} /></span><div><strong>{c.title}</strong><small>{s.title} · {t('completedLesson')}</small></div><em>{t('repeat')}</em></button>; })}</div>;
}

function RecommendedList({ items, onOpen }: { items: { section: GuideSection; card: GuideCard }[]; onOpen: (section: GuideSectionId, id: string) => void }) {
  const { language, t } = useCourseText();
  if (!items.length) return <EmptyState icon={<CheckCircle2 size={22} />} title={t('courseComplete')} text={t('courseCompleteText')} />;
  return <div className={styles.compactList}>{items.map(({ section, card }) => { const Icon = sectionIcons[section.id]; const s=getSectionText(section,language); const c=getCardText(card,language); return <button key={card.id} onClick={() => onOpen(section.id, card.id)}><span style={{ '--section': sectionColors[section.id] } as CSSProperties}><Icon size={18} /></span><div><strong>{s.title}: {c.title}</strong><small>{t('stepsTips',{count:c.steps.length})}</small></div><em>{t('minutes',{count:Math.max(10,c.steps.length*4)})}</em></button>; })}</div>;
}

function QuickActions({ onNavigate, practice }: { onNavigate: (view: AppView) => void; practice: ReturnType<typeof getPracticeAssignment> }) {
  const { t } = useCourseText();
  return <div className={styles.quickActions}><a href={practice.url} target="_blank" rel="noreferrer" title={practice.title}><ClipboardList size={22} /><span>{t('nextTest')}</span><ExternalLink size={14} /></a><button onClick={() => onNavigate('notes')}><NotebookText size={22} /><span>{t('notes')}</span></button><button onClick={() => onNavigate('materials')}><Bookmark size={22} /><span>{t('bookmarks')}</span></button><button onClick={() => onNavigate('settings')}><Target size={22} /><span>{t('bandScore')}</span></button></div>;
}

function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className={styles.emptyState}>{icon}<div><strong>{title}</strong><p>{text}</p></div></div>; }

function ProgressPage({ state, onNavigate }: { state: AppState; onNavigate: (view: AppView) => void }) {
  const { language, t } = useCourseText();
  const [chartRange,setChartRange] = useState<Exclude<ProgressRange,'dashboard'>>('week');
  const completedCount = Object.keys(state.completed).length;
  return <PageFrame title={t('progress')} subtitle={t('progressPageText')}>
    <div className={styles.progressSummary}>
      <div><span>{t('course')}</span><strong>{getPercent(completedCount, lessons.length)}%</strong><small>{t('lessonsCount',{done:completedCount,total:lessons.length})}</small></div>
      <div><span>{t('studyStreak')}</span><strong>{getStreak(state.completed)}</strong><small>{t('streakDays')}</small></div>
      <div><span>{t('bandScore')}</span><strong>{overallBand(state.scores) ?? '—'}</strong><small>{overallBand(state.scores) === null ? t('needFourScores') : t('averageScore')}</small></div>
      <div><span>{t('notes')}</span><strong>{Object.values(state.notes).filter(Boolean).length}</strong><small>{t('savedHere')}</small></div>
    </div>
    <div className={styles.progressPageGrid}>
      <Panel className={styles.chartPanel} title={t('progressByModule')} action={<div className={styles.chartRangeTabs} aria-label={t('chartAria')}>{(['week','month','all'] as const).map((range)=><button key={range} className={chartRange===range?styles.rangeActive:''} onClick={()=>setChartRange(range)}>{range==='week'?t('rangeWeek'):range==='month'?t('rangeMonth'):t('rangeAll')}</button>)}</div>}><ProgressChart completed={state.completed} range={chartRange} /></Panel>
      <Panel title={t('sectionProgress')}><div className={styles.sectionProgressList}>{guideSections.map((section) => { const done = section.cards.filter((card) => state.completed[card.id]).length; const value = getPercent(done, section.cards.length); const Icon = sectionIcons[section.id]; const copy=getSectionText(section,language); return <button key={section.id} onClick={() => onNavigate(section.id)}><span style={{ '--section': sectionColors[section.id] } as CSSProperties}><Icon size={19} /></span><div><strong>{copy.title}<b>{value}%</b></strong><small>{t('lessonsCount',{done,total:section.cards.length})}</small><i><em style={{ width: `${value}%`, background: sectionColors[section.id] }} /></i></div><ChevronRight size={16} /></button>; })}</div></Panel>
    </div>
    <Panel title={t('activityHistory')}><ActivityHistory state={state} /></Panel>
  </PageFrame>;
}

function ActivityHistory({ state }: { state: AppState }) {
  const { language, t } = useCourseText();
  const items = lessons.filter(({ card }) => state.completed[card.id]).sort((a, b) => new Date(state.completed[b.card.id]).getTime() - new Date(state.completed[a.card.id]).getTime());
  if (!items.length) return <EmptyState icon={<BarChart3 size={22} />} title={t('noCompleted')} text={t('noCompletedText')} />;
  return <div className={styles.activityTable}>{items.map(({ section, card }) => {const s=getSectionText(section,language);const c=getCardText(card,language);return <div key={card.id}><span style={{ background: sectionColors[section.id] }} /><div><strong>{c.title}</strong><small>{s.title}</small></div><time>{new Intl.DateTimeFormat(getDateLocale(language),{day:'numeric',month:'long',year:'numeric'}).format(new Date(state.completed[card.id]))}</time><CheckCircle2 size={17} /></div>;})}</div>;
}

function MaterialsPage({ state, onOpen }: { state: AppState; onOpen: (section: GuideSectionId, id: string) => void }) {
  const { language, t } = useCourseText();
  const bookmarked = state.bookmarks.map(findLesson).filter((item): item is { section: GuideSection; card: GuideCard } => Boolean(item));
  return <PageFrame title={t('materials')} subtitle={t('materialsText')}>
    <Panel title={t('bookmarkCount',{count:bookmarked.length})}><LessonCardGrid items={bookmarked} empty={t('addBookmarkHelp')} onOpen={onOpen} /></Panel>
    <section className={styles.materialSection}><h2>{t('allModules')}</h2><div className={styles.materialModules}>{guideSections.map((section) => { const Icon = sectionIcons[section.id]; const s=getSectionText(section,language); return <article key={section.id} style={{ '--section': sectionColors[section.id] } as CSSProperties}><span><Icon size={23} /></span><div><strong>{s.title}</strong><small>{t('practiceLessons',{count:section.cards.length})}</small></div><ul>{section.cards.slice(0,4).map((card) => {const c=getCardText(card,language);return <li key={card.id}><button onClick={() => onOpen(section.id, card.id)}>{c.title}<ChevronRight size={14} /></button></li>;})}</ul></article>; })}</div></section>
    <Panel title={t('sources')}><div className={styles.sourceList}>{sourceLinks.map(([label,href]) => <a key={href} href={href} target="_blank" rel="noreferrer"><FileText size={18} /><span>{label}</span><ExternalLink size={15} /></a>)}</div></Panel>
  </PageFrame>;
}

function LessonCardGrid({ items, empty, onOpen }: { items: { section: GuideSection; card: GuideCard }[]; empty: string; onOpen: (section: GuideSectionId, id: string) => void }) {
  const { language, t } = useCourseText();
  if (!items.length) return <EmptyState icon={<Bookmark size={22} />} title={t('noBookmarks')} text={empty} />;
  return <div className={styles.lessonCardGrid}>{items.map(({ section, card }) => { const Icon = sectionIcons[section.id]; const s=getSectionText(section,language);const c=getCardText(card,language); return <button key={card.id} onClick={() => onOpen(section.id,card.id)}><span style={{ '--section': sectionColors[section.id] } as CSSProperties}><Icon size={19} /></span><small>{s.title} · {c.label}</small><strong>{c.title}</strong><p>{c.signal}</p><em>{t('openLesson')}<ArrowRight size={14} /></em></button>; })}</div>;
}

function CalendarPage({ completed }: { completed: Record<string, string> }) {
  const { language, t } = useCourseText();
  const plan=getStudyPlan(language); const modes=getSessionModes(language);
  return <PageFrame title={t('calendar')} subtitle={t('calendarText')}>
    <div className={styles.calendarPageGrid}><Panel title={t('studyCalendar')}><ProgressCalendar completed={completed} /></Panel><div className={styles.calendarSide}><div><CalendarDays size={20} /><strong>{Object.keys(completed).length}</strong><span>{t('totalLessons')}</span></div><div><Flame size={20} /><strong>{getStreak(completed)}</strong><span>{t('studyDays')}</span></div></div></div>
    <section className={styles.studyPlan}><div className={styles.studyPlanHead}><h2>{t('sixWeekPlan')}</h2><p>{t('sixWeekText')}</p></div>{plan.map((phase,index) => <article key={phase.phase}><span>0{index+1}</span><div><small>{phase.phase}</small><h3>{phase.title}</h3><ul>{phase.tasks.map((task) => <li key={task}><Check size={14} />{task}</li>)}</ul></div></article>)}</section>
    <section className={styles.sessionModes}>{modes.map((mode) => <article key={mode.name}><Clock3 size={18} /><span>{mode.name}</span><strong>{mode.time}</strong><p>{mode.plan}</p></article>)}</section>
  </PageFrame>;
}

function NotesPage({ state, onOpen }: { state: AppState; onOpen: (section: GuideSectionId, id: string) => void }) {
  const { language, t } = useCourseText();
  const items = Object.entries(state.notes).filter(([,note]) => note.trim()).map(([id,note]) => ({ lesson: findLesson(id), note })).filter((item): item is { lesson: { section: GuideSection; card: GuideCard }; note: string } => Boolean(item.lesson));
  return <PageFrame title={t('notes')} subtitle={t('notesText')}>
    {items.length ? <div className={styles.notesGrid}>{items.map(({ lesson,note }) => {const s=getSectionText(lesson.section,language);const c=getCardText(lesson.card,language);return <button key={lesson.card.id} onClick={() => onOpen(lesson.section.id,lesson.card.id)}><span style={{ background: sectionColors[lesson.section.id] }}>{s.short}</span><small>{s.title} · {c.label}</small><h2>{c.title}</h2><p>{note}</p><em>{t('openEdit')}<ArrowRight size={14} /></em></button>;})}</div> : <div className={styles.largeEmpty}><NotebookText size={30} /><h2>{t('noNotes')}</h2><p>{t('noNotesText')}</p></div>}
  </PageFrame>;
}

function SettingsPage({ state, onState }: { state: AppState; onState: (state: AppState) => void }) {
  const { language, t } = useCourseText();
  const [draftName,setDraftName] = useState(state.profileName);
  const [confirmReset,setConfirmReset] = useState(false);
  const scoreOptions = ['',...Array.from({length:18},(_,index) => ((index+1)/2).toString())];
  function updateScore(section: GuideSectionId,value: string) { const scores = { ...state.scores }; if (!value) delete scores[section]; else scores[section]=Number(value); onState({ ...state,scores }); }
  return <PageFrame title={t('settings')} subtitle={t('settingsText')}>
    <div className={styles.settingsGrid}>
      <Panel title={t('profile')}><label className={styles.field}><span>{t('displayName')}</span><input value={draftName} onChange={(event) => setDraftName(event.target.value)} /><small>{t('notSent')}</small></label><button className={styles.saveButton} onClick={() => onState({ ...state,profileName:draftName.trim() || 'Student' })}>{t('saveName')}</button></Panel>
      <Panel title={t('language')}><p className={styles.panelIntro}>{t('languageHelp')}</p><div className={styles.languageSettings}>{languageOptions.map((option)=><button key={option.id} className={language===option.id?styles.selected:''} onClick={()=>onState({...state,language:option.id})}><strong>{option.short}</strong><span>{option.label}</span></button>)}</div></Panel>
      <Panel title={t('theme')}><div className={styles.themeChoice}><button className={state.theme==='light'?styles.selected:''} onClick={() => onState({ ...state,theme:'light' })}><Sun size={20} /><strong>{t('light')}</strong></button><button className={state.theme==='dark'?styles.selected:''} onClick={() => onState({ ...state,theme:'dark' })}><Moon size={20} /><strong>{t('dark')}</strong></button></div></Panel>
    </div>
    <Panel title={t('scoreSettings')}><p className={styles.panelIntro}>{t('scoreHelp')}</p><div className={styles.scoreSettings}>{guideSections.map((section) => { const Icon=sectionIcons[section.id]; const s=getSectionText(section,language); return <label key={section.id} style={{ '--section':sectionColors[section.id] } as CSSProperties}><span><Icon size={18} /></span><strong>{s.title}</strong><select value={state.scores[section.id]?.toString() ?? ''} onChange={(event)=>updateScore(section.id,event.target.value)}>{scoreOptions.map((value)=><option key={value} value={value}>{value || t('noScore')}</option>)}</select></label>; })}</div></Panel>
    <section className={styles.dangerZone}><div><strong>{t('resetData')}</strong><p>{confirmReset?t('resetDetail'):t('resetWarning')}</p></div>{confirmReset?<div><button onClick={()=>setConfirmReset(false)}>{t('cancel')}</button><button onClick={()=>{const next={...DEFAULT_STATE,theme:state.theme,language:state.language};onState(next);setConfirmReset(false);}}>{t('yesDelete')}</button></div>:<button onClick={()=>setConfirmReset(true)}>{t('reset')}</button>}</section>
  </PageFrame>;
}

function ModulePage({ section, completed, bookmarks, onOpen }: { section: GuideSection; completed: Record<string,string>; bookmarks:string[]; onOpen:(section:GuideSectionId,id:string)=>void }) {
  const { language, t } = useCourseText();
  const sectionCopy=getSectionText(section,language);
  const Icon=sectionIcons[section.id]; const done=section.cards.filter((card)=>completed[card.id]).length; const value=getPercent(done,section.cards.length); const next=section.cards.find((card)=>!completed[card.id])??section.cards[0];
  return <PageFrame title={sectionCopy.title} subtitle={sectionCopy.principle} accent={sectionColors[section.id]} icon={<Icon size={24} />} action={<button onClick={()=>onOpen(section.id,next.id)}>{done===section.cards.length?t('repeatModule'):t('continue')}<ArrowRight size={16}/></button>}>
    <div className={styles.moduleSummary}><div><strong>{value}%</strong><span>{t('lessonsCount',{done,total:section.cards.length})}</span></div><i><em style={{width:`${value}%`,background:sectionColors[section.id]}}/></i></div>
    <div className={styles.moduleLessons}>{section.cards.map((source,index)=>{const card=getCardText(source,language);const isDone=Boolean(completed[source.id]);return <button key={source.id} onClick={()=>onOpen(section.id,source.id)}><span className={isDone?styles.doneLesson:''}>{isDone?<CheckCircle2 size={20}/>:String(index+1).padStart(2,'0')}</span><div><small>{card.label}</small><strong>{card.title}</strong><p>{card.signal}</p></div><em>{bookmarks.includes(source.id)&&<Bookmark size={14} fill="currentColor"/>}{isDone?t('passed'):t('steps',{count:card.steps.length})}<ChevronRight size={16}/></em></button>;})}</div>
  </PageFrame>;
}

function LessonPage({ lesson,state,onToggle,onBookmark,onNote,onOpen,onModule }: { lesson:{section:GuideSection;card:GuideCard};state:AppState;onToggle:(id:string)=>void;onBookmark:(id:string)=>void;onNote:(id:string,note:string)=>void;onOpen:(section:GuideSectionId,id:string)=>void;onModule:()=>void }) {
  const { language, t } = useCourseText();
  const {section}=lesson; const sourceCard=lesson.card; const card=getCardText(sourceCard,language); const sectionCopy=getSectionText(section,language); const Icon=sectionIcons[section.id]; const index=section.cards.findIndex((item)=>item.id===sourceCard.id); const flatIndex=lessons.findIndex((item)=>item.card.id===sourceCard.id); const previous=lessons[flatIndex-1]; const next=lessons[flatIndex+1]; const isDone=Boolean(state.completed[sourceCard.id]); const isBookmarked=state.bookmarks.includes(sourceCard.id); const practice=getPracticeAssignment(lesson);
  const previousCard=previous?getCardText(previous.card,language):undefined; const nextCard=next?getCardText(next.card,language):undefined;
  return <div className={styles.lessonPage} style={{'--section':sectionColors[section.id]} as CSSProperties}><div className={styles.lessonBreadcrumbs}><button onClick={onModule}><ArrowLeft size={15}/>{sectionCopy.title}</button><span>/</span><span>{t('lessonOf',{current:index+1,total:section.cards.length})}</span><button className={isBookmarked?styles.bookmarked:''} onClick={()=>onBookmark(sourceCard.id)}><Bookmark size={17} fill={isBookmarked?'currentColor':'none'}/>{isBookmarked?t('saved'):t('save')}</button></div>
    <header className={styles.lessonHero}><span><Icon size={25}/></span><div><small>{card.label}</small><h1>{card.title}</h1><p>{card.signal}</p></div><em>{String(index+1).padStart(2,'0')}<small>/{String(section.cards.length).padStart(2,'0')}</small></em></header>
    <div className={styles.lessonBody}><article><span className={styles.contentLabel}>{t('stepPlan')}</span><ol className={styles.steps}>{card.steps.map((step,stepIndex)=><li key={step}><span>{stepIndex+1}</span><p>{step}</p></li>)}</ol><div className={styles.lessonTips}><div><AlertTriangle size={19}/><span><strong>{t('mainTrap')}</strong><p>{card.trap}</p></span></div><div><Check size={19}/><span><strong>{t('check')}</strong><p>{card.check}</p></span></div></div><label className={styles.noteEditor}><span><NotebookText size={18}/><strong>{t('myNotes')}</strong><small>{t('autoSaved')}</small></span><textarea value={state.notes[sourceCard.id]??''} onChange={(event)=>onNote(sourceCard.id,event.target.value)} placeholder={t('notePlaceholder')}/></label><div className={styles.completeBox}><div>{isDone?<CheckCircle2 size={27}/>:<Circle size={27}/>}<span><strong>{isDone?t('lessonDone'):t('practiceDone')}</strong><small>{isDone?t('addedToProgress'):t('finishHint')}</small></span></div><button className={isDone?styles.completeActive:''} onClick={()=>onToggle(sourceCard.id)}>{isDone?t('ready'):t('markReady')}</button></div></article><aside><div><span>{t('module')}</span><strong>{sectionCopy.title}</strong></div><div><span>{t('format')}</span><strong>{card.label}</strong></div><div><span>{t('size')}</span><strong>{t('steps',{count:card.steps.length})}</strong></div><div><span>{t('assignedTest')}</span><strong>{practice.shortTitle}</strong></div><a href={practice.url} target="_blank" rel="noreferrer" title={practice.title}>{t('openEngnovate')}<ExternalLink size={14}/></a></aside></div>
    <nav className={styles.lessonNav}>{previous&&previousCard?<button onClick={()=>onOpen(previous.section.id,previous.card.id)}><ArrowLeft size={16}/><span><small>{t('previous')}</small>{previousCard.title}</span></button>:<span/>}{next&&nextCard?<button onClick={()=>onOpen(next.section.id,next.card.id)}><span><small>{t('next')}</small>{nextCard.title}</span><ArrowRight size={16}/></button>:<span/>}</nav></div>;
}

function SearchPage({query,results,completed,onOpen}:{query:string;results:{section:GuideSection;card:GuideCard}[];completed:Record<string,string>;onOpen:(section:GuideSectionId,id:string)=>void}) {
  const { language, t } = useCourseText();
  return <PageFrame title={t('searchResults',{query})} subtitle={t('lessonsFound',{count:results.length})}>
    <div className={styles.searchResults}>{results.map(({section,card:source})=>{const Icon=sectionIcons[section.id];const s=getSectionText(section,language);const card=getCardText(source,language);return <button key={source.id} onClick={()=>onOpen(section.id,source.id)}><span style={{'--section':sectionColors[section.id]} as CSSProperties}><Icon size={19}/></span><div><small>{s.title} · {card.label}</small><strong>{card.title}</strong><p>{card.signal}</p></div>{completed[source.id]?<em><CheckCircle2 size={16}/>{t('passed')}</em>:<ChevronRight size={17}/>}</button>;})}{!results.length&&<div className={styles.largeEmpty}><Search size={29}/><h2>{t('nothingFound')}</h2><p>{t('searchHint')}</p></div>}</div>
  </PageFrame>;
}

function PageFrame({title,subtitle,accent,icon,action,children}:{title:string;subtitle:string;accent?:string;icon?:ReactNode;action?:ReactNode;children:ReactNode}) {
  return <div className={styles.page}><header className={styles.pageTitle} style={{'--section':accent??'#07203e'} as CSSProperties}>{icon&&<span>{icon}</span>}<div><h1>{title}</h1><p>{subtitle}</p></div>{action&&<div className={styles.pageAction}>{action}</div>}</header>{children}</div>;
}

function ProgressCalendar({completed,compact=false}:{completed:Record<string,string>;compact?:boolean}) {
  const { language, t } = useCourseText();
  const [cursor,setCursor]=useState(()=>{const now=new Date();return new Date(now.getFullYear(),now.getMonth(),1);}); const today=new Date(); const year=cursor.getFullYear(); const month=cursor.getMonth(); const first=(new Date(year,month,1).getDay()+6)%7; const days=new Date(year,month+1,0).getDate();
  const counts=useMemo(()=>{const result:Record<string,number>={};Object.values(completed).forEach((stamp)=>{const date=new Date(stamp);const key=`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;result[key]=(result[key]??0)+1;});return result;},[completed]); const cells=[...Array(first).fill(null),...Array.from({length:days},(_,index)=>index+1)]; const label=getMonthLabel(cursor,language); const weekdays=getCalendarWeekdays(language);
  return <div className={`${styles.calendar} ${compact?styles.calendarCompact:''}`}><div className={styles.calendarHead}><strong>{label}</strong><div><button onClick={()=>setCursor(new Date(year,month-1,1))} aria-label={t('previousMonth')}><ChevronLeft size={16}/></button><button onClick={()=>setCursor(new Date(year,month+1,1))} aria-label={t('nextMonth')}><ChevronRight size={16}/></button></div></div><div className={styles.weekdays}>{weekdays.map((day)=><span key={day}>{day}</span>)}</div><div className={styles.calendarDays}>{cells.map((day,index)=>{if(!day)return <span key={`blank-${index}`}/>;const count=counts[`${year}-${month}-${day}`]??0;const isToday=today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===day;return <span key={day} className={`${count?styles.calendarDone:''} ${isToday?styles.calendarToday:''}`}><b>{day}</b>{count>0&&<i>{count>1?count:<Check size={9}/>}</i>}</span>;})}</div></div>;
}
