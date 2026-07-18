-- ============================================================================
-- Portal Pendataan KJP Plus — Migration 0001
-- Inisialisasi schema: tabel, index, RLS, storage bucket, trigger
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Fungsi helper trigger updated_at
-- ----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. TABEL
-- ============================================================================

-- 1.1 schools ----------------------------------------------------------------
create table if not exists public.schools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  whatsapp    text,
  logo_url    text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 1.2 app_settings (key-value: pengaturan global aplikasi) --------------------
create table if not exists public.app_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  value      jsonb,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

-- 1.3 periods -----------------------------------------------------------------
create table if not exists public.periods (
  id         uuid primary key default gen_random_uuid(),
  year       text unique not null,
  label      text,
  is_active  boolean default false,
  created_at timestamptz default now()
);

-- 1.4 students ----------------------------------------------------------------
create table if not exists public.students (
  id         uuid primary key default gen_random_uuid(),
  nisn       text unique not null,
  name       text not null,
  class      text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 1.5 applications ------------------------------------------------------------
create table if not exists public.applications (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students(id) on delete cascade,
  period_id       uuid not null references public.periods(id) on delete cascade,
  status          text not null default 'not_started'
                  check (status in ('not_started','draft','submitted','needs_revision','verified')),
  revision_notes  text,
  submitted_at    timestamptz,
  verified_at     timestamptz,
  verified_by     uuid references auth.users(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (student_id, period_id)
);

-- 1.6 student_data (Bagian I) -------------------------------------------------
create table if not exists public.student_data (
  id                uuid primary key default gen_random_uuid(),
  application_id    uuid unique not null references public.applications(id) on delete cascade,
  -- Identitas
  nik               text,
  no_kk             text,
  name              text,
  gender            text check (gender in ('L','P')),
  birth_place       text,
  birth_date        date,
  mother_name       text,
  -- Alamat
  address           text,
  rt                text,
  rw                text,
  province          text,
  city              text,
  district          text,
  sub_district      text,
  postal_code       text,
  -- Identitas Tambahan
  class             text,
  nisn              text,
  npwp              text,
  identity_expiry   date,
  identity_permanent boolean default false,
  phone_mobile      text,
  phone_home        text,
  -- Alamat Surat & Tempat Tinggal
  mail_pickup       text check (mail_pickup in ('self','delivery')),
  address_type      text,
  residence_status  text check (residence_status in ('pribadi','bukan_pribadi')),
  -- Sosial
  religion          text,
  education         text,
  disability        text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- 1.7 guardian_data (Bagian II) ----------------------------------------------
create table if not exists public.guardian_data (
  id                uuid primary key default gen_random_uuid(),
  application_id    uuid unique not null references public.applications(id) on delete cascade,
  -- Identitas
  name              text,
  nik               text,
  ktp_expiry        date,
  ktp_permanent     boolean default false,
  npwp              text,
  no_kk             text,
  birth_place       text,
  birth_date        date,
  gender            text check (gender in ('L','P')),
  religion          text,
  occupation        text,
  mother_name       text,
  marital_status    text check (marital_status in ('lajang','menikah','janda_duda')),
  last_education    text,
  employment_status text check (employment_status in ('tetap','honorer','kontrak','tidak_kerja')),
  -- Alamat
  address           text,
  rt                text,
  rw                text,
  province          text,
  city              text,
  district          text,
  sub_district      text,
  postal_code       text,
  residence_status  text check (residence_status in ('pribadi','bukan_pribadi')),
  phone_mobile      text,
  phone_home        text,
  address_type      text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- 1.8 emergency_contacts (Bagian III) ----------------------------------------
create table if not exists public.emergency_contacts (
  id                uuid primary key default gen_random_uuid(),
  application_id    uuid unique not null references public.applications(id) on delete cascade,
  name              text,
  id_number         text,
  relationship      text,
  address           text,
  rt                text,
  rw                text,
  province          text,
  city              text,
  district          text,
  sub_district      text,
  postal_code       text,
  phone             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- 1.9 document_types ---------------------------------------------------------
create table if not exists public.document_types (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  is_required boolean default true,
  is_active   boolean default true,
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 1.10 document_uploads ------------------------------------------------------
create table if not exists public.document_uploads (
  id               uuid primary key default gen_random_uuid(),
  application_id   uuid not null references public.applications(id) on delete cascade,
  document_type_id uuid not null references public.document_types(id) on delete cascade,
  file_name        text not null,
  file_size        bigint,
  file_path        text not null,
  mime_type        text,
  uploaded_at      timestamptz default now(),
  unique (application_id, document_type_id)
);

-- 1.11 form_field_settings ---------------------------------------------------
create table if not exists public.form_field_settings (
  id          uuid primary key default gen_random_uuid(),
  field_key   text unique not null,
  label       text not null,
  section     text not null check (section in ('student','guardian','emergency')),
  is_enabled  boolean default true,
  updated_at  timestamptz default now(),
  updated_by  uuid references auth.users(id)
);

-- 1.12 activity_logs ---------------------------------------------------------
create table if not exists public.activity_logs (
  id            uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  actor_type    text not null check (actor_type in ('parent','admin')),
  actor_id      text,
  action        text not null,
  description   text,
  created_at    timestamptz default now()
);

-- 1.13 admins (linked ke auth.users) -----------------------------------------
create table if not exists public.admins (
  id         uuid primary key references auth.users(id),
  name       text not null,
  email      text not null,
  role       text default 'admin' check (role in ('superadmin','admin')),
  created_at timestamptz default now()
);

-- ============================================================================
-- 2. INDEX
-- ============================================================================
create index if not exists idx_applications_student    on public.applications(student_id);
create index if not exists idx_applications_period     on public.applications(period_id);
create index if not exists idx_applications_status     on public.applications(status);
create index if not exists idx_students_nisn           on public.students(nisn);
create index if not exists idx_document_uploads_app    on public.document_uploads(application_id);
create index if not exists idx_activity_logs_app       on public.activity_logs(application_id);
create index if not exists idx_document_types_sort     on public.document_types(sort_order);

-- ============================================================================
-- 3. TRIGGER updated_at (semua tabel yang punya kolom updated_at)
-- ============================================================================
create trigger trg_schools_updated_at      before update on public.schools          for each row execute function public.handle_updated_at();
create trigger trg_app_settings_updated_at before update on public.app_settings     for each row execute function public.handle_updated_at();
create trigger trg_students_updated_at     before update on public.students         for each row execute function public.handle_updated_at();
create trigger trg_applications_updated_at before update on public.applications     for each row execute function public.handle_updated_at();
create trigger trg_student_data_updated_at before update on public.student_data     for each row execute function public.handle_updated_at();
create trigger trg_guardian_data_updated_at before update on public.guardian_data   for each row execute function public.handle_updated_at();
create trigger trg_emergency_updated_at    before update on public.emergency_contacts for each row execute function public.handle_updated_at();
create trigger trg_document_types_updated_at before update on public.document_types for each row execute function public.handle_updated_at();
create trigger trg_form_field_updated_at   before update on public.form_field_settings for each row execute function public.handle_updated_at();

-- ============================================================================
-- 4. TRIGGER: enforce single active period
-- ============================================================================
create or replace function public.enforce_single_active_period()
returns trigger
language plpgsql
as $$
begin
  if new.is_active = true then
    update public.periods set is_active = false where id <> new.id;
  end if;
  return new;
end;
$$;

create trigger trg_single_active_period
  after insert or update on public.periods
  for each row
  when (new.is_active = true)
  execute function public.enforce_single_active_period();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- Prinsip: orang tua TIDAK pakai Supabase Auth — akses mereka via service role
-- dari server-side API route (bypass RLS). RLS di bawah hanya untuk admin
-- (role `authenticated`) karena single-school: admin bisa akses semua baris.
-- ============================================================================

alter table public.schools            enable row level security;
alter table public.app_settings       enable row level security;
alter table public.periods            enable row level security;
alter table public.students           enable row level security;
alter table public.applications       enable row level security;
alter table public.student_data       enable row level security;
alter table public.guardian_data      enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.document_types     enable row level security;
alter table public.document_uploads   enable row level security;
alter table public.form_field_settings enable row level security;
alter table public.activity_logs      enable row level security;
alter table public.admins             enable row level security;

-- Helper: hanya admin (user terautentikasi) yang boleh akses.
-- Karena single-school, policy mengizinkan semua baris untuk authenticated.
create policy "admin_all_schools"      on public.schools            for all to authenticated using (true) with check (true);
create policy "admin_all_app_settings" on public.app_settings       for all to authenticated using (true) with check (true);
create policy "admin_all_periods"      on public.periods            for all to authenticated using (true) with check (true);
create policy "admin_all_students"     on public.students           for all to authenticated using (true) with check (true);
create policy "admin_all_applications" on public.applications       for all to authenticated using (true) with check (true);
create policy "admin_all_student_data" on public.student_data       for all to authenticated using (true) with check (true);
create policy "admin_all_guardian_data" on public.guardian_data     for all to authenticated using (true) with check (true);
create policy "admin_all_emergency"    on public.emergency_contacts for all to authenticated using (true) with check (true);
create policy "admin_all_document_types" on public.document_types   for all to authenticated using (true) with check (true);
create policy "admin_all_document_uploads" on public.document_uploads for all to authenticated using (true) with check (true);
create policy "admin_all_form_fields"  on public.form_field_settings for all to authenticated using (true) with check (true);
create policy "admin_all_activity_logs" on public.activity_logs     for all to authenticated using (true) with check (true);
create policy "admin_all_admins"       on public.admins             for all to authenticated using (true) with check (true);

-- ============================================================================
-- 6. STORAGE BUCKET + STORAGE RLS
-- Bucket: kjp-documents (private). Upload via service role (server-side).
-- Baca (preview/download) hanya admin (authenticated) via signed URL.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('kjp-documents', 'kjp-documents', false)
on conflict (id) do nothing;

create policy "admin_read_documents"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'kjp-documents');

-- Insert/Update/Delete file hanya via service role (role 'service_role'),
-- yang secara default bypass RLS — tidak perlu policy eksplisit.
-- Namun untuk kejelasan, izinkan authenticated melakukan manage juga
-- (admin bisa upload via UI yang difasilitasi server).
create policy "admin_manage_documents"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'kjp-documents')
  with check (bucket_id = 'kjp-documents');
