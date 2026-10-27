-- New 'Startup' label (added by Adam in the table editor, id 12, slug 'startup').
-- Startup and Scaleup go last, in that order, so the company stages sit together.
update public.labels set sort_order = case slug
  when 'vc' then 1
  when 'incubator' then 2
  when 'accelerator' then 3
  when 'coworking-space' then 4
  when 'university' then 5
  when 'public-body' then 6
  when 'corporate-innovation' then 7
  when 'service-provider' then 8
  when 'ecosystem-organisation' then 9
  when 'startup-community' then 10
  when 'startup' then 11
  when 'scaleup' then 12
  else sort_order end;
