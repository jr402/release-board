-- ============================================================
-- 2026-06-27 — Workorder spreadsheet model
--
-- Turns workorder_items into the per-sculptor monthly worksheet:
--   miniature type, work-type checkboxes, help/retake comments,
--   nb of troopers, and an auto-computed (but overridable) FEES.
-- Adds day-off range on workorders.
-- FEES are derived in a trigger from rate_card + the artist's senior
-- flag, unless the admin overrides a line.
--
-- Run in Supabase SQL editor (idempotent). MUST run AFTER:
--   - 2026-05-27_phase1_backoffice_schema.sql  (workorders, workorder_items, guards)
--   - 2026-05-27_phase5_admin_rpcs.sql          (admin_sync_workorder)
--   - 2026-06-26_rate_card.sql                  (rate_card, members.is_senior)
-- ============================================================


-- ---------- new columns -------------------------------------------
alter table public.workorder_items
  add column if not exists miniature_type       text,
  add column if not exists work_sculpting        boolean not null default true,
  add column if not exists work_foundry          boolean not null default false,
  add column if not exists work_new_pose         boolean not null default false,
  add column if not exists work_help_retake      boolean not null default false,
  add column if not exists help_retake_comments  text,
  add column if not exists nb_troopers           int not null default 1 check (nb_troopers >= 0),
  add column if not exists fee_overridden         boolean not null default false,
  add column if not exists manual                 boolean not null default false;

alter table public.workorders
  add column if not exists day_off_start date,
  add column if not exists day_off_end   date;


-- ============================================================
-- FEES engine
-- ============================================================

-- Resolve a rate_card line's fee by label, senior-aware (global lines only).
create or replace function public.rate_lookup(p_label text, p_senior boolean)
returns numeric
language sql
stable
as $$
  select case when p_senior and senior_fee is not null then senior_fee else fee end
    from public.rate_card
   where label = p_label and artist_email is null and active = true
   limit 1;
$$;

-- BEFORE INSERT/UPDATE trigger: derive unit_price (the line FEES).
-- Formula (each piece additive, senior-aware via senior_fee):
--   sculpting     -> base fee for miniature_type (× nb_troopers for trooper types)
--   foundry       -> "Foundry Preparation per item"
--   new pose      -> "Extra fee per UNIT — first trooper made from scratch"
--   help/retake   -> "Retakes on models (1/2 day)"
-- Skipped entirely when fee_overridden = true (admin keeps their value).
-- For non-admin callers we also pin fee/override so a sculptor can never
-- set their own price; the price is always derived here.
create or replace function public.wo_item_compute_fee()
returns trigger
language plpgsql
as $$
declare
  v_admin   boolean;
  v_senior  boolean;
  v_base    numeric(10,2);
  v_cat     text;
  v_qty     int;
  v_fee     numeric(10,2);
begin
  v_admin := (public.current_role() = 'admin');

  -- Defense in depth: a sculptor inserting/updating cannot self-price.
  if not v_admin then
    new.fee_overridden := false;
    new.price_rule_id  := null;
    if tg_op = 'INSERT' and new.source_board_id is null then
      new.manual := true;   -- direct sculptor line = manual
    end if;
  end if;

  -- Admin override wins — keep the unit_price as supplied.
  if new.fee_overridden then
    return new;
  end if;

  -- Is the artist of this workorder a senior?
  select coalesce(m.is_senior, false) into v_senior
    from public.workorders w
    join public.members m on m.email = w.artist_email
   where w.id = new.workorder_id;
  v_senior := coalesce(v_senior, false);

  -- Base fee + category for the chosen miniature type.
  select (case when v_senior and senior_fee is not null then senior_fee else fee end), category
    into v_base, v_cat
    from public.rate_card
   where label = new.miniature_type and artist_email is null and active = true
   limit 1;

  -- Only the per-unit trooper line scales with the count; the
  -- "N Troops on foot" bundles are already flat for that many.
  v_qty := case
             when v_cat = 'Troopers (individual)'
               then greatest(coalesce(new.nb_troopers, 1), 1)
             else 1
           end;

  v_fee := 0;
  if new.work_sculpting   then v_fee := v_fee + coalesce(v_base, 0) * v_qty; end if;
  if new.work_foundry     then v_fee := v_fee + coalesce(public.rate_lookup('Foundry Preparation per item', v_senior), 0); end if;
  if new.work_new_pose    then
    v_fee := v_fee + coalesce((
      select case when v_senior and senior_fee is not null then senior_fee else fee end
        from public.rate_card
       where label like 'Extra fee per UNIT%' and artist_email is null and active = true
       limit 1), 0);
  end if;
  if new.work_help_retake then
    v_fee := v_fee + coalesce((
      select case when v_senior and senior_fee is not null then senior_fee else fee end
        from public.rate_card
       where label like 'Retakes on models%' and artist_email is null and active = true
       limit 1), 0);
  end if;

  new.unit_price := v_fee;
  return new;
