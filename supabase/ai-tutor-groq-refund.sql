-- Deployed migration lp_ai_tutor_refund_failed_groq_requests
-- Restore a reserved daily message when Groq returns an error before generating an answer.
create or replace function public.lp_ai_tutor_refund_slot(p_user_id uuid)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare v_used integer;
begin
  if p_user_id is null then
    raise exception 'User required' using errcode = '22023';
  end if;
  update public.lp_ai_tutor_daily_usage
  set requests = greatest(requests - 1, 0)
  where user_id = p_user_id
    and usage_day = (now() at time zone 'utc')::date
    and requests > 0
  returning requests into v_used;
  return coalesce(v_used, 0);
end;
$$;
revoke all on function public.lp_ai_tutor_refund_slot(uuid) from public, anon, authenticated;
grant execute on function public.lp_ai_tutor_refund_slot(uuid) to service_role;
