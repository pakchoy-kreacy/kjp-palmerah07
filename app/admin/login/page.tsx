"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { GradientBackground } from "@/components/GradientBackground";
import { GlassCard } from "@/components/GlassCard";
import { Footer } from "@/components/Footer";

export default function AdminLoginPage() {
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
    <GradientBackground>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-3">
        <div className="animate-fade-in text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.png"
            alt={siteConfig.school.name}
            className="mx-auto h-16 w-16 rounded-full object-cover shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            onError={(e) => {
              (e.currentTarget).style.display = "none";
              const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (fb) fb.style.display = "flex";
            }}
          />
          <div className="mx-auto hidden h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white shadow-lg">
            KJP
          </div>

          <h1 className="mt-2.5 text-xl font-extrabold text-white tracking-tight">
            Login Admin
          </h1>
          <p className="mt-0.5 text-xs font-semibold text-white/65">
            Masuk ke panel admin sekolah
          </p>
        </div>

        <div className="mt-3 w-full max-w-xs">
          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="space-y-2">
                <div className="space-y-1">
                  <label htmlFor="admin-email" className="block text-xs font-bold text-gray-700 tracking-wide">Email</label>
                  <input id="admin-email" type="email" autoComplete="email" placeholder="admin@sekolah.sch.id"
                    value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }} required
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="admin-password" className="block text-xs font-bold text-gray-700 tracking-wide">Password</label>
                  <input id="admin-password" type="password" autoComplete="current-password" placeholder="Password"
                    value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }} required
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              {error && <p className="animate-fade-in text-xs font-bold text-red-600">{error}</p>}

              <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-500">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                /> Ingat Saya
              </label>

              <button type="submit" disabled={loading}
                className="group relative flex h-10 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-700 font-bold text-white shadow-md shadow-red-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-red-700 hover:to-red-800 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <span className="relative text-sm">{loading ? "Memproses..." : "Masuk"}</span>
              </button>
            </form>
          </GlassCard>
        </div>
      </main>
      <Footer />
    </GradientBackground>
  );
}
