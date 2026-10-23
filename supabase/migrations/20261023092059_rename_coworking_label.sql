-- The label also covers offices that host several organisations on the map.
-- Display name only; the slug stays 'coworking-space' so code and links keep working.
update public.labels set name = 'Coworking / office' where slug = 'coworking-space';
