import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getParentSession } from "@/lib/parent-session";
import { studentDataDraftSchema } from "@/lib/validations/student";
import { guardianDataDraftSchema } from "@/lib/validations/guardian";
import { emergencyDataDraftSchema } from "@/lib/validations/emergency";

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
    .select("*, student:students(*)")
    .eq("id", session.applicationId)
    .single();

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

  return NextResponse.json({
    application,
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

  const body = await request.json();
  const { section, data } = body as {
    section: "student" | "guardian" | "emergency";
    data: Record<string, unknown>;
  };

  if (!section || !data) {
    return NextResponse.json({ error: "Payload tidak lengkap." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Ambil setting field untuk strip field yang dinonaktifkan
  const { data: formFields } = await supabase
    .from("form_field_settings")
    .select("field_key, section, is_enabled");
  const disabled = disabledColumns(formFields ?? [], section);
  const cleanData = stripDisabled(data, disabled);

  // Normalize null → undefined so Zod optional() doesn't reject
  const normalized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(cleanData)) {
    normalized[k] = v === null ? undefined : v;
  }

  let validated: Record<string, unknown>;
  let table: string;
  if (section === "student") {
    validated = studentDataDraftSchema.parse(normalized);
    table = "student_data";
  } else if (section === "guardian") {
    validated = guardianDataDraftSchema.parse(normalized);
    table = "guardian_data";
  } else {
    validated = emergencyDataDraftSchema.parse(normalized);
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
