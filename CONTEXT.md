# CONTEXT — Release Board

Last updated: 2026-10-15

Snapshot of project state for the next Claude session. Read this first, then `assets/` for the original product spec, and `BACKOFFICE_SPEC.md` for the planned billing module.

---

## What is this

A **Visual Release Review App** for Raging Heroes (miniature production team). Replaces a heavy Photoshop board used monthly to review figurine releases.

- Visual board organized by **tier frames** (Heroes / Troops / Monsters / Sceneries / Sovereign / Throwback / Dioramas)
- Each card is an image or empty **slot** with: image, label, status color, artist, base size, due date, brief link, thread link, note, tier (Leader/Overlord/Sovereign), optional alt version
- Multi-release: each release lives in its own **board**, organized by **year tabs → release tabs**
- Realtime sync via **Supabase** (shared board across team)
- **Roles**: admin (manages team) / editor (can edit) / reader (view-only)
- **AI name generation** for nodes via Anthropic Claude or OpenAI (server-side proxy)

The original product spec is in `assets/` (11 markdown docs the user wrote before coding). It's a Photoshop replacement, NOT a project management tool — keep that guardrail.

---

## Architecture

**Single HTML file**: `index.html` (~5000 lines, all CSS+JS inline). No build step. Opens directly in browser or deployed as-is.

**Backend**: Supabase
- Project URL: `https://jwokrnrpmzscmnazzmci.supabase.co`
- Publishable anon key: hardcoded in `index.html` (safe by design — RLS protects data)
- DB password: in `.env.local` (gitignored)
- Region: West EU (Paris)
- Free tier

**Storage model**: single jsonb row in `boards_data` table holds `{boards, nextBoardId}`. Per-user local state (currentBoardId, viewMode, selectedId, currentFilter) stays in JS memory only.

**Sync**: realtime subscription on `boards_data`. Local mutations debounced ~700ms → push to Supabase. Incoming updates re-render local state (ignored during active drag/resize/pill drag/pan).

