# Supabase setup — Release Board

## 1. Create Supabase project

1. Go to https://supabase.com → Sign up / log in
2. New project (free tier is fine):
   - Name: e.g. `releases-board`
   - DB password: generate strong, save it
   - Region: closest to you (e.g. `eu-west-1` or `us-east-1`)
3. Wait ~2 min for provisioning

## 2. Get the URL + anon key

In the project dashboard:
- **Settings → API**
- Copy `Project URL` (looks like `https://abcdefgh.supabase.co`)
- Copy `anon public` key (long string starting with `eyJ...`)

You'll paste both into `index.html` (see step 6).

## 3. Run the SQL schema

In Supabase dashboard:
- **SQL Editor → New query**
- Paste the SQL below
- Click **Run**

```sql
-- Members (who can access the app + their role)
create table public.members (
  email text primary key,
  role  text not null check (role in ('admin', 'editor', 'reader')),
  created_at timestamptz default now()
);

-- The shared workspace data (single row, holds the whole boards JSON)
create table public.boards_data (
  id text primary key default 'default',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  updated_by text
);
insert into public.boards_data (id, data) values
  ('default', '{"boards":[{"id":1,"year":2026,"name":"Current Release","view":{"x":0,"y":0,"z":1},"items":[],"nextId":1}],"currentBoardId":1,"nextBoardId":2}'::jsonb);

-- Seed: you as admin
insert into public.members (email, role) values ('jr@ragingheroes.com', 'admin');

-- Enable RLS
alter table public.members enable row level security;
alter table public.boards_data enable row level security;

-- Helper: get the calling user's role
create or replace function public.current_role()
returns text language sql security definer set search_path = public stable as $$
  select role from public.members where lower(email) = lower(auth.jwt() ->> 'email')
$$;

-- members policies
create policy "members_select_for_members"
  on public.members for select
  using (public.current_role() is not null);

create policy "members_admin_all"
  on public.members for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- boards_data policies
create policy "boards_data_select_for_members"
  on public.boards_data for select
  using (public.current_role() is not null);

create policy "boards_data_write_for_editors"
  on public.boards_data for update
  using (public.current_role() in ('admin', 'editor'))
  with check (public.current_role() in ('admin', 'editor'));

-- Enable Realtime on both tables
alter publication supabase_realtime add table public.boards_data;
alter publication supabase_realtime add table public.members;
```

## 4. Configure email OTP (6-digit code instead of magic link)

In Supabase dashboard:
- **Authentication → Providers → Email** — make sure it's enabled
- **Authentication → Emails → Templates → "Magic Link"** template

Replace the default HTML with:

```html
<h2>Your sign-in code</h2>
<p>Enter this code in the app:</p>
<p style="font-size:32px;letter-spacing:.2em;font-weight:700">{{ .Token }}</p>
<p style="color:#666;font-size:12px">Valid for 1 hour. If you didn't request this, ignore.</p>
```

Save.

## 5. URL configuration

- **Authentication → URL Configuration**
- **Site URL**: your Netlify URL (e.g. `https://your-site.netlify.app`) — or `http://localhost` for testing locally
- Add the same URL to **Redirect URLs**

(For OTP flow we don't actually use redirects, but Supabase complains if not set.)

## 6. Paste the keys into the app

Open `index.html`, find this block near the top of the `<script>` (search `SUPABASE_URL`):

```js
const SUPABASE_URL      = "";   // paste here
const SUPABASE_ANON_KEY = "";   // paste here
```

Fill both, save, re-deploy (drag `deploy/` on Netlify).

## 7. First login

1. Open the deployed app
2. Enter `jr@ragingheroes.com`
3. Check your email for the 6-digit code
4. Enter it → you're in as admin

## 8. Inviting others

Once logged in as admin:
- Open the **Team menu** (button in topbar)
- Enter their email + choose role (`editor` or `reader`)
- Click Add — they're now invited
- Tell them: "Go to <your URL>, enter your email, then the code from the email"

## Roles

| Role    | Can view | Can edit | Can manage members |
|---------|----------|----------|--------------------|
| admin   | ✓        | ✓        | ✓                  |
| editor  | ✓        | ✓        |                    |
| reader  | ✓        |          |                    |

Read-only enforced both client-side (UI hidden) and server-side (RLS prevents writes).

## Free tier limits

- Auth: unlimited active users
- Database: 500 MB (you'll fit ~10k images stored as URLs; for big projects, switch image storage to Supabase Storage later)
- Realtime: 200 concurrent connections (plenty)
- Bandwidth: 5 GB / month

## Troubleshooting

- **"Not invited" after login** → add your email to the `members` table via SQL editor or via the admin UI from another admin
- **Code email never arrives** → check Supabase logs (Authentication → Logs), check spam, possibly add custom SMTP under Settings → Auth
- **Can't write to board as editor** → check RLS policies are enabled, check your role in `members` table
