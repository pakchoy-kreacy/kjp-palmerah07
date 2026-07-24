import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  signParentSession,
  setParentSessionCookie,
  PARENT_SESSION_COOKIE,
} from "@/lib/parent-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { nisn } = await request.json();
    if (!nisn || typeof nisn !== "string" || !/^\d{10}$/.test(nisn.trim())) {
      return NextResponse.json(
        { error: "NISN harus 10 digit angka." },
        { status: 400 }
      );
    }

    const cleanNisn = nisn.trim();
    const supabase = createAdminClient();

    // 1. Cari siswa berdasarkan NISN
    const { data: student, error: studentErr } = await supabase
      .from("students")
      .select("id, nisn, name")
      .eq("nisn", cleanNisn)
      .limit(1)
      .maybeSingle();

    if (studentErr || !student) {
      return NextResponse.json(
        { error: "NISN tidak ditemukan. Periksa kembali NISN Anda." },
        { status: 401 }
      );
    }

    // 2. Cek status pendataan
    const { data: regSetting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "registration_status")
      .maybeSingle();
    // 3. Periode aktif
    const { data: period, error: periodErr } = await supabase
      .from("periods")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (periodErr || !period) {
      return NextResponse.json(
        { error: "Tidak ada periode pendataan aktif." },
        { status: 500 }
      );
    }

    // 4. Cari atau buat application
    let applicationId: string;
    const { data: existing } = await supabase
      .from("applications")
      .select("id, status")
      .eq("student_id", student.id)
      .eq("period_id", period.id)
      .limit(1)
      .maybeSingle();

    const registrationClosed = regSetting?.value && (regSetting.value as any).value === "CLOSED";
    if (registrationClosed && (!existing || !["submitted", "verified"].includes(existing.status))) {
      return NextResponse.json({ error: "Pendataan telah ditutup." }, { status: 403 });
    }

    if (existing) {
      applicationId = existing.id;
    } else {
      const { data: created, error: createErr } = await supabase
        .from("applications")
        .insert({
          student_id: student.id,
          period_id: period.id,
          status: "not_started",
        })
        .select("id")
        .single();
      if (createErr || !created) {
        return NextResponse.json(
          { error: "Gagal membuat pengajuan." },
          { status: 500 }
        );
      }
      applicationId = created.id;

      // Log aktivitas pembuatan pengajuan
      await supabase.from("activity_logs").insert({
        application_id: applicationId,
        actor_type: "parent",
        actor_id: student.nisn,
        action: "draft_saved",
        description: "Sesi dibuka",
      });
    }

    // 5. Buat & set cookie sesi
    const token = await signParentSession({
      nisn: student.nisn,
      studentId: student.id,
      applicationId,
      periodId: period.id,
    });
    setParentSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("parent login error", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // logout
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(PARENT_SESSION_COOKIE);
  return res;
}
