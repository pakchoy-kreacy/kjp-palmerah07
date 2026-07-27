import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin, isAdminAccess } from "@/lib/auth/admin";
import Link from "next/link";
import { ShieldAlert, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

const DENY_MESSAGES: Record<string, { icon: any; title: string; body: string }> = {
  no_session: {
    icon: ShieldAlert,
    title: "Sesi Login Tidak Valid",
    body: "Cookie sesi login hilang atau kadaluarsa. Silakan login ulang.",
  },
  no_admin_row: {
    icon: ShieldAlert,
    title: "Akun Belum Terdaftar sebagai Admin",
    body: "User Supabase Auth ada, tapi belum ada row di tabel admins. Jalankan /api/admin/setup atau buat row manual di Supabase Dashboard (id = UUID user, role = superadmin).",
  },
  service_role_missing: {
    icon: AlertTriangle,
    title: "Konfigurasi Server Tidak Lengkap",
    body: "SUPABASE_SERVICE_ROLE_KEY tidak diset. Tambahkan env var ini di Vercel atau server deployment.",
  },
  unknown_error: {
    icon: AlertTriangle,
    title: "Terjadi Kesalahan Server",
    body: "Gagal memverifikasi akun admin. Periksa log server untuk detail.",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await requireAdmin();
  if (isAdminAccess(result)) return <AdminShell>{children}</AdminShell>;

  const msg = DENY_MESSAGES[result.denied] ?? DENY_MESSAGES.unknown_error;
  const Icon = msg.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <Icon className="mx-auto h-10 w-10 text-red-500" />
        <h1 className="mt-3 text-lg font-bold text-gray-900">{msg.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{msg.body}</p>
        <Link
          href="/admin/login"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700"
        >
          Login Ulang
        </Link>
      </div>
    </div>
  );
}
