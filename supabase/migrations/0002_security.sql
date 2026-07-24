-- Restrict direct Supabase access to users registered as administrators.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'schools', 'app_settings', 'periods', 'students', 'applications',
    'student_data', 'guardian_data', 'emergency_contacts', 'document_types',
    'document_uploads', 'form_field_settings', 'activity_logs', 'admins'
  ] loop
    policy_name := 'admin_all_' || case when table_name = 'emergency_contacts' then 'emergency' else table_name end;
    execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      policy_name, table_name
    );
  end loop;
end $$;

drop policy if exists admin_read_documents on storage.objects;
drop policy if exists admin_manage_documents on storage.objects;
create policy admin_read_documents
  on storage.objects for select to authenticated
  using (bucket_id = 'kjp-documents' and public.is_admin());
create policy admin_manage_documents
  on storage.objects for all to authenticated
  using (bucket_id = 'kjp-documents' and public.is_admin())
  with check (bucket_id = 'kjp-documents' and public.is_admin());

create unique index if not exists periods_one_active_idx
  on public.periods ((is_active)) where is_active = true;

alter table public.document_types add column if not exists code text;
create unique index if not exists document_types_code_unique_idx
  on public.document_types(code) where code is not null;
