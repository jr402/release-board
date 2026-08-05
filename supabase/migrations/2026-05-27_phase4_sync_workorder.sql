-- ============================================================
-- Phase 4 — Sculptor sync function
-- Adds a unique index on workorder_items.(workorder_id, source_board_id, source_item_id)
-- and a SECURITY DEFINER RPC the sculptor can call to ensure their
-- workorder + items exist for a given period.
--
-- Why SECURITY DEFINER:
--   - Sculptors have no INSERT permission on workorders/workorder_items
--     (RLS only grants them SELECT + restricted UPDATE).
--   - This function lets them bootstrap their own data safely: it pins the
--     artist_email to auth.jwt() email, looks up prices server-side, and
--     refuses to touch finalized workorders.
--   - The client passes the item list scanned from boards_data; the function
--     does not trust the unit_price coming from the client — it looks up the
--     active price rule itself.
-- ============================================================

-- Unique source-item key (for the upsert).
-- Partial index so legacy rows with null sources don't clash.
create unique index if not exists workorder_items_unique_source
  on public.workorder_items (workorder_id, source_board_id, source_item_id)
  where source_board_id is not null and source_item_id is not null;


create or replace function public.sync_my_workorder(
  p_period text,
  p_items  jsonb       -- array of { source_board_id, source_item_id, character_name, character_type, base_size, tier, default_included }
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller   text;
  v_wo_id    uuid;
  v_status   text;
  v_item     jsonb;
  v_price_id uuid;
  v_price    numeric(10,2);
  v_board_id int;
  v_item_id  int;
begin
  -- Identify the caller from the JWT.
  v_caller := (current_setting('request.jwt.claims', true)::jsonb ->> 'email');
  if v_caller is null or v_caller = '' then
    raise exception 'No authenticated caller';
  end if;

  -- The caller must be a known member (defense in depth).
  if not exists (select 1 from members where email = v_caller) then
    raise exception 'Caller % is not a member', v_caller;
  end if;

  -- 1. Ensure the workorder row exists.
  insert into workorders (artist_email, period, created_by, status)
  values (v_caller, p_period, v_caller, 'wip')
  on conflict (artist_email, period) do nothing;

  select id, status into v_wo_id, v_status
    from workorders
   where artist_email = v_caller and period = p_period;

  -- If the WO has already been validated or sent, don't touch the lines.
  if v_status <> 'wip' then
    return v_wo_id;
  end if;

  -- 2. Iterate the client-provided items.
  for v_item in
    select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    -- Required keys
    v_board_id := nullif(v_item ->> 'source_board_id','')::int;
    v_item_id  := nullif(v_item ->> 'source_item_id','')::int;
    if v_board_id is null or v_item_id is null then
      continue;
    end if;

    -- Skip items already billed in a previous workorder.
    if exists (
      select 1 from billed_items
       where source_board_id = v_board_id and source_item_id = v_item_id
    ) then
      continue;
    end if;

    -- Look up the active price rule for this artist + character_type.
    v_price_id := null;
    v_price    := 0;
    if v_item ->> 'character_type' is not null then
      select id, price into v_price_id, v_price
        from prices
       where artist_email = v_caller
         and character_type = v_item ->> 'character_type'
         and active = true
       limit 1;
    end if;

    -- Upsert the workorder_item.
    -- On conflict we refresh the snapshot fields (label might have changed)
    -- but preserve the user's `included` and `notes` choices.
    insert into workorder_items (
      workorder_id,
      source_board_id, source_item_id,
      character_name, character_type, base_size, tier,
      price_rule_id, unit_price,
      included
    ) values (
      v_wo_id,
      v_board_id, v_item_id,
      v_item ->> 'character_name',
      v_item ->> 'character_type',
      v_item ->> 'base_size',
      v_item ->> 'tier',
      v_price_id, coalesce(v_price, 0),
      coalesce((v_item ->> 'default_included')::boolean, false)
    )
    on conflict (workorder_id, source_board_id, source_item_id) where source_board_id is not null and source_item_id is not null
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

-- Allow any authenticated user to call this RPC. The function itself
-- pins everything to their JWT email so there's no cross-user risk.
grant execute on function public.sync_my_workorder(text, jsonb) to authenticated;
