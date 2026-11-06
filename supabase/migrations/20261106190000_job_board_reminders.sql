-- Job board reminders: once a day, email the users of every startup whose
-- listing is on day 13 or 14 of its 15 days ("expires in 2 days, refresh it").
-- Hiding needs no job: a listing simply stops being shown once it is
-- 15 days old (see the security rules in the create_job_board migration).
--
-- Emails go out through Brevo's transactional API. The Brevo API key is NOT
-- in this file: it lives in Supabase Vault under the name brevo_api_key.
-- Until that secret exists, the job runs and quietly does nothing.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

create or replace function public.jb_send_reminders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text;
  s record;
  sent integer := 0;
  roles text;
  dashboard constant text := 'https://hunban.eu/jobs/dashboard';
begin
  select decrypted_secret into api_key
  from vault.decrypted_secrets where name = 'brevo_api_key' limit 1;
  if api_key is null then
    raise notice 'jb_send_reminders: no brevo_api_key in Vault, skipping';
    return 0;
  end if;

  for s in
    select st.id, st.name,
           array_agg(distinct l.id) as listing_ids,
           array_agg(distinct l.position) as positions,
           (select jsonb_agg(jsonb_build_object('email', u.email))
              from public.job_board_users u where u.startup_id = st.id) as recipients
    from public.job_listings l
    join public.job_board_startups st on st.id = l.startup_id
    where l.refreshed_at <= now() - interval '13 days'
      and l.refreshed_at >  now() - interval '15 days'
      and (l.reminder_sent_at is null or l.reminder_sent_at < l.refreshed_at)
    group by st.id, st.name
  loop
    if s.recipients is null then
      continue; -- nobody left to tell
    end if;

    select string_agg('<li>' || replace(replace(replace(p, '&', '&amp;'), '<', '&lt;'), '>', '&gt;') || '</li>', '')
      into roles from unnest(s.positions) p;

    perform net.http_post(
      url := 'https://api.brevo.com/v3/smtp/email',
      headers := jsonb_build_object(
        'api-key', api_key,
        'content-type', 'application/json',
        'accept', 'application/json'),
      body := jsonb_build_object(
        'sender', jsonb_build_object('name', 'HunBAN', 'email', 'info@hunban.eu'),
        'to', s.recipients,
        'subject', 'Your HunBAN job listing expires in 2 days',
        'htmlContent',
          '<p>Hi,</p>'
          || '<p>These listings of ' || replace(replace(s.name, '<', '&lt;'), '>', '&gt;')
          || ' on the HunBAN job board will be hidden in 2 days:</p>'
          || '<ul>' || roles || '</ul>'
          || '<p>Still hiring? Log in and press Refresh to keep them up for another 15 days:<br>'
          || '<a href="' || dashboard || '">' || dashboard || '</a></p>'
          || '<p>If the role is filled, you don''t need to do anything. The listing will simply be hidden.</p>'
          || '<p>Thanks,<br>The HunBAN team</p>'
      )
    );

    update public.job_listings set reminder_sent_at = now() where id = any(s.listing_ids);
    sent := sent + 1;
  end loop;

  return sent;
end;
$$;
revoke execute on function public.jb_send_reminders() from public, anon, authenticated;

-- Every day at 07:00 UTC (08:00 Budapest in winter, 09:00 in summer).
select cron.schedule('job-board-reminders', '0 7 * * *', $$select public.jb_send_reminders();$$);
