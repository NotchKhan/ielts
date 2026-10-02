"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { Cloud, LogOut, ShieldCheck } from "lucide-react";
import { cloudEnabled, courseCloudClient, signInRedirect } from "@/lib/ielts-cloud";
import styles from "./account.module.css";

type AccountContextValue = {
  enabled: boolean;
  user: User | null;
  error: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AccountContext = createContext<AccountContextValue>({
  enabled: false,
  user: null,
  error: "",
  signIn: async () => {},
  signOut: async () => {},
});

export const useAccount = () => useContext(AccountContext);

export function AccountBoundary({ children }: { children: ReactNode }) {
  return cloudEnabled ? <ConnectedBoundary>{children}</ConnectedBoundary> : children;
}

function ConnectedBoundary({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"loading" | "gate" | "guest" | "account">("loading");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [language, setLanguage] = useState<"ru" | "kk" | "en">("ru");
  const identity = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    let live = true;
    try {
      const saved = localStorage.getItem("ielts-account-language");
      if (saved === "kk" || saved === "en") setLanguage(saved);
    } catch {}

    const transition = (session: Session | null, event: string) => {
      if (!live) return;
      const id = session?.user.id ?? null;
      if (identity.current === id && event !== "SIGNED_OUT") return;
      identity.current = id;
      setUser(session?.user ?? null);
      setMode(id ? "account" : "gate");
      setError("");
    };

    try {
      const auth = courseCloudClient().auth;
      const { data: { subscription } } = auth.onAuthStateChange((event, session) => transition(session, event));
      void auth.getSession().then(({ data, error: sessionError }) => {
        if (!live) return;
        if (sessionError) {
          setError("Не удалось проверить вход. Попробуй ещё раз.");
          setMode("gate");
          return;
        }
        transition(data.session, "INITIAL_SESSION");
        const url = new URL(window.location.href);
        if (url.searchParams.has("code") || url.searchParams.has("error")) {
          for (const key of ["code", "error", "error_code", "error_description"]) {
            url.searchParams.delete(key);
          }
          history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
        }
      }).catch(() => {
        if (live) {
          setError("Сервис входа временно недоступен.");
          setMode("gate");
        }
      });
      return () => {
        live = false;
        subscription.unsubscribe();
      };
    } catch (caught) {
      queueMicrotask(() => {
        if (live) {
          setError(caught instanceof Error ? caught.message : "Ошибка настройки входа.");
          setMode("gate");
        }
      });
    }
    return () => { live = false; };
  }, []);

  const text = accountCopy[language];

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const { error: signInError } = await courseCloudClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: signInRedirect(),
          queryParams: { prompt: "select_account" },
        },
      });
      if (signInError) throw signInError;
    } catch {
      setError(text.signInError);
      setBusy(false);
    }
  }

  async function signOut() {
    identity.current = null;
    setUser(null);
    setMode("gate");
    setBusy(true);
    try {
      await courseCloudClient().auth.signOut({ scope: "local" });
    } catch {
      setError(text.signOutError);
    } finally {
      setBusy(false);
    }
  }

  async function continueAsGuest() {
    setBusy(true);
    try { await courseCloudClient().auth.signOut({ scope: "local" }); } catch {}
    identity.current = null;
    setUser(null);
    setError("");
    setMode("guest");
    setBusy(false);
  }

  function chooseLanguage(next: "ru" | "kk" | "en") {
    setLanguage(next);
    try { localStorage.setItem("ielts-account-language", next); } catch {}
  }

  const context = { enabled: true, user, error, signIn, signOut };
  if (mode === "account" || mode === "guest") {
    return <AccountContext.Provider value={context}>{children}</AccountContext.Provider>;
  }

  return <main className={styles.screen}>
    <section className={styles.card}>
      <header className={styles.brand}>
        <span className={styles.logo} aria-hidden="true" />
        <strong>IELTS Course</strong>
        <div className={styles.languages} aria-label="Language">
          {(["ru", "kk", "en"] as const).map((item) => <button key={item} className={language === item ? styles.activeLanguage : ""} onClick={() => chooseLanguage(item)}>{item === "kk" ? "ҚАЗ" : item.toUpperCase()}</button>)}
        </div>
      </header>
      <p className={styles.eyebrow}>{text.eyebrow}</p>
      <h1>{text.title}</h1>
      <p className={styles.description}>{text.description}</p>
      {mode === "loading" ? <p role="status" className={styles.status}>{text.loading}</p> : <>
        <button className={styles.googleButton} disabled={busy} onClick={() => void signIn()}><span aria-hidden="true">G</span>{busy ? text.wait : text.google}</button>
        <p className={styles.fineprint}>{text.accountNote}</p>
        <button className={styles.guestButton} disabled={busy} onClick={() => void continueAsGuest()}>{text.guest}</button>
        <p className={styles.fineprint}>{text.guestNote}</p>
      </>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.security}><ShieldCheck size={17} />{text.security}</div>
    </section>
  </main>;
}

