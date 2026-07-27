import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama admin harus diisi (min 2 karakter)." },
        { status: 400 }
      );
    }

    const authClient = createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Anda harus login via Supabase Auth terlebih dahulu." },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    const { data: existing } = await adminClient
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: "Row admins sudah ada untuk user ini.",
        admin: { id: existing.id },
      });
    }

    const { data: inserted, error: insertErr } = await adminClient
      .from("admins")
      .insert({
        id: user.id,
        name: name.trim(),
        email: user.email!,
        role: "superadmin",
      })
      .select("id, name, email, role")
      .single();

    if (insertErr) {
      return NextResponse.json(
        { error: `Gagal membuat row admins: ${insertErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, admin: inserted });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
