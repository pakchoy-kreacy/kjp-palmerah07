import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const access = await requireAdmin();
  if (!access) return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  const { user } = access;
  const supabase = createClient();

  const body = await request.json().catch(() => null);
  const notes = typeof body?.notes === "string" ? body.notes : "";
  if (!notes.trim() || notes.trim().length > 2000) {
    return NextResponse.json(
      { error: "Catatan revisi wajib diisi." },
      { status: 400 }
    );
  }

  const { data: application } = await supabase
    .from("applications")
    .select("status")
    .eq("id", params.id)
    .maybeSingle();
  if (!application) return NextResponse.json({ error: "Pengajuan tidak ditemukan." }, { status: 404 });
  if (application.status !== "submitted") {
    return NextResponse.json({ error: "Hanya pengajuan submitted yang dapat diminta revisi." }, { status: 409 });
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: "needs_revision", revision_notes: notes.trim() })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "Gagal menyimpan revisi." }, { status: 500 });
  }

  await supabase.from("activity_logs").insert({
    application_id: params.id,
    actor_type: "admin",
    actor_id: user.id,
    action: "revision_given",
    description: notes.trim(),
  });

  return NextResponse.json({ ok: true });
}
