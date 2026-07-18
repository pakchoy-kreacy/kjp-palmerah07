import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "File wajib diupload." }, { status: 400 });
  }

  const buf = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: "",
  });

  const normalize = (h: string) => h.toLowerCase().replace(/[^a-z]/g, "");
  const findCol = (row: Record<string, any>, want: string) => {
    const key = Object.keys(row).find((k) => normalize(k) === want);
    return key ? row[key] : "";
  };

  const records = raw
    .map((r) => {
      const nisn = String(findCol(r, "nisn") ?? "").trim();
      const name = String(findCol(r, "nama") ?? "").trim();
      const cls = String(findCol(r, "kelas") ?? "").trim();
      return { nisn, name, class: cls };
    })
    .filter((r) => r.nisn && r.name && r.class);

  if (records.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada baris valid (butuh kolom NISN, Nama, Kelas)." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("students")
    .select("nisn")
    .in("nisn", records.map((r) => r.nisn));
  const existingSet = new Set((existing ?? []).map((e) => e.nisn));

  let added = 0;
  let updated = 0;
  for (const r of records) {
    if (existingSet.has(r.nisn)) updated++;
    else added++;
  }

  const { error } = await supabase
    .from("students")
    .upsert(records, { onConflict: "nisn" });

  if (error) {
    return NextResponse.json(
      { error: "Gagal import: " + error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, added, updated });
}
