"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export function LogoutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  async function handleBack() {
    await fetch("/api/auth/parent/logout", { method: "POST" });
    toast.success("Berhasil keluar");
    router.push(redirectTo);
    router.refresh();
  }
  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 transition-all duration-200 hover:bg-red-50"
    >
      <ArrowLeft className="h-4 w-4" />
      Kembali
    </button>
  );
}
