import Link from "next/link";
import { GraduationCap, Calendar, FileText, ClipboardList, ShieldCheck } from "lucide-react";

const MENU = [
  { href: "/admin/settings/school", label: "Profil Sekolah", desc: "Logo, nama, alamat, kontak sekolah", icon: GraduationCap },
  { href: "/admin/settings/period", label: "Periode", desc: "Tahun ajaran aktif pendataan", icon: Calendar },
  { href: "/admin/settings/documents", label: "Jenis Dokumen", desc: "Daftar dokumen yang wajib diunggah", icon: FileText },
  { href: "/admin/settings/form-fields", label: "Pengaturan Form", desc: "Aktif/nonaktifkan field formulir", icon: ClipboardList },
  { href: "/admin/settings/admins", label: "Manajemen Admin", desc: "Tambah/hapus admin sekolah", icon: ShieldCheck },
];

export default function SettingsIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola pengaturan aplikasi portal pendataan KJP Plus</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MENU.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-red-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors group-hover:bg-red-100">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-800">{item.label}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
