import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getParentSession } from "@/lib/parent-session";
import JSZip from "jszip";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  if (!applicationId) {
    return NextResponse.json({ error: "applicationId wajib." }, { status: 400 });
  }

  // Izinkan parent hanya untuk application miliknya.
  const parentSession = await getParentSession();
  if (parentSession) {
    if (parentSession.applicationId !== applicationId) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }
  } else if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  }

  const supabase = createAdminClient();

  const { data: documents } = await supabase
    .from("document_uploads")
    .select("file_path, file_name, document_type_id")
    .eq("application_id", applicationId);

  if (!documents?.length) {
    return NextResponse.json({ error: "Tidak ada dokumen." }, { status: 404 });
  }

  // Get document type names
  const typeIds = [...new Set(documents.map((d) => d.document_type_id))];
  const { data: docTypes } = typeIds.length
    ? await supabase.from("document_types").select("id, name").in("id", typeIds)
    : { data: [] };
  const typeMap = new Map((docTypes ?? []).map((t: any) => [t.id, t.name]));

  const zip = new JSZip();

  for (const doc of documents) {
    if (!doc.file_path) continue;
    const { data: fileData } = await supabase.storage
      .from("kjp-documents")
      .download(doc.file_path);

    if (fileData) {
      const buf = Buffer.from(await fileData.arrayBuffer());
      const folderName = safeZipName(typeMap.get(doc.document_type_id) ?? "Lainnya");
      const fileName = safeZipName(doc.file_name || "dokumen");
      zip.file(`${folderName}/${fileName}`, buf);
    }
  }

  const zipBuf = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(zipBuf), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="dokumen-${applicationId}.zip"`,
    },
  });
}

function safeZipName(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\.\.+/g, "_")
    .replace(/^\.+/, "_")
    .slice(0, 120) || "dokumen";
}
