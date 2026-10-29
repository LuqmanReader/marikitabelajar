-- Moodle quiz review snapshots, only after the student explicitly chooses Capture.
-- Question labels only (no responses, answer keys, question text, session credentials or raw HTML).
create table if not exists public.tymbaflex_quiz_attempts (
 user_id uuid not null references auth.users(id) on delete cascade,
 source_host text not null check(source_host in ('ile.flex.tymbaedu.com','twofive.flex.tymbaedu.com')),
 course_id text not null check(course_id ~ '^[0-9]{1,12}$'),
 quiz_url text not null,
 attempt_id text not null check(attempt_id ~ '^[0-9]{1,20}$'),
 question_states jsonb not null,
 captured_at timestamptz not null default now(),
 primary key(user_id,source_host,attempt_id),
 foreign key(user_id,source_host,course_id)
  references public.tymbaflex_bridge_courses(user_id,source_host,course_id) on delete cascade,
 constraint tf_quiz_url_check check(
  (source_host='ile.flex.tymbaedu.com' and
   quiz_url ~ '^https://ile[.]flex[.]tymbaedu[.]com/mod/quiz/view[.]php[?]id=[0-9]{1,12}$')
  or (source_host='twofive.flex.tymbaedu.com' and
   quiz_url ~ '^https://twofive[.]flex[.]tymbaedu[.]com/mod/quiz/view[.]php[?]id=[0-9]{1,12}$')
 ),
 constraint tf_question_states_check check(
  jsonb_typeof(question_states)='array'
  and jsonb_array_length(question_states) between 1 and 200
  and not jsonb_path_exists(question_states,
   '$[*] ? (@ != "correct" && @ != "incorrect" && @ != "partial" && @ != "ungraded" && @ != "unanswered")')
 )
);
alter table public.tymbaflex_quiz_attempts enable row level security;
create policy "Students own their imported quiz reviews"
 on public.tymbaflex_quiz_attempts for all to authenticated
 using ((select auth.uid())=user_id)
 with check ((select auth.uid())=user_id);
revoke all on public.tymbaflex_quiz_attempts from anon;
grant select,insert,update,delete on public.tymbaflex_quiz_attempts to authenticated;
create index if not exists tf_quiz_attempts_lookup
 on public.tymbaflex_quiz_attempts(user_id,source_host,course_id,quiz_url,captured_at desc);