end $$;

-- Named "…_zz_fee" so it fires AFTER the sculptor column guard
-- (BEFORE triggers run in alphabetical order). The guard validates the
-- columns the sculptor touched while unit_price is still unchanged; this
-- trigger then derives unit_price afterwards.
drop trigger if exists workorder_items_zz_fee on public.workorder_items;
create trigger workorder_items_zz_fee
  before insert or update on public.workorder_items
  for each row execute function public.wo_item_compute_fee();


-- ============================================================
-- Update the sculptor column guard (phase 1) for the new columns
-- ============================================================
create or replace function public.workorder_items_sculptor_guard()
returns trigger language plpgsql as $$
begin
  if public.current_role() = 'admin' then
    return new;
  end if;
  -- Sculptor MAY change: character_name, miniature_type, work_*,
  -- help_retake_comments, nb_troopers, included, notes.
  -- Everything price/identity related stays locked.
  if new.workorder_id      is distinct from old.workorder_id      then raise exception 'forbidden: workorder_id';      end if;
  if new.source_board_id   is distinct from old.source_board_id   then raise exception 'forbidden: source_board_id';   end if;
  if new.source_item_id    is distinct from old.source_item_id    then raise exception 'forbidden: source_item_id';    end if;
  if new.character_type    is distinct from old.character_type    then raise exception 'forbidden: character_type';    end if;
  if new.base_size         is distinct from old.base_size         then raise exception 'forbidden: base_size';         end if;
  if new.tier              is distinct from old.tier              then raise exception 'forbidden: tier';               end if;
  if new.thumbnail_data_url is distinct from old.thumbnail_data_url then raise exception 'forbidden: thumbnail_data_url'; end if;
  if new.price_rule_id     is distinct from old.price_rule_id     then raise exception 'forbidden: price_rule_id';     end if;
  if new.unit_price        is distinct from old.unit_price        then raise exception 'forbidden: unit_price';        end if;
  if new.fee_overridden    is distinct from old.fee_overridden    then raise exception 'forbidden: fee_overridden';    end if;
  if new.manual            is distinct from old.manual            then raise exception 'forbidden: manual';            end if;
  if new.created_at        is distinct from old.created_at        then raise exception 'forbidden: created_at';        end if;
  return new;
end $$;
-- (trigger workorder_items_sculptor_guard already created in phase 1)


-- ============================================================
-- RLS: let sculptors add / remove their own MANUAL lines
-- ============================================================
drop policy if exists workorder_items_self_insert on public.workorder_items;
create policy workorder_items_self_insert on public.workorder_items
  for insert to authenticated
  with check (exists (
    select 1 from public.workorders w
     where w.id = workorder_id
       and w.artist_email = (auth.jwt() ->> 'email')
       and w.status = 'wip'
  ));

