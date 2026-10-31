-- The startup's website. Enter it on one founder row per startup; the site uses
-- whichever founder row of that startup has it.
alter table public.backed_founders
  add column website_url text check (website_url ~ '^https://');
comment on column public.backed_founders.website_url is 'Startup website. Enough on one founder row per startup.';
grant select (website_url) on public.backed_founders to anon;
notify pgrst, 'reload schema';
