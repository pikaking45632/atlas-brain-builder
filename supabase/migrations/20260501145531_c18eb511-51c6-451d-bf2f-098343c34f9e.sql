-- Atlas — Invitations operational hardening
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invitations' and column_name='email') then
    alter table public.invitations add column email text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invitations' and column_name='role') then
    alter table public.invitations add column role text not null default 'member';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invitations' and column_name='token') then
    alter table public.invitations add column token text unique;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invitations' and column_name='accepted_at') then
    alter table public.invitations add column accepted_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='invitations' and column_name='status') then
    alter table public.invitations add column status text not null default 'pending';
  end if;

  update public.invitations set token = encode(extensions.gen_random_bytes(24), 'base64') where token is null;
  update public.invitations set expires_at = coalesce(created_at, now()) + interval '7 days' where expires_at is null;

  begin
    alter table public.invitations alter column token set not null;
  exception when others then null;
  end;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname='invitations_status_check') then
    alter table public.invitations add constraint invitations_status_check check (status in ('pending','accepted','revoked','expired'));
  end if;
  if not exists (select 1 from pg_constraint where conname='invitations_role_check') then
    alter table public.invitations add constraint invitations_role_check check (role in ('member','admin'));
  end if;
  if not exists (select 1 from pg_indexes where schemaname='public' and indexname='invitations_workspace_email_pending_uniq') then
    create unique index invitations_workspace_email_pending_uniq
      on public.invitations (workspace_id, lower(email)) where status = 'pending';
  end if;
end $$;

create index if not exists invitations_token_idx on public.invitations (token);
create index if not exists invitations_workspace_status_idx on public.invitations (workspace_id, status);

create or replace function public.generate_invitation_token()
returns text language sql security definer set search_path = public, extensions as $$
  select encode(extensions.gen_random_bytes(24), 'base64');
$$;

create or replace function public.accept_invitation(
  p_token text, p_user_id uuid, p_user_email text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_invitation record;
  v_workspace_id uuid;
begin
  select * into v_invitation from public.invitations where token = p_token for update;
  if not found then raise exception 'invitation_not_found' using errcode = 'P0001'; end if;
  if v_invitation.status = 'accepted' then raise exception 'invitation_already_accepted' using errcode = 'P0002'; end if;
  if v_invitation.status = 'revoked' then raise exception 'invitation_revoked' using errcode = 'P0003'; end if;
  if v_invitation.expires_at < now() then
    update public.invitations set status='expired' where id = v_invitation.id;
    raise exception 'invitation_expired' using errcode = 'P0004';
  end if;
  if lower(coalesce(v_invitation.email,'')) <> lower(p_user_email) then
    raise exception 'invitation_email_mismatch' using errcode = 'P0005';
  end if;
  v_workspace_id := v_invitation.workspace_id;
  insert into public.workspace_members (workspace_id, user_id, role, joined_at)
  values (v_workspace_id, p_user_id, v_invitation.role, now())
  on conflict (workspace_id, user_id) do update set role = excluded.role;
  update public.invitations set status='accepted', accepted_at=now() where id = v_invitation.id;
  return v_workspace_id;
end;
$$;

grant execute on function public.accept_invitation(text, uuid, text) to authenticated;

alter table public.invitations enable row level security;

drop policy if exists "invitations_select_member" on public.invitations;
create policy "invitations_select_member" on public.invitations for select to authenticated
using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

drop policy if exists "invitations_insert_admin" on public.invitations;
create policy "invitations_insert_admin" on public.invitations for insert to authenticated
with check (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role in ('owner','admin')));

drop policy if exists "invitations_update_admin" on public.invitations;
create policy "invitations_update_admin" on public.invitations for update to authenticated
using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role in ('owner','admin')));

drop policy if exists "invitations_delete_admin" on public.invitations;
create policy "invitations_delete_admin" on public.invitations for delete to authenticated
using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid() and role in ('owner','admin')));