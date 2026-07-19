"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { LogOut, User, Calendar as CalendarIcon } from "lucide-react";

export function AdminNavbar() {
  const router = useRouter();
  const [adminName, setAdminName] = React.useState("Admin");
  const [schoolName, setSchoolName] = React.useState("KJP Plus");
  const [logoUrl, setLogoUrl] = React.useState("");
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
    })();
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Berhasil keluar");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-gray-200" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
            K
          </div>
        )}
        <span className="hidden text-sm font-bold text-gray-800 sm:block">{schoolName}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1.5 text-xs text-gray-400 md:flex">
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>{today}</span>
        </div>

        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden text-sm font-semibold text-gray-700 md:block">{adminName}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
