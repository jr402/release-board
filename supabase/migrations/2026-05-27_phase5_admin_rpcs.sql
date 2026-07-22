-- ============================================================
-- Phase 5 — Admin review/validate RPCs
-- - admin_sync_workorder: admin-only variant of sync_my_workorder so admins
--   can populate any artist's WO at end-of-month, even if the artist
--   hasn't logged in.
-- - validate_workorder: flip a WIP workorder to "validated", assign the
--   sequential WO number (WO-YYYY-NN), and snapshot the total.
-- - revert_workorder_to_wip: safety net for admin fix-ups before final.
--
-- Run in Supabase SQL editor. Idempotent.
-- ============================================================


-- ---------- admin_sync_workorder ---------------------------------
create or replace function public.admin_sync_workorder(
  p_artist_email text,
  p_period       text,
  p_items        jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role     text;
  v_wo_id    uuid;
  v_status   text;
  v_item     jsonb;
  v_price_id uuid;
  v_price    numeric(10,2);
  v_board_id int;
  v_item_id  int;
begin
  v_role := public.current_role();
  if v_role is distinct from 'admin' then
    raise exception 'admin only';
  end if;

  if not exists (select 1 from members where email = p_artist_email) then
    raise exception 'Artist % is not a member', p_artist_email;
  end if;

  insert into workorders (artist_email, period, created_by, status)
  values (p_artist_email, p_period,
          (current_setting('request.jwt.claims', true)::jsonb ->> 'email'),
          'wip')
  on conflict (artist_email, period) do nothing;

  select id, status into v_wo_id, v_status
    from workorders
   where artist_email = p_artist_email and period = p_period;

  if v_status <> 'wip' then
    return v_wo_id;
  end if;

  for v_item in
    select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    v_board_id := nullif(v_item ->> 'source_board_id','')::int;
    v_item_id  := nullif(v_item ->> 'source_item_id','')::int;
    if v_board_id is null or v_item_id is null then continue; end if;

    if exists (
      select 1 from billed_items
       where source_board_id = v_board_id and source_item_id = v_item_id
    ) then continue; end if;

    v_price_id := null;
    v_price    := 0;
    if v_item ->> 'character_type' is not null then
      select id, price into v_price_id, v_price
        from prices
       where artist_email = p_artist_email
         and character_type = v_item ->> 'character_type'
         and active = true
       limit 1;
    end if;

    insert into workorder_items (
      workorder_id, source_board_id, source_item_id,
      character_name, character_type, base_size, tier,
      price_rule_id, unit_price, included
    ) values (
      v_wo_id, v_board_id, v_item_id,
      v_item ->> 'character_name',
      v_item ->> 'character_type',
      v_item ->> 'base_size',
      v_item ->> 'tier',
      v_price_id, coalesce(v_price, 0),
      coalesce((v_item ->> 'default_included')::boolean, false)
    )
    on conflict (workorder_id, source_board_id, source_item_id)
      where source_board_id is not null and source_item_id is not null
    do update set
      character_name = excluded.character_name,
      character_type = excluded.character_type,
      base_size      = excluded.base_size,
      tier           = excluded.tier,
      price_rule_id  = excluded.price_rule_id,
      unit_price     = excluded.unit_price;
  end loop;

  return v_wo_id;
end $$;
grant execute on function public.admin_sync_workorder(text, text, jsonb) to authenticated;


-- ---------- validate_workorder -----------------------------------
-- Flips status wip → validated, assigns a sequential WO number for the
-- year, and snapshots the total. Sculptor edits are blocked from now on
-- (RLS only permits self-update while status='wip').
create or replace function public.validate_workorder(p_wo_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role       text;
  v_period     text;
  v_year       text;
  v_status     text;
  v_max_n      int;
  v_new_number text;
  v_total      numeric(10,2);
begin
  v_role := public.current_role();
  if v_role is distinct from 'admin' then
    raise exception 'admin only';
  end if;

  select period, status into v_period, v_status
    from workorders where id = p_wo_id
    for update;  -- serialize concurrent validations
  if v_period is null then raise exception 'workorder not found'; end if;
  if v_status <> 'wip' then raise exception 'workorder is not in wip (got %)', v_status; end if;

  v_year := split_part(v_period, '-', 1);

  select coalesce(max(cast(split_part(wo_number, '-', 3) as int)), 0) + 1
    into v_max_n
    from workorders
   where wo_number like 'WO-' || v_year || '-%';

  v_new_number := 'WO-' || v_year || '-' || lpad(v_max_n::text, 2, '0');

  select coalesce(sum(unit_price), 0) into v_total
    from workorder_items
   where workorder_id = p_wo_id and included = true;

  update workorders set
    status       = 'validated',
    wo_number    = v_new_number,
    total_amount = v_total,
    validated_at = now()
  where id = p_wo_id;

  return v_new_number;
end $$;
grant execute on function public.validate_workorder(uuid) to authenticated;


-- ---------- revert_workorder_to_wip ------------------------------
-- Safety net: if admin validated by mistake, this re-opens the WO for
-- edits. wo_number is kept (don't reuse numbers).
-- Not allowed on final_sent (would require also clearing billed_items).
create or replace function public.revert_workorder_to_wip(p_wo_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role   text;
  v_status text;
begin
  v_role := public.current_role();
  if v_role is distinct from 'admin' then
    raise exception 'admin only';
  end if;

  select status into v_status from workorders where id = p_wo_id;
  if v_status is null then raise exception 'workorder not found'; end if;
  if v_status = 'final_sent' then
    raise exception 'cannot revert a final_sent workorder (would orphan billed_items)';
  end if;

  update workorders set
    status       = 'wip',
    validated_at = null
  where id = p_wo_id;
end $$;
grant execute on function public.revert_workorder_to_wip(uuid) to authenticated;
