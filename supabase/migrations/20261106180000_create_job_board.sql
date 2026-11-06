-- Job board (/jobs): startups in the HunBAN network post job ads that link out.
-- hunban.eu stores NO applicant data: candidates apply on the startup's own page.
--
-- Three tables:
--   job_board_startups  one row per startup. Listings belong to the startup,
--                       so co-founders share one dashboard and listings survive
--                       when a user is removed.
--   job_board_users     who may log in (email + startup). Adam adds rows by hand
--                       in the Supabase Table Editor. No public sign-up.
--   job_listings        the ads themselves. A listing is live for 15 days after
--                       it was published or last refreshed, then it is hidden
--                       (never deleted automatically).
--
-- Security model: everything goes through Row Level Security.
--   anon (public site): reads live listings and the names of startups that have one.
--   authenticated:      reads and writes only its own startup's listings.
--   admin users:        see and change every listing.

create extension if not exists pg_trgm with schema extensions;

-- ===== Name normalisation =====
-- "  Acme   Labs " and "acme labs" are the same startup.
create or replace function public.jb_name_key(name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(regexp_replace(btrim(name), '\s+', ' ', 'g'));
$$;
revoke execute on function public.jb_name_key(text) from public, anon, authenticated;

-- ===== Tables =====
create table public.job_board_startups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  name_key text generated always as (public.jb_name_key(name)) stored unique,
  created_at timestamptz not null default now()
);
comment on table public.job_board_startups is 'Startups on the /jobs board. Usually created automatically when a job_board_users row names a new startup.';

create table public.job_board_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  startup_name text,
  startup_id uuid references public.job_board_startups(id) on delete restrict,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  constraint job_board_users_needs_startup check (is_admin or startup_id is not null)
);
create index job_board_users_startup_idx on public.job_board_users(startup_id);
comment on table public.job_board_users is 'Who may log in to the /jobs dashboard. Add a row with email + startup_name; the startup is matched or created automatically. Admins (is_admin) see all listings and need no startup.';
comment on column public.job_board_users.startup_name is 'Type the startup name. It is matched case- and space-insensitively to an existing startup; a near-duplicate is rejected with a hint.';

create table public.job_listings (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.job_board_startups(id) on delete cascade,
  position text not null check (char_length(btrim(position)) between 1 and 120),
  employment_type text not null check (employment_type in ('full-time', 'part-time', 'internship')),
  work_mode text not null check (work_mode in ('remote', 'hybrid', 'on-site')),
  city text check (city is null or char_length(btrim(city)) between 1 and 80),
  description text check (description is null or char_length(description) <= 160),
  apply_url text not null check (apply_url ~ '^https?://[^\s]+$' and char_length(apply_url) <= 500),
  refreshed_at timestamptz not null default now(),
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_listings_city_unless_remote check (work_mode = 'remote' or city is not null)
);
create index job_listings_startup_idx on public.job_listings(startup_id);
create index job_listings_refreshed_idx on public.job_listings(refreshed_at);
comment on table public.job_listings is 'Job ads on /jobs. Live while refreshed_at is less than 15 days old; older rows are hidden, not deleted.';
comment on column public.job_listings.refreshed_at is 'Published or last refreshed. Set by the database, users cannot backdate or postdate it.';

-- ===== Triggers =====
-- Users: tidy the email, match or create the startup, block near-duplicate names.
create or replace function public.jb_users_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  key text;
  match_id uuid;
  match_name text;
  similar_name text;
begin
  new.email := lower(btrim(new.email));

  if new.startup_name is not null and btrim(new.startup_name) <> '' then
    new.startup_name := regexp_replace(btrim(new.startup_name), '\s+', ' ', 'g');
    key := public.jb_name_key(new.startup_name);

    select id, name into match_id, match_name
    from public.job_board_startups where name_key = key;

    if match_id is null then
      select s.name into similar_name
      from public.job_board_startups s
      where extensions.similarity(s.name_key, key) >= 0.5
      order by extensions.similarity(s.name_key, key) desc
      limit 1;

      if similar_name is not null then
        raise exception 'Startup "%" looks like the existing startup "%". Use exactly "%" to join it. If it really is a different startup, first add it as a new row in job_board_startups, then try again.',
          new.startup_name, similar_name, similar_name;
      end if;

      insert into public.job_board_startups (name) values (new.startup_name)
      returning id, name into match_id, match_name;
    end if;

    new.startup_id := match_id;
    new.startup_name := match_name;
  elsif new.startup_id is not null then
    select name into new.startup_name from public.job_board_startups where id = new.startup_id;
  end if;

  return new;
end;
$$;
revoke execute on function public.jb_users_before_write() from public, anon, authenticated;

create trigger job_board_users_before_write
  before insert or update of email, startup_name, startup_id on public.job_board_users
  for each row execute function public.jb_users_before_write();

