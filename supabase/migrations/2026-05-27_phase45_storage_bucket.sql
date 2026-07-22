-- ============================================================
-- Phase 4.5 — Storage bucket for board images
-- Moves image binaries out of the boards_data JSONB so saves stay fast.
-- Run in Supabase SQL editor. Idempotent.
-- ============================================================

-- Public bucket (URLs are stable, unguessable thanks to hash-based paths).
insert into storage.buckets (id, name, public)
values ('board-images', 'board-images', true)
on conflict (id) do nothing;

-- INSERT — editors + admins only
drop policy if exists "board_images_insert" on storage.objects;
create policy "board_images_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'board-images'
    and public.current_role() in ('admin','editor')
  );

-- SELECT — any authenticated member (public URLs work without auth anyway,
-- this is only for API listing/metadata).
drop policy if exists "board_images_select" on storage.objects;
create policy "board_images_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'board-images');

-- UPDATE — editors + admins (rarely used since paths are content-hashed)
drop policy if exists "board_images_update" on storage.objects;
create policy "board_images_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'board-images'
    and public.current_role() in ('admin','editor')
  )
  with check (
    bucket_id = 'board-images'
    and public.current_role() in ('admin','editor')
  );

-- DELETE — editors + admins (for future cleanup of orphans)
drop policy if exists "board_images_delete" on storage.objects;
create policy "board_images_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'board-images'
    and public.current_role() in ('admin','editor')
  );
