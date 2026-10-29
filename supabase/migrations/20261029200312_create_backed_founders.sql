-- Founders backed by HunBAN members, for the "Backed by HunBAN members" section.
-- One row per founder; several founders can share a startup.
-- The counter counts startups (distinct startup names), not founders.
create table public.backed_founders (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text,
  startup_name text not null,
  year integer check (year between 2000 and 2100),
  is_published boolean not null default false,
  counts_in_counter boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.backed_founders is 'Founders whose startups received investment from HunBAN members with HunBAN''s help. Shown on the For founders page.';
comment on column public.backed_founders.year is 'Year the startup was backed by HunBAN members.';
comment on column public.backed_founders.is_published is 'Show this founder on the site. Get the founder''s OK first.';
comment on column public.backed_founders.counts_in_counter is 'Include this founder''s startup in the startup counter. Each startup counts once, however many founders it has. Spell the startup name the same way on every row.';

alter table public.backed_founders enable row level security;

create policy "Public reads published backed founders"
  on public.backed_founders for select to anon
  using (is_published);

grant select (id, full_name, position, startup_name, year, is_published, created_at)
  on public.backed_founders to anon;

-- Number of distinct startups backed, published or not. Returns only the number.
create or replace function public.backed_startups_count()
returns bigint
language sql
stable security definer
set search_path to ''
as $$
  select count(distinct lower(btrim(startup_name)))
  from public.backed_founders
  where counts_in_counter;
$$;

revoke all on function public.backed_startups_count() from public;
grant execute on function public.backed_startups_count() to anon;

notify pgrst, 'reload schema';
