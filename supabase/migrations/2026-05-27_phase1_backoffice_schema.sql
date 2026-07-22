-- ============================================================
-- Phase 1 — Back-office schema
-- Tables: prices, workorders, workorder_items, billed_items
-- Plus RLS, triggers for column-level sculptor protection, realtime.
--
-- Run in Supabase SQL editor. Safe to re-run (idempotent).
-- Depends on:
--   - public.current_role()  -- already created in SUPABASE_SETUP.md
--   - public.members         -- already created
-- ============================================================


-- ---------- prices ------------------------------------------------
-- Flat rate per (artist_email × character_type). EUR only for v1.
-- "active" lets us soft-delete or supersede a row without losing history.
create table if not exists public.prices (
  id              uuid primary key default gen_random_uuid(),
  artist_email    text not null,
  character_type  text not null check (character_type in
                    ('hero','troop','monster','scenery','centerpiece','diorama')),
  price           numeric(10,2) not null check (price >= 0),
  currency        text not null default 'EUR',
  active          boolean not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
-- Only one active rule per (artist, type) at a time. Older rows kept inactive.
create unique index if not exists prices_unique_active
  on public.prices (artist_email, character_type) where active;
create index if not exists prices_artist on public.prices (artist_email);


-- ---------- workorders --------------------------------------------
-- One row per (artist × period). Period = "YYYY-MM".
create table if not exists public.workorders (
  id              uuid primary key default gen_random_uuid(),
  wo_number       text unique,                     -- "WO-2026-01", set at validation time
  artist_email    text not null,
  period          text not null,                   -- "YYYY-MM"
  status          text not null default 'wip'
                    check (status in ('wip','validated','final_sent')),
  total_amount    numeric(10,2) not null default 0,
  currency        text not null default 'EUR',
  notes_admin     text,
  notes_artist    text,
  created_by      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  validated_at    timestamptz,
  finalized_at    timestamptz,
  pdf_url         text
);
create unique index if not exists workorders_artist_period
  on public.workorders (artist_email, period);
create index if not exists workorders_status on public.workorders (status);


-- ---------- workorder_items ---------------------------------------
-- Snapshots of source board items so they don't drift if the board is edited
-- after billing. `included` lets the sculptor opt non-Approved items in via
-- the "Include anyway" toggle, and the admin defer lines by unchecking.
create table if not exists public.workorder_items (
  id                 uuid primary key default gen_random_uuid(),
  workorder_id       uuid not null references public.workorders(id) on delete cascade,
  -- Traceability back into boards_data JSON (no FK, just data):
  source_board_id    int,
  source_item_id     int,
  -- Snapshot:
  character_name     text,
  character_type     text,
  base_size          text,
  tier               text,
  thumbnail_data_url text,                          -- small jpeg/png data URL for PDF
  -- Pricing:
  price_rule_id      uuid references public.prices(id) on delete set null,
  unit_price         numeric(10,2) not null default 0 check (unit_price >= 0),
  -- Flags:
  included           boolean not null default true,  -- false = grayed/deferred
  notes              text,
  created_at         timestamptz not null default now()
);
create index if not exists workorder_items_wo on public.workorder_items (workorder_id);
create index if not exists workorder_items_source
  on public.workorder_items (source_board_id, source_item_id);


-- ---------- billed_items ------------------------------------------
-- Marker so the same board item never ends up on two workorders.
-- Populated atomically when a workorder transitions to final_sent.
create table if not exists public.billed_items (
  source_board_id int not null,
  source_item_id  int not null,
  workorder_id    uuid references public.workorders(id) on delete set null,
  billed_at       timestamptz not null default now(),
  primary key (source_board_id, source_item_id)
);


-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists prices_touch on public.prices;
create trigger prices_touch before update on public.prices
  for each row execute function public.touch_updated_at();

drop trigger if exists workorders_touch on public.workorders;
create trigger workorders_touch before update on public.workorders
  for each row execute function public.touch_updated_at();


-- ============================================================
-- Column-level guards for non-admin updates
-- RLS gates rows; these triggers gate which columns the sculptor may touch.
-- ============================================================

-- workorders: sculptor may only edit notes_artist.
create or replace function public.workorders_sculptor_guard()
returns trigger language plpgsql as $$
begin
  if public.current_role() = 'admin' then
    return new;
  end if;
  -- Allow only notes_artist to change.
  if new.wo_number    is distinct from old.wo_number    then raise exception 'forbidden: wo_number';    end if;
  if new.artist_email is distinct from old.artist_email then raise exception 'forbidden: artist_email'; end if;
  if new.period       is distinct from old.period       then raise exception 'forbidden: period';       end if;
  if new.status       is distinct from old.status       then raise exception 'forbidden: status';       end if;
  if new.total_amount is distinct from old.total_amount then raise exception 'forbidden: total_amount'; end if;
  if new.currency     is distinct from old.currency     then raise exception 'forbidden: currency';     end if;
  if new.notes_admin  is distinct from old.notes_admin  then raise exception 'forbidden: notes_admin';  end if;
  if new.created_by   is distinct from old.created_by   then raise exception 'forbidden: created_by';   end if;
  if new.created_at   is distinct from old.created_at   then raise exception 'forbidden: created_at';   end if;
  if new.validated_at is distinct from old.validated_at then raise exception 'forbidden: validated_at'; end if;
  if new.finalized_at is distinct from old.finalized_at then raise exception 'forbidden: finalized_at'; end if;
  if new.pdf_url      is distinct from old.pdf_url      then raise exception 'forbidden: pdf_url';      end if;
  return new;
end $$;
drop trigger if exists workorders_sculptor_guard on public.workorders;
create trigger workorders_sculptor_guard
  before update on public.workorders
  for each row execute function public.workorders_sculptor_guard();


-- workorder_items: sculptor may only edit `included` and `notes`.
create or replace function public.workorder_items_sculptor_guard()
returns trigger language plpgsql as $$
begin
  if public.current_role() = 'admin' then
    return new;
  end if;
  if new.workorder_id       is distinct from old.workorder_id       then raise exception 'forbidden: workorder_id';       end if;
  if new.source_board_id    is distinct from old.source_board_id    then raise exception 'forbidden: source_board_id';    end if;
  if new.source_item_id     is distinct from old.source_item_id     then raise exception 'forbidden: source_item_id';     end if;
  if new.character_name     is distinct from old.character_name     then raise exception 'forbidden: character_name';     end if;
  if new.character_type     is distinct from old.character_type     then raise exception 'forbidden: character_type';     end if;
  if new.base_size          is distinct from old.base_size          then raise exception 'forbidden: base_size';          end if;
  if new.tier               is distinct from old.tier               then raise exception 'forbidden: tier';                end if;
  if new.thumbnail_data_url is distinct from old.thumbnail_data_url then raise exception 'forbidden: thumbnail_data_url'; end if;
  if new.price_rule_id      is distinct from old.price_rule_id      then raise exception 'forbidden: price_rule_id';      end if;
  if new.unit_price         is distinct from old.unit_price         then raise exception 'forbidden: unit_price';          end if;
  if new.created_at         is distinct from old.created_at         then raise exception 'forbidden: created_at';          end if;
  return new;
end $$;
drop trigger if exists workorder_items_sculptor_guard on public.workorder_items;
create trigger workorder_items_sculptor_guard
  before update on public.workorder_items
  for each row execute function public.workorder_items_sculptor_guard();


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.prices            enable row level security;
alter table public.workorders        enable row level security;
alter table public.workorder_items   enable row level security;
alter table public.billed_items      enable row level security;

-- ---------- prices policies ----------
drop policy if exists prices_admin_all on public.prices;
create policy prices_admin_all on public.prices
  for all to authenticated
  using       (public.current_role() = 'admin')
  with check  (public.current_role() = 'admin');

drop policy if exists prices_self_read on public.prices;
create policy prices_self_read on public.prices
  for select to authenticated
  using (artist_email = (auth.jwt() ->> 'email'));

-- ---------- workorders policies ----------
drop policy if exists workorders_admin_all on public.workorders;
create policy workorders_admin_all on public.workorders
  for all to authenticated
  using       (public.current_role() = 'admin')
  with check  (public.current_role() = 'admin');

drop policy if exists workorders_self_read on public.workorders;
create policy workorders_self_read on public.workorders
  for select to authenticated
  using (artist_email = (auth.jwt() ->> 'email'));

-- Sculptor may update their own WO only while status='wip'.
-- The trigger above restricts which columns may change.
drop policy if exists workorders_self_update on public.workorders;
create policy workorders_self_update on public.workorders
  for update to authenticated
  using       (artist_email = (auth.jwt() ->> 'email') and status = 'wip')
  with check  (artist_email = (auth.jwt() ->> 'email') and status = 'wip');

-- ---------- workorder_items policies ----------
drop policy if exists workorder_items_admin_all on public.workorder_items;
create policy workorder_items_admin_all on public.workorder_items
  for all to authenticated
  using       (public.current_role() = 'admin')
  with check  (public.current_role() = 'admin');

drop policy if exists workorder_items_self_read on public.workorder_items;
create policy workorder_items_self_read on public.workorder_items
  for select to authenticated
  using (exists (
    select 1 from public.workorders w
     where w.id = workorder_items.workorder_id
       and w.artist_email = (auth.jwt() ->> 'email')
  ));

drop policy if exists workorder_items_self_update on public.workorder_items;
create policy workorder_items_self_update on public.workorder_items
  for update to authenticated
  using (exists (
    select 1 from public.workorders w
     where w.id = workorder_items.workorder_id
       and w.artist_email = (auth.jwt() ->> 'email')
       and w.status = 'wip'
  ))
  with check (exists (
    select 1 from public.workorders w
     where w.id = workorder_items.workorder_id
       and w.artist_email = (auth.jwt() ->> 'email')
       and w.status = 'wip'
  ));

-- ---------- billed_items policies ----------
drop policy if exists billed_items_admin_all on public.billed_items;
create policy billed_items_admin_all on public.billed_items
  for all to authenticated
  using       (public.current_role() = 'admin')
  with check  (public.current_role() = 'admin');

-- Everyone authenticated can read billed_items (used to filter "not yet billed").
drop policy if exists billed_items_read on public.billed_items;
create policy billed_items_read on public.billed_items
  for select to authenticated
  using (true);


-- ============================================================
-- Realtime
-- Sculptor personal view subscribes to live changes.
-- Wrapped in DO blocks so re-running is safe even if already added.
-- ============================================================
do $$ begin
  alter publication supabase_realtime add table public.workorders;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.workorder_items;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.prices;
exception when duplicate_object then null; end $$;
