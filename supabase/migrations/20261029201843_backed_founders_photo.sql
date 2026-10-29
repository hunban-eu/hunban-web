-- Photo link, same as members.photo_url (upload to the public images bucket, paste the link).
alter table public.backed_founders add column photo_url text;
grant select (photo_url) on public.backed_founders to anon;
notify pgrst, 'reload schema';
