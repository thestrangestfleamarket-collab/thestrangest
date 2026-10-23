-- Apartment numbers. Run once in the Supabase SQL editor (project jvcetttmqseoteidfggn).
-- Every player gets a number; the owner (admins) is 201; everyone else counts up in join order.
-- The client reads players.apt; until this is applied it just shows YOUR APARTMENT.

alter table players add column if not exists apt integer unique;
create sequence if not exists apt_seq start 202;

-- backfill: owner(s) -> 201, then the rest in join order
update players p set apt = 201
  where apt is null and exists (select 1 from admins a where a.user_id = p.id);
do $$
declare r record;
begin
  for r in select id from players where apt is null order by created_at nulls last, id loop
    update players set apt = nextval('apt_seq') where id = r.id;
  end loop;
end $$;

-- new players (join_beta inserts the row): owner -> 201, else next number
create or replace function assign_apt() returns trigger as $$
begin
  if new.apt is null then
    if exists (select 1 from admins a where a.user_id = new.id) then new.apt := 201;
    else new.apt := nextval('apt_seq'); end if;
  end if;
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