drop policy if exists workorder_items_self_delete on public.workorder_items;
create policy workorder_items_self_delete on public.workorder_items
  for delete to authenticated
  using (manual = true and exists (
    select 1 from public.workorders w
     where w.id = workorder_id
       and w.artist_email = (auth.jwt() ->> 'email')
       and w.status = 'wip'
  ));


-- ============================================================
-- admin_sync_workorder: map board character_type -> miniature_type,
-- default to a sculpting line, let the trigger price it, and NEVER
-- touch manual lines (they have null source so the conflict key skips them).
-- ============================================================
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
  v_board_id int;
  v_item_id  int;
  v_mtype    text;
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

    -- Map the board's character_type to a rate_card miniature type label.
    v_mtype := case v_item ->> 'character_type'
                 when 'hero'    then 'Hero'
                 when 'troop'   then 'Fee for 1 trooper'
                 when 'monster' then 'Monster or Vehicle'
                 else null
               end;

    insert into workorder_items (
      workorder_id, source_board_id, source_item_id,
      character_name, character_type, base_size, tier,
      miniature_type, work_sculpting,
      unit_price, included, manual
    ) values (
      v_wo_id, v_board_id, v_item_id,
      v_item ->> 'character_name',
      v_item ->> 'character_type',
      v_item ->> 'base_size',
      v_item ->> 'tier',
      v_mtype, true,
      0, coalesce((v_item ->> 'default_included')::boolean, false), false
    )
    on conflict (workorder_id, source_board_id, source_item_id)
      where source_board_id is not null and source_item_id is not null
    do update set
      character_name = excluded.character_name,
      base_size      = excluded.base_size,
      tier           = excluded.tier;
      -- miniature_type / work flags / nb_troopers / fee are user-owned: not overwritten.
      -- The fee trigger re-derives unit_price on this update.
  end loop;

  return v_wo_id;
end $$;
grant execute on function public.admin_sync_workorder(text, text, jsonb) to authenticated;


-- ============================================================
-- sync_my_workorder (phase 4, sculptor self-service): same mapping.
-- On conflict, only refresh character_name (other snapshot cols are
-- guard-locked for non-admins). The fee trigger prices each line.
-- ============================================================
create or replace function public.sync_my_workorder(
  p_period text,
  p_items  jsonb
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
  v_board_id int;
  v_item_id  int;
  v_mtype    text;
begin
  v_caller := (current_setting('request.jwt.claims', true)::jsonb ->> 'email');
  if v_caller is null or v_caller = '' then
    raise exception 'No authenticated caller';
  end if;
  if not exists (select 1 from members where email = v_caller) then
    raise exception 'Caller % is not a member', v_caller;
  end if;

  insert into workorders (artist_email, period, created_by, status)
  values (v_caller, p_period, v_caller, 'wip')
  on conflict (artist_email, period) do nothing;

  select id, status into v_wo_id, v_status
    from workorders
   where artist_email = v_caller and period = p_period;

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

    v_mtype := case v_item ->> 'character_type'
                 when 'hero'    then 'Hero'
                 when 'troop'   then 'Fee for 1 trooper'
                 when 'monster' then 'Monster or Vehicle'
                 else null
               end;

    insert into workorder_items (
      workorder_id, source_board_id, source_item_id,
      character_name, character_type, base_size, tier,
      miniature_type, work_sculpting,
      unit_price, included, manual
    ) values (
      v_wo_id, v_board_id, v_item_id,
      v_item ->> 'character_name',
      v_item ->> 'character_type',
      v_item ->> 'base_size',
      v_item ->> 'tier',
      v_mtype, true,
      0, coalesce((v_item ->> 'default_included')::boolean, false), false
    )
    on conflict (workorder_id, source_board_id, source_item_id)
      where source_board_id is not null and source_item_id is not null
    do update set
      character_name = excluded.character_name;
  end loop;

  return v_wo_id;
end $$;
grant execute on function public.sync_my_workorder(text, jsonb) to authenticated;
