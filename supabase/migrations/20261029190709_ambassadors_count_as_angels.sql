-- Ambassadors are angel investors too, so they count like angels
-- (unless counts_as_angel is turned off). Institutional representatives still never count.
alter table public.members drop constraint membership_rules;
alter table public.members
  add constraint membership_rules check (
    membership in ('angel', 'ambassador')
    or (membership = 'institutional' and institution_id is not null and counts_as_angel = false)
  );

comment on column public.members.membership is 'angel = own angel membership (Our members); ambassador = HunBAN Ambassador, an angel who is not a member, shown under Our members and counted; institutional = represents the linked institution (Institutional members), never counted.';
comment on column public.members.counts_as_angel is 'Include in the angel counter on the About page (angels and ambassadors). Turn off for second representatives. Always off for institutional representatives.';

create or replace function public.network_counts()
returns table(angels bigint, institutions bigint)
language sql
stable security definer
set search_path to ''
as $$
  select
    (select count(*) from public.members where membership in ('angel', 'ambassador') and counts_as_angel),
    (select count(*) from public.institutions);
$$;

notify pgrst, 'reload schema';
