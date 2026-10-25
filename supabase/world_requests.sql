-- World change requests. Run once in the Supabase SQL editor (project jvcetttmqseoteidfggn).
-- What a player changes in EDIT WORLD waits here for the owner (TENANTS > REQUESTS); the approved rows are what every game puts live.
-- Only the worker touches it (service key: players send through /world, the owner decides through /admin); until this is applied,
-- REQUESTS says it would not load and a player's SEND says "not kept".

create table if not exists world_requests (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null,
  name        text        not null default '',
  created_at  timestamptz not null default now(),
  kind        text        not null default 'edit',
  payload     jsonb       not null,
  at          jsonb,
  lvl         text        not null default '',
  status      text        not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decided_by  uuid,
  decided_at  timestamptz
);
create index if not exists world_requests_status on world_requests (status, created_at);

-- no policies: the game's publishable key can neither read nor write it
alter table world_requests enable row level security;
