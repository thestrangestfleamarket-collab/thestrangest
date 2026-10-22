-- THE WORLD EDITS the owner publishes (one row per section; 'A' for now).
-- Run once in the Supabase SQL editor (project jvcetttmqseoteidfggn).
create table if not exists public.world_edits (
  id          text primary key,
  edits       jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid        default auth.uid()
);
alter table public.world_edits enable row level security;

-- anyone in the game may read the published world
drop policy if exists world_edits_read on public.world_edits;
create policy world_edits_read on public.world_edits
  for select using (true);

-- only an admin (a row in public.admins) may publish
drop policy if exists world_edits_write on public.world_edits;
create policy world_edits_write on public.world_edits
  for insert with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists world_edits_update on public.world_edits;
create policy world_edits_update on public.world_edits
  for update using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
         with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
