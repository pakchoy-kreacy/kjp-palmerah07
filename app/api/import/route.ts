import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
  const findCol = (row: Record<string, any>, want: string) => {
    const key = Object.keys(row).find((k) => normalize(k) === want);
    return key ? row[key] : "";
  };

  const errors: { row: number; message: string }[] = [];
  const records: { nisn: string; name: string; class: string }[] = [];

  raw.forEach((r, i) => {
    const nisn = String(findCol(r, "nisn") ?? "").trim();
    const name = String(findCol(r, "nama") ?? "").trim();
    const cls = String(findCol(r, "kelas") ?? "").trim();
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

  let added = 0, updated = 0;
  for (const r of records) {
    if (existingSet.has(r.nisn)) updated++; else added++;
  }

  const { error } = await supabase
    .from("students")
    .upsert(records, { onConflict: "nisn" });

  if (error) {
    return NextResponse.json({ error: "Gagal import: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, added, updated });
}
