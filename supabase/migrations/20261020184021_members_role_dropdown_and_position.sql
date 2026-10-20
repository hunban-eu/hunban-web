-- role becomes a dropdown (enum) in the table editor; position holds the job title.
create type public.hunban_role as enum ('community member', 'actively investing');
alter table public.members drop constraint members_role_check;
alter table public.members
  alter column role type public.hunban_role using role::public.hunban_role;
alter table public.members add column position text;
grant select (position) on public.members to anon;
