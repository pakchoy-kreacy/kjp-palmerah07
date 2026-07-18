import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getParentSession } from "@/lib/parent-session";

export const dynamic = "force-dynamic";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(request: Request) {
  const session = await getParentSession();
  if (!session) {
    return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const documentTypeId = form.get("documentTypeId") as string | null;

  if (!file || !documentTypeId) {
    return NextResponse.json(
      { error: "File dan documentTypeId wajib." },
      { status: 400 }
    );
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Format file harus JPG, PNG, atau PDF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Ukuran file maksimal 5 MB." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Cek status aplikasi: tidak boleh upload jika sudah submitted/verified (kecuali needs_revision)
  const { data: app } = await supabase
    .from("applications")
    .select("status")
    .eq("id", session.applicationId)
    .single();
  if (app && (app.status === "submitted" || app.status === "verified")) {
    return NextResponse.json(
      { error: "Pengajuan sudah disubmit, tidak bisa upload." },
      { status: 400 }
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${session.periodId}/${session.studentId}/${documentTypeId}/${Date.now()}_${safeName}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from("kjp-documents")
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadErr) {
    return NextResponse.json(
      { error: "Gagal upload: " + uploadErr.message },
      { status: 500 }
    );
  }

  // Hapus record & file lama (jika ada) untuk document_type ini
  const { data: old } = await supabase
    .from("document_uploads")
    .select("id, file_path")
    .eq("application_id", session.applicationId)
    .eq("document_type_id", documentTypeId)
    .maybeSingle();

  if (old) {
    if (old.file_path) {
      await supabase.storage.from("kjp-documents").remove([old.file_path]);
    }
    await supabase
      .from("document_uploads")
      .delete()
      .eq("id", old.id);
  }

  const { error: insErr } = await supabase.from("document_uploads").upsert(
    {
      application_id: session.applicationId,
      document_type_id: documentTypeId,
      file_name: file.name,
      file_size: file.size,
      file_path: path,
      mime_type: file.type,
    },
    { onConflict: "application_id,document_type_id" }
  );

  if (insErr) {
    return NextResponse.json(
      { error: "Gagal menyimpan record: " + insErr.message },
      { status: 500 }
    );
  }

  await supabase.from("activity_logs").insert({
    application_id: session.applicationId,
    actor_type: "parent",
    actor_id: session.nisn,
    action: "document_uploaded",
    description: `Upload ${file.name}`,
  });

  return NextResponse.json({ ok: true, file_path: path });
}
