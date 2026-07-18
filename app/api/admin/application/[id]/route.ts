import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
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
    supabase.from("applications").select("*, student:students(*)").eq("id", params.id).single(),
    supabase.from("student_data").select("*").eq("application_id", params.id).maybeSingle(),
    supabase.from("guardian_data").select("*").eq("application_id", params.id).maybeSingle(),
    supabase.from("emergency_contacts").select("*").eq("application_id", params.id).maybeSingle(),
    supabase.from("document_uploads").select("*, document_type:document_types(*)").eq("application_id", params.id),
    supabase.from("activity_logs").select("*").eq("application_id", params.id).order("created_at", { ascending: false }),
    supabase.from("document_types").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
  ]);

  if (!application) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    application,
    student: application.student,
    studentData,
    guardianData,
    emergencyContact,
    documents: documents ?? [],
    documentTypes: documentTypes ?? [],
    activities: activities ?? [],
  });
}
