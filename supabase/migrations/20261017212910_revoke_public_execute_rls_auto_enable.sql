-- Supabase's "automatic RLS" project setting creates public.rls_auto_enable().
-- It should not be callable through the public API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
