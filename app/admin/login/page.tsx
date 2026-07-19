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

    if (!email.trim()) {
      setError("Masukkan email.");
      return;
    }
    if (!password) {
      setError("Masukkan password.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
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
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-8">
        <main className="flex w-full flex-1 flex-col items-center justify-center gap-6">
          <div className="animate-fade-in text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.png"
              alt={siteConfig.school.name}
              className="mx-auto h-20 w-20 rounded-full object-cover shadow-lg shadow-black/30"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div className="mx-auto hidden h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white shadow-lg">
              KJP
            </div>

            <h1 className="mt-4 text-2xl font-bold text-white">
              Login Admin
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Masuk ke panel admin sekolah
            </p>
          </div>

          <GlassCard>
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-sm space-y-5"
            >
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-email"
                    className="block text-sm font-bold text-white/90 tracking-wide"
                  >
                    Email
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@sekolah.sch.id"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    className="h-12 w-full rounded-xl border border-white/25 bg-white/15 px-4 text-[15px] font-semibold text-white placeholder-white/50 outline-none transition-all duration-200 focus:border-white/60 focus:bg-white/20 focus:ring-2 focus:ring-white/25"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-sm font-bold text-white/90 tracking-wide"
                  >
                    Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    className="h-12 w-full rounded-xl border border-white/25 bg-white/15 px-4 text-[15px] font-semibold text-white placeholder-white/50 outline-none transition-all duration-200 focus:border-white/60 focus:bg-white/20 focus:ring-2 focus:ring-white/25"
                  />
                </div>
              </div>

              {error && (
                <p className="animate-fade-in text-sm font-bold text-red-300">
                  {error}
                </p>
              )}

              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-white/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/30 bg-white/15 text-red-600 focus:ring-red-500"
                />
                Ingat Saya
              </label>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-white to-white font-bold text-red-700 shadow-lg shadow-black/25 transition-all duration-200 hover:from-white/90 hover:to-white/90 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative text-[15px]">
                  {loading ? "Memproses..." : "Masuk"}
                </span>
              </button>
            </form>
          </GlassCard>
        </main>
        <Footer />
      </div>
    </GradientBackground>
  );
}
