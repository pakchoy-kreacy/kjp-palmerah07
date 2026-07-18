import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak autentikasi" }, { status: 401 });
  }

  const { notes } = await request.json();
  if (!notes || !notes.trim()) {
    return NextResponse.json(
      { error: "Catatan revisi wajib diisi." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: "needs_revision", revision_notes: notes.trim() })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
