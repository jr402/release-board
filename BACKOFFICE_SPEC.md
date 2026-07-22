# BACK OFFICE — Workorders & Billing module

A sister app to the Release Board for end-of-month workorder generation, sculptor review, admin validation, and PDF/email delivery.

**Status**: spec only — not yet implemented. Read `CONTEXT.md` first for the parent app architecture.

---

## What it does (in plain words)

Sculptors have a **personal page** in the back-office where they log in and see only THEIR data — never anyone else's. They can:
- See the items they've finished this month accumulating live (as the admin/updaters mark cards `finished` in the main board)
- Add notes per item or globally for the month (e.g. "this took longer because of the armor", "the price seems off for this one")
- See their pricing per item
- See their running total for the month

End-of-month, the admin opens the **admin view** (same back-office, different UI based on role), sees all artists at once, reviews each:
- Adjusts lines/prices if needed
- Reads the sculptor's notes
- Clicks **Validate & send final** → generates final PDF, emails the sculptor, marks items as billed.

**Single email sent: the final one.** No intermediate "send draft for review" round-trip — the sculptor has been seeing and amending the draft live in their personal page all month.

Sculptors can work across multiple boards (a Sovereign release, a current month, throwback updates). The system gathers across all boards.

---

## Data model (proposed)

Three new Supabase tables. The parent app's `boards_data` JSONB stays as-is.

### `prices`
The pricing grid. Per-artist, per-character-type.

```sql
create table public.prices (
  id uuid primary key default gen_random_uuid(),
  artist_email   text not null,
  character_type text not null,        -- "hero" | "troop" | "monster" | "scenery" | "centerpiece" | etc.
  -- Optional discriminators — TBD with user, leave nullable to allow simple grids:
  base_size      text,                  -- "32mm" | "60mm" | "120mm" | null = any
  tier           text,                  -- "leader" | "overlord" | "sovereign" | null = any
  price          numeric(10,2) not null,
  currency       text default 'EUR',
  active         boolean default true,
  notes          text,
  created_at     timestamptz default now()
);
create index on public.prices (artist_email, active);
```

The pricing engine picks the most specific matching rule (artist+type+base+tier > artist+type+base > artist+type > error if none).

### `workorders`
One row per (artist × period).

```sql
create table public.workorders (
  id uuid primary key default gen_random_uuid(),
  artist_email   text not null,
  period         text not null,            -- "2026-05" (YYYY-MM)
  status         text not null check (status in (
    'wip',                -- accumulating during the month; sculptor sees live and can add notes
    'validated',          -- admin reviewed at month-end and locked the lines
    'final_sent'          -- final PDF emailed (terminal state)
  )) default 'wip',
  total_amount   numeric(10,2) default 0,
  currency       text default 'EUR',
  notes_admin    text,
  notes_artist   text,
  created_by     text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  validated_at   timestamptz,
  finalized_at   timestamptz,
  pdf_url        text                       -- supabase storage URL if we keep PDFs
);
create unique index on public.workorders (artist_email, period);
```

### `workorder_items`
Line items inside each workorder. Snapshots of board items so they don't change if the source is later edited.

```sql
create table public.workorder_items (
  id uuid primary key default gen_random_uuid(),
  workorder_id uuid not null references public.workorders(id) on delete cascade,
  -- References back into the JSON (just for traceability — no FK):
  source_board_id  int,
  source_item_id   int,
  -- Snapshot at the time of billing:
  character_name   text,
  character_type   text,
  base_size        text,
  tier             text,
  -- Price applied:
  price_rule_id    uuid references public.prices(id),
  unit_price       numeric(10,2) not null,
  -- Optional notes per line (artist or admin):
  notes            text,
  created_at       timestamptz default now()
);
create index on public.workorder_items (workorder_id);
```

### `billed_items` (mark items as already billed)
Prevents the same finished item from appearing on next month's WO. Could be derived from `workorder_items` (`source_board_id`, `source_item_id`) but a dedicated table simplifies queries.

```sql
create table public.billed_items (
  source_board_id int not null,
  source_item_id  int not null,
  workorder_id    uuid references public.workorders(id) on delete set null,
  billed_at       timestamptz default now(),
  primary key (source_board_id, source_item_id)
);
```

Or: just query `workorder_items` and check non-finalized vs finalized. Simpler is better — recommend `billed_items` as a separate marker.

### RLS (proposed)

