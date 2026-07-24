import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  }
  const supabase = createClient();

  const [
    { data: application },
    { data: studentData },
    { data: guardianData },
    { data: emergencyContact },
    { data: documents },
    { data: activities },
    { data: documentTypes },
  ] = await Promise.all([
    supabase.from("applications").select("*").eq("id", params.id).single(),
    supabase.from("student_data").select("*").eq("application_id", params.id).maybeSingle(),
    supabase.from("guardian_data").select("*").eq("application_id", params.id).maybeSingle(),
    supabase.from("emergency_contacts").select("*").eq("application_id", params.id).maybeSingle(),
    supabase.from("document_uploads").select("*").eq("application_id", params.id),
    supabase.from("activity_logs").select("*").eq("application_id", params.id).order("created_at", { ascending: false }),
    supabase.from("document_types").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
  ]);

  if (!application) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", application.student_id)
    .maybeSingle();

  const docTypeMap = new Map((documentTypes ?? []).map((d: any) => [d.id, d]));
  const docsWithType = (documents ?? []).map((d: any) => ({
    ...d,
    document_type: docTypeMap.get(d.document_type_id) ?? null,
  }));

  return NextResponse.json({
    application,
    student,
    studentData,
    guardianData,
    emergencyContact,
    documents: docsWithType,
    documentTypes: documentTypes ?? [],
    activities: activities ?? [],
  });
}
