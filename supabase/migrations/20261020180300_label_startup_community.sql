-- Eleventh map label, added 2026-10-20 (applied via SQL editor; recorded here for completeness).
insert into public.labels (name, slug, sort_order)
values ('Startup community', 'startup-community', 11)
on conflict (slug) do nothing;
