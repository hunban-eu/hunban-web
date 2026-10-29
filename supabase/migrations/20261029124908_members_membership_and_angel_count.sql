-- Which membership a person belongs to, and whether they count in the angel counter.
--   membership = 'angel': listed under "Our members" (their own angel membership).
--   membership = 'institutional': listed under "Institutional members" as the
--     representative of the linked institution. Never counted as an angel.
--   counts_as_angel = false: shown on the site but left out of the counter,
--     e.g. the second representative of an angel membership.
-- institution_id keeps its meaning as the person's affiliation; for an angel it
-- is just shown next to their position, for an institutional member it says
-- which institution they represent.
create type public.hunban_membership as enum ('angel', 'institutional');

alter table public.members
  add column membership public.hunban_membership not null default 'angel',
  add column counts_as_angel boolean not null default true;

comment on column public.members.membership is 'angel = own angel membership (Our members); institutional = represents the linked institution (Institutional members).';
comment on column public.members.counts_as_angel is 'Include in the angel counter on the About page. Turn off for second representatives. Always off for institutional representatives.';

-- (Existing institutional representatives were updated directly in the database.
--  Member data is not stored in this public repo.)

alter table public.members
  add constraint institutional_member_rules check (
    membership = 'angel'
    or (institution_id is not null and counts_as_angel = false)
  );

-- The website needs to know which section a person belongs to.
grant select (membership) on public.members to anon;

-- The counter: angels = angel memberships that count; institutions unchanged.
create or replace function public.network_counts()
returns table(angels bigint, institutions bigint)
language sql
stable security definer
set search_path to ''
as $$
  select
    (select count(*) from public.members where membership = 'angel' and counts_as_angel),
    (select count(*) from public.institutions);
$$;

notify pgrst, 'reload schema';
