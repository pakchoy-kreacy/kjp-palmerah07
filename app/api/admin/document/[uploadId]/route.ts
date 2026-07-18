import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { uploadId: string } }
) {
  const supabase = createAdminClient();
  const { data: upload } = await supabase
    .from("document_uploads")
    .select("file_path, file_name, mime_type")
    .eq("id", params.uploadId)
    .maybeSingle();

  if (!upload) {
    return NextResponse.json({ error: "Dokumen tidak ada" }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("kjp-documents")
    .createSignedUrl(upload.file_path, 60 * 60);

  if (error || !data) {
    return NextResponse.json(
      { error: "Gagal membuat URL: " + (error?.message ?? "") },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: data.signedUrl,
    fileName: upload.file_name,
    mimeType: upload.mime_type,
  });
}
