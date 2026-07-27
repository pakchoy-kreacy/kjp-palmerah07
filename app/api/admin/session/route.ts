import { NextResponse } from "next/server";
import { requireAdmin, isAdminAccess } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await requireAdmin();
  if (isAdminAccess(result)) {
    return NextResponse.json({ ok: true, admin: result.admin });
  }

  const messages: Record<string, string> = {
    no_session: "Sesi login tidak valid. Silakan login ulang.",
    no_admin_row: "Akun ini belum terdaftar di tabel admins. Buat row di tabel admins (id = UUID user Supabase Auth) atau jalankan /api/admin/setup.",
    service_role_missing: "SUPABASE_SERVICE_ROLE_KEY tidak diset. Tambahkan env var ini di Vercel/deployment.",
    unknown_error: `Terjadi kesalahan server. Detail: ${result.detail ?? "—"}`,
  };

  return NextResponse.json(
    { error: messages[result.denied] ?? messages.unknown_error, reason: result.denied },
    { status: 403 }
  );
}
