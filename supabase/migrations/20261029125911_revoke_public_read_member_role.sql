-- The site doesn't use members.role (community member / actively investing).
-- Keep it private until v2 uses it for investor segmentation.
revoke select (role) on public.members from anon;
notify pgrst, 'reload schema';
