-- Verify the bucket exists. If it doesn't, create it as private.
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'documents') then
    insert into storage.buckets (id, name, public, file_size_limit)
    values ('documents', 'documents', false, 52428800);
  else
    update storage.buckets set public = false where id = 'documents' and public = true;
  end if;
end $$;

drop policy if exists "documents_select_workspace_member" on storage.objects;
drop policy if exists "documents_insert_own_path" on storage.objects;
drop policy if exists "documents_update_own_path" on storage.objects;
drop policy if exists "documents_delete_own_or_admin" on storage.objects;

create policy "documents_select_workspace_member"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select wm.workspace_id from public.workspace_members wm where wm.user_id = auth.uid()
    )
  );

create policy "documents_insert_own_path"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select wm.workspace_id from public.workspace_members wm where wm.user_id = auth.uid()
    )
    and (storage.foldername(name))[2]::uuid = auth.uid()
  );

create policy "documents_update_own_path"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select wm.workspace_id from public.workspace_members wm where wm.user_id = auth.uid()
    )
    and (storage.foldername(name))[2]::uuid = auth.uid()
  )
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select wm.workspace_id from public.workspace_members wm where wm.user_id = auth.uid()
    )
    and (storage.foldername(name))[2]::uuid = auth.uid()
  );

create policy "documents_delete_own_or_admin"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'documents'
    and (
      (
        (storage.foldername(name))[1]::uuid in (
          select wm.workspace_id from public.workspace_members wm where wm.user_id = auth.uid()
        )
        and (storage.foldername(name))[2]::uuid = auth.uid()
      )
      OR
      (
        (storage.foldername(name))[1]::uuid in (
          select wm.workspace_id from public.workspace_members wm
          where wm.user_id = auth.uid() and wm.role in ('admin', 'owner')
        )
      )
    )
  );