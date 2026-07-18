-- ============================================================================
-- Portal Pendataan KJP Plus — Migration 0002
-- Seed data awal: periode aktif, document_types, form_field_settings
-- Catatan: akun admin dibuat via Supabase Auth / UI manajemen admin, lihat bawah.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Periode aktif default (hanya satu is_active=true)
-- ----------------------------------------------------------------------------
insert into public.periods (year, label, is_active)
values ('2025', 'Tahun Anggaran 2025', true)
on conflict (year) do nothing;

-- ----------------------------------------------------------------------------
-- 2. document_types (jenis dokumen umum KJP Plus)
-- ----------------------------------------------------------------------------
insert into public.document_types (name, description, is_required, is_active, sort_order)
values
  ('Fotokopi KTP Wali',      'KTP orang tua/wali murid',                 true,  true, 1),
  ('Kartu Keluarga',         'KK terbaru',                               true,  true, 2),
  ('Fotokopi KIP/KKS',       'Kartu Indonesia Pintar / Kartu Keluarga Sejahtera', true, true, 3),
  ('Pas Foto Siswa',         'Pas foto terbaru ukuran 3x4',               true,  true, 4),
  ('Surat Keterangan Tidak Mampu', 'SKTM dari kelurahan (jika ada)',     false, true, 5),
  ('Fotokopi Rapor',         'Rapor semester terakhir',                  false, true, 6)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- 3. form_field_settings (semua field yang bisa di-toggle admin)
--    Default is_enabled = true. Field OFF tidak dirender di form orang tua.
-- ----------------------------------------------------------------------------
insert into public.form_field_settings (field_key, label, section, is_enabled)
values
  -- Bagian I: Data Pribadi Siswa
  ('student_npwp',          'NPWP Siswa',                 'student',  true),
  ('student_phone_home',    'No. Telepon Siswa',          'student',  true),
  ('student_disability',    'Disabilitas (khusus SLB)',   'student',  true),
  ('student_identity_permanent', 'Identitas Berlaku Seumur Hidup', 'student', true),
  -- Bagian II: Data Wali
  ('guardian_npwp',         'NPWP Wali',                  'guardian', true),
  ('guardian_phone_home',   'No. Telepon Wali',           'guardian', true),
  ('guardian_ktp_permanent','KTP Wali Berlaku Seumur Hidup', 'guardian', true)
on conflict (field_key) do nothing;

-- ----------------------------------------------------------------------------
-- 4. app_settings default
-- ----------------------------------------------------------------------------
insert into public.app_settings (key, value)
values
  ('landing_title',         '{"text": "Pendataan KJP Plus"}'),
  ('landing_subtitle',      '{"text": "Isi formulir dan unggah dokumen secara online"}'),
  ('announcement_banner',   '{"text": ""}'),
  ('registration_status',   '{"value": "OPEN"}')
on conflict (key) do nothing;

-- ============================================================================
-- CARA MEMBUAT ADMIN PERTAMA
-- ----------------------------------------------------------------------------
-- Akun admin terikat ke auth.users (Supabase Auth). Buat lewat:
--   - Supabase Dashboard > Authentication > Add user, ATAU
--   - /admin/settings/admins (setelah login admin pertama via dashboard).
-- Setelah user auth terbuat, jalankan (ganti id & email):
--
--   insert into public.admins (id, name, email, role)
--   values ('<AUTH_USER_ID>', 'Admin Sekolah', 'admin@sekolah.sch.id', 'superadmin')
--   on conflict (id) do nothing;
-- ============================================================================
