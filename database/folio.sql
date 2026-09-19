-- Isolated Folio ingestion objects. No existing MacroGuru objects are modified.
create table public.folio_access (token_hash text primary key);
create table public.folio_posts (id text primary key, source text not null, canonical_url text not null, payload jsonb not null, published_at timestamptz not null, first_seen timestamptz not null default now(), last_seen timestamptz not null default now());
create index folio_posts_source_date on public.folio_posts(source,published_at desc);
create table public.folio_cache (key text primary key, payload jsonb not null, expires_at timestamptz not null);
create table public.folio_runs (id uuid primary key default gen_random_uuid(), window_key text unique not null, window_end timestamptz not null, created_at timestamptz not null default now(), state text not null default 'reserved', reserved_usd numeric not null default 0.10 check(reserved_usd=0.10), run_id text, dataset_id text, actual_usd numeric, details jsonb);
alter table public.folio_access enable row level security;
alter table public.folio_posts enable row level security;
alter table public.folio_cache enable row level security;
alter table public.folio_runs enable row level security;
revoke all on public.folio_access,public.folio_posts,public.folio_cache,public.folio_runs from anon, authenticated;
grant select,insert,update on public.folio_access,public.folio_posts,public.folio_cache,public.folio_runs to service_role;
create function public.folio_reserve(p_key text,p_end timestamptz) returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare prior public.folio_runs; fresh public.folio_runs; used numeric;
begin
 perform pg_advisory_xact_lock(918192026);
 select * into prior from public.folio_runs where window_key=p_key;
 if found then return jsonb_build_object('allowed',false,'reason','window_already_reserved','run',to_jsonb(prior)); end if;
 if exists(select 1 from public.folio_runs where state in ('reserved','running','unknown')) then return jsonb_build_object('allowed',false,'reason','unresolved_run'); end if;
 if exists(select 1 from public.folio_runs where created_at>now()-interval '24 hours') then return jsonb_build_object('allowed',false,'reason','24_hour_cooldown'); end if;
 select coalesce(sum(reserved_usd),0) into used from public.folio_runs where created_at>=date_trunc('month',now() at time zone 'UTC') at time zone 'UTC';
 if used+0.10>0.50 then return jsonb_build_object('allowed',false,'reason','monthly_budget_exhausted'); end if;
 insert into public.folio_runs(window_key,window_end) values(p_key,p_end) returning * into fresh;
 return jsonb_build_object('allowed',true,'run',to_jsonb(fresh),'monthlyReservedUsd',used+0.10);
end $$;
revoke all on function public.folio_reserve(text,timestamptz) from public,anon,authenticated;
grant execute on function public.folio_reserve(text,timestamptz) to service_role;
