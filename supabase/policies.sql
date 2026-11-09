-- Who may read and write what in Supabase (project jvcetttmqseoteidfggn): the row-level security rules as they stand live, read from the
-- database on 9 Nov 2026. Kept here so they are in git; running it again re-creates them as they are. Every public table has RLS on.
-- Players reach Supabase with their own login token; the website's worker uses the service key (it skips these rules) for /admin, /owned and the rest.
-- Column grants (also live): players may change only players.display_name, saves.data, bug_reports(note,status: admins by policy),
-- and insert bug_reports(body,context,id,market_id,shots). invite_codes and market_id_reserved have no policies: only join_beta() and the worker touch them.

alter table public.admins enable row level security;
alter table public.bug_reports enable row level security;
alter table public.bug_shots enable row level security;
alter table public.game_text enable row level security;
alter table public.invite_codes enable row level security;
alter table public.land_map enable row level security;
alter table public.market_id_reserved enable row level security;
alter table public.now_playing enable row level security;
alter table public.players enable row level security;
alter table public.radio_stations enable row level security;
alter table public.radio_tracks enable row level security;
alter table public.saves enable row level security;
alter table public.walker_pixels enable row level security;
alter table public.world_edits enable row level security;

-- admins: you can see whether you are one
drop policy if exists "admins: see own row" on public.admins;
create policy "admins: see own row" on public.admins for select to authenticated using ((select auth.uid()) = user_id);

-- players: your own row; you may rename yourself (the column grant allows display_name only)
drop policy if exists "players: read own row" on public.players;
create policy "players: read own row" on public.players for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "players_read_own" on public.players;
create policy "players_read_own" on public.players for select to public using (auth.uid() = id);
drop policy if exists "players: rename self" on public.players;
create policy "players: rename self" on public.players for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- saves: your own
drop policy if exists "saves: read own save" on public.saves;
create policy "saves: read own save" on public.saves for select to authenticated using ((select auth.uid()) = player_id);
drop policy if exists "saves: update own save" on public.saves;
create policy "saves: update own save" on public.saves for update to authenticated using ((select auth.uid()) = player_id) with check ((select auth.uid()) = player_id);

-- bug reports and their pictures: players send their own; admins read and mark
drop policy if exists "bug_reports: players send their own" on public.bug_reports;
create policy "bug_reports: players send their own" on public.bug_reports for insert to authenticated with check (player = (select auth.uid()));
drop policy if exists "bug_reports: admins read" on public.bug_reports;
create policy "bug_reports: admins read" on public.bug_reports for select to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "bug_reports: admins mark" on public.bug_reports;
create policy "bug_reports: admins mark" on public.bug_reports for update to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "bug_shots: players send their own" on public.bug_shots;
create policy "bug_shots: players send their own" on public.bug_shots for insert to authenticated with check (player = (select auth.uid()));
drop policy if exists "bug_shots: admins read" on public.bug_shots;
create policy "bug_shots: admins read" on public.bug_shots for select to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

-- what everyone reads and only admins write: game_text, land_map, radio_stations, radio_tracks, walker_pixels
drop policy if exists "game_text: anyone reads" on public.game_text;
create policy "game_text: anyone reads" on public.game_text for select to anon, authenticated using (true);
drop policy if exists "game_text: admins insert" on public.game_text;
create policy "game_text: admins insert" on public.game_text for insert to authenticated with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "game_text: admins update" on public.game_text;
create policy "game_text: admins update" on public.game_text for update to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "game_text: admins delete" on public.game_text;
create policy "game_text: admins delete" on public.game_text for delete to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

drop policy if exists "land_map: everyone reads" on public.land_map;
create policy "land_map: everyone reads" on public.land_map for select to anon, authenticated using (true);
drop policy if exists "land_map: admins add" on public.land_map;
create policy "land_map: admins add" on public.land_map for insert to authenticated with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "land_map: admins change" on public.land_map;
create policy "land_map: admins change" on public.land_map for update to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

drop policy if exists "radio_stations: everyone reads" on public.radio_stations;
create policy "radio_stations: everyone reads" on public.radio_stations for select to anon, authenticated using (true);
drop policy if exists "radio_stations: admins add" on public.radio_stations;
create policy "radio_stations: admins add" on public.radio_stations for insert to authenticated with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "radio_stations: admins change" on public.radio_stations;
create policy "radio_stations: admins change" on public.radio_stations for update to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "radio_stations: admins delete" on public.radio_stations;
create policy "radio_stations: admins delete" on public.radio_stations for delete to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

