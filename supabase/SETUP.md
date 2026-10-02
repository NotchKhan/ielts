# IELTS Course · Google и Supabase

Проект использует тот же Supabase, что и ÇalışBase. Прогресс IELTS хранится в отдельной таблице `ielts_course_states` и не смешивается с данными ÇalışBase.

## База данных

В Supabase SQL Editor один раз выполнить:

`supabase/migrations/202610020001_ielts_course_state.sql`

RLS разрешает каждому пользователю читать только собственную строку. Запись выполняется через защищённую функцию с проверкой аккаунта и версии.

## URL для входа

Supabase → Authentication → URL Configuration:

- добавить Redirect URL `https://ggielts.vercel.app/`;
- для локальной проверки добавить `http://localhost:3000/`.

В существующем Google OAuth Web client добавить Authorized JavaScript origin:

`https://ggielts.vercel.app`

Redirect URI Google остаётся Supabase callback существующего проекта.

## Vercel

В проекте IELTS добавить Production variables:

```text
NEXT_PUBLIC_CLOUD_AUTH_ENABLED=true
NEXT_PUBLIC_SUPABASE_URL=<тот же URL, что в ÇalışBase>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<тот же publishable key, что в ÇalışBase>
NEXT_PUBLIC_SITE_URL=https://ggielts.vercel.app
```

После добавления переменных выполнить Redeploy.
