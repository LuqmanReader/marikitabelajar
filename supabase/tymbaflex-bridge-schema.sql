-- Already applied through Supabase migration tymbaflex_user_consent_course_bridge.
-- No passwords, sessions, SSO link URLs, full HTML or academic grades are stored.
create table if not exists public.tymbaflex_bridge_courses (
 user_id uuid not null references auth.users(id) on delete cascade,
 source_host text not null check (source_host in ('ile.flex.tymbaedu.com','twofive.flex.tymbaedu.com')),
 course_id text not null check (course_id ~ '^[0-9]{1,12}$'),
 title text not null,
 group_name text not null default '',
 source_url text not null,
 activities jsonb not null default '[]'::jsonb,
 activity_count integer not null default 0 check (activity_count between 0 and 200),
 synced_at timestamptz not null default now(),
 primary key(user_id, source_host, course_id),
 constraint safe_course_url check (
   (source_host = 'ile.flex.tymbaedu.com' and source_url ~ '^https://ile[.]flex[.]tymbaedu[.]com/course/view[.]php[?]id=[0-9]+$')
   or
   (source_host = 'twofive.flex.tymbaedu.com' and source_url ~ '^https://twofive[.]flex[.]tymbaedu[.]com/course/view[.]php[?]id=[0-9]+$')
 )
);
alter table public.tymbaflex_bridge_courses enable row level security;
create policy "Student owns synced TYMBAFlex courses" on public.tymbaflex_bridge_courses
 for all to authenticated
 using ((select auth.uid()) = user_id)
 with check ((select auth.uid()) = user_id);
revoke all on public.tymbaflex_bridge_courses from anon;
grant select,insert,update,delete on public.tymbaflex_bridge_courses to authenticated;
