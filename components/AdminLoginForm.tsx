"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function AdminLoginForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Masukkan email."); return; }
    if (!password) { setError("Masukkan password."); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(), password,
      });
      if (signInError) { setError(signInError.message); return; }
      toast.success("Login berhasil");
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2.5">
      <div className="space-y-2">
        <div className="space-y-1">
          <label htmlFor="admin-email" className="block text-xs font-bold text-white/80 tracking-wide">Email</label>
          <input id="admin-email" type="email" autoComplete="email" placeholder="admin@sekolah.sch.id"
            value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }} required
            className="h-10 w-full rounded-xl border border-white/25 bg-white/18 px-3.5 text-sm font-semibold text-white placeholder-white/60 outline-none transition-all duration-200 focus:border-white/60 focus:bg-white/25 focus:ring-2 focus:ring-white/25"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="admin-password" className="block text-xs font-bold text-white/80 tracking-wide">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password" placeholder="Password"
            value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }} required
            className="h-10 w-full rounded-xl border border-white/25 bg-white/18 px-3.5 text-sm font-semibold text-white placeholder-white/60 outline-none transition-all duration-200 focus:border-white/60 focus:bg-white/25 focus:ring-2 focus:ring-white/25"
          />
        </div>
      </div>

      {error && <p className="animate-fade-in text-xs font-bold text-red-300">{error}</p>}

      <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-white/65">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-white/30 bg-white/15 text-red-600 focus:ring-red-500"
        /> Ingat Saya
      </label>

      <button type="submit" disabled={loading}
        className="group relative flex h-10 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-white to-white font-bold text-red-700 shadow-md shadow-black/25 transition-all duration-200 hover:from-white/90 hover:to-white/90 hover:shadow-lg active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        <span className="relative text-sm">{loading ? "Memproses..." : "Masuk"}</span>
      </button>

      <button type="button" onClick={onBack}
        className="mx-auto block text-xs font-bold text-white/35 transition-colors hover:text-white/60">
        &larr; Kembali
      </button>
    </form>
  );
}