- `prices`: admins read+write all. Anyone else: read only the rows where `artist_email = auth.jwt() ->> 'email'` (sculptor sees their own pricing).
- `workorders`:
  - Admin: full read/write
  - Anyone else: read+update **only their own row** where `artist_email = auth.jwt() ->> 'email'`. They can only update `notes_artist` (handled in app code; RLS gates the row, app gates the columns).
- `workorder_items`:
  - Admin: full read/write
  - Anyone else: read+update only items where the parent workorder's `artist_email = auth.jwt() ->> 'email'`. They can only update the `notes` field.
- `billed_items`: admins all. Editors read all.

**Roles**: keep current 3 (`admin`, `editor`, `reader`). A sculptor is just a `reader` (read-only on the main board) but RLS on the workorder tables uses **email matching**, not role, so they can edit their own data without needing a special role.

---

## UI screens

Separate HTML file: `back-office.html` in same folder. Same Supabase client, shared auth (session persists per-domain).

**Single entry point that branches on role**:
- If admin → admin view (all artists, validation, pricing editor, history)
- Else → sculptor personal page (their own current + past workorders, can add notes)

Detection: when the user loads `back-office.html`, check their email against `members.role`. If `admin`, show admin UI. Otherwise look up their own WOs by `artist_email = their email` and show personal UI.

### Admin view

#### A1. Period selector + Artists list (home)
```
[Period: ▼ 2026 May ]   [Refresh data]   [Settings ⚙]

Artist                       Items   Total   Notes from artist   Status
─────────────────────────────────────────────────────────────────────────
oliver@example.com           5       430€    "1 note"            wip       [Open →]
marie@example.com            3       260€    —                   validated [Open →]
peter@example.com            0       —       —                   —         —
...
```

#### A2. Per-artist workorder review (end-of-month validation)
```
Workorder — oliver, May 2026                          [status: wip]

LINE ITEMS                                                    Price
──────────────────────────────────────────────────────────────────
[x] Hero Tier1 "Sigfried"     32mm Hero                       150€  [edit]
    Artist note: "extra armor work, ~3 days"
[x] Troop "Nightwatch"        32mm Troop                       80€  [edit]
[x] Scenery "Tomb"            120mm Scenery                   200€  [edit]
    Artist note: "monster size pivot"
[ ] (unchecked items shown faded — admin can defer)
──────────────────────────────────────────────────────────────────
TOTAL                                                        430€

ARTIST NOTES (read-only on admin view)
"Big month, the centerpiece took priority"

ADMIN NOTES (private)
[textarea]

[ Save changes ]   [ Validate & send final → ]
```

Click **Validate & send final** → generates PDF, emails sculptor, status flips to `final_sent`, items flagged in `billed_items` so they vanish from next month's WO.

#### A3. Pricing grid editor (admin only)
CRUD for the `prices` table. Per artist × character type, optional base/tier discriminators.

#### A4. History
Past workorders per artist (read-only). Searchable by period / artist.

#### A5. Sculptors directory (optional)
List of artists' emails + display name + payment info / IBAN if needed.

### Sculptor personal view

#### S1. Home — my current month
```
Hi oliver — May 2026                              [status: wip]

LINE ITEMS YOU FINISHED THIS MONTH                          Price
──────────────────────────────────────────────────────────────────
Hero Tier1 "Sigfried"           32mm Hero                   150€
    Your note: [textarea inline editable]
Troop "Nightwatch"              32mm Troop                   80€
    Your note: [textarea]
Scenery "Tomb"                  120mm Scenery               200€
    Your note: [textarea]
──────────────────────────────────────────────────────────────────
RUNNING TOTAL                                              430€

GLOBAL NOTES FOR THIS MONTH
[textarea — saved live]

This workorder will be reviewed and finalized by the admin at end of month.
You'll receive the final PDF by email then.
```

Lines update live (real-time subscription on `workorder_items` filtered by their email). When admin marks new items `finished`, they appear here automatically.

#### S2. My past workorders
Read-only list of past months, with their final PDFs to download.

That's it for sculptors — no buttons that change status. They only edit notes. The admin is the only one who can validate / send final.

---

## Flow (simplified — single email at the end)

```
Throughout the month:
  - As soon as ANY item is marked `finished` and isn't already billed,
    it auto-appears in that artist's current-month WO (status `wip`).
  - The sculptor sees it live in their personal page and can add notes.
  - The admin can peek in anytime via the artists list.

End of month:
  Admin reviews each artist's WO → status `validated`
  Admin sends final PDF → status `final_sent`
                       + email sculptor
                       + insert into billed_items so lines vanish from next month
```

