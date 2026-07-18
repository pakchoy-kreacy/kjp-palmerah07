import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActivePeriod } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

const SKIP = new Set([
  "id",
  "application_id",
  "created_at",
  "updated_at",
  "student_id",
  "period_id",
  "verified_by",
]);

export async function GET() {
  const period = await getActivePeriod();
  if (!period) {
    return NextResponse.json(
      { error: "Tidak ada periode aktif" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: apps } = await supabase
    .from("applications")
    .select("id, status, student:students(nisn, name, class)")
    .eq("period_id", period.id);

  const appIds = (apps ?? []).map((a: any) => a.id);

  let sds: any[] = [];
  let gds: any[] = [];
  let ecs: any[] = [];
  if (appIds.length) {
    const [r1, r2, r3] = await Promise.all([
      supabase.from("student_data").select("*").in("application_id", appIds),
      supabase.from("guardian_data").select("*").in("application_id", appIds),
      supabase
        .from("emergency_contacts")
        .select("*")
        .in("application_id", appIds),
    ]);
    sds = r1.data ?? [];
    gds = r2.data ?? [];
    ecs = r3.data ?? [];
  }

  const sdMap = new Map((sds ?? []).map((r: any) => [r.application_id, r]));
  const gdMap = new Map((gds ?? []).map((r: any) => [r.application_id, r]));
  const ecMap = new Map((ecs ?? []).map((r: any) => [r.application_id, r]));

  const rows = (apps ?? []).map((a: any) => {
    const base: Record<string, any> = {
      NISN: a.student?.nisn,
      Nama: a.student?.name,
      Kelas: a.student?.class,
      Status: a.status,
    };
    const sd = sdMap.get(a.id) ?? {};
    const gd = gdMap.get(a.id) ?? {};
    const ec = ecMap.get(a.id) ?? {};
    for (const [k, v] of Object.entries(sd))
      if (!SKIP.has(k)) base[`Siswa_${k}`] = v;
    for (const [k, v] of Object.entries(gd))
      if (!SKIP.has(k)) base[`Wali_${k}`] = v;
    for (const [k, v] of Object.entries(ec))
      if (!SKIP.has(k)) base[`Darurat_${k}`] = v;
    return base;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Siswa");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="data-siswa-kjp-${period.year}.xlsx"`,
    },
  });
}
