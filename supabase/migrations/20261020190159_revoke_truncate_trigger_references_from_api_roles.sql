-- Public API roles may only read (via RLS policies). Remove leftover default
-- privileges that are not needed: TRUNCATE (empties a table, bypassing RLS),
-- TRIGGER and REFERENCES. Applies to existing and future tables in public.
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke truncate, trigger, references on tables from anon, authenticated;
