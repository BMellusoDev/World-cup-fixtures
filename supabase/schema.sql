create extension if not exists pgcrypto;

create table if not exists public.pool_leagues (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  season_year integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pool_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.pool_leagues(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (league_id, display_name)
);

create table if not exists public.pool_predictions (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.pool_leagues(id) on delete cascade,
  member_id uuid not null references public.pool_members(id) on delete cascade,
  match_key text not null,
  pred_home integer not null check (pred_home >= 0),
  pred_away integer not null check (pred_away >= 0),
  updated_at timestamptz not null default now(),
  unique (league_id, member_id, match_key)
);

create table if not exists public.pool_results (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.pool_leagues(id) on delete cascade,
  match_key text not null,
  score_home integer not null check (score_home >= 0),
  score_away integer not null check (score_away >= 0),
  updated_at timestamptz not null default now(),
  unique (league_id, match_key)
);

create index if not exists idx_pool_members_league on public.pool_members(league_id);
create index if not exists idx_pool_predictions_league_member on public.pool_predictions(league_id, member_id);
create index if not exists idx_pool_results_league on public.pool_results(league_id);

alter table public.pool_leagues enable row level security;
alter table public.pool_members enable row level security;
alter table public.pool_predictions enable row level security;
alter table public.pool_results enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pool_leagues' and policyname = 'pool_leagues_public_all'
  ) then
    create policy pool_leagues_public_all on public.pool_leagues for all using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pool_members' and policyname = 'pool_members_public_all'
  ) then
    create policy pool_members_public_all on public.pool_members for all using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pool_predictions' and policyname = 'pool_predictions_public_all'
  ) then
    create policy pool_predictions_public_all on public.pool_predictions for all using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'pool_results' and policyname = 'pool_results_public_all'
  ) then
    create policy pool_results_public_all on public.pool_results for all using (true) with check (true);
  end if;
end
$$;
