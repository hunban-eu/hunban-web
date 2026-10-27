-- Totals for the About page counter. Counts every row, including members and
-- institutions who haven't consented to be shown, but returns only the numbers:
-- no names or other data leave the database. Runs with the owner's rights
-- (security definer) so it can count past row level security.
create or replace function public.network_counts()
returns table (angels bigint, institutions bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.members),
    (select count(*) from public.institutions);
$$;

revoke all on function public.network_counts() from public;
grant execute on function public.network_counts() to anon;
