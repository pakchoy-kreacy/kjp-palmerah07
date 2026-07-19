# Portal Pendataan KJP Plus

Aplikasi web untuk digitalisasi pendataan KJP Plus: orang tua mengisi formulir &
mengupload dokumen online; admin memverifikasi & mengekspor data.

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth + Storage)
- TanStack Table v8, TanStack Query v5
- React Hook Form + Zod
- SheetJS (xlsx)

## Setup

1. **Install dependency**
   ```bash
   npm install
   ```

2. **Environment variables** — salin `.env.example` ke `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # HANYA server, jangan prefix NEXT_PUBLIC_
   PARENT_SESSION_SECRET=...       # random string untuk sign cookie orang tua
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Jalankan migrasi Supabase** (lewat Supabase SQL Editor / CLI):
   - `supabase/migrations/0001_init.sql` — buat tabel, index, RLS, storage bucket
   - `supabase/seed/0002_seed.sql` — seed periode, document_types, form_field_settings

4. **Buat admin pertama** (lihat panduan di bawah `0002_seed.sql`):
   buat user via Supabase Auth, lalu insert ke tabel `admins`.

5. **Jalankan dev**
   ```bash
   npm run dev
   ```

## Struktur Penting
- `app/(parent)/*` — halaman orang tua (login NISN, form, status)
- `app/admin/*` — dashboard, tabel siswa, pengaturan
- `app/api/*` — API routes (orang tua via service role, admin via session)
- `lib/supabase/{client,server,admin}.ts` — 3 client: browser, server (auth),
  service role (rahasia, hanya server)
- `lib/parent-session.ts` — sesi orang tua via httpOnly cookie (JWT, `jose`)

## Catatan Keamanan
- `SUPABASE_SERVICE_ROLE_KEY` **tidak** boleh di-expose ke browser.
- Orang tua **tidak** punya akun Supabase Auth; sesi dikelola via cookie httpOnly.
- Semua mutasi orang tua melewati API route (service role), bukan langsung ke Supabase.
- Field form & jenis dokumen dibaca dari DB (`form_field_settings`, `document_types`).
- Setiap aksi dicatat ke `activity_logs`.
- Auto-save form orang tua ter-debounce 2 detik.
