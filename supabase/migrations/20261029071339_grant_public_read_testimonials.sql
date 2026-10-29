-- Same pattern as members: the public role may read only the columns the website needs.
-- RLS still limits rows to published and consented quotes.
grant select (id, person_name, role, company, quote, audience, photo_url, is_featured, sort_order, is_published, consent_given, created_at)
  on public.testimonials to anon;
notify pgrst, 'reload schema';
