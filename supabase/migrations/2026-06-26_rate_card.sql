-- ============================================================
-- 2026-06-26 — Editable rate card (global barème) + senior flag
--
-- Replaces the rigid `prices` (artist × 6-type enum) model for the
-- back-office Pricing tab with a flexible, spreadsheet-like rate card:
-- categories → named fee lines, standard fee + optional senior fee.
--
-- NOTE: the existing `prices` table + sync_my_workorder RPC are left
-- intact. Rewiring workorder auto-pricing onto rate_card is a separate
-- step — until then, workorder totals do NOT reflect this rate card.
--
-- Run in Supabase SQL editor. Safe to re-run (idempotent).
-- Depends on: public.current_role(), public.members,
--             public.touch_updated_at() (created in phase 1).
-- ============================================================


-- ---------- rate_card --------------------------------------------
-- Global barème. `senior_fee` null = seniors pay the standard fee.
-- `artist_email` null = global line; set it for per-artist forfait
-- blocks (e.g. GUILLERMO's monthly flat rates).
create table if not exists public.rate_card (
  id            uuid primary key default gen_random_uuid(),
  category      text not null,
  label         text not null,
  fee           numeric(10,2) not null default 0 check (fee >= 0),
  senior_fee    numeric(10,2) check (senior_fee is null or senior_fee >= 0),
  artist_email  text,
  currency      text not null default 'EUR',
  sort_order    int not null default 0,
  active        boolean not null default true,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists rate_card_order on public.rate_card (category, sort_order);

drop trigger if exists rate_card_touch on public.rate_card;
create trigger rate_card_touch before update on public.rate_card
  for each row execute function public.touch_updated_at();


-- ---------- members.is_senior ------------------------------------
alter table public.members
  add column if not exists is_senior boolean not null default false;


-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.rate_card enable row level security;

-- Admins: full read/write.
drop policy if exists rate_card_admin_all on public.rate_card;
create policy rate_card_admin_all on public.rate_card
  for all to authenticated
  using      (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Everyone authenticated may read the barème (not sensitive; future
-- sculptor view can show rates). Writes stay admin-only via the policy above.
drop policy if exists rate_card_read on public.rate_card;
create policy rate_card_read on public.rate_card
  for select to authenticated
  using (true);


-- ============================================================
-- Realtime (so concurrent admin edits stay in sync)
-- ============================================================
do $$ begin
  alter publication supabase_realtime add table public.rate_card;
exception when duplicate_object then null; end $$;


-- ============================================================
-- Seed — the Raging Heroes rate sheet (only if table is empty).
-- senior_fee set only where it differs from the standard fee.
-- ============================================================
insert into public.rate_card (category, label, fee, senior_fee, sort_order)
select * from (values
  -- Items
  ('Items', 'Hero',                              400, 500, 10),
  ('Items', 'Standard Creature',                 300, null, 20),
  ('Items', 'Monster or Vehicle',                500, null, 30),
  ('Items', 'LARGE Monster / Vehicle',           800, null, 40),
  ('Items', 'Foundry Preparation per item',       65, null, 50),
  -- Troopers (individual)
  ('Troopers (individual)', 'Fee for 1 trooper',                                    130, null, 10),
  ('Troopers (individual)', 'Extra fee per UNIT — first trooper made from scratch', 130, null, 20),
  ('Troopers (individual)', 'Assembly fee for 1 mount',                              65, null, 30),
  ('Troopers (individual)', 'Foundry Preparation per item',                          65, null, 40),
  -- Troops (unit)
  ('Troops (unit)', '4 Troops on foot',                                       520, null, 10),
  ('Troops (unit)', '5 Troops on foot',                                       650, null, 20),
  ('Troops (unit)', '6 Troops on foot',                                       780, null, 30),
  ('Troops (unit)', 'Extra fee per UNIT — first trooper made from scratch',   130, null, 40),
  ('Troops (unit)', 'Assembly fee for 4 Mounted Troops',                      260, null, 50),
  ('Troops (unit)', 'Assembly fee for 5 Mounted Troops',                      325, null, 60),
  ('Troops (unit)', 'Assembly fee for 6 Mounted Troops',                      390, null, 70),
  -- Other rates
  ('Other rates', 'Unreal (day rate)',                       130, null, 10),
  ('Other rates', 'Graphic work (1/2 day rate)',              65, null, 20),
  ('Other rates', 'Assist for details on models (1/2 day)',   65, null, 30),
  ('Other rates', 'Retakes on models (1/2 day)',              65, null, 40),
  ('Other rates', '(Plastics) Retakes / hour',             16.25, 25, 50)
) as v(category, label, fee, senior_fee, sort_order)
where not exists (select 1 from public.rate_card);
