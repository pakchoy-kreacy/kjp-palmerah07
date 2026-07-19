"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  Settings,
  GraduationCap,
  Calendar,
  FileText,
  ClipboardList,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Data Siswa", icon: Users },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

const SETTINGS_SUB: NavItem[] = [
  { href: "/admin/settings/school", label: "Profil Sekolah", icon: GraduationCap },
  { href: "/admin/settings/period", label: "Periode", icon: Calendar },
  { href: "/admin/settings/documents", label: "Jenis Dokumen", icon: FileText },
  { href: "/admin/settings/form-fields", label: "Pengaturan Form", icon: ClipboardList },
  { href: "/admin/settings/admins", label: "Manajemen Admin", icon: ShieldCheck },
];

function SidebarItem({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
        active
          ? "bg-white/15 text-white shadow-sm"
          : "text-white/60 hover:bg-white/8 hover:text-white/85",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-white/50 group-hover:text-white/80")} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [schoolName, setSchoolName] = React.useState("KJP Plus");
  const [logoUrl, setLogoUrl] = React.useState("");

  React.useEffect(() => {
    const supabase = createClient();
    supabase.from("schools").select("name, logo_url").limit(1).maybeSingle().then(({ data }) => {
      if (data) {
        if (data.name) setSchoolName(data.name);
        if (data.logo_url) setLogoUrl(data.logo_url);
      }
    });
  }, []);

  const inSettings = pathname.startsWith("/admin/settings") && pathname !== "/admin/settings";

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-white/10 bg-gradient-to-b from-red-700 to-red-900 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-white/10 px-3", collapsed ? "justify-center" : "gap-3")}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
            K
          </div>
        )}
        {!collapsed && <span className="truncate text-sm font-bold text-white">{schoolName}</span>}
      </div>

      <nav className={cn("flex-1 space-y-1 p-2", collapsed && "px-1")}>
        {NAV.map((item) => (
          <SidebarItem key={item.href} item={item} active={pathname === item.href || (item.href === "/admin/settings" && inSettings)} collapsed={collapsed} />
        ))}

        {inSettings && !collapsed && (
          <div className="ml-2 mt-3 border-t border-white/10 pt-3">
            <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-white/35">Pengaturan</p>
            <div className="space-y-0.5">
              {SETTINGS_SUB.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-white/15 text-white"
                      : "text-white/50 hover:bg-white/8 hover:text-white/80"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-white/10 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg py-2 text-white/40 transition-colors hover:bg-white/8 hover:text-white/70"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
