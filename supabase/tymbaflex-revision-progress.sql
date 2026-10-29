-- TYMBAFlex Revision Dashboard · student-owned self-reported revision status
-- This is NOT Moodle completion or an official grade/attempt record.
create table if not exists public.tymbaflex_revision_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  source_host text not null,
  course_id text not null,
  activity_url text not null,
  revision_status text not null default 'to_review'
    check (revision_status in ('to_review','studying','revised')),
  note text not null default '' check (char_length(note) <= 500),
  updated_at timestamptz not null default now(),
  primary key (user_id, source_host, course_id, activity_url),
  foreign key (user_id, source_host, course_id)
    references public.tymbaflex_bridge_courses(user_id,source_host,course_id)
    on delete cascade,
  constraint tf_revision_url_allowlist check (
    (source_host='ile.flex.tymbaedu.com' and
      activity_url ~ '^https://ile[.]flex[.]tymbaedu[.]com/mod/(quiz|resource|assign|page|forum|lesson|url|book|folder|h5pactivity|scorm)/view[.]php[?]id=[0-9]{1,12}$')
    or
    (source_host='twofive.flex.tymbaedu.com' and
      activity_url ~ '^https://twofive[.]flex[.]tymbaedu[.]com/mod/(quiz|resource|assign|page|forum|lesson|url|book|folder|h5pactivity|scorm)/view[.]php[?]id=[0-9]{1,12}$')
  )
);
alter table public.tymbaflex_revision_progress enable row level security;
drop policy if exists "Students manage own TYMBAFlex revision" on public.tymbaflex_revision_progress;
create policy "Students manage own TYMBAFlex revision"
  on public.tymbaflex_revision_progress for all to authenticated
  using ((select auth.uid())=user_id)
  with check ((select auth.uid())=user_id);
revoke all on public.tymbaflex_revision_progress from anon;
grant select,insert,update,delete on public.tymbaflex_revision_progress to authenticated;
create index if not exists tymbaflex_revision_progress_user_idx
  on public.tymbaflex_revision_progress(user_id,updated_at desc);
