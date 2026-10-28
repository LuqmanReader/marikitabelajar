-- Already deployed to project vtffliycmezpzbpdjmiu (2026-10-28).
-- Stored for schema reproducibility; do not rerun blindly.
alter table public.student_profiles
  add column if not exists current_papers text[] not null default '{}'::text[];

update public.student_profiles
set current_papers = array[current_paper]
where cardinality(current_papers) = 0
  and nullif(btrim(current_paper), '') is not null;

alter table public.student_profiles
  add constraint student_profiles_current_papers_limit
  check (cardinality(current_papers) <= 25 and array_position(current_papers, null) is null);
