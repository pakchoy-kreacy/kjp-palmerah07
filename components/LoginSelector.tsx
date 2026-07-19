"use client";

import { UserRound, Shield } from "lucide-react";

interface LoginSelectorProps {
  onSelectParent: () => void;
  onSelectAdmin: () => void;
}

export function LoginSelector({
  onSelectParent,
  onSelectAdmin,
}: LoginSelectorProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={onSelectParent}
        className="group flex w-full items-center gap-4 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-white px-4 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md active:translate-y-0"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
          <UserRound className="h-5 w-5 text-red-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">Orang Tua / Wali</p>
          <p className="text-xs font-medium text-gray-500">Isi data dan unggah dokumen KJP</p>
        </div>
      </button>

      <button
        onClick={onSelectAdmin}
        className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md active:translate-y-0"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <Shield className="h-5 w-5 text-gray-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">Admin Sekolah</p>
          <p className="text-xs font-medium text-gray-500">Kelola pendataan siswa</p>
        </div>
      </button>
    </div>
  );
}
