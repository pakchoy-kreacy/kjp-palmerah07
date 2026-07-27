import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireAdmin();
  if (!access) {
    return NextResponse.json(
      { error: "Akun ini belum terdaftar sebagai admin sekolah." },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true, admin: access.admin });
}
