-- Apartment numbers. Run once in the Supabase SQL editor (project jvcetttmqseoteidfggn).
-- Every player gets a number; they count up in join order from 201, so the first account
-- (the owner) is 201. New players get the next number automatically on join.
-- The client reads players.apt; until this is applied the game just shows YOUR APARTMENT.

alter table players add column if not exists apt integer unique;
create sequence if not exists apt_seq start 201;

-- existing players, in join order: 201, 202, 203, ...
do $$
declare r record;
begin
  for r in select id from players where apt is null order by created_at nulls last, id loop
    update players set apt = nextval('apt_seq') where id = r.id;
  end loop;
end $$;

-- new players (join_beta inserts the row) get the next number
create or replace function assign_apt() returns trigger as $$
begin
  if new.apt is null then new.apt := nextval('apt_seq'); end if;
  return new;
end $$ language plpgsql;

drop trigger if exists assign_apt_trg on players;
create trigger assign_apt_trg before insert on players
  for each row execute function assign_apt();

-- a logged-in player may read their own row (so the game can show their number).
-- NOTE: this turns on row-level security for players; the worker uses the service key and is unaffected.
alter table players enable row level security;
drop policy if exists players_read_own on players;
create policy players_read_own on players for select using (auth.uid() = id);
