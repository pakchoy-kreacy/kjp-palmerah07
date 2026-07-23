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
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AdminLayoutContext } from "./AdminShell";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Data Siswa", icon: Users },
  { href: "/admin/referensi", label: "Data Referensi", icon: BookOpen },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [schoolName, setSchoolName] = React.useState("SDN Palmerah 07 Pagi");
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

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-red-700 to-red-950">
      {/* Logo + Name */}
      <div className={cn(
        "flex h-16 items-center border-b border-white/10 shrink-0",
        collapsed ? "justify-center px-2" : "gap-3 px-4"
      )}>
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/20" />
        ) : (
          <img src="/assets/logo.png" alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/20" />
        )}
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Portal Pendataan</p>
            <p className="truncate text-[10px] font-medium text-white/50">KJP Plus</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 space-y-1 py-3", collapsed ? "px-2" : "px-3")}>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href === "/admin/settings" && pathname.startsWith("/admin/settings"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl transition-all duration-200",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/55 hover:bg-white/8 hover:text-white/85",
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-white/45 group-hover:text-white/75")} />
              {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* School name + version */}
      {!collapsed && (
        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-[11px] font-medium text-white/35 truncate">{schoolName}</p>
          <p className="text-[10px] text-white/25">v1.0.0</p>
        </div>
      )}
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, collapsed, setCollapsed } =
    React.useContext(AdminLayoutContext);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent collapsed={collapsed} />
        {/* Collapse toggle */}
        <div className="absolute bottom-4 -right-3 z-20 hidden lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm text-gray-400 hover:text-gray-600 hover:shadow transition-all"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
    </>
  );
}
