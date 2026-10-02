import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const cloudEnabled = process.env.NEXT_PUBLIC_CLOUD_AUTH_ENABLED === "true";

let client: SupabaseClient | null = null;

export function courseCloudClient() {
  if (!cloudEnabled) throw new Error("Вход через Google пока не подключён.");
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Настройка аккаунтов ещё не завершена.");

  const parsed = new URL(url);
  if (
    parsed.protocol !== "https:" ||
    !parsed.hostname.endsWith(".supabase.co") ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    parsed.search ||
    parsed.hash ||
    parsed.pathname !== "/"
  ) {
    throw new Error("Некорректный адрес Supabase.");
  }
  if (!key.startsWith("sb_publishable_")) {
    throw new Error("Для сайта нужен публичный ключ Supabase.");
  }

  client = createClient(url, key, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return client;
}

export function signInRedirect() {
  const configured = new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://ielts-pi-nine.vercel.app",
  );
  if (configured.protocol !== "https:" || configured.username || configured.password) {
    throw new Error("Некорректный адрес возврата после входа.");
  }
  if (window.location.origin === configured.origin) return `${configured.origin}/`;
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return `${window.location.origin}/`;
  }
  throw new Error("Вход доступен на основном сайте IELTS Course.");
}

export type CloudCourseState = {
  state: unknown;
  revision: number;
};

export async function loadCourseState(ownerId: string): Promise<CloudCourseState | null> {
  const { data, error } = await courseCloudClient()
    .from("ielts_course_states")
    .select("state,revision")
    .eq("user_id", ownerId)
    .maybeSingle();

  if (error) throw new Error("Не удалось загрузить прогресс из облака.");
  if (!data) return null;
  return { state: data.state, revision: Number(data.revision) };
}

export async function saveCourseState(
  ownerId: string,
  state: unknown,
  expectedRevision: number,
): Promise<CloudCourseState> {
  const { data, error } = await courseCloudClient().rpc("save_ielts_course_state", {
    p_account_id: ownerId,
    p_state: state,
    p_expected_revision: expectedRevision,
  });

  if (error) {
    if (error.code === "40001") {
      throw new Error("Прогресс изменился в другой вкладке. Обнови страницу.");
    }
    if (["28000", "42501", "PGRST301"].includes(error.code)) {
      throw new Error("Сессия закончилась. Войди в аккаунт снова.");
    }
    throw new Error("Не удалось сохранить прогресс в облаке.");
  }

  const result = data as { state?: unknown; revision?: unknown } | null;
  if (!result || typeof result.revision !== "number") {
    throw new Error("Supabase вернул некорректный ответ.");
  }
  return { state: result.state, revision: result.revision };
}
