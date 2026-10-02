begin;

create table if not exists public.ielts_course_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null check (revision between 1 and 9007199254740991),
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.ielts_course_states enable row level security;
alter table public.ielts_course_states force row level security;
revoke all on public.ielts_course_states from public, anon, authenticated;
grant select on public.ielts_course_states to authenticated;

drop policy if exists own_ielts_course_state_read on public.ielts_course_states;
create policy own_ielts_course_state_read
on public.ielts_course_states for select to authenticated
using (user_id = (select auth.uid()));

create or replace function public.save_ielts_course_state(
  p_account_id uuid,
  p_state jsonb,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := auth.uid();
  stored_state jsonb;
begin
  if account_id is null or p_account_id is distinct from account_id then
    raise exception 'account_mismatch' using errcode = '28000';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 or p_expected_revision >= 9007199254740991 then
    raise exception 'invalid_revision' using errcode = '22023';
  end if;
  if p_state is null or pg_catalog.jsonb_typeof(p_state) is distinct from 'object'
     or pg_catalog.jsonb_typeof(p_state->'completed') is distinct from 'object'
     or pg_catalog.jsonb_typeof(p_state->'notes') is distinct from 'object'
     or pg_catalog.jsonb_typeof(p_state->'bookmarks') is distinct from 'array'
     or pg_catalog.jsonb_typeof(p_state->'scores') is distinct from 'object'
     or p_state->>'theme' not in ('light', 'dark')
     or p_state->>'language' not in ('ru', 'kk', 'en')
     or pg_catalog.jsonb_typeof(p_state->'profileName') is distinct from 'string' then
    raise exception 'invalid_course_state' using errcode = '22023';
  end if;
  if pg_catalog.octet_length(p_state::text) > 2097152 then
    raise exception 'course_state_too_large' using errcode = '22001';
  end if;

  if p_expected_revision = 0 then
    insert into public.ielts_course_states(user_id, revision, state)
      values(account_id, 1, p_state)
      on conflict (user_id) do nothing
      returning state into stored_state;
  else
    update public.ielts_course_states
      set state = p_state,
          revision = revision + 1,
          updated_at = pg_catalog.now()
      where user_id = account_id and revision = p_expected_revision
      returning state into stored_state;
  end if;

  if stored_state is null then
    raise exception 'course_state_conflict' using errcode = '40001';
  end if;

  return pg_catalog.jsonb_build_object(
    'state', stored_state,
    'revision', p_expected_revision + 1
  );
end;
$$;

revoke all on function public.save_ielts_course_state(uuid, jsonb, bigint) from public, anon;
grant execute on function public.save_ielts_course_state(uuid, jsonb, bigint) to authenticated;

comment on table public.ielts_course_states is 'Private IELTS progress; one RLS-protected row per Google account.';

commit;
