import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  FileText,
  ClipboardList,
  ShieldCheck,
  Palette,
} from "lucide-react";

const MENU = [
  { href: "/admin/settings/school", label: "Profil Sekolah", desc: "Logo, nama, alamat, kontak sekolah", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
  { href: "/admin/settings/identity", label: "Identitas Aplikasi", desc: "Nama aplikasi, favicon, warna, footer", icon: Palette, color: "text-purple-600", bg: "bg-purple-50" },
  { href: "/admin/settings/period", label: "Periode & Status", desc: "Tahun ajaran aktif dan buka/tutup pendaftaran", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
  { href: "/admin/settings/documents", label: "Jenis Dokumen", desc: "Daftar dokumen yang wajib diunggah", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
  { href: "/admin/settings/form-fields", label: "Pengaturan Form", desc: "Aktif/nonaktifkan, tambah/hapus field formulir", icon: ClipboardList, color: "text-cyan-600", bg: "bg-cyan-50" },
  { href: "/admin/settings/admins", label: "Manajemen Admin", desc: "Tambah/hapus admin sekolah", icon: ShieldCheck, color: "text-red-600", bg: "bg-red-50" },
];

export default function SettingsIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
        <p className="mt-0.5 text-sm text-gray-500">Konfigurasi aplikasi portal pendataan</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MENU.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bg} transition-colors`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-800 group-hover:text-red-700 transition-colors">{item.label}</h3>
              <p className="mt-0.5 text-xs text-gray-400">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
