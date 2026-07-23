import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getParentSession } from "@/lib/parent-session";
import {
  studentDataDraftSchema,
  guardianDataDraftSchema,
  emergencyDataSchema,
} from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getParentSession();
  if (!session) {
    return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  }
  if (session.applicationId !== params.id) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const supabase = createAdminClient();

  const { data: app } = await supabase
    .from("applications")
    .select("status")
    .eq("id", params.id)
    .single();

  if (app && app.status === "verified") {
    return NextResponse.json(
      { error: "Pengajuan sudah terverifikasi." },
      { status: 400 }
    );
  }
  if (app && app.status === "submitted") {
    return NextResponse.json(
      { error: "Pengajuan sudah disubmit, menunggu verifikasi." },
      { status: 400 }
    );
  }

  const [{ data: sd }, { data: gd }, { data: ec }] = await Promise.all([
    supabase.from("student_data").select("*").eq("application_id", params.id).maybeSingle(),
    supabase.from("guardian_data").select("*").eq("application_id", params.id).maybeSingle(),
    supabase.from("emergency_contacts").select("*").eq("application_id", params.id).maybeSingle(),
  ]);

  if (!sd) {
    return NextResponse.json(
      { error: "Data siswa belum diisi." },
      { status: 400 }
    );
  }
  const sRes = studentDataDraftSchema.safeParse(sd);
  if (!sRes.success) {
    return NextResponse.json(
      { error: "Data siswa belum lengkap: " + sRes.error.issues[0].path.join(".") },
      { status: 400 }
    );
  }
  if (gd) {
    const gRes = guardianDataDraftSchema.safeParse(gd);
    if (!gRes.success) {
      return NextResponse.json(
        { error: "Data wali belum lengkap: " + gRes.error.issues[0].path.join(".") },
        { status: 400 }
      );
    }
  }
  if (ec) {
    const eRes = emergencyDataSchema.partial().safeParse(ec);
    if (!eRes.success) {
      return NextResponse.json(
        { error: "Data kontak darurat belum lengkap." },
        { status: 400 }
      );
    }
  }

  // Cek dokumen wajib
  const { data: reqTypes } = await supabase
    .from("document_types")
    .select("id, name")
    .eq("is_active", true)
    .eq("is_required", true);
  const { data: uploads } = await supabase
    .from("document_uploads")
    .select("document_type_id")
    .eq("application_id", params.id);

  const uploadedIds = new Set((uploads ?? []).map((u) => u.document_type_id));
  const missing = (reqTypes ?? []).filter((t) => !uploadedIds.has(t.id));
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error:
          "Dokumen wajib belum diupload: " +
          missing.map((m) => m.name).join(", "),
      },
      { status: 400 }
    );
  }

  const { error: updErr } = await supabase
    .from("applications")
    .update({ status: "submitted", submitted_at: new Date().toISOString(), revision_notes: null })
    .eq("id", params.id);

  if (updErr) {
    return NextResponse.json({ error: "Gagal submit." }, { status: 500 });
  }

  await supabase.from("activity_logs").insert({
    application_id: params.id,
    actor_type: "parent",
    actor_id: session.nisn,
    action: "submitted",
    description: "Pengajuan disubmit",
  });

  return NextResponse.json({ ok: true });
}
