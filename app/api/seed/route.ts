import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@sekolah.sch.id";
const ADMIN_PASSWORD = "admin123";

const dummyStudents = [
  { nisn: "1234567890", name: "Budi Santoso", class: "6A" },
  { nisn: "1234567891", name: "Siti Rahmawati", class: "6A" },
  { nisn: "1234567892", name: "Ahmad Fauzi", class: "5B" },
  { nisn: "1234567893", name: "Dewi Lestari", class: "5B" },
];

export async function GET() {
  try {
    const supabase = createAdminClient();
    const results: string[] = [];

    // ── 1. Create admin auth user ──────────────────────────────────
    const { data: existingAdmin } = await supabase
      .from("admins")
      .select("id")
      .eq("email", ADMIN_EMAIL)
      .maybeSingle();

    if (existingAdmin) {
      results.push("Admin sudah ada, skip.");
    } else {
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });

      if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 });

      const { error: adminErr } = await supabase.from("admins").insert({
        id: authUser.user.id,
        name: "Admin Sekolah",
        email: ADMIN_EMAIL,
        role: "superadmin",
      });

      if (adminErr) return NextResponse.json({ error: adminErr.message }, { status: 500 });
      results.push(`Admin berhasil dibuat: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    }

    // ── 2. Ensure active period exists ─────────────────────────
    const { data: period, error: periodErr } = await supabase
      .from("periods")
      .select("id, year")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!period) {
      const { data: newPeriod, error: newPeriodErr } = await supabase
        .from("periods")
        .insert({ year: "2025", label: "Tahun Ajaran 2025/2026", is_active: true })
        .select("id")
        .single();

      if (newPeriodErr) {
        results.push("Gagal membuat periode: " + newPeriodErr.message);
      } else {
        results.push("Periode 2025 berhasil dibuat.");
      }
    } else {
      results.push(`Periode aktif: ${period.year}`);
    }

    // Pastikan document types default
    const { data: existingDocs } = await supabase
      .from("document_types")
      .select("id")
      .limit(1);
    if (!existingDocs?.length) {
      const defaultDocs = [
        { name: "Kartu Keluarga (KK)", description: "Upload KK yang masih berlaku", is_required: true, is_active: true, sort_order: 1 },
        { name: "KTP Orang Tua", description: "Upload KTP Ayah atau Ibu", is_required: true, is_active: true, sort_order: 2 },
        { name: "Rapor Terakhir", description: "Upload rapor semester terakhir", is_required: true, is_active: true, sort_order: 3 },
        { name: "Foto Rumah", description: "Upload foto tampak depan rumah", is_required: true, is_active: true, sort_order: 4 },
        { name: "Surat Keterangan Tidak Mampu", description: "Dari kelurahan/desa (jika ada)", is_required: false, is_active: true, sort_order: 5 },
        { name: "KIP/KKS/PKH", description: "Kartu bantuan sosial (jika ada)", is_required: false, is_active: true, sort_order: 6 },
      ];
      await supabase.from("document_types").insert(defaultDocs);
      results.push("6 jenis dokumen default dibuat.");
    }

    // Re-fetch period after possible creation
    const { data: activePeriod } = await supabase
      .from("periods")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    // ── 3. Create dummy students with applications ─────────────────
    for (const s of dummyStudents) {
      const { data: existing } = await supabase
        .from("students")
        .select("id")
        .eq("nisn", s.nisn)
        .maybeSingle();

      if (existing) {
        results.push(`Siswa ${s.nisn} (${s.name}) sudah ada, skip.`);
        continue;
      }

      const { data: student, error: studentErr } = await supabase
        .from("students")
        .insert({ nisn: s.nisn, name: s.name, class: s.class })
        .select("id")
        .single();

      if (studentErr) {
        results.push(`Gagal buat siswa ${s.nisn}: ${studentErr.message}`);
        continue;
      }

      if (activePeriod) {
        await supabase.from("applications").insert({
          student_id: student.id,
          period_id: activePeriod.id,
          status: "not_started",
        });
      }

      results.push(`Siswa ${s.nisn} (${s.name}) berhasil dibuat.`);
    }

    return NextResponse.json({
      success: true,
      results,
      admin: existingAdmin ? null : { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
