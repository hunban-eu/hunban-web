-- Job board retention, as promised in the privacy notice (v2.1, Section 10):
-- listings are public for 15 days, then hidden, and deleted 3 months after
-- they were last published or refreshed. Runs every day at 03:00 UTC.

select cron.schedule(
  'job-board-cleanup',
  '0 3 * * *',
  $$delete from public.job_listings where refreshed_at < now() - interval '3 months';$$
);
