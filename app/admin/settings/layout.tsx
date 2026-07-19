import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Pengaturan
      </Link>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