export function AccountSettings({ language }: { language: "ru" | "kk" | "en" }) {
  const account = useAccount();
  if (!account.enabled) return null;
  const text = accountSettingsCopy[language];
  return <section className={styles.settingsCard}>
    <div className={styles.settingsIcon}><Cloud size={21} /></div>
    <div>
      <strong>{account.user ? text.account : text.device}</strong>
      <p>{account.user?.email ?? text.noSync}</p>
      <small>{account.user ? text.synced : text.local}</small>
    </div>
    <button onClick={() => void (account.user ? account.signOut() : account.signIn())}>{account.user ? <><LogOut size={16} />{text.signOut}</> : text.signIn}</button>
  </section>;
}

const accountCopy = {
  ru: { eyebrow: "ТВОЙ ПРОГРЕСС", title: "Учись на любом устройстве.", description: "Войди через Google, чтобы уроки, заметки и результаты сохранялись в твоём аккаунте.", loading: "Проверяем аккаунт…", wait: "Подожди…", google: "Продолжить с Google", accountNote: "При первом входе аккаунт создастся автоматически. Данные курса хранятся в Supabase.", guest: "Продолжить без аккаунта", guestNote: "Без входа прогресс хранится только в этом браузере.", security: "У каждого аккаунта свой закрытый прогресс", signInError: "Вход через Google не выполнен. Попробуй ещё раз.", signOutError: "Не удалось выйти из аккаунта." },
  kk: { eyebrow: "СЕНІҢ ҮЛГЕРІМІҢ", title: "Кез келген құрылғыда оқы.", description: "Сабақтар, жазбалар және нәтижелер аккаунтыңда сақталуы үшін Google арқылы кір.", loading: "Аккаунт тексерілуде…", wait: "Күте тұр…", google: "Google арқылы жалғастыру", accountNote: "Алғаш кіргенде аккаунт автоматты түрде жасалады. Курс деректері Supabase жүйесінде сақталады.", guest: "Аккаунтсыз жалғастыру", guestNote: "Кірмесең, үлгерім тек осы браузерде сақталады.", security: "Әр аккаунттың жеке жабық үлгерімі бар", signInError: "Google арқылы кіру орындалмады. Қайта көр.", signOutError: "Аккаунттан шығу мүмкін болмады." },
  en: { eyebrow: "YOUR PROGRESS", title: "Study on any device.", description: "Continue with Google to keep your lessons, notes, and scores in your account.", loading: "Checking your account…", wait: "Please wait…", google: "Continue with Google", accountNote: "Your account is created on first sign-in. Course data is stored in Supabase.", guest: "Continue without an account", guestNote: "Without sign-in, progress stays in this browser only.", security: "Each account has its own private progress", signInError: "Google sign-in did not finish. Try again.", signOutError: "Could not sign out." },
} as const;

const accountSettingsCopy = {
  ru: { account: "Google-аккаунт", device: "На этом устройстве", noSync: "Без синхронизации", synced: "Прогресс сохраняется в Supabase и доступен на других устройствах.", local: "Прогресс хранится только в этом браузере.", signIn: "Войти", signOut: "Выйти" },
  kk: { account: "Google аккаунты", device: "Осы құрылғыда", noSync: "Синхрондаусыз", synced: "Үлгерім Supabase жүйесінде сақталып, басқа құрылғыларда ашылады.", local: "Үлгерім тек осы браузерде сақталады.", signIn: "Кіру", signOut: "Шығу" },
  en: { account: "Google account", device: "On this device", noSync: "No sync", synced: "Progress is saved in Supabase and available on other devices.", local: "Progress stays in this browser only.", signIn: "Sign in", signOut: "Sign out" },
} as const;