That's it — **one email, at the very end**. The sculptor's notes are gathered live during the month, no email round-trip needed.

The WO row is **created lazily**: the first time the admin opens the back-office for a (artist, month) pair that has finished items, the system creates the `wip` row. Or it can be auto-created by a Postgres trigger on `boards_data` change — TBD, simpler to do on-demand from the app.

---

## Technical pieces

### New file: `back-office.html`
- Same Supabase URL + anon key as `index.html` (copy-paste from there OR move to a shared `config.js`)
- Imports Supabase SDK same way (dynamic load with fallback)
- Reuses the auth screen pattern (same UI, same `signInWithPassword`)
- Different UI underneath (tabs: Workorders / Pricing / History / Sculptors)

### Add a button in `index.html`
In the user menu (next to Team, Password, Logout), add a **"Back Office"** button (admin only) → opens `/back-office.html` in a new tab.

### New Edge Function: `send-workorder-email`
- Inputs: `{ workorder_id, type: "draft" | "final" }`
- Server-side:
  - Verify caller is admin (same JWT check as `admin-create-user`)
  - Load workorder + items + artist email
  - Generate PDF (or accept PDF binary from client — see below)
  - Email via Resend (need Resend API key in env)
- Returns success/error

### PDF generation: client-side
Recommend client-side with **[pdfmake](https://pdfmake.github.io/docs/)** or **jsPDF** — both work in browser, no backend needed. PDF is generated on the client, then:
- For preview: shown in modal
- For email: sent as base64 to the Edge Function which forwards to Resend as attachment
- For history: uploaded to Supabase Storage (separate bucket, RLS limited to admin + the artist of that WO)

### Resend setup (for emails)
Already discussed during auth setup but never configured. Steps:
1. Create free account on resend.com (100 emails/day free)
2. Get API key
3. Add as env var to the Edge Function: `RESEND_API_KEY`
4. Verify a sending domain (or use `onboarding@resend.dev` for testing)

---

## Open questions for next session (USER MUST CLARIFY)

These are not blocking the start of work, but need answers before the pricing engine is meaningful:

### Pricing structure
1. What are the **character types** in your grid? Examples we have: `hero`, `troop`, `monster`, `scenery`, `centerpiece`, `diorama`. Do you bill by these, or do you have your own categories (e.g. "small / medium / large")?
2. Does price depend on **base size** (32mm vs 120mm)?
3. Does price depend on **tier** (Leader / Overlord / Sovereign — Sovereign typically more expensive)?
4. Does price depend on **complexity** (something subjective — maybe an editable field on each item)?
5. Do artists have different rates **per character type**, or a flat rate per artist?
6. Do you give the artist **default prices** that they can negotiate per item?
7. Currency: EUR only, or multi-currency support?

### Workflow specifics
8. ~~Does the sculptor have to log in to amend the draft~~ → **resolved**: sculptor logs into back-office to see/edit their notes (no intermediate email).
9. ~~If sculptor login: they need a role in `members`. Add `sculptor` role, or reuse `reader`?~~ → **resolved**: keep `reader` role, RLS uses email matching for personal data access.
10. The sculptor can only **add notes** (global + per-line). No price changes, no line removal. Admin handles all line/price decisions during validation. **Confirm**.
11. ~~Deadline for amendments~~ → not needed since no formal draft step. Sculptor can add notes anytime until status flips to `validated`.
12. Should the final PDF be sent only to the sculptor, or also to a **finance/admin email** (BCC)?
13. Do you need an **invoice number scheme** (sequential like INV-2026-001)? Required in some countries for billing.

### What marks an item as "ready to bill"
14. `status = "finished"` triggers it — but is there a chance an item is `approved` first then `finished`? Or are they synonymous in your workflow?
15. **Multi-board sculptors**: same item never appears in 2 boards, right? (or do you ever duplicate a card across releases?)
16. If a sculptor finishes 2 items mid-month and 3 more end-of-month, the WO should include all 5. So we filter by `status=finished` AND `not in billed_items`, regardless of when finished. Confirm.

### Data already in the board
17. Currently each card has fields: `name (label)`, `artist`, `baseSize`, `dueDate`, `status`, `tier`, `note`. Anything missing for billing? (We may need a **character_type** field — currently you can infer from the tier/group label but not explicit.)
18. Should we add a `character_type` dropdown on each card (hero/troop/monster/...) to make billing unambiguous?

### Document format
19. PDF: minimal layout or branded (logo, header, footer with company info)?
20. Language: French or English?
21. Should the workorder list include **images** of each character (a thumbnail of `main_image`)?

---

## Implementation phases (suggested, after the spec simplification)

### Phase 0 — Setup
- Add `BACKOFFICE_SPEC.md` (this file ✓)
- Update `CONTEXT.md` to reference the back-office (✓)
- Get answers to the remaining open questions before writing pricing logic

### Phase 1 — DB schema + pricing UI
- Run the SQL above in Supabase (`prices`, `workorders`, `workorder_items`, `billed_items` tables + RLS)
- Create `back-office.html` skeleton:
  - Same auth as `index.html`, redirect to login if not authed
  - Role check → branch admin vs sculptor UI
- Build the Pricing grid editor (admin only, CRUD on `prices`)

### Phase 2 — Sculptor personal view (read-only first)
- Detect current user's email
- Auto-create their WIP workorder for the current month if it doesn't exist (with all their finished+unbilled items snapshotted in)
- Show line items + running total (no editing yet)
- Apply RLS so they only see their own row

### Phase 3 — Sculptor notes editing (live)
- Per-line note textarea (saves to `workorder_items.notes` on blur, debounced)
- Global month note (`workorders.notes_artist`)
- Realtime subscription so if admin adjusts something, sculptor sees it live

### Phase 4 — Admin view (build + validate)
- Artists list with per-artist totals + note presence indicator
- Open an artist's WO → admin can edit prices, uncheck lines, add admin notes
- "Validate" button → status → `validated`, lock further sculptor edits

### Phase 5 — PDF generation (client-side)
- Add pdfmake (CDN, ~250KB)
- "Preview PDF" button → modal with PDF.js or iframe
- Branded template (TBD — see question 19)

### Phase 6 — Final email pipeline
- Set up Resend account + API key
- Edge Function `send-workorder-email` (deploy with Verify JWT = OFF)
- Generates PDF client-side → sends to Edge Function → Resend → email + PDF attachment
- On success: status → `final_sent`, insert items into `billed_items` (atomic)
- Upload PDF to Supabase Storage for history

### Phase 7 — History + reporting
- Past workorders per artist (downloadable PDFs from Storage)
- Sums by month / artist
- CSV export for accounting

### Phase 8 — Polish
- Link from `index.html` user menu: "Back office" button (admin → admin view, others → personal view)
- Empty states ("No finished items yet this month")
- Loading states
- Error toasts

---

## Useful pointers for next Claude

- The parent app's items have an `artist` field (free text, set in the inspector). For matching sculptor identity, recommend a new field on each item `artist_email` (or a "link artist to member" UI). For v1, can do fuzzy match on `artist` text against `members.email` local-part.
- For multi-board: `state.boards[*].items[*]` — iterate all boards, filter by `artist === sculptor` and `status === 'finished'`.
- The parent app stores everything in one `boards_data` JSONB row. To read it server-side from an Edge Function, just fetch the row and parse the JSON. The client-side back-office can do this too via the existing Supabase client.
- **Snapshot** the relevant item fields into `workorder_items` at creation time — never re-read from `boards_data` to display past WOs (the source could have changed by then).
- Read-only mode (`body.readonly` class) won't apply here unless we explicitly set it.
- Edge Function for emails MUST be deployed with `Verify JWT = OFF` like `admin-create-user`, because the function does its own JWT verification.
- The "auto-create WIP workorder if missing" logic should be idempotent — running it twice for the same (artist, month) shouldn't duplicate. Use `INSERT … ON CONFLICT DO NOTHING` on `(artist_email, period)`.
- For the sculptor-vs-admin branching: same `back-office.html`, but the JS checks `currentUser.role === 'admin'` and renders one UI or the other. Keep the bundle in one file for simplicity.

---

## Quick start for next Claude

Open in this order:
1. `CONTEXT.md` (parent app overview)
2. This file (`BACKOFFICE_SPEC.md`)
3. `index.html` (the parent app — search for "Supabase config", "auth", "members modal" to see the patterns)
4. `supabase/functions/admin-create-user/index.ts` (template for the new email Edge Function)

Then:
- Ask the user for answers to the **Open questions** section before writing the pricing engine
- Phase 1 is the safest first concrete step (no UI risk, just DB + pricing CRUD)
