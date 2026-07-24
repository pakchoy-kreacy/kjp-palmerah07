import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const access = await requireAdmin();
  if (!access) return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  const { user } = access;
  const supabase = createClient();
  const { data: application } = await supabase
    .from("applications")
    .select("status")
    .eq("id", params.id)
    .maybeSingle();
  if (!application) return NextResponse.json({ error: "Pengajuan tidak ditemukan." }, { status: 404 });
  if (application.status !== "submitted") {
    return NextResponse.json({ error: "Hanya pengajuan submitted yang dapat diverifikasi." }, { status: 409 });
  }

  const { error } = await supabase
    .from("applications")
    .update({
      status: "verified",
      verified_at: new Date().toISOString(),
      verified_by: user.id,
      revision_notes: null,
    })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "Gagal memverifikasi pengajuan." }, { status: 500 });
  }

  await supabase.from("activity_logs").insert({
    application_id: params.id,
    actor_type: "admin",
    actor_id: user.id,
    action: "verified",
    description: "Diverifikasi oleh admin",
  });

  return NextResponse.json({ ok: true });
}
