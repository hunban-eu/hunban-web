create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  person_name text not null,
  role text,
  company text,
  quote text not null check (char_length(quote) <= 400),
  audience text not null check (audience in ('founder', 'investor')),
  photo_url text,
  is_featured boolean not null default false,
  sort_order integer not null default 100,
  is_published boolean not null default false,
  consent_given boolean not null default false,
  is_placeholder boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.testimonials is 'Founder and investor quotes for the homepage and audience pages. Photos live in the public images bucket under testimonials/.';
comment on column public.testimonials.consent_given is 'Written yes from the person to show their name, quote and photo publicly.';
comment on column public.testimonials.is_placeholder is 'Mockup row for preview. Delete all placeholders before launch.';

alter table public.testimonials enable row level security;

create policy "Public reads published, consented testimonials"
  on public.testimonials for select to anon
  using (is_published and consent_given);
