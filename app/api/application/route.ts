import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getParentSession } from "@/lib/parent-session";
import { studentDataDraftSchema } from "@/lib/validations/student";
import { guardianDataDraftSchema } from "@/lib/validations/guardian";
import { emergencyDataDraftSchema } from "@/lib/validations/emergency";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Map field_key (dengan prefix) -> kolom DB, per section
function disabledColumns(
  settings: { field_key: string; section: string; is_enabled: boolean }[],
  section: "student" | "guardian" | "emergency"
): Set<string> {
  const prefix = section === "student" ? "student_" : "guardian_";
  const disabled = new Set<string>();
  for (const s of settings) {
    if (s.section === section && !s.is_enabled && s.field_key.startsWith(prefix)) {
      disabled.add(s.field_key.replace(prefix, ""));
    }
  }
  return disabled;
}

function stripDisabled(
  data: Record<string, unknown>,
  disabled: Set<string>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (disabled.has(k)) continue;
    out[k] = v;
  }
  return out;
}

export async function GET() {
  const session = await getParentSession();
  if (!session) {
    return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", session.applicationId)
    .single();

  let student = null;
  if (application) {
    const { data: s } = await supabase
      .from("students")
      .select("*")
      .eq("id", application.student_id)
      .maybeSingle();
    student = s;
  }

  const [{ data: studentData }, { data: guardianData }, { data: emergency }] =
    await Promise.all([
      supabase
        .from("student_data")
        .select("*")
        .eq("application_id", session.applicationId)
        .maybeSingle(),
      supabase
        .from("guardian_data")
        .select("*")
        .eq("application_id", session.applicationId)
        .maybeSingle(),
      supabase
        .from("emergency_contacts")
        .select("*")
        .eq("application_id", session.applicationId)
        .maybeSingle(),
    ]);

  const { data: formFields } = await supabase
    .from("form_field_settings")
    .select("*");

  const { data: documentTypes } = await supabase
    .from("document_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const { data: documents } = await supabase
    .from("document_uploads")
    .select("*")
    .eq("application_id", session.applicationId);

  const appWithStudent = application ? { ...application, student } : null;

  return NextResponse.json({
    application: appWithStudent,
    studentData,
    guardianData,
    emergencyContact: emergency,
    formFields: formFields ?? [],
    documentTypes: documentTypes ?? [],
    documents: documents ?? [],
  });
}

export async function PATCH(request: Request) {
  const session = await getParentSession();
  if (!session) {
    return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const payloadSchema = z.object({
    section: z.enum(["student", "guardian", "emergency"]),
    data: z.record(z.unknown()),
  });
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  const { section, data } = parsed.data;
  const supabase = createAdminClient();

  const { data: application } = await supabase
    .from("applications")
    .select("status")
    .eq("id", session.applicationId)
    .maybeSingle();
  if (!application) return NextResponse.json({ error: "Pengajuan tidak ditemukan." }, { status: 404 });
  if (application.status === "submitted" || application.status === "verified") {
    return NextResponse.json({ error: "Pengajuan sudah terkunci." }, { status: 409 });
  }

  // Ambil setting field untuk strip field yang dinonaktifkan
  const { data: formFields } = await supabase
    .from("form_field_settings")
    .select("field_key, section, is_enabled");
  const disabled = disabledColumns(formFields ?? [], section);
  const cleanData = stripDisabled(data, disabled);

  // Normalize null → undefined so Zod optional() doesn't reject
  const normalized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(cleanData)) {
    if (v === null || v === "") normalized[k] = undefined;
    else normalized[k] = v;
  }

  let validated: Record<string, unknown>;
  let table: string;
  if (section === "student") {
    const result = studentDataDraftSchema.safeParse(normalized);
    if (!result.success) return NextResponse.json({ error: "Data siswa tidak valid.", fields: result.error.flatten().fieldErrors }, { status: 400 });
    validated = result.data;
    table = "student_data";
  } else if (section === "guardian") {
    const result = guardianDataDraftSchema.safeParse(normalized);
    if (!result.success) return NextResponse.json({ error: "Data wali tidak valid.", fields: result.error.flatten().fieldErrors }, { status: 400 });
    validated = result.data;
    table = "guardian_data";
  } else {
    const result = emergencyDataDraftSchema.safeParse(normalized);
    if (!result.success) return NextResponse.json({ error: "Data kontak darurat tidak valid.", fields: result.error.flatten().fieldErrors }, { status: 400 });
    validated = result.data;
    table = "emergency_contacts";
  }

  const payload = { application_id: session.applicationId, ...validated };
  const { error: upsertErr } = await supabase
    .from(table)
    .upsert(payload, { onConflict: "application_id" });

  if (upsertErr) {
    return NextResponse.json(
      { error: "Gagal menyimpan: " + upsertErr.message },
      { status: 500 }
    );
  }

  // Update status ke draft jika masih not_started
  await supabase
    .from("applications")
    .update({ status: "draft" })
    .eq("id", session.applicationId)
    .eq("status", "not_started");

  // Log aktivitas
  await supabase.from("activity_logs").insert({
    application_id: session.applicationId,
    actor_type: "parent",
    actor_id: session.nisn,
    action: "draft_saved",
    description: `Draft bagian ${section} disimpan`,
  });

  return NextResponse.json({ ok: true });
}
