import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak autentikasi" }, { status: 401 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
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
