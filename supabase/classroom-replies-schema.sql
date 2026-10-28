-- Deployed to the LedgerPeer Supabase project as migration "classroom_message_replies".
-- Keep with the website source as the schema contract for quoted Classroom replies.
-- This migration is not intended to be re-applied to databases where it already exists.
alter table public.classroom_messages
  add column reply_to_message_id uuid;

-- The composite key prevents references to messages in other classrooms.
alter table public.classroom_messages
  add constraint classroom_messages_room_and_id_unique unique (classroom_id, id);

alter table public.classroom_messages
  add constraint classroom_messages_reply_same_room_fkey
  foreign key (classroom_id, reply_to_message_id)
  references public.classroom_messages (classroom_id, id)
  on delete set null (reply_to_message_id);

create index classroom_messages_reply_target_idx
  on public.classroom_messages (reply_to_message_id)
  where reply_to_message_id is not null;
