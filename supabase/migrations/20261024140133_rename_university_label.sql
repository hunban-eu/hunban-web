-- On the startup map, universities matter through their innovation units (hubs, tech transfer, startup programmes).
-- Display name only; the slug stays 'university' so code and links keep working.
update public.labels set name = 'University innovation' where slug = 'university';
