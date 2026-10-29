-- Deployed by Supabase migration lp_ai_tutor_groq_daily_usage.
-- Canonical schema for LedgerPeer's authenticated GroqCloud tutor rate-limiting.
create table if not exists public.lp_ai_tutor_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null default (now() at time zone 'utc')::date,
  requests integer not null default 0 check (requests >= 0),
  primary key(user_id,usage_day)
);
alter table public.lp_ai_tutor_daily_usage enable row level security;
revoke all on table public.lp_ai_tutor_daily_usage from anon, authenticated;
create or replace function public.lp_ai_tutor_take_slot(p_user_id uuid, p_max integer default 15)
returns integer language plpgsql security definer set search_path = ''
as $$
declare v_used integer;
begin
  if p_user_id is null or p_max < 1 or p_max > 100 then
    raise exception 'Invalid usage reservation' using errcode = '22023';
  end if;
  insert into public.lp_ai_tutor_daily_usage(user_id, usage_day, requests)
  values(p_user_id, (now() at time zone 'utc')::date, 1)
  on conflict(user_id, usage_day)
  do update set requests = public.lp_ai_tutor_daily_usage.requests + 1
  where public.lp_ai_tutor_daily_usage.requests < p_max
  returning requests into v_used;
  if v_used is null then return -1; end if;
  return p_max - v_used;
end;
$$;
revoke all on function public.lp_ai_tutor_take_slot(uuid, integer) from public, anon, authenticated;
grant execute on function public.lp_ai_tutor_take_slot(uuid, integer) to service_role;
