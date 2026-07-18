"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/settings/school", label: "Profil Sekolah" },
  { href: "/admin/settings/landing", label: "Landing Page" },
  { href: "/admin/settings/period", label: "Periode" },
  { href: "/admin/settings/documents", label: "Jenis Dokumen" },
  { href: "/admin/settings/form-fields", label: "Pengaturan Form" },
  { href: "/admin/settings/status", label: "Status Pendataan" },
  { href: "/admin/settings/import", label: "Import Data Siswa" },
  { href: "/admin/settings/admins", label: "Manajemen Admin" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-accent"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
