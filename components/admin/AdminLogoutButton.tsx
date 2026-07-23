"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  async function logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) { toast.error("Gagal keluar"); return; }
    toast.success("Berhasil keluar");
    window.location.href = "/admin/login";
  }
  return (
    <Button variant="ghost" size="sm" onClick={logout}>
      <LogOut className="h-4 w-4" /> Keluar
    </Button>
  );
}
