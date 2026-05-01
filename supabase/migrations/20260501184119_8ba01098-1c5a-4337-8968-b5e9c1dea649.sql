create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text,
  source text,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'waitlist_signups_email_uniq'
  ) then
    create unique index waitlist_signups_email_uniq
      on public.waitlist_signups (lower(email));
  end if;
end $$;

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

drop policy if exists "waitlist_insert_anonymous" on public.waitlist_signups;
create policy "waitlist_insert_anonymous"
  on public.waitlist_signups
  for insert
  to anon, authenticated
  with check (true);

comment on table public.waitlist_signups is
  'Public waitlist captured while the app is in waitlist mode. Reads are service-role-only.';