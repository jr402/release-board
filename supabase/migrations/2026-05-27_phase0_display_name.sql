-- Phase 0 of the back-office: members.display_name
-- Run this in Supabase SQL editor BEFORE deploying the new index.html.

alter table public.members
  add column if not exists display_name text;

-- Pre-fill display_name with the email local-part for existing members.
-- Admins can edit these via the Team modal afterwards.
update public.members
   set display_name = split_part(email, '@', 1)
 where display_name is null;
