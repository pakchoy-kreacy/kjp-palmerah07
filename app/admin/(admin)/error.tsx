"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
        <h1 className="mt-3 text-lg font-bold text-gray-900">Halaman admin tidak dapat dimuat</h1>
        <p className="mt-2 text-sm text-gray-600">
          Terjadi masalah saat mengambil data. Periksa koneksi dan konfigurasi Supabase, lalu coba lagi.
        </p>
        <Button onClick={reset} className="mt-5 gap-2">
          <RefreshCw className="h-4 w-4" /> Coba Lagi
        </Button>
      </div>
    </div>
  );
}