-- Listings: the database owns the dates. Inserting sets refreshed_at to now;
-- an update may only move refreshed_at to "now" (the Refresh / Reactivate button).
create or replace function public.jb_listings_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.position := btrim(new.position);
  new.city := nullif(btrim(coalesce(new.city, '')), '');
  new.description := nullif(btrim(coalesce(new.description, '')), '');
  new.apply_url := btrim(new.apply_url);

  if tg_op = 'INSERT' then
    new.refreshed_at := now();
    new.created_at := now();
    new.reminder_sent_at := null;
  else
    new.created_at := old.created_at;
    if new.refreshed_at is distinct from old.refreshed_at then
      new.refreshed_at := now();
    end if;
    -- only the reminder job (running as postgres) may set reminder_sent_at
    if current_user in ('anon', 'authenticated') then
      new.reminder_sent_at := old.reminder_sent_at;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
revoke execute on function public.jb_listings_before_write() from public, anon, authenticated;

create trigger job_listings_before_write
  before insert or update on public.job_listings
  for each row execute function public.jb_listings_before_write();

-- ===== Helpers used by the security rules =====
-- They run with the owner's rights so they can look up the logged-in user's
-- row without opening job_board_users itself to the API.
create or replace function public.jb_my_startup_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select startup_id from public.job_board_users
  where email = lower(auth.jwt() ->> 'email');
$$;

create or replace function public.jb_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_admin from public.job_board_users
                   where email = lower(auth.jwt() ->> 'email')), false);
$$;

revoke execute on function public.jb_my_startup_id() from public, anon;
revoke execute on function public.jb_is_admin() from public, anon;
grant execute on function public.jb_my_startup_id() to authenticated;
grant execute on function public.jb_is_admin() to authenticated;

-- ===== Row Level Security =====
alter table public.job_board_startups enable row level security;
alter table public.job_board_users enable row level security;
alter table public.job_listings enable row level security;

-- Start from zero, then grant exactly what each role needs.
revoke all on public.job_board_startups, public.job_board_users, public.job_listings
  from anon, authenticated;

-- Public site: live listings (without internal columns) and their startups' names.
grant select (id, startup_id, position, employment_type, work_mode, city, description, apply_url, refreshed_at)
  on public.job_listings to anon;
grant select (id, name) on public.job_board_startups to anon;

create policy "Public reads live listings" on public.job_listings
  for select to anon
  using (refreshed_at > now() - interval '15 days');

create policy "Public reads startups with a live listing" on public.job_board_startups
  for select to anon
  using (exists (
    select 1 from public.job_listings l
    where l.startup_id = job_board_startups.id and l.refreshed_at > now() - interval '15 days'));

-- Logged-in users: their own startup's listings (live and hidden). Admins: all.
grant select, delete on public.job_listings to authenticated;
grant insert (startup_id, position, employment_type, work_mode, city, description, apply_url)
  on public.job_listings to authenticated;
grant update (startup_id, position, employment_type, work_mode, city, description, apply_url, refreshed_at)
  on public.job_listings to authenticated;
grant select (id, name) on public.job_board_startups to authenticated;
grant select (id, email, startup_id, startup_name, is_admin) on public.job_board_users to authenticated;

create policy "Users read their startup's listings" on public.job_listings
  for select to authenticated
  using (startup_id = (select public.jb_my_startup_id()) or (select public.jb_is_admin()));

create policy "Users add listings for their startup" on public.job_listings
  for insert to authenticated
  with check (startup_id = (select public.jb_my_startup_id()) or (select public.jb_is_admin()));

create policy "Users edit their startup's listings" on public.job_listings
  for update to authenticated
  using (startup_id = (select public.jb_my_startup_id()) or (select public.jb_is_admin()))
  with check (startup_id = (select public.jb_my_startup_id()) or (select public.jb_is_admin()));

create policy "Users delete their startup's listings" on public.job_listings
  for delete to authenticated
  using (startup_id = (select public.jb_my_startup_id()) or (select public.jb_is_admin()));

create policy "Users read their own startup" on public.job_board_startups
  for select to authenticated
  using (id = (select public.jb_my_startup_id()) or (select public.jb_is_admin()));

create policy "Users read their own row" on public.job_board_users
  for select to authenticated
  using (email = lower(auth.jwt() ->> 'email') or (select public.jb_is_admin()));

-- ===== Login gate =====
-- Supabase Auth "Before User Created" hook: only emails already in
-- job_board_users can get an account. Turn it on in
-- Authentication > Hooks > Before User Created > Postgres function jb_before_user_created.
create or replace function public.jb_before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.job_board_users
    where email = lower(event -> 'user' ->> 'email')
  ) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object(
    'http_code', 403,
    'message', 'This email is not registered for the HunBAN job board.'));
end;
$$;
revoke execute on function public.jb_before_user_created(jsonb) from public, anon, authenticated;
grant execute on function public.jb_before_user_created(jsonb) to supabase_auth_admin;
