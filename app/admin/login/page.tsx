"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { GradientBackground } from "@/components/GradientBackground";
import { SafeImage } from "@/components/shared/SafeImage";
import { GlassCard } from "@/components/GlassCard";
import { Footer } from "@/components/Footer";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [denyReason, setDenyReason] = React.useState<string | null>(null);
  const [setupLoading, setSetupLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (res.ok) window.location.href = "/admin/dashboard";
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDenyReason(null);
    if (!email.trim()) { setError("Masukkan email."); return; }
    if (!password) { setError("Masukkan password."); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(), password,
      });
      if (signInError) { setError(signInError.message); return; }

      const adminCheck = await fetch("/api/admin/session", { cache: "no-store" });
      if (!adminCheck.ok) {
        await supabase.auth.signOut();
        const json = await adminCheck.json().catch(() => null);
        const reason = json?.reason;
        let msg = json?.error ?? "Akun ini tidak terdaftar sebagai admin sekolah.";
        if (reason === "no_admin_row") {
          msg = "User Supabase Auth ada, tapi belum terdaftar di tabel admins. Klik tombol Setup di bawah.";
        } else if (reason === "service_role_missing") {
          msg = "SUPABASE_SERVICE_ROLE_KEY belum diset. Tambahkan env var di Vercel.";
        }
        setError(msg);
        setDenyReason(reason);
        return;
      }

      toast.success("Login berhasil");
      window.location.href = "/admin/dashboard";
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
          <SafeImage
            src="/assets/logo.png"
            alt={siteConfig.school.name}
            className="mx-auto h-16 w-16 rounded-full object-cover shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            fallback={
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white shadow-lg">
                KJP
              </div>
            }
          />

          <h1 className="mt-2 text-xl font-extrabold text-white tracking-tight">
            Login Admin
          </h1>
          <p className="text-xs font-semibold text-white/65">
            {siteConfig.app.name}
          </p>
          <p className="text-[10px] font-medium text-white/40">
            {siteConfig.school.name}
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

              {denyReason === "no_admin_row" && (
                <button
                  type="button"
                  disabled={setupLoading}
                  onClick={async () => {
                    setSetupLoading(true);
                    try {
                      const supabase = createClient();
                      const { error: signInError } = await supabase.auth.signInWithPassword({
                        email: email.trim(), password,
                      });
                      if (signInError) { setError(signInError.message); return; }

                      const res = await fetch("/api/admin/setup", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: "Admin Sekolah" }),
                      });
                      const json = await res.json();
                      if (!res.ok) { setError(json.error); await supabase.auth.signOut(); return; }
                      toast.success("Admin berhasil di-setup!");
                      window.location.href = "/admin/dashboard";
                    } catch { setError("Gagal setup admin."); }
                    finally { setSetupLoading(false); }
                  }}
                  className="flex h-10 w-full items-center justify-center rounded-xl bg-amber-500 font-bold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-60"
                >
                  {setupLoading ? "Menyetup..." : "Setup Admin (Buat Row admins)"}
                </button>
              )}
            </form>
          </GlassCard>
        </div>
      </main>
      <Footer />
    </GradientBackground>
  );
}