drop policy if exists "radio_tracks: everyone reads" on public.radio_tracks;
create policy "radio_tracks: everyone reads" on public.radio_tracks for select to anon, authenticated using (true);
drop policy if exists "radio_tracks: admins add" on public.radio_tracks;
create policy "radio_tracks: admins add" on public.radio_tracks for insert to authenticated with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "radio_tracks: admins change" on public.radio_tracks;
create policy "radio_tracks: admins change" on public.radio_tracks for update to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "radio_tracks: admins delete" on public.radio_tracks;
create policy "radio_tracks: admins delete" on public.radio_tracks for delete to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

drop policy if exists "walker_pixels: everyone reads" on public.walker_pixels;
create policy "walker_pixels: everyone reads" on public.walker_pixels for select to anon, authenticated using (true);
drop policy if exists "walker_pixels: admins add" on public.walker_pixels;
create policy "walker_pixels: admins add" on public.walker_pixels for insert to authenticated with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "walker_pixels: admins change" on public.walker_pixels;
create policy "walker_pixels: admins change" on public.walker_pixels for update to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "walker_pixels: admins delete" on public.walker_pixels;
create policy "walker_pixels: admins delete" on public.walker_pixels for delete to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

-- the cinema: everyone reads, admins change
drop policy if exists "now_playing_read" on public.now_playing;
create policy "now_playing_read" on public.now_playing for select to public using (true);
drop policy if exists "now_playing_write" on public.now_playing;
create policy "now_playing_write" on public.now_playing for update to public using (exists (select 1 from public.admins a where a.user_id = auth.uid())) with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- placed things: everyone reads; admins place anything; a player places, moves and takes back their own ('n' keys)
drop policy if exists "world_edits: everyone reads" on public.world_edits;
create policy "world_edits: everyone reads" on public.world_edits for select to anon, authenticated using (true);
drop policy if exists "world_edits: admins add" on public.world_edits;
create policy "world_edits: admins add" on public.world_edits for insert to authenticated with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "world_edits: admins change" on public.world_edits;
create policy "world_edits: admins change" on public.world_edits for update to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "world_edits: admins remove" on public.world_edits;
create policy "world_edits: admins remove" on public.world_edits for delete to authenticated using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "world_edits: players place their own" on public.world_edits;
create policy "world_edits: players place their own" on public.world_edits for insert to authenticated with check ((owner = (select auth.uid())) and (key like 'n%'));
drop policy if exists "world_edits: players change their own" on public.world_edits;
create policy "world_edits: players change their own" on public.world_edits for update to authenticated using ((owner = (select auth.uid())) and (key like 'n%')) with check ((owner = (select auth.uid())) and (key like 'n%'));
drop policy if exists "world_edits: players take their own" on public.world_edits;
create policy "world_edits: players take their own" on public.world_edits for delete to authenticated using (owner = (select auth.uid()));

-- the bug pictures' bucket and the radio's
drop policy if exists "bugs: players upload into their own folder" on storage.objects;
create policy "bugs: players upload into their own folder" on storage.objects for insert to authenticated with check ((bucket_id = 'bugs') and ((storage.foldername(name))[1] = ((select auth.uid()))::text));
drop policy if exists "bugs: admins read" on storage.objects;
create policy "bugs: admins read" on storage.objects for select to authenticated using ((bucket_id = 'bugs') and exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "radio: everyone reads" on storage.objects;
create policy "radio: everyone reads" on storage.objects for select to anon, authenticated using (bucket_id = 'radio');
drop policy if exists "radio: admins upload" on storage.objects;
create policy "radio: admins upload" on storage.objects for insert to authenticated with check ((bucket_id = 'radio') and exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "radio: admins replace" on storage.objects;
create policy "radio: admins replace" on storage.objects for update to authenticated using ((bucket_id = 'radio') and exists (select 1 from public.admins a where a.user_id = (select auth.uid()))) with check ((bucket_id = 'radio') and exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
drop policy if exists "radio: admins delete" on storage.objects;
create policy "radio: admins delete" on storage.objects for delete to authenticated using ((bucket_id = 'radio') and exists (select 1 from public.admins a where a.user_id = (select auth.uid())));
