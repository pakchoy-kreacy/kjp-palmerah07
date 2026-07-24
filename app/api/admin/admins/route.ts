import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

const adminInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(["admin", "superadmin"]),
});

export async function POST(request: Request) {
  const access = await requireAdmin();
  if (!access) return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  if (access.admin.role !== "superadmin") {
    return NextResponse.json({ error: "Hanya superadmin yang dapat mengelola admin." }, { status: 403 });
  }

  const parsed = adminInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Data admin tidak valid." }, { status: 400 });

  const supabase = createAdminClient();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Gagal membuat akun admin." }, { status: 400 });
  }

  const { error: rowError } = await supabase.from("admins").insert({
    id: authData.user.id,
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
  });
  if (rowError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: "Gagal menyimpan data admin." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const access = await requireAdmin();
  if (!access) return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  if (access.admin.role !== "superadmin") {
    return NextResponse.json({ error: "Hanya superadmin yang dapat mengelola admin." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "ID admin wajib diisi." }, { status: 400 });
  if (id === access.user.id) return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri." }, { status: 400 });

  const supabase = createAdminClient();
  const { count } = await supabase.from("admins").select("id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) return NextResponse.json({ error: "Admin terakhir tidak dapat dihapus." }, { status: 400 });

  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: "Gagal menghapus akun admin." }, { status: 500 });
  await supabase.from("admins").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
