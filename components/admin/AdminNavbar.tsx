"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { LogOut, Menu, CalendarDays, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLayoutContext } from "./AdminShell";

export function AdminNavbar() {
  const { setSidebarOpen } = React.useContext(AdminLayoutContext);
  const [adminName, setAdminName] = React.useState("Admin");
  const [schoolName, setSchoolName] = React.useState("SDN Palmerah 07 Pagi");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [periodLabel, setPeriodLabel] = React.useState("—");

  const today = React.useMemo(
    () =>
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  React.useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: admin } = await supabase
          .from("admins")
          .select("name")
          .eq("id", userData.user.id)
          .maybeSingle();
        if (admin?.name) setAdminName(admin.name);
      }
      const { data: school } = await supabase
        .from("schools")
        .select("name, logo_url")
        .limit(1)
        .maybeSingle();
      if (school) {
        if (school.name) setSchoolName(school.name);
        if (school.logo_url) setLogoUrl(school.logo_url);
      }
      const { data: period } = await supabase
        .from("periods")
        .select("year")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (period) setPeriodLabel(period.year);
    })();
  }, []);

  async function logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) { toast.error("Gagal keluar"); return; }
    toast.success("Berhasil keluar");
    window.location.href = "/admin/login";
  }

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b bg-white shadow-sm">
      {/* Top row: mobile menu + branding */}
      <div className="flex h-14 items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5 text-gray-500" />
        </Button>

        <img
          src={logoUrl || "/assets/logo.png"}
          alt=""
          className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-gray-200 md:hidden"
        />

        <div className="min-w-0 flex-1 md:flex-none">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-bold text-gray-800">
              Portal Pendataan KJP Plus
            </h1>
            <span className="hidden h-4 w-px bg-gray-200 md:block" />
            <span className="hidden truncate text-xs font-medium text-gray-400 md:block">
              {schoolName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Period */}
          <div className="hidden items-center gap-1.5 text-xs font-medium text-gray-500 lg:flex">
            <GraduationCap className="h-3.5 w-3.5 text-red-500" />
            <span>Periode: <strong className="text-gray-700">{periodLabel}</strong></span>
          </div>

          {/* Date */}
          <div className="hidden items-center gap-1.5 text-xs text-gray-400 md:flex">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{today}</span>
          </div>

          {/* Admin */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-[11px] font-bold text-red-700 ring-1 ring-red-200">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-sm font-semibold text-gray-700 sm:block">{adminName}</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
