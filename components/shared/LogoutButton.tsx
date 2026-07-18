"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/parent/logout", { method: "POST" });
    toast.success("Berhasil keluar");
    router.push("/");
    router.refresh();
  }
  return (
    <Button variant="ghost" size="sm" onClick={logout}>
      Keluar
    </Button>
  );
}
