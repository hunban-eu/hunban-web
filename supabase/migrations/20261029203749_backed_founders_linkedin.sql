-- LinkedIn link, same as members.linkedin_url.
alter table public.backed_founders
  add column linkedin_url text check (linkedin_url ~ '^https://');
grant select (linkedin_url) on public.backed_founders to anon;
notify pgrst, 'reload schema';
