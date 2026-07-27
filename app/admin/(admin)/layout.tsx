import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-3 text-lg font-bold text-gray-900">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-gray-600">
            Anda tidak memiliki hak akses admin. Silakan login dengan akun admin yang benar.
          </p>
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
  return <AdminShell>{children}</AdminShell>;
}
