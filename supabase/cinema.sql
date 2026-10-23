-- The cinema's shared "now playing" state. Run once in the Supabase SQL editor (project jvcetttmqseoteidfggn).
-- This table was never created, so the theatre's poll 404s for everyone every few seconds. The client now stops
-- polling after a 404 (fails quietly), but the cinema only actually works once this table exists.

create table if not exists now_playing (
  id          text primary key,
  playlist    jsonb       not null default '[]',
  idx         integer     not null default 0,
  video_id    text        not null default '',
  started_at  timestamptz,
  size        real        not null default 1,
  brightness  real        not null default 0.8,
  loop        boolean     not null default true,
  autoplay    boolean     not null default true,
  updated_at  timestamptz not null default now()
);

insert into now_playing (id) values ('theatre') on conflict (id) do nothing;

alter table now_playing enable row level security;

-- anyone (incl. the game's publishable key) may read the shared state
drop policy if exists now_playing_read on now_playing;
create policy now_playing_read on now_playing for select using (true);

-- only admins may change what's playing
drop policy if exists now_playing_write on now_playing;
create policy now_playing_write on now_playing for update
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));
