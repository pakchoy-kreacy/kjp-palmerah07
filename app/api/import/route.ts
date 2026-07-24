import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  }
  const form = await request.formData();
  const file = form.get("file") as File | null;
  const isPreview = form.get("preview") === "true";

  if (!file) {
    return NextResponse.json({ error: "File wajib diupload." }, { status: 400 });
  }

  const buf = await file.arrayBuffer();
  let wb;
  try {
    wb = XLSX.read(new Uint8Array(buf), { type: "array" });
  } catch {
    return NextResponse.json({ error: "File tidak dapat dibaca. Pastikan format XLSX/XLS/CSV." }, { status: 400 });
  }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

  if (raw.length === 0) {
    return NextResponse.json({ error: "File kosong atau tidak memiliki data." }, { status: 400 });
  }

  const normalize = (h: string) => h.toLowerCase().replace(/[^a-z]/g, "");

  const SYNONYMS: Record<string, string[]> = {
    nisn: ["nisn", "n i s n", "nik"],
    nama: ["nama", "namalengkap", "namasiswa", "fullname", "name", "namapesertadidik"],
    kelas: ["kelas", "rombel", "klas", "class", "tingkat"],
  };

  const findCol = (row: Record<string, any>, want: string) => {
    const norm = normalize(want);
    const synonyms = SYNONYMS[norm] ?? [norm];
    const key = Object.keys(row).find((k) => synonyms.includes(normalize(k)));
    if (key) {
      const val = row[key];
      return val !== null && val !== undefined ? String(val).trim() : "";
    }
    return "";
  };

  const errors: { row: number; message: string }[] = [];
  const records: { nisn: string; name: string; class: string }[] = [];

  raw.forEach((r, i) => {
    const nisn = findCol(r, "nisn");
    const name = findCol(r, "nama");
    const cls = findCol(r, "kelas");
    const rowNum = i + 2;

    if (!nisn) { errors.push({ row: rowNum, message: "NISN kosong" }); return; }
    if (!/^\d{10}$/.test(nisn)) { errors.push({ row: rowNum, message: `NISN "${nisn}" harus 10 digit angka` }); return; }
    if (!name) { errors.push({ row: rowNum, message: "Nama kosong" }); return; }
    if (!cls) { errors.push({ row: rowNum, message: "Kelas kosong" }); return; }

    records.push({ nisn, name, class: cls });
  });

  if (isPreview) {
    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("students")
      .select("nisn")
      .in("nisn", records.map((r) => r.nisn));

    const existingSet = new Set((existing ?? []).map((e) => e.nisn));
    let added = 0, updated = 0;
    for (const r of records) {
      if (existingSet.has(r.nisn)) updated++; else added++;
    }

    return NextResponse.json({
      total: records.length + errors.length,
      valid: records.length,
      errors,
      preview: { added, updated },
    });
  }

  if (records.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada data valid untuk diimport. Periksa kembali file Anda." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("students")
    .select("nisn")
    .in("nisn", records.map((r) => r.nisn));
  const existingSet = new Set((existing ?? []).map((e) => e.nisn));

  // Dedup: keep only first record per NISN
  const seen = new Set<string>();
  const deduped = records.filter((r) => {
    if (seen.has(r.nisn)) return false;
    seen.add(r.nisn);
    return true;
  });

  let added = 0, updated = 0;
  for (const r of deduped) {
    if (existingSet.has(r.nisn)) updated++; else added++;
  }

  const { error: upsertError } = await supabase
    .from("students")
    .upsert(deduped, { onConflict: "nisn" });

  if (upsertError) {
    return NextResponse.json({ error: "Gagal import: " + upsertError.message }, { status: 500 });
  }

  // Dapatkan atau buat active period
  let { data: activePeriod } = (await supabase
    .from("periods")
    .select("id")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle()) as { data: { id: string } | null };

  if (!activePeriod) {
    const now = new Date();
    const year = String(now.getFullYear());
    const { data: newPeriod, error: periodError } = await supabase
      .from("periods")
      .insert({ year, label: `Tahun ${year}`, is_active: true })
      .select("id")
      .single();
    if (periodError || !newPeriod) {
      return NextResponse.json({ error: "Gagal membuat periode aktif: " + (periodError?.message ?? "unknown") }, { status: 500 });
    }
    activePeriod = newPeriod as { id: string };
  }

  if (activePeriod) {
    // Cari student IDs dari NISN
    const { data: upsertedStudents } = await supabase
      .from("students")
      .select("id, nisn")
      .in("nisn", records.map((r) => r.nisn));

    const studentIds = (upsertedStudents ?? []).map((s) => s.id);

    // Cek aplikasi yang sudah ada untuk periode ini
    const { data: existingApps } = await supabase
      .from("applications")
      .select("student_id")
      .in("student_id", studentIds)
      .eq("period_id", activePeriod.id);

    const existingStudentIds = new Set((existingApps ?? []).map((a) => a.student_id));
    const newStudentIds = studentIds.filter((id) => !existingStudentIds.has(id));

    // Buat aplikasi untuk siswa baru
    let appsCreated = 0;
    if (newStudentIds.length > 0) {
      const { error: appError } = await supabase
        .from("applications")
        .insert(newStudentIds.map((student_id) => ({ student_id, period_id: activePeriod.id })));

      if (appError) {
        return NextResponse.json({ error: "Gagal membuat aplikasi: " + appError.message }, { status: 500 });
      }
      appsCreated = newStudentIds.length;
    }

    return NextResponse.json({ ok: true, added, updated, appsCreated, students: added + updated, appsTotal: studentIds.length });
  }

  return NextResponse.json({ ok: true, added, updated, periodCreated: false });
}
