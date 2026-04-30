-- Feature waitlist
create table if not exists public.feature_waitlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  feature_key text not null,
  email text not null,
  note text,
  created_at timestamptz not null default now(),
  unique (feature_key, email)
);

create index if not exists feature_waitlist_feature_key_idx on public.feature_waitlist (feature_key);
create index if not exists feature_waitlist_workspace_id_idx on public.feature_waitlist (workspace_id);

alter table public.feature_waitlist enable row level security;

drop policy if exists "feature_waitlist_insert_own" on public.feature_waitlist;
create policy "feature_waitlist_insert_own"
  on public.feature_waitlist for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "feature_waitlist_select_own" on public.feature_waitlist;
create policy "feature_waitlist_select_own"
  on public.feature_waitlist for select to authenticated
  using (auth.uid() = user_id);

-- profiles polish columns
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists email text;

-- workspaces polish columns
alter table public.workspaces add column if not exists logo_url text;

comment on table public.feature_waitlist is
  'Captures interest in features that are soft-launched (UI present, backend not yet built). Used to gauge demand before building.';