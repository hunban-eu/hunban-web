-- Rules per membership type:
--   angel: counted unless counts_as_angel is turned off (second representatives).
--   institutional: must be linked to an institution, never counted.
--   ambassador: not a member, never counted.
alter table public.members drop constraint institutional_member_rules;
alter table public.members
  add constraint membership_rules check (
    membership = 'angel'
    or (membership = 'institutional' and institution_id is not null and counts_as_angel = false)
    or (membership = 'ambassador' and counts_as_angel = false)
  );

comment on column public.members.membership is 'angel = own angel membership (Our members); institutional = represents the linked institution (Institutional members); ambassador = HunBAN Ambassador, not a member, shown under Our members, never counted.';

-- The site now shows each angel's tier under their name:
-- community member = Community Member, actively investing = Professional Member.
grant select (role) on public.members to anon;

notify pgrst, 'reload schema';
