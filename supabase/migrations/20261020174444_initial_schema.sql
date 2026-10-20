-- hunban.eu initial database schema (approved design, 2026-10-20)
-- Tables: labels, organisations, organisation_labels, events,
--         institutions, sectors, members, member_sectors
-- Plus: public "images" storage bucket.

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- ===== Ecosystem map =====
create table public.labels (
  id smallint generated always as identity primary key,
  name text not null unique,
  slug text not null unique,
  sort_order smallint not null default 0,
  pin_colour text,
  created_at timestamptz not null default now()
);

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text check (char_length(description) <= 160),
  website_url text check (website_url ~ '^https://'),
  linkedin_url text check (linkedin_url ~ '^https://'),
  city text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  is_published boolean not null default false,
  is_highlighted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organisations_published_needs_coordinates
    check (not is_published or (latitude is not null and longitude is not null))
);
create trigger organisations_updated_at before update on public.organisations
  for each row execute function public.set_updated_at();

create table public.organisation_labels (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  label_id smallint not null references public.labels(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organisation_id, label_id)
);
create index organisation_labels_label_idx on public.organisation_labels(label_id);

-- ===== Events =====
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  organiser text,
  registration_url text check (registration_url ~ '^https://'),
  is_hunban boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (ends_at is null or ends_at >= starts_at)
);
create index events_starts_at_idx on public.events(starts_at);
create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

-- ===== Members =====
create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  website_url text check (website_url ~ '^https://'),
  linkedin_url text check (linkedin_url ~ '^https://'),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger institutions_updated_at before update on public.institutions
  for each row execute function public.set_updated_at();

create table public.sectors (
  id smallint generated always as identity primary key,
  name text not null unique,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  clickup_task_id text unique,
  full_name text not null,
  photo_url text,
  linkedin_url text check (linkedin_url ~ '^https://'),
  role text check (role in ('community member', 'actively investing')),
  institution_id uuid references public.institutions(id) on delete set null,
  city text,
  county text,
  country text,
  based_abroad boolean not null default false,
  consent_given boolean not null default false,
  consent_date date,
  consent_note text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_published_needs_consent check (not is_published or consent_given)
);
create index members_institution_idx on public.members(institution_id);
create trigger members_updated_at before update on public.members
  for each row execute function public.set_updated_at();

create table public.member_sectors (
  member_id uuid not null references public.members(id) on delete cascade,
  sector_id smallint not null references public.sectors(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (member_id, sector_id)
);
create index member_sectors_sector_idx on public.member_sectors(sector_id);

-- ===== Row Level Security =====
alter table public.labels enable row level security;
alter table public.organisations enable row level security;
alter table public.organisation_labels enable row level security;
alter table public.events enable row level security;
alter table public.institutions enable row level security;
alter table public.sectors enable row level security;
alter table public.members enable row level security;
alter table public.member_sectors enable row level security;

-- Public (anon) read grants. No insert/update/delete grants for anon.
grant select on public.labels, public.organisations, public.organisation_labels,
  public.events, public.institutions, public.sectors, public.member_sectors to anon;
-- members: display columns only (clickup_task_id, consent_date, consent_note stay hidden)
grant select (id, full_name, photo_url, linkedin_url, role, institution_id,
  city, county, country, based_abroad, consent_given, is_published) on public.members to anon;

create policy "Public reads labels" on public.labels
  for select to anon using (true);
create policy "Public reads sectors" on public.sectors
  for select to anon using (true);
create policy "Public reads published organisations" on public.organisations
  for select to anon using (is_published);
create policy "Public reads labels of published organisations" on public.organisation_labels
  for select to anon using (exists (
    select 1 from public.organisations o
    where o.id = organisation_id and o.is_published));
create policy "Public reads published events" on public.events
  for select to anon using (is_published);
create policy "Public reads published institutions" on public.institutions
  for select to anon using (is_published);
create policy "Public reads published, consented members" on public.members
  for select to anon using (is_published and consent_given);
create policy "Public reads sectors of visible members" on public.member_sectors
  for select to anon using (exists (
    select 1 from public.members m
    where m.id = member_id and m.is_published and m.consent_given));

-- ===== Seed data =====
insert into public.labels (name, slug, sort_order) values
  ('VC', 'vc', 1),
  ('Incubator', 'incubator', 2),
  ('Accelerator', 'accelerator', 3),
  ('Coworking space', 'coworking-space', 4),
  ('Scaleup', 'scaleup', 5),
  ('University', 'university', 6),
  ('Public body', 'public-body', 7),
  ('Corporate innovation', 'corporate-innovation', 8),
  ('Service provider', 'service-provider', 9),
  ('Ecosystem organisation', 'ecosystem-organisation', 10);

insert into public.sectors (name, sort_order) values
  ('SaaS / Enterprise software', 1),
  ('Fintech', 2),
  ('Health / Medtech', 3),
  ('AI / ML', 4),
  ('Deeptech / Hardware', 5),
  ('Marketplace / E-commerce', 6),
  ('Mobility', 7),
  ('Energy / Cleantech', 8),
  ('Foodtech / Agritech', 9),
  ('Edtech', 10),
  ('Proptech', 11),
  ('Gaming / Media', 12),
  ('Cybersecurity', 13),
  ('Other', 14);

-- ===== Storage: public images bucket (view by URL, no listing, admin-only uploads) =====
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;