**Sync hardening (2026-08-05)** — fixes the "things disappear" reports:
- **Optimistic lock**: `cloudSave()` only updates the row if `updated_at` still equals `lastSeenUpdatedAt` (the version we last loaded/wrote). On mismatch → sync indicator shows a conflict message + `refetchRemote()`. A stale client can no longer silently wipe everyone's work.
- **Truncated realtime payloads**: rows >~1MB (base64 images in jsonb) arrive truncated — `payload.new.data` missing. Old code threw mid-handler and left `isApplyingRemote` stuck at `true`, permanently disabling `save()` until reload (likely the main data-loss cause). Now guarded: truncated payload → `refetchRemote()` instead.
- **`refetchRemote()`**: cheap `updated_at` probe, full `cloudLoad()` + re-render only if changed. Called on window focus, `online`, `visibilitychange→visible`, channel `SUBSCRIBED` (reconnect catch-up), conflict, and truncated payloads. Skipped while a save is pending or an interaction is active.
- `suppressNextRealtime` flag removed (could swallow a colleague's update); self-echo still skipped via `updated_by`.
- **Storage migration is self-healing**: `scheduleMigrationIfNeeded()` (called after `refetchRemote()` and realtime applies) re-runs `migrateImagesToStorage()` 3s later if any `data:` URL is present in state — covers old clients pushing base64 and conflict rollbacks. The `board-images` bucket is confirmed live on the Supabase project (probe returned NoSuchKey, not "Bucket not found"). `cloudSave()` logs `[sync] payload ~N KB` to console — MBs there = migration still pending.

**Fallback**: if Supabase keys are empty OR SDK CDN fails to load, app silently runs in localStorage-only mode (no auth, no team features).

---

## Supabase setup

DB schema in `SUPABASE_SETUP.md` (already executed). Tables:
- `members(email pk, role, created_at)` — RLS: admins-only write, members-only read
- `boards_data(id pk='default', data jsonb, updated_at, updated_by)` — RLS: editors+admins write, members read
- Helper function `current_role()` (SECURITY DEFINER)
- Realtime publication on both tables
- Seeded: `jr@ragingheroes.com` = admin

**Auth flow (password-only, no OTP)**:
- Login screen = email + password only
- Account creation is admin-only via the Team modal → `admin-create-user` Edge Function
- Reset password = admin → "Reset pw" button per member in Team modal
- User menu has "Password" button → change own password
- OTP code path retired (functions `sendOtp` / `verifyOtp` are dead code, kept for future use)

---

## Edge Functions (Supabase)

Located in `supabase/functions/`. Each must be **deployed manually** in Supabase Dashboard → Edge Functions, with **Verify JWT = OFF** (we do our own auth checks).

### `admin-create-user` ✅ deployed
Handles account creation + password reset for admins. Two actions:
- `action: "create"` — creates auth.users + members row in one atomic call
- `action: "reset_password"` — updates an existing user's password
Uses `service_role` server-side. Called from `addMember()` and `resetMemberPassword()`.

### `ai-proxy` ⚠️ NEEDS DEPLOY + SECRETS
Proxies AI requests (Claude / ChatGPT) so API keys stay server-side. Called by `callAiProxy()` in the frontend.

**Deploy steps for the user**:
1. Supabase Dashboard → Edge Functions → Deploy new function → name `ai-proxy`
2. Paste contents of `supabase/functions/ai-proxy/index.ts`
3. Click function → Settings → **Verify JWT = OFF**
4. Edge Functions → **Secrets** → add `ANTHROPIC_API_KEY` (and/or `OPENAI_API_KEY`)
5. The function reads them via `Deno.env.get("ANTHROPIC_API_KEY")` at runtime

Without this function deployed + secrets set, the ✨ name-gen feature shows a clear error.

---

## File map

```
index.html              ← the whole desktop app (single source of truth)
mobile.html             ← phone client: swipe deck, same Supabase row / same auth (see "Mobile" below)
retouch-tool.js         ← standalone Liquify / Transform image editor (see RETOUCH_TOOL.md) — loaded by index.html
retouch-demo.html       ← demo / test page for retouch-tool.js (not deployed)
RETOUCH_TOOL.md         ← API + shortcuts of the retouch tool (reusable in other HTML projects)
deploy/index.html       ← copy ready for Netlify Drop (rsync after every change)
deploy/mobile.html      ← must be copied along with index.html
deploy/retouch-tool.js  ← must be copied along with index.html
netlify.toml            ← publish="." config
.gitignore              ← excludes .env*, .claude/, node_modules/, .netlify/
.env.local              ← Supabase keys + DB password + ADMIN password + AI keys reference (gitignored)
CONTEXT.md              ← this file
SUPABASE_SETUP.md       ← full Supabase setup guide (already executed)
BACKOFFICE_SPEC.md      ← spec for planned billing/workorders module (not built yet)
assets/                 ← product spec (11 MD + 8 PNG)
supabase/
  functions/
    admin-create-user/index.ts   ← deployed
    ai-proxy/index.ts            ← NEEDS DEPLOY
.git/                   ← initialized, has commits, no remote (user can't push to GitHub from their machine)
```

---

## Current state — features shipped

### Canvas / interactions
- Infinite pan/zoom canvas (Space+drag, middle-click, or drag on empty bg)
  - Pan starts in a **capture-phase** `mousedown` on `#viewport` so Space+drag pans even when the press lands on a card (item handlers `stopPropagation`). Middle-click on a pill `<a>` is left alone (open link in new tab).
  - `blurActiveTextField()` runs on canvas mousedown (pan + marquee): those handlers `preventDefault()`, which also cancels the browser's focus change — the release title / inspector field kept focus and the keyboard handler ignored Space/N/S/F/M ("la main ne marche plus"). Fixed 2026-09-14.
- Wheel zoom centered on cursor
- **Ctrl/Cmd + drag** = zoom-to-area rubber band (preempts item drag, fits selection to viewport)
- Drop images from OS = creates image node at drop position
- Ctrl+V paste image (also on slot or selected image = replaces)
- Drop/paste on existing image → archive old version, set new
- Drop/paste on slot → fills slot
- Multi-select via Shift+click (existing `selectedIds` Set; resize handle only shown when exactly one is selected)
- Resize handle on selected items (bottom-right, blue dot). Works on groups (pointer-events: auto on `.handle`).

### Item types
- `image` — sculpted image with label, status, info pills, alt version
- `slot` — empty placeholder, same overlay structure as image
- `note` — sticky yellow note, editable on double-click. Created via **+ Note / `N` / right-click → + Note** only — double-click on empty canvas used to create one, removed 2026-09-18 (too many accidental notes).
- `group` — tier frame (dashed border + label + watermark). Slots inside are NOT children — they don't move with the frame.
- `mini` — **callback node** showing a mini board (see below): `{ type: "mini", miniId, x, y, w, h }`.

### Mini boards (2026-10-15)
Named, tagged sets of reference pictures, saved from a release and **called back by tag** into any release. Linked, not copied: adding/removing a picture updates every node that calls the mini board.
- **Storage**: `board.miniBoards = [{ id: "mb_…", name, tags: [..], images: [{ id: "mi_…", src, label, ratio, from: { boardId, itemId } }], createdAt, createdBy }]` on the release where it was created. Deliberately NOT a new top-level key of `boards_data.data`: older clients (and mobile.html) save `{ boards, nextBoardId }` and would silently drop an unknown key, while they round-trip `state.boards` untouched. Lookups scan all boards (`allMiniBoards()`, `findMiniBoard(id)`). Deleting a release moves its mini boards to another release (`deleteBoard`).
- **Create**: select pictures → right-click one → "📚 Save N images as mini board…" (dialog: name + tags, existing tags offered as chips). Right-click keeps a multi-selection now (it used to reset it to the clicked item). Pictures are stored in reading order (rows, then left→right). "Add N images to a mini board…" appends to an existing one.
- **Call**: toolbar **+ Mini board**, key **`B`** or canvas right-click → picker (search by tag or name, `#tag` accepted, tag chips with counts, Enter = first result) → creates a callback node sized for its pictures (`miniDefaultSize`). The node draws a header (📚 name · count · #tags, counter-scaled) and a grid whose column count maximises picture size (`miniGridLayout`).
- **On a callback node**: double-click a picture → lightbox (←/→, Esc, "Place on the board", "Remove from mini board"); drop image files on it → they join the mini board (uploaded like any drop); right-click → View images / Edit name & tags / Choose another mini board / Add the selected images / Fit node to its images / Place this image on the board / Remove this image / Remove node (the mini board stays). Del deletes the node only. A node whose mini board was deleted shows "Mini board not found". No inspector for callback nodes.
- **Taking a picture out** (2026-10-15): drag a picture out of the node and drop it on the canvas → new `image` node there (400px max side, label copied), the picture stays in the mini board (`placeMiniImage`, `startMiniPull`). A ghost follows the cursor; dropping back on its own node or outside the viewport cancels; a click without moving just selects the node. Because pictures are now pull handles, **the node itself is moved by its title bar / margins** (cursor: move vs grab).
- The picker also edits (✎) and deletes (🗑) mini boards. Readers can view (double-click) but not create/call/edit.
- back-office (billing) and mobile.html only read `image` / `slot` (/ `note`) items, so callback nodes and mini-board pictures never reach workorders or the swipe deck.

### Statuses (image/slot, and alt)
`item.status` ∈ `sketch` / `wip` / `review` / `approved` / `question` / null. Every surface reads the same key: `.status-ring` (colored inset border on the node), inspector chips, alt-modal chips, right-click → Status submenu, hover-tip badge, version-modal badge (`#vm-status[data-st]`).
- **`question`** (added 2026-09-18) = there's an open question on the piece. Hot pink `--question: #ff2d95`: 3px ring + pulsing inset glow (`.status-ring::after`, opacity keyframes, disabled under `prefers-reduced-motion`) + outer glow on the `.item` itself (children are clipped by `.item { overflow: hidden }`, so the outer shadow has to live on the item; `.item.selected[data-status="question"]` merges it with the blue selection ring). In the 240px inspector the chip takes its own full row (`flex: 1 1 100%`).
- The back-office only looks at `approved` (`default_included`), so the new status doesn't affect billing.

### Node structure (image/slot) — CURRENT
```
.item.image (flex column, position: absolute)
  ├─ .content-row (flex: 1) — fills the whole item
  │   └─ .image-main (relative, overflow hidden)
  │       ├─ <img> (object-fit: contain)
  │       ├─ .label (absolute top-left badge with name)
  │       ├─ .node-side-tools (absolute BOTTOM-RIGHT, vertical stack)
  │       │   ├─ 📌 .pin-btn      (lock movement/resize)
  │       │   ├─ 📝 .note-btn     (opens note popup, yellow if has note)
  │       │   └─ ✨ .namegen-btn  (opens AI name suggestion panel)
  │       └─ .node-corner-tools (absolute TOP-RIGHT)
  │           └─ <select.tier-select> (Tier / Leader / Overlord / Sovereign)
  ├─ .pills-bar (absolute bottom: 0) — brief / thread / artist / base / due
  ├─ .status-ring (absolute inset, colored border)
  └─ .alt-peek (absolute inset, z-index -1, transform offset)
      ├─ image background + label + "ALT" badge
      └─ on .item:hover, slides LEFT and shows alongside the main card
```

### UI scaling (constant on screen)
All overlay elements (label, side-tools, corner-tools, pills-bar, handle, group-label, group-pin, group-watermark, alt-peek labels) are counter-scaled with:
```css
transform: scale(min(clamp(0.4, 1/zoom, 3), node-screen-w / 180));
```
- `--zoom` CSS variable set on `#world` by `applyView()`
- `--node-w` CSS variable set on each `.item` by `renderItem()` and `onResizeMove()`
- Cap by node width prevents overflow when node is small on screen

### Info system
- `INFO_FIELDS` = brief, thread, artist, base, size, due (note is separate — see below)
  - `size` = **miniature's size** (`item.miniSize`, e.g. "32mm", "54mm", "75mm") — added 2026-09-14. Inspector field "Miniature's size" (with a datalist of common scales) above Base size; 📏 pill in detail mode, purple "M" dot in overview, "Mini size" line in the hover tip. Not yet read by the back-office export (`base_size` only).
- Two view modes (toggle `M` key or button):
  - **Detail** (default): pills in horizontal bar at bottom of each node
  - **Overview**: image dimmed, pills replaced by tiny colored dots above each node (scan for missing info)

### Note colors
- One palette `NOTE_COLORS` = `{ id: { label, bg, edge } }`: yellow (default), red, pink, orange, green, blue, purple. The two PCs each shipped a 6-color version (one had red, the other pink); both ids are kept so every saved color still renders. Merged 2026-10-15.
- Card notes: `item.noteColor` → tints the 📝 button (`--note-c`) and the hover tooltip. Alt notes: `item.altNode.noteColor`. Both picked in the note popup swatch row (`#np-colors`, built once by `buildNoteColorRow()`, `highlightNoteSwatch()` / `pickNoteColor()`).
- Sticky notes: `item.color`, picked via right-click → Color submenu (colored dots). Rendering falls back to `item.noteColor` (what mobile.html wrote for stickies before 2026-10-15).
- Hover tooltip (`#note-tip`) gets the bg + left edge color (`showNoteTip(content, anchor, colorId)`)
- Absent field = yellow → zero migration needed, old boards unaffected

### Notes — NEW: popup + hover tooltip
- The integrated notes panel on the right of each node was removed
- Each node has a 📝 .note-btn in side-tools (yellow if note exists, gray otherwise)
- **Click** opens `#note-popup` (anchored near the button) with a textarea, saves live
- **Hover** for 200ms shows `#note-tip` — yellow tooltip preview of the note content
- The same popup is reused in the version modal header (`#vm-note-btn`) and alt modal header (`#alt-note-btn`) — `openNotePopup(item, anchor, target)` where target = "note" or "altNote"
- Inspector textarea + note-btn highlight + popup textarea stay in sync

### Pin (lock items in place)
- 📌 button in side-tools toggles `item.pinned`
- Pinned items don't drag, don't resize, handle is hidden
- Groups also have a `.group-pin` button next to their label (same behavior — useful to lock tier frames once arranged)

### Tier + filter
- Tier dropdown in `.node-corner-tools` (TOP-right of image)
- Filter buttons in topbar: Leader / Overlord / Sovereign
  - Leader = only Leader-tagged items
  - Overlord = Leader + Overlord
  - Sovereign = everything (default)
- Items without tier only show in Sovereign view
- Groups + notes ignored by filter (always shown)

### Alt version
- Checkbox "Has alt version" in inspector → adds an alt
- Stored as `item.altNode = {label, status, note, src, archive}`
- Visual indicator: **stacked card peek effect** — a second card (the alt-peek div) sits behind the main, offset top-left, visible peek
- **Hover the node**: the peek slides LEFT to sit alongside the main card, showing the alt's image + label + ALT badge
- **Click the peek**: opens the alt modal
- The alt modal has its own ✨ note button (edits `altNode.note`), drop/paste image area, status chips
- Alt thumbnail also visible in the version modal's right sidebar (`#vm-alts-list`)

### Version history modal
- Double-click image area = opens
- Layout: 3 columns inside the modal
  - **Left** (`#vm-history-list`, 124px): vertical thumbnails of current + archive (most recent first)
  - **Center**: big preview of selected version + caption
  - **Right** (`#vm-alts-list`, 124px): the alt thumbnail (or "no alt")
- Header has: title, status badge, 📝 note button, × close
- Restore button on each archived version → makes it current (archives the previous current)

### Retouch — Liquify / Transform (NEW)
- 🪄 button in node side-tools (image nodes with a picture, editors only), in the version modal header (`#vm-retouch-btn`) and in the alt modal header (`#alt-retouch-btn`)
- `openRetouch(item, target)` (target = "main" | "alt") → `RetouchTool.open(...)` from `retouch-tool.js` (standalone module, WebGL2, documented in `RETOUCH_TOOL.md`)
- On save: previous image archived (`archiveCurrentImage` / altNode.archive), result uploaded to Storage when possible, `render(); save();`, open modal refreshed
- While the tool is open it swallows all keyboard / mouse / wheel / drop / paste events (capture phase) so board shortcuts never fire
- Phone/tablet layout built in (bottom tool strip + bottom-sheet panel + pinch zoom / 2-finger pan); the board itself is still desktop-only

### AI name generation (NEW)
- ⚙ Settings modal (admin/editor/reader, accessible via topbar user menu):
  - AI provider: None / Anthropic / OpenAI
  - Model (optional, defaults: `claude-haiku-4-5` or `gpt-4o-mini`)
  - System prompt template (with `{description}` and `{negative}` tokens)
  - Default negative prompts (words/refs to avoid)
  - **No API key field** — keys are server-side via `ai-proxy` Edge Function
- ✨ button on each node opens `#namegen-popup`:
  - Description textarea
  - Extra negative prompts textarea
  - "Include the current image as visual reference" checkbox (sends image to vision-enabled model)
  - Generate → shows result → "Use this name" replaces `item.label`
  - "↻ Try again" for regeneration
- Calls `callAiProxy({ provider, model, prompt, image, maxTokens })` → POSTs to `${SUPABASE_URL}/functions/v1/ai-proxy` with user JWT
- The Edge Function adds the server-side key, calls Anthropic/OpenAI, returns the text

### Mobile — `mobile.html` (NEW)

Separate standalone page for phones. Same Supabase project, same `boards_data.id='default'`
row, same auth session (localStorage is shared per origin, so logging in on one page logs you
in on the other). No canvas: the board is flattened into a **swipe deck**.

**Reading order** — items are grouped by the tier frame whose rect contains their center
(smallest one wins), frames are ordered row-major, items inside a frame are ordered row-major
with a per-row tolerance. Ungrouped items land in a trailing "Hors tier" section. Sticky notes
are cards too. `group` items are never cards themselves.

**Navigation**
- Swipe left/right (pointer events, rubber band at both ends, velocity-aware threshold)
- Only `cur-1 .. cur+1` are in the DOM (`cards` Map + `ensureWindow` / `pruneWindow`) so big
  data-URL images don't pile up
- ▦ grid sheet: all cards as thumbnails grouped by tier, tap to jump
- ☰ / title: release picker (year → release), remembered in `rh.mobile.boardId`. Archived
  releases (`board.archived`, set from the desktop tabs) are listed apart under "ARCHIVÉES" and
  never landed on by default (`firstActiveBoard()`); an open archived release shows "📦 archivée"
  in the subtitle
- Filter button cycles ALL → LDR → OVL (same semantics as the desktop tier filter),
  remembered in `rh.mobile.filter`
- ← / → arrow keys work too (desktop testing)

**Card** — image (contain) + status ring + tier badge + name + chips
(status / artist / mini size / base / due, red when overdue / brief / thread / note preview).
`ALT` button flips the card to `altNode`; everything below then reads *and writes* the alt face
via the `face(it)` accessor. Tap the image → fullscreen viewer with pinch-zoom, double-tap zoom,
single-tap close, and the version-history strip (restore included, same splice logic as desktop).

**Editing** (editors/admins only; readers get a read-only note sheet and no Statut/Photo)
- Statut sheet → 5 chips (incl. Question) + "Aucun statut"
- Note sheet → textarea + the 7 note colors (`item.note` + `noteColor` on the current face,
  `item.text` + `item.color` for sticky notes — same fields as desktop)
- Photo → file input (camera or gallery), downscaled to 1800px / JPEG 0.88 before upload
  (small PNGs pass through untouched), uploaded with the same content-addressed SHA-256 path
  as the desktop app, previous image archived, slots flip to `type: "image"`
- `save()` writes the same `{boards, nextBoardId}` shape, 700ms debounce, realtime subscription
  on a separate channel name (`boards_data_sync_mobile`). Same sync hardening as index.html
  (2026-10-15): optimistic lock on `updated_at`, truncated-payload guard, `refetchRemote()` on
  focus / online / visible / SUBSCRIBED / focusout, no remote re-render while typing or swiping

**Routing** — `index.html` redirects to `mobile.html` when `pointer: coarse` and
`min(screen.width, screen.height) < 820`. It uses `screen.*` on purpose: index.html has no
viewport meta, so `innerWidth` reports ~980 on a phone. `index.html?desktop=1` sets
`rh.forceDesktop` in localStorage and pins the desktop version (that's what the mobile
"🖥 Version bureau" button links to). The desktop user menu has a "📱 Version mobile" button
that clears the flag and goes back.

**Not on mobile** (by design): moving/resizing/creating nodes, the inspector fields
(name, artist, base, due, links, tier, alt toggle), the retouch tool, AI name gen, team admin,
templates, export/import.

### Inspector (right panel)
- Hidden in readonly mode
- Fields: Name, Status chips (Sketch / WIP / Review / OK / Question), Artist, Base size, Due date, Brief link, Thread link, Note (textarea), Tier (dropdown), Has alt checkbox, Delete button

### Topbar (auto-hide)
- Editable release name (input top-left, syncs to current board)
- Filter buttons (top-right of title row)
- User menu (admin/editor/reader): email + role badge, **Vaguy link** (wave icon → https://vaguy-studio.netlify.app), Team button (admin only), **⚙ Settings**, Password, Logout
- Year tabs row + Release tabs row
  - **Reorder** (2026-09-14): drag a release tab onto another (HTML5 DnD, same year only, insertion mark before/after) or right-click → Move left / Move right. Order = order in `state.boards` (`moveBoard(id, targetId, before)` rewrites the year's slots in place) → syncs like everything else, no migration.
  - **Archive** (2026-09-14): right-click tab → Archive release sets `board.archived = true`. Archived boards are hidden from the tabs (and a year with only archived boards hides its year tab) but stay in state/sync. "📦 Archived (n)" button at the right end of the release row opens `#archive-popover` (all years): click a row = open it read-through (its tab shows as `📦 name`, italic/dashed, and an orange "📦 Archived · Restore" badge appears next to the title), "Restore" = unarchive. Last active board cannot be archived. `fallbackBoard(year, exclude)` picks where to land after archive/delete (active, same year first); `cb()`/`cloudLoad`/realtime/`bootApp` never land on an archived board. Readers see the popover but not Restore (`body.readonly`).
  - Topbar auto-hide is suspended while the popover or the ctx-menu is open (`isTopbarPinnedOpen()`).
- **Auto-hide**: bar is hidden by default; reveals when cursor is in top 26px; **3-second delay before hiding** when cursor leaves the zone
- 3-second boot grace so the bar stays visible initially

### Toolbar (left, below topbar)
- + Note, + Slot, + Tier, zoom −/+/Fit/1:1, Mode toggle (Detail/Overview), Load base template, Export/Import JSON, Clear
- Hidden buttons for readers (only zoom/fit/mode visible)

### Templates
- `Load base template` button generates the default Raging Heroes structure (Heroes 9, Machine & Monster 3, Troops 5, Sceneries 2, Sovereign Heroes 2, Sovereign Troops 4, Throwback Troops 4, Dioramas 2)
- Each tier frame has 64px TIER_HEADER so the watermark category name stays visible above the slots

### Team modal (admin only)
- List members with role dropdown + Remove + **Reset pw** button
- Add new member: email + password + role → calls `admin-create-user` Edge Function (action: "create")
- Reset pw: prompt for new password → calls Edge Function (action: "reset_password")

### Read-only enforcement
- `body.readonly` hides inspector, edit buttons, tier select interaction, tab close, title editing
- `save()` is a no-op for readers (`canEdit()` check)
- Server-side: RLS blocks any write attempts

### Misc
- Group resize fixed (was broken due to `pointer-events: none` inheritance — `.handle` now has `pointer-events: auto`)
- Group label has invisible `.group-edge` borders so clicking the dashed border also drags/selects
- Items can be `hidden` flagged (`hidden-flag` for editors, `hidden-from-readers` for readers) — shown elsewhere in code, not in my session's scope
- `migrateImagesToStorage()` exists (line ~5000) — moves images from jsonb to Supabase Storage when possible

---

## Z-index reference

```
9999  #auth-screen                   (full-screen login overlay)
700   #note-popup                    (note edit)
650   #note-tip                      (note hover preview)
600   #alt-modal                     (alt version modal)
550   #password-modal, #settings-modal
500   #version-modal, #members-modal
450   (previously note-popup, now bumped)
280   (previously note-tip)
200   #drop-overlay
110   #topbar
100   #toolbar, #inspector
90    #sync-indicator
6     .alt-peek (when hovered)
4     .node-corner-tools, .node-side-tools
3     .pills-bar
-1    .alt-peek (default — behind main card)
```

---

## Where we are RIGHT NOW

User just asked to move AI keys server-side. Done:
- New Edge Function `ai-proxy` written (`supabase/functions/ai-proxy/index.ts`)
- Frontend updated: removed API key field from Settings, `callAiProxy()` posts to the function with user JWT
- `.env.local` updated with placeholder rows for `ANTHROPIC_API_KEY` and `OPENAI_API_KEY`
- **User must now deploy the function + set the secrets in Supabase** before AI features work end-to-end

Earlier in this session, also added:
- Note popup + hover tooltip (replaced integrated notes panel)
- Pin feature
- Ctrl/Cmd + drag = zoom-to-area
- Stacked card peek for alts (replaced the alts-column thumbnail)
- Layout split: side-tools (bottom-right vertical) + corner-tools (top-right)
- UI counter-scaling with fit-cap
- Topbar 3-second hide delay
- ⚙ Settings modal
- ✨ AI name generation panel

---

## Known limitations (NOT bugs — by design or deferred)

- Images stored as data URLs in jsonb (single Postgres row). Will fill 500MB free tier with ~10k images. `migrateImagesToStorage()` exists for partial migration to Supabase Storage.
- Last-write-wins for concurrent edits (no CRDT/OT). Fine for small team with rough coordination.
- Detail images per card not implemented (only main image + 1 alt). Original spec mentions multiple detail views — could be added.
- No search by name.
- No focus view (large zoom on click) — only the version modal.
- Slots inside groups are NOT children of the group (no parent-child). Moving the frame doesn't move slots. Resizing the frame doesn't reflow slots.
- View mode (Detail/Overview) and currentFilter are global per session, not per-user-saved.
- Multi-tenant: one workspace (`boards_data.id='default'`). For multiple teams, add a workspace column + RLS by workspace.
- `applyRoleUI()` runs once on bootApp; if admin demotes a logged-in user, the UI doesn't refresh live (RLS still blocks writes server-side).
- Email template customization is per-project in Supabase Dashboard.
- AI proxy requires Supabase auth (no local-only mode for AI features).
- ✨ button is visible to readers too, but `canEdit()` should gate the actual call (currently not strictly gated client-side — RLS doesn't apply because Edge Function does its own check; readers can call the proxy but their generated name can't be saved back to the node).

---

## Recent design decisions

- **AI keys server-side** via Supabase Edge Function (was originally client-side localStorage — user requested it be moved out of the browser)
- **Note popup** replaces integrated notes panel (cleaner, more space for image)
- **Note hover** = yellow tooltip preview
- **Pin** on nodes + groups (lock movement/resize once arranged)
- **Stacked card peek effect** for alts — visual hint that there's another card, slides out on hover. Replaces the ALT thumbnail column that was on the right of the panel.
- **Side-tools (📌📝✨) bottom-right vertical** + **corner-tools (tier) top-right** — replaces the older horizontal cluster
- **UI counter-scaling** so icons stay constant size on screen, with a fit-cap based on node width to prevent overflow on small nodes
- **Pills-bar absolute** (bottom: 0) instead of in flex layout — lets it scale cleanly without leaving empty layout space
- **Topbar auto-hides** with 3s grace period after cursor leaves the top zone
- **`select()` updates DOM in place** — no `render()` call (was breaking dblclick detection because the DOM identity changed between the two clicks)
- **Supabase SDK loaded dynamically** — avoids hanging the page if jsdelivr CDN is slow/blocked. 8s timeout, falls back to local mode if SDK can't load
- **Auth screen visible by default at script start**, hidden by `authInit()` only after session restored — avoids flash of unauthenticated content on F5

---

## How to test / deploy

**Local test**:
```
open E:/Claude code/figma/index.html
```

**Deploy** (no compile step):
```
cp index.html deploy/index.html
cp mobile.html deploy/mobile.html
# Then drag E:/Claude code/figma/deploy/ on app.netlify.com/drop
```

Site URL in Supabase Auth → URL Configuration should match the deployed Netlify URL (currently `monthly-release-board.netlify.app`).

**Git**: initialized locally, several commits. No remote (user couldn't push to GitHub from their machine — was a network issue). Re-try `git push` when possible.

---

## Style + voice for conversation with user

- User speaks French primarily; technical English in code/UI
- Direct, no preamble
- Show changes inline; copy to `deploy/` after every edit (user's deployment workflow)
- When ambiguous, ask with AskUserQuestion (max 2 questions)
- After each Edit on `index.html`, the harness shows the file in a Launch preview panel — mention this once per response

---

## Quick start for next Claude

If user opens with "continue" or similar:
1. Read this file (you're doing it now)
2. Skim `index.html` (focus on `<script>` section, search for relevant keywords)
3. Ask user what they want to attack next.

**Likely follow-ups from current state**:
- **Test / debug AI name gen** — user just set up the proxy, may need help deploying the Edge Function and configuring secrets
- **Back-office / Workorders module** — separate sister app for end-of-month billing. Full spec in `BACKOFFICE_SPEC.md`. **Recommend a NEW conversation** if it's a fresh session — this is a substantial new feature.
- Detail images per card (Phase 6 of original docs in `assets/`)
- Focus view (large zoom on click, distinct from version modal)
- Search/filter by name
- Migrate images to Supabase Storage (function exists, may need polish)
- Per-user saved view preferences (Detail/Overview mode, filter)

Don't restate everything from this file — user already knows.

---

## Sibling spec docs

- **`BACKOFFICE_SPEC.md`** — full spec for the planned back-office module (workorders, pricing, PDF emails, sculptor amendment loop). Read this if user mentions workorders, billing, sculptor invoicing, or end-of-month process. Has open questions that MUST be answered before building the pricing engine.
- **`SUPABASE_SETUP.md`** — initial DB schema + email template setup (already executed). Read if user is reinstalling from scratch.
